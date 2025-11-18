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
                // Check if items are dynamic (from state) or static (from element.items)
                let items = [];
                if (element.dynamicItems) {
                    // Parse dynamicItems path (e.g., "meterSet.items" -> state.meterSet.items)
                    const itemsPath = element.dynamicItems.split('.');
                    let itemsValue = state;
                    for (const key of itemsPath) {
                        itemsValue = itemsValue?.[key];
                    }
                    if (Array.isArray(itemsValue)) {
                        // Format items: left-aligned title, right-aligned value+unit
                        // Preserve all properties including 'enabled' for toggle functionality
                        items = itemsValue.map(item => {
                            if (item.title && (item.value !== undefined && item.value !== null)) {
                                // Check if this is a Meter Set item (has unit property) or Measure item (has value but no unit)
                                if (item.unit !== undefined) {
                                    // Meter Set items (have unit property)
                                    let valueStr = String(item.value);
                                    // Pad to 2 digits for certain items (EXCHANGE RATE, PROJECTED TIME)
                                    if (item.title === "EXCHANGE RATE" || item.title === "PROJECTED TIME") {
                                        valueStr = valueStr.padStart(2, '0');
                                    }
                                    const unit = item.unit || '';
                                    // Preserve enabled property and all other properties
                                    return { 
                                        title: item.title, 
                                        value: valueStr, 
                                        unit: unit,
                                        enabled: item.enabled // Preserve enabled property for "off" toggle
                                    };
                                } else {
                                    // Measure menu items or AUTO-RUN items (have value but no unit, displayed as "title = value" or "title value")
                                    return {
                                        title: item.title,
                                        value: String(item.value),
                                        showValue: true,
                                        showEquals: item.showEquals !== false // Preserve showEquals property, default to true
                                    };
                                }
                            } else if (item.title && item.valueKey) {
                                // Display menu items (have valueKey pointing to state property)
                                const displayState = state?.display || {};
                                let displayValue = null;
                                let displayType = item.type || 'text';
                                
                                if (item.valueKey === "backlightMode") {
                                    const backlightMode = displayState.backlightMode;
                                    // Format: "MANUAL" or "X sec" for time values
                                    // Check explicitly for "MANUAL" string, not using || because 0 is falsy
                                    if (backlightMode === "MANUAL") {
                                        displayValue = "MANUAL";
                                    } else if (typeof backlightMode === "number") {
                                        displayValue = `${backlightMode} sec`;
                                    } else {
                                        // Default to MANUAL if undefined/null, but preserve 0
                                        displayValue = backlightMode != null ? String(backlightMode) : "MANUAL";
                                    }
                                } else if (item.valueKey === "contrast") {
                                    displayValue = displayState.contrast || 0;
                                    displayType = "bar";
                                }
                                
                                return {
                                    title: item.title,
                                    value: displayValue,
                                    type: displayType,
                                    showValue: item.showValue !== false // Default to true unless explicitly false
                                };
                            } else if (item.title && item.showValue === false) {
                                // Display menu items with no value (like LANGUAGE)
                                return {
                                    title: item.title,
                                    showValue: false
                                };
                            }
                            return String(item);
                        });
                    } else {
                        items = element.items || [];
                    }
                } else {
                    items = element.items || [];
                }
                
                // Check if element has a bind property (e.g., "meterSet.selectedIndex")
                let selectedIndex = 0;
                if (element.bind) {
                    // Parse bind path (e.g., "meterSet.selectedIndex" -> state.meterSet.selectedIndex)
                    const bindPath = element.bind.split('.');
                    let value = state;
                    for (const key of bindPath) {
                        value = value?.[key];
                    }
                    selectedIndex = value ?? 0;
                } else {
                    // Default to menu.selectedIndex
                    selectedIndex = state?.menu?.selectedIndex ?? 0;
                }
                const columns = element.columns || 1;
                
                if (columns === 2) {
                    // Two-column layout: left column (first half), right column (remaining items)
                    // For language menu: left column has 4 items, right column has 2 items
                    const midPoint = Math.ceil(items.length / 2);
                    const leftColumnItems = items.slice(0, midPoint);
                    const rightColumnItems = items.slice(midPoint);
                    let html = `<div id="${element.id}" class="screen-element screen-element--textList screen-element--twoColumns">`;
                    html += '<div class="menu-column menu-column--left">';
                    leftColumnItems.forEach((item, index) => {
                        const isSelected = index === selectedIndex;
                        const isEditing = state?.meterSet?.editing && isSelected;
                        const focusValue = state?.meterSet?.focus === "value";
                        const focusOff = state?.meterSet?.focus === "off" && isEditing;
                        const focusTitle = state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected);
                        if (typeof item === 'object' && item.title) {
                            // Check if this is a display menu item (has showValue or valueKey)
                            if (item.showValue === false) {
                                // LANGUAGE - no value displayed
                                html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item.title}</div>`;
                            } else if (item.type === "bar") {
                                // CONTRAST - shows bar graph
                                const isDisplayEditing = state?.display?.editing && isSelected;
                                const displayFocusValue = state?.display?.focus === "value";
                                const displayFocusTitle = state?.display?.focus === "title" || (!state?.display?.focus && isSelected);
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = displayFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                // Contrast 0-100 maps to 0-15 segments (15 total segments)
                                // Read contrast directly from state to ensure it's always fresh
                                const contrastValue = state?.display?.contrast || 0;
                                const filledSegments = Math.min(15, Math.max(0, Math.round((contrastValue / 100) * 15)));
                                const barClass = (isDisplayEditing && displayFocusValue) ? 'menu-item__bar menu-item__bar--editing' : 'menu-item__bar';
                                html += `<span class="${barClass}">`;
                                // Create 15 vertical bar segments
                                for (let i = 0; i < 15; i++) {
                                    const isFilled = i < filledSegments;
                                    html += `<span class="bar-segment ${isFilled ? 'bar-segment-filled' : 'bar-segment-empty'}">█</span>`;
                                }
                                html += `</span>`;
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && !item.valueKey) {
                                // Measure menu items or AUTO-RUN items - shows "title = value" or "title value" format
                                const isMeasureEditing = state?.measure?.editing && isSelected;
                                const isAutoRunEditing = state?.autoRun?.editing && isSelected;
                                const measureFocusValue = state?.measure?.focus === "value";
                                const autoRunFocusValue = state?.autoRun?.focus === "value";
                                // When editing, title should NOT be highlighted - only value should be highlighted
                                const measureFocusTitle = !isMeasureEditing && (state?.measure?.focus === "title" || (!state?.measure?.focus && isSelected));
                                const autoRunFocusTitle = !isAutoRunEditing && (state?.autoRun?.focus === "title" || (!state?.autoRun?.focus && isSelected));
                                const showEquals = item.showEquals !== false; // Default to true unless explicitly false
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = (measureFocusTitle || autoRunFocusTitle) && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                if (showEquals) {
                                    html += `<span class="menu-item__equals"> = </span>`;
                                } else {
                                    html += `<span class="menu-item__spacer"> </span>`;
                                }
                                const valueClass = ((isMeasureEditing && measureFocusValue) || (isAutoRunEditing && autoRunFocusValue)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${item.value}</span>`;
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && item.valueKey) {
                                // BACKLIGHT - shows text value (MANUAL, etc.) with editing support
                                const isDisplayEditing = state?.display?.editing && isSelected;
                                const displayFocusValue = state?.display?.focus === "value";
                                const displayFocusTitle = state?.display?.focus === "title" || (!state?.display?.focus && isSelected);
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = displayFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                const valueClass = (isDisplayEditing && displayFocusValue) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${item.value}</span>`;
                                html += `</div>`;
                            } else if (item.unit) {
                                // Meter Set items (have unit property)
                                html += `<div class="menu-item menu-item--meter-set ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = focusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                
                                // Display "OFF" if enabled is false, otherwise show value+unit
                                const displayValue = (item.enabled === false) ? "OFF" : `${item.value} ${item.unit}`;
                                const valueClass = (isEditing && (focusValue || focusOff)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${displayValue}</span>`;
                                html += `</div>`;
                            } else {
                                // Fallback for other object items
                                html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item.title}</div>`;
                            }
                        } else {
                            // For language menu: diamond shows saved language, highlight shows selected language
                            const currentLanguage = state?.display?.language || "ENGLISH";
                            const hasDiamond = (item === currentLanguage);
                            const diamond = hasDiamond ? '<span class="menu-item__diamond">◆</span>' : '';
                            html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${diamond}${item}</div>`;
                        }
                    });
                    html += '</div>';
                    html += '<div class="menu-column menu-column--right">';
                    rightColumnItems.forEach((item, index) => {
                        const actualIndex = index + leftColumnItems.length; // Offset by left column count
                        const isSelected = actualIndex === selectedIndex;
                        const isEditing = state?.meterSet?.editing && isSelected;
                        const focusValue = state?.meterSet?.focus === "value";
                        const focusOff = state?.meterSet?.focus === "off" && isEditing;
                        const focusTitle = state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected);
                        if (typeof item === 'object' && item.title) {
                            // Check if this is a display menu item (has showValue or valueKey)
                            if (item.showValue === false) {
                                // LANGUAGE - no value displayed
                                html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item.title}</div>`;
                            } else if (item.type === "bar") {
                                // CONTRAST - shows bar graph
                                const isDisplayEditing = state?.display?.editing && isSelected;
                                const displayFocusValue = state?.display?.focus === "value";
                                const displayFocusTitle = state?.display?.focus === "title" || (!state?.display?.focus && isSelected);
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = displayFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                // Contrast 0-100 maps to 0-15 segments (15 total segments)
                                // Read contrast directly from state to ensure it's always fresh
                                const contrastValue = state?.display?.contrast || 0;
                                const filledSegments = Math.min(15, Math.max(0, Math.round((contrastValue / 100) * 15)));
                                const barClass = (isDisplayEditing && displayFocusValue) ? 'menu-item__bar menu-item__bar--editing' : 'menu-item__bar';
                                html += `<span class="${barClass}">`;
                                // Create 15 vertical bar segments
                                for (let i = 0; i < 15; i++) {
                                    const isFilled = i < filledSegments;
                                    html += `<span class="bar-segment ${isFilled ? 'bar-segment-filled' : 'bar-segment-empty'}">█</span>`;
                                }
                                html += `</span>`;
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && !item.valueKey) {
                                // Measure menu items or AUTO-RUN items - shows "title = value" or "title value" format
                                const isMeasureEditing = state?.measure?.editing && isSelected;
                                const isAutoRunEditing = state?.autoRun?.editing && isSelected;
                                const measureFocusValue = state?.measure?.focus === "value";
                                const autoRunFocusValue = state?.autoRun?.focus === "value";
                                // When editing, title should NOT be highlighted - only value should be highlighted
                                const measureFocusTitle = !isMeasureEditing && (state?.measure?.focus === "title" || (!state?.measure?.focus && isSelected));
                                const autoRunFocusTitle = !isAutoRunEditing && (state?.autoRun?.focus === "title" || (!state?.autoRun?.focus && isSelected));
                                const showEquals = item.showEquals !== false; // Default to true unless explicitly false
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = (measureFocusTitle || autoRunFocusTitle) && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                if (showEquals) {
                                    html += `<span class="menu-item__equals"> = </span>`;
                                } else {
                                    html += `<span class="menu-item__spacer"> </span>`;
                                }
                                const valueClass = ((isMeasureEditing && measureFocusValue) || (isAutoRunEditing && autoRunFocusValue)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${item.value}</span>`;
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && item.valueKey) {
                                // BACKLIGHT - shows text value (MANUAL, etc.) with editing support
                                const isDisplayEditing = state?.display?.editing && isSelected;
                                const displayFocusValue = state?.display?.focus === "value";
                                const displayFocusTitle = state?.display?.focus === "title" || (!state?.display?.focus && isSelected);
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = displayFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                const valueClass = (isDisplayEditing && displayFocusValue) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${item.value}</span>`;
                                html += `</div>`;
                            } else if (item.unit) {
                                // Meter Set items (have unit property)
                                html += `<div class="menu-item menu-item--meter-set ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = focusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                
                                // Display "OFF" if enabled is false, otherwise show value+unit
                                const displayValue = (item.enabled === false) ? "OFF" : `${item.value} ${item.unit}`;
                                const valueClass = (isEditing && (focusValue || focusOff)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${displayValue}</span>`;
                                html += `</div>`;
                            } else {
                                // Fallback for other object items
                                html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item.title}</div>`;
                            }
                        } else {
                            // For language menu: diamond shows saved language, highlight shows selected language
                            const currentLanguage = state?.display?.language || "ENGLISH";
                            const hasDiamond = (item === currentLanguage);
                            const diamond = hasDiamond ? '<span class="menu-item__diamond">◆</span>' : '';
                            html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${diamond}${item}</div>`;
                        }
                    });
                    html += '</div>';
                    html += '</div>';
                    return html;
                } else {
                    // Single column layout (default)
                    let html = `<div id="${element.id}" class="screen-element screen-element--textList">`;
                    items.forEach((item, index) => {
                        const isSelected = index === selectedIndex;
                        const isEditing = state?.meterSet?.editing && isSelected;
                        const focusValue = state?.meterSet?.focus === "value";
                        const focusTitle = state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected);
                        if (typeof item === 'object' && item.title) {
                            // Check if this is a display menu item (has showValue or valueKey)
                            if (item.showValue === false) {
                                // LANGUAGE - no value displayed
                                html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item.title}</div>`;
                            } else if (item.type === "bar") {
                                // CONTRAST - shows bar graph
                                const isDisplayEditing = state?.display?.editing && isSelected;
                                const displayFocusValue = state?.display?.focus === "value";
                                const displayFocusTitle = state?.display?.focus === "title" || (!state?.display?.focus && isSelected);
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = displayFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                // Contrast 0-100 maps to 0-15 segments (15 total segments)
                                // Read contrast directly from state to ensure it's always fresh
                                const contrastValue = state?.display?.contrast || 0;
                                const filledSegments = Math.min(15, Math.max(0, Math.round((contrastValue / 100) * 15)));
                                const barClass = (isDisplayEditing && displayFocusValue) ? 'menu-item__bar menu-item__bar--editing' : 'menu-item__bar';
                                html += `<span class="${barClass}">`;
                                // Create 15 vertical bar segments
                                for (let i = 0; i < 15; i++) {
                                    const isFilled = i < filledSegments;
                                    html += `<span class="bar-segment ${isFilled ? 'bar-segment-filled' : 'bar-segment-empty'}">█</span>`;
                                }
                                html += `</span>`;
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && !item.valueKey) {
                                // Measure menu items or AUTO-RUN items - shows "title = value" or "title value" format
                                const isMeasureEditing = state?.measure?.editing && isSelected;
                                const isAutoRunEditing = state?.autoRun?.editing && isSelected;
                                const measureFocusValue = state?.measure?.focus === "value";
                                const autoRunFocusValue = state?.autoRun?.focus === "value";
                                // When editing, title should NOT be highlighted - only value should be highlighted
                                const measureFocusTitle = !isMeasureEditing && (state?.measure?.focus === "title" || (!state?.measure?.focus && isSelected));
                                const autoRunFocusTitle = !isAutoRunEditing && (state?.autoRun?.focus === "title" || (!state?.autoRun?.focus && isSelected));
                                const showEquals = item.showEquals !== false; // Default to true unless explicitly false
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = (measureFocusTitle || autoRunFocusTitle) && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                if (showEquals) {
                                    html += `<span class="menu-item__equals"> = </span>`;
                                } else {
                                    html += `<span class="menu-item__spacer"> </span>`;
                                }
                                const valueClass = ((isMeasureEditing && measureFocusValue) || (isAutoRunEditing && autoRunFocusValue)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${item.value}</span>`;
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && item.valueKey) {
                                // BACKLIGHT - shows text value (MANUAL, etc.) with editing support
                                const isDisplayEditing = state?.display?.editing && isSelected;
                                const displayFocusValue = state?.display?.focus === "value";
                                const displayFocusTitle = state?.display?.focus === "title" || (!state?.display?.focus && isSelected);
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = displayFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                const valueClass = (isDisplayEditing && displayFocusValue) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${item.value}</span>`;
                                html += `</div>`;
                            } else if (item.unit) {
                                // Meter Set items (have unit property)
                                html += `<div class="menu-item menu-item--meter-set ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = focusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                
                                // Display "OFF" if enabled is false, otherwise show value+unit
                                const focusOff = state?.meterSet?.focus === "off" && isEditing;
                                const displayValue = (item.enabled === false) ? "OFF" : `${item.value} ${item.unit}`;
                                const valueClass = (isEditing && (focusValue || focusOff)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                html += `<span class="${valueClass}">${displayValue}</span>`;
                                html += `</div>`;
                            } else {
                                // Fallback for other object items
                                html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${item.title}</div>`;
                            }
                        } else {
                            // Simple string item - for language menu: diamond shows saved language, highlight shows selected language
                            const currentLanguage = state?.display?.language || "ENGLISH";
                            const hasDiamond = (item === currentLanguage);
                            const diamond = hasDiamond ? '<span class="menu-item__diamond">◆</span>' : '';
                            html += `<div class="menu-item ${isSelected ? 'menu-item--selected' : ''}">${diamond}${item}</div>`;
                        }
                    });
                    html += '</div>';
                    return html;
                }
            
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

