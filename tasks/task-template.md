# AI Task Planning - Task X.X: [Task Title from [TASK-LIST-FILE]]

> **How to Use This Template:**
> 1. Specify your task list file: `[TASK-LIST-FILE]` (e.g., `tasks-PRD.md`, `my-tasks.md`, etc.)
> 2. Open `[TASK-LIST-FILE]` and find the task you want to implement (e.g., 2.0, 3.0, etc.)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-X-X.md` (e.g., `task-2-0.md`)

## 1. Task Overview

### Task Title
**Title:** [Copy task title from [TASK-LIST-FILE], e.g., "Core Interaction System - Button Handlers and State Management"]

### Goal Statement
**Goal:** [Write one paragraph explaining what you want to achieve and why it matters. Reference the PRD.md for context.]

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
[Describe what exists today - what's working, what's broken, what's missing. Reference previous tasks if applicable.]
- Task X.X completed - [what exists]
- [What needs to be created/modified]
- [What dependencies exist]

---

## 3. Context & Problem Definition

### Problem Statement
[Detailed explanation of the problem, including user impact, pain points, and why it needs to be solved now. Reference PRD.md Functional Requirements section.]

### Success Criteria
[Copy all sub-tasks from [TASK-LIST-FILE] and format as checkboxes:]
- [ ] X.1: [Sub-task description]
- [ ] X.2: [Sub-task description]
- [ ] X.3: [Sub-task description]
[Continue for all sub-tasks...]

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

**From PRD.md Requirements [X-Y]:**

[Copy relevant requirements from PRD.md Functional Requirements section, numbered:]
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]
[Continue as needed...]

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
[Define data structures/types needed for this task:]
- [Data structure 1]: `{ property1: type, property2: type }`
- [Data structure 2]: `{ property1: type, property2: type }`

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
[List new components/modules to create:]
- **[Component Name]:** Description and purpose
- **[Component Name]:** Description and purpose

### Page Updates
[List files to modify (from [TASK-LIST-FILE] Relevant Files section):]
- `[file-path]` - [What needs to be modified]
- `[file-path]` - [What needs to be modified]

### State Management
[Describe how state will be managed:]
- [State management approach]
- [Where state is stored]
- [How state updates trigger UI changes]

---

## 9. Implementation Plan

### Phase 1: Initial Setup
[Break down implementation into phases, using sub-tasks from [TASK-LIST-FILE]:]
1. **[X.1]** [Sub-task description]
2. **[X.2]** [Sub-task description]
3. **[X.3]** [Sub-task description]
[Continue for all sub-tasks...]

### Implementation Notes
- Follow PRD specifications exactly
- Reference firmware R.13J documentation for exact behavior
- Test each sub-task before moving to next
- Update task checkboxes in `[TASK-LIST-FILE]` as work progresses
- Reference relevant files from `[TASK-LIST-FILE]` "Relevant Files" section

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `[TASK-LIST-FILE]` as each sub-task (X.1-X.N) is completed
- Mark parent task X.X complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from PRD.md are met

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
[List files from [TASK-LIST-FILE] "Relevant Files" section that need modification:]
- `[file-path]` - [Description]

**Files to Create:**
[List new files to create:]
- `[file-path]` - [Description]

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
   [List all sub-tasks from [TASK-LIST-FILE]:]
   - Implement X.1: [Sub-task description]
   - Implement X.2: [Sub-task description]
   - Implement X.3: [Sub-task description]
   [Continue for all sub-tasks...]

3. **Testing:**
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
[Describe any breaking changes this task will introduce:]
- [Change 1 and impact]
- [Change 2 and impact]

**Performance Concerns:**
- Ensure efficient rendering and state updates
- No unnecessary DOM manipulation
- Optimize calculations for real-time updates (if applicable)

**User Workflow Impacts:**
- Must match real device behavior exactly for effective training
- All interactions must feel natural and responsive

**Future Dependencies:**
[List which future tasks depend on this task:]
- Task X.X depends on [this feature]
- Task X.X depends on [this feature]

**Risk Mitigation:**
- Test against firmware R.13J documentation
- Verify all edge cases are handled
- Document any assumptions made

---

**Ready to Implement?**
This task implements [Task Title]. Follow PRD specifications exactly and ensure all sub-tasks are completed before marking complete.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

