# PRD: Customization Panel Redesign

## Problem Statement

The current customization panel has several UX issues:

### Current Pain Points

1. **Vertical Real Estate** - 7 accordion sections stacked vertically consume excessive scroll space
2. **Buried Options** - Users must expand each accordion to see what's inside; no visual preview of settings
3. **Cognitive Load** - "Essentials" vs "Advanced" hierarchy adds confusion without clear benefit
4. **Click-Heavy** - Every customization requires: scroll → find section → click to expand → adjust → collapse
5. **No Context** - Can't see how changes affect the QR code without scrolling back up on mobile
6. **Redundancy** - Smart Presets, Brand Kits, and Print Templates are utility features mixed with styling options

### Current Section Inventory

| Section | Purpose | Usage Frequency |
|---------|---------|-----------------|
| Smart Presets | Quick style templates | High (first-time) |
| Colors | QR/BG colors, gradients | Very High |
| Logo | Upload, size, shape | Medium |
| Style | Dot patterns, corners, error correction | Medium |
| Frame & Label | Border styles, CTA text | Low-Medium |
| Brand Kits | Save/load presets | Low |
| Print Templates | Export sizes | Low |

---

## Proposed Solution: Tabbed Panel with Floating Toolbar

### Design Philosophy
- **Progressive disclosure** - Show common options first, advanced on demand
- **Visual feedback** - See changes immediately without scrolling
- **Reduced clicks** - Quick access to frequent actions
- **Mobile-first** - Works well on touch devices

---

## Option A: Horizontal Tab Bar (Recommended)

Replace accordion with a compact horizontal tab system.

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [🎨 Colors] [📷 Logo] [✨ Style] [🖼️ Frame] [⚡ More]  │  ← Tab bar
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Active tab content (only one visible at a time) │   │
│  │                                                   │   │
│  │  • Compact, single-scroll-area layout            │   │
│  │  • No nested accordions                          │   │
│  │                                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tab Structure

| Tab | Icon | Contains |
|-----|------|----------|
| Colors | Palette | QR color, BG color, gradient toggle, color presets |
| Logo | Image | Upload, size, shape |
| Style | Shapes | Dot pattern, corner squares, corner dots, error correction |
| Frame | Frame | Frame style, label text |
| More | Sparkles | Smart Presets, Brand Kits, Print Templates |

### Benefits
- Only 1 section visible at a time = less visual noise
- Horizontal tabs don't consume vertical space
- Easy to switch between options
- "More" tab hides utility features cleanly

---

## Option B: Segmented Control + Collapsible Sections

A hybrid approach with primary options always visible.

### Layout
```
┌────────────────────────────────────────────────────────┐
│  QUICK COLORS                                          │
│  [■][■][■][■][■][■][■][■]  ← Color palette strip       │
├────────────────────────────────────────────────────────┤
│  [Colors ▼] [Logo ▼] [Style ▼] [Frame ▼]              │  ← Segmented toggles
│                                                        │
│  ▼ Colors (expanded)                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ • Gradient toggle                                 │ │
│  │ • Full color pickers                             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ► Logo (collapsed)                                    │
│  ► Style (collapsed)                                   │
│  ► Frame (collapsed)                                   │
├────────────────────────────────────────────────────────┤
│  [💾 Brand Kits] [🖨️ Print] [✨ Presets]              │  ← Utility buttons
└────────────────────────────────────────────────────────┘
```

### Benefits
- Quick color access without expanding anything
- Still uses accordions but fewer of them
- Utility features moved to footer buttons

---

## Option C: Floating Toolbar + Drawer

Most app-like approach, inspired by Canva/Figma.

