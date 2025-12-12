# AI Task Planning - Phase 4: SLM Multi-Page Views & Advanced Features

> **How to Use This Template:**
> 1. Task list file: `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md`
> 2. Phase 4 section (lines 272-330)
> 3. Based on Menu-Structure-v2.5.md Section 5.3-5.5
> 4. Includes fixing SLM home screen layout to match device image

## 1. Task Overview

### Task Title
**Title:** Phase 4: SLM Multi-Page Views & Advanced Features

### Goal Statement
**Goal:** Complete the SLM (Sound Level Meter) functionality by implementing multi-page navigation (pages 1-4), graph mode views (1/1 and 1/3 octave), and softkey handlers. Additionally, fix the SLM home screen layout to match the actual device appearance with proper bar graph, main dB readout, and status indicators. This phase extends Phase 2's basic SLM functionality to provide full multi-page navigation and mode switching capabilities, matching firmware R.13J behavior exactly.

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
- ✅ Phase 1 completed - Startup & Home screens working
- ✅ Phase 2 completed - SLM Core Operation with page 1 (running/paused/stopped states)
- ✅ Phase 3 completed - Setup Menu system fully implemented
- ✅ Basic SLM functionality exists: `slm_home`, `slm_home_paused`, `slm_home_stopped` screens
- ✅ Run/Pause/Stop functionality working
- ✅ ESC returns to Home working
- ✅ Softkey 1 (VIEW) opens `slm_view_menu`
- ⏸️ **SLM home screen layout is incorrect** - needs bar graph, proper dB readout, status indicators
- ⏸️ Pages 2-4 not implemented (only page 1 exists)
- ⏸️ Graph modes (1/1 and 1/3 octave) not implemented
- ⏸️ Softkey handlers 2-4 not implemented (F/S/I, R/C/Z/F, Meter 1/2)
- ⏸️ Page navigation (UP/DOWN cycles pages 1-4) not implemented
- ⏸️ Mode switching (numeric/1/1/1/3) not implemented

---

## 3. Context & Problem Definition

### Problem Statement
Currently, the SLM functionality only provides page 1 with basic run/pause/stop capabilities. The SLM home screen layout does not match the actual device - it's missing the horizontal bar graph, proper main dB readout positioning, range indicators (-20/70), and correct status bar layout. Additionally, users cannot navigate to pages 2-4, switch to graph modes (1/1 or 1/3 octave), or use softkey handlers for time constant (F/S/I), weighting (R/C/Z/F), or meter selection (Meter 1/2). This limits the training module's effectiveness as it doesn't match the full functionality of the actual Quest SoundPro SE-DL device. Phase 4 must implement all these features to complete the SLM functionality and match firmware R.13J specifications exactly.

### Success Criteria
- [ ] 4.0: Fix SLM home screen layout to match device image
  - [ ] 4.0.1: Add status bar at top (battery icon, play/pause icon, timer)
  - [ ] 4.0.2: Add horizontal bar graph with range indicators (-20 and 70 above graph)
  - [ ] 4.0.3: Add main dB readout (large digits) with units (dB LZS format)
  - [ ] 4.0.4: Position all elements correctly to match reference image
  - [ ] 4.0.5: Update screen-atlas.json with correct element definitions
- [ ] 4.1: Implement SLM Multi-Page Navigation
  - [ ] 4.1.1: Create screen definitions for pages 2-4 (running/paused states)
  - [ ] 4.1.2: Implement UP/DOWN navigation to cycle pages 1-4
  - [ ] 4.1.3: Add page state management in FSM (`slm.currentPage`)
  - [ ] 4.1.4: Implement page-specific content rendering
  - [ ] 4.1.5: Ensure page state persists across run/pause/stop transitions
