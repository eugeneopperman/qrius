# Disaster Recovery Runbook

Practical recovery procedures for Qrius Codes (qriuscodes.com).

## 1. Site Down

### Verification
1. Check from multiple networks (mobile data, different ISP, VPN)
2. Check status pages:
   - Vercel: https://www.vercel-status.com
   - Supabase: https://status.supabase.com
   - Neon: https://neonstatus.com
3. Test specific routes:
   - Marketing pages (static, cached): `curl -sI https://qriuscodes.com`
   - API health: `curl -s https://qriuscodes.com/api/health`
   - Redirect service: `curl -sI https://qriuscodes.com/r/test`

### Diagnosis
1. Check Vercel function logs: Vercel Dashboard > Project > Deployments > Functions tab
2. Determine scope:
   - **All routes down** = Vercel platform issue or DNS problem
   - **Only API routes** = serverless function error (check logs for stack traces)
   - **Only redirects** = Edge function issue (`api/r/[shortCode].ts`)
   - **Only auth** = Supabase outage (check status page)
   - **Slow but not down** = Database performance (check Neon/Supabase dashboards)

### Mitigation
1. **Rollback deploy**: Vercel Dashboard > Deployments > click previous successful deploy > "..." menu > "Promote to Production"
2. **Force redeploy**: `npx vercel --prod --force` (bypasses build cache)
3. **DNS issue**: Check domain settings in Vercel > Project > Settings > Domains
4. **Database connection**: Verify env vars in Vercel > Settings > Environment Variables (`POSTGRES_URL`, `VITE_SUPABASE_URL`)

### Communication
- If outage exceeds 15 minutes, post status update to users
- Template: "We're experiencing issues with [specific feature]. Our team is investigating. QR codes already generated continue to work. We'll update within [timeframe]."

### Post-Mortem Template
```
## Incident: [Title]
**Date**: YYYY-MM-DD
**Duration**: X hours Y minutes
**Severity**: P1/P2/P3
**Impact**: [What users experienced]

### Timeline
- HH:MM - Issue detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Confirmed resolved

### Root Cause
[Description]

### Resolution
[What was done]

### Action Items
- [ ] Item 1
- [ ] Item 2
```

## 2. Database Recovery

### Neon (QR codes, scans, templates, email log)

**Point-in-time recovery:**
1. Go to Neon Console > Project > Branches
2. Create a new branch from a specific timestamp (before the incident)
3. Verify data in the new branch
4. Either promote the branch or export and reimport the data

**Manual backup:**
```bash
pg_dump "$POSTGRES_URL" --no-owner --no-acl > neon-backup-$(date +%Y%m%d).sql
```

**Restore from backup:**
```bash
psql "$POSTGRES_URL" < neon-backup-YYYYMMDD.sql
```

**Key tables:** qr_codes, scan_events, usage_records, brand_templates, email_log, moderation_reports, scan_milestones_reached

### Supabase (Auth, users, organizations)

**Automatic backups:** Daily backups (available on Pro plan via Dashboard > Database > Backups)

**Point-in-time recovery:** Available on Pro plan. Contact Supabase support with the target timestamp.

**Manual SQL export:** Supabase Dashboard > SQL Editor > run SELECT queries and export results. For full export, use the Supabase CLI:
```bash
supabase db dump --db-url "$SUPABASE_DB_URL" > supabase-backup-$(date +%Y%m%d).sql
```

**Key tables:** users, organizations, organization_members, organization_invitations, subscriptions, plan_limits, api_keys, custom_domains, email_preferences, email_unsubscribe_tokens, qr_code_folders

### Redis/KV Cache (Upstash)

Cache is ephemeral (24-hour TTL on redirect lookups). No backup needed. If Redis is unavailable, the app falls back to database queries with slightly higher latency. To flush stale data:
- Upstash Console > Data Browser > FLUSHDB (or let TTLs expire naturally)

## 3. Authentication Outage

**Dependency:** Supabase Auth handles all authentication (email/password + OAuth).

**Impact during outage:**
- Existing sessions continue to work (JWT-based, validated client-side)
- New sign-ins/sign-ups will fail
- OAuth callbacks will fail
- Password resets will fail
- QR code redirects (`/r/shortCode`) are unaffected (no auth required)

**Monitoring:** https://status.supabase.com

**Mitigation:**
1. No immediate fix possible -- wait for Supabase to resolve
2. JWTs are valid until expiry (default 1 hour), so active users may not notice short outages
3. If extended (>1 hour), add a banner to the app: "Sign-in is temporarily unavailable. Existing sessions are unaffected."

## 4. Payment System Failure

**Dependency:** Stripe handles all subscription billing.

**Stripe webhook retry behavior:**
- Failed webhooks are retried up to 3 times over approximately 7 days
- Retry schedule: ~1 hour, ~6 hours, ~3 days after initial failure
- Events are available in Stripe Dashboard > Developers > Webhooks > Event log

**If webhooks are failing:**
1. Check Vercel function logs for `api/webhooks/stripe` errors
2. Verify `STRIPE_WEBHOOK_SECRET` env var matches the webhook endpoint (`we_1T7pYV1paxIMGMT2se4JtSO2`)
3. Check Stripe Dashboard > Developers > Webhooks for failed deliveries
4. Manually replay failed events from Stripe Dashboard

**Manual intervention:**
- Subscription status can be checked/updated directly in Stripe Dashboard
- If a user's plan is wrong in the DB, update via Supabase SQL Editor:
  ```sql
  UPDATE organizations SET plan = 'pro' WHERE id = '<org_id>';
  ```

**User communication:** "We're processing a backlog of payment updates. Your subscription is active -- if your plan features appear limited, they'll be restored within [timeframe]."

## 5. Data Loss Prevention

### Regular Backups
Set up scheduled exports for both databases:

```bash
# Neon (QR data)
pg_dump "$POSTGRES_URL" --no-owner --no-acl > backups/neon-$(date +%Y%m%d).sql

# Supabase (user/org data)
supabase db dump --db-url "$SUPABASE_DB_URL" > backups/supabase-$(date +%Y%m%d).sql
```

### Code
- All code is in Git, pushed to GitHub (continuous)
- Vercel auto-deploys from main branch

### Environment Variables
- Documented in `.env.example`
- Production values stored in Vercel Dashboard > Settings > Environment Variables
- Keep a secure offline copy of all production env vars

### What Cannot Be Recovered
- Supabase Auth user passwords (hashed, not exportable -- users must reset)
- Stripe payment method details (stored by Stripe, not in our DB)
- Redis cache entries (ephemeral, will repopulate from DB)

## 6. Contact Information

| Service | Dashboard | Support |
|---------|-----------|---------|
| Vercel | vercel.com/dashboard | vercel.com/support |
| Supabase | supabase.com/dashboard | supabase.com/support |
| Neon | console.neon.tech | neon.tech/support |
| Stripe | dashboard.stripe.com | stripe.com/support |
| Resend | resend.com/emails | resend.com/support |
| Upstash | console.upstash.com | upstash.com/support |

**Domain registrar:** Check Vercel > Project > Settings > Domains for DNS configuration.

**Webhook endpoint:** `https://qriuscodes.com/api/webhooks/stripe`

**Health check:** `https://qriuscodes.com/api/health`
