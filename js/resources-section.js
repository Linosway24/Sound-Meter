(() => {
    'use strict';

    const TOPICS = [
        {
            key: 'Components',
            title: 'Meter Components',
            intro: 'The Quest sound level meter combines four primary physical components in one handheld instrument.',
            type: 'meter',
            highlight: 'all',
            items: [
                ['1', 'Physical keypad', 'Starts and stops studies and moves through meter menus.'],
                ['2', 'Dynamic soft keys', 'Change function to match the label shown along the bottom of the display.'],
                ['3', 'Backlit LCD screen', 'Shows sound levels, study information, status, and menu choices.'],
                ['4', 'Microphone', 'Captures the acoustic pressure variations the meter measures.'],
            ],
        },
        {
            key: 'Display',
            title: 'Display',
            intro: 'The backlit screen changes with the selected measurement view and keeps the active settings visible.',
            type: 'meter',
            highlight: 'screen',
            items: [
                ['A', 'Measurement readout', 'Displays the current sound level in decibels.'],
                ['B', 'Study and status information', 'Shows the active view, timer, battery status, and measurement settings.'],
                ['C', 'Octave-band view', 'Presents detailed frequency information in 1/1- or 1/3-octave bands.'],
                ['D', 'Display resolution', 'In Octave mode, soft keys adjust the decibel scale up or down for a clearer view.'],
            ],
        },
        {
            key: 'Soft Key Settings',
            title: 'Soft Key Settings',
            intro: 'The four soft keys take on the function printed directly above them on the display.',
            type: 'meter',
            highlight: 'softkeys',
            items: [
                ['1', 'Measurement views', 'Pressing the first soft key cycles among SLM, 1/1 Octave, and 1/3 Octave views.'],
                ['2', 'Calibration', 'From the home screen, CAL opens the calibration menu for use with a compatible field calibrator.'],
                ['3', 'Display resolution', 'In Octave mode, soft keys adjust the decibel scale for better visual resolution.'],
                ['4', 'Menu navigation', 'On-screen prompts such as Enter, Back, or Select make it easy to change logging intervals, weighting, and response time.'],
            ],
        },
        {
            key: 'Response Settings',
            title: 'Time Weightings',
            intro: 'Time weighting controls how rapidly the meter averages changing sound levels.',
            type: 'cards',
            items: [
                ['F', 'Fast', 'Uses a 125-millisecond averaging time. It reacts quickly and helps capture changing or transient sounds.'],
                ['S', 'Slow', 'Uses a 1-second averaging time. It smooths quick fluctuations to provide a steadier reading.'],
                ['I', 'Impulse', 'Uses a 35-millisecond rise time with a slow decay to catch very sharp, sudden sounds.'],
            ],
            note: '<strong>Common starting point:</strong> A-weighting combined with Slow time weighting is typically used for general noise tracking.',
        },
        {
            key: 'Frequency Weightings',
            title: 'Frequency Weightings',
            intro: 'Frequency weighting filters adjust how the meter registers different pitches.',
            type: 'cards',
            items: [
                ['A', 'A-Weighting (dBA)', 'The standard for most workplace, environmental, and general noise measurements. It approximates human hearing by reducing very low and very high frequencies.'],
                ['C', 'C-Weighting (dBC)', 'Used for peak measurements and very loud environments. It retains more low-frequency sound than A-weighting.'],
                ['Z', 'Z-Weighting (dBZ)', 'A flat, unweighted frequency response, usually 10 Hz to 20 kHz, used for precise equipment testing.'],
            ],
        },
        {
            key: 'Navigation',
            title: 'Virtual Navigation',
            intro: 'Use the keyboard to position the meter and move through each virtual work area.',
            type: 'navigation',
        },
    ];

    function meterMarkup(topic) {
        const classes = `training-resources__meter training-resources__meter--${topic.highlight}`;
        return `
            <div class="training-resources__meter-layout">
                <div class="training-resources__item-list">
                    ${topic.items.map(([badge, heading, copy]) => `
                        <article class="training-resources__item">
                            <span class="training-resources__badge">${badge}</span>
                            <div><h2>${heading}</h2><p>${copy}</p></div>
                        </article>
                    `).join('')}
                </div>
                <figure class="${classes}">
                    <div class="training-resources__meter-art">
                        <img src="assets/Quest%20Sound%20Meter.png" alt="Quest SoundPro sound level meter">
                        <span class="training-resources__meter-zone training-resources__meter-zone--microphone" aria-hidden="true">4</span>
                        <span class="training-resources__meter-zone training-resources__meter-zone--screen" aria-hidden="true">3</span>
                        <span class="training-resources__meter-zone training-resources__meter-zone--softkeys" aria-hidden="true">2</span>
                        <span class="training-resources__meter-zone training-resources__meter-zone--keypad" aria-hidden="true">1</span>
                    </div>
                    <figcaption>${topic.highlight === 'softkeys' ? 'Soft-key labels appear along the bottom edge of the display.' : 'Quest SoundPro SE-DL'}</figcaption>
                </figure>
            </div>`;
    }

    function cardsMarkup(topic) {
        return `
            <div class="training-resources__cards">
                ${topic.items.map(([symbol, heading, copy]) => `
                    <article class="training-resources__card">
                        <span class="training-resources__card-symbol">${symbol}</span>
                        <h2>${heading}</h2>
                        <p>${copy}</p>
                    </article>
                `).join('')}
            </div>
            ${topic.note ? `<aside class="training-resources__note">${topic.note}</aside>` : ''}`;
    }

    function navigationMarkup() {
        const numberKeys = [
            ['7', '↖'], ['8', '↑'], ['9', '↗'],
            ['4', '←'], ['', ''], ['6', '→'],
            ['1', '↙'], ['2', '↓'], ['3', '↘'],
        ];
        return `
            <div class="training-resources__navigation-grid">
                <article class="training-resources__navigation-card">
                    <div class="training-resources__keypad" aria-label="Numeric keypad movement controls">
                        ${numberKeys.map(([number, arrow]) => number
                            ? `<span class="training-resources__key"><b>${number}</b><i>${arrow}</i></span>`
                            : '<span class="training-resources__key training-resources__key--empty" aria-hidden="true"></span>'
                        ).join('')}
                    </div>
                    <div><h2>Move the SLM</h2><p>Use the numeric keypad to move the meter left, right, forward, backward, or diagonally. The layout mirrors the direction of travel.</p></div>
                </article>
                <article class="training-resources__navigation-card">
                    <div class="training-resources__arrow-keys" aria-label="Arrow key room controls">
                        <span class="training-resources__arrow-key training-resources__arrow-key--up">↑</span>
                        <span class="training-resources__arrow-key">←</span>
                        <span class="training-resources__arrow-key">↓</span>
                        <span class="training-resources__arrow-key">→</span>
                    </div>
                    <div><h2>Move through the room</h2><p>Use the arrow keys to change the room view and adjust your distance from the equipment and operator.</p></div>
                </article>
            </div>`;
    }

    function initializeResourcesSection() {
        const section = document.getElementById('training-resources');
        const title = document.getElementById('training-resources-title');
        const count = document.getElementById('training-resources-count');
        const content = document.getElementById('training-resources-content');
        const previous = document.getElementById('training-resources-previous');
        const next = document.getElementById('training-resources-next');
        const resourcesButton = document.querySelector('.course-nav__item[data-section="Resources"]');
        const resourceButtons = [...document.querySelectorAll('.course-nav__subitem[data-resource-section]')];
        const sectionButtons = [...document.querySelectorAll('.course-nav__item[data-section]')];
        if (!section || !title || !count || !content || !previous || !next || !resourcesButton) return;

        let active = false;
        let currentIndex = 0;

        function setActiveSubitem(key) {
            resourceButtons.forEach((button) => {
                const selected = button.dataset.resourceSection === key;
                button.classList.toggle('is-active', selected);
                if (selected) button.setAttribute('aria-current', 'page');
                else button.removeAttribute('aria-current');
            });
        }

        function renderTopic(index, focusTitle = false) {
            currentIndex = Math.max(0, Math.min(index, TOPICS.length - 1));
            const topic = TOPICS[currentIndex];
            title.textContent = topic.title;
            count.textContent = `${currentIndex + 1} of ${TOPICS.length}`;
            content.innerHTML = `
                <p class="training-resources__intro">${topic.intro}</p>
                ${topic.type === 'meter' ? meterMarkup(topic) : ''}
                ${topic.type === 'cards' ? cardsMarkup(topic) : ''}
                ${topic.type === 'navigation' ? navigationMarkup() : ''}`;
            previous.disabled = currentIndex === 0;
            next.disabled = currentIndex === TOPICS.length - 1;
            next.textContent = currentIndex === TOPICS.length - 1 ? 'Last topic' : 'Next';
            setActiveSubitem(topic.key);
            content.scrollTop = 0;
            if (focusTitle) title.focus({ preventScroll: true });
        }

        function enterResources(requestedKey) {
            window.hideTrainingOverview?.();
            window.leaveCalibrationSection?.();
            window.leaveOperationSection?.();
            window.AudioPlayer?.stopNarration?.();
            window.hideWalkthroughPanel?.();
            window.clearWalkthroughHighlights?.();
            active = true;
            document.body.classList.add('resources-active');
            section.setAttribute('aria-hidden', 'false');
            const requestedIndex = TOPICS.findIndex((topic) => topic.key === requestedKey);
            renderTopic(requestedIndex >= 0 ? requestedIndex : currentIndex, Boolean(requestedKey));
        }

        function leaveResources() {
            if (!active) return;
            active = false;
            document.body.classList.remove('resources-active');
            section.setAttribute('aria-hidden', 'true');
        }

        resourcesButton.addEventListener('click', () => enterResources());
        resourceButtons.forEach((button) => {
            button.addEventListener('click', () => enterResources(button.dataset.resourceSection));
        });
        sectionButtons.forEach((button) => {
            if (button !== resourcesButton) button.addEventListener('click', leaveResources);
        });
        previous.addEventListener('click', () => renderTopic(currentIndex - 1, true));
        next.addEventListener('click', () => {
            if (currentIndex < TOPICS.length - 1) renderTopic(currentIndex + 1, true);
        });

        window.hideTrainingResources = leaveResources;
        window.showTrainingResource = enterResources;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeResourcesSection);
    } else {
        initializeResourcesSection();
    }
})();
