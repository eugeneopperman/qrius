# Qrius Codes — Sitemap & Page Content

> Master reference for site structure and page-by-page content. Voice and tone follow `docs/brand-voice-guide.md`.

---

## Sitemap Overview

```
qriuscodes.com/
│
├── MARKETING (Public)
│   ├── /                          ← Homepage
│   ├── /features                  ← Full feature breakdown
│   ├── /pricing                   ← Plans & comparison table
│   │
│   ├── /use-cases/                ← Use case hub
│   │   ├── /restaurants           ← Menus, ordering, reviews
│   │   ├── /retail                ← Product info, promotions, loyalty
│   │   ├── /events                ← Tickets, schedules, check-in
│   │   ├── /real-estate           ← Listings, virtual tours, contact
│   │   ├── /agencies              ← Client campaigns, white-label
│   │   ├── /education             ← Classroom materials, resources
│   │   └── /healthcare            ← Patient forms, info sheets, wayfinding
│   │
│   ├── /compare/                  ← Competitor comparison hub
│   │   ├── /bitly                 ← Qrius vs Bitly
│   │   ├── /qr-code-generator     ← Qrius vs QR Code Generator
│   │   ├── /uniqode               ← Qrius vs Uniqode
│   │   ├── /qr-tiger              ← Qrius vs QR Tiger
│   │   └── /flowcode              ← Qrius vs Flowcode
│   │
│   ├── /about                     ← Our story, mission, team
│   ├── /contact                   ← Contact form, email, socials
│   ├── /blog                      ← Blog index
│   │   └── /blog/:slug            ← Individual blog posts
│   ├── /changelog                 ← Product updates & releases
│   │
│   SUPPORT (Subdomain — support.qriuscodes.com)
│   │   ├── /getting-started
│   │   ├── /qr-types
│   │   ├── /customization
│   │   ├── /analytics
│   │   ├── /account-billing
│   │   └── /api
│   │
│   └── LEGAL
│       ├── /terms                 ← Terms of service
│       ├── /privacy               ← Privacy policy
│       └── /cookies               ← Cookie policy
│
├── AUTH
│   ├── /signin                    ← Sign in
│   ├── /signup                    ← Sign up
│   ├── /auth/callback             ← OAuth callback
│   └── /auth/reset-password       ← Password reset
│
└── APP (Protected — app.qriuscodes.com)
    ├── /dashboard                 ← Overview & stats
    ├── /qr-codes                  ← QR code list & folders
    │   └── /qr-codes/:id          ← Detail & analytics
    ├── /create                    ← QR creation wizard
    ├── /templates                 ← Brand templates
    │   ├── /templates/new         ← Template studio (new)
    │   └── /templates/:id/edit    ← Template studio (edit)
    ├── /settings                  ← Tabbed settings
    │   ├── ?tab=profile
    │   ├── ?tab=team
    │   ├── ?tab=billing
    │   ├── ?tab=api-keys
    │   └── ?tab=domains
    ├── /reader                    ← QR code reader/scanner
    └── /onboarding                ← New user onboarding
```

---

## Page-by-Page Content

Content for each page follows below. Status key:
- **Exists** — page is built, needs content update
- **New** — page needs to be created
- **Later** — planned but not for initial launch

---

### Homepage `/`
**Status:** Exists (currently QR generator for unauth, redirect for auth) — needs marketing redesign

**Purpose:** First impression. Show what Qrius Codes does, why it's different, and guide visitors to explore features or sign up.

**Sections:**

1. **Hero**
   - Headline + subheadline + primary CTA (Sign up free) + secondary CTA (See features)
   - Subtle product screenshot or animated QR code visual

2. **Social proof bar**
   - Key stats: codes created, scans tracked, countries reached
   - Or: "Trusted by X businesses" (once we have the numbers)

3. **What is Qrius Codes? (Problem → Solution)**
   - Brief pain-point setup: QR codes shouldn't be ugly, unreliable, or expensive
   - What we do differently in one paragraph