### Layout
```
                                    ┌──────────────────┐
                                    │    QR Preview    │
┌──────────────────────┐           │                  │
│  QR Type Selector    │           │    [QR CODE]     │
├──────────────────────┤           │                  │
│  Content Input       │           └──────────────────┘
├──────────────────────┤
│  ┌────────────────┐  │
│  │ 🎨 │ 📷 │ ✨ │ 🖼️│  │  ← Floating icon toolbar
│  └────────────────┘  │
│                      │
│  When clicked:       │
│  ┌────────────────┐  │
│  │  Drawer slides │  │
│  │  up with that  │  │
│  │  section only  │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Benefits
- Minimal footprint until user wants to customize
- Each section gets full attention when opened
- Very mobile-friendly (drawer pattern is native feeling)

---

## Recommendation: Option A (Horizontal Tabs)

**Why:**
1. Minimal code changes - reuses existing section components
2. Familiar pattern - users understand tabs
3. Good desktop + mobile experience
4. Reduces visual clutter immediately
5. "More" tab solves the utility feature problem elegantly

---

## Implementation Plan

### Phase 1: Tab Container Component

**New file: `src/components/ui/Tabs.tsx`**

```tsx
// Tab container with horizontal scroll on mobile
<TabGroup>
  <TabList>
    <Tab icon={Palette}>Colors</Tab>
    <Tab icon={Image}>Logo</Tab>
    <Tab icon={Shapes}>Style</Tab>
    <Tab icon={Frame}>Frame</Tab>
    <Tab icon={Sparkles}>More</Tab>
  </TabList>
  <TabPanels>
    <TabPanel><ColorSection /></TabPanel>
    <TabPanel><LogoSection /></TabPanel>
    <TabPanel><StyleSection /></TabPanel>
    <TabPanel><FrameSection /></TabPanel>
    <TabPanel><MoreSection /></TabPanel>
  </TabPanels>
</TabGroup>
```

### Phase 2: Refactor App.tsx

- Remove AccordionItem wrappers
- Replace with TabGroup
- Move Smart Presets, Brand Kits, Print Templates into "More" tab

### Phase 3: Create MoreSection Component

**New file: `src/components/customization/MoreSection.tsx`**

Combines:
- Smart Presets (as a grid of clickable cards)
- Brand Kits (save/load buttons + list)
- Print Templates (size selector)

### Phase 4: Polish

- Add tab indicator animation (sliding underline)
- Keyboard navigation (arrow keys)
- Remember last active tab in session
- Smooth transitions between panels

---

## Component API Design

```tsx
interface TabProps {
  icon?: React.ElementType;
  children: React.ReactNode;
  disabled?: boolean;
}

interface TabGroupProps {
  defaultTab?: number;
  onChange?: (index: number) => void;
  children: React.ReactNode;
}

// Usage
<TabGroup defaultTab={0}>
  <TabList className="...">
    <Tab icon={Palette}>Colors</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>...</TabPanel>
  </TabPanels>
</TabGroup>
```

---

## Visual Design Specs

### Tab Bar
- Height: 48px
- Background: `var(--color-card)`
- Border-bottom: 1px solid `var(--color-border)`
- Horizontal scroll with hidden scrollbar on mobile
- Snap-to-tab scrolling

### Tab Button
- Padding: 12px 16px
- Font: 13px medium
- Inactive: gray-500 text, transparent bg
- Hover: gray-700 text, gray-100 bg
- Active: orange-600 text, orange-50 bg, orange underline (2px)

### Tab Panel
- Padding: 16px 0
- Max-height: 400px with internal scroll (prevents page scroll)
- Fade-in animation on switch

### Indicator
- Orange underline that slides to active tab
- Width matches tab content width
- Smooth 200ms transition

---

## Accessibility

- `role="tablist"` on container
- `role="tab"` on each tab button
- `role="tabpanel"` on each panel
- `aria-selected` on active tab
- `aria-controls` / `aria-labelledby` linking
- Arrow key navigation between tabs
- Home/End jump to first/last tab

---

## Mobile Considerations

- Tab bar scrolls horizontally
- Active tab auto-scrolls into view
- Touch targets: min 44px height
- Panel content scrolls independently
- Consider bottom sheet for "More" on very small screens

---

## Metrics for Success

1. **Reduced scroll depth** - Customization visible without scrolling
2. **Faster task completion** - Fewer clicks to apply common customizations
3. **Improved discoverability** - All 5 categories visible at once in tab bar
4. **Maintained accessibility** - Full keyboard + screen reader support

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/Tabs.tsx` | NEW - Tab components |
| `src/components/customization/MoreSection.tsx` | NEW - Combined utilities |
| `src/App.tsx` | Replace accordions with TabGroup |
| `src/index.css` | Tab animations, indicator styles |

---

## Open Questions

1. Should we persist the active tab across sessions? (localStorage)
2. Should the "More" tab use sub-tabs or stacked cards?
3. On mobile, should tabs become a bottom navigation or stay at top?

---

## Next Steps

1. [ ] Review and approve this PRD
2. [ ] Build Tabs.tsx component
3. [ ] Build MoreSection.tsx
4. [ ] Integrate into App.tsx
5. [ ] Test on mobile devices
6. [ ] Gather feedback and iterate
