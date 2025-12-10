# Task 5.0 Testing Guide - Measurement Engine

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Task 5.0 - Measurement Engine  
**Scope:** SPL Data Generation, Measurement Calculations, Weighting/Time-Constant Filters, Range Logic, Real-Time Updates

---

## Overview

This testing guide covers Task 5.0 implementation:
- **Sub-task 5.1-5.3:** SPL Data Generator (deterministic RNG, SPL generation)
- **Sub-task 5.4-5.7:** Measurement Module (Run/Pause/Stop state management)
- **Sub-task 5.8-5.13:** Measurement Calculations (Leq, Lmax, Lmin, SEL, Peak, Dose)
- **Sub-task 5.14-5.15:** Weighting and Time-Constant Filters (A/C/Z, Slow/Fast/Impulse)
- **Sub-task 5.16-5.17:** Range Logic and Over-Range Warnings
- **Sub-task 5.18:** Real-Time Display Updates
- **Sub-task 5.19:** Integration Testing

**Prerequisites:**
- Complete Phase 4 testing
- SLM navigation and UI working correctly
- Run/Pause/Stop functionality working
- Softkey handlers (F/S/I, R/C/Z/F) working

---

## Prerequisites Check

### P0: Console Errors Check
**Test:** Load the page and check browser console
**Expected:**
- ✅ No red error messages
- ✅ Console may show initialization logs
- ✅ No errors related to `Simulator`, `Measurement`, or measurement calculations
- ✅ Modules loaded: `window.Simulator` and `window.Measurement` should be defined

**Pass/Fail:** [x ]

### P1: Module Loading Check
**Test:** In browser console, run:
```javascript
// Check if modules are loaded
console.log('Simulator:', typeof window.Simulator);
console.log('Measurement:', typeof window.Measurement);

// Check Simulator methods
if (window.Simulator) {
    console.log('Simulator methods:', {
        init: typeof window.Simulator.init,
        generateSample: typeof window.Simulator.generateSample,
        setBaseLevel: typeof window.Simulator.setBaseLevel,
        setVariation: typeof window.Simulator.setVariation,
        reset: typeof window.Simulator.reset,
        getState: typeof window.Simulator.getState
    });
}

// Check Measurement methods
if (window.Measurement) {
    console.log('Measurement methods:', {
        init: typeof window.Measurement.init,
        updateConfig: typeof window.Measurement.updateConfig,
        reset: typeof window.Measurement.reset,
        start: typeof window.Measurement.start,
        pause: typeof window.Measurement.pause,
        stop: typeof window.Measurement.stop,
        processSample: typeof window.Measurement.processSample,
        getResults: typeof window.Measurement.getResults,
        getState: typeof window.Measurement.getState
    });
}
```
**Expected:**
- ✅ `Simulator` is defined and is an object
- ✅ `Measurement` is defined and is an object
- ✅ Simulator has methods: `init`, `generateSample`, `setBaseLevel`, `setVariation`, `reset`, `getState` (all should be "function")
- ✅ Measurement has methods: `init`, `updateConfig`, `reset`, `start`, `pause`, `stop`, `processSample`, `getResults`, `getState` (all should be "function")

**Pass/Fail:** [ x]

### P2: FSM Measurement State Structure
**Test:** In browser console, run: `window.getMainFSMState().measurement`
**Expected:**
- ✅ Returns object with properties:
  - `runtime: 0`
  - `state: "stopped"`
  - `isRunning: false`
  - `seed: 12345`
  - `currentSPL: 0`
  - `leq: 0`
  - `lmax: 0`
  - `lmin: 0`
  - `sel: 0`
  - `peak: 0`
  - `dose: 0`
  - `overRange: false`
  - `overRangeWarning: false`

**Pass/Fail:** [x ]

---

## Test 1: Simulator Module (Sub-tasks 5.1-5.3)

