# AI Task Planning - Task 1.0: Device Structure & Visual Layout

> **How to Use This Template:**
> 1. Specify your task list file: `tasks-PRD.md` (e.g., `tasks-PRD.md`, `my-tasks.md`, etc.)
> 2. Open `tasks-PRD.md` and find the task you want to implement (e.g., 2.0, 3.0, etc.)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-1-0.md` (e.g., `task-2-0.md`)

## 1. Task Overview

### Task Title
**Title:** Device Structure & Visual Layout - Building HTML/CSS Foundation with Overlay Positioning

### Goal Statement
**Goal:** Create the foundational HTML structure and CSS layout for the Quest SoundPro SE-DL simulation. The device photo ("Quest Sound Meter.png") serves as the complete visual background, and all interactive elements (LCD display, buttons) must be positioned as overlays matching the exact locations in the photo. The photo may be smaller than 1920×1080 (with alpha channel), and should be centered horizontally with padding top/bottom, fitting the screen height. A colored background will be placed behind the device photo. This establishes the 1920×1080 canvas and proper overlay positioning system that all subsequent features will build upon.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture

### Current State
- `index.html` exists but needs complete rebuild to match PRD specifications
- `css/styles.css` exists with some basic styling but needs complete restructuring for overlay positioning
- Device photo exists: `assets/Quest Sound Meter.png` - this IS the device background
- Current HTML structure uses a placeholder device housing div - needs to be replaced with photo background
- Current CSS uses flexbox layout but needs absolute positioning for overlays to match photo exactly
- Dialog overlay structure exists but may need refinement
- No previous tasks completed - this is the foundation task

---

## 3. Context & Problem Definition

### Problem Statement
The current implementation uses placeholder graphics and approximate positioning. The PRD requires that the device photo itself serves as the complete visual representation, with all interactive elements positioned as overlays matching the exact button and LCD locations visible in the photo. This requires:
1. Setting the device photo as the background image
2. Using absolute positioning to place LCD and buttons exactly where they appear in the photo
3. Ensuring proper scaling and positioning for the 1920×1080 canvas
4. Creating a maintainable overlay system that future developers can easily adjust

### Success Criteria
- [ ] 1.1: Create HTML structure in `index.html` with 1920×1080 device container div
- [ ] 1.2: Add colored background to device container and set device photo image element (not background-image) with alt text
- [ ] 1.2: Style device photo to center horizontally, fit screen height with padding top/bottom (photo may be smaller than 1920×1080 with alpha channel)
- [ ] 1.3: Create LCD display region div (~1400×640px) positioned as overlay where LCD appears in photo
- [ ] 1.4: Create LCD content structure with main display area, status area, and soft key labels area
- [ ] 1.5: Create soft key button elements (1-4) positioned as overlays matching photo button locations (match photo button sizes exactly)
- [ ] 1.6: Create navigation cluster (Up/Down/Left/Right/Enter) positioned as overlay matching photo (match photo button sizes exactly)
- [ ] 1.7: Create function button elements (Alt f, Backlight, Run/Pause, Stop, On/Off) positioned as overlays matching photo (match photo button sizes exactly)
- [ ] 1.8: Create dialog overlay system HTML structure for warnings and confirmations
- [ ] 1.9: Build CSS layout in `styles.css` using Grid/Flexbox for proper positioning of all overlays
- [ ] 1.10: Style device container with colored background and scale properly in 1920×1080 canvas, style initial state to match powered off state
- [ ] 1.11: Position all interactive elements (buttons, LCD) as overlays using absolute positioning to match photo exactly, add semi-transparent overlay indicators for testing
- [ ] 1.12: Add CSS :hover/:active states, perform user testing, adjust positioning, create reference documentation, remove testing overlays
---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New development - building Quest SoundPro SE-DL simulation
- **Breaking Changes:** Acceptable - rebuilding to match PRD exactly
- **Data Handling:** N/A - in-memory state only, no persistence
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High stability - must match firmware R.13J behavior exactly

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements 1-7:**

1. **HTML Structure:** Create HTML structure for 1920×1080 canvas that serves as device container
2. **Device Background:** Use "Quest Sound Meter.png" as device image - photo IS the device, may be smaller than 1920×1080 with alpha channel
3. **Photo Positioning:** Center device photo horizontally, fit to screen height with padding top/bottom, place colored background behind photo
4. **LCD Overlay:** Implement LCD display region (~1400×640px) positioned as overlay where LCD appears in photo
5. **LCD Content Structure:** Create LCD content structure with main display area, status area, and soft key labels area
6. **Soft Key Overlays:** Place soft key buttons (1-4) as interactive overlays positioned to match photo button locations (match photo button sizes exactly)
7. **Navigation Overlay:** Place navigation cluster (Up/Down/Left/Right/Enter) as overlay matching photo (match photo button sizes exactly)
8. **Function Button Overlays:** Place function buttons (Alt f, Backlight, Run/Pause, Stop, On/Off) as overlays matching photo (match photo button sizes exactly)
9. **Dialog System:** Create dialog overlay HTML structure for warnings and confirmations
10. **CSS Layout:** Build CSS layout using Grid/Flexbox for container, absolute positioning for overlays
11. **Initial State:** Style initial state to match powered off state (all elements visible but inactive)
12. **Button Styling:** Buttons are solid (do not light up when on/pressed) - visual states handled in Task 2.0+
13. **Testing Overlays:** Add semi-transparent overlay indicators for Task 1.0 positioning verification (remove after testing)
14. **Scaling:** Style device container to scale properly in 1920×1080 canvas
15. **Precise Positioning:** Position all interactive elements using absolute positioning to match photo exactly
16. **Accessibility:** Add alt text to device image
17. **Documentation:** Create reference document with button coordinates and positioning notes

### Non-Functional Requirements
- **Performance:** No external resources, instant rendering, no layout shifts
- **Security:** N/A - static HTML/CSS/JS, offline operation
- **Usability:** All interactions must match firmware R.13J behavior exactly
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Theme Support:** LCD supports backlight states (green/gray tint) - implemented in Task 6.0

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates
N/A - No data models needed for this task (pure HTML/CSS layout)

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
- **Device Container:** Main 1920×1080 container div
- **LCD Display Region:** Overlay div for LCD screen (~1400×640px)
- **LCD Content:** Internal structure with main, status, and softkey areas
- **Soft Key Buttons:** 4 overlay buttons positioned on photo
- **Navigation Cluster:** 5-button overlay (Up/Down/Left/Right/Enter)
- **Function Buttons:** 5 overlay buttons (Alt f, Backlight, Run/Pause, Stop, On/Off)
- **Dialog Overlay:** Modal overlay system for warnings/confirmations

### Page Updates
- `index.html` - Complete rebuild with proper structure and overlay elements
- `css/styles.css` - Complete rebuild with overlay positioning system

### State Management
- No state management needed for this task (pure layout)
- State management will be added in Task 2.0
- Visual states (powered off appearance) handled via CSS classes

---

## 9. Implementation Plan

### Phase 1: Initial Setup
1. **1.1** Create HTML structure in `index.html` with 1920×1080 device container div
2. **1.2** Add colored background to device container and set device photo image element (not background-image) with alt text
3. **1.2** Style device photo to center horizontally, fit screen height with padding top/bottom (photo may be smaller than 1920×1080 with alpha channel)
4. **1.3** Create LCD display region div (~1400×640px) positioned as overlay where LCD appears in photo
5. **1.4** Create LCD content structure with main display area, status area, and soft key labels area
6. **1.5** Create soft key button elements (1-4) positioned as overlays matching photo button locations (match photo button sizes exactly)
7. **1.6** Create navigation cluster (Up/Down/Left/Right/Enter) positioned as overlay matching photo (match photo button sizes exactly)
8. **1.7** Create function button elements (Alt f, Backlight, Run/Pause, Stop, On/Off) positioned as overlays matching photo (match photo button sizes exactly)
9. **1.8** Create dialog overlay system HTML structure for warnings and confirmations
10. **1.9** Build CSS layout in `styles.css` using Grid/Flexbox for proper positioning of all overlays
11. **1.10** Style device container with colored background and scale properly in 1920×1080 canvas, style initial state to match powered off state
12. **1.11** Position all interactive elements (buttons, LCD) as overlays using absolute positioning to match photo exactly, add semi-transparent overlay indicators for testing
13. **1.12** Add CSS :hover/:active states, perform user testing, adjust positioning, create reference documentation, remove testing overlays

**Note:** For easier collaborative position adjustment, see Task 1.5: Interactive Positioning Debug Tool (implemented after Task 1.0 is complete).

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact behavior
- Test each sub-task before moving to next
- Update task checkboxes in `tasks-PRD.md` as work progresses
- Reference relevant files from `tasks-PRD.md` "Relevant Files" section

### Debugging & Positioning Adjustment Workflow

**🎯 Quick Start: How You Can Help Adjust Button Positions**

After Task 1.0 implementation, if buttons are misaligned, you have several ways to help:

1. **Easiest Method (Recommended):** Use the Interactive Debug Tool (Task 1.5)
   - After Task 1.5 is implemented, press `Ctrl+D` (or `Cmd+D` on Mac) to open the debug panel
   - Click any misaligned button to select it
   - Adjust the position/size using the input fields
   - Click "Export CSS" to copy the corrected CSS
   - Share the CSS code with the developer or paste into styles.css
   - **See Task 1.5 for complete debug tool implementation**

2. **Visual Feedback Method:** 
   - Report: "Soft Key 1 needs to move 20px left and 10px up"
   - Developer adjusts CSS accordingly

3. **Coordinate Method:**
   - Use browser DevTools to find current coordinates
   - Report: "Soft Key 1 should be at top: 850px, left: 400px" (currently at top: 870px, left: 420px)

See "How You Can Help Adjust Positions" section (item 9) below for detailed instructions on each method.

---

**When buttons are misaligned, use this iterative process:**

1. **Visual Inspection Methods:**
   - Add semi-transparent overlay indicators (rgba(255, 0, 0, 0.3) background with border) to all buttons
   - Open HTML file in browser and visually compare overlay positions to photo button locations
   - Use browser DevTools to inspect element positions and dimensions
   - Zoom in/out to check alignment at different scales

2. **Measurement Techniques:**
   - **Browser DevTools:** Right-click button → Inspect → View computed styles (top, left, width, height)
   - **Image Editing Software:** Open photo in Photoshop/GIMP, use rulers/guides to measure button coordinates
   - **JavaScript Console:** Use `getBoundingClientRect()` to get exact pixel positions:
     ```javascript
     document.querySelector('.soft-key-1').getBoundingClientRect()
     ```
   - **CSS Overlay Grid:** Create temporary grid overlay in CSS to visualize coordinates

3. **Adjustment Process:**
   - Identify misaligned button (e.g., "Soft Key 1 is 10px too far left")
   - Open `css/styles.css` and locate the button's CSS rule
   - Adjust `top` and `left` values in small increments (e.g., 5-10px at a time)
   - Save CSS file and refresh browser to see changes
   - Repeat until button matches photo location exactly
   - Document final coordinates in CSS comments: `/* Positioned at top: 850px, left: 400px - verified by visual inspection */`

4. **Button Size Adjustment:**
   - Measure button size from photo (width × height)
   - Update CSS `width` and `height` properties to match exactly
   - Ensure aspect ratio matches photo button shape

5. **Testing Checklist:**
   - [ ] All buttons visible and properly sized
   - [ ] Button positions match photo locations visually
   - [ ] Buttons are clickable (cursor changes to pointer on hover)
   - [ ] No buttons overlap or are cut off
   - [ ] LCD overlay positioned correctly over photo LCD area
   - [ ] Dialog overlay centers properly above all content

6. **Documentation:**
   - After positioning is verified, document all coordinates in `button-positioning-reference.md`
   - Include: button name, top position, left position, width, height
   - Note any special positioning considerations
   - Remove semi-transparent testing overlays after documentation is complete

7. **Common Issues & Solutions:**
   - **Buttons too far left/right:** Adjust `left` property
   - **Buttons too high/low:** Adjust `top` property
   - **Buttons wrong size:** Adjust `width` and `height` properties
   - **Buttons overlapping:** Check z-index and positioning context
   - **Photo scaling affects positioning:** Ensure photo scaling is consistent, adjust button positions relative to scaled photo

8. **Interactive Debug Tool (Optional - See Task 1.5):**
   
   For easier collaborative position adjustment, implement Task 1.5: Interactive Positioning Debug Tool after Task 1.0 is complete.
   
   The debug tool provides:
   - Keyboard shortcut (Ctrl+D / Cmd+D) to toggle debug mode
   - Visual overlays showing button boundaries and coordinates
   - Click-to-select buttons for editing
   - Real-time position adjustment with input fields
   - One-click CSS export functionality
   
   **See `task-1-5-positioning-debug-tool.md` for complete implementation details.**

9. **How You Can Help Adjust Positions:**

   **Method 1: Using the Interactive Debug Tool (Easiest - Requires Task 1.5)**
   1. Ensure Task 1.5 (Interactive Positioning Debug Tool) is implemented
   2. Open the HTML file in browser (localhost)
   3. Press `Ctrl+D` (or `Cmd+D` on Mac) to enable debug mode
   4. Click on any misaligned button to select it
   5. Adjust position/size using input fields in debug panel
   6. Click "Export CSS" to copy the corrected CSS
   7. Share the CSS with developer or paste into styles.css
   8. **See Task 1.5 documentation for detailed usage instructions**

   **Method 2: Visual Feedback Method**
   1. Open HTML file in browser
   2. Right-click misaligned button → Inspect
   3. Note the current `top` and `left` values
   4. Visually estimate how much to adjust (e.g., "move 20px left")
   5. Report: "Soft Key 1 needs to move 20px left and 10px up"
   6. Developer adjusts CSS accordingly

   **Method 3: Browser DevTools Coordinates**
   1. Open HTML file in browser
   2. Right-click button → Inspect
   3. In DevTools, hover over the element in Elements panel
   4. Note the coordinates shown in tooltip
   5. Click button in photo to see where it should be
   6. Report: "Soft Key 1 should be at top: 850px, left: 400px" (current: top: 870px, left: 420px)

   **Method 4: Screenshot Annotation**
   1. Take screenshot of current state
   2. Mark where buttons should be positioned
   3. Annotate with measurements
   4. Share screenshot with developer

10. **Quick CSS Debug Overlay (Simple Method):**
   ```css
   /* Add this to styles.css for visual debugging during positioning */
   .soft-key,
   .nav-button,
   .function-button {
     /* Semi-transparent red overlay for testing */
     background-color: rgba(255, 0, 0, 0.3) !important;
     border: 2px solid rgba(255, 0, 0, 0.8) !important;
   }
   
   /* Remove after positioning is verified */
   ```

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (X.1-X.N) is completed
- Mark parent task 1.0 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `index.html` - Complete rebuild with proper structure and overlay elements
- `css/styles.css` - Complete rebuild with overlay positioning system

**Files to Create:**
- `button-positioning-reference.md` - Reference documentation with all button coordinates, sizes, and LCD coordinates

**Note:** For interactive positioning debug tool, see Task 1.5 which creates `js/debug-positioning.js`.

**Files to Reference:**
- `PRD.md` - Requirements reference
- `assets/Quest Sound Meter.png` - Device background image
- `assets/Quest Sound Dosimeter.png` - Calibration machine reference (if applicable)
- Firmware R.13J documentation PDFs in `Documents/` folder

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements
   - Review relevant firmware R.13J documentation
   - Understand current codebase state
   - Check previous completed tasks for dependencies

2. **Implement Sub-tasks Sequentially:**
      - Implement 1.1: Create HTML structure in `index.html` with 1920×1080 device container div
   - Implement 1.2: Add colored background to device container and set device photo image element (not background-image) with alt text
   - Implement 1.2: Style device photo to center horizontally, fit screen height with padding top/bottom (photo may be smaller than 1920×1080 with alpha channel)
   - Implement 1.3: Create LCD display region div (~1400×640px) positioned as overlay where LCD appears in photo
   - Implement 1.4: Create LCD content structure with main display area, status area, and soft key labels area
   - Implement 1.5: Create soft key button elements (1-4) positioned as overlays matching photo button locations (match photo button sizes exactly)
   - Implement 1.6: Create navigation cluster (Up/Down/Left/Right/Enter) positioned as overlay matching photo (match photo button sizes exactly)
   - Implement 1.7: Create function button elements (Alt f, Backlight, Run/Pause, Stop, On/Off) positioned as overlays matching photo (match photo button sizes exactly)
   - Implement 1.8: Create dialog overlay system HTML structure for warnings and confirmations
   - Implement 1.9: Build CSS layout in `styles.css` using Grid/Flexbox for proper positioning of all overlays
   - Implement 1.10: Style device container with colored background and scale properly in 1920×1080 canvas, style initial state to match powered off state
   - Implement 1.11: Position all interactive elements (buttons, LCD) as overlays using absolute positioning to match photo exactly, add semi-transparent overlay indicators for testing
   - Implement 1.12: Add CSS :hover/:active states, perform user testing, adjust positioning, create reference documentation, remove testing overlays

3. **Testing & Positioning Verification:**
   - Add semi-transparent overlay indicators to all buttons for visual debugging
   - Open HTML file in browser and visually inspect button alignment against photo
   - Use browser DevTools to inspect element positions (getBoundingClientRect())
   - Click each button to verify hit areas match photo button locations
   - Adjust CSS positioning values (top/left) incrementally until alignment is perfect
   - Document final coordinates in CSS comments and `button-positioning-reference.md`
   - Remove testing overlays after positioning is verified
   - Test each feature matches firmware R.13J behavior
   - Verify all PRD requirements are met
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining complex logic
   - Document any deviations from firmware (should be none)
   - Update implementation notes

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues or ambiguities in requirements
- Ask for clarification if firmware documentation is unclear

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- JavaScript should use ES6 modules pattern
- Comment complex calculations and state transitions
- Use consistent indentation (2 spaces)
- Ensure all code works offline without external dependencies
- Match firmware R.13J behavior exactly

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Complete HTML structure rebuild will break any existing JavaScript selectors
- CSS class names may change - will need to update JavaScript in Task 2.0
- Current styling will be completely replaced

**Performance Concerns:**
- Ensure efficient rendering and state updates
- No unnecessary DOM manipulation
- Optimize calculations for real-time updates (if applicable)

**User Workflow Impacts:**
- Must match real device behavior exactly for effective training
- All interactions must feel natural and responsive

**Future Dependencies:**
- Task 2.0 depends on proper button positioning
- Task 6.0 depends on LCD overlay structure
- Menu system (Task 3.0) depends on soft key button positioning
- All measurement features depend on button event handlers (Task 2.0+)

**Risk Mitigation:**
- Test against firmware R.13J documentation
- Verify all edge cases are handled
- Document any assumptions made

---

**Ready to Implement?**
This task implements Device Structure & Visual Layout. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete. This is the foundation task - all subsequent tasks depend on accurate overlay positioning.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

