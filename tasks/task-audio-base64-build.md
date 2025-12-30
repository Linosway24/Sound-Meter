# AI Task Planning - Task 7.0: Audio Base64 Build System

> **How to Use This Template:**
> 1. Specify your task list file: `[TASK-LIST-FILE]` (e.g., `tasks-PRD.md`, `my-tasks.md`, etc.)
> 2. Open `[TASK-LIST-FILE]` and find the task you want to implement (e.g., 2.0, 3.0, etc.)
> 3. Copy all sub-tasks from that task section
> 4. Fill in this template with the task number, title, and sub-tasks
> 5. Complete each section based on the task requirements and PRD.md specifications
> 6. Save as `task-X-X.md` (e.g., `task-2-0.md`)

## 1. Task Overview

### Task Title
**Title:** Audio Base64 Build System - CORS-Safe WebAudio for Blackboard Ultra

### Goal Statement
**Goal:** Implement a Node.js build step that converts audio files from `assets/audio/` into a Base64-encoded JavaScript module, enabling WebAudio waveform analysis to work inside Blackboard Ultra iframes without CORS restrictions. The build process must be deterministic, reproducible, and require no external dependencies beyond Node.js 18+ built-in modules. This ensures audio playback and real-time waveform analysis function correctly in restricted iframe environments where file:// protocol and cross-origin requests are blocked.

---

## 2. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** None - Pure HTML5/CSS3/ES6 JavaScript
- **Language:** HTML5, CSS3, ES6 JavaScript (runtime), Node.js 18+ (build-time)
- **Database & ORM:** N/A - In-memory state only
- **UI & Styling:** Vanilla CSS with Grid/Flexbox for layout, absolute positioning for overlays
- **Authentication:** N/A
- **Key Architectural Patterns:** DOM-based rendering (not Canvas), modular JavaScript architecture

### Current State
- Audio files are currently loaded via file paths in `js/audio.js` (e.g., `'assets/audio/fan.wav'`)
- WebAudio API uses `new Audio(preset.file)` and `createMediaElementSource()` for waveform analysis
- Audio files exist in `assets/audio/`: `Calibration_1khz.wav`, `clapping.wav`, `engine.wav`, `fan.wav`, `hammering.wav`, `machinery.wav`, `office.wav`
- CORS issues occur when running in Blackboard Ultra iframes, preventing audio file loading
- No build system currently exists - project uses pure HTML/CSS/JS with no build tools
- Audio module (`js/audio.js`) references files via `SOUND_PRESETS` object with `file` property

---

## 3. Context & Problem Definition

### Problem Statement
When the Quest SoundPro SE-DL simulation runs inside Blackboard Ultra iframes, WebAudio API cannot load audio files via file paths due to CORS (Cross-Origin Resource Sharing) restrictions. The iframe sandbox and same-origin policy block access to `assets/audio/*.wav` files, causing audio playback and waveform analysis to fail silently. This breaks the real-time audio analysis feature that drives SPL measurements based on actual audio waveform data. The solution is to embed audio files as Base64-encoded data URIs directly in a JavaScript module, eliminating the need for separate HTTP requests and bypassing CORS restrictions entirely.

### Success Criteria
- [ ] 7.1: Create Node.js build script (`build-audio.js`) that reads all `.wav` files from `assets/audio/`
- [ ] 7.2: Convert each audio file to Base64 string using Node.js built-in `fs` and `Buffer` modules
- [ ] 7.3: Generate JavaScript module (`js/audio-data.js`) exporting Base64 audio data as named constants
- [ ] 7.4: Ensure deterministic output (consistent Base64 encoding, sorted file order, reproducible module structure)
- [ ] 7.5: Update `js/audio.js` to load audio from Base64 data URIs instead of file paths
- [ ] 7.6: Maintain backward compatibility - existing `SOUND_PRESETS` structure and API unchanged
- [ ] 7.7: Add build script documentation and usage instructions
- [ ] 7.8: Verify WebAudio waveform analysis works correctly with Base64-encoded audio in iframe environment

---

## 4. Development Mode Context

### Development Mode Context
- **🚨 Project Stage:** Production enhancement - adding build step for deployment environment compatibility
- **Breaking Changes:** Minimal - only affects audio loading mechanism, all APIs remain unchanged
- **Data Handling:** Build-time conversion only - runtime behavior unchanged
- **User Base:** Training module students - must work in Blackboard Ultra iframes (CORS-restricted environment)
- **Priority:** High - required for audio analysis feature to function in production deployment

---

## 5. Technical Requirements

### Functional Requirements

**From PRD.md Requirements [N/A - Build System Addition]:**

