# Phase 3 Testing Guide - Setup Menu Hierarchy

## Overview
This guide provides detailed step-by-step instructions for testing Phase 3 implementation. Test each item before proceeding to Phase 4.

---

## Prerequisites
1. Open `index.html` in a browser (use a local server if needed)
2. Open browser Developer Tools (F12 or Cmd+Option+I)
3. Go to the Console tab
4. Ensure Phase 1 and Phase 2 tests have passed
5. Ensure no errors appear on page load

---

## Test 1: Console Errors Check

### Steps:
1. Load the page
2. Check the browser console

### Expected Result:
- ✅ No red error messages
- ✅ Console may show initialization logs
- ✅ No errors related to `DISPLAY_MENU_ITEMS` or setup menu navigation

### If Errors Found:
- Stop and report the error before proceeding

---

## Test 2: Setup Menu Navigation (UP/DOWN)

### Steps:
1. Power on device (press Power button if device is OFF)
2. Navigate to SETUP menu:
   - Press DOWN arrow key 3 times to select "SETUP" (index `3`)
   - Press ENTER
3. Check current view: `window.getMainFSMState().viewId` should be `"setup_menu"`
4. Press DOWN arrow key
5. Check console: `window.getMainFSMState().menu.selectedIndex`
6. Press DOWN arrow key again
7. Check console again: `window.getMainFSMState().menu.selectedIndex`
8. Press UP arrow key
9. Check console: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("MEASURE")
- ✅ After first DOWN: `selectedIndex` is `1` ("METER SET")
- ✅ After second DOWN: `selectedIndex` is `2` ("AUTO RUN")
- ✅ After UP: `selectedIndex` is `1` ("METER SET")
- ✅ Navigation wraps correctly (from last item to first, from first to last)
- ✅ Visual highlight should move
- ✅ No console errors

### Verify Menu Items:
1. In console, type: `window.getMainFSMState().menu.selectedIndex`
2. Should return a number between `0` and `10` (11 items in SETUP_MENU_ITEMS)

### What This Tests:
- UP/DOWN navigation works in setup_menu
- Navigation wraps correctly
- State updates correctly

---

## Test 3: Setup Menu ENTER Routing - METER SET

### Steps:
1. Power on device
2. Navigate to SETUP menu (press DOWN 3 times, press ENTER)
3. Navigate to "METER SET" (press DOWN once, index `1`)
4. Check history before: `window.getMainFSMState().history`
5. Press ENTER
6. Check view after: `window.getMainFSMState().viewId`
7. Check history after: `window.getMainFSMState().history`

