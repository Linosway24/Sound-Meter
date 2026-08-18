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
    let currentPresetName = null; // Track current preset name
    let mediaSyncCleanup = null;
    let lastNarrationUrl = null;
    /** Walkthrough voiceover only — not wired to SPL analysis; separate from preset `currentAudio`. */
    let narrationAudio = null;

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
            baseLevel: 70,
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
            gain: 0.55,
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
        
        // Convert normalized amplitude (0-1) to SPL
        // Calibrated so that typical audio amplitudes map to the baseLevel
        // For normalized audio, we use a calibrated reference that maps amplitude to SPL
        // Typical audio RMS values are 0.05-0.3, we want these to map to baseLevel ± variation
        
        // Use a calibrated reference level that works with normalized audio amplitudes
        // This reference is much larger than acoustic reference (20 µPa) because audio is normalized
        const calibratedReference = 0.01; // Calibrated for normalized audio (0-1 range)
        
        // Convert amplitude to dB relative to calibrated reference
        const db = 20 * Math.log10(amplitude / calibratedReference);
        
        // Map to SPL: baseLevel is the target for typical amplitude (~0.1)
        // Scale factor of 0.15 provides reasonable sensitivity without over-amplifying
        const spl = baseLevel + (db * 0.15);
        
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

            // Fan/HVAC: keep SLM readout in a realistic 50–60 dB band (training scenario)
            if (currentPresetName === 'fan') {
                if (impulse.detected) {
                    spl = Math.max(50, Math.min(60, spl));
                } else {
                    const rmsLo = 0.02;
                    const rmsHi = 0.26;
                    const u = Math.max(0, Math.min(1, (rms - rmsLo) / (rmsHi - rmsLo)));
                    spl = 50 + u * 10;
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
    function playPreset(presetName, loop = true, useAnalysis = true, skipVideo = false) {
        const preset = SOUND_PRESETS[presetName];
        if (!preset) {
            console.error(`[AUDIO] Unknown preset: ${presetName}`);
            console.log('[AUDIO] Available presets:', Object.keys(SOUND_PRESETS).join(', '));
            return;
        }

        // Stop any currently playing audio (this will also hide any video)
        stop();

        // Track current preset name
        currentPresetName = presetName;

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
        const hasVideo = !skipVideo && Boolean(VIDEO_PATHS[presetName]);
        if (hasVideo && presetName === 'hammering') {
            const hammerVideo = document.querySelector('.sound-video-item[data-preset="hammering"] video');
            if (hammerVideo) hammerVideo.muted = true;
        }

        // Invoke both play() calls while the learner's click is still active.
        // Waiting for canplaythrough can lose browser autoplay permission.
        const videoPlayback = hasVideo ? showSoundVideo(presetName) : Promise.resolve();
        const audioPlayback = audioElement.play();
        const toleratedVideoPlayback = Promise.resolve(videoPlayback).catch((e) => {
            console.warn(`[AUDIO] Continuing without synchronized ${presetName} video:`, e);
        });

        Promise.all([toleratedVideoPlayback, audioPlayback])
            .then(() => {
                if (!currentAudio || currentAudio !== audioElement) return;
                isPlaying = true;
                const mode = useAnalysis ? '🎤 Analyzing' : `${preset.baseLevel} dB`;
                console.log(`[AUDIO] Playing: ${preset.name} (${useAnalysis ? 'analysis mode' : 'preset mode'})`);
                if (useAnalysis) {
                    console.log(`[AUDIO] Waveform analysis enabled`);
                }
                updateStatus(`▶ ${preset.name} (${mode})`);

                if (hasVideo) {
                    const video = document.querySelector(`.sound-video-item[data-preset="${presetName}"] video`);
                    synchronizeVideoWithAudio(audioElement, video);
                }

                if (typeof window.scheduleWalkthroughPanelPosition === 'function') {
                    window.scheduleWalkthroughPanelPosition();
                }

                if (useAnalysis && audioAnalysisState.enabled) {
                    startAudioAnalysis();
                }
            })
            .catch(e => {
                if (!currentAudio || currentAudio !== audioElement) return;
                console.warn(`[AUDIO] Playback failed: ${e.message}`);
                updateStatus(`⚠ Playback failed`);
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

    }

    /**
     * Play a custom audio file
     * @param {string} url - URL or path to audio file
     * @param {Object} options - Simulator options
     */
    function stopNarration() {
        if (narrationAudio) {
            try {
                narrationAudio.pause();
                narrationAudio.currentTime = 0;
            } catch (e) {}
            narrationAudio = null;
        }
    }

    function updateNarrationReplayButton() {
        const replayButton = document.getElementById('walkthrough-replay');
        if (replayButton) replayButton.disabled = !lastNarrationUrl;
    }

    function dispatchNarrationEvent(type, url) {
        window.dispatchEvent(new CustomEvent(type, { detail: { url } }));
    }

    /**
     * Play a one-shot narration clip (walkthrough). Does not affect SPL presets/analysis.
     * @param {string} url - Path or URL to audio file
     */
    function playNarration(url, options = {}) {
        stopNarration();
        lastNarrationUrl = url;
        updateNarrationReplayButton();
        const el = new Audio(url);
        narrationAudio = el;
        let finished = false;
        dispatchNarrationEvent('walkthrough-narration-start', url);
        el.addEventListener('ended', () => {
            if (finished) return;
            finished = true;
            if (narrationAudio === el) narrationAudio = null;
            dispatchNarrationEvent('walkthrough-narration-end', url);
            if (typeof options.onEnded === 'function') options.onEnded();
        });
        const signalUnavailable = () => {
            if (finished) return;
            finished = true;
            if (narrationAudio === el) narrationAudio = null;
            dispatchNarrationEvent('walkthrough-narration-unavailable', url);
            if (typeof options.onUnavailable === 'function') options.onUnavailable();
        };
        el.addEventListener('error', signalUnavailable, { once: true });
        el.play().catch((e) => {
            console.warn(`[AUDIO] Narration failed: ${e.message}`);
            signalUnavailable();
        });
    }

    function replayNarration() {
        if (!lastNarrationUrl) return;
        playNarration(lastNarrationUrl);
    }

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
     * Video paths for different presets
     */
    const VIDEO_PATHS = {
        fan: 'assets/Video/fan.mp4',
        engine: 'assets/Video/Porsche01_1.mp4',
        machinery: 'assets/Video/FactoryLoop.mp4',
        office: 'assets/Video/officeSpace02.mp4',
        clapping: 'assets/Video/AudienceStock.mp4',
        hammering: 'assets/Video/HammerTimed.mp4'
    };

    // Video panel state
    let videoPanelInitialized = false;
    let videoPanelResizeBound = false;
    let currentPlayingVideo = null;

    function clearMediaSync() {
        if (typeof mediaSyncCleanup === 'function') mediaSyncCleanup();
        mediaSyncCleanup = null;
    }

    function synchronizeVideoWithAudio(audio, video) {
        clearMediaSync();
        if (!audio || !video) return;

        const sync = () => {
            if (!video.duration || !Number.isFinite(video.duration)) return;
            const target = audio.currentTime % video.duration;
            const drift = Math.abs(video.currentTime - target);
            const wrappedDrift = Math.min(drift, Math.abs(video.duration - drift));
            if (wrappedDrift > 0.3) video.currentTime = target;
            if (!audio.paused && video.paused) {
                video.play().catch((e) => console.warn('[AUDIO] Video resync failed:', e));
            }
        };

        audio.addEventListener('timeupdate', sync);
        audio.addEventListener('seeked', sync);
        mediaSyncCleanup = () => {
            audio.removeEventListener('timeupdate', sync);
            audio.removeEventListener('seeked', sync);
        };
        sync();
    }

    /** Presets that get a tile in the sound-video side panel (walkthrough: hammer + fan only). */
    const VIDEO_PANEL_PRESETS = ['hammering', 'fan'];

    function setActiveSoundVideoPreset(presetName) {
        const panelEl = document.getElementById('sound-video-panel');
        if (!panelEl) return;
        if (presetName && VIDEO_PANEL_PRESETS.includes(presetName)) {
            panelEl.dataset.soundVideoPreset = presetName;
        } else {
            delete panelEl.dataset.soundVideoPreset;
        }
    }

    /**
     * Initialize video panel for walkthrough demos (not the full preset list).
     * Safe to call repeatedly — only appends tiles for presets not yet in the grid.
     */
    function initVideoPanel() {
        const grid = document.getElementById('sound-video-grid');
        if (!grid) return;

        VIDEO_PANEL_PRESETS.forEach((presetName) => {
            if (document.querySelector(`.sound-video-item[data-preset="${presetName}"]`)) {
                return;
            }
            const videoPath = VIDEO_PATHS[presetName];
            if (!videoPath) return;
            const item = document.createElement('div');
            item.className = 'sound-video-item';
            item.dataset.preset = presetName;

            const video = document.createElement('video');
            video.src = videoPath;
            video.loop = true;
            video.preload = 'auto';
            // Walkthrough presets use the separate analyzed audio file. Keep the
            // visual tile muted until playVideo explicitly chooses video audio.
            video.muted = true;
            video.playsInline = true;
            video.dataset.preset = presetName;
            video.addEventListener('ended', () => {
                if (currentPlayingVideo !== presetName) return;
                video.currentTime = 0;
                video.play().catch((e) => console.warn(`[AUDIO] Video restart failed for ${presetName}:`, e));
            });

            const stopBtn = document.createElement('button');
            stopBtn.className = 'sound-video-item-stop';
            stopBtn.innerHTML = '⏹';
            stopBtn.title = 'Stop';
            stopBtn.onclick = (e) => {
                e.stopPropagation();
                stopVideo(presetName);
            };

            item.appendChild(video);
            item.appendChild(stopBtn);
            grid.appendChild(item);

            // Handle video click to play
            item.onclick = () => playVideo(presetName);
        });

        videoPanelInitialized = true;

        if (!videoPanelResizeBound) {
            videoPanelResizeBound = true;
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    // Videos will automatically adjust with CSS
                }, 100);
            });
        }
    }

    /**
     * Play a specific video and its corresponding audio simultaneously
     * @param {string} presetName - Name of preset to play video for
     */
    function playVideo(presetName) {
        // Stop currently playing video and audio
        if (currentPlayingVideo && currentPlayingVideo !== presetName) {
            stopVideo(currentPlayingVideo, true);
        }
        
        // Stop any currently playing audio
        if (isPlaying) {
            stop();
        }

        initVideoPanel();

        const item = document.querySelector(`.sound-video-item[data-preset="${presetName}"]`);
        const video = item?.querySelector('video');
        if (!video) return;
        if (skipAudio) video.muted = true;

        const panelEl = document.getElementById('sound-video-panel');
        if (panelEl) {
            panelEl.style.display = 'flex';
        }
        setActiveSoundVideoPreset(presetName);

        // Mark as current playing video
        item.classList.add('playing');
        currentPlayingVideo = presetName;

        // Play the corresponding audio preset if it exists
        if (SOUND_PRESETS[presetName]) {
            const preset = SOUND_PRESETS[presetName];
            currentPresetName = presetName;

            // Initialize audio context
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Special handling for hammer: use video's audio track
            if (presetName === 'hammering') {
                // Unmute video to use its audio
                video.muted = false;
                
                // Route video's audio through Web Audio API
                sourceNode = audioContext.createMediaElementSource(video);
                gainNode = audioContext.createGain();
                gainNode.gain.value = preset.gain || 1.0;
                
                // Create analyser node
                analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 2048;
                analyserNode.smoothingTimeConstant = 0.3;
                
                // Connect audio nodes
                sourceNode.connect(gainNode);
                gainNode.connect(analyserNode);
                analyserNode.connect(audioContext.destination);
                
                // Set up audio analysis
                audioAnalysisState.baseLevel = preset.baseLevel;
                setAudioAnalysisMode(true, {
                    baseLevel: preset.baseLevel,
                    peakThreshold: preset.impulsePattern ? 0.25 : 0.4,
                    smoothing: preset.impulsePattern ? 0.6 : 0.8
                });

                // Wait for video to be ready, then play
                const videoReady = new Promise((resolve) => {
                    if (video.readyState >= 3) { // HAVE_FUTURE_DATA
                        resolve();
                    } else {
                        video.addEventListener('canplay', () => resolve(), { once: true });
                    }
                });

                videoReady.then(() => {
                    if (currentPlayingVideo !== presetName) return;

                    video.play()
                        .then(() => {
                            if (currentPlayingVideo !== presetName) return;
                            isPlaying = true;
                            currentAudio = video; // Store video as currentAudio for consistency
                            const mode = '🎤 Analyzing';
                            console.log(`[AUDIO] Playing: ${preset.name} (analysis mode, using video audio)`);
                            updateStatus(`▶ ${preset.name} (${mode})`);
                            
                            // Start audio analysis
                            if (audioAnalysisState.enabled) {
                                startAudioAnalysis();
                            }
                        })
                        .catch(e => {
                            console.warn(`[AUDIO] Playback failed for ${presetName}:`, e);
                            updateStatus(`⚠ Playback failed`);
                        });
                }).catch(e => {
                    console.warn(`[AUDIO] Failed to load video for ${presetName}:`, e);
                });
            } else {
                // For other presets, use separate audio file
                // Resolve audio file
                const audioSource = resolveAudioFile(preset.file);
                
                // Create audio element
                currentAudio = new Audio(audioSource);
                currentAudio.loop = true;
                
                // Route through Web Audio API
                sourceNode = audioContext.createMediaElementSource(currentAudio);
                gainNode = audioContext.createGain();
                gainNode.gain.value = preset.gain || 1.0;
                
                // Create analyser node
                analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 2048;
                analyserNode.smoothingTimeConstant = 0.3;
                
                // Connect audio nodes
                sourceNode.connect(gainNode);
                gainNode.connect(analyserNode);
                analyserNode.connect(audioContext.destination);
                
                // Set up audio analysis
                audioAnalysisState.baseLevel = preset.baseLevel;
                setAudioAnalysisMode(true, {
                    baseLevel: preset.baseLevel,
                    peakThreshold: preset.impulsePattern ? 0.25 : 0.4,
                    smoothing: preset.impulsePattern ? 0.6 : 0.8
                });

                // Wait for both video and audio to be ready, then play simultaneously
                const videoReady = new Promise((resolve) => {
                    if (video.readyState >= 3) { // HAVE_FUTURE_DATA
                        resolve();
                    } else {
                        video.addEventListener('canplay', () => resolve(), { once: true });
                    }
                });

                const audioReady = new Promise((resolve) => {
                    if (currentAudio.readyState >= 3) { // HAVE_FUTURE_DATA
                        resolve();
                    } else {
                        currentAudio.addEventListener('canplaythrough', () => resolve(), { once: true });
                    }
                });

                // When both are ready, play them simultaneously
                Promise.all([videoReady, audioReady]).then(() => {
                    // Ensure we're still playing the same preset
                    if (currentPlayingVideo !== presetName || !currentAudio) return;

                    // Play both at the same time
                    const videoPlay = video.play();
                    const audioPlay = currentAudio.play();

                    Promise.all([videoPlay, audioPlay])
                        .then(() => {
                            if (!currentAudio || currentPlayingVideo !== presetName) return;
                            isPlaying = true;
                            const mode = '🎤 Analyzing';
                            console.log(`[AUDIO] Playing: ${preset.name} (analysis mode)`);
                            updateStatus(`▶ ${preset.name} (${mode})`);
                            
                            // Start audio analysis
                            if (audioAnalysisState.enabled) {
                                startAudioAnalysis();
                            }
                        })
                        .catch(e => {
                            console.warn(`[AUDIO] Playback failed for ${presetName}:`, e);
                            updateStatus(`⚠ Playback failed`);
                        });
                }).catch(e => {
                    console.warn(`[AUDIO] Failed to load media for ${presetName}:`, e);
                });
            }
        } else {
            // No audio preset, just play video
            video.play().catch(e => console.warn(`[AUDIO] Video play failed for ${presetName}:`, e));
        }
    }

    /**
     * Stop a specific video
     * @param {string} presetName - Name of preset to stop video for
     * @param {boolean} stopAudio - If true, also stop audio if this preset is playing
     */
    function stopVideo(presetName, stopAudio = true) {
        const item = document.querySelector(`.sound-video-item[data-preset="${presetName}"]`);
        const video = item?.querySelector('video');
        if (!video) return;

        video.pause();
        video.currentTime = 0;
        item.classList.remove('playing');
        
        if (currentPlayingVideo === presetName) {
            currentPlayingVideo = null;
            // Stop audio if this preset is currently playing (but avoid recursion)
            if (stopAudio && currentPresetName === presetName) {
                // Stop audio components directly to avoid recursion
                stopAudioAnalysis();
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio = null;
                }
                isPlaying = false;
                currentPresetName = null;
                
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
            }
        }

        if (!currentPlayingVideo) {
            const panelEl = document.getElementById('sound-video-panel');
            if (panelEl) {
                panelEl.style.display = 'none';
                delete panelEl.dataset.soundVideoPreset;
            }
        }
    }

    /**
     * Stop all videos
     */
    function stopAllVideos() {
        Object.keys(VIDEO_PATHS).forEach(presetName => {
            stopVideo(presetName);
        });
        // Also stop audio
        stop();
    }

    /**
     * Show video overlay for specific preset (legacy support)
     * @param {string} presetName - Name of preset to show video for
     * @param {boolean} skipAudio - If true, don't play audio (video only)
     */
    function showSoundVideo(presetName, skipAudio = true) {
        // Initialize panel if not already done
        initVideoPanel();

        // Stop currently playing video if switching (may momentarily clear currentPlayingVideo)
        if (currentPlayingVideo && currentPlayingVideo !== presetName) {
            stopVideo(currentPlayingVideo, false);
        }

        const item = document.querySelector(`.sound-video-item[data-preset="${presetName}"]`);
        const video = item?.querySelector('video');
        if (!video) return;

        const panelEl = document.getElementById('sound-video-panel');
        if (panelEl) {
            panelEl.style.display = 'flex';
        }
        setActiveSoundVideoPreset(presetName);

        // Start every walkthrough clip from a known frame. The returned promise lets
        // preset audio wait until video playback is actually running.
        video.currentTime = 0;
        const videoPlayback = video.play().catch(e => {
            console.warn(`[AUDIO] Video play failed for ${presetName}:`, e);
            throw e;
        });
        item.classList.add('playing');
        currentPlayingVideo = presetName;
        
        // Only play audio if not skipped (when called from user clicking video)
        if (!skipAudio && SOUND_PRESETS[presetName]) {
            playPreset(presetName, true, true, true); // skipVideo = true to avoid loop
        }
        return videoPlayback;
    }

    /**
     * Hide sound video overlay (legacy support - now stops current video)
     * @param {boolean} skipAudioStop - If true, don't stop audio (used when called from stop())
     */
    function hideSoundVideo(skipAudioStop = false) {
        // Stop current playing video (pass skipAudioStop to avoid double-stopping)
        if (currentPlayingVideo) {
            stopVideo(currentPlayingVideo, !skipAudioStop);
        }
        
        // Stop audio playback when video is closed (unless called from stop())
        if (!skipAudioStop) {
            stopAudioAnalysis();
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio = null;
            }
            isPlaying = false;
            currentPresetName = null;
            
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
        }
    }

    /**
     * Fade video panel + master gain, then stop (for walkthrough hammer demo handoff).
     * @param {number} durationMs
     * @param {function} [onComplete]
     */
    function fadeOutAndStop(durationMs = 1500, onComplete) {
        const durSec = Math.max(0.05, (durationMs || 1500) / 1000);
        const panel = document.getElementById('sound-video-panel');
        if (panel) {
            panel.classList.add('sound-video-panel--fading');
        }
        if (audioContext && gainNode) {
            try {
                const now = audioContext.currentTime;
                const g = gainNode.gain;
                g.cancelScheduledValues(now);
                g.setValueAtTime(Math.max(0.0001, g.value), now);
                g.exponentialRampToValueAtTime(0.0001, now + durSec);
            } catch (e) {
                console.warn('[AUDIO] fadeOutAndStop gain ramp failed:', e);
            }
        }
        window.setTimeout(() => {
            stop();
            if (panel) {
                panel.classList.remove('sound-video-panel--fading');
                panel.style.opacity = '';
            }
            if (typeof onComplete === 'function') {
                try {
                    onComplete();
                } catch (e) {
                    console.warn('[AUDIO] fadeOutAndStop onComplete failed:', e);
                }
            }
        }, durationMs);
    }

    /**
     * Stop current audio playback
     */
    function stop() {
        stopNarration();
        stopAudioAnalysis();
        clearMediaSync();
        
        // Hide video overlay when stopping (skip audio stop to avoid duplicate work)
        hideSoundVideo(true);

        const panelReset = document.getElementById('sound-video-panel');
        if (panelReset) {
            panelReset.classList.remove('sound-video-panel--fading');
            panelReset.style.opacity = '';
            delete panelReset.dataset.soundVideoPreset;
        }
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        isPlaying = false;
        currentPresetName = null; // Clear preset name when stopped
        
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
            currentPresetName: currentPresetName, // Include preset name
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
    function initializeAll() {
        init();
        // Initialize video panel after a short delay to ensure DOM is ready
        setTimeout(() => {
            initVideoPanel();
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAll);
    } else {
        initializeAll();
    }

    // Export to window
    window.AudioPlayer = {
        playPreset,
        playCustom,
        playNarration,
        replayNarration,
        stopNarration,
        stop,
        fadeOutAndStop,
        pause,
        resume,
        setVolume,
        getPresets,
        getState,
        listPresets,
        setAudioAnalysisMode,
        showSoundVideo,
        hideSoundVideo,
        initVideoPanel,
        playVideo,
        stopVideo,
        stopAllVideos,
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