### 1.1 Simulator Initialization
**Test:**
1. In browser console, run:
```javascript
window.Simulator.init(12345, { baseLevel: 70, variation: 5 });
const state = window.Simulator.getState();
console.log('Simulator state:', state);
```
**Expected:**
- ✅ No errors
- ✅ State object returned with:
  - `seed: 12345`
  - `baseLevel: 70`
  - `variation: 5`
  - `sampleCount: 0`

**Pass/Fail:** [x ]

### 1.2 Deterministic RNG (Sub-task 5.2)
**Test:**
1. In browser console, run:
```javascript
// First run
window.Simulator.init(12345);
const samples1 = [];
for (let i = 0; i < 10; i++) {
    samples1.push(window.Simulator.generateSample());
}

// Reset and run again with same seed
window.Simulator.init(12345);
const samples2 = [];
for (let i = 0; i < 10; i++) {
    samples2.push(window.Simulator.generateSample());
}

console.log('Samples 1 (raw):', samples1);
console.log('Samples 2 (raw):', samples2);
console.log('Match:', JSON.stringify(samples1) === JSON.stringify(samples2));

// Format for display (1 decimal place for dB)
const formatted1 = samples1.map(v => v.toFixed(1));
const formatted2 = samples2.map(v => v.toFixed(1));
console.log('Samples 1 (formatted to 1 decimal):', formatted1);
console.log('Samples 2 (formatted to 1 decimal):', formatted2);
```
**Expected:**
- ✅ Same seed produces identical sequence
- ✅ `samples1` and `samples2` are identical (raw values match exactly)
- ✅ All values are numbers (dB)
- ✅ Values are in reasonable range (30-130 dB typical)
- ✅ Raw values may have many decimal places (e.g., 63.76633669003499) - this is correct internally
- ✅ When formatted to 1 decimal place, values are readable (e.g., 63.8 dB)
- ✅ **Note:** Raw precision is fine for calculations; formatting to 1-2 decimals is for display only

**Pass/Fail:** [ x]

### 1.3 SPL Data Generation (Sub-task 5.3)
**Test:**
1. In browser console, run:
```javascript
window.Simulator.init(12345, { baseLevel: 75, variation: 5 });
const samples = [];
for (let i = 0; i < 20; i++) {
    samples.push(window.Simulator.generateSample());
}
console.log('SPL samples (raw):', samples);
console.log('SPL samples (formatted to 1 decimal):', samples.map(v => v.toFixed(1)));
const min = Math.min(...samples);
const max = Math.max(...samples);
const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
console.log('Min:', min.toFixed(1), 'dB');
console.log('Max:', max.toFixed(1), 'dB');
console.log('Average:', avg.toFixed(1), 'dB');
console.log('Range:', (max - min).toFixed(1), 'dB');
```
**Expected:**
- ✅ All samples are numbers
- ✅ Values are in range 30-130 dB
- ✅ Values show variation (not all the same)
- ✅ Average is close to baseLevel (75 dB ± a few dB)
- ✅ Min is typically around 68-72 dB (baseLevel - variation - trend/noise components)
- ✅ Max is typically around 78-82 dB (baseLevel + variation + trend/noise components)
- ✅ Range is typically 8-12 dB (variation ±5, plus trend ±2, noise ±1.5, drift ±1)
- ✅ Values show realistic variation (not completely random)
- ✅ Raw values have full precision (many decimal places) - this is correct for internal calculations
- ✅ When formatted to 1 decimal place, values are readable for display

**Note:** Actual min/max will vary due to trend, noise, and drift components, but should be roughly within baseLevel ± 8-10 dB.

**Pass/Fail:** [x ]

---

## Test 2: Measurement Module Foundation (Sub-tasks 5.4-5.7)

