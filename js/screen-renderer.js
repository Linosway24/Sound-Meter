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
                // Special handling for comms_edit screen
                if (element.id === "edit_item" && state?.viewId === "comms_edit") {
                    const baudRate = state?.comms?.baudRate || 9600;
                    return `<div id="${element.id}" class="screen-element screen-element--label">BAUD RATE: ${baudRate}</div>`;
                }
                // Special handling for AUTO RUN Timed Run label (TIMED-RUN - centered and highlighted)
                if (element.id === "timed_run_label" && state?.viewId === "auto_run_timed_run_params") {
                    return `<div id="${element.id}" class="screen-element screen-element--label screen-element--centered screen-element--highlighted">${element.text || 'TIMED-RUN'}</div>`;
                }
                // Special handling for AUTO RUN Timed Run duration display (centered)
                if (element.id === "duration_label" && state?.viewId === "auto_run_timed_run_params") {
                    const hour = String(state?.autoRunTimedRun?.hour || 0).padStart(2, '0');
                    const minute = String(state?.autoRunTimedRun?.minute || 0).padStart(2, '0');
                    const second = String(state?.autoRunTimedRun?.second || 2).padStart(2, '0');
                    const isEditing = state?.autoRunTimedRun?.editing;
                    const editSubField = state?.autoRunTimedRun?.editSubField;
                    let timeDisplay = `D ${hour}:${minute}:${second}`;
                    // Highlight the subfield being edited
                    if (isEditing && editSubField) {
                        if (editSubField === "hour") {
                            timeDisplay = `D <span class="menu-item__value--editing">${hour}</span>:${minute}:${second}`;
                        } else if (editSubField === "minute") {
                            timeDisplay = `D ${hour}:<span class="menu-item__value--editing">${minute}</span>:${second}`;
                        } else if (editSubField === "second") {
                            timeDisplay = `D ${hour}:${minute}:<span class="menu-item__value--editing">${second}</span>`;
                        }
                    }
                    return `<div id="${element.id}" class="screen-element screen-element--label screen-element--centered">${timeDisplay}</div>`;
                }
                // Special handling for AUTO RUN DOW days display
                if (element.id === "days_label" && state?.viewId === "auto_run_dow_params") {
                    const isSelected = state?.autoRunDow?.selectedIndex === -1; // -1 means Days is selected
                    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
                    // Check if we're in days edit mode (on line 1, which is the default when Days is selected)
                    const line = state?.autoRunDow?.lines?.[0]; // Default to line 1 for days editing
                    const isEditingDays = line?.editMode === "days";
                    const editDayIndex = line?.editDayIndex !== null && line?.editDayIndex !== undefined ? line.editDayIndex : null;
                    
                    // Show "Days" with selection styling if selected, grey if not selected
                    const selectedClass = isSelected ? 'menu-item--selected' : '';
                    let daysDisplay;
                    if (isSelected && !isEditingDays) {
                        // Selected but not editing: use menu-item__title--selected for highlighting with padding
                        daysDisplay = `<span class="menu-item__title menu-item__title--selected">Days</span> `;
                    } else if (isSelected && isEditingDays) {
                        // Selected and editing: Days title should be greyed out (like when editing values)
                        daysDisplay = `<span class="menu-item__title" style="color: #888888; padding: 0;">Days</span> `;
                    } else {
                        // Not selected: use normal grey text (same color as non-selected menu items), no padding
                        daysDisplay = `<span class="menu-item__title" style="color: #888888; padding: 0;">Days</span> `;
                    }
                    
                    // Show dashes/letters - highlight the current dash position, show stored value (letter or dash)
                    const daysHtml = dayLabels.map((day, index) => {
                        const dayValue = line?.days?.[index] || "-"; // Get stored value: "-" or day letter (S, M, T, etc.)
                        const isCurrentPosition = isEditingDays && editDayIndex === index;
                        
                        if (isCurrentPosition) {
                            // Highlight the current dash position being edited (shows "-" or letter based on stored value)
                            const displayChar = dayValue === "-" ? "-" : dayValue; // Show the stored value
                            return `<span class="menu-item__value--editing">${displayChar}</span>`;
                        } else {
                            // Show stored value (dash or letter) for non-current positions
                            return dayValue === "-" ? "-" : dayValue;
                        }
                    }).join(" ");
                    daysDisplay += daysHtml;
                    
                    // Ensure consistent height/padding to prevent layout shift - reserve space for selection padding
                    const minHeight = '1.4em'; // Reserve space for padding when selected
                    return `<div id="${element.id}" class="screen-element screen-element--label menu-item ${selectedClass}" style="min-height: ${minHeight}; padding: 0; display: flex; align-items: center;">${daysDisplay}</div><div class="menu-item--spacer-line"></div>`;
                }
                // Special handling for AUTO RUN DOW time displays
                if ((element.id === "auto_run_1" || element.id === "auto_run_2") && state?.viewId === "auto_run_dow_params") {
                    const lineIdx = element.id === "auto_run_1" ? 0 : 1;
                    const line = state?.autoRunDow?.lines?.[lineIdx];
                    const enabled = line?.enabled;
                    const startTime = line?.startTime || { hour: 0, minute: 0, second: 0 };
                    const stopTime = line?.stopTime || { hour: 0, minute: 0, second: 0 };
                    const isSelected = state?.autoRunDow?.selectedIndex === lineIdx;
                    const editMode = line?.editMode;
                    const editSubField = line?.editSubField;
                    let displayText;
                    
                    // If line is not enabled, show "---OFF---"
                    if (!enabled) {
                        displayText = `${lineIdx + 1} ---OFF---`;
                    } else {
                        // Line is enabled - show "S HH:MM:SS  D HH:MM:SS" format (S = Start, D = Duration/Stop)
                        const startHour = String(startTime.hour || 0).padStart(2, '0');
                        const startMinute = String(startTime.minute || 0).padStart(2, '0');
                        const startSecond = String(startTime.second || 0).padStart(2, '0');
                        const stopHour = String(stopTime.hour || 0).padStart(2, '0');
                        const stopMinute = String(stopTime.minute || 0).padStart(2, '0');
                        const stopSecond = String(stopTime.second || 0).padStart(2, '0');
                        displayText = `${lineIdx + 1} S ${startHour}:${startMinute}:${startSecond}  D ${stopHour}:${stopMinute}:${stopSecond}`;
                        
                        // Highlight editing fields
                        if (isSelected && editMode === "startTime") {
                            if (editSubField === "hour") {
                                displayText = `${lineIdx + 1} S <span class="menu-item__value--editing">${startHour}</span>:${startMinute}:${startSecond}  D ${stopHour}:${stopMinute}:${stopSecond}`;
                            } else if (editSubField === "minute") {
                                displayText = `${lineIdx + 1} S ${startHour}:<span class="menu-item__value--editing">${startMinute}</span>:${startSecond}  D ${stopHour}:${stopMinute}:${stopSecond}`;
                            } else if (editSubField === "second") {
                                displayText = `${lineIdx + 1} S ${startHour}:${startMinute}:<span class="menu-item__value--editing">${startSecond}</span>  D ${stopHour}:${stopMinute}:${stopSecond}`;
                            }
                        } else if (isSelected && editMode === "stopTime") {
                            if (editSubField === "hour") {
                                displayText = `${lineIdx + 1} S ${startHour}:${startMinute}:${startSecond}  D <span class="menu-item__value--editing">${stopHour}</span>:${stopMinute}:${stopSecond}`;
                            } else if (editSubField === "minute") {
                                displayText = `${lineIdx + 1} S ${startHour}:${startMinute}:${startSecond}  D ${stopHour}:<span class="menu-item__value--editing">${stopMinute}</span>:${stopSecond}`;
                            } else if (editSubField === "second") {
                                displayText = `${lineIdx + 1} S ${startHour}:${startMinute}:${startSecond}  D ${stopHour}:${stopMinute}:<span class="menu-item__value--editing">${stopSecond}</span>`;
                            }
                        }
                    }
                    const selectedClass = isSelected ? 'menu-item--selected' : '';
                    // Ensure consistent height/padding to prevent layout shift - reserve space for selection padding
                    const minHeight = '1.4em'; // Reserve space for padding when selected
                    return `<div id="${element.id}" class="screen-element screen-element--label menu-item menu-item--dow-time ${selectedClass}" style="min-height: ${minHeight}; padding: 0; display: flex; align-items: center;">${displayText}</div>`;
                }
                // Special handling for AUTO RUN Date display (only shows #1, switches via softkeys)
                if (element.id === "auto_run_date_display" && state?.viewId === "auto_run_date_params") {
                    const lineIdx = state?.autoRunDate?.selectedIndex || 0;
                    const line = state?.autoRunDate?.lines?.[lineIdx];
                    const enabled = line?.enabled;
                    const editMode = line?.editMode;
                    const editSubField = line?.editSubField;
                    let html;
                    
                    // Show AUTO-RUN #X (always highlighted, centered)
                    html = `<div class="menu-item menu-item--selected screen-element--centered-label"><span class="menu-item__title menu-item__title--selected">AUTO-RUN #${lineIdx + 1}</span></div>`;
                    html += `<div class="menu-item--spacer-line"></div>`;
                    
                    // If line is not enabled or no date/time set, show "---OFF---" (centered)
                    if (!enabled || !line.date || !line.time) {
                        html += `<div class="menu-item screen-element--centered-label">---OFF---</div>`;
                    } else {
                        const date = line.date;
                        const time = line.time;
                        const dateStr = `${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}/${date.year}`;
                        const timeStr = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:${String(time.second).padStart(2, '0')}`;
                        let valueText = `${dateStr} ${timeStr}`;
                        
                        // Highlight editing fields
                        if (editMode === "date") {
                            if (editSubField === "year") {
                                valueText = `${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}/<span class="menu-item__value--editing">${date.year}</span> ${timeStr}`;
                            } else if (editSubField === "month") {
                                valueText = `<span class="menu-item__value--editing">${String(date.month).padStart(2, '0')}</span>/${String(date.day).padStart(2, '0')}/${date.year} ${timeStr}`;
                            } else if (editSubField === "day") {
                                valueText = `${String(date.month).padStart(2, '0')}/<span class="menu-item__value--editing">${String(date.day).padStart(2, '0')}</span>/${date.year} ${timeStr}`;
                            }
                        } else if (editMode === "time") {
                            if (editSubField === "hour") {
                                valueText = `${dateStr} <span class="menu-item__value--editing">${String(time.hour).padStart(2, '0')}</span>:${String(time.minute).padStart(2, '0')}:${String(time.second).padStart(2, '0')}`;
                            } else if (editSubField === "minute") {
                                valueText = `${dateStr} ${String(time.hour).padStart(2, '0')}:<span class="menu-item__value--editing">${String(time.minute).padStart(2, '0')}</span>:${String(time.second).padStart(2, '0')}`;
                            } else if (editSubField === "second") {
                                valueText = `${dateStr} ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:<span class="menu-item__value--editing">${String(time.second).padStart(2, '0')}</span>`;
                            }
                        }
                        html += `<div class="menu-item screen-element--centered-label"><span class="menu-item__value">${valueText}</span></div>`;
                    }
                    return `<div id="${element.id}" class="screen-element screen-element--label">${html}</div>`;
                }
                return `<div id="${element.id}" class="screen-element screen-element--label">${element.text || ''}</div>`;
            
            case 'title':
                // Special handling for AUTO RUN Timed Run title - smaller font to fit
                if (element.id === "screen_title" && state?.viewId === "auto_run_timed_run_params") {
                    return `<div id="${element.id}" class="screen-element screen-element--title screen-element--title-small">${element.text || ''}</div>`;
                // Special handling for AUTO RUN Date title - add spacer after title
                } else if (element.id === "screen_title" && state?.viewId === "auto_run_date_params") {
                    return `<div id="${element.id}" class="screen-element screen-element--title">${element.text || ''}</div><div class="menu-item--spacer-line"></div>`;
                }
                return `<div id="${element.id}" class="screen-element screen-element--title">${element.text || ''}</div>`;
            
            case 'divider':
                return `<div id="${element.id}" class="screen-element screen-element--divider"></div>`;
            
            case 'textList':
                // Special handling for AUTO RUN Level-Triggered textList - MUST be checked FIRST
                if (element.id === "level_triggered_list" && state?.viewId === "auto_run_level_triggered_params") {
                    // Render as textList with dynamic values
                    const mode = state?.autoRunLevelTriggered?.mode || "LEVEL ON/OFF";
                    const action = state?.autoRunLevelTriggered?.action || "RUN/STOP";
                    const trigger = state?.autoRunLevelTriggered?.trigger || "Run/Stop";
                    const source = state?.autoRunLevelTriggered?.sourceSide === "run" 
                        ? (state?.autoRunLevelTriggered?.sourceRun || "Meter1")
                        : (state?.autoRunLevelTriggered?.sourceStop || "Meter1");
                    const level = state?.autoRunLevelTriggered?.level === "OFF" 
                        ? "OFF" 
                        : `${state?.autoRunLevelTriggered?.level || 90} dB`;
                    
                    const items = [
                        { title: "MODE", value: mode },
                        { title: "ACTION", value: action },
                        { title: "TRIGGER", value: trigger },
                        { title: "SOURCE", value: source },
                        { title: "LEVEL", value: level }
                    ];
                    
                    console.log('[SCREEN-RENDERER] Level-Triggered items:', items.map(i => `${i.title}=${i.value}`));
                    
                    const selectedIndex = state?.autoRunLevelTriggered?.selectedIndex || 0;
                    let html = `<div id="${element.id}" class="screen-element screen-element--textList">`;
                    items.forEach((item, index) => {
                        const isSelected = index === selectedIndex;
                        const isEditing = index === 4 && state?.autoRunLevelTriggered?.editingLevel; // LEVEL editing
                        html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                        const titleClass = (!isEditing && isSelected) ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                        html += `<span class="${titleClass}">${item.title}</span>`;
                        html += `<span class="menu-item__equals"> = </span>`;
                        const valueClass = isEditing ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                        html += `<span class="${valueClass}" style="color: #888888;">${item.value}</span>`;
                        html += `</div>`;
                    });
                    html += '</div>';
                    console.log('[SCREEN-RENDERER] Level-Triggered HTML:', html);
                    return html;
                }
                
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
                                    // Meter Set items or SIG INPUT items (have unit property)
                                    let valueStr;
                                    // Format decimal values to one decimal place if step < 1
                                    if (typeof item.value === 'number' && item.step && item.step < 1) {
                                        valueStr = item.value.toFixed(1);
                                    } else {
                                        valueStr = String(item.value);
                                        // Pad to 2 digits for certain items (EXCHANGE RATE, PROJECTED TIME)
                                        if (item.title === "EXCHANGE RATE" || item.title === "PROJECTED TIME") {
                                            valueStr = valueStr.padStart(2, '0');
                                        }
                                    }
                                    const unit = item.unit || '';
                                    // Preserve enabled property and all other properties
                                    return { 
                                        title: item.title, 
                                        value: valueStr, 
                                        unit: unit,
                                        enabled: item.enabled, // Preserve enabled property for "off" toggle
                                        step: item.step // Preserve step for formatting
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
                    } else if (element.dynamicItems === "autoRun.items") {
                        // AUTO-RUN menu items
                        items = state?.autoRun?.items || [];
                    } else if (element.dynamicItems === "sigInput.items") {
                        // Signal Input menu items
                        items = state?.sigInput?.items || [];
                    } else if (element.dynamicItems === "logging.items") {
                        // Logging menu items
                        items = state?.logging?.items || [];
                        console.log('[SCREEN-RENDERER] Logging items:', items.map(i => `${i.title}=${i.value}`), 'Meter:', state?.logging?.meter);
                    } else if (element.dynamicItems === "digitalOut.items") {
                        // Digital Out menu items
                        items = state?.digitalOut?.items || [];
                    } else {
                        items = element.items || [];
                    }
                } else {
                    items = element.items || [];
                }
                
                // Special handling for comms_menu: convert string items to objects with values
                if (element.id === "comms_list" && Array.isArray(items) && items.length > 0 && typeof items[0] === 'string') {
                    items = items.map(itemStr => {
                        if (itemStr === "USB") {
                            return { title: "USB", value: state?.comms?.usbMode || "Mass Storage" };
                        } else if (itemStr === "RS-232") {
                            return { title: "RS-232", value: state?.comms?.rs232Mode || "Serial" };
                        } else if (itemStr === "BAUD RATE") {
                            return { title: "BAUD RATE", value: state?.comms?.baudRate || 9600 };
                        }
                        return { title: itemStr, value: "" };
                    });
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
                    // Special handling for logging menu: custom layout
                    let leftColumnItems, rightColumnItems, bottomItem;
                    if (element.dynamicItems === "logging.items") {
                        // Check if Meter 2 mode (only 4 items: AVG, PEAK, MAX, MIN)
                        if (state?.logging?.meter === "meter2" || items.length === 4) {
                            // Meter 2: Simple list layout - all items in left column, no right column or bottom item
                            leftColumnItems = items; // All 4 items: AVG, PEAK, MAX, MIN
                            rightColumnItems = [];
                            bottomItem = null;
                        } else {
                            // Meter 1: Custom two-column layout
                            // Left column = AVG, PEAK, MAX, MIN (first 4 items)
                            // Right column = L1, L2, FILTERS (items 4-6)
                            // INTERVAL spans bottom (last item, index 7)
                            leftColumnItems = items.slice(0, 4); // AVG, PEAK, MAX, MIN
                            rightColumnItems = items.slice(4, 7); // L1, L2, FILTERS
                            bottomItem = items[7]; // INTERVAL (if exists)
                        }
                    } else {
                        // Default two-column layout: left column (first half), right column (remaining items)
                        // For language menu: left column has 4 items, right column has 2 items
                        const midPoint = Math.ceil(items.length / 2);
                        leftColumnItems = items.slice(0, midPoint);
                        rightColumnItems = items.slice(midPoint);
                        bottomItem = null;
                    }
                    let html = `<div id="${element.id}" class="screen-element screen-element--textList screen-element--twoColumns">`;
                    html += '<div class="menu-columns-wrapper">';
                    html += '<div class="menu-column menu-column--left">';
                    leftColumnItems.forEach((item, index) => {
                        // For logging menu, left column uses actual index (0, 1); for others, index matches selectedIndex
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
                                // Measure menu items, AUTO-RUN items, SIG INPUT items, or LOGGING items - shows "title = value" or "title value" format
                                const isMeasureEditing = state?.measure?.editing && isSelected;
                                const isAutoRunEditing = state?.autoRun?.editing && isSelected;
                                const isSigInputEditing = state?.sigInput?.editing && isSelected;
                                const isLoggingEditing = state?.logging?.editing && isSelected;
                                const measureFocusValue = state?.measure?.focus === "value";
                                const autoRunFocusValue = state?.autoRun?.focus === "value";
                                const sigInputFocusValue = state?.sigInput?.focus === "value";
                                const loggingFocusValue = state?.logging?.focus === "value";
                                // When editing, title should NOT be highlighted - only value should be highlighted
                                const measureFocusTitle = !isMeasureEditing && (state?.measure?.focus === "title" || (!state?.measure?.focus && isSelected));
                                const autoRunFocusTitle = !isAutoRunEditing && (state?.autoRun?.focus === "title" || (!state?.autoRun?.focus && isSelected));
                                const sigInputFocusTitle = !isSigInputEditing && (state?.sigInput?.focus === "title" || (!state?.sigInput?.focus && isSelected));
                                const loggingFocusTitle = !isLoggingEditing && (state?.logging?.focus === "title" || (!state?.logging?.focus && isSelected));
                                const showEquals = item.showEquals !== false; // Default to true unless explicitly false
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = (measureFocusTitle || autoRunFocusTitle || sigInputFocusTitle || loggingFocusTitle) && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                if (showEquals) {
                                    html += `<span class="menu-item__equals"> = </span>`;
                                } else {
                                    html += `<span class="menu-item__spacer"> </span>`;
                                }
                                const valueClass = ((isMeasureEditing && measureFocusValue) || (isAutoRunEditing && autoRunFocusValue) || (isSigInputEditing && sigInputFocusValue) || (isLoggingEditing && loggingFocusValue)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                // Format value with unit if present, or use intervalOptions display for INTERVAL
                                let displayValue;
                                if (item.intervalOptions) {
                                    const intervalOption = item.intervalOptions.find(opt => opt.value === item.value);
                                    displayValue = intervalOption ? intervalOption.display : `${item.value} sec`;
                                } else if (item.unit) {
                                    displayValue = `${item.value} ${item.unit}`;
                                } else {
                                    displayValue = item.value;
                                }
                                html += `<span class="${valueClass}">${displayValue}</span>`;
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
                                // Meter Set items or SIG INPUT items (have unit property)
                                // Check editing state for both meterSet and sigInput
                                const isMeterSetEditing = state?.meterSet?.editing && isSelected;
                                const isSigInputEditing = state?.sigInput?.editing && isSelected;
                                const meterSetFocusValue = state?.meterSet?.focus === "value";
                                const sigInputFocusValue = state?.sigInput?.focus === "value";
                                const meterSetFocusOff = state?.meterSet?.focus === "off" && isMeterSetEditing;
                                const meterSetFocusTitle = !isMeterSetEditing && (state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected));
                                const sigInputFocusTitle = !isSigInputEditing && (state?.sigInput?.focus === "title" || (!state?.sigInput?.focus && isSelected));
                                
                                const isEditingValue = (isMeterSetEditing && (meterSetFocusValue || meterSetFocusOff)) || (isSigInputEditing && sigInputFocusValue);
                                html += `<div class="menu-item menu-item--meter-set ${isSelected ? 'menu-item--selected' : ''} ${isEditingValue ? 'menu-item--editing-value' : ''}">`;
                                const titleClass = ((meterSetFocusTitle || sigInputFocusTitle) && isSelected) ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                
                                // Display "OFF" if enabled is false, otherwise show value+unit
                                // Format decimal values to one decimal place
                                let formattedValue = item.value;
                                if (typeof item.value === 'number' && item.step && item.step < 1) {
                                    formattedValue = item.value.toFixed(1);
                                }
                                const displayValue = (item.enabled === false) ? "OFF" : `${formattedValue} ${item.unit}`;
                                const valueClass = isEditingValue ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
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
                        // For logging menu, right column starts at index 4; for others, offset by left column count
                        const actualIndex = element.dynamicItems === "logging.items" ? index + 4 : index + leftColumnItems.length;
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
                                // Measure menu items, AUTO-RUN items, SIG INPUT items, or LOGGING items - shows "title = value" or "title value" format
                                const isMeasureEditing = state?.measure?.editing && isSelected;
                                const isAutoRunEditing = state?.autoRun?.editing && isSelected;
                                const isSigInputEditing = state?.sigInput?.editing && isSelected;
                                const isLoggingEditing = state?.logging?.editing && isSelected;
                                const measureFocusValue = state?.measure?.focus === "value";
                                const autoRunFocusValue = state?.autoRun?.focus === "value";
                                const sigInputFocusValue = state?.sigInput?.focus === "value";
                                const loggingFocusValue = state?.logging?.focus === "value";
                                // When editing, title should NOT be highlighted - only value should be highlighted
                                const measureFocusTitle = !isMeasureEditing && (state?.measure?.focus === "title" || (!state?.measure?.focus && isSelected));
                                const autoRunFocusTitle = !isAutoRunEditing && (state?.autoRun?.focus === "title" || (!state?.autoRun?.focus && isSelected));
                                const sigInputFocusTitle = !isSigInputEditing && (state?.sigInput?.focus === "title" || (!state?.sigInput?.focus && isSelected));
                                const loggingFocusTitle = !isLoggingEditing && (state?.logging?.focus === "title" || (!state?.logging?.focus && isSelected));
                                const showEquals = item.showEquals !== false; // Default to true unless explicitly false
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = (measureFocusTitle || autoRunFocusTitle || sigInputFocusTitle || loggingFocusTitle) && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                if (showEquals) {
                                    html += `<span class="menu-item__equals"> = </span>`;
                                } else {
                                    html += `<span class="menu-item__spacer"> </span>`;
                                }
                                const valueClass = ((isMeasureEditing && measureFocusValue) || (isAutoRunEditing && autoRunFocusValue) || (isSigInputEditing && sigInputFocusValue) || (isLoggingEditing && loggingFocusValue)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                // Format value with unit if present, or use intervalOptions display for INTERVAL
                                let displayValue;
                                if (item.intervalOptions) {
                                    const intervalOption = item.intervalOptions.find(opt => opt.value === item.value);
                                    displayValue = intervalOption ? intervalOption.display : `${item.value} sec`;
                                } else if (item.unit) {
                                    displayValue = `${item.value} ${item.unit}`;
                                } else {
                                    displayValue = item.value;
                                }
                                html += `<span class="${valueClass}">${displayValue}</span>`;
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
                                // Meter Set items or SIG INPUT items (have unit property)
                                // Check editing state for both meterSet and sigInput
                                const isMeterSetEditing = state?.meterSet?.editing && isSelected;
                                const isSigInputEditing = state?.sigInput?.editing && isSelected;
                                const meterSetFocusValue = state?.meterSet?.focus === "value";
                                const sigInputFocusValue = state?.sigInput?.focus === "value";
                                const meterSetFocusOff = state?.meterSet?.focus === "off" && isMeterSetEditing;
                                const meterSetFocusTitle = !isMeterSetEditing && (state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected));
                                const sigInputFocusTitle = !isSigInputEditing && (state?.sigInput?.focus === "title" || (!state?.sigInput?.focus && isSelected));
                                
                                const isEditingValue = (isMeterSetEditing && (meterSetFocusValue || meterSetFocusOff)) || (isSigInputEditing && sigInputFocusValue);
                                html += `<div class="menu-item menu-item--meter-set ${isSelected ? 'menu-item--selected' : ''} ${isEditingValue ? 'menu-item--editing-value' : ''}">`;
                                const titleClass = ((meterSetFocusTitle || sigInputFocusTitle) && isSelected) ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                
                                // Display "OFF" if enabled is false, otherwise show value+unit
                                // Format decimal values to one decimal place
                                let formattedValue = item.value;
                                if (typeof item.value === 'number' && item.step && item.step < 1) {
                                    formattedValue = item.value.toFixed(1);
                                }
                                const displayValue = (item.enabled === false) ? "OFF" : `${formattedValue} ${item.unit}`;
                                const valueClass = isEditingValue ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
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
                    html += '</div>'; // Close right column
                    html += '</div>'; // Close menu-columns-wrapper
                    
                    // Render INTERVAL at bottom spanning both columns (for logging menu - Meter 1 only)
                    if (bottomItem && element.dynamicItems === "logging.items" && state?.logging?.meter !== "meter2") {
                        const intervalIndex = 7; // INTERVAL is at index 7
                        const isSelected = intervalIndex === selectedIndex;
                        const isLoggingEditing = state?.logging?.editing && isSelected;
                        const loggingFocusValue = state?.logging?.focus === "value";
                        const loggingFocusTitle = !isLoggingEditing && (state?.logging?.focus === "title" || (!state?.logging?.focus && isSelected));
                        
                        html += '<div class="menu-item menu-item--display menu-item--span-bottom">';
                        const titleClass = loggingFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                        html += `<span class="${titleClass}">${bottomItem.title}</span>`;
                        html += `<span class="menu-item__equals"> = </span>`;
                        const valueClass = (isLoggingEditing && loggingFocusValue) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                        // Format INTERVAL display value
                        let displayValue;
                        if (bottomItem.intervalOptions) {
                            const intervalOption = bottomItem.intervalOptions.find(opt => opt.value === bottomItem.value);
                            displayValue = intervalOption ? intervalOption.display : `${bottomItem.value} sec`;
                        } else if (bottomItem.unit) {
                            displayValue = `${bottomItem.value} ${bottomItem.unit}`;
                        } else {
                            displayValue = bottomItem.value;
                        }
                        html += `<span class="${valueClass}">${displayValue}</span>`;
                        html += '</div>';
                    }
                    
                    html += '</div>';
                    return html;
                } else {
                    // Single column layout (default)
                    let html = `<div id="${element.id}" class="screen-element screen-element--textList">`;
                    items.forEach((item, index) => {
                        const isSelected = index === selectedIndex;
                        
                        // Special handling for AUTO RUN menu: add spacing before second item (VIEW/SET PARAMETERS)
                        if (element.id === "auto_run_list" && index === 1) {
                            // Add 2 empty spacer lines before VIEW/SET PARAMETERS
                            html += `<div class="menu-item menu-item--spacer-line"></div>`;
                            html += `<div class="menu-item menu-item--spacer-line"></div>`;
                        }
                        const isEditing = state?.meterSet?.editing && isSelected;
                        const focusValue = state?.meterSet?.focus === "value";
                        const focusTitle = state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected);
                        // Special handling for datetime_menu items
                        if (element.id === "datetime_list" && typeof item === 'string') {
                            const isDatetimeEditing = state?.datetime?.editing && isSelected;
                            const editField = state?.datetime?.editField;
                            const editSubField = state?.datetime?.editSubField;
                            let displayValue = "";
                            if (item === "YEAR") {
                                displayValue = String(state?.datetime?.year || 2024);
                            } else if (item === "MONTH") {
                                displayValue = String(state?.datetime?.month || 1);
                            } else if (item === "DAY") {
                                displayValue = String(state?.datetime?.day || 1);
                            } else if (item === "TIME") {
                                const hour = String(state?.datetime?.hour || 12).padStart(2, '0');
                                const minute = String(state?.datetime?.minute || 0).padStart(2, '0');
                                const second = String(state?.datetime?.second || 0).padStart(2, '0');
                                displayValue = `${hour}:${minute}:${second}`;
                            }
                            html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                            const titleClass = (!isDatetimeEditing && isSelected) ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                            html += `<span class="${titleClass}">${item}</span>`;
                            html += `<span class="menu-item__equals"> = </span>`;
                            // For TIME, highlight the subfield being edited
                            if (item === "TIME" && isDatetimeEditing && editSubField) {
                                const parts = displayValue.split(':');
                                html += `<span class="${editSubField === 'hour' ? 'menu-item__value menu-item__value--editing' : 'menu-item__value'}">${parts[0]}</span>`;
                                html += `<span>:</span>`;
                                html += `<span class="${editSubField === 'minute' ? 'menu-item__value menu-item__value--editing' : 'menu-item__value'}">${parts[1]}</span>`;
                                html += `<span>:</span>`;
                                html += `<span class="${editSubField === 'second' ? 'menu-item__value menu-item__value--editing' : 'menu-item__value'}">${parts[2]}</span>`;
                            } else if (isDatetimeEditing && editField && item.toLowerCase() === editField && editSubField === item.toLowerCase()) {
                                // For YEAR, MONTH, DAY - highlight the whole value when editing
                                html += `<span class="menu-item__value menu-item__value--editing">${displayValue}</span>`;
                            } else {
                                html += `<span class="menu-item__value">${displayValue}</span>`;
                            }
                            html += `</div>`;
                        } else if (typeof item === 'object' && item.title) {
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
                            } else if (item.title && item.title.startsWith("LOGIC")) {
                                // LOGIC 1-3: display 3 positions (HI/LO) with editing position highlighted
                                const isDigitalOutEditing = state?.digitalOut?.editing && isSelected;
                                const digitalOutFocusValue = state?.digitalOut?.focus === "value";
                                const digitalOutFocusTitle = !isDigitalOutEditing && (state?.digitalOut?.focus === "title" || (!state?.digitalOut?.focus && isSelected));
                                const editingPosition = item.editingPosition || 0;
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = digitalOutFocusTitle && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                html += `<span class="menu-item__equals"> = </span>`;
                                // Display 3 positions, highlight the one being edited
                                const valueArray = Array.isArray(item.value) ? item.value : ["HI", "HI", "HI"];
                                valueArray.forEach((val, pos) => {
                                    const isEditingThisPos = isDigitalOutEditing && digitalOutFocusValue && pos === editingPosition;
                                    const posClass = isEditingThisPos ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                    html += `<span class="${posClass}">${val}</span>`;
                                    if (pos < valueArray.length - 1) {
                                        html += `<span class="menu-item__spacer"> </span>`;
                                    }
                                });
                                html += `</div>`;
                            } else if (item.value !== undefined && item.value !== null && !item.unit && !item.valueKey) {
                                // Measure menu items, AUTO-RUN items, SIG INPUT items, LOGGING items, or DIGITAL OUT items - shows "title = value" or "title value" format
                                const isMeasureEditing = state?.measure?.editing && isSelected;
                                const isAutoRunEditing = state?.autoRun?.editing && isSelected;
                                const isSigInputEditing = state?.sigInput?.editing && isSelected;
                                const isLoggingEditing = state?.logging?.editing && isSelected;
                                const measureFocusValue = state?.measure?.focus === "value";
                                const autoRunFocusValue = state?.autoRun?.focus === "value";
                                const sigInputFocusValue = state?.sigInput?.focus === "value";
                                const loggingFocusValue = state?.logging?.focus === "value";
                                // When editing, title should NOT be highlighted - only value should be highlighted
                                const measureFocusTitle = !isMeasureEditing && (state?.measure?.focus === "title" || (!state?.measure?.focus && isSelected));
                                const autoRunFocusTitle = !isAutoRunEditing && (state?.autoRun?.focus === "title" || (!state?.autoRun?.focus && isSelected));
                                const sigInputFocusTitle = !isSigInputEditing && (state?.sigInput?.focus === "title" || (!state?.sigInput?.focus && isSelected));
                                const loggingFocusTitle = !isLoggingEditing && (state?.logging?.focus === "title" || (!state?.logging?.focus && isSelected));
                                const showEquals = item.showEquals !== false; // Default to true unless explicitly false
                                html += `<div class="menu-item menu-item--display ${isSelected ? 'menu-item--selected' : ''}">`;
                                const titleClass = (measureFocusTitle || autoRunFocusTitle || sigInputFocusTitle || loggingFocusTitle) && isSelected ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                if (showEquals) {
                                    html += `<span class="menu-item__equals"> = </span>`;
                                } else {
                                    html += `<span class="menu-item__spacer"> </span>`;
                                }
                                const valueClass = ((isMeasureEditing && measureFocusValue) || (isAutoRunEditing && autoRunFocusValue) || (isSigInputEditing && sigInputFocusValue) || (isLoggingEditing && loggingFocusValue)) ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
                                // Format value with unit if present, or use intervalOptions display for INTERVAL
                                let displayValue;
                                if (item.intervalOptions) {
                                    const intervalOption = item.intervalOptions.find(opt => opt.value === item.value);
                                    displayValue = intervalOption ? intervalOption.display : `${item.value} sec`;
                                } else if (item.unit) {
                                    displayValue = `${item.value} ${item.unit}`;
                                } else {
                                    displayValue = item.value;
                                }
                                html += `<span class="${valueClass}">${displayValue}</span>`;
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
                                // Meter Set items or SIG INPUT items (have unit property)
                                // Check editing state for both meterSet and sigInput
                                const isMeterSetEditing = state?.meterSet?.editing && isSelected;
                                const isSigInputEditing = state?.sigInput?.editing && isSelected;
                                const meterSetFocusValue = state?.meterSet?.focus === "value";
                                const sigInputFocusValue = state?.sigInput?.focus === "value";
                                const meterSetFocusOff = state?.meterSet?.focus === "off" && isMeterSetEditing;
                                const meterSetFocusTitle = !isMeterSetEditing && (state?.meterSet?.focus === "title" || (!state?.meterSet?.focus && isSelected));
                                const sigInputFocusTitle = !isSigInputEditing && (state?.sigInput?.focus === "title" || (!state?.sigInput?.focus && isSelected));
                                
                                const isEditingValue = (isMeterSetEditing && (meterSetFocusValue || meterSetFocusOff)) || (isSigInputEditing && sigInputFocusValue);
                                html += `<div class="menu-item menu-item--meter-set ${isSelected ? 'menu-item--selected' : ''} ${isEditingValue ? 'menu-item--editing-value' : ''}">`;
                                const titleClass = ((meterSetFocusTitle || sigInputFocusTitle) && isSelected) ? 'menu-item__title menu-item__title--selected' : 'menu-item__title';
                                html += `<span class="${titleClass}">${item.title}</span>`;
                                
                                // Display "OFF" if enabled is false, otherwise show value+unit
                                // Format decimal values to one decimal place
                                let formattedValue = item.value;
                                if (typeof item.value === 'number' && item.step && item.step < 1) {
                                    formattedValue = item.value.toFixed(1);
                                }
                                const displayValue = (item.enabled === false) ? "OFF" : `${formattedValue} ${item.unit}`;
                                const valueClass = isEditingValue ? 'menu-item__value menu-item__value--editing' : 'menu-item__value';
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
                    
                    // Special handling for COMMS menu: Add "NO FIX" line after BAUD RATE when RS-232 is GPS
                    if (element.id === "comms_list" && state?.comms?.rs232Mode === "GPS") {
                        // Check if BAUD RATE is the last item
                        const lastItem = items.length > 0 ? items[items.length - 1] : null;
                        console.log(`[SCREEN-RENDERER] RS-232 is GPS - checking for NO FIX. Items: ${items.length}, Last item title: ${lastItem?.title}, Last item value: ${lastItem?.value}`);
                        
                        if (lastItem && lastItem.title === "BAUD RATE") {
                            console.log(`[SCREEN-RENDERER] Rendering "NO FIX" line after BAUD RATE`);
                            // Add "NO FIX" as a normal menu item (matches other menu items styling)
                            html += `<div class="menu-item">NO FIX</div>`;
                            console.log(`[SCREEN-RENDERER] "NO FIX" HTML added successfully`);
                        } else {
                            console.log(`[SCREEN-RENDERER] BAUD RATE not found as last item, cannot add NO FIX`);
                        }
                    }
                    
                    html += '</div>'; // Close screen-element--textList container
                    
                    // Debug: Log final HTML structure for COMMS menu when RS-232 is GPS
                    if (element.id === "comms_list" && state?.comms?.rs232Mode === "GPS") {
                        console.log(`[SCREEN-RENDERER] Final HTML contains "NO FIX": ${html.includes('NO FIX')}`);
                        console.log(`[SCREEN-RENDERER] HTML length: ${html.length}, Items rendered: ${items.length}`);
                        // Log the full HTML structure for debugging
                        console.log(`[SCREEN-RENDERER] Full HTML structure:`, html);
                    }
                    
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
            
            // Special handling for AUTO RUN menu: show softkeys based on mode (DOW or Date)
            if (state?.viewId === "auto_run_menu") {
                const currentMode = state?.autoRun?.items?.[0]?.value;
                if (currentMode === "DOW") {
                    // Show -1/+1, -2/+2 based on DOW line enabled state
                    // On AUTO RUN menu: show + if line is enabled (for easier testing)
                    if (i === 0) {
                        // Softkey 1: show -1 or +1
                        const line = state?.autoRunDow?.lines?.[0];
                        label = line?.enabled ? "+1" : "-1";
                    } else if (i === 1) {
                        // Softkey 2: show -2 or +2
                        const line = state?.autoRunDow?.lines?.[1];
                        label = line?.enabled ? "+2" : "-2";
                    } else {
                        label = ''; // Clear other softkeys when DOW is selected
                    }
                } else if (currentMode === "Date") {
                    // Show -1, -2, -3, -4 when Date mode is selected
                    if (i === 0) {
                        const line = state?.autoRunDate?.lines?.[0];
                        label = line?.enabled ? "+1" : "-1";
                    } else if (i === 1) {
                        const line = state?.autoRunDate?.lines?.[1];
                        label = line?.enabled ? "+2" : "-2";
                    } else if (i === 2) {
                        const line = state?.autoRunDate?.lines?.[2];
                        label = line?.enabled ? "+3" : "-3";
                    } else if (i === 3) {
                        const line = state?.autoRunDate?.lines?.[3];
                        label = line?.enabled ? "+4" : "-4";
                    }
                } else {
                    // Not DOW or Date mode: clear all softkeys
                    label = '';
                }
            }
            // Replace placeholders
            else if (label === '{modeLabel}') {
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
            } else if (label === "Meter" && state?.viewId === "logging_menu") {
                // Show "Meter 1" or "Meter 2" based on logging.meter state
                label = state?.logging?.meter === "meter2" ? "Meter 2" : "Meter 1";
            } else if ((label === "-1" || label === "-2" || label === "-3" || label === "-4") && state?.viewId === "auto_run_dow_params") {
                // Show -1/+1, -2/+2 based on line enabled state (on DOW params screen, enabled = +, disabled = -)
                const lineIdx = label === "-1" ? 0 : (label === "-2" ? 1 : (label === "-3" ? 2 : 3));
                const line = state?.autoRunDow?.lines?.[lineIdx];
                // On DOW params screen, show + if enabled, - if disabled
                label = line?.enabled ? `+${lineIdx + 1}` : `-${lineIdx + 1}`;
            } else if ((label === "-1" || label === "-2" || label === "-3" || label === "-4") && state?.viewId === "auto_run_date_params") {
                // Show -1/+1, -2/+2, etc. based on line enabled state
                const lineIdx = label === "-1" ? 0 : label === "-2" ? 1 : label === "-3" ? 2 : 3;
                const line = state?.autoRunDate?.lines?.[lineIdx];
                label = line?.enabled ? `+${lineIdx + 1}` : `-${lineIdx + 1}`;
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

