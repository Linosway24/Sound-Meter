# Phase 3 Batch 2 Testing Guide
## OPTIONS, SIG INPUT, LOGGING, COMMS, and BATTERY Menus

**Date:** 2024  
**Status:** Ready for Testing  
**Scope:** Setup Menu - Batch 2 Implementation

---

## Overview

This document provides comprehensive test cases for the second batch of Setup Menu screens:
- **OPTIONS** (`options_menu`)
- **SIG INPUT** (`sig_input_menu`)
- **LOGGING** (`logging_menu`)
- **COMM-SET** (`comms_menu` - all editing happens in place)
- **BATTERY** (`battery_menu`)

---

## Pre-Testing Checklist

- [ x] Open browser console (F12) to monitor errors
- [ x] Navigate to `index.html` or test page
- [ x] Verify simulator loads without errors
- [x ] Start from Home screen

---

## 1. Console Errors Check

**Test:** Verify no JavaScript errors on page load

**Steps:**
1. Open browser console
2. Load the page
3. Navigate to Setup Menu

**Expected:**
- No red error messages in console
- Console shows initialization messages
- Screen renders correctly

**Pass/Fail:** [x ]

---

## 2. OPTIONS Menu Tests

### 2.1 Navigation to OPTIONS Menu

**Test:** Navigate from Setup Menu to OPTIONS

**Steps:**
1. From Home, press ENTER on "SETUP"
2. Navigate DOWN to "OPTIONS" (if not first item)
3. Press ENTER

**Expected:**
- Screen shows "setup\OPTIONS" title
- Displays "DATA FILE" text
- Displays "OPTIONS NOT LOADED" text
- No highlight bar or selectable items
- Softkeys are empty

**Pass/Fail:** [ x]

### 2.2 ESC from OPTIONS Menu

**Test:** ESC returns to Setup Menu

**Steps:**
1. On OPTIONS menu, press ESC

**Expected:**
- Returns to `setup_menu`
- Setup menu items visible
- Selected index preserved or reset to 0

**Pass/Fail:** [ x]

### 2.3 UP/DOWN on OPTIONS Menu (Should Do Nothing)

**Test:** Verify UP/DOWN have no effect

**Steps:**
1. On OPTIONS menu, press UP
2. Press DOWN

**Expected:**
- No visual changes
- No console errors
- Screen remains static

**Pass/Fail:** [ x]

---

## 3. SIG INPUT Menu Tests

### 3.1 Navigation to SIG INPUT Menu

**Test:** Navigate from Setup Menu to SIG INPUT

**Steps:**
1. From Setup Menu, navigate to "SIG INPUT"
2. Press ENTER

**Expected:**
- Screen shows "setup\SIG INPUT" title
- Displays three menu items:
  - SENSITIVITY = -28.3 dB
  - RANGE CAP = 140 dB
  - POLARIZATION = 0 V
- First item (SENSITIVITY) is highlighted
- All softkeys are empty (no softkey labels)

**Pass/Fail:** [ x]

### 3.2 UP/DOWN Navigation in SIG INPUT Menu

**Test:** Navigate between SIG INPUT fields

**Steps:**
1. On SIG INPUT menu, press DOWN twice
2. Press UP once

**Expected:**
- DOWN: Moves highlight from SENSITIVITY → RANGE CAP → POLARIZATION
- UP: Moves highlight from POLARIZATION → RANGE CAP
- Console logs show selected index changes
- Highlight bar moves correctly

**Pass/Fail:** [x ]

### 3.3 Enter Edit Mode - SENSITIVITY

**Test:** ENTER enters edit mode for SENSITIVITY

**Steps:**
1. On SIG INPUT menu, ensure SENSITIVITY is selected
2. Press ENTER

**Expected:**
- Title "SENSITIVITY" is NOT highlighted
- Value "-28.3 dB" IS highlighted (editing style)
- Console logs: `[SIG INPUT] Entered edit mode`
- Focus is on value

**Pass/Fail:** [x ]

### 3.4 Adjust Value in Edit Mode - SENSITIVITY (UP)

