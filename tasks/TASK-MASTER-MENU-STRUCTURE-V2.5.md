# Master Task Document: Quest SoundPro SE-DL Menu Structure Implementation
## Based on Menu-Structure-v2.5.md and FSM-spec-v1.md

> **Document Version:** 1.0  
> **Reference:** Menu-Structure-v2.5.md (Firmware R.13J)  
> **FSM Specification:** FSM-spec-v1.md  
> **Last Updated:** [Current Date]

---

## Overview

This document breaks down all implementation tasks required to complete the Quest SoundPro SE-DL simulator based on the comprehensive Menu-Structure-v2.5.md specification. Tasks are organized by functional area and implementation phase.

**Current Status:**
- ✅ Phase 1: Startup & Home (Complete)
- ✅ Phase 2: Basic Navigation & SLM Core (Complete)
- ✅ Phase 3: Setup Menu - Batch 1 (AUTO RUN, DATETIME, DIGITAL OUT - Complete)
- ✅ Phase 3: Setup Menu - Batch 2 (OPTIONS, SIG INPUT, LOGGING, COMM-SET, BATTERY - Complete)
- ⏸️ Phase 3: Setup Menu - Batch 3 (Advanced Features - Pending)
- ⏸️ Phase 4: SLM Multi-Page Views & Advanced Features (Pending)
- ✅ Phase 5: Files Menu Enhancements (Complete)
- ✅ Phase 6: Lock & Calibration Enhancements (Complete)
- ⏸️ Phase 7: Alerts & Edge Cases (Pending)

---

## Phase 1: Startup & Home ✅ COMPLETE

### 1.1 Boot Screen (`boot_screen`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 4.1

**Implementation:**
- ✅ Screen definition in `data/screen-atlas.json`
- ✅ Power button handler transitions to `home_screen_dim`
- ✅ Auto-transition after boot duration

### 1.2 Home Screen (`home_screen_dim`, `home_screen`, `home_screen_running`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 4.2

**Implementation:**
- ✅ Screen definitions with menu items
- ✅ UP/DOWN navigation through 5 menu items
- ✅ ENTER routing to submenus
- ✅ Timer display (visible when View Current Study/View Session highlighted)
- ✅ Backlight toggle
- ✅ Softkey handlers (SLM, CAL, FILE, LOCK)
- ✅ Run/Pause functionality

### 1.3 Unit Info (`unit_info`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 4.3

**Implementation:**
- ✅ Screen definition
- ✅ ESC/ENTER returns to Home

---

## Phase 2: SLM Core Operation ✅ COMPLETE

### 2.1 SLM Home Numeric View (`slm_home`, `slm_home_paused`, `slm_home_stopped`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 5.3

**Implementation:**
- ✅ Screen definitions for running/paused/stopped states
- ✅ Run/Pause toggle
- ✅ Stop hold timer (3-second countdown)
- ✅ ESC returns to Home
- ✅ Softkey 1 (VIEW) opens `slm_view_menu`

**Remaining:**
- ⏸️ Multi-page navigation (pages 2-4) - Phase 4
- ⏸️ Softkey 2-4 handlers (F/S/I, R/C/Z/F, Meter 1/2) - Phase 4

### 2.2 SLM View Menu (`slm_view_menu`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 5.4

**Implementation:**
- ✅ Screen definition
- ✅ UP/DOWN navigation with dot indicator
- ✅ ENTER routing
- ✅ ESC returns to SLM screen

### 2.3 Stop Confirm (`stop_confirm`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 5.6

**Implementation:**
- ✅ Screen definition
- ✅ 3-second hold timer
- ✅ Cancel on ESC or Stop release
- ✅ Auto-transition to stopped state

---

## Phase 3: Setup Menu & Submenus

### 3.1 Setup Root Menu (`setup_menu`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 6.1

**Implementation:**
- ✅ Screen definition with 11 menu items
- ✅ UP/DOWN navigation
- ✅ ENTER routing to all submenus
- ✅ ESC returns to Home

### 3.2 Measure Menu (`measure_menu`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 6.2

**Implementation:**
- ✅ Screen definition with dynamic items (L1-L4, LDH, CHEL, Lc-a., TAKTMX)
- ✅ UP/DOWN navigation
- ✅ ENTER edit mode with value editing
- ✅ Special behaviors for LDH/CHEL/TAKTMX (toggle without edit mode)
- ✅ Lc-a. stays as N/A
- ✅ ESC returns to setup_menu

