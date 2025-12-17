# AI Task Planning - Phase 6: Lock & Calibration Enhancements

> **How to Use This Template:**
> 1. Task list file: `tasks-PRD.md` (Task 8.0) + `TASK-MASTER-MENU-STRUCTURE-V2.5.md` (Phase 6)
> 2. Phase 6 focuses on completing calibration menu enhancements
> 3. Based on Menu-Structure-v2.5.md Section 9.1-9.2
> 4. Maps to Task 8.0 (Calibration Features) from tasks-PRD.md

## 1. Task Overview

### Task Title
**Title:** Phase 6: Lock & Calibration Enhancements - Calibration History Display and Navigation

### Goal Statement
**Goal:** Complete the calibration menu functionality by implementing calibration history display with Pre-Cal values and timestamps, adding UP/DOWN navigation for multiple history entries, and ensuring the calibration menu fully matches firmware R.13J specifications. This phase enhances the existing basic calibration menu (`cal_menu`) to show calibration history lines that can be navigated, completing the calibration feature set alongside the already-complete Lock Menu and Calibration Running screens.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, FSM state management

### Current State
- ✅ Phase 1-3 completed - Startup, Home, SLM Core, Setup Menu
- ✅ Phase 4 completed - SLM Multi-Page Views (UI/Navigation)
- ✅ Phase 5 completed - Files Menu Enhancements
- ✅ Lock Menu (`lock_menu`) - Complete and functional
- ✅ Calibration Menu (`cal_menu`) - Basic implementation exists (screen definition, ENTER starts calibration, ESC returns)
- ✅ Calibration Running (`cal_running`) - Complete with timer-based auto-completion
- ❌ Calibration history display - Not implemented (cal_menu shows empty elements array)
- ❌ UP/DOWN navigation for multiple history lines - Not implemented
- ❌ Calibration history data structure - Not defined in FSM state
- ❌ Calibration history rendering - Not implemented in screen renderer

---

## 3. Context & Problem Definition

### Problem Statement
The calibration menu (`cal_menu`) currently exists as a basic screen with navigation handlers, but according to Menu-Structure-v2.5.md Section 9.1, it should display calibration history lines showing Pre-Cal values and timestamps, with a "CALIBRATE" option. The menu should support UP/DOWN navigation when multiple history entries exist. Currently, the screen definition in `data/screen-atlas.json` has an empty elements array, and there's no calibration history data structure in the FSM state. Students need to see calibration history to understand device calibration status and perform calibration procedures as they would on the real device. Without this enhancement, the calibration feature is incomplete and doesn't match firmware R.13J behavior.

### Success Criteria
- [ ] 6.1: Create calibration history data structure in FSM state (`_state.calibration.history`)
- [ ] 6.2: Initialize default calibration history entries (at least one example entry)
- [ ] 6.3: Update `cal_menu` screen definition in `data/screen-atlas.json` with history display elements
- [ ] 6.4: Implement calibration history rendering in `js/screen-renderer.js`
- [ ] 6.5: Display Pre-Cal values and timestamps for each history entry
- [ ] 6.6: Display "CALIBRATE" option in calibration menu
- [ ] 6.7: Implement UP/DOWN navigation between history lines and CALIBRATE option
- [ ] 6.8: Implement selectedIndex state management for calibration menu navigation
- [ ] 6.9: Update calibration running screen to log new history entry after completion
- [ ] 6.10: Format calibration history display to match firmware R.13J specifications
- [ ] 6.11: Test navigation with single history entry
- [ ] 6.12: Test navigation with multiple history entries
- [ ] 6.13: Verify ENTER on CALIBRATE starts calibration sequence
- [ ] 6.14: Verify ENTER on history entry (if applicable) or ESC behavior

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Feature enhancement - completing Phase 6 calibration menu functionality
- **Breaking Changes:** Minimal - extending existing calibration state, adding new display elements
- **Data Handling:** In-memory state only, no persistence - calibration history exists only during session
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** Medium - completes calibration feature set, enhances training realism

---

## 5. Technical Requirements

### Functional Requirements

**From Menu-Structure-v2.5.md Section 9.1:**
1. Calibration menu must show calibration history line(s) with Pre-Cal values and timestamps
2. Calibration menu must display "CALIBRATE" option
3. UP/DOWN navigation must move highlight between history lines (if multiple exist) and CALIBRATE option
4. ENTER on CALIBRATE must start calibration sequence (already implemented)
5. ESC must return to Home (already implemented)

