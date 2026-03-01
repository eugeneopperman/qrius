# Notion Website Design Research

> Comprehensive analysis of notion.com's visual design system, layout patterns, and brand identity.
> Researched: March 2026

---

## 1. Color Palette

### Primary Brand Colors
- **Black** `#000000` — Primary text, logo, UI elements
- **White** `#FFFFFF` — Primary backgrounds, cards, clean canvas

### Accent/Section Colors (Marketing Site)
Notion uses four vibrant section background colors to create visual rhythm across their homepage and product pages:
- **Teal/Green** — Used for collaboration/wiki feature cards
- **Red/Coral** — Used for project management feature cards
- **Blue** — Used for docs/knowledge feature cards (also the default `theme: blue` for product pages)
- **Yellow/Gold** — Used for AI/automation feature cards

These appear as full-bleed card backgrounds in their bento grid layout, creating a color-coded feature taxonomy that helps users mentally categorize product areas.

### Brand Evolution Colors
The 2024 "Think it. Make it." campaign introduced bold primary colors (yellows, blues, reds) to external marketing for the first time — previously, Notion's brand was strictly black-and-white. The color introduction was driven by the need to stand out in urban advertising environments.

### How They Create Visual Rhythm
- Homepage sections alternate between white/neutral backgrounds and colored bento cards
- Each product area has its own accent color (blue for Docs, teal for Wikis, etc.)
- Customer logos and social proof sections use neutral (white/light gray) backgrounds as visual breathing room between colored feature sections
- The overall effect is: white hero → colored features → neutral social proof → colored use cases → white CTA

### Key Insight
Notion's approach is fundamentally **black/white + strategic accent colors**. The base is always clean white with black text. Color is used sparingly but boldly — entire card backgrounds flip to a saturated color rather than using small colored accents. This creates maximum contrast and visual impact without visual clutter.

---

## 2. Typography

### Font Family
- **Inter** — Primary (and only) typeface across the entire site and product
  - Designed by Rasmus Andersson
  - Open-source sans-serif optimized for screen readability
  - Selected for cross-platform consistency and extensive character support

### Font Weights Used
- **Regular (400)** — Body text, descriptions, feature copy
- **Medium (500)** — Section headers, navigation links, card titles
- **Bold (700)** — Hero headlines, emphasized elements, important labels

### Estimated Type Scale (based on observed hierarchy)
| Element | Estimated Size | Weight | Line-Height |
|---------|---------------|--------|-------------|
| Hero headline | 56-64px (desktop), 36-40px (mobile) | 700 (Bold) | ~1.1-1.15 |
| Section heading (H2) | 36-44px | 700 | ~1.2 |
| Sub-section heading (H3) | 24-28px | 500-600 | ~1.3 |
| Card title | 20-24px | 500-600 | ~1.3 |
| Body/description | 16-18px | 400 | ~1.5-1.6 |
| Navigation links | 14-15px | 500 | ~1.4 |
| Small/caption text | 13-14px | 400 | ~1.4 |
| CTA button text | 15-16px | 500-600 | 1 |

### Distinctive Typographic Choices
- **Single typeface system**: Unlike many SaaS sites that pair a serif display face with a sans-serif body, Notion uses Inter for everything. This reinforces the "tool" identity — it feels like the product itself
- **Large, bold hero text**: Headlines are punchy and short ("One workspace. Zero busywork.", "Publish anything, fast", "Meet your 24/7 AI team")
- **Tight line-height on heroes**: Display text has compressed leading (~1.1) creating dense, impactful headline blocks
- **Generous line-height on body**: Body copy uses relaxed leading (~1.5-1.6) for comfortable reading
- **Arrow indicators on CTAs**: Links and buttons frequently use " →" (right arrow) as a directional affordance appended to text

---

## 3. Layout Patterns

### Content Width
- **Max-width**: ~1168-1200px for primary content container
- Centered with auto margins
- Full-bleed sections for hero images and colored backgrounds

### Grid Structure
- **Bento grid**: The signature layout — 2-3 column card grids with varying card sizes
  - "Wide" cards span 2 columns with larger images (1728x1054px)
  - "Standard" cards occupy single columns (1728x1176px)
  - Cards alternate between sizes to create visual interest
- **3-column grids**: Used for use-case pillars (PMs, Designers, Engineers), integration cards, template galleries
- **2-column alternating**: Feature showcases with text on one side, image on the other, alternating left/right

