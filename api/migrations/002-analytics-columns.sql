-- Migration 002: Add analytics columns to scan_events
-- Run against Neon Postgres (where scan_events lives)

ALTER TABLE scan_events
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS region VARCHAR(10),
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

CREATE INDEX IF NOT EXISTS idx_scan_events_referrer ON scan_events(referrer) WHERE referrer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scan_events_country_city ON scan_events(country_code, city) WHERE country_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scan_events_qr_time ON scan_events(qr_code_id, scanned_at);
