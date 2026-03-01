# Subdomain Split Deployment Guide

Steps to activate the `qrius.app` / `app.qrius.app` subdomain split after purchasing the domain.

## Prerequisites

- Domain purchased (e.g. `qrius.app`)
- DNS access (registrar or Cloudflare)
- Vercel project dashboard access
- Supabase project dashboard access

## Steps

### 1. Add root domain to Vercel

1. Go to Vercel dashboard > Project > Settings > Domains
2. Add `qrius.app`
3. Vercel will provide DNS records — add them at your registrar:
   - `A` record: `76.76.21.21`
   - `AAAA` record (if offered)
   - Or `CNAME` to `cname.vercel-dns.com` (for apex, some registrars need ALIAS/ANAME)

### 2. Add app subdomain to Vercel

1. In the same Domains settings, add `app.qrius.app`
2. Add a `CNAME` record at your registrar:
   - `app` → `cname.vercel-dns.com`
3. Wait for DNS propagation (usually minutes, can take up to 48h)

### 3. Set environment variable

1. Vercel dashboard > Project > Settings > Environment Variables
2. Add: `VITE_BASE_DOMAIN` = `qrius.app` (Production + Preview)
3. Redeploy: `npx vercel --prod --force` or push a commit

### 4. Update Supabase redirect URLs

1. Supabase dashboard > Authentication > URL Configuration
2. Add to "Redirect URLs":
   - `https://qrius.app/auth/callback`
   - `https://qrius.app/auth/reset-password`
3. Optionally remove old `design-sandbox-theta.vercel.app` entries if retiring that domain

### 5. Verify

- Visit `https://qrius.app` — should show landing page
- Sign in — should redirect to `https://app.qrius.app/dashboard`
- Visit `https://app.qrius.app` unauthenticated — should redirect to `https://qrius.app/signin`
- Sign out on `app.qrius.app` — should redirect to `https://qrius.app`
- OAuth flow (Google/GitHub) — callback on root domain, then redirect to app subdomain
- Type selection on landing → auth → redirect to `app.qrius.app/create` with type pre-selected

## How it works

- `VITE_BASE_DOMAIN` activates runtime subdomain detection in `src/lib/domain.ts`
- Auth sessions are shared via cookies scoped to `.qrius.app` (parent domain)
- Existing localStorage sessions are auto-migrated to cookies on first visit
- When the env var is unset, everything runs on a single origin (local dev unchanged)

## Rollback

To disable the subdomain split, remove `VITE_BASE_DOMAIN` from Vercel env vars and redeploy. The app reverts to single-origin behavior immediately.
