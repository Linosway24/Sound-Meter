/**
 * Navigation State Machine Module
 * Manages screen transitions and navigation state
 * Full menu implementation will be added in Task 3.0
 */

(() => {
    'use strict';

    // Navigation state object
    const navigationState = {
        currentScreen: 'off', // Current screen identifier
        menuHistory: [], // Stack of previous screens for back navigation
        selectedItem: 0 // Currently selected menu item index
    };

    /**
     * Get current navigation state
     * @returns {Object} Navigation state object
     */
    function getNavigationState() {
        return { ...navigationState };
    }

    /**
     * Navigate to a screen
     * @param {string} screen - Screen identifier
     */
    function navigateToScreen(screen) {
        // Add current screen to history if not already at target
        if (navigationState.currentScreen !== screen) {
            navigationState.menuHistory.push(navigationState.currentScreen);
            navigationState.currentScreen = screen;
            
            console.log(`[NAV] Navigated to: ${screen}`);
            
            // Trigger display refresh
            if (window.renderDisplay) {
                window.renderDisplay();
            }
        }
    }

    /**
     * Go back to previous screen
     */
    function goBack() {
        if (navigationState.menuHistory.length > 0) {
            const previousScreen = navigationState.menuHistory.pop();
            navigationState.currentScreen = previousScreen;
            
            console.log(`[NAV] Went back to: ${previousScreen}`);
            
            // Trigger display refresh
            if (window.renderDisplay) {
                window.renderDisplay();
            }
        } else {
            // If no history, go to home screen
            navigateToScreen('home');
        }
    }

    /**
     * Get current screen
     * @returns {string}
     */
    function getCurrentScreen() {
        return navigationState.currentScreen;
    }

    /**
     * Set selected item index
     * @param {number} index - Selected item index
     */
    function setSelectedItem(index) {
        navigationState.selectedItem = index;
        
        // Trigger display refresh to update selection highlight
        if (window.renderDisplay) {
            window.renderDisplay();
        }
    }

    /**
     * Get selected item index
     * @returns {number}
     */
    function getSelectedItem() {
        return navigationState.selectedItem;
    }

    /**
     * Reset navigation state
     */
    function resetNavigation() {
        navigationState.currentScreen = 'off';
        navigationState.menuHistory = [];
        navigationState.selectedItem = 0;
        
        // Trigger display refresh
        if (window.renderDisplay) {
            window.renderDisplay();
        }
    }

    /**
     * Handle soft key press (placeholder for Task 3.0)
     * @param {number} key - Soft key number (1-4)
     */
    function handleSoftKey(key) {
        console.log(`[MENU] Soft key ${key} pressed (placeholder for Task 3.0)`);
        // Full implementation in Task 3.0
    }

    /**
     * Handle navigation input (placeholder for Task 3.0)
     * @param {string} direction - 'up', 'down', 'left', 'right', 'enter'
     */
    function handleNavigation(direction) {
        console.log(`[MENU] Navigation: ${direction} (placeholder for Task 3.0)`);
        // Full implementation in Task 3.0
    }

    /**
     * Handle Alt f button (placeholder for Task 3.0)
     */
    function handleAltF() {
        console.log(`[MENU] Alt f pressed (placeholder for Task 3.0)`);
        // Full implementation in Task 3.0
    }

    /**
     * Handle Esc/Back button
     */
    function handleEsc() {
        goBack();
    }

    // Export functions to window for module access
    window.navigationState = navigationState;
    window.getNavigationState = getNavigationState;
    window.navigateToScreen = navigateToScreen;
    window.goBack = goBack;
    window.getCurrentScreen = getCurrentScreen;
    window.setSelectedItem = setSelectedItem;
    window.getSelectedItem = getSelectedItem;
    window.resetNavigation = resetNavigation;
    window.handleSoftKey = handleSoftKey;
    window.handleNavigation = handleNavigation;
    window.handleAltF = handleAltF;
    window.handleEsc = handleEsc;
})();

