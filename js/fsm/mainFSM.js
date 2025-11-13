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
        "METER SET",
        "MEASURE",
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
        { title: "Weighting", value: "A", options: ["A", "C", "Z"] },
        { title: "Time Constant", value: "Slow", options: ["Slow", "Fast", "Impulse"] },
        { title: "Range", value: 80, min: 30, max: 130, step: 10 }
    ];

    // State shape
    let _state = {
        viewId: "OFF",
        backlight: false,
        mode: "SLM",
        menu: { selectedIndex: 0 },
        toast: null,
        timers: {
            stopHold: null,
            formatting: null,
            cal: null,
            measurementRuntime: null
        },
        files: { cursor: 0 },
        display: { contrast: 0, backlightMode: "On", language: "EN" },
        meterSet: { editing: false, focus: "title", selectedIndex: 0, items: METER_SET_ITEMS.map(item => ({ ...item })) },
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
            timers: { stopHold: null, formatting: null, cal: null, measurementRuntime: null },
            files: { cursor: 0 },
            display: { contrast: 0, backlightMode: "On", language: "EN" },
            meterSet: { editing: false, focus: "title", selectedIndex: 0, items: METER_SET_ITEMS.map(item => ({ ...item })) },
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
                if (_state.meterSet.editing && _state.viewId === "meter_set_edit") {
                    const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                    if (_state.meterSet.focus === "value") {
                        if (item.options) {
                            const idx = item.options.indexOf(item.value);
                            const newIdx = (idx + item.options.length - 1) % item.options.length;
                            item.value = item.options[newIdx];
                        } else if (item.min !== undefined) {
                            item.value = Math.min(item.max, item.value + (item.step || 1));
                        }
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
                if (_state.meterSet.editing && _state.viewId === "meter_set_edit") {
                    const item = _state.meterSet.items[_state.meterSet.selectedIndex];
                    if (_state.meterSet.focus === "value") {
                        if (item.options) {
                            const idx = item.options.indexOf(item.value);
                            const newIdx = (idx + 1) % item.options.length;
                            item.value = item.options[newIdx];
                        } else if (item.min !== undefined) {
                            item.value = Math.max(item.min, item.value - (item.step || 1));
                        }
                        _emit();
                    }
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
                if (_state.viewId === "display_contrast") {
                    _state.display.contrast = Math.max(0, _state.display.contrast - 1);
                    _emit();
                } else if (_state.meterSet.editing && _state.viewId === "meter_set_edit") {
                    if (_state.meterSet.focus === "value") {
                        _state.meterSet.focus = "title";
                        _emit();
                    }
                }
                break;

            case "RIGHT":
                if (_state.viewId === "display_contrast") {
                    _state.display.contrast = Math.min(100, _state.display.contrast + 1);
                    _emit();
                } else if (_state.meterSet.editing && _state.viewId === "meter_set_edit") {
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
                        _state.viewId = "meter_set_menu";
                        _state.meterSet.selectedIndex = 0;
                        _emit();
                    } else if (item === "MEASURE") {
                        _state.viewId = "measure_menu";
                        _emit();
                    } else if (item === "AUTO RUN") {
                        _state.viewId = "auto_run_menu";
                        _emit();
                    } else if (item === "DATETIME") {
                        _state.viewId = "datetime_menu";
                        _emit();
                    } else if (item === "DIGITAL OUT") {
                        _state.viewId = "digital_out_menu";
                        _emit();
                    } else if (item === "OPTIONS") {
                        _state.viewId = "options_menu";
                        _emit();
                    } else if (item === "SIG INPUT") {
                        _state.viewId = "sig_input_menu";
                        _emit();
                    } else if (item === "LOGGING") {
                        _state.viewId = "logging_menu";
                        _emit();
                    } else if (item === "COMMS") {
                        _state.viewId = "comms_menu";
                        _emit();
                    } else if (item === "BATTERY") {
                        _state.viewId = "battery_menu";
                        _emit();
                    } else if (item === "DISPLAY") {
                        _state.viewId = "display_menu";
                        _emit();
                    }
                } else if (_state.viewId === "meter_set_menu") {
                    _state.meterSet.editing = true;
                    _state.meterSet.focus = "value";
                    _state.viewId = "meter_set_edit";
                    _emit();
                } else if (_state.viewId === "meter_set_edit") {
                    if (_state.meterSet.focus === "value") {
                        _state.meterSet.focus = "title";
                        _emit();
                    } else if (_state.meterSet.focus === "title") {
                        _state.meterSet.editing = false;
                        _state.meterSet.focus = "title";
                        _state.viewId = "meter_set_menu";
                        _emit();
                    }
                } else if (_state.viewId === "display_menu") {
                    // Navigate to display submenus (simplified - could be expanded)
                    _state.viewId = "display_contrast";
                    _emit();
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
                        _state.viewId = "files_session_dir";
                        _state.files.cursor = 0;
                        _emit();
                    } else if (item === "CONFIG DIRECTORY") {
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
                        _state.viewId = "setup_menu";
                        _state.menu.selectedIndex = 0;
                        _emit();
                    } else if (item === "UNIT INFO") {
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
                } else if (_state.meterSet.editing && _state.viewId === "meter_set_edit") {
                    _state.meterSet.editing = false;
                    _state.meterSet.focus = "title";
                    _state.viewId = "meter_set_menu";
                    _emit();
                } else if (_state.viewId === "meter_set_menu") {
                    _state.viewId = "setup_menu";
                    _state.meterSet.selectedIndex = 0;
                    _emit();
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
                        _state.viewId = "home_screen";
                        _emit();
                    } else {
                        _state.viewId = "setup_menu";
                        _emit();
                    }
                } else if (isInFiles()) {
                    if (_state.viewId === "files_menu") {
                        _state.viewId = "home_screen";
                        _emit();
                    } else if (_state.viewId === "files_delete_confirm") {
                        _state.viewId = _state.previousViewId || "files_menu";
                        _emit();
                    } else {
                        _state.viewId = "files_menu";
                        _emit();
                    }
                } else if (_state.viewId === "lock_menu") {
                    _state.viewId = "home_screen";
                    _emit();
                } else if (_state.viewId === "unit_info") {
                    _state.viewId = "home_screen";
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
                if (isSlm()) {
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

