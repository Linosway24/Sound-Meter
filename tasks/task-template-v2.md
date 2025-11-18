# Task X.X: [Task Title]

> **Template Version:** 2.0  
> **Based on:** Menu-Structure-v2.5.md, FSM-spec-v1.md  
> **Project:** Quest SoundPro SE-DL Simulator (Firmware R.13J)

---

## 1. Task Overview

### Task Title
**Title:** [Task title from task list or PRD]

### Goal Statement
**Goal:** [One paragraph explaining what needs to be achieved and why. Reference Menu-Structure-v2.5.md for screen behavior context and FSM-spec-v1.md for state machine patterns.]

### Phase & Batch
- **Phase:** [Phase number, e.g., Phase 3]
- **Batch:** [Batch number if applicable, e.g., Batch 1]
- **Dependencies:** [List any prerequisite tasks]

---

## 2. Reference Documentation

### Primary References
- **Menu-Structure-v2.5.md** - Screen behavior, button actions, navigation flows
- **FSM-spec-v1.md** - State machine specification (states, events, transitions, guards)
- **PRD.md** - Overall project requirements
- **Firmware R.13J Documentation** - Device behavior reference

### Screen Reference
**Screens Involved:**
- `[screen_id]` - [Description from Menu-Structure-v2.5.md Section X.X]
- `[screen_id]` - [Description from Menu-Structure-v2.5.md Section X.X]

**Reference Images:**
- `Capture/operational/[screen_id].jpeg` - [Visual reference]

---

## 3. Current State Analysis

### What Exists
[Describe current implementation state:]
- [ ] Screen definitions in `data/screen-atlas.json`
- [ ] Navigation handlers in `js/fsm/mainFSM.js`
- [ ] Rendering logic in `js/screen-renderer.js`
- [ ] State management for [specific feature]

### What's Missing
[Describe what needs to be implemented:]
- [ ] [Feature/behavior not yet implemented]
- [ ] [Screen/state not yet defined]
- [ ] [Navigation flow incomplete]

### Known Issues
[Any existing bugs or limitations:]
- [Issue description]

---

## 4. Screen Behavior Specification

### Screen: `[screen_id]`

**Reference:** Menu-Structure-v2.5.md Section [X.X]

**Visual Elements:**
- [List visual elements from Menu-Structure-v2.5.md]
- Title: `[title text]`
- Menu items: `[list items]`
- Softkeys: `[softkey labels]`

**Button Behavior Table:**

| Button         | Action                                                                 |
|----------------|------------------------------------------------------------------------|
| Up / Down      | [Action description from Menu-Structure-v2.5.md]                      |
| Left / Right   | [Action description]                                                    |
| Enter          | [Action description]                                                    |
| Power / ESC    | [Action description]                                                    |
| Run / Pause    | [Action description]                                                    |
| Stop           | [Action description]                                                    |
| Softkey 1      | [Action description]                                                    |
| Softkey 2      | [Action description]                                                    |
| Softkey 3      | [Action description]                                                    |
| Softkey 4      | [Action description]                                                    |

**State Transitions:**
- `[current_state]` → `[next_state]` (via [event/action])
- `[current_state]` → `[next_state]` (via [event/action])

**Navigation Flow:**
```
[Parent Screen] → [This Screen] → [Child Screen]
                  ↓
              [Alternative Path]
```

---

## 5. FSM Implementation Requirements

### State Definitions

**State ID:** `[state_id]`
- **View ID:** `[view_id]` (matches screen-atlas.json)
- **Mode:** `[MENU|EDIT|VIEW|SLM|INFO]`
- **Parent State:** `[parent_state_id]` (if applicable)

**State Properties:**
```javascript
{
    viewId: "[view_id]",
    [property1]: [type/description],
    [property2]: [type/description],
    // ... additional state properties
}
```

### Event Handlers

**Event:** `[EVENT_NAME]`
- **Handler Location:** `js/fsm/mainFSM.js` → `dispatch()` → `case "[EVENT_NAME]":`
- **Conditions:** [When this event is valid]
- **Actions:** 
  1. [Action 1]
  2. [Action 2]
  3. [State transition if applicable]

### Navigation History

**History Management:**
- **Push History:** When entering `[screen_id]` from `[parent_screen]`
- **Pop History:** When exiting `[screen_id]` via ESC
- **History Stack:** `["home_screen_dim", "setup_menu", "[screen_id]"]`

---

## 6. Implementation Plan

### Step 1: Screen Definition
**File:** `data/screen-atlas.json`

**Actions:**
- [ ] Add/update screen definition for `[screen_id]`
- [ ] Define elements array (title, divider, textList, etc.)
- [ ] Set softkeys array
- [ ] Set keys array (supported buttons)
- [ ] Set display properties (backlight, etc.)

