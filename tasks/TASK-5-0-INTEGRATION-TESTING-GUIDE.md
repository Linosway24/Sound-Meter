# Task 5.0 Integration Testing Guide - Measurement Engine FSM Integration

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Task 5.0 Integration - Measurement Engine FSM Integration  
**Scope:** Module Initialization, Button Handler Integration, Real-Time Update Loop, Configuration Updates, State Synchronization

---

## Overview

This testing guide covers the Task 5.0 Integration implementation:
- **5.0-I.1-5.0-I.3:** Module initialization and state extension
- **5.0-I.4-5.0-I.6:** Run/Pause/Stop button handler integration
- **5.0-I.7-5.0-I.9:** Real-time update loop (10Hz) and state synchronization
- **5.0-I.10-5.0-I.12:** Configuration updates (weighting, time constant, range)
- **5.0-I.13-5.0-I.14:** Update loop timing and lifecycle management
- **5.0-I.15-5.0-I.18:** End-to-end testing (SLM pages, real-time updates, configuration changes, state transitions)

**Prerequisites:**
- Task 5.0 modules (`js/simulator.js` and `js/measurement.js`) must be implemented
- FSM must have Run/Pause/Stop button handlers
- Screen renderer must support bind paths
- SLM pages 1-4 must be accessible

---

## Prerequisites Check

### P0: Console Errors Check
**Test:** Load the page and check browser console
**Expected:**
- ✅ No red error messages
- ✅ Console may show initialization logs
- ✅ No errors related to `Simulator`, `Measurement`, or FSM integration
- ✅ Modules loaded: `window.Simulator` and `window.Measurement` should be defined

**Pass/Fail:** [x ]

---

### P1: Module Availability Check
**Test:** In browser console, run:
```javascript
// Check if modules are loaded
console.log('Simulator:', typeof window.Simulator);
console.log('Measurement:', typeof window.Measurement);

// Verify modules are objects with expected methods
if (window.Simulator) {
    console.log('Simulator methods:', {
        init: typeof window.Simulator.init,
        generateSample: typeof window.Simulator.generateSample,
        reset: typeof window.Simulator.reset,
        getState: typeof window.Simulator.getState
    });
}

if (window.Measurement) {
    console.log('Measurement methods:', {
        init: typeof window.Measurement.init,
        start: typeof window.Measurement.start,
        pause: typeof window.Measurement.pause,
        stop: typeof window.Measurement.stop,
        processSample: typeof window.Measurement.processSample,
        getResults: typeof window.Measurement.getResults,
        updateConfig: typeof window.Measurement.updateConfig
    });
}
```
**Expected:**
- ✅ `Simulator` is defined and is an object
- ✅ `Measurement` is defined and is an object
- ✅ All methods are "function"

**Pass/Fail:** [ x]

---

### P2: FSM State Structure Check
**Test:** In browser console, run:
```javascript
const state = window.getMainFSMState();
console.log('Measurement state:', state.measurement);
console.log('Timers:', state.timers);
```

**Expected:**
- ✅ `state.measurement` object exists with properties:
  - `runtime: 0`
  - `state: "stopped"`
  - `isRunning: false`
  - `currentSPL: 0`
  - `seed: 12345`
  - `leq: 0`
  - `lmax: 0`
  - `lmin: 0`
  - `sel: 0`
  - `peak: 0`
  - `dose: 0`
  - `overRange: false`
  - `overRangeWarning: false`
- ✅ `state.timers.measurementUpdate` exists (initially `null`)

**Pass/Fail:** [x ]

---

## Phase 1: Module Initialization Tests

### 1.1: Simulator Initialization on FSM Init
**Test:** Reload page, then in browser console:
```javascript
// Check if Simulator was initialized
const simState = window.Simulator.getState();
console.log('Simulator state:', simState);
```

**Expected:**
- ✅ Simulator is initialized
- ✅ `simState.seed` is `12345` (default)
- ✅ `simState.baseLevel` is `70` (default)
- ✅ `simState.variation` is `5` (default)
- ✅ `simState.sampleCount` is `0`

