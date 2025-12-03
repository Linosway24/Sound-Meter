# Phase 4 Testing Guide - SLM Multi-Page Views & Advanced Features

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Phase 4  
**Scope:** SLM Multi-Page Navigation, 1/1 & 1/3 Octave Graph Views, Softkey Handlers

---

## Overview

This testing guide covers Phase 4 implementation:
- **Task 4.1:** SLM Multi-Page Navigation (pages 1-4 in numeric mode)
- **Task 4.2:** SLM 1/1 Octave Graph Views (pages 1-4)
- **Task 4.3:** SLM 1/3 Octave Graph Views (pages 1-4)
- **Task 4.4:** SLM Softkey Handlers (F/S/I, R/C/Z/F, Meter 1/2)

**Prerequisites:**
- Complete Phase 3 testing
- SLM basic functionality working (run/pause/stop)
- Home screen mode label cycling working (SLM → 1/1 → 1/3)

---

## Prerequisites Check

### P0: Console Errors Check
**Test:** Load the page and check browser console
**Expected:**
- ✅ No red error messages
- ✅ Console may show initialization logs
- ✅ No errors related to `slm`, `_getSlmViewId`, or new screen definitions

**Pass/Fail:** [x ]



## Test 1: SLM State Initialization

### 1.1 State Structure Check
**Test:** In browser console, run: `window.getMainFSMState().slm`
**Expected:**
- ✅ Returns object with properties:
  - `page: 1`
  - `mode: "numeric"`
  - `timeConstant: "F"`
  - `weighting: "R"`
  - `activeMeter: 1`
  - `viewLayout: "SPL"`

**Pass/Fail:** [x ]

### 1.2 State Persistence Check
**Test:** 
1. Check initial state: In browser console, run `window.getMainFSMState().slm`
   - Note the values (page, mode, timeConstant, weighting, activeMeter)
2. Navigate to SLM using one of these methods:
   - **Method A:** Press the RUN/PAUSE button (physical button on device photo)
   - **Method B:** On home screen, use DOWN arrow to select "VIEW SESSION", then press ENTER
3. Verify you're in SLM: Check `window.getMainFSMState().viewId` should be `"slm_home"` or `"slm_home_paused"`
4. Exit SLM: Press ESC key
5. Check state again: Run `window.getMainFSMState().slm` in console

**Expected:**
- ✅ State persists (same values for mode, timeConstant, weighting, activeMeter)
- ✅ Page resets to 1 when exiting SLM completely

**Pass/Fail:** [x ]

---

## Test 2: Task 4.1 - Multi-Page Navigation (Numeric Mode)

### 2.1 Enter SLM in Numeric Mode
**Test:**
1. Power on device (if needed, press Power button)
2. Ensure home screen shows "SLM" (softkey 1 at bottom left)
3. Enter SLM using one of these methods:
   - **Method A:** Click the RUN/PAUSE button on the device photo (or press keyboard shortcut)
   - **Method B:** Use DOWN arrow to navigate to "VIEW SESSION" in the home menu, then press ENTER
4. Check viewId: In console, run `window.getMainFSMState().viewId`
5. Check SLM state: In console, run `window.getMainFSMState().slm`

**Expected:**
- ✅ ViewId is `"slm_home"` (if running) or `"slm_home_paused"` (if paused)
- ✅ `slm.mode` is `"numeric"`
- ✅ `slm.page` is `1`
- ✅ Screen shows "SLM" title
- ✅ Status shows "RUNNING" or "PAUSED"

**Pass/Fail:** [ ]

### 2.2 Page Navigation - DOWN Arrow
**Test:**
1. Enter SLM (numeric mode, page 1)
2. Press DOWN arrow
3. Check viewId: `window.getMainFSMState().viewId`
4. Check page: `window.getMainFSMState().slm.page`
5. Press DOWN arrow 2 more times
6. Check page after each press

**Expected:**
- ✅ First DOWN: viewId becomes `"slm_home_page2_running"` (or `_paused`), page = 2
- ✅ Second DOWN: viewId becomes `"slm_home_page3_running"`, page = 3
- ✅ Third DOWN: viewId becomes `"slm_home_page4_running"`, page = 4
- ✅ Screen title still shows "SLM"
- ✅ Status persists (RUNNING/PAUSED)

**Pass/Fail:** [ ]

### 2.3 Page Navigation - UP Arrow
**Test:**
1. Navigate to page 4 (using DOWN arrows)
2. Press UP arrow
3. Check page: `window.getMainFSMState().slm.page`
4. Press UP arrow 2 more times
5. Check page after each press

