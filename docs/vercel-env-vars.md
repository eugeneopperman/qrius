# Vercel Environment Variables Setup

Quick reference for setting up environment variables in Vercel for production deployment.

## How to Add Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable below:
   - Enter the **Name** and **Value**
   - Select appropriate **Environment** (Production, Preview, Development)
   - Click **Save**

## Required Variables

### Supabase (Required)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | All | `https://[project-ref].supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | All | Public anon key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Service role key (keep secret!) |

### App Configuration (Required)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `APP_URL` | Production | `https://your-domain.com` |
| `APP_URL` | Preview | `https://your-project-preview.vercel.app` |
| `APP_URL` | Development | `http://localhost:5173` |

## Payment Variables (Stripe)

### Test Mode (for Preview/Development)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Preview, Development | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Preview, Development | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Preview, Development | Test webhook secret |
| `STRIPE_PRICE_PRO` | Preview, Development | Test price ID for Pro |
| `STRIPE_PRICE_BUSINESS` | Preview, Development | Test price ID for Business |

### Live Mode (for Production)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Production | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Production | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Production | Live webhook secret |
| `STRIPE_PRICE_PRO` | Production | Live price ID for Pro |
| `STRIPE_PRICE_BUSINESS` | Production | Live price ID for Business |

## Caching (Upstash Redis)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `KV_REST_API_URL` | All | `https://[region].upstash.io` |
| `KV_REST_API_TOKEN` | All | Upstash REST token |

**Note:** You can add Upstash directly from Vercel:
1. Go to **Storage** tab in Vercel
2. Click **Create Database** → **KV (Upstash)**
3. Variables will be added automatically

## Security

| Variable | Environment | Description |
|----------|-------------|-------------|
| `IP_SALT` | All | Random hex string for IP hashing |
| `API_KEY_SECRET` | All | Random hex string for API key encryption |

Generate secure random strings:
```bash
# Run in terminal
openssl rand -hex 32
```

## Optional Variables

### Short URL Domain

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_SHORT_URL_DOMAIN` | Production | `https://qr.your-domain.com` (optional) |

### Error Monitoring (Sentry)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_SENTRY_DSN` | All | Sentry DSN URL |

### Analytics (PostHog)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_POSTHOG_KEY` | All | PostHog project key |
| `VITE_POSTHOG_HOST` | All | `https://app.posthog.com` |

### Email (Resend)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `RESEND_API_KEY` | Production | Resend API key for transactional emails |

---

## Quick Copy-Paste Template

```
# Required - Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Required - App
APP_URL=

# Stripe (use pk_test/sk_test for non-production)
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_BUSINESS=

# Caching
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Security
IP_SALT=
API_KEY_SECRET=
```

---

## Verification

After adding all variables, trigger a new deployment:

```bash
# From your local machine
git commit --allow-empty -m "Trigger deployment"
git push
```

Then verify in the deployment logs that all environment variables are being read correctly.
