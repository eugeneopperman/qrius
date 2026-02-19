# Product Requirements Document: Internal QR Code Generator

## Overview

### Purpose
Build an internal QR code generator web application that replicates the core functionality of [qr-code-generator.com](https://www.qr-code-generator.com/) with improved styling and a modern user experience. This tool will enable team members to quickly generate QR codes for various business purposes without relying on external services.

### Goals
- Provide a self-hosted, privacy-focused QR code generation solution
- Support all common QR code types used in business contexts
- Offer extensive customization options (colors, logos, frames)
- Deliver a modern, intuitive UI that surpasses the original
- Enable high-quality exports in multiple formats
- **Differentiate from competitors** with unique features they lack

---

## Competitive Advantages

Based on analysis of competitor weaknesses and user feedback, this application will include the following differentiators:

### 1. URL Shortening Integration
**Problem**: Long URLs create dense, complex QR codes that are harder to scan at small sizes.

**Solution**: Built-in URL shortening before QR generation.
- Integrate with popular URL shorteners (TinyURL, is.gd - no API key required)
- Optional: Self-hosted shortener endpoint for complete privacy
- Toggle: "Shorten URL" checkbox with preview of shortened link
- Benefit: Simpler QR patterns = better scannability at smaller sizes

### 2. Real-Time Scannability Validation
**Problem**: Users create beautiful QR codes that don't scan reliably.

**Solution**: Live scannability score and warnings.
- Analyze contrast ratio between foreground/background
- Detect if logo is too large (>30% coverage)
- Warn about problematic color combinations (e.g., red on green)
- Display confidence score: "Excellent / Good / Warning / Poor"
- Suggest fixes: "Increase contrast" or "Reduce logo size"

### 3. Zero Friction, Zero Cost
**Problem**: Competitors hide features behind paywalls, require accounts, or add watermarks.

**Solution**:
- No account required - ever
- No watermarks on any downloads
- No feature limitations
- No trial periods or upsells
- All processing client-side (true privacy)

### 4. Progressive Web App (PWA)
**Problem**: Competitors require internet connection and can't be "installed."

**Solution**: Full offline capability.
- Install as desktop/mobile app
- Works without internet after first load
- Cached assets for instant loading
- Service worker for offline QR generation

### 5. Built-in QR Code Reader
**Problem**: Users need separate apps to test/verify their QR codes.

**Solution**: Integrated scanner using device camera.
- Test generated QR codes instantly
- Decode any QR code from camera or uploaded image
- Useful for verifying printed materials
- Extract data from existing QR codes

### 6. Brand Kit Management
**Problem**: Users repeatedly configure the same colors/logos for each QR code.

**Solution**: Saveable brand profiles.
- Save multiple brand kits (colors, logos, default styles)
- One-click application of brand settings
- Import/export brand kits as JSON
- Team sharing via file export

### 7. Print-Ready Templates
**Problem**: Users generate QR codes but struggle with print layout.

**Solution**: Pre-designed print templates.
- Business card layouts (with QR placement guides)
- Table tent / stand-up displays
- Poster templates (A4, Letter, A3)
- Sticker sheets
- All templates export as print-ready PDF with bleed marks

### 8. Accessibility Features
**Problem**: QR codes are inherently inaccessible to visually impaired users.

**Solution**: Best-practice accessibility support.
- Always display fallback short URL below QR code
- High contrast mode for UI
- Screen reader friendly interface
- Keyboard shortcuts for power users
- Alt text generation for exported images

### 9. Keyboard Shortcuts
**Problem**: Repetitive mouse navigation slows down power users.

**Solution**: Comprehensive keyboard shortcuts.
- `Ctrl/Cmd + 1-9`: Switch QR type
- `Ctrl/Cmd + S`: Download (default format)
- `Ctrl/Cmd + Shift + S`: Download with format picker
- `Ctrl/Cmd + C`: Copy to clipboard
- `Ctrl/Cmd + D`: Toggle dark mode
- `?`: Show keyboard shortcut overlay

### 10. Smart Defaults & Presets
**Problem**: Competitors require extensive configuration for common use cases.

**Solution**: Intelligent defaults and one-click presets.
- "WiFi Guest Network" preset (common settings pre-filled)
- "Business Card" preset (vCard with sensible defaults)
- "Marketing Campaign" preset (URL + frame + CTA)
- Auto-detect and format phone numbers
- Smart URL validation and protocol addition

---

## Functional Requirements

### 1. QR Code Types

The application must support the following QR code content types:

| Type | Description | Fields Required |
|------|-------------|-----------------|
| **URL** | Link to any website | URL, optional shortening toggle |
| **Text** | Plain text content | Text content |
| **Email** | Pre-filled email composition | Email address, subject (optional), body (optional) |
| **Phone** | Direct phone call | Phone number |
| **SMS** | Pre-filled text message | Phone number, message (optional) |
| **WiFi** | WiFi network credentials | SSID, password, encryption type (WPA/WEP/None), hidden network flag |
| **vCard** | Contact information | Name, organization, title, phone, email, address, website, notes |
| **Event** | Calendar event | Title, location, start date/time, end date/time, description |
| **Location** | Geographic coordinates | Latitude, longitude (or address lookup) |

### 2. URL Shortening

Reduce QR code complexity by shortening URLs before encoding.

#### 2.1 Shortening Options
| Provider | API Key Required | Rate Limit | Privacy |
|----------|------------------|------------|---------|
| **TinyURL** | No | Generous | Moderate |
| **is.gd** | No | 10/min | Moderate |
| **Custom Endpoint** | N/A | Unlimited | Full (self-hosted) |

#### 2.2 User Flow
1. User enters long URL
2. "Shorten URL" toggle appears (default: off)
3. When enabled:
   - Original URL displayed with character count
   - Shortened URL displayed below
   - QR preview updates to use shortened URL
   - Visual indicator shows complexity reduction
4. User can copy shortened URL separately
5. Fallback: If shortening fails, use original URL with warning

#### 2.3 Configuration
- Default shortening provider (configurable in settings)
- Option to add custom shortening endpoint
- Automatic shortening for URLs > 100 characters (optional)

### 3. Customization Options

#### 3.1 Colors
- **Foreground color**: QR code pattern color (default: black)
- **Background color**: QR code background (default: white)
- **Gradient support**: Linear/radial gradients for foreground
- **Color presets**: Pre-defined brand color palettes
- **Color picker**: Full RGB/HEX color selection (#RRGGBB - 16,777,216 colors)

#### 3.2 Logo/Image
- **Logo upload**: Support PNG, JPG, SVG formats
- **Logo positioning**: Centered (default), with automatic QR pattern adjustment
- **Logo sizing**: Adjustable size (10-30% of QR code)
- **Logo background**: Optional padding/background behind logo
- **Logo shape**: Square, rounded, circular mask options

#### 3.3 QR Code Style
- **Pattern style**: Square (classic), rounded, dots, extra-rounded
- **Corner squares style**: Square, rounded, extra-rounded, dot
- **Corner dots style**: Square, dot
- **Error correction level**: L (7%), M (15%), Q (25%), H (30%)

#### 3.4 Frames & Labels
- **Frame templates**: Pre-designed frames with call-to-action
- **Custom text labels**: "Scan Me", "Learn More", custom text
- **Label positioning**: Top, bottom
- **Label styling**: Font, color, size

### 4. Export Options

| Format | Use Case | Quality |
|--------|----------|---------|
| **PNG** | Web, digital use | Configurable resolution (300-3000px) |
| **SVG** | Scalable, print | Vector format |
| **PDF** | Print-ready documents | Vector with optional bleed |
| **JPG** | Universal compatibility | Configurable quality (70-100%) |

### 5. User Interface Features

#### 5.1 Main Generator View
- **Type selector**: Visual cards/tabs for QR code types
- **Input form**: Dynamic form based on selected type
- **Live preview**: Real-time QR code preview as user inputs data
- **Customization panel**: Collapsible sidebar for styling options
- **Download button**: Prominent, with format dropdown

#### 5.2 Additional Features
- **History**: Local storage of recently generated QR codes (last 20)
- **Templates**: Save and load custom style presets
- **Batch generation**: Generate multiple QR codes from CSV upload
- **Copy to clipboard**: Quick copy as image
- **Dark mode**: System-preference-aware theme switching

#### 5.3 Differentiating Features
- **URL Shortening**: One-click URL shortening before QR generation
- **Scannability Score**: Real-time validation with confidence indicator
- **QR Code Reader**: Built-in scanner to test/decode QR codes
- **Brand Kit**: Save and apply company colors, logos, and styles
- **Print Templates**: Pre-designed layouts for business cards, posters, stickers
- **Keyboard Shortcuts**: Full keyboard navigation for power users
- **PWA Support**: Installable, works offline after first load
- **Fallback URL Display**: Accessibility feature showing URL below QR code

---

## Non-Functional Requirements

### Performance
- QR code generation: < 100ms
- Preview update: < 50ms (debounced input)
- Initial page load: < 2 seconds
- Export generation: < 500ms

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Security
- All processing client-side (no data sent to servers)
- No external API dependencies for core functionality
- CSP-compliant implementation
- XSS prevention

---

## Technical Architecture

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 18+ with TypeScript | Component reusability, type safety |
| **Build Tool** | Vite | Fast development, optimized builds |
| **Styling** | Tailwind CSS | Rapid styling, consistent design |
| **QR Generation** | qrcode.react + qr-code-styling | Customizable QR generation |
| **State Management** | Zustand | Lightweight, simple API |
| **Icons** | Lucide React | Modern, consistent iconography |
| **File Export** | html-to-image, jspdf | Multi-format export support |

### Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── Slider.tsx
│   │   ├── Tabs.tsx
│   │   ├── Card.tsx
│   │   ├── Toggle.tsx
│   │   └── Modal.tsx
│   ├── qr-types/              # QR type input forms
│   │   ├── UrlForm.tsx
│   │   ├── TextForm.tsx
│   │   ├── EmailForm.tsx
│   │   ├── PhoneForm.tsx
│   │   ├── SmsForm.tsx
│   │   ├── WifiForm.tsx
│   │   ├── VCardForm.tsx
│   │   ├── EventForm.tsx
│   │   └── LocationForm.tsx
│   ├── customization/         # Styling controls
│   │   ├── ColorSection.tsx
│   │   ├── LogoSection.tsx
│   │   ├── StyleSection.tsx
│   │   └── FrameSection.tsx
│   ├── features/              # Differentiating features
│   │   ├── UrlShortener.tsx   # URL shortening toggle & preview
│   │   ├── ScannabilityScore.tsx  # Real-time scan validation
│   │   ├── QRReader.tsx       # Built-in QR code scanner
│   │   ├── BrandKit.tsx       # Brand profile management
│   │   ├── PrintTemplates.tsx # Print-ready template selector
│   │   └── KeyboardShortcuts.tsx  # Shortcut overlay
│   ├── QRPreview.tsx          # Live QR code preview
│   ├── ExportPanel.tsx        # Download options
│   ├── TypeSelector.tsx       # QR type selection
│   └── Header.tsx             # App header
├── hooks/
│   ├── useQRGenerator.ts      # QR generation logic
│   ├── useExport.ts           # Export functionality
│   ├── useHistory.ts          # Local storage history
│   ├── useUrlShortener.ts     # URL shortening API integration
│   ├── useScannability.ts     # Scannability analysis
│   ├── useBrandKit.ts         # Brand kit management
│   └── useKeyboardShortcuts.ts # Keyboard shortcut handling
├── stores/
│   ├── qrStore.ts             # QR configuration state
│   └── settingsStore.ts       # App settings & brand kits
├── utils/
│   ├── qrDataGenerators.ts    # QR data string builders
│   ├── validators.ts          # Input validation
│   ├── exporters.ts           # Export format handlers
│   ├── urlShorteners.ts       # Shortener API clients
│   ├── scannabilityAnalyzer.ts # Contrast & complexity analysis
│   └── printTemplates.ts      # PDF template generators
├── services/
│   └── qrScanner.ts           # Camera-based QR reading
├── types/
│   └── index.ts               # TypeScript interfaces
├── styles/
│   └── globals.css            # Global styles, Tailwind
├── App.tsx                    # Main application
├── main.tsx                   # Entry point
└── sw.ts                      # Service worker for PWA/offline
```

---

## UI/UX Design Specifications

### Design Principles
1. **Clean & Modern**: Minimalist interface with ample whitespace
2. **Intuitive Flow**: Left-to-right workflow (Type → Input → Customize → Export)
3. **Visual Feedback**: Real-time preview, hover states, loading indicators
4. **Responsive**: Mobile-first, fully functional on all screen sizes

### Color Palette
```
Primary:      #6366F1 (Indigo)
Secondary:    #8B5CF6 (Purple)
Accent:       #06B6D4 (Cyan)
Success:      #10B981 (Emerald)
Warning:      #F59E0B (Amber)
Error:        #EF4444 (Red)
Background:   #FAFAFA (Light) / #0F172A (Dark)
Surface:      #FFFFFF (Light) / #1E293B (Dark)
Text:         #1F2937 (Light) / #F1F5F9 (Dark)
```

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo + Title + Theme Toggle + History                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  QR Type Selector (Horizontal tabs/cards)                │   │
│  │  [URL] [Text] [Email] [Phone] [SMS] [WiFi] [vCard] ...  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │                         │  │                             │  │
│  │   Input Form            │  │   QR Code Preview           │  │
│  │   (Dynamic based on     │  │   (Live updating)           │  │
│  │    selected type)       │  │                             │  │
│  │                         │  │   ┌─────────────────────┐   │  │
│  │   [URL Input]           │  │   │                     │   │  │
│  │   [Validate Button]     │  │   │    QR CODE          │   │  │
│  │                         │  │   │    PREVIEW          │   │  │
│  ├─────────────────────────┤  │   │                     │   │  │
│  │                         │  │   └─────────────────────┘   │  │
│  │   Customization         │  │                             │  │
│  │   (Collapsible)         │  │   [Download ▼] [Copy]       │  │
│  │                         │  │                             │  │
│  │   ▸ Colors              │  └─────────────────────────────┘  │
│  │   ▸ Logo                │                                   │
│  │   ▸ Style               │                                   │
│  │   ▸ Frame               │                                   │
│  │                         │                                   │
│  └─────────────────────────┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (Core Functionality)
**Deliverables:**
- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Basic UI layout and components
- [ ] URL QR code generation with live preview
- [ ] Basic PNG/SVG export
- [ ] Color customization (foreground/background)

### Phase 2: QR Types (Content Types)
**Deliverables:**
- [ ] Text QR code type
- [ ] Email QR code type
- [ ] Phone QR code type
- [ ] SMS QR code type
- [ ] WiFi QR code type
- [ ] vCard QR code type
- [ ] Event QR code type
- [ ] Location QR code type

### Phase 3: Advanced Customization
**Deliverables:**
- [ ] Logo upload and positioning
- [ ] Pattern/corner style options
- [ ] Frame templates and labels
- [ ] Gradient colors
- [ ] Error correction level selection

### Phase 4: Competitive Differentiators
**Deliverables:**
- [ ] URL shortening integration (TinyURL, is.gd)
- [ ] Real-time scannability scoring and warnings
- [ ] QR code reader (camera + image upload)
- [ ] Brand kit management (save/load profiles)
- [ ] Keyboard shortcuts system
- [ ] Fallback URL display option

### Phase 5: Polish & Extended Features
**Deliverables:**
- [ ] Dark mode support
- [ ] History (local storage)
- [ ] Templates/presets
- [ ] Batch generation
- [ ] PDF export with print templates
- [ ] Mobile responsive refinement
- [ ] PWA setup (service worker, manifest, offline support)

### Phase 6: Quality Assurance
**Deliverables:**
- [ ] Cross-browser testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Scannability testing across devices
- [ ] Documentation

---

## Success Metrics

| Metric | Target |
|--------|--------|
| QR Code Generation Speed | < 100ms |
| Page Load Time | < 2s |
| All QR Types Functional | 9/9 types |
| Export Formats Available | 4 formats (PNG, SVG, PDF, JPG) |
| Browser Compatibility | 4 major browsers |
| Accessibility Score | WCAG 2.1 AA |
| URL Shortening Success Rate | > 99% |
| Scannability Detection Accuracy | > 95% |
| PWA Lighthouse Score | > 90 |
| Offline Functionality | Full QR generation without network |

---

## Dependencies & Libraries

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "qr-code-styling": "^1.6.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.300.0",
    "html-to-image": "^1.11.0",
    "jspdf": "^2.5.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "html5-qrcode": "^2.3.0",
    "idb-keyval": "^6.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "workbox-core": "^7.0.0",
    "workbox-precaching": "^7.0.0"
  }
}
```

### Additional Library Notes

| Library | Purpose |
|---------|---------|
| `html5-qrcode` | QR code scanning via camera/image upload |
| `idb-keyval` | IndexedDB wrapper for offline storage (brand kits, history) |
| `vite-plugin-pwa` | PWA generation with service worker |
| `workbox-*` | Advanced service worker caching strategies |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| QR code library limitations | Medium | Use qr-code-styling for flexibility; fallback to qrcode.react |
| Logo sizing affects scannability | High | Enforce max logo size (30%); use high error correction |
| Large file exports slow | Low | Web workers for heavy processing; progress indicators |
| Browser compatibility issues | Medium | Feature detection; graceful degradation |
| URL shortener API rate limits | Medium | Multiple provider fallbacks; caching shortened URLs |
| URL shortener service downtime | Low | Graceful fallback to original URL; clear user messaging |
| Camera access denied for QR reader | Low | Image upload alternative; clear permission messaging |
| Scannability false positives/negatives | Medium | Conservative thresholds; "test scan" as final verification |
| PWA caching stale assets | Low | Version-based cache busting; update prompts |

---

## References

### Primary Competitors
- [QR Code Generator](https://www.qr-code-generator.com/) - Primary reference (rated 1.6/5 on Trustpilot due to pricing issues)
- [QRCode Monkey](https://www.qrcode-monkey.com/) - Customization reference
- [goQR.me](https://goqr.me/) - Format reference
- [QRCodeChimp](https://www.qrcodechimp.com/) - Feature innovation reference

### Technical Resources
- [qr-code-styling](https://github.com/AresEkb/qr-code-styling) - Primary QR library
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - QR scanning library
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) - PWA implementation

### Research & Trends
- [QR Code Trends 2026](https://qrcodekit.com/news/qr-code-trends/) - Future trends
- [AI-Powered QR Codes](https://qrcodemyurl.com/ai-powered-qr-codes-next%E2%80%91gen-customization-and-security-trends/) - Innovation trends
- [Best QR Generators 2025](https://open.online.uga.edu/inspire/part/7-best-qr-code-generators-of-2025-all-features-compared/) - Feature comparison

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Design Lead | | | |

---

*Document Version: 1.1*
*Created: January 2026*
*Last Updated: January 2026*
