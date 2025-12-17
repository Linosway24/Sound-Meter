# AI Task Planning - Phase 5: Files Menu Enhancements

> **How to Use This Template:**
> 1. Task list file: `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md`
> 2. Phase 5 section (lines 333-415)
> 3. Based on Menu-Structure-v2.5.md Section 7.1-7.7
> 4. Enhances existing basic Files Menu navigation with full functionality

## 1. Task Overview

### Task Title
**Title:** Phase 5: Files Menu Enhancements

### Goal Statement
**Goal:** Complete the Files Menu functionality by implementing file list rendering (with placeholder/simulated data), rename last session functionality with text input, save config file functionality, and enhanced delete confirm navigation with YES/NO selection. This phase extends Phase 1's basic Files Menu navigation to provide full file management capabilities, matching firmware R.13J behavior exactly. Since this is a simulator without actual file system access, file lists will display simulated/placeholder data, and file operations will show appropriate feedback messages.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture, FSM state management

### Current State
- ✅ Phase 1 completed - Startup & Home screens working
- ✅ Phase 2 completed - SLM Core Operation working
- ✅ Phase 3 completed - Setup Menu system fully implemented
- ✅ Phase 4 completed - SLM Multi-Page Views & Softkey Handlers
- ✅ Basic Files Menu navigation exists: `files_menu` with UP/DOWN navigation and ENTER routing
- ✅ Session Directory (`files_session_dir`) - basic navigation, UP/DOWN scrolling
- ✅ Config Directory (`files_config_dir`) - basic navigation, UP/DOWN scrolling
- ✅ Format Card (`files_format_card`) - fully implemented with timer
- ✅ Rename Last Session (`files_rename_last`) - stub implementation (shows toast)
- ✅ Save Config File (`files_save_config`) - stub implementation (shows toast)
- ✅ Delete Confirm (`files_delete_confirm`) - basic implementation (shows toast)
- ⏸️ **File list rendering not implemented** - directories show empty or placeholder
- ⏸️ **Rename functionality not implemented** - no text input/edit capability
- ⏸️ **Save config functionality not implemented** - no actual save operation
- ⏸️ **Delete confirm navigation missing** - no YES/NO selection (LEFT/RIGHT or UP/DOWN)
- ⏸️ **File list state management missing** - no tracking of file lists, selected files, etc.

---

## 3. Context & Problem Definition

### Problem Statement
Currently, the Files Menu provides basic navigation but lacks essential file management functionality. Users cannot see file lists in Session Directory or Config Directory, cannot rename session files, cannot save configuration files, and delete confirmations lack proper YES/NO navigation. This limits the training module's effectiveness as it doesn't demonstrate the full file management capabilities of the actual Quest SoundPro SE-DL device. Phase 5 must implement all these features to complete the Files Menu functionality and match firmware R.13J specifications exactly. Since this is a simulator, file operations will use simulated data and show appropriate success/error feedback.

### Success Criteria
- [ ] 5.1: Implement File List Rendering
  - [ ] 5.1.1: Create file list data structure in FSM state for session files
  - [ ] 5.1.2: Create file list data structure in FSM state for config files
  - [ ] 5.1.3: Add placeholder/simulated file names (e.g., "SES001", "SES002", etc.)
  - [ ] 5.1.4: Render file list in `files_session_dir` screen
  - [ ] 5.1.5: Render file list in `files_config_dir` screen
  - [ ] 5.1.6: Implement file selection highlighting (UP/DOWN navigation)
  - [ ] 5.1.7: Add scrolling support for long file lists
- [ ] 5.2: Implement Rename Last Session Functionality
  - [ ] 5.2.1: Create rename screen with text input field
  - [ ] 5.2.2: Implement text input/edit mode (character-by-character editing)
  - [ ] 5.2.3: Add LEFT/RIGHT cursor movement within text
  - [ ] 5.2.4: Add character input (alphanumeric, limit to valid filename characters)
  - [ ] 5.2.5: Implement ENTER to confirm rename (show success toast)
  - [ ] 5.2.6: Implement ESC to cancel rename
  - [ ] 5.2.7: Store renamed file name in state
- [ ] 5.3: Implement Save Config File Functionality
  - [ ] 5.3.1: Create save config screen with filename input
  - [ ] 5.3.2: Implement filename input/edit (similar to rename)
  - [ ] 5.3.3: Add default filename (e.g., "CONFIG001")
  - [ ] 5.3.4: Implement ENTER to save config (show success toast "Config saved")
  - [ ] 5.3.5: Add saved config file to config directory list
  - [ ] 5.3.6: Implement ESC to cancel save
