# Quest SoundPro SE-DL Menu Structure Review Document

**Firmware:** R.13J  
**Status:** DRAFT - AWAITING USER REVIEW  
**Created:** October 2025  
**Purpose:** Review and verify menu structure against physical device before implementation

---

## 📋 Review Instructions

**PLEASE REVIEW THIS DOCUMENT AGAINST YOUR PHYSICAL QUEST SOUNDPRO SE-DL DEVICE:**

1. Power on the device and navigate through all menus
2. Verify menu item labels match exactly (spelling, capitalization, punctuation)
3. Verify menu item order matches device display order
4. Verify soft key labels (1-4) for each menu screen
5. Test Alt f functionality for each menu (if applicable)
6. Verify dialog text matches device exactly
7. Note any missing menus, items, or dialogs
8. Provide corrections in the "User Corrections" section at the end

**❓ Marked items:** Items marked with "❓" or "VERIFY" need special attention or may be uncertain based on documentation review.

---

## 🏠 Startup Screen (Home Screen)

**Menu ID:** `startup`  
**Title:** Startup Screen  
**Parent Menu:** None (root screen)

**Description:** First screen displayed after power-on startup - this IS the main home screen.

**Menu Title/Header:** `START` (not selectable - header only)
**Title Separator:** Line under START header separating title from menu items

**Menu Items (selectable items):**
1. VIEW PAST STUDIES ← **Selected/highlighted** (dotted outline)
2. VIEW CURRENT STUDY
3. VIEW SESSION
4. SETUP
5. UNIT INFO

**Soft Key Labels (bottom of LCD):**
- **Soft Key 1:** `<SLM>` (with arrows indicator - highlighted/selected)
- **Soft Key 2:** `CAL`
- **Soft Key 3:** `FILE`
- **Soft Key 4:** `LOCK`

**Layout:** Displayed horizontally at bottom of LCD, separated by vertical bars (|)

**Top Status Bar:**
- Battery indicator (full charge - multiple bars)
- Right arrow indicator
- Solid square indicator

**Bottom Status Bar:**
- `<SLM>` | `CAL` | `FILE` | `LOCK` (these ARE the soft key labels)

**Navigation Method:**
- **Up/Down Arrow Buttons:** Move selection highlight through menu items
- **Enter Button:** Selects the highlighted/selected menu item
- **Esc/Power Button (short press):** Goes back to previous screen
- **Soft Keys:** Context-dependent actions based on labels shown at bottom

**Alt f Soft Keys:** ❓ Verify if Alt f works on startup screen

**Notes:** 
- ✅ CONFIRMED: Navigation method - Up/Down arrows move selection, Enter selects
- ✅ CONFIRMED: Soft key labels are `<SLM>`, `CAL`, `FILE`, `LOCK` at bottom of LCD
- ❓ VERIFY: What happens when each soft key button is pressed?
- ❓ VERIFY: What does `<SLM>` do? (Sound Level Meter mode?)
goo
---

## 📱 Main Menu

**Menu ID:** `main`  
**Title:** Main Menu  
**Parent Menu:** `home`

**Description:** Top-level menu accessed from home screen via soft key or menu button.

**Menu Items:**

1. **Measurement**
   - **ID:** `measurement`
   - **Label:** `Measurement` ❓ (verify exact text - may be "Measure" or similar)
   - **Order:** 1
   - **Sub-menu:** `measurement_menu`
   - **Soft Key:** 1
   - **Action:** Navigate to measurement menu
   - **Notes:** Verify exact label text

2. **Settings**
   - **ID:** `settings`
   - **Label:** `Settings`
   - **Order:** 2
   - **Sub-menu:** `settings_menu`
   - **Soft Key:** 2
   - **Action:** Navigate to settings menu
   - **Notes:** Configuration and device settings

3. **Calibration**
   - **ID:** `calibration`
   - **Label:** `Calibration`
   - **Order:** 3
   - **Sub-menu:** `calibration_menu`
   - **Soft Key:** 3
   - **Action:** Navigate to calibration menu
   - **Notes:** Device calibration procedures

4. **Data Logging**
   - **ID:** `data_logging`
   - **Label:** `Data Logging` ❓ (verify exact label - may be "Logging" or "Data Log")
   - **Order:** 4
   - **Sub-menu:** `logging_menu`
   - **Soft Key:** 4
   - **Action:** Navigate to data logging menu
   - **Notes:** Verify label and if this is separate from measurement menu

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Measurement)
- **Soft Key 2:** `Select` (for Settings)
- **Soft Key 3:** `Select` (for Calibration)
- **Soft Key 4:** `Select` (for Data Logging)

