# Phase 2 Testing Guide - Home Screen Navigation

## Overview
This guide provides detailed step-by-step instructions for testing Phase 2 implementation. Test each item before proceeding to Phase 3.

---

## Prerequisites
1. Open `index.html` in a browser (use a local server if needed)
2. Open browser Developer Tools (F12 or Cmd+Option+I)
3. Go to the Console tab
4. Ensure Phase 1 tests have passed
5. Ensure no errors appear on page load

---

## Test 1: Console Errors Check

### Steps:
1. Load the page
2. Check the browser console

### Expected Result:
- ✅ No red error messages
- ✅ Console may show initialization logs
- ✅ No errors related to `slmLabelIndex` or SOFT1 handler

### If Errors Found:
- Stop and report the error before proceeding

---

## Test 2: SLM Label Index in State

### Steps:
1. After page loads, open browser console
2. Type: `window.getMainFSMState()`
3. Press Enter
4. **Click the arrow** to expand the returned object
5. Look for `slmLabelIndex` property

### Expected Result:
- ✅ Object contains `slmLabelIndex` property
- ✅ Initial value should be `0` (represents "SLM")
- ✅ No errors when calling `getMainFSMState()`

### Verify Label Index:
1. In console, type: `window.getMainFSMState().slmLabelIndex`
2. Should return: `0`

### What This Tests:
- `slmLabelIndex` exists in state
- State getter function works
- Foundation for label cycling is in place

---

## Test 3: Home Menu UP/DOWN Navigation

### Steps:
1. Power on the device (press Power button if device is OFF)
2. Wait for boot screen to finish (should show home screen)
3. Press DOWN arrow key
4. Check console: `window.getMainFSMState().menu.selectedIndex`
5. Press DOWN arrow key again
6. Check console again: `window.getMainFSMState().menu.selectedIndex`
7. Press UP arrow key
8. Check console: `window.getMainFSMState().menu.selectedIndex`

### Expected Result:
- ✅ Initial `selectedIndex` is `0` ("VIEW PAST STUDIES")
- ✅ After first DOWN: `selectedIndex` is `1` ("VIEW CURRENT STUDY")
- ✅ After second DOWN: `selectedIndex` is `2` ("VIEW SESSION")
- ✅ After UP: `selectedIndex` is `1` ("VIEW CURRENT STUDY")
- ✅ Visual highlight should move (if highlighting is implemented)
- ✅ No console errors

### Verify Menu Items:
1. In console, type: `window.getMainFSMState().menu.selectedIndex`
2. Should return a number between `0` and `4`

### What This Tests:
- UP/DOWN navigation updates `menu.selectedIndex`
- Navigation wraps correctly (or stops at boundaries)
- State updates correctly

---

## Test 4: SOFT1 Label Cycling on Home Screen

### Steps:
1. Power on device (if needed)
2. Ensure you're on home screen (`home_screen` or `home_screen_dim`)
3. Check initial label:
   - Look at SOFT1 label on screen (should show "SLM")
   - Or check console: `window.getMainFSMState().slmLabelIndex` (should be `0`)
4. Press SOFT1 button
5. Check label changed:
   - Look at SOFT1 label on screen (should show "1/1")
   - Check console: `window.getMainFSMState().slmLabelIndex` (should be `1`)
6. Press SOFT1 button again
7. Check label changed:
   - Look at SOFT1 label on screen (should show "1/3")
   - Check console: `window.getMainFSMState().slmLabelIndex` (should be `2`)
8. Press SOFT1 button again
9. Check label cycled back:
   - Look at SOFT1 label on screen (should show "SLM")
   - Check console: `window.getMainFSMState().slmLabelIndex` (should be `0`)

### Expected Result:
- ✅ Initial label: "SLM" (index `0`)
- ✅ After first SOFT1: "1/1" (index `1`)
- ✅ After second SOFT1: "1/3" (index `2`)
- ✅ After third SOFT1: "SLM" (index `0`) - cycles back
- ✅ Console shows: `[FSM] SOFT1 pressed on home → Cycling SLM label, index: X`
- ✅ Label cycles continuously: SLM → 1/1 → 1/3 → SLM → ...

### What This Tests:
- SOFT1 cycles labels correctly on home screen
- Label index increments correctly
- Label wraps back to 0 after reaching 2
- Screen renderer displays correct label

---

## Test 5: SOFT1 on SLM Screen (Should Navigate, Not Cycle)

### Steps:
1. Power on device
2. Navigate to SLM screen:
   - Press ENTER on "VIEW SESSION" from home menu
   - Or press RUN button from home screen
3. Ensure you're on `slm_home` screen
4. Press SOFT1 button

### Expected Result:
- ✅ Should navigate to `slm_view_menu` (not cycle label)
- ✅ Check console: `window.getMainFSMState().viewId` should be `"slm_view_menu"`
- ✅ Label cycling should NOT happen on SLM screens

