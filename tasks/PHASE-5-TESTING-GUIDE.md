# Phase 5 Testing Guide - Files Menu Enhancements

**Date:** [Fill in date]  
**Tester:** [Fill in name]  
**Version:** Phase 5  
**Scope:** File List Rendering, Rename Last Session, Save Config File, Delete Confirm Enhancement

---

## Overview

This testing guide covers Phase 5 implementation:
- **File List Rendering**: Session Directory and Config Directory with file lists
- **Rename Last Session**: Text input with cursor, character editing, LEFT/RIGHT navigation
- **Save Config File**: Filename input, save operation with feedback
- **Delete Confirm Enhancement**: YES/NO selection with LEFT/RIGHT navigation

**Prerequisites:**
- Complete Phase 1, 2, 3, and 4 testing
- Device can start up and navigate to home screen
- Files Menu basic navigation working from Phase 1

---

## P1: Pre-Testing Setup

### P1.1 Browser Console
**Test:** Open browser developer console (F12)
**Expected:**
- Console is visible and ready for log inspection
- No errors on page load

**Pass/Fail:** [x ]

### P1.2 Device State
**Test:** Power on device (if needed) and navigate to home screen
**Expected:**
- Device shows home screen with menu items
- No visual errors or layout issues

**Pass/Fail:** [x ]

---

## 1. Files Menu Navigation Tests

### 1.1 Navigate to Files Menu
**Test:** From home screen, press SOFT3 (FILE) or select "SETUP" → navigate to Files Menu
**Expected:**
- Navigates to `files_menu` screen
- Menu items visible:
  1. SESSION DIRECTORY
  2. CONFIG DIRECTORY
  3. RENAME LAST SESSION
  4. SAVE CONFIG FILE
  5. FORMAT CARD
- First item (SESSION DIRECTORY) is highlighted
- Console: `window.getMainFSMState().viewId` → should be `"files_menu"`

**Pass/Fail:** [x ]

### 1.2 Files Menu UP/DOWN Navigation
**Test:** Press UP/DOWN arrows in Files Menu
**Expected:**
- Highlight moves between menu items (1-5)
- Console: `window.getMainFSMState().menu.selectedIndex` updates (0-4)
- Console log shows: `[MENU] Files menu - Selected index: X → "ITEM NAME"`

**Pass/Fail:** [x ]

### 1.3 ESC from Files Menu
**Test:** Press ESC from Files Menu
**Expected:**
- Returns to home screen
- Console: `window.getMainFSMState().viewId` → should be `"home_screen"` or `"home_screen_dim"`

**Pass/Fail:** [ x]

---

## 2. File List Rendering Tests

### 2.1 Navigate to Session Directory
**Test:** From Files Menu, select "SESSION DIRECTORY" and press ENTER
**Expected:**
- Navigates to `files_session_dir` screen
- File list displays with session files:
  - SES001
  - SES002
  - SES003
  - SES004
  - SES005
- First file (SES001) is highlighted/selected
- Console: `window.getMainFSMState().viewId` → should be `"files_session_dir"`
- Console: `window.getMainFSMState().files.sessionDir.selectedIndex` → should be `0`

**Pass/Fail:** [x ]

### 2.2 Session Directory File List Display
**Test:** Verify file list displays correctly
**Expected:**
- All session files visible in list
- Files displayed as: "SES001", "SES002", etc.
- Selected file has visual highlighting (different color/background)
- File list uses proper styling (consistent with menu items)
- **If 5 or fewer files:** Displayed in single column
- **If more than 5 files:** Displayed in 2 columns (2 rows of 5 = 10 files per screen)
- Battery icon visible at top
- "\DATA File" label visible above file list
- Soft keys visible at bottom: SOFT1="DELETE", SOFT3="LOAD", SOFT4="more..." (only if more than 10 files)

**Console Commands:**
- `window.getMainFSMState().files.sessionFiles` → should return array of file objects
- `window.getMainFSMState().files.sessionFiles.length` → should be `5` (or more)

