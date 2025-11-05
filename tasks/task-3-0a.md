# AI Task Planning - Task 3.0A: Menu Structure Extraction & Review Document Creation

> **How to Use This Template:**
> 1. This task extracts menu structure from firmware R.13J documentation
> 2. Creates a reviewable menu structure document for user verification
> 3. **STOPS HERE** - Waits for user review and approval before Task 3.0B proceeds

## 1. Task Overview

### Task Title
**Title:** Menu Structure Extraction & Review Document Creation

### Goal Statement
**Goal:** Extract the complete menu structure from firmware R.13J documentation and create a human-readable, reviewable document that can be verified against the physical device. This task creates the source of truth for menu implementation but does NOT implement any code. The reviewable document will be checked against the actual Quest SoundPro SE-DL device to ensure 100% accuracy before Task 3.0B implements the menus in code. This separation ensures accuracy and prevents rework by catching any discrepancies between documentation and actual device behavior before implementation begins.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** Documentation extraction (PDFs, manuals)
- **Database & ORM:** N/A - Documentation only
- **UI & Styling:** N/A - This task creates documentation only
- **Authentication:** N/A
- **Key Architectural Patterns:** Documentation extraction, structured data creation

### Current State
- Task 1.0 completed - HTML structure with device photo, LCD overlay, and all button elements exist in `index.html`
- Task 2.0 completed - Core interaction system implemented:
  - `js/device.js` - Device state management (power on/off, initialization)
  - `js/display.js` - Display state management (device on/off, backlight, screen context)
  - `js/buttons.js` - Button event handlers with short/long press detection, keyboard input
  - `js/menu.js` - Navigation state machine structure (placeholder functions only)
- Firmware documentation PDFs available in `Documents/` folder:
  - SoundPro_SE_DL_User_Manual_053-576.pdf
  - SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf
  - QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf
- No menu structure documented yet
- No reviewable menu document exists

---

## 3. Context & Problem Definition

### Problem Statement
Before implementing the menu system in code, we need an accurate, verified menu structure that matches the actual device. The firmware documentation may not perfectly match the physical device behavior, or may be missing details. By creating a reviewable document first, the user can verify the menu structure against the actual Quest SoundPro SE-DL device and make corrections before any code is written. This prevents rework and ensures 100% accuracy.

The PRD requires:
1. Main menu structure matching firmware R.13J extracted from provided manuals
2. Hierarchical sub-menu navigation following firmware menu tree
3. Soft key label mappings for each menu screen
4. Alt f alternate menu soft key mappings
5. Dialog text, warning messages, and confirmation prompts
6. Exact menu item labels and navigation paths

Without accurate menu structure documentation, Task 3.0B cannot proceed correctly. This task establishes the verified source of truth.

### Success Criteria
- [ ] 3.0A.1: Extract main menu structure from firmware R.13J manuals
- [ ] 3.0A.2: Extract all sub-menu structures and hierarchy
- [ ] 3.0A.3: Document menu item labels exactly as they appear in firmware
- [ ] 3.0A.4: Extract and document soft key label mappings for each menu screen
- [ ] 3.0A.5: Extract and document Alt f alternate soft key mappings
- [ ] 3.0A.6: Extract and document all dialog text, warnings, and confirmation messages
- [ ] 3.0A.7: Create reviewable menu structure document (JSON or Markdown format)
- [ ] 3.0A.8: Document menu navigation paths and parent-child relationships
- [ ] 3.0A.9: User reviews document against physical device and provides corrections
- [ ] 3.0A.10: Finalize reviewed menu structure document as source of truth

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Documentation extraction phase - no code implementation
- **Breaking Changes:** N/A - Documentation only
- **Data Handling:** N/A - Documentation files only
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** High accuracy - verified menu structure is critical foundation

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements 13-18:**

