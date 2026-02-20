# PRD: Feature Gap Audit — Promised vs Delivered

## Context

The billing page (v0.15) advertises 29 features across Free/Pro/Business tiers. After a comprehensive audit, **15 gaps** were found between what's promised and what's actually implemented. Most critically, the QR code creation wizard doesn't save to the database (all codes are static/client-side), there's no way to edit a QR code's destination URL (so "dynamic" codes aren't truly dynamic), and the team invitation flow has no acceptance endpoint.

This PRD catalogs every gap, prioritizes them, and organizes implementation into 5 sprints.

**Already delivered (v0.16):** Plan limits enforcement, feature gating (usePlanGate, ProBadge), download format gating, template limits, Coming Soon badges, scan counting, team member limit checks.

---

## Sprint 1: Core Dynamic QR (CRITICAL)
- 1.1 Wire wizard to save QR codes to database
- 1.2 Add PATCH + DELETE endpoints on api/qr-codes/[id].ts
- 1.3 Edit destination UI on QRCodeDetailPage
- 1.4 Fix CachedRedirect type mismatch

## Sprint 2: Team Invitation Flow (CRITICAL)
- 2.1 Create invitation acceptance API
- 2.2 Create invitation acceptance page
- 2.3 Update invitation email link

## Sprint 3: History & Usage Display (HIGH)
- 3.1 Apply scan_history_days filter
- 3.2 Scan usage display on dashboard
- 3.3 QR code delete via API

## Sprint 4: QR Deactivation & Static/Dynamic UX (HIGH)
- 4.1 Deactivation check in redirect handler
- 4.2 Deactivation toggle UI
- 4.3 Static vs Dynamic indicator

## Sprint 5: Polish & Deferred Items (MEDIUM/LOW)
- 5.1 Annual billing price IDs
- 5.2 Support email link
