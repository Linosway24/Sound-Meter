# AI Task Planning - Task 5.0 Integration: Measurement Engine FSM Integration

> **How to Use This Template:**
> 1. This task integrates the existing Measurement Engine modules (`js/simulator.js` and `js/measurement.js`) into the FSM
> 2. Task 5.0 modules are already implemented but not connected to the FSM
> 3. This task completes Task 5.0 by wiring everything together

## 1. Task Overview

### Task Title
**Title:** Measurement Engine FSM Integration - Connecting Measurement Modules to State Management

### Goal Statement
**Goal:** Integrate the existing Measurement Engine modules (`js/simulator.js` and `js/measurement.js`) into the FSM state management system. The modules are fully implemented but currently disconnected from the FSM. This task will initialize the modules, connect Run/Pause/Stop button handlers to Measurement methods, extend FSM state to include all measurement values (Leq, Lmax, Lmin, SEL, Peak, Dose), create a real-time update loop that generates SPL samples and processes them, and sync Measurement results to FSM state so they display on SLM pages 2-4. This completes Task 5.0 by making the measurement engine fully functional and populating SLM pages with real measurement data instead of placeholders.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, FSM-based state management, deterministic random number generation, real-time measurement updates

### Current State
**What's Complete:**
- ✅ Task 5.0 modules implemented:
  - ✅ `js/simulator.js` - Fully implemented (173 lines) with deterministic RNG and SPL generation
  - ✅ `js/measurement.js` - Fully implemented (439 lines) with all calculations (Leq, Lmax, Lmin, SEL, Peak, Dose)
- ✅ FSM Run/Pause/Stop button handlers exist in `js/fsm/mainFSM.js`
- ✅ FSM measurement state structure exists (`_state.measurement.state`, `_state.measurement.runtime`, `_state.measurement.isRunning`)
- ✅ SLM pages 1-4 screen definitions exist in `data/screen-atlas.json` with bindings (e.g., `"bind": "measurement.Leq"`)
- ✅ Screen renderer supports bind path parsing for measurement values
- ✅ Modules are loaded in `index.html` (lines 69-70)

**What's Missing:**
- ❌ Measurement and Simulator modules are NOT initialized in FSM
- ❌ Run/Pause/Stop handlers do NOT call `Measurement.start()`, `Measurement.pause()`, `Measurement.stop()`
- ❌ FSM state does NOT include measurement values (leq, lmax, lmin, sel, peak, dose) - only has `currentSPL: 0`
- ❌ No update loop that generates SPL samples and processes them
- ❌ No connection between Measurement module results and FSM state
- ❌ SLM pages 2-4 display placeholders (0.0) because FSM state doesn't have measurement values
- ❌ Configuration changes (weighting, time constant, range) don't update Measurement module config

**Dependencies:**
- Task 5.0 modules must exist (✅ Complete)
- FSM must have Run/Pause/Stop handlers (✅ Complete)
- Screen renderer must support bind paths (✅ Complete)

---

## 3. Context & Problem Definition

### Problem Statement
The Measurement Engine modules (`js/simulator.js` and `js/measurement.js`) are fully implemented and functional, but they are completely disconnected from the FSM. The FSM manages measurement state (`running`/`paused`/`stopped`) and increments runtime, but it never calls the Measurement module methods. The FSM state only includes `currentSPL: 0` (hardcoded), missing all other measurement values (Leq, Lmax, Lmin, SEL, Peak, Dose). The screen renderer tries to display `measurement.Leq` from FSM state, but it doesn't exist, so it falls back to `0.0` (placeholders). Without this integration, the measurement engine is non-functional despite being fully implemented. Students cannot see real measurement data, and the simulator cannot demonstrate realistic training scenarios.