### 2.1 Measurement Module Initialization
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({
    weighting: 'A',
    timeConstant: 'F',
    range: 80,
    dose: { exchangeRate: 3, threshold: 50, criterionLevel: 70 }
});
const state = window.Measurement.getState();
console.log('Measurement state:', state);
```
**Expected:**
- ✅ No errors
- ✅ State object returned with:
  - `running: false`
  - `paused: false`
  - `sampleCount: 0`
  - `config` object with correct values

**Pass/Fail:** [x ]

### 2.2 Run State (Sub-task 5.5)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init();
window.Measurement.start();
const state = window.Measurement.getState();
const results = window.Measurement.getResults();
console.log('State after start:', state);
console.log('Results after start:', results);
```
**Expected:**
- ✅ `state.running` is `true`
- ✅ `state.paused` is `false`
- ✅ `results.running` is `true`
- ✅ `results.paused` is `false`

**Pass/Fail:** [x ]

### 2.3 Pause State (Sub-task 5.6)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init();
window.Measurement.start();
// Generate some samples
for (let i = 0; i < 5; i++) {
    window.Measurement.processSample(70 + i);
}
const resultsBeforePause = window.Measurement.getResults();
window.Measurement.pause();
const state = window.Measurement.getState();
const resultsAfterPause = window.Measurement.getResults();
console.log('Results before pause:', resultsBeforePause);
console.log('State after pause:', state);
console.log('Results after pause:', resultsAfterPause);
```
**Expected:**
- ✅ `state.running` is `true`
- ✅ `state.paused` is `true`
- ✅ Measurement values preserved (leq, lmax, lmin, etc. unchanged)
- ✅ `results.paused` is `true`

**Pass/Fail:** [x ]

### 2.4 Stop State (Sub-task 5.7)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init();
window.Measurement.start();
// Generate some samples
for (let i = 0; i < 5; i++) {
    window.Measurement.processSample(70 + i);
}
const resultsBeforeStop = window.Measurement.getResults();
window.Measurement.stop();
const state = window.Measurement.getState();
const resultsAfterStop = window.Measurement.getResults();
console.log('Results before stop:', resultsBeforeStop);
console.log('State after stop:', state);
console.log('Results after stop:', resultsAfterStop);
```
**Expected:**
- ✅ `state.running` is `false`
- ✅ `state.paused` is `false`
- ✅ Final measurement values preserved in results
- ✅ `results.running` is `false`

**Pass/Fail:** [x ]

---

## Test 3: Measurement Calculations (Sub-tasks 5.8-5.13)

### 3.1 Leq Calculation (Sub-task 5.8)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init();
window.Measurement.start();
// Generate samples with known values
const testSamples = [70, 75, 80, 75, 70];
testSamples.forEach(spl => {
    window.Measurement.processSample(spl);
});
const results = window.Measurement.getResults();
console.log('Leq result:', results.leq);
console.log('Expected: ~74.4 dB (energy average of 70, 75, 80, 75, 70)');
```
**Expected:**
- ✅ `leq` is a number
- ✅ `leq` is approximately 74-75 dB (energy average)
- ✅ Value is reasonable (not NaN, not Infinity)

**Pass/Fail:** [x ]

### 3.2 Lmax Tracking (Sub-task 5.9)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
const testSamples = [70, 75, 80, 85, 75, 70];
testSamples.forEach(spl => {
    window.Measurement.processSample(spl);
});
const results = window.Measurement.getResults();
console.log('Lmax result:', results.lmax);
console.log('Raw input max:', Math.max(...testSamples));
console.log('Note: Lmax is maximum of FILTERED values, not raw input');
```
**Expected:**
- ✅ `lmax` is a number
- ✅ `lmax` is less than or equal to the maximum raw input (85)
- ✅ `lmax` reflects the maximum of filtered values (time-constant applied)
- ✅ For Fast time-constant, Lmax will be smoothed (typically 75-82 dB for this sequence)
- ✅ **Note:** Lmax tracks the maximum of filtered (time-constant applied) values, not raw input values. The time-constant filter smooths peaks, so Lmax will be lower than the raw maximum.

**Pass/Fail:** [x ]

