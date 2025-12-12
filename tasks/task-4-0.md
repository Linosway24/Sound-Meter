# AI Task Planning - Task 4.0: Configuration & Settings System

> **How to Use This Template:**
> 1. Specify your task list file: `tasks-PRD.md`
> 2. Open `tasks-PRD.md` and find Task 4.0
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-4-0.md`

## 1. Task Overview

### Task Title
**Title:** Configuration & Settings System

### Goal Statement
**Goal:** Implement a complete configuration and settings system that allows users to access and modify all device configuration options (Weighting, Time Constant, Range, Dose, Backlight) through menu navigation. The system must provide menu-based access to all configuration settings, display current values, and integrate with the existing measurement engine. This completes the configuration infrastructure that the measurement engine (Task 5.0) depends on, ensuring users can properly configure the device before taking measurements.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, FSM-based state management

### Current State
**What's Complete:**
- ✅ Task 2.0 completed - Core interaction system with button handlers and FSM
- ✅ Task 2.12 completed - Display rendering infrastructure with screen atlas system
- ✅ Task 5.0 completed - Measurement engine that uses configuration values
- ✅ `js/config.js` module exists with:
  - Weighting options (A, C, Z) and setter methods
  - Time Constant options (Slow, Fast, Impulse) and setter methods
  - Range selection logic (30-130 dB) and setter methods
  - Dose configuration structure (Exchange Rate, Threshold, Criterion Level) and setter methods
  - Backlight settings structure (Manual/Timed mode) and setter methods
- ✅ Phase 4 completed - Softkeys provide quick access to Weighting (R/C/Z/F) and Time Constant (F/S/I) on SLM screens

**What's Missing:**
- ❌ Menu navigation system for accessing configuration menus
- ❌ Settings menu screens in screen-atlas.json (settings_menu, weighting_menu, time_constant_menu, range_menu, dose_menu, backlight_menu)
- ❌ FSM handlers for configuration menu navigation and value selection
- ❌ Configuration display on home screen showing current settings
- ❌ Backlight timeout logic for Timed mode
- ❌ Integration of Settings menu into main menu structure

**Dependencies:**
- FSM system (Task 2.0) - Required for menu navigation
- Screen renderer (Task 2.12) - Required for displaying menus
- Config module (partial) - Exists but needs menu integration

---

## 3. Context & Problem Definition

### Problem Statement
Currently, users can only change configuration settings via console commands or through softkeys on SLM screens (for Weighting and Time Constant only). There is no menu-based system to access configuration settings, which means:
- Users cannot access Range, Dose, or Backlight settings through the UI
- Configuration changes are not persistent or visible
- The Settings menu structure exists in documentation but is not implemented
- The measurement engine (Task 5.0) can use configuration values, but users have no way to change them through the device UI

This violates PRD requirements 19-24, which require menu-based access to all configuration options. The system must match firmware R.13J behavior where users navigate through a Settings menu to configure all device parameters.

### Success Criteria
- [ ] 4.1: Update `js/config.js` with Weighting options (A, C, Z) and selection methods
- [ ] 4.2: Implement Weighting selection through menu navigation with current value display
- [ ] 4.3: Add Time Constant options (Slow, Fast, Impulse) to config module
- [ ] 4.4: Implement Time Constant selection through menu system
- [ ] 4.5: Add Range selection logic with values from 30 dB to 130 dB
- [ ] 4.6: Implement Range adjustment through menu controls (up/down arrows or direct input)
- [ ] 4.7: Build Dose configuration with Exchange Rate (3-6 dB), Threshold (50-100 dB), and Criterion Level (70-100 dB)
- [ ] 4.8: Implement Dose menu settings with validation for each parameter range
- [ ] 4.9: Implement Backlight settings with Manual mode (toggle on/off) and Timed mode (1-60 seconds)
- [ ] 4.10: Add backlight timeout logic for Timed mode with configurable duration
- [ ] 4.11: Create configuration display function showing current settings (Weighting, Time Constant, Range) on home screen
- [ ] 4.12: Integrate configuration menu items into main menu structure

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New development - building Quest SoundPro SE-DL simulation
- **Breaking Changes:** Acceptable - adding new menu functionality
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High stability - must match firmware R.13J behavior exactly

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements 19-24:**

1. The system must implement Weighting selection with options A, C, and Z, displayable and changeable through menu navigation.
2. The system must implement Time Constant selection with options Slow, Fast, and Impulse, accessible via menu system.
3. The system must add Range selection logic with values from 30 dB to 130 dB, adjustable through menu controls.
4. The system must build Dose configuration allowing users to set Exchange Rate (typically 3-6 dB), Threshold (50-100 dB), and Criterion Level (70-100 dB).
5. The system must implement Backlight settings with Manual mode (toggle on/off) and Timed mode (1-60 seconds timeout).
6. The system must display current configuration settings (Weighting, Time Constant, Range) on the home screen status area.

### Non-Functional Requirements
- **Performance:** No external resources, instant rendering, no layout shifts
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** All interactions must match firmware R.13J behavior exactly
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Theme Support:** LCD supports backlight states (green/gray tint) - implemented in Task 2.12

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- Must integrate with existing FSM state management system
- Must use existing screen atlas system for menu rendering

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**FSM State Extensions:**
```javascript
_state.config = {
    weighting: 'A',           // 'A', 'C', 'Z'
    timeConstant: 'F',        // 'F' (Fast), 'S' (Slow), 'I' (Impulse)
    range: 80,                // 30-130 dB
    dose: {
        exchangeRate: 3,      // 3-6 dB
        threshold: 50,        // 50-100 dB
        criterionLevel: 70    // 70-100 dB
    },
    backlight: {
        mode: 'Manual',       // 'Manual' or 'Timed'
        timeout: 30,          // 1-60 seconds (for Timed mode)
        state: false         // on/off
    }
}
```

**Menu Navigation State:**
```javascript
_state.menu = {
    currentMenu: 'settings_menu',  // Current menu ID
    selectedIndex: 0,               // Selected menu item index
    history: []                     // Navigation history stack
}
```

### Data Migration Plan
N/A - No data migration needed. Existing `Config` module values will be synced to FSM state.

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
- **Settings Menu Screens:** Menu screen definitions in `data/screen-atlas.json` for:
  - `settings_menu` - Main settings menu
  - `weighting_menu` - Weighting selection (A, C, Z)
  - `time_constant_menu` - Time constant selection (Slow, Fast, Impulse)
  - `range_menu` - Range selection/adjustment (30-130 dB)
  - `dose_menu` - Dose configuration menu
  - `dose_exchange_rate_menu` - Dose exchange rate selection
  - `dose_threshold_menu` - Dose threshold adjustment
  - `dose_criterion_level_menu` - Dose criterion level adjustment
  - `backlight_menu` - Backlight settings menu
  - `backlight_mode_menu` - Backlight mode selection (Manual/Timed)
  - `backlight_timeout_menu` - Backlight timeout adjustment (1-60 seconds)

### Page Updates
- `data/screen-atlas.json` - Add all configuration menu screen definitions
- `js/fsm/mainFSM.js` - Add menu navigation handlers, configuration value setters, backlight timeout logic
- `js/screen-renderer.js` - Add menu rendering support for configuration menus, current value display
- `js/config.js` - Verify all setter methods exist (already complete)
- `js/display.js` - Add configuration display on home screen status area

### State Management
- **FSM State Integration:** Configuration values stored in `_state.config` and synced with `Config` module
- **Menu Navigation:** Menu navigation state managed in `_state.menu` with history stack
- **State Updates:** Configuration changes trigger FSM state updates and display refresh
- **Measurement Engine Integration:** Configuration changes update `Measurement` module via `updateConfig()`

---

## 9. Implementation Plan

### Phase 1: Verify Config Module (Sub-tasks 4.1, 4.3, 4.5, 4.7, 4.9)
1. **[4.1]** Verify `js/config.js` has Weighting options (A, C, Z) and `setWeighting()` method
2. **[4.3]** Verify `js/config.js` has Time Constant options (Slow, Fast, Impulse) and `setTimeConstant()` method
3. **[4.5]** Verify `js/config.js` has Range selection logic (30-130 dB) and `setRange()` method
4. **[4.7]** Verify `js/config.js` has Dose configuration structure and setter methods (`setDoseExchangeRate()`, `setDoseThreshold()`, `setDoseCriterionLevel()`)
5. **[4.9]** Verify `js/config.js` has Backlight settings structure and setter methods (`setBacklightMode()`, `setBacklightTimeout()`, `toggleBacklight()`)

### Phase 2: Menu Screen Definitions (Sub-task 4.12 - Part 1)
6. **[4.12a]** Add `settings_menu` screen definition to `data/screen-atlas.json` with menu items: Weighting, Time Constant, Range, Dose, Backlight
7. **[4.12b]** Add `weighting_menu` screen definition with options: A, C, Z
8. **[4.12c]** Add `time_constant_menu` screen definition with options: Slow, Fast, Impulse
9. **[4.12d]** Add `range_menu` screen definition with range adjustment controls
10. **[4.12e]** Add `dose_menu` screen definition with sub-menu items: Exchange Rate, Threshold, Criterion Level
11. **[4.12f]** Add dose sub-menu screens: `dose_exchange_rate_menu`, `dose_threshold_menu`, `dose_criterion_level_menu`
12. **[4.12g]** Add `backlight_menu` screen definition with sub-menu items: Mode, Timeout
13. **[4.12h]** Add backlight sub-menu screens: `backlight_mode_menu`, `backlight_timeout_menu`
14. **[4.12i]** Integrate Settings menu into main menu structure in FSM

### Phase 3: Menu Navigation Implementation (Sub-tasks 4.2, 4.4, 4.6, 4.8)
15. **[4.2]** Implement Weighting selection menu navigation in FSM:
    - Navigate to `weighting_menu` from `settings_menu`
    - Handle softkey selection (A, C, Z)
    - Update `_state.config.weighting` and call `Config.setWeighting()`
    - Update `Measurement.updateConfig()` with new weighting
    - Display current selected value in menu
16. **[4.4]** Implement Time Constant selection menu navigation in FSM:
    - Navigate to `time_constant_menu` from `settings_menu`
    - Handle softkey selection (Slow, Fast, Impulse)
    - Update `_state.config.timeConstant` and call `Config.setTimeConstant()`
    - Update `Measurement.updateConfig()` with new time constant
    - Display current selected value in menu
17. **[4.6]** Implement Range adjustment menu navigation in FSM:
    - Navigate to `range_menu` from `settings_menu`
    - Handle UP/DOWN arrows to adjust range (30-130 dB, step: 10 dB)
    - Update `_state.config.range` and call `Config.setRange()`
    - Update `Measurement.updateConfig()` with new range
    - Display current range value
18. **[4.8]** Implement Dose menu navigation in FSM:
    - Navigate to `dose_menu` from `settings_menu`
    - Navigate to sub-menus (Exchange Rate, Threshold, Criterion Level)
    - Handle value selection/adjustment for each parameter
    - Validate ranges: Exchange Rate (3-6 dB), Threshold (50-100 dB), Criterion Level (70-100 dB)
    - Update `_state.config.dose` and call Config setter methods
    - Update `Measurement.updateConfig()` with new dose settings

### Phase 4: Backlight Settings (Sub-tasks 4.9, 4.10)
19. **[4.9]** Implement Backlight settings menu navigation in FSM:
    - Navigate to `backlight_menu` from `settings_menu`
    - Navigate to `backlight_mode_menu` to select Manual or Timed mode
    - Update `_state.config.backlight.mode` and call `Config.setBacklightMode()`
    - Handle backlight toggle when in Manual mode
20. **[4.10]** Implement backlight timeout logic:
    - Navigate to `backlight_timeout_menu` when mode is Timed
    - Handle UP/DOWN arrows to adjust timeout (1-60 seconds)
    - Update `_state.config.backlight.timeout` and call `Config.setBacklightTimeout()`
    - Implement timeout timer that turns off backlight after configured duration
    - Reset timeout timer when backlight is manually toggled on

### Phase 5: Configuration Display (Sub-task 4.11)
21. **[4.11]** Create configuration display on home screen:
    - Add configuration status elements to `home_screen` and `home_screen_dim` in screen-atlas.json
    - Display current Weighting (A/C/Z) in status area
    - Display current Time Constant (Slow/Fast/Impulse) in status area
    - Display current Range (e.g., "80 dB") in status area
    - Update display when configuration changes
    - Format display to match firmware R.13J specifications

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact menu behavior and labels
- Reference `tasks/menu-structure-review.json` for menu structure details
- Test each sub-task before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses
- Ensure configuration changes sync with Measurement module via `updateConfig()`
- Match existing menu navigation patterns from Phase 3 (Setup menus)

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (4.1-4.12) is completed
- Mark parent task 4.0 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met
- Verify configuration changes affect measurement engine correctly

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `data/screen-atlas.json` - Add all configuration menu screen definitions (settings_menu, weighting_menu, time_constant_menu, range_menu, dose_menu, backlight_menu, and sub-menus)
- `js/fsm/mainFSM.js` - Add menu navigation handlers, configuration value setters, backlight timeout logic, Settings menu integration
- `js/screen-renderer.js` - Add menu rendering support for configuration menus, current value display indicators
- `js/display.js` - Add configuration display on home screen status area
- `js/config.js` - Verify all setter methods exist (should already be complete)

**Files to Create:**
- None - All functionality added to existing files

**Files to Reference:**
- `PRD.md` - Requirements reference (Requirements 19-24)
- `tasks/menu-structure-review.json` - Menu structure reference for Settings menu and sub-menus
- `tasks/menu-structure-review.md` - Menu structure documentation
- Firmware R.13J documentation PDFs in `Documents/` folder for exact menu behavior

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md Requirements 19-24 for configuration requirements
   - Review `tasks/menu-structure-review.json` for Settings menu structure
   - Review existing menu navigation patterns in `js/fsm/mainFSM.js` (Phase 3 Setup menus)
   - Understand current `js/config.js` module structure
   - Check Task 5.0 (Measurement Engine) integration points

2. **Implement Sub-tasks Sequentially:**
   - **Phase 1:** Verify Config module (4.1, 4.3, 4.5, 4.7, 4.9) - Should already be complete
   - **Phase 2:** Add menu screen definitions to screen-atlas.json (4.12)
   - **Phase 3:** Implement menu navigation handlers in FSM (4.2, 4.4, 4.6, 4.8)
   - **Phase 4:** Implement backlight settings and timeout logic (4.9, 4.10)
   - **Phase 5:** Add configuration display to home screen (4.11)

3. **Testing:**
   - Test each menu navigation flow matches firmware R.13J behavior
   - Verify configuration changes persist and affect measurement engine
   - Test backlight timeout logic works correctly
   - Verify configuration display updates on home screen
   - Test all validation ranges (Range: 30-130, Dose parameters, Backlight timeout: 1-60)

4. **Documentation:**
   - Add code comments explaining menu navigation logic
   - Document configuration state synchronization with Measurement module
   - Update implementation notes

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if firmware documentation is unclear

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern
- Comment complex calculations and state transitions
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Follow existing FSM menu navigation patterns

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- None - Adding new menu functionality, not modifying existing behavior
- Configuration changes will affect measurement engine behavior (expected)

**Performance Concerns:**
- Menu navigation should be instant (no delays)
- Backlight timeout timer should be efficient (use `setTimeout`/`clearTimeout`)
- Configuration display updates should not cause layout shifts

**User Workflow Impacts:**
- Users can now access all configuration settings through menu system
- Configuration changes immediately affect measurement engine
- Backlight timeout provides automatic power saving in Timed mode
- Configuration display on home screen provides at-a-glance status

**Future Dependencies:**
- Task 6.0 (Display Enhancements) may enhance configuration display formatting
- Task 7.0 (Data Logging) may use configuration values for logging settings
- No other tasks depend on Task 4.0 completion

**Risk Mitigation:**
- Test against firmware R.13J documentation for exact menu behavior
- Verify all edge cases are handled (invalid ranges, mode switching)
- Document any assumptions made about menu structure
- Ensure configuration state syncs correctly with Measurement module

---

**Ready to Implement?**
This task implements Configuration & Settings System. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

