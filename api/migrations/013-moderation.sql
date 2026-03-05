-- Migration 013: Content Moderation
-- Run in Neon SQL Editor

-- 1. Add moderation_status to qr_codes
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'clean'
  CHECK (moderation_status IN ('clean', 'flagged', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_qr_codes_moderation_status ON qr_codes (moderation_status) WHERE moderation_status != 'clean';

-- 2. Create moderation_reports table
CREATE TABLE IF NOT EXISTS moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  short_code VARCHAR(20),
  reported_url TEXT,
  reason VARCHAR(30) NOT NULL CHECK (reason IN ('phishing', 'malware', 'scam', 'spam', 'inappropriate', 'copyright', 'other')),
  description TEXT,
  reporter_email VARCHAR(320),
  reporter_ip_hash VARCHAR(64),
  source VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'auto')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  admin_notes TEXT,
  reviewed_by VARCHAR(320),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports (status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_qr_code ON moderation_reports (qr_code_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created ON moderation_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_short_code ON moderation_reports (short_code);