**Example:**
```json
{
  "id": "[screen_id]",
  "title": "[Screen Title]",
  "mode": "[MENU|EDIT|VIEW]",
  "referenceImage": "Capture/operational/[screen_id].jpeg",
  "elements": [
    { "type": "title", "id": "screen_title", "text": "[title]" },
    { "type": "divider", "id": "title_rule" },
    {
      "type": "textList",
      "id": "[list_id]",
      "items": [],
      "bind": "[state.path].selectedIndex",
      "dynamicItems": "[state.path].items"
    }
  ],
  "softkeys": ["[label1]", "[label2]", "", ""],
  "keys": ["up", "down", "enter", "esc"],
  "display": { "backlight": true }
}
```

### Step 2: State Management
**File:** `js/fsm/mainFSM.js`

**Actions:**
- [ ] Add menu item constants (if needed)
- [ ] Add state properties to `_state` object
- [ ] Initialize state in `initMainFSM()`
- [ ] Add state reset logic if needed

**Example:**
```javascript
const [MENU_NAME]_MENU_ITEMS = [
    // Menu items array
];

// In _state:
[menuName]: { 
    editing: false, 
    focus: "title", 
    selectedIndex: 0, 
    items: [MENU_NAME]_MENU_ITEMS.map(item => ({ ...item })) 
}
```

### Step 3: Navigation Handlers
**File:** `js/fsm/mainFSM.js`

**Actions:**
- [ ] Add UP handler for `[screen_id]`
- [ ] Add DOWN handler for `[screen_id]`
- [ ] Add ENTER handler for `[screen_id]`
- [ ] Add ESC handler for `[screen_id]`
- [ ] Add LEFT/RIGHT handlers if needed
- [ ] Add softkey handlers if needed

**Pattern:**
```javascript
case "UP":
    if (_state.viewId === "[screen_id]") {
        _state.[menuName].selectedIndex = 
            (_state.[menuName].selectedIndex + [MENU_NAME]_MENU_ITEMS.length - 1) % 
            [MENU_NAME]_MENU_ITEMS.length;
        _state.[menuName].focus = "title";
        console.log(`[MENU] [Menu Name] - Selected index: ${_state.[menuName].selectedIndex}`);
        _emit();
    }
    break;
```

### Step 4: Screen Renderer Updates
**File:** `js/screen-renderer.js`

**Actions:**
- [ ] Verify dynamic items rendering works
- [ ] Add custom rendering logic if needed (e.g., special formatting)
- [ ] Test two-column layout if applicable
- [ ] Verify value display format matches device

**Notes:**
- Screen renderer should automatically handle items with `dynamicItems` property
- Custom formatting may be needed for special cases (e.g., bar graphs, toggle states)

### Step 5: Integration & Testing
**Files:** All modified files

**Actions:**
- [ ] Test navigation flow from parent screen
- [ ] Test UP/DOWN navigation within menu
- [ ] Test ENTER behavior (edit mode, submenu routing, etc.)
- [ ] Test ESC returns to parent correctly
- [ ] Verify history stack management
- [ ] Test edge cases (wrap-around, empty states, etc.)

---

## 7. Success Criteria

### Functional Requirements
- [ ] Screen displays correctly with all visual elements
- [ ] UP/DOWN navigation works and wraps correctly
- [ ] ENTER behavior matches Menu-Structure-v2.5.md specification
- [ ] ESC returns to parent screen correctly
- [ ] History stack is managed correctly
- [ ] State persists correctly during navigation
- [ ] All button behaviors match device specification

### Non-Functional Requirements
- [ ] No console errors
- [ ] Performance is acceptable (no lag, instant rendering)
- [ ] Code follows project patterns (modular, commented)
- [ ] Matches firmware R.13J behavior exactly

### Testing Checklist
- [ ] Manual navigation test (UP/DOWN/ENTER/ESC)
- [ ] State verification via `window.getMainFSMState()`
- [ ] History stack verification
- [ ] Visual rendering matches reference image
- [ ] Edge cases handled (wrap-around, empty states)

---

## 8. Files to Modify

### Core Files
- `data/screen-atlas.json` - Screen definitions
- `js/fsm/mainFSM.js` - State machine and navigation handlers
- `js/screen-renderer.js` - Screen rendering (if custom logic needed)
- `css/styles.css` - Styling (if new styles needed)

### Testing Files
- `tasks/PHASE-[X]-[BATCH]-TESTING-GUIDE.md` - Testing guide (create/update)