- [ ] 4.2: Implement SLM 1/1 Octave Graph Views
  - [ ] 4.2.1: Create screen definitions for 1/1 graph pages 1-4 (running/paused)
  - [ ] 4.2.2: Implement graph mode state management (`slm.mode = '1of1'`)
  - [ ] 4.2.3: Add page navigation (UP/DOWN) for graph mode
  - [ ] 4.2.4: Implement mode switching via home screen softkey 1
  - [ ] 4.2.5: Add placeholder graph rendering (actual graph deferred to measurement engine)
- [ ] 4.3: Implement SLM 1/3 Octave Graph Views
  - [ ] 4.3.1: Create screen definitions for 1/3 graph pages 1-4 (running/paused)
  - [ ] 4.3.2: Implement graph mode state management (`slm.mode = '1of3'`)
  - [ ] 4.3.3: Add page navigation (UP/DOWN) for graph mode
  - [ ] 4.3.4: Implement mode switching via home screen softkey 1
  - [ ] 4.3.5: Add placeholder graph rendering (actual graph deferred to measurement engine)
- [ ] 4.4: Implement SLM Softkey Handlers
  - [ ] 4.4.1: Implement Softkey 2: F/S/I cycling (Fast/Slow/Impulse time constant)
  - [ ] 4.4.2: Add underline movement under active letter for F/S/I
  - [ ] 4.4.3: Implement Softkey 3: R/C/Z/F cycling (Range/Weighting options)
  - [ ] 4.4.4: Add underline movement under active letter for R/C/Z/F
  - [ ] 4.4.5: Implement Softkey 4: Meter 1/2 toggle
  - [ ] 4.4.6: Store softkey states in FSM (`slm.timeConstant`, `slm.weighting`, `slm.activeMeter`)
  - [ ] 4.4.7: Update softkey label rendering to show active selections with underlines
- [ ] 4.5: Integrate All Features
  - [ ] 4.5.1: Ensure page navigation works in all modes (numeric, 1/1, 1/3)
  - [ ] 4.5.2: Ensure softkey handlers work in all modes
  - [ ] 4.5.3: Ensure run/pause/stop works across all pages and modes
  - [ ] 4.5.4: Test mode switching preserves page number
  - [ ] 4.5.5: Test page navigation preserves mode

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Active development - extending Phase 2 SLM functionality
- **Breaking Changes:** Acceptable - updating SLM screen layout and adding new screens
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High accuracy - must match firmware R.13J behavior and device appearance exactly

---

## 5. Technical Requirements

### Functional Requirements

**From Menu-Structure-v2.5.md Section 5.3-5.5:**

1. **SLM Home Screen Layout:**
   - Status bar at top: battery icon (left), play/pause icon (center-left), timer (right) showing "hh:mm:ss"
   - Horizontal bar graph below status bar with range indicators (-20 above left end, 70 above right end)
   - Main dB readout in large digits below bar graph
   - Units displayed to right of main reading (format: "dB LZS" where L=Linear, Z=Zero, S=Slow)
   - Softkey labels at bottom: VIEW icon, "F-S-I", "R-C-Z-F", "METER 1" (or "METER 2")

2. **Multi-Page Navigation:**
   - UP/DOWN arrows cycle through pages 1-4 within current mode
   - Page state persists across run/pause/stop transitions
   - Each page shows different measurement data (page 1: main reading, pages 2-4: Leq, Lmax, etc.)

3. **Graph Mode Views:**
   - 1/1 octave graph mode with pages 1-4
   - 1/3 octave graph mode with pages 1-4
   - Mode switching via home screen softkey 1 (SLM → 1/1 → 1/3 → SLM)
   - Graph rendering placeholder (actual graph data deferred to measurement engine)

4. **Softkey Handlers:**
   - Softkey 2: Cycles F → S → I → F (Fast/Slow/Impulse time constant)
   - Softkey 3: Cycles R → C → Z → F → R (Range/Weighting options)
   - Softkey 4: Toggles Meter 1 ↔ Meter 2
   - Active selection shown with underline under letter
   - States stored in FSM and persist across navigation

