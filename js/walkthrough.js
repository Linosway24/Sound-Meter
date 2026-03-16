/**
 * Walkthrough panel controller - generic reusable system for multi-step walkthroughs.
 * Each step defines instruction text, optional confirmation buttons, and button handlers.
 */

(function () {
    const PANEL_ID = 'walkthrough-panel';
    const INSTRUCTION_ID = 'walkthrough-instruction';
    const BUTTONS_ID = 'walkthrough-buttons';
    const FEEDBACK_ID = 'walkthrough-feedback';

    /**
     * Step configuration. Each step can define:
     * - text: instruction string
     * - showButtons: boolean
     * - buttons: [{ id, label }, ...]
     * - onButtonClick(buttonId, stepId): custom handler; return false to stay, true/nothing to advance
     */
    const HOME_MENU_SETUP_INDEX = 3; // SETUP is at index 3 in home menu
    const SETUP_MENU_SIG_INPUT_INDEX = 6; // SIG INPUT is at index 6 in setup menu (right column)
    const SETUP_MENU_METER_SET_INDEX = 1; // METER SET is at index 1 in setup menu (left column)
    const SETUP_MENU_LEFT_COLUMN_MAX = 5; // Left column = indices 0-5, right = 6-10

    const walkthroughSteps = {
        powerOn: {
            text: 'Press the power button to turn on the device.',
            showButtons: false,
            buttons: [],
        },
        batteryCheck: {
            text: 'Are the batteries fully charged?',
            showButtons: true,
            buttons: [
                { id: 'good', label: 'GOOD' },
                { id: 'notgood', label: 'NOT GOOD' },
            ],
            onButtonClick: function (buttonId, stepId) {
                if (buttonId === 'good') {
                    hidePanel();
                    if (typeof window.setWalkthroughHighlight === 'function') {
                        window.setWalkthroughHighlight('.status-bar__battery', false);
                    }
                    advanceWalkthroughStep(stepId);
                } else if (buttonId === 'notgood') {
                    showWalkthroughFeedback(
                        'It looks like the battery has a full charge, so you should select GOOD.'
                    );
                }
            },
        },
        navigateToSetup: {
            text: 'Press the DOWN arrow until SETUP is selected.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight and instruction updated via updateWalkthroughForState
        },
        navigateToSigInput: {
            text: 'Press the RIGHT arrow until SIG INPUT is selected.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight RIGHT until SIG INPUT (index 6), then ENTER
        },
        rangeCapacityCheck: {
            text: 'Confirm Range Capacity',
            showButtons: true,
            buttons: [
                { id: 'good', label: 'GOOD' },
                { id: 'notgood', label: 'NOT GOOD' },
            ],
            onButtonClick: function (buttonId, stepId) {
                if (buttonId === 'good') {
                    if (typeof window.setWalkthroughHighlight === 'function') {
                        window.setWalkthroughHighlight('#sig_input_list .menu-item:nth-child(2)', false);
                    }
                    hidePanel();
                    advanceWalkthroughStep(stepId);
                } else if (buttonId === 'notgood') {
                    showWalkthroughFeedback(
                        'Please verify the range capacity setting before proceeding.'
                    );
                }
            },
        },
        escToSetup: {
            text: 'Press ESC to go back to the Setup screen.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight power button (ESC) when on sig_input_menu
        },
        navigateToMeterSet: {
            text: 'Press the LEFT arrow to switch to the left column.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight LEFT when on right column (6-10), then DOWN until METER SET (index 1), then ENTER
        },
        confirmMeterParameters: {
            text: 'Confirm meter Parameters.',
            showButtons: true,
            buttons: [
                { id: 'good', label: 'GOOD' },
                { id: 'notgood', label: 'NOT GOOD' },
            ],
            onButtonClick: function (buttonId, stepId) {
                if (buttonId === 'good') {
                    if (typeof window.clearWalkthroughHighlights === 'function') window.clearWalkthroughHighlights();
                    advanceWalkthroughStep(stepId);
                    if (typeof window.dispatch === 'function') {
                        window.dispatch({ type: 'ESC' });
                        window.dispatch({ type: 'ESC' });
                    }
                } else if (buttonId === 'notgood') {
                    showWalkthroughFeedback(
                        'Please verify the meter parameters before proceeding.'
                    );
                }
            },
        },
        softKeysIntro: {
            text: 'Use the soft keys to access features. Soft key 2 (CAL) is highlighted.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight soft-keys-region (rectangle) + soft-key--2 (primary)
        },
        confirmCalibratorSettings: {
            text: 'Is the calibrator set to 114 dB and 1000 Hz?',
            showButtons: true,
            buttons: [
                { id: 'good', label: 'GOOD' },
                { id: 'notgood', label: 'NOT GOOD' },
            ],
            onButtonClick: function (buttonId, stepId) {
                if (buttonId === 'good') {
                    if (typeof window.setWalkthroughHighlight === 'function') {
                        window.setWalkthroughHighlight('.dosimeter-btn--power', false);
                    }
                    hidePanel();
                    advanceWalkthroughStep(stepId);
                } else if (buttonId === 'notgood') {
                    showWalkthroughFeedback(
                        'Please verify the calibrator is set to 114 dB and 1000 Hz before proceeding.'
                    );
                }
            },
        },
        dragCalibratorToMeter: {
            text: 'Drag the calibrator onto the sound meter\'s microphone. Position it over the microphone at the top. →',
            showButtons: false,
            buttons: [],
            // State-driven: highlight dosimeter; advance when data-snapped="true"
        },
    };

    const stepOrder = ['powerOn', 'batteryCheck', 'navigateToSetup', 'navigateToSigInput', 'rangeCapacityCheck', 'escToSetup', 'navigateToMeterSet', 'confirmMeterParameters', 'softKeysIntro', 'confirmCalibratorSettings', 'dragCalibratorToMeter'];
    let completedSteps = new Set();
    let currentStepId = null;

    function getPanel() {
        return document.getElementById(PANEL_ID);
    }

    function getInstructionEl() {
        return document.getElementById(INSTRUCTION_ID);
    }

    function getButtonsEl() {
        return document.getElementById(BUTTONS_ID);
    }

    function getFeedbackEl() {
        return document.getElementById(FEEDBACK_ID);
    }

    /**
     * Show or hide the walkthrough panel.
     */
    function setPanelVisible(visible) {
        const panel = getPanel();
        if (!panel) return;
        panel.style.display = visible ? 'block' : 'none';
    }

    /**
     * Show feedback message in the panel. Pass empty string to clear.
     */
    function showWalkthroughFeedback(message) {
        const el = getFeedbackEl();
        if (!el) return;
        el.textContent = message || '';
        el.style.display = message ? 'block' : 'none';
    }

    /**
     * Advance to next step. Called when a step is completed (e.g. GOOD clicked).
     */
    function advanceWalkthroughStep(completedStepId) {
        completedSteps.add(completedStepId);
        const idx = stepOrder.indexOf(completedStepId);
        const nextId = stepOrder[idx + 1];
        if (nextId) {
            showWalkthroughStep(nextId);
            if (typeof window.setWalkthroughHighlight === 'function') {
                const state = typeof window.getMainFSMState === 'function' ? window.getMainFSMState() : null;
                const sh = window.setWalkthroughHighlight;
                if (nextId === 'navigateToSetup') applyNavigateToSetupHighlight(state);
                else if (nextId === 'navigateToSigInput') applyNavigateToSigInputHighlight(state);
                else if (nextId === 'rangeCapacityCheck') {
                    sh('.nav__btn--right', false);
                    sh('.nav__btn--enter', false);
                    sh('#sig_input_list .menu-item:nth-child(2)', true);
                } else if (nextId === 'escToSetup') applyEscToSetupHighlight(state);
                else if (nextId === 'navigateToMeterSet') applyNavigateToMeterSetHighlight(state);
                else if (nextId === 'softKeysIntro') applySoftKeysIntroHighlight(state);
                else if (nextId === 'confirmCalibratorSettings') {
                    sh('.dosimeter-btn--power', false);
                } else if (nextId === 'dragCalibratorToMeter') {
                    window.prepareDragCalibratorStep?.();
                    sh('.dosimeter-container', true);
                }
            }
        } else {
            currentStepId = null;
            setPanelVisible(false);
        }
    }

    /**
     * Apply highlight for navigateToSigInput step (setup menu: RIGHT until SIG INPUT, then ENTER).
     */
    function applyNavigateToSigInputHighlight(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;
        const isSetupMenu = state.viewId === 'setup_menu';
        const sigInputSelected = state.menu?.selectedIndex === SETUP_MENU_SIG_INPUT_INDEX;
        setHighlight('.nav__btn--right', isSetupMenu && !sigInputSelected);
        setHighlight('.nav__btn--enter', isSetupMenu && sigInputSelected);
        const instructionEl = getInstructionEl();
        if (instructionEl) {
            instructionEl.textContent = sigInputSelected
                ? 'Press ENTER to open SIG INPUT.'
                : 'Press the RIGHT arrow until SIG INPUT is selected.';
        }
    }

    /**
     * Apply highlight for softKeysIntro step.
     * Home: rectangle around soft keys, primary on soft key 2.
     * Cal menu: highlight ENTER.
     * Cal running: highlight calibrator power button.
     */
    function applySoftKeysIntroHighlight(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        const setPrimary = window.setWalkthroughPrimaryFocus;
        if (!setHighlight || !setPrimary) return;
        const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
        const isCalMenu = state.viewId === 'cal_menu';
        const isCalRunning = state.viewId === 'cal_running';
        setHighlight('.soft-keys-region', isHome);
        setPrimary('.soft-key--2', isHome);
        setHighlight('.nav__btn--enter', isCalMenu);
        setHighlight('.dosimeter-btn--power', isCalRunning);
        const instructionEl = getInstructionEl();
        if (instructionEl) {
            if (isCalRunning) instructionEl.textContent = 'Press the power button on the calibrator to turn it on.';
            else if (isCalMenu) instructionEl.textContent = 'Press ENTER to start calibration.';
            else if (isHome) instructionEl.textContent = 'Use the soft keys to access features. Soft key 2 (CAL) is highlighted.';
        }
    }

    /**
     * Apply highlight for escToSetup step (sig_input_menu: power button = ESC).
     */
    function applyEscToSetupHighlight(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;
        const isSigInput = state.viewId === 'sig_input_menu';
        setHighlight('.fn-btn--power', isSigInput);
    }

    /** Right column in setup menu = indices 6–10 (SIG INPUT, etc.). */
    const SETUP_MENU_RIGHT_COLUMN_START = 6;

    /**
     * Apply highlight for navigateToMeterSet step.
     * Phase 1: On right column (6–10) → highlight LEFT first.
     * Phase 2: On left column → highlight DOWN until METER SET.
     * Phase 3: On METER SET → highlight ENTER.
     */
    function applyNavigateToMeterSetHighlight(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;
        const isSetupMenu = state.viewId === 'setup_menu';
        const selectedIndex = state.menu?.selectedIndex ?? 0;
        const onRightColumn = selectedIndex >= SETUP_MENU_RIGHT_COLUMN_START;
        const meterSetSelected = selectedIndex === SETUP_MENU_METER_SET_INDEX;

        setHighlight('.nav__btn--left', isSetupMenu && onRightColumn);
        setHighlight('.nav__btn--down', isSetupMenu && !onRightColumn && !meterSetSelected);
        setHighlight('.nav__btn--enter', isSetupMenu && meterSetSelected);

        const instructionEl = getInstructionEl();
        if (instructionEl) {
            if (onRightColumn) {
                instructionEl.textContent = 'Press the LEFT arrow to switch to the left column.';
            } else if (meterSetSelected) {
                instructionEl.textContent = 'Press ENTER to open Meter Set.';
            } else {
                instructionEl.textContent = 'Press the DOWN arrow until METER SET is selected.';
            }
        }
    }

    /**
     * Apply highlight for navigateToSetup step (home: DOWN until SETUP, then ENTER).
     */
    function applyNavigateToSetupHighlight(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;
        const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
        const setupSelected = state.menu?.selectedIndex === HOME_MENU_SETUP_INDEX;
        setHighlight('.nav__btn--down', isHome && !setupSelected);
        setHighlight('.nav__btn--enter', isHome && setupSelected);
        const instructionEl = getInstructionEl();
        if (instructionEl) {
            instructionEl.textContent = setupSelected
                ? 'Press ENTER to open Setup.'
                : 'Press the DOWN arrow until SETUP is selected.';
        }
    }

    /**
     * Update walkthrough based on FSM state. Called from subscription callback.
     * Handles state-driven steps (navigateToSetup, navigateToSigInput, escToSetup, navigateToMeterSet).
     */
    function updateWalkthroughForState(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;

        if (currentStepId === 'powerOn' && state.viewId !== 'OFF') {
            setHighlight('.fn-btn--power', false);
            advanceWalkthroughStep('powerOn');
            return;
        }

        if (currentStepId === 'navigateToSetup') {
            if (state.viewId === 'setup_menu') {
                setHighlight('.nav__btn--down', false);
                setHighlight('.nav__btn--enter', false);
                advanceWalkthroughStep('navigateToSetup');
                return;
            }
            applyNavigateToSetupHighlight(state);
            return;
        }

        if (currentStepId === 'navigateToSigInput') {
            if (state.viewId === 'sig_input_menu') {
                setHighlight('.nav__btn--right', false);
                setHighlight('.nav__btn--enter', false);
                advanceWalkthroughStep('navigateToSigInput');
                return;
            }
            applyNavigateToSigInputHighlight(state);
            return;
        }

        if (currentStepId === 'escToSetup') {
            if (state.viewId === 'setup_menu') {
                setHighlight('.fn-btn--power', false);
                advanceWalkthroughStep('escToSetup');
                return;
            }
            applyEscToSetupHighlight(state);
            return;
        }

        if (currentStepId === 'navigateToMeterSet') {
            if (state.viewId === 'meter_set_menu') {
                setHighlight('.nav__btn--left', false);
                setHighlight('.nav__btn--down', false);
                setHighlight('.nav__btn--enter', false);
                advanceWalkthroughStep('navigateToMeterSet');
                return;
            }
            applyNavigateToMeterSetHighlight(state);
            return;
        }

        if (currentStepId === 'softKeysIntro') {
            const isCalRunning = state.viewId === 'cal_running';
            const isCalibratorDisplayOn = document.querySelector('.dosimeter-display.dosimeter-display--on');
            if (isCalRunning && isCalibratorDisplayOn) {
                setHighlight('.dosimeter-btn--power', false);
                advanceWalkthroughStep('softKeysIntro');
                return;
            }
            applySoftKeysIntroHighlight(state);
        }

        if (currentStepId === 'confirmCalibratorSettings') {
            if (state.viewId !== 'cal_running') {
                setHighlight('.dosimeter-btn--power', false);
            }
        }

        if (currentStepId === 'dragCalibratorToMeter') {
            const container = document.querySelector('.dosimeter-container');
            if (container?.dataset.snapped === 'true') {
                setHighlight('.dosimeter-container', false);
                advanceWalkthroughStep('dragCalibratorToMeter');
                return;
            }
            setHighlight('.dosimeter-container', true);
        }
    }

    function getCurrentStepId() {
        return currentStepId;
    }

    /**
     * Show a walkthrough step by ID. Updates panel text, buttons, clears feedback.
     * @param {string} stepId - key from walkthroughSteps
     */
    function showWalkthroughStep(stepId) {
        const step = walkthroughSteps[stepId];
        if (!step) return;

        currentStepId = stepId;

        const instructionEl = getInstructionEl();
        const buttonsEl = getButtonsEl();
        const feedbackEl = getFeedbackEl();

        if (instructionEl) instructionEl.textContent = step.text || '';
        if (feedbackEl) {
            feedbackEl.textContent = '';
            feedbackEl.style.display = 'none';
        }

        if (buttonsEl) {
            if (step.showButtons && step.buttons && step.buttons.length) {
                buttonsEl.innerHTML = '';
                buttonsEl.style.display = 'flex';
                step.buttons.forEach((btn) => {
                    const b = document.createElement('button');
                    b.className = 'walkthrough-btn walkthrough-btn--' + btn.id;
                    b.dataset.buttonId = btn.id;
                    b.dataset.stepId = stepId;
                    b.textContent = btn.label;
                    b.addEventListener('click', handleButtonClick);
                    buttonsEl.appendChild(b);
                });
            } else {
                buttonsEl.innerHTML = '';
                buttonsEl.style.display = 'none';
            }
        }

        setPanelVisible(true);
    }

    function handleButtonClick(e) {
        const btn = e.target;
        const buttonId = btn.dataset.buttonId;
        const stepId = btn.dataset.stepId;
        if (!buttonId || !stepId) return;

        const step = walkthroughSteps[stepId];
        if (step && typeof step.onButtonClick === 'function') {
            step.onButtonClick(buttonId, stepId);
        }
    }

    /**
     * Hide the walkthrough panel. Does not clear completed steps.
     */
    function hidePanel() {
        setPanelVisible(false);
        currentStepId = null;
    }

    /**
     * Check if a step has been completed.
     */
    function isStepCompleted(stepId) {
        return completedSteps.has(stepId);
    }

    /**
     * Reset walkthrough state (e.g. when starting over).
     */
    function resetWalkthrough() {
        completedSteps.clear();
        currentStepId = null;
        showWalkthroughFeedback('');
        hidePanel();
    }

    // Exports
    window.walkthroughSteps = walkthroughSteps;
    window.showWalkthroughStep = showWalkthroughStep;
    window.hideWalkthroughPanel = hidePanel;
    window.showWalkthroughFeedback = showWalkthroughFeedback;
    window.isWalkthroughStepCompleted = isStepCompleted;
    window.resetWalkthrough = resetWalkthrough;
    window.updateWalkthroughForState = updateWalkthroughForState;
    window.getCurrentStepId = getCurrentStepId;
})();