**Expected:**
- ✅ From page 4: UP → page 3
- ✅ From page 3: UP → page 2
- ✅ From page 2: UP → page 1
- ✅ From page 1: UP → page 4 (wraps)

**Pass/Fail:** [ ]

### 2.4 Page Wrap-Around
**Test:**
1. Start at page 1
2. Press UP arrow (should wrap to page 4)
3. Press DOWN arrow (should wrap to page 1)
4. Verify wrap works in both directions

**Expected:**
- ✅ Page 1 → UP → Page 4 (wraps)
- ✅ Page 4 → DOWN → Page 1 (wraps)
- ✅ Console logs show page changes

**Pass/Fail:** [ ]

### 2.5 Page Persistence - Run/Pause Toggle
**Test:**
1. Navigate to page 3
2. Press RUN/PAUSE button (toggle state)
3. Check viewId: `window.getMainFSMState().viewId`
4. Check page: `window.getMainFSMState().slm.page`
5. Toggle again
6. Check page again

**Expected:**
- ✅ Page remains 3 after toggle
- ✅ ViewId changes between `_running` and `_paused` but page number stays
- ✅ Status updates correctly (RUNNING ↔ PAUSED)

**Pass/Fail:** [ ]

### 2.6 Page Persistence - Enter/Exit VIEW Menu
**Test:**
1. Navigate to page 2
2. Press SOFT1 (VIEW)
3. Check page: `window.getMainFSMState().slm.page`
4. Press ESC (return to SLM)
5. Check page: `window.getMainFSMState().slm.page`
6. Check viewId: `window.getMainFSMState().viewId`

**Expected:**
- ✅ Page remains 2 when entering VIEW menu
- ✅ Page remains 2 when exiting VIEW menu
- ✅ ViewId returns to correct page view (`slm_home_page2_running` or `_paused`)

**Pass/Fail:** [ ]

### 2.7 Page Reset on Exit
**Test:**
1. Navigate to page 4
2. Press ESC (exit SLM to home)
3. Check page: `window.getMainFSMState().slm.page`
4. Re-enter SLM (press RUN/PAUSE)
5. Check page: `window.getMainFSMState().slm.page`

**Expected:**
- ✅ Page resets to 1 when exiting SLM completely
- ✅ Re-entering SLM shows page 1

**Pass/Fail:** [ ]

---

## Test 3: Task 4.2 - 1/1 Octave Graph Views

### 3.1 Mode Selection - 1/1 from Home
**Test:**
1. On home screen, press SOFT1 to cycle mode label
2. Cycle until label shows "1/1"
3. Check slmLabelIndex: `window.getMainFSMState().slmLabelIndex`
4. Check slm.mode: `window.getMainFSMState().slm.mode`
5. Press RUN/PAUSE to enter SLM
6. Check viewId: `window.getMainFSMState().viewId`

**Expected:**
- ✅ `slmLabelIndex` is `1`
- ✅ `slm.mode` is `"1of1"`
- ✅ ViewId is `"slm_graph_1of1_page1_running"` (or `_paused`)
- ✅ Screen title shows "1/1"
- ✅ Graph placeholder visible: "Graph will be rendered here (1/1 Octave)"

**Pass/Fail:** [ ]

### 3.2 1/1 Mode - Page Navigation
**Test:**
1. Enter SLM in 1/1 mode (page 1)
2. Press DOWN arrow 3 times
3. Check viewId after each press
4. Press UP arrow 2 times
5. Check viewId after each press

**Expected:**
- ✅ DOWN: page 1 → 2 → 3 → 4
- ✅ ViewIds: `slm_graph_1of1_page1_running` → `_page2_running` → `_page3_running` → `_page4_running`
- ✅ UP: page 4 → 3 → 2
- ✅ Screen title always shows "1/1"
- ✅ Graph placeholder visible on all pages

**Pass/Fail:** [ ]

### 3.3 1/1 Mode - Run/Pause Toggle
**Test:**
1. Enter SLM in 1/1 mode, page 2
2. Press RUN/PAUSE to toggle
3. Check viewId: `window.getMainFSMState().viewId`
4. Check page: `window.getMainFSMState().slm.page`

**Expected:**
- ✅ ViewId changes between `_running` and `_paused`
- ✅ Page remains 2
- ✅ Mode remains "1of1"

**Pass/Fail:** [ ]

