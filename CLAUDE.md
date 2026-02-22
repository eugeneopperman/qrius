# Qrius - QR Code Generator SaaS

## Project Overview
Full-featured SaaS QR code generator with user authentication, multi-tenancy, subscription billing, and API access.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persist middleware
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Auth**: Supabase Auth
- **Database**: Supabase (Postgres) / Neon Postgres
- **Payments**: Stripe
- **QR Generation**: qr-code-styling
- **QR Reading**: html5-qrcode
- **PWA**: vite-plugin-pwa
- **Serverless**: Vercel Functions

## Project Structure
```
src/
├── components/
│   ├── auth/              # SignIn, SignUp, AuthModal, UserButton
│   ├── customization/     # Color, Logo, Style, Frame sections
│   ├── dashboard/         # DashboardLayout, Sidebar, QRCodeList
│   ├── features/          # ScannabilityScore, QRReader, PrintTemplates
│   ├── qr-types/          # Form components for each QR type
│   ├── settings/          # SettingsModal, BrandedUrlSettings
│   ├── templates/         # TemplateWizard, TemplateCard
│   ├── wizard/            # Main QR creation wizard
│   ├── layout/            # PublicFooter
│   ├── onboarding/        # OnboardingWizard, steps
│   ├── qr/                # QRRenderer, QRActions, QRPreview
│   ├── legal/             # LegalPageLayout
│   └── ui/                # Button, Input, Toast, Tabs, etc.
├── config/                # constants.ts (app version, limits, palettes)
├── data/                  # QR type definitions, use-case templates
├── hooks/                 # useUrlShortener, useKeyboardShortcuts
│   └── queries/           # TanStack Query hooks (useDashboardStats, useQRCodeDetail, etc.)
├── lib/                   # Supabase client configuration
├── pages/                 # Route pages (Dashboard, Settings, etc.)
│   └── settings/          # Profile, Team, Billing, API Keys pages
├── stores/                # Zustand stores (auth, qr, template, etc.)
├── types/                 # TypeScript interfaces
│   ├── index.ts           # QR types and styling
│   └── database.ts        # Supabase database types
├── router.tsx             # TanStack Router configuration
└── utils/                 # cn, scannabilityAnalyzer, urlShorteners

api/
├── _lib/                  # Shared utilities
│   ├── auth.ts            # Auth middleware
│   ├── db.ts              # Database client
│   ├── geo.ts             # Geolocation utilities
│   ├── kv.ts              # Redis cache
│   └── shortCode.ts       # Short code generation
├── billing/               # Stripe checkout & portal
├── organizations/         # Org CRUD & invites
├── api-keys/              # API key management
├── qr-codes/              # QR code CRUD
├── webhooks/              # Stripe webhooks
└── r/[shortCode].ts       # Redirect handler (Edge)
```

## Key Features
1. **Authentication**: Email/password + OAuth (Google, GitHub) via Supabase
2. **Multi-tenancy**: Organizations with role-based access (owner/admin/editor/viewer)
3. **9 QR Code Types**: URL, Text, Email, Phone, SMS, WiFi, vCard, Event, Location
4. **Customization**: Colors, logos, dot/corner patterns, frames with labels
5. **Scan Tracking**: Real-time analytics with geo and device data
6. **API Access**: Programmatic QR generation with API keys
7. **Subscription Billing**: Free/Pro/Business tiers via Stripe
8. **Brand Templates**: Save, apply, export/import style presets
9. **Template Wizard**: Step-by-step QR creation with use-case templates
10. **Campaign Names**: Optional labels for QR codes, shown on dashboard instead of raw URLs
11. **Styled Thumbnails**: Dashboard QR previews render with saved colors, gradients, logos, and dot patterns
12. **Scan Analytics Dashboard**: 4-tab analytics (Overview with daily/hourly charts, Geography with country/region bars, Technology with browser/OS/device breakdown, Sources with referrer tracking) — pure CSS, no charting library
13. **Testing**: Vitest unit tests (450 passing across 18 test files)
11. **PWA**: Offline support, installable app
12. **Keyboard Shortcuts**: Ctrl+S (download), Ctrl+C (copy), etc.

