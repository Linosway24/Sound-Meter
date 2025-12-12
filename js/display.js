/**
 * Display Rendering Module
 * Pure presentation layer - reads state from menu.js and device.js
 * Renders LCD content based on current navigation state
 */

(() => {
    'use strict';

    // LCD DOM element references (set during init)
    let lcdMain = null;
    let lcdStatus = null;
    let lcdSoftkeys = null;

    // Soft key label elements (will be created if they don't exist)
    let softKeyLabelElements = [];

    // FSM integration
    let fsmUnsubscribe = null;
    let useFSM = false;

    /**
     * Initialize display module
     */
    function init() {
        // Get LCD DOM elements (refresh query in case DOM changed)
        const lcdMainEl = document.querySelector('.lcd__main');
        const lcdStatusEl = document.querySelector('.lcd__status');
        const lcdSoftkeysEl = document.querySelector('.lcd__softkeys');

        if (!lcdMainEl || !lcdStatusEl || !lcdSoftkeysEl) {
            console.error('[DISPLAY] LCD elements not found:', {
                main: !!lcdMainEl,
                status: !!lcdStatusEl,
                softkeys: !!lcdSoftkeysEl
            });
            return;
        }

        // Store references
        lcdMain = lcdMainEl;
        lcdStatus = lcdStatusEl;
        lcdSoftkeys = lcdSoftkeysEl;

        // Create soft key label elements if they don't exist
        if (lcdSoftkeys) {
            softKeyLabelElements = [];
            for (let i = 1; i <= 4; i++) {
                let labelEl = lcdSoftkeys.querySelector(`.soft-key-label--${i}`);
                if (!labelEl) {
                    labelEl = document.createElement('div');
                    labelEl.className = `soft-key-label soft-key-label--${i}`;
                    lcdSoftkeys.appendChild(labelEl);
                }
                softKeyLabelElements.push(labelEl);
            }
        }

        // Check if FSM integration is enabled
        useFSM = window.Config && window.Config.FEATURE_STARTUP_INTEGRATION;
        const useFSMV2 = window.Config && window.Config.FEATURE_FSM_V2;
        
        // Subscribe to FSM state changes if enabled
        if ((useFSM || useFSMV2) && window.subscribeStartup) {
            fsmUnsubscribe = window.subscribeStartup((state) => {
                renderFromFSMState(state);
            });
            console.log('[DISPLAY] FSM integration enabled', useFSMV2 ? '(v2)' : '(v1)');
        }

        console.log('[DISPLAY] Initialized');
    }

    /**
     * Update soft key labels
     * @param {Array<string>} labels - Array of 4 labels (can be empty strings)
     */
    function updateSoftKeyLabels(labels) {
        if (!labels || labels.length !== 4) {
            labels = ['', '', '', ''];
        }

        for (let i = 0; i < 4; i++) {
            if (softKeyLabelElements[i]) {
                const label = labels[i] || '';
                // Use innerHTML if label contains HTML tags (for SLM softkey underlines)
                if (label.includes('<') && label.includes('>')) {
                    softKeyLabelElements[i].innerHTML = label;
                } else {
                    softKeyLabelElements[i].textContent = label;
                }
            }
        }
    }

    /**
     * Update LCD main area content
     * @param {string} html - HTML content to display
     */
    function updateMainArea(html) {
        if (lcdMain) {
            lcdMain.innerHTML = html;
            // Add class if this is an SLM screen (has status bar)
            if (html.includes('screen-element--status-bar')) {
                lcdMain.classList.add('lcd__main--slm');
            } else {
                lcdMain.classList.remove('lcd__main--slm');
            }
        } else {
            console.warn('[DISPLAY] lcdMain element not found');
        }
    }

    /**
     * Update LCD status area content
     * @param {string} html - HTML content to display
     */
    function updateStatusArea(html) {
        if (lcdStatus) {
            lcdStatus.innerHTML = html;
        } else {
            console.warn('[DISPLAY] lcdStatus element not found');
        }
    }

    /**
     * Render home screen
     */
    function renderHomeScreen() {
        const mainHTML = `
            <div style="text-align: center; padding-top: 100px;">
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 20px;">
                    Quest SoundPro SE-DL
                </div>
                <div style="font-size: 20px; color: #888;">
                    Firmware R.13J
                </div>
            </div>
        `;
        
        const statusHTML = `
            <div style="padding: 10px; font-size: 16px;">
                <div>Ready</div>
            </div>
        `;

        updateMainArea(mainHTML);
        updateStatusArea(statusHTML);
        updateSoftKeyLabels(['Menu', '', '', '']);
    }

    /**
     * Render powered-off screen
     */
    function renderOffScreen() {
        updateMainArea('');
        updateStatusArea('');
        updateSoftKeyLabels(['', '', '', '']);
    }

    /**
     * Render menu screen (placeholder for Task 3.0)
     */
    function renderMenuScreen() {
        const mainHTML = `
            <div style="padding: 20px; font-size: 18px;">
                Menu screen (Task 3.0)
            </div>
        `;
        
        updateMainArea(mainHTML);
        updateStatusArea('');
        updateSoftKeyLabels(['', '', '', '']);
    }

    /**
     * Render from FSM state
     * @param {Object} state - FSM state
     */
    function renderFromFSMState(state) {
        if (!useFSM || !state) return;

        // Ensure elements are available
        if (!lcdMain || !lcdStatus) {
            console.warn('[DISPLAY] LCD elements not ready, attempting re-init');
            init();
            if (!lcdMain || !lcdStatus) {
                console.error('[DISPLAY] Cannot render - LCD elements not found');
                return;
            }
        }

        const viewId = state.viewId || 'OFF';
        
        // Update LCD power state
        const lcd = document.querySelector('.lcd');
        if (lcd) {
            if (viewId === 'OFF') {
                lcd.classList.add('lcd--powered-off');
                updateDisplayBacklightState(false);
            } else {
                lcd.classList.remove('lcd--powered-off');
                // Update backlight based on FSM state
                updateDisplayBacklightState(state.backlight || false);
            }
        }

        // Render screen using screen renderer
        if (viewId === 'OFF') {
            renderOffScreen();
        } else if (window.renderScreen) {
            const rendered = window.renderScreen(viewId, state);
            updateMainArea(rendered.mainHTML);
            updateStatusArea(rendered.statusHTML);
            updateSoftKeyLabels(rendered.softkeys);
        } else {
            // Fallback if screen renderer not ready
            console.warn('[DISPLAY] Screen renderer not available');
            renderHomeScreen();
        }
    }

    /**
     * Main render function - reads state from menu.js and device.js
     */
    function render() {
        // If FSM is enabled, rendering is handled by FSM state changes
        const useFSM = window.Config && window.Config.FEATURE_STARTUP_INTEGRATION;
        const useFSMV2 = window.Config && window.Config.FEATURE_FSM_V2;
        
        if ((useFSM || useFSMV2) && window.getStartupState) {
            const state = window.getStartupState();
            renderFromFSMState(state);
            return;
        }

        // Ensure elements are available
        if (!lcdMain || !lcdStatus) {
            console.warn('[DISPLAY] LCD elements not ready, attempting re-init');
            init();
            if (!lcdMain || !lcdStatus) {
                console.error('[DISPLAY] Cannot render - LCD elements not found');
                return;
            }
        }

        // Check if device is powered on
        const devicePowered = window.isPoweredOn ? window.isPoweredOn() : false;
        
        if (!devicePowered) {
            renderOffScreen();
            return;
        }

        // Get current screen from menu.js
        const currentScreen = window.getCurrentScreen ? window.getCurrentScreen() : 'home';

        // Render based on screen context
        switch (currentScreen) {
            case 'off':
                renderOffScreen();
                break;
            case 'home':
                renderHomeScreen();
                break;
            case 'menu':
            case 'settings':
            case 'measurement':
            case 'dialog':
                // These will be fully implemented in Task 3.0
                renderMenuScreen();
                break;
            default:
                renderHomeScreen();
        }
    }

    /**
     * Update display power state and render
     * @param {boolean} powered - Whether device is powered on
     */
    function updateDisplayPowerState(powered) {
        const lcd = document.querySelector('.lcd');
        if (!lcd) {
            console.error('[DISPLAY] LCD element not found');
            return;
        }

        if (powered) {
            lcd.classList.remove('lcd--powered-off');
            // Enable backlight by default when powered on
            if (window.getBacklightState && window.getBacklightState()) {
                updateDisplayBacklightState(true);
            }
        } else {
            lcd.classList.add('lcd--powered-off');
            updateDisplayBacklightState(false);
        }

        // Trigger render after power state change
        render();
    }

    /**
     * Update display backlight state
     * @param {boolean} on - Whether backlight is on
     */
    function updateDisplayBacklightState(on) {
        const lcd = document.querySelector('.lcd');
        if (!lcd) return;

        if (on) {
            lcd.classList.add('lcd--backlight-on');
            lcd.classList.remove('lcd--backlight-off');
        } else {
            lcd.classList.remove('lcd--backlight-on');
            lcd.classList.add('lcd--backlight-off');
        }
    }

    /**
     * Render toast notification
     * @param {Object} toast - Toast object with message property
     */
    function renderToast(toast) {
        if (!toast || !toast.message) {
            hideToast();
            return;
        }

        // Find LCD main area to position toast inside LCD
        const lcdMain = document.querySelector('.lcd__main');
        if (!lcdMain) {
            console.warn('[DISPLAY] LCD main area not found for toast');
            return;
        }

        let toastEl = document.getElementById('toast-notification');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'toast-notification';
            toastEl.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: #e6e6e6;
                padding: 12px 24px;
                border-radius: 4px;
                font-size: 16px;
                font-family: ui-monospace, monospace;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            `;
            // Append to LCD main area so it's positioned relative to LCD
            lcdMain.appendChild(toastEl);
        }

        toastEl.textContent = toast.message;
        toastEl.style.opacity = '1';
    }

    /**
     * Hide toast notification
     */
    function hideToast() {
        const toastEl = document.getElementById('toast-notification');
        if (toastEl) {
            toastEl.style.opacity = '0';
        }
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            // Initial render
            render();
        });
    } else {
        init();
        // Initial render
        render();
    }

    // Export functions to window for module access
    window.renderDisplay = render;
    window.updateDisplayPowerState = updateDisplayPowerState;
    window.updateDisplayBacklightState = updateDisplayBacklightState;
    window.updateSoftKeyLabels = updateSoftKeyLabels;
    window.updateMainArea = updateMainArea;
    window.updateStatusArea = updateStatusArea;
    window.renderToast = renderToast;
    window.hideToast = hideToast;
})();
