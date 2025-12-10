# Phase 4: SLM Multi-Page Views & Advanced Features - Task Document

**Date Created:** December 2024  
**Status:** ⏸️ PENDING  
**Prerequisites:** Phase 3 Batch 3 Complete ✅

---

## Overview

Phase 4 implements the remaining SLM (Sound Level Meter) functionality:
1. **Multi-page navigation** for SLM numeric view (pages 1-4)
2. **1/1 Octave graph views** with pages 1-4
3. **1/3 Octave graph views** with pages 1-4
4. **Softkey handlers** for F/S/I, R/C/Z/F, and Meter 1/2

**Key Features:**
- Page navigation using UP/DOWN arrows (cycles pages 1-4)
- Mode switching between numeric, 1/1, and 1/3 views
- Softkey cycling with visual feedback (underlines)
- State persistence across page/mode changes

---

## Task 4.1: SLM Multi-Page Navigation

**Status:** ⏸️ PENDING  
**Reference:** Menu-Structure-v2.5.md Section 5.3  
**Estimated Complexity:** Medium

### Current State
- ✅ Page 1 exists: `slm_home` (running) and `slm_home_paused` (paused)
- ✅ Basic run/pause/stop functionality working
- ❌ Pages 2-4 not implemented
- ❌ Page navigation not implemented
- ❌ Page state tracking not implemented

### Required Implementation

#### 4.1.1 State Management

**File:** `js/fsm/mainFSM.js`

Add to `_state` object:
```javascript
slm: {
    page: 1,                    // Current page (1-4)
    mode: "numeric",            // "numeric", "1of1", "1of3"
    timeConstant: "F",          // "F", "S", "I" (Fast, Slow, Impulse)
    weighting: "R",             // "R", "C", "Z", "F" (Rapid, C, Z, Flat)
    activeMeter: 1,             // 1 or 2
    viewLayout: "SPL"           // Selected from slm_view_menu
}
```

**Note:** `slmLabelIndex` already exists in state (0 = "SLM", 1 = "1/1", 2 = "1/3"). Map it to `slm.mode`:
- 0 → "numeric"
- 1 → "1of1"
- 2 → "1of3"

#### 4.1.2 Screen Definitions

**File:** `data/screen-atlas.json`

Add screen definitions for pages 2-4:

```json
{
  "id": "slm_home_page2_running",
  "type": "slm_numeric",
  "elements": [
    // Page 2 content (Leq, Lmax, etc.)
  ]
},
{
  "id": "slm_home_page2_paused",
  "type": "slm_numeric",
  "elements": [
    // Page 2 content (paused state)
  ]
},
// ... repeat for pages 3 and 4
```

**Screens Needed:**
- `slm_home_page2_running`
- `slm_home_page2_paused`
- `slm_home_page3_running`
- `slm_home_page3_paused`
- `slm_home_page4_running`
- `slm_home_page4_paused`

#### 4.1.3 View Selection Logic

**File:** `js/fsm/mainFSM.js`

Create helper function to determine current `viewId`:

```javascript
function _getSlmViewId() {
    const isRunning = _state.measurement.state === "running";
    const page = _state.slm.page || 1;
    const mode = _state.slm.mode || "numeric";
    
    if (mode === "numeric") {
        if (page === 1) {
            return isRunning ? "slm_home" : "slm_home_paused";
        } else {
            return isRunning ? `slm_home_page${page}_running` : `slm_home_page${page}_paused`;
        }
    } else if (mode === "1of1") {
        return isRunning ? `slm_graph_1of1_page${page}_running` : `slm_graph_1of1_page${page}_paused`;
    } else if (mode === "1of3") {
        return isRunning ? `slm_graph_1of3_page${page}_running` : `slm_graph_1of3_page${page}_paused`;
    }
    
    return isRunning ? "slm_home" : "slm_home_paused";
}
```

Update all places where `viewId` is set for SLM to use this function.

#### 4.1.4 Page Navigation Handlers

**File:** `js/fsm/mainFSM.js`

Add UP/DOWN handlers for SLM screens:

```javascript
// In dispatch function, add to UP/DOWN handlers:
case 'UP':
case 'DOWN':
    if (isSlm()) {
        // Cycle pages 1-4
        if (event === 'UP') {
            _state.slm.page = _state.slm.page > 1 ? _state.slm.page - 1 : 4;
        } else {
            _state.slm.page = _state.slm.page < 4 ? _state.slm.page + 1 : 1;
        }
        _state.viewId = _getSlmViewId();
        _emit();
        return;
    }
    // ... existing UP/DOWN logic
```

#### 4.1.5 Page-Specific Content Rendering

**File:** `js/screen-renderer.js`

Update SLM rendering to display page-specific content:
- Page 1: Large numeric dB readout (existing)
- Page 2: Leq, Lmax, additional metrics
- Page 3: More metrics (TBD based on reference images)
- Page 4: More metrics (TBD based on reference images)

**Note:** Actual measurement values will be placeholders until measurement engine is implemented.

### Testing Checklist

- [ ] UP/DOWN arrows cycle through pages 1-4 in numeric mode
- [ ] Page wraps correctly (4 → 1, 1 → 4)
- [ ] Page persists when toggling run/pause
- [ ] Page persists when entering/exiting slm_view_menu
- [ ] Correct screen is displayed for each page (running/paused)
- [ ] Page state resets to 1 when exiting and re-entering SLM

---

## Task 4.2: SLM 1/1 Octave Graph Views

**Status:** ⏸️ PENDING  
**Reference:** Menu-Structure-v2.5.md Section 5.5  
**Estimated Complexity:** Medium

### Current State
- ✅ `slmLabelIndex` exists and cycles (0 = "SLM", 1 = "1/1", 2 = "1/3")
- ✅ Softkey 1 cycles the label on home screen
- ❌ Graph view screens not implemented
- ❌ Graph rendering not implemented (deferred)

### Required Implementation

#### 4.2.1 Screen Definitions

**File:** `data/screen-atlas.json`

Add screen definitions for 1/1 graph views:

**Screens Needed:**
- `slm_graph_1of1_page1_running`
- `slm_graph_1of1_page1_paused`
- `slm_graph_1of1_page2_running`
- `slm_graph_1of1_page2_paused`
- `slm_graph_1of1_page3_running`
- `slm_graph_1of1_page3_paused`
- `slm_graph_1of1_page4_running`
- `slm_graph_1of1_page4_paused`

Each screen should display:
- Graph placeholder (will be rendered by measurement engine later)
- Page-specific overlay metrics
- Same status bar (battery, timer, etc.)

#### 4.2.2 Mode Switching

**File:** `js/fsm/mainFSM.js`

Update `_getSlmViewId()` to handle `mode === "1of1"` (see Task 4.1.3).

Update softkey 1 handler on home screen to set `_state.slm.mode`:
```javascript
// When SOFT1 pressed on home:
_state.slmLabelIndex = (_state.slmLabelIndex + 1) % 3;
if (_state.slmLabelIndex === 0) {
    _state.slm.mode = "numeric";
} else if (_state.slmLabelIndex === 1) {
    _state.slm.mode = "1of1";
} else if (_state.slmLabelIndex === 2) {
    _state.slm.mode = "1of3";
}
```

When entering SLM, use `_state.slm.mode` to determine initial view.

#### 4.2.3 Page Navigation

**File:** `js/fsm/mainFSM.js`

Use same UP/DOWN handlers from Task 4.1.4. They should work for all modes.

#### 4.2.4 Graph Rendering Placeholder

**File:** `js/screen-renderer.js`

For now, render a placeholder element:
```html
<div class="slm-graph-placeholder">
  Graph will be rendered here (1/1 Octave)
</div>
```

Actual graph rendering will be implemented in measurement engine phase.

### Testing Checklist

- [ ] Softkey 1 on home cycles: SLM → 1/1 → 1/3 → SLM
- [ ] Entering SLM with "1/1" selected shows graph view
- [ ] UP/DOWN arrows cycle pages 1-4 in 1/1 mode
- [ ] Run/pause works in 1/1 mode
- [ ] ESC returns to home from 1/1 mode
- [ ] Page persists when toggling run/pause
- [ ] Graph placeholder displays correctly

---

## Task 4.3: SLM 1/3 Octave Graph Views

**Status:** ⏸️ PENDING  
**Reference:** Menu-Structure-v2.5.md Section 5.5  
**Estimated Complexity:** Medium

### Current State
- ✅ `slmLabelIndex` includes 1/3 option
- ❌ Graph view screens not implemented
- ❌ Graph rendering not implemented (deferred)