**Pass/Fail:** [x ]

### 2.3 Session Directory UP/DOWN Navigation
**Test:** Press UP/DOWN arrows in Session Directory
**Expected:**
- **If 5 or fewer files:** Highlight moves up/down by 1 position
- **If more than 5 files (2-column layout):** 
  - UP moves to previous row (decrease index by 5)
  - DOWN moves to next row (increase index by 5)
- Console: `window.getMainFSMState().files.sessionDir.selectedIndex` updates
- Console log shows: `[FILES] Session Directory UP/DOWN: Selected index: X`
- When at top (index 0), UP does nothing
- When at bottom (last file), DOWN does nothing

**Pass/Fail:** [x ]

### 2.4 Session Directory Scrolling and "more..." Feature
**Test:** If file list has more than 10 files
**Expected:**
- First 10 files displayed in 2 columns (2 rows of 5)
- SOFT4 shows "more..." label
- Press SOFT4 to scroll to next 10 files
- Console: `window.getMainFSMState().files.sessionDir.scrollOffset` updates
- Selected file remains visible
- After scrolling, SOFT4 still shows "more..." if there are more files beyond current view

**Test:** If file list has 10 or fewer files
**Expected:**
- SOFT4 does NOT show "more..." (label is empty)
- All files visible on screen

**Note:** To test this, you may need to add more than 10 session files to the state.

**Pass/Fail:** [x ]

### 2.5 Navigate to Config Directory
**Test:** From Files Menu, select "CONFIG DIRECTORY" and press ENTER
**Expected:**
- Navigates to `files_config_dir` screen
- File list displays with config files:
  - CONFIG001
  - CONFIG002
  - CONFIG003
- First file (CONFIG001) is highlighted/selected
- Console: `window.getMainFSMState().viewId` → should be `"files_config_dir"`
- Console: `window.getMainFSMState().files.configDir.selectedIndex` → should be `0`

**Pass/Fail:** [x ]

### 2.6 Config Directory File List Display
**Test:** Verify config file list displays correctly
**Expected:**
- All config files visible in list
- Files displayed as: "CONFIG001", "CONFIG002", etc.
- Selected filn . e has visual highlighting
- File list uses proper styling

**Console Commands:**
- `window.getMainFSMState().files.configFiles` → should return array of file objects
- `window.getMainFSMState().files.configFiles.length` → should be `3` (or more after saving)

**Pass/Fail:** [x ]

### 2.7 Config Directory UP/DOWN Navigation
**Test:** Press UP/DOWN arrows in Config Directory
**Expected:**
- Highlight moves up/down through file list
- Console: `window.getMainFSMState().files.configDir.selectedIndex` updates
- Console log shows: `[FILES] Config Directory UP/DOWN: Selected index: X`

**Pass/Fail:** [ x]

### 2.8 ESC from Directory Screens
**Test:** Press ESC from Session Directory or Config Directory
**Expected:**
- Returns to Files Menu
- Console: `window.getMainFSMState().viewId` → should be `"files_menu"`
- Selected index in Files Menu preserved

**Pass/Fail:** [x ]

### 2.5 Session Directory SOFT1 (DELETE)
**Test:** In Session Directory, select a file and press SOFT1 (DELETE)
**Expected:**
- File is immediately deleted from the session files list
- Navigates to `files_delete_status` screen
- Screen displays "%DATA FILE" at top
- Screen displays "XXX.SES DELETED" (where XXX is the file number, e.g., "001", "3002")
- Screen shows dashed lines and timeline graph
- Console: `window.getMainFSMState().viewId` → should be `"files_delete_status"`
- Console: `window.getMainFSMState().files.deleteStatus.deletedFileName` → should be `"XXX.SES DELETED"`
- Console log shows: `[FILES] Session Directory SOFT1: Deleted file SESXXX at index X`
- Deleted file no longer appears in session files list

**Pass/Fail:** [x ]

