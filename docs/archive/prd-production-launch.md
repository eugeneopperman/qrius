# Qrius Production Launch PRD

**Version:** 1.0
**Date:** February 5, 2026
**Target Launch:** 2-4 weeks

---

## Executive Summary

Qrius is a QR code generator SaaS targeting small businesses, marketing agencies, enterprise teams, and individual creators. Key differentiators are a generous free tier, superior design quality, comprehensive analytics, and ease of use.

**Pricing (Finalized):**
- Free: $0/forever
- Pro: $12/month
- Business: $39/month

---

## Table of Contents

1. [Pre-Launch Checklist](#1-pre-launch-checklist)
2. [Infrastructure Setup](#2-infrastructure-setup)
3. [Feature Audit & Gaps](#3-feature-audit--gaps)
4. [Stripe Integration](#4-stripe-integration)
5. [Legal & Compliance](#5-legal--compliance)
6. [Branding & Domain](#6-branding--domain)
7. [Authentication](#7-authentication)
8. [Analytics & Monitoring](#8-analytics--monitoring)
9. [Launch Timeline](#9-launch-timeline)
10. [Post-Launch Roadmap](#10-post-launch-roadmap)

---

## 1. Pre-Launch Checklist

### Critical (Must Have)
- [ ] Production Supabase project configured
- [ ] Production Vercel deployment with custom domain
- [ ] Stripe account with products/prices created
- [ ] Stripe webhooks connected and tested
- [ ] Custom short URL domain configured (e.g., qr.qrius.app)
- [ ] Upstash Redis for redirect caching
- [ ] Google OAuth configured for production domain
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie Policy + consent banner
- [ ] GDPR compliance (data export/deletion)
- [ ] Error monitoring (Sentry or similar)
- [ ] Email transactional service (Resend, SendGrid, etc.)

### Important (Should Have)
- [ ] Logo and brand assets finalized
- [ ] Social meta tags (OG images)
- [ ] 404 and error pages styled
- [ ] Loading states polished
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility tested (Chrome, Safari, Firefox, Edge)
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)
- [ ] Rate limiting on API endpoints

### Nice to Have
- [ ] Customer support chat (Intercom, Crisp)
- [ ] Help center / Knowledge base
- [ ] Onboarding tour for new users
- [ ] Email onboarding sequence
- [ ] Referral program

---

## 2. Infrastructure Setup

### 2.1 Vercel (Hosting)
**Current:** Development deployment
**Needed:**
- [ ] Create production project or promote current
- [ ] Add custom domain (qrius.app or similar)
- [ ] Configure environment variables for production
- [ ] Enable Vercel Analytics
- [ ] Set up preview deployments for PRs

**Environment Variables Required:**
```
# Supabase
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=[price_id]
STRIPE_PRICE_BUSINESS=[price_id]

# Redis (Upstash)
KV_REST_API_URL=https://[region].upstash.io
KV_REST_API_TOKEN=[token]

# App
NEXT_PUBLIC_APP_URL=https://qrius.app
VITE_SHORT_URL_DOMAIN=https://qr.qrius.app
```

### 2.2 Supabase (Database + Auth)
**Current:** Development project
**Needed:**
- [ ] Create production project
- [ ] Run database migrations (schema.sql + schema-saas.sql)
- [ ] Configure Row Level Security policies
- [ ] Set up Google OAuth provider
- [ ] Configure email templates
- [ ] Enable email confirmations (optional)
- [ ] Set site URL for auth redirects

### 2.3 Upstash Redis (Caching)
**Current:** Not configured
**Needed:**
- [ ] Create Upstash account
- [ ] Create Redis database (choose region closest to users)
- [ ] Add KV_REST_API_URL and KV_REST_API_TOKEN to Vercel

### 2.4 Short URL Domain
**Current:** Using main domain (/r/[shortCode])
**Needed:**
- [ ] Acquire short domain (e.g., qr.qrius.app or qrius.io)
- [ ] Configure DNS to point to Vercel
- [ ] Update VITE_SHORT_URL_DOMAIN env var
- [ ] Test redirect functionality

---

## 3. Feature Audit & Gaps

### 3.1 Core Features (Ready)
| Feature | Status | Notes |
|---------|--------|-------|
| QR Generation (9 types) | ✅ Ready | URL, Text, Email, Phone, SMS, WiFi, vCard, Event, Location |
| Color customization | ✅ Ready | Foreground, background, gradient support |
| Logo embedding | ✅ Ready | Upload + positioning |
| Pattern styles | ✅ Ready | Dots, squares, rounded, etc. |
| Frame styles | ✅ Ready | Multiple frame options with labels |
| Download formats | ✅ Ready | PNG, SVG, JPEG, PDF |
| Copy to clipboard | ✅ Ready | |
| Local history | ✅ Ready | Last 20 QR codes stored |
| Brand templates | ✅ Ready | Save and apply styles |
| Dark mode | ✅ Ready | |
| PWA support | ✅ Ready | Offline capable |
| Keyboard shortcuts | ✅ Ready | |
| i18n (6 languages) | ✅ Ready | EN, ES, FR, DE, ZH, JA |

### 3.2 SaaS Features (Partially Ready)
| Feature | Status | Notes |
|---------|--------|-------|
| User authentication | ⚠️ Needs Config | Google OAuth needs production setup |
| Organization management | ✅ Ready | Create, invite, roles |
| Team invitations | ✅ Ready | Email invites implemented |
| Scan tracking | ✅ Ready | Geo, device, referrer data |
| QR code management | ✅ Ready | CRUD operations |
| Analytics dashboard | ⚠️ Basic | Needs charts/graphs |
| Billing portal | ⚠️ Needs Stripe | UI ready, needs Stripe config |
| API key management | ✅ Ready | Create, revoke, usage tracking |
| Plan limits enforcement | ✅ Ready | Checked on QR creation |

### 3.3 Feature Gaps to Address

#### P0 - Critical for Launch
1. **Stripe Integration** (See Section 4)
   - Create products and prices
   - Test checkout flow end-to-end
   - Test webhook handling
   - Implement subscription cancellation flow

2. **Email Notifications**
   - Payment failure notifications (code ready, needs email service)
   - Team invitation emails
   - Password reset emails (using Supabase)

3. **Analytics Visualization**
   - Currently shows raw numbers
   - Need: Line charts for scans over time
   - Need: Pie charts for device/location breakdown
   - Recommendation: Use Recharts (already common in React)

#### P1 - Important for Launch
1. **Onboarding Flow**
   - First-time user guidance
   - Template suggestions based on use case
   - "Create your first QR code" prompt

2. **Empty States**
   - Dashboard with no QR codes
   - Analytics with no scans
   - Team with no members

3. **Error Handling Polish**
   - User-friendly error messages
   - Retry mechanisms for failed operations
   - Offline indicator

#### P2 - Nice to Have
1. **Bulk Operations**
   - Export all QR codes
   - Bulk delete

2. **Advanced Analytics**
   - Custom date ranges
   - Export to CSV
   - Scan heatmaps

---

## 4. Stripe Integration

### 4.1 Stripe Account Setup
- [ ] Create Stripe account at stripe.com
- [ ] Complete business verification
- [ ] Enable test mode for development

### 4.2 Create Products & Prices

**Pro Plan ($12/month)**
```
Product Name: Qrius Pro
Price: $12.00 USD / month
Metadata:
  - plan: pro
  - qr_codes_limit: 100
  - scans_limit: 50000
  - team_members_limit: 5
  - api_requests_limit: 1000
```

**Business Plan ($39/month)**
```
Product Name: Qrius Business
Price: $39.00 USD / month
Metadata:
  - plan: business
  - qr_codes_limit: -1 (unlimited)
  - scans_limit: 500000
  - team_members_limit: 25
  - api_requests_limit: 10000
```

### 4.3 Webhook Configuration
Endpoint: `https://qrius.app/api/webhooks/stripe`

Events to subscribe:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4.4 Testing Checklist
- [ ] Test checkout flow with test card (4242 4242 4242 4242)
- [ ] Verify subscription created in database
- [ ] Test plan upgrade (Free → Pro)
- [ ] Test plan upgrade (Pro → Business)
- [ ] Test plan downgrade
- [ ] Test subscription cancellation
- [ ] Test failed payment handling
- [ ] Test webhook signature verification

---

## 5. Legal & Compliance

### 5.1 Required Pages

#### Terms of Service
Location: `/terms`
Must include:
- Service description
- User responsibilities
- Acceptable use policy
- Intellectual property rights
- Payment terms
- Subscription auto-renewal disclosure
- Limitation of liability
- Termination conditions
- Dispute resolution

#### Privacy Policy
Location: `/privacy`
Must include:
- Data collected (personal, usage, tracking)
- How data is used
- Data sharing with third parties
- Cookie usage
- Data retention periods
- User rights (access, deletion, portability)
- Contact information
- Updates notification

#### Cookie Policy
Location: `/cookies`
Must include:
- Types of cookies used
- Purpose of each cookie
- How to manage cookies
- Third-party cookies

### 5.2 GDPR Compliance
- [ ] Cookie consent banner
- [ ] Data export functionality (Settings → Export my data)
- [ ] Account deletion functionality (Settings → Delete account)
- [ ] Clear consent for marketing emails
- [ ] Data Processing Agreement for business customers

### 5.3 Implementation Tasks
- [ ] Create `/terms` page
- [ ] Create `/privacy` page
- [ ] Create `/cookies` page
- [ ] Add cookie consent banner component
- [ ] Add "Export my data" button in settings
- [ ] Add "Delete account" with confirmation
- [ ] Footer links to legal pages

---

## 6. Branding & Domain

### 6.1 Domain Strategy
**Primary domain options:**
- qrius.app (recommended - modern, memorable)
- qrius.io
- getqrius.com
- tryqrius.com

**Short URL domain options:**
- qr.qrius.app (subdomain - free)
- qri.us (short TLD - paid)
- q.qrius.app (minimal)

### 6.2 Brand Assets Needed
- [ ] Logo (SVG, PNG in multiple sizes)
- [ ] Favicon (16x16, 32x32, SVG)
- [ ] Apple touch icon (180x180)
- [ ] PWA icons (192x192, 512x512)
- [ ] Open Graph image (1200x630)
- [ ] Twitter card image (1200x600)
- [ ] Brand colors (currently orange/indigo - confirm)
- [ ] Email header/footer template

### 6.3 Current Placeholders to Replace
- [ ] `/public/favicon.svg` - Replace with real logo
- [ ] `/public/pwa-192x192.png` - Currently solid color
- [ ] `/public/pwa-512x512.png` - Currently solid color
- [ ] `/public/apple-touch-icon.png` - Replace with logo

---

## 7. Authentication

### 7.1 Current Setup
- Email/Password: ✅ Working
- Google OAuth: ⚠️ Needs production config
- GitHub OAuth: ❌ Removing per requirements
- Password reset: ✅ Working
- Email confirmation: Optional (currently disabled)

### 7.2 Google OAuth Production Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials for production
3. Add authorized redirect URI:
   - `https://[project].supabase.co/auth/v1/callback`
4. Configure in Supabase dashboard:
   - Authentication → Providers → Google
   - Add Client ID and Secret

### 7.3 Tasks
- [ ] Remove GitHub OAuth option from UI
- [ ] Set up Google OAuth for production domain
- [ ] Test sign-in flow end-to-end
- [ ] Verify email templates in Supabase

---

## 8. Analytics & Monitoring

### 8.1 Error Monitoring
**Recommendation:** Sentry (free tier available)
- [ ] Create Sentry project
- [ ] Install `@sentry/react`
- [ ] Configure in main.tsx
- [ ] Set up source maps upload in build

### 8.2 Product Analytics
**Recommendation:** PostHog or Mixpanel (free tiers)
Track:
- Sign ups
- QR code creations
- Downloads
- Feature usage
- Conversion (Free → Paid)

### 8.3 Uptime Monitoring
**Recommendation:** Better Uptime or UptimeRobot (free)
Monitor:
- Main app (qrius.app)
- API endpoints (/api/health)
- Short URL redirects (qr.qrius.app)

### 8.4 Performance Monitoring
- [ ] Vercel Analytics (built-in)
- [ ] Core Web Vitals tracking
- [ ] API response time monitoring

---

## 9. Launch Timeline

### Week 1: Infrastructure & Stripe
| Day | Tasks |
|-----|-------|
| 1-2 | Set up production Supabase, run migrations |
| 2-3 | Configure Stripe products, prices, webhooks |
| 3-4 | Test payment flows end-to-end |
| 4-5 | Set up Upstash Redis, test caching |
| 5 | Configure Google OAuth for production |

### Week 2: Legal, Branding & Polish
| Day | Tasks |
|-----|-------|
| 1-2 | Write/finalize Terms, Privacy, Cookie pages |
| 2-3 | Implement cookie consent banner |
| 3 | Create/finalize brand assets |
| 4 | Replace placeholder icons, add OG images |
| 4-5 | Add analytics charts to dashboard |
| 5 | Cross-browser testing |

### Week 3: Domain, Testing & Launch
| Day | Tasks |
|-----|-------|
| 1 | Purchase and configure domains |
| 1-2 | Set up custom short URL domain |
| 2-3 | End-to-end testing of all flows |
| 3 | Set up error monitoring (Sentry) |
| 4 | Soft launch to beta users |
| 5 | Fix any critical issues |

### Week 4: Public Launch
| Day | Tasks |
|-----|-------|
| 1-2 | Final QA and bug fixes |
| 3 | Public launch |
| 3-5 | Monitor, respond to issues |
| 5 | Retrospective, plan next iteration |

---

## 10. Post-Launch Roadmap

### Month 1 (Stabilization)
- Monitor error rates and fix bugs
- Gather user feedback
- Optimize performance bottlenecks
- Add requested quick wins

### Month 2-3 (Growth Features)
- Advanced analytics (date ranges, CSV export)
- Bulk QR code operations
- Custom short URL slugs
- Zapier/Make integration
- White-label options for Business tier

### Month 4-6 (Expansion)
- Additional QR code types (App Store, PayPal, Bitcoin)
- A/B testing for QR codes
- Dynamic QR codes (change destination without new code)
- API v2 with more features
- Enterprise tier with SSO

---

## Appendix: Quick Reference

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/qr-codes` | GET/POST | List/Create QR codes |
| `/api/qr-codes/[id]` | GET/PATCH/DELETE | QR code CRUD |
| `/api/qr-codes/[id]/analytics` | GET | Scan analytics |
| `/api/billing/checkout` | POST | Create Stripe checkout |
| `/api/billing/portal` | POST | Open billing portal |
| `/api/organizations` | GET/POST | Org management |
| `/api/api-keys` | GET/POST/DELETE | API key management |
| `/r/[shortCode]` | GET | QR code redirect |

### Database Tables
- `users` - User profiles
- `organizations` - Teams/workspaces
- `organization_members` - User-org relationships
- `organization_invitations` - Pending invites
- `subscriptions` - Stripe subscriptions
- `qr_codes` - QR code records
- `scan_events` - Scan tracking
- `api_keys` - API credentials

### Support Contacts
- Stripe: support@stripe.com
- Supabase: support@supabase.io
- Vercel: support@vercel.com
- Upstash: support@upstash.com
