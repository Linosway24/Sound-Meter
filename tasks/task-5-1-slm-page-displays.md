# Task 5.1: Fix SLM Page 2 and Page 3 Display Layouts

## Overview
The SLM Page 2 and Page 3 screens currently show incorrect layouts. They display a single large readout with bar graph, but should show **data tables with multiple measurement values**.

## Current (Wrong) Display
- Page label ("Page 2" / "Page 3")
- Bar graph (-20 to 70)
- Single large dB readout (0.0 dB LZS)
- Same layout as Page 1

## Correct Display - Page 2 (Dose/Statistics)
```
┌─────────────────────────────────────┐
│ [battery] [▶▶] [UR] 00:00:05       │
├─────────────────────────────────────┤
│ MAX   18.7 dB │ DOSE   --.--%      │
│ AVG   --.- dB │ PDSE   --.--%      │
│ TWA   --.- dB │ PTWA   --.- dB     │
│ OL     .00 %  │ SEL    --.- dB     │
├─────────────────────────────────────┤
│ EXP  ---  P2S                       │
│ T/L  00:00:00                       │
├─────────────────────────────────────┤
│ [SHOW] [F-S-I] [A-C-Z-F] [METER 1] │
└─────────────────────────────────────┘
```

**Data Fields:**
| Field | Description | Bind Path |
|-------|-------------|-----------|
| MAX | Maximum SPL | `measurement.lmax` |
| AVG | Average SPL (Leq) | `measurement.leq` |
| TWA | Time-Weighted Average | `measurement.twa` (new) |
| OL | Overload percentage | `measurement.overloadPercent` (new) |
| DOSE | Noise dose | `measurement.dose` |
| PDSE | Projected dose | `measurement.pdse` (new) |
| PTWA | Projected TWA | `measurement.ptwa` (new) |
| SEL | Sound Exposure Level | `measurement.sel` |
| EXP | Exchange rate | `measurement.exchangeRate` (new) |
| T/L | Time limit | `measurement.timeLimit` (new) |

## Correct Display - Page 3 (Percentile Statistics)
```
┌─────────────────────────────────────┐
│ [battery] [▶ ‖] [UR] 00:00:19      │
├─────────────────────────────────────┤
│ L01   --.- dB │ L10    --.- dB     │
│ L50   18.1 dB │ L90    18.0 dB     │
│ LDN   --.- dB │ CNEL   --.- dB     │
│ OL     .00 %  │ TK3    18.3 dB     │
│ Lc-a  --.- dB │                    │
├─────────────────────────────────────┤
│ [SHOW] [F-S-I] [A-C-Z-F] [METER 1] │
└─────────────────────────────────────┘
```

**Data Fields:**
| Field | Description | Bind Path |
|-------|-------------|-----------|
| L01 | 1st percentile level | `measurement.L01` (new) |
| L10 | 10th percentile level | `measurement.L10` (new) |
| L50 | 50th percentile (median) | `measurement.L50` (new) |
| L90 | 90th percentile level | `measurement.L90` (new) |
| LDN | Day-Night average | `measurement.Ldn` (new) |
| CNEL | Community Noise Equivalent | `measurement.Cnel` (new) |
| OL | Overload percentage | `measurement.overloadPercent` |
| TK3 | Taktmaximal (German standard) | `measurement.Tk3` (new) |
| Lc-a | C-A weighted difference | `measurement.LcMinusA` (new) |

---

## Implementation Steps

### Phase 1: Update screen-atlas.json
1. Replace `slm_home_page2_*` screen definitions with new element type `dataTable`
2. Replace `slm_home_page3_*` screen definitions with new element type `dataTable`
3. Define column layout and field bindings

### Phase 2: Add dataTable element renderer
1. Add new element type `dataTable` to `screen-renderer.js`
2. Support 2-column layout with label-value pairs
3. Handle `--.-` placeholder for undefined/null values
4. Support different units (dB, %)

### Phase 3: Extend FSM measurement state
Add new measurement fields to `_state.measurement` in `mainFSM.js`:
```javascript
measurement: {
    // Existing
    currentSPL: 0,
    leq: 0,
    lmax: 0,
    lmin: 0,
    sel: 0,
    peak: 0,
    dose: 0,
    
    // New for Page 2
    twa: null,           // Time-Weighted Average
    pdse: null,          // Projected Dose
    ptwa: null,          // Projected TWA
    overloadPercent: 0,  // OL %
    exchangeRate: 'P2S', // Exchange rate (3dB, 4dB, 5dB)
    timeLimit: '00:00:00', // T/L time limit
    
    // New for Page 3 (Percentile Statistics)
    L01: null,
    L10: null,
    L50: null,
    L90: null,
    Ldn: null,           // Day-Night Level
    Cnel: null,          // Community Noise Equivalent Level
    Tk3: null,           // Taktmaximal
    LcMinusA: null       // C-A weighting difference
}
```

