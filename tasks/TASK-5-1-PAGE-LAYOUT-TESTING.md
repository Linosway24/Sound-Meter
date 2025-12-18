# Task 5.1: SLM Page Layout Visual Testing

## Prerequisites
- Device powered on
- Start a measurement (press RUN from home screen)
- Navigate to SLM screen

---

## Test 1: Page 1 (Unchanged - Baseline)
**Steps:**
1. From SLM screen, ensure you're on Page 1 (press UP/DOWN to cycle if needed)

**Expected:**
- [ x] Status bar with battery, play/pause icon, timer (00:00:XX)
- [ x] Bar graph with -20 to 70 scale
- [ x] Large dB readout (updating values)
- [ x] Softkeys: VIEW | F-S-I | R-C-Z-F | METER 1

**Pass/Fail:** [x ]

---

## Test 2: Page 2 (Dose/Statistics Table)
**Steps:**
1. From Page 1, press DOWN (or ENTER) to go to Page 2

**Expected Layout:**
- [ x] Status bar with battery, play/pause icon, timer
- [ x] Data table with 4 rows, 2 columns:
  - Row 1: MAX __ dB | DOSE __ %
  - Row 2: AVG __ dB | PDSE __ %
  - Row 3: TWA __ dB | PTWA __ dB
  - Row 4: OL __ % | SEL __ dB
- [ x] Softkeys: SHOW | F-S-I | A-C-Z-F | METER 1

**Expected Values:**
- [ x] MAX shows a value (from measurement.lmax)
- [ x] AVG shows a value (from measurement.leq)
- [x x] OL shows 0.0 % or similar
- [ ] Other fields show `--.- dB` or `--.- %` (not yet calculated)

**Pass/Fail:** [x ]

---

## Test 3: Page 3 (Run Summary Screen)
**Steps:**
1. From Page 2, press DOWN (or ENTER) to go to Page 3

**Expected Layout:**
- [ ] Status bar with battery, play/pause icon, timer (UR 00:00:XX)
- [ ] Data table with 5 rows, 2 columns:
  - Row 1: MAX --.- dB | DOSE --.-%
  - Row 2: AVG --.- dB | PDSE --.-%
  - Row 3: TWA --.- dB | PTWA --.- dB
  - Row 4: OL --.- % | SEL --.- dB
  - Row 5: EXP --- P2s | UL 00:00:00
- [ ] Softkeys: OWS-1 | F-S-I | A-C-Z-F | METER 1

**Expected Values (stopped/initial):**
- [ ] MAX shows --.- dB
- [ ] AVG shows --.- dB
- [ ] TWA shows --.- dB
- [ ] OL shows .00 % or --.- %
- [ ] DOSE shows --.-%
- [ ] PDSE shows --.-%
- [ ] PTWA shows --.- dB
- [ ] SEL shows --.- dB
- [ ] EXP shows --- P2s
- [ ] UL shows 00:00:00

**Expected Values (running):**
- [ ] MAX shows measured value (e.g., 18.2 dB)
- [ ] Other values populate as measurement progresses

**Pass/Fail:** [ ]

---

## Test 4: Page 4 (Time History Graph)
**Steps:**
1. From Page 3, press DOWN (or ENTER) to go to Page 4

**Expected Layout:**
- [ ] Status bar with battery, play/pause icon, timer
- [ ] Y-axis labels on left: 70, 30, -10, "dB SEG"
- [ ] Graph area with dotted grid lines
- [ ] Line graph showing SPL history (if measurement running)
- [ ] Softkeys: SHOW | F-S-I | A-C-Z-F | METER 1

**Expected Behavior:**
- [ ] Graph line updates in real-time as measurement runs
- [ ] Line moves from left to right as samples accumulate
- [ ] Y position reflects current SPL level

**Pass/Fail:** [ ]

---

## Test 5: Page Cycling
**Steps:**
1. From Page 4, press DOWN to cycle back to Page 1
2. Press UP to go back to Page 4

**Expected:**
- [ ] Pages cycle: 1 → 2 → 3 → 4 → 1 (DOWN)
- [ ] Pages cycle: 1 → 4 → 3 → 2 → 1 (UP)

**Pass/Fail:** [ ]

---

## Test 6: Pause/Resume on Each Page
**Steps:**
1. On each page (2, 3, 4), press RUN to pause
2. Verify layout remains correct
3. Press RUN to resume

**Expected:**
- [ ] Page 2 layout unchanged when paused
- [ ] Page 3 layout unchanged when paused
- [ ] Page 4 graph stops updating when paused, resumes when running

**Pass/Fail:** [ ]

---

## Summary

