# Phase 3 Batch 1 Testing Guide - AUTO RUN, DATETIME, DIGITAL OUT Menus

## Overview
This guide provides detailed step-by-step instructions for testing the first batch of Phase 3 Setup submenus: AUTO RUN, DATETIME, and DIGITAL OUT. Test each menu before proceeding to the next batch.

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
- ✅ No errors related to `AUTO_RUN_MENU_ITEMS`, `DATETIME_MENU_ITEMS`, or `DIGITAL_OUT_MENU_ITEMS`

### If Errors Found:
- Stop and report the error before proceeding

---

## Test 2: Setup Menu Navigation to AUTO RUN

### Steps:
1. Power on device (press Power button if device is OFF)
2. Navigate to SETUP menu:
   - Press DOWN arrow key 3 times to select "SETUP" (index `3`)
   - Press ENTER
3. Navigate to AUTO RUN:
   - Press DOWN arrow key 2 times to select "AUTO RUN" (index `2`)
   - Press ENTER
4. Check current view: `window.getMainFSMState().viewId`
5. Check selected index: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Navigates to `auto_run_menu`
- ✅ `window.getMainFSMState().viewId` should be `"auto_run_menu"`
- ✅ `window.getMainFSMState().menu.selectedIndex` should be `0` ("ENABLE")
- ✅ Screen title displays: "setup\AUTO RUN"
- ✅ Menu items display:
  - ENABLE
  - START TIME
  - STOP TIME
  - DAYS
- ✅ Soft key 1 displays: "Select"
- ✅ No console errors

### What This Tests:
- ENTER routing works for AUTO RUN from setup_menu
- Navigation history is pushed correctly
- AUTO RUN menu initializes correctly

---

## Test 3: AUTO RUN Menu Navigation (UP/DOWN)

### Steps:
1. Power on device
2. Navigate to SETUP → AUTO RUN
3. Check initial selected index: `window.getMainFSMState().menu.selectedIndex`
4. Press DOWN arrow key
5. Check console: `window.getMainFSMState().menu.selectedIndex`
6. Press DOWN arrow key again
7. Check console again: `window.getMainFSMState().menu.selectedIndex`
8. Press UP arrow key
9. Check console: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("ENABLE")
- ✅ After first DOWN: `selectedIndex` is `1` ("START TIME")
- ✅ After second DOWN: `selectedIndex` is `2` ("STOP TIME")
- ✅ After UP: `selectedIndex` is `1` ("START TIME")
- ✅ Navigation wraps correctly (from last item to first, from first to last)
- ✅ Visual highlight should move
- ✅ Console shows log messages: `[MENU] Auto Run menu - Selected index: X → "ITEM_NAME"`
- ✅ No console errors

### Verify Menu Items:
1. In console, type: `window.getMainFSMState().menu.selectedIndex`
2. Should return a number between `0` and `3` (4 items in AUTO_RUN_MENU_ITEMS)

### What This Tests:
- UP/DOWN navigation works in auto_run_menu
- Navigation wraps correctly
- State updates correctly
- Console logging works

---

## Test 4: AUTO RUN Menu ENTER Handler

### Steps:
1. Power on device
2. Navigate to SETUP → AUTO RUN
3. Select "ENABLE" (index `0`)
4. Press ENTER
5. Check console for log message
6. Select "START TIME" (index `1`) and press ENTER
7. Check console for log message

### Expected Result:
- ✅ ENTER does not navigate to a different screen (stays on `auto_run_menu`)
- ✅ Console shows log message: `[AUTO RUN] Selected item: ENABLE (editing not yet implemented)`
- ✅ Console shows log message: `[AUTO RUN] Selected item: START TIME (editing not yet implemented)`
- ✅ No console errors
- ✅ View remains `auto_run_menu`

### What This Tests:
- ENTER handler is stubbed correctly
- Console logging works for debugging
- Menu remains navigable after ENTER
- Parameter editing is deferred to future phase

---

## Test 5: AUTO RUN Menu ESC Navigation

### Steps:
1. Power on device
2. Navigate to SETUP → AUTO RUN
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ ESC from `auto_run_menu` returns to `setup_menu`
- ✅ History is popped correctly:
  - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
  - `setup_menu` should be removed from history stack
- ✅ No console errors