- [ ] 5.4: Enhance Delete Confirm Navigation
  - [ ] 5.4.1: Add YES/NO selection state to delete confirm screen
  - [ ] 5.4.2: Implement LEFT/RIGHT or UP/DOWN navigation between YES/NO
  - [ ] 5.4.3: Add visual highlighting for selected option (YES or NO)
  - [ ] 5.4.4: Implement ENTER to confirm selection
  - [ ] 5.4.5: If YES selected: delete file, show success toast, return to directory
  - [ ] 5.4.6: If NO selected or ESC: cancel delete, return to directory
- [ ] 5.5: Integrate All Features
  - [ ] 5.5.1: Ensure file lists update after rename/save/delete operations
  - [ ] 5.5.2: Ensure navigation works correctly across all screens
  - [ ] 5.5.3: Test all file operations with appropriate feedback
  - [ ] 5.5.4: Verify state persistence during navigation

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Active development - enhancing Phase 1 Files Menu functionality
- **Breaking Changes:** Minimal - extending existing functionality, adding new state
- **Data Handling:** N/A - in-memory state only, no actual file system access
- **User Base:** Training module students - must work offline in Articulate Storyline Web Object
- **Priority:** Medium accuracy - must match firmware R.13J behavior, but using simulated file data

---

## 5. Technical Requirements

### Functional Requirements

**From Menu-Structure-v2.5.md Section 7.1-7.7:**

1. **Files Root Menu (`files_menu`):**
   - Menu items: Session Directory, Config Directory, Re-Name Last Ses. File, Save Config File, Format Card
   - UP/DOWN: Move highlight between entries
   - ENTER: Open selected files function
   - ESC: Return to Home

2. **Session Directory (`files_session_dir`):**
   - Display list of stored session files (simulated/placeholder)
   - UP/DOWN: Scroll file list
   - ENTER: Future behavior (open, preview) - can show placeholder for now
   - ESC: Return to `files_menu`

3. **Config Directory (`files_config_dir`):**
   - Similar to Session Directory, but for config files
   - Display list of stored config files (simulated/placeholder)
   - UP/DOWN: Scroll file list
   - ESC: Return to `files_menu`

4. **Rename Last Session (`files_rename_last`):**
   - Screen for renaming the last stored session
   - Text input field for filename editing
   - Character-by-character editing with cursor movement
   - ENTER: Confirm rename, show success toast
   - ESC: Cancel and return

5. **Save Config File (`files_save_config`):**
   - Single-action screen to save current configuration as a file
   - Filename input (default: auto-generated name)
   - ENTER: Save config, show success toast "Config saved", then exit
   - ESC: Cancel and return

6. **Delete Confirm (`files_delete_confirm`):**
   - Shows confirmation prompt (YES/NO style)
   - LEFT/RIGHT or UP/DOWN: Move between YES/NO
   - ENTER: Confirm choice
   - ESC: Treat as NO (cancel)

7. **Format Card (`files_format_card`):**
   - ✅ Already implemented - no changes needed
   - Formatting begins immediately on ENTER
   - 2-3 second timer, then auto-return to `files_menu`

### Non-Functional Requirements
- **Performance:** Instant file list rendering, smooth navigation
- **Security:** N/A - static HTML/CSS/JS, offline operation, no actual file system
- **Usability:** All interactions must match firmware R.13J behavior exactly
- **Responsive Design:** Fixed 1920×1080 layout (no responsive design needed)
- **Simulator Constraints:** File operations use simulated data, appropriate feedback messages

### Technical Constraints
- Must use pure HTML/CSS/JS - no build tools, no external libraries
- Must work offline in Articulate Storyline Web Object environment
- Must use DOM-based rendering (not Canvas)
- Must match firmware R.13J specifications exactly
- All code must be maintainable ES6 JavaScript
- File lists use simulated/placeholder data (no actual file system access)
- File operations show appropriate success/error feedback

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates
- **Files State Object:** Extend `_state.files` in FSM:
  ```javascript
  {
    sessionFiles: [
      { name: "SES001", date: "2025-01-15", time: "10:30:00" },
      { name: "SES002", date: "2025-01-14", time: "14:20:00" },
      // ... more placeholder files
    ],
    configFiles: [
      { name: "CONFIG001", date: "2025-01-10", time: "09:15:00" },
      // ... more placeholder files
    ],
    sessionDir: {
      selectedIndex: 0,
      scrollOffset: 0
    },
    configDir: {
      selectedIndex: 0,
      scrollOffset: 0
    },
    renameLastSession: {
      editing: false,
      filename: "SES001", // default or last session name
      cursorPosition: 0
    },
    saveConfig: {
      editing: false,
      filename: "CONFIG001", // auto-generated default
      cursorPosition: 0
    },
    deleteConfirm: {
      selectedOption: "NO" // "YES" or "NO"
    }
  }
  ```

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
- **File List Component:** Scrollable file list with selection highlighting
- **Text Input Component:** Filename input with cursor and character editing
- **Delete Confirm Component:** YES/NO selection with visual highlighting

