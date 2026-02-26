# PRD: Production Hardening (v0.48)

## Context

Qrius is targeting public production launch next week. A comprehensive 4-agent audit of the entire codebase (frontend, API, config, testing, and production readiness) plus the Supabase Database Linter identified **55+ issues** across security, database policies, type safety, error handling, testing, SEO, and configuration. This PRD organizes every issue into prioritized sprints to bring the codebase to flawless production quality.

**Current Rating: 7.5/10 — Target: 9.5/10**

---

## Sprint 1 — Critical Security & Data Integrity

> These issues could cause data leaks, crashes, or exploits in production.

### 1.1 Fix `@vitest/coverage-v8` version mismatch
- **File**: `package.json`
- **Issue**: `vitest@3.2.4` vs `@vitest/coverage-v8@4.0.18` — major version mismatch. `npm run test:coverage` crashes with `TypeError: this.isIncluded is not a function`
- **Fix**: Pin `@vitest/coverage-v8` to `~3.2.x` to match vitest

### 1.2 Audit and update jsPDF (7 high-severity CVEs)
- **Issue**: `jspdf@4.0.0` has 7 known CVEs — PDF injection, XSS, DoS, RCE (GHSA-9vjf, GHSA-pqxr, GHSA-95fx, GHSA-67pg, GHSA-vm32, GHSA-p5xg, GHSA-cjw8)
- **Fix**: Run `npm audit`, upgrade jsPDF to latest patched version, or replace if unpatched. Run `npm audit fix` for transitive deps (ajv, minimatch, undici, @isaacs/brace-expansion)

### 1.3 Validate folder ownership in QR code list filtering
- **File**: `api/qr-codes/index.ts:345-352`
- **Issue**: Filtering by `folder_id` doesn't verify the folder belongs to the user's organization — attacker can enumerate other orgs' QR codes by guessing UUIDs
- **Fix**: JOIN folders table to validate `folder.organization_id = orgId` in the query, or add a sub-query guard

### 1.4 Fix TOCTOU race condition in invitation acceptance
- **File**: `api/organizations/invite/accept.ts:113-140`
- **Issue**: Gap between checking existing membership and inserting — parallel requests create duplicate memberships
- **Fix**: Add a UNIQUE constraint on `organization_members(organization_id, user_id)` and catch the constraint violation error instead of SELECT-then-INSERT

### 1.5 Fix email enumeration via invite endpoint
- **File**: `api/organizations/[id]/invite.ts:75-93`
- **Issue**: Queries users table by email, leaking whether an email is registered
- **Fix**: Combine into a single query that checks membership without revealing user existence. Return a generic "Invitation sent" response regardless of user status

### 1.6 Add rate limiting to invite and folder endpoints
- **Files**: `api/organizations/[id]/invite.ts`, `api/folders/index.ts`
- **Issue**: No rate limiting — can be spammed by authenticated users
- **Fix**: Add per-user rate limiting using existing `rateLimit.ts` infrastructure (10 invites/hour, 20 folders/hour)

### 1.7 Fix case-sensitive email comparison in invite acceptance
- **File**: `api/organizations/invite/accept.ts:107`
- **Issue**: `invitation.email !== user.email` is case-sensitive — RFC 5321 requires case-insensitive
- **Fix**: `.toLowerCase()` both sides

### 1.8 Add security headers to Vercel config
- **File**: `vercel.json`
- **Issue**: No CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy
- **Fix**: Add `headers` section:
  ```json
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
  ```

### 1.9 Guard `IP_SALT` — remove weak default
- **File**: `api/_lib/geo.ts:20`
- **Issue**: Falls back to `'default-salt'` — IP hashing is useless without a real salt
- **Fix**: Throw error if `IP_SALT` missing. Add generation instructions to `.env.example`

