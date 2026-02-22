# Post-Mortem: Scan Tracking & Analytics Fix (v0.26–v0.27)

## Date
2026-02-21

## Summary
Two production bugs: (1) scanning QR codes didn't record scan events, (2) analytics detail page showed "QR code not found" instead of analytics data. Additionally, QR code creation took 60+ seconds to save.

---

## Root Causes

### Issue 1: Scans not recording
| Cause | Detail | Fix |
|-------|--------|-----|
| **Wrong `waitUntil` API** | Used `context.waitUntil()` as a handler argument — Vercel Edge doesn't pass context that way. The correct API is `import { waitUntil } from '@vercel/functions'`. | v0.27: Installed `@vercel/functions`, imported `waitUntil` as standalone function |
| **Missing Neon columns** | Migration 002 (adds `referrer`, `region`, `latitude`, `longitude` to `scan_events`) wasn't applied to Neon | v0.26: User ran migration manually in Neon SQL editor |
| **Double-count risk** | Both a DB trigger and explicit `UPDATE total_scans` on every scan | v0.27: Removed explicit UPDATE; trigger handles it |

### Issue 2: Analytics page 404 / 500
| Cause | Detail | Fix |
|-------|--------|-----|
| **No fault tolerance** | 11 analytics queries in `Promise.all` — if any fails (e.g., missing column), entire endpoint returns 500 | v0.26: Wrapped in try/catch with zero/empty fallback data |
| **Wrong DB for usage_records** | `checkPlanLimit` cases `'scans'` and `'api_requests'` queried Supabase, but `usage_records` lives in Neon | v0.26: Switched to Neon `sql` queries |

### Issue 3: Slow QR save (60+ seconds)
| Cause | Detail | Fix |
|-------|--------|-----|
| **Sequential queries** | `checkPlanLimit` made 3 blocking sequential DB calls (org plan → plan limits → usage count) | v0.27: Parallelized plan_limits + usage query via `Promise.all` |
| **Blocking Redis cache** | `await setCachedRedirect()` blocked the response | v0.27: Changed to fire-and-forget `void setCachedRedirect()` |

---

## Changes by Version

### v0.26
- `api/qr-codes/[id].ts`: Wrap analytics `Promise.all` in try/catch
- `api/_lib/auth.ts`: Fix `checkPlanLimit` scans/api_requests to query Neon
- `api/r/[shortCode].ts`: Initial `waitUntil` attempt (handler context arg — didn't work)

### v0.27
- `api/r/[shortCode].ts`: Import `waitUntil` from `@vercel/functions` (correct API), remove duplicate `total_scans` UPDATE
- `api/_lib/auth.ts`: Parallelize `checkPlanLimit` (plan_limits + usage concurrent)
- `api/qr-codes/index.ts`: Fire-and-forget Redis cache on QR create
- Added `@vercel/functions` dependency

---

## Lessons Learned
1. **Vercel Edge `waitUntil`**: Must use `import { waitUntil } from '@vercel/functions'` — it's a standalone import, not a handler context argument. Fire-and-forget `.catch()` patterns silently fail because the Edge worker terminates before completion.
2. **Dual database awareness**: Any table that lives in Neon must be queried via the `sql` client, not `getSupabaseAdmin()`. Easy to miss when adding new query paths.
3. **Fault tolerance on aggregation endpoints**: Multiple queries in `Promise.all` should be wrapped in try/catch so partial failures don't block the entire response.

## Status
- **Deployed**: v0.27 live at `design-sandbox-theta.vercel.app`
- **Tests**: 450 unit tests passing, typecheck clean
- **Verification needed**: Create QR → scan → confirm analytics page shows scan data
