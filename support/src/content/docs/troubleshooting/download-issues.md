---
title: Download Issues
description: Troubleshoot QR code download and export problems.
sidebar:
  order: 2
---

Can't download your QR code? Getting a blank file or an error? Let's fix it.

## Problem: Download Button Disabled or Grayed Out

**Why it's disabled:**
- Your plan doesn't include the format you're trying to download.
- Your code is still saving (wait a second).
- Your code is in **Draft** status (finish creating it first).

**Fix:**
- Check your **plan** — Free and Starter only get PNG. Upgrade to Pro for SVG and PDF.
- Wait a moment if the code is autosaving — the button will enable once it's done.
- Finalize your code in the **Customize** step before trying to download.

**In Qrius:** If you're on Free and want SVG/PDF, you'll see a "Pro" badge next to those formats. Click to upgrade.

## Problem: Blank or Corrupted Download

**Why it happens:**
- Browser cache issue.
- Incomplete file transfer.
- Browser blocked the download.

**Fix:**
- **Hard refresh** your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows).
- Try a **different browser** (Chrome, Firefox, Safari, Edge).
- Check your **Downloads folder** — the file might be there but with a weird name.
- Make sure your **internet connection is stable** — shaky WiFi can cause incomplete downloads.
- Disable browser extensions that block ads/downloads temporarily and try again.

## Problem: SVG or PDF Not Downloading (Plan Restriction)

**Why it's blocked:**
- SVG downloads require **Starter** plan or higher.
- PDF downloads require **Pro** plan or higher.
- Free plan only includes PNG.

**Fix:**
- Upgrade your plan to **Starter** ($12/month) for SVG.
- Upgrade to **Pro** ($29/month) for PNG, SVG, and PDF.
- See [Plans & Pricing](../billing/plans-pricing.md) for full details.

**PNG is free on all plans.** If you just need PNG, you're all set.

## Problem: Logo Not Appearing in Downloaded File

**Why it's missing:**
- You uploaded a **transparent PNG** with no background.
- The logo URL became invalid (old link broken).
- The logo was too large and got clipped by the code's error correction.

**Fix:**
- Use a logo with a **solid background** (white, colored, or matching your brand).
- Make sure your logo **hasn't expired** — if you linked to an external URL, confirm it's still there.
- **Reduce the logo size** in the Logo panel. Your scannability score will help — if it's low, the logo is too big.
- Re-download after making changes.

## Problem: File Size Too Large

**Why it's big:**
- High-resolution export (2x or 3x pixel density).
- Complex logo with many colors.
- PDF includes metadata.

**Fix:**
- Download as **PNG** instead of PDF (smaller file).
- For web use, PNG is perfect — you don't need a huge file.
- If you need print-quality, PDF is best (slightly larger but print-safe).
- SVG files are usually smallest and scale infinitely.

**Tip:** For web, PNG at standard resolution is fast and small. For print, PDF is your friend.

## Problem: Browser Says "File Blocked" or "Unsafe"

**Why it's happening:**
- Your browser's security settings are strict.
- Antivirus software flagged the download.

**Fix:**
- Check your browser's **download settings** — allow PDFs and images.
- Disable or whitelist Qrius in your **antivirus** temporarily.
- Try a **different browser** to rule out browser-specific settings.
- If your company has IT restrictions, contact your IT team to allowlist Qrius.

## Problem: Download Works But File Won't Open

**Why it won't open:**
- Wrong program to open the file (trying to open PNG in a text editor).
- Corrupted download (see "Blank or Corrupted Download" above).
- File got renamed weirdly during download.

**Fix:**
- **Right-click the file** → "Open with" → choose the right program.
  - PNG/JPG → Image viewer or browser.
  - PDF → PDF reader (Adobe, Preview, etc.).
  - SVG → Browser or vector editor (Illustrator, Inkscape, Figma).
- Re-download and make sure the full file transferred (check file size).
- Check your Downloads folder for a file with a long or weird name.

## Problem: Slow Download

**Why it's slow:**
- Slow internet connection.
- Qrius servers are busy (rare).
- Large file size (PDF with complex logo).

**Fix:**
- **Try again in a few moments** — temporary server hiccup.
- Check your **internet speed** — move closer to WiFi or switch networks.
- Download a smaller file format first (PNG instead of PDF).
- If consistently slow, [contact support](https://qriuscodes.com/contact).

## Mobile Download Issues

**iOS (iPhone/iPad):**
- Downloads go to the Files app, not a Downloads folder.
- To use the file elsewhere, open Files and **share** it to Photos or another app.
- PNG and PDF work fine; SVG support is limited in iOS (open in browser instead).

**Android:**
- Downloads go to your Downloads folder (check your file manager).
- Long-press the file and choose what app to open it with.
- SVG support varies by device (browser works, most image apps don't).

## Common Questions

### Can I download multiple codes at once?

Not from the dashboard yet, but **Pro** and **Business** plans get bulk creation, which lets you generate many codes at once.

### I need a specific size for printing. Can I resize before downloading?

Download as **SVG** — it scales infinitely without losing quality. Then open in any vector editor (Figma, Illustrator, Canva) and resize as needed.

### Can I use my downloaded code commercially?

Yes — all plans including Free allow commercial use. Download, print, use on products, whatever.

### The QR code image looks fuzzy. Why?

You might be zoomed in too far. QR codes are made of dots and look fuzzy up close. Zoom out to see the actual code. Or download as **SVG** for a crisp vector version.

## Still Having Issues?

- Screenshot the error and [contact support](https://qriuscodes.com/contact).
- Tell us your plan, browser, operating system, and what file format you were downloading.
- We'll help you get your code downloaded.
