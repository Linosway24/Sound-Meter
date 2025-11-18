# Quest SoundPro SE-DL — Menu & Screen Reference (Firmware R.13J)
## Version 2.5 — Full Structured Reference for Simulator / FSM

This document describes the **real behavior** of the Quest SoundPro SE-DL (firmware R.13J) as observed directly from the physical device and captured via photos.  

It is designed as **implementation reference** for a web-based simulator (e.g., 1920×1080 Storyline web object) and for building a finite state machine (FSM).

- All screen names are aligned with the photo filenames used in the project.
- Button behavior is documented **per-screen** where relevant.
- This should be treated as the **single source of truth** for UI flow, not the legacy manual.

---

## 1. Physical Controls & Global Conventions

### 1.1 Physical Buttons

| Control        | Label / Name          | General Role                                                                 |
|----------------|-----------------------|-------------------------------------------------------------------------------|
| Power / Escape | Power / ESC (one key) | Boot device; exit or cancel from menus; acts as “back” during navigation     |
| Backlight      | Backlight             | Toggles LCD backlight on/off                                                 |
| Run / Pause    | Run/Pause (one key)   | Starts or pauses measurement/session                                         |
| Stop           | Stop                  | Long press (≈3 seconds) to stop; used to confirm quit/save                   |
| Up / Down      | ▲ / ▼                 | Move highlight; scroll lines; increment/decrement fields                     |
| Left / Right   | ◀ / ▶                 | Move between editable fields; adjust some numeric/visual parameters          |
| Enter          | Enter                 | Activate selection; enter edit mode; confirm/log in some screens             |
| Alt F          | ALT F                 | Changes displayed softkey/function labels depending on mode/screen           |
| Softkey 1–4    | Bottom LCD softkeys   | Context-sensitive; labels change per screen (SLM, CAL, FILE, LOCK, etc.)     |

> **Note:** Function of each button is **screen-dependent**. Use the per-screen “Button Behavior” tables below during implementation.

---

### 1.2 Global Navigation Conventions

- Most menus use a **visible highlight bar** to indicate the selected item.
- **Up/Down** move the highlight; usually wrap-around at top/bottom.
- **Enter**:
  - On menus: opens the highlighted item.
  - On editable lines: enters/advances edit mode or toggles a setting.
- **Power / ESC**:
  - On startup: powers on.
  - In menus: cancels edit or returns to parent screen.
- **Backlight**:
  - Independent of state; toggles backlight on/off.
- **Softkeys**:
  - Always follow the labels along the bottom of the LCD.
  - Behavior can change between Home, SLM modes, Setup parameters, etc.
- **Timer**:
  - Formatted as `hh:mm:ss`.
  - Visible on Home only when **View Current Study** or **View Session** is highlighted.
  - Updates when Run/Pause is used and a session is active.

---

## 2. High-Level Screen Flow

### 2.1 Top-Level State Flow

```text
Startup → Home (backlight off) → Home (backlight on) → [SLM | Setup | Files | Lock | Unit Info]
```

From Home:

- **SLM**: via menu (“View Current Study” / “View Session”) + SLM softkey mode.
- **Setup**: via “Setup” entry.
- **Files**: via FILE softkey.
- **Lock**: via LOCK softkey.
- **Calibration**: via CAL softkey.
- **Unit Info**: via menu item.

---

## 3. Screen Index (By Area)

This is a quick index of the screen image assets (file stems) and their roles.

### 3.1 Startup & Home

| Screen ID          | File                        | Description                                 |
|--------------------|----------------------------|---------------------------------------------|
| `boot_screen`      | `boot_screen.jpeg`         | Power-on splash / logo                      |
| `home_screen_dim`  | `home_screen_dim.jpeg`     | Home w/ backlight off                       |
| `home_screen`      | `home_screen.jpeg`         | Home w/ backlight on                        |
| `home_screen_run`  | `home_screen_running.jpeg` | Home with timer running (session active)    |
| `unit_info`        | `unit_info.jpeg`           | Device information / FW / serial / battery  |

### 3.2 SLM Operation

Core SLM screens:

| Screen ID           | File                          | Description                                    |
|---------------------|-------------------------------|------------------------------------------------|
| `slm_home`          | `slm_home.jpeg`               | Numeric SLM view (page 1, SLM mode)           |
| `slm_home_paused`   | `slm_home_paused.jpeg`        | Same view, measurement paused                 |
| `slm_home_stopped`  | `slm_home_stopped.jpeg`       | Stopped / saved state                         |
| `slm_view_menu`     | `slm_view_menu.jpeg`          | View menu (dot moves w/ Up/Down)              |
| `stop_confirm`      | `stop_confirm.jpeg`           | 3-second hold/quit/save countdown             |

