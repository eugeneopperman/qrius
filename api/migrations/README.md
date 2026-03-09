# Database Migrations

Qrius uses two PostgreSQL databases:
- **Supabase** -- Auth, users, organizations, memberships, plan_limits, folders, custom domains, email preferences
- **Neon** -- QR codes, scan_events, usage_records, brand_templates, email_log, moderation

## How to Apply

### Supabase Migrations
1. Go to Supabase Dashboard > SQL Editor
2. Paste the migration SQL
3. Run and verify with a SELECT query
4. Update the Status column below with the applied date

### Neon Migrations
1. Go to Neon Console > SQL Editor
2. Paste the migration SQL
3. Run and verify
4. Update the Status column below with the applied date

### Dual-Database Migrations
Some migrations (e.g., 012) have sections for both databases. Read the comments at the top of the file -- they specify which sections to run where.

## Migration Log

| # | File | Target DB | Description | Status |
|---|------|-----------|-------------|--------|
| 001 | `001-add-indexes.sql` | Neon | Performance indexes on qr_codes (org+created_at) and scan_events (qr_code_id+scanned_at) | Applied |
| 002 | `002-analytics-columns.sql` | Neon | Add referrer, region, latitude, longitude columns to scan_events; indexes for analytics queries | Applied |
| 003 | `003-add-display-name.sql` | Neon | Add display_name column to users table | Applied |
| 004 | `004-custom-domains.sql` | Supabase | Custom domains table with status tracking, RLS policies for org members, Vercel domain verification support | **Pending** |
| 005a | `005-qr-code-folders.sql` | Supabase | QR code folders table with org ownership, RLS policies (viewers read, editors+ create, admins+ update/delete) | Applied |
| 005b | `005-qr-codes-folder-id.sql` | Neon | Add folder_id and is_active indexes to qr_codes (no FK -- cross-database) | Applied |
| 006 | `006-user-contact-fields.sql` | Supabase | Add 7 contact columns to users: phone, company, street, city, zip, country, website | Applied |
| 007 | `007-supabase-security.sql` | Supabase | Security hardening: RLS on plan_limits, tighten organizations_insert policy, set search_path='' on 7 functions, cleanup unused functions | **Pending** |
| 008 | `008-rls-initplan-performance.sql` | Supabase | Wrap auth.uid() in (select auth.uid()) across 23 RLS policies for InitPlan optimization; consolidate custom_domains permissive policies | Applied |
| 009a | `009-performance-indexes.sql` | Supabase | Composite indexes for org+active QR codes, subscription org+status, geo analytics aggregation | Applied |
| 009b | `009-fix-org-members-rls-recursion.sql` | Supabase | Fix infinite recursion in organization_members RLS (error 42P17) using SECURITY DEFINER helper function get_user_org_ids() | Applied |
| 010 | `010-brand-templates.sql` | Neon | Brand templates table for cross-device template sync with user/org ownership and indexes | **Pending** |
| 011 | `011-qr-code-status.sql` | Neon | Add status column (draft/active/paused) with CHECK constraint; backfill paused from is_active=false; status indexes | Applied |
| 012 | `012-pricing-restructure.sql` | Both | 4-tier pricing: add 'starter' to plan CHECK constraints (Supabase), upsert all plan_limits rows with new values (both DBs) | Applied |
| 013 | `013-moderation.sql` | Neon | Content moderation: moderation_status column on qr_codes, moderation_reports table with reason/status/admin tracking | Applied |
| 014 | `014-terms-consent.sql` | Supabase | Add terms_accepted_at and terms_version columns to users table for consent tracking | Applied |
| 015 | `015-email-preferences.sql` | Supabase | Email preferences table (7 category toggles + unsubscribed_all) with RLS, email_unsubscribe_tokens table for one-click unsubscribe | Applied |
| 016 | `016-email-log.sql` | Neon | Email audit log table (type, category, resend_id, status) and scan_milestones_reached dedup table | Applied |

## Notes

- Migrations are idempotent where possible (`IF NOT EXISTS`, `DROP POLICY IF EXISTS` before `CREATE POLICY`).
- Migration 012 must be run in **both** databases -- Supabase for CHECK constraints, Neon for plan_limits upsert. See file header comments.
- Migration 009 has two files (009a and 009b). Run both in Supabase. The recursion fix (009b) should be run after 008.
- Migration 005 has two files: 005a for Supabase (folders table), 005b for Neon (folder_id column on qr_codes).
- No FK constraints exist between Neon and Supabase tables (cross-database). Referential integrity is enforced at the application layer.
