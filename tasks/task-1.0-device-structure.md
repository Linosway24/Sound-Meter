# AI Task Planning - Task 1.0: Device Structure & Visual Layout

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
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), CSS overlay positioning pattern

### Current State
- `index.html` exists but needs complete rebuild to match PRD specifications
- `css/styles.css` exists with some basic styling but needs complete restructuring for overlay positioning
- Device photo exists: `assets/Quest Sound Meter.png` - this IS the device background
- Current HTML structure uses a placeholder device housing div - needs to be replaced with photo background
- Current CSS uses flexbox layout but needs absolute positioning for overlays to match photo exactly
- Dialog overlay structure exists but may need refinement

---

## 3. Context & Problem Definition

### Problem Statement
The current implementation uses placeholder graphics and approximate positioning. The PRD requires that the device photo itself serves as the complete visual representation, with all interactive elements positioned as overlays matching the exact button and LCD locations visible in the photo. This requires:
1. Setting the device photo as the background image
2. Using absolute positioning to place LCD and buttons exactly where they appear in the photo
3. Ensuring proper scaling and positioning for the 1920×1080 canvas
4. Creating a maintainable overlay system that future developers can easily adjust

### Success Criteria
- [ ] Device container displays "Quest Sound Meter.png" centered horizontally with padding top/bottom, fitting screen height
- [ ] Colored background placed behind device photo (device photo has alpha channel, may be smaller than 1920×1080)
- [ ] Device photo maintains aspect ratio, centered on 1920×1080 canvas
- [ ] LCD display region (~1400×640px) positioned as overlay exactly where LCD appears in photo
- [ ] All 4 soft key buttons positioned as overlays matching photo button locations (button sizes match photo exactly)
- [ ] Navigation cluster (Up/Down/Left/Right/Enter) positioned as overlay matching photo (button sizes match photo exactly)
- [ ] All function buttons (Alt f, Backlight, Run/Pause, Stop, On/Off) positioned as overlays matching photo (button sizes match photo exactly)
- [ ] Dialog overlay system positioned correctly (centered, above all content)
- [ ] All elements use absolute positioning with exact pixel coordinates matching photo
- [ ] Initial state matches powered off state (all elements visible but inactive)
- [ ] Buttons are solid (do not light up when on or pressed) - visual states handled in Task 2.0+
- [ ] Semi-transparent overlay indicators added for Task 1.0 testing (removed after positioning verification)
- [ ] CSS uses Grid/Flexbox for container layout where appropriate
- [ ] All interactive elements are clickable and properly sized
- [ ] Code follows PRD specification: photo IS the device, no graphics need to be built
- [ ] **All buttons have visual feedback on hover/click (:hover/:active CSS states)**
- [ ] **Click testing confirms button hit areas match photo button locations exactly**
- [ ] **Reference documentation created with button coordinates and positioning notes**
- [ ] **Alt text added to device image for accessibility**

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** New development - fresh start, existing files will be overwritten
- **Breaking Changes:** Acceptable - rebuilding from scratch to match PRD exactly
- **Data Handling:** N/A - no data persistence, pure visual layout
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High stability - foundation for all other features, must be pixel-perfect

---

## 5. Technical Requirements

### Functional Requirements

**From PRD Requirements 1-5:**

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
- **Security:** N/A - static HTML/CSS
- **Usability:** All buttons must be easily clickable with proper hit areas
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Theme Support:** LCD supports backlight states (green/gray tint) - will be implemented in Task 6.0

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Photo must serve as background - cannot modify or draw on photo
- All overlays must use absolute positioning relative to positioned parent
- Must maintain exact pixel positions matching photo button locations

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend layout

### Data Model Updates
N/A - No data models yet

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
- **index.html:** Complete rebuild with proper structure and overlay elements
- **css/styles.css:** Complete rebuild with overlay positioning system

### State Management
- No state management needed for this task (pure layout)
- State management will be added in Task 2.0

---

## 9. Implementation Plan

### Phase 1: HTML Structure Setup
1. **1.1** Create device container div with 1920×1080 dimensions
2. **1.2** Add colored background layer to device container
3. **1.2** Add device photo image element (not background-image) with alt text for accessibility
4. **1.2** Style device photo to center horizontally, fit screen height with padding top/bottom (maintain aspect ratio)
5. **1.3** Create LCD display region div with ~1400×640px dimensions
6. **1.4** Create LCD content structure (display-main, display-status, display-softkeys)
7. **1.8** Create dialog overlay HTML structure

### Phase 2: Button Overlay Creation
8. **1.5** Create soft key button elements (1-4) with proper data attributes
9. **1.6** Create navigation cluster structure with all 5 buttons
10. **1.7** Create function button elements for all 5 buttons

