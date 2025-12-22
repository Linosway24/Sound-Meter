// /js/simulator.js
// SPL Data Generator Module - Deterministic SPL data generation for Quest SoundPro SE-DL
// Task 5.0: Sub-tasks 5.1-5.3

(() => {
    'use strict';

    /**
     * Deterministic Random Number Generator using Linear Congruential Generator (LCG)
     * Task 5.2: Implement deterministic random number generator using seed value
     * 
     * LCG formula: X(n+1) = (a * X(n) + c) mod m
     * Using parameters from Numerical Recipes (a=1664525, c=1013904223, m=2^32)
     * 
     * @param {number} seed - Initial seed value
     * @returns {Function} Generator function that returns next random number [0, 1)
     */
    function createRNG(seed) {
        // LCG parameters (Numerical Recipes)
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        
        let state = seed || 12345;
        
        return function() {
            state = (a * state + c) % m;
            return state / m; // Normalize to [0, 1)
        };
    }

    /**
     * Simulator Module - Generates deterministic SPL data
     * Task 5.1: Create js/simulator.js module structure
     */
    const Simulator = {
        /**
         * Internal state
         */
        _state: {
            seed: 12345,              // Deterministic seed for reproducible readings
            rng: null,                // Random number generator function
            baseLevel: 47,            // Base SPL level (dB) - ambient sound (45-50 dB)
            variation: 5,             // Variation range (±dB)
            trend: 0,                // Slow trend direction (-1 to 1)
            lastUpdate: null,         // Timestamp of last update
            sampleCount: 0,           // Number of samples generated
            impulsePattern: null      // Impulse pattern config: { interval: ms, spike: dB, duration: ms }
        },

        /**
         * Initialize simulator with seed
         * Task 5.2: Seed-based initialization for reproducibility
         * 
         * @param {number} seed - Seed value for deterministic generation
         * @param {Object} options - Configuration options
         * @param {number} options.baseLevel - Base SPL level in dB (default: 47, ambient)
         * @param {number} options.variation - Variation range in dB (default: 5)
         */
        init(seed = 12345, options = {}) {
            this._state.seed = seed;
            this._state.rng = createRNG(seed);
            this._state.baseLevel = options.baseLevel || 47;
            this._state.variation = options.variation || 5;
            this._state.trend = 0;
            this._state.lastUpdate = null;
            this._state.sampleCount = 0;
            this._state.impulsePattern = options.impulsePattern || null;
            // Reset impulse timing state
            this._state.lastImpulseTime = null;
            this._state.currentImpulseStart = null;
            this._state.currentImpulseAmplitude = 0;
            this._state.patternStartTime = null;
        },

        /**
         * Generate next SPL sample
         * Task 5.3: Create SPL data generator function that produces realistic sound level readings
         * 
         * Generates realistic sound level readings with:
         * - Deterministic variation (based on seed)
         * - Slow trend (simulates gradual changes)
         * - Fast noise (simulates rapid fluctuations)
         * 
         * @returns {number} SPL value in dB (typically 30-130 dB range)
         */
        generateSample() {
            if (!this._state.rng) {
                this.init(); // Initialize if not already done
            }

            const now = Date.now();
            const elapsed = this._state.lastUpdate 
                ? (now - this._state.lastUpdate) / 1000 
                : 0;
            this._state.lastUpdate = now;
            this._state.sampleCount++;

            // Generate deterministic variation using RNG
            const random1 = this._state.rng();
            const random2 = this._state.rng();
            const random3 = this._state.rng();

            // Variation component: random variation within specified range
            const variation = (random1 - 0.5) * this._state.variation * 2;

            // Slow trend: sinusoidal variation over time (simulates gradual level changes)
            // Frequency ~0.1 Hz (10 second period)
            const trendFrequency = 0.1;
            const trendAmplitude = 2; // ±2 dB
            const trend = Math.sin(this._state.sampleCount * 0.01 * trendFrequency * 2 * Math.PI) * trendAmplitude;

            // Fast noise: high-frequency fluctuations (simulates rapid variations)
            const noiseAmplitude = 1.5; // ±1.5 dB
            const noise = (random2 - 0.5) * noiseAmplitude * 2;

            // Additional slow drift (very slow changes over minutes)
            const drift = Math.sin(this._state.sampleCount * 0.0001) * 1; // ±1 dB over ~1000 samples

            // Impulse pattern: periodic spikes (for hammering, clapping, etc.)
            let impulse = 0;
            if (this._state.impulsePattern) {
                const pattern = this._state.impulsePattern;
                
                // Initialize pattern start time if needed
                if (!this._state.patternStartTime) {
                    this._state.patternStartTime = now;
                    this._state.lastImpulseTime = now - pattern.interval; // Trigger first impulse immediately
                }
                
                // Check if it's time for a new impulse
                const timeSinceLastImpulse = now - this._state.lastImpulseTime;
                if (timeSinceLastImpulse >= pattern.interval) {
                    this._state.lastImpulseTime = now;
                    // Create spike - will decay over duration
                    this._state.currentImpulseStart = now;
                    this._state.currentImpulseAmplitude = pattern.spike || 15;
                    console.log(`[SIMULATOR] Impulse spike triggered: +${this._state.currentImpulseAmplitude} dB at sample ${this._state.sampleCount}`);
                }
                
                // Decay impulse over time
                if (this._state.currentImpulseStart) {
                    const timeSinceImpulse = (now - this._state.currentImpulseStart) / 1000; // seconds
                    const impulseDuration = (pattern.duration || 200) / 1000;
                    if (timeSinceImpulse < impulseDuration) {
                        // Exponential decay of impulse
                        const decayFactor = Math.exp(-timeSinceImpulse * 8); // Fast decay (8 = decay rate)
                        impulse = this._state.currentImpulseAmplitude * decayFactor;
                    } else {
                        // Impulse finished
                        this._state.currentImpulseStart = null;
                        this._state.currentImpulseAmplitude = 0;
                    }
                }
            } else {
                // Clear pattern timing when pattern is disabled
                this._state.patternStartTime = null;
            }

            // Calculate final SPL
            let spl = this._state.baseLevel + variation + trend + noise + drift + impulse;
            
            // Debug logging for impulses (only log first few or when impulse is significant)
            if (impulse > 5 && this._state.sampleCount % 10 === 0) {
                console.log(`[SIMULATOR] Sample ${this._state.sampleCount}: base=${this._state.baseLevel.toFixed(1)}, impulse=${impulse.toFixed(1)}, total=${spl.toFixed(1)}`);
            }

            // Clamp to realistic range (30-130 dB typical for sound level meters)
            spl = Math.max(30, Math.min(130, spl));

            return spl;
        },

        /**
         * Set base level for SPL generation
         * @param {number} level - Base SPL level in dB
         */
        setBaseLevel(level) {
            if (level >= 30 && level <= 130) {
                this._state.baseLevel = level;
            }
        },

        /**
         * Set variation range
         * @param {number} variation - Variation range in dB
         */
        setVariation(variation) {
            if (variation >= 0 && variation <= 20) {
                this._state.variation = variation;
            }
        },

        /**
         * Set impulse pattern for intermittent sounds (hammering, clapping, etc.)
         * @param {Object} pattern - Impulse pattern config
         * @param {number} pattern.interval - Time between impulses in milliseconds
         * @param {number} pattern.spike - Amplitude of spike in dB above baseLevel
         * @param {number} pattern.duration - Duration of spike decay in milliseconds
         */
        setImpulsePattern(pattern) {
            this._state.impulsePattern = pattern;
            this._state.lastImpulseTime = null;
            this._state.currentImpulseStart = null;
            this._state.currentImpulseAmplitude = 0;
            this._state.patternStartTime = null; // Will be set on next generateSample()
        },

        /**
         * Clear impulse pattern (for steady sounds)
         */
        clearImpulsePattern() {
            this._state.impulsePattern = null;
            this._state.lastImpulseTime = null;
            this._state.currentImpulseStart = null;
            this._state.currentImpulseAmplitude = 0;
            this._state.patternStartTime = null;
        },

        /**
         * Reset simulator (reinitialize with current seed)
         */
        reset() {
            const seed = this._state.seed;
            const baseLevel = this._state.baseLevel;
            const variation = this._state.variation;
            this.init(seed, { baseLevel, variation });
        },

        /**
         * Get current state (for debugging)
         * @returns {Object} Current simulator state
         */
        getState() {
            return {
                seed: this._state.seed,
                baseLevel: this._state.baseLevel,
                variation: this._state.variation,
                sampleCount: this._state.sampleCount,
                impulsePattern: this._state.impulsePattern
            };
        }
    };

    // Export for use in other modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Simulator;
    } else {
        window.Simulator = Simulator;
    }
})();
