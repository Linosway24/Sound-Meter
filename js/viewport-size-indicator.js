/**
 * Viewport Size Indicator & Window Resize Helper
 * Shows current viewport size and allows resizing to standard sizes
 */

(function() {
    'use strict';
    
    // Create viewport size indicator
    function createSizeIndicator() {
        let indicator = document.getElementById('viewport-size-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'viewport-size-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 10000;
                background: rgba(21, 26, 34, 0.95);
                border: 1px solid #2a3340;
                border-radius: 6px;
                padding: 8px 12px;
                font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                font-size: 12px;
                color: #e6e6e6;
                pointer-events: auto;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(indicator);
        }
        return indicator;
    }
    
    function updateSizeDisplay() {
        const indicator = createSizeIndicator();
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const photo = document.querySelector('.device-photo');
        const frame = document.querySelector('.device-frame');
        let photoInfo = '';
        
        if (photo && frame) {
            const photoRect = photo.getBoundingClientRect();
            const frameRect = frame.getBoundingClientRect();
            photoInfo = `<br>Photo: ${Math.round(photoRect.width)}×${Math.round(photoRect.height)}px`;
        }
        
        const isTarget = width === 1920 && height === 1080;
        const color = isTarget ? '#4ade80' : '#fbbf24';
        
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: ${color}; font-weight: 600;">
                    Viewport: ${width}×${height}px
                </span>
                ${isTarget ? '<span style="color: #4ade80;">✓</span>' : ''}
            </div>
            ${photoInfo}
            <div style="margin-top: 6px; font-size: 10px; opacity: 0.7;">
                Target: 1920×1080px
            </div>
        `;
    }
    
    // Function to resize window (may be restricted by browser)
    function resizeTo1920x1080() {
        // Try multiple methods
        let success = false;
        
        // Method 1: Standard resizeTo (usually blocked)
        if (window.resizeTo) {
            try {
                window.resizeTo(1920, 1080);
                if (window.innerWidth === 1920 && window.innerHeight === 1080) {
                    success = true;
                }
            } catch (e) {
                console.log('resizeTo failed:', e);
            }
        }
        
        // Method 2: Try with outerWidth/outerHeight (accounting for browser chrome)
        if (!success && window.outerWidth && window.outerHeight) {
            try {
                const widthDiff = window.outerWidth - window.innerWidth;
                const heightDiff = window.outerHeight - window.innerHeight;
                window.resizeTo(1920 + widthDiff, 1080 + heightDiff);
                if (window.innerWidth === 1920 && window.innerHeight === 1080) {
                    success = true;
                }
            } catch (e) {
                console.log('resizeTo with offsets failed:', e);
            }
        }
        
        if (!success) {
            showResizeInstructions();
        } else {
            updateSizeDisplay();
            // Show success message
            const indicator = createSizeIndicator();
            const originalBg = indicator.style.background;
            indicator.style.background = '#4ade80';
            setTimeout(() => {
                indicator.style.background = originalBg;
            }, 1000);
        }
    }
    
    function showResizeInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'resize-instructions';
        instructions.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 20000;
            background: #151a22;
            border: 2px solid #2a5f8f;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            font-family: ui-sans-serif, system-ui, sans-serif;
            color: #e6e6e6;
        `;
        
        instructions.innerHTML = `
            <h3 style="margin: 0 0 12px 0; color: #fbbf24;">Resize to 1920×1080</h3>
            <p style="margin: 0 0 12px 0; line-height: 1.5;">
                Browser security prevents automatic resizing. Try one of these:
            </p>
            <div style="background: #1b2230; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                <strong style="color: #4ade80;">Method 1 - Console Command:</strong>
                <div style="margin-top: 6px; font-family: ui-monospace, monospace; font-size: 11px; background: #0a0e14; padding: 8px; border-radius: 4px; color: #a3d5ff;">
                    window.resizeTo(1920, 1080);
                </div>
            </div>
            <div style="background: #1b2230; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                <strong style="color: #4ade80;">Method 2 - Manual:</strong>
                <div style="margin-top: 6px; font-size: 11px;">
                    Manually resize your browser window to 1920×1080<br>
                    Watch the indicator in the top-left - it turns green when correct
                </div>
            </div>
            <div style="text-align: right; margin-top: 16px;">
                <button id="close-instructions" style="
                    background: #1e4d72;
                    border: 1px solid #2a5f8f;
                    border-radius: 6px;
                    padding: 8px 16px;
                    color: #e6e6e6;
                    cursor: pointer;
                    font-size: 12px;
                ">Got it</button>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        document.getElementById('close-instructions').addEventListener('click', () => {
            instructions.remove();
        });
        
        // Auto-close on click outside
        instructions.addEventListener('click', (e) => {
            if (e.target === instructions) {
                instructions.remove();
            }
        });
    }
    
    // Add resize button
    function addResizeButton() {
        let button = document.getElementById('resize-to-1920-btn');
        if (!button) {
            button = document.createElement('button');
            button.id = 'resize-to-1920-btn';
            button.textContent = '📐 Resize to 1920×1080';
            button.style.cssText = `
                position: fixed;
                top: 10px;
                left: 220px;
                z-index: 10000;
                background: #1e4d72;
                border: 1px solid #2a5f8f;
                border-radius: 6px;
                padding: 8px 14px;
                font-size: 12px;
                font-weight: 600;
                color: #e6e6e6;
                cursor: pointer;
                font-family: ui-sans-serif, system-ui, sans-serif;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s;
            `;
            button.addEventListener('mouseenter', () => {
                button.style.background = '#225a84';
                button.style.transform = 'scale(1.05)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = '#1e4d72';
                button.style.transform = 'scale(1)';
            });
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                resizeTo1920x1080();
            });
            document.body.appendChild(button);
        }
    }
    
    // Expose functions globally
    window.resizeTo1920x1080 = resizeTo1920x1080;
    window.showViewportSize = updateSizeDisplay;
    
    // Initialize
    function init() {
        updateSizeDisplay();
        addResizeButton();
        
        // Update on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateSizeDisplay, 100);
        });
        
        // Update periodically (in case photo loads/changes)
        setInterval(updateSizeDisplay, 1000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

