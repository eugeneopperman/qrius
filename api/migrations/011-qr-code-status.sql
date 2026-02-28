-- Migration 011: Add status column to qr_codes
-- Run this in the Neon SQL Editor

-- Add status column with CHECK constraint
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS status VARCHAR(10) NOT NULL DEFAULT 'active';

-- Add CHECK constraint (drop first to be idempotent)
ALTER TABLE qr_codes DROP CONSTRAINT IF EXISTS qr_codes_status_check;
ALTER TABLE qr_codes ADD CONSTRAINT qr_codes_status_check
  CHECK (status IN ('draft', 'active', 'paused'));

-- Backfill: paused codes get status='paused'
UPDATE qr_codes SET status = 'paused' WHERE is_active = false AND status = 'active';

-- Indexes for filtering by status
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes (status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_status ON qr_codes (organization_id, status);
