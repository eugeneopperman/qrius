// Notification utilities for sending alerts to users
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface PaymentFailureDetails {
  subscriptionId: string;
  invoiceId?: string;
  amount?: number;
  currency?: string;
  attemptCount?: number;
  nextAttempt?: Date;
}

/**
 * Get organization admin emails for notifications
 */
async function getOrgAdminEmails(organizationId: string): Promise<string[]> {
  const { data: members, error } = await supabaseAdmin
    .from('organization_members')
    .select(`
      user_id,
      role,
      user:users(email)
    `)
    .eq('organization_id', organizationId)
    .in('role', ['owner', 'admin']);

  if (error || !members) {
    logger.notifications.error('Failed to fetch org admins', { organizationId, error: error?.message });
    return [];
  }

  return members
    .map((m) => (m.user as { email: string } | null)?.email)
    .filter((email): email is string => !!email);
}

/**
 * Send payment failure notification to organization admins
 *
 * Note: This currently logs the notification. To enable email delivery,
 * integrate with an email service (Resend, SendGrid, etc.) and update this function.
 */
export async function notifyPaymentFailed(
  organizationId: string,
  details: PaymentFailureDetails
): Promise<void> {
  try {
    // Get organization details
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    // Get admin emails
    const adminEmails = await getOrgAdminEmails(organizationId);

    if (adminEmails.length === 0) {
      logger.notifications.warn('No admin emails found for organization', { organizationId });
      return;
    }

    const orgName = org?.name || 'Your organization';

    // Log the notification (replace with actual email service)
    logger.notifications.info('Payment failure notification', {
      organizationId,
      organizationName: orgName,
      subscriptionId: details.subscriptionId,
      recipients: adminEmails,
      amount: details.amount && details.currency
        ? `${(details.amount / 100).toFixed(2)} ${details.currency.toUpperCase()}`
        : undefined,
      attemptCount: details.attemptCount,
      nextAttempt: details.nextAttempt?.toISOString(),
    });

    // TODO: Integrate with email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Qrius <billing@qrius.app>',
    //   to: adminEmails,
    //   subject: `Payment failed for ${orgName}`,
    //   html: `<p>Your payment for ${orgName} has failed...</p>`,
    // });

    // Store notification record for audit trail
    // This could be extended to use a notifications table

  } catch (error) {
    logger.notifications.error('Failed to send payment failure notification', {
      organizationId,
      error: String(error),
    });
    // Don't throw - notification failures shouldn't break webhook processing
  }
}

/**
 * Send subscription canceled notification
 */
export async function notifySubscriptionCanceled(
  organizationId: string,
  effectiveDate: Date
): Promise<void> {
  try {
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    const adminEmails = await getOrgAdminEmails(organizationId);

    logger.notifications.info('Subscription canceled notification', {
      organizationId,
      organizationName: org?.name,
      effectiveDate: effectiveDate.toISOString(),
      recipients: adminEmails,
    });

  } catch (error) {
    logger.notifications.error('Failed to send cancellation notification', {
      organizationId,
      error: String(error),
    });
  }
}
