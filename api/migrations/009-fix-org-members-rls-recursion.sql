-- Migration 009: Fix infinite recursion in organization_members RLS policies
-- Run this in the Supabase SQL Editor
--
-- Problem: Migration 008 created policies on organization_members that query
-- organization_members itself, causing error 42P17:
--   "infinite recursion detected in policy for relation organization_members"
--
-- This breaks ALL queries that touch organization_members — including the
-- organizations, qr_codes, api_keys, subscriptions, usage_records, invitations,
-- and custom_domains policies that do EXISTS(SELECT 1 FROM organization_members ...).
--
-- Fix: Replace self-referencing policies with direct auth.uid() checks.
-- SELECT policy: a user can see all memberships in orgs they belong to.
--   We use a SECURITY DEFINER function to break the recursion.
-- INSERT policy: a user can insert their own membership OR invite if they're admin/owner.

-- ============================================
-- Step 1: Create a SECURITY DEFINER helper function
-- This function bypasses RLS, breaking the recursion cycle.
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = (select auth.uid());
$$;

-- ============================================
-- Step 2: Fix SELECT policy on organization_members
-- A user can see all members of organizations they belong to.
-- Uses the SECURITY DEFINER function to avoid recursion.
-- ============================================
DROP POLICY IF EXISTS org_members_select ON public.organization_members;
CREATE POLICY org_members_select ON public.organization_members
    FOR SELECT USING (
        organization_id IN (SELECT public.get_user_org_ids())
    );

-- ============================================
-- Step 3: Fix INSERT policy on organization_members
-- A user can insert their own membership (self-join via invite accept),
-- OR an owner/admin can insert members into their org.
-- Uses the SECURITY DEFINER function for the admin check.
-- ============================================
DROP POLICY IF EXISTS org_members_insert ON public.organization_members;
CREATE POLICY org_members_insert ON public.organization_members
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.get_user_org_ids() AS org_id
            WHERE org_id = organization_members.organization_id
            AND EXISTS (
                SELECT 1 FROM public.organization_members om
                WHERE om.organization_id = organization_members.organization_id
                AND om.user_id = (select auth.uid())
                AND om.role IN ('owner', 'admin')
            )
        )
    );

-- Actually, the INSERT admin check above still has recursion potential.
-- Simpler approach: use a dedicated SECURITY DEFINER function for the admin check too.

CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
    AND user_id = (select auth.uid())
    AND role IN ('owner', 'admin')
  );
$$;

-- Re-create the INSERT policy using the helper
DROP POLICY IF EXISTS org_members_insert ON public.organization_members;
CREATE POLICY org_members_insert ON public.organization_members
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid())
        OR public.is_org_admin_or_owner(organization_members.organization_id)
    );

-- ============================================
-- Step 4: Add DELETE and UPDATE policies (missing from migration 008)
-- ============================================
DROP POLICY IF EXISTS org_members_update ON public.organization_members;
CREATE POLICY org_members_update ON public.organization_members
    FOR UPDATE USING (
        public.is_org_admin_or_owner(organization_members.organization_id)
    );

DROP POLICY IF EXISTS org_members_delete ON public.organization_members;
CREATE POLICY org_members_delete ON public.organization_members
    FOR DELETE USING (
        user_id = (select auth.uid())
        OR public.is_org_admin_or_owner(organization_members.organization_id)
    );

-- ============================================
-- Verification
-- ============================================
-- Test that the recursion is fixed:
--   SELECT * FROM organization_members LIMIT 1;
--
-- Should return rows (or empty set) instead of:
--   ERROR: infinite recursion detected in policy for relation "organization_members"
--
-- Check policies:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'organization_members';
