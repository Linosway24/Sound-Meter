(() => {
    'use strict';

    const isLocalContext = () => (
        location.protocol === 'file:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1'
    );

    /**
     * Elements considered editable by the positioning tool
     */
    const TARGET_SELECTOR = [
        '.overlay-layer .lcd',
        '.overlay-layer .soft-key',
        '.overlay-layer .fn-btn',
        '.overlay-layer .nav__btn',
        '.overlay-layer .dialog__btn'
    ].join(',');

    let isEnabled = false;
    let selectedEl = null;
    const originalInline = new WeakMap();
    
    // Drag state
    let isDragging = false;
    let isResizing = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartLeft = 0;
    let dragStartTop = 0;
    let dragStartWidth = 0;
    let dragStartHeight = 0;
    let dragElement = null;
    let resizeHandle = null; // 'se' for bottom-right, 'nw' for top-left

    // Panel elements (created at runtime)
    let panelEl = null;
    let elNameEl = null;
    let inputTop = null;
    let inputLeft = null;
    let inputWidth = null;
    let inputHeight = null;

    function createPanel() {
        if (panelEl) return panelEl;

        panelEl = document.createElement('div');
        panelEl.id = 'pos-debug-panel';
        panelEl.setAttribute('role', 'dialog');
        panelEl.setAttribute('aria-label', 'Positioning Debug Panel');

        const title = document.createElement('div');
        title.className = 'pos-debug__title';
        title.textContent = 'Positioning Debug';

        const selectedRow = document.createElement('div');
        selectedRow.className = 'pos-debug__row';
        const selectedLabel = document.createElement('span');
        selectedLabel.className = 'pos-debug__label';
        selectedLabel.textContent = 'Selected:';
        elNameEl = document.createElement('span');
        elNameEl.className = 'pos-debug__value';
        elNameEl.textContent = '—';
        selectedRow.appendChild(selectedLabel);
        selectedRow.appendChild(elNameEl);

        const grid = document.createElement('div');
        grid.className = 'pos-debug__grid';

        function addNumber(label, id) {
            const wrap = document.createElement('label');
            wrap.className = 'pos-debug__field';
            const span = document.createElement('span');
            span.textContent = label;
            const input = document.createElement('input');
            input.type = 'number';
            input.id = id;
            input.step = '1';
            input.addEventListener('keydown', (e) => {
                if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                    e.preventDefault();
                    const delta = e.key === 'ArrowUp' ? 10 : -10;
                    input.value = String((parseFloat(input.value || '0') || 0) + delta);
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            wrap.appendChild(span);
            wrap.appendChild(input);
            grid.appendChild(wrap);
            return input;
        }

        inputTop = addNumber('Top (px)', 'pos-debug-top');
        inputLeft = addNumber('Left (px)', 'pos-debug-left');
        inputWidth = addNumber('Width (px)', 'pos-debug-width');
        inputHeight = addNumber('Height (px)', 'pos-debug-height');

        const actions = document.createElement('div');
        actions.className = 'pos-debug__actions';

        const btnSave = document.createElement('button');
        btnSave.type = 'button';
        btnSave.className = 'pos-debug__btn pos-debug__btn--primary';
        btnSave.textContent = 'Save to CSS';
        btnSave.addEventListener('click', onSaveToCss);

        const btnExport = document.createElement('button');
        btnExport.type = 'button';
        btnExport.className = 'pos-debug__btn';
        btnExport.textContent = 'Export CSS';
        btnExport.addEventListener('click', onExportCss);

        const btnCopy = document.createElement('button');
        btnCopy.type = 'button';
        btnCopy.className = 'pos-debug__btn';
        btnCopy.textContent = 'Copy Coordinates';
        btnCopy.addEventListener('click', onCopyCoords);

        const btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.className = 'pos-debug__btn';
        btnReset.textContent = 'Reset';
        btnReset.addEventListener('click', onResetSelected);

        const btnClose = document.createElement('button');
        btnClose.type = 'button';
        btnClose.className = 'pos-debug__btn pos-debug__btn--close';
        btnClose.textContent = '×';
        btnClose.setAttribute('aria-label', 'Close debug panel');
        btnClose.addEventListener('click', disable);

        actions.appendChild(btnSave);
        actions.appendChild(btnExport);
        actions.appendChild(btnCopy);
        actions.appendChild(btnReset);
        actions.appendChild(btnClose);

        panelEl.appendChild(title);
        panelEl.appendChild(selectedRow);
        panelEl.appendChild(grid);
        panelEl.appendChild(actions);

        document.body.appendChild(panelEl);

        // Hook changes - auto-save after a short delay (only if file handle exists)
        let saveTimeout = null;
        const scheduleAutoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (selectedEl && cssFileHandle) {
                    onSaveToCss(true); // Silent auto-save if file handle exists
                }
            }, 1000); // Auto-save 1 second after last change
        };

        [
            [inputTop, 'top'],
            [inputLeft, 'left'],
            [inputWidth, 'width'],
            [inputHeight, 'height']
        ].forEach(([input, prop]) => {
            input.addEventListener('change', () => {
                applyValue(prop, parseFloat(input.value));
                scheduleAutoSave();
            });
        });

        return panelEl;
    }

    function applyValue(prop, value) {
        if (!selectedEl || !isFinite(value)) return;
        // Always use px inline, overriding any right/bottom
        if (prop === 'top') {
            selectedEl.style.top = value + 'px';
            selectedEl.style.bottom = '';
        } else if (prop === 'left') {
            selectedEl.style.left = value + 'px';
            selectedEl.style.right = '';
        } else if (prop === 'width') {
            selectedEl.style.width = value + 'px';
        } else if (prop === 'height') {
            selectedEl.style.height = value + 'px';
        }
        updateSelectedInputs();
        updateDebugLabels();
    }

    function getOffsetParentRect(el) {
        const op = el.offsetParent || el.parentElement || document.body;
        return op.getBoundingClientRect();
    }

    function getMetricsPx(el) {
        const opRect = getOffsetParentRect(el);
        const r = el.getBoundingClientRect();
        return {
            top: Math.round(r.top - opRect.top),
            left: Math.round(r.left - opRect.left),
            width: Math.round(r.width),
            height: Math.round(r.height)
        };
    }

    function getPreferredSelector(el) {
        const classes = Array.from(el.classList || []);
        // Prioritize: classes with -- (BEM modifiers like nav__btn--up) > classes with __ > first class
        const withModifier = classes.find(c => c.includes('--'));
        if (withModifier) return '.' + withModifier;
        
        const withDoubleUnderscore = classes.find(c => c.includes('__'));
        if (withDoubleUnderscore) return '.' + withDoubleUnderscore;
        
        return '.' + (classes[0] || 'element');
    }

    function updateSelectedInputs() {
        if (!selectedEl) return;
        const m = getMetricsPx(selectedEl);
        inputTop.value = String(m.top);
        inputLeft.value = String(m.left);
        inputWidth.value = String(m.width);
        inputHeight.value = String(m.height);
        elNameEl.textContent = getPreferredSelector(selectedEl).slice(1);
    }

    // Removed updateDebugLabels - no longer showing coordinate labels on buttons

    function onExportCss() {
        if (!selectedEl) return;
        const sel = getPreferredSelector(selectedEl);
        const m = getMetricsPx(selectedEl);
        const css = `${sel} {\n  top: ${m.top}px;\n  left: ${m.left}px;\n  width: ${m.width}px;\n  height: ${m.height}px;\n}`;
        copyText(css, 'CSS copied to clipboard!');
    }

    function onCopyCoords() {
        if (!selectedEl) return;
        const m = getMetricsPx(selectedEl);
        const txt = `top: ${m.top}px, left: ${m.left}px, width: ${m.width}px, height: ${m.height}px`;
        copyText(txt, 'Coordinates copied!');
    }

    let cssFileHandle = null;
    let cssContentCache = null;

    async function getCssFileHandle() {
        if (cssFileHandle) return cssFileHandle;

        if ('showOpenFilePicker' in window) {
            try {
                // First, try to fetch the CSS to get current content
                try {
                    const response = await fetch('css/styles.css');
                    if (response.ok) {
                        cssContentCache = await response.text();
                    }
                } catch (e) {
                    // Fetch failed, will read from file picker
                }

                // Ask user to select the CSS file (first time only)
                [cssFileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'CSS files',
                        accept: { 'text/css': ['.css'] }
                    }],
                    suggestedName: 'styles.css'
                });
                return cssFileHandle;
            } catch (err) {
                // User cancelled or browser doesn't support
                return null;
            }
        }
        return null;
    }

    async function onSaveToCss(silent = false) {
        if (!selectedEl) return;

        const sel = getPreferredSelector(selectedEl);
        const m = getMetricsPx(selectedEl);
        const newRule = `${sel} {\n  top: ${m.top}px;\n  left: ${m.left}px;\n  width: ${m.width}px;\n  height: ${m.height}px;\n}`;

        // Try File System Access API (Chrome/Edge)
        const handle = await getCssFileHandle();
        if (handle) {
            try {
                // Read current file content
                let content = cssContentCache;
                if (!content) {
                    const file = await handle.getFile();
                    content = await file.text();
                }

                // Update or add the CSS rule
                const escapedSel = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const ruleRegex = new RegExp(`(\\s*)${escapedSel}\\s*\\{[^}]*\\}`, 'g');
                
                if (ruleRegex.test(content)) {
                    content = content.replace(ruleRegex, (match, indent) => {
                        return indent + newRule;
                    });
                } else {
                    // Append if not found
                    content += '\n\n' + newRule;
                }

                // Write back
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();

                // Update cache
                cssContentCache = content;

                if (!silent) alert(`✓ Saved ${sel} to CSS file!`);
                return true;
            } catch (err) {
                console.error('File save error:', err);
                if (!silent) alert('Could not save to file. Falling back to download.');
                return await saveViaDownload(newRule, sel);
            }
        } else {
            // Fallback: download the updated CSS section
            if (!silent) {
                return await saveViaDownload(newRule, sel);
            }
            return false;
        }
    }

    async function saveViaDownload(cssRule, selector) {
        // Create a blob and download link
        const blob = new Blob([cssRule], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selector.replace(/[^a-z0-9]/gi, '_')}_update.css`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('CSS downloaded. Paste into css/styles.css');
        return false;
    }

    function copyText(text, successMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => alert(successMsg)).catch(() => alert(text));
        } else {
            // Fallback
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                alert(successMsg);
            } catch (_) {
                alert(text);
            }
        }
    }

    function onResetSelected() {
        if (!selectedEl) return;
        const orig = originalInline.get(selectedEl);
        if (orig) {
            selectedEl.style.top = orig.top;
            selectedEl.style.left = orig.left;
            selectedEl.style.width = orig.width;
            selectedEl.style.height = orig.height;
            selectedEl.style.right = orig.right;
            selectedEl.style.bottom = orig.bottom;
        } else {
            // Clear inline styles if we didn't capture any
            selectedEl.style.top = '';
            selectedEl.style.left = '';
            selectedEl.style.width = '';
            selectedEl.style.height = '';
            selectedEl.style.right = '';
            selectedEl.style.bottom = '';
        }
        updateSelectedInputs();
    }

    function isNearCorner(rect, x, y, threshold = 20) {
        const nearTopLeft = (Math.abs(x - rect.left) < threshold && Math.abs(y - rect.top) < threshold);
        const nearBottomRight = (Math.abs(x - rect.right) < threshold && Math.abs(y - rect.bottom) < threshold);
        return { nearTopLeft, nearBottomRight };
    }

    function handleMouseDown(e) {
        const target = e.target.closest(TARGET_SELECTOR);
        if (!target) return;
        
        e.preventDefault();
        selectElement(target);
        
        const rect = target.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;
        
        // Check if clicking near a corner (resize handle)
        const corner = isNearCorner(rect, clickX, clickY);
        
        if (corner.nearTopLeft || corner.nearBottomRight) {
            // Start resize
            isResizing = true;
            resizeHandle = corner.nearTopLeft ? 'nw' : 'se';
        } else {
            // Start drag
            isDragging = true;
        }
        
        dragElement = target;
        const opRect = getOffsetParentRect(target);
        dragStartX = clickX;
        dragStartY = clickY;
        dragStartLeft = rect.left - opRect.left;
        dragStartTop = rect.top - opRect.top;
        dragStartWidth = rect.width;
        dragStartHeight = rect.height;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    function handleMouseMove(e) {
        if ((!isDragging && !isResizing) || !dragElement) return;
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        if (isResizing) {
            // Resize mode
            let newWidth, newHeight, newLeft, newTop;
            
            if (resizeHandle === 'se') {
                // Bottom-right corner - resize width and height
                newWidth = Math.max(20, Math.round(dragStartWidth + deltaX));
                newHeight = Math.max(20, Math.round(dragStartHeight + deltaY));
                newLeft = dragStartLeft;
                newTop = dragStartTop;
            } else {
                // Top-left corner - resize width, height, and adjust position
                newWidth = Math.max(20, Math.round(dragStartWidth - deltaX));
                newHeight = Math.max(20, Math.round(dragStartHeight - deltaY));
                newLeft = Math.round(dragStartLeft + deltaX);
                newTop = Math.round(dragStartTop + deltaY);
            }
            
            dragElement.style.width = newWidth + 'px';
            dragElement.style.height = newHeight + 'px';
            dragElement.style.left = newLeft + 'px';
            dragElement.style.top = newTop + 'px';
            dragElement.style.right = '';
            dragElement.style.bottom = '';
            
            // Update inputs in real-time
            if (dragElement === selectedEl) {
                inputWidth.value = String(newWidth);
                inputHeight.value = String(newHeight);
                inputLeft.value = String(newLeft);
                inputTop.value = String(newTop);
            }
        } else {
            // Drag mode
            const opRect = getOffsetParentRect(dragElement);
            const newLeft = Math.round(dragStartLeft + deltaX);
            const newTop = Math.round(dragStartTop + deltaY);
            
            dragElement.style.left = newLeft + 'px';
            dragElement.style.top = newTop + 'px';
            dragElement.style.right = '';
            dragElement.style.bottom = '';
            
            // Update inputs in real-time
            if (dragElement === selectedEl) {
                inputLeft.value = String(newLeft);
                inputTop.value = String(newTop);
            }
        }
    }
    
    function handleMouseUp(e) {
        if (!isDragging && !isResizing) return;
        
        const wasResizing = isResizing;
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Trigger auto-save after drag/resize ends
        if (dragElement && cssFileHandle) {
            setTimeout(() => {
                onSaveToCss(true); // Silent auto-save
            }, 100);
        }
        
        dragElement = null;
    }
    
    function handleClick(e) {
        // Only handle click if not dragging or resizing
        if (isDragging || isResizing) return;
        const target = e.target.closest(TARGET_SELECTOR);
        if (!target) return;
        e.preventDefault();
        selectElement(target);
    }

    function selectElement(el) {
        if (selectedEl === el) {
            updateSelectedInputs();
            return;
        }
        if (selectedEl) {
            selectedEl.classList.remove('debug-selected');
        }
        selectedEl = el;
        if (!originalInline.has(el)) {
            originalInline.set(el, {
                top: el.style.top,
                left: el.style.left,
                width: el.style.width,
                height: el.style.height,
                right: el.style.right,
                bottom: el.style.bottom
            });
        }
        el.classList.add('debug-selected');
        updateSelectedInputs();
    }

    function enable() {
        if (isEnabled) return;
        isEnabled = true;
        document.body.classList.add('debug-mode');
        createPanel();
        panelEl.style.display = 'block';

        document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
            el.classList.add('debug-highlight');
            el.addEventListener('mousedown', handleMouseDown);
        });

        document.addEventListener('click', handleClick, true);
    }

    function disable() {
        if (!isEnabled) return;
        isEnabled = false;
        document.body.classList.remove('debug-mode');
        if (panelEl) panelEl.style.display = 'none';
        
        // Stop any active drag/resize
        if (isDragging || isResizing) {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            isDragging = false;
            isResizing = false;
            resizeHandle = null;
            dragElement = null;
        }
        
        document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
            el.classList.remove('debug-highlight', 'debug-selected');
            el.removeEventListener('mousedown', handleMouseDown);
        });
        document.removeEventListener('click', handleClick, true);
        selectedEl = null;
        if (elNameEl) elNameEl.textContent = '—';
        [inputTop, inputLeft, inputWidth, inputHeight].forEach(i => { if (i) i.value = ''; });
    }

    function toggle() { (isEnabled ? disable : enable)(); }

    function onKeydown(e) {
        // Mac: Cmd+D, Win/Linux: Ctrl+D
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggle();
        }
    }

    function init() {
        // Only activate on localhost or file scheme
        if (!isLocalContext()) return;
        document.addEventListener('keydown', onKeydown);
    }

    // Styles for panel can be in CSS, but add a minimal guard if missing
    init();
})();