### 3.3 Meter Set (`meter_set_menu`, `meter_set_edit`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 6.3

**Implementation:**
- ✅ Screen definitions
- ✅ UP/DOWN navigation
- ✅ ENTER enters edit mode
- ✅ UP/DOWN adjust values in edit mode
- ✅ LEFT exits edit mode (focus back to title)
- ✅ RIGHT moves focus to value
- ✅ Threshold: ENTER cycles dB ↔ OFF
- ✅ ESC cancels edit and returns to setup_menu

**Remaining:**
- ⏸️ Softkey 2-4 handlers (F/S/I, R/C/Z/F, Meter 1/2) - Future phase

### 3.4 Auto-Run Menu (`auto_run_menu`) ✅ COMPLETE - Batch 1
**Status:** ✅ Complete (Basic navigation)  
**Reference:** Menu-Structure-v2.5.md Section 6.4

**Current Implementation:**
- ✅ Screen definition with AUTO-RUN and VIEW/SET PARAMETERS
- ✅ UP/DOWN navigation
- ✅ ENTER on AUTO-RUN toggles Disabled ↔ Enabled
- ✅ ESC returns to setup_menu

**Remaining - Future Phases:**
- ⏸️ Auto-Run mode cycling (Disabled → Timed Run → DOW → Date → Level-Triggered)
- ⏸️ Timed Run parameters (`auto_run_timed_run_params`) - Section 6.4.2
- ⏸️ DOW parameters (`auto_run_dow_params`) - Section 6.4.3
- ⏸️ Date parameters (`auto_run_date_params`) - Section 6.4.4
- ⏸️ Level-Triggered parameters (`auto_run_level_triggered_params`) - Section 6.4.5

### 3.5 Time/Date (`datetime_menu`, `datetime_edit`) ✅ COMPLETE - Batch 1
**Status:** ✅ Complete (Basic navigation)  
**Reference:** Menu-Structure-v2.5.md Section 6.5

**Current Implementation:**
- ✅ Screen definitions
- ✅ UP/DOWN navigation in datetime_menu
- ✅ ENTER routes to datetime_edit
- ✅ ESC returns to datetime_menu or setup_menu

**Remaining:**
- ⏸️ Date/Time editing functionality (Year/Month/Day/Time fields)
- ⏸️ LEFT/RIGHT cursor movement between sub-fields
- ⏸️ UP/DOWN adjust subfield values
- ⏸️ ENTER confirm and exit edit

### 3.6 Digital Out (`digital_out_menu`) ✅ COMPLETE - Batch 1
**Status:** ✅ Complete (Basic navigation)  
**Reference:** Menu-Structure-v2.5.md Section 6.6

**Current Implementation:**
- ✅ Screen definition with menu items
- ✅ UP/DOWN navigation
- ✅ ENTER handler (stub)
- ✅ ESC returns to setup_menu

**Remaining:**
- ⏸️ TRIGGER: SPL ↔ AVG cycling
- ⏸️ OUTPUT 1: OFF → RUN/PSE → CURVES → OFF cycling
- ⏸️ OUTPUT 2-3: OFF ↔ dB toggle
- ⏸️ LOGIC 1-3: HI/LO edit mode with LEFT/RIGHT navigation

### 3.7 Options (`options_menu`)
**Status:** ✅ Complete (Batch 2)  
**Reference:** Menu-Structure-v2.5.md Section 6.7

**Implementation:**
- ✅ Screen definition with `\DATA FILE` title, `OPTIONS NOT LOADED`, `FILE NOT FOUND` labels
- ✅ ESC returns to setup_menu
- ✅ No editable fields or highlight bar

### 3.8 Signal Input (`sig_input_menu`)
**Status:** ✅ Complete (Batch 2)  
**Reference:** Menu-Structure-v2.5.md Section 6.8

**Implementation:**
- ✅ Screen definition with Sensitivity, Range Cap, Polarization fields
- ✅ UP/DOWN navigation between fields
- ✅ ENTER enters edit mode, focuses on value
- ✅ UP/DOWN adjust values in edit mode (one decimal place precision)
- ✅ LEFT exits edit mode, RIGHT enters edit mode or switches focus
- ✅ ESC exits edit and returns to setup_menu
- ✅ POLARIZATION: ENTER cycles 0V ↔ 200V (no edit mode)
- ✅ RANGE CAP: min 140, max 180
- ✅ No softkeys on this screen

