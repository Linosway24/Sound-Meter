# Audio Files for SIERTEK Training

Place audio files in this directory to enable sound playback during training scenarios.

## Required Files

| Filename | Description | Recommended Source |
|----------|-------------|-------------------|
| `fan.mp3` | Steady fan/HVAC hum | Freesound.org - search "fan hum loop" |
| `engine.mp3` | Engine/motor idle | Freesound.org - search "engine idle loop" |
| `hammering.mp3` | Intermittent hammering | Freesound.org - search "hammering metal" |
| `clapping.mp3` | Clapping/burst sounds | Freesound.org - search "clapping" |
| `machinery.mp3` | Industrial machinery | Freesound.org - search "factory machinery" |
| `office.mp3` | Quiet office ambient | Freesound.org - search "office ambience" |
| `calibration_1khz.mp3` | 1kHz sine wave tone | Generate with Audacity or online tone generator |

## File Requirements

- Format: MP3 (preferred) or WAV
- Duration: 10-30 seconds (will loop)
- Sample rate: 44.1kHz or 48kHz
- Bitrate: 128kbps+ for MP3

## Free Sound Sources

1. **Freesound.org** - Large library of free sounds (requires free account)
2. **Pixabay.com/sound-effects** - Royalty-free sounds
3. **Zapsplat.com** - Free sound effects
4. **Audacity** - Generate calibration tones (Generate → Tone → 1000Hz)

## Usage

```javascript
// In browser console:
window.Audio.listPresets();           // Show all presets
window.Audio.playPreset('fan');       // Play fan sound
window.Audio.playPreset('hammering'); // Play hammering
window.Audio.stop();                  // Stop playback
window.Audio.setVolume(0.5);          // Set volume 50%
```

## Creating Calibration Tone

Using Audacity:
1. Generate → Tone
2. Waveform: Sine
3. Frequency: 1000 Hz
4. Amplitude: 0.8
5. Duration: 10 seconds
6. Export as MP3

## License Note

Ensure any audio files used are:
- Royalty-free
- Licensed for educational use
- Properly attributed if required

