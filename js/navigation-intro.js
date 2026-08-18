(() => {
    const navigationTimeline = {
        brandDock: 5.2,
        resourcesStart: 22.1,
        items: [
            { section: 'Overview', time: 9 },
            { section: 'Setup', time: 10.17 },
            { section: 'Calibration', time: 12.08 },
            { section: 'Operation', time: 14.07 },
            { section: 'Surveys', time: 16 },
            { section: 'Scenarios', time: 18 },
        ],
        deferredItems: ['Resources', 'Guide Me', 'End'],
    };

    const resourcesTimeline = {
        pointerReady: 7.15,
        click: 8,
        open: 8.18,
        close: 14.65,
        dock: 15.2,
    };

    const guideTimeline = {
        guideEnter: 0.65,
        guideDock: 5.1,
        endEnter: 10.07,
        endDock: 13.8,
    };

    function initializeNavigationIntroduction() {
        const overlay = document.getElementById('training-navigation-intro');
        const brand = document.getElementById('navigation-intro-brand');
        const buttonLayer = document.getElementById('navigation-intro-button-layer');
        const narration = document.getElementById('navigation-intro-audio');
        const resourcesNarration = document.getElementById('navigation-intro-resources-audio');
        const guideNarration = document.getElementById('navigation-intro-guide-audio');
        const resourcesCard = document.getElementById('navigation-intro-resources');
        const finalNotice = document.getElementById('navigation-intro-final-notice');
        const finalContinue = document.getElementById('navigation-intro-final-continue');
        const skipButton = document.getElementById('navigation-intro-skip');
        const timecode = document.getElementById('navigation-intro-timecode');
        const timecodeLabel = document.getElementById('navigation-intro-timecode-label');
        const timecodeOutput = timecode?.querySelector('output');
        const courseBrand = document.querySelector('.course-nav__brand');
        const courseItems = [...document.querySelectorAll('.course-nav__item[data-section]')];
        const resourcesTarget = courseItems.find((item) => item.dataset.section === 'Resources');
        const timingReviewEnabled =
            new URLSearchParams(window.location.search).get('navtiming') === '1';

        if (
            !overlay ||
            !brand ||
            !buttonLayer ||
            !narration ||
            !resourcesNarration ||
            !guideNarration ||
            !resourcesCard ||
            !finalNotice ||
            !finalContinue ||
            !courseBrand ||
            !resourcesTarget
        ) {
            document.body.classList.remove('navigation-intro-active');
            return;
        }

        let hasStarted = false;
        let hasFinished = false;
        let brandDocked = false;
        let resourcesStarted = false;
        let resourcesDocking = false;
        let guideStarted = false;
        let finalNoticeStarted = false;
        let phase = 'navigation';
        let frameId = 0;
        let fallbackStartTime = 0;
        let useFallbackClock = false;
        const revealedSections = new Set();
        const flyingItemsBySection = new Map();
        const pendingTimers = new Set();

        if (timingReviewEnabled && timecode) {
            timecode.hidden = false;
        }

        function queueTimer(callback, delay) {
            const timer = window.setTimeout(() => {
                pendingTimers.delete(timer);
                callback();
            }, delay);
            pendingTimers.add(timer);
            return timer;
        }

        function setBrandGeometry() {
            const target = courseBrand.getBoundingClientRect();
            const targetCenterX = target.left + target.width / 2;
            const targetCenterY = target.top + target.height / 2;

            brand.style.setProperty('--brand-target-left', `${target.left}px`);
            brand.style.setProperty('--brand-target-top', `${target.top}px`);
            brand.style.setProperty('--brand-target-width', `${target.width}px`);
            brand.style.setProperty('--brand-target-height', `${target.height}px`);
            brand.style.setProperty('--brand-start-x', `${window.innerWidth / 2 - targetCenterX}px`);
            brand.style.setProperty('--brand-start-y', `${window.innerHeight / 2 - targetCenterY}px`);
        }

        function setResourcesGeometry() {
            const target = resourcesTarget.getBoundingClientRect();
            const targetCenterX = target.left + target.width / 2;
            const targetCenterY = target.top + target.height / 2;
            const centerX = window.innerWidth / 2;
            const centerY = Math.min(window.innerHeight * 0.3, 324);
            const startX = centerX - targetCenterX;
            const startY = centerY - targetCenterY;

            resourcesCard.style.setProperty('--resources-target-left', `${target.left}px`);
            resourcesCard.style.setProperty('--resources-target-top', `${target.top}px`);
            resourcesCard.style.setProperty('--resources-target-width', `${target.width}px`);
            resourcesCard.style.setProperty('--resources-target-height', `${target.height}px`);
            resourcesCard.style.setProperty('--resources-start-x', `${startX}px`);
            resourcesCard.style.setProperty('--resources-start-y', `${startY}px`);
            resourcesCard.style.setProperty(
                '--resources-fly-x',
                `${startX + window.innerWidth * 0.72}px`
            );
        }

        function findCourseItem(section) {
            return courseItems.find((item) => item.dataset.section === section);
        }

        function revealNavigationItem(section, dockDelay = 700) {
            if (revealedSections.has(section)) {
                return flyingItemsBySection.get(section);
            }
            const targetItem = findCourseItem(section);
            if (!targetItem) return;

            revealedSections.add(section);
            const target = targetItem.getBoundingClientRect();
            const targetCenterX = target.left + target.width / 2;
            const targetCenterY = target.top + target.height / 2;
            const flyingItem = targetItem.cloneNode(true);

            flyingItem.classList.remove('is-active');
            flyingItem.classList.add('navigation-intro__flying-item');
            flyingItem.removeAttribute('aria-current');
            flyingItem.removeAttribute('id');
            flyingItem.setAttribute('aria-hidden', 'true');
            flyingItem.tabIndex = -1;
            flyingItem.disabled = true;
            flyingItem.style.setProperty('--item-target-left', `${target.left}px`);
            flyingItem.style.setProperty('--item-target-top', `${target.top}px`);
            flyingItem.style.setProperty('--item-target-width', `${target.width}px`);
            flyingItem.style.setProperty('--item-target-height', `${target.height}px`);
            flyingItem.style.setProperty('--item-start-x', `${window.innerWidth / 2 - targetCenterX}px`);
            flyingItem.style.setProperty('--item-start-y', `${window.innerHeight / 2 - targetCenterY}px`);
            buttonLayer.appendChild(flyingItem);
            flyingItemsBySection.set(section, flyingItem);

            window.requestAnimationFrame(() => {
                flyingItem.classList.add('is-centered');
                if (Number.isFinite(dockDelay)) {
                    queueTimer(() => flyingItem.classList.add('is-docking'), dockDelay);
                }
            });

            return flyingItem;
        }

        function dockNavigationItem(section) {
            flyingItemsBySection.get(section)?.classList.add('is-docking');
        }

        function dockBrand() {
            if (brandDocked) return;
            brandDocked = true;
            overlay.classList.add('brand-docking');
            queueTimer(() => overlay.classList.add('brand-docked'), 1600);
        }

        function currentTimelineTime() {
            const activeNarration =
                phase === 'resources'
                    ? resourcesNarration
                    : phase === 'guide'
                        ? guideNarration
                        : narration;
            if (!useFallbackClock && Number.isFinite(activeNarration.currentTime)) {
                return activeNarration.currentTime;
            }
            return (performance.now() - fallbackStartTime) / 1000;
        }

        function formatTimecode(seconds) {
            const safeSeconds = Math.max(0, Number(seconds) || 0);
            const minutes = Math.floor(safeSeconds / 60);
            const remainingSeconds = safeSeconds - minutes * 60;
            return `${String(minutes).padStart(2, '0')}:${remainingSeconds
                .toFixed(2)
                .padStart(5, '0')}`;
        }

        function updateTimeline() {
            if (hasFinished) return;
            const currentTime = currentTimelineTime();

            if (timingReviewEnabled && timecodeOutput) {
                timecodeOutput.textContent = formatTimecode(currentTime);
            }

            if (phase === 'navigation') {
                if (currentTime >= navigationTimeline.brandDock) dockBrand();
                navigationTimeline.items.forEach((item) => {
                    if (currentTime >= item.time) revealNavigationItem(item.section);
                });
                if (currentTime >= navigationTimeline.resourcesStart) {
                    startResourcesIntroduction();
                    return;
                }
            } else if (phase === 'resources') {
                if (currentTime >= resourcesTimeline.pointerReady) {
                    overlay.classList.add('resources-pointer-ready');
                }
                if (currentTime >= resourcesTimeline.click) {
                    overlay.classList.add('resources-clicking');
                }
                if (
                    currentTime >= resourcesTimeline.open &&
                    currentTime < resourcesTimeline.close
                ) {
                    overlay.classList.add('resources-open');
                }
                if (currentTime >= resourcesTimeline.close) {
                    overlay.classList.remove('resources-open');
                    overlay.classList.add('resources-closing');
                }
                if (currentTime >= resourcesTimeline.dock && !resourcesDocking) {
                    resourcesDocking = true;
                    overlay.classList.add('resources-docking');
                }
            } else {
                if (currentTime >= guideTimeline.guideEnter) {
                    revealNavigationItem('Guide Me', null);
                }
                if (currentTime >= guideTimeline.guideDock) {
                    dockNavigationItem('Guide Me');
                }
                if (currentTime >= guideTimeline.endEnter) {
                    revealNavigationItem('End', null);
                }
                if (currentTime >= guideTimeline.endDock) {
                    dockNavigationItem('End');
                }
            }

            frameId = window.requestAnimationFrame(updateTimeline);
        }

        function playNarration(audio) {
            useFallbackClock = false;
            fallbackStartTime = performance.now();
            audio.currentTime = 0;
            audio.volume =
                audio === resourcesNarration
                    ? 0.82
                    : audio === guideNarration
                        ? 0.92
                        : 1;
            audio.playbackRate = 1;

            const playback = audio.play();
            if (playback) {
                playback.catch(() => {
                    useFallbackClock = true;
                    fallbackStartTime = performance.now();
                });
            } else {
                useFallbackClock = true;
                fallbackStartTime = performance.now();
            }
        }

        function startResourcesIntroduction() {
            if (hasFinished || resourcesStarted) return;
            resourcesStarted = true;
            phase = 'resources';
            window.cancelAnimationFrame(frameId);
            narration.pause();
            setResourcesGeometry();
            resourcesCard.setAttribute('aria-hidden', 'false');
            overlay.classList.add('resources-segment');
            if (timecodeLabel) timecodeLabel.textContent = 'Resources narration';
            if (skipButton) skipButton.textContent = 'Skip Resources Introduction';
            playNarration(resourcesNarration);
            frameId = window.requestAnimationFrame(updateTimeline);
        }

        function startGuideIntroduction() {
            if (hasFinished || guideStarted) return;
            guideStarted = true;
            phase = 'guide';
            window.cancelAnimationFrame(frameId);
            resourcesNarration.pause();
            if (timecodeLabel) timecodeLabel.textContent = 'Guide Me and End narration';
            if (skipButton) skipButton.textContent = 'Skip Guide Me Introduction';
            playNarration(guideNarration);
            frameId = window.requestAnimationFrame(updateTimeline);
        }

        function startFinalNotice() {
            if (hasFinished || finalNoticeStarted) return;
            finalNoticeStarted = true;
            phase = 'notice';
            window.cancelAnimationFrame(frameId);
            narration.pause();
            resourcesNarration.pause();
            guideNarration.pause();
            finalNotice.setAttribute('aria-hidden', 'false');
            overlay.classList.add('final-notice-active');
            document.body.classList.add('navigation-intro-note-active');
            if (timecode) timecode.hidden = true;

            queueTimer(() => {
                finalContinue.disabled = false;
                finalContinue.classList.add('is-ready');
            }, 10000);
        }

        function finishNavigationIntroduction() {
            if (hasFinished) return;
            hasFinished = true;
            window.cancelAnimationFrame(frameId);
            pendingTimers.forEach((timer) => window.clearTimeout(timer));
            pendingTimers.clear();
            narration.pause();
            narration.currentTime = 0;
            resourcesNarration.pause();
            resourcesNarration.currentTime = 0;
            guideNarration.pause();
            guideNarration.currentTime = 0;

            document.dispatchEvent(new Event('slm-navigation-intro-complete'));
            document.body.classList.remove('navigation-intro-active');
            document.body.classList.remove('navigation-intro-note-active');
            overlay.classList.add('is-exiting');

            queueTimer(() => {
                overlay.classList.add('is-complete');
                document.dispatchEvent(new Event('slm-navigation-intro-settled'));
                document.querySelector('.course-nav__item.is-active')?.focus();
            }, 520);
        }

        function startNavigationIntroduction() {
            if (hasStarted || hasFinished) return;
            hasStarted = true;
            document.body.classList.remove('course-nav-collapsed');
            const courseNavToggle = document.getElementById('course-nav-toggle');
            courseNavToggle?.setAttribute('aria-expanded', 'true');
            courseNavToggle?.setAttribute('aria-label', 'Collapse navigation');
            if (courseNavToggle) courseNavToggle.title = 'Collapse navigation';
            setBrandGeometry();
            setResourcesGeometry();
            overlay.classList.add('is-playing');
            playNarration(narration);
            frameId = window.requestAnimationFrame(updateTimeline);
        }

        overlay.addEventListener(
            'training-navigation-intro-start',
            startNavigationIntroduction,
            { once: true }
        );
        narration.addEventListener('ended', () => queueTimer(startResourcesIntroduction, 450));
        resourcesNarration.addEventListener('ended', () => queueTimer(startGuideIntroduction, 350));
        // The supplied Guide Me recording has no silent tail. Hold the completed
        // navigation for a moment so the final words do not feel visually clipped.
        guideNarration.addEventListener('ended', () => queueTimer(startFinalNotice, 1250));
        finalContinue.addEventListener('click', finishNavigationIntroduction);
        skipButton?.addEventListener('click', startFinalNotice);
        window.addEventListener('resize', () => {
            if (!brandDocked) setBrandGeometry();
            if (!resourcesDocking) setResourcesGeometry();
        });
        window.addEventListener('pagehide', () => {
            window.cancelAnimationFrame(frameId);
            pendingTimers.forEach((timer) => window.clearTimeout(timer));
            narration.pause();
            resourcesNarration.pause();
            guideNarration.pause();
        }, { once: true });

        window.SLM_NAVIGATION_INTRO_TIMELINE = navigationTimeline;
        window.SLM_RESOURCES_INTRO_TIMELINE = resourcesTimeline;
        window.SLM_GUIDE_INTRO_TIMELINE = guideTimeline;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNavigationIntroduction);
    } else {
        initializeNavigationIntroduction();
    }
})();