4. **Feature highlights (3-4 cards)**
   - Create & customize — beautiful codes in under a minute
   - Track everything — scans, locations, devices, real-time
   - Stay in control — dynamic codes you can update anytime
   - Built for teams — collaborate, manage, scale

5. **How it works (3 steps)**
   - Pick your type → Customize your design → Download & track
   - Inline micro-demo or animated walkthrough

6. **Pricing teaser**
   - "Everything you need for $9/mo" with plan comparison snippet
   - CTA to full pricing page

7. **Use case showcase (3-4 tiles)**
   - Restaurants, Retail, Events, Agencies — linking to use case pages

8. **Competitor differentiator strip**
   - Quick visual comparison: Qrius free tier vs industry average
   - "15 free dynamic codes. Most tools give you 1-3."

9. **Testimonials / Reviews**
   - Placeholder section for future social proof

10. **Bottom CTA**
    - "Ready to get qrius?" + Sign up free button

11. **Footer**
    - Nav links, legal, socials, "Stay qrius." tagline

---

### Features `/features`
**Status:** New

**Purpose:** Deep dive into everything Qrius Codes can do. For visitors who want details before committing.

**Sections:**

1. **Hero**
   - "Everything you need to create QR codes people actually scan."

2. **QR code types (grid)**
   - URL, Text, Email, Phone, SMS, WiFi, vCard, Event, Location
   - Each with icon, one-line description, and example use

3. **Customization**
   - Colors, gradients, dot patterns, corner styles, logo upload, frames with labels
   - Visual examples showing range of styles

4. **Dynamic codes**
   - Change destination anytime, even after printing
   - Explain the value: one print run, infinite flexibility

5. **Scan analytics**
   - Real-time tracking: location, device, browser, time
   - Daily/hourly charts, geography breakdown, referrer sources
   - Screenshot or illustration of analytics dashboard

6. **Brand templates**
   - Save your brand's style, apply to any new code in one click
   - Template studio preview

7. **Team collaboration**
   - Multi-user workspaces, role-based access, org management

8. **Downloads & formats**
   - PNG (free), SVG & PDF (Pro+)
   - High-res, print-ready output

9. **API access**
   - Programmatic QR generation for developers
   - Brief code snippet example

10. **Coming soon teaser**
    - Barcodes, digital business cards — "We're just getting started."

11. **Bottom CTA**
    - "See pricing" + "Start free"

---

### Pricing `/pricing`
**Status:** Exists — needs content refinement

**Purpose:** Transparent plan comparison. Build trust by being the opposite of competitors.

**Sections:**

1. **Hero**
   - "Honest pricing. No surprises."
   - "Pick a plan, pay what you see, cancel when you want."

2. **Plan toggle**
   - Monthly / Annual (with savings badge)

3. **Plan cards (3)**
   - **Free** — $0/forever — 15 dynamic codes, 5K scans/mo, 30-day history, PNG downloads
   - **Pro** — $9/mo — 250 codes, 100K scans, 1-year history, all formats, 5 team members, API
   - **Business** — $29/mo — Unlimited codes & scans, unlimited history, 25 team members, white-label, priority support

4. **Full feature comparison table**
   - Expandable/scrollable detailed breakdown

5. **Trust signals**
   - "No credit card required for free plan"
   - "Cancel anytime — your codes keep working"
   - "No hidden fees, no annual lock-in traps"

6. **FAQ**
   - What happens if I downgrade? (Codes keep working)
   - Can I switch plans anytime?
   - Do you offer refunds?
   - What counts as a "dynamic" QR code?
   - Is there a free trial for Pro/Business?

7. **Bottom CTA**
   - "Start free" + "Questions? Talk to us"

---

### Use Cases `/use-cases/:slug`
**Status:** New (7 pages)

**Purpose:** Help visitors from specific industries see themselves using the product. Strong for SEO and conversion.

**Shared structure per page:**