SLM multi-page numeric views:

- `slm_home_page2_running.jpeg`
- `slm_home_page2_paused.jpeg`
- `slm_home_page3_running.jpeg`
- `slm_home_page3_paused.jpeg`
- `slm_home_page4_running.jpeg`
- `slm_home_page4_paused.jpeg`

1/1 octave graph views:

- `slm_graph_1of1_page1_running.jpeg`
- `slm_graph_1of1_page1_paused.jpeg`
- and pages 2–4 (running/paused)

1/3 octave graph views:

- `slm_graph_1of3_page1_running.jpeg`
- `slm_graph_1of3_page1_paused.jpeg`
- and pages 2–4 (running/paused)

> Exact filenames may differ slightly (e.g., `slim_` vs `slm_` typos in capture). Use the canonical mapping you established in your codebase.

---

### 3.3 Setup Menu & Subscreens

| Screen ID            | File                         | Description                                 |
|----------------------|------------------------------|---------------------------------------------|
| `setup_menu`         | `setup_menu.jpeg`           | Root setup menu                             |
| `measure_menu`       | `measure_menu.jpeg`         | Measurement settings                        |
| `meter_set_menu`     | `meter_set_menu.jpeg`       | Meter Set main screen                       |
| `meter_set_edit`     | `meter_set_edit.jpeg`       | Meter Set edit view                         |
| `auto_run_menu`      | `auto_run_menu.jpeg`        | Auto-Run mode selector                      |
| `auto_run_timed_run_params` | `auto_run_timed_run_params.jpeg` | Auto-Run Timed Run params         |
| `auto_run_dow_params`       | `auto_run_dow_params.jpeg`       | Auto-Run DOW params             |
| `auto_run_date_params`      | `auto_run_date_params.jpeg`      | Auto-Run Date params            |
| `auto_run_level_triggered_params` | `auto_run_level_triggered_params.jpeg` | Level-Triggered params |
| `datetime_menu`      | `datetime_menu.jpeg`        | Time/Date menu                              |
| `datetime_edit`      | `datetime_edit.jpeg`        | Time/Date edit screen                       |
| `digital_out_menu`   | `digital_out_menu.jpeg`     | Digital output settings                     |
| `options_menu`       | `options_menu.jpeg`         | Options (static/info)                       |
| `sig_input_menu`     | `sig_input_menu.jpeg`       | Signal input settings                       |
| `logging_menu`       | `logging_menu.jpeg`         | Logging settings                            |
| `comms_menu`         | `comms_menu.jpeg`           | Comm Set main screen                        |
| `comms_edit`         | `comms_edit.jpeg`           | Comm Set edit screen                        |
| `battery_menu`       | `battery_menu.jpeg`         | Battery type/status                         |
| `display_menu`       | `display_menu.jpeg`         | Display menu                                |
| `display_language`   | `display_language.jpeg`     | Language selection                          |
| `display_backlight`  | `display_blacklight.jpeg`   | Backlight mode                              |
| `display_contrast`   | `display_contrast.jpeg`     | Contrast adjustment                         |

---

### 3.4 Files Menu & Related

| Screen ID             | File                        | Description                                |
|-----------------------|-----------------------------|--------------------------------------------|
| `files_menu`          | `files_menu.jpeg`          | Files root menu                            |
| `files_session_dir`   | `files_sseion_dir.jpeg`    | Session directory list                     |
| `files_config_dir`    | `files_config_dir.jpeg`    | Config directory list                      |
| `files_rename_last`   | `files_rename_last.jpeg`   | Rename last session file                   |
| `files_save_config`   | `files_save_config.jpeg`   | Save current config file                   |
| `files_format_card`   | `files_format_card.jpeg`   | Format card screen (no confirm)            |
| `files_delete_confirm`| `files_delete_confirm.jpeg`| Confirm delete screen                      |

---

### 3.5 Lock & Calibration

| Screen ID     | File               | Description                          |
|---------------|--------------------|--------------------------------------|
| `lock_menu`   | `lock_menu.jpeg`   | Lock state menu                      |
| `cal_menu`    | `cal_menu.jpeg`    | Calibration history / start         |
| `cal_running` | `cal_running.jpeg` | Active calibration (Pre-Cal meter)  |

---

### 3.6 Alerts (Not Yet Captured)

These are **deferred**: behavior is assumed but images not yet captured.

- `low_battery`
- `sd_missing`
- `memory_full`
- `invalid_action`

---

