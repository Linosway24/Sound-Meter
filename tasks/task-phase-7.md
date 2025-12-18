# AI Task Planning - Task Phase 7: Alerts & Edge Cases

> **How to Use This Template:**
> 1. Specify your task list file: `TASK-MASTER-MENU-STRUCTURE-V2.5.md`
> 2. Open `TASK-MASTER-MENU-STRUCTURE-V2.5.md` and find Phase 7
> 3. Copy all sub-tasks from that phase section
> 4. Fill in this template with the phase number, title, and sub-tasks
> 5. Complete each section based on the phase requirements and PRD.md specifications
> 6. Save as `task-phase-7.md`

## 1. Task Overview

### Task Title
**Title:** Alerts & Edge Cases

### Goal Statement
**Goal:** Implement alert screens and comprehensive edge case handling throughout the Quest SoundPro SE-DL simulation to match firmware R.13J behavior. This phase adds error handling, warning screens, and edge case management to ensure the simulation behaves exactly like the physical device in all scenarios, including error conditions, invalid actions, and system warnings. This completes the final polish phase of the simulator, ensuring robust error handling and user feedback for all edge cases.

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
- ✅ Phase 1-6 completed - All core functionality, menus, and features implemented
- ✅ FSM system with comprehensive state management
- ✅ Screen renderer with atlas support
- ✅ All menu navigation and interaction systems
- ✅ SLM operation, calibration, files, setup menus all functional
- ✅ Error handling patterns established in existing code

**What's Missing:**
- ❌ Alert screen definitions in `screen-atlas.json`:
  - `low_battery` - Low battery warning screen
  - `sd_missing` - SD card missing warning screen
  - `memory_full` - Memory full warning screen
  - `invalid_action` - Invalid action warning screen
- ❌ Alert display logic in FSM (when to show alerts)
- ❌ ESC dismiss handler for alert screens
- ❌ Auto-dismiss logic for alerts (if applicable per firmware)
- ❌ Edge case handling throughout (invalid button presses, state transitions, etc.)
- ❌ Alert state management in FSM

**Dependencies:**
- FSM system (Phase 1-2) - Required for alert state management
- Screen renderer (Phase 1) - Required for displaying alerts
- All menu systems (Phase 1-6) - Alerts may interrupt any screen

---

## 3. Context & Problem Definition

### Problem Statement
Currently, the simulation lacks alert screens and comprehensive edge case handling. In the real device (firmware R.13J), various conditions trigger alert screens (low battery, missing SD card, memory full, invalid actions) that interrupt normal operation and require user acknowledgment. Without these alerts, the simulation cannot accurately represent real-world device behavior, especially error conditions that students need to learn to handle. Additionally, edge cases (invalid button presses, impossible state transitions, boundary conditions) need proper handling to prevent crashes and ensure the simulation remains stable and behaves like the physical device.

This violates PRD requirements for complete device simulation accuracy. The system must match firmware R.13J behavior exactly, including all error conditions and edge cases that can occur during normal operation.

### Success Criteria
- [ ] 7.1: Create `low_battery` alert screen definition in `screen-atlas.json`
- [ ] 7.2: Create `sd_missing` alert screen definition in `screen-atlas.json`
- [ ] 7.3: Create `memory_full` alert screen definition in `screen-atlas.json`
- [ ] 7.4: Create `invalid_action` alert screen definition in `screen-atlas.json`
- [ ] 7.5: Implement alert state management in FSM (`_state.alert`)
- [ ] 7.6: Implement alert display logic (when to show each alert type)
- [ ] 7.7: Implement ESC dismiss handler for all alert screens
- [ ] 7.8: Implement auto-dismiss logic for alerts (if applicable per firmware R.13J)
- [ ] 7.9: Add edge case handling for invalid button presses
- [ ] 7.10: Add edge case handling for impossible state transitions
- [ ] 7.11: Add edge case handling for boundary conditions (empty lists, null values, etc.)
- [ ] 7.12: Test all alert screens appear correctly and dismiss properly
- [ ] 7.13: Test edge cases don't cause crashes or unexpected behavior

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Final polish phase - adding error handling and edge cases
- **Breaking Changes:** None - adding new functionality, not modifying existing
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High stability - must match firmware R.13J behavior exactly, especially error handling

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements:**
1. The system must display alert screens when error conditions occur (low battery, missing SD card, memory full, invalid actions)
2. The system must allow users to dismiss alerts via ESC button
3. The system must handle all edge cases gracefully without crashes
4. The system must match firmware R.13J alert behavior exactly
5. The system must prevent invalid state transitions
6. The system must handle boundary conditions (empty lists, null values, out-of-range inputs)