### Success Criteria
- [ ] 5.0-I.1: Initialize Simulator module in FSM `initMainFSM()` with seed value
- [ ] 5.0-I.2: Initialize Measurement module in FSM `initMainFSM()` with configuration from FSM state
- [ ] 5.0-I.3: Extend FSM `_state.measurement` to include all measurement values (leq, lmax, lmin, sel, peak, dose, overRange, overRangeWarning)
- [ ] 5.0-I.4: Connect Run button handler to call `Measurement.start()` and initialize Simulator
- [ ] 5.0-I.5: Connect Pause button handler to call `Measurement.pause()`
- [ ] 5.0-I.6: Connect Stop button handler to call `Measurement.stop()` and reset Simulator
- [ ] 5.0-I.7: Create real-time update loop that generates SPL samples using `Simulator.generateSample()`
- [ ] 5.0-I.8: Process samples in update loop using `Measurement.processSample()`
- [ ] 5.0-I.9: Sync Measurement results to FSM state on each update (leq, lmax, lmin, sel, peak, dose, currentSPL, overRange, overRangeWarning)
- [ ] 5.0-I.10: Update Measurement module config when weighting changes (softkey 3: R/C/Z/F)
- [ ] 5.0-I.11: Update Measurement module config when time constant changes (softkey 2: F/S/I)
- [ ] 5.0-I.12: Update Measurement module config when range changes (if applicable)
- [ ] 5.0-I.13: Ensure update loop runs at 10Hz (100ms intervals) during active measurement
- [ ] 5.0-I.14: Stop update loop when measurement is paused or stopped
- [ ] 5.0-I.15: Test that SLM pages 2-4 display real measurement values instead of placeholders
- [ ] 5.0-I.16: Test that measurement values update in real-time during active sessions
- [ ] 5.0-I.17: Test that configuration changes (weighting, time constant) affect displayed values
- [ ] 5.0-I.18: Test Run/Pause/Stop state transitions work correctly with Measurement module

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Integration - connecting existing modules to FSM
- **Breaking Changes:** Minimal - extending existing FSM state structure, not modifying existing behavior
- **Data Handling:** In-memory state only, no persistence - measurement data exists only during active session
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High - completes Task 5.0, makes measurement engine functional, enables realistic training scenarios

---

## 5. Technical Requirements

### Functional Requirements

**From Task 5.0 Requirements:**
1. The system must initialize Simulator and Measurement modules when FSM initializes
2. The system must connect Run/Pause/Stop button handlers to Measurement module methods
3. The system must generate SPL samples in real-time during active measurement (10Hz update rate)
4. The system must process samples through Measurement module (weighting, time-constant, calculations)
5. The system must sync Measurement results to FSM state for display
6. The system must update Measurement module config when user changes weighting, time constant, or range
7. The system must display real measurement values (Leq, Lmax, Lmin, SEL, Peak, Dose) on SLM pages 2-4

### Non-Functional Requirements
- **Performance:** Real-time updates must be smooth (10Hz target), no lag during measurement updates
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** Measurement values must update visibly during active sessions, match firmware R.13J display format
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Deterministic Behavior:** Same seed value must produce identical measurement sequences for reproducible training scenarios

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas) for measurement displays
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- Must integrate with existing FSM state management patterns
- Update loop must be efficient (10Hz, not 60fps)

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**Extended FSM Measurement State:**
```javascript
measurement: {
    // Existing properties (keep these)
    runtime: 0,                    // seconds (existing)
    state: "stopped",              // "running" | "paused" | "stopped" (existing)
    isRunning: false,              // boolean (existing)
    currentSPL: 0,                 // existing (but currently hardcoded to 0)
    
    // New properties (add these)
    seed: 12345,                   // Deterministic seed for Simulator
    leq: 0,                        // Equivalent continuous sound level
    lmax: 0,                       // Maximum level
    lmin: 0,                       // Minimum level
    sel: 0,                        // Sound exposure level
    peak: 0,                       // Peak level
    dose: 0,                       // Dose percentage
    overRange: false,              // Over-range flag
    overRangeWarning: false        // Over-range warning flag
}
```

**No changes to other state structures** - only extending `_state.measurement`

### Data Migration Plan
N/A - No data migration needed. Extending existing state structure with new properties (backward compatible).

---

## 7. API & Backend Changes

### Data Access Pattern Rules
N/A - Pure frontend, no backend

### Server Actions
N/A - No backend

### Database Queries
N/A - No database

