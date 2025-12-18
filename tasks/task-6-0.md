# AI Task Planning - Task 6.0: Display Enhancements & Formatting

> **How to Use This Template:**
> 1. Specify your task list file: `tasks-PRD.md`
> 2. Open `tasks-PRD.md` and find the task you want to implement (Task 6.0)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-6-0.md`

## 1. Task Overview

### Task Title
**Title:** Display Enhancements & Formatting - Advanced Display Features

### Goal Statement
**Goal:** Implement advanced display formatting features including status indicators, measurement display formatting, and battery simulation. This task focuses on the remaining display enhancements not completed in Tasks 2.0/2.12, specifically: configuration status display on home screen, proper decimal precision for measurement values, firmware-accurate formatting for all measurement types (Leq, Lmax, Lmin, SEL, Peak, Dose), and battery indicator with simulated runtime reduction when backlight is ON.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, FSM-based state management

### Current State
- ✅ Task 2.0 completed - Core interaction system with button handlers
- ✅ Task 2.12 completed - Display rendering infrastructure
- ✅ Task 5.0 completed - Measurement engine with SPL generation and calculations
- ✅ 6.1-6.5, 6.11-6.12 already completed (moved to Task 2.0/2.12)
- ✅ LCD backlight states (green/gray tint) working
- ✅ Soft key labels displaying correctly
- ✅ Display refresh on state changes working
- ❌ 6.6 Status indicator on home screen not implemented
- ❌ 6.7-6.9 Measurement display formatting needs firmware-accurate precision
- ❌ 6.10 Battery indicator not implemented

---

## 3. Context & Problem Definition

### Problem Statement
While the display infrastructure is complete, the formatting and presentation of measurement data needs refinement to match firmware R.13J specifications exactly. The home screen lacks configuration status indicators (Weighting, Time Constant, Range), measurement values may not use proper decimal precision, and there's no battery indicator simulation. These enhancements are critical for realistic training scenarios.

### Success Criteria
- [x] 6.1: Create `js/display.js` module for LCD rendering and display management (completed in Task 2.0)
- [x] 6.2: Implement LCD rendering with green tint overlay when backlight is ON (completed in Task 2.0)
- [x] 6.3: Implement LCD rendering with gray tint overlay when backlight is OFF (completed in Task 2.0)
- [x] 6.4: Create display renderer for home screen with device name and firmware version (moved to Task 2.12)
- [x] 6.5: Implement soft key label display at bottom of LCD showing labels for buttons 1-4 (moved to Task 2.12)
- [ ] 6.6: Create status indicator display showing current configuration (Weighting, Time Constant, Range) on home screen
- [ ] 6.7: Extract measurement display format specifications from firmware R.13J manuals
- [ ] 6.8: Implement measurement reading display with proper decimal precision and unit display
- [ ] 6.9: Format Leq, Lmax, Lmin, SEL, Peak, and Dose according to firmware specifications
- [ ] 6.10: Implement battery indicator display (simulated 10% runtime reduction when backlight ON)
- [x] 6.11: Create display update function that refreshes LCD content based on current state (moved to Task 2.12)
- [x] 6.12: Implement display refresh on state changes (menu navigation, measurement updates, config changes) (moved to Task 2.12)

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Enhancement - refining existing display system
- **Breaking Changes:** Minimal - enhancing existing functionality
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High accuracy - must match firmware R.13J display formatting exactly

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements:**

1. Home screen must display current configuration: Weighting (A/C/Z/F), Time Constant (S/F/I), Range
2. All measurement values must use proper decimal precision (typically X.X dB format)
3. Measurement labels must match firmware exactly (Leq, Lmax, Lmin, SEL, Peak, Dose)
4. Battery indicator must show charge level
5. Battery should simulate 10% faster drain when backlight is ON
6. All display formatting must match firmware R.13J specifications

### Non-Functional Requirements
- **Performance:** No external resources, instant rendering, no layout shifts
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** Display must be readable and match real device appearance
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Theme Support:** LCD supports backlight states (green/gray tint) - already implemented

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All formatting must be consistent across all screens

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates
- **Battery State:** `{ level: number (0-100), isCharging: boolean, drainRate: number }`
- **Display Format Config:** `{ decimalPrecision: 1, unitSuffix: 'dB', placeholderValue: '--.-' }`

### Data Migration Plan
N/A - No data migration needed

---

## 7. API & Backend Changes

### Data Access Pattern Rules
N/A - Pure frontend, no backend

### Server Actions
N/A - No backend

### Database Queries
N/A - No database

---

## 8. Frontend Changes

### New Components
- **Battery Indicator:** Visual battery icon with level display in status bar
- **Status Indicator:** Configuration display (Weighting/Time Constant/Range) on home screen

### Page Updates
- `js/display.js` - Add battery indicator rendering, status indicator rendering
- `js/fsm/mainFSM.js` - Add battery state management
- `data/screen-atlas.json` - Update home screen to include status indicators

### State Management
- Battery level tracked in FSM state
- Battery drain calculated based on runtime and backlight state
- Display formatting functions centralized in display.js

---

## 9. Implementation Plan

### Phase 1: Status Indicator (6.6)
1. **6.6** Add configuration status display to home screen showing Weighting, Time Constant, Range

### Phase 2: Measurement Formatting (6.7-6.9)
2. **6.7** Extract and document exact display format specifications from firmware R.13J
3. **6.8** Implement consistent decimal precision (X.X) for all measurement values
4. **6.9** Ensure Leq, Lmax, Lmin, SEL, Peak, Dose labels and formats match firmware

### Phase 3: Battery Indicator (6.10)
5. **6.10** Implement battery indicator with:
   - Visual battery icon in status bar
   - Level percentage display
   - Simulated drain (10% faster when backlight ON)

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact display formats
- Test each sub-task before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (6.6-6.10) is completed
- Mark parent task 6.0 complete when all remaining sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `js/display.js` - Add battery indicator, status indicator, formatting functions
- `js/fsm/mainFSM.js` - Add battery state management
- `data/screen-atlas.json` - Update screens with status indicators

**Files to Reference:**
- `PRD.md` - Requirements reference
- `assets/Quest Sound Meter.png` - Device background image
- Firmware R.13J documentation PDFs in `Documents/` folder

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for display requirements
   - Review firmware R.13J documentation for exact formats
   - Understand current display.js implementation
   - Check Task 5.0 for measurement value sources

2. **Implement Sub-tasks Sequentially:**
   - Implement 6.6: Status indicator on home screen
   - Implement 6.7: Extract firmware display format specs
   - Implement 6.8: Proper decimal precision for measurements
   - Implement 6.9: Format all measurement types correctly
   - Implement 6.10: Battery indicator with drain simulation

3. **Testing:**
   - Test each feature matches firmware R.13J display
   - Verify all PRD requirements are met
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining formatting logic
   - Document any deviations from firmware (should be none)

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive
- JavaScript should use ES6 modules pattern
- Comment formatting calculations
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- None expected - enhancing existing display system

**Performance Concerns:**
- Battery drain calculation should be efficient
- Formatting functions should be fast for real-time updates

**User Workflow Impacts:**
- Status indicators improve user awareness of current settings
- Battery indicator adds realism to training scenarios

**Future Dependencies:**
- Task 7.0 (Data Logging) may use display formatting functions
- Task 8.0 (Calibration) will need consistent display formatting

**Risk Mitigation:**
- Test against firmware R.13J documentation
- Verify all edge cases (min/max values, placeholder values)
- Document formatting specifications

---

**Ready to Implement?**
This task implements Display Enhancements & Formatting (Task 6.0). Only sub-tasks 6.6-6.10 remain. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** December 2024  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