**Test:** UP arrow increases SENSITIVITY value

**Steps:**
1. In edit mode on SENSITIVITY, press UP multiple times

**Expected:**
- Value increases by 0.1 each press (step size)
- Range: -50.0 to 0.0 dB
- Value stops at 0.0 (max)
- Console logs show value changes
- Visual feedback shows value updating

**Pass/Fail:** [ x]

### 3.5 Adjust Value in Edit Mode - SENSITIVITY (DOWN)

**Test:** DOWN arrow decreases SENSITIVITY value

**Steps:**
1. In edit mode on SENSITIVITY, press DOWN multiple times

**Expected:**
- Value decreases by 0.1 each press
- Range: -50.0 to 0.0 dB
- Value stops at -50.0 (min)
- Console logs show value changes

**Pass/Fail:** [x ]

### 3.6 Exit Edit Mode - LEFT Arrow

**Test:** LEFT arrow exits edit mode

**Steps:**
1. In edit mode on SENSITIVITY, press LEFT

**Expected:**
- Title "SENSITIVITY" becomes highlighted again
- Value is no longer highlighted (editing style removed)
- Console logs: `[SIG INPUT] Exited edit mode`
- UP/DOWN now navigate between items (not adjust values)

**Pass/Fail:** [x ]

### 3.7 Save and Exit Edit Mode - ENTER

**Test:** ENTER saves value and exits edit mode

**Steps:**
1. In edit mode, adjust value
2. Press ENTER

**Expected:**
- Value is saved
- Edit mode exits
- Title becomes highlighted
- Value persists when navigating away and back

**Pass/Fail:** [x ]

### 3.8 Edit RANGE CAP

**Test:** Edit RANGE CAP value

**Steps:**
1. Navigate to RANGE CAP
2. Press ENTER to enter edit mode
3. Press UP/DOWN to adjust value

**Expected:**
- Value adjusts in steps of 10 dB
- Range: 30 to 140 dB
- Value stops at min/max boundaries
- Console logs show changes

**Pass/Fail:** [x ]

### 3.9 Edit POLARIZATION

**Test:** Edit POLARIZATION value

**Steps:**
1. Navigate to POLARIZATION
2. Press ENTER to enter edit mode
3. Press UP/DOWN to adjust value

**Expected:**
- Value adjusts in steps of 1 V
- Range: 0 to 10 V
- Value stops at min/max boundaries
- Console logs show changes

**Pass/Fail:** [x ]

### 3.10 ESC from SIG INPUT Menu (Not Editing)

**Test:** ESC returns to Setup Menu

**Steps:**
1. On SIG INPUT menu (not in edit mode), press ESC

**Expected:**
- Returns to `setup_menu`
- Selected index reset to 0
- Console logs navigation

**Pass/Fail:** [x ]

### 3.11 ESC from SIG INPUT Menu (While Editing)

**Test:** ESC cancels editing and returns to Setup Menu

**Steps:**
1. Enter edit mode on any field
2. Adjust value
3. Press ESC

**Expected:**
- Edit mode exits (if still in edit)
- Returns to `setup_menu`
- Changes are NOT saved (if ESC pressed while editing)

**Pass/Fail:** [x ]

---

## 4. LOGGING Menu Tests

### 4.1 Navigation to LOGGING Menu

**Test:** Navigate from Setup Menu to LOGGING

**Steps:**
1. From Setup Menu, navigate to "LOGGING"
2. Press ENTER

**Expected:**
- Screen shows "setup\LOGGING" title
- Displays menu items:
  - AVG = OFF
  - PEAK = OFF
  - MAX = OFF
  - MIN = OFF
  - INTERVAL = 1 sec
  - L1 = L01
  - L2 = L80
  - FILTERS = OFF
- First item (AVG) is highlighted
- Softkey 1 shows "Select"
- Softkey 4 shows "Meter 1"

**Pass/Fail:** [x ]

### 4.2 UP/DOWN Navigation in LOGGING Menu

**Test:** Navigate between LOGGING fields