### Expected Result:
- ✅ Navigates to `meter_set_menu`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"meter_set_menu"`
- ✅ History should contain previous views:
   - `window.getMainFSMState().history` should contain `["home_screen"]` or `["home_screen_dim"]` and `["setup_menu"]`
   - History will show: `["home_screen_dim", "setup_menu"]` (or `["home_screen", "setup_menu"]` if you started from home_screen)
- ✅ Meter Set selectedIndex should be `0`:
   - `window.getMainFSMState().meterSet.selectedIndex` should be `0`
- ✅ No console errors

### What This Tests:
- ENTER routing works for METER SET
- Navigation history is pushed correctly
- Meter Set menu initializes correctly

---

## Test 4: Setup Menu ENTER Routing - All Submenus

### Steps:
1. Power on device
2. Navigate to SETUP menu
3. Test each menu item by:
   - Navigate to item (UP/DOWN)
   - Press ENTER
   - Check `window.getMainFSMState().viewId`
   - Press ESC to return to setup_menu
   - Repeat for next item

### Menu Items to Test:
- **MEASURE** (index `0`) → `measure_menu`
- **METER SET** (index `1`) → `meter_set_menu`
- **AUTO RUN** (index `2`) → `auto_run_menu`
- **DATETIME** (index `3`) → `datetime_menu`
- **DIGITAL OUT** (index `4`) → `digital_out_menu`
- **OPTIONS** (index `5`) → `options_menu`
- **SIG INPUT** (index `6`) → `sig_input_menu`
- **LOGGING** (index `7`) → `logging_menu`
- **COMMS** (index `8`) → `comms_menu`
- **BATTERY** (index `9`) → `battery_menu`
- **DISPLAY** (index `10`) → `display_menu`

### Expected Result:
- ✅ Each menu item navigates to correct viewId
- ✅ History is pushed for each navigation
- ✅ ESC returns to `setup_menu` correctly
- ✅ No console errors

### What This Tests:
- All setup menu items route correctly
- History stack is maintained correctly
- ESC navigation works from all submenus

---

## Test 5: Meter Set Menu Navigation (UP/DOWN)

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET (press DOWN 3 times, ENTER, then DOWN once to select METER SET, ENTER)
3. Check current view: `window.getMainFSMState().viewId` should be `"meter_set_menu"`
4. Verify screen title displays: "setup\METER SET 1"
5. Verify soft key labels display:
   - Softkey 1: (empty)
   - Softkey 2: "F-S-I"
   - Softkey 3: "R-C-Z-F"
   - Softkey 4: "METER 1"
6. Press DOWN arrow key
7. Check console: `window.getMainFSMState().meterSet.selectedIndex`
8. Press DOWN arrow key again
9. Check console: `window.getMainFSMState().meterSet.selectedIndex`
10. Press UP arrow key
11. Check console: `window.getMainFSMState().meterSet.selectedIndex`

### Expected Result:
- ✅ Screen title displays: "setup\METER SET 1"
- ✅ Soft key labels display correctly:
   - Softkey 1: (empty)
   - Softkey 2: "F-S-I"
   - Softkey 3: "R-C-Z-F"
   - Softkey 4: "METER 1"
- ✅ Initial `window.getMainFSMState().meterSet.selectedIndex` is `0` ("THRESHOLD")
- ✅ After first DOWN: `window.getMainFSMState().meterSet.selectedIndex` is `1` ("EXCHANGE RATE")
- ✅ After second DOWN: `window.getMainFSMState().meterSet.selectedIndex` is `2` ("CRITERION LEVEL")
- ✅ After UP: `window.getMainFSMState().meterSet.selectedIndex` is `1` ("EXCHANGE RATE")
- ✅ Navigation wraps correctly
- ✅ **Only the TITLE is highlighted** (not the whole line) - e.g., "THRESHOLD" is highlighted, "80 dB" is not
- ✅ Items display with left-aligned title and right-aligned value+unit (e.g., "THRESHOLD" on left, "80 dB" on right)
- ✅ Soft key labels are displayed but NOT functional yet (navigation will be implemented in a later phase)
- ✅ No console errors

### Verify Meter Set Items:
1. In console, type: `window.getMainFSMState().meterSet.selectedIndex`
2. Should return a number between `0` and `4` (5 items in METER_SET_ITEMS)
3. Check items: `window.getMainFSMState().meterSet.items` should show:
   - THRESHOLD: 80 dB
   - EXCHANGE RATE: 3 dB
   - CRITERION LEVEL: 85 dB
   - UPPER LIMIT: 115 dB
   - PROJECTED TIME: 8 Hr
4. **Note:** Always use the full path `window.getMainFSMState().meterSet.selectedIndex` - don't use just `meterSet.selectedIndex`

### What This Tests:
- UP/DOWN navigation works in meter_set_menu
- Meter Set menu state updates correctly

---

## Test 6: Meter Set Editing Mode - Enter Edit Mode

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET
3. Ensure first item "THRESHOLD" is selected (index `0`)
4. Verify only the title "THRESHOLD" is highlighted (not the whole line)
5. Press ENTER

### Expected Result:
- ✅ Stays on `meter_set_menu` (does NOT navigate to separate edit screen)
- ✅ Check console: `window.getMainFSMState().viewId` should be `"meter_set_menu"`
- ✅ `window.getMainFSMState().meterSet.editing` should be `true`
- ✅ `window.getMainFSMState().meterSet.focus` should be `"value"` (editing value, not title)
- ✅ The title highlight disappears and the value "80 dB" should be highlighted/emphasized (different background color)
- ✅ No console errors

### What This Tests:
- ENTER switches focus from title to value field and enters edit mode
- Edit mode state is set correctly
- Focus is set to value (not title)
- Value is visually highlighted when editing (title highlight disappears)

---

## Test 7: Meter Set Editing Mode - UP/DOWN Adjust Values

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET
3. Select "THRESHOLD" (index `0`) and press ENTER to enter edit mode
4. Verify you're still on `meter_set_menu` (not a separate edit screen)
5. Ensure focus is on value: `window.getMainFSMState().meterSet.focus` should be `"value"`
6. Verify the value "80 dB" is highlighted
7. Test with "THRESHOLD" item (numeric value, min: 0, max: 140, step: 1):
   - Check initial value: `window.getMainFSMState().meterSet.items[0].value` should be `80`
   - Press DOWN arrow key (decreases value)
   - Check value: `window.getMainFSMState().meterSet.items[0].value` should be `79`
   - Press DOWN arrow key again
   - Check value: should be `78`
   - Press UP arrow key (increases value)
   - Check value: should be `79`
8. Navigate to "EXCHANGE RATE" item (numeric value, min: 3, max: 6, step: 1):
   - Press ESC to exit edit mode
   - Press DOWN once to select "EXCHANGE RATE" (index `1`)
   - Press ENTER to enter edit mode
   - Verify you're still on `meter_set_menu`
   - Press DOWN arrow key
   - Check value: `window.getMainFSMState().meterSet.items[1].value` (should decrease, but not below 3)
   - Verify value updates on screen in real-time
   - Press UP arrow key
   - Check value (should increase, but not above 6)

### Expected Result:
- ✅ For "THRESHOLD" (numeric):
   - DOWN decreases value (within min/max bounds: 0-140)
   - UP increases value (within min/max bounds: 0-140)
- ✅ For "EXCHANGE RATE" (numeric):
   - DOWN decreases value (within min/max bounds: 3-6)
   - UP increases value (within min/max bounds: 3-6)
- ✅ Values update in state correctly
- ✅ Values stay within min/max bounds
- ✅ No console errors

### What This Tests:
- UP/DOWN adjusts numeric values in edit mode
- Numeric values increment/decrement correctly
- Value bounds are respected (min/max constraints)
- Different items have different bounds (THRESHOLD: 0-140, EXCHANGE RATE: 3-6)

---

## Test 8: Meter Set Editing Mode - LEFT Arrow Focus Navigation

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET
3. Select "THRESHOLD" (index `0`) and press ENTER to enter edit mode
4. Verify you're still on `meter_set_menu` (not a separate edit screen)
5. Check initial focus: `window.getMainFSMState().meterSet.focus` should be `"value"`
6. Verify the value "80 dB" is highlighted
7. Press LEFT arrow key
8. Check focus: `window.getMainFSMState().meterSet.focus` should be `"title"`
9. Verify value highlight disappears and title highlight reappears

### Expected Result:
- ✅ Initial focus is `"value"` (value is highlighted)
- ✅ After LEFT: focus is `"title"` (title is highlighted, value highlight disappears)
- ✅ Focus switches from value back to title correctly
- ✅ LEFT arrow is used to switch from value/off field back to title (to save)
- ✅ No console errors

### What This Tests:
- LEFT arrow switches focus from value field back to title
- Focus state updates correctly
- Visual highlighting updates correctly

---

## Test 9: Meter Set Editing Mode - ENTER Toggle Value/Off and Save

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET
3. Select "THRESHOLD" (index `0`) and press ENTER to enter edit mode
4. Verify you're still on `meter_set_menu` (not a separate edit screen)
5. Verify focus is on value: `window.getMainFSMState().meterSet.focus` should be `"value"`
6. Verify the value "80 dB" is highlighted
7. Press ENTER (while focus is on value)
8. Check focus: `window.getMainFSMState().meterSet.focus` should be `"off"`
9. Verify display shows "off" instead of "80 dB"
10. Verify "off" is highlighted
11. Press ENTER again (while focus is on "off")
12. Check focus: `window.getMainFSMState().meterSet.focus` should be `"value"`
13. Verify display shows "80 dB" again
14. Make a change: Press DOWN to decrease value (e.g., change THRESHOLD from 80 to 79)
15. Verify the value updates in real-time on screen
16. Press LEFT to move focus to "title" (value highlight should disappear, title highlight reappears)
17. Press ENTER to save and exit edit mode

### Expected Result:
- ✅ ENTER on value field toggles to "off": `window.getMainFSMState().meterSet.focus` becomes `"off"`
- ✅ Display shows "off" when focus is on "off"
- ✅ ENTER on "off" switches back to value: `window.getMainFSMState().meterSet.focus` becomes `"value"`
- ✅ Display shows value again
- ✅ After LEFT + ENTER: Exits edit mode: `window.getMainFSMState().meterSet.editing` should be `false`
- ✅ Stays on `meter_set_menu` (viewId remains `"meter_set_menu"`)
- ✅ Value change is saved: Check `window.getMainFSMState().meterSet.items[selectedIndex].value` reflects the change
- ✅ Focus resets: `window.getMainFSMState().meterSet.focus` should be `"title"`
- ✅ No console errors

### What This Tests:
- ENTER toggles between value and "off" when editing value field
- ENTER on "off" switches back to value field
- LEFT arrow switches focus from value/off back to title
- ENTER on title saves and exits edit mode
- Changes persist in state

---

## Test 10: Meter Set Editing Mode - ESC Cancel

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET
3. Select "THRESHOLD" (index `0`) and press ENTER to enter edit mode
4. Verify you're still on `meter_set_menu` (not a separate edit screen)
5. Make a change: Press DOWN to decrease value (e.g., change THRESHOLD from 80 to 79)
6. Verify the value updates in real-time on screen
7. Check value before ESC: `window.getMainFSMState().meterSet.items[0].value` (should show changed value, e.g., `79`)
8. Press ESC
9. Check value after ESC: `window.getMainFSMState().meterSet.items[0].value` (should revert to original value, e.g., `80`)

### Expected Result:
- ✅ Exits edit mode: `window.getMainFSMState().meterSet.editing` should be `false`
- ✅ Stays on `meter_set_menu` (viewId remains `"meter_set_menu"`)
- ✅ Check console: `window.getMainFSMState().viewId` should be `"meter_set_menu"`
- ✅ Value change is NOT saved (should revert to original value)
- ✅ Value highlight disappears (no longer editing)
- ✅ Title highlight reappears (focus returns to title)
- ✅ Focus resets: `window.getMainFSMState().meterSet.focus` should be `"title"`
- ✅ No console errors

### What This Tests:
- ESC cancels editing without saving
- Returns to meter_set_menu correctly
- State is reset correctly
- Focus returns to title after cancel

---

## Test 11: Display Menu Navigation (UP/DOWN)

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY (press DOWN 3 times, ENTER, then DOWN 10 times to select "DISPLAY" (index `10`), ENTER)
3. Check current view: `window.getMainFSMState().viewId` should be `"display_menu"`
4. Press DOWN arrow key
5. Check console: `window.getMainFSMState().menu.selectedIndex`
6. Press DOWN arrow key again
7. Check console: `window.getMainFSMState().menu.selectedIndex`
8. Press UP arrow key
9. Check console: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("LANGUAGE")
- ✅ After first DOWN: `selectedIndex` is `1` ("BACKLIGHT")
- ✅ After second DOWN: `selectedIndex` is `2` ("CONTRAST")
- ✅ After UP: `selectedIndex` is `1` ("BACKLIGHT")
- ✅ Navigation wraps correctly
- ✅ Visual highlight should move
- ✅ No console errors

### Verify Display Menu Items:
1. In console, type: `window.getMainFSMState().menu.selectedIndex`
2. Should return a number between `0` and `2` (3 items in DISPLAY_MENU_ITEMS)

### What This Tests:
- UP/DOWN navigation works in display_menu
- Display menu state updates correctly

---

## Test 12: Display Menu ENTER Routing - LANGUAGE

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY
3. Ensure "LANGUAGE" is selected (index `0`)
4. Check history before: `window.getMainFSMState().history`
5. Press ENTER
6. Check view after: `window.getMainFSMState().viewId`
7. Check history after: `window.getMainFSMState().history`

### Expected Result:
- ✅ Navigates to `display_language`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"display_language"`
- ✅ Screen displays language options: EN, FR, DE, ES
- ✅ Screen title displays: "DISPLAY\LANGUAGE"
- ✅ History should contain previous view:
   - `window.getMainFSMState().history` should contain `["display_menu"]`
