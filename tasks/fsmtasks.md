# FSM-spec-v1 — Quest SoundPro SE-DL (Firmware R.13J)
## Finite State Machine for Interactive Simulator  
### Aligned with Menu-Structure-v2.5

This document defines the **finite state machine (FSM)** for a simulator of the Quest SoundPro SE-DL (firmware R.13J). It is designed to pair with:

- `Menu-Structure-v2.5.md`  
- A single reducer (`mainFSM`)  
- A 1920×1080 Storyline WebObject  
- The full device photo atlas  

---

# 1. CORE ARCHITECTURE

## 1.1 State Shape

```ts
type SimState = {
  id: StateId;       // logical state, e.g., 'HOME', 'SLM_HOME', 'SETUP_AUTO_RUN'
  viewId: ViewId;    // which LCD image to show
  ctx: SimContext;   // live persistent state
};
```

`viewId` always maps directly to an actual LCD photo used by the renderer.

---

## 1.2 Context Model (SimContext)

```ts
type SimContext = {
  backlightOn: boolean;
  locked: boolean;

  // Home menu highlight
  homeHighlightIndex: 1 | 2 | 3 | 4 | 5;

  // Session & timer
  sessionActive: boolean;
  sessionPaused: boolean;
  sessionTimerSeconds: number;

  // SLM cluster
  slmMode: 'NUMERIC' | 'OCT_1OF1' | 'OCT_1OF3';
  slmPage: 1 | 2 | 3 | 4;
  slmRunState: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  slmMeter: 1 | 2;
  slmFSI: 'F' | 'S' | 'I';
  slmRCZF: 'R' | 'C' | 'Z' | 'F';

  // Setup root
  setupHighlightIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  // Meter Set
  meterSetHighlightIndex: 1 | 2 | 3 | 4 | 5;
  meterSetInEdit: boolean;
  meterSetThresholdOff: boolean;

  // Auto-Run
  autoRunMode: 'DISABLED' | 'TIMED_RUN' | 'DOW' | 'DATE' | 'LEVEL_TRIGGERED';
  autoRunHighlightIndex: 1 | 2;
  autoRunParamActive: 'TIMED_RUN' | 'DOW' | 'DATE' | 'LEVEL_TRIGGERED' | null;

  // Date/Time
  datetimeHighlightIndex: 1 | 2 | 3 | 4;
  datetimeEditField: 'NONE' | 'YEAR' | 'MONTH' | 'DAY' | 'HOUR' | 'MIN' | 'SEC';

  // Digital Out
  digitalOutHighlightIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;

  // Signal Input
  sigInputHighlightIndex: 1 | 2 | 3;
  sigInputInEdit: boolean;

  // Logging
  loggingHighlightIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  loggingInEdit: boolean;
  loggingMeter: 1 | 2;

  // Comms
  commsHighlightIndex: 1 | 2 | 3;
  commsInEdit: boolean;

  // Battery
  batteryType: 'ALK' | 'NIMH';

  // Display
  displayHighlightIndex: 1 | 2 | 3;

  // Files
  filesHighlightIndex: 1 | 2 | 3 | 4 | 5;
};
```

---

## 1.3 Event Model

```ts
type Event =
  | { type: 'POWER_ON' }
  | { type: 'POWER_ESC' }
  | { type: 'BACKLIGHT_TOGGLE' }
  | { type: 'BTN_UP' }
  | { type: 'BTN_DOWN' }
  | { type: 'BTN_LEFT' }
  | { type: 'BTN_RIGHT' }
  | { type: 'BTN_ENTER' }
  | { type: 'BTN_RUN_PAUSE' }
  | { type: 'BTN_STOP_PRESS' }
  | { type: 'BTN_STOP_HOLD_3S' }
  | { type: 'SOFTKEY_1' }
  | { type: 'SOFTKEY_2' }
  | { type: 'SOFTKEY_3' }
  | { type: 'SOFTKEY_4' }
  | { type: 'ALT_F' }
  | { type: 'TIMER_TICK' };
```

---

# 2. VIEW SELECTION HELPERS

