/**
 * Fix Percentages - Convert current pixel values to percentages
 * 
 * This script reads the CURRENT pixel values from CSS and converts them
 * to percentages based on the ACTUAL rendered photo dimensions.
 * 
 * Run this in console after positioning buttons correctly at 1920×1080
 */

(function() {
    'use strict';
    
    function fixPercentages() {
        const photo = document.querySelector('.device-photo');
        const frame = document.querySelector('.device-frame');
        
        if (!photo || !frame) {
            console.error('Photo or frame not found');
            return null;
        }
        
        const photoRect = photo.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        
        // Use frame dimensions (should match photo)
        const refWidth = frameRect.width;
        const refHeight = frameRect.height;
        
        console.log('📐 Current Photo Dimensions:');
        console.log('Width:', Math.round(refWidth), 'px');
        console.log('Height:', Math.round(refHeight), 'px');
        console.log('Viewport:', window.innerWidth + '×' + window.innerHeight + 'px');
        console.log('\n🔍 Reading current pixel values from CSS...\n');
        
        // Read current pixel values from computed styles
        const buttons = {
            'soft-key--1': document.querySelector('.soft-key--1'),
            'soft-key--2': document.querySelector('.soft-key--2'),
            'soft-key--3': document.querySelector('.soft-key--3'),
            'soft-key--4': document.querySelector('.soft-key--4'),
            'nav__btn--up': document.querySelector('.nav__btn--up'),
            'nav__btn--down': document.querySelector('.nav__btn--down'),
            'nav__btn--left': document.querySelector('.nav__btn--left'),
            'nav__btn--right': document.querySelector('.nav__btn--right'),
            'nav__btn--enter': document.querySelector('.nav__btn--enter'),
            'fn-btn--altf': document.querySelector('.fn-btn--altf'),
            'fn-btn--backlight': document.querySelector('.fn-btn--backlight'),
            'fn-btn--runpause': document.querySelector('.fn-btn--runpause'),
            'fn-btn--stop': document.querySelector('.fn-btn--stop'),
            'fn-btn--power': document.querySelector('.fn-btn--power'),
            'lcd': document.querySelector('.lcd')
        };
        
        function getPixelValue(el, prop) {
            if (!el) return 0;
            const style = window.getComputedStyle(el);
            const value = style[prop];
            if (value && value.endsWith('px')) {
                return parseFloat(value);
            }
            // If percentage, calculate from frame
            if (value && value.endsWith('%')) {
                const percent = parseFloat(value) / 100;
                if (prop === 'top' || prop === 'height') {
                    return refHeight * percent;
                } else {
                    return refWidth * percent;
                }
            }
            return 0;
        }
        
        function toPercent(value, dimension) {
            return ((value / dimension) * 100).toFixed(3);
        }
        
        const converted = {};
        
        Object.entries(buttons).forEach(([name, el]) => {
            if (!el) {
                console.warn('Element not found:', name);
                return;
            }
            
            const top = getPixelValue(el, 'top');
            const left = getPixelValue(el, 'left');
            const width = getPixelValue(el, 'width');
            const height = getPixelValue(el, 'height');
            
            converted[name] = {
                pixels: {top, left, width, height},
                percentages: {
                    top: toPercent(top, refHeight),
                    left: toPercent(left, refWidth),
                    width: toPercent(width, refWidth),
                    height: toPercent(height, refHeight)
                }
            };
        });
        
        console.log('✅ Converted to percentages:\n');
        console.log('/* LCD Variables */');
        const lcd = converted['lcd'];
        if (lcd) {
            console.log(`:root {`);
            console.log(`  --lcd-top: ${lcd.percentages.top}%;`);
            console.log(`  --lcd-left: ${lcd.percentages.left}%;`);
            console.log(`  --lcd-w: ${lcd.percentages.width}%;`);
            console.log(`  --lcd-h: ${lcd.percentages.height}%;`);
            console.log(`}`);
            console.log('');
        }
        
        console.log('/* Soft Keys */');
        ['soft-key--1', 'soft-key--2', 'soft-key--3', 'soft-key--4'].forEach(name => {
            const c = converted[name];
            if (c) {
                console.log(`.${name} {`);
                console.log(`  top: ${c.percentages.top}%;`);
                console.log(`  left: ${c.percentages.left}%;`);
                console.log(`  width: ${c.percentages.width}%;`);
                console.log(`  height: ${c.percentages.height}%;`);
                console.log(`}`);
            }
        });
        
        console.log('\n/* Navigation Buttons */');
        ['nav__btn--up', 'nav__btn--down', 'nav__btn--left', 'nav__btn--right', 'nav__btn--enter'].forEach(name => {
            const c = converted[name];
            if (c) {
                console.log(`.${name} {`);
                console.log(`  top: ${c.percentages.top}%;`);
                console.log(`  left: ${c.percentages.left}%;`);
                console.log(`  width: ${c.percentages.width}%;`);
                console.log(`  height: ${c.percentages.height}%;`);
                console.log(`}`);
            }
        });
        
        console.log('\n/* Function Buttons */');
        ['fn-btn--altf', 'fn-btn--backlight', 'fn-btn--runpause', 'fn-btn--stop', 'fn-btn--power'].forEach(name => {
            const c = converted[name];
            if (c) {
                console.log(`.${name} {`);
                console.log(`  top: ${c.percentages.top}%;`);
                console.log(`  left: ${c.percentages.left}%;`);
                console.log(`  width: ${c.percentages.width}%;`);
                console.log(`  height: ${c.percentages.height}%;`);
                console.log(`}`);
            }
        });
        
        console.log('\n💡 Copy these values to css/styles.css');
        console.log(`Reference dimensions: ${Math.round(refWidth)}×${Math.round(refHeight)}px`);
        
        // Also display on page
        showResultsOnPage(converted, refWidth, refHeight);
        
        return {
            dimensions: {width: refWidth, height: refHeight},
            converted
        };
    }
    
    function showResultsOnPage(converted, refWidth, refHeight) {
        // Remove existing overlay if any
        const existing = document.getElementById('fix-percentages-results');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'fix-percentages-results';
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 30000;
            background: #151a22;
            border: 2px solid #2a5f8f;
            border-radius: 8px;
            padding: 20px;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: 11px;
            color: #e6e6e6;
        `;
        
        let css = '/* LCD Variables */\n';
        const lcd = converted['lcd'];
        if (lcd) {
            css += `:root {\n`;
            css += `  --lcd-top: ${lcd.percentages.top}%;\n`;
            css += `  --lcd-left: ${lcd.percentages.left}%;\n`;
            css += `  --lcd-w: ${lcd.percentages.width}%;\n`;
            css += `  --lcd-h: ${lcd.percentages.height}%;\n`;
            css += `}\n\n`;
        }
        
        css += '/* Soft Keys */\n';
        ['soft-key--1', 'soft-key--2', 'soft-key--3', 'soft-key--4'].forEach(name => {
            const c = converted[name];
            if (c) {
                css += `.${name} {\n`;
                css += `  top: ${c.percentages.top}%;\n`;
                css += `  left: ${c.percentages.left}%;\n`;
                css += `  width: ${c.percentages.width}%;\n`;
                css += `  height: ${c.percentages.height}%;\n`;
                css += `}\n`;
            }
        });
        
        css += '\n/* Navigation Buttons */\n';
        ['nav__btn--up', 'nav__btn--down', 'nav__btn--left', 'nav__btn--right', 'nav__btn--enter'].forEach(name => {
            const c = converted[name];
            if (c) {
                css += `.${name} {\n`;
                css += `  top: ${c.percentages.top}%;\n`;
                css += `  left: ${c.percentages.left}%;\n`;
                css += `  width: ${c.percentages.width}%;\n`;
                css += `  height: ${c.percentages.height}%;\n`;
                css += `}\n`;
            }
        });
        
        css += '\n/* Function Buttons */\n';
        ['fn-btn--altf', 'fn-btn--backlight', 'fn-btn--runpause', 'fn-btn--stop', 'fn-btn--power'].forEach(name => {
            const c = converted[name];
            if (c) {
                css += `.${name} {\n`;
                css += `  top: ${c.percentages.top}%;\n`;
                css += `  left: ${c.percentages.left}%;\n`;
                css += `  width: ${c.percentages.width}%;\n`;
                css += `  height: ${c.percentages.height}%;\n`;
                css += `}\n`;
            }
        });
        
        overlay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0; color: #4ade80;">Converted to Percentages</h3>
                <button id="close-fix-results" style="
                    background: #1e4d72;
                    border: 1px solid #2a5f8f;
                    border-radius: 4px;
                    padding: 4px 12px;
                    color: #e6e6e6;
                    cursor: pointer;
                    font-size: 11px;
                ">Close</button>
            </div>
            <div style="background: #0a0e14; padding: 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10px; opacity: 0.8;">
                Reference: ${Math.round(refWidth)}×${Math.round(refHeight)}px | Viewport: ${window.innerWidth}×${window.innerHeight}px
            </div>
            <textarea readonly style="
                width: 100%;
                height: 400px;
                background: #0a0e14;
                color: #a3d5ff;
                border: 1px solid #2a3340;
                border-radius: 4px;
                padding: 12px;
                font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                font-size: 11px;
                line-height: 1.5;
                resize: vertical;
            ">${css}</textarea>
            <div style="margin-top: 12px; font-size: 10px; opacity: 0.7;">
                💡 Select all text above and copy, then paste into css/styles.css
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        document.getElementById('close-fix-results').addEventListener('click', () => {
            overlay.remove();
        });
        
        // Select text automatically
        const textarea = overlay.querySelector('textarea');
        textarea.select();
    }
    
    // Add button to trigger
    function addFixButton() {
        let button = document.getElementById('fix-percentages-btn');
        if (!button) {
            button = document.createElement('button');
            button.id = 'fix-percentages-btn';
            button.textContent = '🔧 Fix Percentages';
            button.style.cssText = `
                position: fixed;
                top: 10px;
                left: 400px;
                z-index: 10000;
                background: #4ade80;
                border: 1px solid #22c55e;
                border-radius: 6px;
                padding: 8px 14px;
                font-size: 12px;
                font-weight: 600;
                color: #0a0e14;
                cursor: pointer;
                font-family: ui-sans-serif, system-ui, sans-serif;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            `;
            button.addEventListener('click', () => {
                fixPercentages();
            });
            document.body.appendChild(button);
        }
    }
    
    // Expose globally
    window.fixPercentages = fixPercentages;
    
    // Add button on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addFixButton, 500);
        });
    } else {
        setTimeout(addFixButton, 500);
    }
})();

