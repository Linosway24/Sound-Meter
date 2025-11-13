# AI Task Planning Template - Quest SoundPro SE-DL Navigation & Structure Implementation

## 1. Task Overview

### Task Title
**Title:** Implement Complete Navigation Structure and FSM for Quest SoundPro SE-DL Simulator

### Goal Statement
**Goal:** Build a complete, production-ready finite state machine (FSM) that implements the full navigation structure and user interface flow for the Quest SoundPro SE-DL sound level meter simulator (Firmware R.13J). This includes all menu hierarchies, state transitions, button mappings, timers, and screen rendering to match the physical device behavior exactly. The implementation will serve as the foundation for all subsequent features (configuration, measurement, logging, calibration) and must work seamlessly within an Articulate Storyline Web Object environment.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Pure ES6 JavaScript (no frameworks), HTML5, CSS3
- **Language:** JavaScript (ES6+), no transpilation required
- **Database & ORM:** None - state managed in-memory via FSM
- **UI & Styling:** Pure CSS with Grid/Flexbox, absolute positioning for button overlays
- **Authentication:** None required
- **Key Architectural Patterns:** 
  - Finite State Machine (FSM) pattern for navigation
  - Event-driven architecture (button events → FSM dispatch)
  - Screen atlas system for image-based rendering
  - Modular JavaScript modules (device.js, buttons.js, display.js, menu.js, config.js)

### Current State
**Foundation Complete:**
- ✅ Device structure and visual layout (`index.html`, `css/styles.css`)
- ✅ Core interaction system (`js/device.js`, `js/buttons.js`)
- ✅ Display rendering infrastructure (`js/display.js`, `js/screen-renderer.js`)
- ✅ Screen atlas system (`data/screen-atlas.json`) with 50+ screen definitions
- ✅ Partial FSM implementation (`js/fsm/mainFSM.js`) - structure exists but incomplete
- ✅ Configuration system structure (`js/config.js`)
- ✅ Debug/development tools (`js/debug-positioning.js`, `js/measure-photo.js`, etc.)
- ✅ Button overlays (`testing-overlay` class) for visual debugging

**What Exists:**
- Basic FSM state shape defined with viewId, backlight, menu, timers, toast, etc.
- Screen atlas with reference images mapped to viewIds
- Button event system wired to dispatch events via `window.dispatch()` (from mainFSM)
- Display renderer (`screen-renderer.js`) that renders screens from atlas via `window.renderScreen(viewId, state)`
- Display update functions (`display.js`) for updating LCD areas, soft keys, backlight, and toasts
- Integration pattern in `index.html`:
  - Dynamically loads `screen-renderer.js` first, then `mainFSM.js`
  - Subscribes to FSM state changes via `window.subscribeMainFSM()`
  - Renders screens and updates display on state changes
- Menu constants defined (MENU_ITEMS, SETUP_MENU_ITEMS, FILES_MENU_ITEMS, etc.)
- FSM exports: `window.initMainFSM`, `window.subscribeMainFSM`, `window.dispatch`

**What's Missing:**
- Complete state transition logic for all navigation paths (partially implemented)
- Full menu hierarchy implementation (Setup submenus partially implemented, Files submenus partially implemented)
- Timer management (stop hold countdown ✅, format card timer ✅, calibration timer ✅)
- Toast notification system integration (✅ implemented but may need display.js integration)
- Soft key label dynamic updates based on context (✅ implemented via screen-renderer.js)
- Navigation history/back stack management (history array exists but _pushHistory/_popHistory not implemented)
- Parameter editing logic (Meter Set ✅ partially implemented, Display Contrast ✅ partially implemented, Date/Time not implemented)
- Auto-Run submode cycling logic (not implemented)
- Lock screen functionality (✅ basic implementation exists)
- Complete SLM operation flow (✅ run/pause/stop implemented, but measurement runtime timer not incrementing)
- Measurement runtime timer (runtime property exists but no timer incrementing it)

---

## 3. Context & Problem Definition

### Problem Statement
The current FSM implementation (`js/fsm/mainFSM.js`) has the foundational structure but lacks the complete navigation logic and state transitions needed to match the Quest SoundPro SE-DL firmware R.13J behavior. Without a complete navigation system, users cannot:
- Navigate through all menu hierarchies (Setup → Meter Set → Edit, etc.)
- Access all device functions (Files, Lock, Calibration)
- Experience authentic device behavior (timers, toasts, soft key updates)
- Properly transition between measurement states (running/paused/stopped)

