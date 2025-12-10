# AI Task Planning - Task 5.0: Measurement Engine

> **How to Use This Template:**
> 1. Specify your task list file: `tasks-PRD.md`
> 2. Open `tasks-PRD.md` and find the task you want to implement (Task 5.0)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-5-0.md`

## 1. Task Overview

### Task Title
**Title:** Measurement Engine - SPL Data Generation and Measurement Calculations

### Goal Statement
**Goal:** Implement the complete measurement engine that generates realistic, deterministic sound pressure level (SPL) data and performs all measurement calculations (Leq, Lmax, Lmin, SEL, Peak, Dose) required by the Quest SoundPro SE-DL simulator. This task creates the core measurement functionality that populates SLM pages 2-4 with real measurement data, applies weighting (A/C/Z) and time-constant (Slow/Fast/Impulse) calculations, implements range logic and over-range warnings, and provides real-time display updates during active measurement sessions. This completes Phase 4 by filling in the missing data content for all SLM pages, making the simulator fully functional for realistic training scenarios.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, deterministic random number generation, real-time measurement updates

### Current State
- ✅ Task 1.0 completed - Device structure and visual layout
- ✅ Task 2.0 completed - Core interaction system with button handlers
- ✅ Task 2.12 completed - Display rendering infrastructure
- ✅ Phase 4 completed - SLM multi-page navigation, mode switching, softkey handlers, icons, timers
- ✅ FSM measurement state exists (`_state.measurement.state`, `_state.measurement.runtime`)
- ✅ Run/Pause/Stop button handlers exist in `js/fsm/mainFSM.js`
- ✅ SLM pages 1-4 screen definitions exist in `data/screen-atlas.json`
- ❌ `js/simulator.js` does not exist - needs to be created
- ❌ `js/measurement.js` does not exist - needs to be created
- ❌ SLM pages 2-4 currently display placeholder data
- ❌ No SPL data generation - no measurement readings
- ❌ No measurement calculations (Leq, Lmax, Lmin, SEL, Peak, Dose)
- ❌ No weighting calculations (A/C/Z) applied to data
- ❌ No time-constant calculations (Slow/Fast/Impulse) applied to data
- ❌ No range logic or over-range warnings
- ❌ No real-time measurement updates during active sessions

---

## 3. Context & Problem Definition

### Problem Statement
Phase 4 completed the UI and navigation infrastructure for SLM multi-page views, but pages 2-4 currently display placeholder data. The PRD requires realistic measurement functionality that generates deterministic SPL data, performs all standard sound level meter calculations, and applies weighting and time-constant filters to match real device behavior. Students need to see actual measurement values (Leq, Lmax, Lmin, SEL, Peak, Dose) that update in real-time during measurement sessions, respond to configuration changes (weighting, time constant, range), and display appropriate warnings when measurements exceed the selected range. Without this measurement engine, the simulator cannot provide realistic training scenarios or demonstrate how configuration choices affect measurement readings.

### Success Criteria
- [ ] 5.1: Create `js/simulator.js` module for SPL data generation
- [ ] 5.2: Implement deterministic random number generator using seed value for reproducible readings
- [ ] 5.3: Create SPL data generator function that produces realistic sound level readings
- [ ] 5.4: Create `js/measurement.js` module for Run/Pause/Stop functionality
- [ ] 5.5: Implement Run state that starts measurement session and begins data generation
- [ ] 5.6: Implement Pause state that suspends measurement without clearing data
- [ ] 5.7: Implement Stop state that ends measurement session
- [ ] 5.8: Build measurement display update system showing Leq (equivalent continuous sound level)
- [ ] 5.9: Add Lmax (maximum level) tracking and display
- [ ] 5.10: Add Lmin (minimum level) tracking and display
- [ ] 5.11: Add SEL (Sound Exposure Level) calculation and display
- [ ] 5.12: Add Peak measurement tracking and display
- [ ] 5.13: Add Dose calculation and display based on configured parameters
- [ ] 5.14: Implement weighting calculations (A/C/Z) applied to simulated SPL data
- [ ] 5.15: Implement time-constant calculations (Slow/Fast/Impulse) applied to SPL data
- [ ] 5.16: Create range logic that detects when measurements exceed selected range
- [ ] 5.17: Implement over-range warning display when measurements exceed range
- [ ] 5.18: Implement real-time display updates during active measurement reflecting selected time constant behavior
- [ ] 5.19: Test measurement calculations with different weighting and time constant combinations

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Feature development - adding measurement engine to complete Phase 4
- **Breaking Changes:** Acceptable - adding new modules, extending existing FSM state
- **Data Handling:** In-memory state only, no persistence - measurement data exists only during active session
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High - completes core SLM functionality, enables realistic training scenarios

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements 25-30:**

1. **Requirement 25:** The system must create a deterministic SPL data generator that produces reproducible sound level readings based on a seed value.
2. **Requirement 26:** The system must implement Run/Pause/Stop functionality that toggles measurement state and updates display accordingly.
3. **Requirement 27:** The system must build a display update system that shows Leq (equivalent continuous sound level), Lmax (maximum level), Lmin (minimum level), SEL (Sound Exposure Level), Peak, and Dose measurements.
4. **Requirement 28:** The system must apply weighting (A/C/Z) and time-constant (Slow/Fast/Impulse) calculations to simulated SPL data to reflect realistic measurement behavior.
5. **Requirement 29:** The system must implement range logic that detects over-range conditions and displays appropriate warnings when measurements exceed the selected range.
6. **Requirement 30:** The system must update measurement displays in real-time during active measurement sessions, reflecting the selected time constant behavior.

### Non-Functional Requirements
- **Performance:** Real-time updates must be smooth (60fps target), no lag during measurement updates
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
- Measurement calculations must be mathematically accurate
- Deterministic random number generator required for reproducible scenarios

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**Measurement State (extends existing `_state.measurement`):**
```javascript
measurement: {
    state: "stopped" | "running" | "paused",
    runtime: 0,                    // seconds (existing)
    seed: 12345,                   // deterministic seed for RNG
    startTime: null,               // timestamp when measurement started
    pauseTime: null,               // accumulated paused duration
    // Measurement values
    currentSPL: 0,                 // current instantaneous SPL reading
    leq: 0,                        // equivalent continuous sound level
    lmax: -Infinity,               // maximum level
    lmin: Infinity,                // minimum level
    sel: 0,                        // sound exposure level
    peak: 0,                       // peak level
    dose: 0,                       // dose percentage
    // Historical data for calculations
    samples: [],                   // array of SPL samples over time
    sampleCount: 0,                // total samples collected
    // Over-range state
    overRange: false,              // true if current reading exceeds range
    overRangeWarning: false        // true if warning should be displayed
}
```

**Simulator State (new module state):**
```javascript
simulator: {
    seed: 12345,                   // current seed value
    baseLevel: 70,                 // base SPL level (dB)
    variation: 5,                  // variation range (±dB)
    trend: 0,                      // slow trend direction (-1 to 1)
    lastUpdate: null               // timestamp of last update
}
```

**Configuration State (extends existing `_state.config` or `_state.slm`):**
```javascript
config: {
    weighting: "A" | "C" | "Z",   // from softkey 3 (R/C/Z/F)
    timeConstant: "F" | "S" | "I", // from softkey 2 (F/S/I)
    range: 80,                     // selected range (30-130 dB)
    dose: {
        exchangeRate: 3,           // 3-6 dB
        threshold: 50,             // 50-100 dB
        criterionLevel: 70         // 70-100 dB
    }
}
```

### Data Migration Plan
N/A - No data migration needed, extending existing state structure

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

**`js/simulator.js` - SPL Data Generator Module:**
- Deterministic random number generator (seed-based)
- SPL data generation function
- Realistic sound level variation simulation
- Base level, variation, and trend management

**`js/measurement.js` - Measurement Calculations Module:**
- Run/Pause/Stop state management
- Leq calculation (equivalent continuous sound level)
- Lmax/Lmin tracking
- SEL calculation (sound exposure level)
- Peak detection
- Dose calculation based on configured parameters
- Weighting filter application (A/C/Z)
- Time-constant filter application (Slow/Fast/Impulse)
- Range detection and over-range logic
- Real-time update scheduling

### Page Updates

**`js/fsm/mainFSM.js` - FSM Integration:**
- Import and initialize `simulator.js` and `measurement.js`
- Integrate measurement engine with existing Run/Pause/Stop handlers
- Update measurement state during active sessions
- Trigger display updates on measurement state changes
- Handle configuration changes (weighting, time constant, range) affecting measurements

**`js/screen-renderer.js` - Display Updates:**
- Render measurement values on SLM pages 1-4
- Display Leq, Lmax, Lmin, SEL, Peak, Dose values
- Show over-range warnings when applicable
- Update measurement displays in real-time during active sessions
- Format measurement values according to firmware R.13J specifications

**`data/screen-atlas.json` - Screen Definitions:**
- Update SLM pages 2-4 with measurement element definitions
- Add measurement value labels and positions
- Define over-range warning display elements

**`js/display.js` - Display Refresh:**
- Trigger refresh on measurement state changes
- Schedule periodic updates during active measurement sessions

### State Management
- Measurement state managed in `js/measurement.js` module
- State synchronized with FSM `_state.measurement` object
- Real-time updates triggered by measurement engine
- Display updates triggered by state change events
- Configuration changes (weighting, time constant) immediately affect ongoing measurements

---

## 9. Implementation Plan

### Phase 1: SPL Data Generator (Sub-tasks 5.1-5.3)
1. **[5.1]** Create `js/simulator.js` module structure with exports
2. **[5.2]** Implement deterministic random number generator using seed value
   - Use linear congruential generator (LCG) or similar algorithm
   - Seed-based initialization for reproducibility
   - Test with same seed produces identical sequence
3. **[5.3]** Create SPL data generator function
   - Generate realistic sound level readings (typically 30-130 dB range)
   - Add variation and slow trends for realism
   - Return SPL values in dB

### Phase 2: Measurement Module Foundation (Sub-tasks 5.4-5.7)
4. **[5.4]** Create `js/measurement.js` module structure
   - Export measurement state management functions
   - Export calculation functions
   - Export update scheduling functions
5. **[5.5]** Implement Run state functionality
   - Start measurement session
   - Initialize measurement state
   - Begin data generation and collection
   - Start real-time update loop
6. **[5.6]** Implement Pause state functionality
   - Suspend data collection
   - Preserve current measurement values
   - Stop update loop (preserve state)
7. **[5.7]** Implement Stop state functionality
   - End measurement session
   - Reset measurement values (or preserve final values?)
   - Clear update loop

### Phase 3: Measurement Calculations (Sub-tasks 5.8-5.13)
8. **[5.8]** Build Leq (equivalent continuous sound level) calculation
   - Accumulate samples over time
   - Calculate energy average
   - Convert to dB
9. **[5.9]** Add Lmax (maximum level) tracking
   - Track highest SPL value during session
   - Update on each new sample
10. **[5.10]** Add Lmin (minimum level) tracking
    - Track lowest SPL value during session
    - Update on each new sample
11. **[5.11]** Add SEL (Sound Exposure Level) calculation
    - Calculate total sound energy
    - Normalize to 1 second reference
    - Convert to dB
12. **[5.12]** Add Peak measurement tracking
    - Track instantaneous peak values
    - Update faster than Leq (no time averaging)
13. **[5.13]** Add Dose calculation
    - Use configured parameters (exchange rate, threshold, criterion level)
    - Calculate percentage based on exposure time and level
    - Update in real-time during measurement

### Phase 4: Weighting and Time-Constant Filters (Sub-tasks 5.14-5.15)
14. **[5.14]** Implement weighting calculations (A/C/Z)
    - Apply A-weighting filter to SPL data (frequency-dependent attenuation)
    - Apply C-weighting filter to SPL data
    - Apply Z-weighting (flat, no filter)
    - Use standard IEC 61672 weighting curves (simplified for training)
15. **[5.15]** Implement time-constant calculations (Slow/Fast/Impulse)
    - Slow: 1-second exponential averaging
    - Fast: 125ms exponential averaging
    - Impulse: Peak-hold with fast attack, slow decay
    - Apply to displayed values based on current configuration

### Phase 5: Range Logic and Warnings (Sub-tasks 5.16-5.17)
16. **[5.16]** Create range logic
    - Compare current measurement to selected range
    - Detect when measurement exceeds range
    - Set over-range flag
17. **[5.17]** Implement over-range warning display
    - Display warning message when over-range detected
    - Update display to show over-range indicator
    - Clear warning when back in range

### Phase 6: Real-Time Updates and Integration (Sub-tasks 5.18-5.19)
18. **[5.18]** Implement real-time display updates
    - Schedule periodic updates during active measurement (e.g., 10Hz update rate)
    - Update all measurement displays (Leq, Lmax, Lmin, SEL, Peak, Dose)
    - Reflect current time-constant behavior in display updates
    - Integrate with existing FSM measurement state
19. **[5.19]** Test measurement calculations
    - Test with different weighting combinations (A/C/Z)
    - Test with different time-constant settings (Slow/Fast/Impulse)
    - Test range detection and over-range warnings
    - Verify deterministic behavior with same seed
    - Test Run/Pause/Stop state transitions
    - Verify real-time updates work correctly

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact measurement behavior and formulas
- Test each sub-task before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses
- Reference existing FSM state structure in `js/fsm/mainFSM.js`
- Integrate with existing Phase 4 SLM page infrastructure
- Ensure measurement values populate SLM pages 2-4 correctly
- Match firmware R.13J display format for all measurement values

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (5.1-5.19) is completed
- Mark parent task 5.0 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met
- Verify SLM pages 2-4 display real measurement data
- Verify real-time updates work during active measurement sessions

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Create:**
- `js/simulator.js` - SPL data generator module (deterministic RNG, SPL generation)
- `js/measurement.js` - Measurement calculations module (Leq, Lmax, Lmin, SEL, Peak, Dose, filters)

**Files to Modify:**
- `js/fsm/mainFSM.js` - Integrate measurement engine with FSM, update Run/Pause/Stop handlers
- `js/screen-renderer.js` - Render measurement values on SLM pages, display over-range warnings
- `js/display.js` - Trigger display refresh on measurement updates
- `data/screen-atlas.json` - Update SLM pages 2-4 with measurement element definitions
- `tasks/tasks-PRD.md` - Update task 5.0 checkboxes as work progresses

**Files to Reference:**
- `PRD.md` - Requirements reference (Requirements 25-30)
- `assets/Quest Sound Meter.png` - Device background image
- Firmware R.13J documentation PDFs in `Documents/` folder
- `tasks/PHASE-4-TESTING-GUIDE.md` - Testing guide for SLM pages
- `js/fsm/mainFSM.js` - Existing FSM state structure
- `data/screen-atlas.json` - Existing SLM page definitions

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements (Requirements 25-30)
   - Review firmware R.13J documentation for measurement formulas and behavior
   - Understand current codebase state (Phase 4 complete, FSM structure exists)
   - Check existing FSM measurement state in `js/fsm/mainFSM.js`
   - Review SLM page definitions in `data/screen-atlas.json`

2. **Implement Sub-tasks Sequentially:**
   - Implement 5.1: Create `js/simulator.js` module structure
   - Implement 5.2: Implement deterministic random number generator
   - Implement 5.3: Create SPL data generator function
   - Implement 5.4: Create `js/measurement.js` module structure
   - Implement 5.5: Implement Run state functionality
   - Implement 5.6: Implement Pause state functionality
   - Implement 5.7: Implement Stop state functionality
   - Implement 5.8: Build Leq calculation
   - Implement 5.9: Add Lmax tracking
   - Implement 5.10: Add Lmin tracking
   - Implement 5.11: Add SEL calculation
   - Implement 5.12: Add Peak tracking
   - Implement 5.13: Add Dose calculation
   - Implement 5.14: Implement weighting calculations (A/C/Z)
   - Implement 5.15: Implement time-constant calculations (Slow/Fast/Impulse)
   - Implement 5.16: Create range logic
   - Implement 5.17: Implement over-range warning display
   - Implement 5.18: Implement real-time display updates
   - Implement 5.19: Test measurement calculations

3. **Testing:**
   - Test each feature matches firmware R.13J behavior
   - Verify all PRD requirements are met
   - Test deterministic behavior (same seed = same sequence)
   - Test real-time updates during active measurement
   - Test Run/Pause/Stop state transitions
   - Test weighting and time-constant effects on measurements
   - Test range detection and over-range warnings
   - Verify SLM pages 2-4 display real measurement data
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining complex calculations
   - Document measurement formulas used
   - Document any deviations from firmware (should be none)
   - Update implementation notes
   - Add JSDoc comments to all exported functions

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if firmware documentation is unclear
- Show measurement calculation formulas being used

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern
- Comment complex calculations and measurement formulas
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Use meaningful variable names for measurement values (leq, lmax, etc.)
- Document mathematical formulas in comments

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Extends existing `_state.measurement` object - should be backward compatible
- Adds new modules (`simulator.js`, `measurement.js`) - no breaking changes
- Updates SLM page rendering - may affect existing placeholder displays (intended)

**Performance Concerns:**
- Real-time updates must be efficient (target 10Hz update rate, not 60fps)
- Measurement calculations should be optimized for frequent updates
- Avoid unnecessary DOM manipulation during updates
- Use requestAnimationFrame or setTimeout for update scheduling

**User Workflow Impacts:**
- Students will see realistic measurement values instead of placeholders
- Measurement values update in real-time during active sessions
- Configuration changes (weighting, time constant) immediately affect displayed values
- Over-range warnings provide important feedback

**Future Dependencies:**
- Task 6.0 (Display Enhancements) depends on measurement data for formatting
- Task 7.0 (Data Logging) depends on measurement engine for logging data
- Phase 5 (Files Menu) is independent - can proceed in parallel

**Risk Mitigation:**
- Test against firmware R.13J documentation for measurement accuracy
- Verify all edge cases are handled (over-range, pause/resume, stop)
- Document any assumptions made about measurement formulas
- Test deterministic behavior ensures reproducible training scenarios
- Verify real-time updates don't cause performance issues

---

## 14. Measurement Calculation Notes

### Key Formulas (Reference - implement per firmware R.13J specs)

**Leq (Equivalent Continuous Sound Level):**
- Energy average: Leq = 10 * log10(1/T * Σ(10^(L_i/10)))
- Where T is measurement duration, L_i are sample levels

**SEL (Sound Exposure Level):**
- Total energy: SEL = 10 * log10(Σ(10^(L_i/10)))
- Normalized to 1 second reference

**Dose:**
- Percentage based on exchange rate, threshold, and criterion level
- Formula depends on configured parameters

**Weighting Filters:**
- A-weighting: Frequency-dependent attenuation (simplified for training)
- C-weighting: Frequency-dependent attenuation (simplified for training)
- Z-weighting: Flat (no filter)

**Time Constants:**
- Slow: 1-second exponential averaging (tau = 1s)
- Fast: 125ms exponential averaging (tau = 0.125s)
- Impulse: Peak-hold with fast attack, slow decay

**Note:** Actual formulas should be extracted from firmware R.13J documentation for accuracy.

---

**Ready to Implement?**
This task implements the Measurement Engine (Task 5.0). Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete. This completes Phase 4 by populating SLM pages 2-4 with real measurement data.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

