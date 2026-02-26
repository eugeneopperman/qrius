-- QR Code Scan Tracking Schema
-- Run this SQL in the Vercel Postgres dashboard to set up the database

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(8) UNIQUE NOT NULL,
    destination_url TEXT NOT NULL,
    qr_type VARCHAR(20) NOT NULL DEFAULT 'url',
    original_data JSONB,
    is_active BOOLEAN DEFAULT true,
    total_scans INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON qr_codes(short_code);

-- Scan Events table
CREATE TABLE IF NOT EXISTS scan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    country_code CHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    user_agent TEXT,
    ip_hash VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_scan_events_qr_code_id ON scan_events(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_scanned_at ON scan_events(scanned_at);

-- Auto-increment scan count trigger
CREATE OR REPLACE FUNCTION update_scan_count() RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.qr_codes SET total_scans = total_scans + 1, updated_at = NOW()
    WHERE id = NEW.qr_code_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS trigger_scan_count ON scan_events;
CREATE TRIGGER trigger_scan_count AFTER INSERT ON scan_events
FOR EACH ROW EXECUTE FUNCTION update_scan_count();
