// Cron: Check for scan milestones every 6 hours
// Schedule: 0 */6 * * *

import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { sql, typedQuery } from '../_lib/db.js';
import { getSupabaseAdmin } from '../_lib/auth.js';
import { sendEmail, type EmailCategory } from '../_lib/resend.js';
import { ScanMilestoneEmail } from '../emails/engagement/ScanMilestoneEmail.js';
import { logger } from '../_lib/logger.js';

const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];
const BATCH_SIZE = 50;
const APP_URL = process.env.APP_URL || 'https://qriuscodes.com';

interface MilestoneCandidate {
  id: string;
  name: string;
  total_scans: number;
  user_id: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    let totalProcessed = 0;

    for (const milestone of MILESTONES) {
      // Find QR codes that crossed this milestone but haven't been notified
      const candidates = await typedQuery<MilestoneCandidate>(
        `SELECT q.id, q.name, q.total_scans, q.user_id
         FROM qr_codes q
         WHERE q.total_scans >= $1
           AND q.user_id IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM scan_milestones_reached sm
             WHERE sm.qr_code_id = q.id AND sm.milestone = $1
           )
         LIMIT $2`,
        [milestone, BATCH_SIZE]
      );

      for (const qr of candidates) {
        try {
          // Record milestone reached
          await sql`
            INSERT INTO scan_milestones_reached (qr_code_id, milestone)
            VALUES (${qr.id}, ${milestone})
            ON CONFLICT DO NOTHING
          `;

          // Get user email
          const { data: user } = await getSupabaseAdmin()
            .from('users')
            .select('email, raw_user_meta_data')
            .eq('id', qr.user_id)
            .single();

          if (!user?.email) continue;

          const userName = (user.raw_user_meta_data as Record<string, unknown>)?.full_name as string | undefined;

          // Generate unsubscribe URL
          const crypto = await import('crypto');
          const token = crypto.randomBytes(32).toString('hex');
          await getSupabaseAdmin()
            .from('email_unsubscribe_tokens')
            .insert({
              token,
              user_id: qr.user_id,
              category: 'scan_milestones',
              expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            });

          await sendEmail({
            to: user.email,
            subject: `🎉 ${milestone.toLocaleString()} scans on "${qr.name || 'your QR code'}"!`,
            react: React.createElement(ScanMilestoneEmail, {
              userName,
              qrCodeName: qr.name || 'Your QR code',
              milestone,
              totalScans: qr.total_scans,
              unsubscribeUrl: `${APP_URL}/unsubscribe?token=${token}`,
            }),
            from: 'Qrius Codes <hello@qrcodes.com>',
            category: 'scan_milestones' as EmailCategory,
            userId: qr.user_id,
          });

          totalProcessed++;
        } catch (err) {
          logger.email.error('Failed to process milestone', { qrId: qr.id, milestone, error: String(err) });
        }
      }
    }

    logger.email.info('Scan milestones cron completed', { processed: totalProcessed });
    return res.status(200).json({ success: true, processed: totalProcessed });
  } catch (error) {
    logger.email.error('Scan milestones cron failed', { error: String(error) });
    return res.status(500).json({ error: 'Cron failed' });
  }
}