---

## 8. Frontend Changes

### New Components
None - using existing modules (`Simulator` and `Measurement`)

### Page Updates

**`js/fsm/mainFSM.js` - FSM Integration:**
- Initialize `Simulator` and `Measurement` modules in `initMainFSM()`
- Extend `_state.measurement` object with new properties (leq, lmax, lmin, sel, peak, dose, overRange, overRangeWarning, seed)
- Modify Run button handler to call `Measurement.start()` and initialize `Simulator`
- Modify Pause button handler to call `Measurement.pause()`
- Modify Stop button handler to call `Measurement.stop()` and reset `Simulator`
- Create real-time update loop function that:
  - Generates SPL sample using `Simulator.generateSample()`
  - Processes sample using `Measurement.processSample()`
  - Gets results using `Measurement.getResults()`
  - Syncs results to `_state.measurement`
  - Triggers FSM state update (`_emit()`)
- Start update loop when measurement starts
- Stop update loop when measurement pauses or stops
- Update `Measurement.updateConfig()` when weighting changes (softkey 3)
- Update `Measurement.updateConfig()` when time constant changes (softkey 2)
- Update `Measurement.updateConfig()` when range changes (if applicable)

**No changes needed to:**
- `js/simulator.js` - Already complete
- `js/measurement.js` - Already complete
- `js/screen-renderer.js` - Already supports bind paths
- `data/screen-atlas.json` - Already has bindings defined
- `index.html` - Already loads modules

### State Management
- Measurement state managed in `js/measurement.js` module (internal)
- FSM state (`_state.measurement`) synchronized with Measurement results
- Real-time updates triggered by update loop (10Hz)
- Display updates triggered by FSM state change events (existing subscription system)
- Configuration changes immediately update Measurement module config

---

## 9. Implementation Plan

### Phase 1: Module Initialization (Sub-tasks 5.0-I.1-5.0-I.3)
1. **[5.0-I.1]** Initialize Simulator module in `initMainFSM()`:
   - Call `window.Simulator.init(seed, options)` with seed from `_state.measurement.seed` (default: 12345)
   - Set baseLevel and variation based on desired behavior
   - Store reference if needed (or use global `window.Simulator`)

2. **[5.0-I.2]** Initialize Measurement module in `initMainFSM()`:
   - Call `window.Measurement.init(config)` with config from FSM state:
     - `weighting`: from `_state.slm.weighting` (map R→A, C→C, Z→Z, F→A)
     - `timeConstant`: from `_state.slm.timeConstant` (F/S/I)
     - `range`: from `_state.slm.range` or default 80
     - `dose`: from `_state.slm.dose` or defaults
   - Store reference if needed (or use global `window.Measurement`)

3. **[5.0-I.3]** Extend FSM `_state.measurement` object:
   - Add `seed: 12345` property
   - Add `leq: 0` property
   - Add `lmax: 0` property
   - Add `lmin: 0` property
   - Add `sel: 0` property
   - Add `peak: 0` property
   - Add `dose: 0` property
   - Add `overRange: false` property
   - Add `overRangeWarning: false` property
   - Keep existing properties: `runtime`, `state`, `isRunning`, `currentSPL`

### Phase 2: Button Handler Integration (Sub-tasks 5.0-I.4-5.0-I.6)
4. **[5.0-I.4]** Connect Run button handler:
   - Find Run button handler in FSM (case "RUNPAUSE" when state is "stopped")
   - Before setting `_state.measurement.state = "running"`, call:
     - `window.Simulator.init(_state.measurement.seed, { baseLevel: 70, variation: 5 })`
     - `window.Measurement.start()` with callback for updates
   - After starting, begin update loop (see Phase 3)

5. **[5.0-I.5]** Connect Pause button handler:
   - Find Pause button handler in FSM (case "RUNPAUSE" when state is "running")
   - Before setting `_state.measurement.state = "paused"`, call:
     - `window.Measurement.pause()`
   - Stop update loop (see Phase 3)