- ✅ No console errors

### What This Tests:
- ENTER routing works for LANGUAGE
- Navigation history is pushed correctly
- Display language screen shows language options

---

## Test 12A: Display Language Screen Navigation and Selection

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY → LANGUAGE
3. Verify screen displays language options: EN, FR, DE, ES
4. Check initial language index: `window.getMainFSMState().display.languageIndex` should be `0` (EN)
5. Press DOWN arrow key
6. Check language index: `window.getMainFSMState().display.languageIndex` should be `1` (FR)
7. Check language value: `window.getMainFSMState().display.language` should be `"FR"`
8. Press DOWN arrow key again
9. Check language index: `window.getMainFSMState().display.languageIndex` should be `2` (DE)
10. Press UP arrow key
11. Check language index: `window.getMainFSMState().display.languageIndex` should be `1` (FR)
12. Press ENTER to select FR
13. Check view: `window.getMainFSMState().viewId` should be `"display_menu"`
14. Check language is saved: `window.getMainFSMState().display.language` should be `"FR"`
15. Navigate back to LANGUAGE and verify FR is still selected

### Expected Result:
- ✅ Screen displays language options: EN, FR, DE, ES
- ✅ Initial `languageIndex` is `0` (EN)
- ✅ After first DOWN: `languageIndex` is `1` (FR), `language` is `"FR"`
- ✅ After second DOWN: `languageIndex` is `2` (DE), `language` is `"DE"`
- ✅ After UP: `languageIndex` is `1` (FR), `language` is `"FR"`
- ✅ Navigation wraps correctly
- ✅ Visual highlight should move
- ✅ ENTER saves language and returns to `display_menu`
- ✅ Language persists after selection
- ✅ No console errors