5. **Button Behavior:**
   - UP/DOWN: Scroll between pages 1-4 within current mode
   - LEFT/RIGHT: Cycle measurement unit/secondary view (if applicable)
   - Run/Pause: Toggle run state (Running ↔ Paused)
   - Stop (hold): 3-second countdown to stop/save (must be paused first)
   - ESC: Exit SLM and return to Home
   - Softkey 1: Open View Menu (`slm_view_menu`)
   - Softkey 2: Cycle F/S/I
   - Softkey 3: Cycle R/C/Z/F
   - Softkey 4: Toggle Meter 1/2

### Non-Functional Requirements
- **Performance:** Instant page transitions, smooth softkey label updates
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** All interactions must match firmware R.13J behavior exactly
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Visual Accuracy:** SLM home screen must match device image exactly

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- Graph rendering can be placeholder (actual graph data from measurement engine later)

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates
- **SLM State Object:** Extend `_state.slm` in FSM:
  ```javascript
  {
    currentPage: 1,           // 1-4
    mode: 'numeric',          // 'numeric', '1of1', '1of3'
    timeConstant: 'S',       // 'F', 'S', 'I'
    weighting: 'R',          // 'R', 'C', 'Z', 'F'
    activeMeter: 1,         // 1 or 2
    running: false,         // measurement state
    paused: false,
    stopped: false
  }
  ```

### Data Migration Plan
N/A - No data migration needed

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
- **Bar Graph Component:** Horizontal bar graph with range indicators for SLM home screen
- **Status Bar Component:** Top status bar with battery icon, play/pause icon, timer
- **Main Readout Component:** Large numeric dB display with units
- **Softkey Label Renderer (Enhanced):** Support for underlines on active selections

### Page Updates
- `data/screen-atlas.json` - Add/update screen definitions:
  - Fix `slm_home`, `slm_home_paused`, `slm_home_stopped` with correct layout
  - Add `slm_home_page2_running`, `slm_home_page2_paused`
  - Add `slm_home_page3_running`, `slm_home_page3_paused`
  - Add `slm_home_page4_running`, `slm_home_page4_paused`
  - Add `slm_graph_1of1_page1_running`, `slm_graph_1of1_page1_paused` (pages 1-4)
  - Add `slm_graph_1of3_page1_running`, `slm_graph_1of3_page1_paused` (pages 1-4)
- `js/fsm/mainFSM.js` - Add handlers:
  - UP/DOWN handlers for page navigation in SLM mode
  - SOFT2, SOFT3, SOFT4 handlers for softkey cycling
  - Mode switching logic
  - Page state management
- `js/screen-renderer.js` - Add rendering:
  - Bar graph rendering
  - Status bar rendering
  - Main readout rendering
  - Softkey label rendering with underlines
  - Page-specific content rendering
- `css/styles.css` - Add styles:
  - Bar graph styles
  - Status bar styles
  - Main readout styles
  - Softkey underline styles

### State Management
- Extend `_state.slm` object in FSM to include:
  - `currentPage`: Current page number (1-4)
  - `mode`: Current mode ('numeric', '1of1', '1of3')
  - `timeConstant`: Active time constant ('F', 'S', 'I')
  - `weighting`: Active weighting ('R', 'C', 'Z', 'F')
  - `activeMeter`: Active meter (1 or 2)
- State updates trigger screen re-rendering via existing render system
- Page and mode state persist across run/pause/stop transitions

---

## 9. Implementation Plan

### Phase 1: Fix SLM Home Screen Layout (4.0)
1. **[4.0.1]** Add status bar element to screen-atlas.json for SLM screens
   - Battery icon (left)
   - Play/pause icon (center-left, changes based on measurement state)
   - Timer (right, format: "hh:mm:ss")
2. **[4.0.2]** Add horizontal bar graph element to screen-atlas.json
   - Bar graph with range indicators
   - "-20" label above left end
   - "70" label above right end
   - Bar fill level (bind to measurement value)
3. **[4.0.3]** Add main dB readout element to screen-atlas.json
   - Large numeric display (bind to measurement.currentSPL)
   - Units label to right (format: "dB LZS" - bind to config values)
