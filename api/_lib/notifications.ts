// Notification utilities — sends emails via Resend
import React from 'react';
import { getSupabaseAdmin } from './auth.js';
import { logger } from './logger.js';
import { sendEmail, type EmailCategory } from './resend.js';
import { WelcomeEmail } from '../emails/transactional/WelcomeEmail.js';
import { TeamInviteEmail } from '../emails/transactional/TeamInviteEmail.js';
import { PaymentReceiptEmail } from '../emails/transactional/PaymentReceiptEmail.js';
import { PaymentFailedEmail } from '../emails/transactional/PaymentFailedEmail.js';
import { SubscriptionChangedEmail } from '../emails/transactional/SubscriptionChangedEmail.js';
import { FirstQRCreatedEmail } from '../emails/engagement/FirstQRCreatedEmail.js';
import { ApiKeyCreatedEmail } from '../emails/system/ApiKeyCreatedEmail.js';

export interface PaymentFailureDetails {
  subscriptionId: string;
  invoiceId?: string;
  amount?: number;
  currency?: string;
  attemptCount?: number;
  nextAttempt?: Date;
}

/** Shape of the Supabase join result for user:users(email) */
interface MemberWithUser {
  user_id: string;
  role: string;
  user: { email: string; raw_user_meta_data?: Record<string, unknown> } | null;
}

const APP_URL = process.env.APP_URL || 'https://qriuscodes.com';

/**
 * Generate a one-click unsubscribe URL
 */
async function getUnsubscribeUrl(userId: string, category: EmailCategory): Promise<string> {
  try {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days

    await getSupabaseAdmin()
      .from('email_unsubscribe_tokens')
      .insert({
        token,
        user_id: userId,
        category,
        expires_at: expiresAt.toISOString(),
      });

    return `${APP_URL}/unsubscribe?token=${token}`;
  } catch (err) {
    logger.email.warn('Failed to create unsubscribe token', { userId, error: String(err) });
    return `${APP_URL}/settings?tab=notifications`;
  }
}

/**
 * Get organization admin emails for notifications
 */
async function getOrgAdminEmails(organizationId: string): Promise<Array<{ email: string; userId: string; name?: string }>> {
  const { data: members, error } = await getSupabaseAdmin()
    .from('organization_members')
    .select(`
      user_id,
      role,
      user:users(email, raw_user_meta_data)
    `)
    .eq('organization_id', organizationId)
    .in('role', ['owner', 'admin']);

  if (error || !members) {
    logger.notifications.error('Failed to fetch org admins', { organizationId, error: error?.message });
    return [];
  }

  return (members as unknown as MemberWithUser[])
    .filter((m) => m.user?.email)
    .map((m) => ({
      email: m.user!.email,
      userId: m.user_id,
      name: (m.user?.raw_user_meta_data?.full_name as string) || undefined,
    }));
}

/**
 * Send welcome email to new user
 */
export async function notifyWelcome(userId: string, email: string, userName?: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to Qrius Codes!',
    react: React.createElement(WelcomeEmail, { userName }),
    from: 'Qrius Codes <hello@qriuscodes.com>',
    category: 'transactional',
    userId,
  });
}

/**
 * Send team invite email
 */
export async function notifyTeamInvite(
  email: string,
  inviterName: string,
  organizationName: string,
  role: string,
  inviteLink: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `${inviterName} invited you to join ${organizationName}`,
    react: React.createElement(TeamInviteEmail, {
      inviterName,
      organizationName,
      role,
      inviteLink,
    }),
    category: 'transactional',
  });
}

/**
 * Send payment receipt email
 */
export async function notifyPaymentReceipt(
  organizationId: string,
  details: { amount: string; planName: string; invoiceDate: string; invoiceUrl?: string }
): Promise<void> {
  try {
    const { data: org } = await getSupabaseAdmin()
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const admins = await getOrgAdminEmails(organizationId);
    const orgName = org?.name || 'Your organization';

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Payment received — ${details.amount}`,
        react: React.createElement(PaymentReceiptEmail, {
          organizationName: orgName,
          ...details,
        }),
        category: 'transactional',
        userId: admin.userId,
      });
    }
  } catch (error) {
    logger.notifications.error('Failed to send payment receipt', { organizationId, error: String(error) });
  }
}

/**
 * Send payment failure notification to organization admins
 */
export async function notifyPaymentFailed(
  organizationId: string,
  details: PaymentFailureDetails
): Promise<void> {
  try {
    const { data: org } = await getSupabaseAdmin()
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const admins = await getOrgAdminEmails(organizationId);
    const orgName = org?.name || 'Your organization';

    if (admins.length === 0) {
      logger.notifications.warn('No admin emails found for organization', { organizationId });
      return;
    }

    const amount = details.amount && details.currency
      ? `$${(details.amount / 100).toFixed(2)} ${details.currency.toUpperCase()}`
      : 'your subscription';

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Action required — payment failed for ${orgName}`,
        react: React.createElement(PaymentFailedEmail, {
          organizationName: orgName,
          amount,
          attemptCount: details.attemptCount || 1,
          nextRetryDate: details.nextAttempt?.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          }),
        }),
        category: 'transactional',
        userId: admin.userId,
      });
    }

    logger.notifications.info('Payment failure notification sent', {
      organizationId,
      recipients: admins.map((a) => a.email),
    });
  } catch (error) {
    logger.notifications.error('Failed to send payment failure notification', {
      organizationId,
      error: String(error),
    });
  }
}

/**
 * Send subscription changed email
 */
export async function notifySubscriptionChanged(
  organizationId: string,
  previousPlan: string,
  newPlan: string,
  changeType: 'upgraded' | 'downgraded' | 'canceled' | 'reactivated'
): Promise<void> {
  try {
    const { data: org } = await getSupabaseAdmin()
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const admins = await getOrgAdminEmails(organizationId);
    const orgName = org?.name || 'Your organization';

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: changeType === 'upgraded'
          ? `Plan upgraded to ${newPlan}!`
          : changeType === 'canceled'
            ? `Subscription canceled — ${orgName}`
            : `Plan changed — ${orgName}`,
        react: React.createElement(SubscriptionChangedEmail, {
          organizationName: orgName,
          previousPlan,
          newPlan,
          changeType,
          effectiveDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        }),
        category: 'transactional',
        userId: admin.userId,
      });
    }
  } catch (error) {
    logger.notifications.error('Failed to send subscription changed email', { organizationId, error: String(error) });
  }
}

/**
 * Send "first QR code created" email
 */
export async function notifyFirstQRCreated(
  userId: string,
  email: string,
  userName?: string,
  qrCodeName?: string
): Promise<void> {
  const unsubscribeUrl = await getUnsubscribeUrl(userId, 'product_updates');

  await sendEmail({
    to: email,
    subject: 'Your first QR code is live! 🎉',
    react: React.createElement(FirstQRCreatedEmail, { userName, qrCodeName, unsubscribeUrl }),
    from: 'Qrius Codes <hello@qriuscodes.com>',
    category: 'product_updates',
    userId,
  });
}

/**
 * Send API key created email
 */
export async function notifyApiKeyCreated(
  userId: string,
  email: string,
  keyName: string,
  keyPrefix: string,
  userName?: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `New API key created: ${keyName}`,
    react: React.createElement(ApiKeyCreatedEmail, { userName, keyName, keyPrefix }),
    category: 'transactional',
    userId,
  });
}
