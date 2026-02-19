# Qrius Codebase Improvement PRD

## Context

After 4 sprints of rapid feature development, the codebase has accumulated dead code, misplaced dependencies, underused libraries, and documentation drift. This PRD addresses these issues to make future development faster, cleaner, and less error-prone — for both human and AI-assisted coding sessions.

**Scope**: Phases 1 + 2 (skip item 1.7 — server dep moves deferred to avoid Vercel risk).

**Status**: Completed February 18, 2026 (commit `929f5f7`)

---

## Phase 1: Quick Wins (Dead Code, Deps, DX)
*Low risk. Each item is one commit.*

### 1.1 Delete `src/App.tsx` (dead code) ✅
- 195 lines never imported anywhere. Router uses `HomePage` for `/`.
- Duplicates all keyboard shortcuts, modals, layout from `HomePage.tsx`.

### 1.2 Delete `src/components/features/BrandKit.tsx` (dead code) ✅
- `BrandKitManager` exported but never imported anywhere.
- Fully replaced by template wizard + migration logic in `templateStore.ts`.

### 1.3 Slim down `settingsStore.ts` ✅
- Remove unused BrandKit CRUD methods: `addBrandKit`, `updateBrandKit`, `deleteBrandKit`, `getBrandKit`, `exportBrandKits`, `importBrandKits`.
- Keep `brandKits` array (read by `templateStore.ts` migration) with `@deprecated` JSDoc.
- Keep `BrandedUrlSettings` and `TrackingSettings` (actively used).
- Files: `src/stores/settingsStore.ts`, `src/types/index.ts` (keep `BrandKit` type — still used by templateStore migration).

### 1.4 Extract `DEFAULT_FREE_PLAN_LIMITS` in `authStore.ts` ✅
- Identical `defaultLimits` object at lines ~425 and ~470.
- Extract to module-level `const DEFAULT_FREE_PLAN_LIMITS: PlanLimits`.
- File: `src/stores/authStore.ts`

### 1.5 Remove dead dependency `@supabase/auth-helpers-react` ✅
- In `package.json` dependencies but never imported in `src/`.
- Run `npm uninstall @supabase/auth-helpers-react`.

### 1.6 Move `@testing-library/dom` to `devDependencies` ✅
- Testing lib in production deps. Run `npm uninstall @testing-library/dom && npm install -D @testing-library/dom`.

### ~~1.7 Move server-only packages~~ — DEFERRED
- Skipped to avoid Vercel Functions risk. Handle separately with preview deploy test.

### 1.8 Fix `package.json` identity ✅
- `"name": "qr-code-generator"` → `"qrius"`
- `"version": "1.0.0"` → `"0.2.0"`

### 1.9 Add `typecheck` npm script ✅
- Add `"typecheck": "tsc -b --noEmit"` to `package.json` scripts.
- Fix CLAUDE.md Known Issues note about missing typecheck script.

---

## Phase 2: Architecture Improvements
*Medium risk. Separate commits per item.*

### 2.1 Add `@/` path alias ✅
- `tsconfig.app.json`: Add `"baseUrl": ".", "paths": { "@/*": ["src/*"] }` to compilerOptions.
- `vite.config.ts`: Add `resolve: { alias: { '@': path.resolve(__dirname, './src') } }`.
- Adopt for new code going forward. Do NOT bulk-convert existing imports in this PR.

### 2.2 Type the Supabase client ✅
- `src/lib/supabase.ts`: Change `createClient(` to `createClient<Database>(`.
- Import `Database` from `../types/database`.
- Added `Relationships` field to all table types in `database.ts` (required by newer supabase-js).
- Run `npm run typecheck` after — surfaced and fixed latent type mismatches.

### 2.3 Adopt TanStack Query (incremental) ✅
- Already installed + `QueryClientProvider` in `main.tsx` but zero components use it.
- **Step 1**: Created `src/hooks/queries/useDashboardStats.ts` using `useQuery`.
- **Step 2**: Converted `DashboardPage.tsx` from `useState`+`useEffect`+raw Supabase to the new hook.
- **Step 3**: Converted `useOrganizationQRCodes` to use `useQuery`+`useMutation`.
- Also updated `src/test/test-utils.tsx` `AllTheProviders` to include `QueryClientProvider`.

### 2.4 Consolidate global modals into `RootLayout` ✅
- Created `src/stores/uiStore.ts` with boolean flags for modal open/close state.
- Moved modal rendering from `HomePage.tsx` into `RootLayout` in `router.tsx`:
  - `ToastContainer` (already global via `toastStore`)
  - `TemplateWizardModal` (already driven by `templateStore.isOpen`)
  - `KeyboardShortcutsModal`, `HistoryModal`, `SettingsModal` (migrated from local `useState` to `uiStore`)
- Removed duplicate modal code from `HomePage.tsx`.
- Removed duplicate `ToastContainer` from `DashboardLayout.tsx`.

### 2.5 Extract shared `PublicFooter` ✅
- `HomePage` and legal pages both rendered their own header/footer.
- Extracted `PublicFooter` component (`src/components/layout/PublicFooter.tsx`) with copyright + legal links + shortcuts button.
- Reused in `HomePage.tsx` and `LegalPageLayout.tsx`.

---

## Verification

After each commit:
1. `npm run test:run` — all 166 tests pass
2. `npm run build` — clean production build
3. `npm run lint` — 0 errors, 0 warnings
4. `npm run typecheck` — no type errors (after 1.9)

After all changes:
5. `npm run dev` — app runs correctly, navigate all routes
6. Verify keyboard shortcuts still work on HomePage
7. Verify dashboard loads with stats
8. Verify template wizard opens/closes correctly

---

## Execution Order

```
1.1 Delete App.tsx
1.2 Delete BrandKit.tsx
1.3 Slim settingsStore.ts
1.4 Extract defaultLimits constant
1.5 Remove dead dep
1.6 Move testing dep
1.8 Fix package.json identity
1.9 Add typecheck script
  ↓
2.1 Path aliases (standalone)
2.2 Typed Supabase client (standalone)
2.3 TanStack Query adoption (after 2.2 + test utils update)
2.4 Modal consolidation (after 1.1)
2.5 PublicLayout extraction (standalone)
```

---

## Results

- **Net change**: -421 lines (385 added, 806 removed) across 20 files
- **Dead code removed**: 453 lines (App.tsx + BrandKit.tsx)
- **New files**: `uiStore.ts`, `useDashboardStats.ts`, `PublicFooter.tsx`
- **All checks green**: 166 tests, 0 lint errors, 0 type errors, clean build
