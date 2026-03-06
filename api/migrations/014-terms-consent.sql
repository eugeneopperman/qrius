-- Migration 014: Terms & Conditions Consent
-- Run in Supabase SQL Editor
-- Adds consent tracking columns to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20) DEFAULT NULL;