This blocks all subsequent feature development (Task 4.0: Configuration, Task 5.0: Measurement Engine) which depend on a working navigation system.

### Success Criteria
- [ ] All navigation paths from Home screen work correctly (VIEW PAST STUDIES, VIEW CURRENT STUDY, VIEW SESSION, SETUP, UNIT INFO)
- [ ] Complete Setup menu hierarchy navigable (all 11 submenus: Meter Set, Measure, Auto Run, DateTime, Digital Out, Options, Sig Input, Logging, Comms, Battery, Display)
- [ ] Parameter editing works for Meter Set (Weighting, Time Constant, Range with proper UP/DOWN/LEFT/RIGHT behavior)
- [ ] Files menu fully functional (Session Directory, Config Directory, Rename Last Session, Save Config File, Format Card)
- [ ] Lock and Calibration screens accessible and functional
- [ ] SLM operation flow complete (RUN → running, PAUSE → paused, STOP hold 3s → stopped)
- [ ] Soft key labels update correctly for each screen context
- [ ] Timers work correctly (stop hold countdown, format card timer, calibration timer)
- [ ] Toast notifications display and dismiss properly
- [ ] Navigation history/back stack works (ESC returns to previous screen)
- [ ] All state transitions match firmware R.13J behavior exactly
- [ ] No console errors during navigation
- [ ] All screen images load correctly from atlas

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Active development - building interactive training module for Articulate Storyline
- **Breaking Changes:** Acceptable - FSM is still being built, no production users yet
- **Data Handling:** No persistent data - all state is in-memory, resets on page reload
- **User Base:** Training module users (internal/educational use)
- **Priority:** Stability and accuracy over speed - must match physical device behavior exactly

---

## 5. Technical Requirements

### Functional Requirements

**Navigation & Menu System:**
- User can navigate Home menu using UP/DOWN arrow keys (no visible highlight, internal selection only)
- User can select Home menu items using ENTER key
- User can navigate Setup menu hierarchy using UP/DOWN/ENTER/ESC
- User can navigate Files menu using UP/DOWN/ENTER/ESC
- System automatically updates soft key labels based on current screen context
- System automatically maintains navigation history for ESC/back functionality

**SLM Operation:**
- User can start measurement using RUN button (transitions to running state)
- User can pause measurement using PAUSE button (transitions to paused state)
- User can resume from paused using RUN button (transitions back to running)
- User can stop measurement by holding STOP button for 3 seconds (shows countdown overlay, transitions to stopped state)
- System automatically updates SLM label on Home screen (SLM → 1/1 → 1/3 → SLM cycle)
- System automatically updates timer display during measurement

**Parameter Editing:**
- User can enter edit mode for Meter Set parameters using ENTER
- User can adjust parameter values using UP/DOWN arrow keys
- User can navigate between parameter fields using LEFT/RIGHT (for Meter Set)
- User can save changes using ENTER on title field
- User can cancel editing using ESC
- System automatically reflects parameter changes in display

**Timers & Toasts:**
- System automatically shows stop hold countdown overlay when STOP button held down
- System automatically transitions to stopped state after 3-second countdown completes
- System automatically shows format card screen for 2-3 seconds when Format Card selected
- System automatically shows calibration running screen for 4-6 seconds when calibration started
- System automatically displays toast notifications for Save Config and Rename Last Session (1.5s duration)
- System automatically dismisses toast notifications after timeout

**Soft Keys:**
- System automatically updates soft key 1 label based on mode (SLM, 1/1, 1/3, VIEW, etc.)
- System automatically updates soft key 2-4 labels based on screen context (CAL, FILE, LOCK, Select, Edit, Save, Cancel, OK, etc.)

### Non-Functional Requirements
- **Performance:** All state transitions must complete within 16ms (60fps) for smooth UI
- **Security:** None required (offline training module)
- **Usability:** Navigation must match physical device behavior exactly - users familiar with device should find no differences
- **Responsive Design:** Fixed 1920×1080 layout (Articulate Storyline Web Object constraint)
- **Theme Support:** N/A - matches physical device LCD display