### 2.6 Session Directory SOFT3 (LOAD)
**Test:** In Session Directory, select a file and press SOFT3 (LOAD)
**Expected:**
- Toast message appears: "Loaded SESXXX" (where SESXXX is the selected file name)
- File remains selected
- Console log shows: `[FILES] Session Directory SOFT3: Load file SESXXX`
- No navigation occurs (stays on Session Directory screen)

**Pass/Fail:** [x ]

---

## 3. Rename Last Session Tests

### 3.1 Navigate to Rename Last Session
**Test:** From Files Menu, select "RENAME LAST SESSION" and press ENTER
**Expected:**
- Navigates to `files_rename_last` screen
- Text input field displays current last session filename (e.g., "SES001")
- Filename is visible but not in edit mode initially
- Console: `window.getMainFSMState().viewId` → should be `"files_rename_last"`
- Console: `window.getMainFSMState().files.renameLastSession.filename` → should be `"SES001"` (or last session name)
- Console: `window.getMainFSMState().files.renameLastSession.editing` → should be `false`

**Pass/Fail:** [ x]

### 3.2 Enter Edit Mode
**Test:** On Rename Last Session screen, press ENTER
**Expected:**
- Enters edit mode
- Cursor indicator appears in text input
- Console: `window.getMainFSMState().files.renameLastSession.editing` → should be `true`
- Console: `window.getMainFSMState().files.renameLastSession.cursorPosition` → should be at end of filename
- Console log shows: `[FILES] Rename: Entered edit mode`

**Pass/Fail:**[x]

### 3.3 Cursor Movement LEFT
**Test:** In edit mode, press LEFT arrow
**Expected:**
- Cursor moves left one character
- Console: `window.getMainFSMState().files.renameLastSession.cursorPosition` decreases by 1
- Console log shows: `[FILES] Rename LEFT: Cursor position: X`
- Cursor cannot move before position 0

**Pass/Fail:** [x ]

### 3.4 Cursor Movement RIGHT
**Test:** In edit mode, press RIGHT arrow
**Expected:**
- Cursor moves right one character
- Console: `window.getMainFSMState().files.renameLastSession.cursorPosition` increases by 1
- Console log shows: `[FILES] Rename RIGHT: Cursor position: X`
- Cursor cannot move beyond end of filename

**Pass/Fail:** [x ]

### 3.5 Character Input (Numeric Keys)
**Test:** In edit mode, press numeric keys (0-9)
**Expected:**
- Character is inserted at cursor position
- Filename updates with new character
- Cursor moves right after insertion
- Console: `window.getMainFSMState().files.renameLastSession.filename` updates
- Console log shows: `[FILES] Rename: Inserted 'X' at position Y`
- Filename length limited to 8 characters

**Pass/Fail:** [x ]

### 3.6 Backspace Key
**Test:** In edit mode, press BACKSPACE
**Expected:**
- Character before cursor is deleted
- Filename updates
- Cursor moves left one position
- Console: `window.getMainFSMState().files.renameLastSession.filename` updates
- Console log shows: `[FILES] Rename: Deleted character at position X`
- Backspace at position 0 does nothing

**Pass/Fail:** [x ]

### 3.7 Confirm Rename (ENTER)
**Test:** In edit mode, modify filename, then press ENTER
**Expected:**
- Exits edit mode
- Filename is saved to first session file
- Toast message appears: "File renamed"
- Returns to Files Menu (or previous screen)
- Console: `window.getMainFSMState().files.sessionFiles[0].name` → should be updated filename
- Console: `window.getMainFSMState().files.renameLastSession.editing` → should be `false`
- Console log shows: `[FILES] Rename confirmed: NEWNAME`

**Pass/Fail:** [x  ]

### 3.8 Cancel Rename (ESC)
**Test:** In edit mode, modify filename, then press ESC
**Expected:**
- Exits edit mode
- Filename reverts to original (before editing)
- Returns to Files Menu (or previous screen)
- Console: `window.getMainFSMState().files.renameLastSession.filename` → should be original filename
- Console: `window.getMainFSMState().files.renameLastSession.editing` → should be `false`
- Console log shows: `[FILES] Rename ESC: Cancelled editing`