1. **Menu Structure Extraction:** Extract complete menu structure from firmware R.13J documentation (all three PDF manuals)
2. **Menu Hierarchy:** Document main menu items and all sub-menus with hierarchical relationships
3. **Menu Item Labels:** Extract exact menu item labels as they appear in firmware/manuals
4. **Soft Key Mappings:** Document which soft key labels (1-4) appear for each menu screen
5. **Alt f Mappings:** Document alternate soft key labels when Alt f is pressed for each menu
6. **Dialog Text:** Extract all dialog text, warning messages, confirmation prompts, and error messages
7. **Navigation Paths:** Document how users navigate between menus (which items lead to which sub-menus)
8. **Reviewable Format:** Create document in human-readable format (JSON or Markdown) that user can easily review and edit

### Non-Functional Requirements
- **Accuracy:** Menu structure must match firmware R.13J documentation exactly
- **Completeness:** All menus, sub-menus, and dialog text must be documented
- **Reviewability:** Document format must be easy to read and edit
- **Verifiability:** User must be able to check document against physical device

### Technical Constraints
- Must extract from provided firmware documentation PDFs
- Document format must be editable (JSON or Markdown)
- No code implementation in this task
- Must wait for user review before proceeding to Task 3.0B

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - Documentation only, no database

### Data Model Updates

**Menu Structure Document Format (to be created):**

**Option 1: JSON Format** (`tasks/menu-structure-review.json`):
```json
{
  "menus": {
    "main": {
      "id": "main",
      "title": "Main Menu",
      "items": [
        {
          "id": "settings",
          "label": "Settings",
          "subMenu": "settings",
          "softKey": 1
        }
      ],
      "softKeys": {
        "1": "Select",
        "2": "Back",
        "3": null,
        "4": null
      },
      "altSoftKeys": {
        "1": "Reset",
        "2": "Back",
        "3": "Default",
        "4": null
      }
    }
  },
  "dialogs": {
    "warning": {
      "id": "measurement_active",
      "title": "Warning",
      "message": "Measurement in progress. Stop measurement?",
      "buttons": ["OK", "Cancel"]
    }
  }
}
```

**Option 2: Markdown Format** (`tasks/menu-structure-review.md`):
- Human-readable markdown with clear sections
- Easy to review and edit
- Can include notes and comments

### Data Migration Plan
N/A - No data migration needed

---

## 7. API & Backend Changes

### Data Access Pattern Rules
N/A - Documentation only

### Server Actions
N/A - No backend

### Database Queries
N/A - No database

---

## 8. Frontend Changes

### New Components

- **Reviewable Menu Structure Document** (`tasks/menu-structure-review.json` or `.md`):
  - Complete menu hierarchy
  - All menu items with labels and IDs
  - Menu navigation paths (parent-child relationships)
  - Soft key label mappings for each menu
  - Alt f alternate soft key mappings
  - Dialog text and messages
  - Notes section for user comments/corrections

### Page Updates

- No code files modified in this task
- Only documentation files created

### State Management

- N/A - Documentation only, no state management

---

## 9. Implementation Plan

### Phase 1: Menu Structure Extraction (3.0A.1-3.0A.3)

1. **3.0A.1** Extract main menu structure from firmware R.13J manuals
   - Review SoundPro_SE_DL_User_Manual_053-576.pdf for main menu structure
   - Review SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf for menu references
   - Review QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf for menu details
   - Document all top-level main menu items
   - Document menu item order as it appears in firmware
   - Create initial menu structure outline

2. **3.0A.2** Extract all sub-menu structures and hierarchy
   - For each main menu item, identify if it has a sub-menu
   - Document all sub-menu items
   - Document sub-menu item order
   - Map parent-child relationships (which main menu item leads to which sub-menu)
   - Document any nested sub-menus (sub-menus of sub-menus)
   - Create complete menu hierarchy tree

3. **3.0A.3** Document menu item labels exactly as they appear in firmware
   - Extract exact text for each menu item label
   - Ensure spelling and capitalization match firmware exactly
   - Document any abbreviations or special characters
   - Note any menu items that might be conditional or context-dependent

### Phase 2: Soft Key & Alt f Mapping (3.0A.4-3.0A.5)

4. **3.0A.4** Extract and document soft key label mappings for each menu screen
   - For each menu (main and all sub-menus), identify which soft key labels appear
   - Document soft key labels 1-4 for each menu (or null if not used)
   - Document which menu actions are mapped to which soft keys
   - Note any context-dependent soft key labels (e.g., different labels based on device state)

