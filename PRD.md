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

---

## Functional Requirements

### 1. QR Code Types

The application must support the following QR code content types:

| Type | Description | Fields Required |
|------|-------------|-----------------|
| **URL** | Link to any website | URL |
| **Text** | Plain text content | Text content |
| **Email** | Pre-filled email composition | Email address, subject (optional), body (optional) |
| **Phone** | Direct phone call | Phone number |
| **SMS** | Pre-filled text message | Phone number, message (optional) |
| **WiFi** | WiFi network credentials | SSID, password, encryption type (WPA/WEP/None), hidden network flag |
| **vCard** | Contact information | Name, organization, title, phone, email, address, website, notes |
| **Event** | Calendar event | Title, location, start date/time, end date/time, description |
| **Location** | Geographic coordinates | Latitude, longitude (or address lookup) |

### 2. Customization Options

#### 2.1 Colors
- **Foreground color**: QR code pattern color (default: black)
- **Background color**: QR code background (default: white)
- **Gradient support**: Linear/radial gradients for foreground
- **Color presets**: Pre-defined brand color palettes
- **Color picker**: Full RGB/HEX color selection (#RRGGBB - 16,777,216 colors)

#### 2.2 Logo/Image
- **Logo upload**: Support PNG, JPG, SVG formats
- **Logo positioning**: Centered (default), with automatic QR pattern adjustment
- **Logo sizing**: Adjustable size (10-30% of QR code)
- **Logo background**: Optional padding/background behind logo
- **Logo shape**: Square, rounded, circular mask options

#### 2.3 QR Code Style
- **Pattern style**: Square (classic), rounded, dots, extra-rounded
- **Corner squares style**: Square, rounded, extra-rounded, dot
- **Corner dots style**: Square, dot
- **Error correction level**: L (7%), M (15%), Q (25%), H (30%)

#### 2.4 Frames & Labels
- **Frame templates**: Pre-designed frames with call-to-action
- **Custom text labels**: "Scan Me", "Learn More", custom text
- **Label positioning**: Top, bottom
- **Label styling**: Font, color, size

### 3. Export Options

| Format | Use Case | Quality |
|--------|----------|---------|
| **PNG** | Web, digital use | Configurable resolution (300-3000px) |
| **SVG** | Scalable, print | Vector format |
| **PDF** | Print-ready documents | Vector with optional bleed |
| **JPG** | Universal compatibility | Configurable quality (70-100%) |

### 4. User Interface Features

#### 4.1 Main Generator View
- **Type selector**: Visual cards/tabs for QR code types
- **Input form**: Dynamic form based on selected type
- **Live preview**: Real-time QR code preview as user inputs data
- **Customization panel**: Collapsible sidebar for styling options
- **Download button**: Prominent, with format dropdown

#### 4.2 Additional Features
- **History**: Local storage of recently generated QR codes (last 20)
- **Templates**: Save and load custom style presets
- **Batch generation**: Generate multiple QR codes from CSV upload
- **Copy to clipboard**: Quick copy as image
- **Dark mode**: System-preference-aware theme switching

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
│   │   └── Card.tsx
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
│   ├── QRPreview.tsx          # Live QR code preview
│   ├── ExportPanel.tsx        # Download options
│   ├── TypeSelector.tsx       # QR type selection
│   └── Header.tsx             # App header
├── hooks/
│   ├── useQRGenerator.ts      # QR generation logic
│   ├── useExport.ts           # Export functionality
│   └── useHistory.ts          # Local storage history
├── stores/
│   └── qrStore.ts             # Global state management
├── utils/
│   ├── qrDataGenerators.ts    # QR data string builders
│   ├── validators.ts          # Input validation
│   └── exporters.ts           # Export format handlers
├── types/
│   └── index.ts               # TypeScript interfaces
├── styles/
│   └── globals.css            # Global styles, Tailwind
├── App.tsx                    # Main application
└── main.tsx                   # Entry point
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

### Phase 4: Polish & Features
**Deliverables:**
- [ ] Dark mode support
- [ ] History (local storage)
- [ ] Templates/presets
- [ ] Batch generation
- [ ] PDF export
- [ ] Mobile responsive refinement

### Phase 5: Quality Assurance
**Deliverables:**
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Performance optimization
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
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| QR code library limitations | Medium | Use qr-code-styling for flexibility; fallback to qrcode.react |
| Logo sizing affects scannability | High | Enforce max logo size (30%); use high error correction |
| Large file exports slow | Low | Web workers for heavy processing; progress indicators |
| Browser compatibility issues | Medium | Feature detection; graceful degradation |

---

## References

- [QR Code Generator](https://www.qr-code-generator.com/) - Primary reference
- [QRCode Monkey](https://www.qrcode-monkey.com/) - Customization reference
- [goQR.me](https://goqr.me/) - Format reference
- [qr-code-styling](https://github.com/AresEkb/qr-code-styling) - Primary QR library

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Design Lead | | | |

---

*Document Version: 1.0*
*Created: January 2026*
*Last Updated: January 2026*