## 4. Home & Startup

### 4.1 Startup Screen

**Screen ID:** `boot_screen`  
**Description:**

- Displays a **SmartPro / SoundPro** style logo.
- No menu, no highlight bar.
- Displayed briefly on power-on before transitioning to Home.

**Button Behavior:**

| Button         | Action                                  |
|----------------|-----------------------------------------|
| Power / ESC    | From off → boots into `boot_screen`.    |
| All others     | Ignored while splash is on-screen.      |

Transition: `boot_screen` → `home_screen_dim`.

---

### 4.2 Home Screen (Backlight Off / On)

**Screens:**

- `home_screen_dim` (backlight off)
- `home_screen` (backlight on)
- `home_screen_running` (same layout, timer counting when session is running)

**Visual Elements:**

- **Top row:**
  - Battery indicator (icon).
  - Status symbol: STOP square or RUN/PAUSE icon, depending on state.
  - Timer: `00:00:00` (hours:minutes:seconds).
- **Center menu list:**
  1. View Past Studies
  2. View Current Study
  3. View Session
  4. Setup
  5. Unit Info
- Highlight bar:
  - Present.
  - On first entry, highlights **View Current Study** by default.
- **Softkeys on Home:**
  - Softkey 1: **SLM**
  - Softkey 2: **CAL**
  - Softkey 3: **FILE**
  - Softkey 4: **LOCK**

**Menu Items & Destinations:**

| Index | Label              | Destination              | Notes                                           |
|-------|--------------------|--------------------------|-------------------------------------------------|
| 1     | View Past Studies  | (future/Files/session)   | Inactive if no stored sessions                  |
| 2     | View Current Study | `slm` (measurement mode) | Highlighted by default on first Home appearance |
| 3     | View Session       | `slm` (session view)     | Similar to current study, different context     |
| 4     | Setup              | `setup_menu`             | Root for configuration                          |
| 5     | Unit Info          | `unit_info`              | Device info screen                              |

**Button Behavior (Home):**

| Button         | Action                                                                                               |
|----------------|------------------------------------------------------------------------------------------------------|
| Up / Down      | Move highlight bar between entries 1–5; wrap-around at ends                                         |
| Enter          | Execute selected menu item (see table above)                                                        |
| Power / ESC    | No further power-off behavior simulated; acts as “cancel” in other screens, but no effect here      |
| Backlight      | Toggle between `home_screen_dim` and `home_screen` images                                           |
| Run / Pause    | Starts or pauses the session timer from home. When running, status symbol changes and timer counts. |
| Stop           | From Home: does nothing when idle; if session logic is running/paused, long-press triggers quit flow|
| Softkey 1 (SLM)| Cycles SLM mode label: **SLM → 1/1 → 1/3 → SLM…**                                                    |
| Softkey 2 (CAL)| Enter Calibration (`cal_menu`)                                                                       |
| Softkey 3 (FILE)| Enter Files (`files_menu`)                                                                         |
| Softkey 4 (LOCK)| Enter Lock (`lock_menu`)                                                                           |

**Timer Note:**

- Timer is visible only when **View Current Study** or **View Session** is highlighted.
- Run/Pause from Home affects the timer even before entering SLM view.

---

### 4.3 Unit Info Screen

**Screen ID:** `unit_info`  
**Description:**

- Displays model info, firmware revision (e.g., R.13J), serial number, battery info, etc.
- Informational only — no editable fields.

**Button Behavior:**

| Button      | Action                                            |
|-------------|---------------------------------------------------|
| Enter       | Returns to Home                                   |
| Power / ESC | Returns to Home                                   |
| Up/Down     | No action (static screen)                         |
| Left/Right  | No action                                         |
| Softkeys    | Not used                                          |

---

## 5. SLM Operation Cluster

SLM behavior is split into:

- **Modes**: SLM numeric view, 1/1 octave graph, 1/3 octave graph.
- **Pages**: 1–4 per mode.
- **Run state**: running, paused, stopped.

### 5.1 Entering SLM

You enter SLM from Home:

- Highlight **View Current Study** or **View Session**.
- Press **Enter**.
- The SLM mode used (numeric vs 1/1 vs 1/3) is determined by the **SLM softkey label**:
  - SLM label → numeric SLM view.
  - 1/1 label → 1/1 octave graph view.
  - 1/3 label → 1/3 octave graph view.

### 5.2 SLM Mode Softkey & Cycling

**Softkey 1 on Home:**

- Label cycles as: `SLM → 1/1 → 1/3 → SLM → …`
- This choice persists as the starting mode when entering SLM.

---

