# Qrius — Market Readiness Checklist

> Generated from a full codebase audit on 2026-03-04.
> Tracks every item needed to ship Qrius as a production SaaS product.

---

## Overall Score: 73/100

| Category | Status | Score | Priority |
|----------|--------|-------|----------|
| Legal Pages | Done | 10/10 | - |
| Onboarding | Done | 10/10 | - |
| PWA | Done | 10/10 | - |
| Error Boundaries | Done | 10/10 | - |
| Loading States | Done | 10/10 | - |
| Empty States | Done | 10/10 | - |
| 404 Page | Done | 10/10 | - |
| Cookie Consent | Done | 10/10 | - |
| Favicon/Branding | Done | 10/10 | - |
| Security Headers | Done | 10/10 | - |
| Performance | Done | 9/10 | Low |
| Payment Flow | Partial | 8/10 | Medium |
| SEO | Partial | 7/10 | Medium |
| Accessibility | Partial | 7/10 | Medium |
| Feature Completeness | Partial | 7/10 | Medium |
| Contact/Support | Partial | 6/10 | Medium |
| Social Proof | Partial | 6/10 | Low |
| Email Service | Missing | 0/10 | **High** |
| Analytics | Missing | 0/10 | **High** |
| Error Monitoring | Missing | 0/10 | **High** |

---

## Launch Blockers (Must-Have)

These items block a credible production launch.

### 1. Analytics Integration
- [ ] Install PostHog SDK (`posthog-js`) or GA4
- [ ] Initialize in `src/main.tsx` using `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST`
- [ ] Wire cookie consent analytics toggle to enable/disable tracking
- [ ] Track key events: `signup_completed`, `qr_created`, `plan_upgraded`, `qr_downloaded`, `template_saved`
- [ ] Track page views on route changes (TanStack Router `onResolved`)
- [ ] Set user identity on auth (`posthog.identify(userId)`)

### 2. Error Monitoring
- [ ] Install Sentry SDK (`@sentry/react`)
- [ ] Initialize in `src/main.tsx` using `VITE_SENTRY_DSN`
- [ ] Add Sentry `ErrorBoundary` wrapper or integrate with existing ErrorPage
- [ ] Add Sentry to API routes (`@sentry/node` or `@sentry/vercel`)
- [ ] Set user context on auth for error grouping
- [ ] Configure source maps upload in Vite build

### 3. Transactional Email
- [ ] Install Resend SDK (`resend`)
- [ ] Initialize in `api/_lib/notifications.ts` using `RESEND_API_KEY`
- [ ] Implement email templates:
  - [ ] Welcome email (on signup)
  - [ ] Team invitation email (on org invite)
  - [ ] Payment failure notification (Stripe webhook)
  - [ ] Password reset (Supabase handles, but custom template recommended)
- [ ] Set up verified sender domain (e.g., `noreply@qriuscodes.com`)
- [ ] Test email delivery in staging

### 4. Contact Form Backend
- [ ] Create `api/contact/index.ts` endpoint
- [ ] Validate inputs (name, email, subject, message)
- [ ] Send email to support inbox via Resend
- [ ] Add rate limiting (e.g., 3 submissions/hour per IP)
- [ ] Add honeypot or reCAPTCHA for spam prevention

---

## High Priority (Should-Have for Launch)

### 5. SEO Improvements
- [ ] Expand `public/sitemap.xml` to include all marketing pages:
  - `/features`, `/pricing`, `/about`, `/contact`, `/changelog`
  - `/blog`, `/blog/:slug` (all 8 articles)
  - `/use-cases`, `/use-cases/:slug`
  - `/compare`, `/compare/:slug`
- [ ] Add unique meta description per page (currently only index.html has meta)
- [ ] Add `<title>` per route via TanStack Router `meta` or document.title
- [ ] Add og:image variants for blog posts and feature pages