### Page Updates
- `data/screen-atlas.json` - Update screen definitions:
  - Update `files_session_dir` with file list element
  - Update `files_config_dir` with file list element
  - Update `files_rename_last` with text input field
  - Update `files_save_config` with text input field
  - Update `files_delete_confirm` with YES/NO selection
- `js/fsm/mainFSM.js` - Add handlers:
  - File list navigation (UP/DOWN in directories)
  - Text input/edit handlers (LEFT/RIGHT cursor, character input)
  - Rename last session functionality
  - Save config file functionality
  - Delete confirm YES/NO navigation
  - File list state management
- `js/screen-renderer.js` - Add rendering:
  - File list rendering with scrolling
  - Text input field rendering with cursor
  - Delete confirm YES/NO rendering
  - File operation feedback (toasts)
- `css/styles.css` - Add styles:
  - File list styles with selection highlighting
  - Text input styles with cursor indicator
  - Delete confirm YES/NO selection styles

### State Management
- Extend `_state.files` object in FSM to include:
  - `sessionFiles`: Array of session file objects
  - `configFiles`: Array of config file objects
  - `sessionDir.selectedIndex`: Currently selected file in session directory
  - `sessionDir.scrollOffset`: Scroll position for long lists
  - `configDir.selectedIndex`: Currently selected file in config directory
  - `configDir.scrollOffset`: Scroll position for long lists
  - `renameLastSession`: Rename editing state (editing, filename, cursorPosition)
  - `saveConfig`: Save config editing state (editing, filename, cursorPosition)
  - `deleteConfirm.selectedOption`: Selected option ("YES" or "NO")
- State updates trigger screen re-rendering via existing render system
- File lists update after rename/save/delete operations

---

## 9. Implementation Plan

### Phase 1: File List Rendering (5.1)
1. **[5.1.1]** Create file list data structure in `_state.files.sessionFiles` with placeholder file names
2. **[5.1.2]** Create file list data structure in `_state.files.configFiles` with placeholder file names
3. **[5.1.3]** Initialize file lists with simulated data (e.g., "SES001", "SES002", "CONFIG001", etc.)
4. **[5.1.4]** Update `files_session_dir` screen definition in screen-atlas.json with file list element
5. **[5.1.5]** Update `files_config_dir` screen definition in screen-atlas.json with file list element
6. **[5.1.6]** Implement file list rendering in screen-renderer.js
7. **[5.1.7]** Add file selection highlighting (highlight selected file)
8. **[5.1.8]** Implement UP/DOWN navigation in directory screens (update selectedIndex)
9. **[5.1.9]** Add scrolling support for long file lists (update scrollOffset)

### Phase 2: Rename Last Session (5.2)
1. **[5.2.1]** Update `files_rename_last` screen definition with text input field
2. **[5.2.2]** Add rename state management (`_state.files.renameLastSession`)
3. **[5.2.3]** Implement ENTER handler to enter edit mode (set editing = true)
4. **[5.2.4]** Implement text input rendering with cursor indicator
5. **[5.2.5]** Implement LEFT/RIGHT handlers to move cursor position
6. **[5.2.6]** Implement character input (numeric/alphanumeric keys)
7. **[5.2.7]** Implement BACKSPACE/DELETE to remove characters
8. **[5.2.8]** Implement ENTER in edit mode to confirm rename (show toast, update file list)
9. **[5.2.9]** Implement ESC to cancel rename (reset to original filename)

### Phase 3: Save Config File (5.3)
1. **[5.3.1]** Update `files_save_config` screen definition with text input field
2. **[5.3.2]** Add save config state management (`_state.files.saveConfig`)
3. **[5.3.3]** Implement auto-generated default filename (e.g., "CONFIG001")
4. **[5.3.4]** Implement ENTER handler to enter edit mode (set editing = true)
5. **[5.3.5]** Implement text input rendering (reuse rename input component logic)
6. **[5.3.6]** Implement LEFT/RIGHT handlers to move cursor position
7. **[5.3.7]** Implement character input (numeric/alphanumeric keys)
8. **[5.3.8]** Implement ENTER in edit mode to save config (show toast "Config saved", add to configFiles list, return to files_menu)
9. **[5.3.9]** Implement ESC to cancel save (return to files_menu)