### 3.9 Logging (`logging_menu`)
**Status:** ✅ Complete (Batch 2)  
**Reference:** Menu-Structure-v2.5.md Section 6.9

**Implementation:**
- ✅ Screen definition with AVG, PEAK, MAX, MIN, L1, L2, FILTERS, INTERVAL
- ✅ Two-column layout: AVG-MIN (left), L1-FILTERS (right), INTERVAL (bottom span)
- ✅ Custom navigation order: AVG → PEAK → MAX → MIN → INTERVAL → L1 → L2 → FILTERS
- ✅ ENTER toggles ON/OFF for AVG/PEAK/MAX/MIN/FILTERS
- ✅ ENTER enters edit mode for L1/L2/INTERVAL
- ✅ L1/L2: ENTER on title enters edit mode, ENTER on value toggles L value ↔ OFF
- ✅ INTERVAL: ENTER cycles through preset values (1 sec, 5 sec, 10 sec, etc.)
- ✅ UP/DOWN adjust numeric values in edit mode (L1/L2: L01-L99, no wrapping)
- ✅ Softkey 4: Meter 1/2 toggle (Meter 2 shows only AVG, PEAK, MAX, MIN)
- ✅ ESC exits edit and returns to setup_menu
- ✅ Default values: AVG=ON, PEAK=OFF, MAX=ON, MIN=ON, L1=L83, L2=L87

### 3.10 Comm Set (`comms_menu`)
**Status:** ✅ Complete (Batch 2)  
**Reference:** Menu-Structure-v2.5.md Section 6.10

**Implementation:**
- ✅ Screen definition showing `setup\COMM-SET` title
- ✅ UP/DOWN navigation between USB, RS-232, BAUD RATE
- ✅ ENTER cycles values in place (no edit screen navigation)
- ✅ USB: ENTER cycles Mass Storage → WINUSB → QSp/Serial
- ✅ RS-232: ENTER cycles Serial → LOG PRN → GPS → OFF/Lo-Pwr
- ✅ BAUD RATE: ENTER cycles 4600 → 9600 → 19200 → 115299
- ✅ "NO FIX" line appears below BAUD RATE when RS-232 = GPS
- ✅ ESC returns to setup_menu
- ✅ No softkeys on this screen

### 3.11 Battery (`battery_menu`)
**Status:** ✅ Complete (Batch 2)  
**Reference:** Menu-Structure-v2.5.md Section 6.11

**Implementation:**
- ✅ Screen definition with `setup\BATTERY` title and "B1 B2 B3 B4" label
- ✅ Softkey 1 (ALK) selects Alkaline
- ✅ Softkey 2 (NiMH) selects NiMH (updated from softkey 4)
- ✅ ESC returns to setup_menu

### 3.12 Display (`display_menu` + subs) ✅ COMPLETE
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 6.12

**Implementation:**
- ✅ Screen definitions for display_menu, display_language, display_backlight, display_contrast
- ✅ UP/DOWN navigation
- ✅ ENTER routes to subscreens
- ✅ Language selection with diamond indicator
- ✅ Backlight mode editing (MANUAL ↔ time values)
- ✅ Contrast bar graph editing with LEFT/RIGHT
- ✅ ESC navigation returns correctly

---

## Phase 4: SLM Multi-Page Views & Advanced Features ⏸️ PENDING

### 4.1 SLM Multi-Page Navigation
**Status:** ⏸️ Pending  
**Reference:** Menu-Structure-v2.5.md Section 5.3

**Required Implementation:**
- [ ] Page 2-4 screen definitions (running/paused states)
- [ ] UP/DOWN cycles pages 1-4
- [ ] Page-specific content rendering
- [ ] State management for current page

**Screens Needed:**
- `slm_home_page2_running`, `slm_home_page2_paused`
- `slm_home_page3_running`, `slm_home_page3_paused`
- `slm_home_page4_running`, `slm_home_page4_paused`

### 4.2 SLM 1/1 Octave Graph Views
**Status:** ⏸️ Pending  
**Reference:** Menu-Structure-v2.5.md Section 5.5

**Required Implementation:**
- [ ] Screen definitions for 1/1 graph pages 1-4 (running/paused)
- [ ] Graph rendering (deferred to measurement engine phase)
- [ ] Page navigation (UP/DOWN)
- [ ] Mode switching via softkey

**Screens Needed:**
- `slm_graph_1of1_page1_running`, `slm_graph_1of1_page1_paused`
- `slm_graph_1of1_page2_running`, `slm_graph_1of1_page2_paused`
- `slm_graph_1of1_page3_running`, `slm_graph_1of1_page3_paused`
- `slm_graph_1of1_page4_running`, `slm_graph_1of1_page4_paused`