**Steps:**
1. On LOGGING menu, press DOWN multiple times
2. Press UP multiple times

**Expected:**
- Navigation cycles through all 8 items
- Highlight bar moves correctly
- Console logs show selected index changes
- Wraps around at top/bottom

**Pass/Fail:** [x ]

### 4.3 Toggle AVG ON/OFF

**Test:** ENTER toggles AVG between OFF and ON

**Steps:**
1. On LOGGING menu, ensure AVG is selected
2. Press ENTER
3. Press ENTER again

**Expected:**
- First ENTER: AVG = OFF → ON
- Second ENTER: AVG = ON → OFF
- Title remains highlighted (no edit mode)
- Console logs: `[LOGGING] ENTER: AVG = ON (OFF → ON)`
- Value updates immediately

**Pass/Fail:** [ x]

### 4.4 Toggle PEAK, MAX, MIN, FILTERS

**Test:** ENTER toggles other ON/OFF fields

**Steps:**
1. Navigate to PEAK, press ENTER
2. Navigate to MAX, press ENTER
3. Navigate to MIN, press ENTER
4. Navigate to FILTERS, press ENTER

**Expected:**
- Each field toggles between OFF and ON
- No edit mode entered
- Title remains highlighted
- Console logs show toggles

**Pass/Fail:** [ x]

### 4.5 Enter Edit Mode - INTERVAL

**Test:** ENTER enters edit mode for INTERVAL

**Steps:**
1. Navigate to INTERVAL
2. Press ENTER

**Expected:**
- Title "INTERVAL" is NOT highlighted
- Value "1 sec" IS highlighted (editing style)
- Console logs: `[LOGGING] Entered edit mode`
- Focus is on value

**Pass/Fail:** [x ]

### 4.6 Adjust INTERVAL Value (UP)

**Test:** UP arrow increases INTERVAL value

**Steps:**
1. In edit mode on INTERVAL, press UP multiple times

**Expected:**
- Value increases by 1 second each press
- Range: 1 to 3600 seconds
- Value stops at 3600 (max)
- Console logs show value changes
- Unit "sec" remains displayed

**Pass/Fail:** [x ]

### 4.7 Adjust INTERVAL Value (DOWN)

**Test:** DOWN arrow decreases INTERVAL value

**Steps:**
1. In edit mode on INTERVAL, press DOWN multiple times

**Expected:**
- Value decreases by 1 second each press
- Range: 1 to 3600 seconds
- Value stops at 1 (min)
- Console logs show value changes

**Pass/Fail:** [x ]

### 4.8 Edit L1 Value

**Test:** Edit L1 (cycles through L options)

**Steps:**
1. Navigate to L1
2. Press ENTER to enter edit mode
3. Press UP/DOWN to cycle values

**Expected:**
- Cycles through: OFF, L01, L02, L03, ..., L99
- UP moves forward, DOWN moves backward
- Wraps around at boundaries
- Console logs show value changes
- Default value is L01

**Pass/Fail:** [ x]

### 4.9 Edit L2 Value

**Test:** Edit L2 (cycles through L options)

**Steps:**
1. Navigate to L2
2. Press ENTER to enter edit mode
3. Press UP/DOWN to cycle values

**Expected:**
- Cycles through: OFF, L01, L02, L03, ..., L99
- Default value is L80
- Console logs show value changes

**Pass/Fail:** [ x]

### 4.10 Exit Edit Mode - LEFT Arrow

**Test:** LEFT arrow exits edit mode

**Steps:**
1. In edit mode on INTERVAL (or L1/L2), press LEFT

**Expected:**
- Title becomes highlighted again
- Value is no longer highlighted
- Console logs: `[LOGGING] Exited edit mode`
- UP/DOWN now navigate between items

**Pass/Fail:** [x ]

### 4.11 Save and Exit Edit Mode - ENTER

**Test:** ENTER saves value and exits edit mode

**Note:** Only test with L1, L2, or INTERVAL. AVG, PEAK, MAX, MIN, and FILTERS toggle ON/OFF and do not enter edit mode.

