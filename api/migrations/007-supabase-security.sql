-- Migration 007: Supabase Database Security Hardening
-- Run this in the Supabase SQL Editor
-- Addresses: RLS on plan_limits, organizations_insert policy, function search_path, unused function cleanup

-- ============================================
-- 2.1: Enable RLS on plan_limits table
-- ============================================
-- plan_limits is reference data — allow SELECT for all authenticated users, deny writes
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_limits_select ON public.plan_limits;
CREATE POLICY plan_limits_select ON public.plan_limits
    FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies — only service_role can modify plan limits

-- ============================================
-- 2.2: Fix organizations_insert policy (was WITH CHECK (true))
-- ============================================
-- Tighten: only authenticated users can insert, and plan must be 'free'
-- Plan upgrades happen server-side via service_role (Stripe webhooks)
DROP POLICY IF EXISTS organizations_insert ON public.organizations;
CREATE POLICY organizations_insert ON public.organizations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND plan = 'free'
    );

-- ============================================
-- 2.3: Set search_path = '' on all public functions
-- When search_path is empty, all table references must be fully qualified
-- ============================================

-- 1. get_user_organization
CREATE OR REPLACE FUNCTION public.get_user_organization(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM public.organization_members
    WHERE user_id = p_user_id
    ORDER BY joined_at ASC
    LIMIT 1;
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. user_has_permission
CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id UUID, p_org_id UUID, p_required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE user_id = p_user_id
        AND organization_id = p_org_id
        AND role = ANY(p_required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. get_org_limits
CREATE OR REPLACE FUNCTION public.get_org_limits(p_org_id UUID)
RETURNS TABLE (
    qr_codes_limit INTEGER,
    scans_per_month INTEGER,
    scan_history_days INTEGER,
    team_members INTEGER,
    api_requests_per_day INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pl.qr_codes_limit,
        pl.scans_per_month,
        pl.scan_history_days,
        pl.team_members,
        pl.api_requests_per_day
    FROM public.organizations o
    JOIN public.plan_limits pl ON pl.plan = o.plan
    WHERE o.id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. can_create_qr_code
CREATE OR REPLACE FUNCTION public.can_create_qr_code(p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    limit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_count FROM public.qr_codes WHERE organization_id = p_org_id;
    SELECT pl.qr_codes_limit INTO limit_count
    FROM public.organizations o
    JOIN public.plan_limits pl ON pl.plan = o.plan
    WHERE o.id = p_org_id;

    RETURN limit_count = -1 OR current_count < limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5. update_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 6. handle_new_user (trigger function — references auth.users, public.users, public.organizations, public.organization_members)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_name TEXT;
BEGIN
    -- Extract name from email or metadata
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Create user profile
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Create personal organization
    new_org_id := gen_random_uuid();
    INSERT INTO public.organizations (id, name, slug, plan)
    VALUES (
        new_org_id,
        user_name || '''s Workspace',
        'personal-' || substring(NEW.id::text, 1, 8),
        'free'
    );

    -- Add user as owner of their personal org
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. update_scan_count (trigger function — runs on Neon, not Supabase)
-- This function exists in schema.sql for the Neon database.
-- If it also exists in Supabase, fix its search_path:
CREATE OR REPLACE FUNCTION public.update_scan_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.qr_codes SET total_scans = total_scans + 1, updated_at = NOW()
    WHERE id = NEW.qr_code_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ============================================
-- 2.5: Fix get_user_org_ids function (used by org_members_select RLS policy)
-- ============================================
-- This function was created directly in Supabase (not in schema files).
-- It's used by the org_members_select RLS policy, so we cannot drop it.
-- Instead, recreate it with SET search_path = '' to fix the linter warning.
CREATE OR REPLACE FUNCTION public.get_user_org_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================
-- Verification queries (run after migration)
-- ============================================
-- Check RLS is enabled on plan_limits:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plan_limits';
--
-- Check function search_paths:
--   SELECT proname, proconfig FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
--
-- Check organizations_insert policy:
--   SELECT * FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'organizations_insert';
