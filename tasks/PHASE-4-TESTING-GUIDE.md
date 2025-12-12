# Phase 4 Testing Guide - SLM Multi-Page Views & Advanced Features

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Phase 4  
**Scope:** SLM Multi-Page Navigation, Graph Modes, Softkey Handlers, and Layout Fixes

---

## Overview

This testing guide covers Phase 4 implementation:
- **SLM Home Screen Layout**: Status bar, bar graph, main readout
- **Multi-Page Navigation**: Pages 1-4 with UP/DOWN cycling
- **Graph Mode Views**: 1/1 and 1/3 octave graph modes
- **Softkey Handlers**: F/S/I (time constant), R/C/Z/F (weighting), Meter 1/2 toggle
- **Mode Switching**: Numeric → 1/1 → 1/3 → Numeric

**Prerequisites:**
- Complete Phase 1, 2, and 3 testing
- Device can start up and navigate to home screen
- SLM basic functionality (run/pause/stop) working from Phase 2

---

## P1: Pre-Testing Setup

### P1.1 Browser Console
**Test:** Open browser developer console (F12)
**Expected:**
- Console is visible and ready for log inspection
- No errors on page load

**Pass/Fail:** [ x]

### P1.2 Device State
**Test:** Power on device (if needed) and navigate to home screen
**Expected:**
- Device shows home screen with menu items
- No visual errors or layout issues

**Pass/Fail:** [x ]

---

## 1. SLM Home Screen Layout Tests

### 1.1 Navigate to SLM
**Test:** From home screen, select "VIEW SESSION" and press ENTER
**Expected:**
- Navigates to SLM home screen (page 1, numeric mode)
- Screen shows:
  - Status bar at top with battery icon (left), play/pause icon (center-left), timer (right)
  - Horizontal bar graph below status bar with "-20" above left end, "70" above right end
  - Main dB readout in large digits below bar graph
  - Units displayed to right of main reading (e.g., "dB LZS")
  - Softkey labels at bottom: VIEW, F-S-I, R-C-Z-F, METER 1

**Pass/Fail:** [ x]

### 1.2 Status Bar Elements
**Test:** Verify status bar displays correctly
**Expected:**
- Battery icon visible on left (green/full charge indicator)
- Play icon (▶) visible when running, pause icon (⏸) when paused
- Timer displays in format "hh:mm:ss" (e.g., "00:00:00" initially)
- Timer updates every second when running

**Pass/Fail:** [ x]