**Steps:**
1. Select L1, L2, or INTERVAL
2. Press ENTER to enter edit mode
3. Adjust value using UP/DOWN arrows
4. Press ENTER to save and exit

**Expected:**
- Value is saved
- Edit mode exits
- Title becomes highlighted
- Value persists when navigating away and back

**Test Cases:**
- **L1**: Change from L83 to L84, press ENTER → should save L84
- **L2**: Change from L87 to L88, press ENTER → should save L88
- **INTERVAL**: Change from 1 sec to 5 sec, press ENTER → should save 5 sec

**Pass/Fail:** [ x]

### 4.12 ESC from LOGGING Menu (Not Editing)

**Test:** ESC returns to Setup Menu

**Steps:**
1. On LOGGING menu (not in edit mode), press ESC

**Expected:**
- Returns to `setup_menu`
- Selected index reset to 0
- Console logs navigation

**Pass/Fail:** [x ]

### 4.13 ESC from LOGGING Menu (While Editing)

**Test:** ESC cancels editing and returns to Setup Menu

**Steps:**
1. Enter edit mode on INTERVAL
2. Adjust value
3. Press ESC

**Expected:**
- Edit mode exits (if still in edit)
- Returns to `setup_menu`
- Changes are NOT saved (if ESC pressed while editing)

**Pass/Fail:** [x ]

### 4.14 SOFT4 - Meter Toggle (Stub)

**Test:** SOFT4 on LOGGING menu (placeholder)

**Steps:**
1. On LOGGING menu, press SOFT4

**Expected:**
- Console logs: `[LOGGING] Meter toggle (not yet implemented)`
- No visual changes (stub implementation)
- Softkey label shows "Meter 1" (or "Meter 2" if toggled)

**Pass/Fail:** [ x]

---

## 5. COMM-SET Menu Tests

### 5.1 Navigation to COMM-SET Menu

**Test:** Navigate from Setup Menu to COMM-SET

**Steps:**
1. From Setup Menu, navigate to "COMM-SET"
2. Press ENTER

**Expected:**
- Screen shows "setup\COMM-SET" title
- Displays three menu items with current values:
  - USB = Mass Storage
  - RS-232 = Serial
  - BAUD RATE = 9600
- First item (USB) is highlighted
- No softkeys (all empty)

**Pass/Fail:** [x ]

### 5.2 UP/DOWN Navigation in COMM-SET Menu

**Test:** Navigate between COMM-SET fields

**Steps:**
1. On COMM-SET menu, press DOWN twice
2. Press UP once

**Expected:**
- DOWN: Moves highlight from USB → RS-232 → BAUD RATE
- UP: Moves highlight from BAUD RATE → RS-232
- Console logs show selected index changes
- Highlight bar moves correctly
- Values remain visible: USB = Mass Storage, RS-232 = Serial, BAUD RATE = 9600

**Pass/Fail:** [x ]

### 5.3 ENTER on USB - Cycle Options

**Test:** ENTER cycles through USB options

**Steps:**
1. Navigate to USB, press ENTER multiple times

**Expected:**
- USB cycles: Mass Storage → WINUSB → QSp/Serial → (back to Mass Storage)
- Console logs: `[COMMS] USB: [current option]`
- No screen change, stays on COMM-SET menu
- Value updates in place: "USB = [current option]"

**Pass/Fail:** [ x]

### 5.4 ENTER on RS-232 - Cycle Options

**Test:** ENTER cycles through RS-232 options

**Steps:**
1. Navigate to RS-232, press ENTER multiple times

**Expected:**
- RS-232 cycles: Serial → LOG PRN → GPS → OFF/Lo-Pwr → (back to Serial)
- Console logs: `[COMMS] RS-232: [current option]`
- No screen change, stays on COMM-SET menu
- Value updates in place: "RS-232 = [current option]"
- When RS-232 = "GPS", "NO FIX" line appears below BAUD RATE

**Pass/Fail:** [x ]

### 5.5 "NO FIX" Line Display

**Test:** "NO FIX" appears when RS-232 is GPS

