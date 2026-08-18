(() => {
    'use strict';

    function initializeOverview() {
        const overview = document.getElementById('training-overview');
        const narration = document.getElementById('training-overview-audio');
        const narrationTwo = document.getElementById('training-overview-audio-two');
        const narrationThree = document.getElementById('training-overview-audio-three');
        const hazardScreen = overview.querySelector('[data-overview-screen="hazards"]');
        const meterScreen = overview.querySelector('[data-overview-screen="meter"]');
        const instrumentScreen = overview.querySelector('[data-overview-screen="instrument"]');
        const sectionButtons = [...document.querySelectorAll('.course-nav__item[data-section]')];
        const overviewButton = sectionButtons.find((button) => button.dataset.section === 'Overview');
        const resourcesButton = sectionButtons.find((button) => button.dataset.section === 'Resources');
        const instrumentMeter = overview.querySelector('.training-overview__instrument-meter');

        if (!overview || !overviewButton || !resourcesButton || !narration || !narrationTwo || !narrationThree || !hazardScreen || !meterScreen || !instrumentScreen || !instrumentMeter) return;

        function mapCues(cues) {
            return cues.map((cue) => ({
                ...cue,
                elements: cue.elements || [...overview.querySelectorAll(`[data-overview-cue="${cue.name}"]`)],
            }));
        }

        const hazardCues = mapCues([
            { name: 'lead', time: 0.15 },
            { name: 'photo-one', time: 0.8 },
            { name: 'photo-two', time: 4.4 },
            { name: 'photo-three', time: 8.3 },
            { name: 'reference', time: 13.2 },
            { name: 'point-one', time: 26.6 },
            { name: 'point-two', time: 30.6 },
        ]);

        const meterCues = mapCues([
            { name: 'meter-device', time: 0.1 },
            { name: 'meter-heading', time: 6.9 },
            { name: 'meter-captures', time: 14.9 },
            { name: 'meter-decibels', time: 18.4 },
            { name: 'data-heading', time: 22.5 },
            { name: 'data-hazard', time: 24.2 },
            { name: 'data-weighting', time: 25.5 },
            { name: 'data-noise', time: 27.9 },
            { name: 'data-limits', time: 30.3 },
        ]);

        const instrumentCues = mapCues([
            {
                name: 'instrument-enlarge',
                time: 0.15,
                className: 'is-enlarged',
                elements: [instrumentMeter],
                manageAria: false,
            },
            { name: 'instrument-keypad', time: 8.32 },
            { name: 'instrument-softkeys', time: 9.62 },
            { name: 'instrument-screen', time: 11.44 },
            { name: 'instrument-calibrator', time: 14.96 },
            { name: 'instrument-configure', time: 16.54 },
            { name: 'instrument-studies', time: 18.32 },
            { name: 'instrument-data', time: 20.0 },
            {
                name: 'instrument-resources',
                time: 23.36,
                className: 'is-overview-prompt',
                elements: [resourcesButton],
                manageAria: false,
            },
        ]);

        let frameId = 0;
        let transitionTimer = 0;
        let activeNarration = null;
        let activeCues = hazardCues;

        function applyCues(cues, currentTime) {
            cues.forEach((cue) => {
                const visible = currentTime >= cue.time;
                const className = cue.className || 'is-visible';
                cue.elements.forEach((element) => {
                    element.classList.toggle(className, visible);
                    if (cue.manageAria !== false && className === 'is-visible') {
                        element.setAttribute('aria-hidden', String(!visible));
                    }
                });
            });
        }

        function revealAllCues(cues) {
            applyCues(cues, Number.POSITIVE_INFINITY);
        }

        function showScreen(screen) {
            [hazardScreen, meterScreen, instrumentScreen].forEach((candidate) => {
                const active = candidate === screen;
                candidate.classList.toggle('is-active', active);
                candidate.setAttribute('aria-hidden', String(!active));
            });
        }

        function stopSequence(reset = true) {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(transitionTimer);
            narration.pause();
            narrationTwo.pause();
            narrationThree.pause();
            activeNarration = null;
            if (reset) {
                narration.currentTime = 0;
                narrationTwo.currentTime = 0;
                narrationThree.currentTime = 0;
                applyCues(hazardCues, -1);
                applyCues(meterCues, -1);
                applyCues(instrumentCues, -1);
                showScreen(hazardScreen);
            }
        }

        function updateSequence() {
            if (!activeNarration) return;
            applyCues(activeCues, activeNarration.currentTime);
            if (!activeNarration.paused && !activeNarration.ended) {
                frameId = window.requestAnimationFrame(updateSequence);
            }
        }

        function playNarration(audio, cues, onBlocked) {
            activeNarration = audio;
            activeCues = cues;
            audio.currentTime = 0;
            applyCues(cues, -1);
            const playAttempt = audio.play();
            frameId = window.requestAnimationFrame(updateSequence);

            if (playAttempt?.catch) {
                playAttempt.catch(() => {
                    window.cancelAnimationFrame(frameId);
                    revealAllCues(cues);
                    onBlocked?.();
                });
            }
        }

        function startMeterSequence() {
            showScreen(meterScreen);
            playNarration(narrationTwo, meterCues);
        }

        function startInstrumentSequence() {
            showScreen(instrumentScreen);
            playNarration(narrationThree, instrumentCues);
        }

        function queueMeterSequence() {
            revealAllCues(hazardCues);
            transitionTimer = window.setTimeout(startMeterSequence, 1000);
        }

        function startSequence() {
            stopSequence(true);
            playNarration(narration, hazardCues, () => {
                transitionTimer = window.setTimeout(() => {
                    showScreen(meterScreen);
                    revealAllCues(meterCues);
                }, 1000);
            });
        }

        function setOverviewVisible(visible, playNarration = true) {
            document.body.classList.toggle('overview-active', visible);
            overview.setAttribute('aria-hidden', String(!visible));

            if (visible && playNarration) {
                startSequence();
            } else if (!visible) {
                stopSequence(true);
            }
        }

        sectionButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setOverviewVisible(button === overviewButton);
            });
        });

        document.addEventListener('slm-navigation-intro-complete', () => {
            setOverviewVisible(true, false);
        });

        document.addEventListener('slm-navigation-intro-settled', () => {
            if (document.body.classList.contains('overview-active')) {
                startSequence();
            }
        });

        narration.addEventListener('ended', queueMeterSequence);
        narrationTwo.addEventListener('ended', () => {
            revealAllCues(meterCues);
            transitionTimer = window.setTimeout(startInstrumentSequence, 1000);
        });
        narrationThree.addEventListener('ended', () => revealAllCues(instrumentCues));

        window.showTrainingOverview = () => setOverviewVisible(true, true);
        window.hideTrainingOverview = () => setOverviewVisible(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOverview);
    } else {
        initializeOverview();
    }
})();
