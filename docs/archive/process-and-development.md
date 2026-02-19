# Development Process & Progress

> Session-by-session development journal for Qrius. For project structure, routes, schema, env vars, and subscription tiers, see [CLAUDE.md](./CLAUDE.md).

---

## Sprint 1: Core Foundation — January 30, 2026

Shipped a fully functional client-side QR code generator with advanced customization.

### Phase 1: Core Foundation
- Vite + React + TypeScript + Tailwind CSS 4 setup
- All 9 QR code types with live preview
- PNG/SVG export, basic color customization, dark mode

### Phase 2: Export & UI Polish
- Multiple export formats (PNG, SVG, JPG, PDF) with size selection
- Copy to clipboard, responsive design

### Phase 3: Advanced Customization
- Logo upload with drag-and-drop
- 6 dot patterns, 3 corner square styles, 3 corner dot styles
- Frame templates with customizable labels
- Error correction level selection (L, M, Q, H)
- Collapsible accordion UI

### Phase 4: Competitive Differentiators
- URL shortening via TinyURL and is.gd APIs
- Real-time scannability scoring (contrast ratio, color blindness)
- Built-in QR code reader (camera + file upload)
- Brand kit management (save, apply, export/import presets)
- Keyboard shortcuts for power users

### Phase 5: Polish & Production Ready
- PWA support with service worker and web app manifest
- Print-ready templates (8 sizes from business card to A4 poster)
- Code splitting with lazy-loaded components and manual chunks

### Technical Learnings

**TypeScript strictness:** Unused imports/variables cause build failures. Type arrays explicitly when inference fails (e.g., `FrameStyle[]`). Use `_prefix` for intentionally unused parameters.

**Code splitting pattern:**
```typescript
const QRReader = lazy(() =>
  import('./components/features/QRReader')
    .then(m => ({ default: m.QRReader }))
);
```

**Mobile CSS:** Always add fallback `background-color` in CSS — don't rely solely on Tailwind classes for critical styles like backgrounds.

**forwardRef for child actions:** Use `useImperativeHandle` to expose `download()` and `copy()` methods from `QRPreview` component.

---

## Sprint 2: SaaS Transformation — February 1, 2026

Transformed Qrius from a client-side tool into a full multi-tenant SaaS platform.

### Phase 1: Authentication Foundation
- Supabase Auth: email/password + OAuth (Google, GitHub) with PKCE flow
- Session management with auto-refresh
- Auth components: SignInForm, SignUpForm, ForgotPasswordForm, AuthModal, AuthGuard, UserButton
- Auth store (`authStore.ts`) with Zustand for state management

### Phase 2: Dashboard & Data Ownership
- TanStack Router with type-safe routing and lazy-loaded routes
- Route guards: `requireAuth`, `requireGuest`
- Dashboard components: DashboardLayout, QuickStats, QRCodeCard, QRCodeList, UpgradePrompt

### Phase 3: Teams & Organizations
- Personal workspace created on signup, additional orgs for teams
- Organization switcher in sidebar
- Role-based access: Owner, Admin, Editor, Viewer
- Member invitations via email

### Phase 4: Billing & Subscriptions (Structure)
- Stripe integration: checkout sessions, customer portal, webhook handlers
- Three-tier model (Free / Pro / Business) — see CLAUDE.md for limits

### Phase 5: API Keys
- Dual auth: JWT for browser, API keys (`X-Api-Key` header) for programmatic access
- SHA-256 hashed key storage with prefix system
- Full CRUD endpoints for orgs, API keys, billing, and webhooks

### Technical Learnings

**Database trigger for user creation:** `handle_new_user()` trigger auto-creates user profile, personal org, and membership on signup. App-level fallback in `fetchProfile()` mirrors this logic.

**TanStack Router route guards:** Use `useAuthStore.getState()` in `beforeLoad` to check auth state synchronously, then `throw redirect()` for unauthenticated users.

**API auth middleware:** Try API key first (`x-api-key` header), fall back to JWT (`Authorization: Bearer`).

---

## Sprint 3: Testing, i18n & Templates