1. **Hero** — Industry-specific headline + visual
2. **Pain points** — 2-3 problems this industry faces with QR codes or offline-to-online
3. **How Qrius helps** — 3-4 feature applications specific to that industry
4. **Example QR codes** — Visual mockups showing real use (menu card, event badge, listing sign, etc.)
5. **Quick ROI stat or scenario** — "A restaurant with 20 tables saves X hours per month..."
6. **CTA** — "Start creating QR codes for [industry]"

**Industry pages:**

| Page | Key angle |
|---|---|
| `/use-cases/restaurants` | Menu codes, table ordering, Google review codes, WiFi sharing |
| `/use-cases/retail` | Product info, promotions, loyalty programs, packaging |
| `/use-cases/events` | Tickets, schedules, check-in, speaker bios, feedback forms |
| `/use-cases/real-estate` | Listing details, virtual tours, agent contact cards, open house sign-in |
| `/use-cases/agencies` | Client campaign management, white-label, brand templates, reporting |
| `/use-cases/education` | Classroom resources, assignment links, campus wayfinding, library catalogs |
| `/use-cases/healthcare` | Patient intake forms, appointment booking, wayfinding, medication info |

---

### Comparison Pages `/compare/:competitor`
**Status:** New (5 pages)

**Purpose:** Capture search traffic from people comparing tools. Honest, fact-based, not mudslinging.

**Shared structure per page:**

1. **Hero** — "Qrius Codes vs [Competitor]"
2. **Quick verdict** — 2-3 sentence summary of key differences
3. **Side-by-side comparison table** — Free tier, pricing, QR types, customization, analytics, team features, support
4. **Where Qrius wins** — 3-4 specific advantages with explanation
5. **Where [Competitor] might be better** — honest acknowledgment (builds trust)
6. **Common frustrations with [Competitor]** — sourced from real reviews, not attacks
7. **Migration note** — "Switching is easy — here's how"
8. **CTA** — "Try Qrius Codes free"

**Pages:**

| Page | Key Qrius advantages |
|---|---|
| `/compare/bitly` | 9 QR types vs URL-only, 15 free codes vs 2, $9 for 250 codes vs $29 for 10 |
| `/compare/qr-code-generator` | No bait-and-switch, codes survive cancellation, monthly billing available |
| `/compare/uniqode` | $9 vs $49 for comparable features, monthly billing, longer data retention |
| `/compare/qr-tiger` | Cleaner UI, codes editable after creation, no watermark on free |
| `/compare/flowcode` | Accessible pricing for SMBs, no $250/mo barrier to analytics |

---

### About `/about`
**Status:** New

**Purpose:** Build trust and human connection. Who's behind this, and why does it exist.

**Sections:**

1. **Hero** — "We're building the QR code tool we wished existed."
2. **Origin story** — Why Qrius Codes was created (the frustration with existing tools, the trust problem in the industry)
3. **What we believe** — 3-4 short value statements (transparency, design quality, fair pricing, respecting users)
4. **The name** — Brief, charming explanation of "Qrius" — curiosity, discovery, the joy of scanning
5. **Where we're headed** — Vision teaser (barcodes, digital business cards, the broader "codes" future)
6. **CTA** — "Want to try it?" or "Come be qrius with us"

---

### Contact `/contact`
**Status:** New

**Purpose:** Simple, human way to reach the team.

**Sections:**

1. **Hero** — "Let's talk." or "Got a question? We're real people."
2. **Contact form** — Name, email, subject (dropdown: General, Support, Sales, Partnership, Press), message
3. **Direct email** — hello@qriuscodes.com (or support@)
4. **Social links** — Twitter/X, LinkedIn, etc.
5. **Response time note** — "We typically reply within 24 hours."

---

### Blog `/blog`
**Status:** New

**Purpose:** Educational content, SEO, brand authority. Practical, not fluffy.

