// POST /api/billing/portal - Create Stripe customer portal session

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { requireAuth, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface PortalRequest {
  returnUrl?: string;
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

    // Only owners and admins can access billing portal
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    const body = req.body as PortalRequest;

    // Get organization's Stripe customer ID
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (orgError || !org || !org.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    // Determine base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: body.returnUrl || `${baseUrl}/settings/billing`,
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    console.error('Portal error:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
}
