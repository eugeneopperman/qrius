# Qrius Codes — Visual Style Guide

> Design reference for the marketing site (qriuscodes.com). Inspired by Mailchimp's warmth and editorial personality and Notion's structural clarity and confident minimalism. The goal: a site that feels warm, trustworthy, and design-forward — without trying too hard.

---

## Design Philosophy

**Mailchimp teaches us:** Warmth comes from details — an off-white instead of pure white, a serif headline instead of a geometric sans, food-named colors instead of "Primary Blue 600." Personality lives in restraint, not excess.

**Notion teaches us:** Confidence is quiet. A single typeface, generous whitespace, and bold color used strategically says more than gradients and animations everywhere. Let the product speak.

**Qrius Codes' position:** We sit between these two. Warmer than Notion, cleaner than Mailchimp. Friendly enough for a restaurant owner, polished enough for an agency. Our visual identity should feel like opening a well-designed app for the first time — intuitive, inviting, and a little delightful.

---

## Color Palette

### Foundation

| Name | Hex | Usage |
|---|---|---|
| **Snow** | `#FAFAF8` | Primary page background. Warm off-white, not clinical. *(Inspired by Mailchimp's Coconut #EFEDE9 but lighter — we want warmth without heaviness.)* |
| **Ink** | `#1A1A1A` | Primary text. Deep black with slight warmth. |
| **Charcoal** | `#4A4A4A` | Secondary text, body copy, descriptions. |
| **Mist** | `#E8E6E3` | Borders, dividers, subtle card outlines. |
| **Cloud** | `#F5F4F2` | Card backgrounds, alternating section backgrounds. |

### Brand

| Name | Hex | Usage |
|---|---|---|
| **Ember** | `#F97316` | Primary brand color. CTAs, active states, brand moments. Our orange — energetic, warm, unmistakable. |
| **Ember Light** | `#FFF3E8` | Soft orange backgrounds for badges, highlights, callout boxes. |
| **Ember Dark** | `#EA580C` | Hover states on primary buttons, pressed states. |

### Accent (used sparingly for section variety)

| Name | Hex | Usage |
|---|---|---|
| **Ocean** | `#0EA5E9` | Informational accents, links in certain contexts, analytics visuals. |
| **Sage** | `#22C55E` | Success states, positive metrics, "codes keep working" messaging. |
| **Coral** | `#F43F5E` | Warning states, competitor pain points (used carefully). |
| **Sand** | `#D4A574` | Warm neutral accent for decorative elements, illustration fills. |

### Section rhythm

Like Notion, we use **full-bleed background color** to create visual rhythm between sections rather than relying on dividers or decorative elements:

```
Snow (#FAFAF8)  →  Hero
Cloud (#F5F4F2)  →  Feature section
Snow (#FAFAF8)  →  How it works
Ink (#1A1A1A)   →  Bold statement / social proof (dark section)
Snow (#FAFAF8)  →  Pricing teaser
Ember Light (#FFF3E8) → CTA section (warm glow)
```

**Rules:**
- Maximum one dark (`Ink`) section per page — use it for a high-impact stat or quote
- Maximum one warm (`Ember Light`) section per page — reserve for the final CTA
- `Snow` and `Cloud` alternate freely for the bulk of the page
- Never use `Ember` as a full section background — it's too hot. Use `Ember Light` for warmth

---

## Typography

### Font Stack

| Role | Font | Weight | Fallback |
|---|---|---|---|
| **Display / Headlines** | **Instrument Serif** | Regular (400) | Georgia, serif |
| **Body / UI** | **Inter** | Regular (400), Medium (500), Semibold (600) | system-ui, sans-serif |

**Why this pairing:**
- *Instrument Serif* brings Mailchimp-style editorial warmth to headlines without needing a custom font. It's a free Google Font with elegant, slightly informal serifs — warm but not decorative. It says "we care about design" without saying "we hired a type foundry."
- *Inter* is Notion's exact choice — clean, neutral, optimized for screens. It handles body text, navigation, buttons, and UI without calling attention to itself.
- The serif/sans contrast creates the same personality split Mailchimp achieves with Means/Graphik: **headlines have character, body text has clarity.**

### Type Scale

| Element | Font | Size (desktop) | Size (mobile) | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| **Hero headline** | Instrument Serif | 56px | 36px | 400 | 1.1 | -0.02em |
| **Section headline** | Instrument Serif | 40px | 28px | 400 | 1.15 | -0.01em |
| **Card headline** | Inter | 24px | 20px | 600 | 1.3 | -0.01em |
| **Subheadline** | Inter | 20px | 18px | 400 | 1.5 | 0 |
| **Body** | Inter | 17px | 16px | 400 | 1.6 | 0 |
| **Small / Caption** | Inter | 14px | 13px | 500 | 1.5 | 0.01em |
| **Button** | Inter | 15px | 15px | 500 | 1 | 0.01em |
| **Nav** | Inter | 15px | 15px | 500 | 1 | 0 |
| **Overline / Label** | Inter | 13px | 12px | 600 | 1.4 | 0.08em |

**Rules:**
- Hero headlines use Instrument Serif, always. They should feel like a magazine cover line.
- Section headlines also use Instrument Serif — this is where the personality lives.
- Everything below section headlines uses Inter — clean, functional, invisible.
- Body text at 17px (not 16px) for slightly better readability on the warm background.
- Maximum body text width: 640px (approximately 65-75 characters per line).
- Headings use negative letter spacing (tighter) for density. Body uses default.
- Overline labels (like "FEATURES" above a section headline) use uppercase Inter with wide tracking.

---

## Layout & Spacing

### Grid

- **Max content width:** 1200px
- **Columns:** 12-column grid
- **Gutter:** 24px (desktop), 16px (mobile)
- **Page margin:** 24px (mobile), 48px (tablet), auto-centered (desktop)

### Spacing Scale

Based on a **4px base unit** (like Mailchimp):

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight icon gaps |
| `space-2` | 8px | Inline element spacing |
| `space-3` | 12px | Small component padding |
| `space-4` | 16px | Card internal padding (mobile), button padding |
| `space-6` | 24px | Card internal padding (desktop), form field gaps |
| `space-8` | 32px | Between related elements within a section |
| `space-12` | 48px | Between unrelated groups within a section |
| `space-16` | 64px | Between sections (mobile) |
| `space-24` | 96px | Between sections (desktop) |
| `space-32` | 128px | Between major page regions (hero→content, content→footer) |

### Section Anatomy

Each section follows this structure:

```
[Section background color]
  ├── Vertical padding: space-24 (96px) top and bottom on desktop
  ├── Overline label (optional): "FEATURES", "PRICING", "USE CASES"
  ├── Section headline: Instrument Serif, 40px
  ├── Section subheadline (optional): Inter 20px, max-width 640px
  ├── Gap: space-12 (48px)
  └── Section content (cards, grid, text blocks)
```

### Content Patterns

**Feature cards (grid):**
- 3-column grid on desktop, 2 on tablet, 1 on mobile
- Card padding: 32px desktop, 24px mobile
- Card gap: 24px

**Alternating feature rows:**
- Text on one side (50%), image/visual on the other (50%)
- Alternate left-right between rows
- Vertical gap between rows: 64px

**Bento grid (Notion-inspired, use sparingly):**
- 2-3 column grid with one "wide" card spanning 2 columns
- Use for feature highlights or use case showcase
- Cards have colored backgrounds (use accent palette)

---

## Components

### Buttons

**Primary:**
- Background: `Ember` (#F97316)
- Text: White
- Border-radius: 8px
- Padding: 12px 24px
- Font: Inter 15px Medium
- Hover: `Ember Dark` (#EA580C), slight lift (translateY -1px), subtle shadow
- Active: `Ember Dark`, no lift
- Transition: 150ms ease

**Secondary:**
- Background: transparent
- Border: 1.5px solid `Ink` (#1A1A1A)
- Text: `Ink`
- Border-radius: 8px
- Padding: 12px 24px
- Hover: Background `Ink`, text White
- Transition: 150ms ease

**Ghost / Text:**
- No background, no border
- Text: `Ink` or `Ember`
- Append " →" arrow on hover (Notion-style)
- Underline on hover (optional, context-dependent)

**Button sizing:**
- Default: 44px height (touch-friendly)
- Small: 36px height (inline contexts, table actions)
- Large: 52px height (hero CTAs only)

**Rules:**
- Maximum 2 buttons side by side (primary + secondary)
- Primary button always comes first (left on desktop, top on mobile)
- Never use Ember background on an Ember Light section — use the dark secondary style instead

### Cards

**Standard card:**
- Background: White (#FFFFFF) on `Snow` sections, or `Cloud` (#F5F4F2) on white sections
- Border: 1px solid `Mist` (#E8E6E3)
- Border-radius: 12px
- Shadow: `0 1px 3px rgba(0,0,0,0.04)` (barely there)
- Padding: 32px (desktop), 24px (mobile)
- Hover: Shadow deepens to `0 4px 12px rgba(0,0,0,0.08)`, translateY -2px
- Transition: 200ms ease

**Feature card (colored, Notion-inspired):**
- Background: One of the accent colors at low opacity (e.g., `Ocean` at 8% = `#0EA5E90A`)
- No border
- Border-radius: 16px
- Padding: 40px
- Contains: overline label, headline, body text, and optional visual/illustration
- Use for feature highlights and use case tiles

**Dark card:**
- Background: `Ink` (#1A1A1A)
- Text: White
- Border-radius: 12px
- Use for standout stats, testimonials, or contrast moments
- Maximum 1-2 dark cards per page

### Navigation

**Header:**
- Background: `Snow` (#FAFAF8) with subtle bottom border (`Mist`)
- Sticky on scroll (after scrolling past hero)
- Height: 64px
- Logo left, nav center, CTAs right
- Nav items: Inter 15px Medium, `Charcoal` text
- Hover: `Ink` text
- Active: `Ember` text or underline
- Mobile: Hamburger menu → full-screen overlay with navigation

**Logo:**
- The existing Qrius gradient logo (orange), used at `sm` size in header
- Logo + "Qrius Codes" wordmark in Inter Semibold

**Header CTAs:**
- "Sign in" as text link
- "Start free" as small primary button (Ember)

**Footer:**
- Background: `Ink` (#1A1A1A)
- Text: White / rgba(255,255,255,0.6) for secondary links
- 5-column layout: Product, Use Cases, Compare, Company, Legal
- Bottom row: Social icons, "Stay qrius." tagline, copyright
- Links hover to White from the 60% opacity default

### Tables (pricing comparison, competitor comparison)

- Header row: `Cloud` background, Inter 13px Semibold uppercase
- Body rows: alternating White / `Snow`
- Cell padding: 12px 16px
- Border: 1px solid `Mist` between rows
- Check marks: `Sage` (#22C55E) check icon
- Dashes (not available): `Mist` colored "—"
- Border-radius on table container: 12px
- Responsive: horizontal scroll on mobile, or stack into cards

### Badges & Tags

**Plan badge (e.g., "Pro", "Business"):**
- Background: `Ember Light`
- Text: `Ember Dark`
- Border-radius: 6px
- Padding: 4px 10px
- Font: Inter 12px Semibold

**Category tag (e.g., "QR 101", "How-to"):**
- Background: `Cloud`
- Text: `Charcoal`
- Border-radius: 6px
- Padding: 4px 10px
- Font: Inter 12px Medium

**"New" / "Improved" / "Fixed" (changelog):**
- New: `Sage` background at 15%, `Sage` text
- Improved: `Ocean` background at 15%, `Ocean` text
- Fixed: `Charcoal` background at 10%, `Charcoal` text
- Border-radius: 4px
- Padding: 2px 8px
- Font: Inter 12px Semibold

---

## Imagery & Visuals

### Product screenshots

- **Framing:** No browser chrome or device frames. Clean, edge-to-edge screenshots (like Notion).
- **Shadow:** Subtle drop shadow (`0 8px 32px rgba(0,0,0,0.08)`) to lift off the page.
- **Border-radius:** 12px to match card radius.
- **Resolution:** 2x minimum for retina. Serve optimized formats (WebP with PNG fallback).
- **Annotation:** Minimal. Use colored highlight boxes or arrows only when pointing to a specific feature. Prefer showing the UI speaking for itself.

### Illustrations

- **Style:** We don't need Mailchimp's surrealism or Notion's hand-drawn characters. Our illustration style should be **simple, warm, geometric** — think abstract shapes and QR code motifs.
- **QR code as visual element:** Use stylized QR code patterns as decorative elements (section backgrounds, card accents, hero visual). The dot grid of a QR code is inherently visual — lean into it.
- **Color:** Illustrations use the brand and accent palette. `Ember` as the primary illustration color, with `Sand`, `Ocean`, and `Sage` as supporting fills.
- **Complexity:** Low. These are accents, not centerpieces. A few geometric shapes, a QR code pattern, maybe a subtle phone outline. Not detailed scenes.

### Icons

- **Style:** Lucide icon set (already in use in the app). Consistent 24px size, 1.5px stroke weight.
- **Color:** `Charcoal` by default, `Ember` for active/highlighted states.
- **Feature icons (larger):** 40px in a 56px circle with `Ember Light` background for feature cards.

### Photography

- **Use sparingly.** Product screenshots > stock photography. We're a SaaS tool, not a lifestyle brand.
- **When used:** Warm, natural, real-world contexts — a QR code on a menu in a restaurant, a phone scanning a code on packaging. Never generic stock of "happy business people at a computer."
- **Treatment:** Slight warmth in color grading to match the `Snow` palette. Border-radius 12px.

---

## Animation & Motion

### Philosophy

**Restrained and purposeful** (Notion's approach, not a Framer portfolio).

Animations serve two purposes:
1. **Guide attention** — draw the eye to new content as it enters the viewport
2. **Provide feedback** — confirm interactions (button clicks, hover states, tab switches)

Animations should never:
- Delay content from being readable
- Distract from the message
- Make the site feel slower
- Require JavaScript to render the initial page state

### Scroll animations

- **Entrance:** Elements fade in + translate up 16px as they enter the viewport
- **Timing:** 400ms ease-out, staggered 80ms between sibling elements
- **Trigger:** When element is 15% into the viewport
- **Implementation:** CSS `@keyframes` + `IntersectionObserver`. No heavy animation libraries.
- **Reduced motion:** Respect `prefers-reduced-motion` — disable all scroll animations, show everything immediately.

### Hover & interaction

- **Buttons:** Background color transition (150ms), slight lift on primary (translateY -1px)
- **Cards:** Shadow deepens + slight lift (200ms ease)
- **Links:** Color transition (150ms), underline or arrow appears
- **Nav items:** Color shift only, no movement

### Page transitions

- None. Instant navigation. Speed > flair.

### Loading states

- Skeleton screens matching the layout structure (light gray pulse animation)
- No spinners unless absolutely necessary (and then: small, `Ember` colored, centered)

---

## Responsive Behavior

### Breakpoints

| Name | Width | Usage |
|---|---|---|
| `mobile` | < 640px | Single column, stacked layout |
| `tablet` | 640px – 1024px | 2-column grids, condensed spacing |
| `desktop` | > 1024px | Full layout, 3-column grids, side-by-side features |
| `wide` | > 1440px | Content stays at 1200px max, extra margin |

### Mobile-specific rules

- Hero headline: 36px (down from 56px)
- Section padding: 64px (down from 96px)
- Cards stack to single column
- Navigation collapses to hamburger
- Buttons go full-width in hero and CTA sections
- Tables convert to stacked cards or horizontal scroll
- Touch targets: minimum 44px height on all interactive elements

---

## Dark Mode

**Not for marketing site launch.** The app already supports dark mode, but the marketing site should launch with the light `Snow` theme only. Reasons:
- Consistency during launch
- The warm, editorial feel works best on light backgrounds
- Serif headlines have better readability on light
- Dark mode can be a Phase 2 addition

---

## Design Reference Summary

| Element | Inspiration | Qrius interpretation |
|---|---|---|
| Off-white background | Mailchimp's Coconut `#EFEDE9` | `Snow` `#FAFAF8` — warmer than white, lighter than Mailchimp |
| Serif headlines | Mailchimp's Means typeface | Instrument Serif — free, warm, editorial |
| Sans-serif body | Notion's Inter | Same — Inter for everything functional |
| Section color rhythm | Notion's colored bento cards | Alternating Snow/Cloud + one dark section + warm CTA |
| Minimal animation | Notion's restrained scroll reveals | Fade-up on enter, nothing more |
| Button style | Notion's confident dark buttons | Ember primary, dark secondary — warm but clear |
| Card style | Between both — Notion's flat + Mailchimp's soft shadow | Subtle shadow, 12px radius, barely-there border |
| Whitespace | Both — generous spacing | 96px between sections, never cramped |
| Product screenshots | Notion's frameless, real UI | Clean screenshots, 12px radius, subtle shadow |
| Social proof | Mailchimp's stats-forward approach | Bold numbers, logo bar, ratings — early and repeated |
| Footer | Mailchimp's comprehensive dark footer | Dark `Ink` footer with full navigation + "Stay qrius." |
| Overall feeling | Mailchimp's warmth + Notion's clarity | "A well-designed app you trust immediately" |

---

*This is a living document. Finalize with the team before implementation. Update as the design evolves — but change intentionally, not accidentally.*
