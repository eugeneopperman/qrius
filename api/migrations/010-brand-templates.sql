-- Migration 010: Brand Templates (Neon)
-- Run this in Neon SQL Editor
-- Stores brand templates in the database for cross-device sync

CREATE TABLE IF NOT EXISTS brand_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_id UUID,
    name VARCHAR(200) NOT NULL DEFAULT 'Untitled Template',
    style JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ownership queries
CREATE INDEX IF NOT EXISTS idx_brand_templates_org ON brand_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_templates_user ON brand_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_templates_org_created ON brand_templates(organization_id, created_at DESC);
