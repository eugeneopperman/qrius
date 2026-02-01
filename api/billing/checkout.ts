// POST /api/billing/checkout - Create Stripe checkout session

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface CheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await requireAuth(req);
    const { organizationId, role } = await getUserOrganization(user.id);

    // Only owners and admins can manage billing
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    const body = req.body as CheckoutRequest;

    if (!body.priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    // Get organization details
    const { data: org, error: orgError } = await supabaseAdmin
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
      await supabaseAdmin
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
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