**Alt f Soft Keys:** ❓ Verify if main menu has Alt f functionality

**Notes:**
- ❓ Verify all menu items are listed (may have more/less items)
- ❓ Verify menu item order matches device
- ❓ Verify soft key labels match device exactly
- ❓ Check if there are additional main menu items not documented

---

## ⚙️ Settings Menu

**Menu ID:** `settings_menu`  
**Title:** Settings  
**Parent Menu:** `main`

**Description:** Configuration settings sub-menu containing all device configuration options.

**Menu Items:**

1. **Weighting**
   - **ID:** `weighting`
   - **Label:** `Weighting`
   - **Order:** 1
   - **Sub-menu:** `weighting_menu`
   - **Soft Key:** 1
   - **Action:** Navigate to weighting selection

2. **Time Constant**
   - **ID:** `time_constant`
   - **Label:** `Time Constant` ❓ (verify exact label)
   - **Order:** 2
   - **Sub-menu:** `time_constant_menu`
   - **Soft Key:** 2
   - **Action:** Navigate to time constant selection

3. **Range**
   - **ID:** `range`
   - **Label:** `Range`
   - **Order:** 3
   - **Sub-menu:** `range_menu`
   - **Soft Key:** 3
   - **Action:** Navigate to range selection

4. **Dose**
   - **ID:** `dose`
   - **Label:** `Dose`
   - **Order:** 4
   - **Sub-menu:** `dose_menu`
   - **Soft Key:** 4
   - **Action:** Navigate to dose configuration

5. **Backlight**
   - **ID:** `backlight`
   - **Label:** `Backlight`
   - **Order:** 5
   - **Sub-menu:** `backlight_menu`
   - **Soft Key:** None (may require scrolling)
   - **Action:** Navigate to backlight settings

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Weighting)
- **Soft Key 2:** `Select` (for Time Constant)
- **Soft Key 3:** `Select` (for Range)
- **Soft Key 4:** `Select` (for Dose, or Back if 5th item visible)

**Alt f Soft Keys:** ❓ Verify if settings menu has Alt f functionality

**Notes:**
- ❓ Verify all settings items are listed
- ❓ Verify menu order matches device
- ❓ Check if there are additional settings items (battery, display, etc.)

---

## 🎚️ Weighting Menu

**Menu ID:** `weighting_menu`  
**Title:** Weighting  
**Parent Menu:** `settings_menu`

**Description:** Weighting selection menu (A, C, Z weighting options).

**Menu Items:**

1. **A Weighting**
   - **ID:** `weighting_a`
   - **Label:** `A` ❓ (verify if displayed as "A", "A-Weighting", or "Weighting A")
   - **Order:** 1
   - **Sub-menu:** None
   - **Soft Key:** 1
   - **Action:** Set weighting to A
   - **Value:** `A`

2. **C Weighting**
   - **ID:** `weighting_c`
   - **Label:** `C` ❓ (verify if displayed as "C", "C-Weighting", or "Weighting C")
   - **Order:** 2
   - **Sub-menu:** None
   - **Soft Key:** 2
   - **Action:** Set weighting to C
   - **Value:** `C`

3. **Z Weighting**
   - **ID:** `weighting_z`
   - **Label:** `Z` ❓ (verify if displayed as "Z", "Z-Weighting", or "Weighting Z")
   - **Order:** 3
   - **Sub-menu:** None
   - **Soft Key:** 3
   - **Action:** Set weighting to Z
   - **Value:** `Z`

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for A)
- **Soft Key 2:** `Select` (for C)
- **Soft Key 3:** `Select` (for Z)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if weighting menu has Alt f functionality

**Notes:**
- ❓ Verify exact label format (just letter or includes "Weighting")
- ❓ Verify order matches device (A, C, Z)

---

## ⏱️ Time Constant Menu

**Menu ID:** `time_constant_menu`  
**Title:** Time Constant  
**Parent Menu:** `settings_menu`

**Description:** Time constant selection menu (Slow, Fast, Impulse).

**Menu Items:**

1. **Slow**
   - **ID:** `time_slow`
   - **Label:** `Slow`
   - **Order:** 1
   - **Sub-menu:** None
   - **Soft Key:** 1
   - **Action:** Set time constant to Slow
   - **Value:** `Slow`

2. **Fast**
   - **ID:** `time_fast`
   - **Label:** `Fast`
   - **Order:** 2
   - **Sub-menu:** None
   - **Soft Key:** 2
   - **Action:** Set time constant to Fast
   - **Value:** `Fast`

