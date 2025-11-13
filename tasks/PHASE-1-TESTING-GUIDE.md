# Phase 1 Testing Guide - Core Navigation Infrastructure

## Overview
This guide provides detailed step-by-step instructions for testing Phase 1 implementation. Test each item before proceeding to Phase 2.

---

## Prerequisites
1. Open `index.html` in a browser (use a local server if needed)
2. Open browser Developer Tools (F12 or Cmd+Option+I)
3. Go to the Console tab
4. Ensure no errors appear on page load

---

## Test 1: Console Errors Check

### Steps:
1. Load the page
2. Check the browser console

### Expected Result:
- ✅ No red error messages
- ✅ Console may show initialization logs like:
  - `[DISPLAY] Initialized`
  - `[BUTTON] Button handlers initialized`
  - `[APP] Application initialized successfully`

### If Errors Found:
- Stop and report the error before proceeding

---

## Test 2: Navigation History Functions Exist

### Steps:
1. After page loads, open browser console
2. Type: `window.getMainFSMState()`
3. Press Enter
4. **Click the arrow** to expand the returned object
5. Look for these properties in the expanded object

### Expected Result:
- ✅ Object contains a `history` property (should be an empty array `[]` initially)
- ✅ Object contains `timers` property with `measurementRuntime: null`
- ✅ No errors when calling `getMainFSMState()`

### Verify History Functions:
1. In console, type: `window.getMainFSMState().history`
2. Should return: `[]` (empty array)

### Verify Timers:
1. In console, type: `window.getMainFSMState().timers`
2. Should return an object like:
   ```
   {
     stopHold: null,
     formatting: null,
     cal: null,
     measurementRuntime: null  ← This is new in Phase 1
   }
   ```

### Verify Measurement:
1. In console, type: `window.getMainFSMState().measurement`
2. Should return an object like:
   ```
   {
     runtime: 0,
     state: "stopped",
     isRunning: false
   }
   ```

### What This Tests:
- History array exists in state
- State getter function works
- Foundation for navigation history is in place
- Measurement runtime timer slot exists

---

## Test 3: Toast Notification System

**Status:** Toast notifications are enabled, but "No studies yet" toast is disabled for VIEW PAST STUDIES.

### Steps:
1. Power on the device (press Power button if device is OFF)
2. Wait for boot screen to finish (should show home screen)
3. Navigate to "VIEW PAST STUDIES" using UP/DOWN arrow keys
4. Press ENTER

### Expected Result:
- ⚠️ **VIEW PAST STUDIES:** No toast appears (disabled for this specific action)
- ✅ No console errors
- ✅ Navigation still works

### Test Other Toast Notifications:
To test toast functionality, try these actions:
- **Files Menu → RENAME LAST SESSION:** Should show "File renamed" toast
- **Files Menu → SAVE CONFIG FILE:** Should show "Config saved" toast
- **Setup → Comms → Edit:** Should show "Comms updated" toast

### Note:
- Toast system is enabled and working
- Only "No studies yet" toast is disabled for VIEW PAST STUDIES
- All other toast notifications work normally

---

## Test 4: Timer Management - Basic Functionality

### Steps:
1. Open browser console
2. Type: `window.getMainFSMState().timers`
3. Press Enter

### Expected Result:
- ✅ Returns an object with these properties:
  - `stopHold: null`
  - `formatting: null`
  - `cal: null`
  - `measurementRuntime: null`
- ✅ All timers are `null` initially (device not running)

### What This Tests:
- Timer state structure is correct
- All timer slots exist in state
- Measurement runtime timer slot exists

---

## Test 5: State Structure Verification

### Steps:
1. Open browser console
2. Type: `const state = window.getMainFSMState()`
3. Press Enter
4. Type: `state.history`
5. Press Enter
6. Type: `state.timers`
7. Press Enter
8. Type: `state.measurement`
9. Press Enter

### Expected Result:
- ✅ `state.history` returns: `[]` (empty array)
- ✅ `state.timers` returns object with all timer properties
- ✅ `state.measurement` returns object with:
  - `runtime: 0`
  - `state: "stopped"`
  - `isRunning: false`

### What This Tests:
- Complete state shape is correct
- All Phase 1 additions are present
- State is properly initialized

---

## Test 6: Navigation History Stack (Manual Test)

### Steps:
1. Power on device (if needed)
2. Navigate to SETUP menu:
   - Use UP/DOWN to select "SETUP"
   - Press ENTER
3. Check history in console:
   - Type: `window.getMainFSMState().history`
   - Press Enter

### Expected Result:
- ✅ History array should contain `["home_screen"]` or `["home_screen_dim"]`
- ✅ Current `viewId` should be `"setup_menu"`

### What This Tests:
- `_pushHistory()` function is being called (will be integrated in Phase 2)
- History stack is working (even if not fully integrated yet)