### Whitespace Usage
- **Extremely generous**: Notion is known for "breathing room" — large vertical spacing between major sections
- Section padding appears to be ~80-120px top/bottom on desktop
- Between cards within a grid: ~16-24px gaps
- Between text elements within a card: ~12-16px

### Symmetry vs. Asymmetry
- **Headers and CTAs**: Centered, symmetrical
- **Feature showcases**: Alternating left-right layout creates controlled asymmetry
- **Bento grids**: Intentional size variation creates dynamic asymmetry within a structured grid
- **Overall approach**: Symmetrical framing with asymmetrical content

---

## 4. Hero Sections

### Homepage Hero
- **Headline**: Short, punchy, benefit-focused ("One workspace. Zero busywork.")
- **Subheading**: One sentence elaborating on the promise
- **Dual CTAs**: Primary "Get Notion free" + Secondary "Request a demo"
- **Media**: Full-width product video with poster image fallback
  - Desktop video poster: 2560x1600px
  - Mobile variant: 1600x1600px
  - Autoplay with poster fallback
- **Layout**: Centered text above, product shot below — classic SaaS hero pattern
- **Sizing**: Hero text estimated at 56-64px on desktop

### Product Page Heroes
Each product sub-page follows the same template:
- Large centered heading (product name or benefit statement)
- Supporting subtitle (1-2 sentences)
- Dual CTA buttons (primary + secondary)
- Full-width product screenshot or video below
- No background color — clean white

### Key Hero Pattern
The hero is deliberately simple and text-forward. Notion lets the product screenshot do the heavy lifting visually, keeping the text area minimal. The dual CTA pattern (free signup + sales demo) appears on every major page.

---

## 5. Imagery & Illustration Style

### Product Screenshots
- **Full-width, high-resolution**: Images at 1920x1200px (desktop) and 1125x2436px (mobile)
- **Edge-to-edge**: `image-placement: stretch` — no visible borders or frames in many sections
- **image-shadow: none**: Many screenshots are presented flat/clean without drop shadows
- **Responsive variants**: Separate desktop and mobile image assets served via Next.js image optimization (`/_next/image?url=...&w=3840&q=75`)
- **Real UI, not mockups**: Screenshots show actual Notion interface, not stylized mockups

### Illustration Style
- **Hand-drawn, gestural**: Created by in-house illustrator Roman Muradov
- **Line-work focused**: Minimal, expressive line drawings — described as "gestural lifework"
- **Inspiration**: Saul Steinberg (New Yorker covers), Pablo Picasso (cubism), Rube Goldberg (contraptions)
- **Character design**: Profile-view characters showing "the traditional pose of the thinker"
- **Skin tones**: Radial halftone with varied density to differentiate characters
- **Clothing**: Linear halftone or drawn patterns
- **Evolution**: Originally strictly black-and-white; 2024 campaign introduced primary colors (yellow, blue, red) to illustrations for out-of-home advertising

### AI Assistant Character
- **Minimal features**: Just eyes, brows, and a nose — deliberately reductive
- **Cel-animated foundation**: Each animation starts as hand-drawn cel art
- **State-based animation**: Built with Rive State Machine for organic expression mixing
- **Micro-animations**: Eyebrows wave while thinking, face falls apart for errors
- **Philosophy**: "Delightful — alert and engaged, but not distracting"

### Animated GIFs
- Product features on AI and product pages use animated GIFs labeled "AI Face" instead of static screenshots
- These show the product in motion, demonstrating features rather than just describing them

### Icon System
- Clean line-based icons: MagicWand, PlaybackPlay, ListIndent, Chart, etc.
- Used as feature identifiers in card layouts and grid sections
- Consistent weight with the illustration style

---

## 6. Buttons & CTAs

### Primary Button
- **Style**: Solid fill, dark background (black/near-black) with white text
- **Border radius**: Moderate rounding (~6-8px, not pill-shaped)
- **Pattern**: Text + right arrow (" →") as directional affordance
- **Usage**: "Get Notion free", "Try for free", "Get started"
- **Links to**: `/signup` consistently

### Secondary Button
- **Style**: Ghost/outline or lighter fill (white background with border)
- **Pattern**: Same arrow indicator style
- **Usage**: "Request a demo", "Contact Sales"
- **Links to**: `/contact-sales`

### Tertiary/Link CTAs
- **Style**: Text-only links with arrow indicators
- **Pattern**: "See how PMs use Notion →", "Try template →", "Try now →"
- **Usage**: Within feature sections and card footers
- **Hover**: Likely underline or color shift (standard link behavior)

