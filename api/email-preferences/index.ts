// GET /api/email-preferences - Get user's email preferences
// PATCH /api/email-preferences - Update user's email preferences

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin, UnauthorizedError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';

const VALID_KEYS = [
  'scan_milestones',
  'weekly_digest',
  'monthly_digest',
  'product_updates',
  'upgrade_prompts',
  'usage_warnings',
  'security_alerts',
  'unsubscribed_all',
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, PATCH, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const user = await requireAuth(req);

    if (req.method === 'GET') {
      const { data, error } = await getSupabaseAdmin()
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.email.error('Failed to fetch email preferences', { error: error.message });
        return res.status(500).json({ error: 'Failed to fetch preferences' });
      }

      // Return defaults if no row exists
      if (!data) {
        return res.status(200).json({
          scan_milestones: true,
          weekly_digest: true,
          monthly_digest: true,
          product_updates: true,
          upgrade_prompts: true,
          usage_warnings: true,
          security_alerts: true,
          unsubscribed_all: false,
        });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const body = req.body as Record<string, unknown>;
      const updates: Record<string, boolean> = {};

      for (const key of VALID_KEYS) {
        if (key in body && typeof body[key] === 'boolean') {
          updates[key] = body[key] as boolean;
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid preference fields provided' });
      }

      updates.updated_at = true; // triggers now() via default — but we need to set it manually
      const updatePayload = { ...updates, updated_at: new Date().toISOString() };

      // Upsert to handle first-time preference setting
      const { error } = await getSupabaseAdmin()
        .from('email_preferences')
        .upsert({
          user_id: user.id,
          ...updatePayload,
        }, { onConflict: 'user_id' });

      if (error) {
        logger.email.error('Failed to update email preferences', { error: error.message });
        return res.status(500).json({ error: 'Failed to update preferences' });
      }

      logger.email.info('Email preferences updated', { userId: user.id, updates: Object.keys(updates) });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.email.error('Email preferences API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
