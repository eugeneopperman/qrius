---
title: Colors & Gradients
description: Customize QR code colors with solid colors or gradient fills.
sidebar:
  order: 1
---

Your QR code doesn't have to be boring black and white. Qrius lets you pick custom colors for the dots (foreground) and background, or level up with gradient fills.

## Solid Colors

By default, QR codes use black dots on a white background. To change this:

1. **Open the Customize panel** in the QR code editor (right-side icon tabs).
2. **Click the Colors tab** (the palette icon).
3. **Pick a foreground color** for the dots:
   - Use the color picker wheel, or
   - Paste a hex code (e.g., `#FF6B35`) directly into the input field.
4. **Pick a background color** the same way.
5. **Preview updates in real-time** as you change values.

**Pro tip:** Use high-contrast pairs. Black on white is scannable, but so is dark blue on light yellow. Test scans with your phone before finalizing.

## Gradients

Want something more eye-catching? Gradients add depth and visual interest.

### Enabling Gradients

1. In the Colors panel, toggle **"Use Gradient"** on.
2. Choose **Linear** or **Radial**:
   - **Linear:** Colors flow in one direction (great for diagonal or vertical themes).
   - **Radial:** Colors flow outward from the center (creates a spotlight effect).

### Gradient Controls

- **Angle slider** (Linear only): Rotate the gradient direction from 0° to 360°. Horizontal is 0°, vertical is 90°.
- **Color stops:** Add up to 5 colors at different positions:
  - Click "Add Color Stop" to insert a new color.
  - Drag the position slider to move where that color appears (0% is start, 100% is end).
  - Remove stops by clicking the delete icon.

### Example Gradients

**Warm brand theme:**
- Foreground: Linear, 45°, orange (`#FF6B35`) at 0% → red (`#D62828`) at 100%.
- Background: White (`#FFFFFF`).

**Modern tech look:**
- Foreground: Radial, blue (`#0066FF`) center → purple (`#9933FF`) edges.
- Background: Light gray (`#F5F5F5`).

## Scannability Tips

- **Keep contrast high:** Light backgrounds with dark dots, or vice versa. Avoid mid-tone combos like gray-on-gray.
- **Test before deploying:** Scan your QR code with 2-3 phones to ensure it reads reliably.
- **Logo impact:** If adding a logo, the foreground/background gradient should still be visible around it.
- **Print vs. digital:** Gradients look gorgeous on screens but may lose impact when printed. Test physical printouts if that's your use case.

## Hex Input

Don't remember the color name? Paste hex codes directly:
- Click the color input field.
- Type `#FF6B35` (with the `#` symbol).
- Press Enter to apply.

Common hex values:
- Black: `#000000`
- White: `#FFFFFF`
- Brand orange: `#FF6B35`
- Deep blue: `#0066FF`
- Forest green: `#2D5016`

Your custom colors and gradients are saved automatically. When you download or share the QR code, the styling is baked in.