### 1.10 Guard Stripe client initialization
- **Files**: `api/webhooks/stripe.ts:9`, `api/billing/checkout.ts:12`
- **Issue**: `new Stripe(process.env.STRIPE_SECRET_KEY || '')` — fails with confusing error at call time
- **Fix**: Use lazy init pattern: `function getStripe() { if (!key) throw new Error('STRIPE_SECRET_KEY not configured'); ... }`

---

## Sprint 2 — Supabase Database Security (Linter Findings)

> These are flagged by Supabase's built-in Database Linter. All require SQL migrations run in the **Supabase SQL Editor**.

### 2.1 Enable RLS on `plan_limits` table [ERROR]
- **Table**: `public.plan_limits`
- **Issue**: RLS is not enabled. This table is exposed via PostgREST — any authenticated user (or anon key holder) can read/write all plan limits.
- **Risk**: An attacker could modify plan limits to grant themselves unlimited QR codes, scans, or API requests.
- **Fix** — create migration `api/migrations/007-supabase-security.sql`:
  ```sql
  -- Enable RLS on plan_limits
  ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

  -- plan_limits is read-only reference data — allow SELECT for authenticated users, deny everything else
  DROP POLICY IF EXISTS plan_limits_select ON plan_limits;
  CREATE POLICY plan_limits_select ON plan_limits
      FOR SELECT USING (true);

  -- No INSERT/UPDATE/DELETE policies — only service_role can modify
  ```

### 2.2 Fix `organizations_insert` policy — always-true WITH CHECK [WARN]
- **Table**: `public.organizations`
- **Policy**: `organizations_insert` uses `WITH CHECK (true)` — any authenticated user can insert any organization row with any data
- **Risk**: User can insert orgs with arbitrary `plan: 'business'` or `stripe_customer_id` values, bypassing billing
- **Fix** (in same migration):
  ```sql
  -- Tighten organizations_insert: only allow inserting with default plan
  DROP POLICY IF EXISTS organizations_insert ON organizations;
  CREATE POLICY organizations_insert ON organizations
      FOR INSERT WITH CHECK (
          -- Only authenticated users, and plan must be 'free' (upgrades happen server-side via service_role)
          auth.uid() IS NOT NULL
          AND plan = 'free'
      );
  ```

### 2.3 Set `search_path` on all 8 public functions [WARN]
- **Functions** (all in `public` schema):
  1. `get_user_org_ids`
  2. `user_has_permission`
  3. `get_org_limits`
  4. `can_create_qr_code`
  5. `update_updated_at`
  6. `handle_new_user`
  7. `update_scan_count`
  8. `get_user_organization`
- **Issue**: Functions have a mutable `search_path`. A malicious user could create a schema with same-named tables/functions that shadow the real ones, causing the function to operate on attacker-controlled data.
- **Fix** (in same migration — recreate each function with `SET search_path = ''`):
  ```sql
  -- Example pattern for each function:
  CREATE OR REPLACE FUNCTION public.get_user_organization(p_user_id UUID)
  RETURNS UUID AS $$
  DECLARE
      org_id UUID;
  BEGIN
      SELECT organization_id INTO org_id
      FROM public.organization_members
      WHERE user_id = p_user_id
      ORDER BY joined_at ASC
      LIMIT 1;
      RETURN org_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

  -- Repeat for all 8 functions, prefixing all table references with public.
  ```
- **Critical detail**: When `search_path = ''`, all table references must be fully qualified (`public.organization_members`, not just `organization_members`). The `handle_new_user` function also references `auth.users` which is fine since it's already schema-qualified.
- **Note**: `get_user_org_ids` is not in our schema files — it was created directly in Supabase. Include it in the migration or drop it if unused.

### 2.4 Enable leaked password protection [WARN]
- **Setting**: Supabase Auth > Password Security
- **Issue**: Leaked password protection is disabled. Supabase can check passwords against HaveIBeenPwned.org to prevent users from signing up with compromised passwords.
- **Fix**: In Supabase Dashboard → Authentication → Settings → Password Security → Enable "Leaked password protection"
- **No code change needed** — this is a dashboard toggle

