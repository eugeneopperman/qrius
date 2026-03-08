# Qrius Marketing Website — Image Shot List

> A complete list of every image needed for the marketing site, what to capture, and exact specs.
> Priority: P1 = must-have for launch credibility, P2 = nice-to-have, P3 = fine as-is.

---

## How to capture app screenshots

- Use Chrome DevTools device toolbar set to **1440 x 900** (desktop) unless noted otherwise
- Use **light/warm theme** (the marketing site is light)
- Populate the app with realistic demo data (not "test" or "lorem ipsum")
- Hide browser chrome — use the built-in screenshot tool (Ctrl+Shift+P > "Capture area screenshot")
- Export at **2x** resolution for retina (so a 800px-wide slot = 1600px capture)
- Save as `.webp` (quality 85) with `.jpg` fallback, or `.png` for UI with transparency
- Place all final images in `public/images/marketing/`

---

## 1. HOMEPAGE

### 1.1 Hero Image — P1

| Field | Value |
|-------|-------|
| **File name** | `hero-wizard.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.hero` |
| **Aspect ratio** | 4:3 |
| **Render size** | ~600px wide (flex-1 on desktop), full-width mobile |
| **Export size** | 1600 x 1200 px (2x retina) |
| **What to show** | The QR creation wizard at **Step 2 (Customize)** with a visually striking QR code in the live preview. The QR should have: an orange-to-coral gradient, rounded dot pattern, the Qrius logo centered, and a "Scan Me" frame. The customization sidebar should be visible with color/pattern options. |
| **App state** | Navigate to `/create`, complete step 1 (URL type, enter `https://yourwebsite.com`), advance to step 2. Apply gradient, logo, dot style, and frame. |
| **Crop** | Crop to show the preview panel + part of the customization sidebar. Exclude the top nav bar and step progress if tight. |

### 1.2 Problem/Solution Image — P1

| Field | Value |
|-------|-------|
| **File name** | `before-after-qr.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.hero` (reused, second instance) |
| **Aspect ratio** | 3:4 (portrait) |
| **Render size** | ~33% width desktop (lg:w-1/3) |
| **Export size** | 900 x 1200 px (2x retina) |
| **What to show** | A **custom graphic** (not a screenshot). Split composition — top half: a plain black-and-white QR code on a dull gray background with a "2015" vibe. Bottom half: a vibrant Qrius-styled QR code with gradient colors, a logo, a frame, and a label. Dividing line or arrow between them. |
| **How to create** | Generate both QR codes in the app. Screenshot each. Compose in Figma/Canva with a subtle divider line and optional "Before / After" micro-labels. |

### 1.3 Feature: "Create & customize" — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-customize.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.create` via `FeatureRow` |
| **Aspect ratio** | 4:3 |
| **Render size** | max-w-sm (~384px) |
| **Export size** | 800 x 600 px (2x retina) |
| **What to show** | Close-up of the **customization panel** — the color picker section with a gradient toggle active, and the live QR preview alongside it. Focus on the palette/gradient controls. |
| **App state** | `/create` step 2, Color section expanded, gradient enabled with orange-to-pink. |
| **Crop** | Tight crop on the color controls + QR preview. No nav, no step bar. |

### 1.4 Feature: "Track every scan" — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-analytics.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.track` via `FeatureRow` |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | The **Analytics Overview tab** on a QR code detail page — daily scan bar chart, stat cards (total scans, unique visitors, top country, top device), and the hourly distribution chart below. Needs realistic data (at least 7 days of varied scan counts). |
| **App state** | `/qr-codes/:id` with the Overview tab active. Populate scan_events in the DB with 50-100 varied entries across dates/countries/devices. |
| **Crop** | From stat cards down through the daily chart. Exclude the page header/breadcrumb. |

### 1.5 Feature: "Update anytime" — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-dynamic.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.update` via `FeatureRow` |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | The **QR code detail page** with the "Edit destination URL" modal open. The modal should show the current URL and a new URL being typed. Behind the modal, the QR code preview and tracking URL should be partially visible. This communicates "update without reprinting." |
| **App state** | `/qr-codes/:id`, click the edit (pencil) icon next to the destination URL to open `EditUrlModal`. Type a new URL into the field. |
| **Crop** | Center on the modal with enough background context to see the QR detail page behind it. |