### What This Tests:
- SOFT1 behaves differently on home vs SLM screens
- Navigation works correctly on SLM screens
- Label cycling only happens on home screen

---

## Test 6: ENTER Routing - VIEW PAST STUDIES

### Steps:
1. Power on device
2. Navigate to "VIEW PAST STUDIES" (should be selected by default, index `0`)
3. Press ENTER

### Expected Result:
- ✅ **Nothing happens** (no navigation, no toast)
- ✅ Stays on home screen
- ✅ `viewId` remains `"home_screen"` or `"home_screen_dim"`
- ✅ No console errors

### What This Tests:
- VIEW PAST STUDIES does nothing (as per requirements)
- No unwanted navigation or toasts

---

## Test 7: ENTER Routing - VIEW CURRENT STUDY

### Steps:
1. Power on device
2. Navigate to "VIEW CURRENT STUDY" (press DOWN once, index `1`)
3. Press ENTER

### Expected Result:
- ✅ Navigates to `home_screen_running`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"home_screen_running"`
- ✅ Measurement state should be set to running:
   - `window.getMainFSMState().measurement.state` should be `"running"`
   - `window.getMainFSMState().measurement.isRunning` should be `true`
- ✅ No console errors

### What This Tests:
- ENTER routing works for VIEW CURRENT STUDY
- Navigation to running screen works
- Measurement state is updated correctly

---

## Test 8: ENTER Routing - VIEW SESSION

### Steps:
1. Power on device
2. Navigate to "VIEW SESSION" (press DOWN twice, index `2`)
3. Press ENTER

### Expected Result:
- ✅ Navigates to `slm_home`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"slm_home"`
- ✅ Measurement state should be set to running:
   - `window.getMainFSMState().measurement.state` should be `"running"`
   - `window.getMainFSMState().measurement.isRunning` should be `true`
- ✅ No console errors

### What This Tests:
- ENTER routing works for VIEW SESSION
- Navigation to SLM screen works
- Measurement state is updated correctly

---

## Test 9: ENTER Routing - SETUP

### Steps:
1. Power on device
2. Navigate to "SETUP" (press DOWN three times, index `3`)
3. Press ENTER

### Expected Result:
- ✅ Navigates to `setup_menu`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"setup_menu"`
- ✅ History should contain previous view:
   - `window.getMainFSMState().history` should contain `["home_screen"]` or `["home_screen_dim"]`
- ✅ No console errors

### What This Tests:
- ENTER routing works for SETUP
- Navigation history is pushed correctly
- History stack is working

---

## Test 10: ENTER Routing - UNIT INFO

### Steps:
1. Power on device
2. Navigate to "UNIT INFO" (press DOWN four times, index `4`)
3. Press ENTER

### Expected Result:
- ✅ Navigates to `unit_info`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"unit_info"`
- ✅ History should contain previous view:
   - `window.getMainFSMState().history` should contain `["home_screen"]` or `["home_screen_dim"]`
- ✅ No console errors

### What This Tests:
- ENTER routing works for UNIT INFO
- Navigation history is pushed correctly

---

## Test 11: SOFT2 (CAL) Navigation

### Steps:
1. Power on device
2. Ensure you're on home screen (`home_screen` or `home_screen_dim`)
3. Press SOFT2 button (CAL)

### Expected Result:
- ✅ Navigates to `cal_menu`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"cal_menu"`
- ✅ Console shows: `[FSM] SOFT2 pressed → Navigating to cal_menu`
- ✅ `previousViewId` should be set:
   - `window.getMainFSMState().previousViewId` should be `"home_screen"` or `"home_screen_dim"`
- ✅ No console errors

### What This Tests:
- SOFT2 navigates to calibration menu
- Previous view is stored for back navigation
- Soft key routing works correctly

---

## Test 12: SOFT3 (FILE) Navigation

### Steps:
1. Power on device
2. Ensure you're on home screen (`home_screen` or `home_screen_dim`)
3. Press SOFT3 button (FILE)

### Expected Result:
- ✅ Navigates to `files_menu`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"files_menu"`
- ✅ Console shows: `[FSM] SOFT3 pressed → Navigating to files_menu`
- ✅ Menu index should be reset to 0:
   - `window.getMainFSMState().menu.selectedIndex` should be `0`
- ✅ No console errors

### What This Tests:
- SOFT3 navigates to files menu
- Menu index is reset correctly
- Soft key routing works correctly

---

## Test 13: SOFT4 (LOCK) Navigation

### Steps:
1. Power on device
2. Ensure you're on home screen (`home_screen` or `home_screen_dim`)
3. Press SOFT4 button (LOCK)