### Non-Functional Requirements
- **Performance:** Alert display should be instant, no delays
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** Alerts must be clearly visible and dismissible
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Theme Support:** Alerts should respect backlight state (if applicable)

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- Must integrate with existing FSM state management system
- Must use existing screen atlas system for alert rendering

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**FSM Alert State:**
```javascript
_state.alert = {
    visible: false,           // Whether alert is currently displayed
    type: null,               // 'low_battery', 'sd_missing', 'memory_full', 'invalid_action'
    message: null,            // Alert message text (if needed)
    autoDismiss: false,      // Whether alert auto-dismisses
    autoDismissTimer: null,  // Timer ID for auto-dismiss
    previousViewId: null     // View to return to after dismissing
}
```

### Data Migration Plan
N/A - No data migration needed. Alert state is new functionality.

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
- **Alert Screens:** Four alert screen definitions in `data/screen-atlas.json`:
  - `low_battery` - Low battery warning screen
  - `sd_missing` - SD card missing warning screen
  - `memory_full` - Memory full warning screen
  - `invalid_action` - Invalid action warning screen

### Page Updates
- `data/screen-atlas.json` - Add all alert screen definitions
- `js/fsm/mainFSM.js` - Add alert state management, alert display logic, ESC dismiss handlers, edge case handling
- `js/screen-renderer.js` - Add alert screen rendering support (should work automatically with screen atlas)

### State Management
- **FSM Alert State:** Alert state stored in `_state.alert` with visibility, type, and previous view tracking
- **Alert Display:** Alerts interrupt current screen, store previous viewId, display alert screen
- **Alert Dismissal:** ESC dismisses alert, restores previous viewId
- **Edge Case Handling:** Validate all state transitions, button presses, and boundary conditions

---

## 9. Implementation Plan

### Phase 1: Alert Screen Definitions (Sub-tasks 7.1-7.4)
1. **[7.1]** Create `low_battery` alert screen definition in `screen-atlas.json`:
   - Title: "LOW BATTERY" or similar (verify with firmware docs)
   - Message text (verify exact wording from firmware R.13J)
   - ESC key handler
   - Softkeys (if any - verify with firmware)
   
2. **[7.2]** Create `sd_missing` alert screen definition in `screen-atlas.json`:
   - Title: "SD CARD MISSING" or similar
   - Message text (verify exact wording)
   - ESC key handler
   
3. **[7.3]** Create `memory_full` alert screen definition in `screen-atlas.json`:
   - Title: "MEMORY FULL" or similar
   - Message text (verify exact wording)
   - ESC key handler
   
4. **[7.4]** Create `invalid_action` alert screen definition in `screen-atlas.json`:
   - Title: "INVALID ACTION" or similar
   - Message text (verify exact wording)
   - ESC key handler

### Phase 2: Alert State Management (Sub-tasks 7.5-7.6)
5. **[7.5]** Implement alert state structure in FSM:
   - Add `_state.alert` object with visibility, type, message, autoDismiss, timer, previousViewId
   - Initialize alert state in `initMainFSM()`
   
6. **[7.6]** Implement alert display logic:
   - Create `_showAlert(type, message, autoDismiss)` function
   - Store current viewId in `_state.alert.previousViewId`
   - Set `_state.alert.visible = true`
   - Set `_state.alert.type = type`
   - Update `_state.viewId` to alert screen ID
   - Trigger render

### Phase 3: Alert Dismissal (Sub-tasks 7.7-7.8)
7. **[7.7]** Implement ESC dismiss handler:
   - Add ESC case handler for alert screens
   - Restore `_state.viewId` from `_state.alert.previousViewId`
   - Clear alert state (`visible = false`, `type = null`, etc.)
   - Trigger render
   
8. **[7.8]** Implement auto-dismiss logic (if applicable):
   - Check firmware R.13J docs for auto-dismiss behavior
   - If alerts auto-dismiss, implement timer logic
   - Use `setTimeout` to auto-dismiss after specified duration
   - Clear timer on manual dismiss (ESC)

### Phase 4: Edge Case Handling (Sub-tasks 7.9-7.11)
9. **[7.9]** Add edge case handling for invalid button presses:
   - Validate button presses are valid for current screen/state
   - Show `invalid_action` alert for invalid button presses
   - Log invalid actions for debugging
   
10. **[7.10]** Add edge case handling for impossible state transitions:
    - Validate state transitions are valid before executing
    - Prevent invalid transitions (e.g., going to stopped state from non-running state)
    - Show appropriate alerts or silently ignore invalid transitions
    
