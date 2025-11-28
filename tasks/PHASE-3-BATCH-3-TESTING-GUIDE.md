# Phase 3 Batch 3 Testing Guide - AUTO RUN Parameter Screens

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Phase 3 Batch 3  
**Scope:** AUTO RUN Parameter Screens (Timed Run, DOW, Date, Level-Triggered)

---

## Overview

This testing guide covers the AUTO RUN parameter screens implemented in Phase 3 Batch 3:
- **Timed Run Parameters**: H/M/S time editing
- **DOW Parameters**: Day-of-week selection and time editing for 2 schedules
- **Date Parameters**: Date/time editing for 4 schedules
- **Level-Triggered Parameters**: MODE, ACTION, TRIGGER, SOURCE, LEVEL configuration

**Prerequisites:**
- Complete Phase 3 Batch 1 and Batch 2 testing
- AUTO RUN menu navigation working correctly
- AUTO RUN mode cycling (Disabled → Timed Run → DOW → Date → Level-Triggered) functional

---

## 1. AUTO RUN Menu Tests

### 1.1 AUTO RUN Mode Navigation
**Test:** Navigate to Setup menu → AUTO RUN
**Expected:**
- Screen shows: `setup\AUTO-RUN`
- Two items visible:
  - `AUTO-RUN` with value (e.g., "Disabled") - positioned near the top, just below the title
  - `VIEW/SET PARAMETERS` - positioned just above the softkey area (near bottom of screen)
- No equals sign between AUTO-RUN and its value
- AUTO-RUN line and VIEW/SET PARAMETERS line are left-aligned with the title (no left padding shift when selected)
- Significant spacing between AUTO-RUN line and VIEW/SET PARAMETERS line (items are separated with large gap - 2 spacer lines)
- All softkeys are empty initially
- When DOW mode is selected: Softkeys 1-2 show "-1" and "-2" (or "+1"/"+2" if times are programmed)
- When Date mode is selected: Softkeys 1-4 show "-1", "-2", "-3", "-4" (or "+1"/"+2"/"+3"/"+4" if lines are enabled)

**Pass/Fail:** [x ]

### 1.2 AUTO RUN Mode Cycling
**Test:** Highlight "AUTO-RUN" and press ENTER multiple times
**Expected:**
- Cycles through: Disabled → Timed Run → DOW → Date → Level-Triggered → Disabled
- Value updates in place (no navigation to new screen)
- Console log shows mode changes

**Pass/Fail:** [x ]

### 1.3 View/Set Parameters Navigation
**Test:** With AUTO-RUN set to "Timed Run", highlight "VIEW/SET PARAMETERS" and press ENTER
**Expected:**
- Navigates to `auto_run_timed_run_params` screen
- Shows `setup\AUTO-RUN:TIMED-RUN` title
- Displays "TIMED-RUN" label
- Displays "D 00:00:02" (duration label)

**Test:** Repeat for DOW, Date, and Level-Triggered modes
**Expected:**
- DOW mode → `auto_run_dow_params` screen
- Date mode → `auto_run_date_params` screen
- Level-Triggered mode → `auto_run_level_triggered_params` screen

**Pass/Fail:** [x ]

### 1.4 View/Set Parameters Disabled
**Test:** With AUTO-RUN set to "Disabled", highlight "VIEW/SET PARAMETERS" and press ENTER
**Expected:**
- No navigation occurs (console log indicates no action)
- Stays on AUTO RUN menu

**Pass/Fail:** [ x]

### 1.5 ESC from AUTO RUN Menu
**Test:** From AUTO RUN menu, press ESC
**Expected:**
- Returns to Setup menu
- History stack properly maintained

**Pass/Fail:** [x ]

---

## 2. Timed Run Parameters Tests

### 2.1 Screen Display
**Test:** Navigate to Timed Run parameters (AUTO-RUN = "Timed Run" → VIEW/SET PARAMETERS)
**Expected:**
- Screen title: `\...\AUTO-RUN\TIMED-RUN` (fits on one line, proper spacing)
- Label: "TIMED-RUN" (centered and highlighted/bold)
- Duration label: "D 00:00:02" (or current value, centered)
- All softkeys empty

**Pass/Fail:** [x ]

### 2.2 Enter Edit Mode
**Test:** On Timed Run parameters screen, press ENTER
**Expected:**
- Enters edit mode (console log confirms)
- Hour field (first "00") is highlighted/editing
- Console log: `[AUTO RUN TIMED RUN] ENTER: Entered edit mode`

**Pass/Fail:** [x ]

### 2.3 Adjust Hour
**Test:** In edit mode (hour highlighted), press UP arrow multiple times
**Expected:**
- Hour increases: 00 → 01 → 02 → ... → 23 → 00 (wraps)
- Console log shows each adjustment
- Display updates immediately

