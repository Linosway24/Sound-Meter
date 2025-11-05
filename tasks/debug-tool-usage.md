# Interactive Positioning Debug Tool - Usage Guide

> **Quick Reference:** Standalone tool for visually adjusting button positions in real-time.

## What is the Debug Tool?

The Interactive Positioning Debug Tool is a JavaScript-based development tool that makes it easy to fine-tune button positions visually. Instead of manually editing CSS files and refreshing the browser, you can:

- See all button boundaries with visual overlays
- Click any button to select it for editing
- Adjust position/size in real-time with input fields
- Export corrected CSS with one click
- No CSS knowledge required!

---

## Prerequisites

✅ **Script included in HTML** - The debug tool script (`js/debug-positioning.js`) must be loaded  
✅ **Open HTML file from localhost** - The tool only works when running from `localhost`, `127.0.0.1`, or `file://` protocol  
✅ **Buttons exist in HTML** - The tool automatically detects buttons with classes: `.soft-key`, `.fn-btn`, `.nav`, `.nav__btn`

---

## Quick Start

### Step 1: Open the HTML File
```
Open: index.html in your browser
URL should be: http://localhost/... or file:///...
```

### Step 2: Enable Debug Mode
```
Press: Ctrl+D (Windows/Linux) or Cmd+D (Mac)
Result: Debug panel appears, all buttons get red overlays
```

### Step 3: Select a Button
```
Click: On any misaligned button
Result: Button highlights, debug panel shows its position/size
```

### Step 4: Adjust Position and Size
```
Position: Drag the button body to move it
Resize: Drag the corner handles (red squares) to resize
Precise: Use input fields in debug panel (Top, Left, Width, Height)
Result: Button moves/resizes in real-time
```

### Step 5: Save to CSS (Auto-Save Enabled)
```
Click: "Save to CSS" button (first time only - selects css/styles.css)
Result: CSS automatically saved to file!
After: Changes auto-save 1 second after you stop adjusting
```

**Note:** After the first manual save, all position changes are automatically saved to `css/styles.css` 1 second after you stop adjusting values. No manual file editing needed!

---

## Detailed Usage Instructions

### Enabling Debug Mode

**Keyboard Shortcut:**
- **Windows/Linux:** `Ctrl + D`
- **Mac:** `Cmd + D` (Command + D)

