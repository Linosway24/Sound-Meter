/**
 * Device State Management Module
 * Manages device power state, initialization, and backlight state
 */

(() => {
    'use strict';

    // Device state object
    const deviceState = {
        poweredOn: false,
        initialized: false,
        backlightOn: true,
        backlightMode: 'manual', // 'manual' | 'timed'
        backlightTimeout: null
    };

    /**
     * Get the current device state
     * @returns {Object} Device state object
     */
    function getDeviceState() {
        return { ...deviceState };
    }

    /**
     * Check if device is powered on
     * @returns {boolean}
     */
    function isPoweredOn() {
        return deviceState.poweredOn;
    }

    /**
     * Check if device is initialized
     * @returns {boolean}
     */
    function isInitialized() {
        return deviceState.initialized;
    }

    /**
     * Initialize device with default settings
     * Called when device powers on
     */
    function initializeDevice() {
        if (deviceState.initialized) {
            return;
        }

        console.log('[STATE] Device initialized');
        
        // Set default configuration
        deviceState.backlightOn = true;
        deviceState.backlightMode = 'manual';
        deviceState.backlightTimeout = null;
        
        deviceState.initialized = true;
    }

    /**
     * Power on the device
     */
    function powerOn() {
        if (deviceState.poweredOn) {
            return;
        }

        deviceState.poweredOn = true;
        console.log('[STATE] Device powered ON');
        
        // Initialize device if not already initialized
        if (!deviceState.initialized) {
            initializeDevice();
        }

        // Navigate to home screen
        if (window.navigateToScreen) {
            window.navigateToScreen('home');
        }

        // Trigger display update
        if (window.updateDisplayPowerState) {
            window.updateDisplayPowerState(true);
        }

        // Enable backlight by default when powering on
        if (window.updateDisplayBacklightState) {
            window.updateDisplayBacklightState(true);
        }
    }

    /**
     * Power off the device
     */
    function powerOff() {
        if (!deviceState.poweredOn) {
            return;
        }

        deviceState.poweredOn = false;
        console.log('[STATE] Device powered OFF');

        // Clear any backlight timeout
        if (deviceState.backlightTimeout !== null) {
            clearTimeout(deviceState.backlightTimeout);
            deviceState.backlightTimeout = null;
        }

        // Turn off backlight
        deviceState.backlightOn = false;

        // Reset navigation state
        if (window.resetNavigation) {
            window.resetNavigation();
        }

        // Trigger display update
        if (window.updateDisplayPowerState) {
            window.updateDisplayPowerState(false);
        }
    }

    /**
     * Toggle device power state
     */
    function togglePower() {
        if (deviceState.poweredOn) {
            powerOff();
        } else {
            powerOn();
        }
    }

    /**
     * Set backlight state
     * @param {boolean} on - Backlight on/off
     */
    function setBacklight(on) {
        deviceState.backlightOn = on;
        if (window.updateDisplayBacklightState) {
            window.updateDisplayBacklightState(on);
        }
    }

    /**
     * Get backlight state
     * @returns {boolean}
     */
    function getBacklightState() {
        return deviceState.backlightOn;
    }

    // Export functions to window for module access
    window.deviceState = deviceState;
    window.getDeviceState = getDeviceState;
    window.isPoweredOn = isPoweredOn;
    window.isInitialized = isInitialized;
    window.powerOn = powerOn;
    window.powerOff = powerOff;
    window.togglePower = togglePower;
    window.setBacklight = setBacklight;
    window.getBacklightState = getBacklightState;
})();

