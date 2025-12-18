# Task 6.0 Testing Guide - Display Enhancements & Formatting

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Task 6.0 - Display Enhancements & Formatting

---

## Test 1: Battery Indicator Display

### 1.1: Battery Icon Visible
**Test:** Navigate to SLM screen and observe status bar
**Expected:**
- [ ] Battery icon visible in status bar (left side)
- [ ] Battery shows as filled rectangle with color

**Pass/Fail:** [x ]

---

### 1.2: Battery Level Colors
**Test:** In browser console, manually set battery levels and observe:
```javascript
// Set battery to full (green)
window.getMainFSMState().battery.level = 100;
window.dispatchMainFSMAction({ type: 'RUNPAUSE' }); // Trigger re-render

// Set battery to medium (yellow)
window.getMainFSMState().battery.level = 35;
window.dispatchMainFSMAction({ type: 'RUNPAUSE' });

// Set battery to low (red)
window.getMainFSMState().battery.level = 15;
window.dispatchMainFSMAction({ type: 'RUNPAUSE' });
```

**Expected:**
- [ ] >50%: Green battery color
- [ ] 20-50%: Yellow/amber battery color
- [ ] <20%: Red battery color

**Pass/Fail:** [ ]

---

### 1.3: Battery Drain During Measurement
**Test:**
1. Start a measurement (press RUN)
2. Note initial battery level: `window.getMainFSMState().battery.level`
3. Wait 60 seconds
4. Check battery level again

**Expected:**
- [ ] Battery level decreases over time
- [ ] Drain rate approximately 0.00347% per second (100% over 8 hours)

**Pass/Fail:** [ ]

---

### 1.4: Battery Drain Faster with Backlight ON
**Test:**
1. Reset battery: `window.getMainFSMState().battery.level = 100`
2. Turn backlight ON (press backlight button)
3. Start measurement and wait 60 seconds
4. Note drain amount
5. Reset battery, turn backlight OFF
6. Start measurement and wait 60 seconds
7. Compare drain amounts

**Expected:**
- [ ] Backlight ON drains ~10% faster than backlight OFF

**Pass/Fail:** [ ]

---

## Test 2: Measurement Value Formatting

### 2.1: Null Values Display as "--.-"
**Test:**
1. Navigate to SLM Page 2 (Dose/Statistics) when measurement is stopped
2. Observe values that haven't been calculated yet

**Expected:**
- [ ] Uncalculated values show `--.- dB` or `--.- %`
- [ ] NOT showing `- - -.- dB` or blank

**Pass/Fail:** [ ]

---

### 2.2: Decimal Precision
**Test:**
1. Start a measurement
2. Navigate to SLM Page 2
3. Observe MAX, AVG values

**Expected:**
- [ ] Values display with exactly 1 decimal place (e.g., `18.2 dB`)
- [ ] No excessive decimals (e.g., NOT `18.234567 dB`)

**Pass/Fail:** [ ]

---

### 2.3: Zero Values Display Correctly
**Test:**
1. Start measurement
2. Check OL (Overload) percentage

**Expected:**
- [ ] OL shows `0.0 %` or `.00 %` (not `--.- %`)
- [ ] Zero is displayed, not treated as null

**Pass/Fail:** [ ]

---

## Test 3: Status Bar Elements

### 3.1: Status Bar Layout
**Test:** Navigate to any SLM screen

**Expected:**
- [ ] Battery icon on left
- [ ] Play/Pause/Stop icon in middle-left
- [ ] Timer (UR 00:00:XX) on right
- [ ] All elements properly aligned

**Pass/Fail:** [ ]

---

### 3.2: Play/Pause/Stop Icons
**Test:**
1. Start measurement - observe icon
2. Pause measurement - observe icon
3. Stop measurement - observe icon

**Expected:**
- [ ] Running: ▶ (play icon)
- [ ] Paused: ⏸ (pause icon)
- [ ] Stopped: ■ (stop icon)

**Pass/Fail:** [ ]

---

## Test 4: Configuration Display (SLM Softkeys)

### 4.1: Weighting Display
**Test:** On SLM screen, observe SOFT3 label

**Expected:**
- [ ] Shows current weighting with underline (e.g., `A-C-Z-F` with current selection underlined)

**Pass/Fail:** [ ]

---

### 4.2: Time Constant Display
**Test:** On SLM screen, observe SOFT2 label

**Expected:**
- [ ] Shows `F-S-I` with current selection underlined

**Pass/Fail:** [ ]

---

### 4.3: Meter Display
**Test:** On SLM screen, observe SOFT4 label

**Expected:**
- [ ] Shows `METER 1` (or current meter number)

**Pass/Fail:** [ ]

---

## Test 5: Measurement Labels

### 5.1: Page 2 Labels Match Firmware
**Test:** Navigate to SLM Page 2

**Expected Labels:**
- [ ] MAX (not "Maximum")
- [ ] AVG (not "Average" or "Leq")
- [ ] TWA
- [ ] OL (Overload percentage)
- [ ] DOSE
- [ ] PDSE
- [ ] PTWA
- [ ] SEL

**Pass/Fail:** [ ]

---

### 5.2: Page 3 Labels Match Firmware
**Test:** Navigate to SLM Page 3 (Run Summary)

**Expected Labels:**
- [ ] Same as Page 2 layout
- [ ] EXP (Exposure in P2s)
- [ ] UL (Underload time)

**Pass/Fail:** [ ]

---

### 5.3: Page 4 Labels Match Firmware (Percentile)
**Test:** Navigate to SLM Page 4 (Percentile Statistics)

**Expected Labels:**
- [ ] L01, L10
- [ ] L50, L90
- [ ] LDN, CNEL
- [ ] OL, TK3
- [ ] Lc-a

**Pass/Fail:** [ ]

---

## Summary

| Test | Description | Pass/Fail |
|------|-------------|-----------|
| 1.1 | Battery icon visible | [ ] |
| 1.2 | Battery level colors | [ ] |
| 1.3 | Battery drain during measurem  ent | [ ] |
| 1.4 | Faster drain with backlight | [ ] |
| 2.1 | Null values as "--.-" | [ ] |
| 2.2 | Decimal precision | [ ] |
| 2.3 | Zero values display | [ ] |
| 3.1 | Status bar layout | [ ] |
| 3.2 | Play/Pause/Stop icons | [ ] |
| 4.1 | Weighting display | [ ] |
| 4.2 | Time constant display | [ ] |
| 4.3 | Meter display | [ ] |
| 5.1 | Page 2 labels | [ ] |
| 5.2 | Page 3 labels | [ ] |
| 5.3 | Page 4 labels | [ ] |

---

## Notes
- Battery drain is very slow by design (8 hours to empty)
- To test battery drain faster, you can modify the drain rate in browser console
- Backlight state affects drain rate (10% faster when ON)

