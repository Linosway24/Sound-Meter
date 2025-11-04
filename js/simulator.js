// SPL Data Simulator - Deterministic data generation

const Simulator = {
    // Simulation state
    state: {
        running: false,
        paused: false,
        startTime: null,
        elapsedTime: 0,
        seed: 12345, // Deterministic seed
        baseSPL: 75, // Base sound level in dB
        variation: 5, // Variation range in dB
        currentSPL: 75,
        samples: [],
        maxSPL: -Infinity,
        minSPL: Infinity,
        peakSPL: -Infinity
    },
    
    // Measurement results
    results: {
        leq: null,      // Equivalent continuous sound level
        lmax: null,     // Maximum sound level
        lmin: null,     // Minimum sound level
        sel: null,      // Sound exposure level
        peak: null,     // Peak sound level
        dose: null,     // Noise dose percentage
        twa: null       // Time-weighted average
    },
    
    /**
     * Initialize simulator
     */
    init() {
        this.reset();
    },
    
    /**
     * Reset simulator to initial state
     */
    reset() {
        this.state.running = false;
        this.state.paused = false;
        this.state.startTime = null;
        this.state.elapsedTime = 0;
        this.state.seed = 12345;
        this.state.currentSPL = this.state.baseSPL;
        this.state.samples = [];
        this.state.maxSPL = -Infinity;
        this.state.minSPL = Infinity;
        this.state.peakSPL = -Infinity;
        
        this.results.leq = null;
        this.results.lmax = null;
        this.results.lmin = null;
        this.results.sel = null;
        this.results.peak = null;
        this.results.dose = null;
        this.results.twa = null;
    },
    
    /**
     * Start measurement
     */
    start() {
        if (this.state.running && !this.state.paused) {
            return; // Already running
        }
        
        if (this.state.paused) {
            this.state.paused = false;
            return; // Resume
        }
        
        this.reset();
        this.state.running = true;
        this.state.startTime = Date.now();
    },
    
    /**
     * Pause measurement
     */
    pause() {
        if (this.state.running && !this.state.paused) {
            this.state.paused = true;
        }
    },
    
    /**
     * Stop measurement
     */
    stop() {
        this.state.running = false;
        this.state.paused = false;
    },
    
    /**
     * Generate next SPL sample
     * @returns {number} SPL value in dB
     */
    generateSample() {
        if (!this.state.running || this.state.paused) {
            return this.state.currentSPL;
        }
        
        // Update elapsed time
        const now = Date.now();
        if (this.state.startTime) {
            this.state.elapsedTime = (now - this.state.startTime) / 1000;
        }
        
        // Generate deterministic variation
        this.state.seed += 0.1;
        const random = seededRandom(this.state.seed);
        
        // Create realistic variation (simulates real sound level changes)
        const variation = (random - 0.5) * this.state.variation * 2;
        const trend = Math.sin(this.state.elapsedTime * 0.1) * 2; // Slow trend
        const noise = (random - 0.5) * 1.5; // Fast noise
        
        this.state.currentSPL = this.state.baseSPL + variation + trend + noise;
        
        // Apply weighting adjustment (simplified)
        let adjustedSPL = this.state.currentSPL;
        if (Config.current.weighting === 'A') {
            // A-weighting reduces low frequencies (simplified approximation)
            adjustedSPL = this.state.currentSPL; // In real device, frequency-dependent
        }
        
        // Check range limits
        if (adjustedSPL > Config.current.range) {
            // Over-range warning would be triggered in display
            adjustedSPL = Config.current.range + 1; // Indicate over-range
        }
        
        // Track statistics
        if (adjustedSPL > this.state.maxSPL) {
            this.state.maxSPL = adjustedSPL;
        }
        if (adjustedSPL < this.state.minSPL || this.state.samples.length === 0) {
            this.state.minSPL = adjustedSPL;
        } else if (adjustedSPL < this.state.minSPL) {
            this.state.minSPL = adjustedSPL;
        }
        if (adjustedSPL > this.state.peakSPL) {
            this.state.peakSPL = adjustedSPL;
        }
        
        // Store sample
        this.state.samples.push({
            time: this.state.elapsedTime,
            spl: adjustedSPL
        });
        
        // Update results based on time constant
        this.updateResults();
        
        return adjustedSPL;
    },
    
    /**
     * Update measurement results based on current samples
     */
    updateResults() {
        if (this.state.samples.length === 0) {
            return;
        }
        
        const samples = this.state.samples;
        const n = samples.length;
        
        // Lmax and Lmin
        this.results.lmax = this.state.maxSPL;
        this.results.lmin = this.state.minSPL;
        this.results.peak = this.state.peakSPL;
        
        // Leq (Equivalent continuous sound level)
        // Leq = 10 * log10(1/T * sum(10^(Li/10)))
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
            sum += Math.pow(10, samples[i].spl / 10);
        }
        const avgPower = sum / n;
        this.results.leq = 10 * Math.log10(avgPower);
        
        // SEL (Sound Exposure Level) - for impulse time constant
        if (Config.current.timeConstant === 'Impulse') {
            // SEL = Leq + 10*log10(T) where T is measurement time
            const T = this.state.elapsedTime || 1;
            this.results.sel = this.results.leq + 10 * Math.log10(T);
        } else {
            this.results.sel = this.results.leq;
        }
        
        // Dose calculation (if enabled)
        if (Config.current.doseEnabled) {
            this.updateDose();
        } else {
            this.results.dose = null;
            this.results.twa = null;
        }
    },
    
    /**
     * Update noise dose calculation
     */
    updateDose() {
        if (!Config.current.doseEnabled || this.state.samples.length === 0) {
            return;
        }
        
        const exchangeRate = Config.DOSE.EXCHANGE_RATE;
        const threshold = Config.DOSE.THRESHOLD;
        const criterion = Config.DOSE.CRITERION_LEVEL;
        
        // Calculate dose: D = 100 * sum(ti / Ti)
        // where Ti = 8 * 2^((C-Li)/Q) and ti is time at level Li
        let dose = 0;
        const timeStep = this.state.elapsedTime / this.state.samples.length;
        
        for (let i = 0; i < this.state.samples.length; i++) {
            const spl = this.state.samples[i].spl;
            if (spl >= threshold) {
                const Ti = 8 * Math.pow(2, (criterion - spl) / exchangeRate);
                dose += (timeStep / Ti) * 100;
            }
        }
        
        this.results.dose = Math.min(999.9, dose); // Cap at 999.9%
        
        // TWA (Time-Weighted Average)
        // TWA = Q * log2(D/100) + C
        if (dose > 0) {
            this.results.twa = exchangeRate * Math.log2(dose / 100) + criterion;
        } else {
            this.results.twa = null;
        }
    },
    
    /**
     * Get current measurement results
     * @returns {Object} Results object
     */
    getResults() {
        return {
            ...this.results,
            elapsedTime: this.state.elapsedTime,
            running: this.state.running,
            paused: this.state.paused,
            currentSPL: this.state.currentSPL
        };
    }
};