**Steps:**
1. Navigate to RS-232, press ENTER until "GPS" is displayed
2. Observe screen

**Expected:**
- "NO FIX" line appears below "BAUD RATE" line
- Only visible when RS-232 = "GPS"
- When RS-232 is set to another option, "NO FIX" disappears

**Pass/Fail:** [ x]

### 5.6 ENTER on BAUD RATE - Cycle Options

**Test:** ENTER cycles through BAUD RATE options (in place, no edit screen)

**Steps:**
1. Navigate to BAUD RATE, press ENTER multiple times

**Expected:**
- BAUD RATE cycles: 4600 → 9600 → 19200 → 115299 → (back to 4600)
- Console logs: `[COMMS] BAUD RATE: [current value]`
- No screen change, stays on COMM-SET menu
- Value updates in place: "BAUD RATE = [current value]"
- Default is 9600

**Pass/Fail:** [ x]


---

## 6. BATTERY Menu Tests

### 6.1 Navigation to BATTERY Menu

**Test:** Navigate from Setup Menu to BATTERY

**Steps:**
1. From Setup Menu, navigate to "BATTERY"
2. Press ENTER

**Expected:**
- Screen shows "setup\BATTERY" title
- Displays battery status (e.g., "B1 B2 B3 B4")
- Softkey 1 shows "ALK"
- Softkey 2 shows "NiMH"
- No highlight bar or selectable items

**Pass/Fail:** [x ]

### 6.2 SOFT1 - Select Alkaline (ALK)

**Test:** SOFT1 selects Alkaline battery type

**Steps:**
1. On BATTERY menu, press SOFT1

**Expected:**
- Console logs: `[BATTERY] Selected: ALK`
- Battery type is set to "ALK"
- State persists (can verify in console state)

**Pass/Fail:** [ x]

### 6.3 SOFT4 - Select NiMH

**Test:** SOFT4 selects NiMH battery type

**Steps:**
1. On BATTERY menu, press SOFT4

**Expected:**
- Console logs: `[BATTERY] Selected: NiMH`
- Battery type is set to "NiMH"
- State persists (can verify in console state)

**Pass/Fail:** [ ]

### 6.4 Toggle Between ALK and NiMH

**Test:** Switch between battery types

**Steps:**
1. Press SOFT1 (ALK)
2. Press SOFT4 (NiMH)
3. Press SOFT1 (ALK) again

**Expected:**
- Battery type changes correctly
- Console logs show each selection
- State updates appropriately

**Pass/Fail:** [ x]

### 6.5 ESC from BATTERY Menu

**Test:** ESC returns to Setup Menu

**Steps:**
1. On BATTERY menu, press ESC

**Expected:**
- Returns to `setup_menu`
- Console logs navigation

**Pass/Fail:** [x ]

### 6.6 UP/DOWN on BATTERY Menu (Should Do Nothing)

**Test:** Verify UP/DOWN have no effect

**Steps:**
1. On BATTERY menu, press UP
2. Press DOWN

**Expected:**
- No visual changes
- No console errors
- Screen remains static

**Pass/Fail:** [x ]

---

## 7. Integration Tests

### 7.1 Navigation Flow - Setup Menu to All Batch 2 Menus

**Test:** Navigate through all Batch 2 menus

**Steps:**
1. From Setup Menu, navigate to OPTIONS, press ENTER, press ESC
2. Navigate to SIG INPUT, press ENTER, press ESC
3. Navigate to LOGGING, press ENTER, press ESC
4. Navigate to COMM-SET, press ENTER, press ESC
5. Navigate to BATTERY, press ENTER, press ESC

**Expected:**
- All menus open correctly
- All menus return to Setup Menu on ESC
- No navigation errors
- Console shows proper navigation logs

**Pass/Fail:** [x ]

### 7.2 State Persistence - SIG INPUT Values

**Test:** Values persist when navigating away and back

**Steps:**
1. On SIG INPUT menu, edit SENSITIVITY to -30.0 dB
2. Press LEFT to exit edit mode
3. Navigate to RANGE CAP, edit to 120 dB
4. Press ESC to return to Setup Menu
5. Navigate back to SIG INPUT