### 5.3 SLM Home Numeric View (`slm_home` + pages)

**Screens:**

- `slm_home.jpeg` (page 1)
- `slm_home_page2_running.jpeg` / `_paused.jpeg`
- `slm_home_page3_running.jpeg` / `_paused.jpeg`
- `slm_home_page4_running.jpeg` / `_paused.jpeg`

**Visual:**

- Large numeric dB readout.
- Additional metrics on other pages (Leq, Lmax, etc.).
- Top status row (battery, status icon, timer).

**Softkeys in SLM:**

1. Softkey 1: **👓 View** — opens `slm_view_menu`.
2. Softkey 2: **F S I** — cycles among **F, S, I** with a black underline under active letter.
3. Softkey 3: **R C Z F** — cycles among **R, C, Z, F** with underline under active letter.
4. Softkey 4: **Meter 1/2** — toggles active meter between Meter 1 and Meter 2.

**Button Behavior (SLM Numeric):**

| Button         | Action                                                                                   |
|----------------|------------------------------------------------------------------------------------------|
| Up / Down      | Scroll between pages 1–4 within the current mode                                        |
| Left / Right   | Cycle the current measurement unit / secondary view (ties into options from View Menu)  |
| Enter          | No global action (reserved for specific SLM sub-modes if needed)                        |
| Run / Pause    | Toggle run state: Running ↔ Paused                                                       |
| Stop (hold)    | Engages 3s countdown (`stop_confirm`); on completion, SLM session stops and saves        |
| Power / ESC    | Exit SLM and return to Home                                                              |
| Softkey 1      | Open **View Menu** (`slm_view_menu`)                                                     |
| Softkey 2      | Cycle between **F / S / I**; underline moves under active letter                         |
| Softkey 3      | Cycle between **R / C / Z / F**; underline moves under active letter                     |
| Softkey 4      | Toggle **Meter 1 / Meter 2**                                                             |

> **Stop logic:** From the SLM screen, when running:
> - You must **pause** (Run/Pause) first, then long-press Stop to trigger the Quit/Save 3-second countdown.

---

### 5.4 SLM View Menu (`slm_view_menu`)

**Screen ID:** `slm_view_menu`  
**Visual:**

- List of measurement layouts (for example: SPL, Leq, Lmax distributions, etc.).
- A **dot** (•) or marker on the left indicates the active choice.
- Dot moves up/down as you press Up/Down arrows.

**Button Behavior:**

| Button         | Action                                                |
|----------------|-------------------------------------------------------|
| Up / Down      | Move dot between entries                              |
| Enter          | Confirm selected view layout                          |
| Power / ESC    | Cancel and return to previous SLM screen without change |
| Left / Right   | No action                                             |
| Softkeys       | Not used in this menu                                |

---

### 5.5 SLM 1/1 and 1/3 Graph Views

**1/1 octave mode:**

- Uses `slm_graph_1of1_*` images.
- Same run/pause/stop behavior as numeric SLM.
- Pages 1–4 correspond to different graph overlays / additional metrics.

**1/3 octave mode:**

- Uses `slm_graph_1of3_*` images.
- Same navigation / run state pattern.

**Button Behavior (shared with numeric SLM unless overridden):**

| Button     | Action                                           |
|------------|--------------------------------------------------|
| Up / Down  | Change graph page within mode (1–4)              |
| Left/Right | Usually no unit change here (graphs are fixed)   |
| Run/Pause  | Start/pause measurement                          |
| Stop hold  | 3s countdown → stop/save                         |
| ESC        | Return to Home                                   |
| Softkeys   | Same: View, F/S/I, R/C/Z/F, Meter 1/2            |

---

### 5.6 Stop Confirm & Stopped

**Stop Confirm Screen:**

- Screen ID: `stop_confirm`
- Appears when **Stop** is held for ≈3 seconds from a paused SLM state.
- Shows countdown (3,2,1) and message like **Quit & Save?** while holding Stop.

**Button Behavior:**

| Button      | Action                                                          |
|-------------|-----------------------------------------------------------------|
| Stop (hold) | Continue holding until countdown completes → SLM stopped        |
| Release Stop| Cancels quit; returns to SLM paused                             |
| Run/Pause   | Cancels quit; returns to SLM paused                             |
| ESC         | Cancels countdown; back to SLM paused                           |

**Stopped Screen:**

- Screen ID: `slm_home_stopped`
- Indicates measurement has been stopped and saved.
- Likely returns to Home or SLM home after short delay or keypress (tunable in sim).

---

## 6. Setup Menu & Submenus

### 6.1 Setup Root Menu (`setup_menu`)