### What This Tests:
- UP/DOWN navigation works in display_language screen
- Language selection updates state correctly
- ENTER saves language and returns to display menu
- Language selection persists

---

## Test 13: Display Menu ENTER Routing - BACKLIGHT

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY
3. Navigate to "BACKLIGHT" (press DOWN once, index `1`)
4. Check history before: `window.getMainFSMState().history`
5. Press ENTER
6. Check view after: `window.getMainFSMState().viewId`
7. Check history after: `window.getMainFSMState().history`

### Expected Result:
- ✅ Navigates to `display_backlight`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"display_backlight"`
- ✅ History should contain previous view:
   - `window.getMainFSMState().history` should contain `["display_menu"]`
- ✅ No console errors

### What This Tests:
- ENTER routing works for BACKLIGHT
- Navigation history is pushed correctly

---

## Test 14: Display Menu ENTER Routing - CONTRAST

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY
3. Navigate to "CONTRAST" (press DOWN twice, index `2`)
4. Check history before: `window.getMainFSMState().history`
5. Press ENTER
6. Check view after: `window.getMainFSMState().viewId`
7. Check history after: `window.getMainFSMState().history`

### Expected Result:
- ✅ Navigates to `display_contrast`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"display_contrast"`
- ✅ History should contain previous view:
   - `window.getMainFSMState().history` should contain `["display_menu"]`
