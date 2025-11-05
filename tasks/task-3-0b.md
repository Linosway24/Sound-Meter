# AI Task Planning - Task 3.0B: Menu System Implementation

> **Prerequisites:** Task 3.0A must be completed and menu structure document approved before this task begins.

## 1. Task Overview

### Task Title
**Title:** Menu System Implementation

### Goal Statement
**Goal:** Implement the complete menu system in code based on the reviewed and approved menu structure document from Task 3.0A. This task builds upon the core interaction system from Task 2.0 to create a fully functional menu structure matching firmware R.13J specifications. The menu system includes main menu navigation, sub-menu hierarchies, soft key label mapping, Alt f alternate menu functionality, and dialog/warning screen system. All implementation uses the verified menu structure document from Task 3.0A as the source of truth. This menu system is the foundation for accessing configuration settings (Task 4.0), measurement controls (Task 5.0), and all device features.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, event delegation, state machine pattern

### Current State
- Task 1.0 completed - HTML structure with device photo, LCD overlay, and all button elements exist in `index.html`
- Task 2.0 completed - Core interaction system implemented:
  - `js/device.js` - Device state management (power on/off, initialization)
  - `js/display.js` - Display state management (device on/off, backlight, screen context)
  - `js/buttons.js` - Button event handlers with short/long press detection, keyboard input
  - `js/menu.js` - Navigation state machine structure (placeholder functions only)
- **Task 3.0A completed** - Menu structure document (`tasks/menu-structure-review.json` or `.md`) reviewed and approved by user
- Button handlers connected to state machine but menu navigation not implemented
- Dialog overlay HTML structure exists in `index.html` but not functional
- Soft key labels not displayed on LCD
- Menu items not rendered on LCD display
- No menu data structure in code yet (will be created from reviewed document)

---

## 3. Context & Problem Definition

### Problem Statement
The core interaction system from Task 2.0 provides button handling and state management, but there is no menu system to navigate device functions. Users cannot access configuration settings, measurement controls, or any device features beyond power on/off. Task 3.0A has created and verified the menu structure document against the physical device. Now this task implements that verified menu structure in code.

The PRD requires:
1. Main menu structure matching firmware R.13J (implemented from reviewed document)
2. Hierarchical sub-menu navigation following firmware menu tree (from reviewed document)
3. Soft key label system (labels 1-4) that updates based on screen context (from reviewed document)
4. Alt f alternate menu functionality revealing additional soft-key options (from reviewed document)
5. Dialog/warning screen system for prompts, confirmations, and error messages (from reviewed document)
6. Exact menu structures and dialog text from reviewed menu structure document

Without this menu system, users cannot access configuration (Task 4.0), start measurements (Task 5.0), or interact with any device features. This task establishes the navigation foundation for all device functionality.

### Success Criteria
- [ ] 3.0B.1: Load reviewed menu structure document from Task 3.0A
- [ ] 3.0B.2: Create menu data structure in `js/menu.js` matching reviewed document exactly
- [ ] 3.0B.3: Implement menu navigation state machine with current menu, selected item, and navigation history
- [ ] 3.0B.4: Build menu rendering function to display menu items on LCD
- [ ] 3.0B.5: Implement sub-menu navigation with hierarchical menu tree from reviewed structure
- [ ] 3.0B.6: Create soft key label system that updates labels (1-4) based on current screen context
- [ ] 3.0B.7: Map soft key labels to menu actions for each screen using reviewed mappings
- [ ] 3.0B.8: Implement Alt f alternate menu functionality using reviewed Alt f mappings
- [ ] 3.0B.9: Create dialog/warning screen system using existing dialog overlay structure
- [ ] 3.0B.10: Implement dialog display functions using reviewed dialog text
- [ ] 3.0B.11: Connect button handlers to menu navigation and actions
- [ ] 3.0B.12: Test menu navigation flow matches reviewed menu structure and firmware R.13J behavior

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New development - building Quest SoundPro SE-DL simulation
- **Breaking Changes:** Acceptable - building menu system on existing state machine foundation
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High stability - must match firmware R.13J behavior exactly

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements 13-18:**