## 2.1 Home Views

```ts
function selectHomeView(ctx: SimContext): ViewId {
  if (!ctx.backlightOn) return 'home_screen_dim';
  if (ctx.sessionActive && !ctx.sessionPaused) return 'home_screen_running';
  return 'home_screen';
}
```

---

## 2.2 SLM Views (numeric + graph modes)

```ts
function selectSlmView(ctx: SimContext): ViewId {
  const running = ctx.slmRunState === 'RUNNING';
  const suffix = running ? 'running' : 'paused';

  if (ctx.slmMode === 'NUMERIC') {
    if (ctx.slmPage === 1) return running ? 'slm_home' : 'slm_home_paused';
    if (ctx.slmPage === 2) return `slm_home_page2_${suffix}`;
    if (ctx.slmPage === 3) return `slm_home_page3_${suffix}`;
    if (ctx.slmPage === 4) return `slm_home_page4_${suffix}`;
  }

  if (ctx.slmMode === 'OCT_1OF1') {
    if (ctx.slmPage === 1) return running ? 'slm_graph_1of1_page1_running' : 'slm_graph_1of1_page1_paused';
    if (ctx.slmPage === 2) return `slm_graph_1of1_page2_${suffix}`;
    if (ctx.slmPage === 3) return `slm_graph_1of1_page3_${suffix}`;
    if (ctx.slmPage === 4) return `slm_graph_1of1_page4_${suffix}`;
  }

  if (ctx.slmMode === 'OCT_1OF3') {
    if (ctx.slmPage === 1) return running ? 'slm_graph_1of3_page1_running' : 'slm_graph_1of3_page1_paused';
    if (ctx.slmPage === 2) return `slm_graph_1of3_page2_${suffix}`;
    if (ctx.slmPage === 3) return `slm_graph_1of3_page3_${suffix}`;
    if (ctx.slmPage === 4) return `slm_graph_1of3_page4_${suffix}`;
  }

  return running ? 'slm_home' : 'slm_home_paused';
}
```

---

# 3. STATE CATALOGUE — CORE + SLM

## 3.1 BOOT

**ID:** `BOOT`  
**viewId:** `boot_screen`  

### On Entry:
- backlightOff  
- locked = false  
- homeHighlightIndex = 2  
- slmMode = NUMERIC  
- slmPage = 1  
- slmRunState = IDLE  
- sessionActive = false  
- sessionPaused = false  
- sessionTimerSeconds = 0  
- All setup/menu indices reset  

### Events:

| Event | Behavior |
|-------|----------|
| `POWER_ON` | no-op |
| synthetic timeout (`BOOT_DONE`) | transition → HOME |

HOME view starts dimmed.

---

## 3.2 HOME

**ID:** `HOME`  
**viewId:** via `selectHomeView(ctx)`  

### Visual Elements:
- Battery icon  
- Stop/Play/Pause icon  
- Running timer  
- List with highlight bar  
- Softkeys: SLM / CAL / FILE / LOCK  

### Menu Items:
1. View Past Studies  
2. View Current Study  
3. View Session  
4. Setup  
5. Unit Info  

### Events:

| Event | Behavior |
|--------|----------|
| BACKLIGHT_TOGGLE | toggles backlight |
| BTN_UP | move highlight up (wrap) |
| BTN_DOWN | move highlight down (wrap) |
| SOFTKEY_1 | cycle slmMode (NUMERIC → 1/1 → 1/3) |
| SOFTKEY_2 | go to CAL_MENU |
| SOFTKEY_3 | go to FILES_MENU |
| SOFTKEY_4 | go to LOCK_MENU + set locked=true |
| BTN_RUN_PAUSE | start/pause session |
| BTN_STOP_HOLD_3S | only meaningful in SLM states |
| TIMER_TICK | increment timer if running |

---

### ENTER behavior:

- **1: View Past Studies**  
  → FILES_MENU, highlight Session Directory  

- **2: View Current Study**  
  → SLM_HOME  
  If session not active, begin session (RUNNING).  

- **3: View Session**  
  → SLM_HOME (same as above)  

