/**
 * Audio Playback Module
 * Plays sound files to accompany SPL simulation for training scenarios
 */

(() => {
    'use strict';

    // Audio context and elements
    let audioContext = null;
    let currentAudio = null;
    let isPlaying = false;

    // Sound presets with corresponding simulator settings
    const SOUND_PRESETS = {
        // Steady sounds
        fan: {
            name: 'Fan/HVAC',
            file: 'assets/audio/fan.wav',
            baseLevel: 65,
            variation: 2,
            description: 'Steady fan or HVAC hum'
        },
        engine: {
            name: 'Engine Idle',
            file: 'assets/audio/engine.wav',
            baseLevel: 75,
            variation: 3,
            description: 'Steady engine/motor sound'
        },
        // Intermittent/burst sounds
        hammering: {
            name: 'Hammering',
            file: 'assets/audio/hammering.wav',
            baseLevel: 85,
            variation: 15,
            description: 'Intermittent hammering/impacts'
        },
        clapping: {
            name: 'Clapping',
            file: 'assets/audio/clapping.wav',
            baseLevel: 80,
            variation: 12,
            description: 'Intermittent claps/bursts'
        },
        // Industrial sounds
        machinery: {
            name: 'Industrial Machinery',
            file: 'assets/audio/machinery.wav',
            baseLevel: 90,
            variation: 8,
            description: 'Loud industrial equipment'
        },
        // Quiet environments
        office: {
            name: 'Office Ambient',
            file: 'assets/audio/office.wav',
            baseLevel: 50,
            variation: 3,
            description: 'Quiet office background'
        },
        // Calibration tone
        calibration: {
            name: 'Calibration Tone (1kHz)',
            file: 'assets/audio/Calibration_1khz.wav',
            baseLevel: 114,
            variation: 0.5,
            description: '1000 Hz calibration tone at 114 dB'
        }
    };

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
     * Play a sound preset
     * @param {string} presetName - Name of preset from SOUND_PRESETS
     * @param {boolean} loop - Whether to loop the audio (default: true)
     */
    function playPreset(presetName, loop = true) {
        const preset = SOUND_PRESETS[presetName];
        if (!preset) {
            console.error(`[AUDIO] Unknown preset: ${presetName}`);
            console.log('[AUDIO] Available presets:', Object.keys(SOUND_PRESETS).join(', '));
            return;
        }

        // Stop any currently playing audio
        stop();

        // Update simulator to match preset
        if (window.Simulator) {
            window.Simulator.setBaseLevel(preset.baseLevel);
            window.Simulator.setVariation(preset.variation);
            console.log(`[AUDIO] Simulator set to baseLevel: ${preset.baseLevel}, variation: ${preset.variation}`);
        }

        // Create and play audio element
        currentAudio = new Audio(preset.file);
        currentAudio.loop = loop;
        
        currentAudio.addEventListener('canplaythrough', () => {
            currentAudio.play()
                .then(() => {
                    isPlaying = true;
                    console.log(`[AUDIO] Playing: ${preset.name}`);
                    updateStatus(`▶ ${preset.name} (${preset.baseLevel} dB ±${preset.variation})`);
                })
                .catch(e => {
                    console.warn(`[AUDIO] Playback failed: ${e.message}`);
                    console.log('[AUDIO] Note: Audio files may need to be added to assets/audio/');
                    updateStatus(`⚠ Playback failed`);
                });
        });

        currentAudio.addEventListener('error', (e) => {
            console.warn(`[AUDIO] Error loading ${preset.file}:`, e);
            console.log('[AUDIO] Simulator settings applied, but audio file not found');
            console.log('[AUDIO] Add audio files to assets/audio/ directory');
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

        const baseLevel = options.baseLevel || 70;
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
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        isPlaying = false;
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
            volume: currentAudio ? currentAudio.volume : 1
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
        console.log('\nUsage: window.Audio.playPreset("fan")');
        console.log('       window.Audio.stop()');
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export to window
    window.Audio = {
        playPreset,
        playCustom,
        stop,
        pause,
        resume,
        setVolume,
        getPresets,
        getState,
        listPresets,
        PRESETS: SOUND_PRESETS
    };

})();

