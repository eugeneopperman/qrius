// POST /api/moderation/report — Public abuse report endpoint
// No auth required, rate limited by IP

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { logger } from '../_lib/logger.js';
import { validateOptionalString } from '../_lib/validate.js';
import { createHash } from 'crypto';

const VALID_REASONS = ['phishing', 'malware', 'scam', 'spam', 'inappropriate', 'copyright', 'other'] as const;

/** Auto-flag threshold: N distinct reporters triggers auto-flag */
const AUTO_FLAG_THRESHOLD = 3;

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT || 'qrius-report')).digest('hex').slice(0, 16);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const ipHash = hashIP(ip);

  // Rate limit: 5 reports per IP per day
  const rl = await checkRateLimit(`report:${ipHash}`, 5);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many reports. Please try again tomorrow.' });
  }

  const body = req.body as {
    short_code?: string;
    reason?: string;
    description?: string;
    email?: string;
  };

  // Validate short_code
  if (!body.short_code || typeof body.short_code !== 'string' || body.short_code.length > 20) {
    return res.status(400).json({ error: 'short_code is required (max 20 chars)' });
  }
  const shortCode = body.short_code.trim();

  // Validate reason
  if (!body.reason || !VALID_REASONS.includes(body.reason as typeof VALID_REASONS[number])) {
    return res.status(400).json({ error: `reason must be one of: ${VALID_REASONS.join(', ')}` });
  }

  // Validate description
  if (body.description !== undefined) {
    const desc = validateOptionalString(body.description, 1000);
    if (desc === null) return res.status(400).json({ error: 'description must be 1000 characters or fewer' });
  }

  // Validate email
  if (body.email !== undefined && body.email !== '') {
    if (typeof body.email !== 'string' || body.email.length > 320 || !body.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
  }

  try {
    // Look up QR code by short_code
    const qrResult = await sql`
      SELECT id, destination_url, moderation_status FROM qr_codes WHERE short_code = ${shortCode}
    `;

    if (qrResult.length === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrCode = qrResult[0] as { id: string; destination_url: string; moderation_status: string };

    // Dedup: same IP can't report same QR code twice in 24h
    const existingReport = await sql`
      SELECT id FROM moderation_reports
      WHERE short_code = ${shortCode}
        AND reporter_ip_hash = ${ipHash}
        AND created_at > NOW() - INTERVAL '24 hours'
      LIMIT 1
    `;

    if (existingReport.length > 0) {
      return res.status(409).json({ error: 'You have already reported this QR code' });
    }

    // Insert report
    await sql`
      INSERT INTO moderation_reports (qr_code_id, short_code, reported_url, reason, description, reporter_email, reporter_ip_hash, source)
      VALUES (
        ${qrCode.id},
        ${shortCode},
        ${qrCode.destination_url},
        ${body.reason},
        ${body.description || null},
        ${body.email || null},
        ${ipHash},
        'user'
      )
    `;

    // Auto-flag: check if threshold reached (distinct reporters)
    if (qrCode.moderation_status === 'clean') {
      const reportCount = await sql`
        SELECT COUNT(DISTINCT reporter_ip_hash) as cnt
        FROM moderation_reports
        WHERE qr_code_id = ${qrCode.id}
      `;
      const distinctReporters = parseInt(String(reportCount[0]?.cnt)) || 0;

      if (distinctReporters >= AUTO_FLAG_THRESHOLD) {
        await sql`UPDATE qr_codes SET moderation_status = 'flagged', updated_at = NOW() WHERE id = ${qrCode.id}`;
        logger.qrCodes.info('Auto-flagged QR code (report threshold)', { qrCodeId: qrCode.id, shortCode, reporters: distinctReporters });
      }
    }

    logger.qrCodes.info('Abuse report submitted', { shortCode, reason: body.reason, source: 'user' });

    return res.status(201).json({ success: true, message: 'Report submitted. Thank you for helping keep Qrius safe.' });
  } catch (error) {
    logger.qrCodes.error('Report submission error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