1. Build script must read all `.wav` files from `assets/audio/` directory
2. Build script must convert each audio file to Base64-encoded string
3. Build script must generate ES6 module exporting audio data as named constants
4. Generated module must use data URI format: `data:audio/wav;base64,<base64-string>`
5. Audio module must load Base64 data URIs instead of file paths when available
6. Build process must be deterministic (same input = same output)
7. Build script must handle missing files gracefully with clear error messages
8. Generated module must preserve original file names for mapping

### Non-Functional Requirements
- **Performance:** Base64 encoding adds ~33% size overhead - acceptable for small audio files
- **Security:** Base64 data URIs are safe for same-origin iframe contexts
- **Usability:** Build process must be simple: `node build-audio.js`
- **Maintainability:** Build script must be self-documenting with clear error messages
- **Reproducibility:** Output must be deterministic (sorted file order, consistent encoding)

### Technical Constraints
- Must use only Node.js 18+ built-in modules (`fs`, `path`, `Buffer`) - no external dependencies
- Must not modify existing application logic unless explicitly required
- Must create new files only where necessary
- Output must be deterministic and reproducible
- Changes must be minimal and isolated
- Must preserve existing `SOUND_PRESETS` API structure
- Must work with existing WebAudio API usage in `js/audio.js`

---

## 6. Data & Database Changes

### Database Schema Changes
N/A - No database, pure frontend state management

### Data Model Updates
- **Audio Data Module Structure:**
  ```javascript
  // js/audio-data.js (generated)
  export const AUDIO_DATA = {
    'Calibration_1khz.wav': 'data:audio/wav;base64,<base64-string>',
    'clapping.wav': 'data:audio/wav;base64,<base64-string>',
    'engine.wav': 'data:audio/wav;base64,<base64-string>',
    'fan.wav': 'data:audio/wav;base64,<base64-string>',
    'hammering.wav': 'data:audio/wav;base64,<base64-string>',
    'machinery.wav': 'data:audio/wav;base64,<base64-string>',
    'office.wav': 'data:audio/wav;base64,<base64-string>'
  };
  ```

### Data Migration Plan
N/A - No data migration needed (build-time conversion only)

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
- **`build-audio.js`:** Node.js build script that converts audio files to Base64 JS module
- **`js/audio-data.js`:** Generated JavaScript module containing Base64-encoded audio data (created by build script)

### Page Updates
- **`js/audio.js`:** Modify `playPreset()` function to use Base64 data URIs from `audio-data.js` instead of file paths
- **`index.html`:** Add script tag to load `js/audio-data.js` before `js/audio.js`

### State Management
- Audio loading mechanism changes from file path to Base64 data URI
- All existing state management remains unchanged
- `SOUND_PRESETS` structure preserved - only `file` property value changes from path to data URI

---

## 9. Implementation Plan

### Phase 1: Build Script Creation
1. **[7.1]** Create `build-audio.js` in project root
   - Use Node.js `fs` module to read `assets/audio/` directory
   - Filter for `.wav` files only
   - Sort files alphabetically for deterministic output

2. **[7.2]** Implement Base64 encoding
   - Read each `.wav` file using `fs.readFileSync()`
   - Convert to Base64 using `Buffer.from().toString('base64')`
   - Generate data URI: `data:audio/wav;base64,<base64-string>`

3. **[7.3]** Generate JavaScript module
   - Create `js/audio-data.js` with ES6 export syntax
   - Export `AUDIO_DATA` object mapping filenames to data URIs
   - Use consistent formatting (2-space indent, sorted keys)

4. **[7.4]** Ensure deterministic output
   - Sort files alphabetically before processing
   - Use consistent Base64 encoding (no line breaks)
   - Generate consistent module structure

### Phase 2: Audio Module Integration
5. **[7.5]** Update `js/audio.js` to use Base64 data
   - Check if `AUDIO_DATA` is available (from `audio-data.js`)
   - Modify `playPreset()` to use `AUDIO_DATA[preset.file]` if available
   - Fallback to original file path if `AUDIO_DATA` not available (development mode)
   - Update `SOUND_PRESETS` to reference filenames instead of paths

6. **[7.6]** Maintain backward compatibility
   - Preserve all existing `SOUND_PRESETS` structure
   - Keep all existing API methods unchanged
   - Ensure `playPreset()`, `playCustom()`, etc. work identically

### Phase 3: Documentation & Testing
7. **[7.7]** Add build documentation
   - Document build script usage in README or build instructions
   - Explain when to run build script (before deployment)
   - Add error handling documentation

8. **[7.8]** Verify functionality
   - Test audio playback with Base64 data URIs
   - Verify WebAudio waveform analysis works correctly
   - Test in iframe environment (or simulate CORS restrictions)
   - Verify all audio presets load and play correctly