**Test:** Press DOWN arrow
**Expected:**
- Hour decreases: 00 → 23 → 22 → ... → 01 → 00 (wraps)

**Pass/Fail:** [x ]

### 2.4 Adjust Minute
**Test:** In edit mode, press RIGHT arrow (or ENTER) to move to minute field
**Expected:**
- Minute field is now highlighted
- Console log: `[AUTO RUN TIMED RUN] RIGHT: Moved to subfield minute`

**Test:** Press UP arrow
**Expected:**
- Minute increases: 00 → 01 → 02 → ... → 59 → 00 (wraps)

**Test:** Press DOWN arrow
**Expected:**
- Minute decreases: 00 → 59 → 58 → ... → 01 → 00 (wraps)

**Pass/Fail:** [ x]

### 2.5 Adjust Second
**Test:** In edit mode, press RIGHT arrow (or ENTER) to move to second field
**Expected:**
- Second field is now highlighted

**Test:** Press UP/DOWN arrows
**Expected:**
- Second increases/decreases: 00 → 59 → 00 (wraps)

**Pass/Fail:** [ x]

### 2.6 LEFT/RIGHT Navigation
**Test:** In edit mode, use LEFT and RIGHT arrows to move between H/M/S
**Expected:**
- LEFT: Moves to previous subfield (H → S → M → H)
- RIGHT: Moves to next subfield (H → M → S → H)
- Console logs confirm subfield changes
- Highlighted field updates correctly

**Pass/Fail:** [x ]

### 2.7 ENTER Navigation
**Test:** In edit mode, press ENTER multiple times
**Expected:**
- Cycles through: hour → minute → second → exit edit mode
- When exiting, hour field is no longer highlighted
- Console log: `[AUTO RUN TIMED RUN] ENTER: Exited edit mode`

**Pass/Fail:** [ x]

### 2.8 ESC Behavior
**Test:** In edit mode, press ESC
**Expected:**
- Exits edit mode
- Hour/minute/second fields no longer highlighted
- Console log: `[AUTO RUN TIMED RUN] ESC: Exited edit mode`
- Stays on Timed Run parameters screen

**Test:** Not in edit mode, press ESC
**Expected:**
- Returns to AUTO RUN menu
- Console log: `[AUTO RUN TIMED RUN] ESC: Returned to auto_run_menu`

**Pass/Fail:** [ x]

### 2.9 Value Persistence
**Test:** Set hour=5, minute=30, second=45. Exit edit mode, then ESC back to AUTO RUN menu. Return to Timed Run parameters.
**Expected:**
- Duration shows "D 05:30:45"
- Values persist across navigation

**Pass/Fail:** [ x]

---

## 3. DOW Parameters Tests

### 3.1 Screen Display
**Test:** Navigate to DOW parameters (AUTO-RUN = "DOW" → VIEW/SET PARAMETERS)
**Expected:**
- Screen title: `setup\AUTO-RUN:DOW`
- Days label: Shows "Days" (highlighted/bold) followed by "- - - - - - -" on the same line
- One line space after the Days line
- Two lines visible: "1" and "2" (not "Auto-Run #1" or "Auto-Run #2", just the number)
- When a line is off: Shows "---OFF---" below the line number
- When a line has times set: Shows "1 08:30 - 17:00" format (no "Auto-Run" prefix)
- Softkeys show: "-1" (softkey 1), "-2" (softkey 2) on the DOW params screen
- On main AUTO RUN menu (when DOW selected): Softkeys 1-2 show "-1"/"-2" or "+1"/"+2" based on times programmed

**Pass/Fail:** [x ]

### 3.2 Navigate Between Lines
**Test:** On DOW parameters screen, press UP/DOWN arrows
**Expected:**
- Selected line changes: Line 1 ↔ Line 2
- Selected line number is highlighted
- Console log shows: `[AUTO RUN DOW] UP/DOWN: Selected line X`

**Pass/Fail:** [x ]

### 3.3 Enable Line via Softkey
**Test:** Press SOFT1 (should show "-1")
**Expected:**
- Line 1 becomes enabled
- Softkey 1 label changes from "-1" to "+1"
- Console log: `[AUTO RUN DOW] SOFT1: Line 1 enabled`

**Test:** Press SOFT1 again
**Expected:**
- Line 1 becomes disabled
- Softkey 1 label changes back to "-1"

**Test:** Repeat with SOFT2 for line 2
**Expected:**
- Same behavior for line 2
- Softkey 2 toggles between "-2" and "+2"