**Pass/Fail:** [ x]

### 3.9 ESC When Not Editing
**Test:** On Rename Last Session screen (not in edit mode), press ESC
**Expected:**
- Returns to Files Menu
- No changes made
- Console: `window.getMainFSMState().viewId` → should be `"files_menu"`

**Pass/Fail:** [x ]

### 3.10 Verify Renamed File in Session Directory
**Test:** After renaming, navigate to Session Directory
**Expected:**
- First file in list shows new name
- Console: `window.getMainFSMState().files.sessionFiles[0].name` → should be renamed filename

**Pass/Fail:** [x ]

---

## 4. Save Config File Tests

### 4.1 Navigate to Save Config File
**Test:** From Files Menu, select "SAVE CONFIG FILE" and press ENTER
**Expected:**
- Navigates to `files_save_config` screen
- Text input field displays default filename (e.g., "CONFIG001", "CONFIG002", etc.)
- Filename is visible but not in edit mode initially
- Console: `window.getMainFSMState().viewId` → should be `"files_save_config"`
- Console: `window.getMainFSMState().files.saveConfig.filename` → should be auto-generated (e.g., "CONFIG004" if 3 files exist)
- Console: `window.getMainFSMState().files.saveConfig.editing` → should be `false`

**Pass/Fail:** [x ]

### 4.2 Enter Edit Mode
**Test:** On Save Config File screen, press ENTER
**Expected:**
- Enters edit mode
- Cursor indicator appears in text input
- Console: `window.getMainFSMState().files.saveConfig.editing` → should be `true`
- Console: `window.getMainFSMState().files.saveConfig.cursorPosition` → should be at end of filename
- Console log shows: `[FILES] Save Config: Entered edit mode`

**Pass/Fail:** [X ]

### 4.3 Cursor Movement and Character Input
**Test:** In edit mode, test LEFT/RIGHT cursor movement and character input (0-9)
**Expected:**
- LEFT/RIGHT arrows move cursor correctly
- Numeric keys (0-9) insert characters
- BACKSPACE deletes characters
- Behavior matches Rename Last Session functionality
- Console logs show cursor movement and character insertion

**Pass/Fail:** [X ]

### 4.4 Confirm Save Config (ENTER)
**Test:** In edit mode, modify filename (or keep default), then press ENTER
**Expected:**
- Exits edit mode
- Config file is saved (added to config files list)
- Toast message appears: "Config saved"
- Returns to Files Menu
- Console: `window.getMainFSMState().files.configFiles` → should include new file
- Console: `window.getMainFSMState().files.saveConfig.editing` → should be `false`
- Console log shows: `[FILES] Config saved: FILENAME`

**Pass/Fail:** [x ]

### 4.5 Verify Saved Config in Config Directory
**Test:** After saving config, navigate to Config Directory
**Expected:**
- New config file appears in list
- File is at top of list (most recent first)
- Console: `window.getMainFSMState().files.configFiles.length` → should increase by 1
- Console: `window.getMainFSMState().files.configFiles[0].name` → should be saved filename

**Pass/Fail:** [x ]

### 4.6 Cancel Save Config (ESC)
**Test:** In edit mode, modify filename, then press ESC
**Expected:**
- Exits edit mode
- Filename reverts to default (auto-generated)
- Returns to Files Menu
- No config file is saved
- Console: `window.getMainFSMState().files.configFiles.length` → should not change
- Console log shows: `[FILES] Save Config ESC: Cancelled editing`

**Pass/Fail:** [x ]

### 4.7 ESC When Not Editing
**Test:** On Save Config File screen (not in edit mode), press ESC
**Expected:**
- Returns to Files Menu
- No changes made
- Console: `window.getMainFSMState().viewId` → should be `"files_menu"`

**Pass/Fail:** [x ]

