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
        "TIME-DATE",
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
        "TIME",
        "DATE",
        "DAY"
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
        slmSoundSettings: {
            visible: false,
            selectedIndex: 0,
            selectedType: null // Stores the selected measurement type: 'L_', 'L_AVG', 'L_PK', 'L_Mx', 'L_Mn'
        },
        timers: {
            stopHold: null,
            formatting: null,
            cal: null,
            measurementRuntime: null,
            powerOffCountdown: null,
            walkthroughCalRamp: null
        },
        powerOff: {
            countdown: null, // 3, 2, 1, or null
            previousViewId: null // Store the view we came from
        },
        stopCountdown: {
            countdown: null, // 3, 2, 1, or null
            previousViewId: null // Store the view we came from
        },
        files: {
            cursor: 0,
            sessionFiles: [
                { name: "SES001", date: "2025-01-15", time: "10:30:00" },
                { name: "SES002", date: "2025-01-14", time: "14:20:00" },
                { name: "SES003", date: "2025-01-13", time: "09:15:00" },
                { name: "SES004", date: "2025-01-12", time: "16:45:00" },
                { name: "SES005", date: "2025-01-11", time: "11:20:00" }
            ],
            configFiles: [
                { name: "CONFIG001", date: "2025-01-10", time: "09:15:00" },
                { name: "CONFIG002", date: "2025-01-09", time: "14:30:00" },
                { name: "CONFIG003", date: "2025-01-08", time: "10:00:00" }
            ],
            sessionDir: {
                selectedIndex: 0,
                scrollOffset: 0
            },
            configDir: {
                selectedIndex: 0,
                scrollOffset: 0
            },
            renameLastSession: {
                editing: false,
                filename: "SES001",
                cursorPosition: 0,
                originalFilename: "SES001",
                selectedSoftkeyIndex: 0, // 0 = "0.....9", 1 = "A.....H", 2 = "I.....Q", 3 = "R.....Z"
                previousMenuIndex: 2, // Store the files_menu selectedIndex when navigating to rename screen
                focus: "file_name" // "file_name" or "save" - controls which element is highlighted
            },
            saveConfig: {
                editing: false,
                filename: "CONFIG001",
                cursorPosition: 0,
                originalFilename: "CONFIG001",
                selectedSoftkeyIndex: 0, // 0 = "0.....9", 1 = "A.....H", 2 = "I.....Q", 3 = "R.....Z"
                focus: "file_name" // "file_name" or "save" - controls which element is highlighted
            },
            deleteConfirm: {
                selectedOption: "NO" // "YES" or "NO"
            },
            deleteStatus: {
                deletedFileName: ""
            },
            loadStatus: {
                loadedFileName: ""
            },
            renameStatus: {
                renamedFileName: ""
            },
            saveConfigStatus: {
                savedFileName: ""
            },
            formatCard: {
                selectedIndex: 0 // 0 = QUICK FORMAT, 1 = FULL FORMAT
            },
            formatStatus: {
                formatMessage: ""
            },
            errorStatus: {
                errorLine1: "",
                errorLine2: ""
            }
        },
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
        battery: { type: "ALK", level: 100, lastUpdateTime: null }, // "ALK" or "NiMH", level 0-100
        flags: { locked: false },
        measurement: { 
            runtime: 0, 
            state: "stopped", 
            isRunning: false, 
            currentSPL: null,
            seed: 12345,
            leq: null,
            lmax: null,
            lmin: null,
            sel: null,
            peak: null,
            dose: null,
            overRange: false,
            overRangeWarning: false,
            // Page 2 (Dose/Statistics) fields
            twa: null,
            pdse: null,
            ptwa: null,
            overloadPercent: null,
            exchangeRate: null,
            timeLimit: null,
            // Page 3 (Percentile Statistics) fields
            L99: null,
            L08: null,
            L50: null,
            L90: null,
            Ldn: null,
            Cnel: null,
            Tk3: null,
            LcMinusA: null,
            // Page 4 (Time History) fields
            splHistory: [],
            splHistoryMaxSamples: 300,
            // 1/1 Octave band data
            octaveBands: {
                'quarter': null,
                '16': null,
                '31.5': null,
                '63': null,
                '125': null,
                '250': null,
                '500': null,
                '1k': null,
                '2k': null,
                '4k': null,
                '8k': null,
                '16k': null
            },
            selectedOctaveBand: '125',
            // 1/3 Octave band data (31 bands)
            octaveBands1of3: {
                '12.5': null, '16': null, '20': null, '25': null, '31.5': null, '40': null,
                '50': null, '63': null, '80': null, '100': null, '125': null, '160': null,
                '200': null, '250': null, '315': null, '400': null, '500': null, '630': null,
                '800': null, '1k': null, '1.25k': null, '1.6k': null, '2k': null, '2.5k': null,
                '3.15k': null, '4k': null, '5k': null, '6.3k': null, '8k': null, '10k': null,
                '12.5k': null, '16k': null
            },
            selectedOctaveBand1of3: '1k'
        },
        slm: {
            currentPage: 1,           // 1-4
            mode: 'numeric',          // 'numeric', '1of1', '1of3'
            timeConstant: 'S',       // 'F', 'S', 'I'
            weighting: 'R',          // 'R', 'C', 'Z', 'F'
            activeMeter: 1,         // 1 or 2
            units: 'LAS'            // Format string: L + {A/C/Z/F} + {F/S/I}
        },
        history: [],
        previousViewId: null // For navigation back from cal/files/etc
    };

    // Helper functions for calibration persistence (defined before _state initialization)
    function _loadCalibrationFromStorage() {
        try {
            const saved = localStorage.getItem('soundMeter_lastCalibration');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate the structure
                if (parsed && typeof parsed.preCalValue === 'number' && parsed.timestamp && parsed.date && parsed.time) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('[CAL] Failed to load calibration from localStorage:', e);
        }
        return null;
    }

    function _saveCalibrationToStorage(calibration) {
        try {
            if (calibration && calibration.preCalValue !== undefined) {
                localStorage.setItem('soundMeter_lastCalibration', JSON.stringify(calibration));
                console.log('[CAL] Saved calibration to localStorage');
            }
        } catch (e) {
            console.warn('[CAL] Failed to save calibration to localStorage:', e);
        }
    }

    // Initialize calibration from localStorage (after helper functions are defined)
    _state.calibration = (function() {
        // Try to load from localStorage, fallback to default
        const saved = _loadCalibrationFromStorage();
        return {
            lastCalibration: saved || {
                preCalValue: 114.1,
                timestamp: "2025-11-06 11:48:44",
                date: "2025-11-06",
                time: "11:48:44"
            },
            selectedIndex: 0  // Currently selected item (0 = CALIBRATE, 1 = lastCalibration if exists)
        };
    })();

    const _subs = new Set();
    function _emit() { 
        const state = getState();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:293',message:'_emit called',data:{subscribers:_subs.size,viewId:state.viewId,selectedIndex:state.menu?.selectedIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.log('[FSM] _emit called, subscribers:', _subs.size);
        _subs.forEach(cb => {
            try {
                cb(state);
            } catch (error) {
                console.error('[FSM] Error in subscriber callback:', error);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:299',message:'_emit subscriber error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
            }
        });
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
            if (timerName === 'measurementRuntime' || timerName === 'measurementUpdate' || timerName === 'walkthroughCalRamp') {
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

    // Helper function to map FSM weighting to Measurement module weighting
    function _mapWeighting(w) {
        // Map FSM weighting to Measurement module weighting: R→A, C→C, Z→Z, F→A
        const mapping = { 'R': 'A', 'C': 'C', 'Z': 'Z', 'F': 'A' };
        return mapping[w] || 'A';
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

    // Measurement update loop (10Hz - 100ms intervals)
    function _startMeasurementUpdateLoop() {
        _stopMeasurementUpdateLoop();
        
        if (!window.Measurement) {
            console.warn('[FSM] Measurement module not available');
            return;
        }
        
        _state.timers.measurementUpdate = setInterval(() => {
            if (!_state.measurement.isRunning) {
                return; // Don't update if not running
            }
            
            // Check if audio analysis is active and providing SPL data
            const audioState = window.AudioPlayer?.getState?.();
            const audioAnalysisActive = audioState?.isPlaying && 
                                      window.AudioPlayer?._audioAnalysisState?.enabled;
            
            if (audioAnalysisActive) {
                // Audio analysis loop is feeding Measurement directly via requestAnimationFrame
                // Just sync results to FSM state (skip simulator)
            } else {
                // Fallback to simulator
                if (!window.Simulator) {
                    console.warn('[FSM] Simulator not available');
                    return;
                }
                
                // Generate SPL sample
                const spl = window.Simulator.generateSample();
                
                // Process sample
                window.Measurement.processSample(spl);
            }
            
            // Get results
            const results = window.Measurement.getResults();
            
            // Sync to FSM state
            _state.measurement.currentSPL = results.currentSPL;
            _state.measurement.leq = results.leq;
            _state.measurement.lmax = results.lmax;
            _state.measurement.lmin = results.lmin;
            _state.measurement.sel = results.sel;
            _state.measurement.peak = results.peak;
            _state.measurement.dose = results.dose;
            _state.measurement.overRange = results.overRange;
            _state.measurement.overRangeWarning = results.overRangeWarning;
            // Percentile statistics (Page 3)
            _state.measurement.L99 = results.L99;
            _state.measurement.L08 = results.L08;
            _state.measurement.L50 = results.L50;
            _state.measurement.L90 = results.L90;
            _state.measurement.Ldn = results.Ldn;
            _state.measurement.Cnel = results.Cnel;
            _state.measurement.Tk3 = results.Tk3;
            
            // Generate simulated octave band data (for 1/1 mode)
            // In real device, this would come from FFT analysis
            const baseSPL = results.currentSPL || 40;
            _state.measurement.octaveBands = {
                'quarter': baseSPL + (Math.random() * 10 - 5),
                '16': baseSPL - 20 + (Math.random() * 6 - 3),
                '31.5': baseSPL - 15 + (Math.random() * 6 - 3),
                '63': baseSPL - 10 + (Math.random() * 6 - 3),
                '125': baseSPL - 5 + (Math.random() * 6 - 3),
                '250': baseSPL - 2 + (Math.random() * 6 - 3),
                '500': baseSPL + (Math.random() * 6 - 3),
                '1k': baseSPL + 2 + (Math.random() * 6 - 3),
                '2k': baseSPL + 5 + (Math.random() * 6 - 3),
                '4k': baseSPL + 8 + (Math.random() * 6 - 3),
                '8k': baseSPL + 10 + (Math.random() * 6 - 3),
                '16k': baseSPL + 15 + (Math.random() * 6 - 3)
            };
            
            // Generate simulated 1/3 octave band data
            _state.measurement.octaveBands1of3 = {
                '12.5': baseSPL - 25 + (Math.random() * 6 - 3),
                '16': baseSPL - 22 + (Math.random() * 6 - 3),
                '20': baseSPL - 20 + (Math.random() * 6 - 3),
                '25': baseSPL - 18 + (Math.random() * 6 - 3),
                '31.5': baseSPL - 15 + (Math.random() * 6 - 3),
                '40': baseSPL - 13 + (Math.random() * 6 - 3),
                '50': baseSPL - 11 + (Math.random() * 6 - 3),
                '63': baseSPL - 10 + (Math.random() * 6 - 3),
                '80': baseSPL - 8 + (Math.random() * 6 - 3),
                '100': baseSPL - 6 + (Math.random() * 6 - 3),
                '125': baseSPL - 5 + (Math.random() * 6 - 3),
                '160': baseSPL - 4 + (Math.random() * 6 - 3),
                '200': baseSPL - 3 + (Math.random() * 6 - 3),
                '250': baseSPL - 2 + (Math.random() * 6 - 3),
                '315': baseSPL - 1 + (Math.random() * 6 - 3),
                '400': baseSPL + (Math.random() * 6 - 3),
                '500': baseSPL + (Math.random() * 6 - 3),
                '630': baseSPL + 1 + (Math.random() * 6 - 3),
                '800': baseSPL + 2 + (Math.random() * 6 - 3),
                '1k': baseSPL + 2 + (Math.random() * 6 - 3),
                '1.25k': baseSPL + 3 + (Math.random() * 6 - 3),
                '1.6k': baseSPL + 4 + (Math.random() * 6 - 3),
                '2k': baseSPL + 5 + (Math.random() * 6 - 3),
                '2.5k': baseSPL + 6 + (Math.random() * 6 - 3),
                '3.15k': baseSPL + 7 + (Math.random() * 6 - 3),
                '4k': baseSPL + 8 + (Math.random() * 6 - 3),
                '5k': baseSPL + 9 + (Math.random() * 6 - 3),
                '6.3k': baseSPL + 10 + (Math.random() * 6 - 3),
                '8k': baseSPL + 10 + (Math.random() * 6 - 3),
                '10k': baseSPL + 12 + (Math.random() * 6 - 3),
                '12.5k': baseSPL + 14 + (Math.random() * 6 - 3),
                '16k': baseSPL + 15 + (Math.random() * 6 - 3)
            };
            
            // Update splHistory for Page 4 time history graph
            _state.measurement.splHistory.push({
                time: Date.now(),
                spl: results.currentSPL
            });
            // Keep only last N samples (circular buffer)
            const maxSamples = _state.measurement.splHistoryMaxSamples || 300;
            if (_state.measurement.splHistory.length > maxSamples) {
                _state.measurement.splHistory.shift();
            }
            
            // Update battery drain (simulated)
            _updateBatteryDrain();
            
            // Trigger display update
            _emit();
        }, 100); // 10Hz update rate (1000ms / 10 = 100ms)
    }

    function _stopMeasurementUpdateLoop() {
        _clearTimer('measurementUpdate');
    }

    // Battery drain simulation
    // Simulates ~8 hours of battery life, 10% faster drain when backlight ON
    function _updateBatteryDrain() {
        const now = Date.now();
        if (!_state.battery.lastUpdateTime) {
            _state.battery.lastUpdateTime = now;
            return;
        }
        
        const elapsed = now - _state.battery.lastUpdateTime;
        _state.battery.lastUpdateTime = now;
        
        // Base drain: 100% over 8 hours = 0.00347% per second
        // With backlight: 10% faster = 0.00382% per second
        const baseDrainPerSecond = 100 / (8 * 60 * 60); // ~0.00347%
        const drainMultiplier = _state.backlight ? 1.1 : 1.0;
        const drainAmount = (elapsed / 1000) * baseDrainPerSecond * drainMultiplier;
        
        _state.battery.level = Math.max(0, _state.battery.level - drainAmount);
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
        return _state.viewId === "home_screen" || _state.viewId === "home_screen_dim";
    }

    function isSlm() {
        return _state.viewId && (
            _state.viewId.startsWith("slm_home") ||
            _state.viewId.startsWith("slm_graph_1of1") ||
            _state.viewId.startsWith("slm_graph_1of3")
        );
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
    
    /**
     * Get SLM screen ID based on page, mode, and run state
     * @param {number} page - Page number (1-4)
     * @param {string} mode - Mode ('numeric', '1of1', '1of3')
     * @param {string} runState - Run state ('running', 'paused', 'stopped')
     * @returns {string} Screen ID
     */
    function getSlmScreenId(page, mode, runState) {
        // Graph modes always include page suffix, even for page 1
        if (mode === '1of1' || mode === '1of3') {
            const pageSuffix = `_page${page}`; // Always include page suffix for graph modes
            const stateSuffix = runState === 'running' ? '_running' : runState === 'paused' ? '_paused' : '_stopped';
            const prefix = mode === '1of1' ? 'slm_graph_1of1' : 'slm_graph_1of3';
            return `${prefix}${pageSuffix}${stateSuffix}`;
        } else {
            // Numeric mode: page 1 has special naming (no suffix for running), pages 2-4 always include state suffix
            const pageSuffix = page === 1 ? '' : `_page${page}`;
            let stateSuffix;
            if (page === 1) {
                // Page 1: running has no suffix, paused/stopped have suffix
                stateSuffix = runState === 'running' ? '' : runState === 'paused' ? '_paused' : '_stopped';
            } else {
                // Pages 2-4: always include state suffix
                stateSuffix = runState === 'running' ? '_running' : runState === 'paused' ? '_paused' : '_stopped';
            }
            return `slm_home${pageSuffix}${stateSuffix}`;
        }
    }
    
    /**
     * Update SLM screen based on current page, mode, and run state
     */
    function updateSlmScreen() {
        const page = _state.slm?.currentPage || 1;
        const mode = _state.slm?.mode || 'numeric';
        const runState = _state.measurement?.state || 'stopped';
        _state.viewId = getSlmScreenId(page, mode, runState);
    }

    function initMainFSM() {
        const startAtHome = window.Config && window.Config.START_AT_HOME;
        _state = {
            viewId: startAtHome ? "home_screen_dim" : "OFF",
            backlight: false,
            mode: "SLM",
            menu: { selectedIndex: 0 },
            toast: null,
            slmLabelIndex: 0, // 0 = "SLM", 1 = "1/1", 2 = "1/3"
            slmSoundSettings: {
                visible: false,
                selectedIndex: 0,
                selectedType: null // Stores the selected measurement type: 'L_', 'L_AVG', 'L_PK', 'L_Mx', 'L_Mn'
            },
            timers: { stopHold: null, formatting: null, cal: null, measurementRuntime: null, measurementUpdate: null, powerOffCountdown: null, stopCountdown: null, walkthroughCalRamp: null },
            powerOff: {
                countdown: null, // 3, 2, 1, or null
                previousViewId: null // Store the view we came from
            },
            stopCountdown: {
                countdown: null, // 3, 2, 1, or null
                previousViewId: null // Store the view we came from
            },
            files: {
                cursor: 0,
                sessionFiles: [
                    { name: "SES001", date: "2025-01-15", time: "10:30:00" },
                    { name: "SES002", date: "2025-01-14", time: "14:20:00" },
                    { name: "SES003", date: "2025-01-13", time: "09:15:00" },
                    { name: "SES004", date: "2025-01-12", time: "16:45:00" },
                    { name: "SES005", date: "2025-01-11", time: "11:20:00" },
                    { name: "SES006", date: "2025-01-10", time: "08:45:00" },
                    { name: "SES007", date: "2025-01-09", time: "13:30:00" },
                    { name: "SES008", date: "2025-01-08", time: "15:20:00" },
                    { name: "SES009", date: "2025-01-07", time: "12:10:00" },
                    { name: "SES010", date: "2025-01-06", time: "09:55:00" },
                    { name: "SES011", date: "2025-01-05", time: "14:40:00" },
                    { name: "SES012", date: "2025-01-04", time: "11:25:00" },
                    { name: "SES013", date: "2025-01-03", time: "16:15:00" },
                    { name: "SES014", date: "2025-01-02", time: "10:05:00" },
                    { name: "SES015", date: "2025-01-01", time: "08:30:00" },
                    { name: "SES016", date: "2024-12-31", time: "17:20:00" },
                    { name: "SES017", date: "2024-12-30", time: "13:45:00" },
                    { name: "SES018", date: "2024-12-29", time: "11:10:00" },
                    { name: "SES019", date: "2024-12-28", time: "09:30:00" },
                    { name: "SES020", date: "2024-12-27", time: "15:55:00" },
                    { name: "SES021", date: "2024-12-26", time: "12:40:00" },
                    { name: "SES022", date: "2024-12-25", time: "10:15:00" },
                    { name: "SES023", date: "2024-12-24", time: "14:25:00" },
                    { name: "SES024", date: "2024-12-23", time: "08:50:00" },
                    { name: "SES025", date: "2024-12-22", time: "16:30:00" }
                ],
                configFiles: [
                    { name: "CONFIG001", date: "2025-01-10", time: "09:15:00" },
                    { name: "CONFIG002", date: "2025-01-09", time: "14:30:00" },
                    { name: "CONFIG003", date: "2025-01-08", time: "10:00:00" }
                ],
                sessionDir: {
                    selectedIndex: 0,
                    scrollOffset: 0
                },
                configDir: {
                    selectedIndex: 0,
                    scrollOffset: 0
                },
                renameLastSession: {
                    editing: false,
                    filename: "SES001",
                    cursorPosition: 0,
                    originalFilename: "SES001",
                    selectedSoftkeyIndex: 0,
                    previousMenuIndex: 2,
                    focus: "file_name"
                },
                saveConfig: {
                    editing: false,
                    filename: "CONFIG001",
                    cursorPosition: 0,
                    originalFilename: "CONFIG001",
                    selectedSoftkeyIndex: 0,
                    focus: "file_name"
                },
                deleteConfirm: {
                    selectedOption: "NO"
                },
                deleteStatus: {
                    deletedFileName: ""
                },
                renameStatus: {
                    renamedFileName: ""
                },
                saveConfigStatus: {
                    savedFileName: ""
                },
                formatCard: {
                    selectedIndex: 0
                },
                formatStatus: {
                    formatMessage: ""
                },
                errorStatus: {
                    errorLine1: "",
                    errorLine2: ""
                }
            },
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
            battery: { type: "ALK", level: 100, lastUpdateTime: null },
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
                currentSPL: null,
                seed: 12345,
                leq: null,
                lmax: null,
                lmin: null,
                sel: null,
                peak: null,
                dose: null,
                overRange: false,
                overRangeWarning: false,
                // Page 2 (Dose/Statistics) fields
                twa: null,
                pdse: null,
                ptwa: null,
                overloadPercent: null,
                exchangeRate: 'P2S',
                timeLimit: '00:00:00',
                // Page 3 (Percentile Statistics) fields
                L01: null,
                L10: null,
                L50: null,
                L90: null,
                Ldn: null,
                Cnel: null,
                Tk3: null,
                LcMinusA: null,
                // Page 4 (Time History) fields
                splHistory: [],
                splHistoryMaxSamples: 300
            },
            slm: {
                currentPage: 1,           // 1-4
                mode: 'numeric',          // 'numeric', '1of1', '1of3'
                timeConstant: 'S',       // 'F', 'S', 'I'
                weighting: 'R',          // 'R', 'C', 'Z', 'F'
                activeMeter: 1,         // 1 or 2
                units: 'LAS'            // Format string: L + {A/C/Z/F} + {F/S/I}
            },
            history: [],
            previousViewId: null,
            calibration: (function() {
                // Try to load from localStorage, fallback to default
                const saved = _loadCalibrationFromStorage();
                return {
                    lastCalibration: saved || {
                        preCalValue: 114.1,
                        timestamp: "2025-11-06 11:48:44",
                        date: "2025-11-06",
                        time: "11:48:44"
                    },
                    selectedIndex: 0
                };
            })()
        };
        _clearAllTimers();
        
        // Initialize Simulator module
        if (window.Simulator) {
            const seed = _state.measurement.seed || 12345;
            // Check if audio is playing - preserve its baseLevel and impulse pattern, otherwise use ambient
            const audioState = window.AudioPlayer?.getState?.();
            const simState = window.Simulator.getState();
            
            if (audioState && audioState.isPlaying) {
                // Audio is playing - preserve current simulator settings including impulse pattern
                window.Simulator.init(seed, { 
                    baseLevel: simState.baseLevel || 47, 
                    variation: simState.variation || 3,
                    impulsePattern: simState.impulsePattern || null
                });
            } else {
                // No audio playing - use ambient levels, no impulse pattern
                window.Simulator.init(seed, { baseLevel: 47, variation: 3 });
            }
        }
        
        // Initialize Measurement module
        if (window.Measurement) {
            window.Measurement.init({
                weighting: _mapWeighting(_state.slm.weighting),
                timeConstant: _state.slm.timeConstant,
                range: 80, // Default range (can be updated if range is stored in state)
                dose: {
                    exchangeRate: 3,
                    threshold: 50,
                    criterionLevel: 70
                }
            });
        }
        
        _emit();
    }

    function subscribe(cb) {
        console.log('[FSM] subscribe called, adding callback, current subscribers:', _subs.size);
        _subs.add(cb);
        // Immediately call callback with current state so new subscribers get initial state
        const initialState = getState();
        console.log('[FSM] Calling callback immediately with initial state, viewId:', initialState.viewId);
        try {
            cb(initialState);
        } catch (error) {
            console.error('[FSM] Error calling subscriber callback:', error);
        }
        return () => {
            console.log('[FSM] Unsubscribing callback');
            _subs.delete(cb);
        };
    }

    function getState() {
        return JSON.parse(JSON.stringify(_state));
    }

    // Stop hold timer
    function _startStopHoldTimer() {
        _clearTimer('stopHold');
        _clearTimer('stopCountdown');
        
        console.log('[FSM] STOP_HOLD_START: Starting stop countdown');
        _state.stopCountdown.previousViewId = _state.viewId;
        _state.stopCountdown.countdown = 3;
        _state.viewId = "stop_confirm";
        // Preserve current backlight state - don't change it
        _emit();
        
        // Start countdown timer (update every second)
        let countdownValue = 3;
        const countdownInterval = setInterval(() => {
            countdownValue--;
            if (countdownValue > 0) {
                _state.stopCountdown.countdown = countdownValue;
                _emit();
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Store interval ID for cleanup
        _state.timers.stopCountdown = countdownInterval;

        _state.timers.stopHold = setTimeout(() => {
            // Clear countdown timer
            if (_state.timers.stopCountdown) {
                clearInterval(_state.timers.stopCountdown);
                _state.timers.stopCountdown = null;
            }
            
            // Stop Measurement and reset Simulator
            if (window.Measurement) {
                window.Measurement.stop();
            }
            if (window.Simulator) {
                window.Simulator.reset();
            }
            _stopMeasurementUpdateLoop();
            _state.measurement.state = "stopped";
            _state.measurement.isRunning = false;
            _state.measurement.runtime = 0; // Reset timer to 0 when stopping
            _stopMeasurementTimer();
            updateSlmScreen();
            _clearTimer('stopHold');
            _state.stopCountdown.countdown = null;
            _state.stopCountdown.previousViewId = null;
            // Don't show toast - "Save & Clear" is already shown during countdown
            _emit();
        }, 3000);
    }

    function dispatch(evt) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:620',message:'dispatch entry',data:{eventType:evt.type,locked:_state.flags.locked,viewId:_state.viewId,selectedIndex:_state.menu?.selectedIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (typeof window.shouldBlockWalkthroughEvent === 'function' && window.shouldBlockWalkthroughEvent(evt, _state)) {
            return;
        }

        if (_state.flags.locked && evt.type !== "LOCK_SOFTKEY") {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:622',message:'dispatch blocked by lock',data:{eventType:evt.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return; // Ignore input when locked (except unlock)
        }

        switch (evt.type) {
            case "POWER":
                console.log('[FSM] POWER event received, current viewId:', _state.viewId);
                if (_state.viewId === "OFF") {
                    console.log('[FSM] Powering on: OFF → boot_screen');
                    _state.viewId = "boot_screen";
                    _state.backlight = false;
                    _emit();
                    const bootDuration = 800 + Math.random() * 400; // 800-1200ms (longer to allow zoom animation)
                    console.log('[FSM] Boot duration:', bootDuration, 'ms');
                    setTimeout(() => {
                        console.log('[FSM] Boot complete: boot_screen → home_screen_dim');
                        _state.viewId = "home_screen_dim";
                        _state.backlight = false;
                        _emit();
                    }, bootDuration);
                } else {
                    console.log('[FSM] POWER event ignored - device not OFF, current viewId:', _state.viewId);
                }
                break;

            case "POWER_HOLD_START":
                // Start 3-second countdown for power off
                if (isHome()) {
                    console.log('[FSM] POWER_HOLD_START: Starting power-off countdown');
                    _state.powerOff.previousViewId = _state.viewId;
                    _state.powerOff.countdown = 3;
                    _state.viewId = "power_off_countdown";
                    // Preserve current backlight state - don't change it
                    _emit();
                    
                    // Start countdown timer (update every second)
                    let countdownValue = 3;
                    const countdownInterval = setInterval(() => {
                        countdownValue--;
                        if (countdownValue > 0) {
                            _state.powerOff.countdown = countdownValue;
                            _emit();
                        } else {
                            clearInterval(countdownInterval);
                        }
                    }, 1000);
                    
                    // Store interval ID for cleanup
                    _state.timers.powerOffCountdown = countdownInterval;
                }
                break;

            case "POWER_HOLD_COMPLETE":
                // Countdown completed, power off
                console.log('[FSM] POWER_HOLD_COMPLETE: Powering off device');
                
                // Clear countdown timer if still running
                if (_state.timers.powerOffCountdown) {
                    clearInterval(_state.timers.powerOffCountdown);
                    _state.timers.powerOffCountdown = null;
                }
                
                // Power off via device.js
                if (window.powerOff) {
                    window.powerOff();
                }
                
                // Reset state
                _state.viewId = "OFF";
                _state.backlight = false;
                _state.powerOff.countdown = null;
                _state.powerOff.previousViewId = null;
                _emit();
                
                // Reset mainFSM
                if (window.initMainFSM) {
                    window.initMainFSM();
                }
                break;

            case "POWER_HOLD_CANCEL":
                // Cancel countdown, return to previous screen
                console.log('[FSM] POWER_HOLD_CANCEL: Cancelling power-off countdown');
                
                // Clear countdown timer if still running
                if (_state.timers.powerOffCountdown) {
                    clearInterval(_state.timers.powerOffCountdown);
                    _state.timers.powerOffCountdown = null;
                }
                
                // Return to previous screen
                if (_state.powerOff.previousViewId) {
                    _state.viewId = _state.powerOff.previousViewId;
                    _state.powerOff.previousViewId = null;
                } else {
                    // Fallback to home screen
                    _state.viewId = "home_screen_dim";
                }
                _state.powerOff.countdown = null;
                _emit();
                break;

            case "BACKLIGHT":
                // Toggle backlight on all screens (except OFF)
                if (_state.viewId === "OFF" || _state.viewId === "boot_screen") {
                    // Don't toggle backlight when powered off or during boot
                    break;
                }
                
                // Toggle backlight state
                _state.backlight = !_state.backlight;
                
                // For home screen, also toggle between dim and bright variants
                if (_state.viewId === "home_screen_dim" && _state.backlight) {
                    _state.viewId = "home_screen";
                } else if (_state.viewId === "home_screen" && !_state.backlight) {
                    _state.viewId = "home_screen_dim";
                }
                
                console.log(`[FSM] BACKLIGHT: Toggled to ${_state.backlight ? 'ON' : 'OFF'} on screen ${_state.viewId}`);
                _emit();
                break;

            case "UP":
                // Handle overlay menu navigation
                if (isSlm() && _state.slmSoundSettings && _state.slmSoundSettings.visible) {
                    // 5 items: L_, L_AVG, L_PK, L_Mx, L_Mn
                    _state.slmSoundSettings.selectedIndex = (_state.slmSoundSettings.selectedIndex - 1 + 5) % 5;
                    _emit();
                    break;
                }
                // UP/DOWN do not handle SLM page navigation - ENTER cycles pages
                if (isSlm()) {
                    // UP/DOWN have no effect on page navigation in SLM mode
                    break;
                }
                // Handle UP arrow on calibration running screen - increase SPL value
                if (_state.viewId === "cal_running") {
                    // Mark as manually adjusted to stop all automatic variation and adjustment
                    if (!_state.calibration.adjustment) {
                        _state.calibration.adjustment = {};
                    }
                    _state.calibration.adjustment.manuallyAdjusted = true;
                    _state.calibration.adjustment.stabilized = true; // Also mark as stabilized
                    
                    // Increase SPL by 0.1dB, capped at 140dB
                    const current = _state.measurement.currentSPL || 114;
                    _state.measurement.currentSPL = Math.min(140, Math.round((current + 0.1) * 10) / 10);
                    console.log(`[CAL] UP: SPL = ${_state.measurement.currentSPL.toFixed(1)}dB (manual control - no variation)`);
                    _emit();
                    break;
                }
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
                } else if (_state.viewId === "cal_menu") {
                    // UP: navigate through calibration menu
                    // Ensure calibration state exists
                    if (!_state.calibration) {
                        _state.calibration = {
                            history: [
                                {
                                    id: 1,
                                    preCalValue: 114.0,
                                    timestamp: "2025-10-30 13:45:21",
                                    date: "2025-10-30",
                                    time: "13:45:21"
                                }
                            ],
                            selectedIndex: 0
                        };
                    }
                    // Navigation: index 0 = CALIBRATE, index 1 = lastCalibration (if exists)
                    const totalItems = _state.calibration.lastCalibration ? 2 : 1; // CALIBRATE + lastCalibration (if exists)
                    _state.calibration.selectedIndex = (_state.calibration.selectedIndex + totalItems - 1) % totalItems;
                    console.log(`[CAL] Calibration menu UP - Selected index: ${_state.calibration.selectedIndex} (total items: ${totalItems}, 0=CALIBRATE, 1=lastCalibration)`);
                    _emit();
                } else if (_state.viewId === "files_menu") {
                    const currentIndex = Math.max(0, Math.min(_state.menu.selectedIndex, FILES_MENU_ITEMS.length - 1));
                    const newIndex = (currentIndex + FILES_MENU_ITEMS.length - 1) % FILES_MENU_ITEMS.length;
                    _state.menu.selectedIndex = newIndex;
                    console.log(`[MENU] Files menu UP - Selected index: ${currentIndex} → ${newIndex} → "${FILES_MENU_ITEMS[newIndex]}" (total items: ${FILES_MENU_ITEMS.length})`);
                    _emit();
                } else if (_state.viewId === "files_format_card") {
                    // UP: cycle between QUICK FORMAT (0) and FULL FORMAT (1)
                    const currentIndex = _state.files.formatCard.selectedIndex;
                    const newIndex = (currentIndex + 1) % 2; // Toggle between 0 and 1
                    _state.files.formatCard.selectedIndex = newIndex;
                    const options = ["QUICK FORMAT", "FULL FORMAT"];
                    console.log(`[FILES] Format Card UP - Selected index: ${currentIndex} → ${newIndex} → "${options[newIndex]}"`);
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
                        // Reset editing state when navigating between items
                        if (_state.display.editing) {
                            _state.display.editing = false;
                            _state.display.focus = "title";
                        }
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
                        // Cycle through TIME and DATE only (skip DAY)
                        // TIME is index 0, DATE is index 1, DAY is index 2
                        if (_state.datetime.selectedIndex === 0) {
                            // TIME → DATE (cycle back)
                            _state.datetime.selectedIndex = 1;
                        } else if (_state.datetime.selectedIndex === 1) {
                            // DATE → TIME
                            _state.datetime.selectedIndex = 0;
                        } else {
                            // If somehow on DAY (index 2), go to TIME
                            _state.datetime.selectedIndex = 0;
                        }
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
                    const currentIndex = Math.max(0, Math.min(_state.menu.selectedIndex, MENU_ITEMS.length - 1));
                    const newIndex = (currentIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
                    _state.menu.selectedIndex = newIndex;
                    console.log(`[MENU] Home menu UP - Selected index: ${currentIndex} → ${newIndex} → "${MENU_ITEMS[newIndex]}" (total items: ${MENU_ITEMS.length})`);
                    console.log(`[MENU] All items: ${MENU_ITEMS.map((item, idx) => `${idx}:${item}`).join(', ')}`);
                    console.log(`[MENU] State after update: _state.menu.selectedIndex = ${_state.menu.selectedIndex}`);
                    _emit();
                } else if (_state.viewId === "files_session_dir") {
                    const fileList = _state.files.sessionFiles;
                    if (fileList.length > 0) {
                        // UP: cycle through all files sequentially, wrapping at top
                        const currentIndex = _state.files.sessionDir.selectedIndex;
                        const newIndex = currentIndex === 0 ? 
                            Math.min(9, fileList.length - 1) : // Wrap to last visible (9 or last file)
                            currentIndex - 1;
                        _state.files.sessionDir.selectedIndex = newIndex;
                        // Update scroll offset if needed (show 10 items at a time in 2 columns)
                        const maxVisible = 10;
                        if (_state.files.sessionDir.selectedIndex < _state.files.sessionDir.scrollOffset) {
                            _state.files.sessionDir.scrollOffset = Math.max(0, _state.files.sessionDir.selectedIndex);
                        }
                        console.log(`[FILES] Session Directory UP: Selected index: ${_state.files.sessionDir.selectedIndex}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_config_dir") {
                    const fileList = _state.files.configFiles;
                    if (fileList.length > 0) {
                        _state.files.configDir.selectedIndex = Math.max(0, _state.files.configDir.selectedIndex - 1);
                        // Update scroll offset if needed
                        if (_state.files.configDir.selectedIndex < _state.files.configDir.scrollOffset) {
                            _state.files.configDir.scrollOffset = _state.files.configDir.selectedIndex;
                        }
                        console.log(`[FILES] Config Directory UP: Selected index: ${_state.files.configDir.selectedIndex}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) {
                    // UP arrow: cycle to next character in selected softkey group (or next group if at end)
                    const softkeyGroups = [
                        ["0","1","2","3","4","5","6","7","8","9"],
                        ["A","B","C","D","E","F","G","H"],
                        ["I","J","K","L","M","N","O","P","Q"],
                        ["R","S","T","U","V","W","X","Y","Z"]
                    ];
                    let softkeyIndex = _state.files.renameLastSession.selectedSoftkeyIndex || 0;
                    let charGroup = softkeyGroups[softkeyIndex];
                    const filename = _state.files.renameLastSession.filename;
                    const cursorPos = _state.files.renameLastSession.cursorPosition;
                    const currentChar = filename[cursorPos] || "";
                    let currentIndex = charGroup.indexOf(currentChar.toUpperCase());
                    
                    // If not found in current group, try to find it in any group
                    if (currentIndex < 0) {
                        for (let i = 0; i < softkeyGroups.length; i++) {
                            const idx = softkeyGroups[i].indexOf(currentChar.toUpperCase());
                            if (idx >= 0) {
                                softkeyIndex = i;
                                charGroup = softkeyGroups[i];
                                currentIndex = idx;
                                break;
                            }
                        }
                        // If still not found, use first char of current group
                        if (currentIndex < 0) {
                            currentIndex = -1;
                        }
                    }
                    
                    // Move to next character in current group
                    let nextIndex = currentIndex < 0 ? 0 : currentIndex + 1;
                    let newChar;
                    
                    // If at end of current group, jump to next group
                    if (nextIndex >= charGroup.length) {
                        if (softkeyIndex < softkeyGroups.length - 1) {
                            // Move to next softkey group, start at first character
                            softkeyIndex = softkeyIndex + 1;
                            charGroup = softkeyGroups[softkeyIndex];
                            _state.files.renameLastSession.selectedSoftkeyIndex = softkeyIndex;
                            newChar = charGroup[0];
                            console.log(`[FILES] Rename UP: Jumped to softkey group ${softkeyIndex}, changed character at position ${cursorPos} to '${newChar}'`);
                        } else {
                            // Already at last group (Z), wrap to first softkey group and start at 0
                            softkeyIndex = 0;
                            charGroup = softkeyGroups[0];
                            _state.files.renameLastSession.selectedSoftkeyIndex = 0;
                            newChar = charGroup[0];
                            console.log(`[FILES] Rename UP: Wrapped to softkey group 0, changed character at position ${cursorPos} to '${newChar}'`);
                        }
                    } else {
                        newChar = charGroup[nextIndex];
                    }
                    
                    // Replace character at cursor position
                    const newFilename = filename.slice(0, cursorPos) + newChar + filename.slice(cursorPos + 1);
                    _state.files.renameLastSession.filename = newFilename;
                    if (nextIndex < charGroup.length) {
                        console.log(`[FILES] Rename UP: Changed character at position ${cursorPos} to '${newChar}'`);
                    }
                    _emit();
                } else if (_state.viewId === "files_save_config" && _state.files.saveConfig.editing) {
                    // UP arrow: cycle to next character in selected softkey group
                    const softkeyGroups = [
                        ["0","1","2","3","4","5","6","7","8","9"],
                        ["A","B","C","D","E","F","G","H"],
                        ["I","J","K","L","M","N","O","P","Q"],
                        ["R","S","T","U","V","W","X","Y","Z"]
                    ];
                    let softkeyIndex = _state.files.saveConfig.selectedSoftkeyIndex || 0;
                    let charGroup = softkeyGroups[softkeyIndex];
                    const filename = _state.files.saveConfig.filename;
                    const cursorPos = _state.files.saveConfig.cursorPosition;
                    const currentChar = filename[cursorPos] || "";
                    let currentIndex = charGroup.indexOf(currentChar.toUpperCase());
                    
                    // If not found in current group, try to find it in any group
                    if (currentIndex < 0) {
                        for (let i = 0; i < softkeyGroups.length; i++) {
                            const idx = softkeyGroups[i].indexOf(currentChar.toUpperCase());
                            if (idx >= 0) {
                                softkeyIndex = i;
                                charGroup = softkeyGroups[i];
                                currentIndex = idx;
                                break;
                            }
                        }
                        // If still not found, use first char of current group
                        if (currentIndex < 0) {
                            currentIndex = -1;
                        }
                    }
                    
                    // Move to next character in current group
                    let nextIndex = currentIndex < 0 ? 0 : currentIndex + 1;
                    let newChar;
                    
                    // If at end of current group, jump to next group
                    if (nextIndex >= charGroup.length) {
                        if (softkeyIndex < softkeyGroups.length - 1) {
                            // Move to next softkey group, start at first character
                            softkeyIndex = softkeyIndex + 1;
                            charGroup = softkeyGroups[softkeyIndex];
                            _state.files.saveConfig.selectedSoftkeyIndex = softkeyIndex;
                            newChar = charGroup[0];
                            console.log(`[FILES] Save Config UP: Jumped to softkey group ${softkeyIndex}, changed character at position ${cursorPos} to '${newChar}'`);
                        } else {
                            // Already at last group (Z), wrap to first softkey group and start at 0
                            softkeyIndex = 0;
                            charGroup = softkeyGroups[0];
                            _state.files.saveConfig.selectedSoftkeyIndex = 0;
                            newChar = charGroup[0];
                            console.log(`[FILES] Save Config UP: Wrapped to softkey group 0, changed character at position ${cursorPos} to '${newChar}'`);
                        }
                    } else {
                        newChar = charGroup[nextIndex];
                    }
                    
                    // Replace character at cursor position
                    const newFilename = filename.slice(0, cursorPos) + newChar + filename.slice(cursorPos + 1);
                    _state.files.saveConfig.filename = newFilename;
                    if (nextIndex < charGroup.length) {
                        console.log(`[FILES] Save Config UP: Changed character at position ${cursorPos} to '${newChar}'`);
                    }
                    _emit();
                } else if (_state.viewId === "files_session_dir") {
                    // LEFT arrow: move to left column (same row position)
                    const fileList = _state.files.sessionFiles;
                    if (fileList.length > 5) {
                        const currentIndex = _state.files.sessionDir.selectedIndex;
                        if (currentIndex >= 5 && currentIndex < 10) {
                            // In right column: move to left column (same row: 0-4)
                            const rowInRightColumn = currentIndex - 5;
                            const newIndex = Math.min(4, rowInRightColumn);
                            _state.files.sessionDir.selectedIndex = newIndex;
                            console.log(`[FILES] Session Directory LEFT: Moved from right column (${currentIndex}) to left column (${newIndex})`);
                            _emit();
                        } else if (currentIndex < 5) {
                            // Already in left column: do nothing or wrap to right column
                            // Optionally wrap to right column at same row
                            const newIndex = currentIndex + 5;
                            if (newIndex < fileList.length) {
                                _state.files.sessionDir.selectedIndex = newIndex;
                                console.log(`[FILES] Session Directory LEFT: Wrapped from left column (${currentIndex}) to right column (${newIndex})`);
                                _emit();
                            }
                        }
                    }
                }
                break;

            case "DOWN":
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:1145',message:'DOWN case entry',data:{viewId:_state.viewId,isSlm:isSlm(),isHome:isHome(),selectedIndex:_state.menu?.selectedIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                // Handle overlay menu navigation
                if (isSlm() && _state.slmSoundSettings && _state.slmSoundSettings.visible) {
                    // 5 items: L_, L_AVG, L_PK, L_Mx, L_Mn
                    _state.slmSoundSettings.selectedIndex = (_state.slmSoundSettings.selectedIndex + 1) % 5;
                    _emit();
                    break;
                }
                // UP/DOWN do not handle SLM page navigation - ENTER cycles pages
                if (isSlm()) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:1147',message:'DOWN blocked by isSlm',data:{viewId:_state.viewId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    // UP/DOWN have no effect on page navigation in SLM mode
                    break;
                }
                // Handle DOWN arrow on calibration running screen - decrease SPL value
                if (_state.viewId === "cal_running") {
                    // Mark as manually adjusted to stop all automatic variation and adjustment
                    if (!_state.calibration.adjustment) {
                        _state.calibration.adjustment = {};
                    }
                    _state.calibration.adjustment.manuallyAdjusted = true;
                    _state.calibration.adjustment.stabilized = true; // Also mark as stabilized
                    
                    // Decrease SPL by 0.1dB, minimum at 50dB (matching bar meter range)
                    const current = _state.measurement.currentSPL || 114;
                    _state.measurement.currentSPL = Math.max(50, Math.round((current - 0.1) * 10) / 10);
                    console.log(`[CAL] DOWN: SPL = ${_state.measurement.currentSPL.toFixed(1)}dB (manual control - no variation)`);
                    _emit();
                    break;
                }
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
                } else if (_state.viewId === "cal_menu") {
                    // DOWN: navigate through calibration menu
                    // Ensure calibration state exists
                    if (!_state.calibration) {
                        _state.calibration = {
                            history: [
                                {
                                    id: 1,
                                    preCalValue: 114.0,
                                    timestamp: "2025-10-30 13:45:21",
                                    date: "2025-10-30",
                                    time: "13:45:21"
                                }
                            ],
                            selectedIndex: 0
                        };
                    }
                    // Navigation: index 0 = CALIBRATE, index 1 = lastCalibration (if exists)
                    const totalItems = _state.calibration.lastCalibration ? 2 : 1; // CALIBRATE + lastCalibration (if exists)
                    _state.calibration.selectedIndex = (_state.calibration.selectedIndex + 1) % totalItems;
                    console.log(`[CAL] Calibration menu DOWN - Selected index: ${_state.calibration.selectedIndex} (total items: ${totalItems}, 0=CALIBRATE, 1=lastCalibration)`);
                    _emit();
                } else if (_state.viewId === "files_menu") {
                    const currentIndex = Math.max(0, Math.min(_state.menu.selectedIndex, FILES_MENU_ITEMS.length - 1));
                    const newIndex = (currentIndex + 1) % FILES_MENU_ITEMS.length;
                    _state.menu.selectedIndex = newIndex;
                    console.log(`[MENU] Files menu DOWN - Selected index: ${currentIndex} → ${newIndex} → "${FILES_MENU_ITEMS[newIndex]}" (total items: ${FILES_MENU_ITEMS.length})`);
                    _emit();
                } else if (_state.viewId === "files_format_card") {
                    // DOWN: cycle between QUICK FORMAT (0) and FULL FORMAT (1)
                    const currentIndex = _state.files.formatCard.selectedIndex;
                    const newIndex = (currentIndex + 1) % 2; // Toggle between 0 and 1
                    _state.files.formatCard.selectedIndex = newIndex;
                    const options = ["QUICK FORMAT", "FULL FORMAT"];
                    console.log(`[FILES] Format Card DOWN - Selected index: ${currentIndex} → ${newIndex} → "${options[newIndex]}"`);
                    _emit();
                } else if (_state.viewId === "files_session_dir") {
                    const fileList = _state.files.sessionFiles;
                    if (fileList.length > 0) {
                        // DOWN: cycle through all files sequentially, wrapping at bottom
                        const currentIndex = _state.files.sessionDir.selectedIndex;
                        const maxVisible = 10;
                        const lastVisibleIndex = Math.min(maxVisible - 1, fileList.length - 1);
                        const newIndex = currentIndex >= lastVisibleIndex ? 
                            0 : // Wrap to first file (0)
                            currentIndex + 1;
                        _state.files.sessionDir.selectedIndex = newIndex;
                        // Update scroll offset if needed (show 10 items at a time in 2 columns, adjust offset)
                        if (_state.files.sessionDir.selectedIndex >= _state.files.sessionDir.scrollOffset + maxVisible) {
                            _state.files.sessionDir.scrollOffset = _state.files.sessionDir.selectedIndex - maxVisible + 1;
                        }
                        console.log(`[FILES] Session Directory DOWN: Selected index: ${_state.files.sessionDir.selectedIndex}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_config_dir") {
                    const fileList = _state.files.configFiles;
                    if (fileList.length > 0) {
                        _state.files.configDir.selectedIndex = Math.min(fileList.length - 1, _state.files.configDir.selectedIndex + 1);
                        // Update scroll offset if needed
                        const maxVisible = 8;
                        if (_state.files.configDir.selectedIndex >= _state.files.configDir.scrollOffset + maxVisible) {
                            _state.files.configDir.scrollOffset = _state.files.configDir.selectedIndex - maxVisible + 1;
                        }
                        console.log(`[FILES] Config Directory DOWN: Selected index: ${_state.files.configDir.selectedIndex}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) {
                    // DOWN arrow: cycle to previous character in selected softkey group (or previous group if at start)
                    const softkeyGroups = [
                        ["0","1","2","3","4","5","6","7","8","9"],
                        ["A","B","C","D","E","F","G","H"],
                        ["I","J","K","L","M","N","O","P","Q"],
                        ["R","S","T","U","V","W","X","Y","Z"]
                    ];
                    let softkeyIndex = _state.files.renameLastSession.selectedSoftkeyIndex || 0;
                    let charGroup = softkeyGroups[softkeyIndex];
                    const filename = _state.files.renameLastSession.filename;
                    const cursorPos = _state.files.renameLastSession.cursorPosition;
                    const currentChar = filename[cursorPos] || "";
                    let currentIndex = charGroup.indexOf(currentChar.toUpperCase());
                    
                    // If not found in current group, try to find it in any group
                    if (currentIndex < 0) {
                        for (let i = 0; i < softkeyGroups.length; i++) {
                            const idx = softkeyGroups[i].indexOf(currentChar.toUpperCase());
                            if (idx >= 0) {
                                softkeyIndex = i;
                                charGroup = softkeyGroups[i];
                                currentIndex = idx;
                                break;
                            }
                        }
                        // If still not found, use last char of current group
                        if (currentIndex < 0) {
                            currentIndex = charGroup.length;
                        }
                    }
                    
                    // Move to previous character in current group
                    let prevIndex = currentIndex - 1;
                    let newChar;
                    
                    // If at start of current group, jump to previous group
                    if (prevIndex < 0) {
                        if (softkeyIndex > 0) {
                            // Move to previous softkey group, start at last character
                            softkeyIndex = softkeyIndex - 1;
                            charGroup = softkeyGroups[softkeyIndex];
                            _state.files.renameLastSession.selectedSoftkeyIndex = softkeyIndex;
                            newChar = charGroup[charGroup.length - 1];
                            console.log(`[FILES] Rename DOWN: Jumped to softkey group ${softkeyIndex}, changed character at position ${cursorPos} to '${newChar}'`);
                        } else {
                            // Already at first group (0), wrap to last softkey group and start at Z
                            softkeyIndex = softkeyGroups.length - 1;
                            charGroup = softkeyGroups[softkeyIndex];
                            _state.files.renameLastSession.selectedSoftkeyIndex = softkeyIndex;
                            newChar = charGroup[charGroup.length - 1];
                            console.log(`[FILES] Rename DOWN: Wrapped to softkey group ${softkeyIndex}, changed character at position ${cursorPos} to '${newChar}'`);
                        }
                    } else {
                        newChar = charGroup[prevIndex];
                    }
                    
                    // Replace character at cursor position
                    const newFilename = filename.slice(0, cursorPos) + newChar + filename.slice(cursorPos + 1);
                    _state.files.renameLastSession.filename = newFilename;
                    if (prevIndex >= 0) {
                        console.log(`[FILES] Rename DOWN: Changed character at position ${cursorPos} to '${newChar}'`);
                    }
                    _emit();
                } else if (_state.viewId === "files_save_config" && _state.files.saveConfig.editing) {
                    // DOWN arrow: cycle to previous character in selected softkey group (or previous group if at start)
                    const softkeyGroups = [
                        ["0","1","2","3","4","5","6","7","8","9"],
                        ["A","B","C","D","E","F","G","H"],
                        ["I","J","K","L","M","N","O","P","Q"],
                        ["R","S","T","U","V","W","X","Y","Z"]
                    ];
                    let softkeyIndex = _state.files.saveConfig.selectedSoftkeyIndex || 0;
                    let charGroup = softkeyGroups[softkeyIndex];
                    const filename = _state.files.saveConfig.filename;
                    const cursorPos = _state.files.saveConfig.cursorPosition;
                    const currentChar = filename[cursorPos] || "";
                    let currentIndex = charGroup.indexOf(currentChar.toUpperCase());
                    
                    // If not found in current group, try to find it in any group
                    if (currentIndex < 0) {
                        for (let i = 0; i < softkeyGroups.length; i++) {
                            const idx = softkeyGroups[i].indexOf(currentChar.toUpperCase());
                            if (idx >= 0) {
                                softkeyIndex = i;
                                charGroup = softkeyGroups[i];
                                currentIndex = idx;
                                break;
                            }
                        }
                        // If still not found, use last char of current group
                        if (currentIndex < 0) {
                            currentIndex = charGroup.length;
                        }
                    }
                    
                    // Move to previous character in current group
                    let prevIndex = currentIndex - 1;
                    let newChar;
                    
                    // If at start of current group, jump to previous group
                    if (prevIndex < 0) {
                        if (softkeyIndex > 0) {
                            // Move to previous softkey group, start at last character
                            softkeyIndex = softkeyIndex - 1;
                            charGroup = softkeyGroups[softkeyIndex];
                            _state.files.saveConfig.selectedSoftkeyIndex = softkeyIndex;
                            newChar = charGroup[charGroup.length - 1];
                            console.log(`[FILES] Save Config DOWN: Jumped to softkey group ${softkeyIndex}, changed character at position ${cursorPos} to '${newChar}'`);
                        } else {
                            // Already at first group (0), wrap to last softkey group and start at Z
                            softkeyIndex = softkeyGroups.length - 1;
                            charGroup = softkeyGroups[softkeyIndex];
                            _state.files.saveConfig.selectedSoftkeyIndex = softkeyIndex;
                            newChar = charGroup[charGroup.length - 1];
                            console.log(`[FILES] Save Config DOWN: Wrapped to softkey group ${softkeyIndex}, changed character at position ${cursorPos} to '${newChar}'`);
                        }
                    } else {
                        newChar = charGroup[prevIndex];
                    }
                    
                    // Replace character at cursor position
                    const newFilename = filename.slice(0, cursorPos) + newChar + filename.slice(cursorPos + 1);
                    _state.files.saveConfig.filename = newFilename;
                    if (prevIndex >= 0) {
                        console.log(`[FILES] Save Config DOWN: Changed character at position ${cursorPos} to '${newChar}'`);
                    }
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
                        // Reset editing state when navigating between items
                        if (_state.display.editing) {
                            _state.display.editing = false;
                            _state.display.focus = "title";
                        }
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
                        // Cycle through TIME and DATE only (skip DAY)
                        // TIME is index 0, DATE is index 1, DAY is index 2
                        if (_state.datetime.selectedIndex === 0) {
                            // TIME → DATE
                            _state.datetime.selectedIndex = 1;
                        } else if (_state.datetime.selectedIndex === 1) {
                            // DATE → TIME (cycle back)
                            _state.datetime.selectedIndex = 0;
                        } else {
                            // If somehow on DAY (index 2), go to TIME
                            _state.datetime.selectedIndex = 0;
                        }
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
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:1600',message:'isHome branch taken',data:{viewId:_state.viewId,selectedIndexBefore:_state.menu.selectedIndex,menuItemsLength:MENU_ITEMS.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    const currentIndex = Math.max(0, Math.min(_state.menu.selectedIndex, MENU_ITEMS.length - 1));
                    const newIndex = (currentIndex + 1) % MENU_ITEMS.length;
                    _state.menu.selectedIndex = newIndex;
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:1603',message:'isHome branch after update',data:{currentIndex,newIndex,selectedIndexAfter:_state.menu.selectedIndex,selectedItem:MENU_ITEMS[newIndex]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    console.log(`[MENU] Home menu DOWN - Selected index: ${currentIndex} → ${newIndex} → "${MENU_ITEMS[newIndex]}" (total items: ${MENU_ITEMS.length})`);
                    console.log(`[MENU] All items: ${MENU_ITEMS.map((item, idx) => `${idx}:${item}`).join(', ')}`);
                    console.log(`[MENU] State after update: _state.menu.selectedIndex = ${_state.menu.selectedIndex}`);
                    _emit();
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:1607',message:'_emit called after isHome update',data:{selectedIndex:_state.menu.selectedIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                } else if (isInFiles() && (_state.viewId === "files_session_dir" || _state.viewId === "files_config_dir")) {
                    _state.files.cursor++;
                    _emit();
                } else {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mainFSM.js:1611',message:'DOWN case no match',data:{viewId:_state.viewId,isHome:isHome(),isInFiles:isInFiles()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                }
                break;

            case "LEFT":
                // Handle setup_menu first to avoid being intercepted by other handlers
                if (_state.viewId === "setup_menu") {
                    // LEFT arrow: move to left column (same row position)
                    // Setup menu has 11 items: left column (0-5), right column (6-10)
                    const currentIndex = _state.menu.selectedIndex;
                    const leftColumnCount = Math.ceil(SETUP_MENU_ITEMS.length / 2); // 6 items
                    console.log(`[MENU] Setup menu LEFT: currentIndex=${currentIndex}, leftColumnCount=${leftColumnCount}, viewId=${_state.viewId}`);
                    if (currentIndex >= leftColumnCount) {
                        // In right column: move to left column (same row)
                        const rowInRightColumn = currentIndex - leftColumnCount;
                        const newIndex = Math.min(leftColumnCount - 1, rowInRightColumn);
                        _state.menu.selectedIndex = newIndex;
                        console.log(`[MENU] Setup menu LEFT: Moved from right column (${currentIndex}) to left column (${newIndex})`);
                        _emit();
                    } else {
                        console.log(`[MENU] Setup menu LEFT: Already in left column (${currentIndex}), doing nothing`);
                    }
                } else if (_state.viewId === "display_menu" && _state.display.editing && _state.menu.selectedIndex === 2 && _state.display.focus === "value") {
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
                } else if (_state.meterSet && _state.meterSet.editing && (_state.viewId === "meter_set_menu" || _state.viewId === "meter_set_edit")) {
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
                } else if (_state.viewId === "files_rename_last") {
                    if (_state.files.renameLastSession.editing) {
                        // LEFT arrow: delete character before cursor (backspace behavior)
                        const filename = _state.files.renameLastSession.filename;
                        const cursorPos = _state.files.renameLastSession.cursorPosition;
                        if (cursorPos > 0) {
                            const newFilename = filename.slice(0, cursorPos - 1) + filename.slice(cursorPos);
                            _state.files.renameLastSession.filename = newFilename;
                            _state.files.renameLastSession.cursorPosition = cursorPos - 1;
                            console.log(`[FILES] Rename LEFT: Deleted character at position ${cursorPos - 1}`);
                        }
                        _emit();
                    } else {
                        // LEFT/RIGHT when not editing: navigate between FILE NAME and SAVE
                        const focus = _state.files.renameLastSession.focus || "file_name";
                        if (focus === "save") {
                            _state.files.renameLastSession.focus = "file_name";
                            console.log(`[FILES] Rename LEFT: Focus changed to FILE NAME`);
                        } else {
                            _state.files.renameLastSession.focus = "save";
                            console.log(`[FILES] Rename RIGHT: Focus changed to SAVE`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "files_save_config") {
                    if (_state.files.saveConfig.editing) {
                        // LEFT arrow: delete character before cursor (backspace behavior)
                        const filename = _state.files.saveConfig.filename;
                        const cursorPos = _state.files.saveConfig.cursorPosition;
                        if (cursorPos > 0) {
                            const newFilename = filename.slice(0, cursorPos - 1) + filename.slice(cursorPos);
                            _state.files.saveConfig.filename = newFilename;
                            _state.files.saveConfig.cursorPosition = cursorPos - 1;
                            console.log(`[FILES] Save Config LEFT: Deleted character at position ${cursorPos - 1}`);
                        }
                        _emit();
                    } else {
                        // LEFT/RIGHT when not editing: navigate between FILE NAME and SAVE
                        const focus = _state.files.saveConfig.focus || "file_name";
                        if (focus === "save") {
                            _state.files.saveConfig.focus = "file_name";
                            console.log(`[FILES] Save Config LEFT: Focus changed to FILE NAME`);
                        } else {
                            _state.files.saveConfig.focus = "save";
                            console.log(`[FILES] Save Config RIGHT: Focus changed to SAVE`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "datetime_menu" && _state.datetime.editing) {
                    // LEFT arrow: move to previous subfield
                    const currentSubField = _state.datetime.editSubField;
                    if (_state.datetime.editField === "time") {
                        // Time subfields: hour ↔ minute ↔ second
                        if (currentSubField === "hour") {
                            _state.datetime.editSubField = "second";
                        } else if (currentSubField === "minute") {
                            _state.datetime.editSubField = "hour";
                        } else if (currentSubField === "second") {
                            _state.datetime.editSubField = "minute";
                        }
                    } else if (_state.datetime.editField === "date") {
                        // Date subfields cycle: day ↔ month ↔ year
                        if (currentSubField === "day") {
                            _state.datetime.editSubField = "year";
                        } else if (currentSubField === "month") {
                            _state.datetime.editSubField = "day";
                        } else if (currentSubField === "year") {
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
                } else if (_state.viewId === "setup_menu") {
                    // RIGHT arrow: move to right column (same row position)
                    // Setup menu has 11 items: left column (0-5), right column (6-10)
                    const currentIndex = _state.menu.selectedIndex;
                    const leftColumnCount = Math.ceil(SETUP_MENU_ITEMS.length / 2); // 6 items
                    if (currentIndex < leftColumnCount) {
                        // In left column: move to right column (same row)
                        const newIndex = Math.min(SETUP_MENU_ITEMS.length - 1, currentIndex + leftColumnCount);
                        _state.menu.selectedIndex = newIndex;
                        console.log(`[MENU] Setup menu RIGHT: Moved from left column (${currentIndex}) to right column (${newIndex})`);
                        _emit();
                    }
                    // If in right column, do nothing
                } else if (_state.viewId === "files_session_dir") {
                    // RIGHT arrow: move to right column (same row position)
                    const fileList = _state.files.sessionFiles;
                    if (fileList.length > 5) {
                        const currentIndex = _state.files.sessionDir.selectedIndex;
                        if (currentIndex < 5) {
                            // In left column: move to right column (same row: 5-9)
                            const newIndex = Math.min(9, Math.min(fileList.length - 1, currentIndex + 5));
                            _state.files.sessionDir.selectedIndex = newIndex;
                            console.log(`[FILES] Session Directory RIGHT: Moved from left column (${currentIndex}) to right column (${newIndex})`);
                            _emit();
                        } else if (currentIndex >= 5 && currentIndex < 10) {
                            // Already in right column: wrap to left column at same row
                            const rowInRightColumn = currentIndex - 5;
                            const newIndex = Math.min(4, rowInRightColumn);
                            _state.files.sessionDir.selectedIndex = newIndex;
                            console.log(`[FILES] Session Directory RIGHT: Wrapped from right column (${currentIndex}) to left column (${newIndex})`);
                            _emit();
                        }
                    }
                } else if (_state.viewId === "files_rename_last") {
                    if (_state.files.renameLastSession.editing) {
                        // RIGHT arrow: insert/add character from selected softkey group at cursor position
                        const softkeyGroups = [
                            ["0","1","2","3","4","5","6","7","8","9"],
                            ["A","B","C","D","E","F","G","H"],
                            ["I","J","K","L","M","N","O","P","Q"],
                            ["R","S","T","U","V","W","X","Y","Z"]
                        ];
                        const softkeyIndex = _state.files.renameLastSession.selectedSoftkeyIndex || 0;
                        const charGroup = softkeyGroups[softkeyIndex];
                        const filename = _state.files.renameLastSession.filename;
                        const cursorPos = _state.files.renameLastSession.cursorPosition;
                        // Get the first character from the selected softkey group
                        const charToInsert = charGroup[0];
                        // Insert character at cursor position
                        const newFilename = filename.slice(0, cursorPos) + charToInsert + filename.slice(cursorPos);
                        // Limit filename length (e.g., 8 characters)
                        if (newFilename.length <= 8) {
                            _state.files.renameLastSession.filename = newFilename;
                            _state.files.renameLastSession.cursorPosition = cursorPos + 1;
                            console.log(`[FILES] Rename RIGHT: Inserted '${charToInsert}' at position ${cursorPos}`);
                        }
                        _emit();
                    } else {
                        // LEFT/RIGHT when not editing: navigate between FILE NAME and SAVE
                        const focus = _state.files.renameLastSession.focus || "file_name";
                        if (focus === "file_name") {
                            _state.files.renameLastSession.focus = "save";
                            console.log(`[FILES] Rename RIGHT: Focus changed to SAVE`);
                        } else {
                            _state.files.renameLastSession.focus = "file_name";
                            console.log(`[FILES] Rename LEFT: Focus changed to FILE NAME`);
                        }
                        _emit();
                    }
                } else if (_state.viewId === "files_save_config") {
                    if (_state.files.saveConfig.editing) {
                        // RIGHT arrow: insert/add character from selected softkey group at cursor position
                        const softkeyGroups = [
                            ["0","1","2","3","4","5","6","7","8","9"],
                            ["A","B","C","D","E","F","G","H"],
                            ["I","J","K","L","M","N","O","P","Q"],
                            ["R","S","T","U","V","W","X","Y","Z"]
                        ];
                        const softkeyIndex = _state.files.saveConfig.selectedSoftkeyIndex || 0;
                        const charGroup = softkeyGroups[softkeyIndex];
                        const filename = _state.files.saveConfig.filename;
                        const cursorPos = _state.files.saveConfig.cursorPosition;
                        // Get the first character from the selected softkey group
                        const charToInsert = charGroup[0];
                        // Insert character at cursor position
                        const newFilename = filename.slice(0, cursorPos) + charToInsert + filename.slice(cursorPos);
                        // Limit filename length (e.g., 8 characters)
                        if (newFilename.length <= 8) {
                            _state.files.saveConfig.filename = newFilename;
                            _state.files.saveConfig.cursorPosition = cursorPos + 1;
                            console.log(`[FILES] Save Config RIGHT: Inserted '${charToInsert}' at position ${cursorPos}`);
                        }
                        _emit();
                    } else {
                        // LEFT/RIGHT when not editing: navigate between FILE NAME and SAVE
                        const focus = _state.files.saveConfig.focus || "file_name";
                        if (focus === "file_name") {
                            _state.files.saveConfig.focus = "save";
                            console.log(`[FILES] Save Config RIGHT: Focus changed to SAVE`);
                        } else {
                            _state.files.saveConfig.focus = "file_name";
                            console.log(`[FILES] Save Config LEFT: Focus changed to FILE NAME`);
                        }
                        _emit();
                    }
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
                    } else if (_state.datetime.editField === "date") {
                        // Date subfields cycle: day → month → year → day
                        if (currentSubField === "day") {
                            _state.datetime.editSubField = "month";
                        } else if (currentSubField === "month") {
                            _state.datetime.editSubField = "year";
                        } else if (currentSubField === "year") {
                            _state.datetime.editSubField = "day";
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
                // Handle ENTER when sound settings overlay is visible
                if (isSlm() && _state.slmSoundSettings && _state.slmSoundSettings.visible) {
                    // Get the selected item (L_ is index 0, then L_AVG, L_PK, L_Mx, L_Mn)
                    const selectedIndex = _state.slmSoundSettings.selectedIndex || 0;
                    const items = ['L_', 'L_AVG', 'L_PK', 'L_Mx', 'L_Mn'];
                    const selectedType = items[selectedIndex] || 'L_';
                    
                    // Save the selected measurement type to state
                    _state.slmSoundSettings.selectedType = selectedType;
                    console.log(`[FSM] ENTER: Selected measurement type: ${selectedType}`);
                    
                    // Close the overlay
                    _state.slmSoundSettings.visible = false;
                    _state.slmSoundSettings.selectedIndex = 0; // Reset for next time
                    _emit();
                    break;
                }
                // SLM page navigation (ENTER cycles pages 1-4)
                if (isSlm() && _state.viewId !== "stop_confirm") {
                    // Cycle to next page: 1→2, 2→3, 3→4, 4→1
                    _state.slm.currentPage = ((_state.slm.currentPage || 1) % 4) + 1;
                    updateSlmScreen();
                    console.log(`[SLM] ENTER: Page ${_state.slm.currentPage}, Mode: ${_state.slm.mode}`);
                    _emit();
                    break;
                }
                // Handle ENTER on calibration running screen - manually complete calibration
                if (_state.viewId === "cal_running") {
                    // Clear the auto-completion timer
                    _clearTimer('cal');
                    
                    // Complete calibration immediately
                    const now = new Date();
                    const dateStr = now.toISOString().split('T')[0];
                    const timeStr = now.toTimeString().split(' ')[0];
                    const timestamp = `${dateStr} ${timeStr}`;
                    
                    const preCalValue = _state.measurement.currentSPL || 85.2;
                    
                    _state.calibration.lastCalibration = {
                        preCalValue: preCalValue,
                        timestamp: timestamp,
                        date: dateStr,
                        time: timeStr
                    };
                    // Save to localStorage
                    _saveCalibrationToStorage(_state.calibration.lastCalibration);
                    console.log(`[CAL] Calibration completed: PRE-CAL ${_state.calibration.lastCalibration.preCalValue.toFixed(1)}dB`);
                    
                    // Return to calibration menu to show updated info
                    _state.viewId = "cal_menu";
                    _emit();
                    break;
                }
                if (_state.viewId === "stop_confirm") {
                    // Cancel stop confirmation
                    _clearTimer('stopHold');
                    updateSlmScreen();
                    _emit();
                } else if (_state.viewId === "slm_view_menu") {
                    const item = SLM_VIEW_ITEMS[_state.menu.selectedIndex];
                    if (item === "VIEW PAST STUDIES") {
                        // Do nothing - no action for VIEW PAST STUDIES
                        // Toast disabled - user cannot test on actual device
                        // _showToast("No studies yet");
                        return; // Explicitly do nothing
                    } else if (item === "VIEW CURRENT STUDY") {
                        _state.viewId = "home_screen_running";
                        _emit();
                    } else if (item === "VIEW SESSION") {
                        // Return to current SLM screen (preserve page and mode)
                        updateSlmScreen();
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
                    } else if (item === "TIME-DATE") {
                        _pushHistory("datetime_menu");
                        _state.viewId = "datetime_menu";
                        // Initialize datetime object if it doesn't exist
                        if (!_state.datetime) {
                            _state.datetime = {};
                        }
                        // Initialize datetime values if not set
                        const now = new Date();
                        if (_state.datetime.year === undefined) {
                            _state.datetime.year = now.getFullYear();
                            _state.datetime.month = now.getMonth() + 1;
                            _state.datetime.day = now.getDate();
                            _state.datetime.hour = now.getHours();
                            _state.datetime.minute = now.getMinutes();
                            _state.datetime.second = now.getSeconds();
                        }
                        // Set menu state
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
                    if (_state.viewId === "display_menu") {
                        _state.menu.selectedIndex = 0; // Reset to LANGUAGE (first item)
                    }
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
                        // Check if we're already editing BACKLIGHT's value
                        if (_state.display.editing && _state.menu.selectedIndex === 1 && _state.display.focus === "value") {
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
                            // ENTER on BACKLIGHT title (or when not editing BACKLIGHT): enter edit mode, focus on value
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
                        // Already in edit mode
                        if (_state.datetime.editField === "time") {
                            // For TIME: cycle through subfields (hour → minute → second → exit to TIME label)
                            const currentSubField = _state.datetime.editSubField;
                            if (currentSubField === "hour") {
                                _state.datetime.editSubField = "minute";
                                console.log(`[DATETIME] ENTER: Cycling TIME subfield to minute`);
                            } else if (currentSubField === "minute") {
                                _state.datetime.editSubField = "second";
                                console.log(`[DATETIME] ENTER: Cycling TIME subfield to second`);
                            } else if (currentSubField === "second") {
                                // Exit edit mode and return to TIME label
                                _state.datetime.editing = false;
                                _state.datetime.editField = null;
                                _state.datetime.editSubField = null;
                                console.log(`[DATETIME] ENTER: Exited edit mode, back to TIME label`);
                            }
                            _emit();
                        } else if (_state.datetime.editField === "date") {
                            // For DATE: cycle through subfields (day → month → year → exit to DATE label)
                            const currentSubField = _state.datetime.editSubField;
                            if (currentSubField === "day") {
                                _state.datetime.editSubField = "month";
                                console.log(`[DATETIME] ENTER: Cycling DATE subfield to month`);
                            } else if (currentSubField === "month") {
                                _state.datetime.editSubField = "year";
                                console.log(`[DATETIME] ENTER: Cycling DATE subfield to year`);
                            } else if (currentSubField === "year") {
                                // Exit edit mode and return to DATE label
                                _state.datetime.editing = false;
                                _state.datetime.editField = null;
                                _state.datetime.editSubField = null;
                                console.log(`[DATETIME] ENTER: Exited edit mode, back to DATE label`);
                            }
                            _emit();
                        } else {
                            // For other fields: confirm and exit edit mode
                            _state.datetime.editing = false;
                            _state.datetime.editField = null;
                            _state.datetime.editSubField = null;
                            console.log(`[DATETIME] ENTER: Confirmed and exited edit mode`);
                            _emit();
                        }
                    } else {
                        // Enter edit mode for selected field
                        const selectedItem = DATETIME_MENU_ITEMS[_state.datetime.selectedIndex];
                        _state.datetime.editing = true;
                        _state.datetime.editField = selectedItem.toLowerCase(); // "time", "date", "day"
                        // Set initial subfield based on selected item
                        if (selectedItem === "TIME") {
                            _state.datetime.editSubField = "hour";
                        } else if (selectedItem === "DATE") {
                            _state.datetime.editSubField = "day"; // Start with day when editing DATE
                        } else if (selectedItem === "DAY") {
                            // DAY is not editable - it's calculated from the date
                            _state.datetime.editing = false;
                            _state.datetime.editField = null;
                            _state.datetime.editSubField = null;
                            console.log(`[DATETIME] ENTER: DAY is not editable (calculated from date)`);
                            _emit();
                            return;
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
                        _state.files.sessionDir.selectedIndex = 0;
                        _state.files.sessionDir.scrollOffset = 0;
                        _emit();
                    } else if (item === "CONFIG DIRECTORY") {
                        _pushHistory("files_config_dir");
                        _state.viewId = "files_config_dir";
                        _state.files.configDir.selectedIndex = 0;
                        _state.files.configDir.scrollOffset = 0;
                        _emit();
                    } else if (item === "RENAME LAST SESSION") {
                        // Get the last session file name (first in list)
                        const lastSession = _state.files.sessionFiles.length > 0 ? _state.files.sessionFiles[0].name : "SES001";
                        _state.files.renameLastSession.filename = lastSession;
                        _state.files.renameLastSession.originalFilename = lastSession;
                        _state.files.renameLastSession.cursorPosition = 0;
                        _state.files.renameLastSession.editing = false;
                        _state.files.renameLastSession.focus = "file_name"; // Start with FILE NAME highlighted
                        // Save the current menu selectedIndex so we can restore it when returning
                        _state.files.renameLastSession.previousMenuIndex = _state.menu.selectedIndex;
                        _pushHistory("files_rename_last");
                        _state.viewId = "files_rename_last";
                        _emit();
                    } else if (item === "SAVE CONFIG FILE") {
                        // Generate default config filename
                        const configCount = _state.files.configFiles.length;
                        const defaultName = `CONFIG${String(configCount + 1).padStart(3, '0')}`;
                        _state.files.saveConfig.filename = defaultName;
                        _state.files.saveConfig.originalFilename = defaultName;
                        _state.files.saveConfig.cursorPosition = 0;
                        _state.files.saveConfig.editing = false;
                        _state.files.saveConfig.focus = "file_name"; // Start with FILE NAME highlighted
                        _state.files.saveConfig.selectedSoftkeyIndex = 0;
                        _pushHistory("files_save_config");
                        _state.viewId = "files_save_config";
                        _emit();
                    } else if (item === "FORMAT CARD") {
                        _state.files.formatCard.selectedIndex = 0; // Default to QUICK FORMAT
                        _state.previousViewId = "files_menu";
                        _state.viewId = "files_format_card";
                        console.log(`[FILES] Format Card: Navigated to format card screen`);
                        _emit();
                    }
                } else if (_state.viewId === "files_rename_last") {
                    console.log(`[FILES] ENTER pressed on rename screen - editing: ${_state.files.renameLastSession.editing}, focus: ${_state.files.renameLastSession.focus}`);
                    if (_state.files.renameLastSession.editing) {
                        // ENTER in edit mode: exit edit mode and highlight SAVE (do NOT save yet)
                        _state.files.renameLastSession.editing = false;
                        _state.files.renameLastSession.cursorPosition = 0;
                        _state.files.renameLastSession.selectedSoftkeyIndex = 0;
                        _state.files.renameLastSession.focus = "save"; // Highlight SAVE so user can save
                        console.log(`[FILES] Rename: Exited edit mode, focus set to SAVE (filename: ${_state.files.renameLastSession.filename})`);
                        _emit();
                    } else {
                        // ENTER when not editing: check focus
                        const focus = _state.files.renameLastSession.focus || "file_name";
                        if (focus === "save") {
                            // ENTER on SAVE: save the renamed file and navigate to rename status screen
                            const newName = _state.files.renameLastSession.filename.trim();
                            console.log(`[FILES] Checking for duplicate: newName="${newName}", sessionFiles:`, _state.files.sessionFiles);
                            
                            // First check: if new name matches the current name of the file being renamed (index 0)
                            const currentFile = _state.files.sessionFiles[0];
                            const currentName = currentFile ? (typeof currentFile === 'string' ? currentFile : currentFile.name) : '';
                            const isSameName = currentName && currentName.trim().toUpperCase() === newName.toUpperCase();
                            console.log(`[FILES] Current file name: "${currentName}", newName: "${newName}", isSameName: ${isSameName}`);
                            
                            // Second check: if file already exists in other files (excluding index 0)
                            const existingFile = _state.files.sessionFiles.find((file, index) => {
                                if (index === 0) {
                                    console.log(`[FILES] Skipping index 0 (file being renamed)`);
                                    return false; // Skip the file being renamed
                                }
                                const existingName = typeof file === 'string' ? file : file.name;
                                const matches = existingName && existingName.trim().toUpperCase() === newName.toUpperCase();
                                console.log(`[FILES] Checking index ${index}: existingName="${existingName}", matches=${matches}`);
                                return matches;
                            });
                            console.log(`[FILES] Duplicate check result: existingFile=`, existingFile);
                            
                            // Show error if name is unchanged OR if it matches another file
                            if (isSameName || existingFile) {
                                // File already exists - show error
                                _state.files.errorStatus = _state.files.errorStatus || {};
                                _state.files.errorStatus.errorLine1 = "FILE ERROR";
                                _state.files.errorStatus.errorLine2 = "FILE ALREADY EXISTS";
                                _state.viewId = "files_error";
                                console.log(`[FILES] Rename error: File ${newName} already exists`);
                                _emit();
                            } else {
                                // Update the first session file name
                                if (_state.files.sessionFiles.length > 0) {
                                    _state.files.sessionFiles[0].name = newName;
                                }
                                // Set the renamed file name for the status screen
                                _state.files.renameStatus = _state.files.renameStatus || {};
                                _state.files.renameStatus.renamedFileName = "FILE SAVED";
                                // Navigate to rename status screen
                                _state.viewId = "files_rename_status";
                                console.log(`[FILES] Rename saved via SAVE: ${newName}, navigating to rename status screen`);
                                _emit();
                            }
                        } else {
                            // ENTER on FILE NAME: enter edit mode
                            _state.files.renameLastSession.editing = true;
                            const filename = _state.files.renameLastSession.filename;
                            // Position cursor at last character (not at end)
                            _state.files.renameLastSession.cursorPosition = filename.length > 0 ? filename.length - 1 : 0;
                            // Default to first softkey (numbers)
                            _state.files.renameLastSession.selectedSoftkeyIndex = 0;
                            // Focus stays on softkeys when editing (no highlight on FILE NAME or SAVE)
                            console.log(`[FILES] Rename: Entered edit mode`);
                            _emit();
                        }
                    }
                } else if (_state.viewId === "files_save_config") {
                    if (_state.files.saveConfig.editing) {
                        // ENTER in edit mode: exit edit mode, highlight SAVE
                        _state.files.saveConfig.editing = false;
                        _state.files.saveConfig.cursorPosition = 0;
                        _state.files.saveConfig.selectedSoftkeyIndex = 0;
                        _state.files.saveConfig.focus = "save"; // Highlight SAVE so user can save
                        console.log(`[FILES] Save Config: Exited edit mode, focus set to SAVE (filename: ${_state.files.saveConfig.filename})`);
                        _emit();
                    } else {
                        // ENTER when not editing: check focus
                        const focus = _state.files.saveConfig.focus || "file_name";
                        if (focus === "save") {
                            // ENTER on SAVE: save the config file
                            const configName = _state.files.saveConfig.filename.trim();
                            // Check if file already exists
                            const existingFile = _state.files.configFiles.find(file => {
                                const existingName = typeof file === 'string' ? file : file.name;
                                return existingName && existingName.trim().toUpperCase() === configName.toUpperCase();
                            });
                            if (existingFile) {
                                // File already exists - show error
                                _state.files.errorStatus = _state.files.errorStatus || {};
                                _state.files.errorStatus.errorLine1 = "FILE ERROR";
                                _state.files.errorStatus.errorLine2 = "FILE ALREADY EXISTS";
                                _state.viewId = "files_error";
                                console.log(`[FILES] Save config error: File ${configName} already exists`);
                                _emit();
                            } else {
                                // Add new config file to list
                                const now = new Date();
                                const dateStr = now.toISOString().split('T')[0];
                                const timeStr = now.toTimeString().split(' ')[0];
                                _state.files.configFiles.unshift({ name: configName, date: dateStr, time: timeStr });
                                _state.files.saveConfig.editing = false;
                                // Set the saved file name for the status screen
                                _state.files.saveConfigStatus = _state.files.saveConfigStatus || {};
                                _state.files.saveConfigStatus.savedFileName = "FILE SAVED";
                                // Navigate to save config status screen
                                _state.viewId = "files_save_config_status";
                                console.log(`[FILES] Config saved: ${configName}, navigating to save config status screen`);
                                _emit();
                            }
                        } else {
                            // ENTER on FILE NAME: enter edit mode
                            _state.files.saveConfig.editing = true;
                            const filename = _state.files.saveConfig.filename;
                            // Position cursor at last character (not at end)
                            _state.files.saveConfig.cursorPosition = filename.length > 0 ? filename.length - 1 : 0;
                            // Default to first softkey (numbers)
                            _state.files.saveConfig.selectedSoftkeyIndex = 0;
                            // Focus stays on softkeys when editing (no highlight on FILE NAME or SAVE)
                            console.log(`[FILES] Save Config: Entered edit mode`);
                            _emit();
                        }
                    }
                } else if (_state.viewId === "files_format_card") {
                    // ENTER: confirm format operation and start formatting
                    const formatType = _state.files.formatCard.selectedIndex === 0 ? "QUICK FORMAT" : "FULL FORMAT";
                    console.log(`[FILES] Format Card: Starting ${formatType}`);
                    // Set format status message and navigate to format status screen
                    _state.files.formatStatus = _state.files.formatStatus || {};
                    _state.files.formatStatus.formatMessage = "FORMATTING...";
                    _state.previousViewId = "files_format_card";
                    _state.viewId = "files_format_status";
                    _emit();
                    // Start formatting timer (2-3 seconds)
                    const formatDuration = 2000 + Math.random() * 1000; // 2000-3000ms
                    _state.timers.formatting = setTimeout(() => {
                        _state.viewId = "files_menu";
                        _clearTimer('formatting');
                        console.log(`[FILES] Format Card: Formatting complete, returned to files_menu`);
                        _emit();
                    }, formatDuration);
                } else if (_state.viewId === "files_delete_status") {
                    // ENTER on delete status screen: return to previous view
                    _state.viewId = _state.previousViewId || "files_menu";
                    console.log(`[FILES] Delete Status: Returning to previous view`);
                    _emit();
                } else if (_state.viewId === "files_load_status") {
                    // ENTER on load status screen: return to previous view
                    _state.viewId = _state.previousViewId || "files_menu";
                    console.log(`[FILES] Load Status: Returning to previous view`);
                    _emit();
                } else if (_state.viewId === "cal_menu") {
                    // Only start calibration if CALIBRATE option is selected (last item)
                    // Ensure calibration state exists
                    if (!_state.calibration) {
                        _state.calibration = {
                            history: [
                                {
                                    id: 1,
                                    preCalValue: 114.0,
                                    timestamp: "2025-10-30 13:45:21",
                                    date: "2025-10-30",
                                    time: "13:45:21"
                                }
                            ],
                            selectedIndex: 0
                        };
                    }
                    // Navigation: index 0 = CALIBRATE, index 1+ = history entries
                    const isCalibrateSelected = _state.calibration.selectedIndex === 0;
                    
                    if (isCalibrateSelected) {
                        _state.previousViewId = isSlm() ? _state.viewId : (isInSetup() ? _state.viewId : "home_screen");
                        _state.viewId = "cal_running";
                        
                        // Initialize calibration at a value between 120-130dB (random variation)
                        const startValue = 120 + Math.random() * 10; // Random between 120-130dB
                        _state.measurement.currentSPL = Math.round(startValue * 10) / 10;
                        
                        // Initialize calibration adjustment state
                        if (!_state.calibration.adjustment) {
                            _state.calibration.adjustment = {};
                        }
                        _state.calibration.adjustment.startTime = null; // Will be set when tone starts
                        _state.calibration.adjustment.toneStarted = false; // Track if calibration tone is playing
                        _state.calibration.adjustment.manuallyAdjusted = false;
                        _state.calibration.adjustment.targetValue = 114.2; // Target around 114.2dB
                        
                        // Start measurement update loop for calibration
                        _clearTimer('cal');
                        _state.timers.cal = setInterval(() => {
                            if (_state.viewId === "cal_running") {
                                // Check if calibration tone is playing
                                if (!_state.calibration.adjustment.toneStarted) {
                                    const audioState = window.AudioPlayer?.getState?.();
                                    if (audioState && audioState.isPlaying) {
                                        // Check if calibration tone is playing (check if URL contains calibration file)
                                        const presetSrc = audioState.currentPreset || '';
                                        if (presetSrc.includes('Calibration_1khz') || presetSrc.includes('calibration')) {
                                            _state.calibration.adjustment.toneStarted = true;
                                            _state.calibration.adjustment.startTime = Date.now();
                                            console.log('[CAL] Calibration tone detected - starting adjustment timer');
                                        }
                                    }
                                    // If tone not started yet, just add small variation around starting value
                                    if (!_state.calibration.adjustment.toneStarted) {
                                        const variation = (Math.random() * 0.2 - 0.1);
                                        _state.measurement.currentSPL = Math.round((_state.measurement.currentSPL + variation) * 10) / 10;
                                        // Clamp to ensure it stays in reasonable range
                                        _state.measurement.currentSPL = Math.max(50, Math.min(140, _state.measurement.currentSPL));
                                        _emit();
                                        return; // Exit early until tone starts
                                    }
                                }
                                
                                const now = Date.now();
                                const elapsed = _state.calibration.adjustment.startTime ? 
                                    (now - _state.calibration.adjustment.startTime) : 0;
                                
                                // If manually adjusted (arrow pressed), completely stop all automatic changes
                                // User has full control - no variation, no auto-adjustment
                                if (_state.calibration.adjustment.manuallyAdjusted) {
                                    // Do nothing - value is completely stable and controlled by arrow keys only
                                    // The value was set by the arrow key handler and should not change
                                    return; // Exit early - don't update anything
                                }
                                
                                // After 10 seconds since tone started, automatically adjust towards 114.2dB (faster adjustment)
                                if (elapsed >= 10000) {
                                    const current = _state.measurement.currentSPL || 120;
                                    const target = _state.calibration.adjustment.targetValue;
                                    const diff = target - current;
                                    
                                    // If not at target, move towards it faster (0.2-0.3dB per update)
                                    if (Math.abs(diff) > 0.15) {
                                        // Faster adjustment: 0.2-0.3dB per update depending on distance
                                        const stepSize = Math.abs(diff) > 5 ? 0.3 : 0.2;
                                        const step = diff > 0 ? stepSize : -stepSize;
                                        _state.measurement.currentSPL = Math.round((current + step) * 10) / 10;
                                        // Add small variation during auto-adjustment to simulate real measurement (±0.05dB)
                                        const variation = (Math.random() * 0.1 - 0.05);
                                        _state.measurement.currentSPL = Math.round((_state.measurement.currentSPL + variation) * 10) / 10;
                                    } else {
                                        // Close enough to target - stabilize around 114.0-114.5dB with small variation
                                        // Check if we're in the stable range (113.5-114.5dB)
                                        if (current >= 113.5 && current <= 114.5) {
                                            // We're stabilized - mark as stabilized but keep small variation until user presses arrow
                                            if (!_state.calibration.adjustment.stabilized) {
                                                _state.calibration.adjustment.stabilized = true;
                                            }
                                            // Keep small variation until user presses arrow (manuallyAdjusted will stop this)
                                            const variation = (Math.random() * 0.3 - 0.15); // ±0.15dB variation
                                            _state.measurement.currentSPL = Math.round((target + variation) * 10) / 10;
                                        } else {
                                            // Still adjusting towards stable range
                                            const stepSize = 0.2;
                                            const step = diff > 0 ? stepSize : -stepSize;
                                            _state.measurement.currentSPL = Math.round((current + step) * 10) / 10;
                                        }
                                    }
                                } else if (elapsed > 0) {
                                    // Tone has started but not yet 10 seconds - add small variation around current value
                                    // This is the "waiting for stabilization" period
                                    const variation = (Math.random() * 0.2 - 0.1);
                                    _state.measurement.currentSPL = Math.round((_state.measurement.currentSPL + variation) * 10) / 10;
                                    // Clamp to ensure it stays in reasonable range
                                    _state.measurement.currentSPL = Math.max(50, Math.min(140, _state.measurement.currentSPL));
                                }
                                
                                _emit();
                            }
                        }, 100); // Update every 100ms
                        
                        _emit();
                        // Calibration stays on screen until user presses ENTER to complete or ESC to cancel
                    } else {
                        // History entry selected - do nothing (or could show details in future)
                        console.log(`[CAL] Last calibration entry selected - no action`);
                    }
                } else if (isHome()) {
                    const item = MENU_ITEMS[_state.menu.selectedIndex];
                    if (item === "VIEW PAST STUDIES") {
                        // Do nothing - no action for VIEW PAST STUDIES
                        // Toast disabled - user cannot test on actual device
                        // _showToast("No studies yet");
                        return; // Explicitly do nothing
                    } else if (item === "VIEW CURRENT STUDY") {
                        // Initialize Simulator and start Measurement if not already running
                        if (!_state.measurement.isRunning) {
                        if (window.Simulator) {
                            // Check if audio is playing - preserve its baseLevel and impulse pattern, otherwise use ambient
                            const audioState = window.AudioPlayer?.getState?.();
                            const simState = window.Simulator.getState();
                            
                            if (audioState && audioState.isPlaying) {
                                // Audio is playing - preserve current simulator settings including impulse pattern
                                window.Simulator.init(_state.measurement.seed || 12345, { 
                                    baseLevel: simState.baseLevel || 47, 
                                    variation: simState.variation || 3,
                                    impulsePattern: simState.impulsePattern || null
                                });
                            } else {
                                // No audio playing - use ambient levels, no impulse pattern
                                window.Simulator.init(_state.measurement.seed || 12345, { baseLevel: 47, variation: 3 });
                            }
                        }
                        if (window.Measurement) {
                            window.Measurement.start();
                        }
                        _state.measurement.state = "running";
                        _state.measurement.isRunning = true;
                        _state.measurement.runtime = 0; // Reset runtime when starting new measurement
                        _startMeasurementTimer();
                        _startMeasurementUpdateLoop();
                        }
                        // Set SLM mode based on slmLabelIndex (same as VIEW SESSION)
                        const modeMap = { 0: 'numeric', 1: '1of1', 2: '1of3' };
                        _state.slm.mode = modeMap[_state.slmLabelIndex] || 'numeric';
                        _state.slm.currentPage = 1;
                        updateSlmScreen();
                        console.log('[FSM] VIEW CURRENT STUDY: mode=', _state.slm.mode, 'page=', _state.slm.currentPage, 'measurement.state=', _state.measurement.state, 'viewId=', _state.viewId);
                        _emit();
                    } else if (item === "VIEW SESSION") {
                        // Don't change measurement state - preserve current state (stopped/running/paused)
                        // Set SLM mode based on slmLabelIndex
                        const modeMap = { 0: 'numeric', 1: '1of1', 2: '1of3' };
                        _state.slm.mode = modeMap[_state.slmLabelIndex] || 'numeric';
                        _state.slm.currentPage = 1;
                        // Ensure measurement state is preserved (don't override if already set)
                        // If measurement state is not set, default to stopped
                        if (!_state.measurement.state) {
                            _state.measurement.state = "stopped";
                            _state.measurement.isRunning = false;
                        }
                        updateSlmScreen();
                        console.log('[FSM] VIEW SESSION: mode=', _state.slm.mode, 'page=', _state.slm.currentPage, 'measurement.state=', _state.measurement.state, 'viewId=', _state.viewId);
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
                    // Set SLM mode based on slmLabelIndex
                    const modeMap = { 0: 'numeric', 1: '1of1', 2: '1of3' };
                    _state.slm.mode = modeMap[_state.slmLabelIndex] || 'numeric';
                    _state.slm.currentPage = 1;
                    updateSlmScreen();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "running") {
                    // Pause measurement
                    if (window.Measurement) {
                        window.Measurement.pause();
                    }
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _stopMeasurementUpdateLoop();
                    // Timer keeps running but won't increment (checks isRunning)
                    updateSlmScreen();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "paused") {
                    // Resume measurement
                    if (window.Measurement) {
                        window.Measurement.start();
                    }
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _startMeasurementUpdateLoop();
                    // Timer already running, will resume incrementing
                    updateSlmScreen();
                    _emit();
                }
                break;

            case "ESC":
                console.log(`[FSM] ESC pressed - viewId: ${_state.viewId}, sigInput.editing: ${_state.sigInput?.editing}, sigInput.focus: ${_state.sigInput?.focus}`);
                // Close sound settings overlay if visible
                if (isSlm() && _state.slmSoundSettings && _state.slmSoundSettings.visible) {
                    _state.slmSoundSettings.visible = false;
                    _state.slmSoundSettings.selectedIndex = 0;
                    console.log('[FSM] ESC: Closing sound settings overlay');
                    _emit();
                    break;
                }
                if (_state.viewId === "stop_confirm") {
                    _clearTimer('stopHold');
                    updateSlmScreen();
                    _emit();
                } else if (_state.viewId === "cal_menu") {
                    // ESC from calibration menu returns to Home
                    _state.viewId = _state.previousViewId || "home_screen";
                    console.log('[CAL] ESC: Returning to Home');
                    _emit();
                } else if (_state.viewId === "cal_running") {
                    _clearTimer('cal');
                    _state.viewId = "cal_menu";
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
                    if (_state.measurement.state === "running") {
                        _state.viewId = "slm_home";
                    } else if (_state.measurement.state === "paused") {
                        _state.viewId = "slm_home_paused";
                    } else {
                        _state.viewId = "slm_home_stopped";
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
                    if (_state.viewId === "display_menu") {
                        _state.menu.selectedIndex = 0; // Reset to LANGUAGE (first item)
                    }
                    _emit();
                } else if (isInFiles()) {
                    if (_state.viewId === "files_menu") {
                        const previousView = _popHistory() || "home_screen";
                        _state.viewId = previousView;
                        _emit();
                    } else if (_state.viewId === "files_rename_status") {
                        // ESC from rename status: return to files_menu
                        _state.viewId = "files_menu";
                        _state.menu.selectedIndex = 3; // Go to "SAVE CONFIG FILE"
                        console.log(`[FILES] Rename status ESC: Returned to files_menu, selectedIndex set to 3`);
                        _emit();
                    } else if (_state.viewId === "files_save_config_status") {
                        // ESC from save config status: return to files_menu
                        _state.viewId = "files_menu";
                        _state.menu.selectedIndex = 3; // Go to "SAVE CONFIG FILE"
                        console.log(`[FILES] Save config status ESC: Returned to files_menu, selectedIndex set to 3`);
                        _emit();
                    } else if (_state.viewId === "files_error") {
                        // ESC from error screen: return to previous screen
                        // Return to the screen we came from (either rename or save config)
                        if (_state.files.saveConfig.filename && !_state.files.saveConfig.editing) {
                            // Came from save config
                            _state.viewId = "files_save_config";
                            _state.files.saveConfig.editing = false;
                        } else {
                            // Came from rename
                            _state.viewId = "files_rename_last";
                        }
                        console.log(`[FILES] Error screen ESC: Returned to previous screen`);
                        _emit();
                    } else if (_state.viewId === "files_rename_last") {
                        console.log(`[FILES] Rename ESC pressed - editing: ${_state.files.renameLastSession.editing}, viewId: ${_state.viewId}`);
                        if (_state.files.renameLastSession.editing) {
                            // ESC in edit mode: exit edit mode, keep modified filename, highlight SAVE
                            // Do NOT restore original filename - user can save the new name or press ESC again to cancel
                            _state.files.renameLastSession.editing = false;
                            _state.files.renameLastSession.cursorPosition = 0;
                            _state.files.renameLastSession.selectedSoftkeyIndex = 0;
                            _state.files.renameLastSession.focus = "save"; // Highlight SAVE so user can save the new name
                            console.log(`[FILES] Rename ESC: Exited edit mode, focus set to SAVE (filename kept: ${_state.files.renameLastSession.filename})`);
                            _emit();
                        } else {
                            // ESC when not editing: if focus is on SAVE, revert to original filename and return to menu
                            const focus = _state.files.renameLastSession.focus || "file_name";
                            if (focus === "save") {
                                // Second ESC press: cancel rename, revert to original filename
                                _state.files.renameLastSession.filename = _state.files.renameLastSession.originalFilename || "SES001";
                                _state.files.renameLastSession.focus = "file_name";
                                console.log(`[FILES] Rename ESC: Cancelled editing, reverted to original filename: ${_state.files.renameLastSession.filename}`);
                            }
                            
                            // Return to files_menu and go to "SAVE CONFIG FILE" (index 3)
                            const previousView = _popHistory() || "files_menu";
                            console.log(`[FILES] Rename ESC (not editing): previousView=${previousView}, current selectedIndex=${_state.menu.selectedIndex}`);
                            
                            // Always set selectedIndex to 3 (SAVE CONFIG FILE) when returning to files_menu
                            // Set it BEFORE changing viewId to ensure it's set
                            if (previousView === "files_menu") {
                                _state.menu.selectedIndex = 3;
                                console.log(`[FILES] Rename ESC: Setting selectedIndex to 3 BEFORE changing viewId`);
                            }
                            _state.viewId = previousView;
                            
                            // Double-check and force selectedIndex to 3 if we're going to files_menu
                            if (_state.viewId === "files_menu") {
                                if (_state.menu.selectedIndex !== 3) {
                                    console.warn(`[FILES] Rename ESC: WARNING - selectedIndex is ${_state.menu.selectedIndex}, forcing to 3`);
                                    _state.menu.selectedIndex = 3;
                                }
                                console.log(`[FILES] Rename ESC: Returned to files_menu, selectedIndex=${_state.menu.selectedIndex} (should be 3 for "${FILES_MENU_ITEMS[3]}")`);
                            } else {
                                console.log(`[FILES] Rename ESC: Returned to ${previousView}`);
                            }
                            _emit();
                        }
                    } else if (_state.viewId === "files_save_config") {
                        console.log(`[FILES] Save Config ESC pressed - editing: ${_state.files.saveConfig.editing}, viewId: ${_state.viewId}`);
                        if (_state.files.saveConfig.editing) {
                            // ESC in edit mode: exit edit mode, keep modified filename, highlight SAVE
                            // Do NOT restore original filename - user can save the new name or press ESC again to cancel
                            _state.files.saveConfig.editing = false;
                            _state.files.saveConfig.cursorPosition = 0;
                            _state.files.saveConfig.selectedSoftkeyIndex = 0;
                            _state.files.saveConfig.focus = "save"; // Highlight SAVE so user can save the new name
                            console.log(`[FILES] Save Config ESC: Exited edit mode, focus set to SAVE (filename kept: ${_state.files.saveConfig.filename})`);
                            _emit();
                        } else {
                            // ESC when not editing: if focus is on SAVE, revert to original filename and return to menu
                            const focus = _state.files.saveConfig.focus || "file_name";
                            if (focus === "save") {
                                // Second ESC press: cancel save, revert to original filename
                                _state.files.saveConfig.filename = _state.files.saveConfig.originalFilename || "CONFIG001";
                                _state.files.saveConfig.focus = "file_name";
                                console.log(`[FILES] Save Config ESC: Cancelled editing, reverted to original filename: ${_state.files.saveConfig.filename}`);
                            }
                            
                            // Return to files_menu
                            const previousView = _popHistory() || "files_menu";
                            _state.viewId = previousView;
                            console.log(`[FILES] Save Config ESC: Returned to ${previousView}`);
                            _emit();
                        }
                    } else if (_state.viewId === "files_format_card") {
                        // ESC: cancel format and return to files menu
                        // Clear any pending format timer
                        if (_state.timers.formatting) {
                            _clearTimer('formatting');
                        }
                        _state.viewId = "files_menu";
                        _state.menu.selectedIndex = 4; // Go to "FORMAT CARD" (index 4)
                        console.log(`[FILES] Format Card ESC: Cancelled, returned to files_menu`);
                        _emit();
                    } else if (_state.viewId === "files_format_status") {
                        // ESC from format status: return to files menu (formatting may still be in progress)
                        // Note: Timer will still complete and return to files_menu
                        _state.viewId = "files_menu";
                        _state.menu.selectedIndex = 4; // Go to "FORMAT CARD" (index 4)
                        console.log(`[FILES] Format Status ESC: Returned to files_menu`);
                        _emit();
                    } else if (_state.viewId === "files_delete_status") {
                        // ESC: return to previous view
                        _state.viewId = _state.previousViewId || "files_menu";
                        console.log(`[FILES] Delete Status ESC: Returning to previous view`);
                        _emit();
                    } else if (_state.viewId === "files_load_status") {
                        // ESC: return to previous view
                        _state.viewId = _state.previousViewId || "files_menu";
                        console.log(`[FILES] Load Status ESC: Returning to previous view`);
                        _emit();
                    } else if (_state.viewId === "files_session_dir") {
                        // ESC: return to files_menu
                        const previousView = _popHistory() || "files_menu";
                        _state.viewId = previousView;
                        console.log(`[FILES] Session Directory ESC: Returning to ${previousView}`);
                        _emit();
                    } else if (_state.viewId === "files_config_dir") {
                        // ESC: return to files_menu
                        const previousView = _popHistory() || "files_menu";
                        _state.viewId = previousView;
                        console.log(`[FILES] Config Directory ESC: Returning to ${previousView}`);
                        _emit();
                    } else {
                        // Pop history for other file submenus
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
                    // Preserve measurement state when returning to home from SLM screens
                    const measurementState = _state.measurement?.state || "stopped";
                    const backlight = _state.backlight;
                    
                    if (measurementState === "running") {
                        // Keep timer running and state as-is
                        // Don't modify measurement.state or isRunning - preserve them
                        // Use home_screen or home_screen_dim - status bar will show play icon based on state
                        _state.viewId = backlight ? "home_screen" : "home_screen_dim";
                    } else if (measurementState === "paused") {
                        // Timer should still be running but paused (isRunning = false)
                        // Don't stop timer - it keeps running but won't increment
                        // Use home_screen or home_screen_dim based on backlight
                        _state.viewId = backlight ? "home_screen" : "home_screen_dim";
                    } else {
                        // Stopped - stop timer and use home_screen or home_screen_dim
                        if (window.Measurement) {
                            window.Measurement.stop();
                        }
                        if (window.Simulator) {
                            window.Simulator.reset();
                        }
                        _stopMeasurementUpdateLoop();
                        _state.measurement.state = "stopped";
                        _state.measurement.isRunning = false;
                        _stopMeasurementTimer();
                        _state.viewId = backlight ? "home_screen" : "home_screen_dim";
                    }
                    _emit();
                }
                break;

            case "RUN":
            case "RUNPAUSE":
                if (isHome()) {
                    // Toggle play/pause on home screen - stay on home screen
                    if (_state.measurement.state === "stopped") {
                        // Initialize Simulator and start Measurement
                        if (window.Simulator) {
                            // Check if audio is playing - preserve its baseLevel and impulse pattern, otherwise use ambient
                            const audioState = window.AudioPlayer?.getState?.();
                            const simState = window.Simulator.getState();
                            
                            if (audioState && audioState.isPlaying) {
                                // Audio is playing - preserve current simulator settings including impulse pattern
                                window.Simulator.init(_state.measurement.seed || 12345, { 
                                    baseLevel: simState.baseLevel || 47, 
                                    variation: simState.variation || 3,
                                    impulsePattern: simState.impulsePattern || null
                                });
                            } else {
                                // No audio playing - use ambient levels, no impulse pattern
                                window.Simulator.init(_state.measurement.seed || 12345, { baseLevel: 47, variation: 3 });
                            }
                        }
                        if (window.Measurement) {
                            window.Measurement.start();
                        }
                        _state.measurement.state = "running";
                        _state.measurement.isRunning = true;
                        _state.measurement.runtime = 0; // Reset runtime when starting new measurement
                        _startMeasurementTimer();
                        _startMeasurementUpdateLoop();
                    } else if (_state.measurement.state === "running") {
                        // Pause measurement
                        if (window.Measurement) {
                            window.Measurement.pause();
                        }
                        _state.measurement.state = "paused";
                        _state.measurement.isRunning = false;
                        _stopMeasurementUpdateLoop();
                        // Timer keeps running but won't increment (checks isRunning)
                    } else if (_state.measurement.state === "paused") {
                        // Resume measurement
                        if (window.Measurement) {
                            window.Measurement.start();
                        }
                        _state.measurement.state = "running";
                        _state.measurement.isRunning = true;
                        _startMeasurementUpdateLoop();
                        // Timer already running, will resume incrementing
                    }
                    // Stay on home screen - don't call updateSlmScreen()
                    _emit();
                } else if (isSlm() && _state.measurement.state === "stopped") {
                    // Initialize Simulator and start Measurement
                    if (window.Simulator) {
                        // Check if audio is playing - preserve its baseLevel, otherwise use ambient
                        const audioState = window.AudioPlayer?.getState?.();
                        const simState = window.Simulator.getState();
                        
                        if (audioState && audioState.isPlaying) {
                            // Audio is playing - preserve current simulator settings
                            window.Simulator.init(_state.measurement.seed || 12345, { 
                                baseLevel: simState.baseLevel || 47, 
                                variation: simState.variation || 3 
                            });
                        } else {
                            // No audio playing - use ambient levels
                            window.Simulator.init(_state.measurement.seed || 12345, { baseLevel: 47, variation: 3 });
                        }
                    }
                    if (window.Measurement) {
                        window.Measurement.start();
                    }
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.measurement.runtime = 0; // Reset runtime when starting new measurement
                    _startMeasurementTimer();
                    _startMeasurementUpdateLoop();
                    updateSlmScreen();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "running") {
                    // Toggle to paused on SLM screen
                    if (window.Measurement) {
                        window.Measurement.pause();
                    }
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _stopMeasurementUpdateLoop();
                    // Timer keeps running but won't increment (checks isRunning)
                    updateSlmScreen();
                    _emit();
                } else if (isSlm() && _state.measurement.state === "paused") {
                    // Resume measurement
                    if (window.Measurement) {
                        window.Measurement.start();
                    }
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _startMeasurementUpdateLoop();
                    // Timer already running, will resume incrementing
                    updateSlmScreen();
                    _emit();
                }
                break;

            case "PAUSE":
                if (isSlm() && _state.measurement.state === "running") {
                    // Pause measurement
                    if (window.Measurement) {
                        window.Measurement.pause();
                    }
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _stopMeasurementUpdateLoop();
                    // Timer keeps running but won't increment (checks isRunning)
                    updateSlmScreen();
                    _emit();
                }
                break;

            case "STOP_DOWN":
                // Stop only works when paused - start countdown timer
                if (isSlm() && _state.measurement.state === "paused") {
                    _startStopHoldTimer();
                } else if (isSlm() && _state.measurement.state === "running") {
                    // Stop button disabled when running - user must pause first
                    console.log('[FSM] STOP_DOWN: Measurement is running - stop button disabled, must pause first');
                }
                break;

            case "STOP_UP":
                if (_state.viewId === "stop_confirm") {
                    console.log('[FSM] STOP_UP: Cancelling stop countdown');
                    
                    // Clear countdown timer if still running
                    if (_state.timers.stopCountdown) {
                        clearInterval(_state.timers.stopCountdown);
                        _state.timers.stopCountdown = null;
                    }
                    
                    _clearTimer('stopHold');
                    
                    // Return to previous screen
                    if (_state.stopCountdown.previousViewId) {
                        _state.viewId = _state.stopCountdown.previousViewId;
                        _state.stopCountdown.previousViewId = null;
                    } else {
                        // Fallback to paused SLM screen
                        updateSlmScreen();
                    }
                    _state.stopCountdown.countdown = null;
                    _emit();
                }
                break;

            case "SOFT1":
                if ((_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) ||
                    (_state.viewId === "files_save_config" && _state.files.saveConfig.editing)) {
                    if (_state.viewId === "files_rename_last") {
                        _state.files.renameLastSession.selectedSoftkeyIndex = 0;
                        console.log(`[FILES] Rename SOFT1: Selected softkey group 0 (0.....9)`);
                    } else {
                        _state.files.saveConfig.selectedSoftkeyIndex = 0;
                        console.log(`[FILES] Save Config SOFT1: Selected softkey group 0 (0.....9)`);
                    }
                    _emit();
                } else if (isHome()) {
                    // Cycle SLM label: SLM (0) → 1/1 (1) → 1/3 (2) → SLM (0)
                    _state.slmLabelIndex = (_state.slmLabelIndex + 1) % 3;
                    console.log('[FSM] SOFT1 pressed on home → Cycling SLM label, index:', _state.slmLabelIndex);
                    _emit();
                } else if (isSlm()) {
                    // SOFT1 on SLM screens - toggle sound settings overlay
                    // Ensure slmSoundSettings exists
                    if (!_state.slmSoundSettings) {
                        _state.slmSoundSettings = { visible: false, selectedIndex: 0 };
                    }
                    _state.slmSoundSettings.visible = !_state.slmSoundSettings.visible;
                    if (_state.slmSoundSettings.visible) {
                        _state.slmSoundSettings.selectedIndex = 0;
                        console.log('[FSM] SOFT1 pressed on SLM screen - opening sound settings overlay');
                    } else {
                        console.log('[FSM] SOFT1 pressed on SLM screen - closing sound settings overlay');
                    }
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
                } else if (_state.viewId === "files_session_dir") {
                    // SOFT1 = DELETE on Session Directory - delete immediately and show status
                    const selectedIndex = _state.files.sessionDir.selectedIndex;
                    if (selectedIndex >= 0 && selectedIndex < _state.files.sessionFiles.length) {
                        const deletedFile = _state.files.sessionFiles[selectedIndex];
                        const fileName = deletedFile.name || deletedFile;
                        // Delete the file
                        _state.files.sessionFiles.splice(selectedIndex, 1);
                        // Adjust selected index if needed
                        if (_state.files.sessionDir.selectedIndex >= _state.files.sessionFiles.length) {
                            _state.files.sessionDir.selectedIndex = Math.max(0, _state.files.sessionFiles.length - 1);
                        }
                        // Extract number from filename (e.g., "SES001" -> "001", "SES3002" -> "3002")
                        let fileNumber = fileName;
                        const match = fileName.match(/SES(\d+)/i);
                        if (match) {
                            fileNumber = match[1];
                        }
                        // Store deleted filename and show status screen
                        _state.previousViewId = "files_session_dir";
                        _state.viewId = "files_delete_status";
                        _state.files.deleteStatus = _state.files.deleteStatus || {};
                        _state.files.deleteStatus.deletedFileName = `${fileNumber}.SES DELETED`;
                        console.log(`[FILES] Session Directory SOFT1: Deleted file ${fileName} at index ${selectedIndex}`);
                        _emit();
                    }
                }
                break;

            case "SOFT2":
                // Handle SOFT2 on calibration running screen - increase SPL (same as UP arrow)
                if (_state.viewId === "cal_running") {
                    // Mark as manually adjusted to stop all automatic variation and adjustment
                    if (!_state.calibration.adjustment) {
                        _state.calibration.adjustment = {};
                    }
                    _state.calibration.adjustment.manuallyAdjusted = true;
                    _state.calibration.adjustment.stabilized = true;
                    
                    // Increase SPL by 0.1dB, capped at 140dB
                    const current = _state.measurement.currentSPL || 114;
                    _state.measurement.currentSPL = Math.min(140, Math.round((current + 0.1) * 10) / 10);
                    console.log(`[CAL] SOFT2 (UP): SPL = ${_state.measurement.currentSPL.toFixed(1)}dB (manual control - no variation)`);
                    _emit();
                    break;
                }
                if ((_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) ||
                    (_state.viewId === "files_save_config" && _state.files.saveConfig.editing)) {
                    if (_state.viewId === "files_rename_last") {
                        _state.files.renameLastSession.selectedSoftkeyIndex = 1;
                        console.log(`[FILES] Rename SOFT2: Selected softkey group 1 (A.....H)`);
                    } else {
                        _state.files.saveConfig.selectedSoftkeyIndex = 1;
                        console.log(`[FILES] Save Config SOFT2: Selected softkey group 1 (A.....H)`);
                    }
                    _emit();
                } else if (isSlm()) {
                // SLM SOFT2: Cycle F/S/I (time constant)
                    const timeConstants = ['F', 'S', 'I'];
                    const requestedTimeConstant = timeConstants.includes(evt.value) ? evt.value : null;
                    const currentIndex = timeConstants.indexOf(_state.slm.timeConstant || 'S');
                    const nextIndex = (currentIndex + 1) % timeConstants.length;
                    _state.slm.timeConstant = requestedTimeConstant || timeConstants[nextIndex];
                    // Update units format: L + {A/C/Z/F} + {F/S/I}
                    // Map weighting state to display letter: R->A, C->C, Z->Z, F->F
                    const weightingDisplayMap = { 'R': 'A', 'C': 'C', 'Z': 'Z', 'F': 'F' };
                    const weightingLetter = weightingDisplayMap[_state.slm.weighting || 'R'] || 'A';
                    _state.slm.units = `L${weightingLetter}${_state.slm.timeConstant}`;
                    // Update Measurement module config
                    if (window.Measurement) {
                        window.Measurement.updateConfig({ timeConstant: _state.slm.timeConstant });
                    }
                    console.log(`[SLM] SOFT2: Time constant = ${_state.slm.timeConstant}`);
                    _emit();
                    break;
                }
                if (_state.viewId === "battery_menu") {
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
                } else if (isHome()) {
                    // SOFT2 = CAL (Calibration) on Home screen
                    console.log('[FSM] SOFT2 pressed → Navigating to cal_menu');
                    _state.previousViewId = _state.viewId;
                    _state.viewId = "cal_menu";
                    // Initialize calibration menu selectedIndex to 0 (CALIBRATE)
                    // Ensure calibration state exists
                    if (!_state.calibration) {
                        _state.calibration = {
                            lastCalibration: {
                                preCalValue: 114.1,
                                timestamp: "2025-11-06 11:48:44",
                                date: "2025-11-06",
                                time: "11:48:44"
                            },
                            selectedIndex: 0
                        };
                    } else {
                        _state.calibration.selectedIndex = 0;
                    }
                    _emit();
                } else {
                    console.log('[FSM] SOFT2 pressed → Ignored (not on SLM, Home, Battery, DOW, or Date)');
                }
                break;

            case "SOFT3":
                // Handle SOFT3 on calibration running screen - decrease SPL (same as DOWN arrow)
                if (_state.viewId === "cal_running") {
                    // Mark as manually adjusted to stop all automatic variation and adjustment
                    if (!_state.calibration.adjustment) {
                        _state.calibration.adjustment = {};
                    }
                    _state.calibration.adjustment.manuallyAdjusted = true;
                    _state.calibration.adjustment.stabilized = true;
                    
                    // Decrease SPL by 0.1dB, minimum at 50dB (matching bar meter range)
                    const current = _state.measurement.currentSPL || 114;
                    _state.measurement.currentSPL = Math.max(50, Math.round((current - 0.1) * 10) / 10);
                    console.log(`[CAL] SOFT3 (DOWN): SPL = ${_state.measurement.currentSPL.toFixed(1)}dB (manual control - no variation)`);
                    _emit();
                    break;
                }
                if ((_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) ||
                    (_state.viewId === "files_save_config" && _state.files.saveConfig.editing)) {
                    if (_state.viewId === "files_rename_last") {
                        _state.files.renameLastSession.selectedSoftkeyIndex = 2;
                        console.log(`[FILES] Rename SOFT3: Selected softkey group 2 (I.....Q)`);
                    } else {
                        _state.files.saveConfig.selectedSoftkeyIndex = 2;
                        console.log(`[FILES] Save Config SOFT3: Selected softkey group 2 (I.....Q)`);
                    }
                    _emit();
                } else if (isSlm()) {
                // SLM SOFT3: Cycle R/C/Z/F (weighting)
                    const weightings = ['R', 'C', 'Z', 'F'];
                    const requestedWeighting = weightings.includes(evt.value) ? evt.value : null;
                    const currentIndex = weightings.indexOf(_state.slm.weighting || 'R');
                    const nextIndex = (currentIndex + 1) % weightings.length;
                    _state.slm.weighting = requestedWeighting || weightings[nextIndex];
                    // Update units format: L + {A/C/Z/F} + {F/S/I}
                    // Map weighting state to display letter: R->A, C->C, Z->Z, F->F
                    const weightingDisplayMap = { 'R': 'A', 'C': 'C', 'Z': 'Z', 'F': 'F' };
                    const weightingLetter = weightingDisplayMap[_state.slm.weighting] || 'A';
                    const tc = _state.slm.timeConstant || 'S';
                    _state.slm.units = `L${weightingLetter}${tc}`;
                    // Update Measurement module config (map R→A, C→C, Z→Z, F→A)
                    if (window.Measurement) {
                        window.Measurement.updateConfig({ weighting: _mapWeighting(_state.slm.weighting) });
                    }
                    console.log(`[SLM] SOFT3: Weighting = ${_state.slm.weighting}`);
                    _emit();
                    break;
                }
                if (isHome()) {
                    // SOFT3 = FILE (Files menu) on Home screen
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
                } else if (_state.viewId === "files_session_dir") {
                    // SOFT3 = LOAD on Session Directory - show load status screen
                    const selectedIndex = _state.files.sessionDir.selectedIndex;
                    if (selectedIndex >= 0 && selectedIndex < _state.files.sessionFiles.length) {
                        const selectedFile = _state.files.sessionFiles[selectedIndex];
                        const fileName = selectedFile.name || selectedFile;
                        // Extract number from filename (e.g., "SES001" -> "001", "SES3002" -> "3002")
                        let fileNumber = fileName;
                        const match = fileName.match(/SES(\d+)/i);
                        if (match) {
                            fileNumber = match[1];
                        }
                        // Store loaded filename and show status screen
                        _state.previousViewId = "files_session_dir";
                        _state.viewId = "files_load_status";
                        _state.files.loadStatus = _state.files.loadStatus || {};
                        _state.files.loadStatus.loadedFileName = `${fileNumber}.SES LOADED`;
                        console.log(`[FILES] Session Directory SOFT3: Loaded file ${fileName} at index ${selectedIndex}`);
                        _emit();
                    }
                } else {
                    console.log('[FSM] SOFT3 pressed → Ignored (not on SLM, Home, Date, or Session Directory)');
                }
                break;

            case "SOFT4":
                if ((_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) ||
                    (_state.viewId === "files_save_config" && _state.files.saveConfig.editing)) {
                    if (_state.viewId === "files_rename_last") {
                        _state.files.renameLastSession.selectedSoftkeyIndex = 3;
                        console.log(`[FILES] Rename SOFT4: Selected softkey group 3 (R.....Z)`);
                    } else {
                        _state.files.saveConfig.selectedSoftkeyIndex = 3;
                        console.log(`[FILES] Save Config SOFT4: Selected softkey group 3 (R.....Z)`);
                    }
                    _emit();
                } else if (isSlm()) {
                // SLM SOFT4: Toggle Meter 1/2
                    _state.slm.activeMeter = _state.slm.activeMeter === 1 ? 2 : 1;
                    console.log(`[SLM] SOFT4: Active meter = ${_state.slm.activeMeter}`);
                    _emit();
                    break;
                }
                if (_state.viewId === "auto_run_date_params") {
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
                } else if (_state.viewId === "files_session_dir") {
                    // SOFT4 = "more..." on Session Directory (if more than 10 files)
                    const fileList = _state.files.sessionFiles;
                    console.log(`[FILES] Session Directory SOFT4: fileList.length=${fileList.length}, scrollOffset=${_state.files.sessionDir.scrollOffset}`);
                    if (fileList.length > 10) {
                        // Scroll to next 10 files
                        const maxVisible = 10;
                        const currentOffset = _state.files.sessionDir.scrollOffset;
                        const newOffset = currentOffset + maxVisible;
                        
                        // If we've scrolled past the end, wrap back to beginning
                        if (newOffset >= fileList.length) {
                            _state.files.sessionDir.scrollOffset = 0;
                            _state.files.sessionDir.selectedIndex = 0;
                            console.log(`[FILES] Session Directory SOFT4: Wrapped to beginning (offset 0)`);
                        } else {
                            _state.files.sessionDir.scrollOffset = newOffset;
                            // Adjust selected index to first visible item
                            _state.files.sessionDir.selectedIndex = newOffset;
                            console.log(`[FILES] Session Directory SOFT4: Scroll to offset ${newOffset}`);
                        }
                        _emit();
                    } else {
                        console.log(`[FILES] Session Directory SOFT4: Not enough files (${fileList.length} <= 10), no action`);
                    }
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

            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                // Character input for text editing (rename, save config)
                if (_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) {
                    const char = evt.type;
                    const filename = _state.files.renameLastSession.filename;
                    const cursorPos = _state.files.renameLastSession.cursorPosition;
                    // Insert character at cursor position
                    const newFilename = filename.slice(0, cursorPos) + char + filename.slice(cursorPos);
                    // Limit filename length (e.g., 8 characters)
                    if (newFilename.length <= 8) {
                        _state.files.renameLastSession.filename = newFilename;
                        _state.files.renameLastSession.cursorPosition = cursorPos + 1;
                        console.log(`[FILES] Rename: Inserted '${char}' at position ${cursorPos}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_save_config" && _state.files.saveConfig.editing) {
                    const char = evt.type;
                    const filename = _state.files.saveConfig.filename;
                    const cursorPos = _state.files.saveConfig.cursorPosition;
                    // Insert character at cursor position
                    const newFilename = filename.slice(0, cursorPos) + char + filename.slice(cursorPos);
                    // Limit filename length (e.g., 8 characters)
                    if (newFilename.length <= 8) {
                        _state.files.saveConfig.filename = newFilename;
                        _state.files.saveConfig.cursorPosition = cursorPos + 1;
                        console.log(`[FILES] Save Config: Inserted '${char}' at position ${cursorPos}`);
                        _emit();
                    }
                }
                break;

            case "backspace":
                // Backspace for text editing (rename, save config)
                if (_state.viewId === "files_rename_last" && _state.files.renameLastSession.editing) {
                    const filename = _state.files.renameLastSession.filename;
                    const cursorPos = _state.files.renameLastSession.cursorPosition;
                    if (cursorPos > 0) {
                        // Delete character before cursor
                        const newFilename = filename.slice(0, cursorPos - 1) + filename.slice(cursorPos);
                        _state.files.renameLastSession.filename = newFilename;
                        _state.files.renameLastSession.cursorPosition = cursorPos - 1;
                        console.log(`[FILES] Rename: Deleted character at position ${cursorPos - 1}`);
                        _emit();
                    }
                } else if (_state.viewId === "files_save_config" && _state.files.saveConfig.editing) {
                    const filename = _state.files.saveConfig.filename;
                    const cursorPos = _state.files.saveConfig.cursorPosition;
                    if (cursorPos > 0) {
                        // Delete character before cursor
                        const newFilename = filename.slice(0, cursorPos - 1) + filename.slice(cursorPos);
                        _state.files.saveConfig.filename = newFilename;
                        _state.files.saveConfig.cursorPosition = cursorPos - 1;
                        console.log(`[FILES] Save Config: Deleted character at position ${cursorPos - 1}`);
                        _emit();
                    }
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

    /**
     * Walkthrough: after calibrator is on the mic, animate SLM reading 125 → 114 dB on cal_running.
     * Stops the default cal interval so the scripted ramp is visible.
     */
    function beginWalkthroughCalSPLRamp125To114(options) {
        const onComplete =
            typeof options === 'function' ? options : options && typeof options.onComplete === 'function' ? options.onComplete : null;
        if (_state.viewId !== 'cal_running') {
            console.warn('[WALKTHROUGH CAL] beginWalkthroughCalSPLRamp125To114: expected cal_running, got', _state.viewId);
            return;
        }
        _clearTimer('cal');
        _clearTimer('walkthroughCalRamp');
        if (!_state.calibration) {
            _state.calibration = { selectedIndex: 0, adjustment: {} };
        }
        if (!_state.calibration.adjustment) {
            _state.calibration.adjustment = {};
        }
        _state.calibration.adjustment.manuallyAdjusted = true;
        const from = 125;
        const to = 114;
        const durationMs = 6500;
        const t0 = Date.now();
        _state.measurement.currentSPL = from;
        _emit();
        _state.timers.walkthroughCalRamp = setInterval(() => {
            if (_state.viewId !== 'cal_running') {
                _clearTimer('walkthroughCalRamp');
                _state.calibration.adjustment.manuallyAdjusted = false;
                return;
            }
            const elapsed = Date.now() - t0;
            let u = Math.min(1, elapsed / durationMs);
            u = 1 - Math.pow(1 - u, 3);
            const v = from + (to - from) * u;
            _state.measurement.currentSPL = Math.round(v * 10) / 10;
            _emit();
            if (elapsed >= durationMs) {
                _clearTimer('walkthroughCalRamp');
                _state.measurement.currentSPL = to;
                _state.calibration.adjustment.manuallyAdjusted = false;
                _emit();
                try {
                    onComplete?.();
                } catch (e) {
                    console.warn('[WALKTHROUGH CAL] ramp onComplete failed:', e);
                }
            }
        }, 80);
    }

    // Export to window
    window.initMainFSM = initMainFSM;
    window.subscribeMainFSM = subscribe;
    window.getMainFSMState = getState;
    window.dispatch = dispatch;
    window.beginWalkthroughCalSPLRamp125To114 = beginWalkthroughCalSPLRamp125To114;
})();