4. **[4.0.4]** Update CSS styles for new layout
   - Position status bar at top
   - Position bar graph below status bar
   - Position main readout below bar graph
   - Ensure proper spacing and alignment
5. **[4.0.5]** Update screen-renderer.js to render new elements
   - Render status bar with icons
   - Render bar graph with range indicators
   - Render main readout with units
   - Test layout matches reference image

### Phase 2: Multi-Page Navigation (4.1)
1. **[4.1.1]** Add screen definitions for pages 2-4 in screen-atlas.json
   - `slm_home_page2_running`, `slm_home_page2_paused`
   - `slm_home_page3_running`, `slm_home_page3_paused`
   - `slm_home_page4_running`, `slm_home_page4_paused`
   - Include same layout elements as page 1 (status bar, bar graph, readout)
2. **[4.1.2]** Add page state to FSM (`_state.slm.currentPage`)
   - Initialize to 1 when entering SLM
   - Update on UP/DOWN navigation
3. **[4.1.3]** Implement UP/DOWN handlers in mainFSM.js
   - In SLM mode, UP/DOWN cycles pages 1-4
   - Wrap around: page 4 UP → page 1, page 1 DOWN → page 4
   - Update `_state.slm.currentPage`
   - Trigger screen transition based on current page and run state
4. **[4.1.4]** Update screen-renderer.js for page-specific content
   - Page 1: Main reading (currentSPL)
   - Page 2: Leq (placeholder for now)
   - Page 3: Lmax (placeholder for now)
   - Page 4: Lmin (placeholder for now)
5. **[4.1.5]** Ensure page state persists
   - Page number maintained across run/pause/stop
   - Page number maintained when returning to SLM from View Menu

### Phase 3: 1/1 Octave Graph Views (4.2)
1. **[4.2.1]** Add screen definitions for 1/1 graph pages in screen-atlas.json
   - `slm_graph_1of1_page1_running`, `slm_graph_1of1_page1_paused`
   - `slm_graph_1of1_page2_running`, `slm_graph_1of1_page2_paused`
   - `slm_graph_1of1_page3_running`, `slm_graph_1of1_page3_paused`
   - `slm_graph_1of1_page4_running`, `slm_graph_1of1_page4_paused`
   - Include status bar, placeholder graph area, softkeys
2. **[4.2.2]** Add mode state to FSM (`_state.slm.mode`)
   - Initialize to 'numeric' when entering SLM
   - Update to '1of1' when switching to 1/1 mode
3. **[4.2.3]** Implement page navigation for graph mode
   - UP/DOWN cycles pages 1-4 in graph mode
   - Same wrap-around behavior as numeric mode
4. **[4.2.4]** Implement mode switching via home screen softkey 1
   - Update home screen SOFT1 handler to cycle: SLM → 1/1 → 1/3 → SLM
   - Store mode preference in FSM state
   - When entering SLM, use stored mode preference
5. **[4.2.5]** Add placeholder graph rendering
   - Graph area element in screen-atlas.json
   - Placeholder text or empty graph area
   - Note: Actual graph rendering deferred to measurement engine

### Phase 4: 1/3 Octave Graph Views (4.3)
1. **[4.3.1]** Add screen definitions for 1/3 graph pages in screen-atlas.json
   - `slm_graph_1of3_page1_running`, `slm_graph_1of3_page1_paused`
   - `slm_graph_1of3_page2_running`, `slm_graph_1of3_page2_paused`
   - `slm_graph_1of3_page3_running`, `slm_graph_1of3_page3_paused`
   - `slm_graph_1of3_page4_running`, `slm_graph_1of3_page4_paused`
   - Include status bar, placeholder graph area, softkeys
2. **[4.3.2]** Add mode state for 1/3 (`_state.slm.mode = '1of3'`)
   - Update mode when switching to 1/3
3. **[4.3.3]** Implement page navigation for 1/3 mode
   - UP/DOWN cycles pages 1-4 in 1/3 mode
   - Same wrap-around behavior