### 3.4 1/1 Mode - ESC Navigation
**Test:**
1. Enter SLM in 1/1 mode, page 3
2. Press ESC
3. Check viewId: `window.getMainFSMState().viewId`
4. Check page: `window.getMainFSMState().slm.page`

**Expected:**
- ✅ Returns to home screen
- ✅ Page resets to 1
- ✅ Mode persists (remains "1of1" in state, but not visible until re-entering SLM)

**Pass/Fail:** [ ]

---

## Test 4: Task 4.3 - 1/3 Octave Graph Views

### 4.1 Mode Selection - 1/3 from Home
**Test:**
1. On home screen, press SOFT1 twice (or until label shows "1/3")
2. Check slmLabelIndex: `window.getMainFSMState().slmLabelIndex`
3. Check slm.mode: `window.getMainFSMState().slm.mode`
4. Press RUN/PAUSE to enter SLM
5. Check viewId: `window.getMainFSMState().viewId`

**Expected:**
- ✅ `slmLabelIndex` is `2`
- ✅ `slm.mode` is `"1of3"`
- ✅ ViewId is `"slm_graph_1of3_page1_running"` (or `_paused`)
- ✅ Screen title shows "1/3"
- ✅ Graph placeholder visible: "Graph will be rendered here (1/3 Octave)"

**Pass/Fail:** [ ]

### 4.2 1/3 Mode - Page Navigation
**Test:**
1. Enter SLM in 1/3 mode (page 1)
2. Press DOWN arrow 3 times
3. Check viewId after each press
4. Press UP arrow 2 times
5. Check viewId after each press

**Expected:**
- ✅ DOWN: page 1 → 2 → 3 → 4
- ✅ ViewIds: `slm_graph_1of3_page1_running` → `_page2_running` → `_page3_running` → `_page4_running`
- ✅ UP: page 4 → 3 → 2
- ✅ Screen title always shows "1/3"
- ✅ Graph placeholder visible on all pages

**Pass/Fail:** [ ]

### 4.3 1/3 Mode - Run/Pause Toggle
**Test:**
1. Enter SLM in 1/3 mode, page 2
2. Press RUN/PAUSE to toggle
3. Check viewId: `window.getMainFSMState().viewId`
4. Check page: `window.getMainFSMState().slm.page`

**Expected:**
- ✅ ViewId changes between `_running` and `_paused`
- ✅ Page remains 2
- ✅ Mode remains "1of3"

**Pass/Fail:** [ ]

### 4.4 Mode Cycling - All Modes
**Test:**
1. On home screen, press SOFT1 multiple times
2. After each press, check label and enter SLM
3. Verify correct view is shown

**Expected:**
- ✅ Label cycles: SLM → 1/1 → 1/3 → SLM
- ✅ Entering SLM with "SLM" → numeric mode (page 1)
- ✅ Entering SLM with "1/1" → 1/1 graph mode (page 1)
- ✅ Entering SLM with "1/3" → 1/3 graph mode (page 1)
- ✅ Mode persists when re-entering SLM

**Pass/Fail:** [ ]

---

## Test 5: Task 4.4 - Softkey Handlers

### 5.1 SOFT2 - F/S/I Cycling
**Test:**
1. Enter SLM (any mode, any page)
2. Check initial timeConstant: `window.getMainFSMState().slm.timeConstant`
3. Press SOFT2
4. Check timeConstant: `window.getMainFSMState().slm.timeConstant`
5. Press SOFT2 twice more
6. Check timeConstant after each press

**Expected:**
- ✅ Initial: `"F"`
- ✅ First SOFT2: `"S"`
- ✅ Second SOFT2: `"I"`
- ✅ Third SOFT2: `"F"` (wraps)
- ✅ Console logs: `[FSM] SOFT2 pressed on SLM → Time constant: X`
- ✅ Softkey label shows "F S I" with underline on active letter
- ✅ Underline moves: F → S → I → F

**Pass/Fail:** [ ]

### 5.2 SOFT2 - Visual Feedback (Underline)
**Test:**
1. Enter SLM
2. Observe SOFT2 label: "F S I"
3. Press SOFT2 multiple times
4. Observe underline position

**Expected:**
- ✅ Initial: Underline under "F"
- ✅ After first press: Underline under "S"
- ✅ After second press: Underline under "I"
- ✅ After third press: Underline under "F" (wraps)
- ✅ Underline is visible and moves smoothly
- ✅ CSS class `active` applied to correct span

