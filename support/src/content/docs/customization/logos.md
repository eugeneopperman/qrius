---
title: Logo Overlay
description: Add your brand logo to the center of your QR code.
sidebar:
  order: 3
---

Adding your logo to a QR code makes it instantly recognizable and reinforces brand identity. Qrius lets you overlay logos with full control over size, shape, and placement.

## Uploading Your Logo

1. Open the **Customize panel** (right-side tabs).
2. Click the **Logo tab** (the image/brand icon).
3. Click **"Upload Logo"** and select an image file from your computer.

### Supported Formats

- **PNG** (recommended) - Transparent backgrounds, crisp edges.
- **SVG** - Vector format, scales perfectly at any size.
- **JPG** - Works, but logos with transparent areas will show a white background.
- **WebP** - Modern format, good file size.

**File size:** Keep logos under 500 KB for faster upload and rendering.

**Best practice:** Use PNG with a transparent background for maximum flexibility over your QR code colors.

## Logo Shape

Choose how the logo appears:

- **Square** - Logo sits in a square frame. Great for text-heavy logos or badges.
- **Circle** - Logo crops to a circle. Perfect for brand marks and avatars.

Select your shape and watch the preview update. The shape affects how much of your logo shows—circular crops from the center, while square keeps the full rectangular image.

## Size Control

The **Size slider** (0–100%) controls how much of the QR code area your logo occupies:

- **20–40%** - Subtle branding. Logo is small; QR code scans reliably.
- **40–60%** - Balanced. Logo is prominent but still scannable.
- **60%+** - Bold. Logo dominates; may reduce scan reliability on older devices.

**Scanability rule:** Logos take up space that would otherwise be QR data. Qrius uses error correction (Reed-Solomon) to maintain scannability, but keep your logo under 50% for best results.

## Logo Margin

The **Margin slider** (0–100%) creates padding around your logo:

- **0%** - Logo touches the QR code dots directly.
- **50%** - Comfortable padding; logo visually separated.
- **100%** - Maximum padding; logo floats in a large white/colored box.

Higher margins improve visual clarity and scannability, especially if your logo has fine details.

## Error Correction & Scannability

QR codes have built-in error correction (7%, 15%, 25%, or 30% of data can be corrupted and still scan). When you add a logo:

1. **Qrius automatically calculates** if your logo size + margin combo is scannable.
2. **Smaller logos = higher reliability.** 30% size + 20% margin is very safe.
3. **Test before deploying.** Always scan your QR code with a phone after adding a logo.

If your logo is too large, the "Scannability Score" indicator in Qrius shows a warning—reduce logo size or increase error correction.

## Logo Tips

**Make it stand out:**
- Use high-contrast logos (dark on light, or light on dark).
- Test logo on both your chosen QR code colors and the opposite (e.g., orange on white and white on orange).

**Avoid clutter:**
- Simple, bold logos work better than intricate designs.
- Avoid logos with thin lines or small text—they blur at small sizes.

**Positioning:**
- Logos always center on the QR code.
- The three corner markers (position squares) are preserved beneath the logo.

**Print vs. digital:**
- High-resolution logos (300 DPI) look crisp when printed.
- Screen logos (72 DPI) are fine for digital sharing.

## Removing a Logo

Click **"Remove Logo"** in the Logo tab to delete it. Your QR code reverts to pure data squares.

## Saving Logo Settings

When you save your QR code or apply a brand template, all logo settings travel with it:
- Logo image URL
- Shape (square/circle)
- Size
- Margin

Export your template to reuse the same logo across multiple QR codes in seconds.