### 3.3 Lmin Tracking (Sub-task 5.10)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
const testSamples = [80, 75, 70, 75, 80];
testSamples.forEach(spl => {
    window.Measurement.processSample(spl);
});
const results = window.Measurement.getResults();
console.log('Lmin result:', results.lmin);
console.log('Raw input min:', Math.min(...testSamples));
console.log('Note: Lmin is minimum of FILTERED values, not raw input');
```
**Expected:**
- ✅ `lmin` is a number
- ✅ `lmin` is greater than or equal to the minimum raw input (70)
- ✅ `lmin` reflects the minimum of filtered values (time-constant applied)
- ✅ For Fast time-constant, Lmin will be smoothed (typically 70-75 dB for this sequence)
- ✅ **Note:** Lmin tracks the minimum of filtered (time-constant applied) values, not raw input values. The time-constant filter smooths valleys, so Lmin will be higher than the raw minimum.

**Pass/Fail:** [x ]

### 3.4 SEL Calculation (Sub-task 5.11)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init();
window.Measurement.start();
// Generate samples over time
for (let i = 0; i < 10; i++) {
    window.Measurement.processSample(75);
}
const results = window.Measurement.getResults();
console.log('SEL result:', results.sel);
console.log('Duration:', results.duration);
```
**Expected:**
- ✅ `sel` is a number
- ✅ `sel` is close to `leq` for constant level
- ✅ Value is reasonable (not NaN, not Infinity)

**Pass/Fail:** [x ]

### 3.5 Peak Tracking (Sub-task 5.12)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
const testSamples = [70, 75, 90, 75, 70];
testSamples.forEach(spl => {
    window.Measurement.processSample(spl);
});
const results = window.Measurement.getResults();
console.log('Peak result:', results.peak);
console.log('Raw input max:', Math.max(...testSamples));
console.log('Note: Peak is maximum of FILTERED values (same as Lmax for Fast/Slow)');
```
**Expected:**
- ✅ `peak` is a number
- ✅ `peak` is less than or equal to the maximum raw input (90)
- ✅ `peak` reflects the maximum of filtered values (time-constant applied)
- ✅ For Fast/Slow time-constant, Peak equals Lmax (both are max of filtered values)
- ✅ For Impulse time-constant, Peak may be higher (peak-hold behavior)
- ✅ **Note:** Peak tracks the maximum of filtered values, not raw input. The time-constant filter smooths peaks.

**Pass/Fail:** [ ]

### 3.6 Dose Calculation (Sub-task 5.13)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({
    weighting: 'A',
    timeConstant: 'F',
    range: 80,
    dose: { exchangeRate: 3, threshold: 50, criterionLevel: 70 }
});
window.Measurement.start();
// Generate samples above threshold
for (let i = 0; i < 10; i++) {
    window.Measurement.processSample(75); // Above threshold (50)
}
const results = window.Measurement.getResults();
console.log('Dose result:', results.dose);
console.log('Expected: > 0 (percentage)');
```
**Expected:**
- ✅ `dose` is a number
- ✅ `dose` is >= 0
- ✅ `dose` is <= 999.9 (capped)
- ✅ Value increases with time and level

**Pass/Fail:** [ ]

---

## Test 4: Weighting and Time-Constant Filters (Sub-tasks 5.14-5.15)

### 4.1 Weighting Filter - A (Sub-task 5.14)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
window.Measurement.processSample(75);
const results = window.Measurement.getResults();
console.log('Current SPL with A-weighting:', results.currentSPL);
```
**Expected:**
- ✅ `currentSPL` is a number
- ✅ Value is processed (may be same or adjusted based on weighting)
- ✅ No errors

**Pass/Fail:** [ ]

### 4.2 Weighting Filter - C (Sub-task 5.14)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'C', timeConstant: 'F', range: 80 });
window.Measurement.start();
window.Measurement.processSample(75);
const results = window.Measurement.getResults();
console.log('Current SPL with C-weighting:', results.currentSPL);
```
**Expected:**
- ✅ `currentSPL` is a number
- ✅ Value is processed
- ✅ No errors

**Pass/Fail:** [ ]

