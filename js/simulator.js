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
            baseLevel: 70,            // Base SPL level (dB)
            variation: 5,             // Variation range (±dB)
            trend: 0,                // Slow trend direction (-1 to 1)
            lastUpdate: null,         // Timestamp of last update
            sampleCount: 0           // Number of samples generated
        },

        /**
         * Initialize simulator with seed
         * Task 5.2: Seed-based initialization for reproducibility
         * 
         * @param {number} seed - Seed value for deterministic generation
         * @param {Object} options - Configuration options
         * @param {number} options.baseLevel - Base SPL level in dB (default: 70)
         * @param {number} options.variation - Variation range in dB (default: 5)
         */
        init(seed = 12345, options = {}) {
            this._state.seed = seed;
            this._state.rng = createRNG(seed);
            this._state.baseLevel = options.baseLevel || 70;
            this._state.variation = options.variation || 5;
            this._state.trend = 0;
            this._state.lastUpdate = null;
            this._state.sampleCount = 0;
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

            // Calculate final SPL
            let spl = this._state.baseLevel + variation + trend + noise + drift;

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
                sampleCount: this._state.sampleCount
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