**Note:** History integration will be fully tested in Phase 2 when we integrate `_pushHistory()` into navigation events.

---

## Test 7: Toast Management - Multiple Toasts

### Steps:
1. Power on device
2. Navigate to Files menu:
   - Press SOFT3 (FILE) from home screen
   - Navigate to "RENAME LAST SESSION"
   - Press ENTER (toast 1: "File renamed")
3. Wait for toast to disappear (~1.5 seconds)
4. Navigate to "SAVE CONFIG FILE"
   - Press ENTER (toast 2: "Config saved")

### Expected Result:
- ✅ First toast appears: "File renamed"
- ✅ First toast disappears after ~1.5 seconds
- ✅ Second toast appears: "Config saved"
- ✅ Second toast disappears after ~1.5 seconds
- ✅ No toast overlap or errors
- ✅ Each toast shows correct message

### What This Tests:
- Toast system handles multiple toasts correctly
- Toast cleanup works properly
- No memory leaks from toast timers

---

## Test 8: State Immutability Check

### Steps:
1. Open browser console
2. Type: `const state1 = window.getMainFSMState()`
3. Press Enter
4. Navigate to a different screen (e.g., press SETUP)
5. Type: `const state2 = window.getMainFSMState()`
6. Press Enter
7. Type: `state1 === state2`
8. Press Enter

### Expected Result:
- ✅ `state1 === state2` returns `false`
- ✅ `state1.viewId` is different from `state2.viewId`
- ✅ State objects are separate instances (immutable)

### What This Tests:
- `getState()` returns a deep copy (not reference)
- State changes don't affect previous state snapshots
- Proper state management pattern

---

## Test 9: Timer Cleanup on Navigation

### Steps:
1. Power on device
2. Navigate to Files menu (SOFT3)
3. Navigate to "FORMAT CARD"
4. Press ENTER (starts format timer)
5. Immediately press ESC to cancel
6. Check console: `window.getMainFSMState().timers.formatting`

### Expected Result:
- ✅ `timers.formatting` should be `null` after ESC
- ✅ No console errors
- ✅ Timer was properly cleared

### What This Tests:
- Timer cleanup works correctly
- No orphaned timers remain
- ESC properly cancels operations

---

## Test 10: Measurement Runtime Timer (Foundation)

### Steps:
1. Open browser console
2. Type: `window.getMainFSMState().measurement`
3. Press Enter

### Expected Result:
- ✅ Returns object with:
  - `runtime: 0` (initial value)
  - `state: "stopped"`
  - `isRunning: false`
- ✅ Timer functions exist (will be tested in Phase 4 when measurement starts)

### What This Tests:
- Measurement state structure is correct
- Foundation for runtime timer is in place
- Timer will be tested fully in Phase 4

---

## Summary Checklist

After completing all tests, verify:

- [ ] ✅ No console errors on page load
- [ ] ✅ History array exists in state
- [ ] ✅ Toast notifications display correctly (except VIEW PAST STUDIES)
- [ ] ✅ Toast messages are correct
- [ ] ✅ Toast auto-dismisses after timeout
- [ ] ✅ Timer state structure is correct
- [ ] ✅ All timer slots exist (including measurementRuntime)
- [ ] ✅ State structure is complete
- [ ] ✅ State is immutable (deep copy)
- [ ] ✅ Timer cleanup works
- [ ] ✅ Measurement state structure is correct

---

## Common Issues & Solutions

### Issue: Toast doesn't appear
**Solution:** 
- ⚠️ **Note:** "No studies yet" toast is disabled for VIEW PAST STUDIES - this is expected
- For other actions: Check `window.Config.ENABLE_TOASTS` is not `false`
- Verify `display.js` has `renderToast()` function
- Check console for errors
- Test with Files menu actions (RENAME LAST SESSION, SAVE CONFIG FILE) to verify toasts work

### Issue: History array not updating
**Solution:** 
- This is expected - history integration happens in Phase 2
- History functions exist but aren't called yet
- Will be tested fully in Phase 2

### Issue: Console errors
**Solution:**
- Check that all files loaded correctly
- Verify `mainFSM.js` syntax is correct
- Check browser console for specific error messages

---

## Next Steps

Once all Phase 1 tests pass:
1. ✅ Phase 1 is complete
2. ➡️ Proceed to Phase 2: Home Screen Navigation
3. Phase 2 will integrate history functions into navigation
4. Phase 2 will add SLM label cycling
5. Phase 2 will fix soft key mappings

---

## Notes

- **Measurement Runtime Timer:** The timer functions exist but won't start until Phase 4 when we implement measurement start/stop
- **History Integration:** History functions exist but won't be called until Phase 2 when we integrate them into navigation events
- **Toast System:** ✅ **ENABLED** - Working for all actions except "No studies yet" for VIEW PAST STUDIES (disabled)
- **Timer Management:** Enhanced to handle all timer types including intervals

