// Cron: Send weekly scan digest — Mondays 9am UTC
// Schedule: 0 9 * * 1

import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { sql, typedQuery } from '../_lib/db.js';
import { getSupabaseAdmin } from '../_lib/auth.js';
import { sendBatchEmail, type EmailCategory } from '../_lib/resend.js';
import { WeeklyDigestEmail } from '../emails/engagement/WeeklyDigestEmail.js';
import { logger } from '../_lib/logger.js';

const APP_URL = process.env.APP_URL || 'https://qriuscodes.com';

interface UserDigest {
  user_id: string;
  email: string;
  name?: string;
  total_scans: number;
  prev_scans: number;
  new_qr_codes: number;
  top_qr_codes: Array<{ name: string; scans: number }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all users who have QR codes (batch by user)
    const usersWithQR = await typedQuery<{ user_id: string }>(
      `SELECT DISTINCT user_id FROM qr_codes WHERE user_id IS NOT NULL AND status = 'active'`,
      []
    );

    const digests: UserDigest[] = [];

    for (const { user_id } of usersWithQR) {
      try {
        // Get user email from Supabase
        const { data: user } = await getSupabaseAdmin()
          .from('users')
          .select('email, name')
          .eq('id', user_id)
          .single();

        if (!user?.email) continue;

        // Get scan counts for this week and last week
        const [thisWeek] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM scan_events se
           JOIN qr_codes q ON q.id = se.qr_code_id
           WHERE q.user_id = $1 AND se.scanned_at >= $2`,
          [user_id, weekAgo.toISOString()]
        );

        const [lastWeek] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM scan_events se
           JOIN qr_codes q ON q.id = se.qr_code_id
           WHERE q.user_id = $1 AND se.scanned_at >= $2 AND se.scanned_at < $3`,
          [user_id, twoWeeksAgo.toISOString(), weekAgo.toISOString()]
        );

        const totalScans = parseInt(thisWeek?.count || '0');
        const prevScans = parseInt(lastWeek?.count || '0');

        // Skip if no scans this week
        if (totalScans === 0) continue;

        // Top 3 QR codes by scans this week
        const topQRs = await typedQuery<{ name: string; scans: string }>(
          `SELECT COALESCE(q.name, q.destination_url) as name, COUNT(*) as scans
           FROM scan_events se
           JOIN qr_codes q ON q.id = se.qr_code_id
           WHERE q.user_id = $1 AND se.scanned_at >= $2
           GROUP BY q.id, q.name, q.destination_url
           ORDER BY scans DESC
           LIMIT 3`,
          [user_id, weekAgo.toISOString()]
        );

        // New QR codes this week
        const [newCodes] = await typedQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM qr_codes
           WHERE user_id = $1 AND created_at >= $2`,
          [user_id, weekAgo.toISOString()]
        );

        digests.push({
          user_id,
          email: user.email,
          name: user.name || undefined,
          total_scans: totalScans,
          prev_scans: prevScans,
          new_qr_codes: parseInt(newCodes?.count || '0'),
          top_qr_codes: topQRs.map((q) => ({ name: q.name, scans: parseInt(q.scans) })),
        });
      } catch (err) {
        logger.email.warn('Failed to build digest for user', { userId: user_id, error: String(err) });
      }
    }

    // Generate unsubscribe tokens and send batch
    const emails = [];
    for (const digest of digests) {
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      await getSupabaseAdmin()
        .from('email_unsubscribe_tokens')
        .insert({
          token,
          user_id: digest.user_id,
          category: 'weekly_digest',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        });

      const scanChange = digest.prev_scans > 0
        ? Math.round(((digest.total_scans - digest.prev_scans) / digest.prev_scans) * 100)
        : digest.total_scans > 0 ? 100 : 0;

      emails.push({
        to: digest.email,
        subject: `Your week: ${digest.total_scans.toLocaleString()} scans`,
        react: React.createElement(WeeklyDigestEmail, {
          userName: digest.name,
          totalScans: digest.total_scans,
          scanChange,
          topQRCodes: digest.top_qr_codes,
          newQRCodes: digest.new_qr_codes,
          unsubscribeUrl: `${APP_URL}/unsubscribe?token=${token}`,
        }),
        from: 'Qrius Codes <hello@qriuscodes.com>',
        category: 'weekly_digest' as EmailCategory,
        userId: digest.user_id,
      });
    }

    await sendBatchEmail(emails);

    logger.email.info('Weekly digest cron completed', { sent: emails.length });
    return res.status(200).json({ success: true, sent: emails.length });
  } catch (error) {
    logger.email.error('Weekly digest cron failed', { error: String(error) });
    return res.status(500).json({ error: 'Cron failed' });
  }
}
