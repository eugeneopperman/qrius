---
title: QR Code Not Scanning?
description: Common reasons QR codes fail to scan and how to fix them.
sidebar:
  order: 1
---

Your QR code looks good but won't scan? Here are the most common culprits and how to fix them.

## Use the Scannability Score

Before troubleshooting, **check your code's Scannability Score**. In the Qrius editor, you'll see a score from 0–100. It analyzes contrast, size, logo coverage, and other factors that affect scanability.

**Aim for a score above 75.** If you're below that, the color or logo customizations are probably the issue.

## Problem: Low Contrast Colors

**Why it fails:** Black code on dark gray background? Your phone's camera can't tell the code from the background.

**Fix:**
- Use **high contrast** — dark code on light background, or light code on dark background.
- Stick with **pure black on white** as your fallback if custom colors don't work.
- Avoid using a light color for the dots. Even if it looks cool, scanners hate it.
- Test on your phone's camera before printing or deploying.

**In Qrius:** See your scannability score drop? That's usually low contrast. Adjust the **Colors** panel and watch the score climb.

## Problem: Logo Covers Too Much

**Why it fails:** A large logo blocks the data-bearing part of the code.

**Fix:**
- Keep your logo **small** — under 30% of the total code size.
- Make sure your logo has a **light or dark background** inside the code (not transparent).
- Logos work best in the **center** of the code.
- Test the code with your logo applied before going live.

**In Qrius:** The scannability score drops when your logo's too big. Reduce the logo size in the **Logo** panel.

## Problem: Code Too Small

**Why it fails:** A code that's 1cm × 1cm is hard for cameras to lock onto, especially from a distance.

**Fix:**
- Print or display your code **at least 2cm × 2cm** (roughly 1 inch).
- Larger is better — 5cm × 5cm is ideal for posters and flyers.
- If scanning from a distance (billboard), make it even bigger.

**Tip:** Your code's size depends on context. A phone screen can show smaller codes. Print media needs bigger codes.

## Problem: Error Correction Level Too Low

**Why it fails:** QR codes have built-in error correction. If it's set too low, any damage or obstruction breaks the scan.

**Fix:**
- In Qrius, go to **Customize** and check the **Error Correction** setting.
- Choose **H (High)** if possible — it can handle up to 30% damage.
- **M (Medium)** or **Q (Quartile)** work for most cases.
- **L (Low)** is risky — only use it if scannability isn't an issue.

**In Qrius:** The scannability score reflects error correction. Higher correction = smaller code size but more resilience.

## Problem: Print Quality

**Why it fails:** Bad print quality, faded ink, or creased paper kills scans.

**Fix:**
- Print on a **good printer** — inkjet and laser both work.
- Use **quality paper** — avoid flimsy, cheap stock.
- Don't print too small — see "Code Too Small" above.
- Avoid folding or creasing the code.
- If possible, laminate printed codes to protect them from damage.

**Test:** Print a test code and scan it before committing to a large print run.

## Problem: Dirty or Damaged Surface

**Why it fails:** A scratched, faded, or dirty code is unreadable.

**Fix:**
- Keep your code **clean** — wipe off dust or smudges.
- If laminating, use clear laminate so the code stays visible.
- Avoid exposing codes to sunlight for long periods (fading).
- In harsh environments (outdoor signage), check codes periodically for damage.

## Problem: Camera Focus Issues (Mobile Phone)

**Why it fails:** Your phone's camera can't focus on the code.

**Fix:**
- Make sure your **phone's camera is clean** — dust blocks focus.
- Move the phone **2–5 cm away** from the code (not too close).
- Keep the code **parallel to your phone screen** (flat against the surface).
- Use good lighting — avoid glare or shadows on the code.
- Try the native camera app first, not a third-party QR reader (they can be finicky).

**Test:** Open your phone's camera and point it at the code. You should see a yellow border appear when the code is in focus. Tap the code to lock focus if needed.

## Problem: Wrong Destination Set

**Why it fails:** The code scans but goes to the wrong URL.

**Fix:**
- In Qrius, open your QR code and check the **Destination URL**.
- Make sure it's correct — including `https://` if needed.
- Test the URL in your browser first to confirm it works.
- If you edited the code recently, make sure your changes saved (look for the save indicator).

## Problem: Code Expired or Deactivated

**Why it fails:** The code was deleted or paused.

**Fix:**
- In your Qrius dashboard, check if the code is **Active** or **Paused**.
- If it's paused, click it and toggle **Active** back on.
- If you deleted it accidentally, it's gone — create a new one.

## Still Not Scanning?

- **Take a screenshot** of your code and test it on your computer (zoom in, use your phone's camera).
- **Try a different phone** — different cameras and OS versions scan differently.
- **Check the scannability score** in Qrius — if it's below 75, colors or logo are the issue.

Still stuck? [Contact support](https://qriuscodes.com/contact) and send us a screenshot. We'll help debug.
