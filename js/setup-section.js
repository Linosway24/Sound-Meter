(() => {
    'use strict';

    const COPY = {
        power: {
            title: 'Power On',
            instruction: 'Press the power button to turn on the device.',
            prompt: 'Find the correct control on the sound level meter.',
            status: 'Step 1 of 4',
        },
        battery: {
            title: 'Confirm Battery Status',
            instruction: 'Confirm that the batteries are charged. Click the battery icon on the meter screen to show that you know its location.',
            prompt: 'Select the battery indicator in the top status bar.',
            status: 'Step 2 of 4',
        },
        decision: {
            title: 'Confirm Battery Status',
            instruction: 'Now select Yes or No to indicate the condition of the batteries.',
            prompt: '',
            status: 'Step 2 of 4',
        },
        'range-home': {
            title: 'Check Range Capacity',
            instruction: 'Ensure that the range capacity is set to 140 dB.',
            prompt: 'Navigate to SETUP on the meter screen and press ENTER.',
            status: 'Step 3 of 4',
        },
        'range-setup': {
            title: 'Check Signal Input',
            instruction: 'Find SIG INPUT in the Setup menu.',
            prompt: 'Use the RIGHT arrow to select SIG INPUT, then press ENTER.',
            status: 'Step 3 of 4',
        },
        'range-verify': {
            title: 'Check Range Capacity',
            instruction: 'Confirm that RANGE CAP is set to 140 dB.',
            prompt: 'Read the value on the meter screen, then select OK or Not OK.',
            status: 'Step 3 of 4',
        },
        'parameters-return': {
            title: 'Configure Meter Parameters',
            instruction: 'Press ESC to return to the Setup screen.',
            prompt: 'The On/Off button also functions as ESC when the meter is on.',
            status: 'Step 4 of 4',
        },
        'parameters-setup': {
            title: 'Open Meter Set',
            instruction: 'Navigate to METER SET and press ENTER.',
            prompt: 'Move to the left column, select METER SET, then open it.',
            status: 'Step 4 of 4',
        },
        'parameters-form': {
            title: 'Set Meter Parameters',
            instruction: 'Read the five settings on the METER SET screen and enter each value below.',
            prompt: 'Enter Threshold, Exchange Rate, Criterion Level, Upper Limit, and Projected Time. Then select Enter.',
            status: 'Step 4 of 4',
        },
        classroom: {
            title: 'Verify Meter Parameters',
            instruction: 'The entered parameters match the meter display.',
            prompt: 'Compare these values with the numbers presented in your classroom instruction.',
            status: 'Step 4 of 4',
        },
        complete: {
            title: 'Setup Complete',
            instruction: 'You have completed the four principal steps for setting up the sound level meter.',
            prompt: 'Review Calibration, skip to Scenarios, or choose another topic from the menu.',
            status: '4 of 4 complete',
        },
    };

    const PARAMETER_VALUES = {
        threshold: '80',
        exchange: '3',
        criterion: '85',
        upper: '115',
        time: '8',
    };

    const NARRATION = {
        introduction: 'assets/audio/setup-01-introduction.mp3',
        power: 'assets/audio/setup-02-power-on.mp3',
        battery: 'assets/audio/setup-03-battery-location.mp3',
        decision: 'assets/audio/setup-04-battery-question.mp3',
        batteryCorrect: 'assets/audio/setup-05-battery-correct.mp3',
        batteryIncorrect: 'assets/audio/setup-06-battery-incorrect.mp3',
        range: 'assets/audio/setup-07-range-capacity.mp3',
        rangeCorrect: 'assets/audio/setup-08-range-correct.mp3',
        rangeIncorrect: 'assets/audio/setup-09-range-incorrect.mp3',
        parametersIntroduction: 'assets/audio/setup-10-parameters-introduction.mp3',
        openMeterSet: 'assets/audio/setup-11-open-meter-set.mp3',
        enterParameters: 'assets/audio/setup-12-enter-parameters.mp3',
        parametersCorrect: 'assets/audio/setup-13-parameters-correct.mp3',
        parametersIncorrect: 'assets/audio/setup-14-parameters-incorrect.mp3',
        classroomQuestion: 'assets/audio/setup-15-classroom-question.mp3',
        classroomCorrect: 'assets/audio/setup-16-classroom-correct.mp3',
        classroomIncorrect: 'assets/audio/setup-17-classroom-incorrect.mp3',
        classroomUnsure: 'assets/audio/setup-18-classroom-unsure.mp3',
        complete: 'assets/audio/setup-19-complete.mp3',
    };

    const SETUP_NARRATION_URLS = new Set(Object.values(NARRATION));

    const STEP_NARRATION = {
        power: 'power',
        battery: 'battery',
        decision: 'decision',
        'range-home': 'range',
        'parameters-form': 'enterParameters',
        classroom: 'classroomQuestion',
        complete: 'complete',
    };

    function initializeSetupSection() {
        const section = document.getElementById('training-setup');
        const introPanel = document.getElementById('training-setup-intro-panel');
        const lessonPanel = document.getElementById('training-setup-lesson-panel');
        const title = document.getElementById('training-setup-title');
        const instruction = document.getElementById('training-setup-instruction');
        const prompt = document.getElementById('training-setup-prompt');
        const batteryQuestion = document.getElementById('training-setup-question');
        const rangeQuestion = document.getElementById('training-setup-range-question');
        const parameterForm = document.getElementById('training-setup-parameters');
        const classroomQuestion = document.getElementById('training-setup-classroom-question');
        const completionActions = document.getElementById('training-setup-completion-actions');
        const feedback = document.getElementById('training-setup-feedback');
        const status = document.getElementById('training-setup-status');
        const setupButton = document.querySelector('.course-nav__item[data-section="Setup"]');
        const guideButton = document.querySelector('.course-nav__item[data-section="Guide Me"]');
        const sectionButtons = [...document.querySelectorAll('.course-nav__item[data-section]')];
        const hardwareSelector = '.soft-key, .nav__btn, .fn-btn';

        if (!section || !introPanel || !lessonPanel || !title || !instruction || !prompt || !batteryQuestion || !rangeQuestion || !parameterForm || !classroomQuestion || !completionActions || !feedback || !status || !setupButton || !guideButton) return;

        let active = false;
        let guideMode = false;
        let step = 'guide-intro';
        let currentState = null;
        let unsubscribe = null;
        let subscribeTimer = 0;
        let batteryObserver = null;
        let lastWrongControlAt = 0;
        let closeupFrameId = 0;
        let narrationSequence = 0;
        let narrationLocked = false;
        const batteryTarget = document.createElement('button');
        batteryTarget.id = 'setup-battery-target';
        batteryTarget.className = 'setup-battery-target';
        batteryTarget.type = 'button';
        batteryTarget.hidden = true;
        batteryTarget.setAttribute('aria-label', 'Battery status: fully charged');
        document.body.appendChild(batteryTarget);

        function setFeedback(message, success = false) {
            feedback.textContent = message || '';
            feedback.classList.toggle('is-success', Boolean(message && success));
        }

        function setNarrationLocked(locked) {
            narrationLocked = Boolean(locked) && active;
            document.body.classList.toggle('setup-narration-locked', narrationLocked);
            section.setAttribute('aria-busy', String(narrationLocked));
            section.querySelectorAll('button, input').forEach((control) => {
                control.disabled = narrationLocked;
            });
            batteryTarget.disabled = narrationLocked;
        }

        function isSetupNarration(url) {
            return SETUP_NARRATION_URLS.has(url);
        }

        function stopSetupNarration() {
            narrationSequence += 1;
            window.AudioPlayer?.stopNarration?.();
            setNarrationLocked(false);
        }

        function playSetupNarration(key, onFinished = null) {
            const url = NARRATION[key];
            if (!url || typeof window.AudioPlayer?.playNarration !== 'function') {
                onFinished?.();
                return;
            }
            const sequence = ++narrationSequence;
            const finish = () => {
                if (!active || sequence !== narrationSequence) return;
                onFinished?.();
            };
            window.AudioPlayer.playNarration(url, {
                onEnded: finish,
                onUnavailable: finish,
            });
        }

        function playStepNarration(stepName) {
            if (stepName === 'parameters-return') {
                playSetupNarration('parametersIntroduction', () => {
                    if (step === 'parameters-return' || step === 'parameters-setup') {
                        playSetupNarration('openMeterSet');
                    }
                });
                return;
            }
            const narrationKey = STEP_NARRATION[stepName];
            if (narrationKey) playSetupNarration(narrationKey);
        }

        function continueAfterNarration(key, nextStep) {
            playSetupNarration(key, () => renderStep(nextStep));
        }

        function expectedHardwareSelector() {
            if (step === 'power') return '.fn-btn--power';
            if (step === 'range-home') {
                return currentState?.menu?.selectedIndex === 3 ? '.nav__btn--enter' : '.nav__btn--down';
            }
            if (step === 'range-setup') {
                const index = currentState?.menu?.selectedIndex;
                if (index === 6) return '.nav__btn--enter';
                return index < 6 ? '.nav__btn--right' : '.nav__btn--down';
            }
            if (step === 'parameters-return') return '.fn-btn--power';
            if (step === 'parameters-setup') {
                const index = currentState?.menu?.selectedIndex;
                if (index === 1) return '.nav__btn--enter';
                if (index >= 6) return '.nav__btn--left';
                return '.nav__btn--down';
            }
            return null;
        }

        function clearTargetHighlights() {
            [
                '.fn-btn--power', '.nav__btn--down', '.nav__btn--left',
                '.nav__btn--right', '.nav__btn--enter', '.status-bar__battery'
            ].forEach((selector) => window.setWalkthroughHighlight?.(selector, false));
            section.querySelectorAll('.walkthrough-highlight').forEach((element) => element.classList.remove('walkthrough-highlight'));
            batteryTarget.classList.remove('walkthrough-highlight');
        }

        function revealGuideHighlights() {
            if (!guideMode) return;
            window.flushWalkthroughGuidance?.();
            document.body.classList.remove('walkthrough-guidance-pending');
        }

        function updateGuideToggle() {
            const enabled = active && guideMode;
            guideButton.classList.toggle('is-guide-enabled', enabled);
            guideButton.setAttribute('aria-pressed', String(enabled));
            guideButton.setAttribute('title', enabled ? 'Turn Guide Me off' : 'Turn Guide Me on');
        }

        function syncGuideHighlight() {
            clearTargetHighlights();
            updateGuideToggle();
            if (!active || !guideMode) return;
            revealGuideHighlights();
            const target = expectedHardwareSelector();
            if (target) window.setWalkthroughHighlight?.(target, true);
            if (step === 'battery') makeBatteryInteractive();
            if (step === 'decision') section.querySelector('[data-setup-answer="yes"]')?.classList.add('walkthrough-highlight');
            if (step === 'range-verify') section.querySelector('[data-setup-range-answer="ok"]')?.classList.add('walkthrough-highlight');
            if (step === 'parameters-form') parameterForm.querySelector('input')?.classList.add('walkthrough-highlight');
            if (step === 'classroom') classroomQuestion.querySelector('[data-setup-classroom-answer="yes"]')?.classList.add('walkthrough-highlight');
        }

        function setGuideMode(enabled) {
            guideMode = Boolean(enabled) && active;
            document.body.classList.toggle('setup-guide-active', guideMode);
            syncGuideHighlight();
        }

        function makeBatteryInteractive() {
            const battery = document.querySelector('.status-bar__battery');
            if (!battery) return null;
            battery.setAttribute('role', 'button');
            battery.setAttribute('tabindex', '-1');
            battery.setAttribute('aria-label', 'Battery status: fully charged');
            const rect = battery.getBoundingClientRect();
            batteryTarget.hidden = !active || step !== 'battery';
            batteryTarget.style.left = `${rect.left}px`;
            batteryTarget.style.top = `${rect.top}px`;
            batteryTarget.style.width = `${Math.max(rect.width, 34)}px`;
            batteryTarget.style.height = `${Math.max(rect.height, 26)}px`;
            batteryTarget.classList.toggle('walkthrough-highlight', guideMode && step === 'battery');
            return battery;
        }

        function stageIndex() {
            if (step === 'power') return 0;
            if (step === 'battery' || step === 'decision') return 1;
            if (step.startsWith('range')) return 2;
            if (step.startsWith('parameters') || step === 'classroom') return 3;
            return 4;
        }

        function updateProgress() {
            const currentIndex = stageIndex();
            [...section.querySelectorAll('[data-setup-progress]')].forEach((element, index) => {
                element.classList.toggle('is-current', index === currentIndex);
                element.classList.toggle('is-complete', index < currentIndex || step === 'complete');
            });
        }

        function showFullDevice(instant = false) {
            closeupFrameId += 1;
            const deviceFrame = document.querySelector('.device-frame');
            if (!deviceFrame) return;
            deviceFrame.style.transformOrigin = 'center center';
            deviceFrame.style.transition = instant ? 'transform 0s' : 'transform 1s cubic-bezier(0.22, 0.76, 0.25, 1)';
            deviceFrame.style.transform = 'translate(0px, 0px) scale(1)';
        }

        function showControlsCloseup(instant = true) {
            const requestId = ++closeupFrameId;
            const deviceFrame = document.querySelector('.device-frame');
            const devicePhoto = document.querySelector('.device-photo');
            const lcd = document.querySelector('.lcd');
            if (!deviceFrame || !devicePhoto || !lcd) return;
            deviceFrame.style.transition = 'transform 0s';
            deviceFrame.style.transformOrigin = 'center center';
            deviceFrame.style.transform = 'translate(0px, 0px) scale(1)';
            requestAnimationFrame(() => {
                if (!active || requestId !== closeupFrameId) return;
                const photoRect = devicePhoto.getBoundingClientRect();
                const lcdRect = lcd.getBoundingClientRect();
                const deviceCenterX = photoRect.left + photoRect.width / 2;
                const deviceCenterY = photoRect.top + photoRect.height / 2;
                const focusTop = Math.max(photoRect.top, lcdRect.top - 36);
                const focusBottom = photoRect.bottom;
                const focusCenterY = (focusTop + focusBottom) / 2;
                const focusHeight = Math.max(1, focusBottom - focusTop);
                const scale = Math.min(2.3, Math.max(1.55, (window.innerHeight * 0.86) / focusHeight));
                const targetCenterX = window.innerWidth * 0.7625;
                const targetCenterY = window.innerHeight / 2;
                const panX = targetCenterX - deviceCenterX;
                const panY = targetCenterY - deviceCenterY - ((focusCenterY - deviceCenterY) * scale);
                deviceFrame.style.transition = instant ? 'transform 0s' : 'transform 850ms cubic-bezier(0.22, 0.76, 0.25, 1)';
                deviceFrame.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
                if (step === 'battery') window.setTimeout(makeBatteryInteractive, instant ? 0 : 880);
            });
        }

        function renderStep(nextStep, options = {}) {
            step = nextStep;
            const copy = COPY[step];
            if (!copy) return;
            introPanel.hidden = true;
            lessonPanel.hidden = false;
            clearTargetHighlights();
            title.textContent = copy.title;
            instruction.textContent = copy.instruction;
            prompt.textContent = copy.prompt;
            prompt.hidden = !copy.prompt;
            status.textContent = copy.status;
            batteryQuestion.hidden = step !== 'decision';
            rangeQuestion.hidden = step !== 'range-verify';
            parameterForm.hidden = step !== 'parameters-form';
            classroomQuestion.hidden = step !== 'classroom';
            completionActions.hidden = step !== 'complete';
            batteryTarget.hidden = step !== 'battery';
            setFeedback('');
            updateProgress();
            if (step === 'complete') showControlsCloseup(false);
            syncGuideHighlight();
            if (step === 'battery') requestAnimationFrame(makeBatteryInteractive);
            if (step === 'parameters-form') {
                requestAnimationFrame(() => parameterForm.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
            }
            if (options.narrate !== false) playStepNarration(step);
        }

        function showGuideIntro() {
            step = 'guide-intro';
            introPanel.hidden = false;
            lessonPanel.hidden = true;
            batteryTarget.hidden = true;
            clearTargetHighlights();
            updateGuideToggle();
        }

        function startSetupLesson() {
            if (!active || narrationLocked || step !== 'guide-intro') return;
            renderStep('power', { narrate: false });
            showControlsCloseup(true);
            playSetupNarration('power');
        }

        function showWrongControl(target) {
            const rect = target.getBoundingClientRect();
            const marker = document.createElement('span');
            marker.className = 'setup-wrong-marker';
            marker.textContent = '×';
            marker.setAttribute('aria-hidden', 'true');
            marker.style.left = `${rect.left + rect.width / 2}px`;
            marker.style.top = `${rect.top + rect.height / 2}px`;
            document.body.appendChild(marker);
            window.setTimeout(() => marker.remove(), 950);
            setFeedback('That is not the next control for this step. Try again or turn on Guide Me.');
        }

        function renderActiveNavigation() {
            sectionButtons.forEach((button) => {
                const isSetup = button === setupButton;
                button.classList.toggle('is-active', isSetup);
                if (isSetup) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
            });
        }

        function resetDevice() {
            stopSetupNarration();
            window.resetWalkthrough?.();
            window.clearWalkthroughHighlights?.();
            if (window.initMainFSM) window.initMainFSM();
        }

        function enterSetup(useGuide = false) {
            window.hideTrainingOverview?.();
            active = true;
            guideMode = useGuide;
            document.body.classList.add('setup-active');
            document.body.classList.toggle('setup-guide-active', guideMode);
            updateGuideToggle();
            section.setAttribute('aria-hidden', 'false');
            renderActiveNavigation();
            parameterForm.reset();
            resetDevice();
            revealGuideHighlights();
            showGuideIntro();
            showControlsCloseup(true);
            playSetupNarration('introduction', () => {
                if (step === 'guide-intro') startSetupLesson();
            });
        }

        function leaveSetup() {
            if (!active) return;
            active = false;
            guideMode = false;
            document.body.classList.remove('setup-active', 'setup-guide-active');
            updateGuideToggle();
            section.setAttribute('aria-hidden', 'true');
            batteryTarget.hidden = true;
            clearTargetHighlights();
            stopSetupNarration();
            document.querySelector('.status-bar__battery')?.removeAttribute('tabindex');
        }

        function handleState(state) {
            if (!active || !state) return;
            currentState = state;
            if (step === 'power' && state.viewId !== 'OFF') {
                clearTargetHighlights();
                setFeedback('The meter is starting…', true);
            }
            if (step === 'power' && state.viewId !== 'OFF' && state.viewId !== 'boot_screen') {
                window.setTimeout(() => {
                    if (active && step === 'power') renderStep('battery');
                }, 500);
            }
            if (step === 'battery' || step === 'decision') requestAnimationFrame(makeBatteryInteractive);
            if (step === 'range-home' && state.viewId === 'setup_menu') renderStep('range-setup');
            else if ((step === 'range-home' || step === 'range-setup') && state.viewId === 'sig_input_menu') renderStep('range-verify');
            else if (step === 'parameters-return' && state.viewId === 'setup_menu') renderStep('parameters-setup');
            else if (step === 'parameters-setup' && state.viewId === 'meter_set_menu') renderStep('parameters-form');
            else syncGuideHighlight();
        }

        function bindStateSubscription() {
            if (unsubscribe || typeof window.subscribeMainFSM !== 'function') {
                if (!unsubscribe) subscribeTimer = window.setTimeout(bindStateSubscription, 100);
                return;
            }
            unsubscribe = window.subscribeMainFSM(handleState);
        }

        function handleBatterySelection() {
            if (!active || narrationLocked || step !== 'battery') return;
            clearTargetHighlights();
            renderStep('decision');
        }

        setupButton.addEventListener('click', () => enterSetup(false));
        guideButton.addEventListener('click', () => {
            if (active) setGuideMode(!guideMode);
            else if (setupButton.classList.contains('is-active')) enterSetup(true);
            window.setTimeout(renderActiveNavigation, 0);
        });
        sectionButtons.forEach((button) => {
            if (button === setupButton || button === guideButton) return;
            button.addEventListener('click', leaveSetup);
        });

        batteryQuestion.addEventListener('click', (event) => {
            const answer = event.target.closest('[data-setup-answer]');
            if (!answer || !active || narrationLocked || step !== 'decision') return;
            if (answer.dataset.setupAnswer === 'no') {
                setFeedback('The icon indicates the batteries are fully charged. Select Yes to continue.');
                playSetupNarration('batteryIncorrect');
                return;
            }
            setFeedback('Correct. The batteries are fully charged.', true);
            continueAfterNarration('batteryCorrect', 'range-home');
        });

        rangeQuestion.addEventListener('click', (event) => {
            const answer = event.target.closest('[data-setup-range-answer]');
            if (!answer || !active || narrationLocked || step !== 'range-verify') return;
            const isCorrect = answer.dataset.setupRangeAnswer === 'ok';
            setFeedback(isCorrect ? 'That is correct.' : 'The range capacity is set to 140 dB.', true);
            continueAfterNarration(isCorrect ? 'rangeCorrect' : 'rangeIncorrect', 'parameters-return');
        });

        parameterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!active || narrationLocked || step !== 'parameters-form') return;
            const values = Object.fromEntries(new FormData(parameterForm).entries());
            const incorrect = Object.keys(PARAMETER_VALUES).filter((key) => {
                const entered = String(values[key] ?? '').trim();
                if (!entered) return true;
                const enteredNumber = Number(entered);
                const expectedNumber = Number(PARAMETER_VALUES[key]);
                return !Number.isFinite(enteredNumber) || enteredNumber !== expectedNumber;
            });
            if (incorrect.length) {
                setFeedback('One or more values do not match the meter display. Check the five entries and try again.');
                playSetupNarration('parametersIncorrect');
                parameterForm.querySelector(`[name="${incorrect[0]}"]`)?.focus();
                return;
            }
            setFeedback('Correct. The meter parameters match the display.', true);
            continueAfterNarration('parametersCorrect', 'classroom');
        });

        classroomQuestion.addEventListener('click', (event) => {
            const answer = event.target.closest('[data-setup-classroom-answer]');
            if (!answer || !active || narrationLocked || step !== 'classroom') return;
            const response = answer.dataset.setupClassroomAnswer;
            if (response === 'yes') {
                setFeedback('Correct. These values match the standard classroom parameters.', true);
                continueAfterNarration('classroomCorrect', 'complete');
            } else if (response === 'no') {
                setFeedback('Review the standard parameters with your instructor before field use.');
                playSetupNarration('classroomIncorrect');
            } else {
                setFeedback('If you are unsure, compare these values with your classroom materials or instructor.');
                playSetupNarration('classroomUnsure');
            }
        });
        completionActions.addEventListener('click', (event) => {
            const button = event.target.closest('[data-setup-destination]');
            if (!button || narrationLocked) return;
            if (button.dataset.setupDestination === 'Calibration' && typeof window.openCalibrationSection === 'function') {
                leaveSetup();
                window.openCalibrationSection(false);
                return;
            }
            document.querySelector(`.course-nav__item[data-section="${button.dataset.setupDestination}"]`)?.click();
        });
        batteryTarget.addEventListener('click', handleBatterySelection);

        window.addEventListener('resize', () => {
            if (!active || step === 'complete') return;
            showControlsCloseup(true);
        });

        document.addEventListener('click', (event) => {
            if (!active) return;
            if (narrationLocked && event.target.closest(`${hardwareSelector}, #setup-battery-target, .status-bar__battery, #training-setup button, #training-setup input`)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            const battery = event.target.closest('.status-bar__battery');
            if (battery) handleBatterySelection();
        }, true);

        document.addEventListener('mousedown', (event) => {
            if (!active) return;
            const hardware = event.target.closest(hardwareSelector);
            if (!hardware) return;
            if (narrationLocked) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            const expected = expectedHardwareSelector();
            if (expected && hardware.matches(expected)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            lastWrongControlAt = Date.now();
            if (expected) showWrongControl(hardware);
        }, true);

        document.addEventListener('mouseup', (event) => {
            if (!active) return;
            const hardware = event.target.closest(hardwareSelector);
            if (!hardware) return;
            if (narrationLocked) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            const expected = expectedHardwareSelector();
            if (expected && hardware.matches(expected)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);

        batteryObserver = new MutationObserver(() => {
            if (active && (step === 'battery' || step === 'decision')) makeBatteryInteractive();
        });
        const lcdMain = document.querySelector('.lcd__main');
        if (lcdMain) batteryObserver.observe(lcdMain, { childList: true, subtree: true });

        window.addEventListener('walkthrough-narration-start', (event) => {
            if (active && isSetupNarration(event.detail?.url)) setNarrationLocked(true);
        });
        const releaseNarrationLock = (event) => {
            if (active && isSetupNarration(event.detail?.url)) setNarrationLocked(false);
        };
        window.addEventListener('walkthrough-narration-end', releaseNarrationLock);
        window.addEventListener('walkthrough-narration-unavailable', releaseNarrationLock);

        window.isSetupSectionActive = () => active;
        window.isSetupGuideMode = () => active && guideMode;
        window.addEventListener('pagehide', () => {
            window.clearTimeout(subscribeTimer);
            unsubscribe?.();
            batteryObserver?.disconnect();
        }, { once: true });
        bindStateSubscription();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeSetupSection);
    else initializeSetupSection();
})();
