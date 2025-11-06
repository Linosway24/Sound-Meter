# Master Integration Task — **mainFSM** (Production WebObject)

## 🎯 Objective
Integrate **all implemented device behavior and captured screens** into your production interactive (Storyline WebObject, 1920×1080) using a single, unified state machine: **`/js/fsm/mainFSM.js`**. This replaces sandbox pilots and runs the full flow:
**Startup → Home → SLM → Setup → Files → Lock → Calibration**  
(Alerts/edge SLM states are stubbed for later.)

---

## ✅ Assumptions (so Cursor can work without follow‑ups)
- Use file name **`mainFSM.js`** for the production state machine.
- Screen photos are organized under:
  ```
  /capture/startup/
  /capture/operational/
  /capture/setup/
  /capture/files/
  /capture/cal/
  /capture/lock/
  ```
- Begin in **boot → home_dim** (authentic Power‑On sequence). You can later skip to Home by setting `START_AT_HOME=true` in `config.js` (optional).

> If any folder names differ locally, Cursor should **adapt atlas paths** rather than moving files.

---

## Files to Create / Update

### 1) `/js/fsm/mainFSM.js`  ← **CREATE**
Implement the unified FSM with:
- **State shape** (example):
  ```js
  const state = {
    viewId: "boot_screen",
    backlight: false,
    mode: "SLM",
    menu: { selectedIndex: 0 },
    toast: null,
    timers: { stopHold: 0, formatting: 0, cal: 0 },
    files: { cursor: 0 },
    display: { contrast: 0, backlightMode: "On", language: "EN" },
    meterSet: { editing: false, focus: "title" },
    flags: { locked: false },
  };
  ```
- **Event dispatcher**: `dispatch({ type, payload })` handling all keys (POWER, BACKLIGHT, UP, DOWN, LEFT, RIGHT, ENTER, ESC, RUN, PAUSE, STOP_DOWN, STOP_UP, SOFT1..SOFT3, LOCK_SOFTKEY).
- **Routes** that set `state.viewId` to atlas IDs (see mapping below).
- **Timers**:
  - Stop hold countdown (3s) → `slm_home_stopped`.
  - Files → Format Card (2–3s “formatting” display) → return to `files_menu`.
  - Calibration running (simulated 4–6s) → return to previous screen.
- **Toasts**:
  - Save Config: “Config saved” (1.5s).
  - Rename Last Session: “File renamed” (1.5s).

### 2) `/js/main.js`  ← **UPDATE**
- Import and initialize `mainFSM`.
- Wire physical/onscreen buttons to `dispatch`.
- Subscribe render: `renderFromAtlas(state.viewId)`, `setBacklight(state.backlight)`, `renderToast(state)`.

### 3) `/js/buttons.js`  ← **UPDATE**
- Ensure each button emits the expected events to `window.dispatch`:
  - POWER, BACKLIGHT, RUN, PAUSE, STOP_DOWN/STOP_UP, ENTER, ESC, UP, DOWN, LEFT, RIGHT, SOFT1 (👓 View), SOFT2 (FILE), SOFT3 (CAL) if applicable, and `LOCK_SOFTKEY`.

### 4) `/js/display.js`  ← **UPDATE**
- Already renders by `viewId`. Keep the **no‑highlight** Home behavior.
- Optional: allow `?debugMenu=1` to overlay a translucent debug bar for Home selection (dev only).

### 5) `/data/screen-atlas.json`  ← **APPEND/ALIGN**
Add (or verify) entries for every **Have** screen below. Do **not** remove existing entries.

### 6) `/js/config.js`  ← **UPDATE**
- (Optional) Add feature switches:
  ```js
  export const START_AT_HOME = false; // true → skip boot during author testing
  export const ENABLE_TOASTS = true;
  ```

---

## Screen → Atlas Mapping (production IDs)
Use these exact `viewId` keys so the FSM code and atlas stay in sync.

