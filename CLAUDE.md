# QR Code Generator - Claude Context

## Project Overview
Internal QR code generator app replicating qr-code-generator.com with better styling and additional features.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persist middleware
- **QR Generation**: qr-code-styling
- **QR Reading**: html5-qrcode
- **PWA**: vite-plugin-pwa

## Project Structure
```
src/
├── components/
│   ├── customization/    # Color, Logo, Style, Frame sections
│   ├── features/         # ScannabilityScore, QRReader, BrandKit, PrintTemplates
│   ├── qr-types/         # Form components for each QR type
│   └── ui/               # Button, Accordion, reusable components
├── hooks/                # useUrlShortener, useKeyboardShortcuts
├── stores/               # qrStore, settingsStore (Zustand)
├── types/                # TypeScript interfaces
└── utils/                # cn, scannabilityAnalyzer, urlShorteners
```

## Key Features Implemented
1. **9 QR Code Types**: URL, Text, Email, Phone, SMS, WiFi, vCard, Event, Location
2. **Customization**: Colors, logos, dot/corner patterns, frames with labels
3. **URL Shortening**: TinyURL and is.gd integration
4. **Scannability Scoring**: Real-time contrast and readability analysis
5. **QR Reader**: Camera scanning and image upload
6. **Brand Kits**: Save, apply, export/import style presets
7. **Print Templates**: 8 predefined sizes (business card to A4 poster)
8. **PWA**: Offline support, installable app
9. **Keyboard Shortcuts**: Ctrl+S (download), Ctrl+C (copy), etc.

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Development Notes
- QRPreview uses forwardRef/useImperativeHandle for keyboard shortcut integration
- QRReader is lazy-loaded for code splitting (~335KB saved on initial load)
- Brand kits persist to localStorage via zustand/persist
- Dark mode toggles via `document.documentElement.classList.toggle('dark')`

## Known Issues
- Mobile testing requires network access (use `npm run dev -- --host 0.0.0.0`)
- PWA icons are placeholder solid colors (can be replaced with proper branded icons)
