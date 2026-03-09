// POST /api/users/welcome - Send welcome email to newly signed-up user
// Called once from frontend after first profile creation

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, UnauthorizedError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';
import { sql } from '../_lib/db.js';
import { notifyWelcome } from '../_lib/notifications.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireAuth(req);

    // Check if we already sent a welcome email (idempotent)
    if (sql) {
      const existing = await sql`
        SELECT id FROM email_log
        WHERE user_id = ${user.id}
          AND email_type = 'Welcome to Qrius Codes!'
          AND status = 'sent'
        LIMIT 1
      `;
      if (existing.length > 0) {
        return res.status(200).json({ sent: false, reason: 'already_sent' });
      }
    }

    // Get user name from request body or default
    const userName = req.body?.userName as string | undefined;

    await notifyWelcome(user.id, user.email, userName);

    logger.email.info('Welcome email triggered', { userId: user.id });
    return res.status(200).json({ sent: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.email.error('Welcome email endpoint error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
