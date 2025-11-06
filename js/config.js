// Configuration Settings Manager

const Config = {
    // Weighting options
    WEIGHTING: {
        A: 'A',
        C: 'C',
        Z: 'Z'
    },
    
    // Time constant options
    TIME_CONSTANT: {
        SLOW: 'Slow',
        FAST: 'Fast',
        IMPULSE: 'Impulse'
    },
    
    // Range options (in dB)
    RANGE_MIN: 30,
    RANGE_MAX: 130,
    
    // Dose configuration
    DOSE: {
        EXCHANGE_RATE: 5, // dB (default 5 dB)
        THRESHOLD: 80,    // dB (default 80 dB)
        CRITERION_LEVEL: 90, // dB (default 90 dB)
        ENABLED: false
    },
    
    // Backlight settings
    BACKLIGHT: {
        MODE: 'Manual', // 'Manual' or 'Timed'
        TIMEOUT: 30,    // seconds (1-60)
        STATE: false    // on/off
    },
    
    // Current settings
    current: {
        weighting: 'A',
        timeConstant: 'Slow',
        range: 80, // Start at 80 dB range
        doseEnabled: false
    },
    
    /**
     * Initialize configuration with defaults
     */
    init() {
        // Set defaults
        this.current.weighting = this.WEIGHTING.A;
        this.current.timeConstant = this.TIME_CONSTANT.SLOW;
        this.current.range = 80;
        this.current.doseEnabled = this.DOSE.ENABLED;
    },
    
    /**
     * Set weighting type
     * @param {string} weighting - 'A', 'C', or 'Z'
     */
    setWeighting(weighting) {
        if (Object.values(this.WEIGHTING).includes(weighting)) {
            this.current.weighting = weighting;
            return true;
        }
        return false;
    },
    
    /**
     * Set time constant
     * @param {string} timeConstant - 'Slow', 'Fast', or 'Impulse'
     */
    setTimeConstant(timeConstant) {
        if (Object.values(this.TIME_CONSTANT).includes(timeConstant)) {
            this.current.timeConstant = timeConstant;
            return true;
        }
        return false;
    },
    
    /**
     * Set range
     * @param {number} range - Range value in dB
     */
    setRange(range) {
        if (range >= this.RANGE_MIN && range <= this.RANGE_MAX) {
            this.current.range = range;
            return true;
        }
        return false;
    },
    
    /**
     * Toggle backlight
     */
    toggleBacklight() {
        if (this.BACKLIGHT.MODE === 'Manual') {
            this.BACKLIGHT.STATE = !this.BACKLIGHT.STATE;
            return this.BACKLIGHT.STATE;
        }
        return null;
    },
    
    /**
     * Set backlight mode
     * @param {string} mode - 'Manual' or 'Timed'
     */
    setBacklightMode(mode) {
        if (mode === 'Manual' || mode === 'Timed') {
            this.BACKLIGHT.MODE = mode;
            return true;
        }
        return false;
    },
    
    /**
     * Set backlight timeout
     * @param {number} seconds - Timeout in seconds (1-60)
     */
    setBacklightTimeout(seconds) {
        if (seconds >= 1 && seconds <= 60) {
            this.BACKLIGHT.TIMEOUT = seconds;
            return true;
        }
        return false;
    },
    
    /**
     * Enable/disable dose
     * @param {boolean} enabled - Whether dose is enabled
     */
    setDoseEnabled(enabled) {
        this.current.doseEnabled = enabled;
        this.DOSE.ENABLED = enabled;
        return true;
    },
    
    /**
     * Set dose exchange rate
     * @param {number} rate - Exchange rate in dB (typically 3, 4, 5, or 6)
     */
    setDoseExchangeRate(rate) {
        if (rate >= 3 && rate <= 6) {
            this.DOSE.EXCHANGE_RATE = rate;
            return true;
        }
        return false;
    },
    
    /**
     * Set dose threshold
     * @param {number} threshold - Threshold in dB
     */
    setDoseThreshold(threshold) {
        if (threshold >= 50 && threshold <= 100) {
            this.DOSE.THRESHOLD = threshold;
            return true;
        }
        return false;
    },
    
    /**
     * Set dose criterion level
     * @param {number} criterion - Criterion level in dB
     */
    setDoseCriterionLevel(criterion) {
        if (criterion >= 70 && criterion <= 100) {
            this.DOSE.CRITERION_LEVEL = criterion;
            return true;
        }
        return false;
    }
};

// Feature flags
Config.FEATURE_STARTUP_INTEGRATION = true;
Config.FEATURE_FSM_V2 = true; // FSM v2 enabled - includes SLM operation, View menu, and Meter Set

// Main FSM configuration
Config.START_AT_HOME = false; // Set true to skip boot during author testing
Config.ENABLE_TOASTS = true; // Enable toast notifications

// Export to window for global access
window.Config = Config;