**Expected:**
- SENSITIVITY shows -30.0 dB
- RANGE CAP shows 120 dB
- Values persist correctly

**Pass/Fail:** [ x]

### 7.3 State Persistence - LOGGING Values

**Test:** Toggle and edit values persist

**Steps:**
1. On LOGGING menu, toggle AVG to ON
2. Edit INTERVAL to 5 sec
3. Edit L1 to L50
4. Press ESC to return to Setup Menu
5. Navigate back to LOGGING

**Expected:**
- AVG shows ON
- INTERVAL shows 5 sec
- L1 shows L50
- Values persist correctly

**Pass/Fail:** [ x]

### 7.4 State Persistence - COMMS Baud Rate

**Test:** Baud rate persists

**Steps:**
1. On COMMS menu, navigate to BAUD RATE, press ENTER
2. Change baud rate to 19200
3. Press ENTER to save
4. Press ESC to return to Setup Menu
5. Navigate back to COMMS, enter BAUD RATE edit again

**Expected:**
- Baud rate shows 19200
- Value persists correctly

**Pass/Fail:** [x ]

### 7.5 State Persistence - BATTERY Type

**Test:** Battery type persists

**Steps:**
1. On BATTERY menu, press SOFT4 (NiMH)
2. Press ESC to return to Setup Menu
3. Navigate back to BATTERY

**Expected:**
- Battery type remains NiMH (can verify in console state)
- State persists correctly

**Pass/Fail:** [ x]

### 7.6 History Stack - Multiple Menu Levels

**Test:** Navigation history works correctly

**Steps:**
1. From Setup Menu, navigate to COMM-SET, press ENTER
2. Press ESC (should return to setup_menu)

**Expected:**
- ESC from comms_menu returns to setup_menu
- History stack works correctly
- No navigation errors
- All cycling operations remain on comms_menu (no navigation to comms_edit)

**Pass/Fail:** [x ]

---

## 8. Edge Cases and Error Handling

### 8.1 Rapid Navigation

**Test:** Rapid UP/DOWN navigation

**Steps:**
1. On SIG INPUT menu, rapidly press UP/DOWN multiple times

**Expected:**
- Navigation remains responsive
- No visual glitches
- Selected index updates correctly
- Console logs are manageable (not excessive)

**Pass/Fail:** [x ]

### 8.2 Rapid Value Adjustment

**Test:** Rapid value adjustment in edit mode

**Steps:**
1. Enter edit mode on SENSITIVITY
2. Rapidly press UP multiple times

**Expected:**
- Values update correctly
- Min/max boundaries respected
- No visual glitches
- Console logs are manageable

**Pass/Fail:** [x ]

### 8.3 Boundary Testing - Min Values

**Test:** Verify min values are enforced

**Steps:**
1. Edit SENSITIVITY, press DOWN many times (should stop at -50.0)
2. Edit RANGE CAP, press DOWN many times (should stop at 30)
3. Edit POLARIZATION, press DOWN many times (should stop at 0)
4. Edit INTERVAL, press DOWN many times (should stop at 1)

**Expected:**
- All values stop at their minimum boundaries
- No negative values below minimum
- Console logs show boundary stops

**Pass/Fail:** [ x]

### 8.4 Boundary Testing - Max Values

**Test:** Verify max values are enforced

**Steps:**
1. Edit SENSITIVITY, press UP many times (should stop at 0.0)
2. Edit RANGE CAP, press UP many times (should stop at 140)
3. Edit POLARIZATION, press UP many times (should stop at 10)
4. Edit INTERVAL, press UP many times (should stop at 3600)

**Expected:**
- All values stop at their maximum boundaries
- No values above maximum
- Console logs show boundary stops

**Pass/Fail:** [ x]

### 8.5 Wrapping - L Options

**Test:** L options wrap correctly

**Steps:**
1. Edit L1, press UP many times to reach L99
2. Press UP again (should wrap to OFF)
3. Press DOWN from OFF (should wrap to L99)

