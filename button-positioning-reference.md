# Button & LCD Positioning Reference (Task 1.0)

This reference captures absolute overlay coordinates relative to the `.device-frame` (the device photo).

Notes:
- All positions are CSS absolute values relative to the device photo bounds.
- Units can be pixels or percentages; percentages recommended for scaling with image.
- Initial values below reflect the defaults currently in `css/styles.css` and will be refined during Task 1.5.

## LCD Region
- name: LCD
- selector: `.lcd`
- top: 18%
- left: 18%
- width: 60%
- height: 34%
- notes: Powered-off visual state; rows = status, main, softkey labels

## Soft Keys
1. Soft Key 1
   - selector: `.soft-key--1`
   - top: 56%
   - left: 30%
   - width: 5.4%
   - height: 3.2%
2. Soft Key 2
   - selector: `.soft-key--2`
   - top: 56%
   - left: 45%
   - width: 5.4%
   - height: 3.2%
3. Soft Key 3
   - selector: `.soft-key--3`
   - top: 56%
   - left: 60%
   - width: 5.4%
   - height: 3.2%
4. Soft Key 4
   - selector: `.soft-key--4`
   - top: 56%
   - left: 75%
   - width: 5.4%
   - height: 3.2%

## Navigation Cluster
- name: Navigation Cluster container
- selector: `.nav`
- top: 66%
- left: 55%
- width: 12%
- height: 12%

Child buttons (relative to `.nav` container):
- Up: `.nav__btn--up` → top: 0%; left: 33%; size: 34% × 34%
- Down: `.nav__btn--down` → bottom: 0%; left: 33%; size: 34% × 34%
- Left: `.nav__btn--left` → top: 33%; left: 0%; size: 34% × 34%
- Right: `.nav__btn--right` → top: 33%; right: 0%; size: 34% × 34%
- Enter: `.nav__btn--enter` → top: 33%; left: 33%; size: 34% × 34%

## Function Buttons
1. Alt f
   - selector: `.fn-btn--altf`
   - top: 24%
   - right: 12%
   - width: 5%
   - height: 3.2%
2. Backlight
   - selector: `.fn-btn--backlight`
   - top: 30%
   - right: 12%
   - width: 5%
   - height: 3.2%
3. Run/Pause
   - selector: `.fn-btn--runpause`
   - top: 36%
   - right: 12%
   - width: 5%
   - height: 3.2%
4. Stop
   - selector: `.fn-btn--stop`
   - top: 42%
   - right: 12%
   - width: 5%
   - height: 3.2%
5. On/Off
   - selector: `.fn-btn--power`
   - top: 48%
   - right: 12%
   - width: 5%
   - height: 3.2%

## Verification Checklist (Task 1.0)
- [ ] All overlays visible with testing outlines
- [ ] Buttons show pointer and active press feedback
- [ ] LCD overlay aligns with photo LCD window
- [ ] No overlay is clipped or outside image bounds

## To refine during Task 1.5
Use the interactive positioning debug tool to fine-tune the values above, then update this reference.

