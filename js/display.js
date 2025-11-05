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
                softKeyLabelElements[i].textContent = labels[i] || '';
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
     * Main render function - reads state from menu.js and device.js
     */
    function render() {
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
})();