### Phase 3: CSS Overlay Positioning
11. **1.9** Build CSS base styles (reset, body, container)
12. **1.10** Style device container with colored background and proper scaling
13. **1.10** Style device photo to center horizontally, maintain aspect ratio, fit height with padding
14. **1.10** Style initial state to match powered off state (all visible but inactive appearance)
15. **1.11** Position LCD overlay using absolute positioning (exact coordinates from photo)
16. **1.11** Position all soft key buttons using absolute positioning (exact coordinates from photo, match photo button sizes exactly)
17. **1.11** Position navigation cluster using absolute positioning (exact coordinates from photo, match photo button sizes exactly)
18. **1.11** Position all function buttons using absolute positioning (exact coordinates from photo, match photo button sizes exactly)
19. **1.11** Position dialog overlay (centered, z-index above all)
20. **1.11** Add semi-transparent overlay indicators to all buttons for testing (semi-transparent background/border)

### Phase 4: Visual Positioning Verification (User Testing Required)
21. **1.12** Add CSS :active/:hover states to all buttons for visual feedback on click
22. **1.12** Verify cursor changes to pointer when hovering over all interactive elements
23. **1.12** **USER TESTING:** User opens HTML file in browser and clicks each button, reports if positioning matches photo location
24. **1.12** **AGENT:** Adjust CSS positioning coordinates (top/left values) based on user feedback for each misaligned button
25. **1.12** Repeat testing/adjustment cycle (steps 23-24) until all buttons are accurately positioned
26. **1.12** Document final positioning coordinates in CSS comments for future reference
27. **1.12** Create reference documentation file (`button-positioning-reference.md`) with all button coordinates, sizes, and LCD coordinates
28. **1.12** Remove semi-transparent overlay indicators after verification (keep :hover/:active states for UX)

### Implementation Notes from Context7 CSS Documentation:
- Use `position: relative` on device container to establish positioning context
- Use `position: absolute` on all overlay elements
- Use `top`, `left`, `right`, `bottom` properties for precise positioning
- Consider using `z-index` to control stacking order (LCD < Buttons < Dialog)
- Use CSS Grid/Flexbox for container layout structure
- Ensure parent container has `position: relative` for absolute children to position relative to it

### Photo Inspection Methodology (Agent Decision):
The agent will determine the best method for extracting button coordinates from the photo. Recommended approaches:
1. **Browser Dev Tools**: Load photo in browser, use element inspector to measure distances
2. **Image Editing Software**: Use Photoshop/GIMP/pixel measurement tools to get exact coordinates
3. **JavaScript Measurement**: Create temporary overlay grid system to measure distances visually
4. **CSS overlay technique**: Use browser dev tools to overlay temporary divs and adjust until they match photo buttons