3. **Impulse**
   - **ID:** `time_impulse`
   - **Label:** `Impulse`
   - **Order:** 3
   - **Sub-menu:** None
   - **Soft Key:** 3
   - **Action:** Set time constant to Impulse
   - **Value:** `Impulse`

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Slow)
- **Soft Key 2:** `Select` (for Fast)
- **Soft Key 3:** `Select` (for Impulse)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if time constant menu has Alt f functionality

**Notes:**
- ❓ Verify exact labels match device
- ❓ Verify order matches device

---

## 📊 Range Menu

**Menu ID:** `range_menu`  
**Title:** Range  
**Parent Menu:** `settings_menu`

**Description:** Range selection menu (30-130 dB in 10 dB increments).

**Menu Items:**

**Range Values:** 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130 dB

**Display Format:** ❓ Verify how range values are displayed:
- As list items: "30 dB", "40 dB", etc.?
- As current value with Up/Down arrows?
- As numeric input?

**Navigation:** ❓ Verify navigation method:
- List selection with Up/Down arrows?
- Direct soft key selection?
- Numeric input?

**Soft Key Labels:**
- **Soft Key 1:** `Up` (if using arrows) or `Select` (if list)
- **Soft Key 2:** `Down` (if using arrows) or `Select` (if list)
- **Soft Key 3:** `Enter` (if input) or `Select` (if list)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if range menu has Alt f functionality

**Notes:**
- ❓ **CRITICAL:** Verify how range selection works on device
- ❓ Verify range value display format
- ❓ Verify if all values (30-130) are available or subset

---

## 📈 Dose Menu

**Menu ID:** `dose_menu`  
**Title:** Dose  
**Parent Menu:** `settings_menu`

**Description:** Dose configuration menu with Exchange Rate, Threshold, and Criterion Level settings.

**Menu Items:**

1. **Exchange Rate**
   - **ID:** `dose_exchange_rate`
   - **Label:** `Exchange Rate` ❓ (verify exact label)
   - **Order:** 1
   - **Sub-menu:** `dose_exchange_rate_menu`
   - **Soft Key:** 1
   - **Action:** Navigate to exchange rate selection
   - **Notes:** Exchange rate range: 3-6 dB

2. **Threshold**
   - **ID:** `dose_threshold`
   - **Label:** `Threshold` ❓ (verify exact label - may be "Threshold Level")
   - **Order:** 2
   - **Sub-menu:** `dose_threshold_menu`
   - **Soft Key:** 2
   - **Action:** Navigate to threshold selection
   - **Notes:** Threshold range: 50-100 dB

3. **Criterion Level**
   - **ID:** `dose_criterion`
   - **Label:** `Criterion Level` ❓ (verify exact label)
   - **Order:** 3
   - **Sub-menu:** `dose_criterion_menu`
   - **Soft Key:** 3
   - **Action:** Navigate to criterion level selection
   - **Notes:** Criterion level range: 70-100 dB

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Exchange Rate)
- **Soft Key 2:** `Select` (for Threshold)
- **Soft Key 3:** `Select` (for Criterion Level)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if dose menu has Alt f functionality

**Notes:**
- ❓ Verify all dose configuration options
- ❓ Verify exact labels for each setting
- ❓ Verify how values are selected (list, arrows, input)

---

## 💡 Backlight Menu

**Menu ID:** `backlight_menu`  
**Title:** Backlight  
**Parent Menu:** `settings_menu`

**Description:** Backlight settings menu (Manual/Timed mode and timeout).

**Menu Items:**

1. **Mode**
   - **ID:** `backlight_mode`
   - **Label:** `Mode` ❓ (verify exact label - may be "Backlight Mode")
   - **Order:** 1
   - **Sub-menu:** `backlight_mode_menu`
   - **Soft Key:** 1
   - **Action:** Navigate to mode selection
   - **Notes:** Manual or Timed mode

2. **Timeout**
   - **ID:** `backlight_timeout`
   - **Label:** `Timeout` ❓ (verify exact label - may be "Timeout Duration")
   - **Order:** 2
   - **Sub-menu:** `backlight_timeout_menu`
   - **Soft Key:** 2
   - **Action:** Navigate to timeout selection
   - **Notes:** Timeout range: 1-60 seconds (only if Timed mode)

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Mode)
- **Soft Key 2:** `Select` (for Timeout)
- **Soft Key 3:** `null` (not used)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if backlight menu has Alt f functionality