**Pass/Fail:** [x ]

---

### 1.2: Measurement Initialization on FSM Init
**Test:** In browser console:
```javascript
// Check if Measurement was initialized
const measState = window.Measurement.getState();
console.log('Measurement state:', measState);
console.log('Measurement config:', measState.config);
```

**Expected:**
- ✅ Measurement is initialized
- ✅ `measState.running` is `false`
- ✅ `measState.paused` is `false`
- ✅ Config exists with properties:
  - `weighting: 'A'` (default, mapped from FSM 'R')
  - `timeConstant: 'S'` (from FSM state)
  - `range: 80`
  - `dose` object with exchangeRate, threshold, criterionLevel

**Pass/Fail:** [x ]

---

### 1.3: State Structure Extension
**Test:** In browser console:
```javascript
const state = window.getMainFSMState();
const meas = state.measurement;

// Verify all new properties exist
const requiredProps = [
    'seed', 'leq', 'lmax', 'lmin', 'sel', 
    'peak', 'dose', 'overRange', 'overRangeWarning'
];

const missing = requiredProps.filter(prop => !(prop in meas));
console.log('Missing properties:', missing);
console.log('All properties:', Object.keys(meas));
```

**Expected:**
- ✅ All required properties exist in `measurement` state
- ✅ All properties have default values (0 for numbers, false for booleans, 12345 for seed)
- ✅ No missing properties

**Pass/Fail:** [x ]

---

## Phase 2: Button Handler Integration Tests

### 2.1: Run Button Handler - Home Screen
**Test:**
1. Start at home screen
2. Press RUN/PAUSE button
3. Paste this SINGLE LINE (stores result in `window.test21`):
```javascript
window.test21=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const sim=window.Simulator.getState();const result={fsmState:s.measurement.state,isRunning:s.measurement.isRunning,runtime:s.measurement.runtime,measurementRunning:m.running,sampleCount:sim.sampleCount,updateTimer:s.timers.measurementUpdate,updateTimerType:typeof s.timers.measurementUpdate};console.log('=== Test 2.1 Results (stored in window.test21) ===');console.log('Measurement state:',result.fsmState);console.log('IsRunning:',result.isRunning);console.log('Measurement.running:',result.measurementRunning);console.log('Update timer:',result.updateTimer);return result;})()
```
4. Type `window.test21` to inspect the result

**Expected:**
- ✅ `state.measurement.state` is `"running"`
- ✅ `state.measurement.isRunning` is `true`
- ✅ `state.measurement.runtime` is `0`
- ✅ `window.Measurement.getState().running` is `true`
- ✅ `window.Simulator.getState().sampleCount` is `0` or greater (may be > 0 if update loop started)
- ✅ `state.timers.measurementUpdate` is a number (interval ID)

**Pass/Fail:** [x ]

---

### 2.2: Run Button Handler - SLM Screen
**Test:**
1. Navigate to SLM screen (VIEW SESSION)
2. Ensure measurement is stopped
3. Press RUN/PAUSE button
4. Check state (same as 2.1)

**Expected:**
- ✅ Same results as 2.1
- ✅ Screen updates to show running state