### Required Implementation

#### 4.3.1 Screen Definitions

**File:** `data/screen-atlas.json`

Add screen definitions for 1/3 graph views:

**Screens Needed:**
- `slm_graph_1of3_page1_running`
- `slm_graph_1of3_page1_paused`
- `slm_graph_1of3_page2_running`
- `slm_graph_1of3_page2_paused`
- `slm_graph_1of3_page3_running`
- `slm_graph_1of3_page3_paused`
- `slm_graph_1of3_page4_running`
- `slm_graph_1of3_page4_paused`

#### 4.3.2 Mode Switching

**File:** `js/fsm/mainFSM.js`

Update `_getSlmViewId()` to handle `mode === "1of3"` (see Task 4.1.3).

Already handled in Task 4.2.2 mode switching logic.

#### 4.3.3 Graph Rendering Placeholder

**File:** `js/screen-renderer.js`

For now, render a placeholder element:
```html
<div class="slm-graph-placeholder">
  Graph will be rendered here (1/3 Octave)
</div>
```

### Testing Checklist

- [ ] Entering SLM with "1/3" selected shows graph view
- [ ] UP/DOWN arrows cycle pages 1-4 in 1/3 mode
- [ ] Run/pause works in 1/3 mode
- [ ] ESC returns to home from 1/3 mode
- [ ] Page persists when toggling run/pause
- [ ] Graph placeholder displays correctly

---

## Task 4.4: SLM Softkey Handlers

**Status:** ⏸️ PENDING  
**Reference:** Menu-Structure-v2.5.md Section 5.3  
**Estimated Complexity:** Medium

### Current State
- ✅ Softkey 1 (VIEW) opens `slm_view_menu`
- ❌ Softkey 2 (F/S/I) not implemented
- ❌ Softkey 3 (R/C/Z/F) not implemented
- ❌ Softkey 4 (Meter 1/2) not implemented

### Required Implementation

#### 4.4.1 Softkey 2: F/S/I Cycling

**File:** `js/fsm/mainFSM.js`

**State:** Already added `_state.slm.timeConstant` in Task 4.1.1.

**Handler:**
```javascript
case 'SOFT2':
    if (isSlm()) {
        // Cycle: F → S → I → F
        const cycle = ["F", "S", "I"];
        const currentIndex = cycle.indexOf(_state.slm.timeConstant);
        const nextIndex = (currentIndex + 1) % cycle.length;
        _state.slm.timeConstant = cycle[nextIndex];
        _emit();
        return;
    }
```

**Visual Feedback:** Underline moves under active letter.

**File:** `js/screen-renderer.js`

Render softkey 2 label with underline:
```html
<span class="softkey-label">
  <span class="softkey-underline-target" data-value="F">F</span>
  <span> </span>
  <span class="softkey-underline-target" data-value="S">S</span>
  <span> </span>
  <span class="softkey-underline-target" data-value="I">I</span>
</span>
```

Add CSS class to underline active letter:
```css
.softkey-label .softkey-underline-target.active {
    text-decoration: underline;
}
```

#### 4.4.2 Softkey 3: R/C/Z/F Cycling

**File:** `js/fsm/mainFSM.js`

**State:** Already added `_state.slm.weighting` in Task 4.1.1.

**Handler:**
```javascript
case 'SOFT3':
    if (isSlm()) {
        // Cycle: R → C → Z → F → R
        const cycle = ["R", "C", "Z", "F"];
        const currentIndex = cycle.indexOf(_state.slm.weighting);
        const nextIndex = (currentIndex + 1) % cycle.length;
        _state.slm.weighting = cycle[nextIndex];
        _emit();
        return;
    }
```

**Visual Feedback:** Underline moves under active letter.

**File:** `js/screen-renderer.js`

Render softkey 3 label with underline (similar to SOFT2).

#### 4.4.3 Softkey 4: Meter 1/2 Toggle

**File:** `js/fsm/mainFSM.js`

**State:** Already added `_state.slm.activeMeter` in Task 4.1.1.

**Handler:**
```javascript
case 'SOFT4':
    if (isSlm()) {
        // Toggle: 1 ↔ 2
        _state.slm.activeMeter = _state.slm.activeMeter === 1 ? 2 : 1;
        _emit();
        return;
    }
```

