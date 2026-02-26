-- Migration 009: Performance indexes for filtered queries
-- Run in Supabase SQL Editor
-- These cover WHERE/GROUP BY patterns in api/qr-codes and api/webhooks

-- Composite index for QR codes filtered by org + active status
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_active
  ON qr_codes(organization_id, is_active);

-- NOTE: idx_qr_codes_org_folder skipped — folder_id only exists in Neon, not Supabase

-- Composite index for subscription lookups by org + status
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_status
  ON subscriptions(organization_id, status);

-- Composite index for geo analytics aggregation
CREATE INDEX IF NOT EXISTS idx_scan_events_geo
  ON scan_events(qr_code_id, country_code);
