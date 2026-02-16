-- Migration 001: Add missing performance indexes
-- Run after schema.sql and schema-saas.sql

-- Composite index for QR code list queries (filtered by org, sorted by date)
CREATE INDEX IF NOT EXISTS idx_qr_codes_org_created ON qr_codes(organization_id, created_at DESC);

-- Index on scan_events for organization-level scan queries
-- (scan_events.qr_code_id is already indexed, but dashboard queries
-- need to join through qr_codes to filter by organization_id)
CREATE INDEX IF NOT EXISTS idx_scan_events_qr_scanned ON scan_events(qr_code_id, scanned_at DESC);