1. **Main Menu Structure:** Implement main menu structure from reviewed menu structure document
2. **Sub-Menu Navigation:** Implement sub-menus with hierarchical navigation from reviewed document
3. **Soft Key Label System:** Implement soft key label system using reviewed mappings
4. **Alt f Functionality:** Implement Alt f alternate menu functionality using reviewed mappings
5. **Dialog/Warning System:** Implement dialog system using reviewed dialog text
6. **Menu Rendering:** Display menu items on LCD display using DOM-based rendering (not Canvas)
7. **Navigation Feedback:** Provide clear visual feedback for selected menu items during navigation
8. **Keyboard Navigation:** Support keyboard navigation (Arrow keys, Enter, Esc) through menu system matching mouse interaction
9. **Screen Context Tracking:** Track current screen context (home, menu, settings, measurement, dialog) for proper soft key label mapping

### Non-Functional Requirements
- **Performance:** Efficient menu rendering, no layout shifts during navigation
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** All menu navigation must match firmware R.13J behavior exactly
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Accessibility:** Keyboard navigation must match mouse interaction functionality

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas) for menu display
- Must match reviewed menu structure document exactly
- All code must be maintainable ES6 JavaScript
- Menu data structure must match reviewed document format

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**Menu Data Structure (in `js/menu.js` - created from reviewed document):**
```javascript
{
  id: string,                    // Menu ID from reviewed document
  title: string,                 // Menu title from reviewed document
  items: [                       // Menu items from reviewed document
    {
      id: string,                // Item ID from reviewed document
      label: string,              // Label from reviewed document
      action: string | function,  // Action type or handler function
      subMenu: string | null,     // Sub-menu ID from reviewed document
      softKey: number | null,    // Soft key number from reviewed document
      altSoftKey: number | null  // Alt f soft key number from reviewed document
    }
  ],
  parentMenu: string | null,     // Parent menu ID from reviewed document
  softKeys: {                    // Soft key labels from reviewed document
    1: string | null,
    2: string | null,
    3: string | null,
    4: string | null
  },
  altSoftKeys: {                 // Alt f soft key labels from reviewed document
    1: string | null,
    2: string | null,
    3: string | null,
    4: string | null
  }
}
```

**Menu Navigation State (enhanced from Task 2.0):**
```javascript
{
  currentMenu: string,           // Current menu ID
  menuHistory: string[],         // Stack of menu IDs for back navigation
  selectedItem: number,          // Currently selected menu item index
  altMenuActive: boolean,        // Whether Alt f alternate menu is active
  menuData: Object               // Complete menu data structure from reviewed document
}
```

