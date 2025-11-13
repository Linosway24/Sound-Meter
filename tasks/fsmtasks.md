# Cursor Task Plan — Quest SoundPro SE-DL Interactive FSM

## Objective
Implement the full finite state machine and user interface for the SoundPro SE-DL interactive simulator (Firmware R.13J) using the `FSM-spec-v1.md` and `Menu-Structure-v2.5.md` documents as reference.

---

## Tasks

### 1. Base Framework Setup
- [ ] Create FSM core file (mainFSM.js or mainFSM.ts)
- [ ] Load config flags and constants
- [ ] Implement image loader using file IDs from Menu-Structure-v2.5.md
- [ ] Verify backlight toggle behavior

### 2. Home Cluster
- [ ] Implement highlight navigation (Up/Down/Enter)
- [ ] Wire softkeys: SLM → CAL → FILE → LOCK
- [ ] Implement SLM label cycle logic (SLM → 1/1 → 1/3 → SLM)
- [ ] Verify timer and status icon updates

### 3. SLM Operation
- [ ] Create orthogonal states (pages + runningState)
- [ ] Implement Left/Right to cycle measurement unit/view
- [ ] Add Stop countdown overlay (stop_confirm)
- [ ] Connect pause/resume transitions

### 4. Setup Cluster
- [ ] Implement all menus (Measure, Meter Set, Auto-Run, etc.)
- [ ] Add per-parameter edit logic (Enter, Left, Right behavior)
- [ ] Integrate softkeys for Meter Set (F/S/I, R/C/Z/F, Meter1/2)

### 5. Auto-Run Submodes
- [ ] Cycle order: Disabled → Timed Run → DOW → Date → Level-Triggered
- [ ] Implement sub-screens per FSM spec
- [ ] Handle softkey toggles and “+/-” state reflection

### 6. Files, Lock, Calibration
- [ ] Add File menu transitions (Format executes immediately)
- [ ] Implement Lock screen (ESC to unlock)
- [ ] Add Calibration flow (History → Pre-Cal → Log)

### 7. Final Integration & Test
- [ ] Run through Test Matrix in FSM-spec-v1.md
- [ ] Ensure visual consistency with Menu-Structure-v2.5.md assets
- [ ] Validate against photo references

---

## Deliverables
1. **mainFSM.js / mainFSM.ts** — working state machine
2. **FSM-spec-v1.md** — reference logic map
3. **Menu-Structure-v2.5.md** — asset & screen reference
