/**
 * Walkthrough panel controller - generic reusable system for multi-step walkthroughs.
 * Each step defines instruction text, optional confirmation buttons, and button handlers.
 */

(function () {
    const PANEL_ID = 'walkthrough-panel';
    const INSTRUCTION_ID = 'walkthrough-instruction';
    const BUTTONS_ID = 'walkthrough-buttons';
    const FEEDBACK_ID = 'walkthrough-feedback';
    const TITLE_ID = 'walkthrough-panel-title';

    /**
     * Step configuration. Each step can define:
     * - title: short header label for the panel (current task)
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
            title: 'Power on',
            text: 'Press the power button to turn on the device.',
            showButtons: false,
            buttons: [],
        },
        batteryCheck: {
            title: 'Battery check',
            text: 'Are the batteries fully charged?',
            showButtons: true,
            buttons: [
                { id: 'good', label: 'YES' },
                { id: 'notgood', label: 'NO' },
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
                        'It looks like the battery has a full charge, so you should select YES.'
                    );
                }
            },
        },
        navigateToSetup: {
            title: 'Open Setup',
            text: 'Press the DOWN arrow until SETUP is selected.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight and instruction updated via updateWalkthroughForState
        },
        navigateToSigInput: {
            title: 'SIG INPUT',
            text: 'Press the RIGHT arrow until SIG INPUT is selected.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight RIGHT until SIG INPUT (index 6), then ENTER
        },
        rangeCapacityCheck: {
            title: 'Range capacity',
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
            title: 'Back to Setup',
            text: 'Press ESC to go back to the Setup screen.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight power button (ESC) when on sig_input_menu
        },
        navigateToMeterSet: {
            title: 'Meter Set',
            text: 'Press the LEFT arrow to switch to the left column.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight LEFT when on right column (6-10), then DOWN until METER SET (index 1), then ENTER
        },
        confirmMeterParameters: {
            title: 'Meter parameters',
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
            title: 'Soft keys',
            text: 'Use the soft keys to access features. Soft key 2 (CAL) is highlighted.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight soft-keys-region (rectangle) + soft-key--2 (primary)
        },
        confirmCalibratorSettings: {
            title: 'Calibrator settings',
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
            title: 'Position calibrator',
            text: 'Drag the calibrator onto the sound meter\'s microphone. Position it over the microphone at the top. →',
            showButtons: false,
            buttons: [],
            // State-driven: highlight dosimeter; advance when data-snapped="true"
        },
    };

    const stepOrder = ['powerOn', 'batteryCheck', 'navigateToSetup', 'navigateToSigInput', 'rangeCapacityCheck', 'escToSetup', 'navigateToMeterSet', 'confirmMeterParameters', 'softKeysIntro', 'confirmCalibratorSettings', 'dragCalibratorToMeter'];
    let completedSteps = new Set();
    let currentStepId = null;
    /** Cancels stale deferred reveals when another step hides the panel. */
    let batteryPanelRevealSeq = 0;

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

    function getTitleEl() {
        return document.getElementById(TITLE_ID);
    }

    function setWalkthroughPanelTitle(text) {
        const el = getTitleEl();
        if (el) el.textContent = text || '';
    }

    /** Which on-screen control to float the instruction panel beside for this step. */
    function getPanelAnchorSelector(stepId, state) {
        if (!stepId) return null;
        switch (stepId) {
            case 'powerOn':
                return '.fn-btn--power';
            case 'batteryCheck':
                /* Anchor panel to full device so “left of device” placement aligns with the frame, not only the tiny battery icon. */
                return '.device-frame';
            case 'rangeCapacityCheck':
                return '#sig_input_list .menu-item:nth-child(2)';
            case 'escToSetup':
                return '.fn-btn--power';
            case 'confirmMeterParameters':
                return '#meter_set_list';
            case 'confirmCalibratorSettings':
                return '.dosimeter-btn--power';
            case 'dragCalibratorToMeter':
                return '.dosimeter-container';
            case 'navigateToSetup':
                if (!state) return '.nav__btn--down';
                {
                    const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
                    const setupSelected = state.menu?.selectedIndex === HOME_MENU_SETUP_INDEX;
                    if (isHome && setupSelected) return '.nav__btn--enter';
                    return '.nav__btn--down';
                }
            case 'navigateToSigInput':
                if (!state) return '.nav__btn--right';
                {
                    const isSetupMenu = state.viewId === 'setup_menu';
                    const sigInputSelected = state.menu?.selectedIndex === SETUP_MENU_SIG_INPUT_INDEX;
                    if (isSetupMenu && sigInputSelected) return '.nav__btn--enter';
                    return '.nav__btn--right';
                }
            case 'navigateToMeterSet':
                if (!state) return '.nav__btn--down';
                {
                    const isSetupMenu = state.viewId === 'setup_menu';
                    const selectedIndex = state.menu?.selectedIndex ?? 0;
                    const onRightColumn = selectedIndex >= SETUP_MENU_RIGHT_COLUMN_START;
                    const meterSetSelected = selectedIndex === SETUP_MENU_METER_SET_INDEX;
                    if (!isSetupMenu) return '.device-frame';
                    if (onRightColumn) return '.nav__btn--left';
                    if (meterSetSelected) return '.nav__btn--enter';
                    return '.nav__btn--down';
                }
            case 'softKeysIntro':
                if (!state) return '.soft-key--2';
                {
                    const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
                    const isCalMenu = state.viewId === 'cal_menu';
                    const isCalRunning = state.viewId === 'cal_running';
                    if (isCalRunning) return '.dosimeter-btn--power';
                    if (isCalMenu) return '.nav__btn--enter';
                    if (isHome) return '.soft-key--2';
                    return '.soft-keys-region';
                }
            default:
                return '.device-frame';
        }
    }

    function anchorElementVisible(el) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
    }

    function getAnchorElement(selector) {
        if (!selector) return null;
        let el = document.querySelector(selector);
        if (anchorElementVisible(el)) return el;
        const fallbacks = ['#meter_set_list', '.lcd', '.soft-keys-region', '.device-frame'];
        for (let i = 0; i < fallbacks.length; i++) {
            if (fallbacks[i] === selector) continue;
            el = document.querySelector(fallbacks[i]);
            if (anchorElementVisible(el)) return el;
        }
        return document.querySelector('.device-frame');
    }

    function panelRectOverlapsAnchor(panelRect, anchorRect, padding) {
        const p = padding || 0;
        return !(
            panelRect.right + p < anchorRect.left ||
            panelRect.left - p > anchorRect.right ||
            panelRect.bottom + p < anchorRect.top ||
            panelRect.top - p > anchorRect.bottom
        );
    }

    /** Padding from the sound meter face (device photo + overlays). NOT #device-stage — that is full viewport width and breaks “to the right of the meter” placement. */
    const DEVICE_EXCLUSION_PAD = 10;
    const METER_GAP = 10;
    /** Battery-check panel: align vertically with status bar; nudge down so the panel sits with the battery row (frame vertical center is too high). */
    const BATTERY_CHECK_VERTICAL_BIAS_PX = 20;

    function clampNum(n, lo, hi) {
        return Math.max(lo, Math.min(n, hi));
    }

    /** Quest sound meter unit only (`.device-frame`) — excludes LCD/button overlays on the photo. */
    function getSimulatorExclusionRect() {
        const pad = DEVICE_EXCLUSION_PAD;
        const df = document.querySelector('.device-frame');
        if (df) {
            const r = df.getBoundingClientRect();
            if (r.width > 2 && r.height > 2) {
                return { left: r.left - pad, top: r.top - pad, right: r.right + pad, bottom: r.bottom + pad };
            }
        }
        const stage = document.getElementById('device-stage');
        if (stage) {
            const r = stage.getBoundingClientRect();
            if (r.width > 2 && r.height > 2) {
                return { left: r.left - pad, top: r.top - pad, right: r.right + pad, bottom: r.bottom + pad };
            }
        }
        return null;
    }

    function panelIntersectsExclusion(left, top, pw, ph, ex) {
        if (!ex) return false;
        const right = left + pw;
        const bottom = top + ph;
        return !(right <= ex.left || left >= ex.right || bottom <= ex.top || top >= ex.bottom);
    }

    function fallbackCornerPosition(panel) {
        const margin = 14;
        const gap = 18;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const ex = getSimulatorExclusionRect();
        const pr0 = panel.getBoundingClientRect();
        let pw = panel.offsetWidth || pr0.width;
        let ph = panel.offsetHeight || pr0.height;
        const candidates = [
            { left: margin, top: margin },
            { left: vw - pw - margin, top: margin },
            { left: margin, top: vh - ph - margin },
            { left: vw - pw - margin, top: vh - ph - margin },
        ];
        if (ex) {
            candidates.push({ left: ex.left - pw - gap, top: margin });
            candidates.push({ left: ex.right + gap, top: margin });
            candidates.push({ left: ex.left - pw - gap, top: vh - ph - margin });
            candidates.push({ left: ex.right + gap, top: vh - ph - margin });
        }
        let best = null;
        let bestKey = Infinity;
        for (let i = 0; i < candidates.length; i++) {
            const left = clampNum(candidates[i].left, margin, vw - pw - margin);
            const top = clampNum(candidates[i].top, margin, vh - ph - margin);
            if (ex && panelIntersectsExclusion(left, top, pw, ph, ex)) continue;
            const key = left + top * 0.001 + i * 1e-6;
            if (key < bestKey) {
                bestKey = key;
                best = { left, top };
            }
        }
        if (!best && ex) {
            let left = clampNum(ex.left - pw - METER_GAP, margin, vw - pw - margin);
            let top = clampNum(vh - ph - margin, margin, vh - ph - margin);
            if (!panelIntersectsExclusion(left, top, pw, ph, ex)) best = { left, top };
            if (!best) {
                left = clampNum(ex.right + METER_GAP, margin, vw - pw - margin);
                if (!panelIntersectsExclusion(left, top, pw, ph, ex)) best = { left, top };
            }
        }
        if (!best) best = { left: margin, top: vh - ph - margin };
        panel.style.position = 'fixed';
        panel.style.left = `${Math.round(best.left)}px`;
        panel.style.top = `${Math.round(best.top)}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    function applyWalkthroughPanelPosition(panel, left, top) {
        panel.style.position = 'fixed';
        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    /**
     * Placement depends on step: Power on → right of `.device-frame` first; battery check → left first;
     * other steps → left first. Uses device frame for exclusion, not #device-stage (full viewport wide).
     */
    function positionWalkthroughPanelNow() {
        const panel = getPanel();
        if (!panel || panel.style.display === 'none' || !currentStepId) return;

        const state = typeof window.getMainFSMState === 'function' ? window.getMainFSMState() : null;
        const sel = getPanelAnchorSelector(currentStepId, state);
        const anchor = getAnchorElement(sel);
        const margin = 12;
        const gap = METER_GAP;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const ex = getSimulatorExclusionRect();

        let pw = panel.offsetWidth;
        let ph = panel.offsetHeight;
        if (pw < 20 || ph < 20) {
            const pr = panel.getBoundingClientRect();
            pw = pr.width;
            ph = pr.height;
        }

        if (!anchor || !anchorElementVisible(anchor)) {
            fallbackCornerPosition(panel);
            return;
        }

        const rect = anchor.getBoundingClientRect();
        let anchorMidY = rect.top + rect.height / 2;
        let anchorMidX = rect.left + rect.width / 2;
        if (currentStepId === 'batteryCheck') {
            const bat = document.querySelector('.status-bar__battery');
            if (bat && anchorElementVisible(bat)) {
                const br = bat.getBoundingClientRect();
                anchorMidX = br.left + br.width / 2;
                anchorMidY = br.top + br.height / 2 + BATTERY_CHECK_VERTICAL_BIAS_PX;
            }
        }
        const topAligned = clampNum(anchorMidY - ph / 2, margin, vh - ph - margin);

        function placeRightOfMeter() {
            if (!ex) return null;
            const left = ex.right + gap;
            if (left + pw > vw - margin) return null;
            const top = topAligned;
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            return { left, top };
        }

        /** Narrow right strip: keep panel’s right edge at viewport but stay clear of the meter. */
        function placeRightOfMeterFlush() {
            if (!ex) return null;
            let left = ex.right + gap;
            if (left + pw > vw - margin) {
                left = vw - pw - margin;
                if (left < ex.right + gap - 0.5) return null;
            }
            const top = topAligned;
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            return { left, top };
        }

        function placeLeftOfMeter() {
            if (!ex) return null;
            const left = ex.left - pw - gap;
            if (left < margin) return null;
            const top = topAligned;
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            return { left, top };
        }

        function placeBelowMeter() {
            if (!ex) return null;
            const top = ex.bottom + gap;
            if (top + ph > vh - margin) return null;
            const left = clampNum(anchorMidX - pw / 2, margin, vw - pw - margin);
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            return { left, top };
        }

        function placeAboveMeter() {
            if (!ex) return null;
            const top = ex.top - ph - gap;
            if (top < margin) return null;
            const left = clampNum(anchorMidX - pw / 2, margin, vw - pw - margin);
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            return { left, top };
        }

        let best = null;
        if (currentStepId === 'powerOn') {
            best = placeRightOfMeter();
            if (!best) best = placeRightOfMeterFlush();
            if (!best) best = placeLeftOfMeter();
            if (!best) best = placeBelowMeter();
            if (!best) best = placeAboveMeter();
        } else if (currentStepId === 'batteryCheck') {
            best = placeLeftOfMeter();
            if (!best) best = placeBelowMeter();
            if (!best) best = placeAboveMeter();
            if (!best) best = placeRightOfMeter();
            if (!best) best = placeRightOfMeterFlush();
        } else {
            best = placeLeftOfMeter();
            if (!best) best = placeRightOfMeter();
            if (!best) best = placeRightOfMeterFlush();
            if (!best) best = placeBelowMeter();
            if (!best) best = placeAboveMeter();
        }

        if (!best && !ex) {
            const pad = Math.max(gap, 8);
            function tryAnchorSide(tryRightFirst) {
                if (tryRightFirst) {
                    let left = rect.right + gap;
                    left = clampNum(left, margin, vw - pw - margin);
                    const top = topAligned;
                    const prect = { left, top, right: left + pw, bottom: top + ph };
                    if (!panelRectOverlapsAnchor(prect, rect, pad)) return { left, top };
                    left = rect.left - gap - pw;
                    left = clampNum(left, margin, vw - pw - margin);
                    const prect2 = { left, top, right: left + pw, bottom: top + ph };
                    if (!panelRectOverlapsAnchor(prect2, rect, pad)) return { left, top };
                } else {
                    let left = rect.left - gap - pw;
                    left = clampNum(left, margin, vw - pw - margin);
                    const top = topAligned;
                    const prect = { left, top, right: left + pw, bottom: top + ph };
                    if (!panelRectOverlapsAnchor(prect, rect, pad)) return { left, top };
                    left = rect.right + gap;
                    left = clampNum(left, margin, vw - pw - margin);
                    const prect2 = { left, top, right: left + pw, bottom: top + ph };
                    if (!panelRectOverlapsAnchor(prect2, rect, pad)) return { left, top };
                }
                return null;
            }
            best = tryAnchorSide(currentStepId === 'powerOn');
        }

        if (!best) {
            fallbackCornerPosition(panel);
            return;
        }

        applyWalkthroughPanelPosition(panel, best.left, best.top);
    }

    let walkthroughPositionRaf = null;
    function scheduleWalkthroughPanelPosition() {
        if (walkthroughPositionRaf !== null) return;
        walkthroughPositionRaf = requestAnimationFrame(() => {
            walkthroughPositionRaf = null;
            positionWalkthroughPanelNow();
            requestAnimationFrame(() => positionWalkthroughPanelNow());
        });
    }

    function initWalkthroughPanelFloating() {
        window.addEventListener('resize', scheduleWalkthroughPanelPosition);
        if (typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => scheduleWalkthroughPanelPosition());
        const df = document.querySelector('.device-frame');
        const stage = document.getElementById('device-stage');
        if (df) ro.observe(df);
        if (stage) ro.observe(stage);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWalkthroughPanelFloating);
    } else {
        initWalkthroughPanelFloating();
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
        if (message && currentStepId) {
            scheduleWalkthroughPanelPosition();
        }
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
            batteryPanelRevealSeq++;
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
        setWalkthroughPanelTitle(sigInputSelected ? 'Open SIG INPUT' : 'Select SIG INPUT');
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
        if (isCalRunning) setWalkthroughPanelTitle('Calibrator power');
        else if (isCalMenu) setWalkthroughPanelTitle('Start calibration');
        else if (isHome) setWalkthroughPanelTitle('Soft keys');
        else setWalkthroughPanelTitle(walkthroughSteps.softKeysIntro.title);
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
        setWalkthroughPanelTitle('Back to Setup');
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
        if (isSetupMenu) {
            if (onRightColumn) setWalkthroughPanelTitle('Meter Set — switch column');
            else if (meterSetSelected) setWalkthroughPanelTitle('Open Meter Set');
            else setWalkthroughPanelTitle('Select Meter Set');
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
        setWalkthroughPanelTitle(setupSelected ? 'Open Setup' : 'Select Setup');
    }

    /**
     * Update walkthrough based on FSM state. Called from subscription callback.
     * Handles state-driven steps (navigateToSetup, navigateToSigInput, escToSetup, navigateToMeterSet).
     */
    function updateWalkthroughForState(state) {
        try {
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
        } finally {
            if (state && currentStepId) {
                const p = getPanel();
                if (p && p.style.display !== 'none') {
                    scheduleWalkthroughPanelPosition();
                }
            }
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

        const deferBatteryPanel =
            stepId === 'batteryCheck' && typeof window.runAfterSoundMeterTransformIdle === 'function';

        if (!deferBatteryPanel) {
            batteryPanelRevealSeq++;
        }

        currentStepId = stepId;

        const instructionEl = getInstructionEl();
        const buttonsEl = getButtonsEl();
        const feedbackEl = getFeedbackEl();

        if (instructionEl) instructionEl.textContent = step.text || '';
        setWalkthroughPanelTitle(step.title || 'Instructions');
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

        if (deferBatteryPanel) {
            setPanelVisible(false);
            const seq = ++batteryPanelRevealSeq;
            window.runAfterSoundMeterTransformIdle(() => {
                if (seq !== batteryPanelRevealSeq) return;
                if (currentStepId !== 'batteryCheck') return;
                setPanelVisible(true);
                scheduleWalkthroughPanelPosition();
            });
        } else {
            setPanelVisible(true);
            scheduleWalkthroughPanelPosition();
        }
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
        batteryPanelRevealSeq++;
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
    window.scheduleWalkthroughPanelPosition = scheduleWalkthroughPanelPosition;
})();