## Database Schema
Run `api/schema.sql` followed by `api/schema-saas.sql` to set up:
- `users` - User profiles (synced from Supabase Auth)
- `organizations` - Workspaces/teams
- `organization_members` - User-org relationships with roles
- `organization_invitations` - Pending invites
- `api_keys` - API key storage (hashed)
- `subscriptions` - Stripe subscription tracking
- `usage_records` - Monthly usage metrics
- `qr_codes` - QR codes with ownership
- `scan_events` - Scan tracking data
- `plan_limits` - Tier limits reference

## Subscription Tiers
| Feature | Free | Pro ($9/mo) | Business ($29/mo) |
|---------|------|-------------|-------------------|
| Dynamic QR codes | 15 | 250 | Unlimited |
| Scans/month | 5,000 | 100,000 | Unlimited |
| History | 30 days | 1 year | Unlimited |
| Team | 1 | 5 | 25 |
| API | No | 1K req/day | 10K req/day |
| Downloads | PNG | PNG, SVG, PDF | PNG, SVG, PDF |
| Brand templates | 3 | Unlimited | Unlimited |
| White-label | No | No | Yes |
| Support | Community | Email | Priority |

## Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run unit tests in watch mode (Vitest)
npm run test:run     # Run unit tests once (CI-friendly)
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Vitest browser UI
npm run e2e          # Run E2E tests (Playwright)
npm run storybook    # Start Storybook component docs
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## Environment Variables
Copy `.env.example` to `.env.local` and configure:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (server only)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key (server only)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PRICE_PRO` - Pro plan price ID
- `STRIPE_PRICE_BUSINESS` - Business plan price ID
- `POSTGRES_URL` - Database connection (if not using Supabase DB)
- `KV_REST_API_URL` - Upstash Redis URL
- `KV_REST_API_TOKEN` - Upstash Redis token

## Routes
**Public:**
- `/` - Home page (QR generator)
- `/signin` - Sign in
- `/signup` - Sign up
- `/auth/callback` - OAuth callback
- `/auth/reset-password` - Password reset
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/cookies` - Cookie policy

**Protected:**
- `/dashboard` - Dashboard overview
- `/qr-codes` - QR code list
- `/qr-codes/:id` - QR code detail & analytics
- `/create` - Create new QR code
- `/settings` - Tabbed settings page (profile, team, billing, api-keys)
- `/settings/profile` - Redirects to `/settings?tab=profile`
- `/settings/team` - Redirects to `/settings?tab=team`
- `/settings/billing` - Redirects to `/settings?tab=billing`
- `/settings/api-keys` - Redirects to `/settings?tab=api-keys`
- `/history` - QR code history
- `/reader` - QR code reader
- `/onboarding` - Onboarding wizard

## Deployment
- **Frontend**: Vercel at `https://design-sandbox-theta.vercel.app`
- **Auth/DB**: Supabase (Postgres + Auth)
- **QR/Scans DB**: Neon Postgres (via `POSTGRES_URL`)
- **Deploy**: `npx vercel --prod` (or git push triggers auto-deploy)
- **Version**: Beta version badge shown bottom-right on all pages, tracked in `src/config/constants.ts` (`APP_VERSION`)
- **Env vars**: Must be set in Vercel dashboard (Settings > Environment Variables) — `.env.local` is local only

## Development Notes
- **Import convention**: Use `@/` path alias for all imports from `src/` (e.g., `@/stores/authStore`). Single-level `../` is acceptable within the same directory group.
- **TanStack Query pattern**: Server state fetched via custom hooks in `src/hooks/queries/`. Reference: `useDashboardStats.ts`, `useOrganizationQRCodes.ts`, `useQRCodeDetail.ts`, `useTeamMembers.ts`, `useApiKeys.ts`. Use `useQuery` for reads, `useMutation` + `queryClient.invalidateQueries` for writes.
- **Global modals**: Driven by `uiStore.ts` (Zustand), rendered in `RootLayout` (`router.tsx`).
- Auth state managed in `authStore` with Supabase session sync
- `fetchProfile()` auto-provisions user/org/membership if DB trigger hasn't run
- `checkSupabaseConnection()` in `src/lib/supabase.ts` detects paused projects
- Dashboard layout uses persistent sidebar with org switcher
- API routes support both JWT (browser) and API key authentication
- Stripe webhooks handle subscription lifecycle events
- Row Level Security (RLS) policies in database for data isolation — schema is idempotent (DROP IF EXISTS before CREATE)
- QR codes without user/org ownership are public (backward compatibility)
- **Style metadata**: QR code style options (colors, gradients, logos, dot patterns) are saved in the `metadata` JSONB column as `{ style_options: {...} }`. The `QRStyleOptionsForPreview` type (exported from `QRMiniPreview.tsx`) defines the shape. `QRMiniPreview` accepts an optional `styleOptions` prop to render styled thumbnails.
- **Campaign Name**: `qrStore.campaignName` is an optional label set in wizard step 2 (StepContent). Used as the QR code `name` on save; falls back to auto-generated name if empty.

