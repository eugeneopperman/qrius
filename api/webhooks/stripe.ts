// POST /api/webhooks/stripe - Handle Stripe webhook events

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { notifyPaymentFailed } from '../_lib/notifications';
import { logger } from '../_lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Plan mapping from Stripe price IDs
const priceToPlan: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO || '']: 'pro',
  [process.env.STRIPE_PRICE_BUSINESS || '']: 'business',
};

export const config = {
  api: {
    bodyParser: false, // Stripe webhooks require raw body
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    logger.webhooks.error('Webhook signature verification failed', { error: String(err) });
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.webhooks.debug('Unhandled event type', { eventType: event.type });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.webhooks.error('Webhook handler error', { error: String(error) });
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;
  if (!organizationId) {
    logger.webhooks.error('No organization_id in checkout session metadata', { sessionId: session.id });
    return;
  }

  // Retrieve the subscription to get price info
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceToPlan[priceId] || 'free';

  // Update organization with subscription info
  await supabaseAdmin
    .from('organizations')
    .update({
      plan,
      stripe_subscription_id: subscriptionId,
    })
    .eq('id', organizationId);

  // Create or update subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    organization_id: organizationId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  logger.webhooks.info('Checkout completed', { organizationId, plan });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organization_id;
  if (!organizationId) {
    // Try to find by customer ID
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!org) {
      logger.webhooks.error('Could not find organization for subscription', { customerId: subscription.customer });
      return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceToPlan[priceId] || 'free';

    // Update organization
    await supabaseAdmin
      .from('organizations')
      .update({
        plan,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', org.id);

    // Update subscription record
    await supabaseAdmin.from('subscriptions').upsert({
      organization_id: org.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

    logger.webhooks.info('Subscription updated', { organizationId: org.id, status: subscription.status });
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceToPlan[priceId] || 'free';

  // Update organization
  await supabaseAdmin
    .from('organizations')
    .update({
      plan,
      stripe_subscription_id: subscription.id,
    })
    .eq('id', organizationId);

  // Update subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    organization_id: organizationId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  logger.webhooks.info('Subscription updated', { organizationId, status: subscription.status });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find organization by subscription ID
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) {
    logger.webhooks.error('Could not find subscription record', { subscriptionId: subscription.id });
    return;
  }

  // Downgrade to free plan
  await supabaseAdmin
    .from('organizations')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
    })
    .eq('id', sub.organization_id);

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  logger.webhooks.info('Subscription deleted', { organizationId: sub.organization_id });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Update subscription status to active
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('stripe_subscription_id', subscriptionId);

  logger.webhooks.info('Payment succeeded', { subscriptionId });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Update subscription status to past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  logger.webhooks.warn('Payment failed', { subscriptionId });

  // Find organization and send notification
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub?.organization_id) {
    await notifyPaymentFailed(sub.organization_id, {
      subscriptionId,
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      attemptCount: invoice.attempt_count || 1,
      nextAttempt: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : undefined,
    });
  }
}
