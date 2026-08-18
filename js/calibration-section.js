(() => {
    'use strict';

    const STEP_ORDER = ['open', 'start', 'windscreen', 'calibrator', 'place', 'finish', 'remove', 'exit'];
    const COMBINED_REFERENCE = {
        meterWidth: 2549,
        meterHeight: 7989,
        calibratorWidth: 1987,
        combinedHeight: 11017,
        overlap: 415,
        calibratorScale: 0.75,
    };
    const COPY = {
        open: {
            title: 'Open Calibration',
            instruction: 'Before taking measurements, pre-calibrate the SLM to verify that it accurately measures sound pressure levels.',
            prompt: 'Press the second soft key under CAL.',
        },
        start: {
            title: 'Start Calibration Mode',
            instruction: 'CALIBRATE is selected. Press ENTER to initiate calibration mode.',
            prompt: 'Use the center ENTER button on the keypad.',
        },
        windscreen: {
            title: 'Remove the Windscreen',
            instruction: 'Drag the black foam windscreen off the sound meter microphone and place it to the side.',
            prompt: 'The calibrator will appear after the microphone is uncovered.',
        },
        calibrator: {
            title: 'Prepare the Calibrator',
            instruction: 'Turn on the calibrator, then verify that it is set to 114 dB and 1000 Hz.',
            prompt: 'Press its power button. The calibrator will generate a tone and display 114 and 1000.',
        },
        place: {
            title: 'Seat the Calibrator',
            instruction: 'Drag the calibrator onto the sound meter microphone until it locks in place.',
            prompt: 'When it is properly seated, select Start to begin calibration.',
        },
        finish: {
            title: 'Hold at 114 dB',
            instruction: 'Wait for the reading to stabilize at 114.0 dB, then press ENTER to save the calibration.',
            prompt: 'The meter records the pre-calibration result and returns to the calibration menu.',
        },
        remove: {
            title: 'Remove the Calibrator',
            instruction: 'Drag the calibrator up and off the sound meter microphone.',
            prompt: 'Place it to the side before leaving the calibration menu.',
        },
        exit: {
            title: 'Return to Start',
            instruction: 'Press the On/Off–Esc button once to exit the calibration menu and return to the START screen.',
            prompt: 'Use a short press. Do not hold the button down.',
        },
        complete: {
            title: 'Calibration Complete',
            instruction: 'The SLM is calibrated and ready to use.',
            prompt: 'Review operational techniques, skip to Scenarios, or choose another topic from the menu.',
        },
    };

    const NARRATION = {
        open: 'assets/audio/calibration-01-open-calibration.mp3',
        start: 'assets/audio/calibration-02-start-calibration-mode.mp3',
        windscreen: 'assets/audio/calibration-03-remove-windscreen.mp3',
        calibrator: 'assets/audio/calibration-04-turn-on-calibrator.mp3',
        verify: 'assets/audio/calibration-05-verify-calibrator-settings.mp3',
        settingsIncorrect: 'assets/audio/calibration-06-settings-incorrect.mp3',
        place: 'assets/audio/calibration-07-seat-calibrator.mp3',
        run: 'assets/audio/calibration-08-start-calibration.mp3',
        save: 'assets/audio/calibration-09-save-calibration.mp3',
        remove: 'assets/audio/calibration-10-remove-calibrator.mp3',
        exit: 'assets/audio/calibration-11-exit-calibration.mp3',
        complete: 'assets/audio/calibration-12-complete.mp3',
    };

    const STEP_NARRATION = {
        open: 'open',
        start: 'start',
        windscreen: 'windscreen',
        calibrator: 'calibrator',
        place: 'place',
        finish: 'run',
        remove: 'remove',
        exit: 'exit',
        complete: 'complete',
    };

    const CALIBRATION_NARRATION_URLS = new Set(Object.values(NARRATION));

    function initializeCalibrationSection() {
        const section = document.getElementById('training-calibration');
        const title = document.getElementById('training-calibration-title');
        const instruction = document.getElementById('training-calibration-instruction');
        const prompt = document.getElementById('training-calibration-prompt');
        const actions = document.getElementById('training-calibration-actions');
        const feedback = document.getElementById('training-calibration-feedback');
        const status = document.getElementById('training-calibration-status');
        const calibrationButton = document.querySelector('.course-nav__item[data-section="Calibration"]');
        const guideButton = document.querySelector('.course-nav__item[data-section="Guide Me"]');
        const scenariosButton = document.querySelector('.course-nav__item[data-section="Scenarios"]');
        const operationButton = document.querySelector('.course-nav__item[data-section="Operation"]');
        const sectionButtons = [...document.querySelectorAll('.course-nav__item[data-section]')];
        const stage = document.getElementById('device-stage');

        if (!section || !title || !instruction || !prompt || !actions || !feedback || !status || !calibrationButton || !guideButton || !stage) return;

        let active = false;
        let guideMode = false;
        let step = 'open';
        let unsubscribe = null;
        let subscribeTimer = 0;
        let calibratorPoll = 0;
        let rampRunning = false;
        let deviceReadyTimer = 0;
        let layoutTimers = [];
        let windscreen = null;
        let windscreenPointerId = null;
        let windscreenStart = null;
        let windscreenRemoved = false;
        let calibratorWasSnapped = false;
        let seatingClickPlayed = false;
        let calibratorDrag = null;
        let narrationLocked = false;
        let narrationSequence = 0;
        let windscreenTrackFrame = 0;

        function ensureWindscreen() {
            if (windscreen?.isConnected) return windscreen;
            windscreen = document.createElement('button');
            windscreen.type = 'button';
            windscreen.className = 'calibration-windscreen';
            windscreen.setAttribute('aria-label', 'Microphone windscreen. Drag to remove.');
            windscreen.hidden = true;
            stage.appendChild(windscreen);
            return windscreen;
        }

        function positionWindscreen() {
            const deviceFrame = document.querySelector('.device-frame');
            const screen = ensureWindscreen();
            if (!deviceFrame || screen.hidden || screen.classList.contains('is-dragging') || windscreenRemoved) return;
            const stageRect = stage.getBoundingClientRect();
            const deviceRect = deviceFrame.getBoundingClientRect();
            const size = Math.max(48, Math.min(92, deviceRect.width * 0.24));
            screen.style.width = `${size}px`;
            screen.style.height = `${size}px`;
            screen.style.left = `${deviceRect.left - stageRect.left + (deviceRect.width / 2) - (size / 2)}px`;
            screen.style.top = `${deviceRect.top - stageRect.top - (size * 0.08)}px`;
        }

        function resetWindscreen() {
            const screen = ensureWindscreen();
            windscreenRemoved = false;
            windscreenPointerId = null;
            windscreenStart = null;
            screen.hidden = true;
            screen.classList.remove('is-dragging', 'is-removed', 'walkthrough-highlight');
            screen.style.removeProperty('transform');
        }

        function showWindscreen() {
            const screen = ensureWindscreen();
            screen.hidden = false;
            screen.classList.remove('is-removed');
            positionWindscreen();
        }

        function showFullCalibrationDevice(instant = false) {
            const deviceFrame = document.querySelector('.device-frame');
            if (!deviceFrame) return;
            deviceFrame.style.transformOrigin = 'center center';
            deviceFrame.style.transition = instant
                ? 'transform 0s'
                : 'transform 800ms cubic-bezier(0.22, 0.76, 0.25, 1)';
            deviceFrame.style.transform = 'translate(0px, 0px) scale(1)';

            window.cancelAnimationFrame(windscreenTrackFrame);
            const trackUntil = performance.now() + (instant ? 40 : 860);
            const trackWindscreen = () => {
                if (!active || step !== 'windscreen') return;
                positionWindscreen();
                if (performance.now() < trackUntil) windscreenTrackFrame = window.requestAnimationFrame(trackWindscreen);
            };
            windscreenTrackFrame = window.requestAnimationFrame(trackWindscreen);
        }

        function positionCalibratorBesideFullDevice(instant = true) {
            const deviceFrame = document.querySelector('.device-frame');
            const calibrator = document.querySelector('.dosimeter-container');
            if (!deviceFrame || !calibrator || calibrator.dataset.snapped === 'true') return;
            const stageRect = stage.getBoundingClientRect();
            const deviceRect = deviceFrame.getBoundingClientRect();
            const calibratorWidth = Math.max(calibrator.offsetWidth, 120);
            const calibratorHeight = Math.max(calibrator.offsetHeight, 220);
            const desiredLeft = deviceRect.right - stageRect.left + 24;
            const maxLeft = stageRect.width - calibratorWidth - 18;
            const desiredTop = deviceRect.top - stageRect.top + (deviceRect.height * 0.24);
            const maxTop = stageRect.height - calibratorHeight - 18;

            calibrator.style.removeProperty('width');
            calibrator.style.transform = 'translate(0px, 0px) scale(1)';
            calibrator.style.transition = instant ? 'none' : 'left 500ms ease, top 500ms ease';
            calibrator.style.left = `${Math.max(14, Math.min(desiredLeft, maxLeft))}px`;
            calibrator.style.top = `${Math.max(14, Math.min(desiredTop, maxTop))}px`;
            calibrator.dataset.snapped = 'false';
            calibrator.dataset.snapPoint = '';
        }

        function hideCalibrator() {
            const calibrator = document.querySelector('.dosimeter-container');
            if (calibrator) calibrator.classList.add('calibration-calibrator-hidden');
        }

        function revealCalibrator() {
            const calibrator = document.querySelector('.dosimeter-container');
            if (calibrator) calibrator.classList.remove('calibration-calibrator-hidden');
        }

        function playSeatingClick() {
            if (seatingClickPlayed) return;
            seatingClickPlayed = true;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                const context = new AudioContextClass();
                const oscillator = context.createOscillator();
                const gain = context.createGain();
                const now = context.currentTime;
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(620, now);
                oscillator.frequency.exponentialRampToValueAtTime(170, now + 0.055);
                gain.gain.setValueAtTime(0.045, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
                oscillator.connect(gain);
                gain.connect(context.destination);
                oscillator.start(now);
                oscillator.stop(now + 0.065);
                oscillator.addEventListener('ended', () => context.close(), { once: true });
            } catch (error) {
                // The visual seating confirmation still works if audio is unavailable.
            }
        }

        function layoutCalibrationStage(instant = true) {
            const deviceFrame = document.querySelector('.device-frame');
            const calibrator = document.querySelector('.dosimeter-container');
            if (!deviceFrame || !calibrator) return;

            document.body.classList.remove('hide-dosimeter');
            if (calibrator.dataset.snapped !== 'true') calibrator.style.removeProperty('width');
            calibrator.style.transform = 'translate(0px, 0px) scale(1)';
            const calibratorPhoto = calibrator.querySelector('.dosimeter-photo');
            if (calibratorPhoto) {
                calibratorPhoto.style.transform = 'none';
                calibratorPhoto.style.opacity = '1';
            }

            deviceFrame.style.transformOrigin = 'center center';
            deviceFrame.style.transition = instant ? 'transform 0s' : 'transform 700ms cubic-bezier(0.22, 0.76, 0.25, 1)';
            deviceFrame.style.transform = 'translate(0px, 0px) scale(1)';

            const baseDeviceRect = deviceFrame.getBoundingClientRect();
            const devicePhoto = deviceFrame.querySelector('.device-photo');
            const lcd = deviceFrame.querySelector('.lcd');
            const photoRect = devicePhoto?.getBoundingClientRect() || baseDeviceRect;
            const lcdRect = lcd?.getBoundingClientRect() || photoRect;
            const deviceCenterX = photoRect.left + photoRect.width / 2;
            const deviceCenterY = photoRect.top + photoRect.height / 2;
            const focusTop = Math.max(photoRect.top, lcdRect.top - 36);
            const focusBottom = photoRect.bottom;
            const focusCenterY = (focusTop + focusBottom) / 2;
            const focusHeight = Math.max(1, focusBottom - focusTop);
            const setupScale = Math.min(2.3, Math.max(1.55, (window.innerHeight * 0.86) / focusHeight));
            // Match the fixed Setup/Operation viewport anchor. Calibration's
            // wider card and calibrator artwork must not move the SLM itself.
            const targetCenterX = window.innerWidth * 0.7625;
            const targetCenterY = window.innerHeight / 2;
            const deviceShiftX = targetCenterX - deviceCenterX;
            const deviceShiftY = targetCenterY - deviceCenterY - ((focusCenterY - deviceCenterY) * setupScale);
            deviceFrame.dataset.calibrationShiftX = String(deviceShiftX);
            deviceFrame.style.transform = `translate(${deviceShiftX}px, ${deviceShiftY}px) scale(${setupScale})`;

            window.requestAnimationFrame(() => {
                if (!active) return;
                positionWindscreen();
                if (calibrator.dataset.snapped === 'true') return;
                const stageRect = stage.getBoundingClientRect();
                const deviceRect = deviceFrame.getBoundingClientRect();
                const calibratorWidth = Math.max(calibrator.offsetWidth, 120);
                const calibratorHeight = Math.max(calibrator.offsetHeight, 220);
                const desiredLeft = deviceRect.right - stageRect.left + 24;
                const maxLeft = stageRect.width - calibratorWidth - 18;
                const desiredTop = deviceRect.top - stageRect.top + (deviceRect.height * 0.28);
                const maxTop = stageRect.height - calibratorHeight - 18;

                calibrator.style.transition = instant ? 'none' : 'left 500ms ease, top 500ms ease';
                calibrator.style.left = `${Math.max(14, Math.min(desiredLeft, maxLeft))}px`;
                calibrator.style.top = `${Math.max(14, Math.min(desiredTop, maxTop))}px`;
                calibrator.dataset.snapped = 'false';
                calibrator.dataset.snapPoint = '';
            });
        }

        function getCalibrationSnapPosition() {
            const deviceFrame = document.querySelector('.device-frame');
            const calibrator = document.querySelector('.dosimeter-container');
            if (!deviceFrame || !calibrator) return null;
            const stageRect = stage.getBoundingClientRect();
            const deviceRect = deviceFrame.getBoundingClientRect();
            const calibratorWidth = deviceRect.width
                * (COMBINED_REFERENCE.calibratorWidth / COMBINED_REFERENCE.meterWidth)
                * COMBINED_REFERENCE.calibratorScale;
            const targetBottom = deviceRect.top + (deviceRect.height * (COMBINED_REFERENCE.overlap / COMBINED_REFERENCE.meterHeight));
            return {
                left: deviceRect.left - stageRect.left + (deviceRect.width / 2) - (calibratorWidth / 2),
                calibratorWidth,
                targetX: deviceRect.left + (deviceRect.width / 2),
                targetY: targetBottom,
            };
        }

        function fitCombinedAssembly() {
            const deviceFrame = document.querySelector('.device-frame');
            if (!deviceFrame) return;
            const stageRect = stage.getBoundingClientRect();
            const shiftX = Number(deviceFrame.dataset.calibrationShiftX || 0);
            deviceFrame.style.transition = 'transform 0s';
            deviceFrame.style.transform = `translate(${shiftX}px, 0px) scale(1)`;
            void deviceFrame.offsetHeight;
            const currentRect = deviceFrame.getBoundingClientRect();
            const assemblyRatio = 1 + (
                ((COMBINED_REFERENCE.combinedHeight - COMBINED_REFERENCE.meterHeight) / COMBINED_REFERENCE.meterHeight)
                * COMBINED_REFERENCE.calibratorScale
            );
            const availableHeight = Math.max(420, stageRect.height - 48);
            const scale = Math.min(1, availableHeight / (currentRect.height * assemblyRatio));
            const scaledMeterHeight = currentRect.height * scale;
            const extraAbove = scaledMeterHeight * ((COMBINED_REFERENCE.combinedHeight - COMBINED_REFERENCE.meterHeight) / COMBINED_REFERENCE.meterHeight);
            const scaledTopWithoutShift = currentRect.top + ((currentRect.height - scaledMeterHeight) / 2);
            const desiredMeterTop = stageRect.top + 24 + extraAbove;
            const shiftY = desiredMeterTop - scaledTopWithoutShift;
            // Apply the fitted meter geometry before measuring the calibrator.
            // Measuring during a transform transition uses an in-between size
            // and produces an oversized, off-screen calibrator.
            deviceFrame.style.transition = 'transform 0s';
            deviceFrame.style.transform = `translate(${shiftX}px, ${shiftY}px) scale(${scale})`;
            void deviceFrame.offsetHeight;
        }

        function seatCalibrator() {
            const calibrator = document.querySelector('.dosimeter-container');
            if (!calibrator) return false;
            fitCombinedAssembly();
            window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
                const snap = getCalibrationSnapPosition();
                if (!snap) return;
                calibrator.style.transition = 'left 420ms ease, top 420ms ease, width 420ms ease';
                calibrator.style.width = `${snap.calibratorWidth}px`;
                calibrator.style.transformOrigin = 'center bottom';
                calibrator.style.transform = 'none';
                const renderedHeight = calibrator.offsetHeight;
                calibrator.style.left = `${snap.left}px`;
                calibrator.style.top = `${snap.targetY - stage.getBoundingClientRect().top - renderedHeight}px`;
            }));
            calibrator.dataset.snapped = 'true';
            calibrator.dataset.snapPoint = 'mic';
            window.setTimeout(() => {
                if (calibrator.dataset.snapped === 'true') calibrator.style.transition = '';
            }, 480);
            return true;
        }

        function beginCalibrationCalibratorDrag(event) {
            if (!active || narrationLocked || (step !== 'place' && step !== 'remove')) return;
            const calibrator = document.querySelector('.dosimeter-container');
            if (!calibrator) return;
            const rect = calibrator.getBoundingClientRect();
            const stageRect = stage.getBoundingClientRect();
            calibratorDrag = {
                pointerId: event.pointerId,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                stageLeft: stageRect.left,
                stageTop: stageRect.top,
                removing: step === 'remove',
            };
            try {
                calibrator.setPointerCapture?.(event.pointerId);
            } catch (error) {
                // Pointer capture is optional; document-level movement still completes the drag.
            }
            calibrator.classList.add('is-calibration-dragging');
            calibrator.style.transition = 'none';
            calibrator.style.transformOrigin = 'center center';
            calibrator.style.transform = 'scale(1)';
            if (!calibratorDrag.removing) {
                calibrator.dataset.snapped = 'false';
                calibrator.dataset.snapPoint = '';
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        function moveCalibrationCalibrator(event) {
            if (!calibratorDrag || event.pointerId !== calibratorDrag.pointerId) return;
            const calibrator = document.querySelector('.dosimeter-container');
            if (!calibrator) return;
            calibrator.style.left = `${event.clientX - calibratorDrag.stageLeft - calibratorDrag.offsetX}px`;
            calibrator.style.top = `${event.clientY - calibratorDrag.stageTop - calibratorDrag.offsetY}px`;
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        function endCalibrationCalibratorDrag(event) {
            if (!calibratorDrag || event.pointerId !== calibratorDrag.pointerId) return;
            const calibrator = document.querySelector('.dosimeter-container');
            const wasRemoval = calibratorDrag.removing;
            calibratorDrag = null;
            calibrator?.classList.remove('is-calibration-dragging');
            if (!calibrator) return;

            if (wasRemoval) {
                calibrator.dataset.snapped = 'false';
                calibrator.dataset.snapPoint = '';
            } else {
                const snap = getCalibrationSnapPosition();
                const rect = calibrator.getBoundingClientRect();
                const bottomX = rect.left + (rect.width / 2);
                const bottomY = rect.bottom;
                const distance = snap ? Math.hypot(bottomX - snap.targetX, bottomY - snap.targetY) : Infinity;
                if (distance <= Math.max(260, rect.height * 1.1)) seatCalibrator();
                else {
                    calibrator.dataset.snapped = 'false';
                    calibrator.dataset.snapPoint = '';
                }
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        function scheduleCalibrationLayout() {
            layoutTimers.forEach((timer) => window.clearTimeout(timer));
            layoutTimers = [120, 480, 980].map((delay) => window.setTimeout(() => {
                if (!active) return;
                layoutCalibrationStage(true);
            }, delay));
        }

        function setNarrationLocked(locked) {
            narrationLocked = Boolean(locked) && active;
            document.body.classList.toggle('calibration-narration-locked', narrationLocked);
            section.setAttribute('aria-busy', String(narrationLocked));
            section.querySelectorAll('button').forEach((button) => {
                if (narrationLocked) {
                    if (!button.dataset.calibrationNarrationDisabled) {
                        button.dataset.calibrationNarrationDisabled = button.disabled ? 'preserve' : 'lock';
                    }
                    button.disabled = true;
                    return;
                }
                if (button.dataset.calibrationNarrationDisabled === 'lock') button.disabled = false;
                delete button.dataset.calibrationNarrationDisabled;
            });
        }

        function stopCalibrationNarration() {
            narrationSequence += 1;
            window.AudioPlayer?.stopNarration?.();
            setNarrationLocked(false);
        }

        function playNarration(key, onFinished = null) {
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

        function setFeedback(message, success = false) {
            feedback.textContent = message || '';
            feedback.classList.toggle('is-success', Boolean(message && success));
        }

        function clearHighlights() {
            window.setWalkthroughHighlight?.('.soft-key--2', false);
            window.setWalkthroughHighlight?.('.nav__btn--enter', false);
            window.setWalkthroughHighlight?.('.dosimeter-btn--power', false);
            window.setWalkthroughHighlight?.('.dosimeter-container', false);
            window.setWalkthroughHighlight?.('.fn-btn--power', false);
            windscreen?.classList.remove('walkthrough-highlight');
            actions.querySelectorAll('.walkthrough-highlight').forEach((el) => el.classList.remove('walkthrough-highlight'));
        }

        function updateGuideToggle() {
            const enabled = active && guideMode;
            guideButton.classList.toggle('is-guide-enabled', enabled);
            guideButton.setAttribute('aria-pressed', String(enabled));
            guideButton.setAttribute('title', enabled ? 'Turn Guide Me off' : 'Turn Guide Me on');
        }

        function syncGuideHighlight() {
            clearHighlights();
            updateGuideToggle();
            if (!active || !guideMode) return;
            window.flushWalkthroughGuidance?.();
            document.body.classList.remove('walkthrough-guidance-pending');
            if (step === 'open') window.setWalkthroughHighlight?.('.soft-key--2', true);
            if (step === 'start' || step === 'finish') window.setWalkthroughHighlight?.('.nav__btn--enter', true);
            if (step === 'windscreen') windscreen?.classList.add('walkthrough-highlight');
            if (step === 'calibrator') {
                const audioState = window.AudioPlayer?.getState?.();
                const calibratorOn = audioState?.isPlaying && audioState.currentPresetName === 'calibration';
                if (!calibratorOn) window.setWalkthroughHighlight?.('.dosimeter-btn--power', true);
                else actions.querySelector('[data-calibration-action="good"]')?.classList.add('walkthrough-highlight');
            }
            if (step === 'place') {
                const snapped = document.querySelector('.dosimeter-container')?.dataset.snapped === 'true';
                if (!snapped) window.setWalkthroughHighlight?.('.dosimeter-container', true);
                else actions.querySelector('[data-calibration-action="run"]')?.classList.add('walkthrough-highlight');
            }
            if (step === 'remove') window.setWalkthroughHighlight?.('.dosimeter-container', true);
            if (step === 'exit') window.setWalkthroughHighlight?.('.fn-btn--power', true);
        }

        function setGuideMode(enabled) {
            guideMode = Boolean(enabled) && active;
            document.body.classList.toggle('calibration-guide-active', guideMode);
            syncGuideHighlight();
        }

        function updateProgress() {
            const currentIndex = step === 'complete' ? STEP_ORDER.length : STEP_ORDER.indexOf(step);
            section.querySelectorAll('[data-calibration-progress]').forEach((item, index) => {
                item.classList.toggle('is-current', index === currentIndex);
                item.classList.toggle('is-complete', index < currentIndex || step === 'complete');
            });
        }

        function renderActions() {
            actions.replaceChildren();
            actions.hidden = true;
            if (step === 'calibrator') {
                actions.hidden = false;
                actions.innerHTML = '<p>Does the calibrator display show 114 dB and 1000 Hz?</p><div class="training-calibration__action-row"><button type="button" data-calibration-action="good">Yes</button><button type="button" data-calibration-action="not-good">No</button></div>';
            }
            if (step === 'place') {
                actions.hidden = false;
                const runButton = document.createElement('button');
                runButton.type = 'button';
                runButton.dataset.calibrationAction = 'run';
                runButton.textContent = 'Start';
                runButton.disabled = document.querySelector('.dosimeter-container')?.dataset.snapped !== 'true';
                actions.append(runButton);
            }
            if (step === 'complete') {
                actions.hidden = false;
                actions.innerHTML = '<div class="training-calibration__completion-actions"><button type="button" data-calibration-action="operation">Review Operation</button><button type="button" data-calibration-action="scenarios">Skip to Scenarios</button></div>';
            }
        }

        function renderStep(nextStep, narrationKey = STEP_NARRATION[nextStep]) {
            if (!COPY[nextStep]) return;
            step = nextStep;
            const copy = COPY[step];
            title.textContent = copy.title;
            instruction.textContent = copy.instruction;
            prompt.textContent = copy.prompt;
            prompt.hidden = !copy.prompt;
            status.textContent = step === 'complete' ? '8 of 8 complete' : `Step ${STEP_ORDER.indexOf(step) + 1} of ${STEP_ORDER.length}`;
            setFeedback('');
            renderActions();
            updateProgress();
            if (step === 'open' || step === 'start') {
                hideCalibrator();
            } else if (step === 'windscreen') {
                hideCalibrator();
                showWindscreen();
                showFullCalibrationDevice(false);
            } else if (step === 'calibrator' || step === 'place' || step === 'finish' || step === 'remove') {
                revealCalibrator();
            } else if (step === 'exit' || step === 'complete') {
                hideCalibrator();
            }
            if (step !== 'windscreen') windscreen.hidden = true;
            syncGuideHighlight();
            if (narrationKey) playNarration(narrationKey);
            if (step === 'start') {
                window.setTimeout(() => layoutCalibrationStage(true), 120);
            } else if (step === 'calibrator' || step === 'place') {
                window.setTimeout(() => {
                    showFullCalibrationDevice(true);
                    positionCalibratorBesideFullDevice(true);
                }, 120);
            } else if (step === 'exit' || step === 'complete') {
                window.setTimeout(() => showFullCalibrationDevice(false), 120);
            }
        }

        function renderActiveNavigation() {
            sectionButtons.forEach((button) => {
                const isCalibration = button === calibrationButton;
                button.classList.toggle('is-active', isCalibration);
                if (isCalibration) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
            });
        }

        function resetCalibrationDevice() {
            stopCalibrationNarration();
            window.AudioPlayer?.stop?.();
            window.hideWalkthroughPanel?.();
            window.resetWalkthrough?.();
            window.clearWalkthroughHighlights?.();
            window.finishWalkthroughCalibrationCleanup?.();
            resetWindscreen();
            revealCalibrator();
            calibratorWasSnapped = false;
            seatingClickPlayed = false;
            const initializeAtHome = () => {
                if (!active) return;
                if (typeof window.initMainFSM !== 'function' || !window.Config) {
                    deviceReadyTimer = window.setTimeout(initializeAtHome, 100);
                    return;
                }
                const previousStartAtHome = window.Config.START_AT_HOME;
                window.Config.START_AT_HOME = true;
                window.initMainFSM();
                window.Config.START_AT_HOME = previousStartAtHome;
            };
            window.clearTimeout(deviceReadyTimer);
            layoutTimers.forEach((timer) => window.clearTimeout(timer));
            layoutTimers = [];
            initializeAtHome();
        }

        function enterCalibration(useGuide = false) {
            window.hideTrainingOverview?.();
            window.hideTrainingResources?.();
            active = true;
            guideMode = Boolean(useGuide);
            rampRunning = false;
            document.body.classList.add('calibration-active');
            document.body.classList.remove('hide-dosimeter');
            document.body.classList.toggle('calibration-guide-active', guideMode);
            section.setAttribute('aria-hidden', 'false');
            renderActiveNavigation();
            resetCalibrationDevice();
            renderStep('open');
            updateGuideToggle();
            scheduleCalibrationLayout();
        }

        function leaveCalibration() {
            if (!active) return;
            active = false;
            guideMode = false;
            rampRunning = false;
            stopCalibrationNarration();
            window.clearTimeout(deviceReadyTimer);
            layoutTimers.forEach((timer) => window.clearTimeout(timer));
            layoutTimers = [];
            document.body.classList.remove('calibration-active', 'calibration-guide-active');
            section.setAttribute('aria-hidden', 'true');
            clearHighlights();
            resetWindscreen();
            revealCalibrator();
            updateGuideToggle();
        }

        function handleState(state) {
            if (!active || !state) return;
            if (step === 'open' && state.viewId === 'cal_menu') renderStep('start');
            if (step === 'start' && state.viewId === 'cal_running') renderStep('windscreen');
            if (step === 'finish' && !rampRunning && state.viewId === 'cal_menu') {
                renderStep('remove');
                setFeedback('Calibration saved. Remove the calibrator from the microphone.', true);
            }
            if (step === 'exit' && (state.viewId === 'home' || state.viewId === 'home_screen')) {
                renderStep('complete');
                setFeedback('Calibration is complete. The SLM is ready to use.', true);
            }
        }

        function bindStateSubscription() {
            if (unsubscribe || typeof window.subscribeMainFSM !== 'function') {
                if (!unsubscribe) subscribeTimer = window.setTimeout(bindStateSubscription, 100);
                return;
            }
            unsubscribe = window.subscribeMainFSM(handleState);
        }

        function completeWindscreenRemoval() {
            if (!active || step !== 'windscreen' || windscreenRemoved) return;
            windscreenRemoved = true;
            windscreen.classList.remove('is-dragging', 'walkthrough-highlight');
            windscreen.classList.add('is-removed');
            setFeedback('The microphone is uncovered.', true);
            window.setTimeout(() => renderStep('calibrator'), 450);
        }

        function pollCalibrator() {
            if (!active) return;
            const calibrator = document.querySelector('.dosimeter-container');
            const snapped = calibrator?.dataset.snapped === 'true';
            const audioState = window.AudioPlayer?.getState?.();
            const calibratorOn = audioState?.isPlaying && audioState.currentPresetName === 'calibration';

            if (step === 'calibrator' && calibratorOn) {
                const goodButton = actions.querySelector('[data-calibration-action="good"]');
                if (goodButton && goodButton.dataset.ready !== 'true') {
                    goodButton.dataset.ready = 'true';
                    setFeedback('The calibrator is on. Verify its settings to continue.', true);
                    playNarration('verify');
                }
            }
            if (step === 'place') {
                const runButton = actions.querySelector('[data-calibration-action="run"]');
                if (runButton) runButton.disabled = !snapped;
                if (snapped && runButton?.dataset.ready !== 'true') {
                    playSeatingClick();
                    runButton.dataset.ready = 'true';
                    setFeedback('The calibrator is seated on the microphone. Select Start.', true);
                }
            }
            if (step === 'remove') {
                if (calibratorWasSnapped && !snapped) {
                    window.finishWalkthroughCalibrationCleanup?.();
                    renderStep('exit');
                    setFeedback('The calibrator has been removed. Press On/Off–Esc once.', true);
                }
                calibratorWasSnapped = Boolean(snapped);
            } else {
                calibratorWasSnapped = Boolean(snapped);
            }
            syncGuideHighlight();
        }

        calibrationButton.addEventListener('click', () => enterCalibration(false));
        window.openCalibrationSection = (useGuide = false) => enterCalibration(Boolean(useGuide));
        guideButton.addEventListener('click', () => {
            if (active) setGuideMode(!guideMode);
            else if (calibrationButton.classList.contains('is-active')) enterCalibration(true);
            window.setTimeout(renderActiveNavigation, 0);
        });
        sectionButtons.forEach((button) => {
            if (button === calibrationButton || button === guideButton) return;
            button.addEventListener('click', leaveCalibration);
        });

        actions.addEventListener('click', (event) => {
            const button = event.target.closest('[data-calibration-action]');
            if (!button || !active || narrationLocked) return;
            const action = button.dataset.calibrationAction;
            if (step === 'calibrator' && action === 'not-good') {
                setFeedback('Look again. The calibrator display shows 114 dB and 1000 Hz. Select Yes to continue.');
                playNarration('settingsIncorrect');
                return;
            }
            if (step === 'calibrator' && action === 'good') {
                const audioState = window.AudioPlayer?.getState?.();
                const calibratorOn = audioState?.isPlaying && audioState.currentPresetName === 'calibration';
                if (!calibratorOn) {
                    setFeedback('Turn on the calibrator first.');
                    syncGuideHighlight();
                    return;
                }
                renderStep('place');
                seatingClickPlayed = false;
                return;
            }
            if (step === 'place' && action === 'run') {
                const snapped = document.querySelector('.dosimeter-container')?.dataset.snapped === 'true';
                if (!snapped) {
                    setFeedback('Place the calibrator on the microphone before starting.');
                    return;
                }
                rampRunning = true;
                renderStep('finish');
                setFeedback('Calibration is running. Wait for the reading to reach 114.0 dB.', true);
                window.beginWalkthroughCalSPLRamp125To114?.({
                    onComplete: () => {
                        if (!active || step !== 'finish') return;
                        rampRunning = false;
                        setFeedback('The reading is stable at 114.0 dB. Press ENTER to save.', true);
                        playNarration('save');
                        syncGuideHighlight();
                    },
                });
                return;
            }
            if (step === 'complete' && action === 'operation') operationButton?.click();
            if (step === 'complete' && action === 'scenarios') scenariosButton?.click();
        });

        const screen = ensureWindscreen();
        screen.addEventListener('pointerdown', (event) => {
            if (!active || narrationLocked || step !== 'windscreen') return;
            windscreenPointerId = event.pointerId;
            const rect = screen.getBoundingClientRect();
            windscreenStart = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
            screen.setPointerCapture(event.pointerId);
            screen.classList.add('is-dragging');
            event.preventDefault();
        });
        screen.addEventListener('pointermove', (event) => {
            if (event.pointerId !== windscreenPointerId || !windscreenStart) return;
            const stageRect = stage.getBoundingClientRect();
            const dx = event.clientX - windscreenStart.x;
            const dy = event.clientY - windscreenStart.y;
            screen.style.left = `${windscreenStart.left - stageRect.left + dx}px`;
            screen.style.top = `${windscreenStart.top - stageRect.top + dy}px`;
            if (Math.hypot(dx, dy) >= Math.max(72, screen.offsetWidth * 0.9)) completeWindscreenRemoval();
        });
        screen.addEventListener('pointerup', (event) => {
            if (event.pointerId !== windscreenPointerId) return;
            screen.classList.remove('is-dragging');
            windscreenPointerId = null;
            windscreenStart = null;
            if (!windscreenRemoved) positionWindscreen();
        });

        const calibrator = document.querySelector('.dosimeter-container');
        calibrator?.addEventListener('pointerdown', beginCalibrationCalibratorDrag, true);
        calibrator?.addEventListener('pointermove', moveCalibrationCalibrator, true);
        calibrator?.addEventListener('pointerup', endCalibrationCalibratorDrag, true);
        calibrator?.addEventListener('pointercancel', endCalibrationCalibratorDrag, true);
        calibrator?.addEventListener('mousedown', (event) => {
            if (active && (step === 'place' || step === 'remove')) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);

        document.addEventListener('click', (event) => {
            if (!active) return;
            const target = event.target.closest('.soft-key, .nav__btn, .fn-btn');
            if (!target) return;
            if (narrationLocked) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (step === 'open' && target.matches('.soft-key--2')) window.dispatch?.({ type: 'SOFT2' });
            else if (step === 'start' && target.matches('.nav__btn--enter')) window.dispatch?.({ type: 'ENTER' });
            else if (step === 'finish' && !rampRunning && target.matches('.nav__btn--enter')) window.dispatch?.({ type: 'ENTER' });
            else if (step === 'exit' && target.matches('.fn-btn--power')) window.dispatch?.({ type: 'ESC' });
        }, true);

        calibratorPoll = window.setInterval(pollCalibrator, 250);
        window.addEventListener('walkthrough-narration-start', (event) => {
            if (active && CALIBRATION_NARRATION_URLS.has(event.detail?.url)) setNarrationLocked(true);
        });
        const releaseNarrationLock = (event) => {
            if (active && CALIBRATION_NARRATION_URLS.has(event.detail?.url)) setNarrationLocked(false);
        };
        window.addEventListener('walkthrough-narration-end', releaseNarrationLock);
        window.addEventListener('walkthrough-narration-unavailable', releaseNarrationLock);
        window.addEventListener('resize', () => {
            if (!active) return;
            if (step === 'open' || step === 'start') {
                layoutCalibrationStage(true);
                return;
            }
            if (step === 'windscreen') {
                showFullCalibrationDevice(true);
                return;
            }
            if (step === 'calibrator' || step === 'place') {
                showFullCalibrationDevice(true);
                positionCalibratorBesideFullDevice(true);
                return;
            }
            if (document.querySelector('.dosimeter-container')?.dataset.snapped === 'true') {
                seatCalibrator();
                return;
            }
            showFullCalibrationDevice(true);
        });
        window.isCalibrationSectionActive = () => active;
        window.isCalibrationGuideMode = () => active && guideMode;
        window.leaveCalibrationSection = leaveCalibration;
        window.addEventListener('pagehide', () => {
            window.clearTimeout(subscribeTimer);
            window.clearTimeout(deviceReadyTimer);
            window.clearInterval(calibratorPoll);
            window.cancelAnimationFrame(windscreenTrackFrame);
            unsubscribe?.();
        }, { once: true });

        bindStateSubscription();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeCalibrationSection);
    else initializeCalibrationSection();
})();