## Architecture Decisions

- **Supabase Auth** over Clerk/Auth0 — native Postgres integration with RLS, free tier supports 50K MAUs
- **TanStack Router** over React Router — type-safe routing with built-in code splitting and search param types
- **Zustand** over Redux/Jotai — already established in codebase, simple API with persist middleware
- **Dual database** — Supabase for auth/users, Neon for QR tracking (both Postgres, could consolidate later)
- **Upstash Redis** — caching redirect lookups with 24-hour TTL

## File Naming Conventions

- **Pages**: `src/pages/XxxPage.tsx` (PascalCase with Page suffix)
- **Components**: `src/components/category/ComponentName.tsx`
- **Stores**: `src/stores/xxxStore.ts` (camelCase with Store suffix)
- **Hooks**: `src/hooks/useXxx.ts` (camelCase with use prefix)
- **API routes**: `api/resource/index.ts` or `api/resource/[param].ts`

## Common Tasks

### Adding a New Protected Page
1. Create page component in `src/pages/`
2. Add route in `src/router.tsx` with `beforeLoad: requireAuth`
3. Use `DashboardLayout` wrapper for consistent UI

### Adding a New API Endpoint
1. Create handler in `api/` directory
2. Import auth helpers from `api/_lib/auth.ts`
3. Use `authenticate()` for flexible auth or `requireAuth()` for JWT-only
4. Check plan limits with `checkPlanLimit()` if needed

### Modifying Database Schema
1. Write migration SQL
2. Run in Supabase SQL Editor
3. Update types in `src/types/database.ts`
4. Update RLS policies if needed

## Debugging Tips

- **Auth issues**: Check Supabase Dashboard > Authentication > Users; verify redirect URLs; check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Database issues**: Check RLS policies aren't blocking queries; test in Supabase SQL Editor; verify `handle_new_user` trigger exists
- **API issues**: Check Vercel function logs; verify env vars in Vercel dashboard; test with `curl` to isolate frontend vs backend

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- API keys are hashed before storage (SHA-256)
- IP addresses are hashed for privacy in scan logs
- RLS policies enforce data isolation at database level
- CORS headers set on all API routes

## Testing
- **Unit Tests**: 432 tests passing across 17 test files (Vitest)
- **E2E Tests**: 62 tests across 7 Playwright test files (app, navigation, 404, theme, keyboard, wizard, mobile)
- **Unit command**: `npm run test:run` (single run) or `npm run test` (watch mode)
- **E2E command**: `npm run e2e` (all browsers) or `npx playwright test --project=chromium` (fast)
- **Unit coverage**: Utilities (cn, validators, scannability, gradients, qrRoundness), stores (auth, qr, template, theme, toast, wizard, history), UI components (Button, Input), hooks (useClickOutside, useDebounce, useFormField)
- **E2E coverage**: Navigation, legal pages, auth pages, wizard flow (all 9 QR types), keyboard shortcuts, theme toggle persistence, 404 pages, mobile viewport

## Documentation & Filing

- `CLAUDE.md` — Source of truth for project reference (root)
- `README.md` — Project overview and quick start (root)
- `docs/` — Active PRDs and reference runbooks
- `docs/archive/` — Completed PRDs and historical documents
- `docs/research/` — Architecture research and technical exploration
- **Naming**: `kebab-case.md` for all doc files
- **PRD lifecycle**: Create in `docs/`, move to `docs/archive/` when fully shipped
- **No floating `.md` files at root** except CLAUDE.md and README.md

## Known Issues
- Mobile testing requires network access (use `npm run dev -- --host 0.0.0.0`)
- Stripe integration requires configuration (works without for dev)