### 1.6 Feature: "Built for teams" — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-teams.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.teams` via `FeatureRow` |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | The **Settings > Team tab** showing 3-4 team members with different role badges (Owner, Admin, Editor), plus the "Invite member" button or the invite modal open. Shows collaboration is real. |
| **App state** | `/settings?tab=team`. Need at least 3 org members with different roles. If you can't populate real members, mock the data or use the invite modal as the focus. |
| **Crop** | The member list + role badges + invite button. Exclude the settings sidebar. |

### 1.7 Use Case: Restaurants — P2

| Field | Value |
|-------|-------|
| **File name** | `usecase-restaurants.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.restaurants` |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Stock photo** of a restaurant table or menu — keep current Unsplash image OR upgrade to a photo that includes a visible QR code on a table tent, menu corner, or receipt. |
| **Source** | Unsplash / Pexels. Search: "restaurant qr code menu", "table tent qr". If no good stock, keep current and composite a small styled QR in the bottom-right corner using Figma. |

### 1.8 Use Case: Retail — P2

| Field | Value |
|-------|-------|
| **File name** | `usecase-retail.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.retail` |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Stock photo** of a retail environment — product packaging, shelf label, or storefront with a QR code visible. |
| **Source** | Unsplash / Pexels. Search: "product packaging qr code", "retail shelf label". Current image is acceptable — upgrade if a QR-inclusive option is found. |

### 1.9 Use Case: Events — P2

| Field | Value |
|-------|-------|
| **File name** | `usecase-events.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.events` |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Stock photo** of a conference/event — badge, banner, or check-in desk with a QR code visible. |
| **Source** | Unsplash / Pexels. Search: "event badge qr code", "conference check-in qr". Current image is acceptable. |

### 1.10 Use Case: Agencies — P2

| Field | Value |
|-------|-------|
| **File name** | `usecase-agencies.webp` |
| **Used in** | `HomePage.tsx` — `IMAGES.agencies` |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Option A (stock):** Team collaboration scene (current image is fine). **Option B (screenshot):** The QR Codes list page showing multiple QR codes in folders with styled thumbnails — demonstrates managing campaigns for clients. |
| **Source** | Keep current stock OR replace with app screenshot of `/qr-codes` with folder sidebar and several QR cards visible. |

---

## 2. FEATURES PAGE

### 2.1 Colors & Gradients — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-colors.webp` |
| **Used in** | `FeaturesPage.tsx` — customization FeatureRow (Colors & Gradients) |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | The **Color customization section** expanded in the wizard. Show the gradient toggle ON, with a two-color gradient picker visible (orange to coral). The QR preview next to it should display the gradient. |
| **App state** | `/create` step 2 > Color section open > Gradient toggle on. |
| **Crop** | Tight on color controls + preview. |

### 2.2 Dot & Corner Patterns — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-patterns.webp` |
| **Used in** | `FeaturesPage.tsx` — customization FeatureRow (Dot & Corner Patterns) |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | A **composite grid of 4-6 QR codes** each with a different dot/corner style (square, rounded, dots, classy, classy-rounded, extra-rounded). Same content, same color, different patterns. Laid out in a 2x3 or 3x2 grid. |
| **How to create** | Generate each QR variant in the app, screenshot each preview, arrange in a grid in Figma/Canva. Add subtle labels below each (e.g., "Square", "Rounded", "Dots"). |

### 2.3 Logo Upload — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-logo.webp` |
| **Used in** | `FeaturesPage.tsx` — customization FeatureRow (Logo Upload) |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | A QR code with the **Qrius logo centered** inside it. The logo section of the customization panel should be visible, showing the upload area, shape selector (circle/square/rounded), and size slider. |
| **App state** | `/create` step 2 > Logo section open > Upload the Qrius icon (`public/Qrius-Codes-Icon.svg`). Set shape to circle. |
| **Crop** | Logo controls + QR preview showing the embedded logo. |

### 2.4 Frames & Labels — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-frames.webp` |
| **Used in** | `FeaturesPage.tsx` — customization FeatureRow (Frames & Labels) |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | A QR code wrapped in a **frame with a "Scan Me" label** below it. Show the Frame section of the customization panel with frame style options and the label text input. |
| **App state** | `/create` step 2 > Frame section > Select a frame style > Type "Scan Me" in label field. |
| **Crop** | Frame controls + QR preview with frame and label visible. |