### 2.5 Verify `get_user_org_ids` function exists and is needed
- **Issue**: Supabase linter flags `public.get_user_org_ids` but this function is NOT in any schema file in the repo
- **Fix**: Check if any RLS policy or app code calls this function. If unused, drop it:
  ```sql
  DROP FUNCTION IF EXISTS public.get_user_org_ids;
  ```
  If used, add it to the migration with proper `SET search_path = ''`.

---

## Sprint 3 — Error Handling & User Feedback

> Users must never see blank screens, silent failures, or unexplained states.

### 3.1 Add error state handling to all query hooks and pages
- **Issue**: No page displays error UI when API calls fail. `useQuery` returns `.error` but no page consumes it.
- **Files to fix** (each needs an error state UI):
  - `src/pages/QRCodeDetailPage.tsx` — show error card when fetch fails
  - `src/pages/QRCodesPage.tsx` — show error state in QR code list
  - `src/pages/DashboardPage.tsx` — show error state in dashboard stats
  - `src/pages/settings/TeamSettingsPage.tsx` — show error state for team members
  - `src/pages/settings/ApiKeysSettingsPage.tsx` — show error state for API keys
  - `src/pages/settings/BillingSettingsPage.tsx` — show error state for subscription
  - `src/pages/settings/DomainsSettingsPage.tsx` — show error state for domains
- **Pattern**: Extract a reusable `<QueryError />` component:
  ```tsx
  function QueryError({ error, retry }: { error: Error; retry?: () => void }) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Something went wrong loading this data.</p>
        {retry && <Button onClick={retry} size="sm" className="mt-3">Try Again</Button>}
      </div>
    );
  }
  ```

### 3.2 Add "Not Found" UI to QR code detail page
- **File**: `src/pages/QRCodeDetailPage.tsx:59`
- **Issue**: When `qrCode === null` after loading, page shows nothing
- **Fix**: Show a "QR code not found" card with link back to `/qr-codes`

### 3.3 Add loading skeleton to QR code detail page
- **File**: `src/pages/QRCodeDetailPage.tsx`
- **Issue**: Page flashes empty while data loads — no skeleton/spinner shown
- **Fix**: Add skeleton cards matching the detail page layout

### 3.4 Guard unguarded `console.error/warn` statements in production
- **Files with unguarded console statements** (11 locations):
  - `src/main.tsx:28` — `console.error('Root ErrorBoundary caught:' ...)`
  - `src/lib/supabase.ts:12,59` — `console.warn(...)`, `console.error(...)`
  - `src/pages/AuthCallbackPage.tsx:25,34,53` — `console.error(...)` (3 locations)
  - `src/router.tsx:156,171` — `console.error(...)` (2 locations)
  - `src/hooks/useQRDownload.ts:76,160,215` — `console.warn(...)`, `console.error(...)` (3 locations)
  - `src/utils/qrDownloadHelper.ts:24,48` — `console.warn(...)` (2 locations)
  - `src/components/ErrorBoundary.tsx:71` — `console.error(...)`
  - `src/components/qr/QRActions.tsx:79,120` — `console.error(...)` (2 locations)
- **Fix**: Wrap each in `if (import.meta.env.DEV)` guard. Some (like ErrorBoundary) may intentionally log in production — add explicit comment if so.

### 3.5 Add audit logging for all API write operations
- **Files**: `api/qr-codes/index.ts` (create), `api/qr-codes/[id].ts` (update, delete)
- **Issue**: No `logger` call on successful create/update/delete — no audit trail
- **Fix**: Add `logger.qrCodes.info('QR code created', { id, orgId })` etc. after each successful write. Also log 403 ownership failures.

---

## Sprint 4 — Type Safety & Code Quality

