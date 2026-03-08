// Cron: Send monthly scan digest — 1st of month 9am UTC
// Schedule: 0 9 1 * *

import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { sql, typedQuery } from '../_lib/db.js';
import { getSupabaseAdmin } from '../_lib/auth.js';
import { sendBatchEmail, type EmailCategory } from '../_lib/resend.js';
import { MonthlyDigestEmail } from '../emails/engagement/MonthlyDigestEmail.js';
import { logger } from '../_lib/logger.js';

const APP_URL = process.env.APP_URL || 'https://qriuscodes.com';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  try {
    const now = new Date();
    // Previous month's boundaries
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const monthName = MONTH_NAMES[now.getMonth() - 1] || MONTH_NAMES[11]; // Previous month

    const usersWithQR = await typedQuery<{ user_id: string }>(
      `SELECT DISTINCT user_id FROM qr_codes WHERE user_id IS NOT NULL AND status = 'active'`,
      []
    );

    const emails = [];

    for (const { user_id } of usersWithQR) {
      try {
        const { data: user } = await getSupabaseAdmin()
          .from('users')
          .select('email, raw_user_meta_data')
          .eq('id', user_id)
          .single();

        if (!user?.email) continue;

        const [thisMonth] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM scan_events se
           JOIN qr_codes q ON q.id = se.qr_code_id
           WHERE q.user_id = $1 AND se.scanned_at >= $2 AND se.scanned_at < $3`,
          [user_id, lastMonthStart.toISOString(), thisMonthStart.toISOString()]
        );

        const [prevMonth] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM scan_events se
           JOIN qr_codes q ON q.id = se.qr_code_id
           WHERE q.user_id = $1 AND se.scanned_at >= $2 AND se.scanned_at < $3`,
          [user_id, twoMonthsStart.toISOString(), lastMonthStart.toISOString()]
        );

        const totalScans = parseInt(thisMonth?.count || '0');
        const prevScans = parseInt(prevMonth?.count || '0');

        if (totalScans === 0) continue;

        const topQRs = await typedQuery<{ name: string; scans: string }>(
          `SELECT COALESCE(q.name, q.destination_url) as name, COUNT(*) as scans
           FROM scan_events se
           JOIN qr_codes q ON q.id = se.qr_code_id
           WHERE q.user_id = $1 AND se.scanned_at >= $2 AND se.scanned_at < $3
           GROUP BY q.id, q.name, q.destination_url
           ORDER BY scans DESC LIMIT 3`,
          [user_id, lastMonthStart.toISOString(), thisMonthStart.toISOString()]
        );

        const [newCodes] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM qr_codes
           WHERE user_id = $1 AND created_at >= $2 AND created_at < $3`,
          [user_id, lastMonthStart.toISOString(), thisMonthStart.toISOString()]
        );

        const [activeCodes] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM qr_codes
           WHERE user_id = $1 AND status = 'active'`,
          [user_id]
        );

        const scanChange = prevScans > 0
          ? Math.round(((totalScans - prevScans) / prevScans) * 100)
          : totalScans > 0 ? 100 : 0;

        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        await getSupabaseAdmin()
          .from('email_unsubscribe_tokens')
          .insert({
            token,
            user_id,
            category: 'monthly_digest',
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          });

        emails.push({
          to: user.email,
          subject: `Your ${monthName} recap: ${totalScans.toLocaleString()} scans`,
          react: React.createElement(MonthlyDigestEmail, {
            userName: (user.raw_user_meta_data as Record<string, unknown>)?.full_name as string | undefined,
            monthName,
            totalScans,
            scanChange,
            topQRCodes: topQRs.map((q) => ({ name: q.name, scans: parseInt(q.scans) })),
            newQRCodes: parseInt(newCodes?.count || '0'),
            totalActiveQRCodes: parseInt(activeCodes?.count || '0'),
            unsubscribeUrl: `${APP_URL}/unsubscribe?token=${token}`,
          }),
          from: 'Qrius Codes <hello@qrcodes.com>',
          category: 'monthly_digest' as EmailCategory,
          userId: user_id,
        });
      } catch (err) {
        logger.email.warn('Failed to build monthly digest for user', { userId: user_id, error: String(err) });
      }
    }

    await sendBatchEmail(emails);

    logger.email.info('Monthly digest cron completed', { sent: emails.length });
    return res.status(200).json({ success: true, sent: emails.length });
  } catch (error) {
    logger.email.error('Monthly digest cron failed', { error: String(error) });
    return res.status(500).json({ error: 'Cron failed' });
  }
}
