# PRD: Stepped Wizard Flow

## Problem Statement

The current interface presents all options simultaneously, which:
- Overwhelms new users with too many choices at once
- Doesn't guide users through a logical creation process
- Makes the app feel more like a tool than an experience
- Buries the most important action (download) at the end

### Current Flow (Flat)
```
┌─────────────────────────────────────────────────────────────┐
│  [Type Selector - 9 options visible]                        │
│  [Input Form]                                               │
│  [Customization Tabs - Colors, Logo, Style, Frame, More]   │
│  [Preview + Download]                                       │
└─────────────────────────────────────────────────────────────┘
```

Users see everything at once → cognitive overload → decision fatigue

---

## Proposed Solution: 4-Step Wizard

A guided, linear flow that reveals complexity progressively.

### Step Overview

| Step | Name | Purpose | Required? |
|------|------|---------|-----------|
| 1 | **Choose Type** | Select QR code category | Yes |
| 2 | **Add Content** | Enter the data to encode | Yes |
| 3 | **Customize** | Style, colors, logo, frame | Optional (skip available) |
| 4 | **Download** | Export in desired format | Yes |

### Key Principles
1. **One decision at a time** - Focus attention on current step
2. **Always visible preview** - QR updates live as user progresses
3. **Skip optional steps** - Power users can jump ahead
4. **Easy back-navigation** - Never feel trapped
5. **Progress indicator** - Know where you are in the flow

---

## Detailed Flow Design

### Step 1: Choose Type

**Goal:** Select what kind of QR code to create

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1 of 4 ─────●───────────────────────────────              │
│                                                                  │
│  What would you like to create?                                 │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   🔗        │  │   📝        │  │   ✉️        │              │
│  │   URL       │  │   Text      │  │   Email     │              │
│  │  Website    │  │  Message    │  │  Address    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   📞        │  │   💬        │  │   📶        │              │
│  │   Phone     │  │   SMS       │  │   WiFi      │              │
│  │   Call      │  │  Message    │  │  Network    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   👤        │  │   📅        │  │   📍        │              │
│  │   vCard     │  │   Event     │  │  Location   │              │
│  │  Contact    │  │  Calendar   │  │   Map       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│                                              [Continue →]        │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Cards are large and tappable (mobile-friendly)
- Selected card has prominent highlight
- "Continue" button enabled only after selection
- Clicking a card can auto-advance (optional setting)

---

### Step 2: Add Content

**Goal:** Enter the data to encode in the QR code

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 2 of 4 ─────────────●───────────────────                  │
│                                                                  │
│  ← Back                          Creating: URL QR Code          │
│                                                                  │
│  ┌─────────────────────────────────────┐  ┌─────────────────┐   │
│  │                                     │  │                 │   │
│  │  Enter your website URL             │  │   [QR Preview]  │   │
│  │                                     │  │                 │   │
│  │  ┌─────────────────────────────┐   │  │   Live preview  │   │
│  │  │ https://example.com         │   │  │   updates as    │   │
│  │  └─────────────────────────────┘   │  │   you type      │   │
│  │                                     │  │                 │   │
│  │  □ Shorten URL with TinyURL        │  └─────────────────┘   │
│  │                                     │                        │
│  │  Tip: Make sure the URL is         │                        │
│  │  accessible to anyone who scans.   │                        │
│  │                                     │                        │
│  └─────────────────────────────────────┘                        │
│                                                                  │
│  [← Back]                    [Skip Styling]  [Customize →]      │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Form is specific to the selected QR type
- Live preview updates as user types
- "Skip Styling" jumps directly to Step 4 (Download)
- "Customize" goes to Step 3
- Validation happens before advancing

---

### Step 3: Customize (Optional)