- ✅ No console errors

### What This Tests:
- ENTER routing works for CONTRAST
- Navigation history is pushed correctly

---

## Test 15: Display Contrast LEFT/RIGHT Adjustment

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY → CONTRAST
3. Check initial contrast: `window.getMainFSMState().display.contrast`
4. Press RIGHT arrow key
5. Check contrast: `window.getMainFSMState().display.contrast`
6. Press RIGHT arrow key again
7. Check contrast: `window.getMainFSMState().display.contrast`
8. Press LEFT arrow key
9. Check contrast: `window.getMainFSMState().display.contrast`

### Expected Result:
- ✅ Initial contrast value is set (check state)
- ✅ RIGHT increases contrast: `display.contrast` increases by 1
- ✅ LEFT decreases contrast: `display.contrast` decreases by 1
- ✅ Contrast stays within bounds (0-100)
- ✅ Values update in state correctly
- ✅ No console errors

### What This Tests:
- LEFT/RIGHT adjusts contrast value
- Value bounds are respected (0-100)
- State updates correctly

---

## Test 16: ESC Navigation from Setup Submenus

### Steps:
1. Power on device
2. Navigate to SETUP menu
3. Test ESC from each submenu:
   - Navigate to a submenu (e.g., METER SET → ENTER)
   - Check history before ESC: `window.getMainFSMState().history`
   - Press ESC
   - Check view after ESC: `window.getMainFSMState().viewId`
   - Check history after ESC: `window.getMainFSMState().history`
   - Repeat for other submenus

### Submenus to Test:
- **METER SET** → ESC should return to `setup_menu`
- **MEASURE** → ESC should return to `setup_menu`
- **AUTO RUN** → ESC should return to `setup_menu`
- **DATETIME** → ESC should return to `setup_menu`
- **DIGITAL OUT** → ESC should return to `setup_menu`
- **OPTIONS** → ESC should return to `setup_menu`
- **SIG INPUT** → ESC should return to `setup_menu`
- **LOGGING** → ESC should return to `setup_menu`
- **COMMS** → ESC should return to `setup_menu`
- **BATTERY** → ESC should return to `setup_menu`
- **DISPLAY** → ESC should return to `setup_menu`

### Expected Result:
- ✅ ESC from any submenu returns to `setup_menu`
- ✅ History is popped correctly:
   - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
- ✅ No console errors

### What This Tests:
- ESC navigation works from all setup submenus
- History is popped correctly
- Back navigation works

---

## Test 15: Measure Menu Navigation (UP/DOWN)

### Steps:
1. Power on device
2. Navigate to SETUP → MEASURE (press DOWN 3 times, ENTER, then ensure "MEASURE" is selected (index `0`), press ENTER)
3. Check current view: `window.getMainFSMState().viewId` should be `"measure_menu"`
4. Press DOWN arrow key
5. Check console: `window.getMainFSMState().measure.selectedIndex`
6. Press DOWN arrow key again
7. Check console again: `window.getMainFSMState().measure.selectedIndex`
8. Press UP arrow key
9. Check console: `window.getMainFSMState().measure.selectedIndex`
10. Continue pressing DOWN until you wrap around (should go from last item back to first)

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("L1")
- ✅ After first DOWN: `selectedIndex` is `1` ("L2")
- ✅ After second DOWN: `selectedIndex` is `2` ("L3")
- ✅ After UP: `selectedIndex` is `1` ("L2")
- ✅ Navigation wraps correctly (from index `7` → `0`)
- ✅ Visual highlight moves with selection
- ✅ No console errors

### Verify Measure Menu Items:
1. In console, type: `window.getMainFSMState().measure.selectedIndex`
2. Should return a number between `0` and `7` (8 items in MEASURE_MENU_ITEMS)
3. Check items: `window.getMainFSMState().measure.items` should show:
   - L1 = OFF
   - L2 = OFF
   - L3 = L50
   - L4 = L90
   - LDH = OFF
   - CHEL = OFF
   - Lc-a. = N/A
   - TAKTMX = 3sec

