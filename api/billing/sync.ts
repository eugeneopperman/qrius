// POST /api/billing/sync - Sync subscription status from Stripe to database
// Called on billing page mount to ensure DB reflects reality

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getSupabaseAdmin, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
    _stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return _stripe;
}

// Plan mapping from Stripe price IDs
function buildPriceToPlan(): Record<string, string> {
  const map: Record<string, string> = {};
  const entries: [string | undefined, string][] = [
    [process.env.STRIPE_PRICE_STARTER, 'starter'],
    [process.env.STRIPE_PRICE_STARTER_ANNUAL, 'starter'],
    [process.env.STRIPE_PRICE_PRO, 'pro'],
    [process.env.STRIPE_PRICE_PRO_ANNUAL, 'pro'],
    [process.env.STRIPE_PRICE_BUSINESS, 'business'],
    [process.env.STRIPE_PRICE_BUSINESS_ANNUAL, 'business'],
  ];
  for (const [priceId, plan] of entries) {
    if (priceId) map[priceId] = plan;
  }
  return map;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    const { organizationId } = await getUserOrganization(user.id);
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Get organization's Stripe subscription ID
    const { data: org, error: orgError } = await getSupabaseAdmin()
      .from('organizations')
      .select('id, plan, stripe_customer_id, stripe_subscription_id')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // No Stripe subscription — ensure plan is free
    if (!org.stripe_subscription_id) {
      if (org.plan !== 'free') {
        await getSupabaseAdmin()
          .from('organizations')
          .update({ plan: 'free' })
          .eq('id', organizationId);

        logger.billing.info('Sync: org had no subscription but non-free plan, corrected to free', { organizationId });
      }

      return res.status(200).json({
        synced: true,
        plan: 'free',
        status: null,
        cancel_at_period_end: false,
      });
    }

    // Fetch the actual subscription from Stripe
    let stripeSubscription: Stripe.Subscription;
    try {
      stripeSubscription = await getStripe().subscriptions.retrieve(org.stripe_subscription_id);
    } catch (stripeError) {
      // Subscription doesn't exist in Stripe (deleted, invalid ID, etc.)
      logger.billing.warn('Sync: Stripe subscription not found, downgrading to free', {
        organizationId,
        subscriptionId: org.stripe_subscription_id,
        error: String(stripeError),
      });

      await getSupabaseAdmin()
        .from('organizations')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', organizationId);

      await getSupabaseAdmin()
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', org.stripe_subscription_id);

      return res.status(200).json({
        synced: true,
        plan: 'free',
        status: 'canceled',
        cancel_at_period_end: false,
      });
    }

    const priceToPlan = buildPriceToPlan();
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const stripePlan = priceId ? (priceToPlan[priceId] || 'free') : 'free';
    const stripeStatus = stripeSubscription.status; // active, canceled, past_due, etc.
    const cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    // Determine the effective plan
    // If subscription is canceled or incomplete_expired, plan is free
    const isCanceled = stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired';
    const effectivePlan = isCanceled ? 'free' : stripePlan;

    // Update organization plan
    const orgUpdate: Record<string, unknown> = { plan: effectivePlan };
    if (isCanceled) {
      orgUpdate.stripe_subscription_id = null;
    }

    await getSupabaseAdmin()
      .from('organizations')
      .update(orgUpdate)
      .eq('id', organizationId);

    // Upsert subscription record
    await getSupabaseAdmin().from('subscriptions').upsert({
      organization_id: organizationId,
      stripe_subscription_id: stripeSubscription.id,
      stripe_price_id: priceId || null,
      status: stripeStatus === 'incomplete_expired' ? 'canceled' : stripeStatus,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    logger.billing.info('Sync completed', {
      organizationId,
      stripePlan,
      effectivePlan,
      stripeStatus,
      cancelAtPeriodEnd,
    });

    return res.status(200).json({
      synced: true,
      plan: effectivePlan,
      status: stripeStatus,
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.billing.error('Sync error', { error: String(error) });
    return res.status(500).json({ error: 'Failed to sync subscription' });
  }
}