### 4.3 SLM 1/3 Octave Graph Views
**Status:** ⏸️ Pending  
**Reference:** Menu-Structure-v2.5.md Section 5.5

**Required Implementation:**
- [ ] Screen definitions for 1/3 graph pages 1-4 (running/paused)
- [ ] Graph rendering (deferred to measurement engine phase)
- [ ] Page navigation (UP/DOWN)
- [ ] Mode switching via softkey

**Screens Needed:**
- `slm_graph_1of3_page1_running`, `slm_graph_1of3_page1_paused`
- `slm_graph_1of3_page2_running`, `slm_graph_1of3_page2_paused`
- `slm_graph_1of3_page3_running`, `slm_graph_1of3_page3_paused`
- `slm_graph_1of3_page4_running`, `slm_graph_1of3_page4_paused`

### 4.4 SLM Softkey Handlers
**Status:** ⏸️ Pending  
**Reference:** Menu-Structure-v2.5.md Section 5.3

**Required Implementation:**
- [ ] Softkey 2: F/S/I cycling with underline movement
- [ ] Softkey 3: R/C/Z/F cycling with underline movement
- [ ] Softkey 4: Meter 1/2 toggle
- [ ] Visual feedback for active selections

---

## Phase 5: Files Menu ✅ COMPLETE

### 5.1 Files Root Menu (`files_menu`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.1

**Implementation:**
- ✅ Screen definition
- ✅ UP/DOWN navigation
- ✅ ENTER routing to submenus
- ✅ ESC returns to Home

### 5.2 Session Directory (`files_session_dir`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.2

**Implementation:**
- ✅ Screen definition
- ✅ UP/DOWN scrolling
- ✅ File list rendering
- ✅ ESC returns to files_menu

### 5.3 Config Directory (`files_config_dir`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.3

**Implementation:**
- ✅ Screen definition
- ✅ UP/DOWN scrolling
- ✅ File list rendering
- ✅ ESC returns to files_menu

### 5.4 Rename Last Session (`files_rename_last`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.4

**Implementation:**
- ✅ Screen definition
- ✅ Text input functionality
- ✅ ENTER saves and shows toast
- ✅ ESC cancels

### 5.5 Save Config File (`files_save_config`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.5

**Implementation:**
- ✅ Screen definition
- ✅ Text input functionality
- ✅ ENTER saves and shows toast
- ✅ ESC cancels

### 5.6 Format Card (`files_format_card`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.6

**Implementation:**
- ✅ Screen definition
- ✅ ENTER starts formatting (2-3 second timer)
- ✅ Auto-returns to files_menu after completion
- ✅ ESC cancels if still on menu

### 5.7 Delete Confirm (`files_delete_confirm`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 7.7

**Implementation:**
- ✅ Screen definition
- ✅ LEFT/RIGHT or UP/DOWN navigation between YES/NO
- ✅ ENTER confirms (shows toast)
- ✅ ESC cancels

---

## Phase 6: Lock & Calibration ✅ COMPLETE

### 6.1 Lock Menu (`lock_menu`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 8

**Implementation:**
- ✅ Screen definition
- ✅ ESC unlocks and returns to Home
- ✅ All other inputs disabled when locked

### 6.2 Calibration Menu (`cal_menu`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 9.1

**Implementation:**
- ✅ Screen definition
- ✅ CALIBRATE option with highlight box
- ✅ Last calibration entry display (Pre-Cal value and timestamp)
- ✅ Two-line format: "PRE-CAL. [value]db" and "[time]. [date]"
- ✅ ENTER starts calibration sequence
- ✅ ESC returns to Home
- ✅ localStorage persistence for last calibration

### 6.3 Calibration Running (`cal_running`)
**Status:** ✅ Complete  
**Reference:** Menu-Structure-v2.5.md Section 9.2

**Implementation:**
- ✅ Screen definition
- ✅ PRE-CAL title and live SPL display
- ✅ ENTER manually completes calibration and returns to cal_menu
- ✅ ESC cancels calibration and returns to cal_menu
- ✅ Timer-based auto-completion (4-6 seconds) returns to cal_menu
- ✅ Calibration completion updates lastCalibration with localStorage persistence

---

## Phase 7: Alerts & Edge Cases ⏸️ DEFERRED