The agent should document which method was used and why it was chosen. All coordinates should be verified during user testing phase.

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks/tasks-PRD.md` as each sub-task (1.1-1.11) is completed
- Mark parent task 1.0 complete when all sub-tasks are done
- **After implementing buttons: User tests by clicking, provides feedback on positioning**
- **Agent adjusts coordinates based on user feedback, documents changes**
- **Repeat until all buttons accurately match photo locations**
- Test overlay positioning visually against photo after each positioning task
- Verify all buttons are clickable and properly sized

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `index.html` - Complete rebuild with proper structure
- `css/styles.css` - Complete rebuild with overlay positioning

**Files to Create:**
- `button-positioning-reference.md` - Reference documentation with all button coordinates, sizes, and LCD coordinates

**Files to Reference:**
- `assets/Quest Sound Meter.png` - Device background image (already exists, may be smaller than 1920×1080 with alpha channel)
- `PRD.md` - Requirements reference

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Start with HTML Structure:**
   - Read current `index.html` to understand existing structure
   - Create new HTML structure following PRD requirements
   - Create device container div (1920×1080px) with colored background
   - Add device photo as `<img>` element (not background-image) with alt text for accessibility
   - Style photo to center horizontally, maintain aspect ratio, fit height with padding top/bottom
   - Photo may be smaller than 1920×1080 (with alpha channel) - ensure it's centered and fits screen height

2. **Position LCD Overlay:**
   - Inspect photo to identify exact LCD location
   - Use absolute positioning with exact pixel coordinates
   - Set LCD dimensions to ~1400×640px
   - Ensure LCD content structure is properly nested

3. **Position Button Overlays:**
   - Inspect photo to identify exact button locations (use browser dev tools, image editing software, or measuring tool)
   - Use absolute positioning for each button
   - Match button sizes exactly to photo button sizes (measure from photo)
   - Add semi-transparent background/border overlay for testing visibility
   - Ensure proper data attributes for future JavaScript handlers
   - Buttons are solid (do not light up) - visual states handled in Task 2.0+

4. **CSS Positioning Strategy:**
   - Set device container to `position: relative`
   - Set all overlays to `position: absolute`
   - Use pixel-perfect coordinates (top, left values)
   - Use appropriate z-index values (LCD: 1, Buttons: 2, Dialog: 10)

5. **Testing & Iteration (Collaborative Process):**
   - Implement CSS :hover/:active states for all buttons for visual feedback
   - Ensure initial state matches powered off appearance (all visible but inactive)
   - Open HTML file in browser for user testing (browser testing first, Storyline testing at project end)
   - **USER ACTION:** User clicks each button and reports positioning accuracy (e.g., "Soft Key 1 is too far left", "Navigation Up button is perfect")
   - **AGENT ACTION:** Adjust CSS positioning coordinates (top/left values) based on user feedback for misaligned buttons
   - Repeat testing/adjustment cycle until all buttons match photo locations exactly
   - Document final coordinates in CSS comments (e.g., `/* Positioned to match photo button location - verified by click testing */`)
   - Create reference documentation file with all coordinates for future reference
   - Visual inspection against photo
   - Verify all elements are clickable
   - Check scaling behavior
   - Ensure no layout shifts
   - Remove semi-transparent overlay indicators after verification complete

### Communication Preferences
- Provide code snippets showing exact CSS positioning values
- Show before/after HTML structure comparisons
- Report any issues with photo inspection or coordinate identification
- Ask for clarification if photo button locations are unclear

### Code Quality Standards
- Use semantic HTML5 elements
- CSS classes should be descriptive and follow BEM-like naming
- Comment CSS positioning values with note about photo matching
- Use consistent indentation (2 spaces)
- Ensure all overlays have proper cursor: pointer for buttons
- Use CSS custom properties for colors that may change (backlight states)
- **Add CSS :hover and :active states for visual feedback during positioning verification**
- **Add alt text to device image for accessibility**
- **Add semi-transparent overlay indicators to buttons for testing (remove after verification)**
- **Match button sizes exactly to photo button sizes (measure from photo)**
- **Style initial state to match powered off appearance**
- **Test button click hit areas match photo button locations before completing task**
- **Create reference documentation file with all coordinates**

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Complete HTML structure rebuild will break any existing JavaScript selectors
- CSS class names may change - will need to update JavaScript in Task 2.0
- Current styling will be completely replaced

**Performance Concerns:**
- Large background image (1920×1080) - ensure proper image optimization
- Multiple absolute positioned elements - should not impact performance
- No layout recalculations needed - fixed positioning

**User Workflow Impacts:**
- Visual layout will match real device exactly - improves training effectiveness
- Button positioning must be accurate for realistic interaction

**Future Dependencies:**
- Task 2.0 (Core Interaction System) depends on proper button positioning
- Task 6.0 (Display Behavior) depends on LCD overlay structure
- Menu system (Task 3.0) depends on soft key button positioning
- All measurement features depend on button event handlers

**Risk Mitigation:**
- Document exact pixel coordinates in CSS comments for easy adjustment
- Test with actual photo dimensions to ensure accuracy
- Create visual reference guide for button locations
- Use data attributes consistently for JavaScript integration

---

## 14. Context7 CSS Positioning Reference

### Key CSS Patterns for Overlays:

**Parent Container (Positioning Context):**
```css
#device-container {
  position: relative;  /* Establishes positioning context */
  width: 1920px;
  height: 1080px;
  background-color: #1a1a1a;  /* Colored background behind device */
  display: flex;
  align-items: center;  /* Center vertically */
  justify-content: center;  /* Center horizontally */
}

#device-photo {
  max-height: 100vh;  /* Fit screen height */
  width: auto;  /* Maintain aspect ratio */
  padding: 20px 0;  /* Padding top and bottom */
  /* Photo may be smaller than container, centered */
}
```

**Child Overlay (Absolute Positioning):**
```css
.lcd-overlay {
  position: absolute;
  top: 120px;      /* Exact coordinates from photo */
  left: 260px;     /* Exact coordinates from photo */
  width: 1400px;
  height: 640px;
  z-index: 1;
}
```

**Button Overlay Pattern (with Testing Overlay):**
```css
.soft-key {
  position: absolute;
  top: 850px;      /* Match photo button location */
  left: 400px;     /* Match photo button location */
  width: 120px;    /* Match photo button size exactly */
  height: 60px;    /* Match photo button size exactly */
  z-index: 2;
  cursor: pointer;
  /* Semi-transparent overlay for Task 1.0 testing */
  background-color: rgba(255, 0, 0, 0.3);  /* Remove after verification */
  border: 1px solid rgba(255, 0, 0, 0.5);  /* Remove after verification */
}

/* Remove testing overlay after positioning verified */
.soft-key.testing-complete {
  background-color: transparent;
  border: none;
}
```

**Dialog Overlay (Top Layer):**
```css
#dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
}
```

---

**Ready to Implement?**
This task establishes the visual foundation. All subsequent tasks depend on accurate overlay positioning. Take time to match photo exactly - pixel-perfect accuracy is critical for realistic training simulation.