### Testing Infrastructure
- 166 unit tests passing (Vitest) with jsdom environment
- Playwright E2E tests for critical user flows
- Storybook component documentation

### Internationalization
- 4 languages: English, Spanish, French, German
- Translation files in `src/i18n/`, language switcher in header
- Persisted preference in localStorage

### Template Wizard
- 6 use-case templates: business card, marketing, product packaging, event check-in, WiFi sharing, restaurant menu
- Step-by-step wizard with pre-configured styles per template

---

## Sprint 4: Database & Auth Wiring + Deployment — February 16-18, 2026

Connected the Supabase backend, made auth resilient, deployed to Vercel production, and fixed critical auth/routing bugs.

### Auth & Database Connection

**Problem:** Sign up/in returned "Error: Failed to Fetch" — Supabase was configured but the database schema hadn't been applied, and the project may have been paused.

**Changes:**
1. **RLS Insert Policies** — Added `users_insert_own` and updated `org_members_insert` for self-provisioning. Made all policies idempotent with `DROP POLICY IF EXISTS`.
2. **Supabase Health Check** — `checkSupabaseConnection()` detects paused projects and network issues with structured `{ ok, message }` responses.
3. **App-Level User Provisioning** — `fetchProfile()` auto-provisions user/org/membership if DB trigger hasn't run (fallback for PGRST116).
4. **Beta Version Badge** — `APP_VERSION` in `src/config/constants.ts`, displayed bottom-right on all pages.

### Vercel Deployment
- Production URL: `https://design-sandbox-theta.vercel.app`
- Supabase dashboard: Site URL and redirect URLs configured
- Schema applied: `api/schema.sql` then `api/schema-saas.sql`

### Post-Deploy Fixes

| Commit | Fix |
|--------|-----|
| `5766401` | Sign-in flow: navigate to dashboard after successful login |
| `f3f3b12` | API route TypeScript errors: add `.js` extensions and type fixes |
| `7d54cea` | Onboarding wizard: org creation blocked by RLS SELECT policy |
| `f0e6ac2` | Reset password route: replace broken inline import with lazy component |

### Technical Learnings

**Vercel env var gotcha:** `echo` pipes add a trailing `\n` to env values. Use `printf '%s'` instead:
```bash
# Wrong — trailing newline breaks URLs
echo "https://foo.supabase.co" | npx vercel env add VITE_SUPABASE_URL production

# Correct
printf '%s' 'https://foo.supabase.co' | npx vercel env add VITE_SUPABASE_URL production
```

**Build cache:** `npx vercel --prod` may use cached builds even after env var changes. Use `--force` to skip cache. Verify bundle hash changed in output.

**PostgreSQL RLS:** `CREATE POLICY` has no `IF NOT EXISTS` — must `DROP POLICY IF EXISTS` first. Self-referential RLS policies work for SELECT but need special handling for INSERT (new row doesn't exist yet to check against).

---

## Current Status

**Version:** Beta v0.02

**All checks passing:**
- TypeScript compilation
- 166 unit tests (Vitest)
- ESLint (0 errors, 0 warnings)
- Production build

**Working:**
- User sign-up/sign-in (email + OAuth)
- Post-login redirect to dashboard
- Onboarding wizard (org auto-creation)
- Password reset flow
- Dashboard with QR code listing
- Settings pages (profile, team, billing, API keys)
- API serverless functions (TypeScript errors fixed)
- Production deployment on Vercel

## Next Steps

1. **End-to-end verification** — Full auth flow testing on production
2. **Stripe setup** — Create products, set price IDs, configure webhook endpoint
3. **Team invitations** — Implement email sending for invites
4. **Scan analytics** — Real scan tracking integration
5. **API documentation** — OpenAPI spec for programmatic endpoints
6. **API rate limiting** — Application-level throttling
7. **PWA icons** — Replace placeholder solid-color icons with branded assets

## Testing Notes
- Dev server with network access: `npm run dev -- --host 0.0.0.0`
- Production preview: `npm run preview -- --host 0.0.0.0`
- Network URL: `http://<IP>:5173/` (dev) or `http://<IP>:4173/` (preview)