6. **[5.0-I.6]** Connect Stop button handler:
   - Find Stop button handler in FSM (case "STOP_UP" after 3-second hold)
   - Before setting `_state.measurement.state = "stopped"`, call:
     - `window.Measurement.stop()`
     - `window.Simulator.reset()` (optional - reset to same seed)
   - Stop update loop (see Phase 3)
   - Optionally reset measurement values in FSM state (or preserve final values)

### Phase 3: Real-Time Update Loop (Sub-tasks 5.0-I.7-5.0-I.9, 5.0-I.13-5.0-I.14)
7. **[5.0-I.7]** Create update loop function:
   - Create `_startMeasurementUpdateLoop()` function
   - Use `setInterval` with 100ms interval (10Hz update rate)
   - In loop, generate SPL sample: `const spl = window.Simulator.generateSample()`
   - Process sample: `window.Measurement.processSample(spl)`
   - Get results: `const results = window.Measurement.getResults()`
   - Sync to FSM state (see 5.0-I.9)
   - Store interval ID in `_state.timers.measurementUpdate` (add to timers object)

8. **[5.0-I.8]** Process samples in update loop:
   - Ensure `Measurement.processSample()` is called with generated SPL value
   - This applies weighting, time-constant, and updates all calculations

9. **[5.0-I.9]** Sync Measurement results to FSM state:
   - In update loop, after getting results, update `_state.measurement`:
     - `_state.measurement.currentSPL = results.currentSPL`
     - `_state.measurement.leq = results.leq`
     - `_state.measurement.lmax = results.lmax`
     - `_state.measurement.lmin = results.lmin`
     - `_state.measurement.sel = results.sel`
     - `_state.measurement.peak = results.peak`
     - `_state.measurement.dose = results.dose`
     - `_state.measurement.overRange = results.overRange`
     - `_state.measurement.overRangeWarning = results.overRangeWarning`
   - Call `_emit()` to trigger display update

10. **[5.0-I.13]** Ensure update loop runs at 10Hz:
    - Use `setInterval` with 100ms interval (1000ms / 10 = 100ms)
    - Verify loop only runs when `_state.measurement.isRunning === true`
    - Check `Measurement.getResults().running === true` as additional guard

11. **[5.0-I.14]** Stop update loop when paused or stopped:
    - Create `_stopMeasurementUpdateLoop()` function
    - Clear interval using `clearInterval(_state.timers.measurementUpdate)`
    - Set `_state.timers.measurementUpdate = null`
    - Call from Pause handler (5.0-I.5) and Stop handler (5.0-I.6)

### Phase 4: Configuration Updates (Sub-tasks 5.0-I.10-5.0-I.12)
12. **[5.0-I.10]** Update Measurement config when weighting changes:
    - Find softkey 3 handler (R/C/Z/F cycling)
    - After updating `_state.slm.weighting`, call:
      - `window.Measurement.updateConfig({ weighting: mapWeighting(_state.slm.weighting) })`
      - Map: R→A, C→C, Z→Z, F→A (or check firmware docs for exact mapping)

13. **[5.0-I.11]** Update Measurement config when time constant changes:
    - Find softkey 2 handler (F/S/I cycling)
    - After updating `_state.slm.timeConstant`, call:
      - `window.Measurement.updateConfig({ timeConstant: _state.slm.timeConstant })`

14. **[5.0-I.12]** Update Measurement config when range changes:
    - Find range change handler (if exists in FSM)
    - After updating range, call:
      - `window.Measurement.updateConfig({ range: _state.slm.range })`

### Phase 5: Testing & Validation (Sub-tasks 5.0-I.15-5.0-I.18)
15. **[5.0-I.15]** Test SLM pages display real values:
    - Start measurement
    - Navigate to SLM page 2, 3, 4
    - Verify Leq, Lmax, Lmin, SEL, Peak, Dose display real values (not 0.0)
    - Verify values update over time

16. **[5.0-I.16]** Test real-time updates:
    - Start measurement
    - Monitor FSM state: `window.getMainFSMState().measurement`
    - Verify values change approximately every 100ms (10Hz)
    - Verify values are realistic (e.g., Leq around 70-80 dB typical)