### 4.3 Weighting Filter - Z (Sub-task 5.14)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'Z', timeConstant: 'F', range: 80 });
window.Measurement.start();
window.Measurement.processSample(75);
const results = window.Measurement.getResults();
console.log('Current SPL with Z-weighting:', results.currentSPL);
```
**Expected:**
- ✅ `currentSPL` is `75` (flat, no filter)
- ✅ Value matches input (Z-weighting is flat)

**Pass/Fail:** [ ]

### 4.4 Time-Constant - Fast (Sub-task 5.15)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
// Generate rapid changes
window.Measurement.processSample(70);
window.Measurement.processSample(80);
window.Measurement.processSample(70);
const results = window.Measurement.getResults();
console.log('Fast time-constant result:', results.currentSPL);
```
**Expected:**
- ✅ `currentSPL` responds quickly to changes
- ✅ Value reflects recent samples (125ms averaging)
- ✅ No errors

**Pass/Fail:** [ ]

### 4.5 Time-Constant - Slow (Sub-task 5.15)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'S', range: 80 });
window.Measurement.start();
// Generate rapid changes
window.Measurement.processSample(70);
window.Measurement.processSample(80);
window.Measurement.processSample(70);
const results = window.Measurement.getResults();
console.log('Slow time-constant result:', results.currentSPL);
```
**Expected:**
- ✅ `currentSPL` responds slowly to changes
- ✅ Value shows more averaging (1-second time constant)
- ✅ No errors

**Pass/Fail:** [ ]

### 4.6 Time-Constant - Impulse (Sub-task 5.15)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'I', range: 80 });
window.Measurement.start();
// Generate peak
window.Measurement.processSample(70);
window.Measurement.processSample(90);
window.Measurement.processSample(70);
const results = window.Measurement.getResults();
console.log('Impulse time-constant result:', results.currentSPL);
console.log('Peak:', results.peak);
```
**Expected:**
- ✅ `currentSPL` shows peak-hold behavior
- ✅ Peak value is captured and held
- ✅ Slow decay after peak
- ✅ No errors

**Pass/Fail:** [ ]

---

## Test 5: Range Logic and Over-Range Warnings (Sub-tasks 5.16-5.17)

### 5.1 Range Detection (Sub-task 5.16)
**Test:**
1. In browser console, run:
```javascript
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
// Generate sample within range
window.Measurement.processSample(75);
let results = window.Measurement.getResults();
console.log('Within range - overRange:', results.overRange);
// Generate sample above range
window.Measurement.processSample(85);
results = window.Measurement.getResults();
console.log('Above range - overRange:', results.overRange);
```
**Expected:**
- ✅ `overRange` is `false` when SPL <= range (80)
- ✅ `overRange` is `true` when SPL > range (80)
- ✅ `overRangeWarning` matches `overRange`

**Pass/Fail:** [ ]

### 5.2 Over-Range Warning Display (Sub-task 5.17)
**Test:**
1. Power on device
2. Navigate to SLM: Home → DOWN to "VIEW SESSION" → ENTER
3. Start measurement: Press RUN/PAUSE
4. In browser console, set range to 70 and generate high sample:
```javascript
// This test requires FSM integration - check FSM state
const state = window.getMainFSMState();
console.log('Measurement state:', state.measurement);
console.log('Over-range:', state.measurement.overRange);
console.log('Over-range warning:', state.measurement.overRangeWarning);
```
**Expected:**
- ✅ `overRange` flag is set correctly in FSM state
- ✅ `overRangeWarning` flag is set correctly
- ✅ Warning should be displayed on screen (when renderer is updated)

**Pass/Fail:** [ ]

---

## Test 6: Real-Time Updates and FSM Integration (Sub-task 5.18)

### 6.1 Measurement Engine Start on RUN
**Test:**
1. Power on device
2. Navigate to home screen
3. Press RUN/PAUSE button
4. In browser console, check state:
```javascript
const state = window.getMainFSMState();
console.log('Measurement state:', state.measurement.state);
console.log('Is running:', state.measurement.isRunning);
console.log('Current SPL:', state.measurement.currentSPL);
console.log('Leq:', state.measurement.leq);
```
**Expected:**
- ✅ `measurement.state` is `"running"`
- ✅ `measurement.isRunning` is `true`
- ✅ Measurement values are updating (currentSPL, leq, etc.)
- ✅ Values change over time (not static)