**From PRD.md Requirements 41-44 (Task 8.0):**
1. **Requirement 41:** The system must implement calibration functionality that allows users to perform calibration procedures as specified in firmware R.13J.
2. **Requirement 43:** The system must extract calibration procedures, prompts, and confirmation messages from firmware R.13J documentation.
3. **Requirement 44:** The system must display calibration status and results in the format specified by the firmware.

### Non-Functional Requirements
- **Performance:** History display must render instantly, no lag during navigation
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** Navigation must feel natural, highlight must be clearly visible
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Format Accuracy:** Calibration history display must match firmware R.13J format exactly

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas) for history display
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- History data structure must integrate with existing FSM state

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**Calibration State (extends existing FSM state):**
```javascript
calibration: {
    history: [
        {
            id: 1,
            preCalValue: 85.2,           // Pre-Cal SPL value in dB
            timestamp: "2025-01-15 10:30:00",  // Date/time of calibration
            date: "2025-01-15",          // Date component
            time: "10:30:00",            // Time component
            formatted: "85.2 dB LZS @ 2025-01-15 10:30"  // Display format
        },
        // ... more history entries
    ],
    selectedIndex: 0,                    // Currently selected item (0 = first history, last = CALIBRATE)
    calibrateOptionIndex: null           // Index of CALIBRATE option (calculated: history.length)
}
```

**Note:** The calibration history should persist during the session. When a new calibration is completed in `cal_running`, it should add a new entry to the history array.

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

**Calibration History Display:**
- History list rendering component in `js/screen-renderer.js`
- History entry formatting function
- Navigation highlight management

### Page Updates

**`data/screen-atlas.json` - Calibration Menu Screen:**
- Update `cal_menu` screen definition with history display elements
- Add elements for:
  - Title/header area
  - History list area (multiple history lines)
  - CALIBRATE option display
  - Highlight indicator for selected item

**`js/fsm/mainFSM.js` - FSM Integration:**
- Add `calibration` state object to `_state` initialization
- Initialize `calibration.history` with default entries
- Add `calibration.selectedIndex` state management
- Update calibration menu navigation handlers (UP/DOWN)
- Update `cal_running` completion handler to add new history entry
- Ensure ENTER on CALIBRATE starts calibration sequence (already exists)

**`js/screen-renderer.js` - Display Updates:**
- Add calibration history rendering function
- Format Pre-Cal values and timestamps according to firmware spec
- Render history list with proper highlighting
- Render CALIBRATE option with proper highlighting
- Handle empty history state (show CALIBRATE only)

**`js/display.js` - Display Refresh:**
- Trigger refresh on calibration state changes
- Ensure calibration menu updates when history changes

### State Management
- Calibration state managed in FSM `_state.calibration` object
- History array stores calibration entries with Pre-Cal values and timestamps
- SelectedIndex tracks currently highlighted item (history entry or CALIBRATE)
- Navigation updates selectedIndex, triggers display refresh
- New calibration completion adds entry to history array
- State persists during session (in-memory only)

---

## 9. Implementation Plan

### Phase 1: Data Structure Setup (Sub-tasks 6.1-6.2)
1. **[6.1]** Create calibration history data structure in `js/fsm/mainFSM.js`
   - Add `calibration` object to `_state` initialization
   - Define `calibration.history` array structure
   - Add `calibration.selectedIndex` property
2. **[6.2]** Initialize default calibration history entries
   - Create at least one example history entry with Pre-Cal value and timestamp
   - Format entry according to firmware R.13J specifications
   - Test state initialization

### Phase 2: Screen Definition Update (Sub-tasks 6.3)
3. **[6.3]** Update `cal_menu` screen definition in `data/screen-atlas.json`
   - Add title/header element
   - Add history list container element
   - Add CALIBRATE option element
   - Define element bindings for history data
   - Define highlight binding for selectedIndex

### Phase 3: Rendering Implementation (Sub-tasks 6.4-6.6)
4. **[6.4]** Implement calibration history rendering in `js/screen-renderer.js`
   - Create function to render calibration menu screen
   - Handle history list rendering
   - Handle CALIBRATE option rendering