**Notes:**
- ❓ Verify mode options (Manual/Timed)
- ❓ Verify timeout settings (if applicable)
- ❓ Verify if timeout is only available in Timed mode

---

## 📊 Measurement Menu

**Menu ID:** `measurement_menu`  
**Title:** Measurement  
**Parent Menu:** `main`

**Description:** Measurement controls and options.

**Menu Items:**

1. **Start**
   - **ID:** `measurement_start`
   - **Label:** `Start` ❓ (verify if this exists in menu or is direct button)
   - **Order:** 1
   - **Sub-menu:** None
   - **Soft Key:** 1
   - **Action:** Start measurement
   - **Notes:** ❓ **VERIFY:** May be controlled by Run/Pause/Stop buttons directly, not menu

2. **Logging**
   - **ID:** `measurement_logging`
   - **Label:** `Logging` ❓ (verify if separate from main Data Logging menu)
   - **Order:** 2
   - **Sub-menu:** `logging_menu`
   - **Soft Key:** 2
   - **Action:** Navigate to logging settings

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Start) or `null`
- **Soft Key 2:** `Select` (for Logging) or `null`
- **Soft Key 3:** `null` (not used)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if measurement menu has Alt f functionality

**Notes:**
- ❓ **CRITICAL:** Verify if measurement is controlled via menu or direct buttons (Run/Pause/Stop)
- ❓ Verify if this menu exists or if measurement controls are elsewhere

---

## 🔧 Calibration Menu

**Menu ID:** `calibration_menu`  
**Title:** Calibration  
**Parent Menu:** `main`

**Description:** Device calibration procedures and status.

**Menu Items:**

1. **Start Calibration**
   - **ID:** `calibration_start`
   - **Label:** `Start Calibration` ❓ (verify exact label - may be "Calibrate" or "Begin Calibration")
   - **Order:** 1
   - **Sub-menu:** None
   - **Soft Key:** 1
   - **Action:** Start calibration procedure
   - **Notes:** Verify calibration procedure flow from firmware manuals

2. **Calibration Status**
   - **ID:** `calibration_status`
   - **Label:** `Calibration Status` ❓ (verify exact label - may be "Status" or "View Status")
   - **Order:** 2
   - **Sub-menu:** None
   - **Soft Key:** 2
   - **Action:** Show calibration status and results
   - **Notes:** Verify status display format

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Start Calibration)
- **Soft Key 2:** `Select` (for Calibration Status)
- **Soft Key 3:** `null` (not used)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if calibration menu has Alt f functionality

**Notes:**
- ❓ Verify calibration menu items from firmware manuals
- ❓ Verify calibration procedure prompts and dialogs
- ❓ Verify calibration result display format

---

## 📝 Data Logging Menu

**Menu ID:** `logging_menu`  
**Title:** Data Logging  
**Parent Menu:** `main` (or `measurement_menu`)

**Description:** Data logging configuration and settings.

**Menu Items:**

1. **Enable Logging**
   - **ID:** `logging_enable`
   - **Label:** `Enable Logging` ❓ (verify exact label - may be "Logging" toggle)
   - **Order:** 1
   - **Sub-menu:** None
   - **Soft Key:** 1
   - **Action:** Toggle logging on/off
   - **Notes:** Verify if this is a toggle or separate Enable/Disable options

2. **Interval**
   - **ID:** `logging_interval`
   - **Label:** `Interval` ❓ (verify exact label - may be "Logging Interval")
   - **Order:** 2
   - **Sub-menu:** `logging_interval_menu`
   - **Soft Key:** 2
   - **Action:** Navigate to interval selection
   - **Notes:** Verify interval options from firmware (e.g., 1s, 5s, 10s, etc.)

**Soft Key Labels:**
- **Soft Key 1:** `Select` (for Enable Logging)
- **Soft Key 2:** `Select` (for Interval)
- **Soft Key 3:** `null` (not used)
- **Soft Key 4:** `Back`

**Alt f Soft Keys:** ❓ Verify if logging menu has Alt f functionality

**Notes:**
- ❓ Verify logging menu location (main menu or measurement sub-menu)
- ❓ Verify logging interval options from firmware
- ❓ Verify logging enable/disable method

---

## 🔄 Navigation Flow

### Entry Points

- **Main Menu:** From home screen, press soft key 1 (Menu) or navigate via menu button
- **Settings:** Main Menu > Settings
- **Measurement:** Main Menu > Measurement (or direct Run/Pause/Stop buttons)
- **Calibration:** Main Menu > Calibration

### Back Button Behavior