### 4.1 Validate `original_data` structure matches `qr_type`
- **File**: `api/qr-codes/index.ts:140-237`
- **Issue**: `qr_type` is validated as enum, but `original_data` is accepted as arbitrary JSON
- **Fix**: Add per-type schema validators (url must have `url` field, vcard must have `name`, etc.). Reject malformed data with 400.

### 4.2 Extract `extractStyleOptions()` to shared utility
- **Files**: Duplicated in `src/components/dashboard/QRCodeCard.tsx`, `QRCodeRow.tsx`, `src/pages/QRCodeDetailPage.tsx`
- **Fix**: Move to `src/utils/extractStyleOptions.ts`, import from all 3 files

### 4.3 Fix QRMiniPreview ref cleanup warning
- **File**: `src/components/ui/QRMiniPreview.tsx:144`
- **Issue**: `containerRef.current` used in cleanup function — may have changed by cleanup time
- **Fix**: Copy ref to local variable inside effect:
  ```tsx
  useEffect(() => {
    const container = containerRef.current;
    // ... use container ...
    return () => { if (container) container.innerHTML = ''; };
  }, [...]);
  ```
- Remove the `eslint-disable-next-line` at line 151

### 4.4 Add Zustand persist version numbers and migrations
- **Files**:
  - `src/stores/authStore.ts:568-577` — no version, no migrate
  - `src/stores/settingsStore.ts:114-117` — no version, no migrate
- **Fix**: Add `version: 1` and empty `migrate` function to each. `themeStore` already has this pattern as reference (v2 with migration).

### 4.5 Use `crypto.randomBytes()` for org slug generation
- **File**: `api/organizations/index.ts:88-94`
- **Issue**: `Math.random().toString(36).substring(2, 8)` — weak randomness, ~2B possible values
- **Fix**: `import crypto; crypto.randomBytes(4).toString('hex')` — 4B possible values, cryptographically random

