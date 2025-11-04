# Quest SoundPro SE-DL Interactive Training Module - PRD

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

## Introduction/Overview

The Quest SoundPro SE-DL Sound Level Meter is a professional-grade instrument used for measuring sound pressure levels (SPL) in industrial and occupational safety environments. USAFSAM requires an interactive training module that allows students to practice operating the device without access to physical hardware.

This project develops a **2D interactive simulation** of the Quest SoundPro SE-DL that behaves exactly like the real device (firmware R.13J). The simulation will run **offline inside Articulate Storyline** as a Web Object on a **1920×1080** canvas. All front-panel buttons, menus, display states, and warning screens will be functional, enabling students to learn device operation through realistic interaction.

**Problem Statement:** Students need hands-on practice with the SoundPro SE-DL device, but physical units are limited and training scenarios require repeatable, controlled conditions. An interactive simulation provides unlimited practice opportunities with consistent, reproducible measurements.

## Goals

1. Replicate all physical controls and menu behavior from firmware R.13J with 100% functional accuracy
2. Enable realistic configuration, measurement, and interpretation of SPL data through simulated readings
3. Deliver a self-contained web bundle that operates offline without internet access or npm packages
4. Provide a maintainable codebase written in plain ES6 JavaScript for easy updates and modifications
5. Support internal scenario-based tracking for student assessment (structure in place, measurement deferred)

## User Stories

1. **As a student**, I want to identify all controls and menu items on the SE-DL so that I can navigate the device interface confidently.
2. **As a student**, I want to configure Weighting (A/C/Z), Time Constant (Slow/Fast/Impulse), Range, and Dose settings so that I can set up the meter for different measurement scenarios.
3. **As a student**, I want to operate Run/Pause/Stop controls so that I can perform sound level measurements as I would on the real device.
4. **As a student**, I want to interpret displayed measurements (Leq, Lmax, Lmin, SEL, Peak, Dose) so that I can analyze sound level data correctly.
5. **As a student**, I want to respond to prompts and warnings as they appear on the real meter so that I can handle device alerts and error conditions properly.
6. **As a student**, I want to understand how configuration choices affect readings so that I can make informed decisions about measurement settings.
7. **As a student**, I want to see the device backlight toggle and adjust its settings so that I can operate the device in various lighting conditions.
8. **As a student**, I want to navigate through all menu structures using soft keys and navigation buttons so that I can access all device functions.

## Functional Requirements

### Device Structure & Visual Layout

1. The system must create an HTML structure for a 1920×1080 canvas that serves as the device container.
2. The system must use "Quest Sound Meter.png" as the device image - the photo itself IS the device, no graphics need to be built. The photo may be smaller than 1920×1080 (with alpha channel), and should be centered horizontally with padding top/bottom, fitting the screen height. A colored background will be placed behind the device photo. The image serves as the complete visual representation of the device housing.
3. The system must implement an LCD display region with dimensions approximately 1400×640 pixels, positioned as an overlay on top of the device photo where the LCD screen appears in the image.
4. The system must place all physical button controls (soft keys 1-4, navigation cluster, function buttons) as interactive overlays positioned to match exactly where the buttons appear in the "Quest Sound Meter.png" photo. Button sizes must match photo button sizes exactly. Semi-transparent overlay indicators will be added during Task 1.0 positioning verification and removed after testing.
5. The system must use CSS Grid/Flexbox for layout with proper positioning of all UI elements as overlays on the device photo.
6. The system must display all elements in a powered off state initially (all visible but inactive appearance).
7. The system must add alt text to the device image for accessibility.

### Core Interaction System

8. The system must implement button press handlers that detect short press (immediate action) and long press (~800 ms hold for power on/off).
9. The system must create a navigation state machine to manage menu system transitions and screen states.
10. The system must build keyboard input handlers that respond to Arrow keys (Up/Down/Left/Right), Enter, and Esc.
11. The system must implement display state management for device on/off states, backlight states, and active screen context.
12. The system must handle the On/Off button with dual functionality: short press = Esc/Back, long press = Power toggle.

### Menu System

13. The system must build a main menu structure based on firmware R.13J specifications extracted from provided manuals.
14. The system must implement sub-menus with hierarchical navigation following the firmware's menu tree.
15. The system must add a soft key label system where labels (1-4) appear on the LCD and vary based on the current screen context.
16. The system must create Alt f alternate menu functionality that reveals additional soft-key options when pressed.
17. The system must implement a dialog/warning screen system that displays prompts, confirmations, and error messages matching firmware R.13J.
18. The system must extract and use exact menu structures, dialog text, and warning messages from the provided manuals (SoundPro_SE_DL_User_Manual_053-576.pdf, SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf, QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf).

### Configuration & Settings