4. **[4.3.4]** Integrate 1/3 mode into mode switching
   - Include in SOFT1 cycle on home screen
5. **[4.3.5]** Add placeholder graph rendering
   - Graph area element
   - Placeholder text or empty graph area

### Phase 5: Softkey Handlers (4.4)
1. **[4.4.1]** Implement SOFT2 handler in mainFSM.js
   - Cycle: F → S → I → F
   - Update `_state.slm.timeConstant`
   - Update softkey label rendering
2. **[4.4.2]** Add underline rendering for F/S/I
   - Update screen-renderer.js to show underline under active letter
   - CSS for underline styling
   - Position underline dynamically based on active selection
3. **[4.4.3]** Implement SOFT3 handler in mainFSM.js
   - Cycle: R → C → Z → F → R
   - Update `_state.slm.weighting`
   - Update softkey label rendering
4. **[4.4.4]** Add underline rendering for R/C/Z/F
   - Update screen-renderer.js to show underline under active letter
   - CSS for underline styling
   - Position underline dynamically based on active selection
5. **[4.4.5]** Implement SOFT4 handler in mainFSM.js
   - Toggle: Meter 1 ↔ Meter 2
   - Update `_state.slm.activeMeter`
   - Update softkey label rendering
6. **[4.4.6]** Store softkey states in FSM
   - Initialize defaults: timeConstant='S', weighting='R', activeMeter=1
   - Persist states across navigation
7. **[4.4.7]** Update softkey label rendering
   - Show active selections with underlines
   - Update labels dynamically based on state

### Phase 6: Integration & Testing (4.5)
1. **[4.5.1]** Test page navigation in all modes
   - Numeric mode: pages 1-4
   - 1/1 mode: pages 1-4
   - 1/3 mode: pages 1-4
2. **[4.5.2]** Test softkey handlers in all modes
   - F/S/I cycling works in all modes
   - R/C/Z/F cycling works in all modes
   - Meter 1/2 toggle works in all modes
3. **[4.5.3]** Test run/pause/stop across all pages and modes
   - Run/pause works on any page
   - Stop works from any page (must pause first)
   - State transitions correct
4. **[4.5.4]** Test mode switching preserves page number
   - Switch from numeric page 3 to 1/1 → should be on page 3
   - Switch from 1/1 page 2 to 1/3 → should be on page 2
5. **[4.5.5]** Test page navigation preserves mode
   - Navigate pages in numeric mode → stays in numeric
   - Navigate pages in 1/1 mode → stays in 1/1
   - Navigate pages in 1/3 mode → stays in 1/3

### Implementation Notes
- Follow Menu-Structure-v2.5.md Section 5.3-5.5 specifications exactly
- Reference device image for SLM home screen layout
- Test each phase before moving to next
- Update TASK-MASTER-MENU-STRUCTURE-V2.5.md as work progresses
- Reference existing Phase 2 implementation for patterns
- Use existing FSM patterns for state management
- Follow existing screen-atlas.json structure for new screens

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in this document as each sub-task (4.0.1-4.5.5) is completed
- Mark parent task 4.X complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify SLM home screen matches device image exactly
- Update TASK-MASTER-MENU-STRUCTURE-V2.5.md Phase 4 section as work completes

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `data/screen-atlas.json` - Add/update SLM screen definitions
- `js/fsm/mainFSM.js` - Add page navigation, softkey handlers, mode switching
- `js/screen-renderer.js` - Add bar graph, status bar, main readout rendering
- `css/styles.css` - Add styles for new SLM layout elements

**Files to Create:**
- `tasks/PHASE-4-TESTING-GUIDE.md` - Testing guide for Phase 4 (after implementation)

