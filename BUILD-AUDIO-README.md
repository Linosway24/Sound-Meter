# Audio Base64 Build System

## Overview

The audio build system converts audio files from `assets/audio/` into a Base64-encoded JavaScript module (`js/audio-data.js`) for CORS-safe WebAudio playback in iframe environments (e.g., Blackboard Ultra).

## Problem

When running in Blackboard Ultra iframes, WebAudio API cannot load audio files via file paths due to CORS (Cross-Origin Resource Sharing) restrictions. The iframe sandbox blocks access to `assets/audio/*.wav` files, causing audio playback and waveform analysis to fail.

## Solution

Audio files are embedded as Base64-encoded data URIs directly in a JavaScript module, eliminating the need for separate HTTP requests and bypassing CORS restrictions entirely.

## Usage

### Building Audio Data

Run the build script to generate `js/audio-data.js`:

```bash
node build-audio.js
```

The script will:
1. Read all `.wav` files from `assets/audio/`
2. Convert each file to Base64-encoded data URI
3. Generate `js/audio-data.js` with the audio data

### Output

The generated `js/audio-data.js` exports:
- `window.AUDIO_DATA` - Object mapping filenames to Base64 data URIs
- Example: `AUDIO_DATA['fan.wav']` → `'data:audio/wav;base64,...'`

### When to Run

Run the build script:
- Before deployment to production
- After adding or modifying audio files in `assets/audio/`
- As part of your deployment pipeline

## How It Works

1. **Build Time**: `build-audio.js` converts audio files to Base64
2. **Runtime**: `js/audio.js` checks for `window.AUDIO_DATA` first (Base64 data), falls back to file paths if not available (development mode)

### Audio Module Integration

The audio module (`js/audio.js`) automatically uses Base64 data when available:

```javascript
// Checks for Base64 data first (CORS-safe)
if (window.AUDIO_DATA && window.AUDIO_DATA[filename]) {
    return window.AUDIO_DATA[filename];
}
// Falls back to file path (development mode)
return `assets/audio/${filename}`;
```

## File Size

Base64 encoding adds approximately 33% size overhead:
- Raw audio files: ~68 MB total
- Base64-encoded: ~90 MB total

This overhead is acceptable for small audio files and ensures reliable playback in restricted iframe environments.

## Requirements

- Node.js 18+ (uses built-in `fs`, `path`, `Buffer` modules only)
- No external dependencies

## Generated File

The generated `js/audio-data.js` file:
- Is automatically loaded by `index.html` before `js/audio.js`
- Contains Base64-encoded audio data for all `.wav` files
- Includes build timestamp and file count in header comments
- Should be committed to version control or generated during build

## Troubleshooting

### Audio files not loading

1. **Check if build script was run**: Verify `js/audio-data.js` exists
2. **Check browser console**: Look for CORS errors or missing file errors
3. **Verify audio files exist**: Ensure `.wav` files are in `assets/audio/`
4. **Check file names**: Audio presets use filenames (e.g., `'fan.wav'`), not paths

### Build script errors

- **"Audio directory not found"**: Ensure `assets/audio/` directory exists
- **"No .wav files found"**: Add audio files to `assets/audio/` directory
- **Permission errors**: Check file permissions on `assets/audio/` and `js/` directories

## Development vs Production

- **Development**: Can use file paths directly (if not in iframe)
- **Production**: Must use Base64 data (for iframe/CORS environments)

The audio module automatically handles both cases with fallback logic.