19. The system must implement Weighting selection with options A, C, and Z, displayable and changeable through menu navigation.
20. The system must implement Time Constant selection with options Slow, Fast, and Impulse, accessible via menu system.
21. The system must add Range selection logic with values from 30 dB to 130 dB, adjustable through menu controls.
22. The system must build Dose configuration allowing users to set Exchange Rate (typically 3-6 dB), Threshold (50-100 dB), and Criterion Level (70-100 dB).
23. The system must implement Backlight settings with Manual mode (toggle on/off) and Timed mode (1-60 seconds timeout).
24. The system must display current configuration settings (Weighting, Time Constant, Range) on the home screen status area.

### Measurement Engine

25. The system must create a deterministic SPL data generator that produces reproducible sound level readings based on a seed value.
26. The system must implement Run/Pause/Stop functionality that toggles measurement state and updates display accordingly.
27. The system must build a display update system that shows Leq (equivalent continuous sound level), Lmax (maximum level), Lmin (minimum level), SEL (Sound Exposure Level), Peak, and Dose measurements.
28. The system must apply weighting (A/C/Z) and time-constant (Slow/Fast/Impulse) calculations to simulated SPL data to reflect realistic measurement behavior.
29. The system must implement range logic that detects over-range conditions and displays appropriate warnings when measurements exceed the selected range.
30. The system must update measurement displays in real-time during active measurement sessions, reflecting the selected time constant behavior.

### Display Behavior

31. The system must render the LCD display region with a green tint when backlight is ON and a gray tint when backlight is OFF.
32. The system must display soft key labels at the bottom of the LCD corresponding to the four soft key buttons (1-4).
33. The system must show status indicators for current configuration (Weighting, Time Constant, Range) on the home screen.
34. The system must display measurement readings in the format specified by firmware R.13J (extracted from manuals).
35. The system must simulate battery runtime reduction of 10% when backlight is ON (for display purposes only, no actual battery management).

### Data Logging & Advanced Features

36. The system must add logging mode functionality that allows users to configure measurement intervals.
37. The system must implement interval settings for data logging (extracted from firmware specifications).
38. The system must create logging indicators that display when data logging is active.
39. The system must add TWA (Time-Weighted Average) calculations for dose measurements.
40. The system must test all measurement scenarios to ensure readings behave correctly under different configurations.

### Calibration Features

41. The system must implement calibration functionality that allows users to perform calibration procedures as specified in firmware R.13J.
42. The system must reference "Quest Sound Dosimeter.png" for calibration machine context during calibration procedures.
43. The system must extract calibration procedures, prompts, and confirmation messages from firmware R.13J documentation.
44. The system must display calibration status and results in the format specified by the firmware.

## Non-Goals (Out of Scope)

The following features are explicitly excluded from this project:

- **Real Hardware Communication**: The simulation does not interface with actual SoundPro SE-DL hardware. It is a standalone simulation only.
- **Actual Microphone Input/Audio Processing**: The simulation does not process real audio input from a microphone. All SPL data is generated deterministically through simulation.
- **Physical Device Control**: The simulation cannot control or communicate with external devices or hardware interfaces.
- **Data Persistence Beyond Session**: Data is stored in-memory only during the simulation session. No persistent storage or export to external files is implemented (though the structure may support future export if needed for scenario tracking).

## Design Considerations

### Visual Assets

- **Main Device Image**: "Quest Sound Meter.png" located in `/assets/` folder IS the device - this photo serves as the complete device background. No device graphics need to be built. Interactive elements (LCD, buttons) are positioned as overlays on top of this photo.
- **Calibration Reference**: "Quest Sound Dosimeter.png" located in `/assets/` folder provides context for calibration-related features and should be referenced during calibration implementation.

### LCD Display Specifications

- **LCD Region**: Approximately 1400×640 pixels, centered on the 1920×1080 canvas
- **Backlight States**: 
  - ON: Green tint overlay applied to LCD region
  - OFF: Gray tint overlay applied to LCD region
- **Display Format**: Text-based LCD rendering using DOM elements (not Canvas) for easier maintenance and accessibility
- **Font Specifications**: Monospace font family for LCD-style numeric display consistency

### Button Layout

- **Soft Keys (1-4)**: Positioned below LCD display, labels appear on LCD bottom edge
- **Navigation Cluster**: Up/Down/Left/Right/Enter buttons arranged in standard cross pattern
- **Function Buttons**: Alt f, Backlight, Run/Pause, Stop, On/Off positioned according to reference image

### UI/UX Requirements

- All buttons must be visually distinct and clickable/tappable
- Button states (pressed, active, disabled) must be visually indicated
- Menu navigation must provide clear visual feedback for selected items
- Dialog overlays must be modal and centered on the display
- Keyboard navigation must match mouse interaction functionality

## Technical Considerations

### Runtime Environment

- **Host Platform**: Articulate Storyline Web Object (embedded HTML5)
- **Execution Mode**: Offline HTML5, no internet connectivity required
- **Display Resolution**: 1920×1080 layout with 16:9 aspect ratio scaling
- **Input Methods**: Mouse clicks and keyboard input (Arrow keys, Enter, Esc)
- **Browser Engine**: Storyline's Chromium-based player
- **Storage**: In-memory variables only (offline-safe, no localStorage or external storage)

