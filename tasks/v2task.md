# Cursor Task: Add FSM v2 (SLM + Meter Set) in Parallel — Feature-flagged & Sandbox-tested

## Objective
Create a **parallel FSM v2** with SLM and Meter Set features, without touching the existing working FSM. Default to **OFF**, enable via `FEATURE_FSM_V2=true` to switch. Include an isolated sandbox page to test v2 end-to-end.

---

## Files to Create / Update

### 1) `/js/config.js`
- Ensure these exports exist (append if missing):
```js
export const FEATURE_STARTUP_INTEGRATION = true;   // existing flag
export const FEATURE_FSM_V2 = false;               // NEW: default OFF for safety