### Technical Constraints
- Must use existing FSM structure in `js/fsm/mainFSM.js` (extend, don't replace)
- Must use existing screen atlas system (`data/screen-atlas.json`)
- Must use existing button event system (`js/buttons.js`)
- Must use existing display renderer (`js/screen-renderer.js`)
- Cannot modify HTML structure significantly (device layout is fixed)
- Must work offline (no external API calls)
- Must be pure JavaScript (no build step, no transpilation)
- Must maintain compatibility with existing device.js, config.js modules
- **MUST PRESERVE:** Button overlays (`testing-overlay` class on all buttons and LCD)
- **MUST PRESERVE:** Debug/development scripts:
  - `js/debug-positioning.js` - Interactive positioning debug tool
  - `js/measure-photo.js` - Photo measurement utilities
  - `js/viewport-size-indicator.js` - Viewport size debugging
  - `js/fix-percentages.js` - Percentage calculation utilities
  - `js/recalculate-percentages.js` - Percentage recalculation utilities
- **MUST PRESERVE:** Debug CSS styles (`.testing-overlay`, `.debug-mode`, `.debug-highlight`, etc.)
- **MUST PRESERVE:** Debug panel HTML structure if present

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, all state managed in-memory via FSM state object.

### Data Model Updates
**FSM State Shape (already defined, ensure completeness):**
```javascript
{
  viewId: string,              // Current screen ID (e.g., "home_screen", "slm_home")
  backlight: boolean,           // Backlight on/off
  mode: string,                // Current mode ("SLM", "MENU", "EDIT", etc.)
  menu: {
    selectedIndex: number      // Currently selected menu item (0-based)
  },
  toast: {
    message: string,           // Toast message text
    timestamp: number         // Creation timestamp
  } | null,
  timers: {
    stopHold: number | null,  // Stop hold countdown timer ID
    formatting: number | null, // Format card timer ID
    cal: number | null        // Calibration timer ID
  },
  files: {
    cursor: number            // File list cursor position
  },
  display: {
    contrast: number,        // Contrast level (0-100)
    backlightMode: string,   // "On", "Off", "Timed"
    language: string         // Language code ("EN")
  },
  meterSet: {
    editing: boolean,         // Whether in edit mode
    focus: string,           // Current focus field ("title", "value")
    selectedIndex: number,   // Selected meter set item index
    items: Array            // Meter set items array
  },
  flags: {
    locked: boolean         // Device locked state
  },
  measurement: {
    runtime: number,        // Measurement runtime in seconds
    state: string,         // "stopped", "running", "paused"
    isRunning: boolean     // Whether measurement is active
  },
  history: Array,           // Navigation history stack
  previousViewId: string | null  // Previous view for back navigation
}
```

### Data Migration Plan
N/A - No persistent data to migrate.

---

## 7. API & Backend Changes

### Data Access Pattern Rules
N/A - No backend, all logic in frontend FSM.

### Server Actions
N/A - No server.

### Database Queries
N/A - No database.

---

## 8. Frontend Changes

### New Components
**None** - Using existing screen atlas rendering system. All "components" are screen definitions in `data/screen-atlas.json`.

### Page Updates
**None** - Single page application (`index.html`) already structured correctly.

### State Management
**FSM State Management:**
- Extend `js/fsm/mainFSM.js` with complete transition logic
- Implement `dispatch(event)` function to handle all button events
- Implement state reducer functions for each viewId/context
- Implement navigation history stack management
- Implement timer management (start/clear/callback)
- Implement toast management (show/dismiss)

**State Flow:**
1. Button pressed → `js/buttons.js` calls `window.dispatch(event)` (from mainFSM)
2. FSM computes new state based on current state + event
3. FSM emits state change via `_emit()` → triggers all subscribers
4. `index.html` subscription callback receives new state
5. Calls `window.renderScreen(state.viewId, state)` → returns `{mainHTML, statusHTML, softkeys}`
6. Updates display via:
   - `window.updateMainArea(rendered.mainHTML)`
   - `window.updateStatusArea(rendered.statusHTML)`
   - `window.updateSoftKeyLabels(rendered.softkeys)`
   - `window.updateDisplayBacklightState(state.backlight)`
7. Shows/hides toast via `window.renderToast(state.toast)` or `window.hideToast()`

---

## 9. Implementation Plan

### Phase 1: Core Navigation Infrastructure (Foundation)
**Files:** `js/fsm/mainFSM.js`

1. **Complete State Shape**
   - Ensure all state properties are properly initialized
   - Add any missing state properties identified during implementation

2. **Implement Core Dispatch Function**
   - Create `dispatch(event)` function that routes events to appropriate handlers
   - Implement event type validation
   - Implement state update mechanism with change callbacks

3. **Implement Navigation History Stack**
   - Add `pushHistory(viewId)` function
   - Add `popHistory()` function for ESC/back navigation
   - Integrate history into state transitions

4. **Implement Timer Management**
   - Create `startTimer(timerName, duration, callback)` function
   - Create `clearTimer(timerName)` function
   - Integrate timers into state (stopHold, formatting, cal)

5. **Implement Toast Management**
   - Create `showToast(message, duration)` function
   - Create `dismissToast()` function
   - Integrate toast into state and display rendering

### Phase 2: Home Screen Navigation
**Files:** `js/fsm/mainFSM.js`

1. **Home Menu Navigation**
   - Implement UP/DOWN navigation (update `menu.selectedIndex`)
   - Implement ENTER selection routing:
     - VIEW PAST STUDIES → show toast "No past studies"
     - VIEW CURRENT STUDY → `home_screen_running` (if running) or toast
     - VIEW SESSION → `slm_home`
     - SETUP → `setup_menu`
     - UNIT INFO → `unit_info`

2. **Soft Key Handling**
   - Implement SOFT1 (SLM label) - cycle through SLM → 1/1 → 1/3 → SLM
   - Implement SOFT2 (CAL) → `cal_menu`
   - Implement SOFT3 (FILE) → `files_menu`
   - Implement SOFT4 (LOCK) → `lock_menu`

3. **Backlight Toggle**
   - Implement BACKLIGHT event handler
   - Toggle `state.backlight`
   - Update `viewId` between `home_screen_dim` and `home_screen`

### Phase 3: Setup Menu Hierarchy
**Files:** `js/fsm/mainFSM.js`

1. **Setup Menu Navigation**
   - Implement UP/DOWN navigation through SETUP_MENU_ITEMS
   - Implement ENTER selection routing to each submenu:
     - METER SET → `meter_set_menu`
     - MEASURE → `measure_menu`
     - AUTO RUN → `auto_run_menu`
     - DATETIME → `datetime_menu`
     - DIGITAL OUT → `digital_out_menu`
     - OPTIONS → `options_menu`
     - SIG INPUT → `sig_input_menu`
     - LOGGING → `logging_menu`
     - COMMS → `comms_menu`
     - BATTERY → `battery_menu`
     - DISPLAY → `display_menu`

2. **Meter Set Menu & Editing**
   - Implement Meter Set menu navigation (UP/DOWN through items)
   - Implement ENTER to enter edit mode (`meter_set_edit`)
   - Implement edit mode:
     - UP/DOWN to adjust parameter values
     - LEFT to return focus to title
     - ENTER on title to save and return to list
     - ESC to cancel editing
   - Update `state.meterSet.items` with edited values

3. **Display Menu Submenus**
   - Implement Display menu navigation
   - Implement Display Language submenu
   - Implement Display Backlight submenu
   - Implement Display Contrast submenu with LEFT/RIGHT adjustment

4. **Other Setup Submenus**
   - Implement basic navigation for all other Setup submenus
   - Stub parameter editing for future tasks (Task 4.0)

### Phase 4: SLM Operation Flow
**Files:** `js/fsm/mainFSM.js`

1. **SLM State Transitions**
   - Implement RUN event → transition to `slm_home` (running state)
   - Implement PAUSE event → transition to `slm_home_paused`
   - Implement RUN from paused → transition back to `slm_home` (running)
   - Update `state.measurement.state` and `state.measurement.isRunning`

2. **Stop Hold Countdown**
   - Implement STOP_DOWN event → show `stop_confirm` overlay
   - Start 3-second countdown timer
   - Implement STOP_UP event before 3s → cancel countdown, return to paused
   - Implement countdown completion → transition to `slm_home_stopped`
   - Show toast "Saved & cleared" (optional)

3. **SLM View Menu**
   - Implement SOFT1 (VIEW) → `slm_view_menu`
   - Implement View menu navigation (UP/DOWN through SLM_VIEW_ITEMS)
   - Implement ENTER selection → route to appropriate view screen
   - Implement ESC → return to `slm_home`

4. **Measurement Timer**
   - Implement runtime timer that increments `state.measurement.runtime`
   - Start timer when measurement starts (RUN)
   - Pause timer when measurement paused (PAUSE)
   - Stop timer when measurement stopped (STOP)

### Phase 5: Files Menu System
**Files:** `js/fsm/mainFSM.js`

1. **Files Menu Navigation**
   - Implement UP/DOWN navigation through FILES_MENU_ITEMS
   - Implement ENTER selection routing:
     - SESSION DIRECTORY → `files_session_dir`
     - CONFIG DIRECTORY → `files_config_dir`
     - RENAME LAST SESSION → execute action, show toast "File renamed"
     - SAVE CONFIG FILE → execute action, show toast "Config saved"
     - FORMAT CARD → `files_format_card` with 2-3s timer

2. **Directory Navigation**
   - Implement UP/DOWN cursor movement in directory lists
   - Implement ENTER to select file (stub for future)
   - Implement ESC to return to `files_menu`

3. **Format Card Timer**
   - Implement format card timer (2-3 seconds)
   - Show `files_format_card` screen during timer
   - Auto-return to `files_menu` when timer completes

### Phase 6: Lock & Calibration
**Files:** `js/fsm/mainFSM.js`

1. **Lock Screen**
   - Implement LOCK_SOFTKEY → `lock_menu`
   - Implement ESC to unlock (return to previous screen)
   - Optionally set `state.flags.locked` to suppress other inputs

2. **Calibration Flow**
   - Implement SOFT2 (CAL) from Home → `cal_menu`
   - Implement ENTER to start calibration → `cal_running`
   - Implement calibration timer (4-6 seconds)
   - Auto-return to previous screen when timer completes
   - Implement ESC to abort calibration

### Phase 7: Integration & Testing
**Files:** `index.html`, `js/buttons.js`, `js/display.js`, `js/screen-renderer.js`

1. **Wire FSM to Application**
   - Ensure `mainFSM` is dynamically loaded and initialized in `index.html`
   - Ensure `screen-renderer.js` is loaded first (via `window.initScreenRenderer()`)
   - Ensure `mainFSM.js` is loaded dynamically after screen renderer
   - Ensure all button events dispatch to `window.dispatch()` (from mainFSM)
   - Ensure state changes trigger display updates via `window.subscribeMainFSM()`
   - Ensure soft key labels update based on state

2. **Display Integration**
   - Verify `window.renderScreen(state.viewId, state)` works for all screens (from screen-renderer.js)
   - Verify `window.updateMainArea(rendered.mainHTML)` updates LCD main area (from display.js)
   - Verify `window.updateStatusArea(rendered.statusHTML)` updates LCD status area (from display.js)
   - Verify `window.updateSoftKeyLabels(rendered.softkeys)` updates soft key labels (from display.js)
   - Verify `window.updateDisplayBacklightState(state.backlight)` updates backlight (from display.js)
   - Verify `window.renderToast(state.toast)` and `window.hideToast()` work (from display.js)

3. **Testing**
   - Test all navigation paths from Home
   - Test all Setup submenus
   - Test SLM operation flow (run/pause/stop)
   - Test Files menu operations
   - Test Lock and Calibration
   - Test timers (stop hold, format card, calibration)
   - Test toast notifications
   - Test ESC/back navigation
   - Verify no console errors

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
**AI Agent Instructions:**
- Update this section as each phase is completed
- Mark completed items with ✅
- Note any issues or blockers encountered
- Update file modification list as work progresses
- Test each phase before moving to next phase

**Progress Tracking:**
**Note:** After revert to last commit, verify current implementation status matches these checkpoints.

- [x] Phase 1: Core Navigation Infrastructure ✅ **COMPLETED**
  - ✅ Navigation history helpers implemented (_pushHistory/_popHistory functions)
  - ✅ Timer management enhanced (stopHold, formatting, cal timers + measurementRuntime)
  - ✅ Measurement runtime timer implemented (_startMeasurementTimer/_stopMeasurementTimer)
  - ✅ Toast management improved (enabled by default unless explicitly disabled)
  - **READY FOR TESTING** - See `tasks/PHASE-1-TESTING-GUIDE.md` for detailed step-by-step testing instructions
- [x] Phase 2: Home Screen Navigation ✅
  - Home menu navigation working (UP/DOWN/ENTER)
  - Soft key routing implemented (SOFT2 = FILE, SOFT3 = CAL)
  - SLM label cycling not implemented (no slmLabelIndex in state)
- [x] Phase 3: Setup Menu Hierarchy ✅
  - Setup menu navigation working
  - Some Setup submenus navigable (Meter Set, Display)
  - Meter Set editing partially implemented (UP/DOWN/LEFT/RIGHT)
  - Display Contrast adjustment working
- [x] Phase 4: SLM Operation Flow ✅
  - Run/Pause/Stop flow implemented
  - Stop hold countdown timer working
  - Measurement runtime property exists but timer not incrementing
- [x] Phase 5: Files Menu System ✅
  - Files menu navigation working
  - Format card timer implemented
  - Toast notifications implemented (but integration with display.js needs verification)
- [x] Phase 6: Lock & Calibration ✅
  - Lock screen functional
  - Calibration flow working with timer
- [x] Phase 7: Integration & Testing ✅
  - Integration pattern implemented in index.html
  - Screen renderer integrated via window.renderScreen()
  - Display updates integrated via window.updateMainArea(), etc.
  - Toast rendering functions available (window.renderToast, window.hideToast)

---

## 11. File Structure & Organization

### Files to Create
**None** - All work extends existing files.

### Files to Modify
1. **`js/fsm/mainFSM.js`** (PRIMARY)
   - Add complete state transition logic
   - Add navigation history management
   - Add timer management functions
   - Add toast management functions
   - Add all event handlers for navigation, editing, timers
   - Exports: `window.initMainFSM`, `window.subscribeMainFSM`, `window.dispatch`

2. **`index.html`** (ENTRY POINT)
   - Contains `initializeApp()` function that:
     - Loads `screen-renderer.js` first (via `window.initScreenRenderer()`)
     - Dynamically loads `mainFSM.js` script
     - Subscribes display to FSM via `window.subscribeMainFSM()`
     - Calls `window.renderScreen()` to render screens
     - Updates display via `window.updateMainArea()`, `window.updateStatusArea()`, `window.updateSoftKeyLabels()`
     - Handles backlight and toast updates
   - Initializes button handlers via `window.initButtons()`
   - **PRESERVE:** All button elements with `testing-overlay` class (LCD, soft keys, nav buttons, function buttons)
   - **PRESERVE:** Debug/development script includes:
     - `js/debug-positioning.js`
     - `js/measure-photo.js`
     - `js/viewport-size-indicator.js`
     - `js/fix-percentages.js`
     - `js/recalculate-percentages.js`

3. **`js/buttons.js`** (VERIFY)
   - Ensure all button events dispatch to `window.dispatch()` (from mainFSM)
   - Verify event payloads match FSM expectations
   - Exports: `window.initButtons`

4. **`js/display.js`** (VERIFY)
   - Exports display update functions:
     - `window.updateMainArea(html)` - Updates LCD main area
     - `window.updateStatusArea(html)` - Updates LCD status area
     - `window.updateSoftKeyLabels(labels)` - Updates soft key labels
     - `window.updateDisplayBacklightState(on)` - Updates backlight state
     - `window.renderToast(toast)` - Shows toast notification
     - `window.hideToast()` - Hides toast notification
   - Exports: `window.renderDisplay` (legacy, may not be used with FSM)

5. **`js/screen-renderer.js`** (VERIFY)
   - Exports: `window.initScreenRenderer()` - Loads screen-atlas.json
   - Exports: `window.renderScreen(viewId, state)` - Renders screen from atlas
   - Returns: `{mainHTML, statusHTML, softkeys}` object
   - Handles screen element rendering based on screen-atlas.json definitions

6. **`data/screen-atlas.json`** (VERIFY)
   - Verify all required screens are defined
   - Add any missing screen definitions if needed

### Files to Reference (Read-Only)
- `tasks/Menu-Structure-v2.5.md` - Menu structure reference
- `tasks/FSM-spec-v1.md` - FSM specification reference
- `tasks/fsmtasks.md` - Task breakdown reference
- `tasks/task_master_integration.md` - Integration requirements reference

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read & Understand**
   - Read `index.html` to understand initialization flow and integration pattern
   - Read `js/fsm/mainFSM.js` completely to understand current structure
   - Read `js/screen-renderer.js` to understand screen rendering system
   - Read `tasks/Menu-Structure-v2.5.md` and `tasks/FSM-spec-v1.md` for requirements
   - Read `data/screen-atlas.json` to understand screen definitions
   - Read `js/buttons.js` to understand event system
   - Read `js/display.js` to understand display update functions

2. **Implement Phase by Phase**
   - Start with Phase 1 (Core Infrastructure)
   - Complete and test each phase before moving to next
   - Update progress tracking section as you complete phases
   - Fix any issues before proceeding

3. **Follow Existing Patterns**
   - Match code style and patterns in existing `mainFSM.js`
   - Use same naming conventions
   - Follow same JSDoc comment style
   - Maintain same error handling approach
   - **CRITICAL:** Do NOT remove `testing-overlay` classes from buttons or LCD
   - **CRITICAL:** Do NOT remove debug/development script includes from `index.html`
   - **CRITICAL:** Do NOT remove debug CSS styles from `css/styles.css`
   - These debug tools are essential for development and testing

4. **Test As You Go**
   - After each phase, verify functionality works
   - Check console for errors
   - Verify state transitions work correctly
   - Verify display updates correctly

5. **Phase-by-Phase Testing Approach** ⚠️ **CRITICAL: DO NOT SKIP TESTING**
   **MANDATORY:** Implement and test ONE phase at a time before proceeding to the next phase.
   
   **Why Phase-by-Phase:**
   - Easier debugging - smaller changes make issues easier to isolate
   - Early validation - catch problems before they compound
   - Incremental progress - verify each piece works before moving on
   - Lower risk - smaller, reversible changes
   
   **Testing Checklist Per Phase:**
   After completing each phase, verify:
   - [ ] No console errors or warnings
   - [ ] State transitions work correctly
   - [ ] Display updates correctly reflect state changes
   - [ ] Navigation flows work as expected
   - [ ] Timers work correctly (if applicable for that phase)
   - [ ] Toast notifications display (if applicable)
   - [ ] Soft key labels update correctly (if applicable)
   - [ ] Button events trigger correct state changes
   
   **Phase-Specific Testing:**
   - **Phase 1:** Test history stack (_pushHistory/_popHistory), timer management, toast system
   - **Phase 2:** Test home screen navigation, soft key mappings, SLM label cycling
   - **Phase 3:** Test Setup menu navigation, Meter Set editing, Display submenus
   - **Phase 4:** Test SLM operation flow (run/pause/stop), measurement timer
   - **Phase 5:** Test Files menu operations, format card timer
   - **Phase 6:** Test Lock and Calibration flows
   - **Phase 7:** Test full integration, all navigation paths
   
   **If Issues Found:**
   - Fix issues immediately before proceeding to next phase
   - Update progress tracking with any blockers or deviations
   - Document any changes from original plan

6. **Document Changes**
   - Add JSDoc comments for new functions
   - Update inline comments where logic is complex
   - Note any deviations from spec with explanations

### Communication Preferences
- Be concise and direct
- Show actual code, not high-level descriptions
- Fix issues immediately rather than just reporting them
- Ask for clarification only if requirements are truly ambiguous

### Code Quality Standards
- Use ES6+ features (arrow functions, const/let, template literals)
- Follow existing code style (spacing, naming, structure)
- Add JSDoc comments for all functions
- Handle errors gracefully (try/catch where appropriate)
- Use descriptive variable and function names
- Keep functions focused and single-purpose
- Avoid magic numbers (use named constants)

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Code Sections at Risk:**
- `index.html` - Integration code may need updates if FSM state shape or API changes
- `js/display.js` - Display update functions should be unaffected (they receive rendered HTML)
- `js/screen-renderer.js` - May need updates if state shape changes (reads state for conditional rendering)
- `js/buttons.js` - May need event type/payload adjustments if FSM expects different format
- `js/config.js` - Should be unaffected (separate concern)

**Performance Concerns:**
- State transitions must be fast (<16ms) - avoid heavy computation in dispatch
- Timer callbacks should be lightweight
- Navigation history stack should be bounded (prevent memory growth)

**User Workflow Impacts:**
- Users familiar with physical device should experience identical navigation
- Any deviation from device behavior will be noticed immediately
- Must handle edge cases (rapid button presses, ESC during timers, etc.)

**Breaking Changes:**
- Changes to FSM state shape may break `screen-renderer.js` conditional rendering logic
- Changes to FSM API (`window.initMainFSM`, `window.subscribeMainFSM`, `window.dispatch`) will break `index.html` integration
- Changes to `screen-renderer.js` API (`window.renderScreen`) will break `index.html` integration
- Changes to `display.js` API (`window.updateMainArea`, etc.) will break `index.html` integration
- Changes to event types may break button event system
- Must maintain backward compatibility with existing screen atlas
- **DO NOT BREAK:** Removing `testing-overlay` classes will break visual debugging
- **DO NOT BREAK:** Removing debug scripts will break development workflow

**Mitigation Strategies:**
- Test thoroughly after each phase
- Verify display updates work after state changes
- Verify button events still work after FSM updates
- Keep state shape changes minimal and additive only
- Document any state shape changes clearly

---

## 14. Reference Documents

### Primary References
- **`tasks/Menu-Structure-v2.5.md`** - Complete menu structure and screen reference
- **`tasks/FSM-spec-v1.md`** - FSM specification with states, events, transitions
- **`tasks/fsmtasks.md`** - Task breakdown and implementation checklist
- **`tasks/task_master_integration.md`** - Integration requirements and screen mappings

### Secondary References
- **`tasks/PROJECT-STATUS-AND-NEXT-STEPS.md`** - Project context and current state
- **`data/screen-atlas.json`** - Screen definitions and image mappings
- **`js/fsm/mainFSM.js`** - Current FSM implementation (to extend)
- **`js/buttons.js`** - Button event system
- **`js/display.js`** - Display rendering system

---

## 15. Acceptance Testing Checklist

### Navigation Tests
- [ ] Home menu navigation (UP/DOWN/ENTER) works correctly
- [ ] All Home menu items route to correct screens
- [ ] Setup menu accessible and navigable
- [ ] All Setup submenus accessible
- [ ] Files menu accessible and navigable
- [ ] Lock screen accessible
- [ ] Calibration screen accessible
- [ ] ESC/back navigation works from all screens

### SLM Operation Tests
- [ ] RUN button starts measurement (transitions to running)
- [ ] PAUSE button pauses measurement (transitions to paused)
- [ ] RUN from paused resumes measurement (transitions to running)
- [ ] STOP hold shows countdown overlay
- [ ] STOP hold completes → transitions to stopped
- [ ] STOP released before 3s → cancels countdown
- [ ] Measurement timer increments correctly
- [ ] Timer pauses when measurement paused
- [ ] Timer stops when measurement stopped

### Parameter Editing Tests
- [ ] Meter Set edit mode works (ENTER to edit)
- [ ] UP/DOWN adjusts parameter values
- [ ] LEFT returns focus to title
- [ ] ENTER on title saves and returns
- [ ] ESC cancels editing
- [ ] Display Contrast LEFT/RIGHT adjustment works

### Timer Tests
- [ ] Stop hold countdown works (3 seconds)
- [ ] Format card timer works (2-3 seconds)
- [ ] Calibration timer works (4-6 seconds)
- [ ] Timers can be cancelled (ESC, button release)
- [ ] Timer completion triggers correct state transitions

### Toast Tests
- [ ] Save Config shows toast "Config saved" (1.5s)
- [ ] Rename Last Session shows toast "File renamed" (1.5s)
- [ ] Toasts dismiss automatically after timeout
- [ ] Toasts don't block navigation

### Soft Key Tests
- [ ] Soft key labels update correctly for each screen
- [ ] SOFT1 cycles SLM label (SLM → 1/1 → 1/3 → SLM)
- [ ] SOFT2 (CAL) routes to calibration menu
- [ ] SOFT3 (FILE) routes to files menu
- [ ] SOFT4 (LOCK) routes to lock menu
- [ ] Context-specific soft keys work (Select, Edit, Save, Cancel, OK)

### Integration Tests
- [ ] No console errors during navigation
- [ ] All screen images load correctly
- [ ] Backlight toggle works correctly
- [ ] Display updates immediately on state change
- [ ] Button events trigger correct state transitions
- [ ] Navigation history works correctly

---

**🎯 Ready to Implement**

This task provides complete specifications for implementing the navigation structure and FSM. Follow the implementation plan phase by phase, test thoroughly, and update progress tracking as you complete each phase.