### 2.5 Brand Templates — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-templates.webp` |
| **Used in** | `FeaturesPage.tsx` — customization FeatureRow (Brand Templates) |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | The **Template Studio** (`/templates/new` or `/templates/:id/edit`) showing the interactive canvas with a styled QR code and the right-side panel with editing options. Demonstrates the click-to-edit workflow. |
| **App state** | `/templates/new` — create or load a template with some styling applied (gradient + logo + frame). |
| **Crop** | Canvas center + panel visible. Exclude sidebar nav. |

### 2.6 Analytics Dashboard — P1

| Field | Value |
|-------|-------|
| **File name** | `feat-analytics-full.webp` |
| **Used in** | `FeaturesPage.tsx` — Analytics section |
| **Aspect ratio** | 16:9 (wider than the FeatureRow images) |
| **Export size** | 1600 x 900 px |
| **What to show** | The full **analytics dashboard** for a QR code showing all 4 tabs visible as a composite: Overview (daily chart + stats), Geography (country bars with flags), Technology (browser/OS breakdown), Sources (referrer list). Create a 2x2 composite of all 4 tab screenshots. |
| **How to create** | Screenshot each tab individually from `/qr-codes/:id`, then arrange in a 2x2 grid in Figma. Add small tab labels (Overview / Geography / Technology / Sources) above each quadrant. |
| **Data needed** | 50-100 scan events with varied: dates (7+ days), countries (5+), browsers (Chrome/Safari/Firefox), devices (mobile/desktop), referrers (direct/google/instagram/facebook). |

### 2.7 Dynamic Codes Flow — P2

| Field | Value |
|-------|-------|
| **File name** | `feat-dynamic-flow.webp` |
| **Used in** | `FeaturesPage.tsx` — Dynamic Codes section (optional, to replace step icons) |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | Two-panel graphic: **Left** = QR code being created (wizard screenshot), **Right** = the same QR code's URL being edited (edit modal screenshot). Arrow or "then" connector between them. Caption: "Same QR, new destination." |
| **How to create** | Two app screenshots composed side-by-side in Figma with an arrow icon between. |

### 2.8 Download Formats — P3

| Field | Value |
|-------|-------|
| **File name** | `feat-downloads.webp` |
| **Used in** | `FeaturesPage.tsx` — Downloads section (optional enhancement) |
| **Aspect ratio** | 4:3 |
| **Export size** | 800 x 600 px |
| **What to show** | The **Step 4 (Download)** of the wizard showing the format selector (PNG/SVG/PDF) and the download button. A styled QR code should be visible in the preview. |
| **App state** | `/create` step 4 with a completed QR code. |

---

## 3. BLOG POSTS

### 3.1 "Introducing Qrius Codes" — P2

| Field | Value |
|-------|-------|
| **File name** | `blog-introducing.webp` |
| **Used in** | `blogPosts.ts` — post index 0 |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | The **Dashboard overview** page showing the QR code list with several styled QR thumbnails, folder sidebar, and stat cards at top. Establishes the product visually. |
| **App state** | `/dashboard` or `/qr-codes` with 5+ QR codes created (different types, colors, logos). |

### 3.2 "Static vs Dynamic QR Codes" — P2

| Field | Value |
|-------|-------|
| **File name** | `blog-static-vs-dynamic.webp` |
| **Used in** | `blogPosts.ts` — post index 1 |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Custom graphic**: Split down the middle. Left side: a plain QR code with a lock icon and label "Static — data baked in, can't change". Right side: a styled QR code with a link/refresh icon and label "Dynamic — update anytime, track scans". |
| **How to create** | Figma/Canva composition. Use two QR codes generated from the app. |

### 3.3 "5 QR Code Design Mistakes" — P2

| Field | Value |
|-------|-------|
| **File name** | `blog-design-mistakes.webp` |
| **Used in** | `blogPosts.ts` — post index 2 |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Grid of 5 "bad" QR codes** — each demonstrating a common mistake: (1) too busy/complex with tiny modules, (2) low contrast (light gray on white), (3) logo covering too much area, (4) no quiet zone (elements touching QR edges), (5) inverted colors (white on dark). Red X overlays on each. |
| **How to create** | Generate intentionally bad QR codes in the app (or modify screenshots), arrange in a grid, overlay red X marks. |