**Screen:**

- List of Setup items:

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

**Button Behavior:**

| Button      | Action                                    |
|-------------|-------------------------------------------|
| Up / Down   | Move highlight between items 1–11         |
| Enter       | Open selected submenu                     |
| ESC         | Return to Home                            |
| Softkeys    | None for this root menu                   |

---

### 6.2 Measure (`measure_menu`)

**Description:**

- Allows configuration of basic measurement options (exact fields TBD).
- Standard highlight bar for options.

**Button Behavior:**

| Button    | Action                                         |
|-----------|------------------------------------------------|
| Up/Down   | Move highlight                                  |
| Enter     | Enter edit mode on highlighted parameter       |
| ESC       | Exit to `setup_menu`                           |
| In edit:  | Up/Down adjust values; ESC cancels/saves + exit|

(Details of specific parameters can be added as needed for implementation.)

---

### 6.3 Meter Set (`meter_set_menu` / `meter_set_edit`)

**Parameters shown:**

- **Threshold**
- **Exchange Rate**
- **Criterion Level**
- **Upper Limit**
- **Projected Time**

**Softkeys (Meter Set):**

- Softkey 2: `F S I` — cycles **F → S → I → F...** and moves underline.
- Softkey 3: `R C Z F` — cycles **R → C → Z → F → R...** and moves underline.
- Softkey 4: `Meter 1/2` — toggles between Meter 1 and Meter 2.

**Edit Behavior (all parameters):**

- **Enter**:
  - Activates edit mode for the highlighted parameter.
  - For **Threshold**, Enter cycles between **dB level** and **Off**, while staying in edit mode.
- **Up/Down**: Change numeric value or selection while in edit.
- **Right**: **No effect** while in edit.
- **Left**: Exit edit field and jump focus back to the parameter label, but stay on the same screen.
- **ESC**: Exit edit mode, return to parameter list (and then Setup on a second ESC).

**Button Behavior Summary:**

| Button        | Action                                                                  |
|---------------|-------------------------------------------------------------------------|
| Up/Down       | Move highlight (in menu) or adjust value (in edit)                     |
| Enter         | Enter edit; on Threshold, cycles dB ↔ OFF                              |
| Left          | From edit: jump focus back to parameter label                          |
| Right         | No action in edit                                                       |
| ESC           | Exit edit / back to `setup_menu`                                       |
| Softkey 2     | Cycle F/S/I with underline movement                                    |
| Softkey 3     | Cycle R/C/Z/F with underline movement                                  |
| Softkey 4     | Toggle Meter 1 / Meter 2                                               |

---

### 6.4 Auto-Run (`auto_run_menu` + parameter screens)

**Root Screen:** `auto_run_menu`

Top line: **AUTO-RUN** mode selector.  
Second line: **VIEW/SET PARAMETERS**.

**Auto-Run modes cycle in this fixed order when AUTO-RUN is highlighted and you press Enter:**

1. Disabled  
2. Timed Run  
3. DOW (Day of Week)  
4. Date  
5. Level-Triggered  
6. (back to) Disabled  

#### 6.4.1 Auto-Run: Disabled

- When **AUTO-RUN** is set to **Disabled**:
  - All automations are off.
  - **VIEW/SET PARAMETERS** cannot be opened; Enter has no effect on it.
  - Softkeys not used.

**Button Behavior:**

| Button    | Action                                             |
|-----------|----------------------------------------------------|
| Enter     | On AUTO-RUN line: cycle mode to Timed Run          |
| Enter     | On VIEW/SET line: no action                        |
| Up/Down   | Move between AUTO-RUN and VIEW/SET PARAMETERS      |
| ESC       | Back to `setup_menu`                               |

#### 6.4.2 Auto-Run: Timed Run (`auto_run_timed_run_params`)

Path: `\setup\AUTO-RUN:TIMED-RUN`  
Display:

- Title: `\setup\AUTO-RUN:TIMED-RUN`
- Highlight line: **TIMED-RUN**
- Parameter: `D 00:00:02` (example duration)

No softkeys shown.

**Button Behavior (Timed Run params):**

| Button    | Action                                                                                     |
|-----------|--------------------------------------------------------------------------------------------|
| Enter     | Activate edit on the `00:00:02` time; further Enter steps between H/M/S digits             |
| Up/Down   | Adjust the currently selected H/M/S digit value                                           |
| Left/Right| Move cursor between H, M, S fields                                                        |
| ESC       | Exit edit; return to `auto_run_menu` if current AUTO-RUN mode is Timed Run                |

#### 6.4.3 Auto-Run: DOW (`auto_run_dow_params`)

