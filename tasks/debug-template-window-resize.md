# Debug Template: Window Resizing Issues

> **About This Template:** This template is designed for debugging and fixing issues that occur when the browser window is resized. Use this template for any resize-related problems including layout breaks, scaling issues, element misalignment, responsive behavior failures, or proportional sizing problems.

---

## 1. Task Overview

### Task Title
**Title:** [Brief, descriptive title - e.g., "Fix Layout Break on Window Resize" or "Fix Proportional Scaling When Window Resized"]

### Goal Statement
**Goal:** [Clear statement of what resize issue needs to be fixed and why - e.g., "Ensure all UI elements maintain correct proportions and alignment when browser window is resized from mobile (320px) to ultra-wide (2560px+)"]

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** TODO: List your main frameworks and versions
- **Language:** TODO: Specify your programming language and version
- **Database & ORM:** TODO: Define your database and ORM choice (if applicable)
- **UI & Styling:** TODO: List your UI framework and styling approach (CSS, CSS-in-JS, Tailwind, etc.)
- **Layout System:** TODO: Specify your layout approach (Flexbox, Grid, absolute positioning, etc.)
- **Responsive Strategy:** TODO: Define your responsive design approach (mobile-first, desktop-first, breakpoints, etc.)
- **Key Architectural Patterns:** TODO: List your main architectural patterns

### Current State
**Existing Functionality:**
- [ ] Describe current responsive behavior (what works)
- [ ] List existing breakpoints or viewport handling
- [ ] Document current scaling/positioning approach
- [ ] Note any existing resize event handlers or observers

**Known Issues:**
- [ ] List specific elements/components that break on resize
- [ ] Document viewport sizes where issues occur
- [ ] Note any elements that become unclickable or inaccessible
- [ ] Record layout shifts or content overflow problems
- [ ] Document performance issues during resize (lag, jank, reflows)

**Example Issues:**
- Buttons/elements not scaling proportionally with images
- Layout breaks at specific viewport widths
- Elements overlapping or misaligning
- Content overflow or clipping
- Fixed-size elements that should scale
- Responsive images not updating
- CSS variables not recalculating
- JavaScript resize handlers not firing

---

## 3. Context & Problem Definition

### Problem Statement
[Detailed explanation of the specific window resize problem]

**Common Problem Scenarios:**

**Proportional Scaling Issues:**
- Elements that should scale proportionally with images/photos break alignment
- Buttons/overlays don't maintain correct size ratio to background images
- Fixed pixel sizes cause misalignment when parent container scales
- Percentage-based elements don't scale correctly relative to their reference container

**Layout Breakage:**
- Layout collapses or elements stack incorrectly at certain widths
- Flexbox/Grid layouts break at breakpoint boundaries
- Elements overflow their containers
- Horizontal scrolling appears unexpectedly

**Positioning Issues:**
- Absolutely positioned elements drift from their intended location
- Elements anchored to viewport instead of container
- Z-index stacking changes on resize
- Overlays misalign with underlying content

**Content Issues:**
- Text becomes unreadable (too small/large)
- Images don't scale appropriately
- Forms or inputs become unusable
- Navigation breaks or becomes inaccessible

**Performance Issues:**
- Resize triggers excessive reflows/repaints
- Layout thrashing causes lag
- Animation/styling calculations slow down on resize

### Success Criteria
- [ ] Layout maintains correct structure at all tested viewport sizes
- [ ] All elements scale proportionally where required (e.g., buttons scale with images)
- [ ] No horizontal scrolling unless intentionally designed
- [ ] All interactive elements remain clickable/accessible
- [ ] Content remains readable and usable at all sizes
- [ ] No layout shifts or jumping during resize
- [ ] Performance remains smooth during resize operations
- [ ] Responsive breakpoints work as intended
- [ ] Elements maintain visual alignment and spacing relationships

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** TODO: Define if this is new development, production system, or legacy migration
- **Breaking Changes:** TODO: Specify if breaking changes are acceptable or must be avoided
- **Data Handling:** TODO: Define data preservation requirements
- **User Base:** TODO: Describe who will be affected by changes (internal testing, end users, etc.)
- **Priority:** TODO: Set your speed vs stability priorities

---

## 5. Technical Requirements

### Functional Requirements

**Window Resize Behavior:**
- When browser window is resized, elements should [specific behavior]
- Layout should [maintain/adapt] at viewport sizes from [min]px to [max]px
- Elements should scale proportionally with [reference element - e.g., device photo]
- Interactive elements should remain [clickable/accessible] at all sizes
- Content should [wrap/scale/truncate] appropriately