5. **[6.5]** Display Pre-Cal values and timestamps
   - Format Pre-Cal value (e.g., "85.2 dB LZS")
   - Format timestamp (e.g., "2025-01-15 10:30:00" or abbreviated format)
   - Combine into display line format
6. **[6.6]** Display CALIBRATE option
   - Render CALIBRATE as selectable menu item
   - Position at end of history list or as separate option

### Phase 4: Navigation Implementation (Sub-tasks 6.7-6.8)
7. **[6.7]** Implement UP/DOWN navigation in `js/fsm/mainFSM.js`
   - Add UP handler for calibration menu
   - Add DOWN handler for calibration menu
   - Update `calibration.selectedIndex` on navigation
   - Handle wrap-around (if applicable) or boundary limits
   - Calculate total items (history.length + 1 for CALIBRATE)
8. **[6.8]** Implement selectedIndex state management
   - Initialize selectedIndex to 0 when entering calibration menu
   - Update highlight display based on selectedIndex
   - Ensure highlight moves correctly between history lines and CALIBRATE

### Phase 5: Calibration Completion Integration (Sub-task 6.9)
9. **[6.9]** Update calibration running completion to log new history entry
   - When ENTER pressed in `cal_running`, capture Pre-Cal value
   - Create new history entry with current timestamp
   - Add entry to `calibration.history` array
   - Format entry according to firmware specifications
   - Return to Home (already implemented)

### Phase 6: Formatting and Polish (Sub-task 6.10)
10. **[6.10]** Format calibration history display to match firmware R.13J
    - Extract exact format from firmware documentation
    - Match Pre-Cal value format (decimal precision, units)
    - Match timestamp format (date/time display style)
    - Match overall layout and spacing
    - Verify against reference images if available

### Phase 7: Testing (Sub-tasks 6.11-6.14)
11. **[6.11]** Test navigation with single history entry
    - Verify UP/DOWN works between history and CALIBRATE
    - Verify highlight displays correctly
    - Verify ENTER on CALIBRATE starts calibration
12. **[6.12]** Test navigation with multiple history entries
    - Add multiple history entries to test data
    - Verify UP/DOWN cycles through all history entries
    - Verify CALIBRATE is accessible as last item
    - Verify highlight moves correctly
13. **[6.13]** Verify ENTER on CALIBRATE starts calibration sequence
    - Press ENTER when CALIBRATE is highlighted
    - Verify transitions to `cal_running` screen
    - Verify calibration sequence works as before
14. **[6.14]** Verify ESC behavior and edge cases
    - ESC returns to Home from calibration menu
    - Test with empty history (CALIBRATE only)
    - Test with many history entries (scrolling if needed)

### Implementation Notes
- Follow Menu-Structure-v2.5.md Section 9.1 specifications exactly
- Reference firmware R.13J documentation for exact history format
- Test each sub-task before moving to next
- Update task checkboxes in `TASK-MASTER-MENU-STRUCTURE-V2.5.md` as work progresses
- Reference existing FSM state structure in `js/fsm/mainFSM.js`
- Follow existing navigation patterns from other menus (Phase 3, Phase 5)
- Ensure calibration history format matches firmware R.13J display format
- Consider maximum history entries (if firmware has limits)

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `TASK-MASTER-MENU-STRUCTURE-V2.5.md` Phase 6 section as each sub-task (6.1-6.14) is completed
- Mark Phase 6 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from Menu-Structure-v2.5.md are met
- Verify calibration menu displays history correctly
- Verify navigation works with single and multiple history entries

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `data/screen-atlas.json` - Update `cal_menu` screen definition with history elements
- `js/fsm/mainFSM.js` - Add calibration state, navigation handlers, history logging
- `js/screen-renderer.js` - Add calibration history rendering function
- `js/display.js` - Ensure display refresh on calibration state changes (if needed)
- `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md` - Update Phase 6 status as work progresses

**Files to Reference:**
- `tasks/Menu-Structure-v2.5.md` - Section 9.1-9.2 (Calibration menu specification)
- `tasks/tasks-PRD.md` - Task 8.0 (Calibration Features requirements)
- `PRD.md` - Requirements 41-44 (Calibration features)
- `assets/Quest Sound Dosimeter.png` - Calibration machine reference
- Firmware R.13J documentation PDFs in `Documents/` folder
- `data/screen-atlas.json` - Existing screen definitions for reference
- `js/fsm/mainFSM.js` - Existing FSM state structure and navigation patterns

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review Menu-Structure-v2.5.md Section 9.1 for calibration menu specification
   - Review tasks-PRD.md Task 8.0 for calibration feature requirements
   - Review PRD.md Requirements 41-44 for calibration context
   - Understand current codebase state (Phase 1-5 complete)
   - Check existing calibration menu implementation in `js/fsm/mainFSM.js`
   - Review existing screen definitions in `data/screen-atlas.json`
   - Review existing navigation patterns from Phase 3 and Phase 5