### Documentation Files
- `tasks/Menu-Structure-v2.5.md` - Reference (read-only)
- `tasks/FSM-spec-v1.md` - Reference (read-only)

---

## 9. Implementation Notes

### Patterns to Follow

**Navigation Pattern:**
```javascript
// Entering submenu:
_pushHistory("[parent_screen]");
_state.viewId = "[screen_id]";
_state.[menuName].selectedIndex = 0;
_state.[menuName].focus = "title";
_state.[menuName].editing = false;
_emit();
```

**Exiting Submenu:**
```javascript
// ESC handler:
const previousView = _popHistory() || "[parent_screen]";
_state.viewId = previousView;
_state.[menuName].selectedIndex = 0;
_emit();
```

**Edit Mode Pattern:**
```javascript
// Entering edit mode:
_state.[menuName].editing = true;
_state.[menuName].focus = "value"; // or "title" depending on context
_emit();

// Exiting edit mode:
_state.[menuName].editing = false;
_state.[menuName].focus = "title";
_emit();
```

### Special Considerations
- [ ] Handle wrap-around navigation correctly
- [ ] Preserve state when navigating away and back
- [ ] Match exact button behavior from Menu-Structure-v2.5.md
- [ ] Use correct screen IDs matching reference images
- [ ] Follow existing code style and patterns

---

## 10. Testing Guide

### Test Cases

**Test 1: Navigation to Screen**
- Navigate from `[parent_screen]` to `[screen_id]`
- Verify `window.getMainFSMState().viewId === "[screen_id]"`
- Verify history contains `[parent_screen]`
- Verify `selectedIndex === 0`

**Test 2: UP/DOWN Navigation**
- Press DOWN arrow key
- Verify `selectedIndex` increments correctly
- Press UP arrow key
- Verify `selectedIndex` decrements correctly
- Test wrap-around (from last to first, first to last)

**Test 3: ENTER Behavior**
- Select item at index `[N]`
- Press ENTER
- Verify expected behavior (edit mode, submenu routing, toggle, etc.)

**Test 4: ESC Navigation**
- Press ESC
- Verify returns to `[parent_screen]`
- Verify history is popped correctly
- Verify state is reset appropriately

**Test 5: State Persistence**
- Navigate to screen
- Change selection
- Navigate away
- Navigate back
- Verify state is preserved/reset as expected

### Console Verification Commands
```javascript
// Check current view
window.getMainFSMState().viewId

// Check selected index
window.getMainFSMState().[menuName].selectedIndex

// Check history stack
window.getMainFSMState().history

// Check editing state
window.getMainFSMState().[menuName].editing

// Check focus
window.getMainFSMState().[menuName].focus
```

---

## 11. Known Limitations & Future Work

### Current Limitations
- [ ] [Feature not yet implemented - will be in future task]
- [ ] [Behavior simplified - full implementation in Phase X]

### Future Enhancements
- [ ] [Enhancement planned for Phase X]
- [ ] [Additional feature from Menu-Structure-v2.5.md not yet implemented]

---

## 12. Revision History

| Date       | Version | Changes                                    |
|------------|---------|--------------------------------------------|
| [Date]     | 1.0     | Initial task creation                      |
| [Date]     | 1.1     | [Update description]                       |

---

## 13. AI Agent Instructions

### Implementation Workflow

1. **Read Context:**
   - Review Menu-Structure-v2.5.md Section [X.X] for screen behavior
   - Review FSM-spec-v1.md for state machine patterns
   - Review existing similar implementations (e.g., `measure_menu`, `display_menu`)
   - Check `data/screen-atlas.json` for existing screen definitions

2. **Implement Sequentially:**
   - Follow Steps 1-5 in Implementation Plan section
   - Test after each step
   - Update checkboxes as work completes

3. **Code Quality:**
   - Use existing patterns from similar screens
   - Add console.log statements for debugging (can be removed later)
   - Follow project code style (2-space indent, ES6 modules)
   - Comment complex logic

4. **Testing:**
   - Test all button behaviors match Menu-Structure-v2.5.md
   - Verify state transitions match FSM-spec-v1.md
   - Test edge cases (wrap-around, empty states)
   - Verify no console errors

5. **Documentation:**
   - Update testing guide if creating new screens
   - Document any deviations from specification (should be none)
   - Update implementation notes

### Communication Preferences
- Show actual code implementations, not just descriptions
- Reference specific line numbers when modifying existing code
- Use code references format: ````startLine:endLine:filepath`
- Report any ambiguities in Menu-Structure-v2.5.md or FSM-spec-v1.md

---

**Ready to Implement?**

This task implements [Task Title] following Menu-Structure-v2.5.md specifications and FSM-spec-v1.md patterns.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** [Current Date]  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

