/**
 * Photo Measurement Utility
 * Run this in browser console to measure actual device photo dimensions
 * and verify percentage calculations
 */

(function() {
    'use strict';
    
    function measurePhoto() {
        const photo = document.querySelector('.device-photo');
        const frame = document.querySelector('.device-frame');
        
        if (!photo || !frame) {
            console.error('Photo or frame not found');
            return null;
        }
        
        const photoRect = photo.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        
        return {
            photo: {
                width: Math.round(photoRect.width),
                height: Math.round(photoRect.height),
                aspectRatio: (photoRect.width / photoRect.height).toFixed(4)
            },
            frame: {
                width: Math.round(frameRect.width),
                height: Math.round(frameRect.height)
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    
    // Auto-measure on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const measurements = measurePhoto();
                if (measurements) {
                    console.log('📐 Device Photo Measurements:');
                    console.log('Photo dimensions:', measurements.photo.width + '×' + measurements.photo.height + 'px');
                    console.log('Photo aspect ratio:', measurements.photo.aspectRatio);
                    console.log('Frame dimensions:', measurements.frame.width + '×' + measurements.frame.height + 'px');
                    console.log('Viewport:', measurements.viewport.width + '×' + measurements.viewport.height + 'px');
                    console.log('\n💡 If buttons are misaligned, these are the actual rendered dimensions.');
                    console.log('Reference dimensions used for conversion: 337×1226px');
                }
            }, 100);
        });
    } else {
        const measurements = measurePhoto();
        if (measurements) {
            console.log('📐 Device Photo Measurements:');
            console.log('Photo dimensions:', measurements.photo.width + '×' + measurements.photo.height + 'px');
            console.log('Photo aspect ratio:', measurements.photo.aspectRatio);
            console.log('Frame dimensions:', measurements.frame.width + '×' + measurements.frame.height + 'px');
            console.log('Viewport:', measurements.viewport.width + '×' + measurements.viewport.height + 'px');
        }
    }
    
    // Expose function globally for manual measurement
    window.measurePhoto = measurePhoto;
})();

