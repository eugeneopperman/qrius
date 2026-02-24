// GET /api/domains — Fetch current org's custom domain
// POST /api/domains — Add a custom domain
// DELETE /api/domains — Remove custom domain

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import {
  requireAuth,
  getUserOrganization,
  requireRole,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth.js';
import { logger } from '../_lib/logger.js';
import { isValidDomain, isValidSubdomainLabel } from '../_lib/validate.js';
import { invalidateCachedDomainMapping, setCachedDomainMapping } from '../_lib/kv.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }
  return supabaseAdmin;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, POST, DELETE, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const user = await requireAuth(req);
    const { organizationId } = await getUserOrganization(user.id);

    if (req.method === 'GET') {
      return await handleGet(res, organizationId);
    }

    if (req.method === 'POST') {
      await requireRole(user.id, organizationId, ['owner', 'admin']);
      return await handlePost(req, res, organizationId);
    }

    if (req.method === 'DELETE') {
      await requireRole(user.id, organizationId, ['owner', 'admin']);
      return await handleDelete(res, organizationId);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.domains.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(res: VercelResponse, organizationId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('custom_domains')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    logger.domains.error('Failed to fetch domain', { organizationId, error: error.message });
    return res.status(500).json({ error: 'Failed to fetch domain' });
  }

  return res.status(200).json({ domain: data || null });
}

async function handlePost(req: VercelRequest, res: VercelResponse, organizationId: string) {
  const body = req.body as { type?: 'subdomain' | 'custom'; subdomain?: string; domain?: string };
  const domainType = body.type || 'custom';

  let normalizedDomain: string;

  if (domainType === 'subdomain') {
    // App subdomain flow — no plan gate
    const label = body.subdomain;
    if (!label || !isValidSubdomainLabel(label)) {
      return res.status(400).json({ error: 'Invalid subdomain. Use 3-63 lowercase letters, numbers, or hyphens.' });
    }

    // Derive app host from NEXT_PUBLIC_APP_URL or request host
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    let appHost: string;
    try {
      appHost = appUrl ? new URL(appUrl).hostname : (req.headers.host || 'localhost');
    } catch {
      appHost = req.headers.host || 'localhost';
    }

    normalizedDomain = `${label.toLowerCase().trim()}.${appHost}`;
  } else {
    // Custom domain flow — plan-gated to Business
    if (!body.domain || !isValidDomain(body.domain)) {
      return res.status(400).json({ error: 'Invalid domain. Must be a valid hostname (e.g., track.acme.com)' });
    }

    normalizedDomain = body.domain.toLowerCase().trim();

    // Plan gate: check white_label is enabled for this org's plan
    const { data: org, error: orgError } = await getSupabaseAdmin()
      .from('organizations')
      .select('plan')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return res.status(500).json({ error: 'Organization not found' });
    }

    const { data: planLimits, error: planError } = await getSupabaseAdmin()
      .from('plan_limits')
      .select('white_label')
      .eq('plan', org.plan)
      .single();

    if (planError || !planLimits) {
      return res.status(500).json({ error: 'Plan limits not found' });
    }

    if (!planLimits.white_label) {
      return res.status(403).json({
        error: 'Custom domains require a Business plan',
        requiredPlan: 'business',
      });
    }
  }

  // Check if org already has a domain
  const { data: existing } = await getSupabaseAdmin()
    .from('custom_domains')
    .select('id')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Organization already has a custom domain. Remove it first.' });
  }

  // Check global uniqueness
  const { data: domainTaken } = await getSupabaseAdmin()
    .from('custom_domains')
    .select('id')
    .eq('domain', normalizedDomain)
    .maybeSingle();

  if (domainTaken) {
    return res.status(409).json({ error: 'This domain is already in use by another organization' });
  }

  // Add domain to Vercel project
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  let cnameTarget = domainType === 'subdomain' ? 'n/a' : 'cname.vercel-dns.com';

  if (vercelToken && vercelProjectId) {
    try {
      const vercelRes = await fetch(
        `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: normalizedDomain }),
        }
      );

      const vercelData = await vercelRes.json();

      if (!vercelRes.ok) {
        logger.domains.error('Vercel domain add failed', { domain: normalizedDomain, status: vercelRes.status, body: vercelData });

        if (vercelData.error?.code === 'domain_already_in_use') {
          return res.status(409).json({ error: 'This domain is already configured on another Vercel project' });
        }

        return res.status(502).json({ error: 'Failed to add domain to hosting provider' });
      }

      // Extract CNAME target from Vercel response (only relevant for custom domains)
      if (domainType === 'custom') {
        if (vercelData.cnames && vercelData.cnames.length > 0) {
          cnameTarget = vercelData.cnames[0];
        } else if (vercelData.apexName) {
          cnameTarget = 'cname.vercel-dns.com';
        }
      }

      logger.domains.info('Domain added to Vercel', { domain: normalizedDomain, type: domainType, cnameTarget });
    } catch (error) {
      logger.domains.error('Vercel API call failed', { domain: normalizedDomain, error: String(error) });
      return res.status(502).json({ error: 'Failed to communicate with hosting provider' });
    }
  } else {
    logger.domains.warn('Vercel API not configured — skipping domain registration', { domain: normalizedDomain });
  }

  // Subdomains are auto-verified; custom domains start as pending
  const isSubdomain = domainType === 'subdomain';

  // Insert into custom_domains
  const { data: inserted, error: insertError } = await getSupabaseAdmin()
    .from('custom_domains')
    .insert({
      organization_id: organizationId,
      domain: normalizedDomain,
      cname_target: cnameTarget,
      status: isSubdomain ? 'verified' : 'pending',
      ...(isSubdomain ? { verified_at: new Date().toISOString() } : {}),
    })
    .select()
    .single();

  if (insertError) {
    logger.domains.error('Failed to insert domain', { domain: normalizedDomain, error: insertError.message });
    return res.status(500).json({ error: 'Failed to save domain configuration' });
  }

  // Populate Redis cache immediately for subdomains
  if (isSubdomain) {
    setCachedDomainMapping(normalizedDomain, { organizationId }).catch(() => {});
  }

  if (isSubdomain) {
    return res.status(201).json({ domain: inserted });
  }

  return res.status(201).json({
    domain: inserted,
    instructions: {
      type: 'CNAME',
      host: normalizedDomain.split('.')[0],
      value: cnameTarget,
      fullRecord: `${normalizedDomain} CNAME ${cnameTarget}`,
    },
  });
}

async function handleDelete(res: VercelResponse, organizationId: string) {
  // Fetch existing domain
  const { data: domain, error: fetchError } = await getSupabaseAdmin()
    .from('custom_domains')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (fetchError || !domain) {
    return res.status(404).json({ error: 'No custom domain configured' });
  }

  // Remove from Vercel
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  if (vercelToken && vercelProjectId) {
    try {
      const vercelRes = await fetch(
        `https://api.vercel.com/v10/projects/${vercelProjectId}/domains/${domain.domain}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        }
      );

      if (!vercelRes.ok && vercelRes.status !== 404) {
        logger.domains.warn('Vercel domain removal failed', { domain: domain.domain, status: vercelRes.status });
        // Continue with DB deletion anyway
      } else {
        logger.domains.info('Domain removed from Vercel', { domain: domain.domain });
      }
    } catch (error) {
      logger.domains.error('Vercel API call failed during delete', { domain: domain.domain, error: String(error) });
    }
  }

  // Invalidate Redis cache
  await invalidateCachedDomainMapping(domain.domain);

  // Delete from DB
  const { error: deleteError } = await getSupabaseAdmin()
    .from('custom_domains')
    .delete()
    .eq('id', domain.id);

  if (deleteError) {
    logger.domains.error('Failed to delete domain', { domain: domain.domain, error: deleteError.message });
    return res.status(500).json({ error: 'Failed to remove domain' });
  }

  return res.status(200).json({ success: true });
}