**Pass/Fail:** [ ]

### 6.2 Real-Time Update Rate
**Test:**
1. Start measurement (press RUN/PAUSE on home screen)
2. In browser console, monitor updates:
```javascript
let lastLeq = 0;
let updateCount = 0;
const checkInterval = setInterval(() => {
    const state = window.getMainFSMState();
    if (state.measurement.leq !== lastLeq) {
        updateCount++;
        lastLeq = state.measurement.leq;
        console.log(`Update ${updateCount}: Leq = ${lastLeq.toFixed(2)}`);
    }
}, 200); // Check every 200ms
// Stop after 5 seconds
setTimeout(() => {
    clearInterval(checkInterval);
    console.log(`Total updates in 5 seconds: ${updateCount}`);
}, 5000);
```
**Expected:**
- ✅ Updates occur approximately 10 times per second (10Hz)
- ✅ Measurement values change over time
- ✅ Updates continue while measurement is running

**Pass/Fail:** [ ]

### 6.3 Pause Preserves State
**Test:**
1. Start measurement (press RUN/PAUSE)
2. Wait 2-3 seconds
3. Check values before pause:
```javascript
const beforePause = window.getMainFSMState().measurement;
console.log('Before pause:', {
    leq: beforePause.leq,
    lmax: beforePause.lmax,
    lmin: beforePause.lmin
});
```
4. Press RUN/PAUSE again (pause)
5. Wait 2 seconds
6. Check values after pause:
```javascript
const afterPause = window.getMainFSMState().measurement;
console.log('After pause:', {
    leq: afterPause.leq,
    lmax: afterPause.lmax,
    lmin: afterPause.lmin
});
```
**Expected:**
- ✅ `measurement.state` is `"paused"`
- ✅ `measurement.isRunning` is `false`
- ✅ Measurement values preserved (leq, lmax, lmin unchanged)
- ✅ Values do not change while paused

**Pass/Fail:** [ ]

### 6.4 Resume Continues Measurement
**Test:**
1. Start measurement, then pause
2. Note current values
3. Press RUN/PAUSE again (resume)
4. Wait 2 seconds
5. Check values:
```javascript
const afterResume = window.getMainFSMState().measurement;
console.log('After resume:', {
    state: afterResume.state,
    isRunning: afterResume.isRunning,
    leq: afterResume.leq,
    lmax: afterResume.lmax
});
```
**Expected:**
- ✅ `measurement.state` is `"running"`
- ✅ `measurement.isRunning` is `true`
- ✅ Measurement values continue updating
- ✅ Values accumulate from where they left off

**Pass/Fail:** [ ]

### 6.5 Stop Resets Measurement
**Test:**
1. Start measurement in SLM
2. Wait for values to accumulate
3. Pause measurement (press RUN/PAUSE)
4. Hold STOP button for 3 seconds
5. Check state after stop:
```javascript
const afterStop = window.getMainFSMState().measurement;
console.log('After stop:', {
    state: afterStop.state,
    isRunning: afterStop.isRunning,
    leq: afterStop.leq,
    lmax: afterStop.lmax
});
```
**Expected:**
- ✅ `measurement.state` is `"stopped"`
- ✅ `measurement.isRunning` is `false`
- ✅ Final measurement values preserved (or reset, depending on implementation)
- ✅ Measurement engine stopped

**Pass/Fail:** [ ]

---

## Test 7: Configuration Changes During Measurement (Sub-task 5.19)

### 7.1 Weighting Change (R/C/Z/F)
**Test:**
1. Start measurement in SLM
2. Note current SPL value
3. Press SOFT3 to cycle weighting (R → C → Z → F)
4. Check measurement state:
```javascript
const state = window.getMainFSMState();
console.log('Weighting:', state.slm.weighting);
console.log('Current SPL:', state.measurement.currentSPL);
```
**Expected:**
- ✅ Weighting changes correctly (R/C/Z/F)
- ✅ Measurement continues running
- ✅ Values update based on new weighting (if implemented)