### Expected Result:
- ✅ Navigates to `lock_menu`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"lock_menu"`
- ✅ Console shows: `[FSM] LOCK_SOFTKEY pressed → Navigating to lock_menu`
- ✅ Lock flag should be set:
   - `window.getMainFSMState().flags.locked` should be `true`
- ✅ No console errors

### What This Tests:
- SOFT4 navigates to lock menu
- Lock flag is set correctly
- Soft key routing works correctly

---

## Test 14: BACKLIGHT Toggle - Dim to Bright

### Steps:
1. Power on device
2. If screen is dim, check initial state:
   - `window.getMainFSMState().viewId` should be `"home_screen_dim"`
   - `window.getMainFSMState().backlight` should be `false`
3. Press BACKLIGHT button

### Expected Result:
- ✅ Screen should brighten
- ✅ `viewId` should change to `"home_screen"`
- ✅ `backlight` should change to `true`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"home_screen"`
- ✅ Check console: `window.getMainFSMState().backlight` should be `true`
- ✅ No console errors

### What This Tests:
- BACKLIGHT toggle works (dim → bright)
- View ID updates correctly
- Backlight state updates correctly

---

## Test 15: BACKLIGHT Toggle - Bright to Dim

### Steps:
1. Power on device
2. If screen is bright, check initial state:
   - `window.getMainFSMState().viewId` should be `"home_screen"`
   - `window.getMainFSMState().backlight` should be `true`
3. Press BACKLIGHT button

### Expected Result:
- ✅ Screen should dim
- ✅ `viewId` should change to `"home_screen_dim"`
- ✅ `backlight` should change to `false`
- ✅ Check console: `window.getMainFSMState().viewId` should be `"home_screen_dim"`
- ✅ Check console: `window.getMainFSMState().backlight` should be `false`
- ✅ No console errors

### What This Tests:
- BACKLIGHT toggle works (bright → dim)
- View ID updates correctly
- Backlight state updates correctly

---

## Test 16: BACKLIGHT Toggle - Multiple Toggles

### Steps:
1. Power on device
2. Press BACKLIGHT button multiple times (5-10 times)
3. Check final state after each toggle

### Expected Result:
- ✅ Screen alternates between dim and bright
- ✅ `viewId` alternates: `"home_screen_dim"` ↔ `"home_screen"`
- ✅ `backlight` alternates: `false` ↔ `true`
- ✅ No console errors
- ✅ No state corruption

### What This Tests:
- BACKLIGHT toggle is stable
- No state corruption from rapid toggling
- Toggle works reliably

---

## Test 17: Navigation History Integration

### Steps:
1. Power on device
2. Navigate to SETUP (press DOWN to "SETUP", press ENTER)
3. Check history: `window.getMainFSMState().history`
4. Navigate to UNIT INFO (press ESC to go back, then DOWN to "UNIT INFO", press ENTER)
5. Check history: `window.getMainFSMState().history`

### Expected Result:
- ✅ After SETUP: History contains `["home_screen"]` or `["home_screen_dim"]`
- ✅ After UNIT INFO: History contains `["home_screen"]` or `["home_screen_dim"]` (or more if ESC was used)
- ✅ History stack is maintained correctly

### What This Tests:
- Navigation history is pushed when navigating from home
- History stack works correctly
- Multiple navigations maintain history

---

## Test 18: ESC Back Navigation from SETUP

### Steps:
1. Power on device
2. Check starting view: `window.getMainFSMState().viewId` (should be `"home_screen"` or `"home_screen_dim"`)
3. Navigate to SETUP (press DOWN to "SETUP", press ENTER)
4. Check current view: `window.getMainFSMState().viewId` should be `"setup_menu"`
5. Check history before ESC: `window.getMainFSMState().history` (should contain the starting view)
6. Press ESC
7. Check view after ESC: `window.getMainFSMState().viewId`
8. Check history after ESC: `window.getMainFSMState().history`

### Expected Result:
- ✅ After ESC: Should navigate back to the original view (`"home_screen"` if you started from `"home_screen"`, or `"home_screen_dim"` if you started from `"home_screen_dim"`)
- ✅ History should be popped:
   - `window.getMainFSMState().history` should be empty `[]` (history was popped when navigating back)
- ✅ No console errors

### What This Tests:
- ESC navigation works correctly
- History is popped correctly
- Back navigation works

---

## Test 19: Soft Key Labels Display Correctly

### Steps:
1. Power on device
2. Check all soft key labels on home screen

### Expected Result:
- ✅ SOFT1: Shows current label (SLM, 1/1, or 1/3 based on `slmLabelIndex`)
- ✅ SOFT2: Shows "CAL"
- ✅ SOFT3: Shows "FILE"
- ✅ SOFT4: Shows "LOCK"
- ✅ Labels are visible and correctly positioned

### What This Tests:
- Screen renderer displays soft key labels correctly
- Labels match screen atlas definitions
- Label cycling updates SOFT1 label correctly