**Goal:** Style the QR code appearance

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 3 of 4 ─────────────────────●───────────                  │
│                                                                  │
│  ← Back                              Customize Your QR Code     │
│                                                                  │
│  ┌───────────────────────────────────┐  ┌───────────────────┐   │
│  │                                   │  │                   │   │
│  │  [🎨 Colors] [📷 Logo] [✨ Style] │  │                   │   │
│  │  [🖼️ Frame] [⚡ Presets]          │  │   [QR Preview]    │   │
│  │                                   │  │                   │   │
│  │  ─────────────────────────────    │  │                   │   │
│  │                                   │  │                   │   │
│  │  Active tab content here...       │  │   Scannability:   │   │
│  │                                   │  │   ████████░░ 85%  │   │
│  │  • Color pickers                  │  │                   │   │
│  │  • Logo upload                    │  │                   │   │
│  │  • Pattern options                │  │                   │   │
│  │  • Frame styles                   │  │                   │   │
│  │                                   │  │                   │   │
│  └───────────────────────────────────┘  └───────────────────┘   │
│                                                                  │
│  [← Back]                                      [Download →]     │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Uses the new tabbed customization panel
- Preview always visible on the side (or top on mobile)
- Scannability score shown to prevent unusable designs
- Can go back to change content
- "Download" advances to final step

---

### Step 4: Download

**Goal:** Export the QR code in desired format

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 4 of 4 ─────────────────────────────────●                 │
│                                                                  │
│  ← Back                                Your QR Code is Ready!   │
│                                                                  │
│           ┌─────────────────────────────────────┐               │
│           │                                     │               │
│           │                                     │               │
│           │           [Large QR Preview]        │               │
│           │                                     │               │
│           │                                     │               │
│           └─────────────────────────────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Download Format                                         │    │
│  │                                                          │    │
│  │  [PNG]  [SVG]  [PDF]  [JPEG]  [WebP]                    │    │
│  │                                                          │    │
│  │  Size: [256px ▼]     Quality: [High ▼]                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│        ┌────────────────────────────────────────┐               │
│        │         ⬇️  Download QR Code           │               │
│        └────────────────────────────────────────┘               │
│                                                                  │
│  [Copy to Clipboard]    [Print Templates]    [Create Another]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Large, celebratory preview
- Clear format selection
- Primary download button
- Secondary actions (copy, print, create another)
- "Create Another" resets to Step 1

---

## Progress Indicator Design

### Option A: Horizontal Steps (Recommended)
```
  ①───────②───────③───────④
 Type   Content  Style   Download
  ●────────●────────○────────○
```

### Option B: Compact Pills
```
[1 Type ✓] → [2 Content ✓] → [3 Style] → [4 Download]
```

### Behavior:
- Completed steps show checkmark
- Current step is highlighted (orange)
- Future steps are dimmed
- Clicking completed steps allows navigation back
- Clicking future steps is disabled (or shows tooltip)

---

## Mobile Layout

On mobile, the wizard becomes full-screen with swipe gestures:

```
┌─────────────────────────┐
│  ← Step 2 of 4          │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   [QR Preview]    │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Enter your URL         │
│  ┌───────────────────┐  │
│  │ https://...       │  │
│  └───────────────────┘  │
│                         │
│  □ Shorten URL          │
│                         │
│  ┌─────────────────────┐│
│  │    Continue →       ││
│  └─────────────────────┘│
└─────────────────────────┘
     ← Swipe to go back
```

---

## State Management

### New Store Structure

```typescript
interface WizardState {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: Set<number>;
  canAdvance: boolean; // Based on current step validation

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipToDownload: () => void;
  reset: () => void;
}
```

### Validation Rules

| Step | Can Advance When... |
|------|---------------------|
| 1 | A QR type is selected |
| 2 | Required fields are filled and valid |
| 3 | Always (styling is optional) |
| 4 | N/A (terminal step) |

---

## Component Architecture

### New Components

