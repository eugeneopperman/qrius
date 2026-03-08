-- Migration 016: Email log + scan milestones reached (Neon)
-- Run this in the Neon SQL Editor

-- Email audit trail
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email_to TEXT NOT NULL,
  email_type TEXT NOT NULL,
  category TEXT NOT NULL,
  resend_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'skipped', 'failed')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_user ON email_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log(created_at);

-- Prevent duplicate scan milestone emails
CREATE TABLE IF NOT EXISTS scan_milestones_reached (
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  milestone INT NOT NULL,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (qr_code_id, milestone)
);
