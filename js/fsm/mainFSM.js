// /js/fsm/mainFSM.js
// Production unified FSM: Startup → Home → SLM → Setup → Files → Lock → Calibration
(() => {
    'use strict';

    const MENU_ITEMS = [
        "VIEW PAST STUDIES",
        "VIEW CURRENT STUDY",
        "VIEW SESSION",
        "SETUP",
        "UNIT INFO",
    ];

    const SETUP_MENU_ITEMS = [
        "MEASURE",
        "METER SET",
        "AUTO RUN",
        "DATETIME",
        "DIGITAL OUT",
        "OPTIONS",
        "SIG INPUT",
        "LOGGING",
        "COMM-SET",
        "BATTERY",
        "DISPLAY"
    ];

    const FILES_MENU_ITEMS = [
        "SESSION DIRECTORY",
        "CONFIG DIRECTORY",
        "RENAME LAST SESSION",
        "SAVE CONFIG FILE",
        "FORMAT CARD"
    ];

    const SLM_VIEW_ITEMS = [
        "VIEW PAST STUDIES",
        "VIEW CURRENT STUDY",
        "VIEW SESSION"
    ];

    const METER_SET_ITEMS = [
        { title: "THRESHOLD", value: 80, unit: "dB", min: 0, max: 140, step: 1, enabled: true }, // enabled: true = shows value, false = shows "off"
        { title: "EXCHANGE RATE", value: 3, unit: "dB", min: 3, max: 6, step: 1, enabled: true },
        { title: "CRITERION LEVEL", value: 85, unit: "dB", min: 0, max: 140, step: 1, enabled: true },
        { title: "UPPER LIMIT", value: 115, unit: "dB", min: 0, max: 140, step: 1, enabled: true },
        { title: "PROJECTED TIME", value: 8, unit: "Hr", min: 1, max: 24, step: 1, enabled: true }
    ];

    const DISPLAY_MENU_ITEMS = [
        "LANGUAGE",
        "BACKLIGHT",
        "CONTRAST"
    ];

    const AUTO_RUN_MODES = ["Disabled", "Timed Run", "DOW", "Date", "Level-Triggered"];
    const AUTO_RUN_MENU_ITEMS = [
        { title: "AUTO-RUN", value: "Disabled", options: AUTO_RUN_MODES, showEquals: false },
        { title: "VIEW/SET PARAMETERS", showValue: false }
    ];

    const DATETIME_MENU_ITEMS = [
        "YEAR",
        "MONTH",
        "DAY",
        "TIME"
    ];

    const DIGITAL_OUT_MENU_ITEMS = [
        { title: "TRIGGER", value: "SPL", options: ["SPL", "AVG"] },
        { title: "OUTPUT 1", value: "OFF", options: ["OFF", "RUN/PSE", "CURVES"] },
        { title: "OUTPUT 2", value: "OFF", options: ["OFF", "dB"], dbValue: 0, min: 0, max: 120, step: 1 },
        { title: "OUTPUT 3", value: "OFF", options: ["OFF", "dB"], dbValue: 0, min: 0, max: 120, step: 1 },
        { title: "LOGIC 1", value: ["HI", "HI", "HI"], editingPosition: 0 }, // Array of 3 positions, each can be HI or LO
        { title: "LOGIC 2", value: ["HI", "HI", "HI"], editingPosition: 0 },
        { title: "LOGIC 3", value: ["HI", "HI", "HI"], editingPosition: 0 }
    ];

    // Generate L01 to L99 options (all values from 1 to 99)
    // Lmax is not included in UP/DOWN navigation - only L01 to L99
    const L_OPTIONS = ["OFF"];
    for (let i = 1; i <= 99; i++) {
        L_OPTIONS.push(`L${String(i).padStart(2, '0')}`);
    }
    // Note: Lmax is not in the options array - UP/DOWN only cycles L01 to L99

    const SIG_INPUT_MENU_ITEMS = [
        { title: "SENSITIVITY", value: -28.3, unit: "dB", min: -50, max: 0, step: 0.1 },
        { title: "RANGE CAP", value: 140, unit: "dB", min: 140, max: 180, step: 10 },
        { title: "POLARIZATION", value: 0, unit: "V", options: [0, 200] }
    ];

    // INTERVAL options: stored as objects with value (in seconds) and display string
    const INTERVAL_OPTIONS = [
        { value: 1, display: "1 sec" },
        { value: 5, display: "5 sec" },
        { value: 10, display: "10 sec" },
        { value: 15, display: "15 sec" },
        { value: 30, display: "30 sec" },
        { value: 60, display: "1 min" },
        { value: 300, display: "5 min" },
        { value: 600, display: "10 min" },
        { value: 900, display: "15 min" },
        { value: 1800, display: "30 min" },
        { value: 3600, display: "60 min" }
    ];
    
    const LOGGING_MENU_ITEMS = [
        { title: "AVG", value: "ON", options: ["OFF", "ON"] },
        { title: "PEAK", value: "OFF", options: ["OFF", "ON"] },
        { title: "MAX", value: "ON", options: ["OFF", "ON"] },
        { title: "MIN", value: "ON", options: ["OFF", "ON"] },
        { title: "L1", value: "L83", options: L_OPTIONS },
        { title: "L2", value: "L87", options: L_OPTIONS },
        { title: "FILTERS", value: "OFF", options: ["OFF", "ON"] },
        { title: "INTERVAL", value: 1, intervalOptions: INTERVAL_OPTIONS, spanBottom: true }
    ];
    
    // Meter 2 default values - only AVG, PEAK, MAX, MIN (no L1, L2, FILTERS, INTERVAL)
    const LOGGING_MENU_ITEMS_METER2 = [
        { title: "AVG", value: "OFF", options: ["OFF", "ON"] },
        { title: "PEAK", value: "OFF", options: ["OFF", "ON"] },
        { title: "MAX", value: "ON", options: ["OFF", "ON"] },
        { title: "MIN", value: "ON", options: ["OFF", "ON"] }
    ];
    
    // Custom navigation order for logging menu: 0,1,2,3,7,4,5,6 (INTERVAL comes after MIN, before L1)
    const LOGGING_NAV_ORDER = [0, 1, 2, 3, 7, 4, 5, 6];

    const COMMS_MENU_ITEMS = [
        "USB",
        "RS-232",
        "BAUD RATE"
    ];

    const USB_OPTIONS = ["Mass Storage", "WINUSB", "QSp/Serial"];
    const RS232_OPTIONS = ["Serial", "LOG PRN", "GPS", "OFF/Lo-Pwr"];
    const BAUD_RATE_OPTIONS = [4600, 9600, 19200, 115299]; // As specified by user

    // Helper function to update Level-Triggered TRIGGER field based on MODE and ACTION
    function _updateLevelTriggeredTrigger() {
        if (!_state.autoRunLevelTriggered) return;
        if (_state.autoRunLevelTriggered.mode === "LEVEL ON/OFF" && _state.autoRunLevelTriggered.action === "RUN/STOP") {
            _state.autoRunLevelTriggered.trigger = "Run/Stop";
        } else if (_state.autoRunLevelTriggered.mode === "LEVEL ON/OFF" && _state.autoRunLevelTriggered.action === "RUN/PSE") {
            _state.autoRunLevelTriggered.trigger = "Run & Pause";
        } else if (_state.autoRunLevelTriggered.mode === "WINDOWED") {
            _state.autoRunLevelTriggered.trigger = "Upper & Lower";
        }
    }

    const MEASURE_MENU_ITEMS = [
        { title: "L1", value: "OFF", options: L_OPTIONS },
        { title: "L2", value: "OFF", options: L_OPTIONS },
        { title: "L3", value: "L50", options: L_OPTIONS },
        { title: "L4", value: "L90", options: L_OPTIONS },
        { title: "LDH", value: "OFF", options: ["OFF", "ON"] },
        { title: "CHEL", value: "OFF", options: ["OFF", "ON"] },
        { title: "Lc-a.", value: "N/A", options: ["N/A", "Lc", "La"] },
        { title: "TAKTMX", value: "3sec", options: ["OFF", "3sec", "5sec"] }
    ];

    // Display menu items with values (for display_menu screen)
    const DISPLAY_MENU_ITEMS_WITH_VALUES = [
        { title: "LANGUAGE", showValue: false }, // LANGUAGE has no value displayed
        { title: "BACKLIGHT", valueKey: "backlightMode" }, // Shows "MANUAL" or time in seconds (0-60, default 10)
        { title: "CONTRAST", valueKey: "contrast", type: "bar" } // Shows bar graph
    ];

    // State shape
    let _state = {
        viewId: "OFF",
        backlight: false,
        mode: "SLM",
        menu: { selectedIndex: 0 },
        toast: null,
        slmLabelIndex: 0, // 0 = "SLM", 1 = "1/1", 2 = "1/3"
        timers: {
            stopHold: null,
            formatting: null,
            cal: null,
            measurementRuntime: null
        },
        files: { cursor: 0 },
        display: { 
            contrast: 0, 
            backlightMode: "MANUAL", // "MANUAL" or number (0-60) for time in seconds
            backlightTime: 10, // Time in seconds (0-60, default 10) - only used when backlightMode is a number
            language: "ENGLISH", 
            languageIndex: 0,
            items: DISPLAY_MENU_ITEMS_WITH_VALUES.map(item => ({ ...item })),
            editing: false, // Whether editing a display menu item
            focus: "title" // "title" or "value" - which part is focused when editing
        },
        meterSet: { editing: false, focus: "title", selectedIndex: 0, items: METER_SET_ITEMS.map(item => ({ ...item })) },
        measure: { editing: false, focus: "title", selectedIndex: 0, items: MEASURE_MENU_ITEMS.map(item => ({ ...item })) },
        autoRun: { editing: false, focus: "title", selectedIndex: 0, items: AUTO_RUN_MENU_ITEMS.map(item => ({ ...item })) },
        autoRunTimedRun: {
            editing: false,
            hour: 0,
            minute: 0,
            second: 2,
            editSubField: "hour" // "hour", "minute", "second"
        },
        autoRunDow: {
            selectedIndex: 0,
            lines: [
                { enabled: false, days: ["-", "-", "-", "-", "-", "-", "-"], startTime: { hour: 0, minute: 0 }, stopTime: { hour: 0, minute: 0 }, editMode: null, editSubField: null },
                { enabled: false, days: ["-", "-", "-", "-", "-", "-", "-"], startTime: { hour: 0, minute: 0 }, stopTime: { hour: 0, minute: 0 }, editMode: null, editSubField: null }
            ]
        },
        autoRunDate: {
            selectedIndex: 0,
            lines: [
                { enabled: false, date: null, time: null, editMode: null, editSubField: null },
                { enabled: false, date: null, time: null, editMode: null, editSubField: null },
                { enabled: false, date: null, time: null, editMode: null, editSubField: null },
                { enabled: false, date: null, time: null, editMode: null, editSubField: null }
            ]
        },
        autoRunLevelTriggered: {
            selectedIndex: 0,
            mode: "LEVEL ON/OFF",
            action: "RUN/STOP",
            trigger: "Run/Stop",
            sourceSide: "run", // "run" or "stop"
            sourceRun: "Meter1",
            sourceStop: "Meter1",
            level: "OFF", // "OFF" or number (dB value)
            editingLevel: false
        },
        sigInput: { editing: false, focus: "title", selectedIndex: 0, items: SIG_INPUT_MENU_ITEMS.map(item => ({ ...item })) },
        logging: { editing: false, focus: "title", selectedIndex: 0, meter: "meter1", items: LOGGING_MENU_ITEMS.map(item => ({ ...item })) },
            comms: { editing: false, selectedIndex: 0, usbMode: "Mass Storage", usbModeIndex: 0, rs232Mode: "Serial", rs232ModeIndex: 0, baudRate: 9600, baudRateIndex: 1 }, // baudRateIndex 1 = 9600 (second option in BAUD_RATE_OPTIONS)
        battery: { type: "ALK" }, // "ALK" or "NiMH"
        flags: { locked: false },
        measurement: { 
            runtime: 0, 
            state: "stopped", 
            isRunning: false,
            seed: 12345,
            // Measurement values (populated by measurement engine)
            currentSPL: 0,
            leq: 0,
            lmax: 0,
            lmin: 0,
            sel: 0,
            peak: 0,
            dose: 0,
            overRange: false,
            overRangeWarning: false
        },
        history: [],
        previousViewId: null, // For navigation back from cal/files/etc
        slm: {
            page: 1,                    // Current page (1-4)
            mode: "numeric",            // "numeric", "1of1", "1of3"
            timeConstant: "F",          // "F", "S", "I" (Fast, Slow, Impulse)
            weighting: "R",             // "R", "C", "Z", "F" (Rapid, C, Z, Flat)
            activeMeter: 1,             // 1, 2, "GPS-1", or "GPS-2"
            viewLayout: "SPL"           // Selected from slm_view_menu
        }
    };

    const _subs = new Set();
    function _emit() { _subs.forEach(cb => cb(getState())); }

    // Measurement engine integration
    // Task 5.18: Integrate measurement engine with FSM
    let _measurementUpdateInterval = null;
    
    /**
     * Initialize measurement engine
     */
    function _initMeasurementEngine() {
        if (typeof Simulator === 'undefined' || typeof Measurement === 'undefined') {
            console.warn('[FSM] Simulator or Measurement modules not loaded');
            return;
        }
        
        // Initialize simulator with seed
        Simulator.init(_state.measurement.seed || 12345, {
            baseLevel: 70,
            variation: 5
        });
        
        // Initialize measurement module with current config
        Measurement.init({
            weighting: _state.slm.weighting === 'R' ? 'A' : (_state.slm.weighting === 'C' ? 'C' : 'Z'),
            timeConstant: _state.slm.timeConstant === 'F' ? 'F' : (_state.slm.timeConstant === 'S' ? 'S' : 'I'),
            range: 80, // TODO: Get from config
            dose: {
                exchangeRate: 3,
                threshold: 50,
                criterionLevel: 70
            }
        });
    }
    
    /**
     * Start measurement engine update loop
     * Task 5.18: Real-time display updates during active measurement
     */
    function _startMeasurementEngine() {
        _stopMeasurementEngine();
        
        if (typeof Simulator === 'undefined' || typeof Measurement === 'undefined') {
            return;
        }
        
        // Start measurement module
        Measurement.start((results) => {
            // Update FSM measurement state with results
            _state.measurement.leq = results.leq;
            _state.measurement.lmax = results.lmax;
            _state.measurement.lmin = results.lmin;
            _state.measurement.sel = results.sel;
            _state.measurement.peak = results.peak;
            _state.measurement.dose = results.dose;
            _state.measurement.currentSPL = results.currentSPL;
            _state.measurement.overRange = results.overRange;
            _state.measurement.overRangeWarning = results.overRangeWarning;
            _emit(); // Trigger display update
        });
        
        // Generate samples at 10Hz (100ms intervals)
        _measurementUpdateInterval = setInterval(() => {
            if (_state.measurement.state === "running" && _state.measurement.isRunning) {
                // Generate SPL sample
                const rawSPL = Simulator.generateSample();
                // Process sample (applies weighting, time-constant, updates calculations)
                Measurement.processSample(rawSPL);
            }
        }, 100); // 10Hz update rate
    }
    
    /**
     * Stop measurement engine update loop
     */
    function _stopMeasurementEngine() {
        if (_measurementUpdateInterval) {
            clearInterval(_measurementUpdateInterval);
            _measurementUpdateInterval = null;
        }
        if (typeof Measurement !== 'undefined') {
            Measurement.stop();
        }
    }
    
    /**
     * Pause measurement engine
     */
    function _pauseMeasurementEngine() {
        if (typeof Measurement !== 'undefined') {
            Measurement.pause();
        }
        if (_measurementUpdateInterval) {
            clearInterval(_measurementUpdateInterval);
            _measurementUpdateInterval = null;
        }
    }

    // Navigation history management
    function _pushHistory(viewId) {
        if (_state.viewId && _state.viewId !== viewId) {
            _state.history.push(_state.viewId);
            // Limit history stack to prevent memory growth
            if (_state.history.length > 50) {
                _state.history.shift();
            }
        }
    }

    function _popHistory() {
        if (_state.history.length > 0) {
            return _state.history.pop();
        }
        return null;
    }

    // Timer management
    function _clearTimer(timerName) {
        if (_state.timers[timerName]) {
            if (timerName === 'measurementRuntime') {
                clearInterval(_state.timers[timerName]);
            } else {
                clearTimeout(_state.timers[timerName]);
            }
            _state.timers[timerName] = null;
        }
    }

    function _clearAllTimers() {
        Object.keys(_state.timers).forEach(key => _clearTimer(key));
    }

    // Measurement runtime timer
    function _startMeasurementTimer() {
        _stopMeasurementTimer();
        _state.timers.measurementRuntime = setInterval(() => {
            if (_state.measurement.isRunning) {
                _state.measurement.runtime++;
                _emit();
            }
        }, 1000);
    }

    function _stopMeasurementTimer() {
        _clearTimer('measurementRuntime');
    }

    // Toast management
    function _showToast(message, duration = 1500) {
        // Enable toasts by default unless explicitly disabled
        if (!window.Config || window.Config.ENABLE_TOASTS !== false) {
            _state.toast = { message, timestamp: Date.now() };
            _emit();
            setTimeout(() => {
                _state.toast = null;
                _emit();
            }, duration);
        }
    }

    // Helper functions
    function isHome() {
        return _state.viewId === "home_screen" || _state.viewId === "home_screen_dim" || _state.viewId === "home_screen_running";
    }

    function isSlm() {
        // Check if viewId is any SLM view (numeric, 1/1, or 1/3, any page, running/paused/stopped)
        return _state.viewId.startsWith("slm_home") || 
               _state.viewId.startsWith("slm_graph_1of1") || 
               _state.viewId.startsWith("slm_graph_1of3");
    }

    function isInSetup() {
        return _state.viewId.startsWith("setup_") || _state.viewId.startsWith("measure_") || 
               _state.viewId.startsWith("meter_set_") || _state.viewId.startsWith("auto_run_") ||
               _state.viewId.startsWith("datetime_") || _state.viewId.startsWith("digital_out_") ||
               _state.viewId.startsWith("auto_run_timed_run_") || _state.viewId.startsWith("auto_run_dow_") ||
               _state.viewId.startsWith("auto_run_date_") || _state.viewId.startsWith("auto_run_level_triggered_") ||
               _state.viewId.startsWith("options_") || _state.viewId.startsWith("sig_input_") ||
               _state.viewId.startsWith("logging_") || _state.viewId.startsWith("comms_") ||
               _state.viewId.startsWith("battery_") || _state.viewId.startsWith("display_");
    }

    function isInFiles() {
        return _state.viewId.startsWith("files_");
    }

    function initMainFSM() {
        const startAtHome = window.Config && window.Config.START_AT_HOME;
        
        // Initialize measurement engine
        _initMeasurementEngine();
        
        _state = {
            viewId: startAtHome ? "home_screen_dim" : "OFF",
            backlight: false,
            mode: "SLM",
            menu: { selectedIndex: 0 },
            toast: null,
            slmLabelIndex: 0, // 0 = "SLM", 1 = "1/1", 2 = "1/3"
            timers: { stopHold: null, formatting: null, cal: null, measurementRuntime: null },
            files: { cursor: 0 },
            display: { 
                contrast: 0, 
                backlightMode: "MANUAL",
                backlightTime: 10,
                language: "ENGLISH", 
                languageIndex: 0,
                items: DISPLAY_MENU_ITEMS_WITH_VALUES.map(item => ({ ...item })),
                editing: false,
                focus: "title"
            },
            meterSet: { editing: false, focus: "title", selectedIndex: 0, items: METER_SET_ITEMS.map(item => ({ ...item })) },
            measure: { editing: false, focus: "title", selectedIndex: 0, items: MEASURE_MENU_ITEMS.map(item => ({ ...item })) },
            autoRun: { editing: false, focus: "title", selectedIndex: 0, items: AUTO_RUN_MENU_ITEMS.map(item => ({ ...item })) },
            sigInput: { editing: false, focus: "title", selectedIndex: 0, items: SIG_INPUT_MENU_ITEMS.map(item => ({ ...item })) },
            logging: { editing: false, focus: "title", selectedIndex: 0, meter: "meter1", items: LOGGING_MENU_ITEMS.map(item => ({ ...item })) },
            comms: { editing: false, selectedIndex: 0, usbMode: "Mass Storage", usbModeIndex: 0, rs232Mode: "Serial", rs232ModeIndex: 0, baudRate: 9600, baudRateIndex: 1 }, // baudRateIndex 1 = 9600 (second option in BAUD_RATE_OPTIONS)
            battery: { type: "ALK" },
            slm: {
                page: 1,
                mode: "numeric",
                timeConstant: "F",
                weighting: "R",
                activeMeter: 1,
                viewLayout: "SPL"
            },
            digitalOut: { 
                editing: false, 
                focus: "title", 
                selectedIndex: 0, 
                items: DIGITAL_OUT_MENU_ITEMS.map(item => ({ ...item, value: Array.isArray(item.value) ? [...item.value] : item.value })) 
            },
            autoRunTimedRun: {
                editing: false,
                hour: 0,
                minute: 0,
                second: 2,
                editSubField: "hour" // "hour", "minute", "second"
            },
            autoRunDow: {
                selectedIndex: -1, // -1 = "Days" selected, 0 = line 1, 1 = line 2
                lines: [
                    { days: ["-", "-", "-", "-", "-", "-", "-"], startTime: { hour: 0, minute: 0, second: 0 }, stopTime: { hour: 0, minute: 0, second: 0 }, enabled: false, editMode: null, editSubField: null, editDayIndex: null }, // editMode: "days" | "startTime" | "stopTime" | null, editSubField: "hour" | "minute" | "second" | null, editDayIndex: 0-6 for day of week
                    { days: ["-", "-", "-", "-", "-", "-", "-"], startTime: { hour: 0, minute: 0, second: 0 }, stopTime: { hour: 0, minute: 0, second: 0 }, enabled: false, editMode: null, editSubField: null, editDayIndex: null }
                ]
            },
            autoRunDate: {
                selectedIndex: 0, // 0-3 for lines 1-4
                lines: [
                    { date: null, startTime: { hour: 0, minute: 0, second: 0 }, stopTime: { hour: 0, minute: 0, second: 0 }, enabled: false, editMode: null, editSubField: null }, // date: { year, month, day }, editMode: "date" | "startTime" | "stopTime" | null, editSubField: "year" | "month" | "day" | "hour" | "minute" | "second"
                    { date: null, startTime: { hour: 0, minute: 0, second: 0 }, stopTime: { hour: 0, minute: 0, second: 0 }, enabled: false, editMode: null, editSubField: null },
                    { date: null, startTime: { hour: 0, minute: 0, second: 0 }, stopTime: { hour: 0, minute: 0, second: 0 }, enabled: false, editMode: null, editSubField: null },
                    { date: null, startTime: { hour: 0, minute: 0, second: 0 }, stopTime: { hour: 0, minute: 0, second: 0 }, enabled: false, editMode: null, editSubField: null }
                ]
            },
            autoRunLevelTriggered: {
                selectedIndex: 0, // 0=MODE, 1=ACTION, 2=TRIGGER, 3=SOURCE, 4=LEVEL
                mode: "LEVEL ON/OFF", // "LEVEL ON/OFF" | "WINDOWED"
                action: "RUN/STOP", // "RUN/STOP" | "RUN/PSE"
                trigger: "Run/Stop", // Calculated from mode + action
                sourceRun: "Meter1", // "Meter1" | "12.5Hz" | "EXT" | "Delay"
                sourceStop: "Meter1", // "Meter1" | "12.5Hz" | "EXT" | "Timed"
                level: "OFF", // "OFF" | number (dB value)
                editingLevel: false,
                editingSource: false, // Whether SOURCE values are being edited (highlighted)
                sourceFocus: "title", // "title" | "run" | "stop" - which part of SOURCE is focused
                sourceSide: "run", // "run" | "stop" - which source side is being edited (legacy, kept for compatibility)
                levelFocus: "title" // "title" | "upper" | "lower" - which part of LEVEL is focused
            },
            flags: { locked: false },
            measurement: { 
                runtime: 0, 
                state: "stopped", 
                isRunning: false,
                seed: 12345,
                // Measurement values (populated by measurement engine)
                currentSPL: 0,
                leq: 0,
                lmax: 0,
                lmin: 0,
                sel: 0,
                peak: 0,
                dose: 0,
                overRange: false,
                overRangeWarning: false
            },
            history: [],
            previousViewId: null,
            slm: {
                page: 1,
                mode: "numeric",
                timeConstant: "F",
                weighting: "R",
                activeMeter: 1,
                viewLayout: "SPL"
            }
        };
        _clearAllTimers();
        _emit();
    }

    function subscribe(cb) {
        _subs.add(cb);
        return () => _subs.delete(cb);
    }

    function getState() {
        return JSON.parse(JSON.stringify(_state));
    }

    // Stop hold timer
    function _startStopHoldTimer() {
        _clearTimer('stopHold');
        _state.viewId = "stop_confirm";
        _emit();

        _state.timers.stopHold = setTimeout(() => {
            _state.measurement.state = "stopped";
            _state.measurement.isRunning = false;
            // Stop the measurement timer
            _stopMeasurementTimer();
            // Stop measurement engine
            _stopMeasurementEngine();
            _state.viewId = "slm_home_stopped";
            _clearTimer('stopHold');
            if (window.Config && window.Config.ENABLE_TOASTS) {
                _showToast("Saved & cleared", 2000);
            }
            _emit();
        }, 3000);
    }

    /**
     * Normalize SLM viewId to always use "running" version
     * This allows the icon to update dynamically without changing screens
     * @param {string} viewId - Current viewId (may be paused version)
     * @returns {string} Normalized viewId (always running version)
     */
    function _normalizeSlmViewId(viewId) {
        if (!viewId) return viewId;
        
        // Replace _paused with _running, or remove _paused suffix
        if (viewId === "slm_home_paused") {
            return "slm_home";
        }
        if (viewId.endsWith("_paused")) {
            return viewId.replace("_paused", "_running");
        }
        
        // If already running version or doesn't match pattern, return as-is
        return viewId;
    }

    /**
     * Get the current SLM view ID based on state
     * @returns {string} View ID for current SLM screen
     */
    function _getSlmViewId() {
        const isRunning = _state.measurement.state === "running";
        const page = _state.slm.page || 1;
        const mode = _state.slm.mode || "numeric";
        
        if (mode === "numeric") {
            if (page === 1) {
                return isRunning ? "slm_home" : "slm_home_paused";
            } else {
                return isRunning ? `slm_home_page${page}_running` : `slm_home_page${page}_paused`;
            }
        } else if (mode === "1of1") {
            return isRunning ? `slm_graph_1of1_page${page}_running` : `slm_graph_1of1_page${page}_paused`;
        } else if (mode === "1of3") {
            return isRunning ? `slm_graph_1of3_page${page}_running` : `slm_graph_1of3_page${page}_paused`;
        }
        
        // Fallback
        return isRunning ? "slm_home" : "slm_home_paused";
    }

    function dispatch(evt) {
        if (_state.flags.locked && evt.type !== "LOCK_SOFTKEY") {
            return; // Ignore input when locked (except unlock)
        }

        switch (evt.type) {
            case "POWER":
                if (_state.viewId === "OFF") {
                    _state.viewId = "boot_screen";
                    _state.backlight = false;
                    _emit();
                    const bootDuration = 300 + Math.random() * 500; // 300-800ms
                    setTimeout(() => {
                        _state.viewId = "home_screen_dim";
                        _state.backlight = false;
                        _emit();
                    }, bootDuration);
                }
                break;

            case "BACKLIGHT":
                if (_state.viewId === "home_screen_dim") {
                    _state.viewId = "home_screen";
                    _state.backlight = true;
                    _emit();
                } else if (_state.viewId === "home_screen") {
                    _state.viewId = "home_screen_dim";
                    _state.backlight = false;
                    _emit();
                }
                break;

            case "UP":
            case "DOWN":
                // UP/DOWN arrows do NOT navigate pages in SLM - LEFT/RIGHT do
                // Continue with existing UP/DOWN handler logic
                if (evt.type === "UP") {
                    if (_state.meterSet.editing && (_state.viewId === "meter_set_menu" || _state.viewId === "meter_set_edit")) {
                    const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                    // Only adjust value if focus is "value" AND item is enabled (not showing "off")
                    if (_state.meterSet.focus === "value" && item.enabled !== false) {
                        if (item.options) {
                            const idx = item.options.indexOf(item.value);
                            const newIdx = (idx + 1) % item.options.length;
                            item.value = item.options[newIdx];
                        } else if (item.min !== undefined) {
                            item.value = Math.min(item.max, item.value + (item.step || 1));
                        }
                        _emit();
                    }
                    // If focus is "off", UP/DOWN should not do anything
                } else if (_state.viewId === "meter_set_menu") {
                    if (!_state.meterSet.editing) {
                        // Only navigate if not editing - when editing, UP/DOWN adjusts values
                        _state.meterSet.selectedIndex = (_state.meterSet.selectedIndex + METER_SET_ITEMS.length - 1) % METER_SET_ITEMS.length;
                        _state.meterSet.focus = "title"; // Ensure focus is on title when navigating
                        console.log(`[MENU] Meter Set menu - Selected index: ${_state.meterSet.selectedIndex} → "${METER_SET_ITEMS[_state.meterSet.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "slm_view_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + SLM_VIEW_ITEMS.length - 1) % SLM_VIEW_ITEMS.length;
                    console.log(`[MENU] SLM View menu - Selected index: ${_state.menu.selectedIndex} → "${SLM_VIEW_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "setup_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + SETUP_MENU_ITEMS.length - 1) % SETUP_MENU_ITEMS.length;
                    console.log(`[MENU] Setup menu - Selected index: ${_state.menu.selectedIndex} → "${SETUP_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "files_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + FILES_MENU_ITEMS.length - 1) % FILES_MENU_ITEMS.length;
                    console.log(`[MENU] Files menu - Selected index: ${_state.menu.selectedIndex} → "${FILES_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "meter_set_menu") {
                    _state.meterSet.selectedIndex = (_state.meterSet.selectedIndex + METER_SET_ITEMS.length - 1) % METER_SET_ITEMS.length;
                    console.log(`[MENU] Meter Set menu - Selected index: ${_state.meterSet.selectedIndex} → "${METER_SET_ITEMS[_state.meterSet.selectedIndex].title}"`);
                    _emit();
                } else if (_state.viewId === "measure_menu") {
                    if (_state.measure.editing && _state.measure.focus === "value") {
                        // UP arrow: increase numbers (move forward in numeric options, skip OFF)
                        // Stops at L99 (does not wrap to L01 or Lmax)
                        const item = _state.measure.items[_state.measure.selectedIndex];
                        if (item.options && item.options.length > 0) {
                            const hasOff = item.options.includes("OFF");
                            let numericOptions = hasOff ? item.options.filter(opt => opt !== "OFF") : item.options;
                            
                            // If currently OFF, switch to last numeric value (or first if no last value stored)
                            if (item.value === "OFF") {
                                if (item.lastValue && numericOptions.includes(item.lastValue)) {
                                    item.value = item.lastValue;
                                    console.log(`[MEASURE] UP: ${item.title} = ${item.value} (OFF → last value ${item.lastValue})`);
                                } else {
                                    item.value = numericOptions[0];
                                    console.log(`[MEASURE] UP: ${item.title} = ${item.value} (OFF → first number)`);
                                }
                            } else {
                                // Save current value before changing (so we remember it if we go to OFF)
                                item.lastValue = item.value;
                                const currentIdx = numericOptions.indexOf(item.value);
                                if (currentIdx === -1) {
                                    // Value not found in numeric options, default to first
                                    item.value = numericOptions[0];
                                    console.log(`[MEASURE] UP: ${item.title} = ${item.value} (was not in options, reset to first)`);
                                } else {
                                    // Only increase if not already at maximum (L99)
                                    if (currentIdx < numericOptions.length - 1) {
                                        const newIdx = currentIdx + 1;
                                        item.value = numericOptions[newIdx];
                                        console.log(`[MEASURE] UP: ${item.title} = ${item.value} (${currentIdx} → ${newIdx})`);
                                    } else {
                                        // Already at L99, do nothing (stop at max)
                                        console.log(`[MEASURE] UP: ${item.title} = ${item.value} (already at max, stopping)`);
                                    }
                                }
                            }
                            _emit();
                        }
                    } else {
                        // Navigate between items
                        _state.measure.selectedIndex = (_state.measure.selectedIndex + MEASURE_MENU_ITEMS.length - 1) % MEASURE_MENU_ITEMS.length;
                        _state.measure.focus = "title"; // Ensure focus is on title when navigating
                        console.log(`[MENU] Measure menu - Selected index: ${_state.measure.selectedIndex} → "${MEASURE_MENU_ITEMS[_state.measure.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "display_language") {
                    const LANGUAGE_OPTIONS = ["ENGLISH", "FRANÇAIS", "ESPAÑOL", "PORTUGUESE", "ITALIANO", "DEUTSCH"];
                    // Only update languageIndex for navigation, NOT language (language only changes on ENTER)
                    _state.display.languageIndex = (_state.display.languageIndex + LANGUAGE_OPTIONS.length - 1) % LANGUAGE_OPTIONS.length;
                    console.log(`[MENU] Display Language - Selected index: ${_state.display.languageIndex} → "${LANGUAGE_OPTIONS[_state.display.languageIndex]}"`);
                    _emit();
                } else if (_state.viewId === "display_menu") {
                    // Adjust BACKLIGHT time value when editing (only if not MANUAL)
                    if (_state.display.editing && _state.menu.selectedIndex === 1 && _state.display.focus === "value") {
                        // UP arrow: increase time value by 1 second (0-60 range)
                        if (_state.display.backlightMode !== "MANUAL") {
                            const currentTime = typeof _state.display.backlightMode === "number" ? _state.display.backlightMode : _state.display.backlightTime;
                            const newTime = Math.min(60, currentTime + 1); // Increase by 1 second
                            _state.display.backlightMode = newTime;
                            _state.display.backlightTime = newTime;
                            _emit();
                        }
                        // If MANUAL, do nothing - UP/DOWN only work when in time mode
                    } else {
                        _state.menu.selectedIndex = (_state.menu.selectedIndex + DISPLAY_MENU_ITEMS.length - 1) % DISPLAY_MENU_ITEMS.length;
                        console.log(`[MENU] Display menu - Selected index: ${_state.menu.selectedIndex} → "${DISPLAY_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_menu") {
                    _state.autoRun.selectedIndex = (_state.autoRun.selectedIndex + AUTO_RUN_MENU_ITEMS.length - 1) % AUTO_RUN_MENU_ITEMS.length;
                    _state.autoRun.focus = "title"; // Ensure focus is on title when navigating
                    console.log(`[MENU] Auto Run menu - Selected index: ${_state.autoRun.selectedIndex} → "${AUTO_RUN_MENU_ITEMS[_state.autoRun.selectedIndex].title}"`);
                    _emit();
                } else if (_state.viewId === "auto_run_timed_run_params") {
                    if (_state.autoRunTimedRun.editing) {
                        // In edit mode: adjust the current subfield
                        const subField = _state.autoRunTimedRun.editSubField;
                        if (subField === "hour") {
                            _state.autoRunTimedRun.hour = (_state.autoRunTimedRun.hour + 1) % 24;
                            console.log(`[AUTO RUN TIMED RUN] UP: hour = ${String(_state.autoRunTimedRun.hour).padStart(2, '0')}`);
                        } else if (subField === "minute") {
                            _state.autoRunTimedRun.minute = (_state.autoRunTimedRun.minute + 1) % 60;
                            console.log(`[AUTO RUN TIMED RUN] UP: minute = ${String(_state.autoRunTimedRun.minute).padStart(2, '0')}`);
                        } else if (subField === "second") {
                            _state.autoRunTimedRun.second = (_state.autoRunTimedRun.second + 1) % 60;
                            console.log(`[AUTO RUN TIMED RUN] UP: second = ${String(_state.autoRunTimedRun.second).padStart(2, '0')}`);
                        }
                        _emit();
                    }
                    // No navigation when not editing (only one item on screen)
                } else if (_state.viewId === "datetime_menu") {
                    if (_state.datetime.editing) {
                        // In edit mode: adjust the current subfield
                        const subField = _state.datetime.editSubField;
                        if (subField === "year") {
                            _state.datetime.year = Math.max(2000, Math.min(2099, _state.datetime.year + 1));
                        } else if (subField === "month") {
                            _state.datetime.month = Math.max(1, Math.min(12, _state.datetime.month + 1));
                        } else if (subField === "day") {
                            _state.datetime.day = Math.max(1, Math.min(31, _state.datetime.day + 1));
                        } else if (subField === "hour") {
                            _state.datetime.hour = (_state.datetime.hour + 1) % 24;
                        } else if (subField === "minute") {
                            _state.datetime.minute = (_state.datetime.minute + 1) % 60;
                        } else if (subField === "second") {
                            _state.datetime.second = (_state.datetime.second + 1) % 60;
                        }
                        console.log(`[DATETIME] UP: ${subField} adjusted`);
                        _emit();
                    } else {
                        _state.datetime.selectedIndex = (_state.datetime.selectedIndex + DATETIME_MENU_ITEMS.length - 1) % DATETIME_MENU_ITEMS.length;
                        console.log(`[MENU] Date/Time menu - Selected index: ${_state.datetime.selectedIndex} → "${DATETIME_MENU_ITEMS[_state.datetime.selectedIndex]}"`);
                        _emit();
                    }
                } else if (_state.viewId === "digital_out_menu") {
                    const item = _state.digitalOut.items[_state.digitalOut.selectedIndex];
                    if (_state.digitalOut.editing && item.title && item.title.startsWith("OUTPUT") && (item.title === "OUTPUT 2" || item.title === "OUTPUT 3") && item.value === "dB") {
                        // UP arrow: increase dB value for OUTPUT 2 or 3
                        const oldValue = item.dbValue || 0;
                        let newValue = Math.min(item.max || 120, oldValue + (item.step || 1));
                        item.dbValue = newValue;
                        console.log(`[DIGITAL OUT] ${item.title} dB: ${oldValue} → ${newValue}`);
                        _emit();
                    } else if (_state.digitalOut.editing && item.title && item.title.startsWith("LOGIC")) {
                        // UP arrow in LOGIC edit mode: toggle current position HI ↔ LO
                        const pos = item.editingPosition || 0;
                        item.value[pos] = item.value[pos] === "HI" ? "LO" : "HI";
                        console.log(`[DIGITAL OUT] ${item.title} position ${pos}: ${item.value[pos]}`);
                        _emit();
                    } else {
                        // UP arrow: navigate menu
                        _state.digitalOut.selectedIndex = (_state.digitalOut.selectedIndex + _state.digitalOut.items.length - 1) % _state.digitalOut.items.length;
                        _state.digitalOut.focus = "title";
                        _state.digitalOut.editing = false;
                        console.log(`[MENU] Digital Out menu - Selected index: ${_state.digitalOut.selectedIndex} → "${_state.digitalOut.items[_state.digitalOut.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "sig_input_menu") {
                    if (_state.sigInput.editing && _state.sigInput.focus === "value") {
                        // UP arrow: increase value by step
                        const item = _state.sigInput.items[_state.sigInput.selectedIndex];
                        if (item.min !== undefined) {
                            const step = item.step || 1;
                            // Ensure value is a number, not a string
                            const oldValue = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
                            // Add step (UP increases the value)
                            let newValue = oldValue + step;
                            // Round to one decimal place: multiply by 10, round, divide by 10
                            newValue = Math.round(newValue * 10) / 10;
                            // Clamp to max
                            item.value = Math.min(item.max, newValue);
                            // Ensure value is stored as a number with proper precision
                            item.value = Math.round(item.value * 10) / 10;
                            console.log(`[SIG INPUT] UP: ${oldValue.toFixed(1)} → ${item.value.toFixed(1)}`);
                            _emit();
                        }
                    } else {
                        _state.sigInput.selectedIndex = (_state.sigInput.selectedIndex + SIG_INPUT_MENU_ITEMS.length - 1) % SIG_INPUT_MENU_ITEMS.length;
                        _state.sigInput.focus = "title";
                        console.log(`[MENU] Signal Input menu - Selected index: ${_state.sigInput.selectedIndex} → "${SIG_INPUT_MENU_ITEMS[_state.sigInput.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "logging_menu") {
                    const item = _state.logging.items[_state.logging.selectedIndex];
                    if (_state.logging.editing && _state.logging.focus === "value") {
                        // UP arrow: adjust value or cycle options
                        if (item.intervalOptions) {
                            // INTERVAL: cycle through interval options
                            const currentIdx = item.intervalOptions.findIndex(opt => opt.value === item.value);
                            const nextIdx = (currentIdx + 1) % item.intervalOptions.length;
                            const nextOption = item.intervalOptions[nextIdx];
                            const oldDisplay = item.intervalOptions[currentIdx]?.display || `${item.value} sec`;
                            item.value = nextOption.value;
                            console.log(`[LOGGING] INTERVAL UP: ${oldDisplay} → ${nextOption.display}`);
                        } else if (item.options && (item.title === "L1" || item.title === "L2")) {
                            // L1/L2: Cycle through L01-L99 (don't wrap, stop at L99)
                            const numericOptions = item.options.filter(opt => opt !== "OFF");
                            const currentValue = item.value;
                            
                            if (currentValue === "OFF") {
                                // From OFF, go to L01
                                item.value = numericOptions[0];
                                console.log(`[LOGGING] ${item.title} UP: OFF → ${item.value}`);
                            } else {
                                const currentIdx = numericOptions.indexOf(currentValue);
                                if (currentIdx >= 0) {
                                    // Only increase if not already at maximum (L99)
                                    if (currentIdx < numericOptions.length - 1) {
                                        const newIdx = currentIdx + 1;
                                        item.value = numericOptions[newIdx];
                                        console.log(`[LOGGING] ${item.title} UP: ${currentValue} → ${item.value}`);
                                    } else {
                                        // Already at L99, do nothing (stop at max)
                                        console.log(`[LOGGING] ${item.title} UP: ${item.value} (already at max L99, stopping)`);
                                    }
                                }
                            }
                        }
                        _emit();
                    } else {
                        // Navigation between items
                        if (_state.logging.meter === "meter2") {
                            // Meter 2: Simple navigation (0-3, wrap)
                            _state.logging.selectedIndex = (_state.logging.selectedIndex + _state.logging.items.length - 1) % _state.logging.items.length;
                            _state.logging.focus = "title";
                            const item = _state.logging.items[_state.logging.selectedIndex];
                            console.log(`[MENU] Logging menu (Meter 2) - Selected index: ${_state.logging.selectedIndex} → "${item.title}"`);
                        } else {
                            // Meter 1: Custom navigation order: find current index in nav order, go to previous
                            const currentNavIdx = LOGGING_NAV_ORDER.indexOf(_state.logging.selectedIndex);
                            const prevNavIdx = (currentNavIdx + LOGGING_NAV_ORDER.length - 1) % LOGGING_NAV_ORDER.length;
                            _state.logging.selectedIndex = LOGGING_NAV_ORDER[prevNavIdx];
                            _state.logging.focus = "title";
                            const selectedItem = LOGGING_MENU_ITEMS[_state.logging.selectedIndex];
                            console.log(`[MENU] Logging menu (Meter 1) - Selected index: ${_state.logging.selectedIndex} → "${selectedItem.title}"`);
                            if (selectedItem.title === "INTERVAL") {
                                const intervalItem = _state.logging.items[_state.logging.selectedIndex];
                                const intervalOption = intervalItem.intervalOptions?.find(opt => opt.value === intervalItem.value);
                                const displayValue = intervalOption?.display || `${intervalItem.value} sec`;
                                console.log(`[LOGGING] INTERVAL selected - value: ${displayValue}`);
                            }
                        }
                        _emit();
                    }
                } else if (_state.viewId === "comms_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + COMMS_MENU_ITEMS.length - 1) % COMMS_MENU_ITEMS.length;
                    console.log(`[MENU] Comms menu - Selected index: ${_state.menu.selectedIndex} → "${COMMS_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "auto_run_dow_params") {
                    // Check if we're editing time (startTime or stopTime) on a line
                    if (_state.autoRunDow.selectedIndex >= 0 && _state.autoRunDow.selectedIndex < 2) {
                        const line = _state.autoRunDow.lines[_state.autoRunDow.selectedIndex];
                        if (line.editMode === "startTime" || line.editMode === "stopTime") {
                            // In time edit mode - UP arrow increases the current subfield value
                            const timeField = line.editMode === "startTime" ? line.startTime : line.stopTime;
                            const subField = line.editSubField;
                            if (subField === "hour") {
                                timeField.hour = (timeField.hour + 1) % 24;
                                console.log(`[AUTO RUN DOW] UP: ${line.editMode} hour = ${String(timeField.hour).padStart(2, '0')}`);
                            } else if (subField === "minute") {
                                timeField.minute = (timeField.minute + 1) % 60;
                                console.log(`[AUTO RUN DOW] UP: ${line.editMode} minute = ${String(timeField.minute).padStart(2, '0')}`);
                            } else if (subField === "second") {
                                timeField.second = (timeField.second + 1) % 60;
                                console.log(`[AUTO RUN DOW] UP: ${line.editMode} second = ${String(timeField.second).padStart(2, '0')}`);
                            }
                            _emit();
                            return;
                        }
                    }
                    // Check if we're in days edit mode (on line 1 when Days is selected)
                    if (_state.autoRunDow.selectedIndex === -1) {
                        const line = _state.autoRunDow.lines[0];
                        if (line.editMode === "days" && line.editDayIndex !== null && line.editDayIndex !== undefined) {
                            // In days edit mode - UP arrow toggles the current day between "-" and the day letter
                            const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
                            const currentDayIndex = line.editDayIndex;
                            const currentDayValue = line.days[currentDayIndex] || "-";
                            // Toggle: if "-", change to day letter; if day letter, change to "-"
                            if (currentDayValue === "-") {
                                line.days[currentDayIndex] = dayLabels[currentDayIndex];
                                console.log(`[AUTO RUN DOW] UP: Day ${currentDayIndex} changed from "-" to "${dayLabels[currentDayIndex]}"`);
                            } else {
                                line.days[currentDayIndex] = "-";
                                console.log(`[AUTO RUN DOW] UP: Day ${currentDayIndex} changed from "${dayLabels[currentDayIndex]}" to "-"`);
                            }
                            _emit();
                        } else {
                            // Not in days edit mode - navigate Days → Line 1 → Line 2 → Days
                            // From Days, go to Line 2 (last)
                            _state.autoRunDow.selectedIndex = 1;
                            console.log(`[AUTO RUN DOW] UP: Selected Line 2`);
                            _emit();
                        }
                    } else if (_state.autoRunDow.selectedIndex === 0) {
                        // From Line 1, go to Days
                        _state.autoRunDow.selectedIndex = -1;
                        console.log(`[AUTO RUN DOW] UP: Selected Days`);
                        _emit();
                    } else if (_state.autoRunDow.selectedIndex === 1) {
                        // From Line 2, go to Line 1
                        _state.autoRunDow.selectedIndex = 0;
                        console.log(`[AUTO RUN DOW] UP: Selected Line 1`);
                        _emit();
                    }
                    } else if (_state.viewId === "auto_run_date_params") {
                    const line = _state.autoRunDate.lines[_state.autoRunDate.selectedIndex];
                    if (line.editMode === "date") {
                        // In date edit mode - UP arrow increases the current subfield value
                        const date = line.date;
                        const subField = line.editSubField;
                        if (subField === "day") {
                            date.day = date.day + 1;
                            if (date.day > 31) date.day = 1; // Wrap from 31 to 1
                            console.log(`[AUTO RUN DATE] UP: day = ${date.day}`);
                        } else if (subField === "month") {
                            date.month = Math.max(1, Math.min(12, (date.month % 12) + 1));
                            console.log(`[AUTO RUN DATE] UP: month = ${date.month}`);
                        } else if (subField === "year") {
                            date.year = Math.max(2000, Math.min(2099, date.year + 1));
                            console.log(`[AUTO RUN DATE] UP: year = ${date.year}`);
                        }
                        _emit();
                    } else if (line.editMode === "startTime" || line.editMode === "stopTime") {
                        // In time edit mode - UP arrow increases the current subfield value
                        const timeField = line.editMode === "startTime" ? line.startTime : line.stopTime;
                        const subField = line.editSubField;
                        if (subField === "hour") {
                            timeField.hour = (timeField.hour + 1) % 24;
                            console.log(`[AUTO RUN DATE] UP: ${line.editMode} hour = ${String(timeField.hour).padStart(2, '0')}`);
                        } else if (subField === "minute") {
                            timeField.minute = (timeField.minute + 1) % 60;
                            console.log(`[AUTO RUN DATE] UP: ${line.editMode} minute = ${String(timeField.minute).padStart(2, '0')}`);
                        } else if (subField === "second") {
                            timeField.second = (timeField.second + 1) % 60;
                            console.log(`[AUTO RUN DATE] UP: ${line.editMode} second = ${String(timeField.second).padStart(2, '0')}`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_level_triggered_params") {
                    // UP arrow: adjust LEVEL value by 0.1 when upper/lower columns are focused
                    if (_state.autoRunLevelTriggered.selectedIndex === 4) { // LEVEL selected
                        const currentLevelFocus = _state.autoRunLevelTriggered.levelFocus || "title";
                        if (currentLevelFocus === "upper" || currentLevelFocus === "lower") {
                            // Adjust level value by 0.1 (increase)
                            if (_state.autoRunLevelTriggered.level === "OFF") {
                                _state.autoRunLevelTriggered.level = 90.0;
                            } else {
                                const currentLevel = typeof _state.autoRunLevelTriggered.level === "number" ? _state.autoRunLevelTriggered.level : 90.0;
                                _state.autoRunLevelTriggered.level = Math.min(120.0, Math.round((currentLevel + 0.1) * 10) / 10);
                            }
                            _state.autoRunLevelTriggered.editingLevel = true;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] UP: ${currentLevelFocus} = ${_state.autoRunLevelTriggered.level}`);
                            _emit();
                            return;
                        }
                    }
                    // UP arrow: navigate to previous item, skipping TRIGGER (index 2)
                    // Navigation order: MODE (0) → ACTION (1) → SOURCE (3) → LEVEL (4) → MODE (0)
                    const LEVEL_TRIGGERED_ITEMS = ["MODE", "ACTION", "TRIGGER", "SOURCE", "LEVEL"];
                    const SELECTABLE_INDICES = [0, 1, 3, 4]; // Skip index 2 (TRIGGER)
                    let currentIdx = _state.autoRunLevelTriggered.selectedIndex;
                    // If leaving SOURCE, reset focus to title
                    if (currentIdx === 3) {
                        _state.autoRunLevelTriggered.sourceFocus = "title";
                        _state.autoRunLevelTriggered.editingSource = false;
                    }
                    // If leaving LEVEL, reset focus to title
                    if (currentIdx === 4) {
                        _state.autoRunLevelTriggered.levelFocus = "title";
                        _state.autoRunLevelTriggered.editingLevel = false;
                    }
                    // If somehow on TRIGGER, move to previous selectable
                    if (currentIdx === 2) {
                        currentIdx = 1; // Move to ACTION
                    }
                    const currentPos = SELECTABLE_INDICES.indexOf(currentIdx);
                    const prevPos = (currentPos + SELECTABLE_INDICES.length - 1) % SELECTABLE_INDICES.length;
                    _state.autoRunLevelTriggered.selectedIndex = SELECTABLE_INDICES[prevPos];
                    console.log(`[AUTO RUN LEVEL TRIGGERED] UP: Selected index ${_state.autoRunLevelTriggered.selectedIndex} → "${LEVEL_TRIGGERED_ITEMS[_state.autoRunLevelTriggered.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "comms_edit") {
                    // UP arrow: cycle baud rate up
                    _state.comms.baudRateIndex = (_state.comms.baudRateIndex + 1) % BAUD_RATE_OPTIONS.length;
                    _state.comms.baudRate = BAUD_RATE_OPTIONS[_state.comms.baudRateIndex];
                    console.log(`[COMMS] Baud rate: ${_state.comms.baudRate}`);
                    _emit();
                } else if (isHome()) {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
                    console.log(`[MENU] Home menu - Selected index: ${_state.menu.selectedIndex} → "${MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (isInFiles() && (_state.viewId === "files_session_dir" || _state.viewId === "files_config_dir")) {
                    _state.files.cursor = Math.max(0, _state.files.cursor - 1);
                    _emit();
                }
                } else if (evt.type === "DOWN") {
                    // DOWN-specific logic
                    if (_state.meterSet.editing && (_state.viewId === "meter_set_menu" || _state.viewId === "meter_set_edit")) {
                    const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                    // Only adjust value if focus is "value" AND item is enabled (not showing "off")
                    if (_state.meterSet.focus === "value" && item.enabled !== false) {
                        if (item.options) {
                            const idx = item.options.indexOf(item.value);
                            const newIdx = (idx + item.options.length - 1) % item.options.length;
                            item.value = item.options[newIdx];
                        } else if (item.min !== undefined) {
                            item.value = Math.max(item.min, item.value - (item.step || 1));
                        }
                        _emit();
                    }
                    // If focus is "off", UP/DOWN should not do anything
                } else if (_state.viewId === "slm_view_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % SLM_VIEW_ITEMS.length;
                    console.log(`[MENU] SLM View menu - Selected index: ${_state.menu.selectedIndex} → "${SLM_VIEW_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "setup_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % SETUP_MENU_ITEMS.length;
                    console.log(`[MENU] Setup menu - Selected index: ${_state.menu.selectedIndex} → "${SETUP_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "files_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % FILES_MENU_ITEMS.length;
                    console.log(`[MENU] Files menu - Selected index: ${_state.menu.selectedIndex} → "${FILES_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "meter_set_menu") {
                    // Only navigate if not editing - when editing, UP/DOWN adjusts values (but only if enabled and focus is "value")
                    if (!_state.meterSet.editing) {
                        _state.meterSet.selectedIndex = (_state.meterSet.selectedIndex + 1) % METER_SET_ITEMS.length;
                        _state.meterSet.focus = "title"; // Ensure focus is on title when navigating
                        console.log(`[MENU] Meter Set menu - Selected index: ${_state.meterSet.selectedIndex} → "${METER_SET_ITEMS[_state.meterSet.selectedIndex].title}"`);
                        _emit();
                    }
                    // If editing but focus is "off", UP/DOWN should not navigate between items
                } else if (_state.viewId === "measure_menu") {
                    if (_state.measure.editing && _state.measure.focus === "value") {
                        // DOWN arrow: decrease numbers (move backward in numeric options, skip OFF)
                        // Stops at L01 (does not wrap to L99 or Lmax)
                        const item = _state.measure.items[_state.measure.selectedIndex];
                        if (item.options && item.options.length > 0) {
                            const hasOff = item.options.includes("OFF");
                            let numericOptions = hasOff ? item.options.filter(opt => opt !== "OFF") : item.options;
                            
                            // If currently OFF, switch to last numeric value (or first if no last value stored)
                            if (item.value === "OFF") {
                                if (item.lastValue && numericOptions.includes(item.lastValue)) {
                                    item.value = item.lastValue;
                                    console.log(`[MEASURE] DOWN: ${item.title} = ${item.value} (OFF → last value ${item.lastValue})`);
                                } else {
                                    item.value = numericOptions[0];
                                    console.log(`[MEASURE] DOWN: ${item.title} = ${item.value} (OFF → first number)`);
                                }
                            } else {
                                // Save current value before changing (so we remember it if we go to OFF)
                                item.lastValue = item.value;
                                const currentIdx = numericOptions.indexOf(item.value);
                                if (currentIdx === -1) {
                                    // Value not found in numeric options, default to first
                                    item.value = numericOptions[0];
                                    console.log(`[MEASURE] DOWN: ${item.title} = ${item.value} (was not in options, reset to first)`);
                                } else {
                                    // Only decrease if not already at minimum (L01)
                                    if (currentIdx > 0) {
                                        const newIdx = currentIdx - 1;
                                        item.value = numericOptions[newIdx];
                                        console.log(`[MEASURE] DOWN: ${item.title} = ${item.value} (${currentIdx} → ${newIdx})`);
                                    } else {
                                        // Already at L01, do nothing (stop at min)
                                        console.log(`[MEASURE] DOWN: ${item.title} = ${item.value} (already at min, stopping)`);
                                    }
                                }
                            }
                            _emit();
                        }
                    } else {
                        // Navigate between items
                        _state.measure.selectedIndex = (_state.measure.selectedIndex + 1) % MEASURE_MENU_ITEMS.length;
                        _state.measure.focus = "title"; // Ensure focus is on title when navigating
                        console.log(`[MENU] Measure menu - Selected index: ${_state.measure.selectedIndex} → "${MEASURE_MENU_ITEMS[_state.measure.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "display_language") {
                    const LANGUAGE_OPTIONS = ["ENGLISH", "FRANÇAIS", "ESPAÑOL", "PORTUGUESE", "ITALIANO", "DEUTSCH"];
                    // Only update languageIndex for navigation, NOT language (language only changes on ENTER)
                    _state.display.languageIndex = (_state.display.languageIndex + 1) % LANGUAGE_OPTIONS.length;
                    console.log(`[MENU] Display Language - Selected index: ${_state.display.languageIndex} → "${LANGUAGE_OPTIONS[_state.display.languageIndex]}"`);
                    _emit();
                } else if (_state.viewId === "display_menu") {
                    // Adjust BACKLIGHT time value when editing (only if not MANUAL)
                    if (_state.display.editing && _state.menu.selectedIndex === 1 && _state.display.focus === "value") {
                        // DOWN arrow: decrease time value by 1 second (0-60 range)
                        if (_state.display.backlightMode !== "MANUAL") {
                            const currentTime = typeof _state.display.backlightMode === "number" ? _state.display.backlightMode : _state.display.backlightTime;
                            const newTime = Math.max(0, currentTime - 1); // Decrease by 1 second
                            _state.display.backlightMode = newTime;
                            _state.display.backlightTime = newTime;
                            _emit();
                        }
                        // If MANUAL, do nothing - UP/DOWN only work when in time mode
                    } else {
                        _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % DISPLAY_MENU_ITEMS.length;
                        console.log(`[MENU] Display menu - Selected index: ${_state.menu.selectedIndex} → "${DISPLAY_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_menu") {
                    _state.autoRun.selectedIndex = (_state.autoRun.selectedIndex + 1) % AUTO_RUN_MENU_ITEMS.length;
                    _state.autoRun.focus = "title"; // Ensure focus is on title when navigating
                    console.log(`[MENU] Auto Run menu - Selected index: ${_state.autoRun.selectedIndex} → "${AUTO_RUN_MENU_ITEMS[_state.autoRun.selectedIndex].title}"`);
                    _emit();
                } else if (_state.viewId === "auto_run_timed_run_params") {
                    if (_state.autoRunTimedRun.editing) {
                        // In edit mode: adjust the current subfield
                        const subField = _state.autoRunTimedRun.editSubField;
                        if (subField === "hour") {
                            _state.autoRunTimedRun.hour = (_state.autoRunTimedRun.hour - 1 + 24) % 24;
                            console.log(`[AUTO RUN TIMED RUN] DOWN: hour = ${String(_state.autoRunTimedRun.hour).padStart(2, '0')}`);
                        } else if (subField === "minute") {
                            _state.autoRunTimedRun.minute = (_state.autoRunTimedRun.minute - 1 + 60) % 60;
                            console.log(`[AUTO RUN TIMED RUN] DOWN: minute = ${String(_state.autoRunTimedRun.minute).padStart(2, '0')}`);
                        } else if (subField === "second") {
                            _state.autoRunTimedRun.second = (_state.autoRunTimedRun.second - 1 + 60) % 60;
                            console.log(`[AUTO RUN TIMED RUN] DOWN: second = ${String(_state.autoRunTimedRun.second).padStart(2, '0')}`);
                        }
                        _emit();
                    }
                    // No navigation when not editing (only one item on screen)
                } else if (_state.viewId === "datetime_menu") {
                    if (_state.datetime.editing) {
                        // In edit mode: adjust the current subfield
                        const subField = _state.datetime.editSubField;
                        if (subField === "year") {
                            _state.datetime.year = Math.max(2000, Math.min(2099, _state.datetime.year - 1));
                        } else if (subField === "month") {
                            _state.datetime.month = Math.max(1, Math.min(12, _state.datetime.month - 1));
                        } else if (subField === "day") {
                            _state.datetime.day = Math.max(1, Math.min(31, _state.datetime.day - 1));
                        } else if (subField === "hour") {
                            _state.datetime.hour = (_state.datetime.hour - 1 + 24) % 24;
                        } else if (subField === "minute") {
                            _state.datetime.minute = (_state.datetime.minute - 1 + 60) % 60;
                        } else if (subField === "second") {
                            _state.datetime.second = (_state.datetime.second - 1 + 60) % 60;
                        }
                        console.log(`[DATETIME] DOWN: ${subField} adjusted`);
                        _emit();
                    } else {
                        _state.datetime.selectedIndex = (_state.datetime.selectedIndex + 1) % DATETIME_MENU_ITEMS.length;
                        console.log(`[MENU] Date/Time menu - Selected index: ${_state.datetime.selectedIndex} → "${DATETIME_MENU_ITEMS[_state.datetime.selectedIndex]}"`);
                        _emit();
                    }
                } else if (_state.viewId === "digital_out_menu") {
                    const item = _state.digitalOut.items[_state.digitalOut.selectedIndex];
                    if (_state.digitalOut.editing && item.title && item.title.startsWith("OUTPUT") && (item.title === "OUTPUT 2" || item.title === "OUTPUT 3") && item.value === "dB") {
                        // DOWN arrow: decrease dB value for OUTPUT 2 or 3
                        const oldValue = item.dbValue || 0;
                        let newValue = Math.max(item.min || 0, oldValue - (item.step || 1));
                        item.dbValue = newValue;
                        console.log(`[DIGITAL OUT] ${item.title} dB: ${oldValue} → ${newValue}`);
                        _emit();
                    } else if (_state.digitalOut.editing && item.title && item.title.startsWith("LOGIC")) {
                        // DOWN arrow in LOGIC edit mode: toggle current position HI ↔ LO
                        const pos = item.editingPosition || 0;
                        item.value[pos] = item.value[pos] === "HI" ? "LO" : "HI";
                        console.log(`[DIGITAL OUT] ${item.title} position ${pos}: ${item.value[pos]}`);
                        _emit();
                    } else {
                        // DOWN arrow: navigate menu
                        _state.digitalOut.selectedIndex = (_state.digitalOut.selectedIndex + 1) % _state.digitalOut.items.length;
                        _state.digitalOut.focus = "title";
                        _state.digitalOut.editing = false;
                        console.log(`[MENU] Digital Out menu - Selected index: ${_state.digitalOut.selectedIndex} → "${_state.digitalOut.items[_state.digitalOut.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "sig_input_menu") {
                    if (_state.sigInput.editing && _state.sigInput.focus === "value") {
                        // DOWN arrow: decrease value by step
                        const item = _state.sigInput.items[_state.sigInput.selectedIndex];
                        if (item.min !== undefined) {
                            const step = item.step || 1;
                            // Ensure value is a number, not a string
                            const oldValue = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
                            // Subtract step (DOWN decreases the value)
                            let newValue = oldValue - step;
                            // Round to one decimal place: multiply by 10, round, divide by 10
                            newValue = Math.round(newValue * 10) / 10;
                            // Clamp to min
                            item.value = Math.max(item.min, newValue);
                            // Ensure value is stored as a number with proper precision
                            item.value = Math.round(item.value * 10) / 10;
                            console.log(`[SIG INPUT] DOWN: ${oldValue.toFixed(1)} → ${item.value.toFixed(1)}`);
                            _emit();
                        }
                    } else {
                        _state.sigInput.selectedIndex = (_state.sigInput.selectedIndex + 1) % SIG_INPUT_MENU_ITEMS.length;
                        _state.sigInput.focus = "title";
                        console.log(`[MENU] Signal Input menu - Selected index: ${_state.sigInput.selectedIndex} → "${SIG_INPUT_MENU_ITEMS[_state.sigInput.selectedIndex].title}"`);
                        _emit();
                    }
                } else if (_state.viewId === "logging_menu") {
                    const item = _state.logging.items[_state.logging.selectedIndex];
                    if (_state.logging.editing && _state.logging.focus === "value") {
                        // DOWN arrow: adjust value or cycle options
                        if (item.intervalOptions) {
                            // INTERVAL: cycle through interval options (reverse)
                            const currentIdx = item.intervalOptions.findIndex(opt => opt.value === item.value);
                            const prevIdx = (currentIdx + item.intervalOptions.length - 1) % item.intervalOptions.length;
                            const prevOption = item.intervalOptions[prevIdx];
                            const oldDisplay = item.intervalOptions[currentIdx]?.display || `${item.value} sec`;
                            item.value = prevOption.value;
                            console.log(`[LOGGING] INTERVAL DOWN: ${oldDisplay} → ${prevOption.display}`);
                        } else if (item.options && (item.title === "L1" || item.title === "L2")) {
                            // L1/L2: Cycle through L01-L99 (don't wrap, stop at L01)
                            const numericOptions = item.options.filter(opt => opt !== "OFF");
                            const currentValue = item.value;
                            
                            if (currentValue === "OFF") {
                                // From OFF, go to L99
                                item.value = numericOptions[numericOptions.length - 1];
                                console.log(`[LOGGING] ${item.title} DOWN: OFF → ${item.value}`);
                            } else {
                                const currentIdx = numericOptions.indexOf(currentValue);
                                if (currentIdx >= 0) {
                                    // Only decrease if not already at minimum (L01)
                                    if (currentIdx > 0) {
                                        const newIdx = currentIdx - 1;
                                        item.value = numericOptions[newIdx];
                                        console.log(`[LOGGING] ${item.title} DOWN: ${currentValue} → ${item.value}`);
                                    } else {
                                        // Already at L01, do nothing (stop at min)
                                        console.log(`[LOGGING] ${item.title} DOWN: ${item.value} (already at min L01, stopping)`);
                                    }
                                }
                            }
                        }
                        _emit();
                    } else {
                        // Navigation between items
                        if (_state.logging.meter === "meter2") {
                            // Meter 2: Simple navigation (0-3, wrap)
                            _state.logging.selectedIndex = (_state.logging.selectedIndex + 1) % _state.logging.items.length;
                            _state.logging.focus = "title";
                            const item = _state.logging.items[_state.logging.selectedIndex];
                            console.log(`[MENU] Logging menu (Meter 2) - Selected index: ${_state.logging.selectedIndex} → "${item.title}"`);
                        } else {
                            // Meter 1: Custom navigation order: find current index in nav order, go to next
                            const currentNavIdx = LOGGING_NAV_ORDER.indexOf(_state.logging.selectedIndex);
                            const nextNavIdx = (currentNavIdx + 1) % LOGGING_NAV_ORDER.length;
                            _state.logging.selectedIndex = LOGGING_NAV_ORDER[nextNavIdx];
                            _state.logging.focus = "title";
                            const selectedItem = LOGGING_MENU_ITEMS[_state.logging.selectedIndex];
                            console.log(`[MENU] Logging menu (Meter 1) - Selected index: ${_state.logging.selectedIndex} → "${selectedItem.title}"`);
                            if (selectedItem.title === "INTERVAL") {
                                const intervalItem = _state.logging.items[_state.logging.selectedIndex];
                                const intervalOption = intervalItem.intervalOptions?.find(opt => opt.value === intervalItem.value);
                                const displayValue = intervalOption?.display || `${intervalItem.value} sec`;
                                console.log(`[LOGGING] INTERVAL selected - value: ${displayValue}`);
                            }
                        }
                        _emit();
                    }
                } else if (_state.viewId === "comms_menu") {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % COMMS_MENU_ITEMS.length;
                    console.log(`[MENU] Comms menu - Selected index: ${_state.menu.selectedIndex} → "${COMMS_MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "auto_run_dow_params") {
                    // Check if we're editing time (startTime or stopTime) on a line
                    if (_state.autoRunDow.selectedIndex >= 0 && _state.autoRunDow.selectedIndex < 2) {
                        const line = _state.autoRunDow.lines[_state.autoRunDow.selectedIndex];
                        if (line.editMode === "startTime" || line.editMode === "stopTime") {
                            // In time edit mode - DOWN arrow decreases the current subfield value
                            const timeField = line.editMode === "startTime" ? line.startTime : line.stopTime;
                            const subField = line.editSubField;
                            if (subField === "hour") {
                                timeField.hour = (timeField.hour - 1 + 24) % 24;
                                console.log(`[AUTO RUN DOW] DOWN: ${line.editMode} hour = ${String(timeField.hour).padStart(2, '0')}`);
                            } else if (subField === "minute") {
                                timeField.minute = (timeField.minute - 1 + 60) % 60;
                                console.log(`[AUTO RUN DOW] DOWN: ${line.editMode} minute = ${String(timeField.minute).padStart(2, '0')}`);
                            } else if (subField === "second") {
                                timeField.second = (timeField.second - 1 + 60) % 60;
                                console.log(`[AUTO RUN DOW] DOWN: ${line.editMode} second = ${String(timeField.second).padStart(2, '0')}`);
                            }
                            _emit();
                            return;
                        }
                    }
                    // Check if we're in days edit mode (on line 1 when Days is selected)
                    if (_state.autoRunDow.selectedIndex === -1) {
                        const line = _state.autoRunDow.lines[0];
                        if (line.editMode === "days" && line.editDayIndex !== null && line.editDayIndex !== undefined) {
                            // In days edit mode - DOWN arrow toggles the current day between "-" and the day letter
                            const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
                            const currentDayIndex = line.editDayIndex;
                            const currentDayValue = line.days[currentDayIndex] || "-";
                            // Toggle: if "-", change to day letter; if day letter, change to "-"
                            if (currentDayValue === "-") {
                                line.days[currentDayIndex] = dayLabels[currentDayIndex];
                                console.log(`[AUTO RUN DOW] DOWN: Day ${currentDayIndex} changed from "-" to "${dayLabels[currentDayIndex]}"`);
                            } else {
                                line.days[currentDayIndex] = "-";
                                console.log(`[AUTO RUN DOW] DOWN: Day ${currentDayIndex} changed from "${dayLabels[currentDayIndex]}" to "-"`);
                            }
                            _emit();
                        } else {
                            // Not in days edit mode - navigate Days → Line 1 → Line 2 → Days
                            // From Days, go to Line 1
                            _state.autoRunDow.selectedIndex = 0;
                            console.log(`[AUTO RUN DOW] DOWN: Selected Line 1`);
                            _emit();
                        }
                    } else if (_state.autoRunDow.selectedIndex === 0) {
                        // From Line 1, go to Line 2
                        _state.autoRunDow.selectedIndex = 1;
                        console.log(`[AUTO RUN DOW] DOWN: Selected Line 2`);
                        _emit();
                    } else if (_state.autoRunDow.selectedIndex === 1) {
                        // From Line 2, go to Days
                        _state.autoRunDow.selectedIndex = -1;
                        console.log(`[AUTO RUN DOW] DOWN: Selected Days`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_date_params") {
                    const line = _state.autoRunDate.lines[_state.autoRunDate.selectedIndex];
                    if (line.editMode === "date") {
                        // In date edit mode - DOWN arrow decreases the current subfield value
                        const date = line.date;
                        const subField = line.editSubField;
                        if (subField === "day") {
                            date.day = date.day - 1;
                            if (date.day < 1) date.day = 31; // Wrap from 1 to 31
                            console.log(`[AUTO RUN DATE] DOWN: day = ${date.day}`);
                        } else if (subField === "month") {
                            date.month = date.month - 1;
                            if (date.month < 1) date.month = 12; // Wrap from 1 to 12
                            console.log(`[AUTO RUN DATE] DOWN: month = ${date.month}`);
                        } else if (subField === "year") {
                            date.year = Math.max(2000, date.year - 1);
                            console.log(`[AUTO RUN DATE] DOWN: year = ${date.year}`);
                        }
                        _emit();
                    } else if (line.editMode === "startTime" || line.editMode === "stopTime") {
                        // In time edit mode - DOWN arrow decreases the current subfield value
                        const timeField = line.editMode === "startTime" ? line.startTime : line.stopTime;
                        const subField = line.editSubField;
                        if (subField === "hour") {
                            timeField.hour = (timeField.hour - 1 + 24) % 24;
                            console.log(`[AUTO RUN DATE] DOWN: ${line.editMode} hour = ${String(timeField.hour).padStart(2, '0')}`);
                        } else if (subField === "minute") {
                            timeField.minute = (timeField.minute - 1 + 60) % 60;
                            console.log(`[AUTO RUN DATE] DOWN: ${line.editMode} minute = ${String(timeField.minute).padStart(2, '0')}`);
                        } else if (subField === "second") {
                            timeField.second = (timeField.second - 1 + 60) % 60;
                            console.log(`[AUTO RUN DATE] DOWN: ${line.editMode} second = ${String(timeField.second).padStart(2, '0')}`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_level_triggered_params") {
                    // DOWN arrow: adjust LEVEL value by 0.1 when upper/lower columns are focused
                    if (_state.autoRunLevelTriggered.selectedIndex === 4) { // LEVEL selected
                        const currentLevelFocus = _state.autoRunLevelTriggered.levelFocus || "title";
                        if (currentLevelFocus === "upper" || currentLevelFocus === "lower") {
                            // Adjust level value by 0.1 (decrease)
                            if (_state.autoRunLevelTriggered.level === "OFF") {
                                _state.autoRunLevelTriggered.level = 90.0;
                            } else {
                                const currentLevel = typeof _state.autoRunLevelTriggered.level === "number" ? _state.autoRunLevelTriggered.level : 90.0;
                                _state.autoRunLevelTriggered.level = Math.max(0.0, Math.round((currentLevel - 0.1) * 10) / 10);
                            }
                            _state.autoRunLevelTriggered.editingLevel = true;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] DOWN: ${currentLevelFocus} = ${_state.autoRunLevelTriggered.level}`);
                            _emit();
                            return;
                        }
                    }
                    // DOWN arrow: navigate to next item, skipping TRIGGER (index 2)
                    // Navigation order: MODE (0) → ACTION (1) → SOURCE (3) → LEVEL (4) → MODE (0)
                    const LEVEL_TRIGGERED_ITEMS = ["MODE", "ACTION", "TRIGGER", "SOURCE", "LEVEL"];
                    const SELECTABLE_INDICES = [0, 1, 3, 4]; // Skip index 2 (TRIGGER)
                    let currentIdx = _state.autoRunLevelTriggered.selectedIndex;
                    // If leaving SOURCE, reset focus to title
                    if (currentIdx === 3) {
                        _state.autoRunLevelTriggered.sourceFocus = "title";
                        _state.autoRunLevelTriggered.editingSource = false;
                    }
                    // If leaving LEVEL, reset focus to title
                    if (currentIdx === 4) {
                        _state.autoRunLevelTriggered.levelFocus = "title";
                        _state.autoRunLevelTriggered.editingLevel = false;
                    }
                    // If somehow on TRIGGER, move to next selectable
                    if (currentIdx === 2) {
                        currentIdx = 3; // Move to SOURCE
                    }
                    const currentPos = SELECTABLE_INDICES.indexOf(currentIdx);
                    const nextPos = (currentPos + 1) % SELECTABLE_INDICES.length;
                    _state.autoRunLevelTriggered.selectedIndex = SELECTABLE_INDICES[nextPos];
                    console.log(`[AUTO RUN LEVEL TRIGGERED] DOWN: Selected index ${_state.autoRunLevelTriggered.selectedIndex} → "${LEVEL_TRIGGERED_ITEMS[_state.autoRunLevelTriggered.selectedIndex]}"`);
                    _emit();
                } else if (_state.viewId === "comms_edit") {
                    // DOWN arrow: cycle baud rate down
                    _state.comms.baudRateIndex = (_state.comms.baudRateIndex + BAUD_RATE_OPTIONS.length - 1) % BAUD_RATE_OPTIONS.length;
                    _state.comms.baudRate = BAUD_RATE_OPTIONS[_state.comms.baudRateIndex];
                    console.log(`[COMMS] Baud rate: ${_state.comms.baudRate}`);
                    _emit();
                } else if (isHome()) {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % MENU_ITEMS.length;
                    console.log(`[MENU] Home menu - Selected index: ${_state.menu.selectedIndex} → "${MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (isInFiles() && (_state.viewId === "files_session_dir" || _state.viewId === "files_config_dir")) {
                    _state.files.cursor++;
                    _emit();
                }
                }
                break;

            case "LEFT":
                if (isSlm()) {
                    // LEFT arrow: navigate to previous page (4 → 3 → 2 → 1 → 4)
                    console.log('[FSM] LEFT: Navigating SLM pages, current page:', _state.slm.page);
                    _state.slm.page = _state.slm.page > 1 ? _state.slm.page - 1 : 4;
                    console.log('[FSM] LEFT: New page:', _state.slm.page);
                    // Always use running version of viewId - icon will show correct state dynamically
                    let viewId = _getSlmViewId();
                    _state.viewId = _normalizeSlmViewId(viewId);
                    console.log('[FSM] LEFT: New viewId:', _state.viewId);
                    _emit();
                    return;
                }
                if (_state.viewId === "display_menu" && _state.display.editing && _state.menu.selectedIndex === 2 && _state.display.focus === "value") {
                    // LEFT arrow: decrease contrast by one segment (remove one filled box)
                    // Each segment represents 100/15 ≈ 6.67 contrast units
                    const currentSegments = Math.round((_state.display.contrast / 100) * 15);
                    const newSegments = Math.max(0, currentSegments - 1);
                    _state.display.contrast = Math.round((newSegments / 15) * 100);
                    console.log(`[CONTRAST] LEFT: ${currentSegments} segments → ${newSegments} segments (contrast: ${_state.display.contrast})`);
                    _emit();
                } else if (_state.viewId === "display_menu" && _state.display.editing && _state.menu.selectedIndex === 1 && _state.display.focus === "value") {
                    // LEFT arrow switches from BACKLIGHT value back to title and exits edit mode
                    _state.display.focus = "title";
                    _state.display.editing = false; // Exit edit mode so UP/DOWN can navigate between items
                    _emit();
                } else if (_state.meterSet.editing && (_state.viewId === "meter_set_menu" || _state.viewId === "meter_set_edit")) {
                    if (_state.meterSet.focus === "value" || _state.meterSet.focus === "off") {
                        // LEFT arrow switches from value/off back to title and exits edit mode
                        _state.meterSet.focus = "title";
                        _state.meterSet.editing = false; // Exit edit mode so UP/DOWN can navigate between items
                        _emit();
                    }
                } else if (_state.viewId === "measure_menu" && _state.measure.editing && _state.measure.focus === "value") {
                    // LEFT arrow switches from value back to title and exits edit mode
                    _state.measure.focus = "title";
                    _state.measure.editing = false; // Exit edit mode so UP/DOWN can navigate between items
                    _emit();
                } else if (_state.viewId === "sig_input_menu") {
                    if (_state.sigInput.editing && _state.sigInput.focus === "value") {
                        // LEFT arrow switches from value back to title and exits edit mode
                        _state.sigInput.focus = "title";
                        _state.sigInput.editing = false;
                        console.log(`[SIG INPUT] LEFT: Exited edit mode`);
                        _emit();
                    }
                    // If not editing, LEFT arrow does nothing (don't navigate away)
                } else if (_state.viewId === "logging_menu") {
                    // LEFT arrow: only works in Meter 1 edit mode, does nothing in Meter 2
                    if (_state.logging.meter === "meter1" && _state.logging.editing && _state.logging.focus === "value") {
                        // LEFT arrow switches from value back to title and exits edit mode
                        _state.logging.focus = "title";
                        _state.logging.editing = false;
                        _emit();
                    }
                    // In Meter 2 or when not editing, LEFT does nothing
                } else if (_state.viewId === "datetime_menu" && _state.datetime.editing) {
                    // LEFT arrow: move to previous subfield
                    const currentSubField = _state.datetime.editSubField;
                    if (_state.datetime.editField === "time") {
                        // Time subfields: hour → minute → second → hour
                        if (currentSubField === "hour") {
                            _state.datetime.editSubField = "second";
                        } else if (currentSubField === "minute") {
                            _state.datetime.editSubField = "hour";
                        } else if (currentSubField === "second") {
                            _state.datetime.editSubField = "minute";
                        }
                    } else if (_state.datetime.editField === "year" || _state.datetime.editField === "month" || _state.datetime.editField === "day") {
                        // Date subfields cycle: year → month → day → year
                        if (currentSubField === "year") {
                            _state.datetime.editSubField = "day";
                        } else if (currentSubField === "month") {
                            _state.datetime.editSubField = "year";
                        } else if (currentSubField === "day") {
                            _state.datetime.editSubField = "month";
                        }
                    }
                    console.log(`[DATETIME] LEFT: Moved to subfield ${_state.datetime.editSubField}`);
                    _emit();
                } else if (_state.viewId === "auto_run_timed_run_params" && _state.autoRunTimedRun.editing) {
                    // LEFT arrow: move to previous subfield (H → S → M → H)
                    const currentSubField = _state.autoRunTimedRun.editSubField;
                    if (currentSubField === "hour") {
                        _state.autoRunTimedRun.editSubField = "second";
                    } else if (currentSubField === "minute") {
                        _state.autoRunTimedRun.editSubField = "hour";
                    } else if (currentSubField === "second") {
                        _state.autoRunTimedRun.editSubField = "minute";
                    }
                    console.log(`[AUTO RUN TIMED RUN] LEFT: Moved to subfield ${_state.autoRunTimedRun.editSubField}`);
                    _emit();
                } else if (_state.viewId === "auto_run_dow_params") {
                    // LEFT/RIGHT work on Days (when in days edit mode) and on lines (when editing times or not editing)
                    if (_state.autoRunDow.selectedIndex === -1) {
                        // Days selected - check if in days edit mode
                        const line = _state.autoRunDow.lines[0];
                        if (line.editMode === "days" && line.editDayIndex !== null && line.editDayIndex !== undefined) {
                            // In days edit mode - LEFT arrow: move to previous day or Line 2
                            const currentDayIndex = line.editDayIndex;
                            if (currentDayIndex === 0) {
                                // At Sunday (first day) - move back to "Days" selection (exit days edit mode)
                                line.editMode = null;
                                line.editDayIndex = null;
                                console.log(`[AUTO RUN DOW] LEFT: At Sunday, moved back to Days selection`);
                            } else {
                                // Move to previous day
                                const newDayIndex = currentDayIndex - 1;
                                line.editDayIndex = newDayIndex;
                                console.log(`[AUTO RUN DOW] LEFT: Moved to day index ${newDayIndex} (${["S", "M", "T", "W", "T", "F", "S"][newDayIndex]})`);
                            }
                            _emit();
                        } else {
                            // Days selected but not in edit mode - LEFT moves to Line 2 (wrap backward)
                            _state.autoRunDow.selectedIndex = 1;
                            console.log(`[AUTO RUN DOW] LEFT: Days selected, moved to Line 2 (wrapping)`);
                            _emit();
                        }
                    } else if (_state.autoRunDow.selectedIndex === 0 || _state.autoRunDow.selectedIndex === 1) {
                        // Line 1 or 2 selected - check if in time edit mode
                        const line = _state.autoRunDow.lines[_state.autoRunDow.selectedIndex];
                        console.log(`[AUTO RUN DOW] LEFT: Line ${_state.autoRunDow.selectedIndex + 1} selected, editMode=${line.editMode}, editSubField=${line.editSubField}, enabled=${line.enabled}`);
                        if (line.editMode === "startTime" || line.editMode === "stopTime") {
                            // In time edit mode - LEFT arrow: move backward through the flow (reverse of ENTER)
                            console.log(`[AUTO RUN DOW] LEFT: In time edit mode, processing time field navigation`);
                            if (line.editSubField === "hour") {
                                // Move to previous time field
                                if (line.editMode === "stopTime") {
                                    // Stop time hour → Start time second
                                    line.editMode = "startTime";
                                    line.editSubField = "second";
                                    console.log(`[AUTO RUN DOW] LEFT: Moved to start time second`);
                                } else if (line.editMode === "startTime" && _state.autoRunDow.selectedIndex === 1) {
                                    // Line 2 start time hour → Line 1 stop time second
                                    const line1 = _state.autoRunDow.lines[0];
                                    line1.editMode = "stopTime";
                                    line1.editSubField = "second";
                                    // Clear line 2 edit mode
                                    line.editMode = null;
                                    line.editSubField = null;
                                    // Switch to line 1
                                    _state.autoRunDow.selectedIndex = 0;
                                    console.log(`[AUTO RUN DOW] LEFT: Moved to Line 1 stop time second`);
                                } else {
                                    // Line 1 start time hour → can't go backward, do nothing
                                    console.log(`[AUTO RUN DOW] LEFT: At Line 1 start time hour, no action`);
                                }
                            } else if (line.editSubField === "minute") {
                                // Minute → Hour
                                line.editSubField = "hour";
                                console.log(`[AUTO RUN DOW] LEFT: Moved to ${line.editMode} hour`);
                            } else if (line.editSubField === "second") {
                                // Second → Minute
                                line.editSubField = "minute";
                                console.log(`[AUTO RUN DOW] LEFT: Moved to ${line.editMode} minute`);
                            }
                            _emit();
                        } else if (line.enabled && (line.startTime || line.stopTime)) {
                            // Line has times showing - LEFT/RIGHT should cycle through time numbers
                            // Enter edit mode at start time hour if not already editing
                            if (!line.editMode) {
                                line.editMode = "startTime";
                                line.editSubField = "hour";
                                console.log(`[AUTO RUN DOW] LEFT: Line ${_state.autoRunDow.selectedIndex + 1} has times, entered start time edit mode (hour)`);
                                _emit();
                            }
                        } else {
                            // Line selected but not enabled (no times) - LEFT/RIGHT wrap between Days → Line 1 → Line 2
                            if (_state.autoRunDow.selectedIndex === 0) {
                                // Line 1 - LEFT moves to Saturday (last day)
                                const line1 = _state.autoRunDow.lines[0];
                                line1.editMode = "days";
                                line1.editDayIndex = 6; // Saturday (last day)
                                _state.autoRunDow.selectedIndex = -1; // Move to Days
                                console.log(`[AUTO RUN DOW] LEFT: Line 1, moved to Saturday (wrapping)`);
                                _emit();
                            } else if (_state.autoRunDow.selectedIndex === 1) {
                                // Line 2 - LEFT moves to Line 1
                                _state.autoRunDow.selectedIndex = 0;
                                console.log(`[AUTO RUN DOW] LEFT: Line 2, moved to Line 1`);
                                _emit();
                            }
                        }
                    }
                } else if (_state.viewId === "auto_run_date_params") {
                    const line = _state.autoRunDate.lines[_state.autoRunDate.selectedIndex];
                    if (line.editMode === "date") {
                        // LEFT arrow: move to previous subfield (D → Y → M → D)
                        // Order is: day → month → year → startTime
                        if (line.editSubField === "day") {
                            line.editSubField = "year"; // Wrap back to year
                        } else if (line.editSubField === "month") {
                            line.editSubField = "day";
                        } else if (line.editSubField === "year") {
                            line.editSubField = "month";
                        }
                        console.log(`[AUTO RUN DATE] LEFT: Moved to date.${line.editSubField}`);
                        _emit();
                    } else if (line.editMode === "startTime" || line.editMode === "stopTime") {
                        // LEFT arrow: move to previous subfield (H → S → M → H), or move to previous time field
                        if (line.editSubField === "hour") {
                            // If at hour, move to previous time field or date
                            if (line.editMode === "startTime") {
                                // Move back to date (day)
                                line.editMode = "date";
                                line.editSubField = "day";
                                console.log(`[AUTO RUN DATE] LEFT: Moved from startTime to date.day`);
                            } else if (line.editMode === "stopTime") {
                                // Move back to startTime (second)
                                line.editMode = "startTime";
                                line.editSubField = "second";
                                console.log(`[AUTO RUN DATE] LEFT: Moved from stopTime to startTime.second`);
                            }
                        } else if (line.editSubField === "minute") {
                            line.editSubField = "hour";
                        } else if (line.editSubField === "second") {
                            line.editSubField = "minute";
                        }
                        if (line.editMode === "startTime" || line.editMode === "stopTime") {
                            console.log(`[AUTO RUN DATE] LEFT: Moved to ${line.editMode}.${line.editSubField}`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_level_triggered_params") {
                    // LEFT arrow: navigate LEVEL backwards (lower → upper → title → stops at title, no wrap)
                    if (_state.autoRunLevelTriggered.selectedIndex === 4) { // LEVEL selected
                        const currentLevelFocus = _state.autoRunLevelTriggered.levelFocus || "title";
                        if (currentLevelFocus === "lower") {
                            // From lower → upper
                            _state.autoRunLevelTriggered.levelFocus = "upper";
                            _state.autoRunLevelTriggered.editingLevel = true;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEFT: Moved from lower to upper column`);
                        } else if (currentLevelFocus === "upper") {
                            // From upper → title
                            _state.autoRunLevelTriggered.levelFocus = "title";
                            _state.autoRunLevelTriggered.editingLevel = false;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEFT: Moved from upper to LEVEL title`);
                        } else {
                            // From title → nothing happens (stops here, no wrap)
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEFT: Already at LEVEL title, nothing happens`);
                        }
                    } else if (_state.autoRunLevelTriggered.selectedIndex === 3) { // SOURCE selected
                        const currentFocus = _state.autoRunLevelTriggered.sourceFocus || "title";
                        if (currentFocus === "stop") {
                            // From stop → run
                            _state.autoRunLevelTriggered.sourceFocus = "run";
                            _state.autoRunLevelTriggered.editingSource = true;
                            _state.autoRunLevelTriggered.sourceSide = "run";
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEFT: Moved from stop to run column`);
                        } else if (currentFocus === "run") {
                            // From run → SOURCE title
                            _state.autoRunLevelTriggered.sourceFocus = "title";
                            _state.autoRunLevelTriggered.editingSource = false;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEFT: Moved from run to SOURCE title`);
                        } else {
                            // From SOURCE title → nothing happens (stops here, no wrap)
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEFT: Already at SOURCE title, nothing happens`);
                        }
                    }
                    _emit();
                } else if (_state.viewId === "digital_out_menu") {
                    const item = _state.digitalOut.items[_state.digitalOut.selectedIndex];
                    if (_state.digitalOut.editing && item.title && item.title.startsWith("LOGIC")) {
                        // LEFT arrow: move editing position left (0 → 2 → 1 → 0)
                        const pos = item.editingPosition || 0;
                        item.editingPosition = (pos + 2) % 3; // 0→2, 1→0, 2→1 (effectively -1 mod 3)
                        console.log(`[DIGITAL OUT] ${item.title}: Moved LEFT to position ${item.editingPosition}`);
                        _emit();
                    } else if (_state.digitalOut.editing && item.title && (item.title === "OUTPUT 2" || item.title === "OUTPUT 3")) {
                        // LEFT arrow: exit edit mode for OUTPUT 2-3
                        _state.digitalOut.editing = false;
                        _state.digitalOut.focus = "title";
                        console.log(`[DIGITAL OUT] ${item.title}: Exited edit mode`);
                        _emit();
                    }
                }
                break;

            case "RIGHT":
                if (isSlm()) {
                    // RIGHT arrow: navigate to next page (1 → 2 → 3 → 4 → 1)
                    console.log('[FSM] RIGHT: Navigating SLM pages, current page:', _state.slm.page);
                    _state.slm.page = _state.slm.page < 4 ? _state.slm.page + 1 : 1;
                    console.log('[FSM] RIGHT: New page:', _state.slm.page);
                    // Always use running version of viewId - icon will show correct state dynamically
                    let viewId = _getSlmViewId();
                    _state.viewId = _normalizeSlmViewId(viewId);
                    console.log('[FSM] RIGHT: New viewId:', _state.viewId);
                    _emit();
                    return;
                }
                if (_state.viewId === "display_menu" && _state.display.editing && _state.menu.selectedIndex === 2 && _state.display.focus === "value") {
                    // RIGHT arrow: increase contrast by one segment (add one filled box)
                    // Each segment represents 100/15 ≈ 6.67 contrast units
                    const currentSegments = Math.round((_state.display.contrast / 100) * 15);
                    const newSegments = Math.min(15, currentSegments + 1);
                    _state.display.contrast = Math.round((newSegments / 15) * 100);
                    console.log(`[CONTRAST] RIGHT: ${currentSegments} segments → ${newSegments} segments (contrast: ${_state.display.contrast})`);
                    _emit();
                } else if (_state.meterSet.editing && (_state.viewId === "meter_set_menu" || _state.viewId === "meter_set_edit")) {
                    if (_state.meterSet.focus === "title") {
                        _state.meterSet.focus = "value";
                        _emit();
                    }
                } else if (_state.viewId === "sig_input_menu") {
                    if (_state.sigInput.editing && _state.sigInput.focus === "title") {
                        // RIGHT arrow switches from title to value (already in edit mode)
                        _state.sigInput.focus = "value";
                        console.log(`[SIG INPUT] RIGHT: Switched focus to value`);
                        _emit();
                    } else if (!_state.sigInput.editing) {
                        // RIGHT arrow enters edit mode and focuses on value
                        _state.sigInput.editing = true;
                        _state.sigInput.focus = "value";
                        console.log(`[SIG INPUT] RIGHT: Entered edit mode`);
                        _emit();
                    }
                } else if (_state.viewId === "logging_menu") {
                    // RIGHT arrow: only works in Meter 1 edit mode, does nothing in Meter 2
                    if (_state.logging.meter === "meter1" && _state.logging.editing && _state.logging.focus === "title") {
                        // RIGHT arrow switches from title to value (already in edit mode)
                        _state.logging.focus = "value";
                        _emit();
                    } else if (_state.logging.meter === "meter1" && !_state.logging.editing) {
                        // RIGHT arrow: enter edit mode and focus on value
                        const item = _state.logging.items[_state.logging.selectedIndex];
                        if (item.title === "L1" || item.title === "L2" || item.title === "INTERVAL") {
                            _state.logging.editing = true;
                            _state.logging.focus = "value";
                            console.log(`[LOGGING] RIGHT: Entered edit mode for ${item.title}`);
                            _emit();
                        }
                    }
                    // In Meter 2, RIGHT does nothing
                } else if (_state.viewId === "datetime_menu" && _state.datetime.editing) {
                    // RIGHT arrow: move to next subfield
                    const currentSubField = _state.datetime.editSubField;
                    if (_state.datetime.editField === "time") {
                        // Time subfields: hour → minute → second → hour
                        if (currentSubField === "hour") {
                            _state.datetime.editSubField = "minute";
                        } else if (currentSubField === "minute") {
                            _state.datetime.editSubField = "second";
                        } else if (currentSubField === "second") {
                            _state.datetime.editSubField = "hour";
                        }
                    } else if (_state.datetime.editField === "year" || _state.datetime.editField === "month" || _state.datetime.editField === "day") {
                        // Date subfields cycle: year → month → day → year
                        if (currentSubField === "year") {
                            _state.datetime.editSubField = "month";
                        } else if (currentSubField === "month") {
                            _state.datetime.editSubField = "day";
                        } else if (currentSubField === "day") {
                            _state.datetime.editSubField = "year";
                        }
                    }
                    console.log(`[DATETIME] RIGHT: Moved to subfield ${_state.datetime.editSubField}`);
                    _emit();
                } else if (_state.viewId === "auto_run_timed_run_params" && _state.autoRunTimedRun.editing) {
                    // RIGHT arrow: move to next subfield (H → M → S → H)
                    const currentSubField = _state.autoRunTimedRun.editSubField;
                    if (currentSubField === "hour") {
                        _state.autoRunTimedRun.editSubField = "minute";
                    } else if (currentSubField === "minute") {
                        _state.autoRunTimedRun.editSubField = "second";
                    } else if (currentSubField === "second") {
                        _state.autoRunTimedRun.editSubField = "hour";
                    }
                    console.log(`[AUTO RUN TIMED RUN] RIGHT: Moved to subfield ${_state.autoRunTimedRun.editSubField}`);
                    _emit();
                } else if (_state.viewId === "auto_run_dow_params") {
                    // RIGHT works on Days (when in days edit mode) and on lines (when editing times or not editing)
                    if (_state.autoRunDow.selectedIndex === -1) {
                        // Days selected - check if in days edit mode
                        const line = _state.autoRunDow.lines[0];
                        if (line.editMode === "days" && line.editDayIndex !== null && line.editDayIndex !== undefined) {
                            // In days edit mode - RIGHT arrow: move to next day (same as ENTER)
                            const currentDayIndex = line.editDayIndex;
                            if (currentDayIndex === 6) {
                                // At Saturday (last day) - move to line 1 (wrapping)
                                line.editMode = null;
                                line.editDayIndex = null;
                                _state.autoRunDow.selectedIndex = 0; // Move to line 1
                                console.log(`[AUTO RUN DOW] RIGHT: At Saturday, moved to Line 1 (wrapping)`);
                            } else {
                                // Move to next day
                                const newDayIndex = currentDayIndex + 1;
                                line.editDayIndex = newDayIndex;
                                console.log(`[AUTO RUN DOW] RIGHT: Moved to day index ${newDayIndex} (${["S", "M", "T", "W", "T", "F", "S"][newDayIndex]})`);
                            }
                            _emit();
                        } else {
                            // Days selected but not in edit mode - RIGHT moves to first day (Sunday) and enters days edit mode
                            line.editMode = "days";
                            line.editDayIndex = 0; // Start at first day (Sunday)
                            console.log(`[AUTO RUN DOW] RIGHT: Days selected, entered days edit mode (Sunday highlighted)`);
                            _emit();
                        }
                    } else if (_state.autoRunDow.selectedIndex === 0 || _state.autoRunDow.selectedIndex === 1) {
                        // Line 1 or 2 selected - check if in time edit mode
                        const line = _state.autoRunDow.lines[_state.autoRunDow.selectedIndex];
                        console.log(`[AUTO RUN DOW] RIGHT: Line ${_state.autoRunDow.selectedIndex + 1} selected, editMode=${line.editMode}, editSubField=${line.editSubField}, enabled=${line.enabled}`);
                        if (line.editMode === "startTime" || line.editMode === "stopTime") {
                            // In time edit mode - RIGHT arrow: move forward through the flow (same as ENTER)
                            console.log(`[AUTO RUN DOW] RIGHT: In time edit mode, processing time field navigation`);
                            if (line.editSubField === "hour") {
                                // Hour → Minute
                                line.editSubField = "minute";
                                console.log(`[AUTO RUN DOW] RIGHT: Moved to ${line.editMode} minute`);
                            } else if (line.editSubField === "minute") {
                                // Minute → Second
                                line.editSubField = "second";
                                console.log(`[AUTO RUN DOW] RIGHT: Moved to ${line.editMode} second`);
                            } else if (line.editSubField === "second") {
                                // Move to next time field, matching ENTER behavior
                                if (line.editMode === "startTime") {
                                    // Move to stop time hour (same line)
                                    line.editMode = "stopTime";
                                    line.editSubField = "hour";
                                    console.log(`[AUTO RUN DOW] RIGHT: Line ${_state.autoRunDow.selectedIndex + 1} start time finished, moved to stop time hour`);
                                } else if (line.editMode === "stopTime") {
                                    // Move to next line or Days
                                    if (_state.autoRunDow.selectedIndex === 0) {
                                        // Line 1: Move to Line 2's start hour
                                        _state.autoRunDow.selectedIndex = 1;
                                        const line2 = _state.autoRunDow.lines[1];
                                        // Enable line 2 if not enabled
                                        if (!line2.enabled) {
                                            line2.enabled = true;
                                            line2.startTime = { hour: 0, minute: 0, second: 0 };
                                            line2.stopTime = { hour: 0, minute: 0, second: 0 };
                                        }
                                        line2.editMode = "startTime";
                                        line2.editSubField = "hour";
                                        // Exit edit mode for line 1
                                        line.editMode = null;
                                        line.editSubField = null;
                                        console.log(`[AUTO RUN DOW] RIGHT: Line 1 stop time finished, moved to Line 2 start hour`);
                                    } else if (_state.autoRunDow.selectedIndex === 1) {
                                        // Line 2: Exit edit mode and move to Days
                                        line.editMode = null;
                                        line.editSubField = null;
                                        line.editDayIndex = null;
                                        _state.autoRunDow.selectedIndex = -1; // Move to Days
                                        console.log(`[AUTO RUN DOW] RIGHT: Line 2 stop time finished, moved to Days`);
                                    }
                                }
                            }
                            _emit();
                        } else if (line.enabled && (line.startTime || line.stopTime)) {
                            // Line has times showing - LEFT/RIGHT should cycle through time numbers
                            // Enter edit mode at start time hour if not already editing
                            if (!line.editMode) {
                                line.editMode = "startTime";
                                line.editSubField = "hour";
                                console.log(`[AUTO RUN DOW] RIGHT: Line ${_state.autoRunDow.selectedIndex + 1} has times, entered start time edit mode (hour)`);
                                _emit();
                            }
                        } else {
                            // Line selected but not enabled (no times) - LEFT/RIGHT wrap between Days → Line 1 → Line 2
                            if (_state.autoRunDow.selectedIndex === 0) {
                                // Line 1 - RIGHT moves to Line 2
                                _state.autoRunDow.selectedIndex = 1;
                                console.log(`[AUTO RUN DOW] RIGHT: Line 1, moved to Line 2`);
                                _emit();
                            } else if (_state.autoRunDow.selectedIndex === 1) {
                                // Line 2 - RIGHT moves to Days (wrapping)
                                _state.autoRunDow.selectedIndex = -1;
                                console.log(`[AUTO RUN DOW] RIGHT: Line 2, moved to Days (wrapping)`);
                                _emit();
                            }
                        }
                    }
                } else if (_state.viewId === "auto_run_date_params") {
                    const line = _state.autoRunDate.lines[_state.autoRunDate.selectedIndex];
                    if (line.editMode === "date") {
                        // RIGHT arrow: move to next subfield (D → M → Y → startTime)
                        // Order is: day → month → year → startTime
                        if (line.editSubField === "day") {
                            line.editSubField = "month";
                        } else if (line.editSubField === "month") {
                            line.editSubField = "year";
                        } else if (line.editSubField === "year") {
                            // Move to startTime edit mode
                            line.editMode = "startTime";
                            line.editSubField = "hour";
                            console.log(`[AUTO RUN DATE] RIGHT: Moved from date.year to startTime.hour`);
                        }
                        console.log(`[AUTO RUN DATE] RIGHT: Moved to ${line.editMode}.${line.editSubField}`);
                        _emit();
                    } else if (line.editMode === "startTime" || line.editMode === "stopTime") {
                        // RIGHT arrow: move to next subfield (H → M → S), or move to next time field
                        if (line.editSubField === "hour") {
                            line.editSubField = "minute";
                            console.log(`[AUTO RUN DATE] RIGHT: Moved to ${line.editMode} minute`);
                        } else if (line.editSubField === "minute") {
                            line.editSubField = "second";
                            console.log(`[AUTO RUN DATE] RIGHT: Moved to ${line.editMode} second`);
                        } else if (line.editSubField === "second") {
                            // Move to next time field
                            if (line.editMode === "startTime") {
                                // Move to stopTime hour
                                line.editMode = "stopTime";
                                line.editSubField = "hour";
                                console.log(`[AUTO RUN DATE] RIGHT: Moved from startTime to stopTime hour`);
                            } else if (line.editMode === "stopTime") {
                                // At stopTime second - exit edit mode and disable line (show ---OFF---)
                                line.editMode = null;
                                line.editSubField = null;
                                line.enabled = false;
                                console.log(`[AUTO RUN DATE] RIGHT: Exited edit mode, line disabled`);
                            }
                        }
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_level_triggered_params") {
                    // RIGHT arrow: navigate LEVEL forward (title → upper → lower → title, wraps)
                    if (_state.autoRunLevelTriggered.selectedIndex === 4) { // LEVEL selected
                        const currentLevelFocus = _state.autoRunLevelTriggered.levelFocus || "title";
                        if (currentLevelFocus === "title") {
                            // From title → upper
                            _state.autoRunLevelTriggered.levelFocus = "upper";
                            _state.autoRunLevelTriggered.editingLevel = true;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] RIGHT: Moved to upper column`);
                        } else if (currentLevelFocus === "upper") {
                            // From upper → lower
                            _state.autoRunLevelTriggered.levelFocus = "lower";
                            console.log(`[AUTO RUN LEVEL TRIGGERED] RIGHT: Moved to lower column`);
                        } else {
                            // From lower → title (wraps)
                            _state.autoRunLevelTriggered.levelFocus = "title";
                            _state.autoRunLevelTriggered.editingLevel = false;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] RIGHT: Wrapped to LEVEL title`);
                        }
                    } else if (_state.autoRunLevelTriggered.selectedIndex === 3) { // SOURCE selected
                        const currentFocus = _state.autoRunLevelTriggered.sourceFocus || "title";
                        if (currentFocus === "title") {
                            // From title → run
                            _state.autoRunLevelTriggered.sourceFocus = "run";
                            _state.autoRunLevelTriggered.editingSource = true;
                            _state.autoRunLevelTriggered.sourceSide = "run";
                            console.log(`[AUTO RUN LEVEL TRIGGERED] RIGHT: Moved to run column`);
                        } else if (currentFocus === "run") {
                            // From run → stop
                            _state.autoRunLevelTriggered.sourceFocus = "stop";
                            _state.autoRunLevelTriggered.editingSource = true;
                            _state.autoRunLevelTriggered.sourceSide = "stop";
                            console.log(`[AUTO RUN LEVEL TRIGGERED] RIGHT: Moved to stop column`);
                        } else {
                            // From stop → title (wraps)
                            _state.autoRunLevelTriggered.sourceFocus = "title";
                            _state.autoRunLevelTriggered.editingSource = false;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] RIGHT: Wrapped to SOURCE title`);
                        }
                    }
                    _emit();
                } else if (_state.viewId === "digital_out_menu") {
                    const item = _state.digitalOut.items[_state.digitalOut.selectedIndex];
                    if (_state.digitalOut.editing && item.title && item.title.startsWith("LOGIC")) {
                        // RIGHT arrow: move editing position right (0 → 1 → 2 → 0)
                        const pos = item.editingPosition || 0;
                        item.editingPosition = (pos + 1) % 3;
                        console.log(`[DIGITAL OUT] ${item.title}: Moved RIGHT to position ${item.editingPosition}`);
                        _emit();
                    } else if (_state.digitalOut.editing && item.title && (item.title === "OUTPUT 2" || item.title === "OUTPUT 3")) {
                        // RIGHT arrow: already in edit mode for OUTPUT 2-3, do nothing
                    } else if (!_state.digitalOut.editing && item.title && (item.title === "OUTPUT 2" || item.title === "OUTPUT 3")) {
                        // RIGHT arrow: enter edit mode for OUTPUT 2-3 if not already editing
                        if (item.value === "dB") {
                            _state.digitalOut.editing = true;
                            _state.digitalOut.focus = "value";
                            console.log(`[DIGITAL OUT] ${item.title}: Entered edit mode`);
                            _emit();
                        }
                    }
                }
                break;

            case "ENTER":
                if (_state.viewId === "stop_confirm") {
                    // Cancel stop confirmation
                    _clearTimer('stopHold');
                    _state.viewId = _state.measurement.state === "running" ? "slm_home" : "slm_home_paused";
                    _emit();
                } else if (_state.viewId === "slm_view_menu") {
                    const item = SLM_VIEW_ITEMS[_state.menu.selectedIndex];
                    if (item === "VIEW PAST STUDIES") {
                        // Do nothing - no action for VIEW PAST STUDIES
                        // Toast disabled - user cannot test on actual device
                        // _showToast("No studies yet");
                        return; // Explicitly do nothing
                    } else if (item === "VIEW CURRENT STUDY") {
                        // Preserve measurement state when returning to home
                        // Only show home_screen_running if measurement is running or paused
                        if (_state.measurement.state === "running" || _state.measurement.state === "paused") {
                            _state.viewId = "home_screen_running";
                        } else {
                            _state.viewId = _state.backlight ? "home_screen" : "home_screen_dim";
                        }
                        _emit();
                    } else if (item === "VIEW SESSION") {
                        // Preserve measurement state when entering SLM from view menu
                        // Always use running version of viewId - icon will show correct state dynamically
                        let viewId = _getSlmViewId();
                        _state.viewId = _normalizeSlmViewId(viewId);
                        _emit();
                    }
                } else if (_state.viewId === "setup_menu") {
                    const item = SETUP_MENU_ITEMS[_state.menu.selectedIndex];
                    if (item === "METER SET") {
                        _pushHistory("meter_set_menu");
                        _state.viewId = "meter_set_menu";
                        _state.meterSet.selectedIndex = 0;
                        _state.meterSet.focus = "title"; // Start with title focus (not editing)
                        _state.meterSet.editing = false; // Ensure not editing initially
                        _emit();
                    } else if (item === "MEASURE") {
                        _pushHistory("measure_menu");
                        _state.viewId = "measure_menu";
                        _emit();
                    } else if (item === "AUTO RUN") {
                        _pushHistory("auto_run_menu");
                        _state.viewId = "auto_run_menu";
                        _state.autoRun.selectedIndex = 0;
                        _state.autoRun.focus = "title";
                        _state.autoRun.editing = false;
                        _emit();
                    } else if (item === "DATETIME") {
                        _pushHistory("datetime_menu");
                        _state.viewId = "datetime_menu";
                        _state.datetime.selectedIndex = 0;
                        _state.datetime.editing = false;
                        _state.datetime.editField = null;
                        _state.datetime.editSubField = null;
                        _emit();
                    } else if (item === "DIGITAL OUT") {
                        _pushHistory("digital_out_menu");
                        _state.viewId = "digital_out_menu";
                        _state.digitalOut.selectedIndex = 0;
                        _state.digitalOut.editing = false;
                        _state.digitalOut.focus = "title";
                        _emit();
                    } else if (item === "OPTIONS") {
                        _pushHistory("options_menu");
                        _state.viewId = "options_menu";
                        _emit();
                    } else if (item === "SIG INPUT") {
                        _pushHistory("sig_input_menu");
                        _state.viewId = "sig_input_menu";
                        _state.sigInput.selectedIndex = 0;
                        _state.sigInput.focus = "title";
                        _state.sigInput.editing = false;
                        _emit();
                    } else if (item === "LOGGING") {
                        _pushHistory("logging_menu");
                        _state.viewId = "logging_menu";
                        _state.logging.selectedIndex = 0;
                        _state.logging.focus = "title";
                        _state.logging.editing = false;
                        _emit();
                    } else if (item === "COMM-SET") {
                        _pushHistory("comms_menu");
                        _state.viewId = "comms_menu";
                        _state.menu.selectedIndex = 0;
                        _emit();
                    } else if (item === "BATTERY") {
                        _pushHistory("battery_menu");
                        _state.viewId = "battery_menu";
                        _emit();
                    } else if (item === "DISPLAY") {
                        _pushHistory("display_menu");
                        _state.viewId = "display_menu";
                        _state.menu.selectedIndex = 0;
                        _emit();
                    }
                } else if (_state.viewId === "meter_set_menu") {
                    if (_state.meterSet.editing) {
                        // Already editing - handle save/cancel/toggle
                        if (_state.meterSet.focus === "title") {
                            // Save and exit edit mode
                            _state.meterSet.editing = false;
                            _state.meterSet.focus = "title";
                            _emit();
                        } else if (_state.meterSet.focus === "value") {
                            // ENTER on value field toggles between value and "off" (for THRESHOLD and similar items)
                            const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                            if (item.enabled !== undefined) {
                                // Toggle enabled/off state
                                item.enabled = false;
                                _state.meterSet.focus = "off";
                                _emit();
                            } else {
                                // If no enabled property, move focus to title (ready to save)
                                _state.meterSet.focus = "title";
                                _emit();
                            }
                        } else if (_state.meterSet.focus === "off") {
                            // ENTER on "off" switches back to value field
                            const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                            if (item.enabled !== undefined) {
                                item.enabled = true; // Switch back to value
                                _state.meterSet.focus = "value";
                                _emit();
                            }
                        }
                    } else {
                        // Not editing yet - ENTER switches focus from title to value and enters edit mode
                        if (_state.meterSet.focus === "title" || !_state.meterSet.focus) {
                            // Switch to value editing
                            _state.meterSet.editing = true;
                            const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                            // If item is disabled (off), focus on "off", otherwise focus on "value"
                            _state.meterSet.focus = (item.enabled === false) ? "off" : "value";
                            _emit();
                        }
                    }
                } else if (_state.viewId === "meter_set_edit") {
                    // Legacy support for meter_set_edit view (for backwards compatibility)
                    if (_state.meterSet.focus === "value") {
                        _state.meterSet.focus = "title";
                        _emit();
                    } else if (_state.meterSet.focus === "title") {
                        _state.meterSet.editing = false;
                        _state.meterSet.focus = "title";
                        _state.viewId = "meter_set_menu";
                        _emit();
                    }
                } else if (_state.viewId === "measure_menu") {
                    const item = _state.measure.items[_state.measure.selectedIndex];
                    // Special handling for Lc-a.: ENTER does nothing, stays as N/A
                    if (item.title === "Lc-a.") {
                        // Do nothing - Lc-a. stays as N/A
                        console.log(`[MEASURE] ENTER: ${item.title} - no action (stays as N/A)`);
                        _state.measure.focus = "title";
                        _state.measure.editing = false;
                        _emit();
                    }
                    // Special handling for LDH, CHEL, and TAKTMX: ENTER cycles options without entering edit mode
                    else if (item.title === "LDH" || item.title === "CHEL") {
                        // Toggle between OFF and ON, keep title highlighted
                        if (item.value === "OFF") {
                            item.value = "ON";
                            console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (OFF → ON)`);
                        } else {
                            item.value = "OFF";
                            console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (ON → OFF)`);
                        }
                        // Keep focus on title (don't enter edit mode)
                        _state.measure.focus = "title";
                        _state.measure.editing = false;
                        _emit();
                    } else if (item.title === "TAKTMX") {
                        // Cycle through options: OFF → 1sec → 3sec → 5sec → 10sec → OFF, keep title highlighted
                        if (item.options && item.options.length > 0) {
                            const currentIdx = item.options.indexOf(item.value);
                            if (currentIdx !== -1) {
                                const newIdx = (currentIdx + 1) % item.options.length;
                                item.value = item.options[newIdx];
                                console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (cycle ${currentIdx} → ${newIdx})`);
                            } else {
                                // Value not found, default to first option
                                item.value = item.options[0];
                                console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (reset to first)`);
                            }
                        }
                        // Keep focus on title (don't enter edit mode)
                        _state.measure.focus = "title";
                        _state.measure.editing = false;
                        _emit();
                    } else if (_state.measure.editing && _state.measure.focus === "value") {
                        // ENTER on value: toggle between OFF and last number option (for items with OFF)
                        // Or cycle through options (for items without OFF)
                        if (item.options && item.options.length > 0) {
                            const hasOff = item.options.includes("OFF");
                            if (hasOff && item.value === "OFF") {
                                // Currently OFF, switch to last numeric value (or first if no last value stored)
                                if (item.lastValue && item.options.includes(item.lastValue)) {
                                    item.value = item.lastValue;
                                    console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (OFF → last value ${item.lastValue})`);
                                } else {
                                    const firstNonOff = item.options.find(opt => opt !== "OFF");
                                    if (firstNonOff) {
                                        item.value = firstNonOff;
                                        console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (OFF → first number)`);
                                    }
                                }
                            } else if (hasOff && item.value !== "OFF") {
                                // Currently a number, save it and switch to OFF
                                item.lastValue = item.value; // Remember the last numeric value
                                item.value = "OFF";
                                console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (${item.lastValue} → OFF)`);
                            } else {
                                // No OFF option, cycle through options
                                const currentIdx = item.options.indexOf(item.value);
                                if (currentIdx !== -1) {
                                    const newIdx = (currentIdx + 1) % item.options.length;
                                    item.value = item.options[newIdx];
                                    console.log(`[MEASURE] ENTER: ${item.title} = ${item.value} (cycle ${currentIdx} → ${newIdx})`);
                                }
                            }
                            _emit();
                        }
                    } else {
                        // Not editing yet - ENTER switches focus from title to value and enters edit mode
                        if (_state.measure.focus === "title" || !_state.measure.focus) {
                            // Switch to value editing
                            _state.measure.editing = true;
                            _state.measure.focus = "value";
                            _emit();
                        }
                    }
                } else if (_state.viewId === "display_language") {
                    // ENTER on language selection saves and returns to display menu
                    const LANGUAGE_OPTIONS = ["ENGLISH", "FRANÇAIS", "ESPAÑOL", "PORTUGUESE", "ITALIANO", "DEUTSCH"];
                    _state.display.language = LANGUAGE_OPTIONS[_state.display.languageIndex];
                    const previousView = _popHistory() || "display_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "display_menu") {
                    const item = DISPLAY_MENU_ITEMS[_state.menu.selectedIndex];
                    if (item === "LANGUAGE") {
                        _pushHistory("display_language");
                        _state.viewId = "display_language";
                        // Initialize languageIndex based on current language
                        const LANGUAGE_OPTIONS = ["ENGLISH", "FRANÇAIS", "ESPAÑOL", "PORTUGUESE", "ITALIANO", "DEUTSCH"];
                        _state.display.languageIndex = LANGUAGE_OPTIONS.indexOf(_state.display.language);
                        if (_state.display.languageIndex === -1) {
                            _state.display.languageIndex = 0; // Default to ENGLISH if not found
                        }
                        _emit();
                    } else if (item === "BACKLIGHT") {
                        if (_state.display.editing && _state.display.focus === "value") {
                            // ENTER on BACKLIGHT value: toggle between MANUAL and time mode
                            if (_state.display.backlightMode === "MANUAL") {
                                // Switch from MANUAL to default time (10 sec)
                                _state.display.backlightMode = _state.display.backlightTime || 10;
                            } else {
                                // Switch from time value back to MANUAL
                                _state.display.backlightMode = "MANUAL";
                            }
                            _emit();
                        } else {
                            // ENTER on BACKLIGHT title: enter edit mode, focus on value
                            _state.display.editing = true;
                            _state.display.focus = "value";
                            _emit();
                        }
                    } else if (item === "CONTRAST") {
                        if (_state.display.editing && _state.menu.selectedIndex === 2 && _state.display.focus === "value") {
                            // ENTER on CONTRAST value: exit edit mode (save)
                            _state.display.editing = false;
                            _state.display.focus = "title";
                            _emit();
                        } else {
                            // ENTER on CONTRAST title: enter edit mode, focus on value
                            _state.display.editing = true;
                            _state.display.focus = "value";
                            _emit();
                        }
                    }
                } else if (_state.viewId === "auto_run_timed_run_params") {
                    if (_state.autoRunTimedRun.editing) {
                        // ENTER cycles between H/M/S subfields
                        const currentSubField = _state.autoRunTimedRun.editSubField;
                        if (currentSubField === "hour") {
                            _state.autoRunTimedRun.editSubField = "minute";
                        } else if (currentSubField === "minute") {
                            _state.autoRunTimedRun.editSubField = "second";
                        } else if (currentSubField === "second") {
                            // Exit edit mode when cycling back to hour
                            _state.autoRunTimedRun.editing = false;
                            _state.autoRunTimedRun.editSubField = "hour";
                            console.log(`[AUTO RUN TIMED RUN] ENTER: Exited edit mode`);
                        }
                        console.log(`[AUTO RUN TIMED RUN] ENTER: Moved to subfield ${_state.autoRunTimedRun.editSubField}`);
                        _emit();
                    } else {
                        // Enter edit mode, start with hour
                        _state.autoRunTimedRun.editing = true;
                        _state.autoRunTimedRun.editSubField = "hour";
                        console.log(`[AUTO RUN TIMED RUN] ENTER: Entered edit mode`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_dow_params") {
                    if (_state.autoRunDow.selectedIndex === -1) {
                        // Days selected - ENTER moves selection to first day (Sunday) and enters days edit mode
                        const line = _state.autoRunDow.lines[0]; // Default to line 1 for days editing
                        if (!line.editMode || line.editMode === null) {
                            // Enter days edit mode - move selection to first day (Sunday)
                            line.editMode = "days";
                            line.editDayIndex = 0; // Start at first day (Sunday)
                            // Keep selectedIndex at -1 to show "Days" is selected, but editDayIndex tracks which day is highlighted
                            console.log(`[AUTO RUN DOW] ENTER: Days selected, entered days edit mode (Sunday highlighted, day index: 0)`);
                            _emit();
                        } else if (line.editMode === "days") {
                            // In days edit mode - cycle to next day (S → M → T → W → T → F → S)
                            // If on Saturday (index 6), exit days edit mode and move to line 1
                            const currentDayIndex = line.editDayIndex !== null ? line.editDayIndex : 0;
                            if (currentDayIndex === 6) {
                                // On Saturday (last day) - exit days edit mode and move to line 1
                                line.editMode = null;
                                line.editDayIndex = null;
                                _state.autoRunDow.selectedIndex = 0; // Move to line 1
                                console.log(`[AUTO RUN DOW] ENTER: On Saturday, exited days edit mode and moved to line 1`);
                            } else {
                                // Not on Saturday - cycle to next day
                                line.editDayIndex = currentDayIndex + 1;
                                console.log(`[AUTO RUN DOW] ENTER: Moved to day index ${line.editDayIndex} (${["S", "M", "T", "W", "T", "F", "S"][line.editDayIndex]})`);
                            }
                            _emit();
                        }
                        // Note: When Days is selected (selectedIndex === -1), we only handle days edit mode
                        // Time editing is handled in the else block below when a line (0 or 1) is selected
                    } else {
                        // Line 1 or 2 is selected - ENTER does NOT enter days edit mode
                        // ENTER enters start time edit mode (or cycles through start time → stop time)
                        const line = _state.autoRunDow.lines[_state.autoRunDow.selectedIndex];
                        if (!line.editMode || line.editMode === null) {
                            // If line is disabled (---OFF---), enable it first and set default times
                            if (!line.enabled) {
                                line.enabled = true;
                                line.startTime = { hour: 0, minute: 0, second: 0 };
                                line.stopTime = { hour: 0, minute: 0, second: 0 };
                                console.log(`[AUTO RUN DOW] ENTER: Line ${_state.autoRunDow.selectedIndex + 1} was OFF, enabled with default times 00:00:00 - 00:00:00`);
                            }
                            // Enter start time edit mode (hour selected)
                            line.editMode = "startTime";
                            line.editSubField = "hour";
                            console.log(`[AUTO RUN DOW] ENTER: Line ${_state.autoRunDow.selectedIndex + 1} selected, entered start time edit mode (hour selected)`);
                        } else if (line.editMode === "startTime") {
                            // Cycle through start time subfields: hour → minute → second → stop time
                            if (line.editSubField === "hour") {
                                line.editSubField = "minute";
                                console.log(`[AUTO RUN DOW] ENTER: Moved to start time minute`);
                            } else if (line.editSubField === "minute") {
                                line.editSubField = "second";
                                console.log(`[AUTO RUN DOW] ENTER: Moved to start time second`);
                            } else if (line.editSubField === "second") {
                                // Move to stop time hour (same line)
                                line.editMode = "stopTime";
                                line.editSubField = "hour";
                                console.log(`[AUTO RUN DOW] ENTER: Line ${_state.autoRunDow.selectedIndex + 1} start time finished, moved to stop time hour`);
                            }
                        } else if (line.editMode === "stopTime") {
                            // Cycle through stop time subfields: hour → minute → second → next line or Days
                            if (line.editSubField === "hour") {
                                line.editSubField = "minute";
                                console.log(`[AUTO RUN DOW] ENTER: Moved to stop time minute`);
                            } else if (line.editSubField === "minute") {
                                line.editSubField = "second";
                                console.log(`[AUTO RUN DOW] ENTER: Moved to stop time second`);
                            } else if (line.editSubField === "second") {
                                // Move to next line or Days
                                if (_state.autoRunDow.selectedIndex === 0) {
                                    // Line 1: Move to Line 2's start hour
                                    _state.autoRunDow.selectedIndex = 1;
                                    const line2 = _state.autoRunDow.lines[1];
                                    // Enable line 2 if not enabled
                                    if (!line2.enabled) {
                                        line2.enabled = true;
                                        line2.startTime = { hour: 0, minute: 0, second: 0 };
                                        line2.stopTime = { hour: 0, minute: 0, second: 0 };
                                    }
                                    line2.editMode = "startTime";
                                    line2.editSubField = "hour";
                                    // Exit edit mode for line 1
                                    line.editMode = null;
                                    line.editSubField = null;
                                    console.log(`[AUTO RUN DOW] ENTER: Line 1 stop time finished, moved to Line 2 start hour`);
                                } else if (_state.autoRunDow.selectedIndex === 1) {
                                    // Line 2: Exit edit mode and move to Days
                                    line.editMode = null;
                                    line.editSubField = null;
                                    line.editDayIndex = null;
                                    _state.autoRunDow.selectedIndex = -1; // Move to Days
                                    console.log(`[AUTO RUN DOW] ENTER: Line 2 stop time finished, moved to Days`);
                                }
                            }
                        }
                        // Note: Days edit mode can only be entered when "Days" is highlighted (selectedIndex === -1)
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_date_params") {
                    const line = _state.autoRunDate.lines[_state.autoRunDate.selectedIndex];
                    console.log(`[AUTO RUN DATE] ENTER: Line ${_state.autoRunDate.selectedIndex + 1}, enabled=${line.enabled}, editMode=${line.editMode}, date=${line.date ? 'set' : 'null'}`);
                    // ENTER: Enable line if OFF, or enter/edit date/startTime/stopTime
                    if (!line.enabled) {
                        // Enable line and enter date edit mode
                        line.enabled = true;
                        line.editMode = "date";
                        line.editSubField = "day";
                        if (!line.date) {
                            const now = new Date();
                            line.date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
                        }
                        if (!line.startTime) {
                            line.startTime = { hour: 0, minute: 0, second: 0 };
                        }
                        if (!line.stopTime) {
                            line.stopTime = { hour: 0, minute: 0, second: 0 };
                        }
                        console.log(`[AUTO RUN DATE] ENTER: Enabled line ${_state.autoRunDate.selectedIndex + 1}, entered date edit mode (day selected)`);
                        _emit();
                    } else if (!line.editMode || line.editMode === null) {
                        // Line is enabled but not in edit mode - enter date edit mode
                        line.editMode = "date";
                        line.editSubField = "day";
                        if (!line.date) {
                            const now = new Date();
                            line.date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
                        }
                        console.log(`[AUTO RUN DATE] ENTER: Entered date edit mode (day selected)`);
                        _emit();
                    } else if (line.editMode === "date") {
                        // ENTER cycles between date subfields or switches to startTime mode
                        // Order: day → month → year → startTime
                        if (line.editSubField === "day") {
                            line.editSubField = "month";
                        } else if (line.editSubField === "month") {
                            line.editSubField = "year";
                        } else if (line.editSubField === "year") {
                            // Switch to startTime edit mode
                            line.editMode = "startTime";
                            line.editSubField = "hour";
                            console.log(`[AUTO RUN DATE] ENTER: Switched to startTime edit mode`);
                        }
                        _emit();
                    } else if (line.editMode === "startTime") {
                        // ENTER cycles between startTime subfields or switches to stopTime
                        if (line.editSubField === "hour") {
                            line.editSubField = "minute";
                        } else if (line.editSubField === "minute") {
                            line.editSubField = "second";
                        } else if (line.editSubField === "second") {
                            // Switch to stopTime edit mode
                            line.editMode = "stopTime";
                            line.editSubField = "hour";
                            console.log(`[AUTO RUN DATE] ENTER: Switched to stopTime edit mode`);
                        }
                        _emit();
                    } else if (line.editMode === "stopTime") {
                        // ENTER cycles between stopTime subfields or exits edit mode
                        if (line.editSubField === "hour") {
                            line.editSubField = "minute";
                        } else if (line.editSubField === "minute") {
                            line.editSubField = "second";
                        } else if (line.editSubField === "second") {
                            // Exit edit mode and disable line (show ---OFF---)
                            line.editMode = null;
                            line.editSubField = null;
                            line.enabled = false;
                            console.log(`[AUTO RUN DATE] ENTER: Exited edit mode, line disabled`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_level_triggered_params") {
                    const selectedIdx = _state.autoRunLevelTriggered.selectedIndex;
                    if (selectedIdx === 0) {
                        // MODE: Cycle LEVEL ON/OFF ↔ WINDOWED
                        _state.autoRunLevelTriggered.mode = _state.autoRunLevelTriggered.mode === "LEVEL ON/OFF" ? "WINDOWED" : "LEVEL ON/OFF";
                        // Update trigger based on mode + action
                        _updateLevelTriggeredTrigger();
                        console.log(`[AUTO RUN LEVEL TRIGGERED] MODE: ${_state.autoRunLevelTriggered.mode}`);
                    } else if (selectedIdx === 1) {
                        // ACTION: Cycle RUN/STOP ↔ RUN/PSE
                        _state.autoRunLevelTriggered.action = _state.autoRunLevelTriggered.action === "RUN/STOP" ? "RUN/PSE" : "RUN/STOP";
                        // Don't update trigger - TRIGGER only changes based on MODE, not ACTION
                        console.log(`[AUTO RUN LEVEL TRIGGERED] ACTION: ${_state.autoRunLevelTriggered.action}`);
                    } else if (selectedIdx === 3) {
                        // SOURCE: Cycle source value for current focus (run or stop)
                        const currentFocus = _state.autoRunLevelTriggered.sourceFocus || "title";
                        const SOURCE_RUN_OPTIONS = ["Meter1", "12.5Hz", "EXT", "Delay"];
                        const SOURCE_STOP_OPTIONS = ["Meter1", "12.5Hz", "EXT", "Timed"];
                        
                        if (currentFocus === "run") {
                            // Cycle run side options
                            const currentIdx = SOURCE_RUN_OPTIONS.indexOf(_state.autoRunLevelTriggered.sourceRun);
                            const nextIdx = (currentIdx + 1) % SOURCE_RUN_OPTIONS.length;
                            _state.autoRunLevelTriggered.sourceRun = SOURCE_RUN_OPTIONS[nextIdx];
                            _state.autoRunLevelTriggered.editingSource = true;
                            _state.autoRunLevelTriggered.sourceSide = "run";
                            console.log(`[AUTO RUN LEVEL TRIGGERED] SOURCE RUN: ${_state.autoRunLevelTriggered.sourceRun}`);
                        } else if (currentFocus === "stop") {
                            // Cycle stop side options
                            const currentIdx = SOURCE_STOP_OPTIONS.indexOf(_state.autoRunLevelTriggered.sourceStop);
                            const nextIdx = (currentIdx + 1) % SOURCE_STOP_OPTIONS.length;
                            _state.autoRunLevelTriggered.sourceStop = SOURCE_STOP_OPTIONS[nextIdx];
                            _state.autoRunLevelTriggered.editingSource = true;
                            _state.autoRunLevelTriggered.sourceSide = "stop";
                            console.log(`[AUTO RUN LEVEL TRIGGERED] SOURCE STOP: ${_state.autoRunLevelTriggered.sourceStop}`);
                        } else {
                            // If focus is on title, move to run side and cycle
                            _state.autoRunLevelTriggered.sourceFocus = "run";
                            _state.autoRunLevelTriggered.editingSource = true;
                            _state.autoRunLevelTriggered.sourceSide = "run";
                            const currentIdx = SOURCE_RUN_OPTIONS.indexOf(_state.autoRunLevelTriggered.sourceRun);
                            const nextIdx = (currentIdx + 1) % SOURCE_RUN_OPTIONS.length;
                            _state.autoRunLevelTriggered.sourceRun = SOURCE_RUN_OPTIONS[nextIdx];
                            console.log(`[AUTO RUN LEVEL TRIGGERED] SOURCE RUN: ${_state.autoRunLevelTriggered.sourceRun}`);
                        }
                    } else if (selectedIdx === 4) {
                        // LEVEL: Toggle OFF ↔ numbers (same pattern as SOURCE cycles values)
                        const currentLevelFocus = _state.autoRunLevelTriggered.levelFocus || "title";
                        if (currentLevelFocus === "title") {
                            // From title → move to upper column
                            _state.autoRunLevelTriggered.levelFocus = "upper";
                            _state.autoRunLevelTriggered.editingLevel = true;
                            // If OFF, set to default number; if number, keep it
                            if (_state.autoRunLevelTriggered.level === "OFF") {
                                _state.autoRunLevelTriggered.level = 90.0;
                            }
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEVEL: Moved to upper column, value: ${_state.autoRunLevelTriggered.level}`);
                        } else if (currentLevelFocus === "upper") {
                            // From upper → toggle OFF ↔ numbers
                            if (_state.autoRunLevelTriggered.level === "OFF") {
                                _state.autoRunLevelTriggered.level = 90.0;
                            } else {
                                _state.autoRunLevelTriggered.level = "OFF";
                            }
                            _state.autoRunLevelTriggered.editingLevel = true;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEVEL UPPER: ${_state.autoRunLevelTriggered.level}`);
                        } else {
                            // From lower → toggle OFF ↔ numbers
                            if (_state.autoRunLevelTriggered.level === "OFF") {
                                _state.autoRunLevelTriggered.level = 90.0;
                            } else {
                                _state.autoRunLevelTriggered.level = "OFF";
                            }
                            _state.autoRunLevelTriggered.editingLevel = true;
                            console.log(`[AUTO RUN LEVEL TRIGGERED] LEVEL LOWER: ${_state.autoRunLevelTriggered.level}`);
                        }
                    }
                    _emit();
                } else if (_state.viewId === "datetime_menu") {
                    if (_state.datetime.editing) {
                        // Already in edit mode: confirm and exit edit mode
                        _state.datetime.editing = false;
                        _state.datetime.editField = null;
                        _state.datetime.editSubField = null;
                        console.log(`[DATETIME] ENTER: Confirmed and exited edit mode`);
                        _emit();
                    } else {
                        // Enter edit mode for selected field
                        const selectedItem = DATETIME_MENU_ITEMS[_state.datetime.selectedIndex];
                        _state.datetime.editing = true;
                        _state.datetime.editField = selectedItem.toLowerCase(); // "year", "month", "day", "time"
                        // Set initial subfield based on selected item
                        if (selectedItem === "YEAR") {
                            _state.datetime.editSubField = "year";
                        } else if (selectedItem === "MONTH") {
                            _state.datetime.editSubField = "month";
                        } else if (selectedItem === "DAY") {
                            _state.datetime.editSubField = "day";
                        } else if (selectedItem === "TIME") {
                            _state.datetime.editSubField = "hour";
                        }
                        console.log(`[DATETIME] ENTER: Entered edit mode for ${selectedItem}, subfield: ${_state.datetime.editSubField}`);
                        _emit();
                    }
                } else if (_state.viewId === "datetime_edit") {
                    // This screen is not used anymore - we edit directly on datetime_menu
                    // But keeping for compatibility
                    if (_state.datetime.editing) {
                        // Confirm and exit edit mode
                        _state.datetime.editing = false;
                        _state.datetime.editField = null;
                        _state.datetime.editSubField = null;
                        console.log(`[DATETIME] ENTER: Exited edit mode, saved values`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_menu") {
                    const item = _state.autoRun.items[_state.autoRun.selectedIndex];
                    if (item.title === "AUTO-RUN") {
                        // Cycle through modes: Disabled → Timed Run → DOW → Date → Level-Triggered → Disabled
                        const currentIdx = AUTO_RUN_MODES.indexOf(item.value);
                        const nextIdx = (currentIdx + 1) % AUTO_RUN_MODES.length;
                        item.value = AUTO_RUN_MODES[nextIdx];
                        console.log(`[AUTO RUN] AUTO-RUN = ${item.value} (${AUTO_RUN_MODES[currentIdx]} → ${item.value})`);
                        _emit();
                    } else if (item.title === "VIEW/SET PARAMETERS") {
                        // Open parameter screen based on current AUTO-RUN mode
                        const currentMode = _state.autoRun.items[0].value;
                        if (currentMode === "Disabled") {
                            // No action when Disabled
                            console.log(`[AUTO RUN] VIEW/SET PARAMETERS: No action when AUTO-RUN is Disabled`);
                        } else if (currentMode === "Timed Run") {
                            _pushHistory("auto_run_timed_run_params");
                            _state.viewId = "auto_run_timed_run_params";
                            _state.autoRunTimedRun.editing = false;
                            _state.autoRunTimedRun.editSubField = "hour";
                            console.log(`[AUTO RUN] Opening Timed Run parameters`);
                            _emit();
                        } else if (currentMode === "DOW") {
                            _pushHistory("auto_run_dow_params");
                            _state.viewId = "auto_run_dow_params";
                            _state.autoRunDow.selectedIndex = -1; // Start with "Days" selected
                            _state.autoRunDow.lines.forEach(line => {
                                line.editMode = null;
                                line.editSubField = null;
                                line.editDayIndex = null;
                            });
                            console.log(`[AUTO RUN] Opening DOW parameters`);
                            _emit();
                        } else if (currentMode === "Date") {
                            _pushHistory("auto_run_date_params");
                            _state.viewId = "auto_run_date_params";
                            _state.autoRunDate.selectedIndex = 0;
                            _state.autoRunDate.lines.forEach(line => {
                                line.editMode = null;
                                line.editSubField = null;
                            });
                            console.log(`[AUTO RUN] Opening Date parameters`);
                            _emit();
                        } else if (currentMode === "Level-Triggered") {
                            _pushHistory("auto_run_level_triggered_params");
                            _state.viewId = "auto_run_level_triggered_params";
                            _state.autoRunLevelTriggered.selectedIndex = 0;
                            _state.autoRunLevelTriggered.editingLevel = false;
                            _updateLevelTriggeredTrigger(); // Initialize trigger value
                            console.log(`[AUTO RUN] Opening Level-Triggered parameters`);
                            _emit();
                        }
                    }
                } else if (_state.viewId === "digital_out_menu") {
                    const item = _state.digitalOut.items[_state.digitalOut.selectedIndex];
                    
                    if (item.title === "TRIGGER") {
                        // TRIGGER: Cycle SPL ↔ AVG
                        const currentIdx = item.options.indexOf(item.value);
                        const nextIdx = (currentIdx + 1) % item.options.length;
                        item.value = item.options[nextIdx];
                        console.log(`[DIGITAL OUT] TRIGGER: ${item.options[currentIdx]} → ${item.value}`);
                        _emit();
                    } else if (item.title === "OUTPUT 1") {
                        // OUTPUT 1: Cycle OFF → RUN/PSE → CURVES → OFF
                        const currentIdx = item.options.indexOf(item.value);
                        const nextIdx = (currentIdx + 1) % item.options.length;
                        item.value = item.options[nextIdx];
                        console.log(`[DIGITAL OUT] OUTPUT 1: ${item.options[currentIdx]} → ${item.value}`);
                        _emit();
                    } else if (item.title === "OUTPUT 2" || item.title === "OUTPUT 3") {
                        // OUTPUT 2-3: Toggle OFF ↔ dB
                        if (item.value === "OFF") {
                            item.value = "dB";
                            _state.digitalOut.editing = true;
                            _state.digitalOut.focus = "value";
                            console.log(`[DIGITAL OUT] ${item.title}: OFF → dB (entered edit mode)`);
                        } else {
                            item.value = "OFF";
                            _state.digitalOut.editing = false;
                            _state.digitalOut.focus = "title";
                            console.log(`[DIGITAL OUT] ${item.title}: dB → OFF`);
                        }
                        _emit();
                    } else if (item.title && item.title.startsWith("LOGIC")) {
                        // LOGIC 1-3: Enter edit mode
                        if (!_state.digitalOut.editing) {
                            _state.digitalOut.editing = true;
                            _state.digitalOut.focus = "value";
                            item.editingPosition = 0; // Start at first position
                            console.log(`[DIGITAL OUT] ${item.title}: Entered edit mode, position 0`);
                        } else {
                            // Already in edit mode, do nothing (UP/DOWN toggles values)
                            console.log(`[DIGITAL OUT] ${item.title}: Already in edit mode`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "sig_input_menu") {
                    const item = _state.sigInput.items[_state.sigInput.selectedIndex];
                    console.log(`[SIG INPUT] ENTER pressed - editing: ${_state.sigInput.editing}, focus: ${_state.sigInput.focus}, selectedIndex: ${_state.sigInput.selectedIndex}, item:`, item);
                    
                    // Special handling for POLARIZATION: cycle between 0V and 200V
                    if (item.title === "POLARIZATION" && item.options) {
                        const currentIdx = item.options.indexOf(item.value);
                        const nextIdx = (currentIdx + 1) % item.options.length;
                        item.value = item.options[nextIdx];
                        console.log(`[SIG INPUT] POLARIZATION cycled: ${item.options[currentIdx]}V → ${item.value}V`);
                        _emit();
                    } else if (_state.sigInput.editing && _state.sigInput.focus === "value") {
                        // ENTER on value: exit edit mode (save)
                        _state.sigInput.editing = false;
                        _state.sigInput.focus = "title";
                        console.log(`[SIG INPUT] Exited edit mode`);
                        _emit();
                    } else {
                        // ENTER on title: enter edit mode, focus on value
                        _state.sigInput.editing = true;
                        _state.sigInput.focus = "value";
                        console.log(`[SIG INPUT] Entered edit mode on ${item?.title || 'unknown item'}`);
                        _emit();
                    }
                } else if (_state.viewId === "logging_menu") {
                    const item = _state.logging.items[_state.logging.selectedIndex];
                    
                    // Meter 2 mode: All items toggle ON/OFF with ENTER (no edit mode)
                    if (_state.logging.meter === "meter2") {
                        if (item.options && (item.title === "AVG" || item.title === "PEAK" || item.title === "MAX" || item.title === "MIN" || item.title === "FILTERS")) {
                            // Toggle between OFF and ON
                            if (item.value === "OFF") {
                                item.value = "ON";
                                console.log(`[LOGGING] Meter 2 ENTER: ${item.title} = ${item.value} (OFF → ON)`);
                            } else {
                                item.value = "OFF";
                                console.log(`[LOGGING] Meter 2 ENTER: ${item.title} = ${item.value} (ON → OFF)`);
                            }
                            // Keep focus on title (don't enter edit mode)
                            _state.logging.focus = "title";
                            _state.logging.editing = false;
                            _emit();
                        } else {
                            // For L1, L2, INTERVAL in Meter 2: do nothing or log
                            console.log(`[LOGGING] Meter 2 ENTER: ${item.title} (no action for this item in Meter 2 mode)`);
                            _emit();
                        }
                    } else if (item.title === "AVG" || item.title === "PEAK" || item.title === "MAX" || item.title === "MIN" || item.title === "FILTERS") {
                        // Meter 1: Special handling for AVG, PEAK, MAX, MIN, FILTERS: ENTER toggles ON/OFF without entering edit mode
                        if (item.value === "OFF") {
                            item.value = "ON";
                            console.log(`[LOGGING] ENTER: ${item.title} = ${item.value} (OFF → ON)`);
                        } else {
                            item.value = "OFF";
                            console.log(`[LOGGING] ENTER: ${item.title} = ${item.value} (ON → OFF)`);
                        }
                        // Keep focus on title (don't enter edit mode)
                        _state.logging.focus = "title";
                        _state.logging.editing = false;
                        _emit();
                    } else if (_state.logging.editing && _state.logging.focus === "value") {
                        // ENTER on value: toggle OFF/L value for L1/L2, or exit edit mode for INTERVAL
                        if (item.title === "L1" || item.title === "L2") {
                            // L1/L2: Toggle between current L value and OFF
                            if (item.value === "OFF") {
                                // From OFF, go to the default L value (L83 for L1, L87 for L2)
                                const defaultValue = item.title === "L1" ? "L83" : "L87";
                                item.value = defaultValue;
                                console.log(`[LOGGING] ENTER: ${item.title} = ${item.value} (OFF → ${defaultValue})`);
                            } else {
                                // From any L value, go to OFF
                                const oldValue = item.value;
                                item.value = "OFF";
                                console.log(`[LOGGING] ENTER: ${item.title} = ${item.value} (${oldValue} → OFF)`);
                            }
                            // Stay in edit mode (value remains highlighted)
                            _state.logging.focus = "value";
                            _state.logging.editing = true;
                            _emit();
                        } else if (item.title === "INTERVAL") {
                            // INTERVAL: exit edit mode (save)
                            _state.logging.editing = false;
                            _state.logging.focus = "title";
                            const intervalOption = item.intervalOptions?.find(opt => opt.value === item.value);
                            const displayValue = intervalOption?.display || `${item.value} sec`;
                            console.log(`[LOGGING] INTERVAL ENTER: Exited edit mode, saved value: ${displayValue}`);
                            _emit();
                        }
                    } else if (item.title === "L1" || item.title === "L2") {
                        // L1/L2: ENTER on title enters edit mode, focuses on value
                        _state.logging.editing = true;
                        _state.logging.focus = "value";
                        console.log(`[LOGGING] ${item.title} ENTER: Entered edit mode, current value: ${item.value}`);
                        _emit();
                    } else {
                        // ENTER on title: enter edit mode, focus on value (only for INTERVAL now)
                        _state.logging.editing = true;
                        _state.logging.focus = "value";
                        if (item.title === "INTERVAL") {
                            const intervalOption = item.intervalOptions?.find(opt => opt.value === item.value);
                            const displayValue = intervalOption?.display || `${item.value} sec`;
                            console.log(`[LOGGING] INTERVAL ENTER: Entered edit mode, current value: ${displayValue}`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "comms_menu") {
                    const item = COMMS_MENU_ITEMS[_state.menu.selectedIndex];
                    if (item === "USB") {
                        // Cycle through USB options
                        _state.comms.usbModeIndex = (_state.comms.usbModeIndex + 1) % USB_OPTIONS.length;
                        _state.comms.usbMode = USB_OPTIONS[_state.comms.usbModeIndex];
                        console.log(`[COMMS] USB: ${_state.comms.usbMode}`);
                        _emit();
                    } else if (item === "RS-232") {
                        // Cycle through RS-232 options
                        _state.comms.rs232ModeIndex = (_state.comms.rs232ModeIndex + 1) % RS232_OPTIONS.length;
                        _state.comms.rs232Mode = RS232_OPTIONS[_state.comms.rs232ModeIndex];
                        console.log(`[COMMS] RS-232: ${_state.comms.rs232Mode}`);
                        if (_state.comms.rs232Mode === "GPS") {
                            console.log(`[COMMS] RS-232 is GPS - "NO FIX" line should appear`);
                        }
                        _emit();
                    } else if (item === "BAUD RATE") {
                        // Cycle through BAUD RATE options (no edit screen, cycle in place)
                        _state.comms.baudRateIndex = (_state.comms.baudRateIndex + 1) % BAUD_RATE_OPTIONS.length;
                        _state.comms.baudRate = BAUD_RATE_OPTIONS[_state.comms.baudRateIndex];
                        console.log(`[COMMS] BAUD RATE: ${_state.comms.baudRate}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_menu") {
                    const item = FILES_MENU_ITEMS[_state.menu.selectedIndex];
                    if (item === "SESSION DIRECTORY") {
                        _pushHistory("files_session_dir");
                        _state.viewId = "files_session_dir";
                        _state.files.cursor = 0;
                        _emit();
                    } else if (item === "CONFIG DIRECTORY") {
                        _pushHistory("files_config_dir");
                        _state.viewId = "files_config_dir";
                        _state.files.cursor = 0;
                        _emit();
                    } else if (item === "RENAME LAST SESSION") {
                        _showToast("File renamed");
                        _emit();
                    } else if (item === "SAVE CONFIG FILE") {
                        _showToast("Config saved");
                        _emit();
                    } else if (item === "FORMAT CARD") {
                        _state.previousViewId = "files_menu";
                        _state.viewId = "files_format_card";
                        _emit();
                        const formatDuration = 2000 + Math.random() * 1000; // 2000-3000ms
                        _state.timers.formatting = setTimeout(() => {
                            _state.viewId = "files_menu";
                            _clearTimer('formatting');
                            _emit();
                        }, formatDuration);
                    }
                } else if (_state.viewId === "files_delete_confirm") {
                    _showToast("Deleted");
                    _state.viewId = _state.previousViewId || "files_menu";
                    _emit();
                } else if (_state.viewId === "cal_menu") {
                    _state.previousViewId = isSlm() ? _state.viewId : (isInSetup() ? _state.viewId : "home_screen");
                    _state.viewId = "cal_running";
                    _emit();
                    const calDuration = 4000 + Math.random() * 2000; // 4000-6000ms
                    _state.timers.cal = setTimeout(() => {
                        _state.viewId = _state.previousViewId || "home_screen";
                        _clearTimer('cal');
                        _emit();
                    }, calDuration);
                } else if (isHome()) {
                    const item = MENU_ITEMS[_state.menu.selectedIndex];
                    if (item === "VIEW PAST STUDIES") {
                        // Do nothing - no action for VIEW PAST STUDIES
                        // Toast disabled - user cannot test on actual device
                        // _showToast("No studies yet");
                        return; // Explicitly do nothing
                    } else if (item === "VIEW CURRENT STUDY") {
                        // Preserve measurement state - only start if stopped
                        if (_state.measurement.state === "stopped") {
                            _state.measurement.state = "running";
                            _state.measurement.isRunning = true;
                            _startMeasurementTimer();
                            _startMeasurementEngine();
                        } else if (_state.measurement.state === "running") {
                            // Already running - ensure timer is running
                            _state.measurement.isRunning = true;
                            _startMeasurementTimer();
                            _startMeasurementEngine();
                        } else if (_state.measurement.state === "paused") {
                            // Preserve paused state - don't start timer
                            _state.measurement.isRunning = false;
                        }
                        _state.viewId = "home_screen_running";
                        _emit();
                    } else if (item === "VIEW SESSION") {
                        // Preserve measurement state when entering SLM
                        // Only start if stopped, otherwise preserve running/paused state
                        if (_state.measurement.state === "stopped") {
                            _state.measurement.state = "running";
                            _state.measurement.isRunning = true;
                            _startMeasurementTimer();
                            _startMeasurementEngine();
                        } else if (_state.measurement.state === "running") {
                            // Already running - ensure timer is running
                            _state.measurement.isRunning = true;
                            _startMeasurementTimer();
                            _startMeasurementEngine();
                        } else if (_state.measurement.state === "paused") {
                            // Preserve paused state - don't start timer
                            _state.measurement.isRunning = false;
                        }
                        // Set mode based on slmLabelIndex
                        if (_state.slmLabelIndex === 0) {
                            _state.slm.mode = "numeric";
                        } else if (_state.slmLabelIndex === 1) {
                            _state.slm.mode = "1of1";
                        } else if (_state.slmLabelIndex === 2) {
                            _state.slm.mode = "1of3";
                        }
                        // Always use running version of viewId - icon will show correct state dynamically
                        let viewId = _getSlmViewId();
                        _state.viewId = _normalizeSlmViewId(viewId);
                        _emit();
                    } else if (item === "SETUP") {
                        _pushHistory("setup_menu");
                        _state.viewId = "setup_menu";
                        _state.menu.selectedIndex = 0;
                        _emit();
                    } else if (item === "UNIT INFO") {
                        _pushHistory("unit_info");
                        _state.viewId = "unit_info";
                        _emit();
                    }
                } else if (_state.viewId === "home_screen_running") {
                    _state.viewId = _getSlmViewId();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "running") {
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _state.viewId = _getSlmViewId();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "paused") {
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = _getSlmViewId();
                    _emit();
                }
                break;

            case "ESC":
                console.log(`[FSM] ESC pressed - viewId: ${_state.viewId}, sigInput.editing: ${_state.sigInput?.editing}, sigInput.focus: ${_state.sigInput?.focus}`);
                if (_state.viewId === "stop_confirm") {
                    _clearTimer('stopHold');
                    if (_state.measurement.state === "stopped") {
                        _state.viewId = "slm_home_stopped";
                    } else {
                        _state.viewId = _getSlmViewId();
                    }
                    _emit();
                } else if (_state.viewId === "cal_running") {
                    _clearTimer('cal');
                    _state.viewId = _state.previousViewId || "home_screen";
                    _emit();
                } else if (_state.viewId === "display_menu" && _state.display.editing) {
                    // Cancel editing BACKLIGHT or CONTRAST - return focus to title
                    _state.display.editing = false;
                    _state.display.focus = "title";
                    _emit();
                } else if (_state.viewId === "measure_menu" && _state.measure.editing) {
                    // Cancel editing measure item - return focus to title
                    _state.measure.editing = false;
                    _state.measure.focus = "title";
                    _emit();
                } else if (_state.meterSet.editing && (_state.viewId === "meter_set_menu" || _state.viewId === "meter_set_edit")) {
                    // Cancel editing - revert changes and return focus to title
                    _state.meterSet.editing = false;
                    _state.meterSet.focus = "title";
                    if (_state.viewId === "meter_set_edit") {
                        _state.viewId = "meter_set_menu";
                    }
                    _emit();
                } else if (_state.viewId === "meter_set_menu") {
                    // Pop history to return to setup_menu (or previous view)
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _state.meterSet.selectedIndex = 0;
                    _emit();
                    break; // Prevent falling through to isInSetup() handler
                } else if (_state.viewId === "slm_view_menu") {
                    // Return to SLM screen (running, paused, or stopped)
                    if (_state.measurement.state === "stopped") {
                        _state.viewId = "slm_home_stopped";
                    } else {
                        _state.viewId = _getSlmViewId();
                    }
                    _emit();
                } else if (_state.viewId === "sig_input_menu") {
                    if (_state.sigInput.editing) {
                        // Cancel editing - return focus to title (stay on sig_input_menu)
                        _state.sigInput.editing = false;
                        _state.sigInput.focus = "title";
                        console.log(`[SIG INPUT] ESC: Cancelled editing, returned focus to title. State: editing=${_state.sigInput.editing}, focus=${_state.sigInput.focus}, selectedIndex=${_state.sigInput.selectedIndex}`);
                        _emit();
                    } else {
                        // Return to setup_menu (only when not editing)
                        const previousView = _popHistory() || "setup_menu";
                        _state.viewId = previousView;
                        _state.sigInput.selectedIndex = 0;
                        console.log(`[SIG INPUT] ESC: Returned to ${previousView}`);
                        _emit();
                    }
                } else if (_state.viewId === "datetime_edit") {
                    // Cancel editing and return to datetime_menu
                    const previousView = _popHistory() || "datetime_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "auto_run_timed_run_params") {
                    if (_state.autoRunTimedRun.editing) {
                        // ESC does nothing when editing hour/minute/second
                        console.log(`[AUTO RUN TIMED RUN] ESC: Ignored (editing mode)`);
                        // Do nothing - stay in edit mode
                    } else {
                        // ESC only works when TIMED-RUN is highlighted (not in edit mode)
                        // Return to auto_run_menu
                        const previousView = _popHistory() || "auto_run_menu";
                        _state.viewId = previousView;
                        console.log(`[AUTO RUN TIMED RUN] ESC: Returned to ${previousView}`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_dow_params") {
                    if (_state.autoRunDow.selectedIndex === -1) {
                        // Days selected - ESC returns to auto_run_menu
                        const previousView = _popHistory() || "auto_run_menu";
                        _state.viewId = previousView;
                        console.log(`[AUTO RUN DOW] ESC: Returned to ${previousView}`);
                        _emit();
                    } else {
                        const line = _state.autoRunDow.lines[_state.autoRunDow.selectedIndex];
                        if (line.editMode !== null) {
                            // Exit edit mode
                            line.editMode = null;
                            line.editSubField = null;
                            line.editDayIndex = null;
                            console.log(`[AUTO RUN DOW] ESC: Exited edit mode`);
                            _emit();
                        } else {
                            // Return to auto_run_menu
                            const previousView = _popHistory() || "auto_run_menu";
                            _state.viewId = previousView;
                            console.log(`[AUTO RUN DOW] ESC: Returned to ${previousView}`);
                            _emit();
                        }
                    }
                } else if (_state.viewId === "auto_run_date_params") {
                    const line = _state.autoRunDate.lines[_state.autoRunDate.selectedIndex];
                    if (line.editMode !== null) {
                        // Exit edit mode and disable line (show ---OFF---)
                        line.editMode = null;
                        line.editSubField = null;
                        line.enabled = false;
                        console.log(`[AUTO RUN DATE] ESC: Exited edit mode, line disabled`);
                        _emit();
                    } else {
                        // Return to auto_run_menu
                        const previousView = _popHistory() || "auto_run_menu";
                        _state.viewId = previousView;
                        console.log(`[AUTO RUN DATE] ESC: Returned to ${previousView}`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_level_triggered_params") {
                    if (_state.autoRunLevelTriggered.editingLevel) {
                        // Exit LEVEL edit mode
                        _state.autoRunLevelTriggered.editingLevel = false;
                        console.log(`[AUTO RUN LEVEL TRIGGERED] ESC: Exited LEVEL edit mode`);
                        _emit();
                    } else if (_state.autoRunLevelTriggered.editingSource) {
                        // Exit SOURCE edit mode
                        _state.autoRunLevelTriggered.editingSource = false;
                        console.log(`[AUTO RUN LEVEL TRIGGERED] ESC: Exited SOURCE edit mode`);
                        _emit();
                    } else {
                        // Return to auto_run_menu
                        const previousView = _popHistory() || "auto_run_menu";
                        _state.viewId = previousView;
                        console.log(`[AUTO RUN LEVEL TRIGGERED] ESC: Returned to ${previousView}`);
                        _emit();
                    }
                } else if (_state.viewId === "auto_run_menu") {
                    // Return to setup_menu
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _state.autoRun.selectedIndex = 0;
                    _emit();
                } else if (_state.viewId === "datetime_menu") {
                    // Return to setup_menu
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _state.menu.selectedIndex = 0;
                    _emit();
                } else if (_state.viewId === "digital_out_menu") {
                    if (_state.digitalOut.editing) {
                        // Cancel editing - return focus to title (stay on digital_out_menu)
                        _state.digitalOut.editing = false;
                        _state.digitalOut.focus = "title";
                        console.log(`[DIGITAL OUT] ESC: Cancelled editing, returned focus to title`);
                        _emit();
                    } else {
                        // Return to setup_menu (only when not editing)
                        const previousView = _popHistory() || "setup_menu";
                        _state.viewId = previousView;
                        _state.digitalOut.selectedIndex = 0;
                        _state.digitalOut.editing = false;
                        _state.digitalOut.focus = "title";
                        console.log(`[DIGITAL OUT] ESC: Returned to ${previousView}`);
                        _emit();
                    }
                } else if (_state.viewId === "options_menu") {
                    // Return to setup_menu
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "logging_menu") {
                    if (_state.logging.editing) {
                        // Cancel editing - return focus to title (stay on logging_menu)
                        _state.logging.editing = false;
                        _state.logging.focus = "title";
                        console.log(`[LOGGING] ESC: Cancelled editing, returned focus to title. State: editing=${_state.logging.editing}, focus=${_state.logging.focus}, selectedIndex=${_state.logging.selectedIndex}`);
                        _emit();
                    } else {
                        // Return to setup_menu (only when not editing)
                        const previousView = _popHistory() || "setup_menu";
                        _state.viewId = previousView;
                        _state.logging.selectedIndex = 0;
                        console.log(`[LOGGING] ESC: Returned to ${previousView}`);
                        _emit();
                    }
                } else if (isInSetup()) {
                    if (_state.viewId === "setup_menu") {
                        const previousView = _popHistory() || "home_screen";
                        _state.viewId = previousView;
                        _emit();
                    } else {
                        // Pop history for setup submenus (meter_set_menu, measure_menu, etc.)
                        const previousView = _popHistory() || "setup_menu";
                        _state.viewId = previousView;
                        _emit();
                    }
                } else if (_state.viewId === "comms_menu") {
                    // Return to setup_menu
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _state.menu.selectedIndex = 0;
                    _emit();
                } else if (_state.viewId === "comms_edit") {
                    // Cancel editing and return to comms_menu
                    const previousView = _popHistory() || "comms_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "battery_menu") {
                    // Return to setup_menu
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "display_menu") {
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "display_language" || _state.viewId === "display_backlight" || _state.viewId === "display_contrast") {
                    const previousView = _popHistory() || "display_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (isInFiles()) {
                    if (_state.viewId === "files_menu") {
                        const previousView = _popHistory() || "home_screen";
                        _state.viewId = previousView;
                        _emit();
                    } else if (_state.viewId === "files_delete_confirm") {
                        _state.viewId = _state.previousViewId || "files_menu";
                        _emit();
                    } else {
                        // Pop history for submenus (SESSION DIRECTORY, CONFIG DIRECTORY, etc.)
                        const previousView = _popHistory() || "files_menu";
                        _state.viewId = previousView;
                        _emit();
                    }
                } else if (_state.viewId === "lock_menu") {
                    const previousView = _popHistory() || "home_screen";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "unit_info") {
                    const previousView = _popHistory() || "home_screen";
                    _state.viewId = previousView;
                    _emit();
                } else if (_state.viewId === "display_contrast") {
                    const previousView = _popHistory() || "setup_menu";
                    _state.viewId = previousView;
                    _emit();
                } else if (isSlm()) {
                    _state.measurement.state = "stopped";
                    _state.measurement.isRunning = false;
                    // Stop the measurement timer
                    _stopMeasurementTimer();
                    _state.slm.page = 1; // Reset page to 1 when exiting SLM
                    _state.viewId = "home_screen";
                    _emit();
                }
                break;

            case "RUN":
            case "RUNPAUSE":
                // Handle RUN/PAUSE on home screen - show play symbol and timer but stay on home screen
                if (isHome() || _state.viewId === "home_screen_running") {
                    if (_state.measurement.state === "stopped" || _state.measurement.state === "paused") {
                        // Start or resume measurement on home screen
                        _state.measurement.state = "running";
                        _state.measurement.isRunning = true;
                        // Start the timer to increment runtime
                        _startMeasurementTimer();
                        // Start measurement engine
                        _startMeasurementEngine();
                        // Stay on home screen but show running state (play symbol and timer)
                        _state.viewId = "home_screen_running";
                        _emit();
                    } else if (_state.measurement.state === "running") {
                        // Pause measurement on home screen
                        _state.measurement.state = "paused";
                        _state.measurement.isRunning = false;
                        // Stop the timer
                        _stopMeasurementTimer();
                        // Pause measurement engine
                        _pauseMeasurementEngine();
                        // Stay on home_screen_running to show pause icon (icon will update dynamically)
                        _state.viewId = "home_screen_running";
                        _emit();
                    }
                } else if (_state.viewId === "slm_home_stopped") {
                    // From stopped SLM screen, start measurement and enter SLM
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    // Start the timer
                    _startMeasurementTimer();
                    // Start measurement engine
                    _startMeasurementEngine();
                    // Set mode based on slmLabelIndex when entering SLM
                    if (_state.slmLabelIndex === 0) {
                        _state.slm.mode = "numeric";
                    } else if (_state.slmLabelIndex === 1) {
                        _state.slm.mode = "1of1";
                    } else if (_state.slmLabelIndex === 2) {
                        _state.slm.mode = "1of3";
                    }
                    _state.viewId = _getSlmViewId();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "running") {
                    // Pause measurement in SLM - keep same screen, icon will update dynamically
                    console.log('[FSM] RUN/PAUSE: Pausing measurement in SLM');
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    // Stop the timer
                    _stopMeasurementTimer();
                    // Pause measurement engine
                    _pauseMeasurementEngine();
                    // Normalize viewId to running version and keep it (don't change screen)
                    _state.viewId = _normalizeSlmViewId(_state.viewId);
                    _emit();
                } else if (isSlm() && _state.measurement.state === "paused") {
                    // Resume measurement in SLM - keep same screen, icon will update dynamically
                    console.log('[FSM] RUN/PAUSE: Resuming measurement in SLM');
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    // Start the timer
                    _startMeasurementTimer();
                    // Normalize viewId to running version and keep it (don't change screen)
                    _state.viewId = _normalizeSlmViewId(_state.viewId);
                    _emit();
                }
                break;

            case "PAUSE":
                if (isSlm() && _state.measurement.state === "running") {
                    // Pause measurement in SLM - keep same screen, icon will update dynamically
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    // Stop the timer
                    _stopMeasurementTimer();
                    // Normalize viewId to running version and keep it (don't change screen)
                    _state.viewId = _normalizeSlmViewId(_state.viewId);
                    _emit();
                } else if (_state.viewId === "home_screen_running" && _state.measurement.state === "running") {
                    // Pause measurement on home screen
                    console.log('[FSM] PAUSE: Pausing measurement on home screen');
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    // Stop the timer
                    _stopMeasurementTimer();
                    // Stay on home_screen_running to show pause icon (icon will update dynamically)
                    _state.viewId = "home_screen_running";
                    _emit();
                }
                break;

            case "STOP_DOWN":
                // Stop button only works when paused (not when running)
                // Must pause first, then hold stop for 3 seconds
                if (isSlm() && _state.measurement.state === "paused") {
                    _startStopHoldTimer();
                }
                break;

            case "STOP_UP":
                if (_state.viewId === "stop_confirm") {
                    _clearTimer('stopHold');
                    if (_state.measurement.state === "stopped") {
                        // Stop measurement engine
                        _stopMeasurementEngine();
                        _state.viewId = "slm_home_stopped";
                    } else {
                        _state.viewId = _getSlmViewId();
                    }
                    _emit();
                }
                break;

            case "SOFT1":
                if (isHome()) {
                    // Cycle SLM label: SLM (0) → 1/1 (1) → 1/3 (2) → SLM (0)
                    _state.slmLabelIndex = (_state.slmLabelIndex + 1) % 3;
                    // Map slmLabelIndex to mode
                    if (_state.slmLabelIndex === 0) {
                        _state.slm.mode = "numeric";
                    } else if (_state.slmLabelIndex === 1) {
                        _state.slm.mode = "1of1";
                    } else if (_state.slmLabelIndex === 2) {
                        _state.slm.mode = "1of3";
                    }
                    console.log('[FSM] SOFT1 pressed on home → Cycling SLM label, index:', _state.slmLabelIndex, 'mode:', _state.slm.mode);
                    _emit();
                } else if (isSlm()) {
                    _state.viewId = "slm_view_menu";
                    _state.menu.selectedIndex = 0;
                    _emit();
                } else if (_state.viewId === "battery_menu") {
                    // SOFT1 = ALK on battery menu
                    _state.battery.type = "ALK";
                    console.log('[BATTERY] Selected: ALK');
                    _emit();
                } else if (_state.viewId === "auto_run_dow_params") {
                    // SOFT1 = -1 / +1: select/enable line 1 and select it
                    const line = _state.autoRunDow.lines[0];
                    line.enabled = !line.enabled;
                    _state.autoRunDow.selectedIndex = 0; // Select line 1
                    console.log(`[AUTO RUN DOW] SOFT1: Line 1 ${line.enabled ? 'enabled' : 'disabled'}, selected`);
                    _emit();
                } else if (_state.viewId === "auto_run_date_params") {
                    // SOFT1 = -1 / +1: enable/disable line 1 and select it
                    const line = _state.autoRunDate.lines[0];
                    const wasEnabled = line.enabled;
                    line.enabled = !line.enabled;
                    // If enabling (was disabled, now enabled) and date not set, set default values
                    if (!wasEnabled && line.enabled && !line.date) {
                        const now = new Date();
                        line.date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
                        if (!line.startTime) {
                            line.startTime = { hour: 0, minute: 0, second: 0 };
                        }
                        if (!line.stopTime) {
                            line.stopTime = { hour: 0, minute: 0, second: 0 };
                        }
                        console.log(`[AUTO RUN DATE] SOFT1: Line 1 enabled with default date: ${line.date.day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][line.date.month - 1]} ${line.date.year}`);
                    }
                    _state.autoRunDate.selectedIndex = 0; // Select line 1
                    console.log(`[AUTO RUN DATE] SOFT1: Line 1 ${line.enabled ? 'enabled' : 'disabled'}, selected`);
                    _emit();
                }
                break;

            case "SOFT2":
                if (isSlm()) {
                    // Cycle: F → S → I → F
                    const cycle = ["F", "S", "I"];
                    const currentIndex = cycle.indexOf(_state.slm.timeConstant);
                    const nextIndex = (currentIndex + 1) % cycle.length;
                    _state.slm.timeConstant = cycle[nextIndex];
                    console.log('[FSM] SOFT2 pressed on SLM → Time constant:', _state.slm.timeConstant);
                    _emit();
                    return;
                } else if (_state.viewId === "battery_menu") {
                    // SOFT2 = NiMH on battery menu
                    _state.battery.type = "NiMH";
                    console.log('[BATTERY] Selected: NiMH');
                    _emit();
                } else if (_state.viewId === "auto_run_dow_params") {
                    // SOFT2 = -2 / +2: select/enable line 2 and select it
                    const line = _state.autoRunDow.lines[1];
                    line.enabled = !line.enabled;
                    _state.autoRunDow.selectedIndex = 1; // Select line 2
                    console.log(`[AUTO RUN DOW] SOFT2: Line 2 ${line.enabled ? 'enabled' : 'disabled'}, selected`);
                    _emit();
                } else if (_state.viewId === "auto_run_date_params") {
                    // SOFT2 = -2 / +2: enable/disable line 2 and select it
                    const line = _state.autoRunDate.lines[1];
                    const wasEnabled = line.enabled;
                    line.enabled = !line.enabled;
                    // If enabling (was disabled, now enabled) and date not set, set default values
                    if (!wasEnabled && line.enabled && !line.date) {
                        const now = new Date();
                        line.date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
                        if (!line.startTime) {
                            line.startTime = { hour: 0, minute: 0, second: 0 };
                        }
                        if (!line.stopTime) {
                            line.stopTime = { hour: 0, minute: 0, second: 0 };
                        }
                        console.log(`[AUTO RUN DATE] SOFT2: Line 2 enabled with default date: ${line.date.day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][line.date.month - 1]} ${line.date.year}`);
                    }
                    _state.autoRunDate.selectedIndex = 1; // Select line 2
                    console.log(`[AUTO RUN DATE] SOFT2: Line 2 ${line.enabled ? 'enabled' : 'disabled'}, selected`);
                    _emit();
                } else if (isSlm() || isHome()) {
                    // SOFT2 = CAL (Calibration) on SLM or Home screens
                    console.log('[FSM] SOFT2 pressed → Navigating to cal_menu');
                    _state.previousViewId = _state.viewId;
                    _state.viewId = "cal_menu";
                    _emit();
                } else {
                    console.log('[FSM] SOFT2 pressed → Ignored (not on SLM, Home, Battery, DOW, or Date)');
                }
                break;

            case "SOFT3":
                if (isSlm()) {
                    // Cycle: R → C → Z → F → R
                    const cycle = ["R", "C", "Z", "F"];
                    const currentIndex = cycle.indexOf(_state.slm.weighting);
                    const nextIndex = (currentIndex + 1) % cycle.length;
                    _state.slm.weighting = cycle[nextIndex];
                    console.log('[FSM] SOFT3 pressed on SLM → Weighting:', _state.slm.weighting);
                    _emit();
                    return;
                } else if (isHome()) {
                    // SOFT3 = FILE (Files menu)
                    console.log('[FSM] SOFT3 pressed → Navigating to files_menu');
                    _state.viewId = "files_menu";
                    _state.menu.selectedIndex = 0;
                    _emit();
                } else if (_state.viewId === "auto_run_date_params") {
                    // SOFT3 = -3 / +3: enable/disable line 3 and select it
                    const line = _state.autoRunDate.lines[2];
                    const wasEnabled = line.enabled;
                    line.enabled = !line.enabled;
                    // If enabling (was disabled, now enabled) and date not set, set default values
                    if (!wasEnabled && line.enabled && !line.date) {
                        const now = new Date();
                        line.date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
                        if (!line.startTime) {
                            line.startTime = { hour: 0, minute: 0, second: 0 };
                        }
                        if (!line.stopTime) {
                            line.stopTime = { hour: 0, minute: 0, second: 0 };
                        }
                        console.log(`[AUTO RUN DATE] SOFT3: Line 3 enabled with default date: ${line.date.day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][line.date.month - 1]} ${line.date.year}`);
                    }
                    _state.autoRunDate.selectedIndex = 2; // Select line 3
                    console.log(`[AUTO RUN DATE] SOFT3: Line 3 ${line.enabled ? 'enabled' : 'disabled'}, selected`);
                    _emit();
                } else {
                    console.log('[FSM] SOFT3 pressed → Ignored (not on SLM, Home, or Date)');
                }
                break;

            case "SOFT4":
                if (isSlm()) {
                    // Cycle: Meter 1 → Meter 2 → GPS - 1 → GPS - 2 → Meter 1
                    const cycle = [1, 2, "GPS-1", "GPS-2"];
                    const currentValue = _state.slm.activeMeter || 1;
                    console.log('[FSM] SOFT4: Current activeMeter value:', currentValue, 'Type:', typeof currentValue);
                    let currentIndex = cycle.indexOf(currentValue);
                    // If not found, default to 0 (Meter 1)
                    if (currentIndex === -1) {
                        console.log('[FSM] SOFT4: Current value not found in cycle, defaulting to index 0');
                        currentIndex = 0;
                    }
                    const nextIndex = (currentIndex + 1) % cycle.length;
                    _state.slm.activeMeter = cycle[nextIndex];
                    console.log('[FSM] SOFT4 pressed on SLM → Active meter changed from', currentValue, 'to', _state.slm.activeMeter);
                    _emit();
                    return;
                } else if (_state.viewId === "auto_run_date_params") {
                    // SOFT4 = -4 / +4: enable/disable line 4 and select it
                    const line = _state.autoRunDate.lines[3];
                    const wasEnabled = line.enabled;
                    line.enabled = !line.enabled;
                    // If enabling (was disabled, now enabled) and date not set, set default values
                    if (!wasEnabled && line.enabled && !line.date) {
                        const now = new Date();
                        line.date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
                        if (!line.startTime) {
                            line.startTime = { hour: 0, minute: 0, second: 0 };
                        }
                        if (!line.stopTime) {
                            line.stopTime = { hour: 0, minute: 0, second: 0 };
                        }
                        console.log(`[AUTO RUN DATE] SOFT4: Line 4 enabled with default date: ${line.date.day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][line.date.month - 1]} ${line.date.year}`);
                    }
                    _state.autoRunDate.selectedIndex = 3; // Select line 4
                    console.log(`[AUTO RUN DATE] SOFT4: Line 4 ${line.enabled ? 'enabled' : 'disabled'}, selected`);
                    _emit();
                } else if (_state.viewId === "logging_menu") {
                    // SOFT4 = Meter 1/2 toggle on logging menu
                    if (_state.logging.meter === "meter1") {
                        // Switch to Meter 2
                        _state.logging.meter = "meter2";
                        _state.logging.items = LOGGING_MENU_ITEMS_METER2.map(item => {
                            // Deep copy to ensure all properties are preserved
                            const newItem = { ...item };
                            if (item.options) {
                                newItem.options = [...item.options];
                            }
                            if (item.intervalOptions) {
                                newItem.intervalOptions = item.intervalOptions.map(opt => ({ ...opt }));
                            }
                            return newItem;
                        });
                        _state.logging.selectedIndex = 0;
                        _state.logging.editing = false;
                        _state.logging.focus = "title";
                        console.log('[LOGGING] Switched to Meter 2');
                        console.log('[LOGGING] Meter 2 items:', _state.logging.items.map(i => `${i.title}=${i.value}`));
                    } else {
                        // Switch to Meter 1
                        _state.logging.meter = "meter1";
                        _state.logging.items = LOGGING_MENU_ITEMS.map(item => {
                            // Deep copy to ensure all properties are preserved
                            const newItem = { ...item };
                            if (item.options) {
                                newItem.options = [...item.options];
                            }
                            if (item.intervalOptions) {
                                newItem.intervalOptions = item.intervalOptions.map(opt => ({ ...opt }));
                            }
                            return newItem;
                        });
                        _state.logging.selectedIndex = 0;
                        _state.logging.editing = false;
                        _state.logging.focus = "title";
                        console.log('[LOGGING] Switched to Meter 1');
                        console.log('[LOGGING] Meter 1 items:', _state.logging.items.map(i => `${i.title}=${i.value}`));
                    }
                    _emit();
                }
                break;

            case "LOCK_SOFTKEY":
                if (isHome()) {
                    console.log('[FSM] LOCK_SOFTKEY pressed → Navigating to lock_menu');
                    _state.viewId = "lock_menu";
                    _state.flags.locked = true;
                    _emit();
                } else if (_state.viewId === "lock_menu") {
                    _state.flags.locked = false;
                    _state.viewId = "home_screen";
                    _emit();
                }
                break;
        }
    }

    // Export to window
    window.initMainFSM = initMainFSM;
    window.subscribeMainFSM = subscribe;
    window.getMainFSMState = getState;
    window.dispatch = dispatch;
})();