**Dialog State Object:**
```javascript
{
  visible: boolean,
  type: 'prompt' | 'confirmation' | 'warning' | 'error',
  title: string,                  // From reviewed document
  message: string,                // From reviewed document
  buttons: Array<{label: string, action: function}>, // From reviewed document
  onConfirm: function | null,
  onCancel: function | null
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

- **Menu Data Structure (in `js/menu.js`):** Complete menu hierarchy from reviewed document
  - Main menu items and sub-menus from reviewed document
  - Menu item actions and navigation targets from reviewed document
  - Soft key label mappings from reviewed document
  - Alt f alternate soft key mappings from reviewed document

- **Menu Rendering Functions (in `js/menu.js`):**
  - `renderMenu()` - Display menu items on LCD with selected item highlighting
  - `updateSoftKeyLabels()` - Update soft key labels on LCD based on current menu
  - `renderMenuTitle()` - Display menu title/header on LCD
  - `highlightSelectedItem()` - Visual feedback for selected menu item

- **Menu Navigation Functions (enhance existing in `js/menu.js`):**
  - `navigateToMenu(menuId)` - Navigate to specific menu by ID from reviewed document
  - `navigateToSubMenu(itemId)` - Navigate to sub-menu from menu item
  - `selectMenuItem(index)` - Select menu item by index
  - `executeMenuItemAction(itemId)` - Execute action associated with menu item
  - `toggleAltMenu()` - Toggle Alt f alternate menu display

- **Dialog System Functions (in `js/menu.js` or new `js/dialog.js`):**
  - `showDialog(dialogConfig)` - Display dialog overlay with configuration from reviewed document
  - `hideDialog()` - Hide dialog overlay
  - `showWarning(message, onConfirm)` - Display warning dialog using reviewed text
  - `showConfirmation(message, onConfirm, onCancel)` - Display confirmation dialog using reviewed text
  - `showPrompt(message, onConfirm, onCancel)` - Display prompt dialog using reviewed text
  - `showError(message, onConfirm)` - Display error dialog using reviewed text

- **Soft Key Handler Integration (in `js/buttons.js`):**
  - Map soft key presses to menu actions based on reviewed mappings
  - Execute menu item actions when soft keys are pressed
  - Handle Alt f button press to toggle alternate menu

### Page Updates

- `js/menu.js` - Complete implementation using reviewed menu structure
  - Load menu data structure from reviewed document
  - Implement menu rendering functions
  - Enhance navigation state machine with menu-specific logic
  - Add soft key label management using reviewed mappings
  - Add Alt f alternate menu functionality using reviewed mappings
  - Add dialog system functions using reviewed dialog text

- `js/display.js` - Add menu rendering support
  - Functions to update LCD content with menu items
  - Functions to display soft key labels
  - Functions to highlight selected menu item

- `js/buttons.js` - Enhance soft key handlers
  - Connect soft key presses to menu actions using reviewed mappings
  - Add Alt f button handler for alternate menu toggle
  - Route menu navigation buttons (Up/Down/Enter) to menu navigation

- `index.html` - May need updates to dialog overlay structure if requirements change

- `css/styles.css` - Add menu display styles
  - Menu item list styling
  - Selected item highlighting
  - Soft key label display styling
  - Menu title/header styling
  - Dialog overlay styling enhancements

### State Management

- **Menu State:** Managed in `menu.js`, extends navigation state from Task 2.0, uses reviewed menu structure
- **Dialog State:** Managed in `menu.js` or separate `dialog.js` module, uses reviewed dialog text
- **Display Updates:** Menu navigation triggers LCD content updates via `display.js`
- **Soft Key Labels:** Updated when menu changes or Alt f is toggled, using reviewed mappings
- **State Persistence:** In-memory only, no localStorage or external storage

---

## 9. Implementation Plan

### Phase 1: Menu Data Structure Creation (3.0B.1-3.0B.2)

1. **3.0B.1** Load reviewed menu structure document from Task 3.0A
   - Read `tasks/menu-structure-review.json` or `.md` file
   - Parse menu structure data
   - Validate structure matches expected format
   - Store menu structure data for use in implementation

2. **3.0B.2** Create menu data structure in `js/menu.js` matching reviewed document exactly
   - Convert reviewed menu structure to JavaScript menu data structure
   - Create main menu object with all top-level items from reviewed document
   - Create sub-menu objects for each sub-menu from reviewed document
   - Map menu items to actions (navigation, configuration, measurement, etc.)
   - Add menu item IDs and labels exactly as in reviewed document
   - Structure menus hierarchically with parent-child relationships from reviewed document
   - Ensure structure matches reviewed document exactly (no deviations)

### Phase 2: Menu Navigation State Machine (3.0B.3-3.0B.5)

3. **3.0B.3** Implement menu navigation state machine with current menu, selected item, and navigation history
   - Enhance existing navigation state in `menu.js`
   - Add current menu tracking using menu IDs from reviewed document
   - Add selected item index tracking
   - Implement navigation history stack
   - Add menu state getter/setter functions
   - Connect navigation to display state updates

4. **3.0B.4** Build menu rendering function to display menu items on LCD
   - Create `renderMenu()` function that displays menu items from reviewed structure
   - Display menu title/header on LCD from reviewed document
   - Render menu items as list with selected item highlighted
   - Handle menu item scrolling if more items than visible
   - Update LCD content via `display.js` functions
   - Style menu display to match firmware appearance

5. **3.0B.5** Implement sub-menu navigation with hierarchical menu tree from reviewed structure
   - Implement `navigateToSubMenu()` function using reviewed menu structure
   - Handle parent menu tracking for back navigation from reviewed document
   - Update navigation history when entering sub-menu
   - Render sub-menu items when navigated to using reviewed structure
   - Ensure back button returns to parent menu correctly based on reviewed hierarchy

### Phase 3: Soft Key Label System (3.0B.6-3.0B.7)

6. **3.0B.6** Create soft key label system that updates labels (1-4) based on current screen context
   - Use soft key label data from reviewed menu structure document
   - Create `updateSoftKeyLabels()` function
   - Display soft key labels on LCD bottom area (soft key label region)
   - Update labels when menu changes using reviewed mappings
   - Update labels when screen context changes (home, menu, measurement, etc.)
   - Handle empty/null labels (some menus may not use all soft keys) as in reviewed document

7. **3.0B.7** Map soft key labels to menu actions for each screen using reviewed mappings
   - Use soft key mappings from reviewed document
   - Map soft key presses to menu item actions using reviewed mappings
   - Handle soft key presses in `buttons.js` to execute menu actions
   - Map soft keys differently for different screen contexts using reviewed mappings:
     - Home screen: Quick access actions from reviewed document
     - Menu screen: Menu item selection from reviewed document
     - Settings screen: Configuration actions from reviewed document
     - Measurement screen: Measurement controls from reviewed document
   - Ensure soft key actions match reviewed mappings exactly

### Phase 4: Alt f Alternate Menu (3.0B.8)

8. **3.0B.8** Implement Alt f alternate menu functionality using reviewed Alt f mappings
   - Use `altSoftKeys` data from reviewed menu structure document
   - Create `toggleAltMenu()` function
   - Track Alt f state (normal vs alternate menu active)
   - Switch soft key labels when Alt f is pressed using reviewed alternate mappings
   - Switch back to normal soft keys when Alt f pressed again
   - Ensure Alt f behavior matches reviewed document exactly

### Phase 5: Dialog/Warning System (3.0B.9-3.0B.10)

9. **3.0B.9** Create dialog/warning screen system using existing dialog overlay structure
   - Use existing dialog overlay HTML from `index.html`
   - Create dialog state management
   - Create `showDialog()` function with configuration options
   - Create `hideDialog()` function
   - Style dialog overlay to match firmware appearance
   - Make dialog modal (blocks interaction with device when visible)

10. **3.0B.10** Implement dialog display functions using reviewed dialog text
    - Use dialog text from reviewed menu structure document
    - Create `showWarning(message, onConfirm)` function using reviewed warning text
    - Create `showConfirmation(message, onConfirm, onCancel)` function using reviewed confirmation text
    - Create `showPrompt(message, onConfirm, onCancel)` function using reviewed prompt text
    - Create `showError(message, onConfirm)` function using reviewed error text
    - Use exact dialog text from reviewed document (no modifications)
    - Connect dialog buttons to action handlers
    - Ensure dialog behavior matches firmware exactly

### Phase 6: Integration & Testing (3.0B.11-3.0B.12)

11. **3.0B.11** Connect button handlers to menu navigation and actions
    - Connect soft key handlers in `buttons.js` to menu actions using reviewed mappings
    - Connect navigation buttons (Up/Down/Enter) to menu navigation
    - Connect Alt f button to alternate menu toggle
    - Ensure all button actions match reviewed menu structure
    - Test button handlers trigger correct menu actions

12. **3.0B.12** Test menu navigation flow matches reviewed menu structure and firmware R.13J behavior
    - Test main menu navigation matches reviewed structure
    - Test sub-menu navigation matches reviewed structure
    - Test back button navigation through menu history
    - Test soft key label updates on menu changes match reviewed mappings
    - Test Alt f alternate menu toggle matches reviewed mappings
    - Test dialog display and interaction using reviewed dialog text
    - Test keyboard navigation matches mouse navigation
    - Verify all menu structures match reviewed document exactly
    - Test edge cases (empty menus, single-item menus, deep navigation)

### Implementation Notes
- **CRITICAL: Use reviewed menu structure document as source of truth** - no deviations
- Load menu structure from reviewed document at runtime or convert to JavaScript data structure
- Test each phase before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses
- Reference reviewed menu structure document for exact menu structure
- Ensure menu navigation feels responsive and matches real device
- Console log menu navigation for debugging: `[MENU] Navigated to: [menuId]`, `[MENU] Selected item: [index]`

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (3.0B.1-3.0B.12) is completed
- Mark parent task 3.0B complete when all sub-tasks are done
- Test functionality matches reviewed menu structure document
- Verify all requirements from PRD.md are met
- Test menu navigation with both mouse and keyboard
- Verify soft key labels update correctly using reviewed mappings
- Test Alt f alternate menu functionality using reviewed mappings
- Verify dialog system works correctly using reviewed dialog text

---

## 10.5. Testing & Debugging Guide

### How to Test Task 3.0B Success

**🎯 Success Indicators:**
1. ✅ Main menu displays on LCD when device is powered on (matches reviewed structure)
2. ✅ Navigation buttons (Up/Down) move selection highlight through menu items
3. ✅ Enter button selects menu item and navigates to sub-menu or executes action (matches reviewed structure)
4. ✅ Back button (Esc/Power short press) returns to previous menu (matches reviewed hierarchy)
5. ✅ Soft key labels (1-4) display on LCD bottom and update based on current menu (matches reviewed mappings)
6. ✅ Soft key buttons execute corresponding menu actions (matches reviewed mappings)
7. ✅ Alt f button toggles alternate soft key labels (matches reviewed Alt f mappings)
8. ✅ Dialog overlays display for warnings, confirmations, and prompts (using reviewed dialog text)
9. ✅ Dialog buttons (OK, Cancel) execute correct actions
10. ✅ Menu structure matches reviewed menu structure document exactly

### Visual Debugging Features

**The implementation MUST include:**

1. **Console Logging (Always Active):**
   ```javascript
   // Example console output format:
   // [MENU] Navigated to: main
   // [MENU] Selected item: 0
   // [MENU] Executing action: navigateToSubMenu('settings')
   // [MENU] Soft key labels updated: {1: 'Select', 2: 'Back', 3: null, 4: null}
   // [MENU] Alt f toggled: alternate menu active
   // [DIALOG] Showing warning: "Measurement in progress"
   ```

2. **Menu Item Highlighting:**
   - Selected menu item must be visually distinct (different background color, underline, or highlight)
   - Highlight must move smoothly when navigating with Up/Down buttons
   - Highlight must wrap at top/bottom of menu list (or not wrap, match firmware)

3. **Soft Key Label Display:**
   - Labels must appear in LCD soft key label area (bottom of LCD)
   - Labels must update immediately when menu changes
   - Empty labels should not display or show as blank

### Testing Checklist

**Menu Navigation Testing:**
- [ ] **Main Menu Display:** Power on device → Main menu displays on LCD (matches reviewed structure)
- [ ] **Up/Down Navigation:** Press Up/Down arrows → Selection highlight moves through menu items
- [ ] **Enter Selection:** Press Enter on menu item → Navigates to sub-menu or executes action (matches reviewed structure)
- [ ] **Back Navigation:** Press Esc/Power short press → Returns to previous menu (matches reviewed hierarchy)
- [ ] **Menu History:** Navigate through multiple menus → Back button returns through history correctly
- [ ] **Menu Structure:** All menus and items match reviewed document exactly

**Soft Key Testing:**
- [ ] **Label Display:** Menu displayed → Soft key labels (1-4) appear on LCD bottom (matches reviewed mappings)
- [ ] **Label Updates:** Navigate to different menu → Soft key labels update to match new menu (matches reviewed mappings)
- [ ] **Soft Key Actions:** Press soft key button → Executes corresponding menu action (matches reviewed mappings)
- [ ] **Empty Labels:** Menu with fewer than 4 soft keys → Unused labels don't display (as in reviewed document)

**Alt f Testing:**
- [ ] **Alt f Toggle:** Press Alt f button → Soft key labels switch to alternate set (matches reviewed Alt f mappings)
- [ ] **Alt f Toggle Back:** Press Alt f again → Soft key labels return to normal set
- [ ] **Alt f Menus:** Only menus with Alt f functionality toggle (matches reviewed document)

**Dialog Testing:**
- [ ] **Warning Dialog:** Trigger warning → Dialog overlay displays with warning message (matches reviewed text)
- [ ] **Confirmation Dialog:** Trigger confirmation → Dialog displays with OK/Cancel buttons (matches reviewed text)
- [ ] **Dialog Interaction:** Click OK/Cancel → Dialog closes and executes action
- [ ] **Dialog Modal:** Dialog visible → Device buttons blocked (except dialog buttons)
- [ ] **Dialog Text:** Dialog messages match reviewed document text exactly

**Keyboard Navigation Testing:**
- [ ] **Arrow Keys:** Press ArrowUp/Down → Menu selection moves (same as mouse)
- [ ] **Enter Key:** Press Enter → Selects menu item (same as mouse click)
- [ ] **Esc Key:** Press Escape → Goes back (same as Power short press)

### Manual Testing Steps

**Step 1: Main Menu Test**
1. Power on device (long press power button)
2. ✅ Main menu should display on LCD (matches reviewed structure)
3. ✅ Menu items should be visible with first item selected/highlighted
4. ✅ Soft key labels should appear at bottom of LCD (matches reviewed mappings)

**Step 2: Menu Navigation Test**
1. Device showing main menu
2. Press Down arrow → ✅ Selection highlight moves to next item
3. Press Up arrow → ✅ Selection highlight moves to previous item
4. Press Enter on menu item → ✅ Navigates to sub-menu or executes action (matches reviewed structure)

**Step 3: Soft Key Test**
1. Device showing menu with soft key labels (from reviewed mappings)
2. Press Soft Key 1 button → ✅ Executes action labeled on Soft Key 1 (matches reviewed mapping)
3. Navigate to different menu → ✅ Soft key labels update (matches reviewed mappings)
4. Press Soft Key 2 button → ✅ Executes new action for Soft Key 2 (matches reviewed mapping)

**Step 4: Alt f Test**
1. Device showing menu
2. Press Alt f button → ✅ Soft key labels change to alternate set (matches reviewed Alt f mappings)
3. Press Alt f again → ✅ Soft key labels return to normal set

**Step 5: Dialog Test**
1. Trigger action that shows warning (using reviewed dialog text)
2. ✅ Dialog overlay appears with warning message (matches reviewed text)
3. ✅ Dialog has OK button (and Cancel if confirmation)
4. Click OK → ✅ Dialog closes and action executes

### Expected Console Output Example

```
[BUTTON] Power: LONG PRESS (823ms) - Power ON
[STATE] Device powered ON
[MENU] Loading menu structure from reviewed document
[MENU] Navigated to: main
[MENU] Rendering menu: main
[MENU] Soft key labels updated: {1: 'Select', 2: 'Back', 3: null, 4: null}
[BUTTON] Down: SHORT PRESS
[MENU] Selected item: 1
[BUTTON] Enter: SHORT PRESS
[MENU] Executing action: navigateToSubMenu('settings')
[MENU] Navigated to: settings
[MENU] Soft key labels updated: {1: 'Edit', 2: 'Back', 3: 'Save', 4: null}
[BUTTON] Alt f: SHORT PRESS
[MENU] Alt f toggled: alternate menu active
[MENU] Soft key labels updated: {1: 'Reset', 2: 'Back', 3: 'Default', 4: null}
[DIALOG] Showing warning: "Are you sure you want to reset settings?"
[BUTTON] Soft Key 1: SHORT PRESS
[DIALOG] Confirmed: reset settings
[MENU] Settings reset
```

### Troubleshooting

**If menu doesn't display:**
1. Check browser console for JavaScript errors
2. Verify menu structure is loaded from reviewed document correctly
3. Check LCD rendering functions are called
4. Verify device is powered on

**If menu structure doesn't match reviewed document:**
1. Verify menu structure is loaded correctly from reviewed document
2. Check menu data structure matches reviewed document format
3. Verify menu IDs and labels match reviewed document exactly

**If soft key labels don't match reviewed mappings:**
1. Check console for soft key label update logs
2. Verify soft key label data from reviewed document is used correctly
3. Check LCD soft key label area is being updated
4. Verify screen context is tracked correctly

**If Alt f doesn't match reviewed mappings:**
1. Check Alt f button handler is connected
2. Verify alternate soft key data from reviewed document is used correctly
3. Check Alt f state is being tracked
4. Test Alt f toggle function directly

**If dialogs don't match reviewed text:**
1. Verify dialog text is loaded from reviewed document
2. Check dialog show/hide functions use reviewed text
3. Verify dialog text matches reviewed document exactly

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `js/menu.js` - Complete implementation using reviewed menu structure
  - Load menu data structure from reviewed document
  - Implement menu rendering functions
  - Enhance navigation state machine with menu-specific logic
  - Add soft key label management using reviewed mappings
  - Add Alt f functionality using reviewed mappings
  - Add dialog system functions using reviewed dialog text

- `js/display.js` - Add menu rendering support
  - Functions to render menu items on LCD
  - Functions to display soft key labels
  - Functions to highlight selected menu item

- `js/buttons.js` - Enhance soft key handlers
  - Connect soft key presses to menu actions using reviewed mappings
  - Add Alt f button handler
  - Route navigation buttons to menu navigation

- `css/styles.css` - Add menu display styles
  - Menu item list styling
  - Selected item highlighting
  - Soft key label display styling
  - Menu title/header styling
  - Dialog overlay styling enhancements

**Files to Reference:**
- `tasks/menu-structure-review.json` or `tasks/menu-structure-review.md` - **REVIEWED MENU STRUCTURE DOCUMENT (SOURCE OF TRUTH)**
- `PRD.md` - Requirements reference (Requirements 13-18)
- `assets/Quest Sound Meter.png` - Device background image
- `tasks/task-2-0.md` - Reference for navigation state machine structure
- `tasks/task-3-0a.md` - Reference for menu structure extraction process
- `index.html` - Reference for dialog overlay HTML structure

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements (Requirements 13-18)
   - **Review `tasks/menu-structure-review.json` or `.md` from Task 3.0A** - THIS IS THE SOURCE OF TRUTH
   - Understand current codebase state (Task 2.0 complete, Task 3.0A complete)
   - Check `js/menu.js` for existing navigation state machine structure
   - Review `index.html` for dialog overlay structure
   - Understand button handler system from Task 2.0

2. **Load Reviewed Menu Structure:**
   - Read menu structure document from Task 3.0A
   - Parse menu structure data
   - Validate structure matches expected format
   - **CRITICAL: Use reviewed document as source of truth - no deviations**

3. **Implement Sub-tasks Sequentially:**
   - Implement 3.0B.1: Load reviewed menu structure document
   - Implement 3.0B.2: Create menu data structure matching reviewed document exactly
   - Implement 3.0B.3: Implement menu navigation state machine
   - Implement 3.0B.4: Build menu rendering function
   - Implement 3.0B.5: Implement sub-menu navigation using reviewed structure
   - Implement 3.0B.6: Create soft key label system using reviewed mappings
   - Implement 3.0B.7: Map soft key labels to menu actions using reviewed mappings
   - Implement 3.0B.8: Implement Alt f alternate menu using reviewed mappings
   - Implement 3.0B.9: Create dialog/warning screen system
   - Implement 3.0B.10: Implement dialog display functions using reviewed dialog text
   - Implement 3.0B.11: Connect button handlers to menu navigation
   - Implement 3.0B.12: Test menu navigation matches reviewed structure

4. **Testing & Debugging (CRITICAL):**
   - **MUST implement console logging** for all menu navigation: `[MENU] Navigated to: [menuId]`
   - **MUST implement console logging** for soft key label updates: `[MENU] Soft key labels updated: {...}`
   - **MUST implement console logging** for dialog display: `[DIALOG] Showing warning: "..."`
   - Test menu navigation with mouse clicks
   - Test menu navigation with keyboard (Arrow keys, Enter, Esc)
   - Verify soft key labels match reviewed mappings exactly
   - Test Alt f toggle functionality matches reviewed mappings
   - Test dialog display and interaction using reviewed dialog text
   - Verify all menu structures match reviewed document exactly
   - Test each feature matches firmware R.13J behavior
   - Follow testing checklist in Section 10.5
   - Update task checkboxes as work completes

5. **Documentation:**
   - Document menu data structure format
   - Document how menu structure is loaded from reviewed document
   - Document soft key label mapping system
   - Document Alt f alternate menu behavior
   - Document dialog system usage
   - Comment complex menu navigation logic
   - Document any deviations from reviewed document (should be none)

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Reference reviewed menu structure document frequently
- Report any issues or ambiguities in reviewed document
- Show menu data structure clearly
- Demonstrate menu rendering approach

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern (IIFE with window exports)
- Comment complex menu navigation logic
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match reviewed menu structure document exactly
- Menu data structure should match reviewed document format
- Use descriptive variable names for menu items and actions

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Menu system enhances existing navigation state machine from Task 2.0 - no breaking changes
- Soft key handlers will now execute menu actions from reviewed mappings instead of placeholder functions
- Dialog system uses existing HTML structure - no breaking changes

**Performance Concerns:**
- Menu rendering should be efficient - only update changed elements
- Soft key label updates should not cause layout shifts
- Dialog overlay should not impact performance when hidden

**User Workflow Impacts:**
- Users can now navigate device menus (previously impossible)
- Users can access configuration settings (Task 4.0 will use menu system)
- Users can access measurement controls (Task 5.0 will use menu system)
- Menu navigation must feel responsive and match real device

**Future Dependencies:**
- Task 4.0 (Configuration & Settings) depends on menu system for accessing settings
- Task 4.0 depends on soft key label system for configuration actions
- Task 5.0 (Measurement Engine) depends on menu system for measurement controls
- Task 6.0 (Display Behavior) depends on menu rendering for LCD content updates
- All future tasks depend on menu navigation for accessing device features

**Risk Mitigation:**
- Use reviewed menu structure document as source of truth (prevents errors)
- Test menu navigation thoroughly before moving to configuration features
- Verify soft key labels match reviewed mappings exactly
- Test Alt f functionality matches reviewed mappings
- Ensure dialog system uses reviewed dialog text exactly
- Test edge cases (empty menus, single-item menus, deep navigation)

---

**Ready to Implement?**
This task implements Menu System Implementation in code. **CRITICAL: Task 3.0A must be completed and menu structure document must be reviewed and approved before this task begins.** Use the reviewed menu structure document (`tasks/menu-structure-review.json` or `.md`) as the source of truth for all implementation. No deviations from reviewed document are allowed.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

