(() => {
    'use strict';

    const STEP_ORDER = ['open', 'weightings', 'fast-z', 'hammer', 'slow-a', 'fan', 'complete'];
    const COPY = {
        open: {
            title: 'Open Current Study',
            instruction: 'The Operation section shows how the sound level meter responds to different sources and measurement settings.',
            prompt: 'Select VIEW CURRENT STUDY, then press ENTER.',
        },
        weightings: {
            title: 'Response and Frequency Weighting',
            instruction: 'Two settings shape how the meter responds to sound.',
            details: '<div class="operation-setting"><strong>Time Weightings</strong><span>Fast, Slow, and Impulse control how quickly readings change.</span></div><div class="operation-setting"><strong>Frequency Weightings</strong><span>A, C, and Z control how the meter responds across the frequency range.</span></div>',
            prompt: 'The process and sound source determine which combination to use.',
        },
        'fast-z': {
            title: 'Set Fast and Z Weighting',
            instruction: 'Configure the meter for a short, impulsive sound.',
            prompt: 'Use the second soft key to select Fast (F), then the third soft key to select Z.',
        },
        hammer: {
            title: 'Measure an Impact Sound',
            instruction: 'Watch how Fast response follows the sharp peaks created by the hammer.',
            details: '<div class="operation-reading"><span>Ambient</span><strong>40–50 dB</strong></div><div class="operation-reading"><span>Impact peaks</span><strong>99–110 dB</strong></div>',
            prompt: 'The reading rises quickly with each impact, then drops back toward the ambient level.',
        },
        'slow-a': {
            title: 'Set Slow and A Weighting',
            instruction: 'Now configure the meter for a steady sound source.',
            prompt: 'Use the second soft key to select Slow (S), then the third soft key to select A.',
        },
        fan: {
            title: 'Measure a Steady Sound',
            instruction: 'Watch how Slow response smooths the changing fan sound into a steadier reading.',
            details: '<div class="operation-reading"><span>Typical reading</span><strong>50–60 dB</strong></div>',
            prompt: 'The display changes gradually and remains relatively stable.',
        },
        complete: {
            title: 'Operation Complete',
            instruction: 'You have practiced the basic principles for operating the sound level meter.',
            prompt: 'Continue to Surveys or choose another topic from the menu.',
        },
    };

    const NARRATION = {
        open: 'assets/audio/operation-01-open-current-study.mp3',
        weightings: 'assets/audio/operation-02-weightings-overview.mp3',
        fastZ: 'assets/audio/operation-03-select-fast-z.mp3',
        hammer: 'assets/audio/operation-04-impact-noise-demo.mp3',
        slowA: 'assets/audio/operation-05-select-slow-a.mp3',
        complete: 'assets/audio/operation-06-complete.mp3',
    };

    const STEP_NARRATION = {
        open: 'open',
        weightings: 'weightings',
        'fast-z': 'fastZ',
        hammer: 'hammer',
        'slow-a': 'slowA',
        complete: 'complete',
    };

    const OPERATION_NARRATION_URLS = new Set(Object.values(NARRATION));

    function initializeOperationSection() {
        const section = document.getElementById('training-operation');
        const title = document.getElementById('training-operation-title');
        const instruction = document.getElementById('training-operation-instruction');
        const details = document.getElementById('training-operation-details');
        const prompt = document.getElementById('training-operation-prompt');
        const actions = document.getElementById('training-operation-actions');
        const feedback = document.getElementById('training-operation-feedback');
        const status = document.getElementById('training-operation-status');
        const operationButton = document.querySelector('.course-nav__item[data-section="Operation"]');
        const surveysButton = document.querySelector('.course-nav__item[data-section="Surveys"]');
        const guideButton = document.querySelector('.course-nav__item[data-section="Guide Me"]');
        const sectionButtons = [...document.querySelectorAll('.course-nav__item[data-section]')];
        if (!section || !operationButton || !guideButton) return;

        let active = false;
        let guideMode = false;
        let step = 'open';
        let unsubscribe = null;
        let subscribeTimer = 0;
        let deviceReadyTimer = 0;
        let transitionTimer = 0;
        let layoutTimers = [];
        let narrationSequence = 0;
        let narrationLocked = false;

        function layoutMeterLikeSetup(instant = true) {
            const deviceFrame = document.querySelector('.device-frame');
            const devicePhoto = document.querySelector('.device-photo');
            const lcd = document.querySelector('.lcd');
            if (!active || !deviceFrame || !devicePhoto || !lcd) return;

            deviceFrame.style.transition = 'transform 0s';
            deviceFrame.style.transformOrigin = 'center center';
            deviceFrame.style.transform = 'translate(0px, 0px) scale(1)';
            requestAnimationFrame(() => {
                if (!active) return;
                const photoRect = devicePhoto.getBoundingClientRect();
                const lcdRect = lcd.getBoundingClientRect();
                const deviceCenterX = photoRect.left + photoRect.width / 2;
                const deviceCenterY = photoRect.top + photoRect.height / 2;
                const focusTop = Math.max(photoRect.top, lcdRect.top - 36);
                const focusBottom = photoRect.bottom;
                const focusCenterY = (focusTop + focusBottom) / 2;
                const focusHeight = Math.max(1, focusBottom - focusTop);
                const scale = Math.min(2.3, Math.max(1.55, (window.innerHeight * 0.86) / focusHeight));
                // Use the same viewport anchor as Setup and Calibration so
                // section/card/menu changes never make the meter jump.
                const targetCenterX = window.innerWidth * 0.7625;
                const targetCenterY = window.innerHeight / 2;
                const panX = targetCenterX - deviceCenterX;
                const panY = targetCenterY - deviceCenterY - ((focusCenterY - deviceCenterY) * scale);
                deviceFrame.style.transition = instant ? 'transform 0s' : 'transform 850ms cubic-bezier(0.22, 0.76, 0.25, 1)';
                deviceFrame.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
            });
        }

        function scheduleMeterLayout() {
            layoutTimers.forEach((timer) => window.clearTimeout(timer));
            layoutTimers = [120, 480, 900].map((delay) => window.setTimeout(() => layoutMeterLikeSetup(true), delay));
        }

        function isSlmView(state) {
            return Boolean(state?.viewId && state.viewId.startsWith('slm_'));
        }

        function clearHighlights() {
            document.querySelectorAll('.operation-highlight').forEach((element) => {
                element.classList.remove('operation-highlight', 'walkthrough-highlight');
            });
            document.body.classList.remove('walkthrough-guidance-pending');
        }

        function setNarrationLocked(locked) {
            narrationLocked = Boolean(locked) && active;
            document.body.classList.toggle('operation-narration-locked', narrationLocked);
            section.setAttribute('aria-busy', String(narrationLocked));
            section.querySelectorAll('button').forEach((button) => {
                if (narrationLocked) {
                    if (!button.dataset.operationNarrationDisabled) {
                        button.dataset.operationNarrationDisabled = button.disabled ? 'preserve' : 'lock';
                    }
                    button.disabled = true;
                    return;
                }
                if (button.dataset.operationNarrationDisabled === 'lock') button.disabled = false;
                delete button.dataset.operationNarrationDisabled;
            });
        }

        function stopOperationNarration() {
            narrationSequence += 1;
            window.AudioPlayer?.stopNarration?.();
            setNarrationLocked(false);
        }

        function playOperationNarration(key, onFinished = null) {
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
            const narrationKey = STEP_NARRATION[stepName];
            if (!narrationKey) return;
            if (stepName === 'weightings') {
                playOperationNarration(narrationKey, () => {
                    scheduleStepTransition('weightings', 'fast-z', 400);
                });
                return;
            }
            if (stepName === 'hammer') {
                playOperationNarration(narrationKey, () => {
                    if (active && step === 'hammer') playDemo('hammering');
                });
                return;
            }
            playOperationNarration(narrationKey);
        }

        function updateGuideToggle() {
            guideButton.setAttribute('aria-pressed', guideMode ? 'true' : 'false');
            guideButton.title = guideMode ? 'Turn Guide Me off' : 'Turn Guide Me on';
            document.body.classList.toggle('operation-guide-active', active && guideMode);
        }

        function guideTarget(state = window.getMainFSMState?.()) {
            if (step === 'open') return state?.menu?.selectedIndex === 1 ? '.nav__btn--enter' : '.nav__btn--down';
            if (step === 'fast-z') return state?.slm?.timeConstant !== 'F' ? '.soft-key--2' : state?.slm?.weighting !== 'Z' ? '.soft-key--3' : null;
            if (step === 'slow-a') return state?.slm?.timeConstant !== 'S' ? '.soft-key--2' : state?.slm?.weighting !== 'R' ? '.soft-key--3' : null;
            return actions.querySelector('button') ? '#training-operation-actions button' : null;
        }

        function syncGuideHighlight(state) {
            clearHighlights();
            if (!active || !guideMode || narrationLocked) return;
            const selector = guideTarget(state);
            const target = selector ? document.querySelector(selector) : null;
            if (!target) return;
            target.classList.add('operation-highlight', 'walkthrough-highlight');
        }

        function renderProgress() {
            const currentIndex = STEP_ORDER.indexOf(step);
            section.querySelectorAll('[data-operation-progress]').forEach((item) => {
                const itemIndex = STEP_ORDER.indexOf(item.dataset.operationProgress);
                item.classList.toggle('is-current', itemIndex === currentIndex);
                item.classList.toggle('is-complete', itemIndex < currentIndex || step === 'complete');
            });
        }

        function renderActions() {
            actions.innerHTML = '';
            let buttons = [];
            if (step === 'hammer' || step === 'fan') buttons = [['replay', 'Replay'], ['continue', 'Continue']];
            if (step === 'complete') buttons = [['surveys', 'Begin Surveys']];
            buttons.forEach(([action, label]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.operationAction = action;
                button.textContent = label;
                actions.appendChild(button);
            });
            actions.hidden = buttons.length === 0;
        }

        function setFeedback(message, success = false) {
            feedback.textContent = message || '';
            feedback.classList.toggle('is-success', Boolean(message && success));
        }

        function stopDemo() {
            window.AudioPlayer?.stop?.();
            document.body.classList.remove('operation-demo-active');
        }

        function playDemo(preset) {
            document.body.classList.add('operation-demo-active');
            window.AudioPlayer?.playPreset?.(preset, true, true, false);
        }

        function scheduleStepTransition(expectedStep, nextStep, delay = 850) {
            if (!active || step !== expectedStep || transitionTimer) return;
            transitionTimer = window.setTimeout(() => {
                transitionTimer = 0;
                if (active && step === expectedStep) renderStep(nextStep);
            }, delay);
        }

        function renderStep(nextStep) {
            window.clearTimeout(transitionTimer);
            transitionTimer = 0;
            if (step === 'hammer' || step === 'fan') stopDemo();
            stopOperationNarration();
            step = nextStep;
            const copy = COPY[step];
            title.textContent = copy.title;
            instruction.textContent = copy.instruction;
            details.innerHTML = copy.details || '';
            details.hidden = !copy.details;
            prompt.textContent = copy.prompt || '';
            prompt.hidden = !copy.prompt;
            status.textContent = step === 'complete' ? '7 of 7 complete' : `Step ${STEP_ORDER.indexOf(step) + 1} of ${STEP_ORDER.length}`;
            setFeedback('');
            renderActions();
            renderProgress();
            if (step === 'fan') playDemo('fan');
            playStepNarration(step);
            syncGuideHighlight();
        }

        function renderActiveNavigation() {
            sectionButtons.forEach((button) => {
                const selected = button === operationButton;
                button.classList.toggle('is-active', selected);
                if (selected) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
            });
        }

        function resetOperationDevice() {
            window.AudioPlayer?.stop?.();
            window.hideWalkthroughPanel?.();
            window.resetWalkthrough?.();
            window.clearWalkthroughHighlights?.();
            const initializeAtHome = () => {
                if (!active) return;
                if (typeof window.initMainFSM !== 'function' || !window.Config) {
                    deviceReadyTimer = window.setTimeout(initializeAtHome, 100);
                    return;
                }
                const previous = window.Config.START_AT_HOME;
                window.Config.START_AT_HOME = true;
                window.initMainFSM();
                window.Config.START_AT_HOME = previous;
            };
            window.clearTimeout(deviceReadyTimer);
            initializeAtHome();
        }

        function enterOperation(useGuide = false) {
            window.hideTrainingOverview?.();
            window.hideTrainingResources?.();
            window.leaveSetupSection?.();
            window.leaveCalibrationSection?.();
            active = true;
            guideMode = Boolean(useGuide);
            document.body.classList.add('operation-active', 'hide-dosimeter');
            section.setAttribute('aria-hidden', 'false');
            renderActiveNavigation();
            updateGuideToggle();
            resetOperationDevice();
            renderStep('open');
            scheduleMeterLayout();
        }

        function leaveOperation() {
            if (!active) return;
            active = false;
            guideMode = false;
            window.clearTimeout(deviceReadyTimer);
            window.clearTimeout(transitionTimer);
            layoutTimers.forEach((timer) => window.clearTimeout(timer));
            layoutTimers = [];
            stopDemo();
            stopOperationNarration();
            clearHighlights();
            document.body.classList.remove('operation-active', 'operation-guide-active', 'hide-dosimeter');
            section.setAttribute('aria-hidden', 'true');
            updateGuideToggle();
        }

        function handleState(state) {
            if (!active || !state) return;
            if (narrationLocked) {
                syncGuideHighlight(state);
                return;
            }
            if (step === 'open' && isSlmView(state)) {
                renderStep('weightings');
                setFeedback('Current Study is open.', true);
                return;
            }
            if (step === 'fast-z') {
                if (state.slm?.timeConstant === 'F' && state.slm?.weighting === 'Z') {
                    setFeedback('Fast response and Z weighting are selected.', true);
                    scheduleStepTransition('fast-z', 'hammer');
                } else if (state.slm?.timeConstant === 'F') {
                    setFeedback('Fast response is selected. Now select Z weighting.', true);
                }
            }
            if (step === 'slow-a') {
                if (state.slm?.timeConstant === 'S' && state.slm?.weighting === 'R') {
                    setFeedback('Slow response and A weighting are selected.', true);
                    scheduleStepTransition('slow-a', 'fan');
                } else if (state.slm?.timeConstant === 'S') {
                    setFeedback('Slow response is selected. Now select A weighting.', true);
                }
            }
            syncGuideHighlight(state);
        }

        function bindStateSubscription() {
            if (unsubscribe || typeof window.subscribeMainFSM !== 'function') {
                if (!unsubscribe) subscribeTimer = window.setTimeout(bindStateSubscription, 100);
                return;
            }
            unsubscribe = window.subscribeMainFSM(handleState);
        }

        operationButton.addEventListener('click', () => enterOperation(false));
        guideButton.addEventListener('click', () => {
            if (active) {
                guideMode = !guideMode;
                updateGuideToggle();
                syncGuideHighlight();
            } else if (operationButton.classList.contains('is-active')) enterOperation(true);
            window.setTimeout(renderActiveNavigation, 0);
        });
        sectionButtons.forEach((button) => {
            if (button === operationButton || button === guideButton) return;
            button.addEventListener('click', leaveOperation);
        });
        actions.addEventListener('click', (event) => {
            const button = event.target.closest('[data-operation-action]');
            if (!button || !active || narrationLocked) return;
            const action = button.dataset.operationAction;
            if ((step === 'hammer' || step === 'fan') && action === 'replay') playDemo(step === 'hammer' ? 'hammering' : 'fan');
            else if (step === 'hammer' && action === 'continue') renderStep('slow-a');
            else if (step === 'fan' && action === 'continue') renderStep('complete');
            else if (step === 'complete' && action === 'surveys') surveysButton?.click();
        });
        document.addEventListener('pointerdown', (event) => {
            if (active && narrationLocked && event.target.closest('.soft-key, .nav__btn, .fn-btn, #training-operation button')) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (!active || (step !== 'fast-z' && step !== 'slow-a')) return;
            const key = event.target.closest('.soft-key--2, .soft-key--3');
            if (!key) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            window.dispatch?.({ type: key.matches('.soft-key--2') ? 'SOFT2' : 'SOFT3' });
        }, true);
        document.addEventListener('click', (event) => {
            if (!active || !narrationLocked) return;
            if (!event.target.closest('.soft-key, .nav__btn, .fn-btn, #training-operation button')) return;
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);
        document.addEventListener('keydown', (event) => {
            if (!active || !narrationLocked) return;
            const hardwareKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', '1', '2', '3', '4', 'f', 'F', 's', 'S']);
            if (!hardwareKeys.has(event.key)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
        }, true);

        window.addEventListener('walkthrough-narration-start', (event) => {
            if (active && OPERATION_NARRATION_URLS.has(event.detail?.url)) setNarrationLocked(true);
        });
        const releaseNarrationLock = (event) => {
            if (!active || !OPERATION_NARRATION_URLS.has(event.detail?.url)) return;
            setNarrationLocked(false);
            syncGuideHighlight();
            handleState(window.getMainFSMState?.());
        };
        window.addEventListener('walkthrough-narration-end', releaseNarrationLock);
        window.addEventListener('walkthrough-narration-unavailable', releaseNarrationLock);

        window.isOperationSectionActive = () => active;
        window.isOperationGuideMode = () => active && guideMode;
        window.leaveOperationSection = leaveOperation;
        window.addEventListener('resize', () => {
            if (active) layoutMeterLikeSetup(true);
        });
        window.addEventListener('pagehide', () => {
            window.clearTimeout(subscribeTimer);
            window.clearTimeout(deviceReadyTimer);
            window.clearTimeout(transitionTimer);
            unsubscribe?.();
        }, { once: true });
        bindStateSubscription();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeOperationSection);
    else initializeOperationSection();
})();
