-- Migration 004: Custom domains for white-label QR tracking URLs
-- Run in Supabase SQL Editor (org config lives alongside organizations/plan_limits)

-- Custom domains table
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain VARCHAR(253) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verifying', 'verified', 'failed')),
    cname_target VARCHAR(253) NOT NULL,
    verified_at TIMESTAMPTZ,
    last_check_at TIMESTAMPTZ,
    last_check_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain),
    UNIQUE(organization_id)  -- one custom domain per org
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_domains_org ON custom_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);

-- RLS policies
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_domains_select_members" ON custom_domains;
CREATE POLICY "custom_domains_select_members" ON custom_domains
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "custom_domains_insert_admin" ON custom_domains;
CREATE POLICY "custom_domains_insert_admin" ON custom_domains
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "custom_domains_update_admin" ON custom_domains;
CREATE POLICY "custom_domains_update_admin" ON custom_domains
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "custom_domains_delete_admin" ON custom_domains;
CREATE POLICY "custom_domains_delete_admin" ON custom_domains
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Allow service role full access (for API routes)
DROP POLICY IF EXISTS "custom_domains_service_role" ON custom_domains;
CREATE POLICY "custom_domains_service_role" ON custom_domains
    FOR ALL USING (auth.role() = 'service_role');
