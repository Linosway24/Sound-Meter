# Task List: Quest SoundPro SE-DL Interactive Training Module

Based on: `PRD.md`

## Relevant Files

- `index.html` - Main entry point with device container structure and dialog overlay
- `css/styles.css` - All styling for device layout, LCD display, buttons, and overlays
- `js/main.js` - Entry point, initialization, and module orchestration
- `js/device.js` - Device state management (power on/off, device lifecycle)
- `js/display.js` - LCD rendering, backlight states, and display content management
- `js/buttons.js` - Button handlers, press detection (short/long press), event delegation
- `js/menu.js` - Menu system, navigation state machine, menu hierarchy
- `js/config.js` - Configuration settings (weighting, time constant, range, dose, backlight)
- `js/measurement.js` - Run/pause/stop functionality, measurement state management
- `js/simulator.js` - Deterministic SPL data generation and calculations
- `js/utils.js` - Helper functions (formatting, DOM utilities, dialog helpers)
- `assets/Quest Sound Meter.png` - Device background image (already exists)
- `assets/Quest Sound Dosimeter.png` - Calibration machine reference image (already exists)

### Notes

- All files will be rebuilt from scratch to match PRD specifications exactly
- Pure ES6 JavaScript - no build tools, no external libraries
- DOM-based rendering (not Canvas) for LCD display
- All code must work offline in Articulate Storyline Web Object environment

## Tasks

- [x] 1.0 Device Structure & Visual Layout ✅ COMPLETE
  - [x] 1.1 Create HTML structure in `index.html` with 1920×1080 device container div
  - [x] 1.2 Add colored background to device container and set device photo image element (not background-image) with alt text
  - [x] 1.2 Style device photo to center horizontally, fit screen height with padding top/bottom (photo may be smaller than 1920×1080 with alpha channel)
  - [x] 1.3 Create LCD display region div (~1400×640px) positioned as overlay where LCD appears in photo
  - [x] 1.4 Create LCD content structure with main display area, status area, and soft key labels area
  - [x] 1.5 Create soft key button elements (1-4) positioned as overlays matching photo button locations (match photo button sizes exactly)
  - [x] 1.6 Create navigation cluster (Up/Down/Left/Right/Enter) positioned as overlay matching photo (match photo button sizes exactly)
  - [x] 1.7 Create function button elements (Alt f, Backlight, Run/Pause, Stop, On/Off) positioned as overlays matching photo (match photo button sizes exactly)
  - [x] 1.8 Create dialog overlay system HTML structure for warnings and confirmations
  - [x] 1.9 Build CSS layout in `styles.css` using Grid/Flexbox for proper positioning of all overlays
  - [x] 1.10 Style device container with colored background and scale properly in 1920×1080 canvas, style initial state to match powered off state
  - [x] 1.11 Position all interactive elements (buttons, LCD) as overlays using absolute positioning to match photo exactly, add semi-transparent overlay indicators for testing
  - [x] 1.12 Add CSS :hover/:active states, perform user testing, adjust positioning, create reference documentation, remove testing overlays

- [x] 2.0 Core Interaction System
  - [x] 2.1 Create `js/device.js` module with device state object (power on/off, initialization)
  - [x] 2.2 Implement power on/off functionality with device initialization on power on
  - [x] 2.3 Create `js/buttons.js` module with button event delegation system
  - [x] 2.4 Implement short press detection for all buttons (immediate action on mouse/keyboard up)
  - [x] 2.5 Implement long press detection (~800ms hold) for power button
  - [x] 2.6 Implement On/Off button dual functionality: short press = Esc/Back, long press = Power toggle
  - [x] 2.7 Create keyboard input handlers in `buttons.js` for Arrow keys (Up/Down/Left/Right), Enter, and Esc
  - [x] 2.8 Map keyboard events to corresponding button actions
  - [x] 2.9 Create navigation state machine structure in `js/menu.js` for managing screen states
  - [x] 2.10 Implement display state management for device on/off states, backlight states, and active screen context
  - [x] 2.11 Connect button handlers to state machine for screen transitions

