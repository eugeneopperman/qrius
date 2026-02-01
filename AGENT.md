# Agent Instructions for Qrius

## Project Context

Qrius is a SaaS QR code generator that evolved from a client-side tool to a full multi-tenant platform. When working on this codebase, understand that it serves two user types:

1. **Anonymous users** - Can use the QR generator on the home page without signing up
2. **Authenticated users** - Have access to dashboard, tracking, team features, and API

## Architecture Decisions

### Why Supabase Auth (not Clerk/Auth0/NextAuth)
- Native Postgres integration works with existing Neon database
- Row Level Security (RLS) provides data isolation at the database level
- Free tier supports 50K MAUs - suitable for early-stage SaaS
- Built-in email templates and OAuth provider management

### Why TanStack Router (not React Router)
- Type-safe routing with full TypeScript inference
- Built-in code splitting with lazy routes
- Search params type safety
- Better integration with TanStack Query for data loading

### Why Zustand (not Redux/Jotai/Context)
- Already used in the original codebase - maintaining consistency
- Simple API with good TypeScript support
- Built-in persist middleware for localStorage sync
- Multiple independent stores (auth, qr, template, theme, etc.)

### Database Strategy
- **Supabase** for auth and user data (uses its built-in Postgres)
- **Neon** for QR tracking data (already configured via Vercel)
- Both are Postgres - could consolidate to one in future
- Redis (Upstash) for caching redirect lookups

## Key Patterns

### Authentication Flow
```
User clicks Sign In → AuthModal opens → Supabase handles auth
→ onAuthStateChange fires → authStore updates → UI re-renders
→ Protected routes check authStore.user before rendering
```

### Organization Context
```
User signs up → Trigger creates user + personal org + membership
→ authStore.fetchOrganizations() loads memberships
→ currentOrganization set in store → All API calls scoped to org
```

### API Authentication
```typescript
// Browser requests use JWT from Supabase session
Authorization: Bearer <supabase_access_token>

// Programmatic requests use API keys
X-Api-Key: qr_<prefix>_<secret>
```

## File Naming Conventions

- **Pages**: `src/pages/XxxPage.tsx` (PascalCase with Page suffix)
- **Components**: `src/components/category/ComponentName.tsx`
- **Stores**: `src/stores/xxxStore.ts` (camelCase with Store suffix)
- **Hooks**: `src/hooks/useXxx.ts` (camelCase with use prefix)
- **API routes**: `api/resource/index.ts` or `api/resource/[param].ts`

## Common Tasks

### Adding a New Protected Page
1. Create page component in `src/pages/`
2. Add route in `src/router.tsx` with `beforeLoad: requireAuth`
3. Use `DashboardLayout` wrapper for consistent UI

### Adding a New API Endpoint
1. Create handler in `api/` directory
2. Import auth helpers from `api/_lib/auth.ts`
3. Use `authenticate()` for flexible auth or `requireAuth()` for JWT-only
4. Check plan limits with `checkPlanLimit()` if needed

### Modifying Database Schema
1. Write migration SQL
2. Run in Supabase SQL Editor
3. Update types in `src/types/database.ts`
4. Update RLS policies if needed

## Testing Strategy

- **Unit tests**: Vitest for stores, hooks, utilities
- **Component tests**: Testing Library for UI components
- **E2E tests**: Playwright for critical user flows
- **API tests**: Manual testing via REST client (Postman/Insomnia)

## Environment Setup

Required services:
1. **Supabase** - Auth and user database
2. **Neon** - QR tracking database (via Vercel integration)
3. **Upstash** - Redis caching (via Vercel integration)
4. **Stripe** - Billing (optional for development)

## Debugging Tips

### Auth Issues
- Check Supabase Dashboard → Authentication → Users
- Verify redirect URLs in Supabase → Authentication → URL Configuration
- Check browser console for Supabase client errors
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Database Issues
- Check RLS policies aren't blocking queries
- Use Supabase Dashboard → SQL Editor to test queries directly
- Verify the `handle_new_user` trigger exists and works

### API Issues
- Check Vercel function logs for errors
- Verify environment variables are set in Vercel dashboard
- Test with `curl` to isolate frontend vs backend issues

## Performance Considerations

- QR Reader is lazy-loaded (~335KB savings)
- Dashboard pages are code-split via TanStack Router
- Redis caching for redirect lookups (24-hour TTL)
- Use `@tanstack/react-query` for data fetching with caching

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- API keys are hashed before storage (SHA-256)
- IP addresses are hashed for privacy in scan logs
- RLS policies enforce data isolation at database level
- CORS headers set on all API routes
