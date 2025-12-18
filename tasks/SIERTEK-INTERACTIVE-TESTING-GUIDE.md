# SIERTEK Interactive Testing Guide

Based on: `Documents/SIERTEK Info.pdf`

This guide tests all 5 SIERTEK Interactive scenarios to ensure the simulator supports instructor-led demonstrations.

---

## Sound Simulation Setup

### Option 1: Audio Playback with Automatic Simulator Settings (Recommended)

Use the Audio module to play sounds AND automatically configure the simulator:

```javascript
// List all available presets
window.Audio.listPresets();

// Play preset sounds (also sets simulator levels)
window.Audio.playPreset('fan');        // Steady fan/HVAC (65 dB, ±2)
window.Audio.playPreset('engine');     // Engine idle (75 dB, ±3)
window.Audio.playPreset('hammering');  // Intermittent impacts (85 dB, ±15)
window.Audio.playPreset('machinery');  // Industrial equipment (90 dB, ±8)
window.Audio.playPreset('office');     // Quiet office (50 dB, ±3)
window.Audio.playPreset('calibration'); // 1kHz tone (114 dB)

// Control playback
window.Audio.stop();                   // Stop audio
window.Audio.pause();                  // Pause audio
window.Audio.resume();                 // Resume audio
window.Audio.setVolume(0.5);           // Set volume (0-1)
```

**Note:** Audio files must be added to `assets/audio/` directory. See `assets/audio/README.md` for sources.

### Option 2: Simulator Only (No Audio)

If audio files aren't available, manually set simulator levels:

```javascript
// Steady sound (fan/engine) - low variation
window.Simulator.setBaseLevel(75);
window.Simulator.setVariation(2);

// Intermittent bursts (hammering/claps) - high variation
window.Simulator.setBaseLevel(85);
window.Simulator.setVariation(15);

// Quiet environment
window.Simulator.setBaseLevel(45);
window.Simulator.setVariation(3);

// Loud industrial
window.Simulator.setBaseLevel(95);
window.Simulator.setVariation(8);
```

---

# SIERTEK Interactive 1: SLM SETUP

## Objective
Configure the SLM for standard noise measurement per OSHA guidelines.

### Test Steps

#### Step 1: Power On
**Action:** Press On/Off button (long press)
**Expected:**
- [ ] Device powers on
- [ ] Home screen displays "START" menu
- [ ] Battery icon visible in status bar

**Pass/Fail:** [ ]

---

#### Step 2: Check Battery
**Action:** Observe battery icon in status bar
**Expected:**
- [ ] Battery icon shows current level
- [ ] Green = >50%, Yellow = 20-50%, Red = <20%

**Pass/Fail:** [ ]

---

#### Step 3: Set Range Capacity to 140 dB
**Action:** 
1. From home screen, press DOWN to select "SETUP"
2. Press ENTER
3. Press DOWN to select "SIG INPUT"
4. Press ENTER
5. Press DOWN to select "RANGE CAP"
6. Press ENTER
7. Verify value is 140 dB (or use UP/DOWN to adjust)
8. Press ENTER to confirm
9. Press ESC to return

**Expected:**
- [ ] SETUP menu accessible
- [ ] SIG INPUT submenu accessible
- [ ] RANGE CAP shows 140 dB (default)
- [ ] Can navigate back with ESC

**Pass/Fail:** [ ]

---

#### Step 4: Configure Meter 1 - Frequency Weighting A
**Action:**
1. Navigate to SLM screen (select "VIEW SESSION" from home)
2. Press SOFT3 (A-C-Z-F) to cycle to "A" weighting

**Expected:**
- [ ] Weighting cycles: R → C → Z → F → R
- [ ] Current weighting shown with underline in softkey label
- [ ] "A" weighting selectable (note: R maps to A internally)

**Pass/Fail:** [ ]

---

#### Step 5: Configure Meter 1 - Time Response Slow
**Action:** Press SOFT2 (F-S-I) to cycle to "S" (Slow)

**Expected:**
- [ ] Time constant cycles: F → S → I → F
- [ ] Current selection shown with underline
- [ ] "S" (Slow) selectable

**Pass/Fail:** [ ]

---

