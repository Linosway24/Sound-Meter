/**
 * Button Handler System
 * Implements event delegation, short/long press detection, keyboard input
 */

(() => {
    'use strict';

    // Press detection state
    const pressState = {
        powerPressStart: null,
        powerPressThreshold: 800, // milliseconds
        activePressTimer: null,
        activeButton: null
    };

    // Button class to action mapping
    const buttonMap = {
        // Soft keys
        'soft-key--1': { type: 'softKey', number: 1, name: 'Soft Key 1' },
        'soft-key--2': { type: 'softKey', number: 2, name: 'Soft Key 2' },
        'soft-key--3': { type: 'softKey', number: 3, name: 'Soft Key 3' },
        'soft-key--4': { type: 'softKey', number: 4, name: 'Soft Key 4' },
        
        // Navigation buttons
        'nav__btn--up': { type: 'nav', action: 'up', name: 'Up' },
        'nav__btn--down': { type: 'nav', action: 'down', name: 'Down' },
        'nav__btn--left': { type: 'nav', action: 'left', name: 'Left' },
        'nav__btn--right': { type: 'nav', action: 'right', name: 'Right' },
        'nav__btn--enter': { type: 'nav', action: 'enter', name: 'Enter' },
        
        // Function buttons
        'fn-btn--altf': { type: 'function', action: 'altF', name: 'Alt f' },
        'fn-btn--backlight': { type: 'function', action: 'backlight', name: 'Backlight' },
        'fn-btn--runpause': { type: 'function', action: 'runPause', name: 'Run/Pause' },
        'fn-btn--stop': { type: 'function', action: 'stop', name: 'Stop' },
        'fn-btn--power': { type: 'function', action: 'power', name: 'Power' }
    };

    /**
     * Get button info from element (traverses up DOM tree if needed)
     * @param {HTMLElement} element - Button element or child element
     * @returns {Object|null} Button info object
     */
    function getButtonInfo(element) {
        if (!element) return null;
        
        let current = element;
        let attempts = 0;
        const maxAttempts = 5; // Prevent infinite loop
        
        // Traverse up DOM tree to find button element
        while (current && attempts < maxAttempts) {
            // Check all classes on element
            for (const className of current.classList) {
                if (buttonMap[className]) {
                    return buttonMap[className];
                }
            }
            
            // If not found, check parent
            current = current.parentElement;
            attempts++;
        }
        
        return null;
    }

    /**
     * Add visual press feedback
     * @param {HTMLElement} element - Button element
     */
    function addPressFeedback(element) {
        if (element) {
            element.classList.add('button--pressed');
        }
    }

    /**
     * Remove visual press feedback
     * @param {HTMLElement} element - Button element
     */
    function removePressFeedback(element) {
        if (element) {
            element.classList.remove('button--pressed');
        }
    }

    function isWalkthroughInputLocked() {
        if (
            document.body.classList.contains('setup-active') ||
            document.body.classList.contains('calibration-active') ||
            document.body.classList.contains('operation-active')
        ) return false;
        return typeof window.isWalkthroughGuidanceReady === 'function' &&
            !window.isWalkthroughGuidanceReady();
    }

    function dispatchWithWalkthroughGuard(evt) {
        if (!window.dispatch) return false;
        if (document.body.classList.contains('setup-active')) {
            window.dispatch(evt);
            return true;
        }
        const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
        if (typeof window.shouldBlockWalkthroughEvent === 'function' && window.shouldBlockWalkthroughEvent(evt, fsmState)) {
            return false;
        }
        window.dispatch(evt);
        return true;
    }

    /**
     * Handle button press (short press)
     * @param {HTMLElement} element - Button element
     * @param {Object} buttonInfo - Button info object
     */
    function handleButtonPress(element, buttonInfo) {
        // Check if mainFSM is available
        if (window.dispatch) {
            // For mainFSM mode, check FSM state instead of device power state
            const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
            const isOff = !fsmState || fsmState.viewId === 'OFF';
            
            if (isOff && buttonInfo.action !== 'power') {
                // Device is off - only power button works
                return;
            }
        } else {
            // Original behavior: check device power state
            const devicePowered = window.isPoweredOn ? window.isPoweredOn() : false;
            
            if (!devicePowered) {
                // Device is off - only power button works
                if (buttonInfo.action !== 'power') {
                    return;
                }
            }
        }

        console.log(`[BUTTON] ${buttonInfo.name}: SHORT PRESS`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'buttons.js:117',message:'handleButtonPress entry',data:{buttonName:buttonInfo.name,buttonType:buttonInfo.type,buttonAction:buttonInfo.action},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        switch (buttonInfo.type) {
            case 'softKey':
                handleSoftKey(buttonInfo.number);
                break;
            case 'nav':
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'buttons.js:124',message:'handleButtonPress calling handleNavigation',data:{action:buttonInfo.action},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                handleNavigation(buttonInfo.action);
                break;
            case 'function':
                handleFunctionButton(buttonInfo.action, element);
                break;
        }
    }

    /**
     * Handle soft key press
     * @param {number} key - Soft key number (1-4)
     */
    function handleSoftKey(key) {
        // Use mainFSM dispatch if available
        if (window.dispatch) {
            if (key === 1) {
                console.log('[BUTTON] Soft Key 1: View menu (via mainFSM)');
                dispatchWithWalkthroughGuard({ type: 'SOFT1' });
                return;
            }
            if (key === 2) {
                // Check current view to determine action
                const fsmState = window.getMainFSMState?.();
                const viewId = fsmState?.viewId;
                
                if (viewId === "battery_menu") {
                    // On battery menu, send SOFT2 for NiMH
                    console.log(`[BUTTON] Soft Key 2: Battery NiMH (via mainFSM)`);
                    dispatchWithWalkthroughGuard({ type: 'SOFT2' });
                } else {
                    // On other screens (SLM, Home, etc.), send SOFT2 for Calibration
                    console.log('[BUTTON] Soft Key 2: Calibration menu (via mainFSM)');
                    dispatchWithWalkthroughGuard({ type: 'SOFT2' });
                }
                return;
            }
            if (key === 3) {
                console.log('[BUTTON] Soft Key 3: Calibration menu (via mainFSM)');
                dispatchWithWalkthroughGuard({ type: 'SOFT3' });
                return;
            }
            if (key === 4) {
                // Check current view to determine action
                const fsmState = window.getMainFSMState?.();
                const viewId = fsmState?.viewId;
                
                // Check if SLM screen (same logic as isSlm() in mainFSM.js)
                const isSlmScreen = viewId && (
                    viewId.startsWith("slm_home") ||
                    viewId.startsWith("slm_graph_1of1") ||
                    viewId.startsWith("slm_graph_1of3")
                );
                
                if (isSlmScreen || viewId === "logging_menu" || viewId === "auto_run_date_params" || viewId === "files_session_dir") {
                    // On SLM screens, logging menu, date params screen, or session directory, send SOFT4
                    console.log(`[BUTTON] Soft Key 4: (via mainFSM)`);
                    dispatchWithWalkthroughGuard({ type: 'SOFT4' });
                } else {
                    // On other screens (home, etc.), send LOCK_SOFTKEY
                    console.log('[BUTTON] Soft Key 4: Lock menu (via mainFSM)');
                    dispatchWithWalkthroughGuard({ type: 'LOCK_SOFTKEY' });
                }
                return;
            }
        }
        
        // Fallback to original handler
        if (window.handleSoftKey) {
            window.handleSoftKey(key);
        }
    }

    /**
     * Handle navigation input
     * @param {string} direction - 'up', 'down', 'left', 'right', 'enter'
     */
    function handleNavigation(direction) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'buttons.js:200',message:'handleNavigation entry',data:{direction,hasDispatch:!!window.dispatch},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Use mainFSM dispatch if available
        if (window.dispatch) {
            const fsmEvents = {
                'up': 'UP',
                'down': 'DOWN',
                'left': 'LEFT',
                'right': 'RIGHT',
                'enter': 'ENTER'
            };
            
            const fsmEvent = fsmEvents[direction];
            if (fsmEvent) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/d29d041b-3e2f-4de6-8d28-ee7a100756fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'buttons.js:214',message:'handleNavigation calling dispatch',data:{direction,fsmEvent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                console.log(`[BUTTON] Navigation ${direction}: (via mainFSM)`);
                dispatchWithWalkthroughGuard({ type: fsmEvent });
                return;
            }
        }
        
        // Fallback to original handler
        if (window.handleNavigation) {
            window.handleNavigation(direction);
        }
    }

    /**
     * Handle function button press
     * @param {string} action - Function action name
     * @param {HTMLElement} element - Button element
     */
    function handleFunctionButton(action, element) {
        switch (action) {
            case 'altF':
                if (window.handleAltF) {
                    window.handleAltF();
                }
                break;
            case 'backlight':
                handleBacklight();
                break;
            case 'runPause':
                handleRunPause();
                break;
            case 'stop':
                // Stop button handled separately for down/up events
                break;
            case 'power':
                // Power button handled separately for long press
                break;
        }
    }

    /**
     * Handle backlight button
     */
    function handleBacklight() {
        console.log('[BUTTON] Backlight: Button pressed');
        
        // Use mainFSM dispatch if available
        if (window.dispatch) {
            console.log('[BUTTON] Backlight: Dispatching BACKLIGHT event (via mainFSM)');
            dispatchWithWalkthroughGuard({ type: 'BACKLIGHT' });
        } else {
            console.log('[BUTTON] Backlight: Toggle (placeholder for Task 4.0)');
            // Full implementation in Task 4.0
        }
    }

    /**
     * Handle Run/Pause button
     */
    function handleRunPause() {
        // Use mainFSM dispatch if available
        if (window.dispatch) {
            console.log('[BUTTON] Run/Pause: Toggle (via mainFSM)');
            dispatchWithWalkthroughGuard({ type: 'RUNPAUSE' });
            return;
        }
        
        console.log('[BUTTON] Run/Pause: Toggle (placeholder for Task 5.0)');
        // Full implementation in Task 5.0
    }

    // Stop button press state tracking
    const stopButtonState = {
        pressStart: null,
        activeTimer: null
    };

    /**
     * Handle Stop button down (mouse/keyboard down)
     * @param {HTMLElement} element - Stop button element
     */
    function handleStopDown(element) {
        // Use mainFSM dispatch if available
        if (window.dispatch) {
            stopButtonState.pressStart = Date.now();
            stopButtonState.activeButton = element;
            addPressFeedback(element);
            console.log('[BUTTON] Stop: Button down (via mainFSM)');
            
            // Dispatch STOP_DOWN - FSM will check if paused and start countdown
            dispatchWithWalkthroughGuard({ type: 'STOP_DOWN' });
            return;
        }
        
        // Fallback behavior
        console.log('[BUTTON] Stop: Stop measurement (placeholder for Task 5.0)');
    }

    /**
     * Handle Stop button up (mouse/keyboard up)
     * @param {HTMLElement} element - Stop button element
     */
    function handleStopUp(element) {
        // Use mainFSM dispatch if available
        if (window.dispatch) {
            removePressFeedback(element);
            console.log('[BUTTON] Stop: Button up (via mainFSM)');
            
            // Dispatch STOP_UP - FSM will cancel countdown if active
            dispatchWithWalkthroughGuard({ type: 'STOP_UP' });
            stopButtonState.pressStart = null;
            return;
        }
        
        // Fallback behavior
        removePressFeedback(element);
    }

    /**
     * Handle Stop button (placeholder for Task 5.0)
     */
    function handleStop() {
        // This is called for short press - but v2 uses down/up events
        const useFSMV2 = window.Config && window.Config.FEATURE_FSM_V2;
        
        if (!useFSMV2) {
            console.log('[BUTTON] Stop: Stop measurement (placeholder for Task 5.0)');
        }
    }

    /**
     * Handle power button mouse/keyboard down
     * @param {HTMLElement} element - Power button element
     */
    function handlePowerDown(element) {
        console.log('[BUTTON] Power: DOWN event received');
        pressState.powerPressStart = Date.now();
        pressState.activeButton = element;
        addPressFeedback(element);

        // Check if mainFSM is available
        if (window.dispatch) {
            console.log('[BUTTON] Power: mainFSM mode detected');
            const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
            const isOff = !fsmState || fsmState.viewId === 'OFF';
            const isHome = fsmState && (fsmState.viewId === 'home_screen' || fsmState.viewId === 'home_screen_dim');
            
            // If on home screen, start 3-second countdown for power off
            if (isHome && !isOff) {
                console.log('[BUTTON] Power: On home screen, starting 3-second countdown');
                // Dispatch event to start countdown
                if (!dispatchWithWalkthroughGuard({ type: 'POWER_HOLD_START' })) {
                    pressState.powerPressStart = null;
                    pressState.activeButton = null;
                    removePressFeedback(element);
                    return;
                }
                
                // Start countdown timer (3 seconds = 3000ms)
                pressState.activePressTimer = setTimeout(() => {
                    console.log('[BUTTON] Power: 3-second hold complete - Powering OFF');
                    dispatchWithWalkthroughGuard({ type: 'POWER_HOLD_COMPLETE' });
                    pressState.powerPressStart = null;
                    pressState.activePressTimer = null;
                    removePressFeedback(element);
                }, 3000);
            } else if (isOff) {
                // Device is off, short press will power on (handled in POWER event)
                // No long press needed when off
                if (pressState.activePressTimer) {
                    clearTimeout(pressState.activePressTimer);
                    pressState.activePressTimer = null;
                }
            } else {
                // Not on home screen, use original long press behavior (800ms)
                pressState.activePressTimer = setTimeout(() => {
                    const duration = Date.now() - pressState.powerPressStart;
                    console.log(`[BUTTON] Power: LONG PRESS (${duration}ms) - Power OFF`);
                    
                    // Power off via device.js
                    if (window.powerOff) {
                        window.powerOff();
                    }
                    // Reset mainFSM
                    if (window.initMainFSM) {
                        window.initMainFSM();
                    }
                    
                    pressState.powerPressStart = null;
                    pressState.activePressTimer = null;
                    removePressFeedback(element);
                }, pressState.powerPressThreshold);
            }
        } else {
            // Original behavior
            // Start long press timer
            pressState.activePressTimer = setTimeout(() => {
                const duration = Date.now() - pressState.powerPressStart;
                console.log(`[BUTTON] Power: LONG PRESS (${duration}ms) - Power ${window.isPoweredOn() ? 'OFF' : 'ON'}`);
                
                if (window.togglePower) {
                    window.togglePower();
                }
                
                pressState.powerPressStart = null;
                pressState.activePressTimer = null;
                removePressFeedback(element);
            }, pressState.powerPressThreshold);
        }
    }

    /**
     * Handle power button mouse/keyboard up
     * @param {HTMLElement} element - Power button element
     */
    function handlePowerUp(element) {
        console.log('[BUTTON] Power: UP event received');
        console.log('[BUTTON] Power: activePressTimer =', pressState.activePressTimer);
        console.log('[BUTTON] Power: powerPressStart =', pressState.powerPressStart);
        
        if (pressState.activePressTimer) {
            // Cancel long press timer or countdown
            clearTimeout(pressState.activePressTimer);
            pressState.activePressTimer = null;

            const duration = Date.now() - pressState.powerPressStart;
            console.log('[BUTTON] Power: Press duration =', duration, 'ms');
            
            // If we were in countdown mode, cancel it
            if (window.dispatch && window.getMainFSMState) {
                const fsmState = window.getMainFSMState();
                if (fsmState && fsmState.viewId === 'power_off_countdown') {
                    console.log('[BUTTON] Power: Cancelling countdown');
                    dispatchWithWalkthroughGuard({ type: 'POWER_HOLD_CANCEL' });
                }
            }
            
            if (duration < pressState.powerPressThreshold) {
                // Short press
                console.log('[BUTTON] Power: Detected SHORT PRESS');
                if (window.dispatch) {
                    console.log('[BUTTON] Power: window.dispatch is available');
                    // MainFSM mode: short press triggers boot sequence if off, or Esc/Back if on
                    const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
                    const isOff = !fsmState || fsmState.viewId === 'OFF';
                    console.log('[BUTTON] Power: FSM state =', fsmState ? fsmState.viewId : 'null', ', isOff =', isOff);
                    
                    if (isOff) {
                        console.log(`[BUTTON] Power: SHORT PRESS - Boot sequence (via mainFSM)`);
                        console.log(`[BUTTON] Power: Calling window.dispatch({ type: 'POWER' })`);
                        if (window.dispatch) {
                            dispatchWithWalkthroughGuard({ type: 'POWER' });
                            console.log(`[BUTTON] Power: window.dispatch called successfully`);
                        } else {
                            console.error(`[BUTTON] Power: window.dispatch is not available!`);
                        }
                    } else {
                        console.log(`[BUTTON] Power: SHORT PRESS - Esc/Back (via mainFSM)`);
                        dispatchWithWalkthroughGuard({ type: 'ESC' });
                    }
                } else {
                    console.log('[BUTTON] Power: window.dispatch is NOT available');
                    // Original behavior: Esc/Back action (only if device is on)
                    if (window.isPoweredOn && window.isPoweredOn()) {
                        console.log(`[BUTTON] Power: SHORT PRESS - Esc/Back`);
                        if (window.handleEsc) {
                            window.handleEsc();
                        }
                    } else {
                        console.log(`[BUTTON] Power: SHORT PRESS (device off - no action)`);
                    }
                }
            } else {
                console.log('[BUTTON] Power: Press duration exceeded threshold (long press)');
            }
            
            pressState.powerPressStart = null;
            removePressFeedback(element);
        } else {
            // No timer was set - this happens when device is OFF
            const duration = Date.now() - pressState.powerPressStart;
            console.log('[BUTTON] Power: No activePressTimer, duration:', duration, 'ms');
            
            if (window.dispatch && window.getMainFSMState) {
                const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
                const isOff = !fsmState || fsmState.viewId === 'OFF';
                
                if (isOff && duration < 1000) {
                    // Device is OFF and button was released quickly - power on
                    console.log('[BUTTON] Power: Device is OFF, treating as short press to power on');
                    dispatchWithWalkthroughGuard({ type: 'POWER' });
                } else if (!isOff && duration < pressState.powerPressThreshold) {
                    // Device is on, short press = ESC/BACK
                    console.log('[BUTTON] Power: SHORT PRESS - ESC/BACK (via mainFSM)');
                    dispatchWithWalkthroughGuard({ type: 'ESC' });
                } else {
                    console.log('[BUTTON] Power: No activePressTimer - button may have been released too quickly or not pressed correctly');
                }
            } else {
                console.log('[BUTTON] Power: No activePressTimer - button may have been released too quickly or not pressed correctly');
            }
            
            pressState.powerPressStart = null;
            removePressFeedback(element);
        }
    }

    /**
     * Handle mouse/keyboard down event
     * @param {Event} event - Mouse/keyboard event
     */
    function handleDown(event) {
        const element = event.target;
        const buttonInfo = getButtonInfo(element);

        if (!buttonInfo) {
            console.log('[BUTTONS] handleDown: No buttonInfo for element:', element.className);
            return;
        }

        console.log(`[BUTTONS] handleDown: ${buttonInfo.name}, activeButton:`, pressState.activeButton?.className || 'null');

        event.preventDefault();
        if (isWalkthroughInputLocked()) return;

        // Power button gets special handling
        if (buttonInfo.action === 'power') {
            handlePowerDown(element);
        } else if (buttonInfo.action === 'stop') {
            // Stop button gets special handling for v2 FSM
            handleStopDown(element);
        } else {
            // Other buttons - add visual feedback
            // Clear any previous active button to handle rapid clicks
            if (pressState.activeButton && pressState.activeButton !== element) {
                console.log(`[BUTTONS] Clearing previous activeButton: ${pressState.activeButton.className}`);
                removePressFeedback(pressState.activeButton);
            }
            addPressFeedback(element);
            pressState.activeButton = element;
            console.log(`[BUTTONS] Set activeButton to: ${element.className}`);
        }
    }

    /**
     * Handle mouse/keyboard up event
     * @param {Event} event - Mouse/keyboard event
     */
    function handleUp(event) {
        const element = event.target;
        const buttonInfo = getButtonInfo(element);

        if (!buttonInfo) {
            console.log('[BUTTONS] handleUp: No buttonInfo for element:', element.className);
            return;
        }

        console.log(`[BUTTONS] handleUp: ${buttonInfo.name}, activeButton:`, pressState.activeButton?.className || 'null');

        event.preventDefault();
        if (isWalkthroughInputLocked()) return;

        // Power button gets special handling
        if (buttonInfo.action === 'power') {
            handlePowerUp(element);
        } else if (buttonInfo.action === 'stop') {
            // Stop button gets special handling for v2 FSM
            handleStopUp(element);
        } else {
            // Other buttons - handle press
            removePressFeedback(element);
            
            // Process press even if activeButton doesn't match (handles rapid clicks)
            // This ensures rapid button presses are not missed
            if (pressState.activeButton === element || !pressState.activeButton) {
                console.log(`[BUTTONS] Processing press for ${buttonInfo.name}`);
                handleButtonPress(element, buttonInfo);
                pressState.activeButton = null;
            } else {
                console.log(`[BUTTON] ${buttonInfo.name}: Press ignored - activeButton mismatch. Active: ${pressState.activeButton?.className}, Current: ${element.className}`);
                // Still process the press even if there's a mismatch (for rapid clicks)
                console.log(`[BUTTONS] Processing press anyway due to rapid click handling`);
                handleButtonPress(element, buttonInfo);
                pressState.activeButton = null;
            }
        }
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyboard(event) {
        // Forms must keep normal keyboard behavior. In particular, 1–4 are
        // also SLM soft-key shortcuts and must not fire while entering values.
        const typingTarget = event.target?.closest?.('input, textarea, select, [contenteditable="true"]');
        if (typingTarget) return;

        // Map keyboard keys to button actions
        const keyMap = {
            'ArrowUp': 'nav__btn--up',
            'ArrowDown': 'nav__btn--down',
            'ArrowLeft': 'nav__btn--left',
            'ArrowRight': 'nav__btn--right',
            'Enter': 'nav__btn--enter',
            'Escape': 'fn-btn--power', // Esc maps to power button (short press)
            '1': 'soft-key--1',
            '2': 'soft-key--2',
            '3': 'soft-key--3',
            '4': 'soft-key--4',
            'f': 'fn-btn--altf',
            'F': 'fn-btn--altf',
            's': 'fn-btn--stop', // s key maps to stop button
            'S': 'fn-btn--stop'  // S key maps to stop button
        };

        const className = keyMap[event.key];
        if (!className) return;

        event.preventDefault();
        if (isWalkthroughInputLocked()) return;

        // Find button element
        const button = document.querySelector(`.${className}`);
        if (!button) return;

        const buttonInfo = buttonMap[className];
        if (!buttonInfo) return;

        // Log keyboard event
        if (event.key.startsWith('Arrow')) {
            const direction = event.key.replace('Arrow', '').toLowerCase();
            console.log(`[KEYBOARD] ${event.key} → ${buttonInfo.name} button`);
        } else if (event.key === 'Enter') {
            console.log(`[KEYBOARD] Enter → ${buttonInfo.name} button`);
        } else if (event.key === 'Escape') {
            console.log(`[KEYBOARD] Escape → Esc/Back`);
        } else {
            console.log(`[KEYBOARD] ${event.key} → ${buttonInfo.name} button`);
        }

        // Handle power button specially
        if (buttonInfo.action === 'power') {
            if (event.type === 'keydown') {
                handlePowerDown(button);
            } else if (event.type === 'keyup') {
                handlePowerUp(button);
            }
        } else if (buttonInfo.action === 'stop') {
            // Stop button gets special handling for v2 FSM
            if (event.type === 'keydown') {
                handleStopDown(button);
            } else if (event.type === 'keyup') {
                handleStopUp(button);
            }
        } else {
            // Other buttons
            if (event.type === 'keydown') {
                addPressFeedback(button);
                pressState.activeButton = button;
            } else if (event.type === 'keyup') {
                removePressFeedback(button);
                if (pressState.activeButton === button) {
                    handleButtonPress(button, buttonInfo);
                    pressState.activeButton = null;
                }
            }
        }
    }

    /**
     * Initialize button handlers
     */
    function init() {
        // Get all buttons - use querySelectorAll to get all button types
        const allButtons = document.querySelectorAll('.soft-key, .nav__btn, .fn-btn');
        
        if (allButtons.length === 0) {
            console.error('[BUTTONS] No buttons found');
            return;
        }

        // Set up event listeners on all buttons
        // This is still efficient as we set up listeners once during initialization
        allButtons.forEach(button => {
            button.addEventListener('mousedown', handleDown);
            button.addEventListener('mouseup', handleUp);
            button.addEventListener('touchstart', handleDown);
            button.addEventListener('touchend', handleUp);
            
            // Handle mouse leave to cancel press feedback
            button.addEventListener('mouseleave', () => {
                if (pressState.activeButton === button) {
                    removePressFeedback(button);
                    if (pressState.activePressTimer) {
                        clearTimeout(pressState.activePressTimer);
                        pressState.activePressTimer = null;
                    }
                    pressState.activeButton = null;
                }
            });
        });

        // Set up keyboard events
        document.addEventListener('keydown', handleKeyboard);
        document.addEventListener('keyup', handleKeyboard);

        console.log(`[BUTTONS] Button handlers initialized (${allButtons.length} buttons)`);
    }

    // Export initialization function
    window.initButtons = init;
})();
