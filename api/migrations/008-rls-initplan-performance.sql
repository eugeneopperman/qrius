-- Migration 008: RLS InitPlan Performance Optimization
-- Run this in the Supabase SQL Editor
--
-- Fixes: auth_rls_initplan warnings (23 policies) + multiple_permissive_policies on custom_domains
--
-- Problem: auth.uid() called directly in RLS policies is re-evaluated per row.
-- Fix: Wrap in (select auth.uid()) so Postgres evaluates it once as an InitPlan.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ============================================
-- 1. users table (3 policies)
-- ============================================
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS users_insert_own ON public.users;
CREATE POLICY users_insert_own ON public.users
    FOR INSERT WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (id = (select auth.uid()));

-- ============================================
-- 2. organizations table (3 policies)
-- ============================================
DROP POLICY IF EXISTS organizations_select ON public.organizations;
CREATE POLICY organizations_select ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organizations.id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS organizations_insert ON public.organizations;
CREATE POLICY organizations_insert ON public.organizations
    FOR INSERT WITH CHECK (
        (select auth.uid()) IS NOT NULL
        AND plan = 'free'
    );

DROP POLICY IF EXISTS organizations_update ON public.organizations;
CREATE POLICY organizations_update ON public.organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organizations.id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- 3. organization_members table (2 policies)
-- ============================================
DROP POLICY IF EXISTS org_members_select ON public.organization_members;
CREATE POLICY org_members_select ON public.organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS org_members_insert ON public.organization_members;
CREATE POLICY org_members_insert ON public.organization_members
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = (select auth.uid())
            AND om.role IN ('owner', 'admin')
        )
    );

-- ============================================
-- 4. qr_codes table (4 policies)
-- ============================================
DROP POLICY IF EXISTS qr_codes_select ON public.qr_codes;
CREATE POLICY qr_codes_select ON public.qr_codes
    FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS qr_codes_insert ON public.qr_codes;
CREATE POLICY qr_codes_insert ON public.qr_codes
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS qr_codes_update ON public.qr_codes;
CREATE POLICY qr_codes_update ON public.qr_codes
    FOR UPDATE USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS qr_codes_delete ON public.qr_codes;
CREATE POLICY qr_codes_delete ON public.qr_codes
    FOR DELETE USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- 5. scan_events table (1 policy)
-- ============================================
DROP POLICY IF EXISTS scan_events_select ON public.scan_events;
CREATE POLICY scan_events_select ON public.scan_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes qr
            WHERE qr.id = scan_events.qr_code_id
            AND (
                qr.user_id = (select auth.uid())
                OR EXISTS (
                    SELECT 1 FROM public.organization_members
                    WHERE organization_id = qr.organization_id
                    AND user_id = (select auth.uid())
                )
            )
        )
    );

-- ============================================
-- 6. api_keys table (3 policies)
-- ============================================
DROP POLICY IF EXISTS api_keys_select ON public.api_keys;
CREATE POLICY api_keys_select ON public.api_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = api_keys.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS api_keys_insert ON public.api_keys;
CREATE POLICY api_keys_insert ON public.api_keys
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = api_keys.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS api_keys_delete ON public.api_keys;
CREATE POLICY api_keys_delete ON public.api_keys
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = api_keys.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- 7. subscriptions table (1 policy)
-- ============================================
DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;
CREATE POLICY subscriptions_select ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = subscriptions.organization_id
            AND user_id = (select auth.uid())
        )
    );

-- ============================================
-- 8. usage_records table (1 policy)
-- ============================================
DROP POLICY IF EXISTS usage_records_select ON public.usage_records;
CREATE POLICY usage_records_select ON public.usage_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = usage_records.organization_id
            AND user_id = (select auth.uid())
        )
    );

-- ============================================
-- 9. organization_invitations table (1 policy)
-- ============================================
DROP POLICY IF EXISTS invitations_select ON public.organization_invitations;
CREATE POLICY invitations_select ON public.organization_invitations
    FOR SELECT USING (
        email = (SELECT email FROM public.users WHERE id = (select auth.uid()))
        OR EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organization_invitations.organization_id
            AND user_id = (select auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- 10. custom_domains table — fix initplan + merge duplicate permissive policies
-- ============================================
-- Problem: custom_domains_service_role (FOR ALL) overlaps with the 4 specific
-- admin policies, causing "multiple permissive policies" warnings for every
-- role x action combo. The service_role policy is unnecessary because
-- service_role bypasses RLS entirely. Drop it and fix auth.uid() in the rest.

DROP POLICY IF EXISTS custom_domains_service_role ON public.custom_domains;

DROP POLICY IF EXISTS custom_domains_select_members ON public.custom_domains;
CREATE POLICY custom_domains_select_members ON public.custom_domains
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS custom_domains_insert_admin ON public.custom_domains;
CREATE POLICY custom_domains_insert_admin ON public.custom_domains
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (select auth.uid()) AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS custom_domains_update_admin ON public.custom_domains;
CREATE POLICY custom_domains_update_admin ON public.custom_domains
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (select auth.uid()) AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS custom_domains_delete_admin ON public.custom_domains;
CREATE POLICY custom_domains_delete_admin ON public.custom_domains
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = (select auth.uid()) AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- Verification
-- ============================================
-- Check all policies use InitPlan (no bare auth.uid()):
--   SELECT schemaname, tablename, policyname, qual, with_check
--   FROM pg_policies WHERE schemaname = 'public';
--
-- Check custom_domains has exactly 4 policies (no service_role):
--   SELECT policyname FROM pg_policies WHERE tablename = 'custom_domains';