### CTA Placement Pattern
- **Hero**: Always dual CTAs (primary + secondary) centered below headline
- **Section ends**: Single CTA at the bottom of feature sections
- **Cards**: Inline text links within card content
- **Closing section**: Mirrors hero layout — centered heading + dual CTAs

### Key CTA Insight
Notion's CTAs are notably restrained. No gradient buttons, no animated CTAs, no urgency language ("Limited time!"). The arrow indicator " →" is their signature CTA pattern — it appears on almost every actionable element.

---

## 7. Cards & Containers

### Bento Feature Cards
- **Background**: Solid saturated colors (teal, red, blue, yellow)
- **Content**: Icon/emoji + heading + short description + product screenshot
- **Sizing**: "Wide" (2-col span) and "Standard" (1-col)
- **Border radius**: Moderate rounding (appears ~12-16px)
- **Shadow**: Minimal to none — the colored background provides enough visual separation
- **Images within cards**: Full-width product screenshots positioned at bottom or side

### Integration Cards
- **Background**: White
- **Content**: Logo + product name + brief description + "Try now →" link
- **Layout**: Grid of equal-sized cards
- **Style**: Clean, minimal — logo is the visual anchor

### Testimonial/Quote Cards
- **Content**: Company logo at top + italic quote text + attribution (name, title)
- **Layout**: Figure element with blockquote styling
- **Style**: Clean white background, minimal borders

### Template Cards (Marketplace)
- **Thumbnail**: Full-width image (~16:10 aspect ratio, 1920x1200px desktop)
- **Content below**: Template name, creator info (avatar + name), pricing
- **Style**: Flat/clean, minimal shadow
- **Grid**: Responsive columns with consistent gaps

### Key Card Insight
Notion cards are distinguished by their **extreme simplicity**. No heavy drop shadows, no gradient borders, no hover glow effects. Cards are differentiated either by background color (bento cards) or by clean white containers with minimal borders. Content hierarchy does all the work.

---

## 8. Animation & Motion

### Scroll-Triggered Animations
- Sections fade/reveal into view on scroll
- Content appears with subtle upward motion as it enters viewport
- No aggressive parallax or 3D transforms

### "Nosey" Character Animations
- Homepage features small animated characters labeled `noseyAgents`, `noseyGlasses`, `noseyHeadset`, `noseySearching`
- These are micro-animations of the Notion AI assistant character in various states
- Built with Rive State Machine for game-engine-style state transitions
- Cel-animated foundation (hand-drawn frames) for authentic hand-crafted feel

### Video Usage
- **Homepage hero**: Autoplay video with poster image fallback
- **Feature sections**: Video poster frames with lazy-loading
- **Customer stories**: Embedded video player (4:19 format visible)
- **Carousel**: Kombi carousel component with video/poster alternation across slides

### Carousel Components
- "Kombi" carousel: Named custom component for sequential feature/template preview
- Used on product pages (Docs, AI, Sites) to showcase 4-6 feature variants
- Each slide: icon + title + description + screenshot/video

### Interactive Elements
- **Calculator tool**: JavaScript-driven team savings calculator on marketing pages
- **Carousel navigation**: Sequential slide navigation
- **Toggle components**: Monthly/yearly billing period selector on pricing page

### Key Motion Insight
Notion's animation philosophy mirrors their overall design: **restrained and purposeful**. No flashy scroll-jacking, no 3D product rotations, no complex WebGL effects. Motion is used to create a sense of life (AI character) and to progressively reveal content (scroll animations). The cel-animated AI character is their most distinctive motion element.

---

## 9. Navigation

### Header Structure
- **Position**: Sticky at top
- **Background**: White/light with transparent-to-solid transition on scroll (typical SaaS pattern)
- **Logo**: Left-aligned — Notion's 3D cube with serif "N"
- **Primary nav**: Center or center-left — Product, Solutions, Resources dropdown categories
- **Right side**: CTAs ("Get Notion free", "Request a demo" or "Log in")

### Dropdown/Mega Menu Structure
- **Product menu**: Sub-pages for AI, Docs, Wikis, Projects, Sites, Calendar
- **Solutions menu**: By team size (Startups, Enterprise) and by function (Engineering, Product, Design, etc.)
- **Resources menu**: Blog, Templates, Customers, Academy, etc.
- **Hover-accessible**: Submenus appear on hover (not click)
- **Multi-tier**: Nested categories with hierarchical organization

### Footer Navigation
- **Sections**: Product, Solutions, Resources, Company, Download
- **Language selector**: Multi-language support
- **Style**: Clean columnar layout, standard SaaS footer pattern