#### Step 6: Set Meter Limits
**Action:**
1. Navigate to SETUP → METER SET
2. Verify/set these values:
   - Threshold: 80 dB
   - Exchange Rate: 3 dB
   - Criterion Level: 85 dB
   - Upper Limit: 115 dB
   - Projected Time: 8 Hr

**Expected:**
- [ ] METER SET menu accessible
- [ ] Threshold adjustable (default or set to 80 dB)
- [ ] Exchange Rate shows 3 dB
- [ ] Criterion Level adjustable (default or set to 85 dB)
- [ ] Upper Limit adjustable (default or set to 115 dB)
- [ ] Projected Time shows 8 Hr

**Pass/Fail:** [ ]

---

# SIERTEK Interactive 2: Fast Response vs Slow Response

## Objective
Demonstrate difference between Slow and Fast time response.

### Pre-Test Setup
In browser console, prepare sound simulations:
```javascript
// Save original settings
window._originalBase = window.Simulator.getState().baseLevel;
window._originalVar = window.Simulator.getState().variation;
```

---

### Step 1: Slow Response with Steady Sound

**Setup (with audio):**
```javascript
window.Audio.playPreset('fan');  // or 'engine'
```

**Setup (without audio):**
```javascript
window.Simulator.setBaseLevel(75);
window.Simulator.setVariation(2);
```

**Action:**
1. Navigate to SLM screen
2. Set weighting to A (press SOFT3)
3. Set time response to S (Slow) - press SOFT2
4. Start measurement (press RUN)
5. Observe readings for 10-15 seconds

**Expected:**
- [ ] Numbers move slowly
- [ ] Readings stay stable (within ±2-3 dB)
- [ ] Good for showing average exposure

**Pass/Fail:** [ ]

---

### Step 2: Fast Response with Burst Sound

**Setup (with audio):**
```javascript
window.Audio.playPreset('hammering');  // or 'clapping'
```

**Setup (without audio):**
```javascript
window.Simulator.setBaseLevel(85);
window.Simulator.setVariation(15);
```

**Action:**
1. Set weighting to Z (press SOFT3 to cycle)
2. Set time response to F (Fast) - press SOFT2
3. Observe readings for 10-15 seconds

**Expected:**
- [ ] Numbers change rapidly
- [ ] Readings climb quickly to catch spikes
- [ ] Shows sudden bursts/peaks
- [ ] More variation visible than Slow response

**Pass/Fail:** [ ]

---

### Cleanup
```javascript
// Stop audio and restore original settings
window.Audio.stop();
window.Simulator.setBaseLevel(window._originalBase || 70);
window.Simulator.setVariation(window._originalVar || 5);
```

---

# SIERTEK Interactive 3: Pre & Post Calibration

## Objective
Perform pre-calibration and post-calibration checks.

### Activity 1: Pre-Calibration

#### Step 1: Access Calibration Menu
**Action:** Press SOFT2 (CAL) from home screen

**Expected:**
- [ ] Calibration menu opens
- [ ] Last calibration date/time displayed (if available)

**Pass/Fail:** [ ]

---

#### Step 2: Enter Calibration Mode
**Action:** Press ENTER to go into calibration mode

**Expected:**
- [ ] Calibration screen displayed
- [ ] Instructions or calibration interface shown

**Pass/Fail:** [ ]

---

#### Step 3: Calibration Adjustment
**Action:**
1. (Physical: Set calibrator to 1000 Hz, 114 dB and attach to mic)
2. Wait 10 seconds for reading to stabilize
3. Use UP/DOWN buttons to adjust until reading = 114 dB
4. Press ENTER to log calibration

**Expected:**
- [ ] UP/DOWN adjusts calibration value
- [ ] Can set to 114 dB
- [ ] ENTER confirms/logs calibration

**Pass/Fail:** [ ]

---

### Activity 2: Post-Calibration

#### Step 1: Access Calibration
**Action:** Press CAL button

**Expected:**
- [ ] Calibration screen accessible
- [ ] Previous calibration data shown

**Pass/Fail:** [ ]

---

#### Step 2: Verify Post-Cal Reading
**Action:** Observe reading (with calibrator attached)

**Expected:**
- [ ] Reading should automatically show ~114 dB (±0.5%)
- [ ] No manual adjustment needed for post-cal

**Pass/Fail:** [ ]

---

# SIERTEK Interactive 4: Recording Documentation

## Objective
View and record measurement data from a completed study.