### Startup & Home
- `boot_screen` → `/capture/startup/boot_screen.jpg`
- `home_screen_dim` → `/capture/startup/home_screen_dim.jpg`
- `home_screen` → `/capture/startup/home_screen.jpg`
- `home_screen_running` → `/capture/startup/home_screen_running.jpg`
- `unit_info` → `/capture/startup/unit_info.jpg`

### SLM (operation)
- `slm_home` → `/capture/operational/slm_home.jpg`
- `slm_home_paused` → `/capture/operational/slm_home_paused.jpg`
- `slm_home_stopped` → `/capture/operational/slm_home_stopped.jpg`
- `slm_view_menu` → `/capture/operational/slm_view_menu.jpg`
- `stop_confirm` → `/capture/operational/stop_confirm.jpg`
- **Deferred (TBD, stub views now)**:
  - `slm_over_range` → `/capture/operational/slm_over_range.jpg` (add later)
  - `slm_status_strip` → `/capture/operational/slm_status_strip.jpg` (add later)
  - `stop_done` → `/capture/operational/stop_done.jpg` (add later)

### Setup (all captured ✅)
- `setup_menu` → `/capture/setup/setup_menu.jpg`
- `measure_menu` → `/capture/setup/measure_menu.jpg`
- `meter_set_menu` → `/capture/setup/meter_set_menu.jpg`
- `meter_set_edit` → `/capture/setup/meter_set_edit.jpg`
- `auto_run_menu` → `/capture/setup/auto_run_menu.jpg`
- `datetime_menu` → `/capture/setup/datetime_menu.jpg`
- `datetime_edit` → `/capture/setup/datetime_edit.jpg`
- `digital_out_menu` → `/capture/setup/digital_out_menu.jpg`
- `options_menu` → `/capture/setup/options_menu.jpg`
- `sig_input_menu` → `/capture/setup/sig_input_menu.jpg`
- `logging_menu` → `/capture/setup/logging_menu.jpg`
- `comms_menu` → `/capture/setup/comms_menu.jpg`
- `comms_edit` → `/capture/setup/comms_edit.jpg`
- `battery_menu` → `/capture/setup/battery_menu.jpg`
- `display_menu` → `/capture/setup/display_menu.jpg`
- `display_language` → `/capture/setup/display_language.jpg`
- `display_backlight` → `/capture/setup/display_backlight.jpg`
- `display_contrast` → `/capture/setup/display_contrast.jpg`

### Files (softkey FILE)
- `files_menu` → `/capture/files/files_menu.jpg`
- `files_session_dir` → `/capture/files/files_session_dir.jpg`
- `files_config_dir` → `/capture/files/files_config_dir.jpg`
- `files_rename_last` → `/capture/files/files_rename_last.jpg`
- `files_save_config` → `/capture/files/files_save_config.jpg`
- `files_format_card` → `/capture/files/files_format_card.jpg`
- `files_delete_confirm` → `/capture/files/files_delete_confirm.jpg`

### Lock
- `lock_menu` → `/capture/lock/lock_menu.jpg`

### Calibration (2‑step)
- `cal_menu` → `/capture/cal/cal_menu.jpg`
- `cal_running` → `/capture/cal/cal_running.jpg`

### Alerts (deferred/TBD — stubs only for now)
- `low_battery` → `/capture/alerts/low_battery.jpg` (add later)
- `sd_missing` → `/capture/alerts/sd_missing.jpg` (add later)
- `memory_full` → `/capture/alerts/memory_full.jpg` (add later)
- `invalid_action` → `/capture/alerts/invalid_action.jpg` (add later)

---