**Test:** On main AUTO RUN menu (with DOW selected), verify softkeys
**Expected:**
- Softkeys 1-2 show "-1"/"-2" when no times are set
- Softkeys 1-2 show "+1"/"+2" when times are programmed
- Softkeys update dynamically when returning from DOW params screen

**Pass/Fail:** [x ]

### 3.4 Enter Days Edit Mode
**Test:** With "Days" highlighted (selectedIndex = -1), press ENTER
**Expected:**
- Enters days edit mode for line 1 (switches to line 1 if needed)
- Console log: `[AUTO RUN DOW] ENTER: Days selected, entered days edit mode for line 1`
- Days field is ready for editing
- Works regardless of which line (1 or 2) was previously selected or if times are entered

**Test:** With line 1 or 2 selected, press ENTER
**Expected:**
- Also enters days edit mode for the selected line
- Console log: `[AUTO RUN DOW] ENTER: Entered days edit mode for line X`

**Pass/Fail:** [x ]

### 3.5 Enter Start Time Edit Mode
**Test:** In days edit mode, press ENTER
**Expected:**
- Switches to start time edit mode
- Hour field is highlighted
- Console log: `[AUTO RUN DOW] ENTER: Entered start time edit mode`
- Start time shows "00:00" format

**Pass/Fail:** [ ]

### 3.6 Adjust Start Time
**Test:** In start time edit mode, press UP arrow
**Expected:**
- Hour increases (00 → 23, wraps)
- Console log: `[AUTO RUN DOW] UP: Adjusted startTime.hour`

**Test:** Press RIGHT arrow (or ENTER) to move to minute, then UP
**Expected:**
- Minute increases (00 → 59, wraps)
- Console log: `[AUTO RUN DOW] UP: Adjusted startTime.minute`

**Test:** Press DOWN arrow
**Expected:**
- Minute/hour decreases appropriately

**Pass/Fail:** [x ]

### 3.7 Enter Stop Time Edit Mode
**Test:** In start time edit mode, with minute highlighted, press ENTER
**Expected:**
- Switches to stop time edit mode
- Hour field is highlighted
- Console log: `[AUTO RUN DOW] ENTER: Entered stop time edit mode`
- Stop time shows "00:00" format

**Pass/Fail:** [x ]

### 3.8 Adjust Stop Time
**Test:** In stop time edit mode, adjust hour and minute using UP/DOWN
**Expected:**
- Hour/minute adjust correctly (00-23 for hour, 00-59 for minute)
- Console logs confirm adjustments
- Display updates immediately

**Pass/Fail:** [ x]

### 3.9 LEFT/RIGHT in Time Edit Mode
**Test:** In start time or stop time edit mode, press LEFT/RIGHT arrows
**Expected:**
- LEFT: Moves between hour and minute (H → M → H)
- RIGHT: Moves between hour and minute (H → M → H)
- Console logs confirm subfield changes

**Pass/Fail:** [x ]

### 3.10 Exit Edit Mode
**Test:** In stop time edit mode, with minute highlighted, press ENTER
**Expected:**
- Exits edit mode
- Console log: `[AUTO RUN DOW] ENTER: Exited edit mode`
- No fields are highlighted

**Pass/Fail:** [x ]

### 3.11 ESC Behavior
**Test:** In any edit mode (days, startTime, stopTime), press ESC
**Expected:**
- Exits edit mode
- Console log: `[AUTO RUN DOW] ESC: Exited edit mode`
- Stays on DOW parameters screen

**Test:** Not in edit mode, press ESC
**Expected:**
- Returns to AUTO RUN menu
- Console log: `[AUTO RUN DOW] ESC: Returned to auto_run_menu`

**Pass/Fail:** [ x]

### 3.12 Value Persistence
**Test:** Set line 1 start time to 08:30, stop time to 17:00. Enable line, exit, return to DOW parameters.
**Expected:**
- Line 1 shows "1 08:30 - 17:00" (not "Auto-Run #1")
- Line remains enabled (softkey shows "+1")
- Values persist
- On main AUTO RUN menu, softkey shows "+1" (times are programmed)

**Pass/Fail:** [x ]

### 3.13 Both Lines Independent
**Test:** Configure line 1 with one time, line 2 with different time. Navigate between them.
**Expected:**
- Each line maintains its own start/stop times
- Values are independent
- Selection highlight moves correctly
- Display shows "1 HH:MM - HH:MM" and "2 HH:MM - HH:MM" format

**Test:** When a line is disabled or has no time set
**Expected:**
- Line shows "---OFF---" below the line number
- Softkey shows "-1" or "-2" (not "+1" or "+2")

**Pass/Fail:** [x ]

---

## 4. Date Parameters Tests