### 3.4 "Restaurant QR Menu" — P3

| Field | Value |
|-------|-------|
| **File name** | Keep current Unsplash URL |
| **Action** | No change needed — restaurant/food stock photo is contextually appropriate. |

### 3.5 "QR Codes That Die" — P2

| Field | Value |
|-------|-------|
| **File name** | `blog-codes-that-die.webp` |
| **Used in** | `blogPosts.ts` — post index 4 |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | **Screenshot** of a QR code detail page showing the **is_active toggle in OFF state** (deactivated QR). The status badge should show "Paused" or equivalent. Alternatively, show the redirect page a user sees when scanning a suspended QR (HTTP 451 page). |
| **App state** | `/qr-codes/:id` with the QR toggled inactive. |

### 3.6 "Color & Scannability" — P2

| Field | Value |
|-------|-------|
| **File name** | `blog-scannability.webp` |
| **Used in** | `blogPosts.ts` — post index 5 |
| **Aspect ratio** | 16:9 |
| **Export size** | 1600 x 900 px |
| **What to show** | The **Scannability Score** panel from the wizard showing a score (e.g., 92/100) with the contrast analysis and color recommendations. A QR code with good contrast should be visible alongside. |
| **App state** | `/create` step 2 — the scannability score component should be visible (typically shown below the QR preview). Use a high-contrast color scheme to get a good score. |

### 3.7 "Event Check-In" — P3

| Field | Value |
|-------|-------|
| **File name** | Keep current Unsplash URL |
| **Action** | No change needed — conference stock photo is contextually appropriate. |

### 3.8 "Real Estate" — P3

| Field | Value |
|-------|-------|
| **File name** | Keep current Unsplash URL |
| **Action** | No change needed — real estate stock photo is contextually appropriate. |

---

## 4. USE CASES PAGE

All 7 use case images are stock photos at **16:10 aspect ratio, 800 x 500 px (2x = 1600 x 1000)**.

| Use Case | Current | Upgrade Suggestion | Priority |
|----------|---------|-------------------|----------|
| Restaurants | Restaurant interior | Composite: add a small styled QR on a table tent in the scene | P3 |
| Retail | Retail store | Composite: add a QR on a product label or shelf tag | P3 |
| Events | Conference | Composite: add a QR on a badge or banner | P3 |
| Real Estate | House exterior | Composite: add a QR on a "For Sale" sign | P3 |
| Agencies | Team working | Replace with app screenshot of `/qr-codes` showing folder organization | P2 |
| Education | Campus/classroom | Keep as-is | P3 |
| Healthcare | Hospital/clinic | Keep as-is | P3 |

---

## 5. ABOUT PAGE

### 5.1 Hero / Origin Story — P2