**Pass/Fail:** [ ]

### 5.3 SOFT3 - R/C/Z/F Cycling
**Test:**
1. Enter SLM (any mode, any page)
2. Check initial weighting: `window.getMainFSMState().slm.weighting`
3. Press SOFT3
4. Check weighting: `window.getMainFSMState().slm.weighting`
5. Press SOFT3 three more times
6. Check weighting after each press

**Expected:**
- ✅ Initial: `"R"`
- ✅ First SOFT3: `"C"`
- ✅ Second SOFT3: `"Z"`
- ✅ Third SOFT3: `"F"`
- ✅ Fourth SOFT3: `"R"` (wraps)
- ✅ Console logs: `[FSM] SOFT3 pressed on SLM → Weighting: X`
- ✅ Softkey label shows "R C Z F" with underline on active letter
- ✅ Underline moves: R → C → Z → F → R

**Pass/Fail:** [ ]

### 5.4 SOFT3 - Visual Feedback (Underline)
**Test:**
1. Enter SLM
2. Observe SOFT3 label: "R C Z F"
3. Press SOFT3 multiple times
4. Observe underline position

**Expected:**
- ✅ Initial: Underline under "R"
- ✅ After first press: Underline under "C"
- ✅ After second press: Underline under "Z"
- ✅ After third press: Underline under "F"
- ✅ After fourth press: Underline under "R" (wraps)
- ✅ Underline is visible and moves smoothly

**Pass/Fail:** [ ]

### 5.5 SOFT4 - Meter 1/2 Toggle
**Test:**
1. Enter SLM (any mode, any page)
2. Check initial activeMeter: `window.getMainFSMState().slm.activeMeter`
3. Press SOFT4
4. Check activeMeter: `window.getMainFSMState().slm.activeMeter`
5. Press SOFT4 again
6. Check activeMeter

**Expected:**
- ✅ Initial: `1`
- ✅ First SOFT4: `2`
- ✅ Second SOFT4: `1` (toggles back)
- ✅ Console logs: `[FSM] SOFT4 pressed on SLM → Active meter: X`
- ✅ Softkey label shows "Meter 1" or "Meter 2"
- ✅ Label updates immediately

**Pass/Fail:** [ ]

### 5.6 SOFT4 - Visual Feedback (Label Update)
**Test:**
1. Enter SLM
2. Observe SOFT4 label
3. Press SOFT4
4. Observe label change
5. Press SOFT4 again
6. Observe label change back

**Expected:**
- ✅ Initial: "Meter 1"
- ✅ After first press: "Meter 2"
- ✅ After second press: "Meter 1"
- ✅ Label updates immediately (no delay)

**Pass/Fail:** [ ]

### 5.7 Softkey State Persistence - Page Navigation
**Test:**
1. Enter SLM, page 1
2. Press SOFT2 (set to "S")
3. Press SOFT3 (set to "C")
4. Press SOFT4 (set to "Meter 2")
5. Navigate to page 3 (DOWN arrow twice)
6. Check all softkey states

**Expected:**
- ✅ timeConstant remains "S"
- ✅ weighting remains "C"
- ✅ activeMeter remains 2
- ✅ Softkey labels show correct values with underlines
- ✅ Underlines in correct positions

**Pass/Fail:** [ ]

### 5.8 Softkey State Persistence - Run/Pause Toggle
**Test:**
1. Enter SLM, set SOFT2 to "I", SOFT3 to "Z", SOFT4 to "Meter 2"
2. Press RUN/PAUSE to toggle state
3. Check all softkey states

**Expected:**
- ✅ All softkey states persist
- ✅ Softkey labels show correct values
- ✅ Underlines in correct positions

**Pass/Fail:** [ ]

### 5.9 Softkey State Persistence - Mode Switch
**Test:**
1. Enter SLM in numeric mode
2. Set SOFT2 to "S", SOFT3 to "C", SOFT4 to "Meter 2"
3. Exit SLM (ESC)
4. Change mode to "1/1" on home screen (SOFT1)
5. Re-enter SLM
6. Check all softkey states

**Expected:**
- ✅ All softkey states persist across mode changes
- ✅ Softkey labels show correct values
- ✅ Underlines in correct positions
- ✅ Mode is "1of1" but softkey states unchanged

**Pass/Fail:** [ ]

### 5.10 Softkeys Only Active in SLM
**Test:**
1. On home screen, press SOFT2, SOFT3, SOFT4
2. Check if any state changes occur
3. Enter SLM
4. Press SOFT2, SOFT3, SOFT4
5. Check if state changes occur

