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

        switch (buttonInfo.type) {
            case 'softKey':
                handleSoftKey(buttonInfo.number);
                break;
            case 'nav':
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
                window.dispatch({ type: 'SOFT1' });
                return;
            }
            if (key === 2) {
                console.log('[BUTTON] Soft Key 2: Files menu (via mainFSM)');
                window.dispatch({ type: 'SOFT2' });
                return;
            }
            if (key === 3) {
                console.log('[BUTTON] Soft Key 3: Calibration menu (via mainFSM)');
                window.dispatch({ type: 'SOFT3' });
                return;
            }
            if (key === 4) {
                console.log('[BUTTON] Soft Key 4: Lock menu (via mainFSM)');
                window.dispatch({ type: 'LOCK_SOFTKEY' });
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
                console.log(`[BUTTON] Navigation ${direction}: (via mainFSM)`);
                window.dispatch({ type: fsmEvent });
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
            window.dispatch({ type: 'BACKLIGHT' });
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
            window.dispatch({ type: 'RUNPAUSE' });
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
            addPressFeedback(element);
            console.log('[BUTTON] Stop: Button down (via mainFSM)');
            window.dispatch({ type: 'STOP_DOWN' });
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
            window.dispatch({ type: 'STOP_UP' });
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
        pressState.powerPressStart = Date.now();
        pressState.activeButton = element;
        addPressFeedback(element);

        // Check if mainFSM is available
        if (window.dispatch) {
            // For mainFSM mode, short press triggers boot sequence
            // Long press still toggles power off
            const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
            const isOff = !fsmState || fsmState.viewId === 'OFF';
            
            // Start long press timer
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
        if (pressState.activePressTimer) {
            // Cancel long press timer
            clearTimeout(pressState.activePressTimer);
            pressState.activePressTimer = null;

            const duration = Date.now() - pressState.powerPressStart;
            
            if (duration < pressState.powerPressThreshold) {
                // Short press
                if (window.dispatch) {
                    // MainFSM mode: short press triggers boot sequence if off, or Esc/Back if on
                    const fsmState = window.getMainFSMState ? window.getMainFSMState() : null;
                    const isOff = !fsmState || fsmState.viewId === 'OFF';
                    
                    if (isOff) {
                        console.log(`[BUTTON] Power: SHORT PRESS - Boot sequence (via mainFSM)`);
                        window.dispatch({ type: 'POWER' });
                    } else {
                        console.log(`[BUTTON] Power: SHORT PRESS - Esc/Back (via mainFSM)`);
                        window.dispatch({ type: 'ESC' });
                    }
                } else {
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

        if (!buttonInfo) return;

        event.preventDefault();

        // Power button gets special handling
        if (buttonInfo.action === 'power') {
            handlePowerDown(element);
        } else if (buttonInfo.action === 'stop') {
            // Stop button gets special handling for v2 FSM
            handleStopDown(element);
        } else {
            // Other buttons - add visual feedback
            addPressFeedback(element);
            pressState.activeButton = element;
        }
    }

    /**
     * Handle mouse/keyboard up event
     * @param {Event} event - Mouse/keyboard event
     */
    function handleUp(event) {
        const element = event.target;
        const buttonInfo = getButtonInfo(element);

        if (!buttonInfo) return;

        event.preventDefault();

        // Power button gets special handling
        if (buttonInfo.action === 'power') {
            handlePowerUp(element);
        } else if (buttonInfo.action === 'stop') {
            // Stop button gets special handling for v2 FSM
            handleStopUp(element);
        } else {
            // Other buttons - handle press
            removePressFeedback(element);
            
            if (pressState.activeButton === element) {
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
            'F': 'fn-btn--altf'
        };

        const className = keyMap[event.key];
        if (!className) return;

        event.preventDefault();

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
