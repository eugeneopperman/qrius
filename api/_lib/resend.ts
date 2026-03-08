// Resend email client singleton + sendEmail wrapper
import { Resend } from 'resend';
import { logger } from './logger.js';
import { sql } from './db.js';
import { getSupabaseAdmin } from './auth.js';
import type { ReactElement } from 'react';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export type EmailCategory =
  | 'transactional'
  | 'scan_milestones'
  | 'weekly_digest'
  | 'monthly_digest'
  | 'product_updates'
  | 'upgrade_prompts'
  | 'usage_warnings'
  | 'security_alerts';

// Map category to the email_preferences column name
const CATEGORY_COLUMN: Record<string, string> = {
  scan_milestones: 'scan_milestones',
  weekly_digest: 'weekly_digest',
  monthly_digest: 'monthly_digest',
  product_updates: 'product_updates',
  upgrade_prompts: 'upgrade_prompts',
  usage_warnings: 'usage_warnings',
  security_alerts: 'security_alerts',
};

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  category?: EmailCategory;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Check if user has unsubscribed from this email category
 */
async function isUnsubscribed(userId: string, category: EmailCategory): Promise<boolean> {
  if (category === 'transactional') return false; // Always send transactional

  const column = CATEGORY_COLUMN[category];
  if (!column) return false;

  try {
    const { data } = await getSupabaseAdmin()
      .from('email_preferences')
      .select(`unsubscribed_all, ${column}`)
      .eq('user_id', userId)
      .single();

    if (!data) return false; // No preferences = subscribed by default
    if (data.unsubscribed_all) return true;
    return data[column] === false;
  } catch {
    return false; // Default to sending on error
  }
}

/**
 * Log email to audit trail
 */
async function logEmail(
  userId: string | null,
  emailTo: string,
  emailType: string,
  category: EmailCategory,
  resendId: string | null,
  status: 'sent' | 'skipped' | 'failed',
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO email_log (user_id, email_to, email_type, category, resend_id, status, metadata)
      VALUES (${userId}, ${emailTo}, ${emailType}, ${category}, ${resendId}, ${status}, ${metadata ? JSON.stringify(metadata) : null})
    `;
  } catch (err) {
    logger.email.warn('Failed to log email', { error: String(err) });
  }
}

/**
 * Send an email via Resend. Fire-and-forget — never throws.
 */
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  const {
    to,
    subject,
    react,
    from = 'Qrius Codes <noreply@qrcodes.com>',
    category = 'transactional',
    userId,
    metadata,
  } = options;

  const recipients = Array.isArray(to) ? to : [to];
  const emailType = subject; // Use subject as email type identifier

  try {
    // Check preferences if userId provided and not transactional
    if (userId && category !== 'transactional') {
      const unsubscribed = await isUnsubscribed(userId, category);
      if (unsubscribed) {
        logger.email.info('Email skipped (unsubscribed)', { userId, category, subject });
        for (const recipient of recipients) {
          await logEmail(userId, recipient, emailType, category, null, 'skipped', metadata);
        }
        return null;
      }
    }

    const resend = getResend();
    if (!resend) {
      logger.email.warn('Resend not configured — email not sent', { subject, to: recipients });
      return null;
    }

    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      react,
    });

    if (error) {
      logger.email.error('Resend API error', { error: error.message, subject });
      for (const recipient of recipients) {
        await logEmail(userId || null, recipient, emailType, category, null, 'failed', { error: error.message, ...metadata });
      }
      return null;
    }

    const resendId = data?.id || null;
    logger.email.info('Email sent', { resendId, subject, to: recipients, category });

    for (const recipient of recipients) {
      await logEmail(userId || null, recipient, emailType, category, resendId, 'sent', metadata);
    }

    return resendId;
  } catch (err) {
    logger.email.error('Failed to send email', { error: String(err), subject });
    return null;
  }
}

/**
 * Send batch emails via Resend (up to 100 per call).
 */
export async function sendBatchEmail(
  emails: Array<{
    to: string;
    subject: string;
    react: ReactElement;
    from?: string;
    category?: EmailCategory;
    userId?: string;
  }>
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.email.warn('Resend not configured — batch not sent', { count: emails.length });
    return;
  }

  // Filter out unsubscribed users
  const filtered: typeof emails = [];
  for (const email of emails) {
    if (email.userId && email.category && email.category !== 'transactional') {
      const unsubscribed = await isUnsubscribed(email.userId, email.category);
      if (unsubscribed) {
        await logEmail(email.userId, email.to, email.subject, email.category, null, 'skipped');
        continue;
      }
    }
    filtered.push(email);
  }

  if (filtered.length === 0) return;

  // Resend batch API supports up to 100 emails per call
  const batchSize = 100;
  for (let i = 0; i < filtered.length; i += batchSize) {
    const batch = filtered.slice(i, i + batchSize);
    try {
      const { data, error } = await resend.batch.send(
        batch.map((e) => ({
          from: e.from || 'Qrius Codes <noreply@qrcodes.com>',
          to: e.to,
          subject: e.subject,
          react: e.react,
        }))
      );

      if (error) {
        logger.email.error('Batch send error', { error: error.message, batchSize: batch.length });
        continue;
      }

      // Log each sent email
      const ids = data?.data || [];
      for (let j = 0; j < batch.length; j++) {
        const email = batch[j];
        const resendId = ids[j]?.id || null;
        await logEmail(
          email.userId || null,
          email.to,
          email.subject,
          email.category || 'transactional',
          resendId,
          'sent'
        );
      }

      logger.email.info('Batch sent', { count: batch.length });
    } catch (err) {
      logger.email.error('Batch send failed', { error: String(err), batchSize: batch.length });
    }
  }
}
