// POST /api/billing/checkout - Create Stripe checkout session
// POST /api/billing/checkout?action=portal - Create Stripe customer portal session
// POST /api/billing/checkout?action=sync - Sync subscription status from Stripe to DB

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getSupabaseAdmin, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { isValidHttpUrl } from '../_lib/validate.js';
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

interface CheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res, 'POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await requireAuth(req);

    // Rate limit: 10 checkout/portal requests per day per user
    const rateLimit = await checkRateLimit(`billing:${user.id}`, 10);
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many billing requests. Please try again later.' });
    }

    const { organizationId } = await getUserOrganization(user.id);

    // Only owners and admins can manage billing
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Route portal requests
    if (req.query.action === 'portal') {
      return await handlePortal(req, res, user, organizationId);
    }

    // Route sync requests
    if (req.query.action === 'sync') {
      return await handleSync(res, organizationId);
    }

    const body = req.body as CheckoutRequest;

    if (!body.priceId || typeof body.priceId !== 'string') {
      return res.status(400).json({ error: 'priceId is required' });
    }

    // Validate priceId format (Stripe price IDs start with "price_")
    if (!body.priceId.startsWith('price_') || body.priceId.length > 100) {
      return res.status(400).json({ error: 'Invalid priceId format' });
    }

    // Validate redirect URLs if provided — only allow http/https
    if (body.successUrl && !isValidHttpUrl(body.successUrl)) {
      return res.status(400).json({ error: 'successUrl must be a valid http or https URL' });
    }
    if (body.cancelUrl && !isValidHttpUrl(body.cancelUrl)) {
      return res.status(400).json({ error: 'cancelUrl must be a valid http or https URL' });
    }

    // Get organization details
    const { data: org, error: orgError } = await getSupabaseAdmin()
      .from('organizations')
      .select('id, name, stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Create or retrieve Stripe customer
    let customerId = org.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await getStripe().customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          organization_id: organizationId,
        },
      });

      customerId = customer.id;

      // Save customer ID to organization
      await getSupabaseAdmin()
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId);
    }

    // Determine base URL
    const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      success_url: body.successUrl || `${baseUrl}/settings/billing?success=true`,
      cancel_url: body.cancelUrl || `${baseUrl}/settings/billing?canceled=true`,
      metadata: {
        organization_id: organizationId,
      },
      subscription_data: {
        metadata: {
          organization_id: organizationId,
        },
      },
      allow_promotion_codes: true,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.billing.error('Checkout error', { error: String(error) });
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

async function handlePortal(
  req: VercelRequest,
  res: VercelResponse,
  _user: { id: string; email: string },
  organizationId: string
) {
  const body = req.body as { returnUrl?: string };

  // Validate returnUrl if provided
  if (body.returnUrl && !isValidHttpUrl(body.returnUrl)) {
    return res.status(400).json({ error: 'returnUrl must be a valid http or https URL' });
  }

  // Get organization's Stripe customer ID
  const { data: org, error: orgError } = await getSupabaseAdmin()
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organizationId)
    .single();

  if (orgError || !org || !org.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found' });
  }

  const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;

  const session = await getStripe().billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: body.returnUrl || `${baseUrl}/settings/billing`,
  });

  return res.status(200).json({ url: session.url });
}

// Plan mapping from Stripe price IDs (monthly + annual for each tier)
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

async function handleSync(
  res: VercelResponse,
  organizationId: string
) {
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
  const stripeStatus = stripeSubscription.status;
  const cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

  // Check for scheduled plan change (e.g., downgrade at end of period)
  let pendingPlan: string | null = null;
  let pendingPlanDate: string | null = null;

  const scheduleId = stripeSubscription.schedule;
  if (scheduleId) {
    try {
      const schedule = await getStripe().subscriptionSchedules.retrieve(
        typeof scheduleId === 'string' ? scheduleId : scheduleId.id
      );

      if (schedule.phases && schedule.phases.length > 1) {
        // Find the next phase (after current)
        const currentPhaseIndex = schedule.current_phase
          ? schedule.phases.findIndex(
              (p) =>
                p.start_date === (schedule.current_phase as { start_date: number; end_date: number }).start_date
            )
          : 0;
        const nextPhase = schedule.phases[currentPhaseIndex + 1];

        if (nextPhase) {
          const nextPriceId = nextPhase.items?.[0]?.price;
          const nextPriceStr = typeof nextPriceId === 'string' ? nextPriceId : (nextPriceId as { id: string })?.id;
          if (nextPriceStr) {
            pendingPlan = priceToPlan[nextPriceStr] || null;
          }
          pendingPlanDate = new Date(nextPhase.start_date * 1000).toISOString();
        }
      }
    } catch (scheduleError) {
      logger.billing.warn('Failed to retrieve subscription schedule', {
        organizationId,
        scheduleId: String(scheduleId),
        error: String(scheduleError),
      });
    }
  }

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
    pendingPlan,
    pendingPlanDate,
  });

  return res.status(200).json({
    synced: true,
    plan: effectivePlan,
    status: stripeStatus,
    cancel_at_period_end: cancelAtPeriodEnd,
    pending_plan: pendingPlan,
    pending_plan_date: pendingPlanDate,
  });
}
