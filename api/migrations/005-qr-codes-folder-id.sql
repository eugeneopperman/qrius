-- Migration 005: Add folder_id to qr_codes (Neon)
-- Run this in Neon SQL Editor
-- No FK constraint (cross-database: folders in Supabase, qr_codes in Neon)

ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS folder_id UUID;
CREATE INDEX IF NOT EXISTS idx_qr_codes_folder_id ON qr_codes(folder_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON qr_codes(is_active);