## Event Map (keys → actions)
- **POWER**: boot → home_dim; if already on, power off (optional) or ignore.
- **BACKLIGHT**: toggle `state.backlight` and choose `home_screen_dim` vs `home_screen` accordingly.
- **RUN / PAUSE / STOP_DOWN / STOP_UP**: SLM cycle (run ↔ pause, 3s hold → stopped).
- **ENTER / ESC**: activate/exit menus or edits.
- **UP / DOWN**: move **internal selection index** (no visible highlight on Home; visible within lists if your photo shows it).
- **LEFT / RIGHT**: used in `display_contrast` and number edits (meter set).
- **SOFT1 (👓)**: SLM View menu.
- **SOFT2 (FILE)**: Files root menu.
- **SOFT3 (CAL)**: Calibration menu.
- **LOCK_SOFTKEY**: Lock menu.

---

## Core Flows to Implement

### 1) Boot & Home
- On load: `boot_screen` (300–800ms) → `home_screen_dim`.
- BACKLIGHT toggles dim/lit.
- HOME internal menu (no visible highlight): `state.menu.selectedIndex` 0..N.
  - ENTER routes:
    1. View Past Studies → (toast: “No studies yet”)
    2. View Current Study → `home_screen_running`
    3. View Session → `slm_home`
    4. Setup → `setup_menu`
    5. Unit Info → `unit_info`

### 2) SLM Operation
- RUN from Home → `home_screen_running`, ENTER → `slm_home`.
- PAUSE in SLM → `slm_home_paused`. RUN resumes.
- STOP_DOWN → `stop_confirm` (start 3s); STOP_UP before 3s → back to paused; if reaches 0 → `slm_home_stopped` (+ optional toast “Saved & cleared”).
- SOFT1 → `slm_view_menu` (UP/DOWN choose; ENTER returns to `slm_home`).

### 3) Setup Branch (all captured)
- `setup_menu` UP/DOWN/ENTER to each submenu view.
- **Meter Set Edit**: ENTER toggles edit/focus; UP/DOWN adjust; LEFT returns focus to title; ENTER on title → save & return to list; ESC cancels.
- **Display Contrast**: LEFT/RIGHT adjust (just show screen + store value).
- **Comms Edit**: treat like a confirm screen (store selection; toast “Comms updated”).

### 4) Files Branch
- `files_menu`: route to 5 items.
- **Session/Config Directory**: UP/DOWN to move cursor; ENTER returns (or open detail later).
- **Rename Last Session**: ENTER acts → toast “File renamed” (1.5s) → return to `files_menu`.
- **Save Config File**: toast “Config saved” (1.5s) → return to `files_menu`.
- **Format Card**: set `timers.formatting = 2000–3000ms`, show `files_format_card` while timer runs → return to `files_menu` automatically (no confirm).
- **Delete Confirm** (if reached from lists): ENTER confirms → toast “Deleted” → return to directory list; ESC cancels.

### 5) Lock
- `lock_menu`: display only; optional toggle `flags.locked` if device supports it. If locked, ignore most input except UNLOCK sequence.

### 6) Calibration
- `cal_menu` → ENTER starts → `cal_running` with a 4–6s timer → return to previous (SLM or Setup). Add ESC to abort and return immediately.

### 7) Alerts (stubs)
- Provide `showAlert(viewId)` that sets `state.viewId = alertId` for 1.5–2.0s then returns to prior view. Keep **inactive** until images are available.

---