**Files to Reference:**
- `tasks/Menu-Structure-v2.5.md` - Complete screen behavior specification (Section 5.3-5.5)
- `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md` - Phase 4 requirements
- `tasks/FSM-spec-v1.md` - State machine specification
- `PRD.md` - Project requirements
- Device reference image (provided by user) - SLM home screen layout

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review Menu-Structure-v2.5.md Section 5.3-5.5 for SLM specifications
   - Review device image for SLM home screen layout
   - Understand current Phase 2 SLM implementation
   - Check screen-atlas.json for existing SLM screens
   - Review mainFSM.js for existing SLM handlers

2. **Implement Sub-tasks Sequentially:**
   - **Phase 1:** Fix SLM home screen layout (4.0.1-4.0.5)
   - **Phase 2:** Multi-page navigation (4.1.1-4.1.5)
   - **Phase 3:** 1/1 octave graph views (4.2.1-4.2.5)
   - **Phase 4:** 1/3 octave graph views (4.3.1-4.3.5)
   - **Phase 5:** Softkey handlers (4.4.1-4.4.7)
   - **Phase 6:** Integration & testing (4.5.1-4.5.5)

3. **Testing:**
   - Test each feature matches firmware R.13J behavior
   - Verify SLM home screen matches device image exactly
   - Test all navigation paths
   - Test all mode switching
   - Test all softkey handlers
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining complex logic
   - Document any deviations from firmware (should be none)
   - Update implementation notes
   - Create testing guide after implementation

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if device image or firmware documentation is unclear
- Show visual layout changes clearly

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern
- Comment complex calculations and state transitions
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Match device image layout exactly

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- SLM home screen layout changes - existing screen definitions will be updated
- New screen definitions added - no breaking changes to existing screens
- FSM state extended - `_state.slm` object will have new properties

**Performance Concerns:**
- Page transitions should be instant (no animation delays)
- Softkey label updates should be immediate
- Bar graph updates should be smooth (when measurement data available)

**User Workflow Impacts:**
- Users can now navigate between pages 1-4
- Users can switch between numeric and graph modes
- Users can adjust time constant, weighting, and meter selection
- SLM home screen now matches actual device appearance

**Future Dependencies:**
- Task 5.0 (Measurement Engine) will populate pages 2-4 with real data
- Task 5.0 will provide actual graph data for 1/1 and 1/3 modes
- Task 5.0 will use softkey states (timeConstant, weighting) for calculations

**Risk Mitigation:**
- Test against Menu-Structure-v2.5.md specifications
- Verify SLM home screen matches device image exactly
- Test all edge cases (page wrap-around, mode switching, state persistence)
- Document any assumptions made about graph rendering (deferred to measurement engine)

---

## 14. Reference: SLM Home Screen Layout (From Device Image)

Based on the provided device image, the SLM home screen should have:

**Status Bar (Top):**
- Battery icon (left) - full charge indicator
- Play icon (center-left) - right-pointing triangle when running
- Timer (right) - format "00:10:50" (hh:mm:ss)

**Measurement Display (Center):**
- Horizontal bar graph with vertical bars
- Range indicators: "-20" above left end, "70" above right end
- Main dB readout: "18.4" in large digits below bar graph
- Units: "dB LZS" to right of main reading
  - L = Linear weighting
  - Z = Zero time constant (or Z weighting)
  - S = Slow time constant

**Softkey Labels (Bottom):**
- Softkey 1: VIEW icon (square with arrow)
- Softkey 2: "F-S-I" (spaced letters, underline on active)
- Softkey 3: "R-C-Z-F" (spaced letters, underline on active)
- Softkey 4: "METER 1" (or "METER 2" when toggled)

**Layout Notes:**
- Bar graph is horizontal with current level indicated by filled portion
- Main reading is prominently displayed in large digits
- All elements properly spaced and aligned
- Status bar spans full width at top
- Softkeys at bottom with proper spacing

---

**Ready to Implement?**
This task implements Phase 4: SLM Multi-Page Views & Advanced Features. Follow Menu-Structure-v2.5.md specifications exactly and ensure the SLM home screen matches the device image. All sub-tasks must be completed before marking Phase 4 complete.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** December 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

