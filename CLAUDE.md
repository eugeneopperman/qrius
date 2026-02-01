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
│   ├── features/          # ScannabilityScore, QRReader, BrandKit
│   ├── qr-types/          # Form components for each QR type
│   ├── settings/          # SettingsModal, BrandedUrlSettings
│   ├── templates/         # TemplateWizard, TemplateCard
│   ├── wizard/            # Main QR creation wizard
│   └── ui/                # Button, Input, Toast, etc.
├── hooks/                 # useUrlShortener, useKeyboardShortcuts
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
10. **Internationalization**: i18n support with English/Spanish/French/German
11. **Testing**: Vitest unit tests, Playwright E2E, Storybook component docs
12. **PWA**: Offline support, installable app
13. **Keyboard Shortcuts**: Ctrl+S (download), Ctrl+C (copy), etc.

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
| Feature | Free | Pro ($12/mo) | Business ($39/mo) |
|---------|------|--------------|-------------------|
| QR codes | 10 | 100 | Unlimited |
| Scans/month | 1,000 | 50,000 | 500,000 |
| History | 30 days | 1 year | 2 years |
| Team | 1 | 5 | 25 |
| API | No | 1K req/day | 10K req/day |

## Commands
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run unit tests (Vitest)
npm run e2e        # Run E2E tests (Playwright)
npm run storybook  # Start Storybook component docs
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
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

**Protected:**
- `/dashboard` - Dashboard overview
- `/qr-codes` - QR code list
- `/qr-codes/:id` - QR code detail & analytics
- `/create` - Create new QR code
- `/settings` - Settings overview
- `/settings/profile` - Profile settings
- `/settings/team` - Team management
- `/settings/billing` - Subscription management
- `/settings/api-keys` - API key management

## Development Notes
- Auth state managed in `authStore` with Supabase session sync
- Dashboard layout uses persistent sidebar with org switcher
- API routes support both JWT (browser) and API key authentication
- Stripe webhooks handle subscription lifecycle events
- Row Level Security (RLS) policies in database for data isolation
- QR codes without user/org ownership are public (backward compatibility)

## Testing
- **Unit Tests**: 166 tests passing with Vitest
- **E2E Tests**: Playwright for critical user flows
- **Component Docs**: Storybook for UI component documentation
- **Coverage**: Core utilities, stores, and components

## Known Issues
- Mobile testing requires network access (use `npm run dev -- --host 0.0.0.0`)
- PWA icons are placeholder solid colors
- API rate limiting not yet implemented at application level
- Stripe integration requires configuration (works without for dev)