**Proportional Scaling (Example):**
- Buttons/overlays must scale proportionally with background images
- When image scales, related elements should maintain size ratios
- Percentage-based positioning should reference correct parent container
- Element sizes should use relative units (%, em, rem) where appropriate

**Responsive Breakpoints:**
- System should handle breakpoints at: [list breakpoints]
- Mobile (< 768px): [expected behavior]
- Tablet (768px - 1024px): [expected behavior]
- Desktop (1024px+): [expected behavior]
- Ultra-wide (1920px+): [expected behavior]

**Resize Event Handling:**
- Resize observers/listeners should [throttle/debounce] appropriately
- Calculations should [recalculate/maintain cache] on resize
- Animations/transitions should [pause/resume/continue] during resize

### Non-Functional Requirements
- **Performance:** Resize operations should not cause noticeable lag (< 16ms per frame)
- **Responsive Design:** Must work across all target viewport sizes
- **Browser Compatibility:** Must work in [list browsers and versions]
- **Accessibility:** Maintain accessibility standards at all viewport sizes
- **Maintainability:** Solutions should be maintainable and use standard patterns

### Technical Constraints
- Must maintain existing [framework/library/system] compatibility
- Cannot change [specific architectural element]
- Must preserve [specific functionality/behavior]
- Must work with [existing tool/debug system]

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - Typically no database changes for resize issues, unless storing viewport preferences

### Data Model Updates
**CSS Updates (if needed):**
- CSS variable adjustments for responsive values
- Media query additions or modifications
- Unit conversions (px → %, px → em/rem)
- Container query updates (if using container queries)

**JavaScript State (if needed):**
- Viewport size tracking
- Resize observer state management
- Layout calculation caching

### Data Migration Plan
- Backup current CSS/styling files
- Test changes incrementally
- Validate across viewport sizes before finalizing

---

## 7. API & Backend Changes

N/A - Typically frontend-only for resize issues

---

## 8. Frontend Changes

### CSS Updates Required
**Files to Modify:**
- `css/styles.css` (or your stylesheet files)
- Component-specific style files

**Specific Changes:**
- Update positioning units (px → %, px → em/rem)
- Add/modify media queries for breakpoints
- Adjust container sizing and scaling
- Fix overflow/clipping issues
- Update CSS variables for responsive values
- Modify Flexbox/Grid properties

**Proportional Scaling Solutions:**
- Use percentage-based sizing relative to parent container
- Implement aspect-ratio CSS property where applicable
- Use `object-fit` for images that need proportional scaling
- Apply `transform: scale()` for proportional scaling if needed
- Use container-relative units (vw, vh, %) instead of fixed pixels

### JavaScript Updates (if needed)
**Files to Modify:**
- Resize event handlers
- ResizeObserver implementations
- Layout calculation functions

**Potential Changes:**
- Add throttle/debounce to resize handlers
- Implement ResizeObserver for container changes
- Recalculate layout values on resize
- Update dynamic sizing calculations

### Component Updates
**Components/Pages Affected:**
- [ ] List components that need updates
- [ ] Identify pages with resize issues
- [ ] Note any shared components used across pages

---

## 9. Implementation Plan

### Phase 1: Problem Identification & Testing
1. **Test at Multiple Viewport Sizes**
   - Open application in browser developer tools
   - Test responsive mode at breakpoints: [list sizes]
   - Document which elements break at which sizes
   - Take screenshots/videos of problematic states
   - Use browser DevTools to inspect computed styles

2. **Identify Root Cause**
   - Check CSS units (fixed px vs relative %/em/rem)
   - Verify container hierarchy and positioning context
   - Test if issue is proportional scaling, layout, or positioning
   - Check for conflicting CSS rules or specificity issues
   - Review JavaScript resize handlers (if any)

3. **Measure Current State**
   - Document current element sizes at different viewports
   - Measure aspect ratios and proportions
   - Note any hardcoded values that should be relative

### Phase 2: Solution Design
1. **Choose Appropriate Solution**
   - **Proportional Scaling:** Use percentage-based sizing, aspect-ratio, or transform scale
   - **Layout Issues:** Adjust Flexbox/Grid properties, add breakpoints
   - **Positioning:** Fix positioning context, update units to relative
   - **Performance:** Optimize resize handlers, use ResizeObserver

