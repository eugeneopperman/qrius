-- Migration 015: Email preferences + unsubscribe tokens (Supabase)
-- Run this in the Supabase SQL Editor

-- Email preferences per user
CREATE TABLE IF NOT EXISTS email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_milestones BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  monthly_digest BOOLEAN NOT NULL DEFAULT true,
  product_updates BOOLEAN NOT NULL DEFAULT true,
  upgrade_prompts BOOLEAN NOT NULL DEFAULT true,
  usage_warnings BOOLEAN NOT NULL DEFAULT true,
  security_alerts BOOLEAN NOT NULL DEFAULT true,
  unsubscribed_all BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can only read/update their own preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own preferences" ON email_preferences;
CREATE POLICY "Users can read own preferences" ON email_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON email_preferences;
CREATE POLICY "Users can update own preferences" ON email_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON email_preferences;
CREATE POLICY "Users can insert own preferences" ON email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role bypass for API endpoints
DROP POLICY IF EXISTS "Service role full access on email_preferences" ON email_preferences;
CREATE POLICY "Service role full access on email_preferences" ON email_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- Unsubscribe tokens (no auth required from email links)
CREATE TABLE IF NOT EXISTS email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON email_unsubscribe_tokens(token);

ALTER TABLE email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on unsubscribe_tokens" ON email_unsubscribe_tokens;
CREATE POLICY "Service role full access on unsubscribe_tokens" ON email_unsubscribe_tokens
  FOR ALL USING (auth.role() = 'service_role');
