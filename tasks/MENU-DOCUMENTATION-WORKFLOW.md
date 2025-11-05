# Menu Documentation Workflow

**Problem:** The initial menu structure was based on assumptions. We need to document the ACTUAL menus from the physical device.

**Solution:** Use a systematic approach to document menus screen-by-screen as you navigate the device.

---

## 🎯 RECOMMENDED: Fastest Approach

**Use `menu-quick-capture.md`** - Simplified template for quick documentation

**Just navigate and describe what you see. I'll structure it into JSON/Markdown.**

---

## 📋 Alternative Approaches

### Option 1: Quick Capture (FASTEST) ⭐ RECOMMENDED

1. **Use `menu-quick-capture.md`** - Simple format
2. **Navigate device** and fill in menu items as you go
3. **Focus on SETUP menu first** (most important)
4. **I'll convert your notes** into structured JSON/Markdown

**Best for:** Getting information quickly without worrying about format

### Option 2: Fill Out Detailed Template

1. **Use `menu-structure-capture-template.md`** - Comprehensive template
2. **Power on device** and start documenting from first screen
3. **Navigate through each menu** and fill out the template
4. **For each screen**, document:
   - Menu items (exact labels)
   - Soft key labels (1-4)
   - Alt f soft keys (if applicable)
   - How to navigate there
   - How to go back

**Best for:** Complete documentation in one pass

### Option 3: Describe Navigation Flow

1. **Describe the menu hierarchy** as you navigate:
   - "From STARTUP screen, selecting SETUP opens..."
   - "From SETUP, selecting [item] opens..."
2. **I'll convert your descriptions** into structured JSON/Markdown

**Best for:** Verbal/written descriptions without templates

---

## 📋 What We Know So Far

**Startup Screen:**
- START
- VIEW PAST STUDIES (default selected)
- VIEW CURRENT STUDY
- VIEW SESSION
- SETUP
- UNIT INFO

**Bottom Status Bar:**
- `<SLM>` (with arrows)
- `CAL`
- `FILE`
- `LOCK`

**What We Need:**

1. **For STARTUP screen:**
   - What are the soft key labels (1-4) at bottom of LCD?
   - What does each menu item do when selected?
   - Do any items have sub-menus?

2. **For each sub-menu:**
   - What menu items are in SETUP?
   - Where are Weighting, Time Constant, Range, Dose settings?
   - Where is Backlight settings?
   - Where is Calibration?

3. **Navigation:**
   - How do you select a menu item? (Enter button? Soft key?)
   - How do you go back? (Esc? Back soft key?)
   - How do Up/Down arrows work?

4. **Alt f:**
   - Which menus have Alt f functionality?
   - What are the alternate soft key labels?

---

## 🚀 Quick Start Guide

**Easiest approach - Just answer these questions:**

1. **From the STARTUP screen, what happens when you:**
   - Select START: _______________
   - Select SETUP: _______________
   - Select UNIT INFO: _______________

2. **What are the soft key labels on STARTUP screen?**
   - Soft Key 1: _______________
   - Soft Key 2: _______________
   - Soft Key 3: _______________
   - Soft Key 4: _______________

3. **Navigate to SETUP and tell me what menu items you see:**
   - Item 1: _______________
   - Item 2: _______________
   - Item 3: _______________
   - etc.

4. **Continue navigating and describing each menu you find**

---

## 📝 What to Document

For **each screen/menu**, provide:

1. **Menu Name/Title** (what appears at top of screen)
2. **Menu Items** (exact labels, in order)
3. **Soft Key Labels** (what appears at bottom of LCD for keys 1-4)
4. **Alt f Soft Keys** (if Alt f works on this menu)
5. **How to Navigate Here** (which menu item leads here)
6. **How to Go Back** (Esc? Back soft key? Power button?)

---

## 🔄 Next Steps

**Choose one:**

1. **Fill out `menu-structure-capture-template.md`** as you navigate
2. **Describe menus** as you navigate and I'll structure them
3. **Update `menu-structure-review.json`** directly with actual menus
4. **Provide answers** to the Quick Start questions above

Once we have the actual menu structure documented, I'll update both the JSON and Markdown review documents to match the real device.

