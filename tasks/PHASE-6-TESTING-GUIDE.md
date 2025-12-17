# Phase 6 Testing Guide - Lock & Calibration Enhancements

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Phase 6  
**Scope:** Calibration Last Entry Display, Navigation, and Calibration Logging

---

## Overview

This testing guide covers Phase 6 implementation:
- **Calibration Last Entry Display**: Pre-Cal value and timestamp of last calibration in calibration menu
- **Calibration Completion Logging**: Last calibration entry updated after completion
- **CALIBRATE Option**: Start calibration sequence from calibration menu (press ENTER)

**Prerequisites:**
- Complete Phase 1, 2, 3, 4, and 5 testing
- Device can start up and navigate to home screen
- Calibration menu basic navigation working from Phase 1
- Calibration running screen working from Phase 1

---

## P1: Pre-Testing Setup

### P1.1 Browser Console
**Test:** Open browser developer console (F12)
**Expected:**
- Console is visible and ready for log inspection
- No errors on page load

**Pass/Fail:** [x ]

### P1.2 Device State
**Test:** Power on device (if needed) and navigate to home screen
**Expected:**
- Device shows home screen with menu items
- No visual errors or layout issues

**Pass/Fail:** [x ]

---

## 1. Calibration Menu Navigation Tests

### 1.1 Navigate to Calibration Menu
**Test:** From home screen, press SOFT2 (CAL) or navigate to calibration menu
**Expected:**
- Navigates to `cal_menu` screen
- Screen shows:
  - Status bar with battery icon at top
  - "CAL" title
  - Spacer line
  - "CALIBRATE" option with highlight bar (if selected)
  - Last calibration entry (if exists) showing:
    - Line 1: `PRE-CAL.` (left) | `114.1db` (right)
    - Line 2: `11:48:44.` (left) | `06-NOV-2025` (right)
- CALIBRATE option is visible and ready for ENTER press
- Console: `window.getMainFSMState().viewId` → should be `"cal_menu"`

**Pass/Fail:** [ ]

### 1.2 Calibration Menu Initial State
**Test:** Check calibration state in console
**Expected:**
- Console: `window.getMainFSMState().calibration.lastCalibration` → should return object with last calibration entry (or null if none)
- Default lastCalibration entry should have:
  - `preCalValue`: number (e.g., 114.1)
  - `timestamp`: string (e.g., "2025-11-06 11:48:44")
  - `date`: string (e.g., "2025-11-06")
  - `time`: string (e.g., "11:48:44")

**Pass/Fail:** [x ]

### 1.3 ESC from Calibration Menu
**Test:** Press ESC from Calibration Menu
**Expected:**
- Returns to home screen
- Console: `window.getMainFSMState().viewId` → should be `"home_screen"` or `"home_screen_dim"`
- Console log shows: `[CAL] ESC: Returning to Home`

**Pass/Fail:** [x ]

---

## 2. Calibration Last Entry Display Tests

### 2.1 Last Calibration Entry Display Format
**Test:** Verify last calibration entry displays correctly
**Expected:**
- Last calibration entry visible (if it exists)
- Entry displays in two lines:
  - Line 1: `PRE-CAL.` (left aligned) | `114.1db` (right aligned) - lowercase "db", no space
  - Line 2: `11:48:44.` (left aligned) | `06-NOV-2025` (right aligned) - time with period, date formatted as DD-MMM-YYYY
- Two-column layout with padding on both sides
- Entry uses proper styling (consistent with menu items)
- Entry is displayed for reference only (not selectable)

**Console Commands:**
- `window.getMainFSMState().calibration.lastCalibration` → should return last calibration entry object
- `window.getMainFSMState().calibration.lastCalibration.preCalValue` → should return Pre-Cal value

**Pass/Fail:** [x ]

### 2.2 CALIBRATE Option Display
**Test:** Verify CALIBRATE option displays correctly
**Expected:**
- "CALIBRATE" text visible with highlight box around it
- CALIBRATE option appears at top (after spacer line, before last calibration entry)
- CALIBRATE option uses highlight bar styling
- CALIBRATE is the only interactive element (press ENTER to start calibration)

**Pass/Fail:** [x ]

### 2.3 No Last Calibration Entry
**Test:** Verify behavior when no last calibration exists
**Expected:**
- If `lastCalibration` is null, only CALIBRATE option is visible
- No errors or crashes when lastCalibration is null
- CALIBRATE is still functional (press ENTER to start calibration)

**Test Setup:**
```javascript
const state = window.getMainFSMState();
state.calibration.lastCalibration = null;
// Navigate to cal_menu
```

**Pass/Fail:** [ x]

---

## 3. ENTER Behavior Tests

### 3.1 ENTER on CALIBRATE Option
**Test:** Press ENTER on calibration screen
**Expected:**
- Navigates to `cal_running` screen
- Console: `window.getMainFSMState().viewId` → should be `"cal_running"`
- Calibration sequence starts (timer begins)
- Console log shows calibration sequence starting

**Pass/Fail:** [x ]

---

## 4. Calibration Completion and History Logging Tests

