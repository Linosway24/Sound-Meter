# AI Task Planning - Task 2.0: Core Interaction System - Button Handlers and State Management

> **How to Use This Template:**
> 1. Specify your task list file: `tasks-PRD.md` (e.g., `tasks-PRD.md`, `my-tasks.md`, etc.)
> 2. Open `tasks-PRD.md` and find the task you want to implement (e.g., 2.0, 3.0, etc.)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-2-0.md` (e.g., `task-2-0.md`)

## 1. Task Overview

### Task Title
**Title:** Core Interaction System - Button Handlers and State Management

### Goal Statement
**Goal:** Implement the core interaction system that enables all button functionality, device power management, and establishes the state machine foundation for menu navigation and screen transitions. This task creates the event handling infrastructure that connects physical button interactions (mouse clicks and keyboard input) to device state changes, power on/off functionality, and display state management. All subsequent features (menu system, measurement engine, configuration) depend on this core interaction system working correctly.

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
- Button elements exist but have no JavaScript handlers attached
- `js/buttons.js` exists but is empty - needs complete implementation
- `js/device.js` does not exist - needs to be created
- `js/menu.js` does not exist - needs state machine structure created (full menu implementation in Task 3.0)
- `js/display.js` exists but is empty - needs state management functions
- No device state management - power on/off not implemented
- No button event handlers - all buttons are non-functional
- No keyboard input support
- Display state not managed - LCD always shows powered-off state
- Backlight state not managed
- Screen context tracking not implemented

---

## 3. Context & Problem Definition

### Problem Statement
The device structure from Task 1.0 provides all the visual elements and button HTML, but there is no interaction system to make buttons functional. Users cannot power on the device, navigate menus, or interact with any controls. The PRD requires:
1. Button press detection (short press for immediate actions, long press ~800ms for power toggle)
2. Dual functionality for On/Off button (short = Esc/Back, long = Power toggle)
3. Keyboard input support matching mouse interactions (Arrow keys, Enter, Esc)
4. Device state management (power on/off, initialization)
5. Display state management (device on/off states, backlight states, active screen context)
6. Navigation state machine structure for managing screen transitions

Without this core interaction system, none of the menu, configuration, or measurement features can function. This task establishes the foundation for all user interactions.

### Success Criteria
- [ ] 2.1: Create `js/device.js` module with device state object (power on/off, initialization)
- [ ] 2.2: Implement power on/off functionality with device initialization on power on
- [ ] 2.3: Create `js/buttons.js` module with button event delegation system
- [ ] 2.4: Implement short press detection for all buttons (immediate action on mouse/keyboard up)
- [ ] 2.5: Implement long press detection (~800ms hold) for power button
- [ ] 2.6: Implement On/Off button dual functionality: short press = Esc/Back, long press = Power toggle
- [ ] 2.7: Create keyboard input handlers in `buttons.js` for Arrow keys (Up/Down/Left/Right), Enter, and Esc
- [ ] 2.8: Map keyboard events to corresponding button actions
- [ ] 2.9: Create navigation state machine structure in `js/menu.js` for managing screen states
- [ ] 2.10: Implement display state management for device on/off states, backlight states, and active screen context
- [ ] 2.11: Connect button handlers to state machine for screen transitions

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New development - building Quest SoundPro SE-DL simulation
- **Breaking Changes:** Acceptable - rebuilding to match PRD exactly
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High stability - must match firmware R.13J behavior exactly

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements 8-12:**

1. **Button Press Detection:** Implement button press handlers that detect short press (immediate action) and long press (~800 ms hold for power on/off)
2. **Navigation State Machine:** Create a navigation state machine to manage menu system transitions and screen states
3. **Keyboard Input:** Build keyboard input handlers that respond to Arrow keys (Up/Down/Left/Right), Enter, and Esc
4. **Display State Management:** Implement display state management for device on/off states, backlight states, and active screen context
5. **On/Off Button Dual Functionality:** Handle the On/Off button with dual functionality: short press = Esc/Back, long press = Power toggle
6. **Event Delegation:** Use efficient event delegation pattern for button handling
7. **State Initialization:** Device must initialize properly on power on (set default configuration, display home screen)
8. **Power Off State:** Device must display powered-off appearance when off (LCD gray tint, all buttons inactive)
9. **Screen Context Tracking:** Track current screen context (home, menu, settings, measurement, etc.) for proper soft key label mapping (Task 3.0)
10. **Console Logging:** Implement console logging for all button presses, keyboard events, and state changes (required for testing/debugging)
11. **Visual Feedback:** Implement visual button press feedback (CSS class on press/release) for user testing

### Non-Functional Requirements
- **Performance:** Efficient event delegation, no memory leaks from event listeners
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** All interactions must match firmware R.13J behavior exactly
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Accessibility:** Keyboard navigation must match mouse interaction functionality

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- Event handlers must use event delegation for efficiency
- Long press detection must be ~800ms (not configurable)

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates

**Device State Object (in `js/device.js`):**
```javascript
{
  poweredOn: boolean,
  initialized: boolean,
  backlightOn: boolean,
  backlightMode: 'manual' | 'timed',
  backlightTimeout: number | null
}
```

**Display State Object (in `js/display.js`):**
```javascript
{
  devicePowered: boolean,
  backlightState: 'on' | 'off',
  screenContext: 'home' | 'menu' | 'settings' | 'measurement' | 'dialog' | 'off',
  currentMenu: string | null,
  selectedMenuItem: number | null
}
```

**Navigation State Object (in `js/menu.js` - structure only, Task 3.0 fills in details):**
```javascript
{
  currentScreen: string,
  menuHistory: string[],
  selectedItem: number
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

- **`js/device.js`:** Device state management module
  - Device state object (power on/off, initialization flag)
  - Power on/off functions
  - Device initialization function (sets defaults, triggers display update)
  - State change event system (optional - can use direct function calls)

- **`js/buttons.js`:** Button event handling module
  - Event delegation system (single listener on device container)
  - Short press detection (immediate action on mouse/keyboard up)
  - Long press detection (~800ms hold timer)
  - Button action mapping (maps button classes to action functions)
  - Keyboard input handlers (Arrow keys, Enter, Esc)
  - Keyboard-to-button mapping

- **`js/menu.js`:** Navigation state machine module (structure only)
  - State machine structure for screen transitions
  - Screen context tracking
  - Navigation history tracking (for back button functionality)
  - Placeholder functions for menu navigation (full implementation in Task 3.0)

- **`js/display.js`:** Display state management module
  - Display state object
  - Functions to update display state (power on/off, backlight, screen context)
  - LCD class management (powered-off state, backlight states)
  - Screen context change handlers

### Page Updates

- `index.html` - Add script tags for new modules (`device.js`, `buttons.js`, `menu.js`, `display.js`)
- `js/buttons.js` - Complete implementation (currently empty)
- `js/display.js` - Add state management functions (currently empty)
- `js/config.js` - May need to reference for default values during initialization

### State Management

- **Device State:** Managed in `device.js`, exposed via module exports
- **Display State:** Managed in `display.js`, updated when device state changes
- **Navigation State:** Structure created in `menu.js`, full implementation in Task 3.0
- **State Updates:** Device state changes trigger display updates via function calls
- **State Persistence:** In-memory only, no localStorage or external storage

---

## 9. Implementation Plan

### Phase 1: Device State Management (2.1-2.2)
1. **2.1** Create `js/device.js` module with device state object (power on/off, initialization)
   - Create device state object with `poweredOn: false`, `initialized: false`
   - Export state object and getter functions
   - Export functions: `getDeviceState()`, `isPoweredOn()`, `isInitialized()`

2. **2.2** Implement power on/off functionality with device initialization on power on
   - Create `powerOn()` function that sets `poweredOn: true`, calls initialization
   - Create `powerOff()` function that sets `poweredOn: false`, resets state
   - Create `initializeDevice()` function that sets defaults, marks initialized
   - Call display update functions when power state changes

### Phase 2: Button Event System (2.3-2.6)
3. **2.3** Create `js/buttons.js` module with button event delegation system
   - Set up event delegation on device container (single listener)
   - Map button classes to button identifiers (soft-key--1 → 'softKey1', etc.)
   - Create button action router function

4. **2.4** Implement short press detection for all buttons (immediate action on mouse/keyboard up)
   - Detect mouse/keyboard up events on buttons
   - Call action handler immediately (no delay)
   - Route to appropriate handler function based on button type

5. **2.5** Implement long press detection (~800ms hold) for power button
   - Track mouse/keyboard down time on power button
   - Start timer on mouse/keyboard down
   - Cancel timer if mouse/keyboard up before 800ms
   - Trigger power toggle if 800ms elapsed

6. **2.6** Implement On/Off button dual functionality: short press = Esc/Back, long press = Power toggle
   - Use long press detection for power toggle
   - Use short press for Esc/Back action (call menu back function)
   - Ensure both behaviors work correctly

### Phase 3: Keyboard Input (2.7-2.8)
7. **2.7** Create keyboard input handlers in `buttons.js` for Arrow keys (Up/Down/Left/Right), Enter, and Esc
   - Add keydown/keyup event listeners
   - Map ArrowUp → 'up', ArrowDown → 'down', ArrowLeft → 'left', ArrowRight → 'right'
   - Map Enter → 'enter', Escape → 'esc'
   - Prevent default browser behavior for these keys

8. **2.8** Map keyboard events to corresponding button actions
   - Route keyboard events through same button action system
   - Ensure keyboard and mouse produce same results
   - Test all keyboard mappings

### Phase 4: State Machine Structure (2.9-2.11)
9. **2.9** Create navigation state machine structure in `js/menu.js` for managing screen states
   - Create menu state object structure
   - Create placeholder functions: `navigateToScreen()`, `goBack()`, `getCurrentScreen()`
   - Structure ready for Task 3.0 menu implementation

10. **2.10** Implement display state management for device on/off states, backlight states, and active screen context
    - Create display state object in `display.js`
    - Create functions: `updateDisplayState()`, `setScreenContext()`, `setBacklightState()`
    - Update LCD classes based on state (lcd--powered-off, lcd--backlight-on, etc.)
    - Trigger display refresh when state changes

11. **2.11** Connect button handlers to state machine for screen transitions
    - Connect button actions to menu state machine functions
    - Route navigation buttons (Up/Down/Left/Right/Enter) to menu navigation
    - Route soft keys to menu actions (placeholder for Task 3.0)
    - Ensure all button presses trigger appropriate state updates

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact behavior
- Test each sub-task before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses
- Reference relevant files from `tasks-PRD.md` "Relevant Files" section
- Use event delegation pattern for efficiency (single listener)
- Long press must be ~800ms exactly (not configurable)
- Ensure keyboard and mouse produce identical behavior

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (2.1-2.11) is completed
- Mark parent task 2.0 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met
- Test keyboard and mouse interactions produce same results
- Verify power on/off works correctly
- Verify long press detection works for power button

---

## 10.5. Testing & Debugging Guide

### How to Test Task 2.0 Success

**🎯 Success Indicators:**
1. ✅ Power button long press (~800ms) turns device on/off
2. ✅ Power button short press acts as Esc/Back (when device is on)
3. ✅ All buttons respond to clicks (visual/console feedback)
4. ✅ Keyboard Arrow keys navigate (when menus are implemented)
5. ✅ Keyboard Enter/Esc work correctly
6. ✅ Device powers on with LCD in "on" state (green tint)
7. ✅ Device powers off with LCD in "off" state (gray tint)
8. ✅ Console shows button press events with timing

### Visual Debugging Features

**The implementation MUST include:**

1. **Console Logging (Always Active):**
   ```javascript
   // Example console output format:
   // [BUTTON] Soft Key 1: SHORT PRESS
   // [BUTTON] Power: LONG PRESS (823ms) - Power ON
   // [BUTTON] Power: SHORT PRESS - Esc/Back
   // [KEYBOARD] ArrowUp → Up button
   // [STATE] Device powered ON
   // [STATE] Screen context: home
   ```

2. **Visual Button Press Feedback (Optional Debug Mode):**
   - Add CSS class `.button--pressed` on button press (removed on release)
   - Visual highlight/border change when button is pressed
   - Can be enabled/disabled via debug flag

3. **Long Press Visual Indicator:**
   - Show progress indicator when long press is in progress
   - Visual feedback after ~800ms threshold is reached
   - Can be subtle (opacity change) or obvious (color change)

### Testing Checklist

**Power Button Testing:**
- [ ] **Long Press Test:** Hold power button for 800ms+ → Device should power on/off
- [ ] **Short Press Test (Device OFF):** Quick tap → Should do nothing (or show "Press and hold to power on")
- [ ] **Short Press Test (Device ON):** Quick tap → Should act as Esc/Back
- [ ] **Timing Test:** Hold for 700ms then release → Should NOT power toggle (too short)
- [ ] **Timing Test:** Hold for 850ms then release → Should power toggle (long enough)

**All Other Buttons Testing:**
- [ ] **Soft Key 1-4:** Click each → Console log "Soft Key X: SHORT PRESS"
- [ ] **Navigation Buttons:** Click Up/Down/Left/Right/Enter → Console log button name + "SHORT PRESS"
- [ ] **Function Buttons:** Click Alt f, Backlight, Run/Pause, Stop → Console log button name + "SHORT PRESS"
- [ ] **Visual Feedback:** Each button shows pressed state when clicked (CSS class)

**Keyboard Input Testing:**
- [ ] **Arrow Keys:** Press ArrowUp/Down/Left/Right → Console log "ArrowUp → Up button" etc.
- [ ] **Enter Key:** Press Enter → Console log "Enter → Enter button"
- [ ] **Esc Key:** Press Escape → Console log "Escape → Esc/Back" (or Power button short press)
- [ ] **Keyboard = Mouse:** Verify keyboard actions produce same results as mouse clicks

**Device State Testing:**
- [ ] **Power ON:** Long press power → LCD should show "on" state (green tint), console shows "Device powered ON"
- [ ] **Power OFF:** Long press power again → LCD should show "off" state (gray tint), console shows "Device powered OFF"
- [ ] **Initialization:** On power on, console should show "Device initialized"

**Display State Testing:**
- [ ] **LCD Classes:** Check `lcd--powered-off` class removed when powered on
- [ ] **LCD Classes:** Check `lcd--powered-off` class added when powered off
- [ ] **Screen Context:** Console shows current screen context changes

### Browser Console Testing Commands

**Open Browser Console (F12 or Cmd+Option+I) and test:**

```javascript
// Check device state
console.log(window.deviceState); // Should show {poweredOn: true/false, initialized: true/false}

// Check display state  
console.log(window.displayState); // Should show {devicePowered: true/false, screenContext: 'home', ...}

// Test button programmatically (if exposed)
window.testButtonPress('soft-key-1'); // Should trigger button action

// Check button press count (if debug counter implemented)
window.getButtonPressCount(); // Should return object with button names and press counts
```

### Manual Testing Steps

**Step 1: Power On Test**
1. Open `index.html` in browser
2. Open browser console (F12)
3. Device should start powered OFF (LCD gray tint)
4. Hold power button for 800ms+
5. ✅ Device should power ON (LCD green tint)
6. ✅ Console should show: `[BUTTON] Power: LONG PRESS (XXXms) - Power ON`
7. ✅ Console should show: `[STATE] Device powered ON`

**Step 2: Short Press Test (Device ON)**
1. Device is now ON
2. Quick tap power button (< 200ms)
3. ✅ Console should show: `[BUTTON] Power: SHORT PRESS - Esc/Back`
4. ✅ Should trigger Esc/Back action (will show menu back when menus implemented)

**Step 3: Power Off Test**
1. Device is ON
2. Hold power button for 800ms+
3. ✅ Device should power OFF (LCD gray tint)
4. ✅ Console should show: `[BUTTON] Power: LONG PRESS (XXXms) - Power OFF`
5. ✅ Console should show: `[STATE] Device powered OFF`

**Step 4: All Buttons Test**
1. Power device ON
2. Click each button once (Soft Keys 1-4, Navigation buttons, Function buttons)
3. ✅ Each click should show console log: `[BUTTON] [Button Name]: SHORT PRESS`
4. ✅ Each button should show visual pressed state briefly

**Step 5: Keyboard Test**
1. Power device ON
2. Press ArrowUp → ✅ Console: `[KEYBOARD] ArrowUp → Up button`
3. Press ArrowDown → ✅ Console: `[KEYBOARD] ArrowDown → Down button`
4. Press Enter → ✅ Console: `[KEYBOARD] Enter → Enter button`
5. Press Escape → ✅ Console: `[KEYBOARD] Escape → Esc/Back`

**Step 6: Long Press Timing Test**
1. Power device ON
2. Hold power button for exactly 700ms, then release
3. ✅ Should NOT power off (too short)
4. ✅ Console should show: `[BUTTON] Power: SHORT PRESS - Esc/Back` (or cancelled)
5. Hold power button for 850ms, then release
6. ✅ Should power off (long enough)
7. ✅ Console should show: `[BUTTON] Power: LONG PRESS (850ms) - Power OFF`

### Debug Mode (Optional Enhancement)

**If implementing debug mode, add keyboard shortcut:**
- Press `Ctrl+D` (or `Cmd+D` on Mac) to toggle debug mode
- Debug mode shows:
  - Button press timing (ms)
  - Button press count
  - Current device state
  - Current display state
  - Active event listeners count

### Expected Console Output Example

```
[BUTTON] Power: LONG PRESS (823ms) - Power ON
[STATE] Device powered ON
[STATE] Device initialized
[DISPLAY] Screen context: home
[BUTTON] Soft Key 1: SHORT PRESS
[BUTTON] Soft Key 2: SHORT PRESS
[BUTTON] Up: SHORT PRESS
[KEYBOARD] ArrowDown → Down button
[BUTTON] Down: SHORT PRESS
[BUTTON] Power: SHORT PRESS - Esc/Back
[BUTTON] Power: LONG PRESS (801ms) - Power OFF
[STATE] Device powered OFF
[DISPLAY] Screen context: off
```

### Troubleshooting

**If buttons don't respond:**
1. Check browser console for JavaScript errors
2. Verify script tags are loaded in `index.html`
3. Check button class names match `index.html` structure
4. Verify event delegation is set up correctly

**If long press doesn't work:**
1. Check console for timing logs (should show ms duration)
2. Verify timer is set to ~800ms (not 80ms or 8000ms)
3. Test with console: hold button and watch for timer logs

**If keyboard doesn't work:**
1. Check browser console for keydown/keyup events
2. Verify key codes are correct (ArrowUp = 38, etc.)
3. Test in different browsers (Chrome, Firefox, Safari)

**If device state doesn't update:**
1. Check `device.js` exports are correct
2. Verify state update functions are called
3. Check LCD classes update in DOM inspector

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Create:**
- `js/device.js` - Device state management (power on/off, initialization)
- `js/menu.js` - Navigation state machine structure (full implementation in Task 3.0)

**Files to Modify:**
- `index.html` - Add script tags for new modules (`device.js`, `buttons.js`, `menu.js`, `display.js`)
- `js/buttons.js` - Complete implementation (currently empty)
- `js/display.js` - Add state management functions (currently empty)
- `js/config.js` - May need to reference for default configuration values during initialization

**Files to Reference:**
- `PRD.md` - Requirements reference (Requirements 8-12)
- `assets/Quest Sound Meter.png` - Device background image
- Firmware R.13J documentation PDFs in `Documents/` folder
- `tasks/task-1-0.md` - Reference for HTML structure and button classes

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements (Requirements 8-12)
   - Review relevant firmware R.13J documentation for button behavior
   - Understand current codebase state (Task 1.0 complete)
   - Check `index.html` for button class names and structure
   - Review button positioning from Task 1.0

2. **Implement Sub-tasks Sequentially:**
   - Implement 2.1: Create `js/device.js` module with device state object (power on/off, initialization)
   - Implement 2.2: Implement power on/off functionality with device initialization on power on
   - Implement 2.3: Create `js/buttons.js` module with button event delegation system
   - Implement 2.4: Implement short press detection for all buttons (immediate action on mouse/keyboard up)
   - Implement 2.5: Implement long press detection (~800ms hold) for power button
   - Implement 2.6: Implement On/Off button dual functionality: short press = Esc/Back, long press = Power toggle
   - Implement 2.7: Create keyboard input handlers in `buttons.js` for Arrow keys (Up/Down/Left/Right), Enter, and Esc
   - Implement 2.8: Map keyboard events to corresponding button actions
   - Implement 2.9: Create navigation state machine structure in `js/menu.js` for managing screen states
   - Implement 2.10: Implement display state management for device on/off states, backlight states, and active screen context
   - Implement 2.11: Connect button handlers to state machine for screen transitions

3. **Testing & Debugging (CRITICAL):**
   - **MUST implement console logging** for all button presses with format: `[BUTTON] ButtonName: SHORT PRESS` or `[BUTTON] Power: LONG PRESS (XXXms)`
   - **MUST implement console logging** for keyboard events: `[KEYBOARD] ArrowUp → Up button`
   - **MUST implement console logging** for state changes: `[STATE] Device powered ON/OFF`
   - **MUST implement visual button press feedback** (CSS class `.button--pressed` added on press, removed on release)
   - **MUST log long press timing** in milliseconds for verification
   - Test power on/off functionality (long press power button)
   - Test short press detection on all buttons
   - Test long press detection (~800ms) on power button
   - Test On/Off button dual functionality (short = Esc/Back, long = Power)
   - Test keyboard input (Arrow keys, Enter, Esc)
   - Verify keyboard and mouse produce same behavior
   - Test display state updates when power state changes
   - Verify LCD classes update correctly (powered-off state)
   - Test each feature matches firmware R.13J behavior
   - Verify all PRD requirements are met
   - Follow testing checklist in Section 10.5
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining event delegation pattern
   - Document long press timing (~800ms)
   - Document button action mappings
   - Document keyboard-to-button mappings
   - Comment complex state transitions
   - Document any deviations from firmware (should be none)

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if firmware documentation is unclear
- Show event delegation setup clearly
- Demonstrate long press detection logic

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern (export/import or IIFE with exports)
- Comment complex calculations and state transitions
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly
- Use event delegation for button handling (single listener)
- Long press must be exactly ~800ms

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- New JavaScript modules created - `index.html` must include script tags
- Button elements become functional - may reveal positioning issues from Task 1.0
- Device state management introduced - all future features depend on this
- Display state management introduced - LCD rendering depends on this (Task 6.0)

**Performance Concerns:**
- Event delegation pattern ensures efficient event handling (single listener)
- Long press timers must be cleaned up to prevent memory leaks
- State updates should trigger minimal DOM manipulation
- Keyboard event handlers should prevent default behavior efficiently

**User Workflow Impacts:**
- Users can now power on device (previously impossible)
- Users can interact with buttons (previously non-functional)
- Keyboard navigation enables accessibility
- Power on/off must feel responsive and match real device behavior

**Future Dependencies:**
- Task 3.0 (Menu System) depends on navigation state machine structure
- Task 3.0 depends on button handlers and screen context tracking
- Task 4.0 (Configuration) depends on button handlers for menu navigation
- Task 5.0 (Measurement Engine) depends on Run/Pause/Stop button handlers
- Task 6.0 (Display Behavior) depends on display state management
- All future tasks depend on device state management (power on/off)

**Risk Mitigation:**
- Test long press detection thoroughly (~800ms timing)
- Ensure event delegation doesn't miss button clicks
- Verify keyboard and mouse produce identical behavior
- Test power on/off initialization doesn't cause errors
- Verify state updates don't cause display flicker
- Test edge cases (rapid button presses, power off during actions)

---

**Ready to Implement?**
This task implements Core Interaction System - Button Handlers and State Management. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete. This is a critical foundation task - all subsequent features depend on proper button handling and state management.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

