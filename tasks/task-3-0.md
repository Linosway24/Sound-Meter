# AI Task Planning - Task 3.0: Menu System Implementation

> **How to Use This Template:**
> 1. Specify your task list file: `tasks-PRD.md` (e.g., `tasks-PRD.md`, `my-tasks.md`, etc.)
> 2. Open `tasks-PRD.md` and find the task you want to implement (e.g., 2.0, 3.0, etc.)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-3-0.md` (e.g., `task-3-0.md`)

## 1. Task Overview

### Task Title
**Title:** Menu System Implementation

### Goal Statement
**Goal:** Implement the complete menu system that enables hierarchical navigation through all device functions, configuration settings, and features. This task builds upon the core interaction system from Task 2.0 to create a fully functional menu structure matching firmware R.13J specifications. The menu system must include main menu navigation, sub-menu hierarchies, soft key label mapping, Alt f alternate menu functionality, and dialog/warning screen system. All menu structures, dialog text, and navigation paths must be extracted from firmware R.13J documentation to ensure 100% accuracy. This menu system is the foundation for accessing configuration settings (Task 4.0), measurement controls (Task 5.0), and all device features.

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
- Button handlers connected to state machine but menu navigation not implemented
- Dialog overlay HTML structure exists in `index.html` but not functional
- Soft key labels not displayed on LCD
- Menu items not rendered on LCD display
- No menu data structure - menus need to be extracted from firmware documentation
- No soft key label mapping system
- No Alt f alternate menu functionality
- No dialog/warning screen display functions

---

## 3. Context & Problem Definition

### Problem Statement
The core interaction system from Task 2.0 provides button handling and state management, but there is no menu system to navigate device functions. Users cannot access configuration settings, measurement controls, or any device features beyond power on/off. The PRD requires:
1. Main menu structure matching firmware R.13J extracted from provided manuals
2. Hierarchical sub-menu navigation following firmware menu tree
3. Soft key label system (labels 1-4) that updates based on screen context
4. Alt f alternate menu functionality revealing additional soft-key options
5. Dialog/warning screen system for prompts, confirmations, and error messages
6. Exact menu structures and dialog text extracted from firmware R.13J documentation

Without this menu system, users cannot access configuration (Task 4.0), start measurements (Task 5.0), or interact with any device features. This task establishes the navigation foundation for all device functionality.

### Success Criteria
- [ ] 3.1: Extract menu structure from firmware R.13J manuals (main menu items and hierarchy)
  - [ ] 3.1a: Create reviewable menu structure document for user review
  - [ ] 3.1b: User reviews menu structure against physical device and approves/corrects
- [ ] 3.2: Create menu data structure in `js/menu.js` with main menu items and sub-menus (using reviewed structure)
- [ ] 3.3: Implement menu navigation state machine with current menu, selected item, and navigation history
- [ ] 3.4: Build menu rendering function to display menu items on LCD
- [ ] 3.5: Implement sub-menu navigation with hierarchical menu tree following firmware structure
- [ ] 3.6: Create soft key label system that updates labels (1-4) based on current screen context
- [ ] 3.7: Map soft key labels to menu actions for each screen (home, menu, settings, measurement, etc.)
- [ ] 3.8: Implement Alt f alternate menu functionality that reveals additional soft-key options
- [ ] 3.9: Create dialog/warning screen system using existing dialog overlay structure
- [ ] 3.10: Extract exact dialog text, warning messages, and confirmation prompts from firmware manuals
- [ ] 3.11: Implement dialog display functions for prompts, confirmations, and error messages
- [ ] 3.12: Test menu navigation flow matches firmware R.13J behavior

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

1. **Main Menu Structure:** Build a main menu structure based on firmware R.13J specifications extracted from provided manuals (SoundPro_SE_DL_User_Manual_053-576.pdf, SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf, QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf)
2. **Sub-Menu Navigation:** Implement sub-menus with hierarchical navigation following the firmware's menu tree
3. **Soft Key Label System:** Add a soft key label system where labels (1-4) appear on the LCD and vary based on the current screen context
4. **Alt f Functionality:** Create Alt f alternate menu functionality that reveals additional soft-key options when pressed
5. **Dialog/Warning System:** Implement a dialog/warning screen system that displays prompts, confirmations, and error messages matching firmware R.13J
6. **Firmware Accuracy:** Extract and use exact menu structures, dialog text, and warning messages from the provided manuals
7. **Menu Rendering:** Display menu items on LCD display using DOM-based rendering (not Canvas)
8. **Navigation Feedback:** Provide clear visual feedback for selected menu items during navigation
9. **Keyboard Navigation:** Support keyboard navigation (Arrow keys, Enter, Esc) through menu system matching mouse interaction
10. **Screen Context Tracking:** Track current screen context (home, menu, settings, measurement, dialog) for proper soft key label mapping

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
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- Menu data structure must be easily modifiable if firmware updates occur
- Dialog system must use existing dialog overlay HTML structure from Task 1.0

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**Menu Data Structure (in `js/menu.js`):**
```javascript
{
  id: string,                    // Unique menu identifier
  title: string,                 // Menu title displayed on LCD
  items: [                       // Array of menu items
    {
      id: string,                // Item identifier
      label: string,              // Display label
      action: string | function,  // Action type or handler function
      subMenu: string | null,     // Sub-menu ID if item has sub-menu
      softKey: number | null,    // Soft key number (1-4) if mapped
      altSoftKey: number | null  // Alt f soft key number if alternate option
    }
  ],
  parentMenu: string | null,     // Parent menu ID for back navigation
  softKeys: {                    // Soft key labels for this menu
    1: string | null,
    2: string | null,
    3: string | null,
    4: string | null
  },
  altSoftKeys: {                 // Alt f soft key labels (alternate set)
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
  menuData: Object               // Complete menu data structure
}
```

**Dialog State Object:**
```javascript
{
  visible: boolean,
  type: 'prompt' | 'confirmation' | 'warning' | 'error',
  title: string,
  message: string,
  buttons: Array<{label: string, action: function}>,
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

- **Menu Data Structure (in `js/menu.js`):** Complete menu hierarchy extracted from firmware R.13J
  - Main menu items and sub-menus
  - Menu item actions and navigation targets
  - Soft key label mappings for each menu
  - Alt f alternate soft key mappings

- **Menu Rendering Functions (in `js/menu.js`):**
  - `renderMenu()` - Display menu items on LCD with selected item highlighting
  - `updateSoftKeyLabels()` - Update soft key labels on LCD based on current menu
  - `renderMenuTitle()` - Display menu title/header on LCD
  - `highlightSelectedItem()` - Visual feedback for selected menu item

- **Menu Navigation Functions (enhance existing in `js/menu.js`):**
  - `navigateToMenu(menuId)` - Navigate to specific menu by ID
  - `navigateToSubMenu(itemId)` - Navigate to sub-menu from menu item
  - `selectMenuItem(index)` - Select menu item by index
  - `executeMenuItemAction(itemId)` - Execute action associated with menu item
  - `toggleAltMenu()` - Toggle Alt f alternate menu display

- **Dialog System Functions (in `js/menu.js` or new `js/dialog.js`):**
  - `showDialog(dialogConfig)` - Display dialog overlay with configuration
  - `hideDialog()` - Hide dialog overlay
  - `showWarning(message, onConfirm)` - Display warning dialog
  - `showConfirmation(message, onConfirm, onCancel)` - Display confirmation dialog
  - `showPrompt(message, onConfirm, onCancel)` - Display prompt dialog
  - `showError(message, onConfirm)` - Display error dialog

- **Soft Key Handler Integration (in `js/buttons.js`):**
  - Map soft key presses to menu actions based on current screen context
  - Execute menu item actions when soft keys are pressed
  - Handle Alt f button press to toggle alternate menu

### Page Updates

- `js/menu.js` - Complete implementation (currently has structure only)
  - Add menu data structure with all menus extracted from firmware
  - Implement menu rendering functions
  - Enhance navigation state machine with menu-specific logic
  - Add soft key label management
  - Add Alt f alternate menu functionality
  - Add dialog system functions

- `js/display.js` - Add menu rendering support
  - Functions to update LCD content with menu items
  - Functions to display soft key labels
  - Functions to highlight selected menu item

- `js/buttons.js` - Enhance soft key handlers
  - Connect soft key presses to menu actions
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

- **Menu State:** Managed in `menu.js`, extends navigation state from Task 2.0
- **Dialog State:** Managed in `menu.js` or separate `dialog.js` module
- **Display Updates:** Menu navigation triggers LCD content updates via `display.js`
- **Soft Key Labels:** Updated when menu changes or Alt f is toggled
- **State Persistence:** In-memory only, no localStorage or external storage

---

## 9. Implementation Plan

### Phase 1: Menu Data Extraction & Structure (3.1-3.2)

1. **3.1** Extract menu structure from firmware R.13J manuals (main menu items and hierarchy)
   - Review SoundPro_SE_DL_User_Manual_053-576.pdf for menu structure
   - Review SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf for menu references
   - Review QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf for menu details
   - Document main menu items and hierarchy
   - Document sub-menu structures
   - Document menu navigation paths
   - **Create reviewable menu structure document** (JSON or Markdown) that can be checked against physical device
   - Structure document should include:
     - All menu IDs and titles
     - All menu items with labels
     - Menu hierarchy (parent-child relationships)
     - Soft key label mappings for each menu
     - Alt f alternate soft key mappings
     - Dialog text and messages
   - **STOP HERE FOR REVIEW** - Wait for user to verify menu structure against physical device before proceeding

2. **3.2** Create menu data structure in `js/menu.js` with main menu items and sub-menus
   - **Use reviewed menu structure from 3.1** (after user verification)
   - Define menu data structure format matching reviewed structure
   - Create main menu object with all top-level items
   - Create sub-menu objects for each sub-menu
   - Map menu items to actions (navigation, configuration, measurement, etc.)
   - Add menu item IDs and labels matching firmware exactly (from reviewed structure)
   - Structure menus hierarchically with parent-child relationships
   - Ensure structure matches user-reviewed menu document exactly

### Phase 2: Menu Navigation State Machine (3.3-3.5)

3. **3.3** Implement menu navigation state machine with current menu, selected item, and navigation history
   - Enhance existing navigation state in `menu.js`
   - Add current menu tracking
   - Add selected item index tracking
   - Implement navigation history stack
   - Add menu state getter/setter functions
   - Connect navigation to display state updates

4. **3.4** Build menu rendering function to display menu items on LCD
   - Create `renderMenu()` function that displays menu items
   - Display menu title/header on LCD
   - Render menu items as list with selected item highlighted
   - Handle menu item scrolling if more items than visible
   - Update LCD content via `display.js` functions
   - Style menu display to match firmware appearance

5. **3.5** Implement sub-menu navigation with hierarchical menu tree following firmware structure
   - Implement `navigateToSubMenu()` function
   - Handle parent menu tracking for back navigation
   - Update navigation history when entering sub-menu
   - Render sub-menu items when navigated to
   - Ensure back button returns to parent menu correctly

### Phase 3: Soft Key Label System (3.6-3.7)

6. **3.6** Create soft key label system that updates labels (1-4) based on current screen context
   - Add soft key label data to each menu structure
   - Create `updateSoftKeyLabels()` function
   - Display soft key labels on LCD bottom area (soft key label region)
   - Update labels when menu changes
   - Update labels when screen context changes (home, menu, measurement, etc.)
   - Handle empty/null labels (some menus may not use all soft keys)

7. **3.7** Map soft key labels to menu actions for each screen (home, menu, settings, measurement, etc.)
   - Map soft key presses to menu item actions
   - Handle soft key presses in `buttons.js` to execute menu actions
   - Map soft keys differently for different screen contexts:
     - Home screen: Quick access actions
     - Menu screen: Menu item selection
     - Settings screen: Configuration actions
     - Measurement screen: Measurement controls
   - Ensure soft key actions match firmware behavior

### Phase 4: Alt f Alternate Menu (3.8)

8. **3.8** Implement Alt f alternate menu functionality that reveals additional soft-key options
   - Add `altSoftKeys` data to menu structures
   - Create `toggleAltMenu()` function
   - Track Alt f state (normal vs alternate menu active)
   - Switch soft key labels when Alt f is pressed
   - Switch back to normal soft keys when Alt f pressed again
   - Ensure Alt f behavior matches firmware exactly

### Phase 5: Dialog/Warning System (3.9-3.11)

9. **3.9** Create dialog/warning screen system using existing dialog overlay structure
   - Use existing dialog overlay HTML from `index.html`
   - Create dialog state management
   - Create `showDialog()` function with configuration options
   - Create `hideDialog()` function
   - Style dialog overlay to match firmware appearance
   - Make dialog modal (blocks interaction with device when visible)

10. **3.10** Extract exact dialog text, warning messages, and confirmation prompts from firmware manuals
    - Review firmware manuals for all dialog text
    - Extract warning messages
    - Extract confirmation prompts
    - Extract error messages
    - Extract information dialogs
    - Document all dialog text exactly as in firmware
    - **Add dialog text to reviewable menu structure document** for user verification
    - User can verify dialog text against physical device if available

11. **3.11** Implement dialog display functions for prompts, confirmations, and error messages
    - Create `showWarning(message, onConfirm)` function
    - Create `showConfirmation(message, onConfirm, onCancel)` function
    - Create `showPrompt(message, onConfirm, onCancel)` function
    - Create `showError(message, onConfirm)` function
    - Use extracted dialog text from 3.10
    - Connect dialog buttons to action handlers
    - Ensure dialog behavior matches firmware exactly

### Phase 6: Testing & Integration (3.12)

12. **3.12** Test menu navigation flow matches firmware R.13J behavior
    - Test main menu navigation
    - Test sub-menu navigation
    - Test back button navigation through menu history
    - Test soft key label updates on menu changes
    - Test Alt f alternate menu toggle
    - Test dialog display and interaction
    - Test keyboard navigation matches mouse navigation
    - Verify all menu structures match firmware documentation
    - Test edge cases (empty menus, single-item menus, etc.)

### Implementation Notes
- Extract menu structure from firmware manuals first before implementing
- Use exact menu item labels and text from firmware documentation
- Test each phase before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses
- Reference firmware R.13J documentation for exact behavior
- Ensure menu navigation feels responsive and matches real device
- Console log menu navigation for debugging: `[MENU] Navigated to: [menuId]`, `[MENU] Selected item: [index]`

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (3.1-3.12) is completed
- Mark parent task 3.0 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met
- Test menu navigation with both mouse and keyboard
- Verify soft key labels update correctly
- Test Alt f alternate menu functionality
- Verify dialog system works correctly

---

## 10.5. Testing & Debugging Guide

### How to Test Task 3.0 Success

**🎯 Success Indicators:**
1. ✅ Main menu displays on LCD when device is powered on
2. ✅ Navigation buttons (Up/Down) move selection highlight through menu items
3. ✅ Enter button selects menu item and navigates to sub-menu or executes action
4. ✅ Back button (Esc/Power short press) returns to previous menu
5. ✅ Soft key labels (1-4) display on LCD bottom and update based on current menu
6. ✅ Soft key buttons execute corresponding menu actions
7. ✅ Alt f button toggles alternate soft key labels
8. ✅ Dialog overlays display for warnings, confirmations, and prompts
9. ✅ Dialog buttons (OK, Cancel) execute correct actions
10. ✅ Menu structure matches firmware R.13J documentation

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
   - Highlight must wrap at top/bottom of menu list

3. **Soft Key Label Display:**
   - Labels must appear in LCD soft key label area (bottom of LCD)
   - Labels must update immediately when menu changes
   - Empty labels should not display or show as blank

### Testing Checklist

**Menu Navigation Testing:**
- [ ] **Main Menu Display:** Power on device → Main menu displays on LCD
- [ ] **Up/Down Navigation:** Press Up/Down arrows → Selection highlight moves through menu items
- [ ] **Enter Selection:** Press Enter on menu item → Navigates to sub-menu or executes action
- [ ] **Back Navigation:** Press Esc/Power short press → Returns to previous menu
- [ ] **Menu History:** Navigate through multiple menus → Back button returns through history correctly
- [ ] **Menu Wrapping:** Navigate to bottom of menu, press Down → Wraps to top (or doesn't wrap, match firmware)

**Soft Key Testing:**
- [ ] **Label Display:** Menu displayed → Soft key labels (1-4) appear on LCD bottom
- [ ] **Label Updates:** Navigate to different menu → Soft key labels update to match new menu
- [ ] **Soft Key Actions:** Press soft key button → Executes corresponding menu action
- [ ] **Empty Labels:** Menu with fewer than 4 soft keys → Unused labels don't display

**Alt f Testing:**
- [ ] **Alt f Toggle:** Press Alt f button → Soft key labels switch to alternate set
- [ ] **Alt f Toggle Back:** Press Alt f again → Soft key labels return to normal set
- [ ] **Alt f State:** Alternate menu active → Alt f indicator shows (if firmware has indicator)

**Dialog Testing:**
- [ ] **Warning Dialog:** Trigger warning → Dialog overlay displays with warning message
- [ ] **Confirmation Dialog:** Trigger confirmation → Dialog displays with OK/Cancel buttons
- [ ] **Dialog Interaction:** Click OK/Cancel → Dialog closes and executes action
- [ ] **Dialog Modal:** Dialog visible → Device buttons blocked (except dialog buttons)
- [ ] **Dialog Text:** Dialog messages match firmware text exactly

**Keyboard Navigation Testing:**
- [ ] **Arrow Keys:** Press ArrowUp/Down → Menu selection moves (same as mouse)
- [ ] **Enter Key:** Press Enter → Selects menu item (same as mouse click)
- [ ] **Esc Key:** Press Escape → Goes back (same as Power short press)

### Browser Console Testing Commands

**Open Browser Console (F12 or Cmd+Option+I) and test:**

```javascript
// Check menu state
console.log(window.getNavigationState()); // Should show {currentMenu: 'main', selectedItem: 0, ...}

// Check current menu
console.log(window.getCurrentMenu()); // Should return current menu ID

// Navigate to menu programmatically
window.navigateToMenu('settings'); // Should navigate to settings menu

// Check soft key labels
window.getSoftKeyLabels(); // Should return {1: 'Label1', 2: 'Label2', ...}

// Show dialog programmatically
window.showWarning('Test warning', () => console.log('Confirmed'));
```

### Manual Testing Steps

**Step 1: Main Menu Test**
1. Power on device (long press power button)
2. ✅ Main menu should display on LCD
3. ✅ Menu items should be visible with first item selected/highlighted
4. ✅ Soft key labels should appear at bottom of LCD

**Step 2: Menu Navigation Test**
1. Device showing main menu
2. Press Down arrow → ✅ Selection highlight moves to next item
3. Press Up arrow → ✅ Selection highlight moves to previous item
4. Press Enter on menu item → ✅ Navigates to sub-menu or executes action

**Step 3: Soft Key Test**
1. Device showing menu with soft key labels
2. Press Soft Key 1 button → ✅ Executes action labeled on Soft Key 1
3. Navigate to different menu → ✅ Soft key labels update
4. Press Soft Key 2 button → ✅ Executes new action for Soft Key 2

**Step 4: Alt f Test**
1. Device showing menu
2. Press Alt f button → ✅ Soft key labels change to alternate set
3. Press Alt f again → ✅ Soft key labels return to normal set

**Step 5: Dialog Test**
1. Trigger action that shows warning (e.g., stop measurement)
2. ✅ Dialog overlay appears with warning message
3. ✅ Dialog has OK button (and Cancel if confirmation)
4. Click OK → ✅ Dialog closes and action executes

### Expected Console Output Example

```
[BUTTON] Power: LONG PRESS (823ms) - Power ON
[STATE] Device powered ON
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
2. Verify menu data structure is loaded correctly
3. Check LCD rendering functions are called
4. Verify device is powered on

**If soft key labels don't update:**
1. Check console for soft key label update logs
2. Verify soft key label data exists in menu structure
3. Check LCD soft key label area is being updated
4. Verify screen context is tracked correctly

**If Alt f doesn't work:**
1. Check Alt f button handler is connected
2. Verify alternate soft key data exists in menu structure
3. Check Alt f state is being tracked
4. Test Alt f toggle function directly

**If dialogs don't display:**
1. Check dialog overlay HTML exists in index.html
2. Verify dialog show/hide functions are called
3. Check dialog state is managed correctly
4. Verify dialog CSS styling is correct

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `js/menu.js` - Complete implementation (currently has structure only)
  - Add menu data structure
  - Implement menu rendering functions
  - Enhance navigation state machine
  - Add soft key label management
  - Add Alt f functionality
  - Add dialog system functions

- `js/display.js` - Add menu rendering support
  - Functions to render menu items on LCD
  - Functions to display soft key labels
  - Functions to highlight selected menu item

- `js/buttons.js` - Enhance soft key handlers
  - Connect soft key presses to menu actions
  - Add Alt f button handler
  - Route navigation buttons to menu navigation

- `css/styles.css` - Add menu display styles
  - Menu item list styling
  - Selected item highlighting
  - Soft key label display styling
  - Menu title/header styling
  - Dialog overlay styling enhancements

**Files to Create:**
- `tasks/menu-structure-review.json` or `tasks/menu-structure-review.md` - **REVIEWABLE menu structure document**
  - Complete menu hierarchy extracted from firmware
  - All menu items, labels, and IDs
  - Soft key mappings for each menu
  - Alt f alternate mappings
  - Dialog text
  - **This file must be reviewed and approved by user before implementation proceeds**
  - User can edit this file directly or provide corrections
  - This becomes the source of truth for menu implementation

**Files to Reference:**
- `PRD.md` - Requirements reference (Requirements 13-18)
- `assets/Quest Sound Meter.png` - Device background image
- `Documents/SoundPro_SE_DL_User_Manual_053-576.pdf` - Firmware menu structure reference
- `Documents/SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf` - Firmware menu reference
- `Documents/QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf` - Firmware reference
- `tasks/task-2-0.md` - Reference for navigation state machine structure
- `index.html` - Reference for dialog overlay HTML structure

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements (Requirements 13-18)
   - Review firmware R.13J documentation PDFs for menu structure
   - Understand current codebase state (Task 2.0 complete)
   - Check `js/menu.js` for existing navigation state machine structure
   - Review `index.html` for dialog overlay structure
   - Understand button handler system from Task 2.0

2. **Extract Menu Structure First (CRITICAL):**
   - Before coding, extract menu structure from firmware manuals
   - Document main menu items and hierarchy
   - Document sub-menu structures
   - Document soft key label mappings
   - Document dialog text and messages
   - **Create reviewable menu structure document** (`tasks/menu-structure-review.json` or `.md`)
   - Format should be human-readable and easy to review/edit
   - **STOP IMPLEMENTATION HERE** - Present menu structure document to user for review
   - **WAIT FOR USER APPROVAL** - User will check against physical device and provide corrections
   - **ONLY AFTER APPROVAL** - Proceed with implementation using reviewed menu structure

3. **Implement Sub-tasks Sequentially:**
   - Implement 3.1: Extract menu structure from firmware R.13J manuals
   - Implement 3.2: Create menu data structure in `js/menu.js`
   - Implement 3.3: Implement menu navigation state machine
   - Implement 3.4: Build menu rendering function
   - Implement 3.5: Implement sub-menu navigation
   - Implement 3.6: Create soft key label system
   - Implement 3.7: Map soft key labels to menu actions
   - Implement 3.8: Implement Alt f alternate menu functionality
   - Implement 3.9: Create dialog/warning screen system
   - Implement 3.10: Extract exact dialog text from firmware manuals
   - Implement 3.11: Implement dialog display functions
   - Implement 3.12: Test menu navigation flow

4. **Testing & Debugging (CRITICAL):**
   - **MUST implement console logging** for all menu navigation: `[MENU] Navigated to: [menuId]`
   - **MUST implement console logging** for soft key label updates: `[MENU] Soft key labels updated: {...}`
   - **MUST implement console logging** for dialog display: `[DIALOG] Showing warning: "..."`
   - Test menu navigation with mouse clicks
   - Test menu navigation with keyboard (Arrow keys, Enter, Esc)
   - Verify soft key labels update correctly
   - Test Alt f toggle functionality
   - Test dialog display and interaction
   - Verify all menu structures match firmware documentation
   - Test each feature matches firmware R.13J behavior
   - Follow testing checklist in Section 10.5
   - Update task checkboxes as work completes

5. **Documentation:**
   - Document menu data structure format
   - Document soft key label mapping system
   - Document Alt f alternate menu behavior
   - Document dialog system usage
   - Comment complex menu navigation logic
   - Document any deviations from firmware (should be none)

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in firmware documentation
- Ask for clarification if menu structure is unclear in firmware manuals
- Show menu data structure clearly
- Demonstrate menu rendering approach

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern (IIFE with window exports)
- Comment complex menu navigation logic
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Menu data structure should be easily readable and modifiable
- Use descriptive variable names for menu items and actions

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Menu system enhances existing navigation state machine from Task 2.0 - no breaking changes
- Soft key handlers will now execute menu actions instead of placeholder functions
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
- Extract menu structure from firmware first to ensure accuracy
- Test menu navigation thoroughly before moving to configuration features
- Verify soft key labels match firmware exactly
- Test Alt f functionality matches firmware behavior
- Ensure dialog system handles all warning/confirmation scenarios
- Test edge cases (empty menus, single-item menus, deep navigation)

---

**Ready to Implement?**
This task implements Menu System Implementation. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete. 

**🚨 CRITICAL WORKFLOW:**
1. **Extract menu structure from firmware manuals** (3.1)
2. **Create reviewable menu structure document** (`tasks/menu-structure-review.json` or `.md`)
3. **STOP AND PRESENT TO USER** - User reviews menu structure against physical device
4. **WAIT FOR USER APPROVAL/CORRECTIONS** - User verifies accuracy and provides any corrections
5. **ONLY AFTER APPROVAL** - Proceed with implementation using reviewed menu structure (3.2+)

This review step ensures accuracy before building the full menu system. The reviewable document format should be easy to read and edit (JSON or Markdown) so user can make corrections directly if needed.

This is a critical foundation task - all configuration and measurement features depend on proper menu navigation.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