17. **[5.0-I.17]** Test configuration changes:
    - Start measurement, note current Leq value
    - Change weighting (softkey 3: R→C→Z→F)
    - Verify Measurement config updates
    - Verify displayed values may change (if weighting affects calculations)
    - Change time constant (softkey 2: F→S→I)
    - Verify Measurement config updates
    - Verify displayed values change (time constant affects response speed)

18. **[5.0-I.18]** Test Run/Pause/Stop transitions:
    - Start measurement: verify update loop starts, values update
    - Pause measurement: verify update loop stops, values preserved
    - Resume measurement: verify update loop resumes, values continue
    - Stop measurement: verify update loop stops, final values preserved (or reset)

### Implementation Notes
- Follow existing FSM patterns for state management
- Use existing timer management system (`_state.timers`)
- Ensure update loop doesn't run when measurement is not active
- Handle edge cases: rapid button presses, configuration changes during measurement
- Test with different seed values for deterministic behavior
- Verify no memory leaks from update loop
- Match firmware R.13J behavior exactly
- Reference `js/simulator.js` and `js/measurement.js` for module API
- Test each phase before moving to next

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in this document as each sub-task (5.0-I.1-5.0-I.18) is completed
- Test functionality matches firmware R.13J behavior
- Verify all requirements from Task 5.0 are met
- Verify SLM pages 2-4 display real measurement data
- Verify real-time updates work during active measurement sessions
- Verify configuration changes affect measurements correctly

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `js/fsm/mainFSM.js` - Add module initialization, extend state, connect handlers, create update loop

**Files Already Complete (No Changes Needed):**
- `js/simulator.js` - Already implemented ✅
- `js/measurement.js` - Already implemented ✅
- `js/screen-renderer.js` - Already supports bind paths ✅
- `data/screen-atlas.json` - Already has bindings defined ✅
- `index.html` - Already loads modules ✅

**Files to Reference:**
- `tasks/task-5-0.md` - Original Task 5.0 requirements
- `tasks/TASK-5-0-TESTING-GUIDE.md` - Testing guide for Task 5.0
- `js/simulator.js` - Simulator module API reference
- `js/measurement.js` - Measurement module API reference
- `PRD.md` - Requirements reference
- Firmware R.13J documentation PDFs in `Documents/` folder

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review `js/simulator.js` to understand Simulator API (`init()`, `generateSample()`, `reset()`, `getState()`)
   - Review `js/measurement.js` to understand Measurement API (`init()`, `start()`, `pause()`, `stop()`, `processSample()`, `getResults()`, `updateConfig()`)
   - Review `js/fsm/mainFSM.js` to understand:
     - FSM initialization (`initMainFSM()`)
     - Run/Pause/Stop button handlers (search for "RUNPAUSE", "STOP")
     - Timer management (`_state.timers`)
     - State update pattern (`_emit()`)
   - Review existing `_state.measurement` structure
   - Check screen renderer bind path parsing (already works)

2. **Implement Sub-tasks Sequentially:**
   - **Phase 1:** Initialize modules and extend state (5.0-I.1-5.0-I.3)
   - **Phase 2:** Connect button handlers (5.0-I.4-5.0-I.6)
   - **Phase 3:** Create update loop (5.0-I.7-5.0-I.9, 5.0-I.13-5.0-I.14)
   - **Phase 4:** Configuration updates (5.0-I.10-5.0-I.12)
   - **Phase 5:** Testing (5.0-I.15-5.0-I.18)

3. **Testing:**
   - Test each phase before moving to next
   - Use browser console to check FSM state: `window.getMainFSMState().measurement`
   - Verify measurement values update in real-time
   - Test Run/Pause/Stop transitions
   - Test configuration changes
   - Verify SLM pages display real values

4. **Documentation:**
   - Add code comments explaining integration points
   - Document update loop timing (10Hz)
   - Document state synchronization
   - Update implementation notes

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in module APIs
- Show how update loop integrates with existing timer system
- Document any assumptions about weighting/time constant mappings

