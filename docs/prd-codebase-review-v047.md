# PRD: Codebase Quality Review & Hardening (v0.47)

## Context

After 46 versions of rapid feature development, the Qrius codebase needs a quality pass to fix accumulated inconsistencies, harden security patterns, and improve type safety. A comprehensive audit identified ~25 actionable items across frontend, API, and configuration. This PRD prioritizes them into sprints to bring overall code quality to a solid 9.5/10.

---

## Sprint 1 — Critical Fixes (bugs & security)

### 1.1 Fix AccordionItem `grid-rows-[0fr]` broken in Tailwind v4
- **File**: `src/pages/settings/BillingSettingsPage.tsx:648`
- Same bug we fixed in PlanPicker — replace with conditional render + `animate-fade-in`

### 1.2 Guard all `createClient()` calls against empty env vars
- **Pattern** (safe, from `api/_lib/auth.ts:12-19`): `const client = url && key ? createClient(...) : null` + `getSupabaseAdmin()` helper that throws at call time
- **Files fixed** (8 files with unsafe `createClient(url || '', key || '')`):
  - `api/organizations/index.ts`
  - `api/organizations/[id]/invite.ts`
  - `api/organizations/invite/accept.ts`
  - `api/api-keys/index.ts`
  - `api/api-keys/[id].ts`
  - `api/billing/checkout.ts`
  - `api/webhooks/stripe.ts`
  - `api/_lib/notifications.ts`
- **Fix**: Replaced each with import of `getSupabaseAdmin` from `api/_lib/auth.ts`. Removed local `createClient` + `@supabase/supabase-js` import.

### 1.3 Guard Stripe webhook secret
- **File**: `api/webhooks/stripe.ts`
- Added early return: `if (!endpointSecret) return res.status(500).json({ error: 'Webhook not configured' })`

### 1.4 Guard Stripe price-to-plan mapping
- **File**: `api/webhooks/stripe.ts`
- Added `delete priceToPlan['']` after construction, so unconfigured env vars don't silently map to a plan

---

## Sprint 2 — Type Safety & Code Cleanup

### 2.1 Add `folder_id` to `APIDetailResponse` interface
- **File**: `src/hooks/queries/useQRCodeDetail.ts`
- Added `folder_id: string | null;` to the interface
- Simplified from `(data as unknown as Record<string, unknown>).folder_id as string | null ?? null` to `data.folder_id ?? null`

### 2.2 Remove stale `/history` route from CLAUDE.md
- **File**: `CLAUDE.md` — removed `/history` from the Routes section (no page or route exists for it)

### 2.3 Move `AUTH_TIMEOUT_MS` to constants
- **From**: `src/router.tsx` (hardcoded `const AUTH_TIMEOUT_MS = 10000`)
- **To**: `src/config/constants.ts` as `TIMING.AUTH_TIMEOUT_MS`

### 2.4 Add `lint:fix` script to package.json
- Added `"lint:fix": "eslint . --fix"` to scripts

---

## Sprint 3 — API Hardening

### 3.1 Add timeout on Vercel API fetch calls
- **File**: `api/domains/index.ts` — all 3 `fetch()` calls to Vercel API
- Added `signal: AbortSignal.timeout(10000)` to each fetch options

### 3.2 Sanitize Vercel API error responses before logging
- **File**: `api/domains/index.ts`
- Changed to log only `status` + `statusText` instead of full response body (may contain tokens)

### 3.3 Add logging for invitation creation
- **File**: `api/organizations/[id]/invite.ts`
- After successful insert, added `logger.organizations.info('Invitation sent', { orgId, email, role })`

---

## Sprint 4 — Documentation & Config Sync

### 4.1 Bump version to v0.47
### 4.2 Save PRD to `docs/`
### 4.3 Update MEMORY.md with completed work entry

---

## Out of Scope (tracked but deferred)

| Item | Reason to Defer |
|------|----------------|
| API route unit tests | Large effort (~2 days), E2E covers happy paths |
| TanStack Query hook tests | Hooks are thin wrappers — low bug surface |
| Component test expansion | E2E covers UI interactions |
| Normalize folder color casing | Cosmetic, hex colors are case-insensitive |
| Short code race condition | DB UNIQUE constraint prevents duplicates |
| Request ID tracing | Nice-to-have, not a quality issue |
| Cache TTL env vars | Current hardcoded values are sensible defaults |
