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
    const walkthroughSteps = {
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
    };

    const stepOrder = ['batteryCheck'];
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
        } else {
            currentStepId = null;
            setPanelVisible(false);
        }
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
})();
