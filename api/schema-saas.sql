-- Qrius SaaS Database Schema Migration
-- Run this SQL after the initial schema.sql to add SaaS features
-- Compatible with Supabase (Postgres + Row Level Security)

-- ============================================
-- USERS TABLE (synced from Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    stripe_customer_id VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- ============================================
-- ORGANIZATION MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- ============================================
-- ORGANIZATION INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    token VARCHAR(64) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_org_invites_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invitations(email);

-- ============================================
-- API KEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    key_prefix VARCHAR(12) NOT NULL,
    scopes TEXT[] DEFAULT '{}',
    rate_limit_per_day INTEGER DEFAULT 1000,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================
-- USAGE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    qr_codes_created INTEGER DEFAULT 0,
    scans_count INTEGER DEFAULT 0,
    api_requests INTEGER DEFAULT 0,
    storage_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_org_month ON usage_records(organization_id, month);

-- ============================================
-- MODIFY QR_CODES TABLE (add ownership)
-- ============================================
-- Add new columns to existing qr_codes table
ALTER TABLE qr_codes
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_qr_codes_user ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org ON qr_codes(organization_id);

-- ============================================
-- PLAN LIMITS REFERENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS plan_limits (
    plan VARCHAR(20) PRIMARY KEY,
    qr_codes_limit INTEGER NOT NULL,
    scans_per_month INTEGER NOT NULL,
    scan_history_days INTEGER NOT NULL,
    team_members INTEGER NOT NULL,
    api_requests_per_day INTEGER NOT NULL,
    custom_branding BOOLEAN DEFAULT false,
    white_label BOOLEAN DEFAULT false,
    priority_support BOOLEAN DEFAULT false
);

-- Insert plan limits
INSERT INTO plan_limits (plan, qr_codes_limit, scans_per_month, scan_history_days, team_members, api_requests_per_day, custom_branding, white_label, priority_support)
VALUES
    ('free', 15, 5000, 30, 1, 0, false, false, false),
    ('pro', 250, 100000, 365, 5, 1000, true, false, false),
    ('business', -1, -1, -1, 25, 10000, true, true, true)
ON CONFLICT (plan) DO UPDATE SET
    qr_codes_limit = EXCLUDED.qr_codes_limit,
    scans_per_month = EXCLUDED.scans_per_month,
    scan_history_days = EXCLUDED.scan_history_days,
    team_members = EXCLUDED.team_members,
    api_requests_per_day = EXCLUDED.api_requests_per_day,
    custom_branding = EXCLUDED.custom_branding,
    white_label = EXCLUDED.white_label,
    priority_support = EXCLUDED.priority_support;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's current organization
CREATE OR REPLACE FUNCTION get_user_organization(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM organization_members
    WHERE user_id = p_user_id
    ORDER BY joined_at ASC
    LIMIT 1;
    RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has permission in org
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id UUID, p_org_id UUID, p_required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = p_user_id
        AND organization_id = p_org_id
        AND role = ANY(p_required_roles)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get org plan limits
CREATE OR REPLACE FUNCTION get_org_limits(p_org_id UUID)
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
    FROM organizations o
    JOIN plan_limits pl ON pl.plan = o.plan
    WHERE o.id = p_org_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if org can create more QR codes
CREATE OR REPLACE FUNCTION can_create_qr_code(p_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    limit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_count FROM qr_codes WHERE organization_id = p_org_id;
    SELECT pl.qr_codes_limit INTO limit_count
    FROM organizations o
    JOIN plan_limits pl ON pl.plan = o.plan
    WHERE o.id = p_org_id;

    RETURN limit_count = -1 OR current_count < limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON organizations;
CREATE TRIGGER trigger_organizations_updated_at BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_usage_updated_at ON usage_records;
CREATE TRIGGER trigger_usage_updated_at BEFORE UPDATE ON usage_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES (for Supabase)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;

-- Users: can read own profile, admins can read all
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_insert_own ON users;
CREATE POLICY users_insert_own ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Organizations: members can read their orgs
DROP POLICY IF EXISTS organizations_select ON organizations;
CREATE POLICY organizations_select ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = organizations.id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS organizations_insert ON organizations;
CREATE POLICY organizations_insert ON organizations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS organizations_update ON organizations;
CREATE POLICY organizations_update ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = organizations.id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Organization members: members can view their org's members
DROP POLICY IF EXISTS org_members_select ON organization_members;
CREATE POLICY org_members_select ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS org_members_insert ON organization_members;
CREATE POLICY org_members_insert ON organization_members
    FOR INSERT WITH CHECK (
        -- Allow self-provisioning (user adding themselves)
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
        )
    );

-- QR Codes: users can see their own or their org's QR codes
DROP POLICY IF EXISTS qr_codes_select ON qr_codes;
CREATE POLICY qr_codes_select ON qr_codes
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS qr_codes_insert ON qr_codes;
CREATE POLICY qr_codes_insert ON qr_codes
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS qr_codes_update ON qr_codes;
CREATE POLICY qr_codes_update ON qr_codes
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS qr_codes_delete ON qr_codes;
CREATE POLICY qr_codes_delete ON qr_codes
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = qr_codes.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Scan events: users can view scans for their QR codes
DROP POLICY IF EXISTS scan_events_select ON scan_events;
CREATE POLICY scan_events_select ON scan_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM qr_codes qr
            WHERE qr.id = scan_events.qr_code_id
            AND (
                qr.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM organization_members
                    WHERE organization_id = qr.organization_id
                    AND user_id = auth.uid()
                )
            )
        )
    );

-- API Keys: org admins can manage
DROP POLICY IF EXISTS api_keys_select ON api_keys;
CREATE POLICY api_keys_select ON api_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = api_keys.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS api_keys_insert ON api_keys;
CREATE POLICY api_keys_insert ON api_keys
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = api_keys.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS api_keys_delete ON api_keys;
CREATE POLICY api_keys_delete ON api_keys
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = api_keys.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Subscriptions: org owners can view
DROP POLICY IF EXISTS subscriptions_select ON subscriptions;
CREATE POLICY subscriptions_select ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = subscriptions.organization_id
            AND user_id = auth.uid()
        )
    );

-- Usage records: org members can view
DROP POLICY IF EXISTS usage_records_select ON usage_records;
CREATE POLICY usage_records_select ON usage_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = usage_records.organization_id
            AND user_id = auth.uid()
        )
    );

-- Invitations: org admins can manage, invitees can view their own
DROP POLICY IF EXISTS invitations_select ON organization_invitations;
CREATE POLICY invitations_select ON organization_invitations
    FOR SELECT USING (
        email = (SELECT email FROM users WHERE id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = organization_invitations.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- ============================================
-- FUNCTION TO CREATE USER PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
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
    INSERT INTO public.organizations (id, name, slug)
    VALUES (
        new_org_id,
        user_name || '''s Workspace',
        'personal-' || substring(NEW.id::text, 1, 8)
    );

    -- Add user as owner of their personal org
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
