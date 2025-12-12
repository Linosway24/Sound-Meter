# Phase to Task Mapping

This document clarifies how **Phases** (functional/menu areas) relate to **Tasks** (technical implementation).

## Understanding the Two Systems

### Tasks (from `tasks-PRD.md`)
Organized by **technical implementation area** - what needs to be built technically.

### Phases (from `TASK-MASTER-MENU-STRUCTURE-V2.5.md`)
Organized by **functional/menu area** - what menu/feature area is being worked on.

## Current Mapping

### ✅ Phase 1: Startup & Home
- **Maps to:** Task 1.0 (Device Structure) + Task 2.0 (Core Interaction) + Task 3.0 (Menu System - home menu)
- **Status:** ✅ Complete

### ✅ Phase 2: SLM Core Operation
- **Maps to:** Task 3.0 (Menu System - SLM entry) + Task 2.0 (Core Interaction)
- **Status:** ✅ Complete

### ✅ Phase 3: Setup Menu
- **Maps to:** Task 3.0 (Menu System - setup menus)
- **Status:** ✅ Complete

### ✅ Phase 4: SLM Multi-Page Views & Advanced Features
- **UI/Navigation Part:** ✅ Complete (navigation, mode switching, softkeys)
- **Data/Content Part:** ⏸️ **Maps to Task 5.0 (Measurement Engine)**
  - Pages 2-4 currently have placeholders
  - Task 5.0 will populate them with real measurement data
- **Status:** UI Complete, Data Pending

### ⏸️ Phase 5: Files Menu Enhancements
- **Maps to:** Task 3.0 (Menu System - files menu enhancements)
- **Status:** Basic navigation exists, enhancements pending

### ⏸️ Phase 6: Lock & Calibration
- **Maps to:** Task 8.0 (Calibration Features) + Task 3.0 (Menu System - lock menu)
- **Status:** Basic lock exists, calibration pending

### ⏸️ Phase 7: Alerts & Edge Cases
- **Maps to:** Various tasks (error handling, edge cases)
- **Status:** Pending

## Key Insight

**Phase 4 has TWO parts:**
1. ✅ **UI/Navigation** - DONE (pages, navigation, softkeys, icons, timers)
2. ⏸️ **Data/Content** - PENDING (Task 5.0 - Measurement Engine)

## Next Step Recommendation

**Task 5.0: Measurement Engine** is the next logical step because:
- It completes Phase 4 by populating pages 2-4 with real data
- Phase 4 UI is ready to display the data
- It's the missing piece to make Phase 4 fully functional

**Then:** Phase 5 (Files Menu) can be done as separate menu work.

