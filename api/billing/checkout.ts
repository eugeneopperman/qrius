// POST /api/billing/checkout - Create Stripe checkout session
// POST /api/billing/checkout?action=portal - Create Stripe customer portal session

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getSupabaseAdmin, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { isValidHttpUrl } from '../_lib/validate.js';
import { logger } from '../_lib/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

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
    const { organizationId } = await getUserOrganization(user.id);

    // Only owners and admins can manage billing
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Route portal requests
    if (req.query.action === 'portal') {
      return await handlePortal(req, res, user, organizationId);
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
      const customer = await stripe.customers.create({
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: body.returnUrl || `${baseUrl}/settings/billing`,
  });

  return res.status(200).json({ url: session.url });
}