```
src/components/
├── wizard/
│   ├── WizardContainer.tsx    # Main wizard wrapper
│   ├── WizardProgress.tsx     # Step indicator
│   ├── WizardNavigation.tsx   # Back/Next buttons
│   ├── steps/
│   │   ├── StepType.tsx       # Step 1: Type selection
│   │   ├── StepContent.tsx    # Step 2: Input form
│   │   ├── StepCustomize.tsx  # Step 3: Styling
│   │   └── StepDownload.tsx   # Step 4: Export
│   └── WizardPreview.tsx      # Floating preview component
```

### File Changes

| File | Action |
|------|--------|
| `src/App.tsx` | Replace current layout with WizardContainer |
| `src/stores/wizardStore.ts` | NEW - Wizard state management |
| `src/components/wizard/*` | NEW - All wizard components |
| `src/components/TypeSelector.tsx` | Refactor for Step 1 layout |
| `src/components/InputForm.tsx` | Refactor for Step 2 layout |

---

## Animations & Transitions

### Step Transitions
- Slide left when advancing (current exits left, new enters from right)
- Slide right when going back
- Duration: 300ms ease-out

### Progress Indicator
- Smooth width transition as steps complete
- Checkmark animates in with scale + fade

### Preview
- Subtle pulse when content changes
- Celebrate animation on Step 4 (confetti or glow)

---

## Edge Cases

### 1. Direct URL Access
If user lands on `/create?type=wifi`:
- Start at Step 2 with WiFi pre-selected
- Allow going back to Step 1

### 2. Editing Previous Steps
- Going back preserves all entered data
- Changing type in Step 1 warns if data will be lost

### 3. Browser Back Button
- Each step is a pseudo-route (history.pushState)
- Browser back navigates wizard steps

### 4. Page Refresh
- Persist wizard state to sessionStorage
- Restore on refresh with confirmation

---

## Success Metrics

1. **Completion rate** - % of users who reach Step 4
2. **Drop-off points** - Which step loses users
3. **Time to first QR** - How fast users generate their first code
4. **Customization adoption** - % who don't skip Step 3

---

## Implementation Phases

### Phase 1: Core Wizard (MVP)
- [ ] WizardContainer with step state
- [ ] WizardProgress indicator
- [ ] StepType with new card layout
- [ ] StepContent with preview
- [ ] StepDownload with format options
- [ ] Basic navigation (next/back)

### Phase 2: Polish
- [ ] StepCustomize with tabs
- [ ] Skip functionality
- [ ] Step transitions/animations
- [ ] Mobile swipe gestures
- [ ] Browser history integration

### Phase 3: Enhancement
- [ ] Session persistence
- [ ] Analytics tracking
- [ ] Keyboard navigation (Tab through steps)
- [ ] URL parameters support

---

## Open Questions

1. Should Step 1 auto-advance when a type is clicked, or require explicit "Continue"?
2. Should the preview be sticky on scroll, or fixed position?
3. On mobile, should we use a bottom sheet for the preview?
4. Should completed steps be editable inline, or require explicit "Edit" action?

---

## Alternatives Considered

### A. Collapsible Sections (Rejected)
Like an accordion where completed sections collapse. Rejected because:
- Still shows all sections at once
- Doesn't provide clear progression feeling

### B. Single Page with Anchors (Rejected)
Scroll-based with anchor links. Rejected because:
- Harder to track progress
- All content still visible (overwhelming)

### C. Modal Wizard (Rejected)
Wizard in a modal overlay. Rejected because:
- Feels disconnected from the app
- Modal fatigue
- Harder on mobile

---

## Next Steps

1. [ ] Review and approve this PRD
2. [ ] Create wizardStore
3. [ ] Build WizardContainer and WizardProgress
4. [ ] Build StepType (refactor TypeSelector)
5. [ ] Build StepContent (integrate InputForm + Preview)
6. [ ] Build StepDownload
7. [ ] Build StepCustomize (integrate existing tabs)
8. [ ] Add animations and polish
9. [ ] Test on mobile devices