### What This Tests:
- UP/DOWN navigation works in measure_menu
- Selected index updates correctly
- Navigation wraps around correctly
- Measure menu items are displayed correctly in two-column layout

---

## Test 16: Measure Menu Display and Layout

### Steps:
1. Power on device
2. Navigate to SETUP → MEASURE
3. Verify screen title: Should display `setup\MEASURES`
4. Verify two-column layout:
   - Left column should show: L1, L2, L3, L4
   - Right column should show: LDH, CHEL, Lc-a., TAKTMX
5. Verify item format: Each item should display as "title = value" (e.g., "L1 = OFF", "L3 = L50")
6. Check initial selection: First item "L1" should be highlighted
7. Navigate through items and verify highlight moves correctly

### Expected Result:
- ✅ Screen title displays: `setup\MEASURES`
- ✅ Two-column layout is visible
- ✅ Left column has 4 items (L1, L2, L3, L4)
- ✅ Right column has 4 items (LDH, CHEL, Lc-a., TAKTMX)
- ✅ Items display as "title = value" format
- ✅ Initial selection is "L1" (index `0`)
- ✅ Highlight moves correctly with UP/DOWN navigation
- ✅ No console errors

### What This Tests:
- Measure menu screen displays correctly
- Two-column layout works
- Item formatting is correct
- Visual highlighting works

---

## Test 17: Measure Menu ENTER (Stub)

### Steps:
1. Power on device
2. Navigate to SETUP → MEASURE
3. Select "L1" (index `0`) and press ENTER
4. Check console for log message
5. Select "L3" (index `2`) and press ENTER
6. Check console for log message
7. Select "TAKTMX" (index `7`) and press ENTER
8. Check console for log message

### Expected Result:
- ✅ ENTER does not navigate to a different screen (stays on `measure_menu`)
- ✅ Console shows log message: `[MEASURE] Selected item: L1 = OFF (editing not yet implemented)`
- ✅ Console shows log message: `[MEASURE] Selected item: L3 = L50 (editing not yet implemented)`
- ✅ Console shows log message: `[MEASURE] Selected item: TAKTMX = 3sec (editing not yet implemented)`
- ✅ No console errors
- ✅ View remains `measure_menu`

### What This Tests:
- ENTER handler is stubbed correctly
- Console logging works for debugging
- Menu remains navigable after ENTER
- Parameter editing is deferred to future phase

---

## Test 18: ESC Navigation from Measure Menu

### Steps:
1. Power on device
2. Navigate to SETUP → MEASURE
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ ESC from `measure_menu` returns to `setup_menu`
- ✅ History is popped correctly:
   - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
   - `setup_menu` should be removed from history stack
- ✅ No console errors

### What This Tests:
- ESC navigation works from measure_menu
- History is popped correctly
- Back navigation works through menu hierarchy

---

## Test 19: ESC Navigation from Display Submenus

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY
3. Test ESC from each display submenu:
   - Navigate to a submenu (e.g., CONTRAST → ENTER)
   - Check history before ESC: `window.getMainFSMState().history`
   - Press ESC
   - Check view after ESC: `window.getMainFSMState().viewId`
   - Check history after ESC: `window.getMainFSMState().history`
   - Repeat for other submenus

### Display Submenus to Test:
- **LANGUAGE** → ESC should return to `display_menu`
- **BACKLIGHT** → ESC should return to `display_menu`
- **CONTRAST** → ESC should return to `display_menu`

### Expected Result:
- ✅ ESC from any display submenu returns to `display_menu`
- ✅ History is popped correctly:
   - `window.getMainFSMState().history` should contain `["setup_menu"]` (display_menu was popped)
- ✅ No console errors

### What This Tests:
- ESC navigation works from display submenus
- History is popped correctly
- Back navigation works through menu hierarchy

---

## Test 20: ESC Navigation from Display Menu

### Steps:
1. Power on device
2. Navigate to SETUP → DISPLAY
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ ESC from `display_menu` returns to `setup_menu`
- ✅ History is popped correctly:
   - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
- ✅ No console errors

### What This Tests:
- ESC navigation works from display_menu
- History is popped correctly
- Back navigation works

---

## Test 21: ESC Navigation from Meter Set Menu

### Steps:
1. Power on device
2. Navigate to SETUP → METER SET
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ ESC from `meter_set_menu` returns to `setup_menu`
- ✅ History is popped correctly:
   - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
- ✅ `window.getMainFSMState().meterSet.selectedIndex` should be reset to `0`
- ✅ No console errors

### What This Tests:
- ESC navigation works from meter_set_menu
- History is popped correctly
- State is reset correctly

---