### 7.1 Alert Screens
**Status:** ⏸️ Deferred  
**Reference:** Menu-Structure-v2.5.md Section 10

**Screens:**
- `low_battery` - Low battery warning
- `sd_missing` - SD card missing warning
- `memory_full` - Memory full warning
- `invalid_action` - Invalid action warning

**Required Implementation:**
- [ ] Screen definitions
- [ ] ESC dismisses alert
- [ ] Auto-dismiss logic (if applicable)

---

## Implementation Priority & Batching

### Batch 1: Setup Menu Basic Navigation ✅ COMPLETE
- ✅ AUTO RUN (basic)
- ✅ DATETIME (basic)
- ✅ DIGITAL OUT (basic)

### Batch 2: Setup Menu Remaining Basic Menus ✅ COMPLETE
- ✅ OPTIONS
- ✅ SIG INPUT
- ✅ LOGGING
- ✅ COMM-SET
- ✅ BATTERY

### Batch 3: Setup Menu Advanced Features ⏸️ FUTURE
- [ ] AUTO RUN parameter screens (Timed Run, DOW, Date, Level-Triggered)
- [ ] DATETIME full editing functionality
- [ ] DIGITAL OUT full editing functionality
- [ ] LOGGING full editing functionality
- [ ] COMMS full editing functionality

### Batch 4: SLM Multi-Page & Graph Views ⏸️ FUTURE
- [ ] SLM pages 2-4 (numeric)
- [ ] SLM 1/1 octave graph views
- [ ] SLM 1/3 octave graph views
- [ ] SLM softkey handlers (F/S/I, R/C/Z/F, Meter 1/2)

### Batch 5: Files Menu Enhancements ⏸️ FUTURE
- [ ] File list rendering
- [ ] Rename functionality
- [ ] Delete confirm navigation

### Batch 6: Alerts & Polish ⏸️ FUTURE
- [ ] Alert screens
- [ ] Edge case handling
- [ ] Final testing and polish

---

## Files Reference

### Core Implementation Files
- `data/screen-atlas.json` - All screen definitions
- `js/fsm/mainFSM.js` - State machine and navigation handlers
- `js/screen-renderer.js` - Screen rendering logic
- `css/styles.css` - Styling and layout

### Reference Documentation
- `tasks/Menu-Structure-v2.5.md` - Complete screen behavior specification
- `tasks/FSM-spec-v1.md` - State machine specification
- `PRD.md` - Project requirements

---

## Testing Strategy

### Per-Batch Testing
Each batch should have a dedicated testing guide:
- `tasks/PHASE-3-BATCH-1-TESTING-GUIDE.md` ✅ Complete
- `tasks/PHASE-3-BATCH-2-TESTING-GUIDE.md` ✅ Complete
- `tasks/PHASE-3-BATCH-3-TESTING-GUIDE.md` ⏸️ Pending
- etc.

### Test Coverage
- Navigation (UP/DOWN/ENTER/ESC)
- State transitions
- History stack management
- Edit mode functionality
- Visual rendering matches reference images
- Edge cases (wrap-around, empty states)

---

## Notes & Considerations

### Implementation Patterns
- Use `_pushHistory()` when entering submenus
- Use `_popHistory()` when exiting with ESC
- Initialize `selectedIndex` to 0 when entering menus
- Set `focus` to "title" and `editing` to false on menu entry
- Follow existing patterns from completed menus (measure_menu, display_menu, meter_set_menu)

### Screen Naming Convention
- Screen IDs match reference image filenames (without extension)
- Use lowercase with underscores (e.g., `auto_run_menu`)
- Edit screens use `_edit` suffix (e.g., `datetime_edit`)

### State Management
- Each menu area has its own state object (e.g., `autoRun`, `measure`, `meterSet`)
- State properties: `editing`, `focus`, `selectedIndex`, `items`
- State initialized in `initMainFSM()` and reset on navigation

---

## Revision History

| Date       | Version | Changes                                    |
|------------|---------|--------------------------------------------|
| [Date]     | 1.0     | Initial master task document creation      |

---

**Next Steps:**
1. ✅ Complete Batch 2: OPTIONS, SIG INPUT, LOGGING, COMM-SET, BATTERY menus
2. ✅ Create PHASE-3-BATCH-2-TESTING-GUIDE.md
3. ✅ Test Batch 2 implementation
4. **NEXT:** Proceed to Phase 4 (SLM Multi-Page Views & Advanced Features) OR Batch 3 (Setup Menu Advanced Features)

