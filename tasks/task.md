# Cursor Task: Add FSM v2 (SLM + Meter Set) in Parallel — Feature-Flagged & Sandbox-Tested

## 🎯 Objective
Create a **parallel FSM v2** that includes:
- Startup/Home (mirror of your working behavior)
- **SLM operation**: Run → Pause → Stop (3-sec hold confirm) → Stopped → Run
- **SLM View menu** (👓 softkey → list → OK/Cancel)
- **Setup → Meter Set** with your exact edit behavior  
  (UP/DOWN adjust; LEFT moves focus value→title; ENTER on value saves/focus title; ENTER on title exits to Setup; ESC cancels)

Do **not** modify your working FSM. Load v2 only when `FEATURE_FSM_V2=true`. Provide a **sandbox** page to test v2.

---

## 🧱 File Layout (reference)
```
/js/
  main.js
  buttons.js
  display.js
  config.js
  /fsm/
    startupHomeFSM.js        (your current working one; untouched)
    startupHomeFSM.v2.js     (NEW — this task builds it)
...
**End of `task.md`.**