11. **[7.11]** Add edge case handling for boundary conditions:
    - Check for empty arrays/lists before accessing indices
    - Validate null/undefined values before use
    - Check range bounds before array/object access
    - Handle division by zero, negative values where inappropriate
    - Add default values for missing state properties

### Phase 5: Testing & Validation (Sub-tasks 7.12-7.13)
12. **[7.12]** Test all alert screens:
    - Test each alert type displays correctly
    - Test ESC dismisses alerts and returns to previous screen
    - Test auto-dismiss (if implemented)
    - Test alert appearance doesn't break existing functionality
    
13. **[7.13]** Test edge cases:
    - Test invalid button presses show appropriate alerts
    - Test boundary conditions don't cause crashes
    - Test state transitions are all valid
    - Test empty/null values are handled gracefully

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact alert text and behavior
- Reference `tasks/fsmtasks.md` Section 8 for alert patterns
- Test each sub-task before moving to next
- Update task checkboxes in `TASK-MASTER-MENU-STRUCTURE-V2.5.md` as work progresses
- Ensure alerts don't break existing functionality
- Match firmware R.13J alert behavior exactly

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `TASK-MASTER-MENU-STRUCTURE-V2.5.md` as each sub-task (7.1-7.13) is completed
- Mark Phase 7 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met
- Create `PHASE-7-TESTING-GUIDE.md` for comprehensive testing

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `data/screen-atlas.json` - Add all alert screen definitions (low_battery, sd_missing, memory_full, invalid_action)
- `js/fsm/mainFSM.js` - Add alert state management, alert display/dismiss logic, edge case handling

**Files to Create:**
- `tasks/PHASE-7-TESTING-GUIDE.md` - Comprehensive testing guide for Phase 7

**Files to Reference:**
- `PRD.md` - Requirements reference
- `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md` - Phase 7 requirements
- `tasks/fsmtasks.md` - Alert patterns and behavior (Section 8)
- `tasks/Menu-Structure-v2.5.md` - Menu structure reference (Section 10 for alerts)
- Firmware R.13J documentation PDFs in `Documents/` folder for exact alert text and behavior

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements
   - Review `tasks/fsmtasks.md` Section 8 for alert patterns
   - Review `tasks/Menu-Structure-v2.5.md` Section 10 for alert specifications
   - Review firmware R.13J documentation for exact alert text and behavior
   - Understand current FSM state management patterns
   - Check existing alert/error handling patterns in codebase

2. **Implement Sub-tasks Sequentially:**
   - **Phase 1:** Create alert screen definitions (7.1-7.4)
   - **Phase 2:** Implement alert state management (7.5-7.6)
   - **Phase 3:** Implement alert dismissal (7.7-7.8)
   - **Phase 4:** Add edge case handling (7.9-7.11)
   - **Phase 5:** Testing and validation (7.12-7.13)

3. **Testing:**
   - Test each alert screen displays correctly
   - Test ESC dismisses alerts properly
   - Test edge cases don't cause crashes
   - Test alerts don't break existing functionality
   - Verify all behavior matches firmware R.13J

4. **Documentation:**
   - Add code comments explaining alert logic
   - Document edge case handling approaches
   - Create comprehensive testing guide
   - Update implementation notes

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if firmware documentation is unclear about alert behavior
- Document any assumptions made about alert auto-dismiss behavior

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern
- Comment complex alert logic and edge case handling
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Follow existing FSM patterns for state management
- Use existing screen atlas patterns for alert screens

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- None - Adding new alert functionality, not modifying existing behavior
- Alerts may interrupt any screen, but this is expected behavior

**Performance Concerns:**
- Alert display should be instant (no delays)
- Auto-dismiss timers should be efficient (use `setTimeout`/`clearTimeout`)
- Edge case validation should not add significant overhead

**User Workflow Impacts:**
- Users can now see and respond to alerts as they would on the real device
- Alerts interrupt normal operation (matches real device behavior)
- Edge case handling prevents crashes and unexpected behavior
- Training value: Students learn to handle error conditions

**Future Dependencies:**
- No other tasks depend on Phase 7 completion
- Phase 7 is the final polish phase
- Future enhancements may add more alert types

**Risk Mitigation:**
- Test against firmware R.13J documentation for exact alert behavior
- Verify all edge cases are handled (invalid inputs, null values, boundary conditions)
- Document any assumptions made about alert behavior
- Ensure alerts don't break existing functionality
- Test alert dismissal returns to correct previous screen

---

**Ready to Implement?**
This task implements Alerts & Edge Cases for Phase 7. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