- **4: Setup**  
  → SETUP_ROOT  

- **5: Unit Info**  
  → UNIT_INFO  

---

## 3.3 UNIT_INFO

**ID:** `UNIT_INFO`  
**viewId:** `unit_info`

### Events:

| Event | Behavior |
|--------|----------|
| ENTER | return to HOME |
| POWER_ESC | return HOME |
| others | no-op |

---

## 3.4 SLM_HOME

**ID:** `SLM_HOME`  
**viewId:** chosen by `selectSlmView(ctx)`  

### Softkeys:
- Softkey 1 → View Menu (👓)  
- Softkey 2 → F/S/I cycle  
- Softkey 3 → R/C/Z/F cycle  
- Softkey 4 → Meter 1/2 toggle  

### Navigation:

Up/Down → change slmPage (1–4)  
Left/Right → change measurement unit/view (real device cycles shown on-screen)  

### Run/Pause:

- BTN_RUN_PAUSE toggles RUNNING ↔ PAUSED  
- Stop only works via long-hold from PAUSED  
- BTN_STOP_HOLD_3S → STOP_CONFIRM  

### TIMER_TICK:

Increment if RUNNING.

---

## 3.5 SLM_VIEW_MENU

**ID:** `SLM_VIEW_MENU`  
**viewId:** `slm_view_menu`

Up/Down moves dot.  
ENTER applies selection and returns to SLM_HOME.  
ESC returns without changes.

---

## 3.6 STOP_CONFIRM

**ID:** `STOP_CONFIRM`  
**viewId:** `stop_confirm`

Stop button is held for ~3 seconds.

### Events:

| Event | Behavior |
|--------|----------|
| BTN_STOP_HOLD_3S | finalize stop + sessionActive=false + slmRunState=STOPPED |
| BTN_STOP_PRESS | cancel (return to PAUSED) |
| BTN_RUN_PAUSE | cancel (return PAUSED) |
| POWER_ESC | cancel |

---

# 4. SETUP CLUSTER (FULL)

The Setup cluster contains 11 top-level menu categories, each with its own navigation, edit rules, and screen transitions.

Each Setup state entered through:

HOME → highlight "Setup" → ENTER  
→ `SETUP_ROOT`

---

# 4.1 SETUP_ROOT

**ID:** `SETUP_ROOT`  
**viewId:** `setup_menu`

### Menu Items (always 11 items in this order):
1. Measure  
2. Meter Set  
3. Auto-Run  
4. Time-Date  
5. Digital Out  
6. Options  
7. Sig Input  
8. Logging  
9. Comm Set  
10. Battery  
11. Display  

### Navigation:
- **BTN_UP / BTN_DOWN**: move highlight 1–11 (wrap)
- **BTN_ENTER**: open selected Setup sub-menu
- **POWER_ESC**: return to HOME

### ENTER mapping:
1 → SETUP_MEASURE  
2 → SETUP_METER_SET  
3 → SETUP_AUTO_RUN  
4 → SETUP_DATETIME  
5 → SETUP_DIGITAL_OUT  
6 → SETUP_OPTIONS  
7 → SETUP_SIG_INPUT  
8 → SETUP_LOGGING  
9 → SETUP_COMMS  
10 → SETUP_BATTERY  
11 → SETUP_DISPLAY  

---

# 4.2 SETUP_MEASURE

**ID:** `SETUP_MEASURE`  
**viewId:** `measure_menu`  
(Real device shows a static screen; no editable parameters visible.)

### Events:
| Event | Behavior |
|-------|----------|
| BTN_UP/DOWN | optional highlight movement (future expansion) |
| BTN_ENTER | no-op |
| POWER_ESC | back to SETUP_ROOT |

---

# 4.3 SETUP_METER_SET

**ID:** `SETUP_METER_SET`  
**viewIds:**  
- `meter_set_menu`  
- `meter_set_edit` (when editing)

### Menu Items:
1. Threshold  
2. Exchange Rate  
3. Criterion Level  
4. Upper Limit  
5. Projected Time  