### Phase 4: Delete Confirm Enhancement (5.4)
1. **[5.4.1]** Update `files_delete_confirm` screen definition with YES/NO selection
2. **[5.4.2]** Add delete confirm state management (`_state.files.deleteConfirm.selectedOption`)
3. **[5.4.3]** Implement YES/NO visual rendering with selection highlighting
4. **[5.4.4]** Implement LEFT/RIGHT or UP/DOWN handlers to toggle between YES/NO
5. **[5.4.5]** Implement ENTER handler: if YES, delete file (remove from list, show toast, return to directory)
6. **[5.4.6]** Implement ESC handler: treat as NO (cancel, return to directory)

### Phase 5: Integration & Testing (5.5)
1. **[5.5.1]** Ensure file lists update after rename operations
2. **[5.5.2]** Ensure file lists update after save config operations
3. **[5.5.3]** Ensure file lists update after delete operations
4. **[5.5.4]** Test navigation flow through all Files Menu screens
5. **[5.5.5]** Test edge cases (empty file lists, long filenames, etc.)
6. **[5.5.6]** Verify all toast messages display correctly
7. **[5.5.7]** Test state persistence during navigation

### Implementation Notes
- Follow existing patterns from Phase 3 menus (edit mode, text input)
- Reference firmware R.13J documentation for exact behavior
- Use simulated/placeholder file data (no actual file system)
- Show appropriate feedback messages for all file operations
- Test each sub-task before moving to next
- Update task checkboxes in `TASK-MASTER-MENU-STRUCTURE-V2.5.md` as work progresses

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md` as each sub-task (5.1-5.5) is completed
- Mark Phase 5 complete when all sub-tasks are done
- Test functionality matches firmware R.13J behavior
- Verify all requirements from Menu-Structure-v2.5.md are met

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Modify:**
- `data/screen-atlas.json` - Update Files Menu screen definitions
- `js/fsm/mainFSM.js` - Add file list navigation, text input handlers, file operations
- `js/screen-renderer.js` - Add file list rendering, text input rendering, delete confirm rendering
- `css/styles.css` - Add file list styles, text input styles, delete confirm styles

**Files to Reference:**
- `tasks/Menu-Structure-v2.5.md` - Section 7.1-7.7 for Files Menu requirements
- `tasks/TASK-MASTER-MENU-STRUCTURE-V2.5.md` - Phase 5 section for status
- `tasks/task-phase-4.md` - Reference for similar text input/edit patterns (if applicable)
- `tasks/task-phase-3.md` - Reference for edit mode patterns

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review Menu-Structure-v2.5.md Section 7.1-7.7 for Files Menu requirements
   - Review current Files Menu implementation in mainFSM.js
   - Understand existing file list and navigation patterns
   - Check Phase 3 edit mode patterns for text input reference

2. **Implement Sub-tasks Sequentially:**
   - Implement 5.1: File List Rendering
   - Implement 5.2: Rename Last Session
   - Implement 5.3: Save Config File
   - Implement 5.4: Delete Confirm Enhancement
   - Implement 5.5: Integration & Testing

3. **Testing:**
   - Test each feature matches firmware R.13J behavior
   - Verify file lists display correctly
   - Verify text input/edit works correctly
   - Verify file operations show appropriate feedback
   - Test navigation flow through all screens
   - Update task checkboxes as work completes

4. **Documentation:**
   - Add code comments explaining file list management
   - Document text input/edit patterns
   - Document file operation feedback messages
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
- Use simulated file data appropriately

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Minimal - extending existing Files Menu functionality
- Adding new state properties to `_state.files` object
- Screen definitions updated but backward compatible

**Performance Concerns:**
- File list rendering should be efficient (handle long lists with scrolling)
- Text input should be responsive (character-by-character editing)
- No unnecessary DOM manipulation

**User Workflow Impacts:**
- Users can now see and manage files (simulated)
- Rename functionality provides file management capability
- Save config allows saving configuration states
- Delete confirm with YES/NO provides clear confirmation

**Future Dependencies:**
- Future phases may add actual file opening/preview functionality
- File operations could be enhanced with more metadata
- File lists could be enhanced with sorting/filtering

**Risk Mitigation:**
- Test against firmware R.13J documentation
- Verify all edge cases are handled (empty lists, long filenames, etc.)
- Document simulated file data approach
- Ensure appropriate feedback messages for all operations

---

**Ready to Implement?**
This task implements Phase 5: Files Menu Enhancements. Follow Menu-Structure-v2.5.md Section 7.1-7.7 specifications exactly and ensure all sub-tasks are completed before marking complete.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — No build tools, no external libraries

