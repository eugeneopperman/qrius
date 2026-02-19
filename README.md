# Qrius

Full-featured SaaS QR code generator with user authentication, multi-tenancy, subscription billing, and API access.

**Live:** [design-sandbox-theta.vercel.app](https://design-sandbox-theta.vercel.app)

## Quick Start

```bash
# Clone and install
git clone <repo-url> && cd Qrius
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase, Stripe, and database credentials

# Start development server
npm run dev
```

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **Routing:** TanStack Router (type-safe, code-split)
- **State:** Zustand (persist middleware) + TanStack Query (server state)
- **Auth:** Supabase Auth (email/password + OAuth)
- **Database:** Supabase Postgres (users/orgs) + Neon Postgres (QR/scans)
- **Payments:** Stripe (Free / Pro / Business tiers)
- **Serverless:** Vercel Functions
- **QR Engine:** qr-code-styling + html5-qrcode (reader)

## Commands

```bash
npm run dev            # Development server
npm run build          # Production build
npm run test:run       # Run tests once
npm run test           # Tests in watch mode
npm run lint           # ESLint
npm run typecheck      # TypeScript checking
npm run storybook      # Component docs
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Full project reference (structure, schema, routes, env vars, conventions)
- **[docs/](./docs/)** — Active PRDs and reference runbooks
- **[docs/archive/](./docs/archive/)** — Completed PRDs and historical documents

## Status

Beta v0.05 — 354 unit tests passing, deployed to Vercel production.
