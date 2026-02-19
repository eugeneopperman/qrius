# PRD: Codebase Improvement v3

**Date:** 2026-02-19
**Status:** Quick Wins + Security & Stability Complete (items 1-5 in d3972ac, items 7/10/13 in next commit)
**Depends on:** Codebase Improvement v2 (committed 88718a0)

---

## Goals

Continue improving code quality, performance, and security. V3 focuses on dead dependency removal, bundle optimization, bug fixes, and removing legacy migration code.

---

## Quick Wins (Completed — d3972ac)

### 1. Remove 4 Dead Dependencies
**Impact:** Smaller install, cleaner dependency tree
**Risk:** None — confirmed zero imports

| Package | Why Dead |
|---------|----------|
| `@stripe/stripe-js` | Client-side Stripe SDK never imported; server uses `stripe` package |
| `@vercel/postgres` | Replaced by `@neondatabase/serverless` in `api/_lib/db.ts` |
| `@vercel/kv` | Replaced by `@upstash/redis` in `api/_lib/kv.ts` |
| `zod` | Never imported anywhere in `src/` or `api/` |

**Action:** `npm uninstall @stripe/stripe-js @vercel/postgres @vercel/kv zod`

### 2. Add Bundle Splitting
**Impact:** Better caching, smaller initial load
**Risk:** Low — only affects build output chunking

Add to `vite.config.ts` `manualChunks`:
- `@supabase/supabase-js` → `supabase` chunk
- `@tanstack/react-query` → `tanstack-query` chunk
- `@tanstack/react-router` → `tanstack-router` chunk
- `lucide-react` → `icons` chunk

Current 610KB `index` chunk should split significantly.

### 3. Fix `useDashboardStats` Scan Query Bug
**Impact:** Dashboard scan count always shows 0 (silent failure)
**Risk:** Low — fixing broken query

**Bug:** `src/hooks/queries/useDashboardStats.ts` queries `scan_events.organization_id` which doesn't exist in the schema. The `scan_events` table only has `qr_code_id`.

**Fix:** Query scans by joining through `qr_codes` table:
```sql
scan_events!inner(count) where qr_codes.organization_id = orgId
```
Or use a subquery approach with the org's QR code IDs.

### 4. Guard `console.error` in Query Hooks
**Impact:** Clean production console, better error surfacing
**Risk:** None

4 occurrences in `src/hooks/queries/`:
- `useTeamMembers.ts:20`
- `useApiKeys.ts:14`
- `useQRCodeDetail.ts:18,30`

Wrap with `if (import.meta.env.DEV)` guard.

### 5. Remove Stale BrandKit Type & Migration Code
**Impact:** Cleaner codebase, less confusion
**Risk:** Low — BrandKit was deprecated in v1, migration is a one-time operation for a beta app with few users

**Files to modify:**
- `src/types/index.ts` — delete `BrandKit` interface (lines 166-171)
- `src/stores/settingsStore.ts` — remove `BrandKit` import and `brandKits` field
- `src/stores/templateStore.ts` — remove `BrandKit` import, `migrateFromBrandKits` method
- `src/pages/HomePage.tsx` — remove migration `useEffect` and related imports

---

## Medium Effort (Future Sessions)

### 6. Consolidate QRPreview/QRRenderer
**Impact:** ~200 lines deduplication
**Effort:** Medium

Both `QRPreview.tsx` and `qr/QRRenderer.tsx` independently create `QRCodeStyling` instances with identical config. `TemplateWizardPreview.tsx` also duplicates this pattern.

**Approach:** Extract shared `useQRCodeInstance()` hook that handles:
- Logo processing with shape mask
- QR element options with gradient support
- QRCodeStyling initialization and updates
- Container mounting/cleanup

### 7. Add ErrorBoundaries to Protected Routes ✅
**Impact:** Better UX on crashes (graceful degradation vs white screen)
**Effort:** Low-medium

~~Use TanStack Router's `errorComponent` prop on dashboard, QR detail, and settings routes.~~
**Done:** Added `ErrorPage` component as `errorComponent` on root route — catches errors on all routes.

### 8. Add API Input Validation
**Impact:** Security hardening
**Effort:** Medium

API routes cast `req.body` without runtime validation. Add validation at route boundaries.

### 9. Optimize QR Store Selectors
**Impact:** Fewer unnecessary re-renders
**Effort:** Medium

`QRPreview` destructures 13 fields from qrStore — any field change triggers a re-render of the 513-line component. Use granular selectors or `useShallow`.

### 10. Add Escape Function Tests ✅
**Impact:** Security confidence
**Effort:** Low-medium

~~`escapeVCard`, `escapeWiFi`, `escapeICalendar` in utils are untested security-adjacent code. Add targeted tests.~~
**Done:** Exported escape functions from `qrStore.ts`, added 24 direct unit tests (378 total, up from 354).

---

## Larger Efforts (Backlog)

### 11. Implement API Rate Limiting
Infrastructure ready (Upstash Redis + `rate_limit_per_day` on API keys). Needs middleware in API routes.

### 12. Replace `innerHTML = ''` with Safe DOM Cleanup
7 occurrences across QRPreview, QRRenderer, TemplateWizardPreview. Replace with `while (el.firstChild) el.removeChild(el.firstChild)`.

### 13. Security: Tighten CORS + Fix Open Redirect ✅
~~Redirect handler (`/api/r/[shortCode].ts`) doesn't validate `destination_url` protocol. Could redirect to `javascript:` or `data:` URLs.~~
**Done:** Added `isValidRedirectUrl()` — only allows `http:` and `https:` protocols, returns 400 for invalid URLs.

### 14. Expand Storybook Coverage
Only `Button.stories.tsx` exists. Add stories for core UI components.

---

## Verification Checklist

After each change:
- [x] `npm run test:run` — 378 tests pass (354 → 378 after escape function tests)
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — clean
- [x] `npm run build` — succeeds

After bundle splitting:
- [x] Verify chunk sizes improved (main chunk 610KB → 329KB)
- [x] Dashboard page loads correctly
- [x] Template functionality still works

After security & stability sprint (items 7/10/13):
- [x] Open redirect rejects `javascript:`, `data:`, and malformed URLs
- [x] ErrorBoundary catches route-level errors with retry/home buttons
- [x] 24 new direct escape function tests pass
