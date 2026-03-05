---
title: Scan Tracking
description: How Qrius Codes tracks QR code scans in real time.
sidebar:
  order: 1
---

Every time someone scans a dynamic QR code you create with Qrius, we capture that moment. Here's what happens behind the scenes — and what it means for your data.

## How Tracking Works

When you create a **dynamic QR code** in Qrius, it encodes a short redirect URL instead of a direct link. Something like `qrslnk.com/abc123`.

When someone scans it:
1. Their phone opens the short URL
2. Our server logs the scan (timestamp, location, device, browser, referrer)
3. They're instantly redirected to your destination URL

This redirect happens in milliseconds — users never notice it. But you get real-time visibility into who scanned your code and where.

**Static QR codes** (just plain QR images) can't be tracked because they encode the destination directly. No server redirect = no scan data. If you need analytics, always use dynamic codes.

## What We Collect

For each scan, we capture:

- **Timestamp** — exactly when the scan happened (down to the second)
- **Country & region** — based on IP geolocation
- **Device type** — mobile, tablet, desktop
- **Browser & OS** — Chrome on iOS, Safari on Android, etc.
- **Referrer** — where the user came from (if available)

That's it. We don't track personal information, email addresses, or browsing behavior beyond the scan itself.

## Privacy & Security

We hash all IP addresses before storing them, so your scan data is privacy-respecting. Even we can't reconstruct the original IPs from our logs.

GDPR and privacy laws? We're covered. You can confidently share QR code analytics with your team.

## Plan-Specific History

Scan data is **unlimited on all plans** — you get as many scans as your users generate.

But how long we keep the data depends on your plan:

| Plan | History Duration |
| --- | --- |
| Free | 7 days |
| Starter | 90 days |
| Pro | 1 year |
| Business | Unlimited |

After the retention period, older scans are deleted automatically. If you need longer history, upgrading your plan will instantly unlock deeper archives.

## Real-Time vs Batch

Analytics update in near real-time — usually within 30 seconds of a scan. You can refresh the analytics dashboard and see the latest data right away.

We aggregate scans into hourly and daily buckets for the charts. This keeps performance snappy even if you have thousands of scans.

---

**Next steps:** Ready to dive into the analytics dashboard? Check out [Analytics Dashboard](/docs/analytics/analytics-dashboard) to learn how to read and interpret your scan data.