## Test 22: Navigation History Stack - Multiple Levels

### Steps:
1. Power on device
2. Navigate through multiple levels:
   - Home → SETUP (check history: should contain `["home_screen"]` or `["home_screen_dim"]`)
   - SETUP → DISPLAY (check history: should contain `["home_screen"]` or `["home_screen_dim"]`, `["setup_menu"]`)
   - DISPLAY → CONTRAST (check history: should contain `["home_screen"]` or `["home_screen_dim"]`, `["setup_menu"]`, `["display_menu"]`)
3. Press ESC multiple times:
   - First ESC: Should return to `display_menu` (history popped: `display_menu`)
   - Second ESC: Should return to `setup_menu` (history popped: `setup_menu`)
   - Third ESC: Should return to `home_screen` (history popped: `home_screen`)

### Expected Result:
- ✅ History stack builds correctly as you navigate deeper
- ✅ Each ESC pops one level from history
- ✅ Navigation returns to correct previous view
- ✅ History is empty after returning to home screen
- ✅ No console errors

### What This Tests:
- Navigation history stack works correctly
- Multiple levels of navigation maintain history
- ESC navigation pops history correctly

---

## Test 23: Complete Setup Menu Flow

### Steps:
1. Power on device
2. Navigate through complete setup menu:
   - Home → SETUP
   - SETUP → METER SET
   - METER SET → Edit mode (ENTER)
   - Make a change (DOWN)
   - Save (LEFT then ENTER)
   - ESC back to SETUP
   - SETUP → DISPLAY
   - DISPLAY → CONTRAST
   - Adjust contrast (RIGHT)
   - ESC back to DISPLAY
   - ESC back to SETUP
   - ESC back to Home

### Expected Result:
- ✅ All navigation works correctly
- ✅ Changes are saved (Meter Set value change persists)
- ✅ Contrast adjustment persists
- ✅ History stack is maintained correctly
- ✅ ESC navigation works at all levels
- ✅ No console errors

### What This Tests:
- Complete setup menu flow works end-to-end
- State persistence works correctly
- Navigation history works correctly
- All Phase 3 features work together

---

## Troubleshooting

### Issue: Setup menu navigation doesn't work
**Solution:**
- Check console for errors
- Verify FSM is initialized: `window.getMainFSMState()` should return an object
- Check `viewId` is `"setup_menu"` before navigation
- Verify button events are being dispatched correctly

### Issue: Meter Set editing doesn't work
**Solution:**
- Verify you're in edit mode: `window.getMainFSMState().meterSet.editing` should be `true`
- Check `viewId` is `"meter_set_menu"` (not `"meter_set_edit"` - editing happens inline)
- Verify `focus` is `"value"` for UP/DOWN to work (not `"title"` or `"off"`)
- Check that `meterSet.items` array exists and has items
- Make sure you pressed ENTER on the title to enter edit mode (focus switches from title to value)

### Issue: Display menu submenus don't navigate
**Solution:**
- Verify `DISPLAY_MENU_ITEMS` constant exists
- Check `viewId` is `"display_menu"` before navigation
- Verify `menu.selectedIndex` is correct (0-2)
- Check console for errors

### Issue: ESC doesn't return to previous screen
**Solution:**
- Check history stack: `window.getMainFSMState().history`
- Verify history was pushed when navigating to submenu
- Check that `_popHistory()` is being called
- Verify `viewId` matches expected value

### Issue: History not updating
**Solution:**
- History is only pushed when navigating FROM setup_menu TO submenu
- Check `window.getMainFSMState().history` after navigating to submenu
- Verify `_pushHistory()` is being called in ENTER handler
- Check that history array exists in state

### Issue: Meter Set values don't change
**Solution:**
- Verify you're in edit mode: `window.getMainFSMState().meterSet.editing` should be `true`
- Check `window.getMainFSMState().meterSet.focus` is `"value"` (not `"title"` or `"off"`)
- For numeric values: Verify `item.min`, `item.max`, `item.step` are defined
- Check that values are within bounds (e.g., THRESHOLD: 0-140, EXCHANGE RATE: 3-6)
- Verify the selected item exists: `window.getMainFSMState().meterSet.items[window.getMainFSMState().meterSet.selectedIndex]`

### Issue: Soft keys don't work on meter_set_menu
**Solution:**
- **This is expected behavior** - Soft key navigation is NOT implemented in Phase 3
- Soft keys are displayed but not functional (F-S-I, R-C-Z-F, METER 1)
- Soft key navigation will be implemented in a later phase (likely Task 4.0 or Phase 4)
- Use UP/DOWN/ENTER/ESC/LEFT for navigation in Phase 3