### Implementation Notes
- Build script must handle errors gracefully (missing directory, permission errors)
- Generated module should include comment header with build timestamp
- Consider adding `.gitignore` entry for generated `js/audio-data.js` if desired
- Build script should output progress messages to console

---

## 10. Task Completion Tracking

### Real-Time Progress Tracking
- Update checkboxes in this document as each sub-task (7.1-7.8) is completed
- Mark parent task 7.0 complete when all sub-tasks are done
- Test functionality in iframe environment to verify CORS issue is resolved
- Verify all audio presets work correctly with Base64 data

---

## 11. File Structure & Organization

### Files to Create/Modify

**Files to Create:**
- `build-audio.js` - Node.js build script for converting audio files to Base64
- `js/audio-data.js` - Generated JavaScript module with Base64 audio data (created by build script)

**Files to Modify:**
- `js/audio.js` - Update `playPreset()` to use Base64 data URIs from `audio-data.js`
- `index.html` - Add script tag for `js/audio-data.js` before `js/audio.js`

**Files to Reference:**
- `assets/audio/*.wav` - Source audio files to be converted
- `js/audio.js` - Current audio module implementation
- `PRD.md` - Project requirements reference

---

## 12. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**

1. **Read Context:**
   - Review `js/audio.js` to understand current audio loading mechanism
   - Understand WebAudio API usage (`createMediaElementSource`, `createAnalyser`)
   - Review `SOUND_PRESETS` structure and how `file` property is used
   - Understand CORS restrictions in iframe environments

2. **Implement Sub-tasks Sequentially:**
   - Implement 7.1: Create `build-audio.js` with file reading logic
   - Implement 7.2: Add Base64 encoding functionality
   - Implement 7.3: Generate `js/audio-data.js` module
   - Implement 7.4: Ensure deterministic output (sorting, consistent formatting)
   - Implement 7.5: Update `js/audio.js` to use Base64 data
   - Implement 7.6: Verify backward compatibility
   - Implement 7.7: Add documentation
   - Implement 7.8: Test and verify functionality

3. **Testing:**
   - Run build script: `node build-audio.js`
   - Verify `js/audio-data.js` is generated correctly
   - Test audio playback in browser
   - Verify WebAudio waveform analysis works
   - Test in iframe or with CORS restrictions

4. **Documentation:**
   - Add code comments explaining Base64 conversion process
   - Document build script usage
   - Add error handling documentation

### Communication Preferences
- Provide code snippets showing exact implementation
- Show before/after comparisons when modifying existing code
- Report any issues with file paths or encoding
- Ask for clarification if audio file structure is unclear

### Code Quality Standards
- Use Node.js built-in modules only (`fs`, `path`, `Buffer`)
- Use ES6 module syntax for generated code
- Comment complex encoding logic
- Use consistent indentation (2 spaces)
- Ensure deterministic output (sorted, consistent formatting)
- Handle errors gracefully with clear messages

---

## 13. Second-Order Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Minimal - only affects audio loading mechanism
- Existing `SOUND_PRESETS` API structure preserved
- All public methods (`playPreset`, `stop`, etc.) remain unchanged
- Fallback to file paths if `AUDIO_DATA` not available (development mode)

**Performance Concerns:**
- Base64 encoding adds ~33% file size overhead
- Audio files are small (< 1MB each), so overhead is acceptable
- Base64 data URIs are loaded synchronously with JavaScript module
- No additional HTTP requests needed (CORS-safe)

**User Workflow Impacts:**
- Build step required before deployment (one-time or as part of build process)
- No runtime impact - audio loading works identically from user perspective
- Improved reliability in iframe environments

**Future Dependencies:**
- Build script must be run whenever audio files are added/modified
- Consider adding build script to deployment pipeline
- Generated `js/audio-data.js` should be committed or generated during build

**Risk Mitigation:**
- Fallback to file paths if Base64 data not available (development mode)
- Build script validates file existence before encoding
- Clear error messages if build fails
- Test in iframe environment before deployment

---

**Ready to Implement?**
This task implements a build system to convert audio files to Base64-encoded JavaScript modules, enabling WebAudio waveform analysis to work in CORS-restricted iframe environments like Blackboard Ultra. The build process is minimal, uses only Node.js built-in modules, and maintains full backward compatibility with existing audio module APIs.

**Firmware Reference:** R.13J  
**Client:** USAFSAM  
**Developer:** SierTek Ltd.  
**Project Lead:** Michael Carlino  
**Date:** January 2025  
**Runtime:** Plain HTML/CSS/JS — Build step: Node.js 18+ (no external dependencies)