2. **Implement Sub-tasks Sequentially:**
   - Implement 6.1: Create calibration history data structure
   - Implement 6.2: Initialize default calibration history entries
   - Implement 6.3: Update cal_menu screen definition
   - Implement 6.4: Implement calibration history rendering
   - Implement 6.5: Display Pre-Cal values and timestamps
   - Implement 6.6: Display CALIBRATE option
   - Implement 6.7: Implement UP/DOWN navigation
   - Implement 6.8: Implement selectedIndex state management
   - Implement 6.9: Update calibration completion to log history
   - Implement 6.10: Format display to match firmware R.13J
   - Implement 6.11: Test single history entry navigation
   - Implement 6.12: Test multiple history entries navigation
   - Implement 6.13: Verify ENTER on CALIBRATE
   - Implement 6.14: Verify ESC and edge cases

3. **Testing:**
   - Test each feature matches firmware R.13J behavior
   - Verify all Menu-Structure-v2.5.md requirements are met
   - Test navigation with single and multiple history entries
   - Test calibration completion adds new history entry
   - Test ESC returns to Home correctly
   - Verify history display format matches firmware specifications
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining calibration history structure
   - Document history entry format and timestamp format
   - Document any deviations from firmware (should be none)
   - Update implementation notes
   - Add JSDoc comments to all exported functions

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if firmware documentation is unclear
- Show calibration history format being used
- Reference existing navigation patterns from other menus

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern
- Comment complex state management and navigation logic
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Use meaningful variable names for calibration data (preCalValue, timestamp, etc.)
- Document history entry format in comments

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Extends existing FSM state with `calibration` object - should be backward compatible
- Updates `cal_menu` screen definition - may affect existing rendering (intended enhancement)
- No breaking changes to existing calibration running functionality

**Performance Concerns:**
- History rendering must be efficient (typically small number of entries)
- Navigation updates should be instant (no lag)
- No performance concerns expected for typical calibration history size

**User Workflow Impacts:**
- Students will see calibration history when accessing calibration menu
- Students can navigate through history to see past calibrations
- New calibrations will appear in history after completion
- Enhances training realism by matching real device behavior

**Future Dependencies:**
- Phase 7 (Alerts & Edge Cases) is independent - can proceed in parallel
- Task 5.0 (Measurement Engine) is independent - no dependency
- No other phases depend on Phase 6 completion

**Risk Mitigation:**
- Test against Menu-Structure-v2.5.md specifications for accuracy
- Verify all edge cases are handled (empty history, single entry, many entries)
- Document any assumptions made about history format
- Test calibration completion correctly adds history entries
- Verify navigation doesn't break existing calibration flow
- Reference firmware R.13J documentation for exact format requirements

---

## 14. Calibration History Format Notes

### Expected Format (Reference - verify against firmware R.13J)

**History Entry Display:**
- Pre-Cal value: "85.2 dB LZS" (or similar format with weighting/time constant)
- Timestamp: "2025-01-15 10:30:00" or abbreviated format
- Combined: "85.2 dB LZS @ 2025-01-15 10:30" (example format)

**CALIBRATE Option:**
- Displayed as "CALIBRATE" or similar text
- Positioned after history entries or as separate menu item
- Selectable via UP/DOWN navigation

**Navigation:**
- UP/DOWN cycles through history entries (if multiple) and CALIBRATE
- First item (index 0) is first history entry or CALIBRATE if no history
- Last item is CALIBRATE option
- Highlight moves with selectedIndex

**Note:** Actual format should be extracted from firmware R.13J documentation or reference images for accuracy.

---

**Ready to Implement?**
This task implements Phase 6: Lock & Calibration Enhancements. Follow Menu-Structure-v2.5.md specifications exactly and ensure all sub-tasks are completed before marking complete. This completes the calibration feature set by adding history display and navigation.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