5. **3.0A.5** Extract and document Alt f alternate soft key mappings
   - For each menu, identify alternate soft key labels when Alt f is pressed
   - Document Alt f soft key labels 1-4 for each menu (or null if not used)
   - Document which alternate menu actions are mapped to which soft keys
   - Note which menus have Alt f functionality vs. which don't

### Phase 3: Dialog Text Extraction (3.0A.6)

6. **3.0A.6** Extract and document all dialog text, warnings, and confirmation messages
   - Review firmware manuals for all dialog text
   - Extract warning messages exactly as they appear
   - Extract confirmation prompts exactly as they appear
   - Extract error messages exactly as they appear
   - Extract information dialogs exactly as they appear
   - Document dialog button labels (OK, Cancel, Yes, No, etc.)
   - Document which actions trigger which dialogs

### Phase 4: Document Creation (3.0A.7-3.0A.8)

7. **3.0A.7** Create reviewable menu structure document (JSON or Markdown format)
   - Choose format: JSON (structured, programmatic) or Markdown (human-readable)
   - Create document file: `tasks/menu-structure-review.json` or `.md`
   - Structure document with all extracted information:
     - Menu hierarchy
     - Menu items with labels
     - Soft key mappings
     - Alt f mappings
     - Dialog text
   - Format document for easy review and editing
   - Add notes section for user comments

8. **3.0A.8** Document menu navigation paths and parent-child relationships
   - Create navigation map showing how users move between menus
   - Document back button behavior (which menu does back return to)
   - Document menu entry points (how to access each menu)
   - Document any special navigation cases (e.g., context-dependent menus)

### Phase 5: User Review (3.0A.9-3.0A.10)

9. **3.0A.9** User reviews document against physical device and provides corrections
   - **STOP IMPLEMENTATION HERE**
   - Present menu structure document to user
   - User checks document against actual Quest SoundPro SE-DL device
   - User provides corrections, additions, or modifications
   - User edits document directly or provides correction notes
   - Wait for user approval before proceeding

10. **3.0A.10** Finalize reviewed menu structure document as source of truth
    - Incorporate user corrections into document
    - Ensure document is complete and accurate
    - Mark document as approved/finalized
    - Document becomes source of truth for Task 3.0B implementation

