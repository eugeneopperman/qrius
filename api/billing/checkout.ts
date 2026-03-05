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
// Checks both STRIPE_PRICE_X and VITE_STRIPE_PRICE_X env vars
function buildPriceToPlan(): Record<string, string> {
  const map: Record<string, string> = {};
  const entries: [string | undefined, string][] = [
    [process.env.STRIPE_PRICE_STARTER || process.env.VITE_STRIPE_PRICE_STARTER, 'starter'],
    [process.env.STRIPE_PRICE_STARTER_ANNUAL || process.env.VITE_STRIPE_PRICE_STARTER_ANNUAL, 'starter'],
    [process.env.STRIPE_PRICE_PRO || process.env.VITE_STRIPE_PRICE_PRO, 'pro'],
    [process.env.STRIPE_PRICE_PRO_ANNUAL || process.env.VITE_STRIPE_PRICE_PRO_ANNUAL, 'pro'],
    [process.env.STRIPE_PRICE_BUSINESS || process.env.VITE_STRIPE_PRICE_BUSINESS, 'business'],
    [process.env.STRIPE_PRICE_BUSINESS_ANNUAL || process.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL, 'business'],
  ];
  for (const [priceId, plan] of entries) {
    if (priceId) map[priceId] = plan;
  }
  return map;
}

/** Infer plan from a Stripe subscription's product name when price ID isn't in env var mapping */
function inferPlanFromSubscription(sub: Stripe.Subscription, priceToPlan: Record<string, string>): string {
  const priceId = sub.items.data[0]?.price.id;
  if (priceId && priceToPlan[priceId]) return priceToPlan[priceId];

  // Fallback: check product name (expanded or string)
  const product = sub.items.data[0]?.price?.product;
  if (product && typeof product === 'object' && 'name' in product) {
    const name = (product as { name: string }).name.toLowerCase();
    if (name.includes('business')) return 'business';
    if (name.includes('pro')) return 'pro';
    if (name.includes('starter')) return 'starter';
  }

  return 'free';
}

async function handleSync(
  res: VercelResponse,
  organizationId: string
) {
  // Get organization details
  const { data: org, error: orgError } = await getSupabaseAdmin()
    .from('organizations')
    .select('id, plan, stripe_customer_id, stripe_subscription_id')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  logger.billing.info('Sync: org state', {
    organizationId,
    currentPlan: org.plan,
    stripeCustomerId: org.stripe_customer_id,
    stripeSubscriptionId: org.stripe_subscription_id,
  });

  // No Stripe customer — ensure plan is free
  if (!org.stripe_customer_id) {
    logger.billing.info('Sync: no stripe_customer_id, returning free');

    if (org.plan !== 'free') {
      await getSupabaseAdmin()
        .from('organizations')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', organizationId);
    }

    return res.status(200).json({
      synced: true,
      plan: 'free',
      status: null,
      cancel_at_period_end: false,
    });
  }

  // List ALL subscriptions for this customer from Stripe (source of truth)
  // Expand product so we can infer plan from product name as fallback
  const allSubs = await getStripe().subscriptions.list({
    customer: org.stripe_customer_id,
    limit: 10,
    expand: ['data.items.data.price.product'],
  });

  const priceToPlan = buildPriceToPlan();

  // Log all subscriptions for debugging
  logger.billing.info('Sync: found subscriptions', {
    organizationId,
    count: allSubs.data.length,
    priceMapKeys: Object.keys(priceToPlan),
    subscriptions: allSubs.data.map((s) => ({
      id: s.id,
      status: s.status,
      cancel_at_period_end: s.cancel_at_period_end,
      priceId: s.items.data[0]?.price.id,
      productType: typeof s.items.data[0]?.price?.product,
      productName: typeof s.items.data[0]?.price?.product === 'object'
        ? (s.items.data[0].price.product as { name?: string }).name
        : s.items.data[0]?.price?.product,
      inferred: inferPlanFromSubscription(s, priceToPlan),
    })),
  });

  // Categorize subscriptions:
  // - "primary": active and NOT cancel_at_period_end (the real current plan)
  // - "winding_down": active but cancel_at_period_end (old plan being phased out)
  // - "canceled": already ended
  let primarySub: Stripe.Subscription | null = null;
  let windingDownSub: Stripe.Subscription | null = null;

  for (const sub of allSubs.data) {
    if (sub.status === 'active' && !sub.cancel_at_period_end) {
      // Prefer the most recently created active subscription
      if (!primarySub || sub.created > primarySub.created) {
        primarySub = sub;
      }
    } else if (sub.status === 'active' && sub.cancel_at_period_end) {
      windingDownSub = sub;
    }
  }

  // If no active non-canceling subscription, fall back to any active sub
  if (!primarySub && windingDownSub) {
    primarySub = windingDownSub;
    windingDownSub = null;
  }

  // No active subscriptions at all — downgrade to free
  if (!primarySub) {
    await getSupabaseAdmin()
      .from('organizations')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('id', organizationId);

    return res.status(200).json({
      synced: true,
      plan: 'free',
      status: 'canceled',
      cancel_at_period_end: false,
    });
  }

  // Determine plan from the primary (active) subscription
  const priceId = primarySub.items.data[0]?.price.id;
  const effectivePlan = inferPlanFromSubscription(primarySub, priceToPlan);
  const cancelAtPeriodEnd = primarySub.cancel_at_period_end;

  // Build previous plan info (old subscription that's winding down)
  let previousPlan: string | null = null;
  let previousPlanEndDate: string | null = null;
  if (windingDownSub) {
    const inferred = inferPlanFromSubscription(windingDownSub, priceToPlan);
    previousPlan = inferred !== 'free' ? inferred : null;
    previousPlanEndDate = new Date(windingDownSub.current_period_end * 1000).toISOString();
  }

  // Update organization to point to the correct (primary) subscription
  await getSupabaseAdmin()
    .from('organizations')
    .update({
      plan: effectivePlan,
      stripe_subscription_id: primarySub.id,
    })
    .eq('id', organizationId);

  // Upsert subscription record for the primary subscription
  await getSupabaseAdmin().from('subscriptions').upsert({
    organization_id: organizationId,
    stripe_subscription_id: primarySub.id,
    stripe_price_id: priceId || null,
    status: primarySub.status,
    current_period_start: new Date(primarySub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(primarySub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  logger.billing.info('Sync completed', {
    organizationId,
    effectivePlan,
    status: primarySub.status,
    cancelAtPeriodEnd,
    previousPlan,
    previousPlanEndDate,
    totalSubscriptions: allSubs.data.length,
  });

  return res.status(200).json({
    synced: true,
    plan: effectivePlan,
    status: primarySub.status,
    cancel_at_period_end: cancelAtPeriodEnd,
    // previous_plan: the old plan that's still active but canceling at period end
    previous_plan: previousPlan,
    previous_plan_end_date: previousPlanEndDate,
  });
}
