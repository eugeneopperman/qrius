# PRD: Plan Limits Enforcement & Feature Gating

## Context

The billing page (v0.15) displays correct pricing tiers ($0/$9/$29) and feature lists, but an audit revealed that only 2 of 11 advertised limits are actually enforced. The `DEFAULT_FREE_PLAN_LIMITS` frontend fallback is also wrong (10/1000 instead of 15/5000). This PRD implements enforcement for all plan limits and adds lightweight feature gating with upgrade prompts.

**Guiding principles:**
- Unauthenticated users on the public QR generator (`/`) are **never** gated
- Soft gate on frontend (ProBadge, disabled buttons), hard enforcement on API
- White-label, CSV export, advanced analytics -> "Coming Soon" badges only (future work)

---

## Sprint 1: Quick Fixes

### 1.1 Fix `DEFAULT_FREE_PLAN_LIMITS`
**File:** `src/stores/authStore.ts`
- `qr_codes_limit: 10` -> `15`
- `scans_per_month: 1000` -> `5000`

### 1.2 Fix DashboardPage upgrade prompt
**File:** `src/pages/DashboardPage.tsx`
- Remove custom `description` prop -- let `UpgradePrompt` use its own default (already updated to "$9/mo" in v0.15)

---

## Sprint 2: API-Side Enforcement

### 2.1 Team member limit on invite
**File:** `api/organizations/[id]/invite.ts`
- After `requireRole`, before existing-member check:
  1. Query org plan from `organizations` table
  2. Query `plan_limits.team_members` for that plan
  3. Count current members + pending invites for the org
  4. If `limit !== -1 && total >= limit` -> return 403

### 2.2 Add `team_members` to `checkPlanLimit()`
**File:** `api/_lib/auth.ts`
- Add new case `'team_members'` to the switch in `checkPlanLimit()`
- Update type: `limitType: 'qr_codes' | 'scans' | 'api_requests' | 'team_members'`

### 2.3 Scan counting in redirect handler
**File:** `api/r/[shortCode].ts`
- Extend `CachedRedirect` interface to include `organizationId`
- Extend DB SELECT to include `organization_id`
- Include `organizationId` when caching
- In `logScanEvent()`, after INSERT to `scan_events`, UPSERT to `usage_records`
- **Critical:** Never block redirects based on scan limits

### 2.4 Frontend team limit warning
**File:** `src/pages/settings/TeamSettingsPage.tsx`
- Add `planLimits` to the `useAuthStore` selector
- Show `UsageLimitWarning` when member count approaches limit
- Disable "Invite member" button when at limit

---

## Sprint 3: Frontend Feature Gating

### 3.1 Create `usePlanGate` hook
**New file:** `src/hooks/usePlanGate.ts`
- Reads `user`, `planLimits`, `currentOrganization` from `useAuthStore` via `useShallow`
- Exports `canUse(feature)` -- returns `true` if unauthenticated
- Features: `'svg_download' | 'pdf_download' | 'unlimited_templates'`

### 3.2 Create `ProBadge` component
**New file:** `src/components/ui/ProBadge.tsx`
- `ProBadge` -- small orange pill with Sparkles icon, links to `/settings?tab=billing`
- `ComingSoonBadge` -- gray pill, "Coming soon" text

### 3.3 Gate download formats in `QRPreview.tsx`
- Gate SVG and PDF buttons with ProBadge for free authenticated users
- PNG and JPEG remain ungated

### 3.4 Gate download formats in `QRActions.tsx`
- Same pattern as 3.3

### 3.5 Brand template limit
- `templateStore.ts` -- limit to 3 for free authenticated users
- `TemplateList.tsx` -- show count badge, disable at cap
- `TemplatePickerSection.tsx` -- disable create at cap

---

## Sprint 4: "Coming Soon" Badges

### 4.1 Billing page feature annotations
**File:** `src/pages/settings/BillingSettingsPage.tsx`
- Annotate "White-label branding", "CSV analytics export", "Advanced analytics" with ComingSoonBadge

---

## Files Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/usePlanGate.ts` | Centralized plan gating hook |
| `src/components/ui/ProBadge.tsx` | ProBadge + ComingSoonBadge components |

### Modified Files (12)
| File | Sprint | Change |
|------|--------|--------|
| `src/stores/authStore.ts` | 1.1 | Fix fallback constants |
| `src/pages/DashboardPage.tsx` | 1.2 | Remove custom upgrade description |
| `api/organizations/[id]/invite.ts` | 2.1 | Add team member limit check |
| `api/_lib/auth.ts` | 2.2 | Add team_members to checkPlanLimit |
| `api/r/[shortCode].ts` | 2.3 | Add scan counting + org_id in cache |
| `src/pages/settings/TeamSettingsPage.tsx` | 2.4 | Team limit warning + disable invite |
| `src/components/QRPreview.tsx` | 3.3 | Gate SVG/PDF with ProBadge |
| `src/components/qr/QRActions.tsx` | 3.4 | Gate SVG/PDF with ProBadge |
| `src/stores/templateStore.ts` | 3.5 | Template count limit |
| `src/components/templates/TemplateList.tsx` | 3.5 | Limit UI + disable at cap |
| `src/components/customization/TemplatePickerSection.tsx` | 3.5 | Disable create at cap |
| `src/pages/settings/BillingSettingsPage.tsx` | 4.1 | ComingSoonBadge on 3 features |