### Import Device Rules (verified):
- Threshold enters an OFF ↔ dB toggle when pressing ENTER.  
- Enter does NOT exit edit mode — only ESC exits.  
- Left arrow always exits edit mode to the label (for ALL parameters).  
- Right arrow does nothing on meter set edit fields.  
- Up/Down adjust numeric values when editing.  
- Softkeys 2, 3, 4 behave like SLM screen:
  - Softkey 2 → cycles underline F → S → I  
  - Softkey 3 → cycles underline R → C → Z → F → R…  
  - Softkey 4 → toggles meter 1/2  

### Navigation:
- **BTN_UP / BTN_DOWN**: move highlight among the 5 parameters.
- **BTN_ENTER**:
  - If NOT in edit mode → enter edit mode.
  - If parameter = Threshold → cycle OFF ↔ numeric dB.
  - If in edit mode → cycle sub-fields if applicable (none for this menu except threshold OFF/dB).
- **BTN_LEFT**:
  - If in edit mode → exit edit mode (return to parameter label).
- **BTN_RIGHT**:
  - Does nothing in edit mode (per device behavior).
- **BTN_UP / BTN_DOWN in edit mode**:
  - Adjust numeric values (whole tenths, etc.)
- **POWER_ESC**:
  - If in edit → exit edit.
  - Else → return to SETUP_ROOT.

---

# 4.4 SETUP_AUTO_RUN

**ID:** `SETUP_AUTO_RUN`  
**viewId:** `auto_run_menu`

### Menu Items:
1. **AUTO-RUN**: `<Mode>` — cycles through modes  
2. **VIEW/SET PARAMETERS** — opens parameters for selected mode  

### AUTO-RUN modes cycle in this exact order:
1. Disabled  
2. Timed Run  
3. DOW  
4. Date  
5. Level-Triggered  
→ back to Disabled

### Navigation:
- BTN_UP → highlight line 1  
- BTN_DOWN → highlight line 2  
- BTN_ENTER:
  - On line 1 → cycle mode  
  - On line 2 → open correct parameter screen:
    - Timed Run → SETUP_AUTO_RUN_TIMED_RUN  
    - DOW → SETUP_AUTO_RUN_DOW  
    - Date → SETUP_AUTO_RUN_DATE  
    - Level-Triggered → SETUP_AUTO_RUN_LEVEL_TRIG  
    - Disabled → no-op  
- POWER_ESC → back to SETUP_ROOT

---

# 4.4a SETUP_AUTO_RUN_TIMED_RUN

**ID:** `SETUP_AUTO_RUN_TIMED_RUN`  
**viewId:** `auto_run_timed_run_params`

### Device Screen Details:
- A single time field: `D 00:00:00` style  
- No softkeys on this screen  
- Editing cycles fields H/M/S  

### Navigation:
- BTN_ENTER → enter edit mode OR cycle edit field  
- BTN_UP/DOWN → modify current number  
- BTN_LEFT/RIGHT → move between H / M / S  
- POWER_ESC → return to SETUP_AUTO_RUN  

---

# 4.4b SETUP_AUTO_RUN_DOW

**ID:** `SETUP_AUTO_RUN_DOW`  
**viewId:** `auto_run_dow_params`

### Device Rules:
- Days row: `S M T W T F S`  
  - Uppercase = selected day  
  - lowercase = alternate state  
  - dash “-” = no selection  
  - ENTER cycles through uppercase → lowercase → "-"  
- Parameters lines for Auto-Run #1 and #2  
- Softkey 1 = “-1” or “+1”  
- Softkey 2 = “-2” or “+2”  
  - "-" means not configured  
  - "+" means the time has been configured  

### Navigation:
- BTN_UP/DOWN → move between days row and parameter lines  
- BTN_LEFT/RIGHT → move across days  
- BTN_ENTER:
  - On days → cycle the selected day state  
  - On parameter line → enter editing of the time on that line  
- SOFTKEY_1 → select Auto-Run #1 line  
- SOFTKEY_2 → select Auto-Run #2 line  
- POWER_ESC → return to SETUP_AUTO_RUN  

