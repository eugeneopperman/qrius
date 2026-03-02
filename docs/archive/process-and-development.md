# Development Process & Progress

> Session-by-session development journal for Qrius. For project structure, routes, schema, env vars, and subscription tiers, see [CLAUDE.md](../../CLAUDE.md).

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

### Technical Learnings

**Vercel env var gotcha:** `echo` pipes add a trailing `\n` to env values. Use `printf '%s'` instead.

**Build cache:** `npx vercel --prod` may use cached builds even after env var changes. Use `--force` to skip cache.

**PostgreSQL RLS:** `CREATE POLICY` has no `IF NOT EXISTS` — must `DROP POLICY IF EXISTS` first.

---

## Sprints 5–14: Feature Development & Polish — February 18 – March 1, 2026

Rapid iteration across 60+ versions building out the full product.

### Key Milestones

| Version | Date | Summary |
|---------|------|---------|
| v0.13–v0.16 | Feb 19–20 | E2E tests, plan limits enforcement, pricing redesign |
| v0.17–v0.20 | Feb 20 | Feature gap audit: wizard DB save, PATCH/DELETE QR, invite flow, usage stats, QR download fixes |
| v0.21–v0.27 | Feb 20–21 | Scan tracking fixes, campaign names, styled thumbnails, analytics dashboard (4 tabs) |
| v0.29–v0.31 | Feb 23 | QR codes encode tracking URL, custom domains, app subdomains |
| v0.32–v0.36 | Feb 24 | Glassmorphism UI redesign, dashboard perf optimization, QR Codes page with folders |
| v0.37–v0.43 | Feb 25 | Autosave, multi-theme system (Warm/Cool/Dark/Auto), mobile UX overhaul, settings profile |
| v0.47–v0.52 | Feb 26–27 | Codebase review & hardening, 1148 unit tests, Template Studio, landing page auth flow |
| v0.53–v0.61 | Feb 27–28 | Template Studio with click-to-edit, mobile performance (11s→3s), draft status, database-backed templates |
| v0.64–v0.66 | Mar 1 | App subdomain split, marketing homepage with 10 sections, Instrument Serif font |
| v0.72–v0.75 | Mar 1 | Features & Pricing pages, 20 marketing pages with templates, Use Cases dropdown nav, plan-intent routing to Stripe checkout |

### Architecture Highlights

- **Dual database**: Supabase for auth/users/orgs, Neon Postgres for QR codes/scans/usage
- **Glassmorphism**: 3-tier glass token system (glass/glass-medium/glass-heavy) with gradient mesh background
- **Template Studio**: Full-page interactive editor with click-to-edit zones, undo/redo, keyboard shortcuts
- **Marketing site**: 20+ pages using `MarketingLayout` wrapper, `MarketingHeader`/`MarketingFooter`, scroll-reveal animations
- **PWA optimization**: Runtime JS caching, lazy-loaded heavy deps (jspdf, html2canvas), deferred auth init

---

## Sprint 15: Auth Flow & Navigation Polish — March 1, 2026

### v0.76: Sign In as Standalone Page + Sign-Out Redirect

**Problem:** Marketing header "Sign In" link opened an auth modal overlay instead of navigating to the dedicated `/signin` page. Sign-out dumped users back to the homepage with no feedback.

**Changes:**
1. **MarketingHeader**: Changed "Sign In" from `action: 'signin'` (modal trigger) to `href: '/signin'` (page link). Removed `onSignIn` from props.
2. **MarketingLayout**: Removed `onSignIn` from interface — only `onSignUp` remains (for "Start free" CTA button).
3. **11 marketing pages/templates**: Removed `openSignIn` callback and `onSignIn` prop from `<MarketingLayout>`. Signup CTAs still open `AuthModal`.
4. **SignInPage + SignUpPage**: Replaced custom split-panel layouts (gradient side panel + custom header) with `MarketingLayout`, giving both pages the same marketing nav header and footer as the rest of the site.
5. **Sign-out flow**: `authStore.signOut()` now hard-navigates to `/signin?signedOut=true`. `SignInPage` reads the param on mount, fires a success toast, and cleans the URL with `replaceState`.
6. **Pricing "And more" links**: Changed `<a href="#pricing">` anchors on homepage pricing cards to `<Link to="/pricing">` for proper page navigation.

**Files changed:** 17 files across 3 commits. Tests updated (1232 passing across 68 files).

### Technical Learnings

**Marketing page auth pattern:** All marketing pages share the same structure: `openSignUp` + `AuthModal` for signup CTAs, while "Sign In" is a simple page link. When removing a prop from a shared layout component, grep all consumers — there were 11 pages plus 2 templates using `onSignIn`.

**Sign-out with toast feedback:** Hard navigation (`window.location.href`) is intentional after sign-out to ensure full React state teardown. The `?signedOut` search param + `useEffect` + `replaceState` pattern gives one-shot toast feedback without re-triggering on refresh.

---

## Current Status

**Version:** Beta v0.76

**Test counts:**
- 1232 unit tests across 68 files (Vitest)
- 63 E2E tests across 7 files (Playwright)

**Working:**
- Full marketing site (20+ pages with consistent header/footer/nav)
- Sign-in and sign-up pages with marketing layout
- Sign-out → redirect to /signin with success toast
- User sign-up/sign-in (email + OAuth)
- Dashboard with QR code listing, folders, filtering
- 9 QR code types with full customization
- Scan tracking with 4-tab analytics
- Template Studio with click-to-edit editing
- Multi-theme system (Warm/Cool/Dark/Auto)
- Mobile-optimized UX with bottom nav
- PWA with offline support
- API access with key management
- Custom domains (Business plan)
- Draft auto-save from wizard step 3

## Remaining Work

1. **Stripe integration completion** — deferred until user is ready to activate
2. **CSV export** — Coming Soon badge in place
3. **Email notifications** — Resend/SendGrid not set up yet
4. **Database migrations** — Several pending Neon/Supabase migrations (see MEMORY.md)
5. **App subdomains** — Need real domain with wildcard DNS

## Testing Notes
- Dev server with network access: `npm run dev -- --host 0.0.0.0`
- Production preview: `npm run preview -- --host 0.0.0.0`
- Network URL: `http://<IP>:5173/` (dev) or `http://<IP>:4173/` (preview)