**Visual Feedback:** Label shows "Meter 1" or "Meter 2".

**File:** `js/screen-renderer.js`

Render softkey 4 label:
```html
<span class="softkey-label">Meter <span class="meter-number">${_state.slm.activeMeter}</span></span>
```

#### 4.4.4 Softkey Label Rendering

**File:** `js/screen-renderer.js`

Update `renderSoftKeys()` function to:
1. Check if current view is SLM
2. Render softkeys 1-4 with correct labels and underlines
3. Apply active classes based on state

**Softkey Labels:**
- Softkey 1: "VIEW" (already implemented)
- Softkey 2: "F S I" with underline on active
- Softkey 3: "R C Z F" with underline on active
- Softkey 4: "Meter 1" or "Meter 2"

### Testing Checklist

- [ ] Softkey 2 cycles F → S → I → F
- [ ] Underline moves to active letter in F/S/I
- [ ] Softkey 3 cycles R → C → Z → F → R
- [ ] Underline moves to active letter in R/C/Z/F
- [ ] Softkey 4 toggles between "Meter 1" and "Meter 2"
- [ ] All softkey states persist when navigating pages
- [ ] All softkey states persist when toggling run/pause
- [ ] Softkeys only active when in SLM views

---

## Implementation Order

**Recommended Sequence:**
1. **Task 4.1** (Multi-page navigation) - Foundation for page management
2. **Task 4.4** (Softkey handlers) - Independent functionality
3. **Task 4.2** (1/1 graphs) - Builds on 4.1
4. **Task 4.3** (1/3 graphs) - Similar to 4.2

**Dependencies:**
- Task 4.1 must be completed before 4.2 and 4.3 (provides page navigation infrastructure)
- Tasks 4.2 and 4.3 can be done in parallel
- Task 4.4 is independent but should be done early for testing

---

## Files to Modify

### Core Files
- `js/fsm/mainFSM.js` - State management, handlers, navigation logic
- `js/screen-renderer.js` - Rendering logic for all screens and softkeys
- `data/screen-atlas.json` - Screen definitions for all new screens

### Styling Files
- `css/styles.css` - Softkey underline styles, graph placeholder styles

### Reference Files
- `tasks/Menu-Structure-v2.5.md` - Reference for behavior specifications
- `tasks/PHASE-4-TESTING-GUIDE.md` - Testing guide (to be created)

---

## State Initialization

**File:** `js/fsm/mainFSM.js`

Ensure `_state.slm` is initialized in `_initializeState()`:

```javascript
slm: {
    page: 1,
    mode: "numeric",
    timeConstant: "F",
    weighting: "R",
    activeMeter: 1,
    viewLayout: "SPL"
}
```

Also ensure state persists when:
- Toggling run/pause
- Navigating pages
- Entering/exiting menus
- Switching modes

---

## Notes & Considerations

### Graph Rendering
- Actual graph rendering is **deferred** to measurement engine phase
- Use placeholders for now
- Structure should be ready for graph integration

### Mode Persistence
- When user cycles softkey 1 on home screen, the mode should persist when entering SLM
- Mode should persist when exiting and re-entering SLM

### Page Persistence
- Page should persist when toggling run/pause
- Page should persist when entering/exiting slm_view_menu
- Page should reset to 1 when exiting SLM completely

### Visual Feedback
- Underlines must move smoothly (CSS transitions if desired)
- Active meter number should be clearly visible
- All softkey states should be visually distinct

### Testing Strategy
- Test each mode independently
- Test page navigation in each mode
- Test softkey cycling and state persistence
- Test edge cases (wrap-around, state persistence)

---

## Success Criteria

Phase 4 is complete when:
- ✅ All 4 tasks implemented and tested
- ✅ Page navigation works in all modes (numeric, 1/1, 1/3)
- ✅ Mode switching works correctly
- ✅ All softkeys function correctly with visual feedback
- ✅ State persists correctly across all transitions
- ✅ No console errors
- ✅ All tests pass in testing guide

---

## Next Steps After Phase 4

- **Phase 5:** Files Menu enhancements
- **Future:** Measurement engine integration (graph rendering)
- **Future:** Actual measurement data display

---

**Document Owner:** Development Team  
**Last Updated:** December 2024  
**Status:** Ready for Implementation





