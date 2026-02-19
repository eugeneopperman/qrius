# PRD: Market-Ready V5

## Overview
V4 PRD (22 items) is fully shipped. This plan addresses design system consistency, component reuse, navigation bugs, fake/broken UI elements, brand polish, accessibility, and test coverage.

## Sprint 1: Design System — Form Component Consistency
1. Align Textarea with `.input` CSS class
2. Align Select with `.input` CSS class
3. Fix Toggle brand color (indigo → orange)
4. Fix Slider brand color (indigo → orange)
5. Standardize label styling across form components

## Sprint 2: Component Reuse — Replace Raw HTML with UI Components
6. Replace raw `<textarea>` in EmailForm with Textarea component
7. Replace raw `<textarea>` in SmsForm with Textarea component
8. Replace raw checkbox in WifiForm with Toggle
9. Replace raw range input in ColorSection with Slider
10. Fix indigo selection indicators in ColorSection
11. Refactor auth form label pattern — add `leftIcon` prop to Input

## Sprint 3: Navigation & Routing
12. Replace `<a href>` with `<Link to>` in auth forms
13. Replace `<a href>` with `<Link to>` in QRCodeCard
14. Replace `<a href>` with `<Link to>` in QRCodeList
15. Add 404 Not Found page

## Sprint 4: Remove Fake Data & Fix Broken Buttons
16. Remove hardcoded fake stats from QuickStats
17. Remove fake "Today" stat from QRCodeDetailPage
18. Wire or disable "Download QR Code" button on QRCodeDetailPage
19. Wire or disable broken buttons on ProfileSettingsPage

## Sprint 5: Brand & Logo Consistency
20. Unify logo rendering — create `<Logo>` component
21. Replace QRCodeCard menu with Dropdown component

## Sprint 6: Accessibility Polish
22. Add `scope="col"` to QRCodeList table headers
23. Add search debounce to QRCodeList

## Sprint 7: QR Preview Placeholders
24. Show actual QR thumbnail in QRCodeCard
25. Show actual QR preview on QRCodeDetailPage

## Sprint 8: Tests & Storybook for New Components
26. Storybook stories for Textarea
27. Storybook stories for Select
28. Storybook story for Logo
29. Storybook story for NotFoundPage

## Status
- [x] Sprint 1 (items 1-5) — Shipped
- [x] Sprint 2 (items 6-11) — Shipped
- [x] Sprint 3 (items 12-15) — Shipped
- [x] Sprint 4 (items 16-19) — Shipped
- [x] Sprint 5 (items 20-21) — Shipped
- [x] Sprint 6 (items 22-23) — Shipped
- [x] Sprint 7 (items 24-25) — Shipped
- [x] Sprint 8 (items 26-29) — Shipped