### 4.6 Remove unused `QRActionsHandle` interface
- **File**: `src/components/qr/QRActions.tsx:254-258`
- **Issue**: Exported interface with no consumers (QRActions doesn't use forwardRef)
- **Fix**: Delete the interface

### 4.7 Add missing strict TypeScript options
- **File**: `tsconfig.app.json`
- **Add**: `"exactOptionalPropertyTypes": true`, `"noImplicitOverride": true`, `"useUnknownInCatchVariables": true`
- **Note**: `useUnknownInCatchVariables` will require updating catch blocks to type `error` as `unknown` — fix any resulting type errors

### 4.8 Rename `NEXT_PUBLIC_APP_URL` to `APP_URL`
- **Files**: `.env.example`, `api/_lib/cors.ts`, `api/organizations/[id]/invite.ts`, `api/r/[shortCode].ts`
- **Issue**: Uses Next.js naming convention in a Vite project
- **Fix**: Rename to `APP_URL` (server-only). Update all references. Update Vercel env vars.

---

## Sprint 5 — SEO, PWA & Public-Facing Polish

### 5.1 Add missing Open Graph and Twitter meta tags
- **File**: `index.html`
- **Add**:
  ```html
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:url" content="https://qrius.app" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Qrius — QR Code Generator" />
  <meta name="twitter:description" content="..." />
  <meta name="twitter:image" content="/og-image.png" />
  <link rel="canonical" href="https://qrius.app" />
  ```
- **Also**: Create a 1200x630 `og-image.png` in `public/` showing a branded QR code preview

### 5.2 Add `sitemap.xml`
- **File**: Create `public/sitemap.xml`
- **Content**: List all public routes (`/`, `/signin`, `/signup`, `/terms`, `/privacy`, `/cookies`)
- **Update** `public/robots.txt` to reference: `Sitemap: https://qrius.app/sitemap.xml`

### 5.3 Fix PWA `theme_color` mismatch
- **File**: `vite.config.ts:41`
- **Issue**: `theme_color: '#f7e4d5'` doesn't match current warm palette `#f9f6f1`
- **Fix**: Update to `'#f9f6f1'`

### 5.4 Add `loading="lazy"` to non-critical images
- **Files**:
  - `src/components/customization/LogoSection.tsx:137` — logo preview
  - `src/components/auth/UserButton.tsx:100,131` — avatar images
  - `src/components/wizard/steps/StepLogoSave.tsx:172` — logo preview
- **Fix**: Add `loading="lazy"` attribute to each `<img>`

### 5.5 Add `aria-label` to icon-only buttons missing it
- **File**: `src/components/dashboard/DashboardLayout.tsx:59` — sidebar close button
- **Fix**: Add `aria-label="Close sidebar"`
- **Check**: Scan all other icon-only buttons for missing labels

### 5.6 Add static cache headers for immutable assets
- **File**: `vercel.json`
- **Add** to headers section:
  ```json
  {
    "source": "/assets/(.*)",
    "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
    ]
  }
  ```

---

## Sprint 6 — API Hardening & Observability

### 6.1 Add `parseInt` null guards on scan analytics queries
- **File**: `api/qr-codes/[id].ts:176-178`
- **Issue**: `parseInt(todayResult[0].count as string)` crashes if column missing
- **Fix**: `parseInt(todayResult[0]?.count as string || '0') || 0`

### 6.2 Cap scan_events referrer storage
- **File**: `api/r/[shortCode].ts`
- **Issue**: Unbounded unique referrer values inflate scan_events table
- **Fix**: Truncate referrer to hostname only (already partially done) + cap at 255 chars

### 6.3 Log 403 ownership failures on QR code PATCH/DELETE
- **File**: `api/qr-codes/[id].ts:294-304`
- **Issue**: Unauthorized access attempts go unlogged
- **Fix**: Add `logger.qrCodes.warn('Unauthorized access attempt', { id, userId })` before each 403 response

### 6.4 Report partial failures in bulk update
- **File**: `api/qr-codes/index.ts:493-548`
- **Issue**: Returns `{ updated: N }` but doesn't report which IDs failed
- **Fix**: Return `{ updated: N, failed: string[] }` with IDs that didn't match ownership

### 6.5 Fix N+1 query for custom domain in QR code list
- **File**: `api/qr-codes/index.ts:444-451`
- **Issue**: After list query, makes separate Supabase query for org's custom domain
- **Fix**: Fetch custom domain in the initial parallel Promise.all block (it's already available from the org context)

---

## Sprint 7 — Testing & CI

### 7.1 Add `.gitignore` entries for test artifacts
- **File**: `.gitignore`
- **Add**:
  ```
  playwright-report/
  test-results/
  ```

### 7.2 Remove `--legacy-peer-deps` from Vercel install command
- **File**: `vercel.json:2`
- **Issue**: Masks dependency conflicts instead of resolving them
- **Fix**: Remove flag. Run `npm install` locally to verify clean install. Fix any peer dep conflicts.

### 7.3 Add annual billing price IDs to `.env.example`
- **File**: `.env.example`
- **Add**:
  ```bash
  VITE_STRIPE_PRICE_PRO_ANNUAL=price_xxx
  VITE_STRIPE_PRICE_BUSINESS_ANNUAL=price_xxx
  IP_SALT=  # Generate with: openssl rand -hex 32
  ```

### 7.4 Add key component tests (highest-value targets)
- **Issue**: 109 components, only 2 have unit tests (3.7% coverage)
- **Priority test targets** (complex logic, high user impact):
  1. `src/components/dashboard/AnalyticsCharts.tsx` — chart rendering, tab switching, empty states
  2. `src/components/dashboard/QRCodeCard.tsx` — style extraction, action callbacks, status display
  3. `src/components/wizard/steps/StepContent.tsx` — form type switching, campaign name
  4. `src/components/wizard/steps/StepDownload.tsx` — save flow, download actions
  5. `src/components/features/ScannabilityScore.tsx` — score calculation display
- **Target**: 10-15 new test files, ~100 new tests

### 7.5 Add ESLint strict TypeScript rules
- **File**: `eslint.config.js`
- **Add rules**:
  - `@typescript-eslint/no-explicit-any`: `'error'`
  - `@typescript-eslint/no-floating-promises`: `'error'`
  - `@typescript-eslint/no-unsafe-assignment`: `'warn'`
- **Note**: Start with `'warn'` for unsafe rules, escalate to `'error'` after fixing all warnings

### 7.6 Configure Dependabot for automated dependency updates
- **File**: Create `.github/dependabot.yml`
- **Content**:
  ```yaml
  version: 2
  updates:
    - package-ecosystem: "npm"
      directory: "/"
      schedule:
        interval: "weekly"
      open-pull-requests-limit: 10
  ```

---

## Sprint 8 — Documentation & Config Sync

### 8.1 Bump version to v0.48
- **File**: `src/config/constants.ts`

### 8.2 Update CLAUDE.md
- Add `lint:fix` to Commands section
- Update test count after Sprint 6
- Add security headers to Deployment section
- Update known issues

### 8.3 Update MEMORY.md with completed work

### 8.4 Move this PRD to `docs/archive/` when complete

---

## Out of Scope (tracked but deferred)

| Item | Reason |
|------|--------|
| Email notification system (Resend/SendGrid) | Requires vendor account setup, separate PRD |
| Stripe integration completion | User not activating yet |
| CSV export | Separate feature PRD |
| API route unit tests (full coverage) | ~2 day effort, E2E covers happy paths |
| Storybook `viteFinal` no-op | Cosmetic, preview.tsx import works |
| `SettingsPage` TabGroup key remount | Intentional behavior for tab reset |
| `useAutosave` interval reset frequency | Works correctly, just sub-optimal cadence |
| Normalize folder color casing | Cosmetic, hex is case-insensitive |
| Short code collision retry | DB UNIQUE constraint already prevents |
| Request ID tracing | Nice-to-have observability improvement |
| API response envelope standardization | Large refactor, current format is consistent |
| Offline graceful degradation UI | PWA caches work, UX polish only |

---

## Verification Checklist

After each sprint:
1. `npm run typecheck` — zero errors
2. `npm run build` — builds cleanly
3. `npm run test:run` — all tests pass
4. `npm run lint` — zero errors (warnings OK)
5. `npm run test:coverage` — runs without crashing (after Sprint 1)

After Sprint 2 (Supabase):
- [ ] Supabase Database Linter shows 0 errors, 0 warnings
- [ ] `plan_limits` table has RLS enabled with SELECT-only policy
- [ ] All 8 functions have `SET search_path = ''`
- [ ] Leaked password protection enabled in Supabase Auth settings

After all sprints:
- [ ] `npm audit` — no critical/high vulnerabilities
- [ ] Security headers present (check with securityheaders.com)
- [ ] OG tags render correctly (check with opengraph.xyz)
- [ ] PWA installs cleanly on mobile
- [ ] All pages handle: loading, error, empty, and data states
- [ ] All API endpoints: validate input, log writes, rate limit where needed
- [ ] `.env.example` matches all env vars used in code
- [ ] Commit + push with version bump

---

## Issue Count Summary

| Severity | Count | Sprint |
|----------|-------|--------|
| Critical (security/crash) | 10 | Sprint 1 |
| Critical (database security) | 5 | Sprint 2 |
| High (error handling/UX) | 5 | Sprint 3 |
| Medium (type safety/quality) | 8 | Sprint 4 |
| Medium (SEO/polish) | 6 | Sprint 5 |
| Medium (API hardening) | 5 | Sprint 6 |
| Low (testing/CI/docs) | 6 | Sprint 7 |
| Config (docs/version) | 4 | Sprint 8 |
| **Total** | **49** | **8 sprints** |