### What This Tests:
- ESC navigation works from auto_run_menu
- History is popped correctly
- Back navigation works through menu hierarchy

---

## Test 6: Setup Menu Navigation to DATETIME

### Steps:
1. Power on device
2. Navigate to SETUP menu
3. Navigate to DATETIME:
   - Press DOWN arrow key 3 times to select "DATETIME" (index `3`)
   - Press ENTER
4. Check current view: `window.getMainFSMState().viewId`
5. Check selected index: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Navigates to `datetime_menu`
- ✅ `window.getMainFSMState().viewId` should be `"datetime_menu"`
- ✅ `window.getMainFSMState().menu.selectedIndex` should be `0` ("DATE")
- ✅ Screen title displays: "setup\DATETIME"
- ✅ Menu items display:
  - DATE
  - TIME
- ✅ Soft key 1 displays: "Select"
- ✅ No console errors

### What This Tests:
- ENTER routing works for DATETIME from setup_menu
- Navigation history is pushed correctly
- DATETIME menu initializes correctly

---

## Test 7: DATETIME Menu Navigation (UP/DOWN)

### Steps:
1. Power on device
2. Navigate to SETUP → DATETIME
3. Check initial selected index: `window.getMainFSMState().menu.selectedIndex`
4. Press DOWN arrow key
5. Check console: `window.getMainFSMState().menu.selectedIndex`
6. Press UP arrow key
7. Check console: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("DATE")
- ✅ After DOWN: `selectedIndex` is `1` ("TIME")
- ✅ After UP: `selectedIndex` is `0` ("DATE")
- ✅ Navigation wraps correctly (from last item to first, from first to last)
- ✅ Visual highlight should move
- ✅ Console shows log messages: `[MENU] Date/Time menu - Selected index: X → "ITEM_NAME"`
- ✅ No console errors

### Verify Menu Items:
1. In console, type: `window.getMainFSMState().menu.selectedIndex`
2. Should return a number between `0` and `1` (2 items in DATETIME_MENU_ITEMS)

### What This Tests:
- UP/DOWN navigation works in datetime_menu
- Navigation wraps correctly
- State updates correctly
- Console logging works

---

## Test 8: DATETIME Menu ENTER - Routes to Edit Screen

### Steps:
1. Power on device
2. Navigate to SETUP → DATETIME
3. Select "DATE" (index `0`)
4. Check history before ENTER: `window.getMainFSMState().history`
5. Press ENTER
6. Check view after ENTER: `window.getMainFSMState().viewId`
7. Check history after ENTER: `window.getMainFSMState().history`

### Expected Result:
- ✅ Navigates to `datetime_edit`
- ✅ `window.getMainFSMState().viewId` should be `"datetime_edit"`
- ✅ History should contain `datetime_menu`:
  - `window.getMainFSMState().history` should contain `["home_screen_dim", "setup_menu", "datetime_menu"]` (or similar)
- ✅ Screen title displays: "DATETIME"
- ✅ Edit item displays: "Date: 01/01/2024"
- ✅ Soft keys display: "Save", "Cancel"
- ✅ No console errors

### What This Tests:
- ENTER routing works from datetime_menu to datetime_edit
- Navigation history is pushed correctly
- DATETIME edit screen displays correctly

---

## Test 9: DATETIME Edit Screen ENTER - Save and Return

### Steps:
1. Power on device
2. Navigate to SETUP → DATETIME → DATE (press ENTER)
3. Check history before ENTER: `window.getMainFSMState().history`
4. Press ENTER (to save)
5. Check view after ENTER: `window.getMainFSMState().viewId`
6. Check history after ENTER: `window.getMainFSMState().history`

### Expected Result:
- ✅ Returns to `datetime_menu`
- ✅ `window.getMainFSMState().viewId` should be `"datetime_menu"`
- ✅ History is popped correctly:
  - `window.getMainFSMState().history` should no longer contain `datetime_edit`
- ✅ No console errors

### What This Tests:
- ENTER on datetime_edit saves and returns to datetime_menu
- History is popped correctly
- Navigation flow works correctly

---

## Test 10: DATETIME Edit Screen ESC - Cancel and Return

