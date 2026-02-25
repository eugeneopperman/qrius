-- Migration 005: QR Code Folders (Supabase)
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS qr_code_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_qr_code_folders_org ON qr_code_folders(organization_id);

ALTER TABLE qr_code_folders ENABLE ROW LEVEL SECURITY;

-- RLS: org members can read folders
DROP POLICY IF EXISTS "Org members can read folders" ON qr_code_folders;
CREATE POLICY "Org members can read folders" ON qr_code_folders
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

-- RLS: editors+ can create folders
DROP POLICY IF EXISTS "Editors can create folders" ON qr_code_folders;
CREATE POLICY "Editors can create folders" ON qr_code_folders
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- RLS: editors+ can update folders
DROP POLICY IF EXISTS "Editors can update folders" ON qr_code_folders;
CREATE POLICY "Editors can update folders" ON qr_code_folders
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- RLS: editors+ can delete folders
DROP POLICY IF EXISTS "Editors can delete folders" ON qr_code_folders;
CREATE POLICY "Editors can delete folders" ON qr_code_folders
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
        )
    );

-- Service role bypass
DROP POLICY IF EXISTS "Service role full access on folders" ON qr_code_folders;
CREATE POLICY "Service role full access on folders" ON qr_code_folders
    FOR ALL USING (auth.role() = 'service_role');