| Test | Description | Pass/Fail |
|------|-------------|-----------|
| 1 | Page 1 baseline | [ ] |
| 2 | Page 2 data table | [ ] |
| 3 | Page 3 percentile table | [ ] |
| 4 | Page 4 time history | [ ] |
| 5 | Page cycling | [ ] |
| 6 | Pause/resume | [ ] |

---

## Notes
- Most Page 2/3 values will show `--.-` because the Measurement module doesn't calculate those yet
- MAX, AVG (Leq), and OL should show real values
- Page 4 graph requires the measurement to be running to see the line

---

# 1/3 Octave Mode Screens

To access: Press SOFT1 to cycle SLM → 1/1 → 1/3

---

## Test 7: 1/3 Octave - Time History Graph
**Steps:**
1. Press SOFT1 until in 1/3 Octave mode
2. Navigate to Time History page

**Expected Layout:**
- [ ] Status bar with battery, play/pause icon, timer (UR 00:00:XX)
- [ ] Top row: 125Hz label, value (e.g., -4.7 dB), Lp/Lf label, value (e.g., 18.7 dB)
- [ ] Y-axis labels: 70, 50, 30, 10
- [ ] Bar chart showing frequency spectrum
- [ ] Softkeys: OWS-1 | F-S-I | A-C-Z-F | METER 1

**Expected Values (stopped/initial):**
- [ ] Values show --.- dB

**Expected Values (running):**
- [ ] Bar chart updates with frequency data
- [ ] dB values update in real-time

**Pass/Fail:** [ ]

---

## Test 8: 1/3 Octave - Frequency Band Table
**Steps:**
1. From 1/3 Octave mode, navigate to frequency table page

**Expected Layout:**
- [ ] Status bar with battery, play/pause icon, timer (UR 00:00:XX)
- [ ] Left side indicator: 1+Lzf, METER 1
- [ ] Data table with 6 rows, 2 columns:
  - Row 1: 12.5Hz --.- dB | 40Hz --.- dB
  - Row 2: 16Hz --.- dB | 50Hz --.- dB
  - Row 3: 20Hz --.- dB | 63Hz --.- dB
  - Row 4: 25Hz --.- dB | 80Hz --.- dB
  - Row 5: 31.5Hz --.- dB | 100Hz --.- dB
  - Row 6: (blank) | 125Hz --.- dB
- [ ] Softkeys: OWS-1 | F-S-I | A-C-Z-F | METER 1

**Expected Values (stopped/initial):**
- [ ] All frequency values show --.- dB

**Expected Values (running):**
- [ ] Values populate (e.g., 12.5Hz -18.3, 16Hz -20.0, etc.)

**Pass/Fail:** [ ]

---

## Test 9: 1/3 Octave - Run Summary
**Steps:**
1. From 1/3 Octave mode, navigate to run summary page

**Expected Layout:**
- [ ] Status bar with battery, play/pause icon, timer (UR 00:00:XX)
- [ ] Data table with 5 rows, 2 columns:
  - Row 1: MAX --.- dB | DOSE --.-%
  - Row 2: AVG --.- dB | PDSE --.-%
  - Row 3: TWA --.- dB | PTWA --.- dB
  - Row 4: OL --.- % | SEL --.- dB
  - Row 5: EXP --- P2s | UL 00:00:00
- [ ] Softkeys: OWS-1 | F-S-I | A-C-Z-F | METER 1

**Expected Values (stopped/initial):**
- [ ] MAX shows --.- dB
- [ ] AVG shows --.- dB
- [ ] TWA shows --.- dB
- [ ] OL shows .00 %
- [ ] All DOSE/PDSE/PTWA/SEL show --.-

**Expected Values (running):**
- [ ] MAX shows measured value (e.g., 18.2 dB)

**Pass/Fail:** [ ]

---

## Test 10: 1/3 Octave - Percentile Statistics
**Steps:**
1. From 1/3 Octave mode, navigate to percentile page

**Expected Layout:**
- [ ] Status bar with battery, play/pause icon, timer (UR 00:00:XX)
- [ ] Data table with 5 rows:
  - Row 1: L01 --.- dB | L10 --.- dB
  - Row 2: L50 --.- dB | L90 --.- dB
  - Row 3: LDN --.- dB | CNEL --.- dB
  - Row 4: OL --.- % | TK3 --.- dB
  - Row 5: Lc-a --.- dB | (empty)
- [ ] Softkeys: OWS-1 | F-S-I | A-C-Z-F | METER 1

**Expected Values (stopped/initial):**
- [ ] All percentile values show --.- dB
- [ ] OL shows .00 %

**Expected Values (running after ~14 seconds):**
- [ ] L50, L90 start showing values (e.g., 18.2 dB, 18.1 dB)
- [ ] TK3 shows value (e.g., 18.4 dB)
- [ ] L01, L10, LDN, CNEL may still show --.- (need more data)

**Pass/Fail:** [ ]