| Field | Value |
|-------|-------|
| **File name** | `about-hero.webp` |
| **Used in** | `AboutPage.tsx` — hero section (currently no image) |
| **Aspect ratio** | 4:3 or 16:9 |
| **Export size** | 1600 x 1200 or 1600 x 900 px |
| **What to show** | **Product collage**: 4-5 styled QR codes fanned out or arranged in a grid, each with different customizations (different colors, logos, frames, dot patterns). Shows the range and personality of the product. |
| **How to create** | Generate 4-5 varied QR codes in the app, screenshot each, arrange in Figma with slight rotation/overlap and drop shadows on a warm (#FFF3E8) background. |

### 5.2 "The Name" Visual — P3

| Field | Value |
|-------|-------|
| **File name** | `about-qrius-name.webp` |
| **Used in** | `AboutPage.tsx` — "The Name" section (currently no image) |
| **Aspect ratio** | 16:9 |
| **Export size** | 1200 x 675 px |
| **What to show** | Typographic treatment showing the letter rearrangement: **C-U-R-I-O-U-S** with letters shuffling/animating to become **Q-R-I-U-S**. Could be a static graphic with arrows or a highlighted letter swap. |
| **How to create** | Design in Figma — use the brand serif font (Instrument Serif) for the letters. |

---

## 6. PAGES WITH NO IMAGE NEEDS

These pages are text/table-focused and work well without images:

- **PricingPage.tsx** — plan cards + comparison tables + FAQ accordion
- **ComparePage.tsx** — competitor comparison cards (text only)
- **CompareDetailPage.tsx** — detailed comparison tables
- **ContactPage.tsx** — contact form + sidebar info cards
- **ChangelogPage.tsx** — CSS timeline with colored tags

---

## Summary: All Images by Priority

### P1 — Must-have (12 images)

| # | File name | Type | Page |
|---|-----------|------|------|
| 1 | `hero-wizard.webp` | App screenshot | Homepage hero |
| 2 | `before-after-qr.webp` | Custom graphic | Homepage problem/solution |
| 3 | `feat-customize.webp` | App screenshot | Homepage feature row |
| 4 | `feat-analytics.webp` | App screenshot | Homepage feature row |
| 5 | `feat-dynamic.webp` | App screenshot | Homepage feature row |
| 6 | `feat-teams.webp` | App screenshot | Homepage feature row |
| 7 | `feat-colors.webp` | App screenshot | Features page |
| 8 | `feat-patterns.webp` | Custom composite | Features page |
| 9 | `feat-logo.webp` | App screenshot | Features page |
| 10 | `feat-frames.webp` | App screenshot | Features page |
| 11 | `feat-templates.webp` | App screenshot | Features page |
| 12 | `feat-analytics-full.webp` | Custom composite | Features page |

### P2 — Nice-to-have (8 images)

| # | File name | Type | Page |
|---|-----------|------|------|
| 13 | `feat-dynamic-flow.webp` | Custom composite | Features page |
| 14 | `blog-introducing.webp` | App screenshot | Blog |
| 15 | `blog-static-vs-dynamic.webp` | Custom graphic | Blog |
| 16 | `blog-design-mistakes.webp` | Custom composite | Blog |
| 17 | `blog-codes-that-die.webp` | App screenshot | Blog |
| 18 | `blog-scannability.webp` | App screenshot | Blog |
| 19 | `about-hero.webp` | Custom composite | About page |
| 20 | `usecase-agencies.webp` | App screenshot | Use cases / Homepage |

### P3 — Optional upgrades (8 items)

| # | Action | Page |
|---|--------|------|
| 21 | Composite QR onto restaurant stock photo | Use cases |
| 22 | Composite QR onto retail stock photo | Use cases |
| 23 | Composite QR onto events stock photo | Use cases |
| 24 | Composite QR onto real estate stock photo | Use cases |
| 25 | `feat-downloads.webp` — download step screenshot | Features page |
| 26 | `about-qrius-name.webp` — typographic treatment | About page |
| 27 | Keep restaurant blog stock photo | Blog |
| 28 | Keep event/real estate blog stock photos | Blog |

---

## Demo Data Checklist

Before capturing screenshots, populate the app with this data:

- [ ] **5+ QR codes** with different types (URL, vCard, WiFi, Event, Email)
- [ ] **Varied styling** on each — different colors, gradients, dot patterns, logos, frames
- [ ] **2+ folders** on the QR Codes page (e.g., "Q1 Campaign", "Product Labels")
- [ ] **50-100 scan events** spread across 7+ days, 5+ countries, 3+ browsers, mobile/desktop split, varied referrers (direct, google.com, instagram.com, facebook.com)
- [ ] **3-4 team members** with Owner/Admin/Editor roles
- [ ] **1+ brand template** saved in the Template Studio
- [ ] **Campaign names** on QR codes (e.g., "Spring Menu 2026", "Conference Badge", "Product Launch")

---

## File Organization

```
public/images/marketing/
  homepage/
    hero-wizard.webp
    before-after-qr.webp
    feat-customize.webp
    feat-analytics.webp
    feat-dynamic.webp
    feat-teams.webp
    usecase-restaurants.webp
    usecase-retail.webp
    usecase-events.webp
    usecase-agencies.webp
  features/
    feat-colors.webp
    feat-patterns.webp
    feat-logo.webp
    feat-frames.webp
    feat-templates.webp
    feat-analytics-full.webp
    feat-dynamic-flow.webp
    feat-downloads.webp
  blog/
    blog-introducing.webp
    blog-static-vs-dynamic.webp
    blog-design-mistakes.webp
    blog-codes-that-die.webp
    blog-scannability.webp
  about/
    about-hero.webp
    about-qrius-name.webp
```
