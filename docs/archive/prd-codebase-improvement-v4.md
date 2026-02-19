# Codebase Improvement V4 PRD

**Status:** Complete
**Created:** 2026-02-19
**Completed:** 2026-02-19

## Overview
V3 PRD fully complete (all 14 items shipped). V4 addresses remaining improvements across security, performance, accessibility, dead code cleanup, logging hygiene, and test coverage.

## Sprint 1: Security & Correctness (Quick Wins)
- [x] 1. Fix CORS bypass in `api/api-keys/[id].ts`
- [x] 2. Check Supabase errors in Stripe webhook handlers
- [x] 3. Guard console statements in `authStore.ts`
- [x] 4. Guard remaining console statements in feature components

## Sprint 2: Dead Code & Cleanup
- [x] 5. Remove dead exports from `ErrorBoundary.tsx`
- [x] 6. Remove dead roundness post-processing code path
- [x] 7. Remove dead `ExportOptions` type
- [x] 8. Remove unused `useFormFields` (plural) — deleted entirely
- [x] 9. Remove dead `notifySubscriptionCanceled` — deleted
- [x] 10. Remove dead `BrandedShortenerProvider` type
- [x] 11. Unexport internal-only types

## Sprint 3: Performance
- [x] 12. Add `useShallow` selectors to `useAuthStore()` consumers (18 calls across 15 files)
- [x] 13. Add `useMemo` to `QRCodeList` filter+sort
- [x] 14. Add `React.memo` to `QRCodeCard` (TemplateCard already had memo, ToastItem internal)

## Sprint 4: Accessibility
- [x] 15. Add ARIA attributes to `Dropdown.tsx`
- [x] 16. Add `aria-pressed` to `SelectButtonGroup.tsx`
- [x] 17. Replace inline delete dialog in `DashboardPage` with `ConfirmDialog`
- [x] 18. Add `aria-label`/`aria-pressed` to QRCodeList view toggle buttons

## Sprint 5: API Logging Consistency
- [x] 19. Migrate API routes from `console.error` to `logger` (6 files; Edge function `r/[shortCode].ts` excluded — can't import Node.js logger)

## Sprint 6: Test Coverage Expansion
- [x] 20. Add tests for pure utility functions (`qrRoundness`, `gradientUtils`) — 23 new tests
- [x] 21. Add tests for `historyStore.ts` — 25 new tests
- [x] 22. Add tests for `useFormField.ts` — 6 new tests

## Results
- **Tests**: 378 → 432 (54 new tests across 4 new test files)
- **Test files**: 13 → 17
- **Typecheck**: Clean
- **Build**: Success
- **Lint**: Clean (pre-existing Storybook warnings only)