### 4.1 Screen Display
**Test:** Navigate to Date parameters (AUTO-RUN = "Date" → VIEW/SET PARAMETERS)
**Expected:**
- Screen title: `\setup\AUTO-RUN\DATE`
- One line space after the title
- Only ONE line visible at a time: "AUTO-RUN #1" (highlighted, centered)
- One line space, then shows "---OFF---" (centered) when the line is off
- When line has date/time set: Shows date/time below "AUTO-RUN #X" (centered)
- Date/time format: "MM/DD/YYYY HH:MM:SS" (e.g., "03/15/2024 14:30:00")
- Softkeys on Date params screen show: "-1", "-2", "-3", "-4"
- On main AUTO RUN menu (when Date selected): Softkeys 1-4 show "-1"/"-2"/"-3"/"-4" or "+1"/"+2"/"+3"/"+4" based on line enabled state
- Pressing softkeys 1-4 switches which AUTO-RUN line (#1-#4) is displayed

**Pass/Fail:** [ ]

### 4.2 Navigate Between Lines via Softkeys
**Test:** Press SOFT1, SOFT2, SOFT3, SOFT4
**Expected:**
- SOFT1: Switches to display "AUTO-RUN #1"
- SOFT2: Switches to display "AUTO-RUN #2"
- SOFT3: Switches to display "AUTO-RUN #3"
- SOFT4: Switches to display "AUTO-RUN #4"
- Console log shows: `[AUTO RUN DATE] SOFTX: Switched to line X`
- Display updates to show the selected line's status (OFF or date/time)

**Note:** UP/DOWN arrows do not navigate between lines on the Date params screen - use softkeys instead.

**Pass/Fail:** [x ]

### 4.3 Enable Line via Softkey
**Test:** Press SOFT1 (should show "-1")
**Expected:**
- Auto-Run #1 line becomes enabled
- Softkey 1 label changes from "-1" to "+1"
- Auto-Run #1 is now selected
- Line shows date/time format (default: 01/01/2024 12:00:00)
- Console log: `[AUTO RUN DATE] SOFT1: Jumped to line 1, enabled`

**Test:** Repeat with SOFT2, SOFT3, SOFT4
**Expected:**
- Each softkey jumps to and enables its respective line
- Softkey labels update to show "+X" for enabled lines

**Pass/Fail:** [x ]

### 4.4 Enable Line via ENTER
**Test:** Select Auto-Run #1 (OFF), press ENTER
**Expected:**
- Line becomes enabled
- Enters date edit mode
- Year field is highlighted
- Default date: 01/01/2024
- Console log: `[AUTO RUN DATE] ENTER: Enabled line 1, entered date edit mode`

**Pass/Fail:** [x ]

### 4.5 Date Edit Mode - Adjust Year
**Test:** In date edit mode (year highlighted), press UP arrow
**Expected:**
- Year increases (2000 → 2099, stops at max)
- Console log: `[AUTO RUN DATE] UP: Adjusted date.year`

**Test:** Press DOWN arrow
**Expected:**
- Year decreases (2099 → 2000, stops at min)

**Pass/Fail:** [x ]

### 4.6 Date Edit Mode - Adjust Month
**Test:** In date edit mode, press RIGHT arrow (or ENTER) to move to month
**Expected:**
- Month field is highlighted
- Console log: `[AUTO RUN DATE] RIGHT: Moved to date.month`

**Test:** Press UP arrow
**Expected:**
- Month increases: 01 → 02 → ... → 12 → 01 (wraps)

**Test:** Press DOWN arrow
**Expected:**
- Month decreases: 12 → 11 → ... → 01 → 12 (wraps)

**Pass/Fail:** [ x]

### 4.7 Date Edit Mode - Adjust Day
**Test:** In date edit mode, press RIGHT arrow (or ENTER) to move to day
**Expected:**
- Day field is highlighted

**Test:** Press UP/DOWN arrows
**Expected:**
- Day increases/decreases: 01 → 31 → 01 (wraps)
- Note: No validation for month-specific day limits (acceptable for now)

**Pass/Fail:** [x ]

### 4.8 Switch to Time Edit Mode
**Test:** In date edit mode, with day highlighted, press ENTER
**Expected:**
- Switches to time edit mode
- Hour field is highlighted
- Default time: 12:00:00
- Console log: `[AUTO RUN DATE] ENTER: Switched to time edit mode`

**Pass/Fail:** [x ]

### 4.9 Time Edit Mode - Adjust Hour
**Test:** In time edit mode (hour highlighted), press UP arrow
**Expected:**
- Hour increases: 00 → 01 → ... → 23 → 00 (wraps)
- Console log: `[AUTO RUN DATE] UP: Adjusted time.hour`

**Test:** Press DOWN arrow
**Expected:**
- Hour decreases: 00 → 23 → ... → 01 → 00 (wraps)

**Pass/Fail:** [x ]

### 4.10 Time Edit Mode - Adjust Minute
**Test:** In time edit mode, press RIGHT arrow (or ENTER) to move to minute
**Expected:**
- Minute field is highlighted

**Test:** Press UP/DOWN arrows
**Expected:**
- Minute increases/decreases: 00 → 59 → 00 (wraps)

**Pass/Fail:** [x ]

### 4.11 Time Edit Mode - Adjust Second
**Test:** In time edit mode, press RIGHT arrow (or ENTER) to move to second
**Expected:**
- Second field is highlighted

**Test:** Press UP/DOWN arrows
**Expected:**
- Second increases/decreases: 00 → 59 → 00 (wraps)

**Pass/Fail:** [x ]

### 4.12 LEFT/RIGHT Navigation
**Test:** In date edit mode, use LEFT/RIGHT arrows
**Expected:**
- LEFT: Moves between Y/M/D (Y → D → M → Y)
- RIGHT: Moves between Y/M/D (Y → M → D → Y)
- Console logs confirm subfield changes

**Test:** In time edit mode, use LEFT/RIGHT arrows
**Expected:**
- LEFT: Moves between H/M/S (H → S → M → H)
- RIGHT: Moves between H/M/S (H → M → S → H)
- Console logs confirm subfield changes

**Pass/Fail:** [x ]

### 4.13 ENTER Navigation
**Test:** In date edit mode, press ENTER multiple times
**Expected:**
- Cycles through: year → month → day → switch to time edit mode
- In time edit mode: hour → minute → second → exit edit mode
- Console logs confirm transitions

**Pass/Fail:** [x ]

### 4.14 Exit Edit Mode
**Test:** In time edit mode, with second highlighted, press ENTER
**Expected:**
- Exits edit mode
- Console log: `[AUTO RUN DATE] ENTER: Exited edit mode`
- No fields are highlighted

**Pass/Fail:** [x ]

### 4.15 ESC Behavior
**Test:** In any edit mode (date or time), press ESC
**Expected:**
- Exits edit mode
- Console log: `[AUTO RUN DATE] ESC: Exited edit mode`
- Stays on Date parameters screen

**Test:** Not in edit mode, press ESC
**Expected:**
- Returns to AUTO RUN menu
- Console log: `[AUTO RUN DATE] ESC: Returned to auto_run_menu`

**Pass/Fail:** [x ]

### 4.16 Value Persistence
**Test:** Set AUTO-RUN #1 to date 03/15/2024, time 14:30:00. Exit, return to Date parameters.
**Expected:**
- When viewing AUTO-RUN #1: Shows "AUTO-RUN #1" (centered, highlighted), then "03/15/2024 14:30:00" (centered) below
- Line remains enabled
- Values persist
- On main AUTO RUN menu, softkey shows "+1" (line is enabled)
- Pressing SOFT1 returns to AUTO-RUN #1 and shows the saved date/time

**Pass/Fail:** [x ]

### 4.17 All Lines Independent
**Test:** Configure all 4 lines with different dates/times using softkeys to switch between them.
**Expected:**
- Each line maintains its own date/time
- Values are independent
- Using SOFT1-4 switches display to show different lines
- Each line can be ON (with date/time) or OFF (shows "---OFF---")
- On main AUTO RUN menu, softkeys show "+X" for enabled lines and "-X" for disabled lines

**Pass/Fail:** [ x]

---

## 5. Level-Triggered Parameters Tests

### 5.1 Screen Display
**Test:** Navigate to Level-Triggered parameters (AUTO-RUN = "Level-Triggered" → VIEW/SET PARAMETERS)
**Expected:**
- Screen title: `\setup\LVL-TRG-Run`
- Five items visible, each showing title = value format:
  - MODE = LEVEL ON/OFF
  - ACTION = RUN/STOP
  - TRIGGER = Run/Stop
  - SOURCE = Meter1
  - LEVEL = OFF
- Values are visible and aligned with their titles (using " = " separator)
- All softkeys empty
- MODE is selected (highlighted)

**Pass/Fail:** [x ]

### 5.2 Navigate Between Items
**Test:** Press UP/DOWN arrows
**Expected:**
- Selected item changes: MODE → ACTION → TRIGGER → SOURCE → LEVEL → MODE (wraps)
- Selected item is highlighted
- Console log shows: `[AUTO RUN LEVEL TRIGGERED] UP/DOWN: Selected index X`

**Pass/Fail:** [ x]

### 5.3 MODE Cycling
**Test:** With MODE selected, press ENTER
**Expected:**
- MODE cycles: LEVEL ON/OFF → WINDOWED → LEVEL ON/OFF
- TRIGGER updates automatically based on MODE + ACTION
- Console log: `[AUTO RUN LEVEL TRIGGERED] MODE: WINDOWED`

**Test:** With MODE = WINDOWED, verify TRIGGER
**Expected:**
- TRIGGER shows "Upper & Lower" (regardless of ACTION)

**Pass/Fail:** [x ]

### 5.4 ACTION Cycling
**Test:** Select ACTION, press ENTER
**Expected:**
- ACTION cycles: RUN/STOP → RUN/PSE → RUN/STOP
- TRIGGER updates automatically
- Console log: `[AUTO RUN LEVEL TRIGGERED] ACTION: RUN/PSE`

**Test:** With MODE = LEVEL ON/OFF and ACTION = RUN/PSE, verify TRIGGER
**Expected:**
- TRIGGER shows "Run & Pause"

**Test:** With MODE = LEVEL ON/OFF and ACTION = RUN/STOP, verify TRIGGER
**Expected:**
- TRIGGER shows "Run/Stop"

**Pass/Fail:** [ x]

### 5.5 TRIGGER Display
**Test:** TRIGGER should not be editable (no ENTER action)
**Expected:**
- TRIGGER is calculated automatically from MODE + ACTION
- Pressing ENTER on TRIGGER does nothing (or logs "read-only")
- TRIGGER updates when MODE or ACTION changes

**Pass/Fail:** [ x]

### 5.6 SOURCE - Run Side
**Test:** Select SOURCE (should show "Meter1"), press ENTER
**Expected:**
- SOURCE cycles: Meter1 → 12.5Hz → EXT → Delay → Meter1 (if on run side)
- Console log: `[AUTO RUN LEVEL TRIGGERED] SOURCE RUN: [value]`
- Display shows current SOURCE value

**Pass/Fail:** [ x]

### 5.7 SOURCE - Stop Side
**Test:** Select SOURCE, press LEFT arrow (or RIGHT) to switch to stop side
**Expected:**
- sourceSide changes to "stop"
- Console log: `[AUTO RUN LEVEL TRIGGERED] LEFT/RIGHT: Switched source side to stop`
- SOURCE value may change to reflect stop-side options

**Test:** Press ENTER on SOURCE (stop side)
**Expected:**
- SOURCE cycles: Meter1 → 12.5Hz → EXT → Timed → Meter1 (stop-side options)
- Console log: `[AUTO RUN LEVEL TRIGGERED] SOURCE STOP: [value]`
- Note: "Timed" is available for stop side, "Delay" is for run side

**Pass/Fail:** [ x]

### 5.8 SOURCE LEFT/RIGHT Navigation
**Test:** Select SOURCE, press LEFT arrow
**Expected:**
- Switches between run side and stop side
- Console log confirms side change
- SOURCE value updates to reflect current side's value

**Test:** Press RIGHT arrow
**Expected:**
- Also switches between run side and stop side (same as LEFT)

**Pass/Fail:** [x ]

### 5.9 LEVEL - Toggle OFF/ON
**Test:** Select LEVEL (should show "OFF"), press ENTER
**Expected:**
- LEVEL changes from "OFF" to "90.0 dB"
- Enters edit mode (LEVEL value is highlighted)
- Console log: `[AUTO RUN LEVEL TRIGGERED] LEVEL: OFF → 90.0 (entered edit mode)`

**Test:** Press ENTER again (in edit mode)
**Expected:**
- Exits edit mode
- LEVEL remains at "90.0 dB"
- Console log: `[AUTO RUN LEVEL TRIGGERED] LEVEL: Exited edit mode`

**Test:** With LEVEL = "90.0 dB" (not in edit mode), press ENTER
**Expected:**
- LEVEL changes back to "OFF"
- Console log: `[AUTO RUN LEVEL TRIGGERED] LEVEL: OFF`

**Pass/Fail:** [x ]

### 5.10 LEVEL - Adjust dB Value
**Test:** With LEVEL in edit mode (showing "90.0 dB"), press UP arrow
**Expected:**
- dB value increases: 90 → 91 → 92 → ... → 140 (stops at max)
- Console log: `[AUTO RUN LEVEL TRIGGERED] UP: LEVEL = X dB`

**Test:** Press DOWN arrow
**Expected:**
- dB value decreases: 90 → 89 → 88 → ... → 0 (stops at min)
- Console log: `[AUTO RUN LEVEL TRIGGERED] DOWN: LEVEL = X dB`

**Pass/Fail:** [x ]

### 5.11 LEVEL - Edit Mode Navigation
**Test:** In LEVEL edit mode, press UP/DOWN
**Expected:**
- Only adjusts dB value (does not navigate to other items)
- Stays in edit mode

**Test:** In LEVEL edit mode, press ESC
**Expected:**
- Exits edit mode
- Console log: `[AUTO RUN LEVEL TRIGGERED] ESC: Exited LEVEL edit mode`
- Stays on Level-Triggered parameters screen
- LEVEL value remains at current setting

**Pass/Fail:** [x ]

### 5.12 ESC Behavior
**Test:** Not in LEVEL edit mode, press ESC
**Expected:**
- Returns to AUTO RUN menu
- Console log: `[AUTO RUN LEVEL TRIGGERED] ESC: Returned to auto_run_menu`

**Pass/Fail:** [ x]

### 5.13 Value Persistence
**Test:** Set MODE = WINDOWED, ACTION = RUN/PSE, SOURCE = EXT (run side), LEVEL = 95.0 dB. Exit, return to Level-Triggered parameters.
**Expected:**
- All values persist
- TRIGGER shows "Upper & Lower"
- SOURCE shows "EXT"
- LEVEL shows "95.0 dB"

**Pass/Fail:** [ x]

### 5.14 TRIGGER Auto-Update
**Test:** Set MODE = LEVEL ON/OFF, ACTION = RUN/STOP. Verify TRIGGER = "Run/Stop"
**Expected:**
- TRIGGER automatically set to "Run/Stop"

**Test:** Change ACTION to RUN/PSE
**Expected:**
- TRIGGER automatically updates to "Run & Pause"

**Test:** Change MODE to WINDOWED
**Expected:**
- TRIGGER automatically updates to "Upper & Lower"
- ACTION value remains unchanged

**Pass/Fail:** [x ]

---

## 6. Cross-Screen Navigation Tests

### 6.1 History Stack
**Test:** Setup → AUTO RUN → VIEW/SET PARAMETERS (Timed Run) → ESC → VIEW/SET PARAMETERS (DOW) → ESC
**Expected:**
- Each ESC returns to AUTO RUN menu
- History stack maintains correct order
- No navigation errors

**Pass/Fail:** [x ]

### 6.2 Mode Change Persistence
**Test:** Set AUTO-RUN = "Timed Run", configure Timed Run parameters. Change AUTO-RUN to "DOW", configure DOW parameters. Change back to "Timed Run".
**Expected:**
- Timed Run parameters retain previous values
- DOW parameters retain previous values
- Each mode's parameters are independent

**Pass/Fail:** [x ]

### 6.3 Parameter Screen Access
**Test:** Change AUTO-RUN mode while on a parameter screen (e.g., on Timed Run parameters, change AUTO-RUN to DOW)
**Expected:**
- Should not be able to change AUTO-RUN mode from parameter screen
- Must return to AUTO RUN menu to change mode

**Pass/Fail:** [x ]

---

## 7. Visual Verification Tests

### 7.1 Screen Titles
**Test:** Navigate to each parameter screen
**Expected:**
- Timed Run: `\...\AUTO-RUN\TIMED-RUN` (fits on one line)
- DOW: `setup\AUTO-RUN:DOW`
- Date: `\setup\AUTO-RUN\DATE`
- Level-Triggered: `\setup\LVL-TRG-Run`
- All titles display correctly with proper backslash formatting

**Pass/Fail:** [ x]

### 7.2 Editing Highlight
**Test:** Enter edit mode on any parameter screen
**Expected:**
- Editing field is visually highlighted (e.g., different color, underline, or cursor)
- Non-editing fields are dimmed/grayed out
- Highlight moves correctly with LEFT/RIGHT navigation

**Pass/Fail:** [ x]

### 7.3 Value Formatting
**Test:** Verify all value displays
**Expected:**
- Timed Run: "D HH:MM:SS" format (2-digit padding, centered)
- DOW: "X HH:MM - HH:MM" format for times (where X is line number 1 or 2, no "Auto-Run #" prefix)
- DOW OFF: "X ---OFF---" format
- Date: "MM/DD/YYYY HH:MM:SS" format (centered below "AUTO-RUN #X")
- Date OFF: "---OFF---" (centered)
- Level-Triggered: All values visible (MODE, ACTION, TRIGGER, SOURCE, LEVEL) with " = " separator

**Pass/Fail:** [ x]

### 7.4 Softkey Labels
**Test:** Check softkey labels on AUTO RUN menu when different modes are selected
**Expected:**
- When Disabled: All softkeys empty
- When Timed Run: All softkeys empty
- When DOW selected: SOFT1 shows "-1" or "+1", SOFT2 shows "-2" or "+2" (based on times programmed)
- When Date selected: SOFT1-4 show "-1"/"-2"/"-3"/"-4" or "+1"/"+2"/"+3"/"+4" (based on line enabled state)
- When Level-Triggered: All softkeys empty
- Labels update dynamically when returning from parameter screens

**Test:** Check softkey labels on parameter screens
**Expected:**
- DOW params screen: SOFT1-2 show "-1"/"-2" or "+1"/"+2"
- Date params screen: SOFT1-4 show "-1"/"-2"/"-3"/"-4" or "+1"/"+2"/"+3"/"+4" (for switching between lines)

**Pass/Fail:** [x ]

---

## 8. Console Logging Tests

### 8.1 Action Logging
**Test:** Perform various actions on parameter screens
**Expected:**
- All actions logged with appropriate tags:
  - `[AUTO RUN TIMED RUN]`
  - `[AUTO RUN DOW]`
  - `[AUTO RUN DATE]`
  - `[AUTO RUN LEVEL TRIGGERED]`
- Logs include action type, value changes, and state transitions

**Pass/Fail:** [ ]

### 8.2 Error Logging
**Test:** Perform invalid operations (if any exist)
**Expected:**
- Errors or warnings logged appropriately
- No silent failures

**Pass/Fail:** [ ]

---

## 9. Edge Cases and Boundary Tests

### 9.1 Timed Run Boundary Values
**Test:** Set hour=23, minute=59, second=59. Press UP on each field.
**Expected:**
- Hour wraps: 23 → 00
- Minute wraps: 59 → 00
- Second wraps: 59 → 00

**Pass/Fail:** [ ]

### 9.2 Date Boundary Values
**Test:** Set year=2099, month=12, day=31. Press UP on each field.
**Expected:**
- Year stops at 2099 (does not exceed)
- Month wraps: 12 → 01
- Day wraps: 31 → 01

**Test:** Set year=2000, month=1, day=1. Press DOWN on each field.
**Expected:**
- Year stops at 2000 (does not go below)
- Month wraps: 01 → 12
- Day wraps: 01 → 31

**Pass/Fail:** [ ]

### 9.3 LEVEL Boundary Values
**Test:** Set LEVEL = 140.0 dB, press UP
**Expected:**
- Stays at 140.0 (does not exceed max)

**Test:** Set LEVEL = 0.0 dB, press DOWN
**Expected:**
- Stays at 0.0 (does not go below min)

**Pass/Fail:** [ ]

### 9.4 Rapid Key Presses
**Test:** Rapidly press UP/DOWN/ENTER/ESC on various screens
**Expected:**
- No crashes or errors
- State updates correctly
- Display reflects current state

**Pass/Fail:** [ ]

---

## 10. Integration Tests

### 10.1 Full Workflow - Timed Run
**Test:** Complete workflow: Setup → AUTO RUN → Set to "Timed Run" → VIEW/SET PARAMETERS → Set duration to 01:30:45 → ESC → ESC
**Expected:**
- All steps complete successfully
- Values saved
- Navigation works correctly

**Pass/Fail:** [ ]

### 10.2 Full Workflow - DOW
**Test:** Complete workflow: Setup → AUTO RUN → Set to "DOW" → VIEW/SET PARAMETERS → Enable Auto-Run #1 → Set start 08:00, stop 17:00 → ESC → ESC
**Expected:**
- All steps complete successfully
- Values saved
- Softkeys update correctly

**Pass/Fail:** [ ]

### 10.3 Full Workflow - Date
**Test:** Complete workflow: Setup → AUTO RUN → Set to "Date" → VIEW/SET PARAMETERS → Enable Auto-Run #1 → Set date 03/15/2024, time 14:30:00 → ESC → ESC
**Expected:**
- All steps complete successfully
- Values saved
- Display formatted correctly

**Pass/Fail:** [ ]

### 10.4 Full Workflow - Level-Triggered
**Test:** Complete workflow: Setup → AUTO RUN → Set to "Level-Triggered" → VIEW/SET PARAMETERS → Set MODE=WINDOWED, ACTION=RUN/PSE, SOURCE=EXT, LEVEL=95.0 → ESC → ESC
**Expected:**
- All steps complete successfully
- TRIGGER automatically set to "Upper & Lower"
- Values saved

**Pass/Fail:** [ ]

---

## Summary

**Total Test Cases:** [Fill in count]  
**Passed:** [Fill in count]  
**Failed:** [Fill in count]  
**Notes:** [Fill in any issues, observations, or comments]

---

## Known Issues

[Document any known issues or limitations discovered during testing]

---

## Recommendations

[Document any recommendations for improvements or additional features]

