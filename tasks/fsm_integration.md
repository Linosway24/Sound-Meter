# Cursor Task: Integrate Startup FSM (Power + Backlight)

## 🎯 OBJECTIVE
Integrate `/js/fsm/startupHomeFSM.js` into the existing project so that:
- Pressing **Power** performs the Boot → Home (dim) → Backlight → Home (lit) sequence.
- Pressing **Backlight** toggles the LCD between dim and lit.
- All screen transitions are driven by `/data/screen-atlas.json`.
- Existing functionality remains unchanged and can be toggled via a feature flag.

---

## ⚙️ IMPLEMENTATION RULES
1. **Make minimal, non-destructive edits.**
   - Add imports and calls; don’t overwrite working code.
2. If files or folders are missing, **create them**.
3. Wrap all new behavior behind a feature flag:
   ```js
   export const FEATURE_STARTUP_INTEGRATION = true;