**Expected:**
- Wraps correctly at boundaries
- OFF ↔ L01 ↔ L02 ↔ ... ↔ L99 ↔ OFF
- Console logs show wrapping

**Pass/Fail:** [x ]

### 8.6 Wrapping - Baud Rates

**Test:** Baud rates wrap correctly

**Steps:**
1. On COMM-SET menu, navigate to BAUD RATE
2. Press ENTER many times to cycle through: 4600 → 9600 → 19200 → 115299 → 4600
3. Verify wrapping works correctly

**Expected:**
- Wraps correctly at boundaries
- 4600 ↔ 9600 ↔ 19200 ↔ 115299 ↔ 4600
- Console logs show wrapping

**Pass/Fail:** [x ]

---

## 9. Visual Verification

### 9.1 Highlighting - Title vs Value

**Test:** Verify highlighting behavior in edit mode

**Steps:**
1. On SIG INPUT menu, enter edit mode on SENSITIVITY
2. Observe highlighting

**Expected:**
- Title "SENSITIVITY" is NOT highlighted (normal color)
- Value "-28.3 dB" IS highlighted (selected/editing style)
- Visual distinction is clear

**Pass/Fail:** [x ]

### 9.2 Highlighting - Toggle Items (No Edit Mode)

**Test:** Verify highlighting for toggle items

**Steps:**
1. On LOGGING menu, select AVG
2. Press ENTER to toggle

**Expected:**
- Title "AVG" remains highlighted
- Value changes from OFF to ON
- No edit mode entered
- Visual feedback is clear

**Pass/Fail:** [ x]

### 9.3 Unit Display

**Test:** Verify units display correctly

**Steps:**
1. Check SIG INPUT menu items
2. Check LOGGING menu INTERVAL

**Expected:**
- SENSITIVITY shows "dB"
- RANGE CAP shows "dB"
- POLARIZATION shows "V"
- INTERVAL shows "sec"
- Units are clearly visible

**Pass/Fail:** [x ]

### 9.4 Softkey Labels

**Test:** Verify softkey labels are correct

**Steps:**
1. Check each menu's softkey labels

**Expected:**
- OPTIONS: All empty
- SIG INPUT: ["Select", "", "", ""]
- LOGGING: ["Select", "", "", "Meter 1"]
- COMM-SET: ["", "", "", ""] (no softkeys)
- BATTERY: ["ALK", "NiMH", "", ""]

**Pass/Fail:** [ x]

---

## 10. Console Logging Verification

### 10.1 Navigation Logs

**Test:** Verify console logs for navigation

**Steps:**
1. Navigate through menus
2. Check console output

**Expected:**
- Logs show menu navigation: `[MENU] Signal Input menu - Selected index: X`
- Logs show edit mode entry/exit
- Logs show value changes
- Logs are informative but not excessive

**Pass/Fail:** [ x]

### 10.2 Value Change Logs

**Test:** Verify console logs for value changes

**Steps:**
1. Edit values in various menus
2. Check console output

**Expected:**
- SIG INPUT: Logs value changes with units
- LOGGING: Logs toggle actions and value changes
- COMM-SET: Logs USB mode, RS-232 mode, and BAUD RATE changes
- BATTERY: Logs battery type selection

**Pass/Fail:** [x ]

---

## Summary

**Total Test Cases:** 60+

**Test Execution:**
- Date: _______________
- Tester: _______________
- Environment: _______________

**Results Summary:**
- Passed: ______
- Failed: ______
- Blocked: ______

**Notes:**
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

---

## Known Issues / Limitations

1. **USB/RS-232 Editing:** Not yet implemented (stub)
2. **Meter Toggle (LOGGING):** SOFT4 handler is stub (not yet implemented)
3. **Battery Visual Feedback:** Battery type selection may not have visual indicator (check if needed)

---

## Next Steps

After completing this testing guide:
1. Document any bugs found
2. Verify fixes are implemented
3. Re-test failed cases
4. Proceed to next batch or phase

