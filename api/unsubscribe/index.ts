// GET /api/unsubscribe?token=xxx - Process one-click unsubscribe
// POST /api/unsubscribe - Process unsubscribe with confirmation

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.method === 'GET' ? req.query.token : req.body?.token) as string;

  if (!token || typeof token !== 'string' || token.length > 128) {
    return res.status(400).json({ error: 'Invalid or missing token' });
  }

  try {
    // Look up token
    const { data: tokenRecord, error: tokenError } = await getSupabaseAdmin()
      .from('email_unsubscribe_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenRecord) {
      return res.status(404).json({ error: 'Invalid or expired unsubscribe link' });
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This unsubscribe link has expired' });
    }

    // Check if already used
    if (tokenRecord.used_at) {
      return res.status(200).json({ success: true, message: 'Already unsubscribed', category: tokenRecord.category });
    }

    const { user_id, category } = tokenRecord;

    // Unsubscribe: update preference
    const updateField = category === 'all'
      ? { unsubscribed_all: true }
      : { [category]: false };

    const { error: upsertError } = await getSupabaseAdmin()
      .from('email_preferences')
      .upsert({
        user_id,
        ...updateField,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      logger.email.error('Failed to process unsubscribe', { error: upsertError.message });
      return res.status(500).json({ error: 'Failed to unsubscribe' });
    }

    // Mark token as used
    await getSupabaseAdmin()
      .from('email_unsubscribe_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRecord.id);

    logger.email.info('User unsubscribed', { userId: user_id, category });

    return res.status(200).json({
      success: true,
      message: category === 'all'
        ? 'You have been unsubscribed from all emails'
        : `You have been unsubscribed from ${category.replace(/_/g, ' ')} emails`,
      category,
    });
  } catch (error) {
    logger.email.error('Unsubscribe error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