### Phase 4: Update Measurement module
Extend `measurement.js` to calculate/track:
- Percentile statistics (requires sample history)
- TWA calculation
- Projected values (PDSE, PTWA)
- Overload percentage

### Phase 5: CSS Styling
Add styles for `dataTable` element:
- Two-column grid layout
- Monospace font for values
- Right-aligned numbers
- Proper spacing matching real device

---

## Files to Modify

| File | Changes |
|------|---------|
| `data/screen-atlas.json` | Update page 2/3 screen definitions |
| `js/screen-renderer.js` | Add `dataTable` element renderer |
| `js/fsm/mainFSM.js` | Extend `_state.measurement` with new fields |
| `js/measurement.js` | Add percentile/TWA calculations |
| `css/styles.css` | Add dataTable styling |

---

## Acceptance Criteria

- [ ] Page 2 shows dose/statistics table layout matching reference image
- [ ] Page 3 shows percentile statistics table layout matching reference image
- [ ] Values update in real-time when measurement is running
- [ ] Null/undefined values display as `--.-` or `--.--`
- [ ] Units display correctly (dB, %)
- [ ] Layout matches 2-column format of real device
- [ ] Softkeys remain: [SHOW] [F-S-I] [A-C-Z-F] [METER 1]

---

## Reference Images
- Page 2: `Capture/operational/slm_home_page2_running.jpeg`
- Page 3: `Capture/operational/slm_home_page3_running.jpeg`

---

## Priority
**High** - Required for accurate device simulation

## Estimated Effort
- Phase 1: 1 hour (atlas updates)
- Phase 2: 2 hours (renderer)
- Phase 3: 30 min (state extension)
- Phase 4: 3-4 hours (calculations)
- Phase 5: 1 hour (CSS)

**Total: ~8 hours**

---

## Correct Display - Page 4 (Time History Graph)
```
┌─────────────────────────────────────┐
│ [battery] [▶▶] [UR] 00:00:26       │
├─────────────────────────────────────┤
│ 70─┬─────────────────────────────┐  │
│    │............................. │  │
│    │                              │  │
│ 30─┼─────────────────────────────│  │
│    │              ___/‾‾‾\_      │  │
│    │         ____/         \     │  │
│-10─┼────────/                    │  │
│dB  └─────────────────────────────┘  │
│SEG  0                          [t] │
├─────────────────────────────────────┤
│ [SHOW] [F-S-I] [A-C-Z-F] [METER 1] │
└─────────────────────────────────────┘
```

**Data Requirements:**
| Field | Description | Bind Path |
|-------|-------------|-----------|
| History | Array of SPL samples over time | `measurement.splHistory` (new) |
| Y-axis min | -10 dB | Fixed |
| Y-axis max | 70 dB | Fixed |
| Y-axis mid | 30 dB | Fixed |
| Label | "dB SEG" | Fixed |

**Implementation Notes:**
- Requires maintaining a circular buffer of SPL history samples
- Graph should scroll/update as new samples come in
- Canvas or SVG rendering for the line graph
- Dotted grid lines at 70, 30, -10 dB levels

---

## Updated Implementation Steps

### Phase 1: Update screen-atlas.json
1. Replace `slm_home_page2_*` with `dataTable` element type
2. Replace `slm_home_page3_*` with `dataTable` element type  
3. Replace `slm_home_page4_*` with `timeHistoryGraph` element type

### Phase 2: Add dataTable element renderer
1. Add new element type `dataTable` to `screen-renderer.js`
2. Support 2-column layout with label-value pairs
3. Handle `--.-` placeholder for undefined/null values

### Phase 3: Add timeHistoryGraph element renderer
1. Add new element type `timeHistoryGraph` to `screen-renderer.js`
2. Use Canvas or SVG for line graph rendering
3. Support scrolling time window
4. Draw grid lines at fixed dB levels

### Phase 4: Extend FSM measurement state
Add to `_state.measurement`:
```javascript
// For Page 4 time history
splHistory: [],        // Circular buffer of {time, spl} samples
splHistoryMaxSamples: 300,  // ~30 seconds at 10Hz
```

### Phase 5: Update measurement update loop
Modify `_startMeasurementUpdateLoop()` to:
- Push new samples to `splHistory`
- Maintain circular buffer (remove old samples)

### Phase 6: CSS Styling
- dataTable styles (2-column grid)
- timeHistoryGraph container styles

---

## Notes
- Page 1 (main SLM with bar graph and large readout) is correct - no changes needed
- The percentile calculations require maintaining a sample history buffer
- Time history graph shares the sample buffer with percentile calculations