**Pass/Fail:** [ ]

### 7.2 Time Constant Change (F/S/I)
**Test:**
1. Start measurement in SLM
2. Note current SPL value
3. Press SOFT2 to cycle time constant (F → S → I)
4. Check measurement state:
```javascript
const state = window.getMainFSMState();
console.log('Time constant:', state.slm.timeConstant);
console.log('Current SPL:', state.measurement.currentSPL);
```
**Expected:**
- ✅ Time constant changes correctly (F/S/I)
- ✅ Measurement continues running
- ✅ Values update based on new time constant
- ✅ Response speed changes (Fast/Slow/Impulse behavior)

**Pass/Fail:** [ ]

### 7.3 Multiple Configuration Combinations
**Test:**
1. Test different combinations:
   - A-weighting + Fast
   - A-weighting + Slow
   - A-weighting + Impulse
   - C-weighting + Fast
   - C-weighting + Slow
   - Z-weighting + Fast
2. For each combination:
   - Start measurement
   - Wait 3 seconds
   - Check values:
```javascript
const state = window.getMainFSMState();
console.log('Config:', {
    weighting: state.slm.weighting,
    timeConstant: state.slm.timeConstant
});
console.log('Values:', {
    leq: state.measurement.leq,
    lmax: state.measurement.lmax,
    currentSPL: state.measurement.currentSPL
});
```
**Expected:**
- ✅ All combinations work correctly
- ✅ Values are reasonable for each combination
- ✅ No errors or crashes
- ✅ Measurement continues smoothly through changes

**Pass/Fail:** [ ]

---

## Test 8: Deterministic Behavior

### 8.1 Same Seed Produces Same Sequence
**Test:**
1. Start measurement, note initial values
2. Stop measurement
3. Reset simulator seed (if possible) or restart page
4. Start measurement again with same seed
5. Compare initial values:
```javascript
// First run
const state1 = window.getMainFSMState();
console.log('First run - Leq after 5s:', state1.measurement.leq);

// Reset and run again (requires page reload or seed reset)
// After second run:
const state2 = window.getMainFSMState();
console.log('Second run - Leq after 5s:', state2.measurement.leq);
console.log('Match:', Math.abs(state1.measurement.leq - state2.measurement.leq) < 0.1);
```
**Expected:**
- ✅ Same seed produces same sequence (for reproducible training scenarios)
- ✅ Values match between runs (within small tolerance)

**Pass/Fail:** [ ]

---

## Test 9: Edge Cases and Error Handling

### 9.1 Rapid Start/Stop/Pause
**Test:**
1. Rapidly press RUN/PAUSE multiple times
2. Check for errors in console
3. Check state consistency:
```javascript
const state = window.getMainFSMState();
console.log('State after rapid presses:', state.measurement);
```
**Expected:**
- ✅ No errors or crashes
- ✅ State is consistent (not corrupted)
- ✅ Measurement behaves correctly

**Pass/Fail:** [ ]

### 9.2 Very High SPL Values
**Test:**
1. Start measurement
2. Manually set very high SPL (if possible) or test with high baseLevel
3. Check over-range detection:
```javascript
const state = window.getMainFSMState();
console.log('High SPL test:', {
    currentSPL: state.measurement.currentSPL,
    overRange: state.measurement.overRange,
    overRangeWarning: state.measurement.overRangeWarning
});
```
**Expected:**
- ✅ Over-range detected correctly
- ✅ Values are capped or handled appropriately
- ✅ No errors or crashes

**Pass/Fail:** [ ]

### 9.3 Very Low SPL Values
**Test:**
1. Start measurement with low baseLevel
2. Check values:
```javascript
const state = window.getMainFSMState();
console.log('Low SPL test:', {
    currentSPL: state.measurement.currentSPL,
    lmin: state.measurement.lmin
});
```
**Expected:**
- ✅ Values are reasonable (not negative or invalid)
- ✅ Lmin tracks correctly
- ✅ No errors

