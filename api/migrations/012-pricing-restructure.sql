-- Migration 012: Pricing restructure — 4-tier system
--
-- Supabase SQL Editor: Run the FULL file (CHECK constraints + plan_limits)
-- Neon SQL Editor:     Run ONLY section 2 (plan_limits upsert) — Neon does
--                      not have organizations/subscriptions tables
--
-- Changes:
-- 1. Add 'starter' to plan CHECK constraints on organizations and subscriptions
-- 2. Insert 'starter' plan_limits row
-- 3. Update free/pro/business plan_limits to new values
--
-- New pricing structure:
--   Free:     5 QR codes, unlimited scans, 7-day history, 1 member, no API
--   Starter:  50 QR codes, unlimited scans, 90-day history, 1 member, no API
--   Pro:      500 QR codes, unlimited scans, 1-year history, 5 members, 1K API/day
--   Business: Unlimited, unlimited scans, unlimited history, 25 members, 10K API/day

-- 1. Update CHECK constraints to allow 'starter' plan
-- Organizations table
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'business'));

-- Subscriptions table
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
-- Note: subscriptions may not have a plan column check — only add if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'plan'
  ) THEN
    EXECUTE 'ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check';
    EXECUTE 'ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN (''free'', ''starter'', ''pro'', ''business''))';
  END IF;
END $$;

-- 2. Upsert all plan_limits rows
INSERT INTO plan_limits (plan, qr_codes_limit, scans_per_month, scan_history_days, team_members, api_requests_per_day, custom_branding, white_label, priority_support)
VALUES
    ('free',     5,   -1,  7,   1,  0,     false, false, false),
    ('starter',  50,  -1,  90,  1,  0,     true,  false, false),
    ('pro',      500, -1,  365, 5,  1000,  true,  false, false),
    ('business', -1,  -1,  -1,  25, 10000, true,  true,  true)
ON CONFLICT (plan) DO UPDATE SET
    qr_codes_limit = EXCLUDED.qr_codes_limit,
    scans_per_month = EXCLUDED.scans_per_month,
    scan_history_days = EXCLUDED.scan_history_days,
    team_members = EXCLUDED.team_members,
    api_requests_per_day = EXCLUDED.api_requests_per_day,
    custom_branding = EXCLUDED.custom_branding,
    white_label = EXCLUDED.white_label,
    priority_support = EXCLUDED.priority_support;