**What Happens:**
- Debug panel appears in top-right corner
- All buttons get red semi-transparent overlays
- Cursor changes to move icon when hovering over buttons (indicating they're draggable)
- When a button is selected, red resize handles appear at corners

**Disabling Debug Mode:**
- Press `Ctrl+D` (or `Cmd+D`) again to toggle off
- Or click the × button in the debug panel

---

### Selecting a Button

**Method 1: Click on Button**
- Click any button element (soft key, navigation, function button)
- Selected button gets brighter red border
- Debug panel updates with button's information

**Method 2: Click Button Multiple Times**
- If you click the same button again, it stays selected
- Useful for making multiple adjustments

**Visual Indicators:**
- **Red overlay** = All buttons in debug mode
- **Brighter red border** = Currently selected button
- **Move cursor** = Buttons are draggable (cursor changes to move icon)
- **Red resize handles** = Top-left and bottom-right corners show resize handles when button is selected
- **Resize cursor** = Cursor changes to resize icon when near corners

---

### Adjusting Position and Size

**Method 1: Drag to Position**
- Click and hold any button in debug mode (away from corners)
- Drag it to the desired position
- Release mouse button
- Button position updates automatically
- Input fields update in real-time as you drag
- Auto-saves after you release (if file handle is set)

**Method 2: Drag Corners to Resize**
- Select a button (click on it)
- Red resize handles appear at top-left and bottom-right corners
- Click and drag a corner handle to resize the button
- **Bottom-right corner:** Resizes width and height (position stays fixed)
- **Top-left corner:** Resizes width, height, and adjusts position
- Input fields update in real-time as you resize
- Auto-saves after you release (if file handle is set)

**Method 3: Input Fields (Precise Control)**
- **Top:** Vertical position from top of container (in pixels)
- **Left:** Horizontal position from left of container (in pixels)
- **Width:** Button width (in pixels)
- **Height:** Button height (in pixels)

**How to Adjust with Inputs:**
1. Click in the input field you want to change
2. Type new value or use arrow keys to increment/decrement
3. Press Enter or click outside the field
4. Button updates immediately (no page refresh needed!)

**Tips:**
- **Drag for quick positioning** - Fastest way to align buttons visually
- **Drag corners to resize** - Match button size to device photo
- **Input fields for precision** - Use for exact pixel values
- Use arrow keys in input fields for fine adjustments (+1/-1 pixel)
- Use Shift + Arrow keys for larger steps (+10/-10 pixels)
- Watch the button move/resize in real-time as you drag or type
- **Note:** Coordinate labels are not shown on buttons - check the debug panel for values

---

### Saving to CSS (Auto-Save)

**Save to CSS Button (Primary - Blue):**
- Click "Save to CSS" button in debug panel
- **First time:** Browser prompts you to select `css/styles.css` file
- After selecting the file, changes are saved automatically
- Alert message confirms save success: `✓ Saved .soft-key-1 to CSS file!`

**Auto-Save Feature:**
- After first manual save, all position changes auto-save 1 second after you stop adjusting
- No need to click "Save to CSS" again after the first time
- Changes are written directly to `css/styles.css` file
- Works silently in the background (no alerts during auto-save)

**Browser Compatibility:**
- **Chrome/Edge:** Full auto-save support (File System Access API)
- **Firefox/Safari:** Falls back to download (select "Save to CSS" each time)

**Exported CSS Format:**
```css
.soft-key-1 {
  top: 850px;
  left: 400px;
  width: 120px;
  height: 60px;
}
```

---

### Exporting CSS (Manual Copy)

**Export CSS Button:**
- Click "Export CSS" button in debug panel
- CSS code is automatically copied to clipboard
- Alert message confirms copy success
- Use this if you prefer to manually paste into the CSS file

**Manual Method (Alternative):**
1. Click "Export CSS" to copy CSS to clipboard
2. Open `css/styles.css` in your code editor
3. Find the CSS rule for that button (e.g., `.soft-key-1`)
4. Replace the `top`, `left`, `width`, `height` values with exported values
5. Save the file
6. Refresh browser to see permanent changes

---

### Copying Coordinates

**Copy Coordinates Button:**
- Click "Copy Coordinates" button
- Button's position data copied to clipboard
- Format: `top: 850px, left: 400px, width: 120px, height: 60px`

**Use Case:**
- Quick sharing of position data
- Documentation purposes
- Comparing positions between buttons

---

### Resetting Changes

**Reset Button:**
- Click "Reset" button in debug panel
- Button returns to its original position (from CSS file)
- Useful if you make a mistake or want to start over

**Note:** Reset only works for the currently selected button. Page refresh will restore all buttons to CSS values.

---

## Example Workflow

### Scenario: Soft Key 1 is misaligned

**Step 1: Enable Debug Mode**
```
Press Ctrl+D
See: All buttons have red overlays
```

**Step 2: Select Misaligned Button**
```
Click: Soft Key 1 button
See: Debug panel shows:
  Selected Element: soft-key-1
  Top: 850
  Left: 420  ← This looks wrong
  Width: 120
  Height: 60
```

**Step 3: Adjust Position and Size**
```
Position: Drag button 20px to the left (or change Left from 420 to 400)
Size: Drag bottom-right corner to match photo button size
See: Button moves/resizes in real-time
Verify: Button now aligns with photo button location and size
```

**Step 4: Save to CSS**
```
Click: "Save to CSS" (first time - select css/styles.css)
See: Alert "✓ Saved .soft-key-1 to CSS file!"
Result: CSS automatically updated!
```

**Step 5: Verify**
```
Refresh: Browser (if needed)
Result: Button is now correctly positioned!
Note: Future adjustments auto-save automatically
```

---

## Common Tasks

### Adjusting Multiple Buttons

1. Click "Save to CSS" once (first time - select css/styles.css)
2. Select first button → Adjust → Auto-saves after 1 second
3. Select second button → Adjust → Auto-saves after 1 second
4. Repeat for each button - all changes auto-save
5. Refresh browser once at the end to see all changes

### Finding Button Class Names

- Debug panel shows "Selected Element" name
- Usually shows the CSS class name (e.g., `soft-key-1`, `nav-button-up`)
- Use this to find the correct CSS rule in `styles.css`

### Fine-Tuning Position

- Make small adjustments (1-5 pixels at a time)
- Compare button position to photo location visually
- Use browser zoom (Ctrl/Cmd + Plus) for precise alignment
- Check alignment at different zoom levels

### Checking Button Size

- Compare `width` and `height` values to photo button size
- Ensure aspect ratio matches photo button shape
- Adjust if button looks too wide/narrow or tall/short

---

## Troubleshooting

### Debug Panel Doesn't Appear

**Problem:** Pressing `Ctrl+D` does nothing

**Solutions:**
- Verify you're running from `localhost`, `127.0.0.1`, or `file://` protocol
- Check browser console for JavaScript errors
- Ensure `js/debug-positioning.js` is loaded in HTML (check Network tab)
- Verify the script tag exists: `<script src="js/debug-positioning.js"></script>`

### Buttons Don't Have Overlays

**Problem:** Debug mode enabled but no red overlays visible

**Solutions:**
- Check that buttons have correct CSS classes (`.soft-key`, `.nav-button`, `.function-button`)
- Verify CSS debug styles are loaded
- Check browser console for errors
- Try refreshing the page

### Input Fields Don't Update Button

**Problem:** Changing values doesn't move the button

**Solutions:**
- Ensure a button is selected (check "Selected Element" in panel)
- Check browser console for JavaScript errors
- Verify button has `position: absolute` in CSS
- Try selecting the button again

### Save to CSS Doesn't Work

**Problem:** "Save to CSS" button doesn't save or prompts every time

**Solutions:**
- **Chrome/Edge:** Ensure you're running from `localhost` or `127.0.0.1` (File System Access API requires secure context)
- **First time:** Make sure to select `css/styles.css` when prompted
- **Firefox/Safari:** File System Access API not supported - will download CSS instead (paste manually)
- Check browser console for errors
- Ensure a button is selected before saving

### Export CSS Doesn't Work

**Problem:** "Export CSS" button doesn't copy to clipboard

**Solutions:**
- Check browser permissions for clipboard access
- Try manually copying from alert message (if shown)
- Check browser console for errors
- Ensure a button is selected before exporting

### Button Position Resets After Refresh

**Problem:** Adjustments disappear after page refresh

**Solution:** Make sure you've saved the changes:
1. Click "Save to CSS" button (first time - select css/styles.css)
2. After first save, changes auto-save automatically
3. Refresh browser to see permanent changes

**If using manual method:**
1. Click "Export CSS" to copy CSS
2. Paste into `css/styles.css` file
3. Save the CSS file
4. Then refresh browser

### Can't Find CSS Rule in styles.css

**Problem:** Don't know which CSS rule to update

**Solutions:**
- Check "Selected Element" name in debug panel
- Search `styles.css` for that class name
- Use browser DevTools: Right-click button → Inspect → See computed styles
- Look for the class name in the HTML element

---

## Tips & Best Practices

### Workflow Tips

1. **Adjust one button at a time** - Easier to track changes
2. **Verify alignment visually** - Compare to photo at different zoom levels
3. **Save to CSS once** - After first save, auto-save handles the rest
4. **Test all buttons** - After adjusting, test clicking each button
5. **Document changes** - Note any special positioning considerations
6. **Auto-save is silent** - Check browser console if you want to verify saves

### Positioning Tips

1. **Start with position (top/left)** - Get button in right location first
2. **Then adjust size (width/height)** - Match button size to photo
3. **Use photo as reference** - Keep photo visible while adjusting
4. **Make small increments** - 1-5 pixel adjustments are easier to verify
5. **Check at full zoom** - Sometimes buttons look aligned but aren't

### CSS File Tips

1. **Backup before editing** - Save a copy of `styles.css` before making changes
2. **Comment changes** - Add comments like `/* Adjusted via debug tool - verified visually */`
3. **Group related buttons** - Keep button styles together in CSS file
4. **Test after changes** - Refresh browser and verify button still works

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|---------|--------|
| `Ctrl+D` (Win/Linux) | Toggle debug mode on/off |
| `Cmd+D` (Mac) | Toggle debug mode on/off |
| `↑` / `↓` in input field | Increment/decrement value by 1 |
| `Shift + ↑` / `↓` in input field | Increment/decrement value by 10 |
| `Enter` in input field | Apply value |

---

## For Non-Technical Users

### You Don't Need to Know CSS!

The debug tool makes it easy for anyone to help adjust button positions:

1. **Visual Feedback:** See exactly where buttons are positioned
2. **Easy Adjustment:** Just change numbers in the panel
3. **No Code Editing:** The tool generates the CSS code for you
4. **Simple Sharing:** Export CSS and share with developer

### What You'll Do:

1. Open HTML file in browser
2. Press `Ctrl+D` to enable debug mode
3. Click misaligned button
4. Change numbers until button looks right
5. Click "Export CSS"
6. Share the CSS code with developer

That's it! No CSS knowledge required.

---

## For Developers

### Integration Checklist

- [ ] `js/debug-positioning.js` file exists
- [ ] Script tag added to `index.html`: `<script src="js/debug-positioning.js"></script>`
- [ ] Debug CSS styles added to `css/styles.css`
- [ ] Tested keyboard shortcut (Ctrl+D / Cmd+D)
- [ ] Verified localhost/file:// check works
- [ ] Tested with all button types

### Code Location

- **JavaScript:** `js/debug-positioning.js`
- **HTML:** Debug panel in `index.html`
- **CSS:** Debug styles in `css/styles.css`

### Disabling Debug Tool

To disable the debug tool:
1. Remove or comment out script tag in `index.html`
2. Or modify `js/debug-positioning.js` to never initialize
3. Debug tool only loads on localhost by default

---

## Support

**Need Help?**
- Review browser console for error messages
- Verify all prerequisites are met
- Check that button CSS classes match expected selectors (`.soft-key`, `.fn-btn`, `.nav`, `.nav__btn`)
- Ensure script is loaded and running from localhost/file://

**Found a Bug?**
- Check browser console for JavaScript errors
- Verify button selectors match expected classes in your HTML
- Ensure CSS classes haven't changed
- Test in different browsers

---

**Last Updated:** October 2025  
**Standalone Tool:** No dependencies on other tasks - works with any HTML structure containing the button classes

