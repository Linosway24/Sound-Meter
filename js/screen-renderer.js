/**
 * Screen Renderer Module
 * Renders screens based on screen-atlas.json and FSM state
 */

(() => {
    'use strict';

    let screenAtlas = null;
    let isInitialized = false;

    /**
     * Load screen-atlas.json
     */
    async function loadScreenAtlas() {
        try {
            // Detect correct path based on current page location
            const isInTestDir = window.location.pathname.includes('/test/');
            const atlasPath = isInTestDir ? '../data/screen-atlas.json' : 'data/screen-atlas.json';
            
            const response = await fetch(atlasPath);
            if (!response.ok) {
                throw new Error(`Failed to load screen-atlas.json: ${response.status}`);
            }
            screenAtlas = await response.json();
            console.log('[SCREEN-RENDERER] Screen atlas loaded:', screenAtlas.length, 'screens');
            return true;
        } catch (error) {
            console.error('[SCREEN-RENDERER] Error loading screen-atlas.json:', error);
            return false;
        }
    }

    /**
     * Get screen definition from atlas
     * @param {string} screenId - Screen ID
     * @returns {Object|null} Screen definition
     */
    function getScreenDefinition(screenId) {
        if (!screenAtlas) return null;
        return screenAtlas.find(screen => screen.id === screenId) || null;
    }

    /**
     * Render an element based on its type
     * @param {Object} element - Element definition
     * @param {Object} state - FSM state
     * @returns {string} HTML string
     */
    function renderElement(element, state) {
        if (!element) return '';

        switch (element.type) {
            case 'label':
                return `<div id="${element.id}" class="screen-element screen-element--label">${element.text || ''}</div>`;
            
            case 'title':
                return `<div id="${element.id}" class="screen-element screen-element--title">${element.text || ''}</div>`;
            
            case 'divider':
                return `<div id="${element.id}" class="screen-element screen-element--divider"></div>`;
            
            case 'textList':
                const items = element.items || [];
                const selectedIndex = state?.menu?.selectedIndex ?? 0;
                let html = `<div id="${element.id}" class="screen-element screen-element--textList">`;
                items.forEach((item, index) => {
                    const isSelected = index === selectedIndex;
                    html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item}</div>`;
                });
                html += '</div>';
                return html;
            
            case 'timer':
                const runtime = state?.measurement?.runtime ?? 0;
                const format = element.format || 'hh:mm:ss';
                const hours = Math.floor(runtime / 3600);
                const minutes = Math.floor((runtime % 3600) / 60);
                const seconds = runtime % 60;
                const formatted = format
                    .replace('hh', String(hours).padStart(2, '0'))
                    .replace('mm', String(minutes).padStart(2, '0'))
                    .replace('ss', String(seconds).padStart(2, '0'));
                return `<div id="${element.id}" class="screen-element screen-element--timer">${formatted}</div>`;
            
            case 'softKeyRow':
                // Metadata element, not rendered (soft keys rendered separately)
                return '';
            
            default:
                return '';
        }
    }

    /**
     * Render soft keys
     * @param {Array} softkeys - Soft key labels
     * @param {Object} state - FSM state
     * @returns {Array<string>} Array of 4 soft key labels
     */
    function renderSoftKeys(softkeys, state) {
        if (!softkeys || softkeys.length === 0) {
            return ['', '', '', ''];
        }

        const labels = [];
        for (let i = 0; i < 4; i++) {
            let label = softkeys[i] || '';
            // Replace placeholders
            if (label === '{modeLabel}') {
                // Use slmLabelIndex from FSM state: 0 = "SLM", 1 = "1/1", 2 = "1/3"
                if (state?.slmLabelIndex !== undefined) {
                    const labelMap = ['SLM', '1/1', '1/3'];
                    label = labelMap[state.slmLabelIndex] || 'SLM';
                } else if (state?.ui?.measureTypeLabel) {
                    // Fallback to old ui.measureTypeLabel if present
                    label = state.ui.measureTypeLabel;
                } else {
                    label = 'SLM'; // Default
                }
            }
            labels.push(label);
        }
        return labels;
    }

    /**
     * Render a screen based on screenId
     * @param {string} screenId - Screen ID from FSM state
     * @param {Object} state - FSM state
     * @returns {Object} { mainHTML, statusHTML, softkeys }
     */
    function renderScreen(screenId, state) {
        const screenDef = getScreenDefinition(screenId);
        
        if (!screenDef) {
            console.warn('[SCREEN-RENDERER] Screen not found:', screenId);
            return {
                mainHTML: '',
                statusHTML: '',
                softkeys: ['', '', '', '']
            };
        }

        // Handle elementsRef (reference to another screen's elements)
        let elements = screenDef.elements;
        if (screenDef.elementsRef && !elements) {
            const refScreen = getScreenDefinition(screenDef.elementsRef);
            if (refScreen) {
                elements = refScreen.elements;
            }
        }

        // Render main area
        let mainHTML = '';
        if (elements) {
            elements.forEach(element => {
                // Skip softKeyRow - it's metadata, not rendered content
                if (element.type === 'softKeyRow') {
                    return;
                }
                
                // Check visibility conditions
                if (element.visibleWhen) {
                    const condition = element.visibleWhen;
                    if (condition.anySelectedEquals) {
                        const selectedIndex = state?.menu?.selectedIndex ?? 0;
                        const menuItems = ["VIEW PAST STUDIES", "VIEW CURRENT STUDY", "VIEW SESSION", "SETUP", "UNIT INFO"];
                        const selectedItem = menuItems[selectedIndex];
                        if (!condition.anySelectedEquals.includes(selectedItem)) {
                            return; // Skip this element
                        }
                    }
                }
                mainHTML += renderElement(element, state);
            });
        }

        // Render soft keys
        const softkeys = renderSoftKeys(screenDef.softkeys, state);

        return {
            mainHTML,
            statusHTML: '', // Status area can be added later if needed
            softkeys
        };
    }

    /**
     * Initialize screen renderer
     */
    async function init() {
        if (isInitialized) return true;
        
        const loaded = await loadScreenAtlas();
        if (loaded) {
            isInitialized = true;
            return true;
        }
        return false;
    }

    // Export to window
    window.initScreenRenderer = init;
    window.renderScreen = renderScreen;
    window.getScreenDefinition = getScreenDefinition;
})();