**Esc/Power Button (Short Press) or Back Soft Key:**
- From sub-menu: Returns to parent menu
- From main menu: Returns to home screen
- From home: No action (or power off if long press)

**Notes:**
- ❓ Verify back button behavior matches firmware exactly
- ❓ Some menus may have context-dependent back behavior

---

## 💬 Dialogs and Messages

### Warning: Measurement Active

**ID:** `warning_measurement_active`  
**Type:** Warning  
**Title:** `Warning` ❓ (verify exact title)

**Message:** `Measurement in progress. Stop measurement?` ❓ **VERIFY EXACT TEXT**

**Buttons:**
- **OK:** Confirm action
- **Cancel:** Cancel action

**Trigger:** Attempt to change settings during active measurement

**Notes:** ❓ Verify exact warning text from firmware

---

### Confirmation: Reset Settings

**ID:** `confirmation_reset_settings`  
**Type:** Confirmation  
**Title:** `Confirm` ❓ (verify exact title)

**Message:** `Reset all settings to defaults?` ❓ **VERIFY EXACT TEXT**

**Buttons:**
- **Yes:** Confirm reset
- **No:** Cancel reset

**Trigger:** Reset settings action

**Notes:** ❓ Verify exact confirmation text

---

### Error: Over Range

**ID:** `error_over_range`  
**Type:** Error  
**Title:** `Error` ❓ (verify exact title)

**Message:** `Measurement exceeds selected range` ❓ **VERIFY EXACT TEXT**

**Buttons:**
- **OK:** Acknowledge error

**Trigger:** Measurement exceeds selected range

**Notes:** ❓ Verify exact error message text

---

### Information: Calibration Complete

**ID:** `info_calibration_complete`  
**Type:** Information  
**Title:** `Calibration` ❓ (verify exact title)

**Message:** `Calibration complete` ❓ **VERIFY EXACT TEXT**

**Buttons:**
- **OK:** Acknowledge

**Trigger:** Calibration procedure completed successfully

**Notes:** ❓ Verify exact calibration completion message

---

## ❓ Additional Dialogs

**Please document any additional dialogs, warnings, or messages not listed above:**

- [ ] Dialog 1: _______________________
- [ ] Dialog 2: _______________________
- [ ] Dialog 3: _______________________

---

## 🔀 Alt f Functionality

**Alt f Button:** Reveals alternate soft key labels for applicable menus.

**Menus with Alt f:** ❓ **VERIFY** which menus have Alt f functionality:

- [ ] Main Menu
- [ ] Settings Menu
- [ ] Weighting Menu
- [ ] Time Constant Menu
- [ ] Range Menu
- [ ] Dose Menu
- [ ] Backlight Menu
- [ ] Measurement Menu
- [ ] Calibration Menu
- [ ] Logging Menu

**For each menu with Alt f, document alternate soft key labels:**

**Example - Settings Menu (if Alt f exists):**
- **Alt f Soft Key 1:** `Reset` (reset to defaults)
- **Alt f Soft Key 2:** `Back`
- **Alt f Soft Key 3:** `Default` (set defaults)
- **Alt f Soft Key 4:** `null`

**Notes:**
- ❓ Verify which menus have Alt f functionality
- ❓ Document alternate soft key labels for each menu with Alt f
- ❓ Verify Alt f toggle behavior (press once to show, press again to hide)

---

## ✅ User Corrections

**Please use this section to document corrections or additions after reviewing against physical device:**

### Menu Corrections

**Menu:** _______________________  
**Correction:** _______________________  
**Notes:** _______________________

### Missing Menus

- [ ] Menu 1: _______________________
- [ ] Menu 2: _______________________

### Missing Menu Items

**Menu:** _______________________  
**Missing Item:** _______________________

### Label Corrections

**Menu:** _______________________  
**Item:** _______________________  
**Current Label:** _______________________  
**Correct Label:** _______________________

### Soft Key Corrections

**Menu:** _______________________  
**Soft Key:** _______________________  
**Current Label:** _______________________  
**Correct Label:** _______________________

### Dialog Text Corrections

**Dialog ID:** _______________________  
**Current Text:** _______________________  
**Correct Text:** _______________________

### Additional Notes

**Questions/Uncertainties:**

1. _______________________
2. _______________________
3. _______________________

**Final Approval:** ☐ Approved - Ready for Task 3.0B Implementation

---

## 📚 Reference Documents

- SoundPro_SE_DL_User_Manual_053-576.pdf
- SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf
- QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf

---

**End of Review Document**

