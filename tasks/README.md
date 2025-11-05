# Task Template Guide

This directory contains templates and task lists for planning Quest SoundPro SE-DL implementation tasks.

## Files

- `tasks-PRD.md` - Complete list of all tasks and sub-tasks for the project
- `task-template.md` - Template for creating new task planning files
- `generate-task.js` - Script to automatically generate task files from task list
- `task-1.0-device-structure.md` - Example completed task file

## Quick Start: Generate Task File Automatically

**Simple way:** Use the generator script to automatically create a task file:

```bash
node generate-task.js <task-list-file> <task-number>
```

**Examples:**
```bash
# Generate task 2.0 from tasks-PRD.md
node generate-task.js tasks-PRD.md 2.0

# Generate task 1.0 from tasks-PRD.md
node generate-task.js tasks-PRD.md 1.0

# Use a different task list file
node generate-task.js my-tasks.md 3.0
```

The script will:
1. Read your task list file
2. Extract the specified task and all sub-tasks
3. Fill in the template automatically
4. Generate `task-X-X.md` with all placeholders filled in

**Output:** Creates `task-2-0.md` (or `task-1-0.md`, etc.) with:
- Task number and title filled in
- All sub-tasks listed in Success Criteria
- Implementation plan with all sub-tasks
- `[TASK-LIST-FILE]` replaced with your actual filename
- Ready for you to fill in remaining details (Goal, Current State, etc.)

## Manual Method: Create Task File Manually

If you prefer to fill it in manually:

1. **Identify your task list file** - this could be `tasks-PRD.md`, `my-tasks.md`, or any file containing your task list

2. **Open your task list file** and find the task you want to implement (e.g., 2.0, 3.0, etc.)

3. **Copy the task section** including:
   - Task number and title
   - All sub-tasks with their numbers

4. **Open `task-template.md`** and copy it to a new file named `task-X-X.md` (e.g., `task-2-0.md`)

5. **Fill in the template:**
   - Replace `[TASK-LIST-FILE]` with your actual task list filename (e.g., `tasks-PRD.md`, `my-tasks.md`)
   - Replace `[Task Title]` with the task title from your task list file
   - Replace `X.X` with the actual task number
   - Copy all sub-tasks into the Success Criteria section
   - Fill in each section based on:
     - Requirements from `PRD.md`
     - Relevant files from your task list file
     - Context from previous tasks
     - Firmware R.13J documentation

6. **Complete each section:**
   - **Task Overview:** Title and goal statement
   - **Current State:** What exists/what needs to be created
   - **Problem Statement:** Why this task is needed
   - **Functional Requirements:** Copy from PRD.md relevant sections
   - **Implementation Plan:** List all sub-tasks from your task list file
   - **File Structure:** List files to create/modify from your task list file
   - **AI Agent Instructions:** Detailed workflow for implementation

## Example

To create Task 2.0 using `tasks-PRD.md`:

**Automatic method:**
```bash
node generate-task.js tasks-PRD.md 2.0
```

**Manual method:**
1. Replace `[TASK-LIST-FILE]` with `tasks-PRD.md` throughout the template

2. From `tasks-PRD.md`, find Task 2.0 and copy:
   ```
   - [ ] 2.0 Core Interaction System
     - [ ] 2.1 Create `js/device.js` module...
     - [ ] 2.2 Implement power on/off...
     [etc.]
   ```

3. Create `task-2-0.md` from `task-template.md`

4. Fill in:
   - Title: "Core Interaction System"
   - Goal: Based on PRD requirements
   - Sub-tasks: All 2.1-2.11 from tasks-PRD.md
   - Files: js/device.js, js/buttons.js, js/menu.js from tasks-PRD.md
   - Requirements: From PRD.md Requirements 8-12

## Reference Files

- `PRD.md` - Complete project requirements
- `ai_task_template_skeleton.md` - Base template structure (in parent directory)
- `[TASK-LIST-FILE]` - Your task list file (specify when creating task)
- Firmware documentation in `Documents/` folder