### 4.8 Auto-Generated Filename
**Test:** Save multiple config files and verify auto-generated names
**Expected:**
- First save: "CONFIG001" (or next available number)
- Second save: "CONFIG002" (or next available number)
- Filenames increment correctly based on existing files
- Console: Check `window.getMainFSMState().files.configFiles` for correct numbering

**Pass/Fail:** [x ]

---

## 5. Delete Status Screen Tests

**Navigation Path to Test:**
1. From Home Screen → Press SETUP button
2. Navigate to Files Menu (UP/DOWN to "FILE" and press ENTER, or use menu navigation)
3. Select "SESSION DIRECTORY" (first item) and press ENTER
4. You should now be on the Session Directory screen showing a list of files
5. Use UP/DOWN arrows to select a file (any file in the list)
6. Press SOFT1 (the DELETE button - bottom left softkey)
7. This will delete the file and automatically navigate to the Delete Status screen

### 5.1 Delete Status Screen Display
**Test:** After deleting a file from Session Directory, verify the delete status screen displays correctly
**Expected:**
- Navigates to `files_delete_status` screen
- "%DATA FILE" label visible at top
- Deleted filename displayed as "XXX.SES DELETED" (where XXX is the file number, e.g., "001", "3002")
- Two horizontal dashed divider lines visible
- Timeline graph displayed (horizontal line with vertical dashed lines)
- Console: `window.getMainFSMState().viewId` → should be `"files_delete_status"`
- Console: `window.getMainFSMState().files.deleteStatus.deletedFileName` → should be `"XXX.SES DELETED"`

**Pass/Fail:** [x ]

### 5.2 ESC Returns from Delete Status
**Test:** Press ESC on Delete Status screen
**Expected:**
- Returns to Session Directory screen
- Console: `window.getMainFSMState().viewId` → should be `"files_session_dir"`
- Console log shows: `[FILES] Delete Status ESC: Returning to previous view`

**Pass/Fail:** [x ]

### 5.3 ENTER Returns from Delete Status
**Test:** Press ENTER on Delete Status screen
**Expected:**
- Returns to Session Directory screen
- Console: `window.getMainFSMState().viewId` → should be `"files_session_dir"`
- Console log shows: `[FILES] Delete Status: Returning to previous view`

**Pass/Fail:** [x ]

### 5.9 Delete from Session Directory
**Test:** Delete a file from Session Directory
**Expected:**
- Selected file is removed from `sessionFiles` array
- List updates to show remaining files
- Selected index adjusts if needed (if last file deleted, move to previous file)
- Console: `window.getMainFSMState().files.sessionFiles.length` → decreases by 1

**Pass/Fail:** [x ]

### 5.10 Delete from Config Directory
**Test:** Delete a file from Config Directory
**Expected:**
- Selected file is removed from `configFiles` array
- List updates to show remaining files
- Selected index adjusts if needed
- Console: `window.getMainFSMState().files.configFiles.length` → decreases by 1

**Pass/Fail:** [x ]

---

## 6. Integration Tests

### 6.1 Complete Rename Workflow
**Test:** 
1. Navigate to Files Menu
2. Select "RENAME LAST SESSION"
3. Enter edit mode
4. Modify filename
5. Confirm rename
6. Navigate to Session Directory
**Expected:**
- All steps work correctly
- Renamed file appears in Session Directory with new name
- No errors or state corruption

**Pass/Fail:** [x ]

### 6.2 Complete Save Config Workflow
**Test:**
1. Navigate to Files Menu
2. Select "SAVE CONFIG FILE"
3. Enter edit mode
4. Modify filename (optional)
5. Confirm save
6. Navigate to Config Directory
**Expected:**
- All steps work correctly
- New config file appears in Config Directory
- File list updates correctly

**Pass/Fail:** [x ]

### 6.3 Complete Delete Workflow
**Test:**
1. Navigate to Session Directory
2. Select a file
3. Trigger delete confirm (if available)
4. Select YES
5. Confirm delete
**Expected:**
- All steps work correctly
- File is removed from list
- Returns to directory with updated list