- Shows days of week along top; uppercase/lowercase/dash to indicate selected/active states.
- One or more timing lines (e.g., Auto-Run #1/#2) below.

**Behavior we know:**

- **Enter** cycles through field groups: day-of-week selector → start time → stop time.
- **Softkeys**:
  - `-1`, `-2`: select or enable lines 1 and 2.
  - Once times are set, these may display `+1`, `+2` to indicate active schedules.

**Button Behavior (DOW):**

| Button     | Action                                                           |
|------------|------------------------------------------------------------------|
| Up/Down    | Move between lines (e.g., Auto-Run #1 / #2)                      |
| Left/Right | Move across day-of-week fields                                  |
| Enter      | Step through fields on the selected line; toggle day/time focus  |
| Softkey 1  | Select/enable line 1 (`-1` → `+1` when configured)               |
| Softkey 2  | Select/enable line 2 (`-2` → `+2` when configured)               |
| ESC        | Return to `auto_run_menu`                                        |

#### 6.4.4 Auto-Run: Date (`auto_run_date_params`)

- Displays separate AUTO-RUN # lines (1–4).
- Softkeys: `-1`, `-2`, `-3`, `-4` to select each line.

**Behavior:**

- Each line can be OFF or have a date/time.
- Active lines display as +1, +2, +3, +4.

**Button Behavior (Date):**

| Button     | Action                                            |
|------------|---------------------------------------------------|
| Up/Down    | Move highlight between AUTO-RUN # lines           |
| Enter      | Toggle OFF/ON or enter edit for date/time         |
| Softkey 1–4| Jump directly to corresponding line and enable it |
| ESC        | Return to `auto_run_menu`                         |

#### 6.4.5 Auto-Run: Level-Triggered (`auto_run_level_triggered_params`)

Fields include:

- **MODE**: LEVEL ON/OFF ↔ WINDOWED
- **ACTION**: RUN/STOP ↔ RUN/PSE
- **TRIGGER**: text indicating result (e.g., RUN, STOP, UPPER/LOWER)
- **SOURCE** (for run & stop/pause sides): METER1, 12.5Hz, EXT, DELAY/TIMED
- **LEVEL**: OFF or 90.0 (dB)

**Button Behavior (Level-Triggered):**

| Button     | Action                                                                                  |
|------------|-----------------------------------------------------------------------------------------|
| Up/Down    | Move between MODE, ACTION, TRIGGER, SOURCE, LEVEL                                       |
| Enter      | Cycle MODE, ACTION, LEVEL values; open edit where needed                               |
| Left/Right | Move within SOURCE “run side” vs “stop/pause side” options                             |
| ESC        | Return to `auto_run_menu`                                                              |
| Softkeys   | None                                                                                   |

---

### 6.5 Time/Date (`datetime_menu`, `datetime_edit`)

- `datetime_menu`: lists Year, Month, Day, Time.
- `datetime_edit`: shows cursor on a specific field for editing.

**Button Behavior:**

| Button    | Action                                           |
|-----------|--------------------------------------------------|
| Up/Down   | Move between Year/Month/Day/Time lines           |
| Enter     | Enter edit mode on highlighted field             |
| Left/Right| Move cursor between sub-fields (Y/M/D, H/M/S)    |
| Up/Down   | Adjust the selected subfield                     |
| Enter     | Confirm value and exit edit                      |
| ESC       | Exit edit or return to `setup_menu`              |

---

### 6.6 Digital Out (`digital_out_menu`)

Parameters:

- **TRIGGER**: `SPL` ↔ `AVG`
- **OUTPUT 1**: `OFF → RUN/PSE → CURVES → OFF → ...`
- **OUTPUT 2**: `OFF ↔ dB`
- **OUTPUT 3**: `OFF ↔ dB`
- **LOGIC 1 2 3**: each can be HI or LO (logic output state)

**Button Behavior:**

| Button    | Action                                                                                |
|-----------|---------------------------------------------------------------------------------------|
| Up/Down   | Move highlight among TRIGGER, OUTPUT1–3, LOGIC 1–3                                   |
| Enter     | For TRIGGER/OUTPUT fields: cycle through allowed options                             |
| Enter (Logic)| Enter HI/LO edit mode                                                             |
| Up/Down (Logic)| Toggle HI/LO for selected position                                              |
| Left/Right (Logic)| Move between the 3 HI/LO positions                                           |
| ESC       | Exit Logic editor or return to `setup_menu`                                          |

---

### 6.7 Options (`options_menu`)

- Static text such as:
  - DATA FILE
  - OPTIONS NOT LOADED
  - FILE NOT FOUND

No editable fields or highlight bar.

**Button Behavior:**

| Button   | Action              |
|----------|---------------------|
| ESC      | Return to `setup_menu` |
| Others   | No effect           |

---

### 6.8 Signal Input (`sig_input_menu`)

Fields seen:

- **Sensitivity** (e.g., −28.3 dB)
- **Range Cap** (e.g., 140 dB)
- **Polarization** (e.g., 0V)

**Button Behavior:**

| Button   | Action                                                   |
|----------|----------------------------------------------------------|
| Up/Down  | Move between Sensitivity / Range Cap / Polarization      |
| Enter    | Enter edit mode                                          |
| Up/Down  | Adjust value or toggle (in edit)                         |
| ESC      | Exit edit and/or return to `setup_menu`                 |

---

### 6.9 Logging (`logging_menu`)

Fields:

- AVG
- PEAK
- MAX
- MIN
- INTERVAL
- L1
- L2
- FILTERS
- Softkey for **Meter 1 / Meter 2**

**Behavior:**

- **AVG, PEAK, MAX, MIN, FILTERS**: typically ON/OFF toggles.
- **INTERVAL**: time interval setting.
- **L1**: starts at `L01` (Up/Down adjust).
- **L2**: starts at `L80` (Up/Down adjust).
- Softkey toggles the active meter.

**Button Behavior:**

| Button      | Action                                                |
|-------------|-------------------------------------------------------|
| Up/Down     | Move between parameters                               |
| Enter       | Toggle ON/OFF or enter numeric edit                   |
| Up/Down (edit)| Adjust numeric values (interval, L1, L2, etc.)     |
| Softkey (Meter 1/2)| Toggle meter selection                         |
| ESC         | Exit edit, return to `setup_menu`                     |

---

### 6.10 Comm Set (`comms_menu`, `comms_edit`)

Fields:

- USB
- RS-232
- BAUD RATE

**Button Behavior:**

| Button      | Action                                                      |
|-------------|-------------------------------------------------------------|
| Up/Down     | Move between USB / RS-232 / BAUD RATE                       |
| Enter       | Enter edit mode for selected item (e.g., BAUD RATE)        |
| Up/Down (edit)| Cycle through available baud values (4800, 9600, 19200…) |
| ESC         | Exit edit, return to `setup_menu`                          |

---

### 6.11 Battery (`battery_menu`)

Visual:

- Battery check bars/icons (B1–B4).
- Softkeys: `ALK` and `NiMH`.

**Button Behavior:**

| Button       | Action                          |
|--------------|---------------------------------|
| Softkey 1    | Select **Alkaline (ALK)**       |
| Softkey 2    | Select **NiMH**                 |
| ESC          | Return to `setup_menu`          |

This selection can affect battery gauge behavior in real device; simulator may treat as cosmetic.

---

### 6.12 Display (`display_menu` + subs)

Fields:

- **Language**
- **Backlight**
- **Contrast**

Subscreens:

- `display_language.jpeg`
- `display_blacklight.jpeg`
- `display_contrast.jpeg`

**Button Behavior:**

| Button    | Action                                          |
|-----------|-------------------------------------------------|
| Up/Down   | Move between Language / Backlight / Contrast    |
| Enter     | Open subscreen                                  |
| ESC       | Return to `setup_menu`                          |

**Language Screen:**

- List of languages.
- **Up/Down:** change selection.
- **Enter:** confirm language.

**Backlight Screen:**

- Modes: Manual, Auto, Off.
- **Up/Down / Enter:** change mode.
- ESC returns.

**Contrast Screen:**

- Numeric or bar-like indicator.
- **Left/Right:** adjust contrast.
- **Enter** or **ESC:** finish and return.

---

## 7. Files Menu

### 7.1 Files Root Menu (`files_menu`)

Entries:

- Session Directory
- Config Directory
- Re-Name Last Ses. File
- Save Config File
- Format Card

**Button Behavior (Files Root):**

| Button     | Action                                 |
|------------|----------------------------------------|
| Up/Down    | Move highlight between entries         |
| Enter      | Open selected files function           |
| ESC        | Return to Home                         |

### 7.2 Session Directory (`files_session_dir`)

- List of stored session files.

**Button Behavior:**

| Button   | Action                                   |
|----------|------------------------------------------|
| Up/Down  | Scroll file list                         |
| Enter    | (future behavior: open, preview, etc.)   |
| ESC      | Return to `files_menu`                   |

### 7.3 Config Directory (`files_config_dir`)

Similar to Session Directory, but for config files.

### 7.4 Rename Last Session (`files_rename_last`)

- Screen for renaming the last stored session.

**Behavior:**  
Exact editing behavior not fully mapped; simulator can use generic name edit.

### 7.5 Save Config File (`files_save_config`)

- Single-action screen to save current configuration as a file.

**Button Behavior:**

| Button   | Action                  |
|----------|-------------------------|
| Enter    | Save config; then exit  |
| ESC      | Cancel and return       |

### 7.6 Format Card (`files_format_card`)

- **Important:** No separate confirmation screen is shown on the real device.
- When user selects **Format Card** and presses Enter, formatting begins immediately.

**Button Behavior:**

| Button   | Action                                          |
|----------|-------------------------------------------------|
| Enter    | Immediately format card (irreversible)          |
| ESC      | If still on menu, cancels format selection      |

### 7.7 Delete Confirm (`files_delete_confirm`)

- Used when deleting a file.
- Shows confirmation prompt (YES/NO style).

**Button Behavior:**

| Button   | Action                      |
|----------|-----------------------------|
| Left/Right or Up/Down | Move between YES/NO |
| Enter    | Confirm choice               |
| ESC      | Treat as NO (cancel)         |

---

## 8. Lock Menu (`lock_menu`)

- Accessed from Home via LOCK softkey.
- Locks user input.

**Button Behavior:**

| Button   | Action                                            |
|----------|---------------------------------------------------|
| ESC      | Unlock / return to Home                           |
| Others   | No action (treated as locked)                     |

In simulator, this can disable all other inputs until ESC.

---

## 9. Calibration (`cal_menu`, `cal_running`)

### 9.1 Calibration Menu (`cal_menu`)

- Access from Home via CAL softkey.
- Shows calibration history line(s): Pre-Cal values, timestamps.
- One option to **CALIBRATE**.

**Button Behavior:**

| Button   | Action                                   |
|----------|------------------------------------------|
| Up/Down  | Move highlight (if multiple lines)       |
| Enter    | Start calibration sequence               |
| ESC      | Return to Home                           |

### 9.2 Calibration Running (`cal_running`)

- Title area indicates **PRE-CAL**.
- Shows live SPL (e.g., 85.2 dB LZS).

**Button Behavior:**

| Button   | Action                               |
|----------|--------------------------------------|
| Enter    | Log calibration (Pre-Cal) and exit   |
| ESC      | Cancel calibration                   |

After Enter logs the value, device returns to Home.

---

## 10. Alerts (Deferred)

These behaviors are expected, but final details depend on capturing screens:

- **Low Battery**: likely appears as overlay; simulation can show `low_battery` state.
- **SD Missing**: warns that logging/format/save cannot be used without card.
- **Memory Full**: prevents new logs until space freed.
- **Invalid Action**: for operations not allowed in current mode.

**Button Behavior (generic for alerts):**

| Button   | Action                 |
|----------|------------------------|
| ESC      | Dismiss alert          |
| Others   | Possibly no effect     |

---

## 11. Navigation Summary & Notes for Implementation

- Home uses internal **highlightIndex 1–5**; default 2 (View Current Study).
- Home softkeys:
  - SLM: cycles `ctx.slmModeLabel` (SLM / 1/1 / 1/3).
  - CAL: to Calibration.
  - FILE: to Files.
  - LOCK: to Lock.
- SLM has two conceptual dimensions:
  - **Mode**: numeric, 1/1, 1/3
  - **Page**: 1–4
  - **Run state**: running, paused, stopped
- Meter Set’s **Threshold**:
  - Enter cycles dB ↔ OFF without leaving edit mode.
  - Left always returns focus to label; Right is no-op.
- Auto-Run mode order is always:
  - Disabled → Timed Run → DOW → Date → Level-Triggered → Disabled
- Digital Out, Logging, Comm Set, Display all have straightforward highlight/edit patterns:
  - Up/Down to move.
  - Enter to toggle or edit.
  - Left/Right where multi-field.
  - ESC to back out.

---

## 12. Revision Log

| Date       | Version | Notes                                                                 |
|------------|---------|-----------------------------------------------------------------------|
| 2025-11-10 | 2.5     | Consolidated full menu + behavior map from live device observations. |
| 2025-11-11 | 2.5.1   | Added detailed Auto-Run Timed Run / DOW / Date / Level-Triggered flow.|
| 2025-11-12 | 2.5.2   | Updated Meter Set edit behavior (Threshold dB/Off, Left/Right rules).|
| 2025-11-13 | 2.5.3   | Added per-screen button behavior tables and full SLM multi-page views.|