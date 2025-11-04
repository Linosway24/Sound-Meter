/**
 * Recalculate Percentage Positions
 * 
 * This script measures the actual rendered photo size and recalculates
 * button positions as percentages based on the actual dimensions.
 * 
 * Original pixel values are preserved, but percentages are recalculated
 * relative to the actual photo size.
 */

(function() {
    'use strict';
    
    // Original pixel positions that were working (before conversion)
    const originalPixels = {
        'soft-key--1': {top: 931, left: 107, width: 43, height: 41},
        'soft-key--2': {top: 933, left: 156, width: 55, height: 39},
        'soft-key--3': {top: 934, left: 210, width: 53, height: 39},
        'soft-key--4': {top: 929, left: 267, width: 44, height: 49},
        'nav__btn--up': {top: 1000, left: 185, width: 41, height: 77},
        'nav__btn--down': {top: 1156, left: 187, width: 45, height: 70},
        'nav__btn--left': {top: 1087, left: 99, width: 68, height: 52},
        'nav__btn--right': {top: 1096, left: 250, width: 71, height: 40},
        'nav__btn--enter': {top: 1085, left: 173, width: 71, height: 56},
        'fn-btn--altf': {top: 1030, left: 249, width: 51, height: 44},
        'fn-btn--backlight': {top: 979, left: 134, width: 44, height: 44},
        'fn-btn--runpause': {top: 1151, left: 115, width: 58, height: 50},
        'fn-btn--stop': {top: 1025, left: 117, width: 56, height: 51},
        'fn-btn--power': {top: 1148, left: 247, width: 49, height: 54},
        'lcd': {top: 714, left: 74, width: 263, height: 202}
    };
    
    function measureAndRecalculate() {
        const photo = document.querySelector('.device-photo');
        const frame = document.querySelector('.device-frame');
        
        if (!photo || !frame) {
            console.error('Photo or frame not found');
            return null;
        }
        
        const photoRect = photo.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        
        // Use frame dimensions as reference (should match photo)
        const refWidth = frameRect.width;
        const refHeight = frameRect.height;
        
        console.log('📐 Measuring actual rendered dimensions...');
        console.log('Photo:', Math.round(photoRect.width) + '×' + Math.round(photoRect.height) + 'px');
        console.log('Frame:', Math.round(refWidth) + '×' + Math.round(refHeight) + 'px');
        console.log('Viewport:', window.innerWidth + '×' + window.innerHeight + 'px');
        
        // Calculate percentages based on actual rendered size
        function toPercent(value, dimension) {
            return ((value / dimension) * 100).toFixed(3);
        }
        
        const recalculated = {};
        Object.entries(originalPixels).forEach(([name, pixels]) => {
            recalculated[name] = {
                top: toPercent(pixels.top, refHeight),
                left: toPercent(pixels.left, refWidth),
                width: toPercent(pixels.width, refWidth),
                height: toPercent(pixels.height, refHeight)
            };
        });
        
        console.log('\n✅ Recalculated percentages for current photo size:');
        console.log('\n/* Soft Keys */');
        ['soft-key--1', 'soft-key--2', 'soft-key--3', 'soft-key--4'].forEach(name => {
            const p = recalculated[name];
            console.log(`.${name} {`);
            console.log(`  top: ${p.top}%;`);
            console.log(`  left: ${p.left}%;`);
            console.log(`  width: ${p.width}%;`);
            console.log(`  height: ${p.height}%;`);
            console.log(`}`);
        });
        
        console.log('\n/* Navigation Buttons */');
        ['nav__btn--up', 'nav__btn--down', 'nav__btn--left', 'nav__btn--right', 'nav__btn--enter'].forEach(name => {
            const p = recalculated[name];
            console.log(`.${name} {`);
            console.log(`  top: ${p.top}%;`);
            console.log(`  left: ${p.left}%;`);
            console.log(`  width: ${p.width}%;`);
            console.log(`  height: ${p.height}%;`);
            console.log(`}`);
        });
        
        console.log('\n/* Function Buttons */');
        ['fn-btn--altf', 'fn-btn--backlight', 'fn-btn--runpause', 'fn-btn--stop', 'fn-btn--power'].forEach(name => {
            const p = recalculated[name];
            console.log(`.${name} {`);
            console.log(`  top: ${p.top}%;`);
            console.log(`  left: ${p.left}%;`);
            console.log(`  width: ${p.width}%;`);
            console.log(`  height: ${p.height}%;`);
            console.log(`}`);
        });
        
        console.log('\n/* LCD Region */');
        const lcd = recalculated['lcd'];
        console.log(`:root {`);
        console.log(`  --lcd-top: ${lcd.top}%;`);
        console.log(`  --lcd-left: ${lcd.left}%;`);
        console.log(`  --lcd-w: ${lcd.width}%;`);
        console.log(`  --lcd-h: ${lcd.height}%;`);
        console.log(`}`);
        
        return {
            dimensions: {width: refWidth, height: refHeight},
            percentages: recalculated
        };
    }
    
    // Wait for page to fully load and photo to render
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => recalculateAndLog(), 500);
            });
        } else {
            setTimeout(() => recalculateAndLog(), 500);
        }
    }
    
    function recalculateAndLog() {
        const result = measureAndRecalculate();
        if (result) {
            console.log('\n💡 Copy these values to update css/styles.css');
            console.log('Reference dimensions:', Math.round(result.dimensions.width) + '×' + Math.round(result.dimensions.height) + 'px');
        }
    }
    
    // Expose function globally
    window.recalculatePercentages = measureAndRecalculate;
    
    // Auto-run on load
    init();
})();