### 4.1 Complete Calibration Sequence
**Test:** 
1. Navigate to Calibration Menu
2. Select CALIBRATE option
3. Press ENTER to start calibration
4. Wait for calibration to complete (4-6 seconds) or press ENTER during calibration

**Expected:**
- Calibration sequence runs (shows `cal_running` screen)
- After completion, returns to previous screen (Home)
- Console: `window.getMainFSMState().viewId` → should be `"home_screen"` or previous view

**Pass/Fail:** [x ]

### 4.2 Last Calibration Entry Updated
**Test:** After completing calibration, navigate back to Calibration Menu
**Expected:**
- Last calibration entry is updated (not added to array, replaces previous)
- Updated entry has:
  - `preCalValue`: Current measurement SPL value (or default 85.2)
  - `timestamp`: Current date/time in format "YYYY-MM-DD HH:MM:SS"
  - `date`: Current date in format "YYYY-MM-DD"
  - `time`: Current time in format "HH:MM:SS"
- Console: `window.getMainFSMState().calibration.lastCalibration` → should be updated entry
- Console: `window.getMainFSMState().calibration.lastCalibration.preCalValue` → should be new Pre-Cal value
- Console log shows: `[CAL] Calibration completed: PRE-CAL [value]dB`

**Pass/Fail:** [x ]

### 4.3 Last Calibration Entry Format After Completion
**Test:** Verify last calibration entry format matches firmware R.13J
**Expected:**
- Display format (two lines):
  - Line 1: `PRE-CAL.` (left) | `[value]db` (right) - lowercase "db", no space, 1 decimal place
  - Line 2: `[time].` (left) | `[date]` (right) - time with period, date as DD-MMM-YYYY
- Example: 
  - Line 1: `PRE-CAL.` | `114.1db`
  - Line 2: `11:48:44.` | `06-NOV-2025`
- Pre-Cal value formatted to 1 decimal place
- Date formatted as DD-MMM-YYYY (zero-padded day, uppercase month abbreviation)
- Time formatted as HH:MM:SS with period at end

**Pass/Fail:** [x ]

### 4.4 Multiple Calibrations - Last Entry Replacement
**Test:** Complete multiple calibrations and verify last entry is replaced
**Expected:**
- Each new calibration replaces the previous lastCalibration entry
- Only the most recent calibration is stored
- Previous calibration data is overwritten (not kept in history)
- CALIBRATE option remains at index 0

**Test Steps:**
1. Complete first calibration
2. Navigate to Calibration Menu, verify lastCalibration shows first calibration
3. Complete second calibration
4. Navigate to Calibration Menu, verify lastCalibration shows second calibration (first is gone)

**Pass/Fail:** [x ]

---

## 5. Calibration Running Screen Tests

### 5.1 Calibration Running - ENTER to Complete
**Test:** During calibration running, press ENTER
**Expected:**
- Calibration completes immediately
- New history entry is added
- Returns to previous screen (Home)
- Console log shows: `[CAL] Calibration completed: [formatted string]`

**Pass/Fail:** [x ]

### 5.2 Calibration Running - ESC to Cancel
**Test:** During calibration running, press ESC
**Expected:**
- Calibration is cancelled
- Last calibration entry is NOT updated
- Returns to previous screen (Home)
- Console: `window.getMainFSMState().calibration.lastCalibration` → should remain unchanged

**Pass/Fail:** [x ]

### 5.3 Calibration Running - Auto-Complete
**Test:** Wait for calibration to auto-complete (4-6 seconds)
**Expected:**
- Calibration completes automatically after timer
- Last calibration entry is updated
- Returns to previous screen (Home)
- Timer duration is random between 4000-6000ms

**Pass/Fail:** [x ]

---

## 6. Edge Cases and Error Handling Tests

### 6.1 No Last Calibration State
**Test:** Manually set lastCalibration to null and navigate to Calibration Menu
**Expected:**
- Calibration Menu displays correctly
- Only CALIBRATE option is visible
- CALIBRATE is automatically selected (index 0)
- No errors or crashes
- Console: `window.getMainFSMState().calibration.lastCalibration` → should be `null`
- Console: `window.getMainFSMState().calibration.selectedIndex` → should be `0`

**Test Setup:**
```javascript
const state = window.getMainFSMState();
state.calibration.lastCalibration = null;
state.calibration.selectedIndex = 0;
// Navigate to cal_menu
```

**Pass/Fail:** [ x]

### 6.2 Rapid Button Presses
**Test:** Rapidly press UP/DOWN arrows
**Expected:**
- Navigation responds correctly to each press
- Highlight moves smoothly
- No visual glitches
- Final state is correct
- No errors in console

**Pass/Fail:** [x ]

### 6.3 State Persistence
**Test:** Navigate to Calibration Menu, then ESC, then navigate back
**Expected:**
- Selected index resets to 0 when entering menu
- Last calibration entry remains intact
- No state corruption
- Console: `window.getMainFSMState().calibration.lastCalibration` → should be unchanged

**Pass/Fail:** [x ]

---

## 7. Visual Layout Tests

