// Cron: Send usage warnings daily at 6am UTC
// Schedule: 0 6 * * *

import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { sql, typedQuery } from '../_lib/db.js';
import { getSupabaseAdmin } from '../_lib/auth.js';
import { sendEmail, type EmailCategory } from '../_lib/resend.js';
import { UsageWarningEmail } from '../emails/system/UsageWarningEmail.js';
import { logger } from '../_lib/logger.js';

const APP_URL = process.env.APP_URL || 'https://qriuscodes.com';
const THRESHOLDS = [80, 95]; // Send warning at 80% and 95%

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  try {
    // Get all organizations with their plans
    const { data: orgs, error: orgsError } = await getSupabaseAdmin()
      .from('organizations')
      .select('id, name, plan')
      .neq('plan', 'business'); // Business = unlimited

    if (orgsError || !orgs) {
      return res.status(500).json({ error: 'Failed to fetch organizations' });
    }

    // Get plan limits
    const { data: allLimits } = await getSupabaseAdmin()
      .from('plan_limits')
      .select('plan, qr_codes_limit');

    const limitMap: Record<string, number> = {};
    for (const l of allLimits || []) {
      limitMap[l.plan] = l.qr_codes_limit;
    }

    let totalSent = 0;

    for (const org of orgs) {
      const qrLimit = limitMap[org.plan];
      if (!qrLimit || qrLimit === -1) continue; // Unlimited

      // Count QR codes in Neon
      const [countResult] = await typedQuery<{ count: string }>(
        `SELECT COUNT(*) as count FROM qr_codes WHERE organization_id = $1`,
        [org.id]
      );
      const qrCount = parseInt(countResult?.count || '0');
      const percent = Math.round((qrCount / qrLimit) * 100);

      // Check if any threshold is met
      const matchedThreshold = THRESHOLDS.find((t) => percent >= t);
      if (!matchedThreshold) continue;

      // Check if we already sent a warning for this threshold today
      const today = new Date().toISOString().slice(0, 10);
      const [existing] = await typedQuery<{ count: string }>(
        `SELECT COUNT(*) as count FROM email_log
         WHERE metadata->>'org_id' = $1
           AND metadata->>'threshold' = $2
           AND created_at::date = $3::date
           AND email_type LIKE '%Usage%'`,
        [org.id, String(matchedThreshold), today]
      );
      if (parseInt(existing?.count || '0') > 0) continue;

      // Get org admins
      const { data: members } = await getSupabaseAdmin()
        .from('organization_members')
        .select('user_id, user:users(email)')
        .eq('organization_id', org.id)
        .in('role', ['owner', 'admin']);

      if (!members || members.length === 0) continue;

      for (const member of members) {
        const email = (member as unknown as { user: { email: string } | null }).user?.email;
        if (!email) continue;

        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        await getSupabaseAdmin()
          .from('email_unsubscribe_tokens')
          .insert({
            token,
            user_id: member.user_id,
            category: 'usage_warnings',
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          });

        await sendEmail({
          to: email,
          subject: `${percent}% of QR code limit used — ${org.name}`,
          react: React.createElement(UsageWarningEmail, {
            organizationName: org.name,
            resourceType: 'QR codes',
            current: qrCount,
            limit: qrLimit,
            percent,
            unsubscribeUrl: `${APP_URL}/unsubscribe?token=${token}`,
          }),
          category: 'usage_warnings' as EmailCategory,
          userId: member.user_id,
          metadata: { org_id: org.id, threshold: String(matchedThreshold) },
        });

        totalSent++;
      }
    }

    logger.email.info('Usage warnings cron completed', { sent: totalSent });
    return res.status(200).json({ success: true, sent: totalSent });
  } catch (error) {
    logger.email.error('Usage warnings cron failed', { error: String(error) });
    return res.status(500).json({ error: 'Cron failed' });
  }
}
