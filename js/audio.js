/**
 * Audio Playback Module
 * Plays sound files to accompany SPL simulation for training scenarios
 * Now with real-time waveform analysis for event detection
 */

(() => {
    'use strict';

    // Audio context and elements
    let audioContext = null;
    let currentAudio = null;
    let gainNode = null;
    let sourceNode = null;
    let analyserNode = null;
    let isPlaying = false;
    
    // Audio analysis state
    let audioAnalysisState = {
        enabled: false,
        baseLevel: 47,        // Base SPL level (ambient)
        minSPL: 30,           // Minimum SPL (dB)
        maxSPL: 130,          // Maximum SPL (dB)
        referenceLevel: 0.00002, // Reference pressure (20 µPa) in normalized audio units
        smoothing: 0.8,       // Smoothing time constant (0-1)
        peakThreshold: 0.3,   // Threshold for detecting impulses (0-1)
        lastPeakTime: 0,
        peakCooldown: 50,     // Minimum ms between peak detections
        dataArray: null,
        bufferLength: 0,
        lastSPL: null,
        analysisLoop: null
    };

    // Sound presets with corresponding simulator settings
    // gain: volume boost multiplier (1.0 = normal, 2.0 = 2x louder, etc.)
    // file: filename only (e.g., 'fan.wav') - will be resolved to Base64 data URI or file path
    const SOUND_PRESETS = {
        // Steady sounds
        fan: {
            name: 'Fan/HVAC',
            file: 'fan.wav',
            baseLevel: 65,
            variation: 2,
            gain: 1.0,
            description: 'Steady fan or HVAC hum'
        },
        engine: {
            name: 'Engine Idle',
            file: 'engine.wav',
            baseLevel: 75,
            variation: 3,
            gain: 3.0,  // Boosted - quiet source file
            description: 'Steady engine/motor sound'
        },
        // Intermittent/burst sounds
        hammering: {
            name: 'Hammering',
            file: 'hammering.wav',
            baseLevel: 85,
            variation: 15,
            gain: 1.0,
            description: 'Intermittent hammering/impacts',
            impulsePattern: {
                interval: 650,    // Hammer hits every ~650ms (1.5 hits/second)
                spike: 12,        // +12 dB spike on each hit
                duration: 150     // Spike decays over 150ms
            }
        },
        clapping: {
            name: 'Clapping',
            file: 'clapping.wav',
            baseLevel: 80,
            variation: 12,
            gain: 1.0,
            description: 'Intermittent claps/bursts',
            impulsePattern: {
                interval: 500,    // Claps every ~500ms (2 claps/second)
                spike: 10,        // +10 dB spike on each clap
                duration: 120     // Spike decays over 120ms
            }
        },
        // Industrial sounds
        machinery: {
            name: 'Industrial Machinery',
            file: 'machinery.wav',
            baseLevel: 90,
            variation: 8,
            gain: 1.0,
            description: 'Loud industrial equipment'
        },
        // Quiet environments
        office: {
            name: 'Office Ambient',
            file: 'office.wav',
            baseLevel: 50,
            variation: 3,
            gain: 4.0,  // Boosted - very quiet source file
            description: 'Quiet office background'
        },
        // Calibration tone
        calibration: {
            name: 'Calibration Tone (1kHz)',
            file: 'Calibration_1khz.wav',
            baseLevel: 114,
            variation: 0.5,
            gain: 1.0,
            description: '1000 Hz calibration tone at 114 dB'
        }
    };

    /**
     * Resolve audio file path to data URI or file path
     * Checks for Base64 data in AUDIO_DATA first (CORS-safe), falls back to file path
     * @param {string} filename - Audio filename (e.g., 'fan.wav')
     * @returns {string} Data URI or file path
     */
    function resolveAudioFile(filename) {
        // Check for Base64 data from build script (CORS-safe for iframes)
        if (window.AUDIO_DATA && window.AUDIO_DATA[filename]) {
            return window.AUDIO_DATA[filename];
        }
        // Fallback to file path (for development or when build script not run)
        return `assets/audio/${filename}`;
    }

    /**
     * Initialize audio module
     */
    function init() {
        // Create audio context on user interaction (browser requirement)
        document.addEventListener('click', initAudioContext, { once: true });
        document.addEventListener('keydown', initAudioContext, { once: true });
        console.log('[AUDIO] Module initialized - waiting for user interaction');
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    function initAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('[AUDIO] AudioContext created');
            } catch (e) {
                console.warn('[AUDIO] AudioContext not available:', e);
            }
        }
    }

    /**
     * Convert audio amplitude to SPL (dB)
     * @param {number} amplitude - Normalized amplitude (0-1)
     * @param {number} baseLevel - Base SPL level for calibration
     * @returns {number} SPL in dB
     */
    function amplitudeToSPL(amplitude, baseLevel = 47) {
        if (amplitude <= 0) return audioAnalysisState.minSPL;
        
        // Convert normalized amplitude to dB
        // Using log scale: dB = 20 * log10(amplitude / reference)
        // Scale to realistic SPL range (30-130 dB)
        const db = 20 * Math.log10(amplitude / audioAnalysisState.referenceLevel);
        
        // Map to realistic SPL range and add base level offset
        // Scale factor adjusts the sensitivity
        const spl = baseLevel + (db * 0.5);
        
        // Clamp to realistic range
        return Math.max(audioAnalysisState.minSPL, Math.min(audioAnalysisState.maxSPL, spl));
    }

    /**
     * Calculate RMS (Root Mean Square) from audio data
     * @param {Float32Array} dataArray - Audio data array
     * @returns {number} RMS value (0-1)
     */
    function calculateRMS(dataArray) {
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sumSquares += dataArray[i] * dataArray[i];
        }
        return Math.sqrt(sumSquares / dataArray.length);
    }

    /**
     * Detect impulse events (hammer hits, claps, etc.)
     * @param {Float32Array} dataArray - Audio data array
     * @param {number} threshold - Peak detection threshold
     * @returns {Object} { detected: boolean, amplitude: number, peakIndex: number }
     */
    function detectImpulse(dataArray, threshold = audioAnalysisState.peakThreshold) {
        let maxAmplitude = 0;
        let peakIndex = -1;
        
        // Find peak amplitude in the buffer
        for (let i = 0; i < dataArray.length; i++) {
            const absValue = Math.abs(dataArray[i]);
            if (absValue > maxAmplitude) {
                maxAmplitude = absValue;
                peakIndex = i;
            }
        }
        
        // Check if peak exceeds threshold and cooldown period has passed
        const now = Date.now();
        const timeSinceLastPeak = now - audioAnalysisState.lastPeakTime;
        const detected = maxAmplitude > threshold && timeSinceLastPeak > audioAnalysisState.peakCooldown;
        
        if (detected) {
            audioAnalysisState.lastPeakTime = now;
        }
        
        return {
            detected,
            amplitude: maxAmplitude,
            peakIndex
        };
    }

    /**
     * Real-time audio analysis loop
     * Analyzes audio and feeds SPL readings to Measurement module
     */
    function startAudioAnalysis() {
        if (!analyserNode || !audioAnalysisState.enabled) return;
        
        stopAudioAnalysis(); // Stop any existing loop
        
        audioAnalysisState.bufferLength = analyserNode.frequencyBinCount;
        audioAnalysisState.dataArray = new Float32Array(audioAnalysisState.bufferLength);
        
        function analyze() {
            if (!isPlaying || !audioAnalysisState.enabled || !analyserNode) {
                stopAudioAnalysis();
                return;
            }
            
            // Get time-domain data (waveform)
            analyserNode.getFloatTimeDomainData(audioAnalysisState.dataArray);
            
            // Calculate RMS (Root Mean Square) for steady-state level
            const rms = calculateRMS(audioAnalysisState.dataArray);
            
            // Detect impulses (for hammer hits, claps, etc.)
            const impulse = detectImpulse(audioAnalysisState.dataArray);
            
            // Convert to SPL
            let spl;
            let analysisType = 'steady';
            if (impulse.detected) {
                // Impulse detected - use peak amplitude with boost
                spl = amplitudeToSPL(impulse.amplitude, audioAnalysisState.baseLevel + 15);
                analysisType = 'impulse';
                if (window.AudioPlayer && window.AudioPlayer._debugAnalysis) {
                    console.log(`[AUDIO-ANALYSIS] 🔨 Impulse detected: ${spl.toFixed(1)} dB (amplitude: ${impulse.amplitude.toFixed(3)}, RMS: ${rms.toFixed(3)})`);
                }
            } else {
                // Steady-state - use RMS
                spl = amplitudeToSPL(rms, audioAnalysisState.baseLevel);
                if (window.AudioPlayer && window.AudioPlayer._debugAnalysis && Math.random() < 0.01) {
                    // Log occasionally to avoid spam (1% of frames)
                    console.log(`[AUDIO-ANALYSIS] 📊 Steady-state: ${spl.toFixed(1)} dB (RMS: ${rms.toFixed(3)})`);
                }
            }
            
            // Apply smoothing
            const smoothing = audioAnalysisState.smoothing;
            if (!audioAnalysisState.lastSPL) {
                audioAnalysisState.lastSPL = spl;
            } else {
                audioAnalysisState.lastSPL = (spl * (1 - smoothing)) + (audioAnalysisState.lastSPL * smoothing);
            }
            
            // Feed to Measurement module if running
            if (window.Measurement && window.Measurement._state && window.Measurement._state.running) {
                window.Measurement.processSample(audioAnalysisState.lastSPL);
                
                // Update status with analysis info
                if (window.AudioPlayer && window.AudioPlayer._showAnalysisStatus) {
                    const statusEl = document.getElementById('audio-status');
                    if (statusEl) {
                        const typeIcon = analysisType === 'impulse' ? '🔨' : '📊';
                        statusEl.textContent = `▶ ${typeIcon} ${audioAnalysisState.lastSPL.toFixed(1)} dB`;
                    }
                }
            }
            
            // Continue analysis loop
            audioAnalysisState.analysisLoop = requestAnimationFrame(analyze);
        }
        
        analyze();
    }

    /**
     * Stop audio analysis loop
     */
    function stopAudioAnalysis() {
        if (audioAnalysisState.analysisLoop) {
            cancelAnimationFrame(audioAnalysisState.analysisLoop);
            audioAnalysisState.analysisLoop = null;
        }
        audioAnalysisState.lastSPL = null;
    }

    /**
     * Enable/disable audio analysis mode
     * @param {boolean} enabled - Enable audio analysis
     * @param {Object} options - Analysis options
     */
    function setAudioAnalysisMode(enabled, options = {}) {
        audioAnalysisState.enabled = enabled;
        if (options.baseLevel !== undefined) audioAnalysisState.baseLevel = options.baseLevel;
        if (options.peakThreshold !== undefined) audioAnalysisState.peakThreshold = options.peakThreshold;
        if (options.smoothing !== undefined) audioAnalysisState.smoothing = options.smoothing;
        
        if (enabled && isPlaying) {
            startAudioAnalysis();
        } else {
            stopAudioAnalysis();
        }
        
        console.log(`[AUDIO] Audio analysis ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Play a sound preset with optional audio analysis
     * @param {string} presetName - Name of preset from SOUND_PRESETS
     * @param {boolean} loop - Whether to loop the audio (default: true)
     * @param {boolean} useAnalysis - Use real-time audio analysis (default: true)
     */
    function playPreset(presetName, loop = true, useAnalysis = true) {
        const preset = SOUND_PRESETS[presetName];
        if (!preset) {
            console.error(`[AUDIO] Unknown preset: ${presetName}`);
            console.log('[AUDIO] Available presets:', Object.keys(SOUND_PRESETS).join(', '));
            return;
        }

        // Stop any currently playing audio
        stop();

        // Initialize audio context
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resolve audio file to Base64 data URI or file path
        const audioSource = resolveAudioFile(preset.file);
        
        // Create and play audio element
        currentAudio = new Audio(audioSource);
        currentAudio.loop = loop;
        
        // Route through Web Audio API
        sourceNode = audioContext.createMediaElementSource(currentAudio);
        gainNode = audioContext.createGain();
        gainNode.gain.value = preset.gain || 1.0;
        
        // Create analyser node for audio analysis
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048; // Higher resolution for better peak detection
        analyserNode.smoothingTimeConstant = 0.3; // Less smoothing for better impulse detection
        
        // Connect: source -> gain -> analyser -> destination
        sourceNode.connect(gainNode);
        gainNode.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
        
        // Set up audio analysis
        if (useAnalysis) {
            audioAnalysisState.baseLevel = preset.baseLevel;
            setAudioAnalysisMode(true, {
                baseLevel: preset.baseLevel,
                peakThreshold: preset.impulsePattern ? 0.25 : 0.4, // Lower threshold for impulse sounds
                smoothing: preset.impulsePattern ? 0.6 : 0.8 // Less smoothing for impulse sounds
            });
        } else {
            // Fallback to preset-based simulator mode
            if (window.Simulator) {
                window.Simulator.setBaseLevel(preset.baseLevel);
                window.Simulator.setVariation(preset.variation);
                if (preset.impulsePattern) {
                    window.Simulator.setImpulsePattern(preset.impulsePattern);
                } else {
                    window.Simulator.clearImpulsePattern();
                }
            }
        }
        
        const audioElement = currentAudio;
        currentAudio.addEventListener('canplaythrough', () => {
            if (!currentAudio || currentAudio !== audioElement) return;
            currentAudio.play()
                .then(() => {
                    if (!currentAudio || currentAudio !== audioElement) return;
                    isPlaying = true;
                    const mode = useAnalysis ? '🎤 Analyzing' : `${preset.baseLevel} dB`;
                    console.log(`[AUDIO] Playing: ${preset.name} (${useAnalysis ? 'analysis mode' : 'preset mode'})`);
                    if (useAnalysis) {
                        console.log(`[AUDIO] ✅ Waveform analysis enabled - device will respond to actual audio events`);
                        console.log(`[AUDIO] 💡 Enable debug: window.AudioPlayer._debugAnalysis = true`);
                    }
                    updateStatus(`▶ ${preset.name} (${mode})`);
                    
                    // Start audio analysis if enabled
                    if (useAnalysis && audioAnalysisState.enabled) {
                        startAudioAnalysis();
                    }
                })
                .catch(e => {
                    if (!currentAudio || currentAudio !== audioElement) return;
                    console.warn(`[AUDIO] Playback failed: ${e.message}`);
                    updateStatus(`⚠ Playback failed`);
                });
        });

        currentAudio.addEventListener('error', (e) => {
            console.warn(`[AUDIO] Error loading ${preset.file}:`, e);
            if (window.AUDIO_DATA && window.AUDIO_DATA[preset.file]) {
                console.log('[AUDIO] Base64 data available but playback failed - check audio format');
            } else {
                console.log('[AUDIO] Simulator settings applied, but audio file not found');
                console.log('[AUDIO] Run "node build-audio.js" to generate Base64 audio data, or add audio files to assets/audio/ directory');
            }
            // Still update simulator even if audio fails
            updateStatus(`⚠ No audio - Sim: ${preset.baseLevel} dB ±${preset.variation}`);
        });

        currentAudio.load();
    }

    /**
     * Play a custom audio file
     * @param {string} url - URL or path to audio file
     * @param {Object} options - Simulator options
     */
    function playCustom(url, options = {}) {
        stop();

        const baseLevel = options.baseLevel || 47; // Default to ambient if not specified
        const variation = options.variation || 5;

        // Update simulator
        if (window.Simulator) {
            window.Simulator.setBaseLevel(baseLevel);
            window.Simulator.setVariation(variation);
        }

        currentAudio = new Audio(url);
        currentAudio.loop = options.loop !== false;
        
        currentAudio.play()
            .then(() => {
                isPlaying = true;
                console.log(`[AUDIO] Playing custom: ${url}`);
            })
            .catch(e => console.warn(`[AUDIO] Playback failed: ${e.message}`));
    }

    /**
     * Update status display
     */
    function updateStatus(message) {
        const statusEl = document.getElementById('audio-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    /**
     * Stop current audio playback
     */
    function stop() {
        stopAudioAnalysis();
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        isPlaying = false;
        
        // Clean up audio nodes
        if (sourceNode) {
            try {
                sourceNode.disconnect();
            } catch (e) {}
            sourceNode = null;
        }
        if (gainNode) {
            try {
                gainNode.disconnect();
            } catch (e) {}
            gainNode = null;
        }
        if (analyserNode) {
            try {
                analyserNode.disconnect();
            } catch (e) {}
            analyserNode = null;
        }
        
        // Reset simulator to ambient levels when audio stops
        if (window.Simulator) {
            window.Simulator.setBaseLevel(47); // Ambient sound level (45-50 dB)
            window.Simulator.setVariation(3);  // Low variation for ambient
            window.Simulator.clearImpulsePattern(); // Clear any impulse patterns
            console.log('[AUDIO] Stopped - Simulator reset to ambient (47 dB ±3)');
        }
        
        console.log('[AUDIO] Stopped');
        updateStatus('⏹ Stopped');
    }

    /**
     * Pause current audio
     */
    function pause() {
        if (currentAudio && isPlaying) {
            currentAudio.pause();
            isPlaying = false;
            stopAudioAnalysis(); // Stop analysis when paused
            console.log('[AUDIO] Paused');
        }
    }

    /**
     * Resume paused audio
     */
    function resume() {
        if (currentAudio && !isPlaying) {
            currentAudio.play()
                .then(() => {
                    isPlaying = true;
                    // Restart analysis if it was enabled
                    if (audioAnalysisState.enabled && analyserNode) {
                        startAudioAnalysis();
                    }
                    console.log('[AUDIO] Resumed');
                })
                .catch(e => console.warn(`[AUDIO] Resume failed: ${e.message}`));
        }
    }

    /**
     * Set volume
     * @param {number} volume - Volume level 0-1
     */
    function setVolume(volume) {
        if (currentAudio) {
            currentAudio.volume = Math.max(0, Math.min(1, volume));
            console.log(`[AUDIO] Volume set to ${currentAudio.volume}`);
        }
    }

    /**
     * Get available presets
     * @returns {Object} Sound presets
     */
    function getPresets() {
        return { ...SOUND_PRESETS };
    }

    /**
     * Get current state
     */
    function getState() {
        return {
            isPlaying,
            currentPreset: currentAudio ? currentAudio.src : null,
            volume: currentAudio ? currentAudio.volume : 1,
            analysisEnabled: audioAnalysisState.enabled
        };
    }

    /**
     * List available presets in console
     */
    function listPresets() {
        console.log('\n=== Available Audio Presets ===');
        Object.entries(SOUND_PRESETS).forEach(([key, preset]) => {
            console.log(`\n${key}:`);
            console.log(`  Name: ${preset.name}`);
            console.log(`  Description: ${preset.description}`);
            console.log(`  Base Level: ${preset.baseLevel} dB`);
            console.log(`  Variation: ±${preset.variation} dB`);
        });
        console.log('\nUsage: window.AudioPlayer.playPreset("fan")');
        console.log('       window.AudioPlayer.stop()');
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export to window
    window.AudioPlayer = {
        playPreset,
        playCustom,
        stop,
        pause,
        resume,
        setVolume,
        getPresets,
        getState,
        listPresets,
        setAudioAnalysisMode,
        _audioAnalysisState: audioAnalysisState, // Expose for FSM to check
        _debugAnalysis: false, // Set to true for console logging
        _showAnalysisStatus: true, // Show analysis status in audio panel
        // Helper function to check if analysis is working
        checkAnalysisStatus() {
            const state = getState();
            const analysis = audioAnalysisState;
            console.log('\n=== Audio Analysis Status ===');
            console.log(`Playing: ${state.isPlaying}`);
            console.log(`Analysis Enabled: ${analysis.enabled}`);
            console.log(`Analysis Loop Active: ${analysis.analysisLoop !== null}`);
            console.log(`Base Level: ${analysis.baseLevel} dB`);
            console.log(`Last SPL: ${analysis.lastSPL ? analysis.lastSPL.toFixed(1) + ' dB' : 'N/A'}`);
            console.log(`Peak Threshold: ${analysis.peakThreshold}`);
            console.log(`Measurement Running: ${window.Measurement?._state?.running || false}`);
            console.log('============================\n');
            return {
                isActive: state.isPlaying && analysis.enabled && analysis.analysisLoop !== null,
                lastSPL: analysis.lastSPL,
                measurementRunning: window.Measurement?._state?.running || false
            };
        },
        PRESETS: SOUND_PRESETS
    };

})();