### Implementation Notes
- Extract menu structure from firmware manuals thoroughly
- Document everything even if uncertain (mark with notes/questions)
- Create document in format that is easy for user to review and edit
- **DO NOT PROCEED TO CODE IMPLEMENTATION** - This task is documentation only
- Wait for user review and approval before Task 3.0B begins
- Document any ambiguities or questions for user to clarify during review

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks-PRD.md` as each sub-task (3.0A.1-3.0A.10) is completed
- Mark parent task 3.0A complete when all sub-tasks are done AND user has approved document
- Verify menu structure document is complete and accurate
- Ensure user has reviewed and approved document before marking complete

---

## 10.5. Review Checklist

### Document Review Criteria

**User should verify:**

1. **Menu Completeness:**
   - [ ] All main menu items are documented
   - [ ] All sub-menu items are documented
   - [ ] No menus are missing from documentation

2. **Menu Accuracy:**
   - [ ] Menu item labels match device exactly (spelling, capitalization)
   - [ ] Menu item order matches device
   - [ ] Menu hierarchy (parent-child) is correct

3. **Soft Key Mappings:**
   - [ ] Soft key labels match device for each menu
   - [ ] Soft key actions are correctly mapped
   - [ ] Empty/unused soft keys are marked as null

4. **Alt f Mappings:**
   - [ ] Alt f alternate labels are documented for applicable menus
   - [ ] Alt f actions are correctly mapped
   - [ ] Menus without Alt f are correctly noted

5. **Dialog Text:**
   - [ ] All dialog text matches device exactly
   - [ ] Warning messages are accurate
   - [ ] Confirmation prompts are accurate
   - [ ] Button labels (OK, Cancel, etc.) are correct

6. **Navigation:**
   - [ ] Navigation paths are correct
   - [ ] Back button behavior is documented correctly
   - [ ] Menu entry points are accurate

### Document Format

**The reviewable document should include:**

- Clear menu hierarchy visualization
- Complete menu item list with labels
- Soft key mappings table/matrix
- Alt f mappings table/matrix
- Dialog text catalog
- Navigation flow diagram or description
- Notes section for user comments/corrections
- Questions/uncertainties marked for user clarification

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Create:**
- `tasks/menu-structure-review.json` or `tasks/menu-structure-review.md` - **REVIEWABLE menu structure document**
  - Complete menu hierarchy extracted from firmware
  - All menu items, labels, and IDs
  - Soft key mappings for each menu
  - Alt f alternate mappings
  - Dialog text
  - **This file must be reviewed and approved by user before Task 3.0B proceeds**
  - User can edit this file directly or provide corrections

**Files to Reference:**
- `PRD.md` - Requirements reference (Requirements 13-18)
- `Documents/SoundPro_SE_DL_User_Manual_053-576.pdf` - Firmware menu structure reference
- `Documents/SoundPro-SE-DL-Quick-Start-Guide_053-776_RevB_Web.pdf` - Firmware menu reference
- `Documents/QUEST-SoundPro-Sound-Level-Meters-SE_DL_US_5002176_RevD_Web.pdf` - Firmware reference
- `tasks/task-2-0.md` - Reference for navigation state machine structure (to understand how menus will be used)

**Files NOT Modified:**
- No code files are modified in this task
- Only documentation files are created

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review PRD.md for overall requirements (Requirements 13-18)
   - Review firmware R.13J documentation PDFs for menu structure
   - Understand that this task is DOCUMENTATION ONLY - no code implementation
   - Understand that user will verify document against physical device

2. **Extract Menu Structure (CRITICAL):**
   - Review all three firmware PDF manuals thoroughly
   - Extract main menu structure
   - Extract all sub-menu structures
   - Extract menu item labels exactly as they appear
   - Extract soft key label mappings
   - Extract Alt f alternate mappings
   - Extract dialog text and messages
   - Document navigation paths and relationships

3. **Create Reviewable Document:**
   - Choose format: JSON (structured) or Markdown (human-readable)
   - Create `tasks/menu-structure-review.json` or `.md`
   - Structure document clearly with all extracted information
   - Format for easy review and editing
   - Add notes/questions section for user clarification

4. **STOP AND PRESENT TO USER:**
   - **DO NOT PROCEED TO CODE IMPLEMENTATION**
   - Present menu structure document to user
   - Wait for user review against physical device
   - Wait for user corrections/approval
   - Only after user approval, Task 3.0B can begin

5. **Finalize Document:**
   - Incorporate user corrections
   - Mark document as approved/finalized
   - Document becomes source of truth for Task 3.0B

### Communication Preferences
- Provide clear, structured menu hierarchy visualization
- Show menu structure in easy-to-review format
- Mark any uncertainties or ambiguities with notes/questions
- Ask user for clarification on any unclear items from firmware
- Present document clearly for user review

### Code Quality Standards
- Document structure should be clear and well-organized
- Use consistent formatting throughout document
- Include all relevant information even if uncertain (mark with notes)
- Document should be easy to edit (JSON or Markdown)

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- N/A - Documentation only, no code changes

**Performance Concerns:**
- N/A - Documentation only

**User Workflow Impacts:**
- User must review menu structure document against physical device
- User provides corrections before implementation begins
- This prevents rework and ensures accuracy

**Future Dependencies:**
- Task 3.0B (Menu Implementation) depends on this reviewed menu structure document
- Task 4.0 (Configuration) depends on menu system from Task 3.0B
- Task 5.0 (Measurement) depends on menu system from Task 3.0B
- All future tasks depend on accurate menu structure

**Risk Mitigation:**
- Extract menu structure thoroughly from all three firmware manuals
- Document everything even if uncertain (mark with notes)
- Wait for user review before implementation
- User verification against physical device ensures accuracy

---

**Ready to Implement?**
This task extracts menu structure from firmware documentation and creates a reviewable document. **CRITICAL: This task does NOT implement any code. It only creates documentation for user review.** After user reviews and approves the menu structure document, Task 3.0B will implement the menus in code.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** October 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