### Steps:
1. Power on device
2. Navigate to SETUP → DATETIME → DATE (press ENTER)
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC (to cancel)
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ Returns to `datetime_menu`
- ✅ `window.getMainFSMState().viewId` should be `"datetime_menu"`
- ✅ History is popped correctly:
  - `window.getMainFSMState().history` should no longer contain `datetime_edit`
- ✅ No console errors

### What This Tests:
- ESC on datetime_edit cancels and returns to datetime_menu
- History is popped correctly
- Cancel navigation works correctly

---

## Test 11: DATETIME Menu ESC Navigation

### Steps:
1. Power on device
2. Navigate to SETUP → DATETIME
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ ESC from `datetime_menu` returns to `setup_menu`
- ✅ History is popped correctly:
  - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
  - `setup_menu` should be removed from history stack
- ✅ No console errors

### What This Tests:
- ESC navigation works from datetime_menu
- History is popped correctly
- Back navigation works through menu hierarchy

---

## Test 12: Setup Menu Navigation to DIGITAL OUT

### Steps:
1. Power on device
2. Navigate to SETUP menu
3. Navigate to DIGITAL OUT:
   - Press DOWN arrow key 4 times to select "DIGITAL OUT" (index `4`)
   - Press ENTER
4. Check current view: `window.getMainFSMState().viewId`
5. Check selected index: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Navigates to `digital_out_menu`
- ✅ `window.getMainFSMState().viewId` should be `"digital_out_menu"`
- ✅ `window.getMainFSMState().menu.selectedIndex` should be `0` ("ENABLE")
- ✅ Screen title displays: "setup\DIGITAL OUT"
- ✅ Menu items display:
  - ENABLE
  - FORMAT
  - BAUD RATE
  - DATA RATE
- ✅ Soft key 1 displays: "Select"
- ✅ No console errors

### What This Tests:
- ENTER routing works for DIGITAL OUT from setup_menu
- Navigation history is pushed correctly
- DIGITAL OUT menu initializes correctly

---

## Test 13: DIGITAL OUT Menu Navigation (UP/DOWN)

### Steps:
1. Power on device
2. Navigate to SETUP → DIGITAL OUT
3. Check initial selected index: `window.getMainFSMState().menu.selectedIndex`
4. Press DOWN arrow key
5. Check console: `window.getMainFSMState().menu.selectedIndex`
6. Press DOWN arrow key again
7. Check console again: `window.getMainFSMState().menu.selectedIndex`
8. Press UP arrow key
9. Check console: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("ENABLE")
- ✅ After first DOWN: `selectedIndex` is `1` ("FORMAT")
- ✅ After second DOWN: `selectedIndex` is `2` ("BAUD RATE")
- ✅ After UP: `selectedIndex` is `1` ("FORMAT")
- ✅ Navigation wraps correctly (from last item to first, from first to last)
- ✅ Visual highlight should move
- ✅ Console shows log messages: `[MENU] Digital Out menu - Selected index: X → "ITEM_NAME"`
- ✅ No console errors

### Verify Menu Items:
1. In console, type: `window.getMainFSMState().menu.selectedIndex`
2. Should return a number between `0` and `3` (4 items in DIGITAL_OUT_MENU_ITEMS)

### What This Tests:
- UP/DOWN navigation works in digital_out_menu
- Navigation wraps correctly
- State updates correctly
- Console logging works

---

## Test 14: DIGITAL OUT Menu ENTER Handler

### Steps:
1. Power on device
2. Navigate to SETUP → DIGITAL OUT
3. Select "ENABLE" (index `0`)
4. Press ENTER
5. Check console for log message
6. Select "BAUD RATE" (index `2`) and press ENTER
7. Check console for log message

### Expected Result:
- ✅ ENTER does not navigate to a different screen (stays on `digital_out_menu`)
- ✅ Console shows log message: `[DIGITAL OUT] Selected item: ENABLE (editing not yet implemented)`
- ✅ Console shows log message: `[DIGITAL OUT] Selected item: BAUD RATE (editing not yet implemented)`
- ✅ No console errors
- ✅ View remains `digital_out_menu`

### What This Tests:
- ENTER handler is stubbed correctly
- Console logging works for debugging
- Menu remains navigable after ENTER
- Parameter editing is deferred to future phase

---

## Test 15: DIGITAL OUT Menu ESC Navigation