---

# 4.4c SETUP_AUTO_RUN_DATE

**ID:** `SETUP_AUTO_RUN_DATE`  
**viewId:** `auto_run_date_params`

### Device Rules:
- Four Auto-Run lines (#1–#4)
- Softkeys:
  - softkey1 → -1 / +1  
  - softkey2 → -2 / +2  
  - softkey3 → -3 / +3  
  - softkey4 → -4 / +4  
- Each line stores a date & time  
- Highlight moves across lines  

### Navigation:
- BTN_UP/DOWN → highlight lines 1–4  
- BTN_ENTER → edit the line  
- SOFTKEY_1–4 → jump to corresponding line AND mark active  
- POWER_ESC → return to SETUP_AUTO_RUN  

---

# 4.4d SETUP_AUTO_RUN_LEVEL_TRIG

**ID:** `SETUP_AUTO_RUN_LEVEL_TRIG`  
**viewId:** `auto_run_level_triggered_params`

### Device Rules:
**Fields:**
- MODE:
  - Level On/Off  
  - Windowed  
  - ENTER cycles  
- ACTION:
  - Run/Stop  
  - Run/PSE  
  - ENTER cycles  
- TRIGGER (derived field):
  - LEVEL ON + RUN/STOP → `Run/Stop`  
  - LEVEL ON + RUN/PSE → `Run & Pause`  
  - WINDOWED + RUN/STOP → `Upper & Lower`  
  - WINDOWED + RUN/PSE → `Upper & Lower`  
- SOURCE (RUN side):
  - Meter1 → 12.5Hz → EXT → Delay → back to Meter1  
- SOURCE (STOP or PAUSE side):
  - Meter1 → 12.5Hz → EXT → Timed → back to Meter1  
- LEVEL:
  - OFF ↔ 90.0 (toggle with ENTER)  
  - Up/Down adjust if numeric  

### Navigation:
- BTN_UP/DOWN → move highlight  
- BTN_LEFT/RIGHT → move between LEFT/RIGHT source columns  
- BTN_ENTER:
  - on MODE → cycle values  
  - on ACTION → cycle  
  - on LEVEL → toggle OFF/90.0 OR enter edit  
  - on SOURCE → cycle source  
- POWER_ESC → return to SETUP_AUTO_RUN  

---

# 4.5 SETUP_DATETIME

**ID:** `SETUP_DATETIME`  
**viewIds:**  
- `datetime_menu`  
- `datetime_edit`

### Menu items:
1. Year  
2. Month  
3. Day  
4. Time  

### Navigation:
- BTN_UP/DOWN → move highlight  
- BTN_ENTER → enter edit mode  
- BTN_LEFT/RIGHT (in edit) → switch fields (H/M/S for time)  
- BTN_UP/DOWN (in edit) → adjust numbers  
- POWER_ESC:
  - in edit → exit edit  
  - not in edit → return to SETUP_ROOT  

---

# 4.6 SETUP_DIGITAL_OUT

**ID:** `SETUP_DIGITAL_OUT`  
**viewId:** `digital_out_menu`

### Lines:
1. TRIGGER  
2. OUTPUT 1  
3. OUTPUT 2  
4. OUTPUT 3  
5. LOGIC 1  
6. LOGIC 2  
7. LOGIC 3  

### Device Rules:
- OUTPUT 2/3:
  - ENTER cycles: OFF ↔ dB-level  
  - Up/Down adjust dB-level  
- LOGIC 1–3:
  - Three positions (HI/LO for each)  
  - ENTER enters edit; Up/Down toggle HI/LO  
  - Left/Right move across three fields  
- OUTPUT 1 is “AVG / SPL” type toggle  
- TRIGGER toggles SPL/AVG or similar

### Navigation:
- BTN_UP/DOWN → move highlight  
- BTN_ENTER:
  - Toggle OFF/DB or SPL/AVG  
  - Enter LOGIC mode  
- BTN_LEFT/RIGHT (in LOGIC edit) → move positions  
- BTN_UP/DOWN (in LOGIC edit) → HI/LO toggle  
- POWER_ESC →
  return edit OR return to SETUP_ROOT  

---

# 4.7 SETUP_OPTIONS

**ID:** `SETUP_OPTIONS`  
**viewId:** `options_menu`  
Menu is static as observed.

### Navigation:
- POWER_ESC → SETUP_ROOT  
- All others → no-op  

---

# 4.8 SETUP_SIG_INPUT

**ID:** `SETUP_SIG_INPUT`  
**viewId:** `sig_input_menu`

### Lines:
1. Sensitivity  
2. Range Cap  
3. Polarization  

### Navigation:
- BTN_UP/DOWN → change `sigInputHighlightIndex`  
- BTN_ENTER → enter edit  
- BTN_UP/DOWN (edit) → adjust  
- POWER_ESC:
  - in edit → exit edit  
  - not in edit → return SETUP_ROOT  

---

# 4.9 SETUP_LOGGING

**ID:** `SETUP_LOGGING`  
**viewId:** `logging_menu`

### Lines:
1. Average  
2. Peak  
3. Max  
4. Min  
5. Interval  
6. L1  
7. L2  
8. Filters  

### Device Rules:
- AVG / PEAK / MAX / MIN:
  - ENTER toggles ON/OFF  
- INTERVAL / L1 / L2:
  - ENTER enters edit  
  - Up/Down adjust numeric values  
  - L1 starts at "L01"  
  - L2 starts at "L80"  
- Softkey → toggles Meter 1/2

### Navigation:
- BTN_UP/DOWN → highlight  
- BTN_ENTER → toggle or edit  
- BTN_UP/DOWN (edit) → adjust values  
- SOFTKEY_1 → toggle meter  
- POWER_ESC → exit edit or return to SETUP_ROOT  

---

# 4.10 SETUP_COMMS

**ID:** `SETUP_COMMS`  
**viewIds:**  
- `comms_menu`  
- `comms_edit`

### Lines:
1. USB  
2. RS-232  
3. Baud Rate  

### Navigation:
- BTN_UP/DOWN → move highlight  
- BTN_ENTER → enter edit  
- BTN_UP/DOWN (edit) → cycle values  
- POWER_ESC → exit edit or return to SETUP_ROOT  

---

# 4.11 SETUP_BATTERY

**ID:** `SETUP_BATTERY`  
**viewId:** `battery_menu`

### Softkeys:
- Softkey 1 → ALK  
- Softkey 2 → NIMH  

### Navigation:
- SOFTKEY_1 → batteryType = ALK  
- SOFTKEY_2 → batteryType = NIMH  
- POWER_ESC → return SETUP_ROOT  

---

# 4.12 SETUP_DISPLAY

**ID:** `SETUP_DISPLAY`  
**root viewId:** `display_menu`  
**sub-viewIds:**  
- `display_language`  
- `display_blacklight`  
- `display_contrast`

### Display Menu Items:
1. Language  
2. Backlight  
3. Contrast  

### Navigation (root):
- BTN_UP/DOWN → `displayHighlightIndex`  
- BTN_ENTER → open sub-screen  
- POWER_ESC → return SETUP_ROOT  

### Language screen:
- BTN_UP/DOWN → choose language  
- BTN_ENTER → confirm & return to SETUP_DISPLAY  
- POWER_ESC → return  

### Backlight screen:
- BTN_UP/DOWN → cycle Manual / Auto / Off  
- BTN_ENTER or POWER_ESC → return  

### Contrast screen:
- BTN_LEFT/RIGHT → adjust contrast  
- BTN_ENTER or POWER_ESC → return  

---

# 5. FILES CLUSTER (FULL)

The Files cluster is accessed from the Home screen via the “File” softkey.

HOME → SOFTKEY_FILE → FILES_ROOT

---

# 5.1 FILES_ROOT

**ID:** `FILES_ROOT`  
**viewId:** `files_menu`

### Menu Items:
1. Session Directory  
2. Config Directory  
3. Rename Last Session  
4. Save Config File  
5. Format Card  

### Navigation:
- BTN_UP / BTN_DOWN → highlight 1–5  
- BTN_ENTER:
  - 1 → FILES_SESSION_DIR  
  - 2 → FILES_CONFIG_DIR  
  - 3 → FILES_RENAME_LAST  
  - 4 → FILES_SAVE_CONFIG  
  - 5 → FILES_FORMAT_CARD  
- POWER_ESC → HOME

---

# 5.2 FILES_SESSION_DIR

**ID:** `FILES_SESSION_DIR`  
**viewId:** `files_session_dir`

### Navigation:
- BTN_UP / BTN_DOWN → scroll list  
- BTN_ENTER → RESERVED (no delete/edit shown in firmware)  
- POWER_ESC → FILES_ROOT  

---

# 5.3 FILES_CONFIG_DIR

**ID:** `FILES_CONFIG_DIR`  
**viewId:** `files_config_dir`

### Navigation:
- BTN_UP / BTN_DOWN → scroll  
- BTN_ENTER → RESERVED  
- POWER_ESC → FILES_ROOT  

---

# 5.4 FILES_RENAME_LAST

**ID:** `FILES_RENAME_LAST`  
**viewId:** `files_rename_last`

### Device behavior:
- Screen shows last session filename.  
- Rename behavior not fully exposed in this firmware image.  
- ENTER generally confirms rename or cycles fields depending on model revision.

### Navigation:
- BTN_ENTER → confirm  
- POWER_ESC → FILES_ROOT  

---

# 5.5 FILES_SAVE_CONFIG

**ID:** `FILES_SAVE_CONFIG`  
**viewId:** `files_save_config`

### Behavior:
- One-press action: instantly saves config file.

### Navigation:
- BTN_ENTER → perform save → FILES_ROOT  
- POWER_ESC → FILES_ROOT  

---

# 5.6 FILES_FORMAT_CARD

**ID:** `FILES_FORMAT_CARD`  
**viewId:** `files_format_card`

### Critical Behavior:
- No confirmation screen in this firmware.  
- ENTER immediately begins formatting.  
- Device shows formatting screen until complete.

### Navigation:
- BTN_ENTER → begin format → FILES_ROOT when done  
- POWER_ESC → FILES_ROOT  

---

# 5.7 FILES_DELETE_CONFIRM (Observed)

**ID:** `FILES_DELETE_CONFIRM`  
**viewId:** `files_delete_confirm`

### Navigation:
- BTN_ENTER → delete file  
- POWER_ESC → cancel → FILES_SESSION_DIR  

---

# 6. LOCK CLUSTER

Lock is accessed directly from Home via softkey.

HOME → SOFTKEY_LOCK → LOCK_MENU

---

# 6.1 LOCK_MENU

**ID:** `LOCK_MENU`  
**viewId:** `lock_menu`

### Behavior:
- Locks physical keys except ESC, SOFTKEY_LOCK, and POWER.

### Navigation:
- BTN_ENTER → toggle lock state  
- POWER_ESC → HOME  

When locked:
- All buttons ignored except Power/Esc and Lock softkey.

---

# 7. CALIBRATION CLUSTER (FULL)

Calibration is accessed from Home via softkey.

HOME → SOFTKEY_CAL → CAL_MENU

---

# 7.1 CAL_MENU

**ID:** `CAL_MENU`  
**viewId:** `cal_menu`

### Screen Content:
- Shows LAST CALIBRATION date/time  
- Includes “PRE-CAL” indicator  
- “Enter to Log Cal” message

### Navigation:
- BTN_ENTER → begin calibration sequence → CAL_RUNNING  
- POWER_ESC → HOME  

---

# 7.2 CAL_RUNNING

**ID:** `CAL_RUNNING`  
**viewId:** `cal_running`

### Device Behavior:
- Calibration pulses run for ~4–6 seconds.  
- No buttons active except ESC (which cancels).  
- When complete → logged → return to HOME automatically.

### Navigation:
- POWER_ESC → cancel → HOME  
- All others → ignored  

---

# 8. ALERTS & ERROR CLUSTER (DEFERRED)

These screens were not observed yet but are included in the FSM for future capture.

### List of known alert categories:
- `ALERT_LOW_BATTERY`
- `ALERT_SD_MISSING`
- `ALERT_MEMORY_FULL`
- `ALERT_INVALID_ACTION`

### General pattern:
- viewId: `alert_xxx`  
- BTN_ENTER → acknowledge → return to previous state  
- POWER_ESC → same as ENTER  

---

# 9. GLOBAL RULES

These rules apply across the entire device simulation.

---

## 9.1 Backlight Behavior
- Toggled only via Backlight physical button.  
- Affects viewId name (e.g., `_dim` suffix if applicable).  
- Does not affect highlight or state.

---

## 9.2 Stop-Hold Rule (Critical)
STOP action works **only when** measurement is paused:

- If SLM mode = RUNNING:
  - STOP does nothing  
- If SLM mode = PAUSED:
  - STOP press <3s → ignored  
  - STOP press ≥3s → go to `STOP_CONFIRM` countdown  
  - On completion → session saved → `SLM_HOME_STOPPED`

---

## 9.3 ENTER-EDIT-EXIT Convention
Consistent across menus unless otherwise noted:

- ENTER enters edit mode.
- ESC exits edit mode.
- LEFT may exit edit mode in certain screens (Meter Set).
- RIGHT may do nothing in screens where no rightward field exists.

---

## 9.4 Highlight Index Rules
Every menu has:
- `highlightIndex`
- Navigation wraps top/bottom
- ESC restores previous screen and previous highlight

---

## 9.5 Softkey Rules (Global Patterns)
### SLM mode softkeys:
- Softkey 1 → SLM/1/1/1/3 cycle  
- Softkey 2 → F/S/I  
- Softkey 3 → R/C/Z/F  
- Softkey 4 → Meter 1/2  

### Setup menus:
- Rare softkey usage (Battery type, Logging meter select).

### Files:
- No softkeys except system messages / delete confirm.

### Calibration:
- No softkeys.

---

# 10. EVENT TABLE (GLOBAL)

Events used by the FSM:

```
BTN_UP  
BTN_DOWN  
BTN_LEFT  
BTN_RIGHT  
BTN_ENTER  
BTN_RUN_PAUSE  
BTN_STOP  
BTN_POWER_ESC  
BTN_BACKLIGHT  

SOFTKEY_SLM  
SOFTKEY_CAL  
SOFTKEY_FILE  
SOFTKEY_LOCK  

SOFTKEY_1  
SOFTKEY_2  
SOFTKEY_3  
SOFTKEY_4  

TICK_1S   (timer event)
TICK_100MS
```

---

# 11. VIEWID NAMING CONVENTION (ALIGN TO MENU-STRUCTURE-V2.5)

View IDs always match real capture filenames:

Examples:

```
home_screen_dim
home_screen
slm_home_page1_running
slm_home_page4_paused
slm_graph_1of1_page3_running
meter_set_edit
auto_run_dow_params
files_rename_last
cal_running
```

Rules:

- `_running`, `_paused`, `_stopped` always suffix SLM modes  
- `_pageX` indicates multi-page SLM/graph screens  
- Setup screens use exact names of captured JPEGs  
- Backlight “dim” screens use `_dim`  

---

# 12. IMPLEMENTATION NOTES

### Reducer-based FSM recommended:
- `mainFSM.js` with a pure reducer `(state, event) => state`  
- No side effects inside reducer  
- Timers handled via dispatcher (Storyline or JS interval)

### Renderer:
- Only needs `viewId` and `ctx`  
- Buttons mapped to dispatch events

### Cursor Integration:
- FSM-spec-v1.md is authoritative  
- All logic implemented from this file  
- Chunk 1, 2, 3 pasted sequentially produce full document

---

# 13. VERSIONING

**Version:** FSM-spec-v1  
**Matches:** Menu-Structure-v2.5  
**Last updated:** 2025-11-16  
**Author:** Atlas (ChatGPT) + Michael Carlino (device verification)

---

