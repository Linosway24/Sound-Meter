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
        "COMMS",
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

    // Generate L01 to L99 options (all values from 1 to 99)
    // Lmax is not included in UP/DOWN navigation - only L01 to L99
    const L_OPTIONS = ["OFF"];
    for (let i = 1; i <= 99; i++) {
        L_OPTIONS.push(`L${String(i).padStart(2, '0')}`);
    }
    // Note: Lmax is not in the options array - UP/DOWN only cycles L01 to L99

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
        flags: { locked: false },
        measurement: { runtime: 0, state: "stopped", isRunning: false },
        history: [],
        previousViewId: null // For navigation back from cal/files/etc
    };

    const _subs = new Set();
    function _emit() { _subs.forEach(cb => cb(getState())); }

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
        return _state.viewId === "home_screen" || _state.viewId === "home_screen_dim";
    }

    function isSlm() {
        return _state.viewId === "slm_home" || _state.viewId === "slm_home_paused" || _state.viewId === "slm_home_stopped";
    }

    function isInSetup() {
        return _state.viewId.startsWith("setup_") || _state.viewId.startsWith("measure_") || 
               _state.viewId.startsWith("meter_set_") || _state.viewId.startsWith("auto_run_") ||
               _state.viewId.startsWith("datetime_") || _state.viewId.startsWith("digital_out_") ||
               _state.viewId.startsWith("options_") || _state.viewId.startsWith("sig_input_") ||
               _state.viewId.startsWith("logging_") || _state.viewId.startsWith("comms_") ||
               _state.viewId.startsWith("battery_") || _state.viewId.startsWith("display_");
    }

    function isInFiles() {
        return _state.viewId.startsWith("files_");
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
            flags: { locked: false },
            measurement: { runtime: 0, state: "stopped", isRunning: false },
            history: [],
            previousViewId: null
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
            _state.viewId = "slm_home_stopped";
            _clearTimer('stopHold');
            if (window.Config && window.Config.ENABLE_TOASTS) {
                _showToast("Saved & cleared", 2000);
            }
            _emit();
        }, 3000);
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
                } else if (isHome()) {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
                    console.log(`[MENU] Home menu - Selected index: ${_state.menu.selectedIndex} → "${MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (isInFiles() && (_state.viewId === "files_session_dir" || _state.viewId === "files_config_dir")) {
                    _state.files.cursor = Math.max(0, _state.files.cursor - 1);
                    _emit();
                }
                break;

            case "DOWN":
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
                } else if (isHome()) {
                    _state.menu.selectedIndex = (_state.menu.selectedIndex + 1) % MENU_ITEMS.length;
                    console.log(`[MENU] Home menu - Selected index: ${_state.menu.selectedIndex} → "${MENU_ITEMS[_state.menu.selectedIndex]}"`);
                    _emit();
                } else if (isInFiles() && (_state.viewId === "files_session_dir" || _state.viewId === "files_config_dir")) {
                    _state.files.cursor++;
                    _emit();
                }
                break;

            case "LEFT":
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
                        _state.viewId = "home_screen_running";
                        _emit();
                    } else if (item === "VIEW SESSION") {
                        _state.viewId = "slm_home";
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
                        _emit();
                    } else if (item === "DATETIME") {
                        _pushHistory("datetime_menu");
                        _state.viewId = "datetime_menu";
                        _emit();
                    } else if (item === "DIGITAL OUT") {
                        _pushHistory("digital_out_menu");
                        _state.viewId = "digital_out_menu";
                        _emit();
                    } else if (item === "OPTIONS") {
                        _pushHistory("options_menu");
                        _state.viewId = "options_menu";
                        _emit();
                    } else if (item === "SIG INPUT") {
                        _pushHistory("sig_input_menu");
                        _state.viewId = "sig_input_menu";
                        _emit();
                    } else if (item === "LOGGING") {
                        _pushHistory("logging_menu");
                        _state.viewId = "logging_menu";
                        _emit();
                    } else if (item === "COMMS") {
                        _pushHistory("comms_menu");
                        _state.viewId = "comms_menu";
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
                } else if (_state.viewId === "comms_menu") {
                    _state.viewId = "comms_edit";
                    _emit();
                } else if (_state.viewId === "comms_edit") {
                    _showToast("Comms updated");
                    _state.viewId = "comms_menu";
                    _emit();
                } else if (_state.viewId === "datetime_menu") {
                    _state.viewId = "datetime_edit";
                    _emit();
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
                        _state.measurement.state = "running";
                        _state.measurement.isRunning = true;
                        _state.viewId = "home_screen_running";
                        _emit();
                    } else if (item === "VIEW SESSION") {
                        _state.measurement.state = "running";
                        _state.measurement.isRunning = true;
                        _state.viewId = "slm_home";
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
                    _state.viewId = "slm_home";
                    _emit();
                } else if (_state.viewId === "slm_home" && _state.measurement.state === "running") {
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _state.viewId = "slm_home_paused";
                    _emit();
                } else if (_state.viewId === "slm_home_paused") {
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                }
                break;

            case "ESC":
                if (_state.viewId === "stop_confirm") {
                    _clearTimer('stopHold');
                    _state.viewId = _state.measurement.state === "running" ? "slm_home" : "slm_home_paused";
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
                    if (_state.measurement.state === "running") {
                        _state.viewId = "slm_home";
                    } else if (_state.measurement.state === "paused") {
                        _state.viewId = "slm_home_paused";
                    } else {
                        _state.viewId = "slm_home_stopped";
                    }
                    _emit();
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
                    _state.viewId = "home_screen";
                    _emit();
                }
                break;

            case "RUN":
            case "RUNPAUSE":
                if (isHome() || _state.viewId === "slm_home_stopped") {
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                } else if (_state.viewId === "slm_home_paused") {
                    _state.measurement.state = "running";
                    _state.measurement.isRunning = true;
                    _state.viewId = "slm_home";
                    _emit();
                }
                break;

            case "PAUSE":
                if (_state.viewId === "slm_home" && _state.measurement.state === "running") {
                    _state.measurement.state = "paused";
                    _state.measurement.isRunning = false;
                    _state.viewId = "slm_home_paused";
                    _emit();
                }
                break;

            case "STOP_DOWN":
                if (_state.viewId === "slm_home" || _state.viewId === "slm_home_paused") {
                    _startStopHoldTimer();
                }
                break;

            case "STOP_UP":
                if (_state.viewId === "stop_confirm") {
                    _clearTimer('stopHold');
                    _state.viewId = _state.measurement.state === "running" ? "slm_home" : "slm_home_paused";
                    _emit();
                }
                break;

            case "SOFT1":
                if (isHome()) {
                    // Cycle SLM label: SLM (0) → 1/1 (1) → 1/3 (2) → SLM (0)
                    _state.slmLabelIndex = (_state.slmLabelIndex + 1) % 3;
                    console.log('[FSM] SOFT1 pressed on home → Cycling SLM label, index:', _state.slmLabelIndex);
                    _emit();
                } else if (isSlm()) {
                    _state.viewId = "slm_view_menu";
                    _state.menu.selectedIndex = 0;
                    _emit();
                }
                break;

            case "SOFT2":
                if (isSlm() || isHome()) {
                    // SOFT2 = CAL (Calibration)
                    console.log('[FSM] SOFT2 pressed → Navigating to cal_menu');
                    _state.previousViewId = _state.viewId;
                    _state.viewId = "cal_menu";
                    _emit();
                } else {
                    console.log('[FSM] SOFT2 pressed → Ignored (not on SLM or Home)');
                }
                break;

            case "SOFT3":
                if (isSlm() || isHome()) {
                    // SOFT3 = FILE (Files menu)
                    console.log('[FSM] SOFT3 pressed → Navigating to files_menu');
                    _state.viewId = "files_menu";
                    _state.menu.selectedIndex = 0;
                    _emit();
                } else {
                    console.log('[FSM] SOFT3 pressed → Ignored (not on SLM or Home)');
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