**Expected:**
- ✅ On home screen: SOFT2/SOFT3/SOFT4 do not affect SLM state
- ✅ In SLM: SOFT2/SOFT3/SOFT4 work correctly
- ✅ Console logs only appear when in SLM

**Pass/Fail:** [ ]

---

## Test 6: Integration Tests

### 6.1 Full Workflow - Numeric Mode with All Features
**Test:**
1. Enter SLM in numeric mode
2. Navigate to page 2
3. Press SOFT2 (set to "S")
4. Press SOFT3 (set to "C")
5. Press SOFT4 (set to "Meter 2")
6. Toggle run/pause
7. Navigate to page 4
8. Enter VIEW menu and exit
9. Check all states

**Expected:**
- ✅ Page is 4
- ✅ Mode is "numeric"
- ✅ timeConstant is "S"
- ✅ weighting is "C"
- ✅ activeMeter is 2
- ✅ All softkey labels correct
- ✅ ViewId is correct for page 4

**Pass/Fail:** [ ]

### 6.2 Full Workflow - 1/1 Mode with All Features
**Test:**
1. Set mode to "1/1" on home screen
2. Enter SLM
3. Navigate to page 3
4. Set all softkeys (SOFT2="I", SOFT3="Z", SOFT4="Meter 2")
5. Toggle run/pause
6. Navigate to page 1
7. Check all states

**Expected:**
- ✅ Page is 1
- ✅ Mode is "1of1"
- ✅ All softkey states persist
- ✅ ViewId is `slm_graph_1of1_page1_running` or `_paused`
- ✅ Graph placeholder visible

**Pass/Fail:** [ ]

### 6.3 Full Workflow - 1/3 Mode with All Features
**Test:**
1. Set mode to "1/3" on home screen
2. Enter SLM
3. Navigate to page 2
4. Set all softkeys
5. Navigate through all pages
6. Exit and re-enter SLM
7. Check all states

**Expected:**
- ✅ Mode persists as "1of3"
- ✅ Page resets to 1 on re-entry
- ✅ Softkey states persist
- ✅ All pages accessible

**Pass/Fail:** [ ]

### 6.4 Mode Switching - All Modes, All Pages
**Test:**
1. Enter SLM in numeric mode, navigate to page 3
2. Exit SLM, switch to "1/1", enter SLM
3. Navigate to page 2
4. Exit SLM, switch to "1/3", enter SLM
5. Navigate to page 4
6. Check states

**Expected:**
- ✅ Each mode shows correct view
- ✅ Page navigation works in all modes
- ✅ Softkey states persist across mode changes
- ✅ No console errors

**Pass/Fail:** [ ]

---

## Test 7: Edge Cases & Error Handling

### 7.1 Rapid Page Navigation
**Test:**
1. Enter SLM
2. Rapidly press DOWN arrow 10 times
3. Check page: `window.getMainFSMState().slm.page`
4. Check viewId: `window.getMainFSMState().viewId`

**Expected:**
- ✅ Page wraps correctly (should be at page 2 after 10 presses from page 1)
- ✅ ViewId is correct
- ✅ No console errors
- ✅ Screen updates correctly

**Pass/Fail:** [ ]

### 7.2 Rapid Softkey Pressing
**Test:**
1. Enter SLM
2. Rapidly press SOFT2, SOFT3, SOFT4 multiple times
3. Check all states

**Expected:**
- ✅ All states update correctly
- ✅ Underlines move correctly
- ✅ Labels update correctly
- ✅ No console errors

**Pass/Fail:** [ ]

### 7.3 Navigation During Run/Pause Toggle
**Test:**
1. Enter SLM, page 2
2. Press DOWN arrow while toggling run/pause
3. Check page and state

**Expected:**
- ✅ Page navigation works during state changes
- ✅ State updates correctly
- ✅ ViewId is correct

**Pass/Fail:** [ ]

### 7.4 Multiple Mode Switches
**Test:**
1. Enter SLM in numeric mode
2. Exit, switch to "1/1", enter
3. Exit, switch to "1/3", enter
4. Exit, switch to "SLM", enter
5. Check all states

**Expected:**
- ✅ Mode switches correctly each time
- ✅ Page resets to 1 on each entry
- ✅ Softkey states persist
- ✅ Correct views displayed

**Pass/Fail:** [ ]

---

## Test 8: Visual Verification