### Mobile Treatment
- Likely hamburger menu (standard responsive pattern)
- Separate mobile image variants suggest responsive-first approach
- Mobile nav would collapse mega menu into accordion pattern

### Key Navigation Insight
Notion's navigation is standard SaaS mega-menu fare, but executed cleanly. No visual clutter in the nav — no badges, no promotional banners in the menu, no animated elements. The nav serves as a quiet utility layer, letting the page content be the star.

---

## 10. Unique Design Elements — What Makes It "Notion"

### The Minimalist Foundation
- **Single typeface (Inter)**: The site feels like the product — no visual disconnect between marketing and app
- **Black + White base**: Everything starts from pure B&W, color is additive
- **Generous whitespace**: More breathing room than most SaaS sites
- **No visual clutter**: No floating chat widgets, no animated banners, no complex gradients

### The Illustration Heritage
- **Roman Muradov's hand-drawn style**: Distinctive gestural line work inspired by Saul Steinberg and New Yorker illustration
- **Characters in profile**: "The traditional pose of the thinker" — people are shown thinking, creating, building
- **Halftone textures**: Radial halftone for skin, linear halftone for clothing — a print-inspired technique
- **Cel-animation for digital**: AI character animations start as hand-drawn cels, giving digital interactions a handmade quality

### The Emoji/Icon Culture
- Notion's product uses emoji as page icons extensively
- This carries through to marketing — feature sections often use emoji-style icons (confetti, rocket, magnifying glass)
- Creates a sense of playfulness within the minimalist frame

### The "Tool" Aesthetic
- The marketing site intentionally looks like it could be built *in* Notion
- Clean containers, simple text hierarchy, functional layouts
- This is the meta-message: "our marketing site is as clean as our product"

### The Bento Grid
- Their signature layout pattern — modular cards of varying sizes with color-coded backgrounds
- Borrowed from Apple's product page layouts but made their own with the illustration style
- Creates information density without visual overload

### The Logo
- 3D cube drawn in thick black lines with serif "N"
- Unchanged since 2016
- The serif "N" within a geometric cube creates visual tension between classical and modern
- Designed by co-founder Ivan Zhao

---

## 11. Section Transitions

### Background Shifts
- **Hero → Logos**: White → white/light gray (subtle)
- **Logos → Features**: Light → colored bento cards (major visual shift)
- **Features → Social Proof**: Colored → back to white (breathing room)
- **Social Proof → Use Cases**: White → colored cards again
- **Use Cases → Final CTA**: Colored → white
- **Pattern**: Alternating neutral/colored creates a visual "breathing" rhythm

### Spacing Between Sections
- **Major sections**: ~80-120px vertical padding (desktop)
- **Sub-sections within a section**: ~40-60px
- **Mobile**: Reduced proportionally, but still generous (~40-60px between major sections)

### Visual Breathing Room
Notion's sections feel spacious because they:
1. Use large padding values
2. Keep content density moderate (not cramming features)
3. Use full-width colored backgrounds as visual separators (no need for lines/dividers)
4. Let product screenshots span wide (filling visual space with content, not decoration)

---

## 12. Social Proof & Trust

### Customer Logo Bar
- **Layout**: Horizontal scrolling grid
- **Companies**: Toyota, Mixpanel, Ramp, OpenAI, Headspace, Vercel, Figma, Perplexity AI, Time Magazine, Volvo, NVIDIA, 1Password
- **Sizing**: Varies (16px to 640px height depending on logo), normalized to consistent visual weight
- **Format**: Mix of PNG and SVG
- **Position**: Early on homepage, after hero — standard SaaS trust signal placement

### Testimonials
- **Structure**: Company logo → italic quote → attribution (name, title, company)
- **Format**: Clean blockquote styling, no heavy card treatment
- **Placement**: Between feature sections as visual breaks
- **Featured**: Often includes a single prominent testimonial rather than a grid of many

### Customer Stories/Case Studies
- **Card layout**: Hero thumbnail + company logo + title + metric highlights + person card (photo, role, quote)
- **Metrics**: Numerical callouts prominently displayed ("35% faster shipping", "70% cost reduction")
- **Tags**: Industry/company size metadata
- **Video**: Embedded video testimonials available

### Stat Carousel
- Multiple stat strings displayed in rotational pattern on homepage
- Quick-impact metrics that reinforce scale and trust

### Key Social Proof Insight
Notion leads with logos (breadth of adoption), follows with metrics (quantified impact), and supports with detailed case studies (depth). The social proof is integrated *between* feature sections rather than isolated in a single section — creating a rhythm of "feature → proof → feature → proof."