2. **Plan CSS Changes**
   - Map out which selectors need updates
   - Determine if CSS variables can centralize values
   - Plan media query additions/modifications
   - Consider container queries (if supported)

3. **Plan JavaScript Changes (if needed)**
   - Design resize handler improvements
   - Plan layout recalculation approach
   - Consider performance optimizations

### Phase 3: Implementation
1. **Make Incremental Changes**
   - Start with highest-priority/most-visible issues
   - Change one element at a time where possible
   - Test each change immediately after applying
   - Use browser DevTools to verify computed values

2. **Apply Proportional Scaling (if applicable)**
   - Convert fixed pixel sizes to percentages relative to container
   - Ensure elements scale with their reference (e.g., image)
   - Maintain aspect ratios where needed
   - Test scaling at multiple viewport sizes

3. **Fix Layout Issues**
   - Adjust container properties
   - Update Flexbox/Grid configurations
   - Add/modify media queries
   - Fix overflow/clipping

### Phase 4: Validation & Testing
1. **Cross-Viewport Testing**
   - Test at all target breakpoints
   - Verify on actual devices (if possible)
   - Test resize animation smoothness
   - Check for layout shifts or jumps

2. **Edge Case Testing**
   - Very small viewports (< 320px)
   - Very large viewports (> 2560px)
   - Aspect ratio extremes (very wide, very tall)
   - Rapid resize operations

3. **Performance Validation**
   - Profile resize operations for performance
   - Check for excessive reflows/repaints
   - Verify smooth 60fps during resize

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- [ ] **Phase 1 Complete:** All viewport sizes tested, issues documented, root cause identified
- [ ] **Phase 2 Complete:** Solution designed and planned
- [ ] **Phase 3 Complete:** All changes implemented and tested incrementally
- [ ] **Phase 4 Complete:** Cross-viewport validation passed, performance verified

**Progress Notes:**
- Track which elements/components have been fixed
- Note any remaining issues or edge cases
- Document viewport sizes that still need work
- Record performance improvements achieved

---

## 11. File Structure & Organization

### Files to Modify
- `css/styles.css` (or relevant stylesheet files)
- Component style files (if component-scoped)
- JavaScript files with resize handlers (if applicable)

### Files to Reference
- Original design mockups/specifications
- Responsive design guidelines
- Browser compatibility requirements

### New Files (if needed)
- `tasks/debug-resize-log-[date].md` - Session log of issues and fixes
- Separate stylesheet for responsive overrides (if needed)

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Before Making Changes:**
   - Read current CSS/styling files to understand structure
   - Test current state in browser at multiple viewport sizes
   - Use browser DevTools to inspect computed styles and layout
   - Identify whether issue is proportional scaling, layout, or positioning

2. **During Implementation:**
   - Make incremental changes - fix one element/issue at a time
   - Test each change immediately at multiple viewport sizes
   - Use relative units (%, em, rem, vw, vh) instead of fixed pixels where appropriate
   - For proportional scaling: ensure elements scale relative to their container/reference
   - Preserve existing functionality and design intent

3. **When Updating CSS:**
   - Prefer percentage-based sizing for proportional scaling
   - Use CSS variables for shared responsive values
   - Add media queries only when necessary
   - Preserve existing CSS structure and formatting
   - Add comments explaining non-obvious responsive choices

4. **When Updating JavaScript:**
   - Throttle/debounce resize handlers (16ms minimum for smooth performance)
   - Use ResizeObserver for container-based changes when possible
   - Avoid triggering layout calculations unnecessarily
   - Cache computed values when appropriate

5. **After Changes:**
   - Test at all target breakpoints
   - Verify proportional scaling works correctly (if applicable)
   - Check performance during resize operations
   - Document any viewport-specific exceptions or workarounds

### Communication Preferences
- Be direct and specific about sizing/positioning values
- Show before/after comparisons with exact values and viewport dimensions
- Include CSS code blocks with line numbers for changes
- Provide screenshots or describe visual changes clearly
- Report performance metrics if relevant

### Code Quality Standards
- Use relative units (%, em, rem) for responsive sizing
- Maintain consistent unit usage across related elements
- Use CSS variables for shared responsive values
- Add comments for non-obvious responsive choices
- Keep media queries organized and maintainable
- Optimize resize handlers for performance
- Test at multiple viewport sizes before marking complete

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Areas of Concern:**
- **Container Changes:** Changes to parent containers affect all child elements
- **CSS Variable Updates:** Shared variables affect all elements using them
- **Positioning Context:** Changes to positioning affect stacking and layout flow
- **Performance:** Resize handlers can impact overall application performance
- **Cross-Component Impact:** Shared styles/components affect multiple pages