---

## Test 20: State Consistency After Navigation

### Steps:
1. Power on device
2. Navigate through multiple screens:
   - Press SOFT3 (FILE) → Navigate to "FORMAT CARD" → Press ENTER → Press ESC
   - Press SOFT2 (CAL) → Press ESC
   - Press ENTER on "SETUP" → Press ESC
3. Check final state: `window.getMainFSMState()`

### Expected Result:
- ✅ Should return to home screen
- ✅ `viewId` should be `"home_screen"` or `"home_screen_dim"`
- ✅ `slmLabelIndex` should still be the last value set (0, 1, or 2)
- ✅ `menu.selectedIndex` should be correct
- ✅ No state corruption
- ✅ No console errors

### What This Tests:
- State remains consistent after multiple navigations
- No state corruption
- Navigation history works correctly
- Label index persists correctly

---

## Summary Checklist

After completing all tests, verify:

- [ ] ✅ No console errors on page load
- [ ] ✅ `slmLabelIndex` exists in state (initial value `0`)
- [ ] ✅ UP/DOWN navigation updates `menu.selectedIndex` correctly
- [ ] ✅ SOFT1 cycles labels on home screen (SLM → 1/1 → 1/3 → SLM)
- [ ] ✅ SOFT1 navigates on SLM screen (not cycles)
- [ ] ✅ VIEW PAST STUDIES does nothing on ENTER
- [ ] ✅ VIEW CURRENT STUDY navigates to `home_screen_running` on ENTER
- [ ] ✅ VIEW SESSION navigates to `slm_home` on ENTER
- [ ] ✅ SETUP navigates to `setup_menu` on ENTER
- [ ] ✅ UNIT INFO navigates to `unit_info` on ENTER
- [ ] ✅ SOFT2 navigates to `cal_menu`
- [ ] ✅ SOFT3 navigates to `files_menu`
- [ ] ✅ SOFT4 navigates to `lock_menu`
- [ ] ✅ BACKLIGHT toggles between dim and bright
- [ ] ✅ Navigation history is pushed when navigating from home
- [ ] ✅ ESC pops history and navigates back
- [ ] ✅ Soft key labels display correctly
- [ ] ✅ State remains consistent after multiple navigations

---

## Common Issues & Solutions

### Issue: SOFT1 doesn't cycle labels
**Solution:**
- Verify you're on home screen (`home_screen` or `home_screen_dim`)
- Check console for `[FSM] SOFT1 pressed on home → Cycling SLM label` message
- Verify `slmLabelIndex` is updating: `window.getMainFSMState().slmLabelIndex`
- Check screen renderer is using `slmLabelIndex` for `{modeLabel}` placeholder

### Issue: Label doesn't change visually
**Solution:**
- Check console: `window.getMainFSMState().slmLabelIndex` should change
- Verify screen renderer is reading `state.slmLabelIndex`
- Check that `{modeLabel}` placeholder is in screen atlas softkeys
- Refresh page and try again

### Issue: BACKLIGHT doesn't toggle
**Solution:**
- Verify BACKLIGHT button is mapped correctly in `buttons.js`
- Check console for errors
- Verify `viewId` is `home_screen` or `home_screen_dim` (BACKLIGHT only works on home)
- Check `state.backlight` value changes

### Issue: Navigation doesn't work
**Solution:**
- Check console for errors
- Verify FSM is initialized: `window.getMainFSMState()` should return an object
- Check `viewId` is correct before navigation
- Verify button events are being dispatched correctly

### Issue: History not updating
**Solution:**
- History is only pushed when navigating FROM home screen
- Check `window.getMainFSMState().history` after navigating to SETUP or UNIT INFO
- Verify `_pushHistory()` is being called in ENTER handler
- Check that history array exists in state

---

## Next Steps

Once all Phase 2 tests pass:
1. ✅ Phase 2 is complete
2. ➡️ Proceed to Phase 3: Setup Menu Hierarchy
3. Phase 3 will implement Setup menu navigation and submenus
4. Phase 3 will implement Meter Set editing
5. Phase 3 will implement Display menu submenus

---

## Notes

- **SLM Label Cycling:** Only works on home screen (`home_screen` or `home_screen_dim`). On SLM screens, SOFT1 navigates to view menu instead.
- **BACKLIGHT Toggle:** Only works on home screen. Toggles between `home_screen_dim` (backlight off) and `home_screen` (backlight on).
- **Navigation History:** History is pushed when navigating FROM home screen TO another screen. ESC pops history and navigates back.
- **Soft Key Routing:** SOFT2/3/4 work on both home and SLM screens. SOFT1 behaves differently on home vs SLM screens.
- **ENTER Routing:** All menu items route correctly. VIEW PAST STUDIES does nothing (no navigation, no toast).