### Step 1: Access Current Study
**Action:** From Start Menu, select "VIEW CURRENT STUDY"

**Expected:**
- [ ] Measurement starts or continues
- [ ] SLM screen displayed

**Pass/Fail:** [ ]

---

### Step 2: Access View Menu
**Action:** Press SOFT1 (VIEW or eyeglass symbol)

**Expected:**
- [ ] View menu opens
- [ ] Options to select different metrics

**Pass/Fail:** [ ]

---

### Step 3: Select L_Avg (Meter 1)
**Action:** Navigate to and select L_Avg

**Expected:**
- [ ] L_Avg value displayed
- [ ] Value represents average sound level (Leq)

**Pass/Fail:** [ ]

---

### Step 4: Record Value
**Action:** Note the L_Avg reading

**Recorded Value:** ________ dB

**Pass/Fail:** [ ]

---

# SIERTEK Interactive 5: Performing Octave Band Analysis

## Objective
Perform 1/1 octave band analysis for hearing protection calculations.

### Step 1: Power On
**Action:** Press Power Button

**Expected:**
- [ ] Device powers on

**Pass/Fail:** [ ]

---

### Step 2: Select Measurement Mode (1/1 Octave)
**Action:** Press SOFT1 to toggle SLM → 1/1 → 1/3

**Expected:**
- [ ] Mode cycles: SLM → 1/1 → 1/3 → SLM
- [ ] Select 1/1 for octave band analysis

**Pass/Fail:** [ ]

---

### Step 3: Set Frequency Weighting to Z
**Action:** Press SOFT3 to cycle to Z weighting

**Expected:**
- [ ] Z weighting selected (flat/linear reading)
- [ ] dB(Z) = all-pass measurement

**Pass/Fail:** [ ]

---

### Step 4: Set Time Response to Fast
**Action:** Press SOFT2 to set to F (Fast)

**Expected:**
- [ ] Fast response selected

**Pass/Fail:** [ ]

---

### Step 5: Start Measurement
**Action:** Press RUN/Play button

**Expected:**
- [ ] Measurement begins
- [ ] Octave band data displayed
- [ ] Can navigate through bands with arrows

**Pass/Fail:** [ ]

---

### Step 6: Record Octave Band Readings
**Action:** Navigate through octave bands and record values

| Frequency | dB(Z) Reading |
|-----------|---------------|
| 125 Hz    |               |
| 250 Hz    |               |
| 500 Hz    |               |
| 1000 Hz   |               |
| 2000 Hz   |               |
| 4000 Hz   |               |
| 8000 Hz   |               |

**Pass/Fail:** [ ]

---

### Step 7: Stop Measurement
**Action:** Press STOP button

**Expected:**
- [ ] Measurement stops
- [ ] Data preserved for review

**Pass/Fail:** [ ]

---

### Step 8: Post-Measurement Calibration Check
**Action:** Press CAL and verify calibration

**Expected:**
- [ ] Calibration check accessible
- [ ] Reading within tolerance

**Pass/Fail:** [ ]

---

# Summary

| Interactive | Description | Pass/Fail |
|-------------|-------------|-----------|
| 1 | SLM Setup | [ ] |
| 2 | Fast vs Slow Response | [ ] |
| 3 | Pre & Post Calibration | [ ] |
| 4 | Recording Documentation | [ ] |
| 5 | Octave Band Analysis | [ ] |

---

## Console Commands Reference

```javascript
// Sound Simulation Presets
// Steady sound (fan/engine)
window.Simulator.setBaseLevel(75);
window.Simulator.setVariation(2);

// Intermittent bursts (hammering)
window.Simulator.setBaseLevel(85);
window.Simulator.setVariation(15);

// Quiet office
window.Simulator.setBaseLevel(50);
window.Simulator.setVariation(3);

// Loud machinery
window.Simulator.setBaseLevel(95);
window.Simulator.setVariation(8);

// Check current state
window.Simulator.getState();

// Check FSM state
window.getMainFSMState();
```

---

## Notes

- The simulator generates deterministic SPL values based on a seed
- `setBaseLevel()` sets the average sound level
- `setVariation()` sets how much the level fluctuates
- Low variation (2-3 dB) = steady sound
- High variation (10-15 dB) = intermittent/impulsive sound
- For real training, consider adding actual audio playback to accompany the simulation