### 1.3 Bar Graph Display
**Test:** Verify bar graph displays correctly
**Expected:**
- Horizontal bar graph visible below status bar
- "-20" label above left end of graph
- "70" label above right end of graph
- Bar fill level corresponds to current SPL value (0-100% based on -20 to 70 dB range)
- Bar color is green (#4ade80)

**Pass/Fail:** [x ]

### 1.4 Main Readout Display
**Test:** Verify main readout displays correctly
**Expected:**
- Large numeric display (3.5em font size) showing current SPL value
- Value formatted to 1 decimal place (e.g., "18.4")
- Units displayed to right (e.g., "dB LZS")
- Units format: "dB" followed by weighting and time constant letters
  - Default: "dB LZS" (L=Linear/R, Z=Zero, S=Slow)
  - Changes based on SOFT2 (F/S/I) and SOFT3 (R/C/Z/F) selections

**Pass/Fail:** [x ]

### 1.5 Layout Positioning
**Test:** Verify all elements are positioned correctly
**Expected:**
- Status bar spans full width at top
- Bar graph positioned below status bar with proper spacing
- Main readout centered below bar graph
- Softkeys at bottom with proper spacing
- All elements properly aligned and spaced

**Pass/Fail:** [x ]

---

## 2. Multi-Page Navigation Tests

### 2.1 Page 1 Display
**Test:** Navigate to SLM home screen (page 1) and verify content

**Steps:**
1. From home screen, select "VIEW SESSION" and press ENTER (or click the menu item)
2. You should now be on the SLM home screen (page 1, numeric mode)
3. Open browser console (F12 or Cmd+Option+I) and go to Console tab

**Visual Verification:**
- Status bar visible at top with:
  - Battery icon (green horizontal bar) on the left
  - Play icon (▶) or pause icon (⏸) in center-left
  - Timer on the right showing "hh:mm:ss" format (e.g., "00:00:00")
- Horizontal bar graph below status bar with:
  - "-20" label above left end (should be large, readable text)
  - "70" label above right end (should be large, readable text)
  - Green bar fill showing current level
- Main readout below bar graph:
  - Large numeric value (e.g., "18.4" or "0.0")
  - Units displayed to right (e.g., "dB LZS")
- Softkey labels at bottom: VIEW, F-S-I, R-C-Z-F, METER 1

**Console Commands to Run:**
1. Type in console: `window.getMainFSMState().slm.currentPage`
   - **Expected result:** Should return `1`
   - If it returns `undefined` or an error, check: `window.getMainFSMState().slm` first

2. Type in console: `window.getMainFSMState().slm.mode`
   - **Expected result:** Should return `"numeric"`

3. Type in console: `window.getMainFSMState().viewId`
   - **Expected result:** Should return `"slm_home"` (if running) or `"slm_home_paused"` (if paused) or `"slm_home_stopped"` (if stopped)

4. Type in console: `window.getMainFSMState().measurement.currentSPL`
   - **Expected result:** Should return a number (e.g., `0`, `18.4`, `25.0`)
   - This value should match what's displayed in the main readout

5. Type in console: `window.getMainFSMState().slm`
   - **Expected result:** Should return an object like:
     ```
     {
       currentPage: 1,
       mode: "numeric",
       timeConstant: "S",
       weighting: "R",
       activeMeter: 1,
       units: "LZS"
     }
     ```

**Console Logs to Check:**
- Look for console messages like:
  - `[SLM] Current page: 1, Mode: numeric`
  - `[SLM] Screen: slm_home` (or similar)
- No error messages should appear

**What to Verify:**
- Main readout value matches `measurement.currentSPL` from console
- Page number is 1 (verify via console command)
- Mode is "numeric" (verify via console command)
- All layout elements are visible and properly positioned
- Status bar elements (battery, play/pause icon, timer) are visible
- Bar graph labels "-20" and "70" are large and readable
- Bar graph height is substantial (not too thin)

**Pass/Fail:** [x ]

### 2.2 Navigate to Page 2 (ENTER)
**Test:** Press ENTER to cycle from page 1 to page 2

**Steps:**
1. On SLM home screen (page 1), verify you're on page 1:
   - Console: `window.getMainFSMState().slm.currentPage` → should be `1`
   - Console: `window.getMainFSMState().viewId` → should be `"slm_home"` (or paused/stopped)
2. Press ENTER button
3. **Expected after ENTER:**
   - Screen transitions to page 2
   - Main readout shows `measurement.Leq` value (or placeholder)
   - Status bar, bar graph, and layout elements remain visible
   - Console: `window.getMainFSMState().viewId` → should be `"slm_home_page2_running"` (or paused/stopped)
   - Console: `window.getMainFSMState().slm.currentPage` → should be `2`
   - Console log should show: `[SLM] ENTER: Page 2, Mode: numeric`

**Console Commands:**
- Before ENTER: `window.getMainFSMState().slm.currentPage` → should be `1`
- After ENTER: `window.getMainFSMState().viewId` → should be `"slm_home_page2_running"` (or paused/stopped)
- After ENTER: `window.getMainFSMState().slm.currentPage` → should be `2`

**Pass/Fail:** [x ]

### 2.3 Navigate to Page 3 (ENTER)
**Test:** Press ENTER again to cycle from page 2 to page 3

**Steps:**
1. From page 2, press ENTER button
2. **Expected after ENTER:**
   - Screen transitions to page 3
   - Main readout shows `measurement.Lmax` value (or placeholder)
   - Console: `window.getMainFSMState().viewId` → should be `"slm_home_page3_running"` (or paused/stopped)
   - Console: `window.getMainFSMState().slm.currentPage` → should be `3`
   - Console log should show: `[SLM] ENTER: Page 3, Mode: numeric`

**Console Commands:**
- After ENTER: `window.getMainFSMState().viewId` → should be `"slm_home_page3_running"` (or paused/stopped)
- After ENTER: `window.getMainFSMState().slm.currentPage` → should be `3`

**Pass/Fail:** [x ]

### 2.4 Navigate to Page 4 (ENTER)
**Test:** Press ENTER again to cycle from page 3 to page 4

**Steps:**
1. From page 3, press ENTER button
2. **Expected after ENTER:**
   - Screen transitions to page 4
   - Main readout shows `measurement.Lmin` value (or placeholder)
   - Console: `window.getMainFSMState().viewId` → should be `"slm_home_page4_running"` (or paused/stopped)
   - Console: `window.getMainFSMState().slm.currentPage` → should be `4`
   - Console log should show: `[SLM] ENTER: Page 4, Mode: numeric`

**Console Commands:**
- After ENTER: `window.getMainFSMState().viewId` → should be `"slm_home_page4_running"` (or paused/stopped)
- After ENTER: `window.getMainFSMState().slm.currentPage` → should be `4`

**Pass/Fail:** [x ]

### 2.5 Wrap Around (Page 4 → Page 1)
**Test:** Press ENTER on page 4 to wrap around to page 1

**Steps:**
1. On page 4, verify current page:
   - Console: `window.getMainFSMState().slm.currentPage` → should be `4`
2. Press ENTER button
3. **Expected after ENTER:**
   - Screen wraps around to page 1
   - Console: `window.getMainFSMState().viewId` → should be `"slm_home"` (or paused/stopped)
   - Console: `window.getMainFSMState().slm.currentPage` → should be `1`
   - Console log should show: `[SLM] ENTER: Page 1, Mode: numeric`

**Console Commands:**
- Before ENTER: `window.getMainFSMState().slm.currentPage` → should be `4`
- After ENTER: `window.getMainFSMState().viewId` → should be `"slm_home"` (or paused/stopped)
- After ENTER: `window.getMainFSMState().slm.currentPage` → should be `1`

**Pass/Fail:** [x ]

### 2.6 UP/DOWN Arrows Have No Effect
**Test:** Verify UP/DOWN arrows do not change pages in SLM mode

**Steps:**
1. On any SLM page (e.g., page 2), note the current page:
   - Console: `window.getMainFSMState().slm.currentPage` → should be `2`
2. Press DOWN arrow
3. **Expected:**
   - Screen does NOT change (still on page 2)
   - Console: `window.getMainFSMState().slm.currentPage` → should still be `2`
   - Console: `window.getMainFSMState().viewId` → should not change
   - No console log about page change
4. Press UP arrow
5. **Expected:**
   - Screen does NOT change (still on page 2)
   - Console: `window.getMainFSMState().slm.currentPage` → should still be `2`
   - Console: `window.getMainFSMState().viewId` → should not change
   - No console log about page change

**Note:** UP/DOWN arrows should have no effect on page navigation in SLM mode. Only ENTER cycles pages.

**Pass/Fail:** [x ]

### 2.7 Page State Persistence
**Test:** Navigate to page 3, then press RUN/PAUSE to toggle measurement state
**Expected:**
- Page number remains 3 (does not reset to 1)
- Screen transitions between running/paused states but stays on page 3
- Console log shows page 3 maintained

**Test:** Navigate to page 2, press STOP (hold 3 seconds), then press RUN again
**Expected:**
- After stopping and restarting, returns to page 2 (not page 1)
- Page state persists across stop/start cycle

**Pass/Fail:** [ x]

---

## 3. Graph Mode Tests

### 3.1 Switch to 1/1 Mode (Home Screen)
**Test:** From home screen, press SOFT1 multiple times
**Expected:**
- Cycles through: SLM → 1/1 → 1/3 → SLM
- Softkey 1 label updates: "SLM" → "1/1" → "1/3" → "SLM"
- Console log shows: `[FSM] SOFT1 pressed on home → Cycling SLM label, index: X`

**Pass/Fail:** [x ]

### 3.2 Enter 1/1 Graph Mode
**Test:** Set home screen SOFT1 to "1/1", then select "VIEW SESSION" and press ENTER
**Expected:**
- Navigates to `slm_graph_1of1_page1_running` screen
- Status bar visible with play icon and timer
- Graph placeholder text visible: "1/1 Octave Graph (Placeholder)"
- Softkeys show: VIEW, F-S-I, R-C-Z-F, METER 1
- Console log shows: `[SLM] Mode: 1of1, Page: 1`

**Pass/Fail:** [x ]

### 3.3 Navigate Pages in 1/1 Mode
**Test:** In 1/1 graph mode, press DOWN arrow multiple times
**Expected:**
- Cycles through pages 1-4
- Screen IDs update: `slm_graph_1of1_page1_running` → `page2_running` → `page3_running` → `page4_running` → `page1_running`
- Graph placeholder text updates for each page
- Console log shows page changes

**Pass/Fail:** [ x]

### 3.4 Enter 1/3 Graph Mode
**Test:** Set home screen SOFT1 to "1/3", then select "VIEW SESSION" and press ENTER
**Expected:**
- Navigates to `slm_graph_1of3_page1_running` screen
- Status bar visible with play icon and timer
- Graph placeholder text visible: "1/3 Octave Graph (Placeholder)"
- Console log shows: `[SLM] Mode: 1of3, Page: 1`

**Pass/Fail:** [x ]

### 3.5 Navigate Pages in 1/3 Mode
**Test:** In 1/3 graph mode, press DOWN arrow multiple times
**Expected:**
- Cycles through pages 1-4
- Screen IDs update: `slm_graph_1of3_page1_running` → `page2_running` → `page3_running` → `page4_running` → `page1_running`
- Graph placeholder text updates for each page

**Pass/Fail:** [x ]

### 3.6 Mode Switching Resets to Page 1
**Test:** Navigate to page 3 in numeric mode, then ESC to home, change SOFT1 to "1/1", then enter SLM again
**Expected:**
- Enters 1/1 graph mode on page 1 (resets to page 1 when switching modes)
- Console log shows: `[SLM] Mode: 1of1, Page: 1`
- Page number resets to 1 when switching modes (matches actual device behavior)

**Pass/Fail:** [x ]

### 3.7 Page Navigation Preserves Mode
**Test:** In 1/1 graph mode, navigate to page 2, then press UP/DOWN
**Expected:**
- Stays in 1/1 graph mode (does not switch to numeric or 1/3)
- Only page number changes
- Console log shows mode remains "1of1"

**Pass/Fail:** [x ]

---

## 4. Softkey Handler Tests

### 4.1 SOFT2: F/S/I Cycling (Time Constant)
**Test:** On any SLM screen, press SOFT2 multiple times
**Expected:**
- Softkey 2 label cycles: "F-S-I" → "F-S-I" → "F-S-I" (with underline moving)
- Underline moves: F → S → I → F (wraps)
- Console log shows: `[SLM] SOFT2: Time constant = F` (then S, then I)
- Units display updates: "dB LZF" (F) → "dB LZS" (S) → "dB LZI" (I)
- State persists: `_state.slm.timeConstant` updates

**Pass/Fail:** [x ]

### 4.2 SOFT2 Underline Display
**Test:** Press SOFT2 and observe softkey 2 label
**Expected:**
- When F active: "**F**-S-I" (F underlined)
- When S active: "F-**S**-I" (S underlined)
- When I active: "F-S-**I**" (I underlined)
- Underline is visible and properly positioned

**Pass/Fail:** [x ]

### 4.3 SOFT3: R/C/Z/F Cycling (Weighting)
**Test:** On any SLM screen, press SOFT3 multiple times
**Expected:**
- Softkey 3 label cycles: "R-C-Z-F" → "R-C-Z-F" → "R-C-Z-F" → "R-C-Z-F" (with underline moving)
- Underline moves: R → C → Z → F → R (wraps)
- Console log shows: `[SLM] SOFT3: Weighting = R` (then C, Z, F)
- Units display updates based on weighting:
  - R → "dB LZS" (L=Linear)
  - C → "dB CZS" (C=C-weighting)
  - Z → "dB ZZS" (Z=Z-weighting)
  - F → "dB FZS" (F=F-weighting)
- State persists: `_state.slm.weighting` updates

**Pass/Fail:** [x ]

### 4.4 SOFT3 Underline Display
**Test:** Press SOFT3 and observe softkey 3 label
**Expected:**
- When R active: "**R**-C-Z-F" (R underlined)
- When C active: "R-**C**-Z-F" (C underlined)
- When Z active: "R-C-**Z**-F" (Z underlined)
- When F active: "R-C-Z-**F**" (F underlined)
- Underline is visible and properly positioned

**Pass/Fail:** [x ]

### 4.5 SOFT4: Meter 1/2 Toggle
**Test:** On any SLM screen, press SOFT4 multiple times
**Expected:**
- Softkey 4 label toggles: "METER 1" ↔ "METER 2"
- Console log shows: `[SLM] SOFT4: Active meter = 1` (then 2, then 1)
- State persists: `_state.slm.activeMeter` updates (1 or 2)

**Pass/Fail:** [x ]

### 4.6 Softkey States Persist
**Test:** Set SOFT2 to "I", SOFT3 to "Z", SOFT4 to "METER 2", then navigate to different page
**Expected:**
- Softkey states remain: I, Z, METER 2
- Underlines remain in correct positions
- Console log confirms states maintained

**Test:** ESC to home, then return to SLM
**Expected:**
- Softkey states reset to defaults: S, R, METER 1 (or persist if state is maintained)
- Check console for state values

**Pass/Fail:** [x ]

### 4.7 Softkeys Work in All Modes
**Test:** Test SOFT2, SOFT3, SOFT4 in numeric mode, 1/1 graph mode, and 1/3 graph mode
**Expected:**
- All softkeys work in all three modes
- Underlines display correctly in all modes
- State updates work in all modes

**Pass/Fail:** [x ]

---

## 5. Run/Pause/Stop Tests Across Pages and Modes

### 5.1 Run/Pause on Page 2
**Test:** Navigate to page 2, press RUN/PAUSE
**Expected:**
- Measurement starts/pauses correctly
- Screen transitions: `slm_home_page2_running` ↔ `slm_home_page2_paused`
- Status bar play/pause icon updates
- Timer runs when running, pauses when paused
- Page number remains 2

**Pass/Fail:** [ ]

### 5.2 Run/Pause on Page 3
**Test:** Navigate to page 3, press RUN/PAUSE
**Expected:**
- Measurement starts/pauses correctly
- Screen transitions: `slm_home_page3_running` ↔ `slm_home_page3_paused`
- Page number remains 3

**Pass/Fail:** [x ]

### 5.3 Run/Pause on Page 4
**Test:** Navigate to page 4, press RUN/PAUSE
**Expected:**
- Measurement starts/pauses correctly
- Screen transitions: `slm_home_page4_running` ↔ `slm_home_page4_paused`
- Page number remains 4

**Pass/Fail:** [x ]

### 5.4 Stop from Page 2
**Test:** On page 2 (running or paused), hold STOP button for 3 seconds
**Expected:**
- Stop confirmation appears after 3 seconds
- Screen transitions to `slm_home_page2_stopped`
- Measurement state is "stopped"
- Page number remains 2

**Pass/Fail:** [ ]

### 5.5 Run/Pause in 1/1 Graph Mode
**Test:** In 1/1 graph mode (any page), press RUN/PAUSE
**Expected:**
- Measurement starts/pauses correctly
- Screen transitions: `slm_graph_1of1_pageX_running` ↔ `slm_graph_1of1_pageX_paused`
- Status bar play/pause icon updates
- Mode and page number remain unchanged

**Pass/Fail:** [ x]

### 5.6 Run/Pause in 1/3 Graph Mode
**Test:** In 1/3 graph mode (any page), press RUN/PAUSE
**Expected:**
- Measurement starts/pauses correctly
- Screen transitions: `slm_graph_1of3_pageX_running` ↔ `slm_graph_1of3_pageX_paused`
- Status bar play/pause icon updates
- Mode and page number remain unchanged

**Pass/Fail:** [x ]

### 5.7 Stop from Graph Mode
**Test:** In 1/1 graph mode (any page), hold STOP button for 3 seconds
**Expected:**
- Stop confirmation appears after 3 seconds
- Screen transitions to `slm_graph_1of1_pageX_stopped`
- Measurement state is "stopped"
- Mode and page number remain unchanged

**Pass/Fail:** [x ]

---

## 6. Integration Tests

### 6.1 Mode Switch Preserves Page
**Test:** 
1. Navigate to page 3 in numeric mode
2. ESC to home
3. Change SOFT1 to "1/1"
4. Enter SLM again
**Expected:**
- Enters 1/1 graph mode on page 3
- Console log: `[SLM] Mode: 1of1, Page: 3`
- Page number preserved

**Pass/Fail:** [x ]

### 6.2 Page Navigation Preserves Mode
**Test:**
1. Enter 1/3 graph mode
2. Navigate to page 2
3. Press UP/DOWN arrows
**Expected:**
- Stays in 1/3 graph mode
- Only page number changes
- Console log shows mode remains "1of3"

**Pass/Fail:** [x ]

### 6.3 Softkeys Work in All Modes
**Test:** Test SOFT2, SOFT3, SOFT4 in:
- Numeric mode (page 1)
- 1/1 graph mode (page 2)
- 1/3 graph mode (page 3)
**Expected:**
- All softkeys function correctly in all modes
- Underlines display correctly
- State updates work

**Pass/Fail:** [x ]

### 6.4 Run/Pause/Stop Works Across All Pages and Modes
**Test:** Test run/pause/stop on:
- Page 1, 2, 3, 4 in numeric mode
- Page 1, 2, 3, 4 in 1/1 graph mode
- Page 1, 2, 3, 4 in 1/3 graph mode
**Expected:**
- Run/pause/stop works correctly in all combinations
- Screen transitions are correct
- State persists correctly

**Pass/Fail:** [x ]

### 6.5 ESC Returns to Home
**Test:** From any SLM screen (any page, any mode), press ESC
**Expected:**
- Returns to home screen
- Measurement state preserved (if running/paused, can resume)
- Console log shows navigation

**Pass/Fail:** [x ]

### 6.6 VIEW Menu Integration
**Test:** From any SLM screen, press SOFT1 (VIEW)
**Expected:**
- Opens `slm_view_menu`
- Menu items: VIEW PAST STUDIES, VIEW CURRENT STUDY, VIEW SESSION

**Test:** Select "VIEW SESSION" and press ENTER
**Expected:**
- Returns to current SLM screen (preserves page and mode)
- Console log shows correct screen ID

**Pass/Fail:** [x ]

---

## 7. Visual Layout Tests

### 7.1 Status Bar Layout
**Test:** Verify status bar on all SLM screens
**Expected:**
- Battery icon on left
- Play/pause icon in center-left
- Timer on right
- All elements properly spaced
- Status bar spans full width

**Pass/Fail:** [x ]

### 7.2 Bar Graph Layout
**Test:** Verify bar graph on numeric mode screens
**Expected:**
- Bar graph positioned below status bar
- "-20" label above left end
- "70" label above right end
- Bar fill level updates with SPL value
- Graph container has proper styling (background, border)

**Pass/Fail:** [x ]

### 7.3 Main Readout Layout
**Test:** Verify main readout on all numeric mode screens
**Expected:**
- Large numeric value (3.5em font)
- Units displayed to right (1.2em font)
- Centered alignment
- Proper spacing between value and units

**Pass/Fail:** [x ]

### 7.4 Graph Placeholder Layout
**Test:** Verify graph placeholder on 1/1 and 1/3 graph screens
**Expected:**
- Placeholder text visible and readable
- Properly positioned in main content area
- Status bar still visible at top

**Pass/Fail:** [x ]

### 7.5 Softkey Label Layout
**Test:** Verify softkey labels at bottom
**Expected:**
- All 4 softkey labels visible
- Proper spacing between labels
- Underlines visible when active (SOFT2, SOFT3)
- Labels update correctly when cycling

**Pass/Fail:** [x ]

---

## 8. State Management Tests

### 8.1 FSM State Structure
**Test:** In browser console, run: `window.getMainFSMState().slm`
**Expected:**
- Returns object with:
  - `currentPage`: 1-4
  - `mode`: 'numeric', '1of1', or '1of3'
  - `timeConstant`: 'F', 'S', or 'I'
  - `weighting`: 'R', 'C', 'Z', or 'F'
  - `activeMeter`: 1 or 2
  - `units`: string (e.g., 'LZS')

**Pass/Fail:** [x ]

### 8.2 State Persistence
**Test:** 
1. Set page to 3, mode to 1/1, timeConstant to 'I', weighting to 'Z', activeMeter to 2
2. Navigate to different page
3. Check state: `window.getMainFSMState().slm`
**Expected:**
- All state values persist correctly
- No state loss during navigation

**Pass/Fail:** [x ]

### 8.3 State Initialization
**Test:** Fresh page load, navigate to SLM
**Expected:**
- Default state:
  - `currentPage`: 1
  - `mode`: 'numeric' (based on slmLabelIndex)
  - `timeConstant`: 'S'
  - `weighting`: 'R'
  - `activeMeter`: 1
  - `units`: 'LZS'

**Pass/Fail:** [x ]

---

## 9. Edge Cases and Error Handling

### 9.1 Rapid Page Navigation
**Test:** Rapidly press UP/DOWN arrows multiple times
**Expected:**
- Page transitions smoothly
- No screen flickering or errors
- Console logs all transitions
- Final page state is correct

**Pass/Fail:** [ x]

### 9.2 Rapid Softkey Pressing
**Test:** Rapidly press SOFT2, SOFT3, SOFT4 multiple times
**Expected:**
- Softkey states update correctly
- Underlines move correctly
- No visual glitches
- Final state is correct

**Pass/Fail:** [x ]

### 9.3 Mode Switch During Measurement
**Test:** 
1. Start measurement in numeric mode
2. ESC to home
3. Change SOFT1 to "1/1"
4. Enter SLM again
**Expected:**
- Enters 1/1 graph mode
- Measurement state preserved (running/paused)
- Page number preserved

**Pass/Fail:** [x ]

### 9.4 Page Navigation During Pause
**Test:**
1. Start measurement, then pause
2. Navigate to different pages
**Expected:**
- Page navigation works while paused
- Screen transitions correctly
- Measurement remains paused

**Pass/Fail:** [x ]

---

## 10. Console Logging Tests

### 10.1 Page Navigation Logging
**Test:** Navigate between pages and check console
**Expected:**
- Console shows: `[SLM] UP: Page X, Mode: Y` or `[SLM] DOWN: Page X, Mode: Y`
- Logs appear for each page transition

**Pass/Fail:** [x ]

### 10.2 Softkey Logging
**Test:** Press SOFT2, SOFT3, SOFT4 and check console
**Expected:**
- Console shows: `[SLM] SOFT2: Time constant = X`
- Console shows: `[SLM] SOFT3: Weighting = X`
- Console shows: `[SLM] SOFT4: Active meter = X`
- Logs appear for each softkey press

**Pass/Fail:** [x ]

### 10.3 Screen Transition Logging
**Test:** Navigate between different SLM screens and check console
**Expected:**
- Console shows screen ID changes
- No error messages
- State updates logged correctly

**Pass/Fail:** [x ]

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
**Version Tested:** Phase 4  
**Ready for Next Phase:** [Yes/No]

