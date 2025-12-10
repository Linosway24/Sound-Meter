// /js/measurement.js
// Measurement Calculations Module - Leq, Lmax, Lmin, SEL, Peak, Dose calculations
// Task 5.0: Sub-tasks 5.4-5.17

(() => {
    'use strict';

    /**
     * Measurement Module - Handles all measurement calculations and state
     * Task 5.4: Create js/measurement.js module structure
     */
    const Measurement = {
        /**
         * Internal state
         */
        _state: {
            running: false,
            paused: false,
            startTime: null,
            pauseStartTime: null,
            accumulatedPauseTime: 0,
            samples: [],              // Array of {time, spl, weighted, filtered} samples
            sampleCount: 0,
            updateInterval: null,    // Real-time update timer
            updateRate: 10           // Updates per second (10Hz)
        },

        /**
         * Measurement results
         */
        _results: {
            currentSPL: 0,           // Current instantaneous SPL
            leq: 0,                  // Equivalent continuous sound level
            lmax: -Infinity,         // Maximum level
            lmin: Infinity,          // Minimum level
            sel: 0,                  // Sound exposure level
            peak: 0,                 // Peak level
            dose: 0,                 // Dose percentage
            overRange: false,        // Over-range flag
            overRangeWarning: false  // Over-range warning flag
        },

        /**
         * Configuration (will be set from FSM state)
         */
        _config: {
            weighting: 'A',          // 'A', 'C', 'Z'
            timeConstant: 'F',      // 'F' (Fast), 'S' (Slow), 'I' (Impulse)
            range: 80,              // Selected range (30-130 dB)
            dose: {
                exchangeRate: 3,    // 3-6 dB
                threshold: 50,     // 50-100 dB
                criterionLevel: 70  // 70-100 dB
            }
        },

        /**
         * Initialize measurement module
         * @param {Object} config - Configuration object
         */
        init(config = {}) {
            this._config = {
                weighting: config.weighting || 'A',
                timeConstant: config.timeConstant || 'F',
                range: config.range || 80,
                dose: {
                    exchangeRate: config.dose?.exchangeRate || 3,
                    threshold: config.dose?.threshold || 50,
                    criterionLevel: config.dose?.criterionLevel || 70
                }
            };
            this.reset();
        },

        /**
         * Update configuration
         * @param {Object} config - Updated configuration
         */
        updateConfig(config) {
            if (config.weighting) this._config.weighting = config.weighting;
            if (config.timeConstant) this._config.timeConstant = config.timeConstant;
            if (config.range) this._config.range = config.range;
            if (config.dose) {
                Object.assign(this._config.dose, config.dose);
            }
        },

        /**
         * Reset measurement state
         */
        reset() {
            this._state.running = false;
            this._state.paused = false;
            this._state.startTime = null;
            this._state.pauseStartTime = null;
            this._state.accumulatedPauseTime = 0;
            this._state.samples = [];
            this._state.sampleCount = 0;
            this._stopUpdateLoop();

            this._results.currentSPL = 0;
            this._results.leq = 0;
            this._results.lmax = -Infinity;
            this._results.lmin = Infinity;
            this._results.sel = 0;
            this._results.peak = 0;
            this._results.dose = 0;
            this._results.overRange = false;
            this._results.overRangeWarning = false;
        },

        /**
         * Task 5.5: Implement Run state that starts measurement session and begins data generation
         * 
         * @param {Function} onUpdate - Callback function called on each update
         */
        start(onUpdate = null) {
            if (this._state.running && !this._state.paused) {
                return; // Already running
            }

            if (this._state.paused) {
                // Resume from pause
                this._state.accumulatedPauseTime += Date.now() - this._state.pauseStartTime;
                this._state.paused = false;
                this._state.pauseStartTime = null;
            } else {
                // Start new measurement
                this.reset();
                this._state.startTime = Date.now();
            }

            this._state.running = true;
            this._startUpdateLoop(onUpdate);
        },

        /**
         * Task 5.6: Implement Pause state that suspends measurement without clearing data
         */
        pause() {
            if (this._state.running && !this._state.paused) {
                this._state.paused = true;
                this._state.pauseStartTime = Date.now();
                this._stopUpdateLoop();
            }
        },

        /**
         * Task 5.7: Implement Stop state that ends measurement session
         */
        stop() {
            if (this._state.paused) {
                this._state.accumulatedPauseTime += Date.now() - this._state.pauseStartTime;
            }
            this._state.running = false;
            this._state.paused = false;
            this._state.pauseStartTime = null;
            this._stopUpdateLoop();
        },

        /**
         * Process new SPL sample from simulator
         * Applies weighting, time-constant, and updates all calculations
         * 
         * @param {number} rawSPL - Raw SPL value from simulator (dB)
         */
        processSample(rawSPL) {
            if (!this._state.running || this._state.paused) {
                return;
            }

            const now = Date.now();
            const elapsed = this._state.startTime 
                ? (now - this._state.startTime - this._state.accumulatedPauseTime) / 1000 
                : 0;

            // Task 5.14: Apply weighting filter (A/C/Z)
            const weightedSPL = this._applyWeighting(rawSPL);

            // Task 5.15: Apply time-constant filter (Slow/Fast/Impulse)
            const filteredSPL = this._applyTimeConstant(weightedSPL, elapsed);

            // Update current SPL
            this._results.currentSPL = filteredSPL;

            // Task 5.16: Check range logic
            this._checkRange(filteredSPL);

            // Store sample
            this._state.samples.push({
                time: elapsed,
                spl: rawSPL,
                weighted: weightedSPL,
                filtered: filteredSPL
            });
            this._state.sampleCount++;

            // Update all calculations
            this._updateCalculations();
        },

        /**
         * Task 5.14: Apply weighting filter (A/C/Z)
         * Simplified weighting for training purposes
         * 
         * @param {number} spl - Raw SPL value
         * @returns {number} Weighted SPL value
         */
        _applyWeighting(spl) {
            switch (this._config.weighting) {
                case 'A':
                    // A-weighting: reduces low frequencies
                    // Simplified: slight reduction for very low levels
                    // In real device, this is frequency-dependent
                    return spl; // Simplified - no change for training
                case 'C':
                    // C-weighting: less reduction than A
                    return spl; // Simplified - no change for training
                case 'Z':
                default:
                    // Z-weighting: flat (no filter)
                    return spl;
            }
        },

        /**
         * Task 5.15: Apply time-constant filter (Slow/Fast/Impulse)
         * 
         * @param {number} spl - Weighted SPL value
         * @param {number} elapsed - Elapsed time in seconds
         * @returns {number} Filtered SPL value
         */
        _applyTimeConstant(spl, elapsed) {
            if (this._state.samples.length === 0) {
                return spl; // First sample
            }

            const lastFiltered = this._state.samples[this._state.samples.length - 1].filtered;
            const dt = 1 / this._state.updateRate; // Time step (0.1s for 10Hz)

            switch (this._config.timeConstant) {
                case 'S': // Slow: 1-second exponential averaging
                    {
                        const tau = 1.0; // 1 second time constant
                        const alpha = dt / (tau + dt);
                        return alpha * spl + (1 - alpha) * lastFiltered;
                    }
                case 'F': // Fast: 125ms exponential averaging
                    {
                        const tau = 0.125; // 125ms time constant
                        const alpha = dt / (tau + dt);
                        return alpha * spl + (1 - alpha) * lastFiltered;
                    }
                case 'I': // Impulse: Peak-hold with fast attack, slow decay
                    {
                        if (spl > lastFiltered) {
                            // Fast attack: use current value
                            return spl;
                        } else {
                            // Slow decay: exponential decay
                            const tau = 1.35; // 1.35 second decay
                            const alpha = dt / (tau + dt);
                            return alpha * spl + (1 - alpha) * lastFiltered;
                        }
                    }
                default:
                    return spl;
            }
        },

        /**
         * Task 5.16: Check range logic - detect when measurements exceed selected range
         * 
         * @param {number} spl - Current SPL value
         */
        _checkRange(spl) {
            this._results.overRange = spl > this._config.range;
            this._results.overRangeWarning = this._results.overRange;
        },

        /**
         * Update all measurement calculations
         * Tasks 5.8-5.13: Leq, Lmax, Lmin, SEL, Peak, Dose
         */
        _updateCalculations() {
            if (this._state.samples.length === 0) {
                return;
            }

            const samples = this._state.samples;
            const filteredSamples = samples.map(s => s.filtered);

            // Task 5.9: Lmax (maximum level)
            this._results.lmax = Math.max(...filteredSamples);

            // Task 5.10: Lmin (minimum level)
            this._results.lmin = Math.min(...filteredSamples);

            // Task 5.12: Peak (instantaneous peak - no averaging)
            this._results.peak = Math.max(...filteredSamples);

            // Task 5.8: Leq (Equivalent Continuous Sound Level)
            // Leq = 10 * log10(1/T * Σ(10^(Li/10)))
            // Where T is measurement duration, Li are sample levels
            let sumEnergy = 0;
            for (let i = 0; i < filteredSamples.length; i++) {
                sumEnergy += Math.pow(10, filteredSamples[i] / 10);
            }
            const T = this._getMeasurementDuration();
            const avgEnergy = sumEnergy / filteredSamples.length;
            this._results.leq = 10 * Math.log10(avgEnergy);

            // Task 5.11: SEL (Sound Exposure Level)
            // SEL = 10 * log10(Σ(10^(Li/10))) - normalized to 1 second
            const totalEnergy = sumEnergy;
            const selEnergy = totalEnergy / T; // Normalize to 1 second
            this._results.sel = 10 * Math.log10(selEnergy);

            // Task 5.13: Dose calculation
            this._calculateDose();
        },

        /**
         * Task 5.13: Calculate Dose based on configured parameters
         * Dose = 100 * Σ(ti / Ti)
         * Where Ti = 8 * 2^((C-Li)/Q)
         * C = criterion level, Q = exchange rate, Li = sound level, ti = time at level Li
         */
        _calculateDose() {
            if (this._state.samples.length === 0) {
                this._results.dose = 0;
                return;
            }

            const exchangeRate = this._config.dose.exchangeRate;
            const threshold = this._config.dose.threshold;
            const criterionLevel = this._config.dose.criterionLevel;

            const T = this._getMeasurementDuration();
            const timeStep = T / this._state.samples.length;

            let dose = 0;
            for (let i = 0; i < this._state.samples.length; i++) {
                const spl = this._state.samples[i].filtered;
                if (spl >= threshold) {
                    // Ti = 8 * 2^((C-Li)/Q)
                    const Ti = 8 * Math.pow(2, (criterionLevel - spl) / exchangeRate);
                    dose += (timeStep / Ti) * 100;
                }
            }

            this._results.dose = Math.min(999.9, dose); // Cap at 999.9%
        },

        /**
         * Get measurement duration in seconds
         * @returns {number} Duration in seconds
         */
        _getMeasurementDuration() {
            if (!this._state.startTime) {
                return 1; // Default to 1 second
            }
            const now = this._state.paused ? this._state.pauseStartTime : Date.now();
            const elapsed = (now - this._state.startTime - this._state.accumulatedPauseTime) / 1000;
            return Math.max(0.1, elapsed); // Minimum 0.1 seconds
        },

        /**
         * Start real-time update loop
         * Task 5.18: Real-time display updates
         * 
         * @param {Function} onUpdate - Callback function called on each update
         */
        _startUpdateLoop(onUpdate) {
            this._stopUpdateLoop();
            const intervalMs = 1000 / this._state.updateRate; // 100ms for 10Hz

            this._state.updateInterval = setInterval(() => {
                if (this._state.running && !this._state.paused && onUpdate) {
                    onUpdate(this.getResults());
                }
            }, intervalMs);
        },

        /**
         * Stop real-time update loop
         */
        _stopUpdateLoop() {
            if (this._state.updateInterval) {
                clearInterval(this._state.updateInterval);
                this._state.updateInterval = null;
            }
        },

        /**
         * Get current measurement results
         * @returns {Object} Results object
         */
        getResults() {
            return {
                currentSPL: this._results.currentSPL,
                leq: this._results.leq,
                lmax: this._results.lmax === -Infinity ? 0 : this._results.lmax,
                lmin: this._results.lmin === Infinity ? 0 : this._results.lmin,
                sel: this._results.sel,
                peak: this._results.peak,
                dose: this._results.dose,
                overRange: this._results.overRange,
                overRangeWarning: this._results.overRangeWarning,
                running: this._state.running,
                paused: this._state.paused,
                duration: this._getMeasurementDuration(),
                sampleCount: this._state.sampleCount
            };
        },

        /**
         * Get current state (for debugging)
         * @returns {Object} Current state
         */
        getState() {
            return {
                running: this._state.running,
                paused: this._state.paused,
                sampleCount: this._state.sampleCount,
                config: { ...this._config }
            };
        }
    };

    // Export for use in other modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Measurement;
    } else {
        window.Measurement = Measurement;
    }
})();