## Atlas JSON (example patch block)
Append entries like this (Cursor should **merge**, not overwrite):
```json
{
  "boot_screen": "capture/startup/boot_screen.jpg",
  "home_screen_dim": "capture/startup/home_screen_dim.jpg",
  "home_screen": "capture/startup/home_screen.jpg",
  "home_screen_running": "capture/startup/home_screen_running.jpg",
  "unit_info": "capture/startup/unit_info.jpg",

  "slm_home": "capture/operational/slm_home.jpg",
  "slm_home_paused": "capture/operational/slm_home_paused.jpg",
  "slm_home_stopped": "capture/operational/slm_home_stopped.jpg",
  "slm_view_menu": "capture/operational/slm_view_menu.jpg",
  "stop_confirm": "capture/operational/stop_confirm.jpg",

  "setup_menu": "capture/setup/setup_menu.jpg",
  "measure_menu": "capture/setup/measure_menu.jpg",
  "meter_set_menu": "capture/setup/meter_set_menu.jpg",
  "meter_set_edit": "capture/setup/meter_set_edit.jpg",
  "auto_run_menu": "capture/setup/auto_run_menu.jpg",
  "datetime_menu": "capture/setup/datetime_menu.jpg",
  "datetime_edit": "capture/setup/datetime_edit.jpg",
  "digital_out_menu": "capture/setup/digital_out_menu.jpg",
  "options_menu": "capture/setup/options_menu.jpg",
  "sig_input_menu": "capture/setup/sig_input_menu.jpg",
  "logging_menu": "capture/setup/logging_menu.jpg",
  "comms_menu": "capture/setup/comms_menu.jpg",
  "comms_edit": "capture/setup/comms_edit.jpg",
  "battery_menu": "capture/setup/battery_menu.jpg",
  "display_menu": "capture/setup/display_menu.jpg",
  "display_language": "capture/setup/display_language.jpg",
  "display_backlight": "capture/setup/display_backlight.jpg",
  "display_contrast": "capture/setup/display_contrast.jpg",

  "files_menu": "capture/files/files_menu.jpg",
  "files_session_dir": "capture/files/files_session_dir.jpg",
  "files_config_dir": "capture/files/files_config_dir.jpg",
  "files_rename_last": "capture/files/files_rename_last.jpg",
  "files_save_config": "capture/files/files_save_config.jpg",
  "files_format_card": "capture/files/files_format_card.jpg",
  "files_delete_confirm": "capture/files/files_delete_confirm.jpg",

  "lock_menu": "capture/lock/lock_menu.jpg",

  "cal_menu": "capture/cal/cal_menu.jpg",
  "cal_running": "capture/cal/cal_running.jpg"
}
```

---

## Merge Plan (safe for production)
1. **Add `/js/fsm/mainFSM.js`** and wire it in `/js/main.js`.
2. Append atlas entries (do not remove existing keys).
3. Ensure all buttons dispatch events to `window.dispatch`.
4. Run in Storyline WebObject (1920×1080). If needed, set `START_AT_HOME=true` during authoring.
5. Commit as: `feat: integrate mainFSM (startup, SLM, setup, files, lock, cal)`.

**Rollback:** keep `startupHomeFSM.*` intact; you can swap back by reverting the import in `/js/main.js`.

---

## Acceptance Checklist
- ☐ Boot: boot → home_dim → BACKLIGHT → home_lit
- ☐ Home navigation (no highlight): UP/DOWN internal; ENTER routes
- ☐ SLM: run ↔ pause; stop 3s → stopped; 👓 view menu returns to SLM
- ☐ Setup: all submenus reachable; Meter Set edit behavior matches device; Display Contrast responds to LEFT/RIGHT
- ☐ Files: each item opens; Save/Rename show toasts; Format runs timer then returns
- ☐ Lock: lock menu opens; (optional) locked flag can suppress inputs
- ☐ Cal: cal_menu → cal_running timer → return
- ☐ No console errors; image paths resolve

---

## Cursor Prompt (paste to run this task)
> Implement a production FSM named **/js/fsm/mainFSM.js** that integrates Startup → Home → SLM → Setup → Files → Lock → Calibration, using the **Screen → Atlas** mapping in this file. Update `/js/main.js` to initialize `mainFSM`, ensure `/js/buttons.js` dispatches the listed events, and append the atlas entries to `/data/screen-atlas.json` (merge only). Add timers for Stop Hold (3s), Files Format Card (2–3s), and Calibration (4–6s). Add toasts for Save Config and Rename Last Session. Keep Home’s internal menu without visible highlight (maintain `state.menu.selectedIndex`). Respect the existing backlight behavior and 1920×1080 layout. Do not modify unrelated files or remove existing atlas keys.
