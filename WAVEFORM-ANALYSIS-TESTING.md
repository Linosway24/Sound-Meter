# Waveform Analysis Testing Guide

## How to Verify Waveform Analysis is Working

### Quick Test Steps

1. **Open the browser console** (F12 or Cmd+Option+I)

2. **Start a measurement** on the device (press RUN/PAUSE button)

3. **Play hammering audio with analysis enabled:**
   ```javascript
   window.AudioPlayer.playPreset('hammering')
   ```

4. **Check the device display:**
   - The main SPL readout should show values that **spike when hammer hits occur**
   - Values should vary based on actual audio amplitude
   - Spikes should match the timing of hammer hits in the audio file

5. **Enable debug logging:**
   ```javascript
   window.AudioPlayer._debugAnalysis = true
   ```
   - You'll see `[AUDIO-ANALYSIS] 🔨 Impulse detected: XX.X dB` when hammer hits are detected
   - You'll see occasional `[AUDIO-ANALYSIS] 📊 Steady-state: XX.X dB` for continuous sounds

6. **Check analysis status:**
   ```javascript
   window.AudioPlayer.checkAnalysisStatus()
   ```
   - Should show `isActive: true` when analysis is running
   - `lastSPL` shows the most recent calculated SPL value

### Visual Indicators

**On Device Display:**
- **Main SPL readout** (`measurement.currentSPL`) updates in real-time
- **Bar graph** shows level changes
- Values should **spike** when hammer hits/claps occur (not smooth/regular)

**In Audio Panel:**
- Status shows `🎤 Analyzing` when analysis mode is active
- Status updates with current SPL: `▶ 🔨 95.2 dB` (impulse) or `▶ 📊 85.1 dB` (steady)

### Comparison Test: Analysis vs Preset Mode

**Test 1: Analysis Mode (responds to actual audio)**
```javascript
// Enable debug
window.AudioPlayer._debugAnalysis = true

// Play hammering with analysis
window.AudioPlayer.playPreset('hammering', true, true)  // analysis mode

// Watch console - you'll see irregular spikes matching actual hammer hits
// Device display shows spikes at actual audio event times
```

**Test 2: Preset Mode (uses simulator patterns)**
```javascript
// Play hammering with preset mode
window.AudioPlayer.playPreset('hammering', true, false)  // preset mode

// Watch console - no analysis logs
// Device display shows regular, predictable spikes every ~650ms (preset interval)
```

### Expected Behavior

**Hammering Audio:**
- ✅ **Analysis Mode**: Spikes occur at **irregular intervals** matching actual hammer hits
- ✅ Spikes vary in amplitude based on actual audio peak levels
- ✅ Console shows `🔨 Impulse detected` messages when peaks are found
- ❌ **Preset Mode**: Spikes occur at **regular ~650ms intervals** (preset pattern)

**Steady Sounds (fan, engine):**
- ✅ **Analysis Mode**: Smooth, continuous readings based on RMS
- ✅ Values fluctuate naturally with audio amplitude
- ✅ Console shows occasional `📊 Steady-state` messages
- ❌ **Preset Mode**: Values follow preset baseLevel ± variation pattern

**Clapping Audio:**
- ✅ **Analysis Mode**: Spikes match actual clap timing (irregular)
- ✅ Each clap creates a spike
- ❌ **Preset Mode**: Regular spikes every ~500ms (preset pattern)

### Troubleshooting

**If analysis isn't working:**

1. **Check if analysis is enabled:**
   ```javascript
   window.AudioPlayer.checkAnalysisStatus()
   ```
   - `isActive` should be `true`
   - `analysisLoop` should not be `null`

2. **Check if measurement is running:**
   - Device must be in RUN state (not paused/stopped)
   - Press RUN/PAUSE button to start measurement

3. **Check audio playback:**
   ```javascript
   window.AudioPlayer.getState()
   ```
   - `isPlaying` should be `true`

4. **Verify audio file exists:**
   - Check browser console for audio loading errors
   - Audio files should be in `assets/audio/` directory

5. **Check browser console for errors:**
   - Look for `[AUDIO]` or `[AUDIO-ANALYSIS]` error messages

### Advanced Debugging

**Monitor SPL values in real-time:**
```javascript
// Log every SPL update
setInterval(() => {
    const status = window.AudioPlayer.checkAnalysisStatus();
    if (status.lastSPL) {
        console.log(`Current SPL: ${status.lastSPL.toFixed(1)} dB`);
    }
}, 500);  // Every 500ms
```

**Compare with Measurement module:**
```javascript
// Check what Measurement module sees
setInterval(() => {
    const results = window.Measurement.getResults();
    console.log(`Measurement SPL: ${results.currentSPL.toFixed(1)} dB`);
}, 500);
```

**View raw audio data:**
```javascript
// Access analyser node data (requires debug mode)
window.AudioPlayer._audioAnalysisState.dataArray
// This is a Float32Array of waveform samples
```

### Success Criteria

✅ **Analysis is working if:**
1. Device SPL readout updates when audio plays
2. Spikes match actual audio events (not preset timings)
3. Console shows analysis logs (when debug enabled)
4. `checkAnalysisStatus()` shows `isActive: true`
5. Audio panel shows `🎤 Analyzing` status

❌ **Analysis is NOT working if:**
1. SPL values are regular/predictable (preset mode)
2. No console logs appear (when debug enabled)
3. `checkAnalysisStatus()` shows `isActive: false`
4. Audio panel shows preset dB value instead of `🎤 Analyzing`

