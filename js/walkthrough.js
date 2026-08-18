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
    const HOME_MENU_CURRENT_STUDY_INDEX = 1; // VIEW CURRENT STUDY in MENU_ITEMS
    const SETUP_MENU_SIG_INPUT_INDEX = 6; // SIG INPUT is at index 6 in setup menu (right column)
    const SETUP_MENU_METER_SET_INDEX = 1; // METER SET is at index 1 in setup menu (left column)
    const SETUP_MENU_LEFT_COLUMN_MAX = 5; // Left column = indices 0-5, right = 6-10

    const walkthroughSteps = {
        powerOn: {
            title: 'Power On',
            text: 'Press the power button to turn on the device.',
            showButtons: false,
            buttons: [],
        },
        batteryCheck: {
            title: 'Battery Check',
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
            title: 'Range Capacity',
            text: 'Confirm range capacity.',
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
            title: 'Meter Parameters',
            text: 'Confirm meter parameters.',
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
                        dispatchWalkthroughInternal({ type: 'ESC' });
                        dispatchWalkthroughInternal({ type: 'ESC' });
                    }
                } else if (buttonId === 'notgood') {
                    showWalkthroughFeedback(
                        'Please verify the meter parameters before proceeding.'
                    );
                }
            },
        },
        softKeysIntro: {
            title: 'Soft Keys',
            text: 'Use the soft keys to access features. Soft key 2 (CAL) is highlighted.',
            showButtons: false,
            buttons: [],
            // State-driven: highlight soft-keys-region (rectangle) + soft-key--2 (primary)
        },
        confirmCalibratorSettings: {
            title: 'Calibrator Settings',
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
            title: 'Calibrator on the Meter',
            text: 'Drag the calibrator onto the sound meter microphone until it locks in place. Then press Start to run the calibration. The reading will move from 125 dB down to 114 dB, and the next instructions will appear when the reading reaches 114 dB.',
            showButtons: true,
            buttons: [{ id: 'good', label: 'Start' }],
            onButtonClick: function (buttonId, stepId) {
                if (buttonId !== 'good') return;
                if (disableCalibratorDragForFeedbackTesting) {
                    window.applyDosimeterSnapToMicrophonePosition?.();
                } else {
                    const calibrator = document.querySelector('.dosimeter-container');
                    if (calibrator?.dataset.snapped !== 'true') {
                        showWalkthroughFeedback(
                            'First drag the calibrator onto the microphone until it locks in place, then press Start.'
                        );
                        return;
                    }
                }
                showWalkthroughFeedback('');
                if (typeof window.clearWalkthroughHighlights === 'function') {
                    window.clearWalkthroughHighlights();
                }
                if (typeof window.setWalkthroughHighlight === 'function') {
                    window.setWalkthroughHighlight('.dosimeter-container', false);
                }
                const panel = document.getElementById('walkthrough-panel');
                if (panel) panel.style.display = 'none';
                window.beginWalkthroughCalSPLRamp125To114?.({
                    onComplete: function () {
                        advanceWalkthroughStep(stepId);
                    },
                });
            },
            // Snap during drag only updates highlight (tryCompleteDragCalibratorStep); Start runs the ramp and advances.
        },
        stopCalibrationWithEnter: {
            title: 'End Calibration',
            text: 'When the reading stabilizes at 114 dB, press ENTER to complete the calibration.\n\nIn the field, you would then turn off and remove the calibrator. The simulator performs these steps automatically.',
            showButtons: false,
            buttons: [],
        },
        escToHomeAfterCal: {
            title: 'Back to Start Screen',
            text: 'Press ESC to leave the calibration menu and return to the start screen (home).',
            showButtons: false,
            buttons: [],
        },
        openCurrentStudy: {
            title: 'View Current Study',
            text: 'On the start screen, use the UP and DOWN arrows until VIEW CURRENT STUDY is highlighted, then press ENTER to open the current study screen.',
            showButtons: false,
            buttons: [],
            // State-driven: UP/DOWN until menu index 1, then ENTER (see applyOpenCurrentStudyHighlight).
        },
        selectSlmTimeConstantF: {
            title: 'Fast Response',
            text: 'Press the second soft key (F-S-I) until F is underlined. Each press moves the underline to the next response setting.',
            showButtons: false,
            buttons: [],
            // State-driven: SOFT2 cycles time constant; done when state.slm.timeConstant === 'F'.
        },
        selectSlmWeightingZ: {
            title: 'Z Weighting',
            text: 'Press the third soft key (A-C-Z-F) until Z is underlined. Each press moves the underline to the next weighting.',
            showButtons: false,
            buttons: [],
            // State-driven: SOFT3 cycles weighting; done when state.slm.weighting === 'Z'.
        },
        hammeringImpulseDemo: {
            title: 'Hammering Scenario',
            text: 'This sound source has short, sharp impacts. With fast (F) time response and Z weighting selected, watch how the meter reacts quickly to each hammer strike and shows the unweighted sound level. This demonstrates why fast response is useful when the sound changes rapidly.',
            showButtons: false,
            buttons: [],
        },
        selectSlmTimeConstantS: {
            title: 'Slow Response',
            text: 'Press the second soft key (F-S-I) until S is underlined. Each press moves the underline to the next response setting.',
            showButtons: false,
            buttons: [],
        },
        selectSlmWeightingA: {
            title: 'A Weighting',
            text: 'Press the third soft key (A-C-Z-F) until A is underlined. Each press moves the underline to the next weighting.',
            showButtons: false,
            buttons: [],
            // FSM stores this as weighting 'R'; display shows A (see screen-renderer).
        },
        fanSoundDemo: {
            title: 'Fan Noise',
            text: 'This sound source is steadier than the hammering. With slow (S) time response and A weighting selected, watch how the meter smooths the reading and reports the level as the ear would typically perceive it. This demonstrates why slow response and A weighting are commonly used for steady workplace noise.',
            showButtons: false,
            buttons: [],
        },
    };

    const stepOrder = ['powerOn', 'batteryCheck', 'navigateToSetup', 'navigateToSigInput', 'rangeCapacityCheck', 'escToSetup', 'navigateToMeterSet', 'confirmMeterParameters', 'softKeysIntro', 'confirmCalibratorSettings', 'dragCalibratorToMeter', 'stopCalibrationWithEnter', 'escToHomeAfterCal', 'openCurrentStudy', 'selectSlmTimeConstantF', 'selectSlmWeightingZ', 'hammeringImpulseDemo', 'selectSlmTimeConstantS', 'selectSlmWeightingA', 'fanSoundDemo'];
    let completedSteps = new Set();
    let currentStepId = null;
    let walkthroughGuidanceReady = true;
    let walkthroughGuidanceTimer = null;
    let walkthroughGuidanceSeq = 0;
    /** Cancels stale deferred reveals when another step hides the panel. */
    let batteryPanelRevealSeq = 0;
    /** Invalidates hammer-instruction auto-advance timer when step changes or walkthrough resets. */
    let hammerDemoAutoadvanceSeq = 0;
    /** Same for fan sound / video demo step. */
    let fanDemoAutoadvanceSeq = 0;
    /** Play `Meter Set.mp3` once when "Meter Set: Switch Column" first appears. */
    let meterSetSwitchColumnNarrationDone = false;
    /** Play `Turn on Cal.mp3` once when "Calibrator Power" first appears (softKeysIntro + cal_running). */
    let calibratorPowerNarrationDone = false;
    /** Lets walkthrough-owned transitions dispatch FSM events without looking like user input. */
    let isInternalWalkthroughDispatch = false;
    /** Temporary feedback-test mode: Start snaps the calibrator instead of requiring drag/drop. */
    const disableCalibratorDragForFeedbackTesting = true;
    window.disableWalkthroughCalibratorDragForFeedbackTesting = disableCalibratorDragForFeedbackTesting;

    function instructionReadingDelayMs(text) {
        const wordCount = String(text || '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(2500, Math.min(7000, Math.round((wordCount / 3) * 1000)));
    }

    function releaseWalkthroughGuidance(seq) {
        if (typeof seq === 'number' && seq !== walkthroughGuidanceSeq) return;
        if (walkthroughGuidanceTimer) {
            clearTimeout(walkthroughGuidanceTimer);
            walkthroughGuidanceTimer = null;
        }
        walkthroughGuidanceReady = true;
        window.flushWalkthroughGuidance?.();
    }

    function beginWalkthroughGuidanceDelay(text, waitForNarration = false) {
        const seq = ++walkthroughGuidanceSeq;
        if (walkthroughGuidanceTimer) clearTimeout(walkthroughGuidanceTimer);
        walkthroughGuidanceTimer = null;
        walkthroughGuidanceReady = false;
        window.hideWalkthroughGuidance?.();

        if (!waitForNarration) {
            walkthroughGuidanceTimer = setTimeout(
                () => releaseWalkthroughGuidance(seq),
                instructionReadingDelayMs(text)
            );
        }
    }

    function cancelWalkthroughGuidanceDelay() {
        walkthroughGuidanceSeq++;
        if (walkthroughGuidanceTimer) clearTimeout(walkthroughGuidanceTimer);
        walkthroughGuidanceTimer = null;
        walkthroughGuidanceReady = true;
        window.hideWalkthroughGuidance?.();
    }

    window.addEventListener('walkthrough-narration-start', () => {
        if (!currentStepId) return;
        beginWalkthroughGuidanceDelay(getInstructionEl()?.textContent, true);
    });
    window.addEventListener('walkthrough-narration-end', () => {
        if (currentStepId) releaseWalkthroughGuidance();
    });
    window.addEventListener('walkthrough-narration-unavailable', () => {
        if (!currentStepId) return;
        beginWalkthroughGuidanceDelay(getInstructionEl()?.textContent, false);
    });

    window.isWalkthroughGuidanceReady = () => walkthroughGuidanceReady;

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
            case 'stopCalibrationWithEnter':
                return '.nav__btn--enter';
            case 'escToHomeAfterCal':
                return '.fn-btn--power';
            case 'openCurrentStudy':
                if (!state) return '.nav__btn--down';
                {
                    const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
                    const idx = state.menu?.selectedIndex ?? 0;
                    if (!isHome) return '.device-frame';
                    if (idx < HOME_MENU_CURRENT_STUDY_INDEX) return '.nav__btn--down';
                    if (idx > HOME_MENU_CURRENT_STUDY_INDEX) return '.nav__btn--up';
                    return '.nav__btn--enter';
                }
            case 'selectSlmTimeConstantF':
                return '.soft-key--2';
            case 'selectSlmWeightingZ':
                return '.soft-key--3';
            case 'hammeringImpulseDemo':
                return '#sound-video-panel';
            case 'selectSlmTimeConstantS':
                return '.soft-key--2';
            case 'selectSlmWeightingA':
                return '.soft-key--3';
            case 'fanSoundDemo':
                return '#sound-video-panel';
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

    function panelIntersectsProtectedControls(left, top, pw, ph) {
        const right = left + pw;
        const bottom = top + ph;
        const protectedEls = document.querySelectorAll('.zoom-control, .audio-panel, .sound-video-panel');
        for (let i = 0; i < protectedEls.length; i++) {
            const el = protectedEls[i];
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            const overlaps = !(right <= r.left || left >= r.right || bottom <= r.top || top >= r.bottom);
            if (overlaps) return true;
        }
        return false;
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
            if (panelIntersectsProtectedControls(left, top, pw, ph)) continue;
            const key = left + top * 0.001 + i * 1e-6;
            if (key < bestKey) {
                bestKey = key;
                best = { left, top };
            }
        }
        if (!best && ex) {
            let left = clampNum(ex.left - pw - METER_GAP, margin, vw - pw - margin);
            let top = clampNum(vh - ph - margin, margin, vh - ph - margin);
            if (!panelIntersectsExclusion(left, top, pw, ph, ex) && !panelIntersectsProtectedControls(left, top, pw, ph)) best = { left, top };
            if (!best) {
                left = clampNum(ex.right + METER_GAP, margin, vw - pw - margin);
                if (!panelIntersectsExclusion(left, top, pw, ph, ex) && !panelIntersectsProtectedControls(left, top, pw, ph)) best = { left, top };
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

        // Keep instructions in one predictable desktop location. The dynamic
        // anchor placement below remains for narrower screens where a side rail
        // is not available.
        if (vw >= 1200) {
            applyWalkthroughPanelPosition(panel, vw - pw - 20, 20);
            return;
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
            if (panelIntersectsProtectedControls(left, top, pw, ph)) return null;
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
            if (panelIntersectsProtectedControls(left, top, pw, ph)) return null;
            return { left, top };
        }

        function placeLeftOfMeter() {
            if (!ex) return null;
            const left = ex.left - pw - gap;
            if (left < margin) return null;
            const top = topAligned;
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            if (panelIntersectsProtectedControls(left, top, pw, ph)) return null;
            return { left, top };
        }

        function placeBelowMeter() {
            if (!ex) return null;
            const top = ex.bottom + gap;
            if (top + ph > vh - margin) return null;
            const left = clampNum(anchorMidX - pw / 2, margin, vw - pw - margin);
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            if (panelIntersectsProtectedControls(left, top, pw, ph)) return null;
            return { left, top };
        }

        function placeAboveMeter() {
            if (!ex) return null;
            const top = ex.top - ph - gap;
            if (top < margin) return null;
            const left = clampNum(anchorMidX - pw / 2, margin, vw - pw - margin);
            if (panelIntersectsExclusion(left, top, pw, ph, ex)) return null;
            if (panelIntersectsProtectedControls(left, top, pw, ph)) return null;
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
            if (nextId === 'escToHomeAfterCal') {
                window.restoreWalkthroughZoomBeforeDragCalibrator?.();
            }
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
                } else if (nextId === 'stopCalibrationWithEnter') {
                    const st = typeof window.getMainFSMState === 'function' ? window.getMainFSMState() : null;
                    if (st && st.viewId === 'cal_running') sh('.nav__btn--enter', true);
                } else if (nextId === 'escToHomeAfterCal') {
                    const st = typeof window.getMainFSMState === 'function' ? window.getMainFSMState() : null;
                    if (st && st.viewId === 'cal_menu') sh('.fn-btn--power', true);
                } else if (nextId === 'openCurrentStudy') {
                    applyOpenCurrentStudyHighlight(state);
                } else if (nextId === 'selectSlmTimeConstantF') {
                    applySelectSlmTimeConstantFHighlight(state);
                } else if (nextId === 'selectSlmWeightingZ') {
                    applySelectSlmWeightingZHighlight(state);
                } else if (nextId === 'selectSlmTimeConstantS') {
                    applySelectSlmTimeConstantSHighlight(state);
                } else if (nextId === 'selectSlmWeightingA') {
                    applySelectSlmWeightingAHighlight(state);
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
        if (isCalRunning) {
            setWalkthroughPanelTitle('Calibrator Power');
            if (
                getCurrentStepId() === 'softKeysIntro' &&
                window.isCalibrationSectionActive?.() !== true &&
                !calibratorPowerNarrationDone &&
                typeof window.AudioPlayer?.playNarration === 'function'
            ) {
                calibratorPowerNarrationDone = true;
                window.AudioPlayer.playNarration('assets/audio/Turn on Cal.mp3');
            }
        } else if (isCalMenu) setWalkthroughPanelTitle('Start Calibration');
        else if (isHome) setWalkthroughPanelTitle('Soft Keys');
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
            if (onRightColumn) {
                setWalkthroughPanelTitle('Meter Set: Switch Column');
                if (
                    getCurrentStepId() === 'navigateToMeterSet' &&
                    !meterSetSwitchColumnNarrationDone &&
                    typeof window.AudioPlayer?.playNarration === 'function'
                ) {
                    meterSetSwitchColumnNarrationDone = true;
                    window.AudioPlayer.playNarration('assets/audio/Meter Set.mp3');
                }
            } else if (meterSetSelected) setWalkthroughPanelTitle('Open Meter Set');
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

    /** Home start screen: UP/DOWN until VIEW CURRENT STUDY (index 1), then ENTER → SLM. */
    function applyOpenCurrentStudyHighlight(state) {
        if (!state) return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;
        const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
        if (!isHome) return;
        const idx = Math.max(0, Math.min(state.menu?.selectedIndex ?? 0, 4));
        const t = HOME_MENU_CURRENT_STUDY_INDEX;
        const needDown = idx < t;
        const needUp = idx > t;
        const onTarget = idx === t;
        setHighlight('.nav__btn--up', needUp);
        setHighlight('.nav__btn--down', needDown);
        setHighlight('.nav__btn--enter', onTarget);
        const instructionEl = getInstructionEl();
        if (instructionEl) {
            if (onTarget) {
                instructionEl.textContent = 'Press ENTER to open View Current Study.';
            } else if (needDown) {
                instructionEl.textContent = 'Press the DOWN arrow until VIEW CURRENT STUDY is selected.';
            } else {
                instructionEl.textContent = 'Press the UP arrow until VIEW CURRENT STUDY is selected.';
            }
        }
        setWalkthroughPanelTitle(onTarget ? 'Open Current Study' : 'Select View Current Study');
    }

    function isWalkthroughSlmMeasurementView(viewId) {
        if (!viewId || typeof viewId !== 'string') return false;
        return (
            viewId.startsWith('slm_home') ||
            viewId.startsWith('slm_graph_1of1') ||
            viewId.startsWith('slm_graph_1of3')
        );
    }

    /** SLM: highlight second soft key until fast time constant F is selected (state.slm.timeConstant === 'F'). */
    function applySelectSlmTimeConstantFHighlight(state) {
        if (!state || !isWalkthroughSlmMeasurementView(state.viewId)) return;
        if (state.slm?.timeConstant === 'F') return;
        const setHighlight = window.setWalkthroughHighlight;
        const setPrimary = window.setWalkthroughPrimaryFocus;
        if (!setHighlight || !setPrimary) return;
        setHighlight('.soft-keys-region', true);
        setPrimary('.soft-key--2', true);
    }

    /** SLM: highlight third soft key until Z weighting is selected (state.slm.weighting === 'Z'). */
    function applySelectSlmWeightingZHighlight(state) {
        if (!state || !isWalkthroughSlmMeasurementView(state.viewId)) return;
        if (state.slm?.weighting === 'Z') return;
        const setHighlight = window.setWalkthroughHighlight;
        const setPrimary = window.setWalkthroughPrimaryFocus;
        if (!setHighlight || !setPrimary) return;
        setHighlight('.soft-keys-region', true);
        setPrimary('.soft-key--3', true);
    }

    /** SLM: highlight second soft key until slow time constant S is selected. */
    function applySelectSlmTimeConstantSHighlight(state) {
        if (!state || !isWalkthroughSlmMeasurementView(state.viewId)) return;
        if (state.slm?.timeConstant === 'S') return;
        const setHighlight = window.setWalkthroughHighlight;
        const setPrimary = window.setWalkthroughPrimaryFocus;
        if (!setHighlight || !setPrimary) return;
        setHighlight('.soft-keys-region', true);
        setPrimary('.soft-key--2', true);
    }

    /** SLM: SOFT3 until A is underlined (FSM slm.weighting === 'R'). */
    function applySelectSlmWeightingAHighlight(state) {
        if (!state || !isWalkthroughSlmMeasurementView(state.viewId)) return;
        if (state.slm?.weighting === 'R') return;
        const setHighlight = window.setWalkthroughHighlight;
        const setPrimary = window.setWalkthroughPrimaryFocus;
        if (!setHighlight || !setPrimary) return;
        setHighlight('.soft-keys-region', true);
        setPrimary('.soft-key--3', true);
    }

    /** Completes the drag-to-microphone step when `data-snapped` is true (FSM state not required). */
    function tryCompleteDragCalibratorStep() {
        if (currentStepId !== 'dragCalibratorToMeter') return;
        const setHighlight = window.setWalkthroughHighlight;
        if (!setHighlight) return;
        const container = document.querySelector('.dosimeter-container');
        if (container?.dataset.snapped === 'true') {
            setHighlight('.dosimeter-container', false);
            showWalkthroughFeedback('');
        } else {
            setHighlight('.dosimeter-container', true);
        }
    }

    function getAllowedEventsForCurrentStep(state) {
        switch (currentStepId) {
            case 'powerOn':
                return ['POWER'];
            case 'navigateToSetup': {
                const isHome = state?.viewId === 'home_screen' || state?.viewId === 'home_screen_dim';
                if (!isHome) return [];
                return state?.menu?.selectedIndex === HOME_MENU_SETUP_INDEX ? ['ENTER'] : ['DOWN'];
            }
            case 'navigateToSigInput': {
                if (state?.viewId !== 'setup_menu') return [];
                return state?.menu?.selectedIndex === SETUP_MENU_SIG_INPUT_INDEX ? ['ENTER'] : ['RIGHT'];
            }
            case 'escToSetup':
                return ['ESC'];
            case 'navigateToMeterSet': {
                if (state?.viewId !== 'setup_menu') return [];
                const selectedIndex = state?.menu?.selectedIndex ?? 0;
                if (selectedIndex >= SETUP_MENU_RIGHT_COLUMN_START) return ['LEFT'];
                return selectedIndex === SETUP_MENU_METER_SET_INDEX ? ['ENTER'] : ['DOWN'];
            }
            case 'softKeysIntro':
                if (state?.viewId === 'home_screen' || state?.viewId === 'home_screen_dim') return ['SOFT2'];
                if (state?.viewId === 'cal_menu') return ['ENTER'];
                return [];
            case 'stopCalibrationWithEnter':
                return ['ENTER'];
            case 'escToHomeAfterCal':
                return ['ESC'];
            case 'openCurrentStudy': {
                const isHome = state?.viewId === 'home_screen' || state?.viewId === 'home_screen_dim';
                if (!isHome) return [];
                const selectedIndex = state?.menu?.selectedIndex ?? 0;
                if (selectedIndex === HOME_MENU_CURRENT_STUDY_INDEX) return ['ENTER'];
                return selectedIndex < HOME_MENU_CURRENT_STUDY_INDEX ? ['DOWN'] : ['UP'];
            }
            case 'selectSlmTimeConstantF':
            case 'selectSlmTimeConstantS':
                return ['SOFT2'];
            case 'selectSlmWeightingZ':
            case 'selectSlmWeightingA':
                return ['SOFT3'];
            case 'batteryCheck':
            case 'rangeCapacityCheck':
            case 'confirmMeterParameters':
            case 'confirmCalibratorSettings':
            case 'dragCalibratorToMeter':
            case 'hammeringImpulseDemo':
            case 'fanSoundDemo':
                return [];
            default:
                return null;
        }
    }

    function dispatchWalkthroughInternal(evt) {
        if (typeof window.dispatch !== 'function') return;
        isInternalWalkthroughDispatch = true;
        try {
            window.dispatch(evt);
        } finally {
            isInternalWalkthroughDispatch = false;
        }
    }

    function warnBlockedWalkthroughEvent() {
        showWalkthroughFeedback('Please follow the highlighted step before continuing.');
        setPanelVisible(true);
        scheduleWalkthroughPanelPosition();
    }

    function shouldBlockWalkthroughEvent(evt, state) {
        if (
            document.body.classList.contains('calibration-active') ||
            document.body.classList.contains('operation-active') ||
            document.body.classList.contains('resources-active')
        ) return false;
        if (isInternalWalkthroughDispatch) return false;
        if (!evt || !currentStepId) return false;
        if (!walkthroughGuidanceReady) return true;
        const allowedEvents = getAllowedEventsForCurrentStep(state);
        if (!allowedEvents) return false;
        if (allowedEvents.includes(evt.type)) {
            showWalkthroughFeedback('');
            return false;
        }
        warnBlockedWalkthroughEvent();
        return true;
    }

    /**
     * Update walkthrough based on FSM state. Called from subscription callback.
     * Handles state-driven steps (navigateToSetup, navigateToSigInput, escToSetup, navigateToMeterSet, openCurrentStudy, selectSlmTimeConstantF, selectSlmWeightingZ, selectSlmTimeConstantS, selectSlmWeightingA).
     */
    function updateWalkthroughForState(state) {
        try {
            const setHighlight = window.setWalkthroughHighlight;
            if (!setHighlight) return;
            if (!state) {
                if (currentStepId === 'dragCalibratorToMeter') tryCompleteDragCalibratorStep();
                return;
            }

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

            if (currentStepId === 'stopCalibrationWithEnter') {
                if (state.viewId === 'cal_menu') {
                    setHighlight('.nav__btn--enter', false);
                    window.finishWalkthroughCalibrationCleanup?.();
                    advanceWalkthroughStep('stopCalibrationWithEnter');
                    return;
                }
                if (state.viewId === 'cal_running') {
                    setHighlight('.nav__btn--enter', true);
                } else {
                    setHighlight('.nav__btn--enter', false);
                }
                return;
            }

            if (currentStepId === 'escToHomeAfterCal') {
                const isHome = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
                if (isHome) {
                    setHighlight('.fn-btn--power', false);
                    advanceWalkthroughStep('escToHomeAfterCal');
                    return;
                }
                if (state.viewId === 'cal_menu') {
                    setHighlight('.fn-btn--power', true);
                } else {
                    setHighlight('.fn-btn--power', false);
                }
                return;
            }

            if (currentStepId === 'openCurrentStudy') {
                if (isWalkthroughSlmMeasurementView(state.viewId)) {
                    setHighlight('.nav__btn--up', false);
                    setHighlight('.nav__btn--down', false);
                    setHighlight('.nav__btn--enter', false);
                    advanceWalkthroughStep('openCurrentStudy');
                    return;
                }
                const isHomeOpenStudy = state.viewId === 'home_screen' || state.viewId === 'home_screen_dim';
                if (isHomeOpenStudy) {
                    applyOpenCurrentStudyHighlight(state);
                }
                return;
            }

            if (currentStepId === 'selectSlmTimeConstantF') {
                if (isWalkthroughSlmMeasurementView(state.viewId) && state.slm && state.slm.timeConstant === 'F') {
                    const setPrimary = window.setWalkthroughPrimaryFocus;
                    if (typeof setPrimary === 'function') {
                        setPrimary('.soft-key--2', false);
                    }
                    setHighlight('.soft-keys-region', false);
                    setHighlight('.soft-key--2', false);
                    advanceWalkthroughStep('selectSlmTimeConstantF');
                    return;
                }
                if (isWalkthroughSlmMeasurementView(state.viewId)) {
                    applySelectSlmTimeConstantFHighlight(state);
                }
                return;
            }

            if (currentStepId === 'selectSlmWeightingZ') {
                if (isWalkthroughSlmMeasurementView(state.viewId) && state.slm && state.slm.weighting === 'Z') {
                    const setPrimary = window.setWalkthroughPrimaryFocus;
                    if (typeof setPrimary === 'function') {
                        setPrimary('.soft-key--3', false);
                    }
                    setHighlight('.soft-keys-region', false);
                    setHighlight('.soft-key--3', false);
                    advanceWalkthroughStep('selectSlmWeightingZ');
                    return;
                }
                if (isWalkthroughSlmMeasurementView(state.viewId)) {
                    applySelectSlmWeightingZHighlight(state);
                }
                return;
            }

            if (currentStepId === 'selectSlmTimeConstantS') {
                if (isWalkthroughSlmMeasurementView(state.viewId) && state.slm && state.slm.timeConstant === 'S') {
                    const setPrimary = window.setWalkthroughPrimaryFocus;
                    if (typeof setPrimary === 'function') {
                        setPrimary('.soft-key--2', false);
                    }
                    setHighlight('.soft-keys-region', false);
                    setHighlight('.soft-key--2', false);
                    advanceWalkthroughStep('selectSlmTimeConstantS');
                    return;
                }
                if (isWalkthroughSlmMeasurementView(state.viewId)) {
                    applySelectSlmTimeConstantSHighlight(state);
                }
                return;
            }

            if (currentStepId === 'selectSlmWeightingA') {
                if (isWalkthroughSlmMeasurementView(state.viewId) && state.slm && state.slm.weighting === 'R') {
                    const setPrimary = window.setWalkthroughPrimaryFocus;
                    if (typeof setPrimary === 'function') {
                        setPrimary('.soft-key--3', false);
                    }
                    setHighlight('.soft-keys-region', false);
                    setHighlight('.soft-key--3', false);
                    advanceWalkthroughStep('selectSlmWeightingA');
                    return;
                }
                if (isWalkthroughSlmMeasurementView(state.viewId)) {
                    applySelectSlmWeightingAHighlight(state);
                }
                return;
            }

            if (currentStepId === 'dragCalibratorToMeter') {
                tryCompleteDragCalibratorStep();
                return;
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

        const prevStepId = currentStepId;

        if (currentStepId === 'powerOn' && stepId !== 'powerOn') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'batteryCheck' && stepId !== 'batteryCheck') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'navigateToSetup' && stepId !== 'navigateToSetup') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'navigateToSigInput' && stepId !== 'navigateToSigInput') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'rangeCapacityCheck' && stepId !== 'rangeCapacityCheck') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'escToSetup' && stepId !== 'escToSetup') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'navigateToMeterSet' && stepId !== 'navigateToMeterSet') {
            window.AudioPlayer?.stopNarration?.();
            meterSetSwitchColumnNarrationDone = false;
        }
        if (currentStepId === 'confirmMeterParameters' && stepId !== 'confirmMeterParameters') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'softKeysIntro' && stepId !== 'softKeysIntro') {
            window.AudioPlayer?.stopNarration?.();
            calibratorPowerNarrationDone = false;
        }
        if (currentStepId === 'dragCalibratorToMeter' && stepId !== 'dragCalibratorToMeter') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'stopCalibrationWithEnter' && stepId !== 'stopCalibrationWithEnter') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'escToHomeAfterCal' && stepId !== 'escToHomeAfterCal') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'openCurrentStudy' && stepId !== 'openCurrentStudy') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'selectSlmTimeConstantF' && stepId !== 'selectSlmTimeConstantF') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'selectSlmWeightingZ' && stepId !== 'selectSlmWeightingZ') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'selectSlmTimeConstantS' && stepId !== 'selectSlmTimeConstantS') {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'selectSlmWeightingA' && stepId !== 'selectSlmWeightingA') {
            window.AudioPlayer?.stopNarration?.();
        }

        const deferBatteryPanel =
            stepId === 'batteryCheck' && typeof window.runAfterSoundMeterTransformIdle === 'function';

        if (!deferBatteryPanel) {
            batteryPanelRevealSeq++;
        }

        currentStepId = stepId;

        if (stepId === 'navigateToMeterSet' && prevStepId !== 'navigateToMeterSet') {
            meterSetSwitchColumnNarrationDone = false;
        }

        if (stepId === 'softKeysIntro' && prevStepId !== 'softKeysIntro') {
            calibratorPowerNarrationDone = false;
        }

        const instructionEl = getInstructionEl();
        const buttonsEl = getButtonsEl();
        const feedbackEl = getFeedbackEl();

        if (instructionEl) instructionEl.textContent = step.text || '';
        if (prevStepId !== stepId) {
            beginWalkthroughGuidanceDelay(step.text, false);
        }
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

        const setupSectionOwnsNarration = window.isSetupSectionActive?.() === true;
        const calibrationSectionOwnsNarration = window.isCalibrationSectionActive?.() === true;

        if (deferBatteryPanel) {
            setPanelVisible(false);
            const seq = ++batteryPanelRevealSeq;
            const prevForBatteryNarration = prevStepId;
            window.runAfterSoundMeterTransformIdle(() => {
                if (seq !== batteryPanelRevealSeq) return;
                if (currentStepId !== 'batteryCheck') return;
                setPanelVisible(true);
                scheduleWalkthroughPanelPosition();
                if (
                    window.isSetupSectionActive?.() !== true &&
                    prevForBatteryNarration !== 'batteryCheck' &&
                    typeof window.AudioPlayer?.playNarration === 'function'
                ) {
                    window.AudioPlayer.playNarration('assets/audio/Batterys.mp3');
                }
            });
        } else {
            setPanelVisible(true);
            scheduleWalkthroughPanelPosition();
        }

        if (!setupSectionOwnsNarration && stepId === 'powerOn' && prevStepId !== 'powerOn') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/First lets set up the SLM.mp3');
            }
        }

        if (!setupSectionOwnsNarration && stepId === 'batteryCheck' && prevStepId !== 'batteryCheck' && !deferBatteryPanel) {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Batterys.mp3');
            }
        }

        if (!setupSectionOwnsNarration && stepId === 'navigateToSetup' && prevStepId !== 'navigateToSetup') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Range Capacity.mp3');
            }
        }

        if (!setupSectionOwnsNarration && stepId === 'navigateToSigInput' && prevStepId !== 'navigateToSigInput') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Signial Input.mp3');
            }
        }

        if (!setupSectionOwnsNarration && stepId === 'rangeCapacityCheck' && prevStepId !== 'rangeCapacityCheck') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration(
                    'assets/audio/' + encodeURIComponent('Is the Range Cap at?.mp3')
                );
            }
        }

        if (!setupSectionOwnsNarration && stepId === 'escToSetup' && prevStepId !== 'escToSetup') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/configure meter.mp3');
            }
        }

        if (!setupSectionOwnsNarration && stepId === 'confirmMeterParameters' && prevStepId !== 'confirmMeterParameters') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Correct Meter settings.mp3');
            }
        }

        if (!calibrationSectionOwnsNarration && stepId === 'softKeysIntro' && prevStepId !== 'softKeysIntro') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Start Cal.mp3');
            }
        }

        if (!calibrationSectionOwnsNarration && stepId === 'dragCalibratorToMeter' && prevStepId !== 'dragCalibratorToMeter') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Place the calibrator.mp3', {
                    onEnded: function () {
                        if (getCurrentStepId() !== 'dragCalibratorToMeter') return;
                        showWalkthroughFeedback(
                            'Feedback testing note: drag and drop is temporarily disabled for this review. Please click Start to automatically place the calibrator and continue. The normal training instruction above is what learners will see in the final version.'
                        );
                    },
                });
            }
        }

        if (!calibrationSectionOwnsNarration && stepId === 'stopCalibrationWithEnter' && prevStepId !== 'stopCalibrationWithEnter') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Stop Calabration.mp3');
            }
        }

        if (!calibrationSectionOwnsNarration && stepId === 'escToHomeAfterCal' && prevStepId !== 'escToHomeAfterCal') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/collecting noise data.mp3');
            }
        }

        if (stepId === 'openCurrentStudy' && prevStepId !== 'openCurrentStudy') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/View current.mp3');
            }
        }

        if (stepId === 'selectSlmTimeConstantF' && prevStepId !== 'selectSlmTimeConstantF') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/Fast.mp3');
            }
        }

        if (stepId === 'selectSlmWeightingZ' && prevStepId !== 'selectSlmWeightingZ') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/z weighting.mp3');
            }
        }

        if (stepId === 'selectSlmTimeConstantS' && prevStepId !== 'selectSlmTimeConstantS') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/slow.mp3');
            }
        }

        if (stepId === 'selectSlmWeightingA' && prevStepId !== 'selectSlmWeightingA') {
            if (typeof window.AudioPlayer?.playNarration === 'function') {
                window.AudioPlayer.playNarration('assets/audio/A for weighting.mp3');
            }
        }

        if (stepId === 'hammeringImpulseDemo') {
            if (typeof window.AudioPlayer?.playPreset === 'function') {
                window.AudioPlayer.playPreset('hammering', true, true, false);
            }
            const seq = ++hammerDemoAutoadvanceSeq;
            const WAIT_MS = 20000;
            const FADE_MS = 1500;
            window.setTimeout(() => {
                if (seq !== hammerDemoAutoadvanceSeq) return;
                if (getCurrentStepId() !== 'hammeringImpulseDemo') return;
                const finishAdvance = function () {
                    if (seq !== hammerDemoAutoadvanceSeq) return;
                    if (getCurrentStepId() !== 'hammeringImpulseDemo') return;
                    advanceWalkthroughStep('hammeringImpulseDemo');
                };
                if (typeof window.AudioPlayer?.fadeOutAndStop === 'function') {
                    window.AudioPlayer.fadeOutAndStop(FADE_MS, finishAdvance);
                } else {
                    window.AudioPlayer?.stop?.();
                    finishAdvance();
                }
            }, WAIT_MS);
        }

        if (stepId === 'fanSoundDemo') {
            if (typeof window.AudioPlayer?.playPreset === 'function') {
                window.AudioPlayer.playPreset('fan', true, true, false);
            }
            const seq = ++fanDemoAutoadvanceSeq;
            const WAIT_MS = 20000;
            const FADE_MS = 1500;
            window.setTimeout(() => {
                if (seq !== fanDemoAutoadvanceSeq) return;
                if (getCurrentStepId() !== 'fanSoundDemo') return;
                const finishAdvance = function () {
                    if (seq !== fanDemoAutoadvanceSeq) return;
                    if (getCurrentStepId() !== 'fanSoundDemo') return;
                    advanceWalkthroughStep('fanSoundDemo');
                };
                if (typeof window.AudioPlayer?.fadeOutAndStop === 'function') {
                    window.AudioPlayer.fadeOutAndStop(FADE_MS, finishAdvance);
                } else {
                    window.AudioPlayer?.stop?.();
                    finishAdvance();
                }
            }, WAIT_MS);
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
        if (
            currentStepId === 'powerOn' ||
            currentStepId === 'batteryCheck' ||
            currentStepId === 'navigateToSetup' ||
            currentStepId === 'navigateToSigInput' ||
            currentStepId === 'rangeCapacityCheck' ||
            currentStepId === 'escToSetup' ||
            currentStepId === 'navigateToMeterSet' ||
            currentStepId === 'confirmMeterParameters' ||
            currentStepId === 'softKeysIntro' ||
            currentStepId === 'dragCalibratorToMeter' ||
            currentStepId === 'stopCalibrationWithEnter' ||
            currentStepId === 'escToHomeAfterCal' ||
            currentStepId === 'openCurrentStudy' ||
            currentStepId === 'selectSlmTimeConstantF' ||
            currentStepId === 'selectSlmWeightingZ' ||
            currentStepId === 'selectSlmTimeConstantS' ||
            currentStepId === 'selectSlmWeightingA'
        ) {
            window.AudioPlayer?.stopNarration?.();
        }
        if (currentStepId === 'navigateToMeterSet') {
            meterSetSwitchColumnNarrationDone = false;
        }
        if (currentStepId === 'softKeysIntro') {
            calibratorPowerNarrationDone = false;
        }
        batteryPanelRevealSeq++;
        cancelWalkthroughGuidanceDelay();
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
        hammerDemoAutoadvanceSeq++;
        fanDemoAutoadvanceSeq++;
        meterSetSwitchColumnNarrationDone = false;
        calibratorPowerNarrationDone = false;
        if (typeof window.AudioPlayer?.stop === 'function') {
            window.AudioPlayer.stop();
        }
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
    window.shouldBlockWalkthroughEvent = shouldBlockWalkthroughEvent;
    window.getCurrentStepId = getCurrentStepId;
    window.scheduleWalkthroughPanelPosition = scheduleWalkthroughPanelPosition;
    window.tryCompleteDragCalibratorStep = tryCompleteDragCalibratorStep;
})();