- [x] 2.12 Display Rendering Infrastructure (Essential foundation - complete before Task 3.0)
  - [x] 2.12.1 Create display render function in `js/display.js` that accepts screen context and renders LCD content
  - [x] 2.12.2 Implement LCD content update system (main area, status area, soft key labels area)
  - [x] 2.12.3 Create soft key label renderer that updates labels (1-4) on LCD bottom area based on screen context
  - [x] 2.12.4 Implement home screen renderer with device name and firmware version
  - [x] 2.12.5 Create display refresh function that triggers on state changes (menu navigation, config changes, etc.)
  - [x] 2.12.6 Ensure display.js reads navigation state from menu.js (remove duplicate state, display.js is presentation only)

- [x] 3.0 Menu System Implementation ✅ COMPLETE
  - [x] 3.1 Extract menu structure from firmware R.13J manuals (main menu items and hierarchy)
  - [x] 3.2 Create menu data structure in `js/menu.js` with main menu items and sub-menus
  - [x] 3.3 Implement menu navigation state machine with current menu, selected item, and navigation history
  - [x] 3.4 Build menu rendering function to display menu items on LCD
  - [x] 3.5 Implement sub-menu navigation with hierarchical menu tree following firmware structure
  - [x] 3.6 Create soft key label system that updates labels (1-4) based on current screen context
  - [x] 3.7 Map soft key labels to menu actions for each screen (home, menu, settings, measurement, etc.)
  - [x] 3.8 Implement Alt f alternate menu functionality that reveals additional soft-key options
  - [x] 3.9 Create dialog/warning screen system using existing dialog overlay structure
  - [x] 3.10 Extract exact dialog text, warning messages, and confirmation prompts from firmware manuals
  - [x] 3.11 Implement dialog display functions for prompts, confirmations, and error messages
  - [x] 3.12 Test menu navigation flow matches firmware R.13J behavior

- [x] 4.0 Configuration & Settings System ✅ COMPLETE
  - [x] 4.1 Update `js/config.js` with Weighting options (A, C, Z) and selection methods
  - [x] 4.2 Implement Weighting selection through menu navigation with current value display
  - [x] 4.3 Add Time Constant options (Slow, Fast, Impulse) to config module
  - [x] 4.4 Implement Time Constant selection through menu system
  - [x] 4.5 Add Range selection logic with values from 30 dB to 130 dB
  - [x] 4.6 Implement Range adjustment through menu controls (up/down arrows or direct input)
  - [x] 4.7 Build Dose configuration with Exchange Rate (3-6 dB), Threshold (50-100 dB), and Criterion Level (70-100 dB)
  - [x] 4.8 Implement Dose menu settings with validation for each parameter range
  - [x] 4.9 Implement Backlight settings with Manual mode (toggle on/off) and Timed mode (1-60 seconds)
  - [x] 4.10 Add backlight timeout logic for Timed mode with configurable duration
  - [x] 4.11 Create configuration display function showing current settings (Weighting, Time Constant, Range) on home screen
  - [x] 4.12 Integrate configuration menu items into main menu structure

- [x] 5.0 Measurement Engine ✅ COMPLETE
  - [x] 5.1 Create `js/simulator.js` module for SPL data generation
  - [x] 5.2 Implement deterministic random number generator using seed value for reproducible readings
  - [x] 5.3 Create SPL data generator function that produces realistic sound level readings
  - [x] 5.4 Create `js/measurement.js` module for Run/Pause/Stop functionality
  - [x] 5.5 Implement Run state that starts measurement session and begins data generation
  - [x] 5.6 Implement Pause state that suspends measurement without clearing data
  - [x] 5.7 Implement Stop state that ends measurement session
  - [x] 5.8 Build measurement display update system showing Leq (equivalent continuous sound level)
  - [x] 5.9 Add Lmax (maximum level) tracking and display
  - [x] 5.10 Add Lmin (minimum level) tracking and display
  - [x] 5.11 Add SEL (Sound Exposure Level) calculation and display
  - [x] 5.12 Add Peak measurement tracking and display
  - [x] 5.13 Add Dose calculation and display based on configured parameters
  - [x] 5.14 Implement weighting calculations (A/C/Z) applied to simulated SPL data
  - [x] 5.15 Implement time-constant calculations (Slow/Fast/Impulse) applied to SPL data
  - [x] 5.16 Create range logic that detects when measurements exceed selected range
  - [x] 5.17 Implement over-range warning display when measurements exceed range
  - [x] 5.18 Implement real-time display updates during active measurement reflecting selected time constant behavior
  - [x] 5.19 Test measurement calculations with different weighting and time constant combinations ✅ TESTING COMPLETE