**Pass/Fail:** [x ]

### 6.4 File List Updates After Operations
**Test:** 
1. Rename a session file
2. Save a config file
3. Delete a file
4. Navigate to directories
**Expected:**
- Session Directory shows renamed file
- Config Directory shows new config file
- Deleted file no longer appears
- All lists update correctly

**Pass/Fail:** [x ]

### 6.5 Navigation History
**Test:** Navigate through Files Menu → Session Directory → ESC → Files Menu → Config Directory → ESC
**Expected:**
- Navigation history works correctly
- ESC returns to previous screen
- State persists during navigation

**Pass/Fail:** [x ]

### 6.6 State Persistence
**Test:** 
1. Navigate to Session Directory
2. Select file at index 3
3. ESC to Files Menu
4. Navigate back to Session Directory
**Expected:**
- Selected index may reset to 0 (or may persist, depending on implementation)
- File list remains intact
- No state corruption

**Pass/Fail:** [x ]

---

## 7. Visual Layout Tests

### 7.1 File List Layout
**Test:** Verify file list displays correctly in Session Directory and Config Directory
**Expected:**
- Files displayed in vertical list
- Proper spacing between files
- Selected file clearly highlighted
- List scrolls correctly for long lists
- Styling matches device appearance

**Pass/Fail:** [x ]

### 7.2 Text Input Layout
**Test:** Verify text input displays correctly in Rename and Save Config screens
**Expected:**
- Text input field visible and readable
- Cursor indicator visible when editing (blinking or highlighted)
- Text properly aligned
- Filename length limited appropriately

**Pass/Fail:** [x ]

### 7.3 YES/NO Selection Layout
**Test:** Verify YES/NO selection displays correctly in Delete Confirm screen
**Expected:**
- YES and NO options visible
- Selected option clearly highlighted
- Options properly spaced
- Styling matches device appearance

**Pass/Fail:** [x ]

### 7.4 Toast Messages
**Test:** Verify toast messages display correctly
**Expected:**
- "File renamed" appears after rename
- "Config saved" appears after save
- "Deleted" appears after delete
- Toast messages are visible and readable
- Toast messages disappear after timeout

**Pass/Fail:** [x ]

---

## 8. State Management Tests

### 8.1 FSM State Structure
**Test:** In browser console, run: `window.getMainFSMState().files`
**Expected:**
- Returns object with:
  - `sessionFiles`: Array of file objects with `name`, `date`, `time`
  - `configFiles`: Array of file objects with `name`, `date`, `time`
  - `sessionDir`: Object with `selectedIndex`, `scrollOffset`
  - `configDir`: Object with `selectedIndex`, `scrollOffset`
  - `renameLastSession`: Object with `editing`, `filename`, `cursorPosition`, `originalFilename`
  - `saveConfig`: Object with `editing`, `filename`, `cursorPosition`
  - `deleteConfirm`: Object with `selectedOption`

**Pass/Fail:** [x ]

### 8.2 State Persistence
**Test:** 
1. Navigate to Session Directory, select file at index 2
2. Navigate to Config Directory, select file at index 1
3. Check state: `window.getMainFSMState().files`
**Expected:**
- All state values persist correctly
- No state loss during navigation
- Selected indices maintained

**Pass/Fail:** [ x]

### 8.3 State Initialization
**Test:** Fresh page load, navigate to Files Menu
**Expected:**
- Default state:
  - `sessionFiles`: Array with 5 files (SES001-SES005)
  - `configFiles`: Array with 3 files (CONFIG001-CONFIG003)
  - `sessionDir.selectedIndex`: 0
  - `configDir.selectedIndex`: 0
  - `renameLastSession.filename`: "SES001" (or last session)
  - `deleteConfirm.selectedOption`: "NO"

**Pass/Fail:** [x ]

---

## 9. Edge Cases and Error Handling

### 9.1 Empty File List
**Test:** Delete all files from a directory, then navigate to that directory
**Expected:**
- Directory screen displays correctly
- No errors or crashes
- Empty list handled gracefully
- Console: `window.getMainFSMState().files.sessionFiles.length` → should be `0`