---

## 13. Feature Showcase Patterns

### Pattern 1: Bento Grid Cards
- 2-3 column grid with varying card sizes
- Each card: colored background + icon + headline + description + screenshot
- "Wide" cards for flagship features, "Standard" for supporting features
- Used on: Homepage, product overview pages

### Pattern 2: Kombi Carousel
- Named custom carousel component
- 4-6 slides, each with: icon + title + description + template/screenshot preview
- "Duplicate Template" links for actionable slides
- Used on: Product sub-pages (Docs, AI, Sites)

### Pattern 3: Alternating Text + Image
- Section heading centered above
- Rows alternate: text-left/image-right, then text-right/image-left
- Each row: icon + bold heading + descriptive paragraph + full-width image
- Images use `image-shadow: none` and `image-placement: stretch` for edge-to-edge presentation
- Used on: Wikis page, deeper feature pages

### Pattern 4: Pillar Grid
- 3-column grid showing use-case personas
- Each pillar: illustration + persona title + description + "See how X use Notion →" link
- Used for: Team/role targeting (PMs, Designers, Engineers)

### Pattern 5: Integration Grid
- Equal-sized cards in a grid
- Each card: partner logo + product name + brief description + "Try now →"
- White background, minimal styling
- Used on: Integration/connected apps sections

### Pattern 6: Feature Detail Grid
- `superPageBlockGrid` with 6 equal-weight blocks
- Each block: icon + title + short description (no images)
- Denser information without visual weight
- Used for: Secondary features, settings/capabilities lists

### Page Structure Formula
Almost every product page follows this template:
```
Hero (heading + CTAs)
  → Logo bar (social proof)
  → Feature carousel OR bento grid (primary features)
  → Alternating text+image blocks (feature deep-dives)
  → Testimonial quote (social proof break)
  → Pillar grid (use-case personas)
  → Integration grid (ecosystem)
  → Template gallery (actionable resources)
  → Closing CTA (mirrors hero)
```

---

## 14. Pricing Page Specifics

### Layout
- 4 pricing cards displayed horizontally
- Monthly/yearly toggle at top ("Save up to 20% with yearly")

### Tiers
| Tier | Price | CTA | Badge |
|------|-------|-----|-------|
| Free | $0/mo | Sign up | — |
| Plus | $10/mo | Get started | — |
| Business | $20/mo | Get started | "Recommended" |
| Enterprise | Custom | Contact Sales | — |

### Card Structure
Each card contains:
1. Plan name and price
2. Short description
3. CTA button
4. Feature list grouped by category (Notion AI, Content, Sharing, Database, Publishing, Admin, Support)
5. Expandable tooltips on feature descriptions

### Recommended Plan Treatment
Business plan is visually highlighted as "Recommended" — likely with a border/badge treatment and slight visual elevation.

### Comparison Table
Below cards: detailed "Plans and features" grid with rows per feature, columns per tier, using checkmarks or descriptions.

---

## 15. Technical Implementation Notes

### Built With
- **Next.js** (evidenced by `/_next/image` optimization, page routing patterns)
- **Contentful CMS** (category IDs and slug-based routing indicate headless CMS)
- **React Intl** for internationalization
- **TCFAPI** (GDPR consent framework)
- **Rive** for AI character animations (State Machine)

### Image Optimization
- Next.js image component with responsive sizing
- Max width: 3840px, quality: 75%
- Separate desktop and mobile image variants
- Lazy-loading with poster frames for videos

### CSS Architecture
- `--direction: 1` CSS custom property for RTL support
- Component-level styling (React component architecture)
- Responsive design with mobile-first image variants

---

## Summary: Key Design Principles

1. **Radical simplicity**: One font, B&W base, generous whitespace, no visual clutter
2. **Color as information**: Section colors map to product areas, creating visual taxonomy
3. **Product as hero**: Real screenshots, not mockups — the product sells itself
4. **Illustration as soul**: Hand-drawn artwork gives warmth to a minimal interface
5. **Restrained motion**: Purposeful animation (AI character, scroll reveals) — never decorative
6. **Consistent patterns**: Every page follows the same structural template
7. **Show, don't tell**: Interactive demos, carousels, calculators over descriptive copy
8. **Arrow affordance**: " →" on every actionable element creates directional momentum
9. **Breathing rhythm**: Alternating colored/neutral sections create visual pacing
10. **Tool aesthetic**: Marketing site mirrors the product's own clean, functional design