**Index page:**
- Featured/latest post hero
- Post grid with thumbnail, title, excerpt, date, category tag
- Category filter (How-to, Industry, Product updates, QR 101)

**Post page (`/blog/:slug`):**
- Title, author, date, category
- Body content with images
- Related posts
- CTA banner ("Ready to create your own?")

**Initial content categories:**
- **QR 101** — "What is a dynamic QR code?", "Static vs Dynamic: which do you need?"
- **How-to** — "How to put a QR code on a restaurant menu", "QR codes for event check-in"
- **Industry** — "How real estate agents use QR codes in 2026"
- **Design** — "5 QR code design mistakes (and how to fix them)", "Does QR code color affect scannability?"
- **Product** — Feature announcements tied to changelog

---

### Changelog `/changelog`
**Status:** New

**Purpose:** Show momentum, build trust, let users see the product is actively improving.

**Format:**
- Reverse chronological list
- Each entry: date, version, title, bullet list of changes
- Category tags: New, Improved, Fixed
- Tone: specific and excited, not generic. "You can now export to SVG on the free plan" > "Various improvements"

---

### Support Wiki `support.qriuscodes.com`
**Status:** New — separate subdomain, likely a dedicated help center tool (e.g., GitBook, Notion, HelpScout, or custom)

**Purpose:** Self-serve help center. Reduce support tickets, build confidence.

**Hub page (`support.qriuscodes.com/`):**
- Search bar
- 6 category cards with icons and article counts
- Consistent header/footer styling with main site

**Categories & sample articles:**

| Category | Path | Sample articles |
|---|---|---|
| **Getting started** | `/getting-started` | Creating your account, Your first QR code, Understanding your dashboard |
| **QR code types** | `/qr-types` | URL codes, vCard codes, WiFi codes, Event codes, choosing the right type |
| **Customization** | `/customization` | Adding your logo, Changing colors & gradients, Using brand templates, Frame labels |
| **Analytics** | `/analytics` | Reading your scan data, Geography & device reports, Tracking URLs |
| **Account & billing** | `/account-billing` | Changing your plan, Adding team members, Cancellation & what happens to your codes |
| **API** | `/api` | Authentication, Creating codes via API, Rate limits, Webhooks *(later)* |

**Article format:**
- Clear title phrased as a task ("How to add a logo to your QR code")
- Step-by-step with screenshots
- Related articles at bottom
- "Still stuck? Contact us" fallback

**Subdomain notes:**
- Should share visual identity (logo, colors, fonts) with main site
- Link to support from main site footer and contact page
- Link back to main site from support header

---

### Legal Pages `/terms` `/privacy` `/cookies`
**Status:** Exist — may need content refresh

**Approach:**
- Plain language where possible (following brand voice)
- Short summary at the top of each page in human-readable form
- Full legal text below
- Last updated date visible

---

### Auth Pages `/signin` `/signup`
**Status:** Exist

**Content notes:**
- Keep copy minimal and warm
- Sign up: "Create your free account" — emphasize no credit card
- Sign in: "Welcome back."
- Social auth buttons prominent (Google, GitHub)
- Link between sign in ↔ sign up

---

### 404 Page
**Status:** Exists — verify content matches brand voice

**Content:**
- "Well, this is awkward. That page doesn't exist."
- "But while you're here — want to make a QR code?"
- CTA: Go home / Create a QR code

---

## Page Priority for Launch

### Phase 1 — Core (build first)
1. Homepage (redesign)
2. Features
3. Pricing (refresh)
4. About
5. Contact

### Phase 2 — Growth (build next)
6. Use case pages (start with restaurants, retail, events)
7. Comparison pages (start with Bitly, QR Code Generator)
8. Blog (index + 3-5 launch posts)
9. Support wiki (hub + getting started articles)

### Phase 3 — Momentum
10. Remaining use case pages
11. Remaining comparison pages
12. Changelog
13. Expanded support wiki
14. Expanded blog cadence

---

*Next step: Write full page content for each page, starting with Phase 1.*
