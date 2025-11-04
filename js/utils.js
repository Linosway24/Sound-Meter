// Utility Functions

/**
 * Format SPL value for display
 * @param {number} value - SPL value in dB
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted value
 */
function formatSPL(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return '---';
    }
    return value.toFixed(decimals);
}

/**
 * Format time value for display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (MM:SS or HH:MM:SS)
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Generate a deterministic random number using seed
 * @param {number} seed - Random seed
 * @returns {number} Pseudorandom number between 0 and 1
 */
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * Show dialog with message
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Array} buttons - Array of {label, action} button configs
 */
function showDialog(title, message, buttons = [{ label: 'OK', action: () => hideDialog() }]) {
    const overlay = document.getElementById('dialog-overlay');
    const titleEl = document.getElementById('dialog-title');
    const messageEl = document.getElementById('dialog-message');
    const buttonsEl = document.getElementById('dialog-buttons');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    buttonsEl.innerHTML = '';
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'dialog-button';
        button.textContent = btn.label;
        button.onclick = btn.action;
        buttonsEl.appendChild(button);
    });
    
    overlay.classList.remove('hidden');
}

/**
 * Hide dialog
 */
function hideDialog() {
    const overlay = document.getElementById('dialog-overlay');
    overlay.classList.add('hidden');
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement} Element or throws error
 */
function getEl(id) {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`Element with ID "${id}" not found`);
    }
    return el;
}