### 7.1 Calibration Menu Layout
**Test:** Verify calibration menu displays correctly
**Expected:**
- Status bar visible at top with battery icon
- "CAL" title visible
- Spacer line visible below title
- CALIBRATE option visible with highlight bar when selected
- Last calibration entry visible (if exists) in two-column format:
  - Line 1: `PRE-CAL.` (left) | `[value]db` (right)
  - Line 2: `[time].` (left) | `[date]` (right)
- All elements properly aligned and spaced with padding
- Styling matches device appearance

**Pass/Fail:** [x ]

### 7.2 CALIBRATE Highlight Box
**Test:** Verify CALIBRATE option has highlight box
**Expected:**
- CALIBRATE option has highlight box around it
- Highlight box is clearly visible
- Styling matches firmware appearance

**Pass/Fail:** [x ]

### 7.3 Text Formatting
**Test:** Verify last calibration entry text formatting
**Expected:**
- Text is readable and properly formatted
- Pre-Cal values display with correct decimal precision (1 decimal place)
- Date displays as DD-MMM-YYYY (zero-padded day, uppercase month)
- Time displays as HH:MM:SS with period at end
- Two-column layout with proper padding on both sides
- Text alignment is consistent (left for labels, right for values)

**Pass/Fail:** [x ]

---

## 8. State Management Tests

### 8.1 FSM State Structure
**Test:** In browser console, run: `window.getMainFSMState().calibration`
**Expected:**
- Returns object with:
  - `lastCalibration`: Object (last calibration entry) or null
  - `selectedIndex`: Number (not used for navigation, always 0)
- Last calibration entry has:
  - `preCalValue`: Number (Pre-Cal SPL value)
  - `timestamp`: String (full date/time "YYYY-MM-DD HH:MM:SS")
  - `date`: String (date component "YYYY-MM-DD")
  - `time`: String (time component "HH:MM:SS")

**Pass/Fail:** [ x]

### 8.2 State Initialization
**Test:** Fresh page load, navigate to Calibration Menu
**Expected:**
- Default state:
  - `lastCalibration`: Object with default entry (e.g., preCalValue: 114.1)
  - `selectedIndex`: 0 (not used for navigation)
- Default lastCalibration entry has valid values:
  - `preCalValue`: 114.1 (or similar)
  - `timestamp`: Valid date/time string (e.g., "2025-11-06 11:48:44")
  - `date`: Valid date string (e.g., "2025-11-06")
  - `time`: Valid time string (e.g., "11:48:44")

**Pass/Fail:** [x ]

### 8.3 State Updates on Calibration Completion
**Test:** Complete calibration and check state
**Expected:**
- `lastCalibration` object is replaced (not added to array)
- Previous lastCalibration is overwritten with new entry
- New entry has correct values (preCalValue, timestamp, date, time)
- `selectedIndex` remains 0 (not used for navigation)

**Pass/Fail:** [ x]

---

## 9. Integration Tests

### 9.1 Complete Calibration Workflow
**Test:** 
1. Navigate to Calibration Menu
2. View last calibration entry (if exists)
3. Press ENTER to start calibration
4. Complete calibration
5. Return to Calibration Menu
6. Verify lastCalibration entry is updated

**Expected:**
- All steps work correctly
- Last calibration entry is updated (replaced)
- No errors or state corruption

**Pass/Fail:** [x ]

### 9.2 Multiple Calibrations Workflow
**Test:** Complete multiple calibrations in sequence
**Expected:**
- Each calibration replaces the previous lastCalibration entry
- Only the most recent calibration is stored
- Previous calibration data is overwritten
- Navigation works correctly with updated entry

**Pass/Fail:** [x ]

### 9.3 Calibration with Different Measurement States
**Test:** Complete calibration while measurement is running/paused/stopped
**Expected:**
- Calibration works regardless of measurement state
- Pre-Cal value captured correctly (or uses default)
- History entry format is consistent
- No errors related to measurement state

**Pass/Fail:** [x ]

---

## 10. Console Logging Tests

### 10.1 Calibration Completion Logging
**Test:** Complete calibration and check console
**Expected:**
- Console shows: `[CAL] Calibration completed: [formatted string]`
- Log appears when calibration completes
- Formatted string matches history entry format

**Pass/Fail:** [ x]

### 10.2 ESC Logging
**Test:** Press ESC from Calibration Menu, check console
**Expected:**
- Console shows: `[CAL] ESC: Returning to Home`
- Log appears when ESC is pressed
- Log confirms navigation action

**Pass/Fail:** [x ]

### 10.3 Error Logging
**Test:** Check console for any error messages
**Expected:**
- No error messages during normal operation
- Any errors are logged with clear messages
- Errors don't crash the application

**Pass/Fail:** x[ ]

---

## Summary

**Total Tests:** [Fill in count]  
**Passed:** [Fill in count]  
**Failed:** [Fill in count]  
**Blocked:** [Fill in count]

### Critical Issues Found:
[List any critical issues that block testing or functionality]

### Minor Issues Found:
[List any minor issues or visual glitches]

### Notes:
[Any additional observations or notes]

---

**Testing Completed By:** [Name]  
**Date:** [Date]  
**Version Tested:** Phase 6  
**Ready for Next Phase:** [Yes/No]