### 6. Accessibility (WCAG 2.1 AA)
- [ ] Add alt text to all images (marketing page Unsplash images)
- [ ] Add skip-to-content link in layouts
- [ ] Verify color contrast ratios for all UI states
- [ ] Add semantic landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>` to layouts
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Ensure all interactive elements have visible focus indicators

### 7. API Rate Limiting Gaps
- [ ] Add IP-based rate limit on unauthenticated `POST /api/qr-codes` (e.g., 5/hour)
- [ ] Add per-user rate limit on `POST /api/organizations` (e.g., 3/day)
- [ ] Add rate limit on `POST /api/billing/checkout` (e.g., 5/min per org)

---

## Medium Priority (Pre-Growth)

### 8. Payment Flow Polish
- [ ] Add free trial period option in Stripe checkout (e.g., 7-day trial on Pro)
- [ ] Implement invoice/receipt display (Stripe hosted invoices link)
- [ ] Add payment method update flow (currently only via Stripe portal)
- [ ] Test upgrade/downgrade/cancel flows end-to-end
- [ ] Add "plan changed" toast or email confirmation

### 9. Social Proof
- [ ] Add customer testimonials section to homepage (minimum 3)
- [ ] Add customer logos / brand partners strip
- [ ] Add user count or growth metric to trust bar
- [ ] Consider G2/Capterra listing once live

### 10. Support Infrastructure
- [ ] Add FAQ / Help Center page (beyond pricing page FAQ)
- [ ] Add support email link in footer and settings (support@qriuscodes.com)
- [ ] Consider Intercom, Crisp, or similar for live chat (post-launch)

### 11. Complete "Coming Soon" Features
- [ ] **CSV analytics export** — add API endpoint for scan data export
- [ ] **App subdomains** — requires wildcard DNS on `qriuscodes.com` or separate domain
  - Buy/configure domain with wildcard DNS (`*.brand.qriuscodes.com CNAME cname.vercel-dns.com`)
  - Set `SUBDOMAIN_BASE_DOMAIN` env var
  - Update `DomainsSettingsPage.tsx` constant
- [ ] Remove or implement "Advanced analytics" Coming Soon badge on billing page

### 12. Custom Domain Completion
- [ ] Test full custom domain flow end-to-end (add → DNS → verify → redirect)
- [ ] Add VERCEL_API_TOKEN and VERCEL_PROJECT_ID to Vercel env vars (if not done)
- [ ] Test domain verification polling
- [ ] Add domain SSL status indicator

---

## Low Priority (Post-Launch Polish)

### 13. Performance
- [ ] Add responsive image component for marketing pages (srcset/sizes)
- [ ] Audit Lighthouse score and address any sub-90 metrics
- [ ] Consider edge caching for marketing pages

### 14. Marketing Content
- [ ] Write case studies (2-3 customer stories)
- [ ] Add more blog articles (target 15-20 for SEO)
- [ ] Create video tutorial for homepage
- [ ] Add changelog entries for recent features

### 15. Testing Gaps
- [ ] Add E2E tests for Stripe checkout flow (mock mode)
- [ ] Add E2E tests for team invitation flow
- [ ] Add visual regression tests for marketing pages

---

## Database Migrations Pending

These SQL migrations need to be run before launch:

- [ ] `api/migrations/004-custom-domains.sql` — Run in **Supabase** SQL Editor
- [ ] `api/migrations/007-supabase-security.sql` — Run in **Supabase** SQL Editor (fixes RLS warnings)
- [ ] `api/migrations/010-brand-templates.sql` — Run in **Neon** SQL Editor
- [ ] `api/migrations/011-draft-status.sql` — Run in **Neon** SQL Editor (if not already done)
- [ ] `api/migrations/012-pricing-restructure.sql` — plan_limits section in **Neon**, full file in **Supabase**

---

## Environment Variables Checklist

Verify all production env vars are set in Vercel:

**Required:**
- [ ] `VITE_SUPABASE_URL` — Production Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` — Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Production service role key
- [ ] `APP_URL` — `https://qriuscodes.com`
- [ ] `SHORT_URL_DOMAIN` — `qrslnk.com`
- [ ] `POSTGRES_URL` — Neon database connection string
- [ ] `IP_SALT` — Random 64-char hex string for privacy
- [ ] `API_KEY_SECRET` — Random 64-char hex string for API key encryption

**Payments:**
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` — Live Stripe key (`pk_live_...`)
- [ ] `STRIPE_SECRET_KEY` — Live Stripe secret (`sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` — Production webhook secret
- [ ] `VITE_STRIPE_PRICE_STARTER` / `VITE_STRIPE_PRICE_STARTER_ANNUAL`
- [ ] `VITE_STRIPE_PRICE_PRO` / `VITE_STRIPE_PRICE_PRO_ANNUAL`
- [ ] `VITE_STRIPE_PRICE_BUSINESS` / `VITE_STRIPE_PRICE_BUSINESS_ANNUAL`

**Caching:**
- [ ] `KV_REST_API_URL` — Upstash Redis URL
- [ ] `KV_REST_API_TOKEN` — Upstash Redis token

**To add for launch:**
- [ ] `VITE_POSTHOG_KEY` — PostHog project API key
- [ ] `VITE_POSTHOG_HOST` — PostHog instance URL
- [ ] `VITE_SENTRY_DSN` — Sentry DSN for error tracking
- [ ] `RESEND_API_KEY` — Resend API key for transactional email
- [ ] `VERCEL_API_TOKEN` — For custom domain management
- [ ] `VERCEL_PROJECT_ID` — For custom domain management

---

## Code Quality Notes (from audit)

The codebase is in good shape. Key findings:

- **No critical bugs** found across 68 test files (1232 tests passing)
- **No SQL injection risks** — all queries use parameterized statements
- **No unguarded console statements** in production code
- **All Zustand stores** properly use `useShallow` selectors
- **All protected routes** have error boundaries
- **Security headers** properly configured in vercel.json

**Minor items fixed or noted:**
- 3 unsafe type casts in API routes (`as unknown as`) — low risk, well-localized
- Stripe webhook price-to-plan mapping handles missing env vars gracefully
- Dual database (Supabase + Neon) architecture is documented and consistent