### Steps:
1. Power on device
2. Navigate to SETUP → DIGITAL OUT
3. Check history before ESC: `window.getMainFSMState().history`
4. Press ESC
5. Check view after ESC: `window.getMainFSMState().viewId`
6. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ ESC from `digital_out_menu` returns to `setup_menu`
- ✅ History is popped correctly:
  - `window.getMainFSMState().history` should be empty `[]` or contain fewer items
  - `setup_menu` should be removed from history stack
- ✅ No console errors

### What This Tests:
- ESC navigation works from digital_out_menu
- History is popped correctly
- Back navigation works through menu hierarchy

---

## Test 16: Navigation Flow - All Three Menus in Sequence

### Steps:
1. Power on device
2. Navigate to SETUP menu
3. Test AUTO RUN:
   - Navigate to AUTO RUN (DOWN 2 times, ENTER)
   - Navigate UP/DOWN a few times
   - Press ESC to return to setup_menu
4. Test DATETIME:
   - Navigate to DATETIME (DOWN 3 times, ENTER)
   - Navigate UP/DOWN
   - Press ENTER to go to datetime_edit
   - Press ESC to return to datetime_menu
   - Press ESC to return to setup_menu
5. Test DIGITAL OUT:
   - Navigate to DIGITAL OUT (DOWN 4 times, ENTER)
   - Navigate UP/DOWN a few times
   - Press ESC to return to setup_menu

### Expected Result:
- ✅ All three menus navigate correctly
- ✅ History stack is maintained correctly throughout
- ✅ ESC returns to setup_menu from all menus
- ✅ DATETIME edit screen navigation works correctly
- ✅ No console errors
- ✅ No navigation issues or stuck states

### What This Tests:
- Complete navigation flow works correctly
- History stack management works across multiple menus
- No state corruption or navigation bugs

---

## Test 17: Menu Item Count Verification

### Steps:
1. Power on device
2. Navigate to SETUP → AUTO RUN
3. In console, check: `window.getMainFSMState().menu.selectedIndex`
4. Navigate to SETUP → DATETIME
5. In console, check: `window.getMainFSMState().menu.selectedIndex`
6. Navigate to SETUP → DIGITAL OUT
7. In console, check: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ AUTO RUN: `selectedIndex` can be 0-3 (4 items)
- ✅ DATETIME: `selectedIndex` can be 0-1 (2 items)
- ✅ DIGITAL OUT: `selectedIndex` can be 0-3 (4 items)
- ✅ Navigation wraps correctly at boundaries
- ✅ No console errors

### What This Tests:
- Menu item counts are correct
- Navigation boundaries work correctly
- No index out of bounds errors

---

## Summary Checklist

After completing all tests, verify:

- ✅ AUTO RUN menu displays correctly
- ✅ AUTO RUN navigation (UP/DOWN) works
- ✅ AUTO RUN ENTER handler logs correctly
- ✅ AUTO RUN ESC returns to setup_menu
- ✅ DATETIME menu displays correctly
- ✅ DATETIME navigation (UP/DOWN) works
- ✅ DATETIME ENTER routes to datetime_edit
- ✅ DATETIME edit screen displays correctly
- ✅ DATETIME edit ENTER saves and returns
- ✅ DATETIME edit ESC cancels and returns
- ✅ DATETIME menu ESC returns to setup_menu
- ✅ DIGITAL OUT menu displays correctly
- ✅ DIGITAL OUT navigation (UP/DOWN) works
- ✅ DIGITAL OUT ENTER handler logs correctly
- ✅ DIGITAL OUT ESC returns to setup_menu
- ✅ History stack management works correctly
- ✅ No console errors
- ✅ No navigation bugs or stuck states

---

## Known Limitations

1. **Parameter Editing**: ENTER on menu items in AUTO RUN and DIGITAL OUT only logs to console - actual editing functionality will be implemented in a future phase
2. **DATETIME Edit**: The datetime_edit screen has basic navigation but date/time editing functionality is not yet implemented
3. **Menu Item Values**: Menu items display as simple text lists - value editing and display will be added in future phases

---

## Next Steps

After completing these tests, proceed to implement the next batch:
- OPTIONS menu
- SIG INPUT menu
- LOGGING menu
- COMMS menu (and comms_edit)
- BATTERY menu