**Proportional Scaling Specific Concerns:**
- **Reference Elements:** Ensure correct parent/reference container for proportional scaling
- **Aspect Ratios:** Maintain aspect ratios when scaling elements
- **Overlay Alignment:** Elements overlaying images must scale with the image
- **Touch Targets:** Ensure scaled elements remain appropriately sized for interaction

**Performance Considerations:**
- Avoid triggering layout recalculations unnecessarily
- Throttle resize handlers to prevent excessive updates
- Use CSS transforms for scaling when possible (better performance than size changes)
- Minimize JavaScript calculations during resize

**User Experience Impacts:**
- Layout shifts during resize should be minimal
- Content should remain readable at all sizes
- Interactive elements should remain accessible
- Animations/transitions should not be jarring during resize

**Testing Checklist:**
- [ ] Verify changes don't break other viewport sizes
- [ ] Test that proportional scaling maintains alignment
- [ ] Check that resize performance remains smooth
- [ ] Validate accessibility at all sizes
- [ ] Test on actual devices (if possible)
- [ ] Verify no layout shifts or content jumps
- [ ] Check edge cases (very small/large viewports)

---

## 14. Common Resize Issues & Solutions Reference

### Proportional Scaling Issues

**Problem: Elements don't scale with images/photos**
- **Solution:** Use percentage-based sizing relative to image container
- **Example:** Change `width: 100px` to `width: 5%` (relative to `.device-frame`)
- **Check:** Ensure percentage references correct parent container

**Problem: Buttons/overlays misalign when window resizes**
- **Solution:** Use same positioning system (all percentage or all calculated)
- **Example:** Convert all positioning to percentages relative to same container
- **Check:** Verify `.offsetParent` or positioning context is consistent

**Problem: Fixed-size elements break layout on resize**
- **Solution:** Convert to relative units (em, rem, %) or use `clamp()`
- **Example:** `width: 200px` → `width: clamp(150px, 10%, 200px)`
- **Check:** Test at minimum and maximum viewport sizes

### Layout Issues

**Problem: Layout breaks at specific breakpoints**
- **Solution:** Add/adjust media queries, fix Flexbox/Grid properties
- **Example:** Add `@media (max-width: 768px) { ... }` with appropriate rules
- **Check:** Test just above and below breakpoint boundaries

**Problem: Horizontal scrolling appears**
- **Solution:** Check for fixed-width elements, overflow settings, viewport meta tag
- **Example:** Ensure `overflow-x: hidden` on body, check for `width: 100vw` issues
- **Check:** Inspect computed widths vs viewport width

### Performance Issues

**Problem: Lag/jank during resize**
- **Solution:** Throttle resize handlers, use ResizeObserver, minimize recalculations
- **Example:** `window.addEventListener('resize', throttle(handler, 16))`
- **Check:** Profile with browser DevTools Performance tab

**Problem: Excessive reflows on resize**
- **Solution:** Batch style reads/writes, use CSS transforms for animations
- **Example:** Read all layout values, then write all style changes together
- **Check:** Use browser DevTools to identify layout thrashing

---

## 15. Debugging Tools & Techniques

### Browser DevTools
- **Responsive Design Mode:** Test multiple viewport sizes quickly
- **Computed Styles:** Inspect actual computed values vs CSS rules
- **Layout Inspector:** Visualize container hierarchy and positioning
- **Performance Profiler:** Identify resize performance issues

### Testing Viewports
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1366px, 1920px
- Ultra-wide: 2560px, 3440px

### CSS Debugging
- Use `outline` or `border` temporarily to visualize element bounds
- Check `getBoundingClientRect()` values in console
- Compare computed styles at different viewport sizes
- Use CSS `@media` queries to test breakpoints

### JavaScript Debugging
- Log resize event frequency
- Measure time between resize and layout update
- Track which elements trigger reflows
- Profile resize handler execution time

---

**🎯 Ready to Debug Your Window Resize Issues?**

Fill out this template with your specific resize problems, then systematically test and fix each issue across all target viewport sizes. Remember: proportional scaling (like buttons scaling with images) is a common issue that requires percentage-based or calculated relative sizing.

---

*This template follows the AI Task Planning Template structure*  
*Adapt this template for any window resize debugging scenario*