### 8.1 Screen Display - Numeric Pages
**Test:** Navigate through all 4 pages in numeric mode
**Expected:**
- ✅ Page 1: Shows "SLM" title, status, timer
- ✅ Pages 2-4: Show "SLM" title, status, timer (content may vary by page)
- ✅ All softkeys visible and labeled correctly
- ✅ Underlines visible on SOFT2 and SOFT3
- ✅ SOFT4 shows "Meter 1" or "Meter 2"

**Pass/Fail:** [ ]

### 8.2 Screen Display - 1/1 Graph Pages
**Test:** Navigate through all 4 pages in 1/1 mode
**Expected:**
- ✅ All pages show "1/1" title
- ✅ Graph placeholder visible: "Graph will be rendered here (1/1 Octave)"
- ✅ Status and timer visible
- ✅ All softkeys visible and labeled correctly

**Pass/Fail:** [ ]

### 8.3 Screen Display - 1/3 Graph Pages
**Test:** Navigate through all 4 pages in 1/3 mode
**Expected:**
- ✅ All pages show "1/3" title
- ✅ Graph placeholder visible: "Graph will be rendered here (1/3 Octave)"
- ✅ Status and timer visible
- ✅ All softkeys visible and labeled correctly

**Pass/Fail:** [ ]

### 8.4 Softkey Label Rendering
**Test:** Observe all softkey labels in SLM
**Expected:**
- ✅ SOFT1: "VIEW" (always)
- ✅ SOFT2: "F S I" with underline on active letter
- ✅ SOFT3: "R C Z F" with underline on active letter
- ✅ SOFT4: "Meter 1" or "Meter 2"
- ✅ Labels update immediately when pressed
- ✅ Underlines move smoothly (CSS transition)

**Pass/Fail:** [ ]

---

## Test 9: Console Logging Verification

### 9.1 Page Navigation Logging
**Test:** Navigate pages and check console
**Expected:**
- ✅ Console shows page changes (if logging implemented)
- ✅ No error messages
- ✅ State updates logged correctly

**Pass/Fail:** [ ]

### 9.2 Softkey Handler Logging
**Test:** Press SOFT2, SOFT3, SOFT4 and check console
**Expected:**
- ✅ Console shows: `[FSM] SOFT2 pressed on SLM → Time constant: X`
- ✅ Console shows: `[FSM] SOFT3 pressed on SLM → Weighting: X`
- ✅ Console shows: `[FSM] SOFT4 pressed on SLM → Active meter: X`
- ✅ No error messages

**Pass/Fail:** [ ]

---

## Test 10: State Persistence Summary

### 10.1 Complete State Check
**Test:** After completing all navigation and softkey tests, check complete state
**Expected:**
- ✅ `slm.page`: Valid (1-4)
- ✅ `slm.mode`: Valid ("numeric", "1of1", or "1of3")
- ✅ `slm.timeConstant`: Valid ("F", "S", or "I")
- ✅ `slm.weighting`: Valid ("R", "C", "Z", or "F")
- ✅ `slm.activeMeter`: Valid (1 or 2)
- ✅ `slm.viewLayout`: "SPL" (default)
- ✅ All values persist correctly

**Pass/Fail:** [ ]

---

## Summary Checklist

### Core Functionality
- [ ] Page navigation works (UP/DOWN, wraps correctly)
- [ ] Page persistence across run/pause toggle
- [ ] Page persistence across VIEW menu entry/exit
- [ ] Page resets to 1 on SLM exit
- [ ] Mode switching works (numeric, 1/1, 1/3)
- [ ] All softkey handlers work (SOFT2, SOFT3, SOFT4)
- [ ] Visual feedback works (underlines, labels)

### State Management
- [ ] SLM state initializes correctly
- [ ] State persists across all transitions
- [ ] State resets appropriately (page on exit)

### Visual Verification
- [ ] All screens render correctly
- [ ] Softkey labels display correctly
- [ ] Underlines visible and move correctly
- [ ] Graph placeholders visible

### Error Handling
- [ ] No console errors
- [ ] Rapid input handled correctly
- [ ] Edge cases handled gracefully

---

## Notes

**Issues Found:**
[List any issues discovered during testing]

**Suggestions:**
[List any suggestions for improvement]

**Test Completion:**
- Date Completed: [ ]
- All Tests Passed: [ ]
- Ready for Next Phase: [ ]

---

**Document Owner:** Development Team  
**Last Updated:** [Date]  
**Status:** Ready for Testing