### Issue: ENTER doesn't toggle between value and "off"
**Solution:**
- Verify you're in edit mode: `window.getMainFSMState().meterSet.editing` should be `true`
- Check `focus` is `"value"` before pressing ENTER (should toggle to `"off"`)
- Check `focus` is `"off"` before pressing ENTER again (should toggle back to `"value"`)
- Verify the item has `enabled` property: `window.getMainFSMState().meterSet.items[selectedIndex].enabled`
- THRESHOLD supports "off" state - other items may not have this feature yet

### Issue: Only title is highlighted, not the whole line
**Solution:**
- **This is correct behavior** - Only the title should be highlighted during navigation
- When you press ENTER, focus switches to value field and value gets highlighted
- Title highlight disappears when value is highlighted

---

## Summary Checklist

Before proceeding to Phase 4, verify:

- ✅ Setup menu UP/DOWN navigation works
- ✅ All setup menu items route correctly (11 items)
- ✅ History is pushed for all setup submenu navigations
- ✅ Meter Set menu UP/DOWN navigation works (5 items: THRESHOLD, EXCHANGE RATE, CRITERION LEVEL, UPPER LIMIT, PROJECTED TIME)
- ✅ Meter Set navigation highlights only the TITLE (not the whole line)
- ✅ Meter Set screen title displays correctly ("setup\METER SET 1")
- ✅ Meter Set soft key labels display correctly (Softkey 1: empty, Softkey 2: "F-S-I", Softkey 3: "R-C-Z-F", Softkey 4: "METER 1")
- ✅ Meter Set items display correctly (left-aligned title, right-aligned value+unit)
- ✅ Meter Set editing mode works:
   - ENTER switches from title to value field
   - ENTER toggles between value and "off" when editing value field
   - LEFT arrow switches from value/off back to title
   - UP/DOWN adjusts numeric values when editing
   - ENTER on title saves and exits edit mode
   - ESC cancels editing
- ✅ Soft key labels are displayed but navigation is NOT functional (will be implemented in later phase)
- ✅ Display menu UP/DOWN navigation works
- ✅ Display menu submenus route correctly (LANGUAGE, BACKLIGHT, CONTRAST)
- ✅ Display language screen displays language options (EN, FR, DE, ES)
- ✅ Display language UP/DOWN navigation works
- ✅ Display language selection saves correctly
- ✅ Display contrast LEFT/RIGHT adjustment works
- ✅ ESC navigation works from all setup submenus
- ✅ ESC navigation works from display menu and submenus
- ✅ Navigation history stack works correctly
- ✅ Complete setup menu flow works end-to-end
- ✅ No console errors

---

## Next Steps

Once all Phase 3 tests pass:
1. ✅ Phase 3 is complete
2. ➡️ Proceed to Phase 4: SLM Operation Flow
3. Phase 4 will implement SLM state transitions, stop hold countdown, SLM view menu, and measurement timer

---

## Notes

- **Setup Menu Navigation:** All 11 setup menu items should route to their respective submenus
- **Meter Set Editing:** Editing happens inline on `meter_set_menu` - UP/DOWN navigation highlights only the TITLE (not the whole line). Pressing ENTER switches focus from title to value field and enters edit mode. When editing the value field, ENTER toggles between the numeric value and "off" (for THRESHOLD and similar items). When on "off", ENTER switches back to value field. Use LEFT arrow to switch focus from value/off back to title. Press ENTER again (when focus is on title) to save. Press ESC to cancel. Focus must be on "value" for UP/DOWN to adjust numeric values. All items are numeric (no options). Values are constrained by min/max bounds.
- **Meter Set Items:** The menu displays 5 items: THRESHOLD (80 dB), EXCHANGE RATE (03 dB), CRITERION LEVEL (85 dB), UPPER LIMIT (115 dB), PROJECTED TIME (08 Hr). Items are displayed with left-aligned titles and right-aligned values+units.
- **Meter Set Screen Title:** Displays "setup\METER SET 1" at the top of the screen.
- **Meter Set Soft Keys:** Soft keys display as: Softkey 1 (empty), Softkey 2 ("F-S-I"), Softkey 3 ("R-C-Z-F"), Softkey 4 ("METER 1"). **Note:** Soft key navigation is NOT implemented in Phase 3 - soft keys are displayed but not functional. Navigation will be implemented in a later phase (likely Task 4.0 or Phase 4).
- **Display Menu:** Display menu has 3 submenus (LANGUAGE, BACKLIGHT, CONTRAST). LANGUAGE displays language options (EN, FR, DE, ES) that can be navigated with UP/DOWN and selected with ENTER. Only CONTRAST has LEFT/RIGHT adjustment.
- **Navigation History:** History is pushed when navigating FROM setup_menu TO submenu. ESC pops history and returns to previous view.
- **State Persistence:** Meter Set value changes persist after saving (ENTER). Contrast adjustments persist immediately.