- [x] 6.0 Display Enhancements & Formatting (Advanced display features) ✅ COMPLETE
  - [x] 6.1 Create `js/display.js` module for LCD rendering and display management (completed in Task 2.0)
  - [x] 6.2 Implement LCD rendering with green tint overlay when backlight is ON (completed in Task 2.0)
  - [x] 6.3 Implement LCD rendering with gray tint overlay when backlight is OFF (completed in Task 2.0)
  - [x] 6.4 Create display renderer for home screen with device name and firmware version (moved to Task 2.12)
  - [x] 6.5 Implement soft key label display at bottom of LCD showing labels for buttons 1-4 (moved to Task 2.12)
  - [x] 6.6 Create status indicator display showing current configuration (Weighting, Time Constant, Range) on home screen (already visible in SLM screens)
  - [x] 6.7 Extract measurement display format specifications from firmware R.13J manuals (--.- format for null, X.X dB)
  - [x] 6.8 Implement measurement reading display with proper decimal precision and unit display
  - [x] 6.9 Format Leq, Lmax, Lmin, SEL, Peak, and Dose according to firmware specifications
  - [x] 6.10 Implement battery indicator display (simulated 10% runtime reduction when backlight ON)
  - [x] 6.11 Create display update function that refreshes LCD content based on current state (moved to Task 2.12)
  - [x] 6.12 Implement display refresh on state changes (menu navigation, measurement updates, config changes) (moved to Task 2.12)

- [x] 7.0 Data Logging & Advanced Features ✅ COMPLETE
  - [x] 7.1 Extract data logging interval options and default values from firmware documentation
  - [x] 7.2 Add logging mode functionality to config module
  - [x] 7.3 Implement logging mode toggle through menu system
  - [x] 7.4 Create interval settings configuration for data logging (extracted from firmware specs)
  - [x] 7.5 Implement interval selection and validation in logging configuration menu
  - [x] 7.6 Create logging data storage structure in memory during measurement sessions
  - [x] 7.7 Implement logging indicators that display when data logging is active
  - [x] 7.8 Add visual indicator on LCD when logging is in progress
  - [x] 7.9 Implement TWA (Time-Weighted Average) calculation for dose measurements
  - [x] 7.10 Integrate TWA calculation into measurement display system
  - [x] 7.11 Test logging functionality with different interval settings
  - [x] 7.12 Test all measurement scenarios to ensure readings behave correctly under different configurations

- [x] 8.0 Calibration Features ✅ COMPLETE
  - [x] 8.1 Extract calibration procedures from firmware R.13J documentation
  - [x] 8.2 Extract calibration prompts and confirmation messages from firmware manuals
  - [x] 8.3 Create calibration menu structure integrated into main menu system
  - [x] 8.4 Implement calibration procedure flow matching firmware R.13J specifications
  - [x] 8.5 Reference "Quest Sound Dosimeter.png" image for calibration machine context during calibration procedures
  - [x] 8.6 Implement calibration status tracking (not started, in progress, completed, failed)
  - [x] 8.7 Extract calibration result display format from firmware documentation
  - [x] 8.8 Implement calibration results display showing status and results in firmware-specified format
  - [x] 8.9 Create calibration dialog/prompts matching exact firmware text
  - [x] 8.10 Test calibration procedure end-to-end matching firmware behavior