**Pass/Fail:** [ x]

### 9.2 Long Filename
**Test:** Try to enter filename longer than 8 characters
**Expected:**
- Filename length limited to 8 characters
- Additional characters not inserted
- No errors or crashes

**Pass/Fail:** [ x]

### 9.3 Rapid Key Pressing
**Test:** Rapidly press LEFT/RIGHT arrows and numeric keys in edit mode
**Expected:**
- Cursor movement and character input work correctly
- No visual glitches
- Final state is correct
- No errors in console

**Pass/Fail:** [x ]

### 9.4 Cursor at Boundaries
**Test:** Move cursor to position 0, then press LEFT; move to end, then press RIGHT
**Expected:**
- Cursor does not move beyond boundaries
- No errors or crashes
- Console logs show boundary handling

**Pass/Fail:** [x ]

### 9.5 Backspace at Position 0
**Test:** Move cursor to position 0, then press BACKSPACE
**Expected:**
- No character deleted
- Filename unchanged
- Cursor remains at position 0
- No errors

**Pass/Fail:** [x ]

### 9.6 Delete Last File in Directory
**Test:** Delete the last remaining file in a directory
**Expected:**
- File is deleted
- Directory screen handles empty list gracefully
- Selected index adjusts (to 0 or -1)
- No errors or crashes

**Pass/Fail:** [x ]

### 9.7 Rename with Special Characters
**Test:** Try to enter special characters in filename (if allowed)
**Expected:**
- Only valid filename characters accepted (alphanumeric)
- Special characters rejected or filtered
- No errors

**Note:** Implementation may only accept numeric characters (0-9) or alphanumeric.

**Pass/Fail:** [x ]

### 9.8 Multiple Rapid Saves
**Test:** Rapidly save multiple config files
**Expected:**
- All files saved correctly
- Filenames increment correctly
- No duplicate filenames
- List updates correctly

**Pass/Fail:** [x ]

---

## 10. Console Logging Tests

### 10.1 File List Navigation Logging
**Test:** Navigate through file lists and check console
**Expected:**
- Console shows: `[FILES] Session Directory UP/DOWN: Selected index: X`
- Console shows: `[FILES] Config Directory UP/DOWN: Selected index: X`
- Logs appear for each navigation action

**Pass/Fail:** [x ]

### 10.2 Text Input Logging
**Test:** Edit filenames and check console
**Expected:**
- Console shows: `[FILES] Rename: Entered edit mode`
- Console shows: `[FILES] Rename LEFT/RIGHT: Cursor position: X`
- Console shows: `[FILES] Rename: Inserted 'X' at position Y`
- Console shows: `[FILES] Rename: Deleted character at position X`
- Similar logs for Save Config

**Pass/Fail:** [x ]

### 10.3 File Operation Logging
**Test:** Perform rename, save, delete operations and check console
**Expected:**
- Console shows: `[FILES] Rename confirmed: FILENAME`
- Console shows: `[FILES] Config saved: FILENAME`
- Console shows: `[FILES] File deleted`
- Console shows: `[FILES] Delete cancelled`
- Logs appear for each operation

**Pass/Fail:** [ x]

### 10.4 Error Logging
**Test:** Check console for any error messages
**Expected:**
- No error messages during normal operation
- Any errors are logged with clear messages
- Errors don't crash the application

**Pass/Fail:** x[ ]

---

## Summary

**Total Tests:** [Fill in count]  
**Passed:** [Fill in count]  
**Failed:** [Fill in count]  
**Blocked:** [Fill in count]

### Critical Issues Found:
[List any critical issues that block testing or functionality]

### Minor Issues Found:
[List any minor issues or visual glitches]

### Notes:
[Any additional observations or notes]

---

**Testing Completed By:** [Name]  
**Date:** [Date]  
**Version Tested:** Phase 5  
**Ready for Next Phase:** [Yes/No]