### Technology Stack

- **HTML**: Semantic structure with device container, LCD region, and button controls
- **CSS**: Grid/Flexbox for layout, custom styling for LCD appearance and button states
- **JavaScript**: Pure ES6 JavaScript (no transpilation, no build tools, no external libraries)
- **Rendering**: DOM-based LCD rendering (not Canvas) for easier text manipulation and maintenance

### Code Architecture

- **Modular Structure**: Separate JavaScript modules for device state, display, buttons, menu, config, measurement, and simulator
- **State Management**: State machine pattern for menu navigation and screen transitions
- **Event Handling**: Event delegation for efficient button handling
- **Data Generation**: Deterministic random seed for reproducible SPL data across sessions

### File Structure

```
/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styling (device layout, LCD, buttons)
├── js/
│   ├── main.js         # Entry point, initialization
│   ├── device.js       # Device state, power on/off
│   ├── display.js      # LCD rendering, backlight
│   ├── buttons.js      # Button handlers, press detection
│   ├── menu.js         # Menu system, navigation
│   ├── config.js       # Weighting, time, range, dose settings
│   ├── measurement.js  # Run/pause/stop, data display
│   ├── simulator.js    # SPL data generation
│   └── utils.js        # Helper functions
└── assets/
    ├── Quest Sound Meter.png          # Main device background image
    ├── Quest Sound Dosimeter.png      # Calibration machine reference
    ├── SoundPro_SE_DL_User_Manual_053-576.pdf
    ├── SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf
    └── QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf
```

### Integration Points

- **Articulate Storyline**: Module is embedded as a Web Object in Storyline. No JavaScript variable communication is required - the module operates as a standalone web application.
- **Context7 Integration**: Use Context7 documentation tools where applicable to extract firmware specifications and menu structures from provided PDF manuals

## Success Metrics

While formal success tracking is not implemented in this phase, the following framework is established for future scenario-based assessment:

### Internal Tracking Framework (Structure Only)

- **Functional Completeness**: All 44 functional requirements must be implemented and tested
- **Firmware Accuracy**: Menu structures, display formats, and button behaviors must match firmware R.13J specifications
- **Scenario-Based Assessment**: The system structure supports tracking student actions during training scenarios (e.g., correct configuration selection, proper measurement sequence, appropriate response to warnings)
- **Measurement Accuracy**: Simulated SPL readings must behave consistently and reflect configuration changes (weighting, time constant) appropriately

**Note**: Actual success measurement and student assessment tracking will be implemented in a future phase when specific training scenarios are defined. The current PRD establishes the foundation for such tracking.

## Open Questions

1. **Menu Structure Details**: Complete menu hierarchy, sub-menu items, and navigation paths need to be extracted from the provided PDF manuals (SoundPro_SE_DL_User_Manual_053-576.pdf, SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf, QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf) using Context7 or manual review.

2. **Dialog/Warning Messages**: Exact text for all warning screens, confirmation dialogs, and error messages must be extracted from firmware R.13J documentation.

3. **Soft Key Label Mappings**: Complete mapping of soft key labels (1-4) for each screen context needs to be documented from the firmware reference.

4. **Display Format Specifications**: Exact format for displaying measurements (Leq, Lmax, Lmin, SEL, Peak, Dose) including decimal precision, unit display, and formatting conventions must be extracted from manuals.

5. **Data Logging Intervals**: Specific interval options and default values for data logging mode need to be confirmed from firmware documentation.

6. **Measurement Update Rates**: Refresh rates for different time constants (Slow/Fast/Impulse) and how they affect display updates need clarification from firmware specs.

7. **Over-Range Behavior**: Exact behavior when measurements exceed range (display format, warning appearance, auto-range if applicable) requires firmware reference.

8. **Alt f Menu Options**: Complete list of alternate menu options revealed by Alt f button across different screen contexts needs documentation.

9. **Calibration Procedures**: Specific calibration procedures, prompts, confirmation messages, and result display formats must be extracted from firmware R.13J documentation.

## Reference Materials

- SoundPro_SE_DL_User_Manual_053-576.pdf (in `/assets/`)
- SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf (in `/assets/`)
- QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf (in `/assets/`)

## Implementation Status

**Note**: This is a fresh start. All phases are pending implementation. Any existing code files will be overwritten during implementation.

- ⏳ **Phase 1**: Device Structure & Visual Layout - Not started
- ⏳ **Phase 2**: Core Interaction System - Not started
- ⏳ **Phase 3**: Menu System - Not started
- ⏳ **Phase 4**: Configuration & Settings - Not started
- ⏳ **Phase 5**: Measurement Engine - Not started
- ⏳ **Phase 6**: Data Logging & Advanced Features - Not started

---

**Note**: This PRD follows the structure defined in `create-prd.md` while preserving all technical specifications and implementation details from the original document. All functional requirements are numbered and specific, making them actionable for implementation by a junior developer.