### Code Quality Standards
- Use semantic variable names
- Follow existing FSM code patterns
- Comment complex integration logic
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Handle edge cases (rapid button presses, config changes during measurement)
- Ensure update loop doesn't cause memory leaks

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Extends existing `_state.measurement` object - backward compatible (adds new properties)
- Existing measurement state management continues to work
- Screen renderer already supports bind paths - no changes needed

**Performance Concerns:**
- Update loop runs at 10Hz (100ms intervals) - should be efficient
- Measurement calculations are already optimized in `js/measurement.js`
- Ensure update loop doesn't run when measurement is not active
- Clear interval properly to prevent memory leaks

**User Workflow Impacts:**
- Students will see realistic measurement values instead of placeholders
- Measurement values update in real-time during active sessions
- Configuration changes (weighting, time constant) immediately affect displayed values
- Training value: Students learn to interpret real measurement data

**Future Dependencies:**
- Task 6.0 (Display Enhancements) depends on measurement data for formatting
- Task 7.0 (Data Logging) depends on measurement engine for logging data
- Phase 5 (Files Menu) is independent - can proceed in parallel

**Risk Mitigation:**
- Test against firmware R.13J documentation for measurement accuracy
- Verify all edge cases are handled (rapid button presses, config changes during measurement)
- Test deterministic behavior ensures reproducible training scenarios
- Verify real-time updates don't cause performance issues
- Ensure update loop cleanup prevents memory leaks
- Test with different seed values

---

## 14. Integration Code Patterns

### Example: Module Initialization
```javascript
function initMainFSM() {
    // ... existing initialization ...
    
    // Initialize Simulator
    const seed = _state.measurement.seed || 12345;
    window.Simulator.init(seed, { baseLevel: 70, variation: 5 });
    
    // Initialize Measurement
    window.Measurement.init({
        weighting: mapWeighting(_state.slm.weighting), // R→A, C→C, Z→Z, F→A
        timeConstant: _state.slm.timeConstant, // F/S/I
        range: _state.slm.range || 80,
        dose: _state.slm.dose || { exchangeRate: 3, threshold: 50, criterionLevel: 70 }
    });
}
```

### Example: Update Loop
```javascript
function _startMeasurementUpdateLoop() {
    _stopMeasurementUpdateLoop();
    
    _state.timers.measurementUpdate = setInterval(() => {
        if (!_state.measurement.isRunning) {
            return; // Don't update if not running
        }
        
        // Generate SPL sample
        const spl = window.Simulator.generateSample();
        
        // Process sample
        window.Measurement.processSample(spl);
        
        // Get results
        const results = window.Measurement.getResults();
        
        // Sync to FSM state
        _state.measurement.currentSPL = results.currentSPL;
        _state.measurement.leq = results.leq;
        _state.measurement.lmax = results.lmax;
        _state.measurement.lmin = results.lmin;
        _state.measurement.sel = results.sel;
        _state.measurement.peak = results.peak;
        _state.measurement.dose = results.dose;
        _state.measurement.overRange = results.overRange;
        _state.measurement.overRangeWarning = results.overRangeWarning;
        
        // Trigger display update
        _emit();
    }, 100); // 10Hz update rate
}
```

### Example: Button Handler Integration
```javascript
case "RUNPAUSE":
    if (isSlm() && _state.measurement.state === "stopped") {
        // Initialize Simulator
        window.Simulator.init(_state.measurement.seed || 12345, { baseLevel: 70, variation: 5 });
        
        // Start Measurement
        window.Measurement.start(() => {
            // Callback for updates (optional - we use interval instead)
        });
        
        // Update FSM state
        _state.measurement.state = "running";
        _state.measurement.isRunning = true;
        _state.measurement.runtime = 0;
        
        // Start update loop
        _startMeasurementUpdateLoop();
        _startMeasurementTimer(); // Existing runtime timer
        
        updateSlmScreen();
        _emit();
    }
    // ... rest of handler ...
```

---

**Ready to Implement?**
This task integrates the Measurement Engine modules into the FSM. Follow the implementation plan sequentially and test each phase before moving to the next. This completes Task 5.0 by making the measurement engine fully functional.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