**Pass/Fail:** [ ]

### 9.4 Long-Running Measurement
**Test:**
1. Start measurement
2. Let it run for 30+ seconds
3. Check values:
```javascript
const state = window.getMainFSMState();
console.log('Long-running test:', {
    runtime: state.measurement.runtime,
    leq: state.measurement.leq,
    sampleCount: state.measurement.sampleCount || 'N/A'
});
```
**Expected:**
- ✅ No memory leaks
- ✅ Performance remains good
- ✅ Values continue updating correctly
- ✅ No errors or crashes

**Pass/Fail:** [ ]

---

## Summary Checklist

### Core Functionality
- [ ] Simulator module loads and initializes correctly
- [ ] Deterministic RNG produces reproducible sequences
- [ ] SPL data generation produces realistic values
- [ ] Measurement module loads and initializes correctly
- [ ] Run/Pause/Stop states work correctly
- [ ] All measurement calculations work (Leq, Lmax, Lmin, SEL, Peak, Dose)
- [ ] Weighting filters work (A/C/Z)
- [ ] Time-constant filters work (Slow/Fast/Impulse)
- [ ] Range detection works correctly
- [ ] Over-range warnings work correctly
- [ ] Real-time updates occur at correct rate (10Hz)
- [ ] FSM integration works correctly

### Integration
- [ ] Measurement engine starts when RUN pressed
- [ ] Measurement engine pauses when PAUSE pressed
- [ ] Measurement engine stops when STOP pressed
- [ ] Measurement values update in FSM state
- [ ] Configuration changes affect measurements
- [ ] State persists across pause/resume
- [ ] State resets correctly on stop

### Edge Cases
- [ ] Rapid button presses handled correctly
- [ ] Very high SPL values handled correctly
- [ ] Very low SPL values handled correctly
- [ ] Long-running measurements stable
- [ ] No memory leaks
- [ ] No console errors

### Performance
- [ ] Real-time updates smooth (10Hz)
- [ ] No lag or stuttering
- [ ] Calculations perform well
- [ ] No excessive CPU usage

---

## Notes

**Issues Found:**
[List any issues discovered during testing]

**Suggestions:**
[List any suggestions for improvement]

**Test Completion:**
- Date Completed: [ ]
- All Tests Passed: [ ]
- Ready for Next Task: [ ]

---

## Debugging Tips

### Console Commands
```javascript
// Check FSM state
window.getMainFSMState()

// Check measurement state
window.getMainFSMState().measurement

// Check SLM state
window.getMainFSMState().slm

// Check simulator state
window.Simulator.getState()

// Check measurement module state
window.Measurement.getState()

// Get measurement results
window.Measurement.getResults()

// Manually test simulator
window.Simulator.init(12345, { baseLevel: 70, variation: 5 });
window.Simulator.generateSample()

// Manually test measurement
window.Measurement.init({ weighting: 'A', timeConstant: 'F', range: 80 });
window.Measurement.start();
window.Measurement.processSample(75);
window.Measurement.getResults()
```

### Common Issues

**Issue: Measurement values not updating**
- Check if measurement engine is started: `window.getMainFSMState().measurement.isRunning`
- Check if update loop is running (check console for errors)
- Verify FSM integration: measurement state should update in `_state.measurement`

**Issue: Values are NaN or Infinity**
- Check calculation formulas in measurement.js
- Verify input values are valid numbers
- Check for division by zero or invalid math operations

**Issue: Deterministic behavior not working**
- Verify seed is set correctly: `window.getMainFSMState().measurement.seed`
- Check if simulator is resetting seed between runs
- Ensure RNG is properly initialized

**Issue: Over-range not detected**
- Check range value: `window.getMainFSMState().slm` (may need to check config)
- Verify SPL value exceeds range
- Check range detection logic in measurement.js

---

**Document Owner:** Development Team  
**Last Updated:** [Date]  
**Status:** Ready for Testing