**Pass/Fail:** [x' ]

---

### 2.3: Pause Button Handler - SLM Screen
**Test:**
1. Start measurement (ensure running)
2. Press RUN/PAUSE button (or PAUSE button)
3. Paste this SINGLE LINE (stores result in `window.test23`):
```javascript
window.test23=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={fsmState:s.measurement.state,isRunning:s.measurement.isRunning,measurementPaused:m.paused,measurementRunning:m.running,updateTimer:s.timers.measurementUpdate};console.log('=== Test 2.3 Results (stored in window.test23) ===');console.log('Measurement state:',result.fsmState);console.log('IsRunning:',result.isRunning);console.log('Measurement.paused:',result.measurementPaused);console.log('Update timer:',result.updateTimer);return result;})()
```
4. Type `window.test23` to inspect the result

**Expected:**
- ✅ `state.measurement.state` is `"paused"`
- ✅ `state.measurement.isRunning` is `false`
- ✅ `window.Measurement.getState().paused` is `true`
- ✅ `window.Measurement.getState().running` is `true` (paused but not stopped)
- ✅ `state.timers.measurementUpdate` is `null` (update loop stopped)

**Pass/Fail:** [x ]

---

### 2.4: Resume Button Handler
**Test:**
1. Pause measurement (from 2.3)
2. Press RUN/PAUSE button to resume
3. Paste this SINGLE LINE (stores result in `window.test24`):
```javascript
window.test24=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={fsmState:s.measurement.state,isRunning:s.measurement.isRunning,measurementRunning:m.running,measurementPaused:m.paused,updateTimer:s.timers.measurementUpdate};console.log('=== Test 2.4 Results (stored in window.test24) ===');console.log('Measurement state:',result.fsmState);console.log('IsRunning:',result.isRunning);console.log('Measurement.running:',result.measurementRunning);console.log('Update timer:',result.updateTimer);return result;})()
```
4. Type `window.test24` to inspect the result

**Expected:**
- ✅ `state.measurement.state` is `"running"`
- ✅ `state.measurement.isRunning` is `true`
- ✅ `window.Measurement.getState().running` is `true`
- ✅ `window.Measurement.getState().paused` is `false`
- ✅ `state.timers.measurementUpdate` is a number (interval ID)

**Pass/Fail:** [x ]

---

### 2.5: Stop Button Handler
**Test:**
1. Start measurement (ensure running or paused)
2. Press and hold STOP button for 3 seconds
3. After stop confirm appears, paste this SINGLE LINE (stores result in `window.test25`):
```javascript
window.test25=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const sim=window.Simulator.getState();const result={fsmState:s.measurement.state,isRunning:s.measurement.isRunning,measurementRunning:m.running,measurementPaused:m.paused,sampleCount:sim.sampleCount,updateTimer:s.timers.measurementUpdate};console.log('=== Test 2.5 Results (stored in window.test25) ===');console.log('Measurement state:',result.fsmState);console.log('IsRunning:',result.isRunning);console.log('Measurement.running:',result.measurementRunning);console.log('Simulator.sampleCount:',result.sampleCount);console.log('Update timer:',result.updateTimer);return result;})()
```
4. Type `window.test25` to inspect the result

**Expected:**
- ✅ `state.measurement.state` is `"stopped"`
- ✅ `state.measurement.isRunning` is `false`
- ✅ `window.Measurement.getState().running` is `false`
- ✅ `window.Measurement.getState().paused` is `false`
- ✅ `window.Simulator.getState().sampleCount` resets to `0` (or low value)
- ✅ `state.timers.measurementUpdate` is `null`

**Pass/Fail:** [x ]

---

## Phase 3: Real-Time Update Loop Tests

### 3.1: Update Loop Starts on Measurement Start
**Test:**
1. Start measurement
2. Immediately paste this SINGLE LINE (stores result in `window.test31` for inspection):
```javascript
window.test31=(function(){const s=window.getMainFSMState();const result={timerID:s.timers.measurementUpdate,timerType:typeof s.timers.measurementUpdate,isNumber:typeof s.timers.measurementUpdate==='number',isNull:s.timers.measurementUpdate===null};console.log('=== Test 3.1 Results (stored in window.test31) ===');console.log('Update timer ID:',result.timerID);console.log('Timer type:',result.timerType);console.log('Is number?',result.isNumber);return result;})()
```
3. Then type `window.test31` in console to inspect the result (even if console keeps scrolling)

**Expected:**
- ✅ `window.test31.timerID` is a number (not null)
- ✅ `window.test31.timerType` is `"number"`
- ✅ `window.test31.isNumber` is `true`

**Pass/Fail:** [x ]

---

### 3.2: Update Loop Frequency (10Hz)
**Test:**
1. Start measurement
2. Paste this SINGLE LINE (stores results in `window.test32` and logs to console):
```javascript
window.test32={updates:[],started:Date.now()};let lastSPL=0;let lastTime=Date.now();const checkInterval=setInterval(()=>{const s=window.getMainFSMState();const now=Date.now();if(s.measurement.currentSPL!==lastSPL){const elapsed=now-lastTime;window.test32.updates.push({time:now,elapsed:elapsed,currentSPL:s.measurement.currentSPL,count:window.test32.updates.length+1});lastSPL=s.measurement.currentSPL;lastTime=now;if(window.test32.updates.length>=10){clearInterval(checkInterval);window.test32.avgInterval=window.test32.updates.slice(1).reduce((sum,u)=>sum+u.elapsed,0)/(window.test32.updates.length-1);window.test32.frequency=1000/window.test32.avgInterval;console.log('=== Test 3.2 Results (stored in window.test32) ===');console.log('Average interval:',window.test32.avgInterval.toFixed(2),'ms');console.log('Estimated frequency:',window.test32.frequency.toFixed(2),'Hz');console.log('Expected: ~100ms interval = 10Hz');console.log('All updates:',window.test32.updates);}}},50);
```
3. Wait 1-2 seconds for monitoring to complete (automatically stops after 10 updates)
4. Type `window.test32` to inspect all results:
   - `window.test32.updates` - array of all updates with timestamps
   - `window.test32.avgInterval` - average interval in ms
   - `window.test32.frequency` - calculated frequency in Hz

**Expected:**
- ✅ `window.test32.avgInterval` is approximately 100ms (±20ms tolerance)
- ✅ `window.test32.frequency` is approximately 10Hz (±2Hz tolerance)
- ✅ All `currentSPL` values in `window.test32.updates` are realistic (30-130 dB range)
- ✅ `currentSPL` values change over time

**Pass/Fail:** [x ]

---

### 3.3: State Synchronization - Current SPL
**Test:**
1. Start measurement
2. Wait 2-3 seconds
3. Paste this SINGLE LINE (stores result in `window.test33`):
```javascript
window.test33=(function(){const s=window.getMainFSMState();const r=window.Measurement.getResults();const result={fsmSPL:s.measurement.currentSPL,measurementSPL:r.currentSPL,match:s.measurement.currentSPL===r.currentSPL};console.log('=== Test 3.3 Results (stored in window.test33) ===');console.log('FSM currentSPL:',result.fsmSPL);console.log('Measurement currentSPL:',result.measurementSPL);console.log('Match:',result.match);return result;})()
```
4. Type `window.test33` to inspect the result

**Expected:**
- ✅ FSM `currentSPL` matches Measurement `currentSPL`
- ✅ Value is non-zero and realistic

**Pass/Fail:** [x ]

---

### 3.4: State Synchronization - All Measurement Values
**Test:**
1. Start measurement
2. Wait 5-10 seconds (allow values to accumulate)
3. Paste this SINGLE LINE (stores result in `window.test34`):
```javascript
window.test34=(function(){const s=window.getMainFSMState();const r=window.Measurement.getResults();const comp={leq:s.measurement.leq===r.leq,lmax:s.measurement.lmax===r.lmax,lmin:s.measurement.lmin===r.lmin,sel:s.measurement.sel===r.sel,peak:s.measurement.peak===r.peak,dose:s.measurement.dose===r.dose,overRange:s.measurement.overRange===r.overRange,overRangeWarning:s.measurement.overRangeWarning===r.overRangeWarning};const result={comparisons:comp,fsmValues:{leq:s.measurement.leq,lmax:s.measurement.lmax,lmin:s.measurement.lmin,sel:s.measurement.sel,peak:s.measurement.peak,dose:s.measurement.dose},measurementValues:{leq:r.leq,lmax:r.lmax,lmin:r.lmin,sel:r.sel,peak:r.peak,dose:r.dose}};console.log('=== Test 3.4 Results (stored in window.test34) ===');console.log('State synchronization:',comp);return result;})()
```
4. Type `window.test34` to inspect the result (check `window.test34.comparisons` for all matches)

**Expected:**
- ✅ All comparisons are `true`
- ✅ Values are realistic and non-zero (except possibly lmin which may stay at 0)
- ✅ Leq, Lmax, Peak values are in reasonable dB range (30-130)
- ✅ Dose is 0-999.9%

**Pass/Fail:** [x ]

---

### 3.5: Update Loop Stops on Pause
**Test:**
1. Start measurement
2. Note initial `currentSPL` value
3. Pause measurement
4. Wait 2 seconds
5. Paste this SINGLE LINE (stores result in `window.test35`):
```javascript
window.test35=(function(){const s=window.getMainFSMState();const result={updateTimer:s.timers.measurementUpdate,measurementState:s.measurement.state,currentSPL:s.measurement.currentSPL,isTimerNull:s.timers.measurementUpdate===null};console.log('=== Test 3.5 Results (stored in window.test35) ===');console.log('Update timer:',result.updateTimer);console.log('Measurement state:',result.measurementState);console.log('Current SPL:',result.currentSPL);return result;})()
```
6. Type `window.test35` to inspect the result

**Expected:**
- ✅ `state.timers.measurementUpdate` is `null`
- ✅ Measurement values are preserved (not reset)
- ✅ No updates occur while paused

**Pass/Fail:** [x ]

---

### 3.6: Update Loop Stops on Stop
**Test:**
1. Start measurement
2. Stop measurement
3. Paste this SINGLE LINE (stores result in `window.test36`):
```javascript
window.test36=(function(){const s=window.getMainFSMState();const result={updateTimer:s.timers.measurementUpdate,isTimerNull:s.timers.measurementUpdate===null};console.log('=== Test 3.6 Results (stored in window.test36) ===');console.log('Update timer:',result.updateTimer);return result;})()
```
4. Type `window.test36` to inspect the result

**Expected:**
- ✅ `state.timers.measurementUpdate` is `null`
- ✅ Update loop is stopped

**Pass/Fail:** [x ]

---

## Phase 4: Configuration Update Tests

### 4.1: Time Constant Update (SOFT2)
**Test:**
1. Navigate to SLM screen
2. Note current time constant: `window.getMainFSMState().slm.timeConstant`
3. Press SOFT2 to cycle time constant
4. Paste this SINGLE LINE (stores result in `window.test41`):
```javascript
window.test41=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={fsmTimeConstant:s.slm.timeConstant,measurementTimeConstant:m.config.timeConstant,match:s.slm.timeConstant===m.config.timeConstant};console.log('=== Test 4.1 Results (stored in window.test41) ===');console.log('FSM timeConstant:',result.fsmTimeConstant);console.log('Measurement timeConstant:',result.measurementTimeConstant);console.log('Match:',result.match);return result;})()
```
5. Type `window.test41` to inspect the result

**Expected:**
- ✅ FSM `timeConstant` cycles: F → S → I → F
- ✅ Measurement config `timeConstant` matches FSM `timeConstant`
- ✅ Values are synchronized

**Pass/Fail:** [ ]

---

### 4.2: Time Constant Update During Measurement
**Test:**
1. Start measurement
2. Note initial `currentSPL` value
3. Change time constant (SOFT2)
4. Wait 2-3 seconds
5. Paste this SINGLE LINE (stores result in `window.test42`):
```javascript
window.test42=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={timeConstant:s.slm.timeConstant,currentSPL:s.measurement.currentSPL,configTimeConstant:m.config.timeConstant};console.log('=== Test 4.2 Results (stored in window.test42) ===');console.log('Time constant:',result.timeConstant);console.log('Current SPL:',result.currentSPL);console.log('Measurement config timeConstant:',result.configTimeConstant);return result;})()
```
6. Type `window.test42` to inspect the result

**Expected:**
- ✅ Measurement config updates immediately
- ✅ `currentSPL` values change (time constant affects response speed)
- ✅ Fast (F) responds quickly, Slow (S) responds slowly, Impulse (I) has peak-hold behavior

**Pass/Fail:** [x ]

---

### 4.3: Weighting Update (SOFT3)
**Test:**
1. Navigate to SLM screen
2. Note current weighting: `window.getMainFSMState().slm.weighting`
3. Press SOFT3 to cycle weighting (R → C → Z → F → R)
4. Paste this SINGLE LINE (stores result in `window.test43`):
```javascript
window.test43=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const map={'R':'A','C':'C','Z':'Z','F':'A'};const expected=map[s.slm.weighting];const result={fsmWeighting:s.slm.weighting,measurementWeighting:m.config.weighting,expected:expected,match:m.config.weighting===expected};console.log('=== Test 4.3 Results (stored in window.test43) ===');console.log('FSM weighting:',result.fsmWeighting);console.log('Measurement weighting:',result.measurementWeighting);console.log('Expected mapping:',result.expected);console.log('Match:',result.match);return result;})()
```
5. Type `window.test43` to inspect the result

**Expected:**
- ✅ FSM `weighting` cycles: R → C → Z → F → R
- ✅ Measurement config `weighting` matches expected mapping (R→A, C→C, Z→Z, F→A)
- ✅ Mapping is correct

**Pass/Fail:** [x ]

---

### 4.4: Weighting Update During Measurement
**Test:**
1. Start measurement
2. Change weighting (SOFT3)
3. Paste this SINGLE LINE (stores result in `window.test44`):
```javascript
window.test44=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={fsmWeighting:s.slm.weighting,measurementWeighting:m.config.weighting};console.log('=== Test 4.4 Results (stored in window.test44) ===');console.log('FSM weighting:',result.fsmWeighting);console.log('Measurement weighting:',result.measurementWeighting);return result;})()
```
4. Type `window.test44` to inspect the result

**Expected:**
- ✅ Measurement config updates immediately
- ✅ Values continue to update (weighting affects calculations)

**Pass/Fail:** [x ]

---

## Phase 5: Display Integration Tests

### 5.1: SLM Page 1 - Current SPL Display
**Test:**
1. Navigate to SLM screen (page 1)
2. Start measurement
3. Observe main readout display

**Expected:**
- ✅ Main readout shows `currentSPL` value
- ✅ Value updates in real-time (~10Hz)
- ✅ Value is formatted correctly (e.g., "85.3 dB")
- ✅ Value is realistic (30-130 dB range)

**Pass/Fail:** [x ]

---

### 5.2: SLM Page 2 - Leq Display
**Test:**
1. Start measurement
2. Navigate to SLM page 2 (press DOWN)
3. Observe Leq display

**Expected:**
- ✅ Page 2 displays Leq value (not 0.0 placeholder)
- ✅ Value updates in real-time
- ✅ Value is realistic and increases over time

**Pass/Fail:** [ ]

---

### 5.3: SLM Page 2 - Lmax Display
**Test:**
1. Start measurement
2. Navigate to SLM page 2
3. Observe Lmax display

**Expected:**
- ✅ Page 2 displays Lmax value (not 0.0 placeholder)
- ✅ Value updates in real-time
- ✅ Value is realistic and typically >= current SPL

**Pass/Fail:** [x ]

---

### 5.4: SLM Page 3 - Lmin Display
**Test:**
1. Start measurement
2. Navigate to SLM page 3 (press DOWN from page 2)
3. Observe Lmin display

**Expected:**
- ✅ Page 3 displays Lmin value (not 0.0 placeholder)
- ✅ Value updates in real-time
- ✅ Value is realistic and typically <= current SPL

**Pass/Fail:** [ x]

---

### 5.5: SLM Page 3 - SEL Display
**Test:**
1. Start measurement
2. Navigate to SLM page 3
3. Observe SEL display

**Expected:**
- ✅ Page 3 displays SEL value (not 0.0 placeholder)
- ✅ Value updates in real-time
- ✅ Value is realistic

**Pass/Fail:** [x ]

---

### 5.6: SLM Page 4 - Peak Display
**Test:**
1. Start measurement
2. Navigate to SLM page 4 (press DOWN from page 3)
3. Observe Peak display

**Expected:**
- ✅ Page 4 displays Peak value (not 0.0 placeholder)
- ✅ Value updates in real-time
- ✅ Value is realistic and typically >= current SPL

**Pass/Fail:** [x ]

---

### 5.7: SLM Page 4 - Dose Display
**Test:**
1. Start measurement
2. Navigate to SLM page 4
3. Observe Dose display

**Expected:**
- ✅ Page 4 displays Dose value (not 0.0 placeholder)
- ✅ Value updates in real-time
- ✅ Value is 0-999.9% range
- ✅ Value increases over time during measurement

**Pass/Fail:** [x ]

---

### 5.8: Values Update After Pause/Resume
**Test:**
1. Start measurement
2. Navigate to SLM page 2
3. Note current Leq value
4. Pause measurement
5. Wait 2 seconds
6. Resume measurement
7. Check if values continue updating

**Expected:**
- ✅ Values are preserved during pause
- ✅ Values continue updating after resume
- ✅ Leq continues to accumulate (doesn't reset)

**Pass/Fail:** [x ]

---

### 5.9: Values Reset After Stop
**Test:**
1. Start measurement
2. Navigate to SLM page 2
3. Note current Leq value (should be > 0)
4. Stop measurement (hold STOP for 3 seconds)
5. Start measurement again
6. Check Leq value

**Expected:**
- ✅ After stop, values are reset to defaults (0 or initial values)
- ✅ After new start, values begin accumulating from 0 again

**Pass/Fail:** [x ]

---

## Phase 6: Edge Cases and Error Handling

### 6.1: Rapid Button Presses
**Test:**
1. Rapidly press RUN/PAUSE button multiple times
2. Paste this SINGLE LINE (stores result in `window.test61`):
```javascript
window.test61=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={state:s.measurement.state,isRunning:s.measurement.isRunning,measurementRunning:m.running,updateTimer:s.timers.measurementUpdate,stateConsistent:s.measurement.state==='running'?s.measurement.isRunning===true:s.measurement.isRunning===false};console.log('=== Test 6.1 Results (stored in window.test61) ===');console.log('State:',result.state);console.log('IsRunning:',result.isRunning);console.log('Measurement running:',result.measurementRunning);console.log('Update timer:',result.updateTimer);return result;})()
```
3. Type `window.test61` to inspect the result

**Expected:**
- ✅ No errors in console
- ✅ State is consistent (state matches isRunning)
- ✅ Measurement module state matches FSM state
- ✅ Update loop is properly managed (only one timer active)

**Pass/Fail:** [ ]

---

### 6.2: Configuration Change During Active Measurement
**Test:**
1. Start measurement
2. Rapidly change time constant multiple times (SOFT2)
3. Rapidly change weighting multiple times (SOFT3)
4. Paste this SINGLE LINE (stores result in `window.test62`):
```javascript
window.test62=(function(){const s=window.getMainFSMState();const m=window.Measurement.getState();const result={fsmTimeConstant:s.slm.timeConstant,measurementTimeConstant:m.config.timeConstant,fsmWeighting:s.slm.weighting,measurementWeighting:m.config.weighting,timeConstantMatch:s.slm.timeConstant===m.config.timeConstant};console.log('=== Test 6.2 Results (stored in window.test62) ===');console.log('FSM timeConstant:',result.fsmTimeConstant);console.log('Measurement timeConstant:',result.measurementTimeConstant);console.log('FSM weighting:',result.fsmWeighting);console.log('Measurement weighting:',result.measurementWeighting);return result;})()
```
5. Type `window.test62` to inspect the result

**Expected:**
- ✅ No errors in console
- ✅ Configuration updates are applied correctly
- ✅ Measurement continues to function correctly
- ✅ Values continue updating

**Pass/Fail:** [ ]

---

### 6.3: Module Availability Check
**Test:** Simulate missing modules by checking error handling:
```javascript
// Check if modules are checked before use
// This is tested implicitly by the initialization checks
console.log('Simulator available:', !!window.Simulator);
console.log('Measurement available:', !!window.Measurement);
```

**Expected:**
- ✅ Modules are checked before use (no errors if modules are unavailable)
- ✅ Code handles missing modules gracefully

**Pass/Fail:** [ ]

---

### 6.4: Deterministic Behavior (Same Seed)
**Test:**
1. Start measurement
2. Note first few `currentSPL` values
3. Stop measurement
4. Reload page (resets to same seed)
5. Start measurement again
6. Compare first few values:
```javascript
// Run this test twice with same seed
const state = window.getMainFSMState();
console.log('Seed:', state.measurement.seed);

// Start measurement and log first 5 values
let count = 0;
const values = [];
const checkInterval = setInterval(() => {
    const s = window.getMainFSMState();
    if (s.measurement.currentSPL > 0) {
        values.push(s.measurement.currentSPL);
        count++;
        if (count >= 5) {
            clearInterval(checkInterval);
            console.log('First 5 values:', values);
        }
    }
}, 100);
```

**Expected:**
- ✅ Same seed produces identical sequences
- ✅ Values are deterministic and reproducible

**Pass/Fail:** [ ]

---

## Phase 7: Performance Tests

### 7.1: Update Loop Performance
**Test:**
1. Start measurement
2. Monitor console for performance warnings
3. Run for 30 seconds
4. Check memory usage (if possible)

**Expected:**
- ✅ No performance warnings
- ✅ No memory leaks (update loop properly cleaned up)
- ✅ Smooth updates without lag

**Pass/Fail:** [ ]

---

### 7.2: Multiple Start/Stop Cycles
**Test:**
1. Start measurement
2. Wait 2 seconds
3. Stop measurement
4. Repeat 10 times
5. Check for memory leaks or errors

**Expected:**
- ✅ No errors after multiple cycles
- ✅ Timers are properly cleaned up
- ✅ No memory leaks

**Pass/Fail:** [ ]

---

## Summary Checklist

### Integration Completeness
- [ ] Modules initialize correctly in FSM
- [ ] State structure extended with all measurement values
- [ ] Run button handlers call Measurement.start() and Simulator.init()
- [ ] Pause button handlers call Measurement.pause()
- [ ] Stop button handlers call Measurement.stop() and Simulator.reset()
- [ ] Update loop runs at 10Hz (100ms intervals)
- [ ] Update loop generates samples and processes them
- [ ] State synchronization works for all measurement values
- [ ] Configuration updates (time constant) work
- [ ] Configuration updates (weighting) work with correct mapping
- [ ] SLM pages display real values (not placeholders)
- [ ] Values update in real-time during active measurement
- [ ] Values are preserved during pause
- [ ] Values reset properly after stop

### Test Coverage
- [ ] All Phase 1 tests passed
- [ ] All Phase 2 tests passed
- [ ] All Phase 3 tests passed
- [ ] All Phase 4 tests passed
- [ ] All Phase 5 tests passed
- [ ] All Phase 6 tests passed
- [ ] All Phase 7 tests passed

---

## Known Issues / Notes

**Issues Found:**
- [ ] None

**Notes:**
- [ ] Add any test-specific notes here

---

## Test Completion

**Date Completed:** [Fill in date]  
**Tester Name:** [Fill in name]  
**Overall Result:** [ ] PASS / [ ] FAIL

**Summary:**
[Brief summary of test results, any issues found, recommendations]

