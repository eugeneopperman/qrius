// GET /api/domains — Fetch current org's custom domain
// POST /api/domains — Add a custom domain (or verify if action=verify)
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
      if (req.query.action === 'verify') {
        return await handleVerify(res, organizationId);
      }
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

    // Requires SUBDOMAIN_BASE_DOMAIN env var (a real domain with wildcard DNS → Vercel)
    const baseDomain = process.env.SUBDOMAIN_BASE_DOMAIN;
    if (!baseDomain) {
      return res.status(503).json({ error: 'App subdomains are not yet available. A custom base domain is being configured.' });
    }

    normalizedDomain = `${label.toLowerCase().trim()}.${baseDomain}`;
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
          signal: AbortSignal.timeout(10000),
        }
      );

      const vercelData = await vercelRes.json();

      if (!vercelRes.ok) {
        logger.domains.error('Vercel domain add failed', { domain: normalizedDomain, status: vercelRes.status, statusText: vercelRes.statusText });

        if (vercelData.error?.code === 'domain_already_in_use') {
          return res.status(409).json({ error: 'This domain is already configured on another Vercel project' });
        }

        return res.status(502).json({ error: 'Failed to add domain to hosting provider' });
      }

      // Extract CNAME target (only relevant for custom domains)
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
          signal: AbortSignal.timeout(10000),
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

async function handleVerify(res: VercelResponse, organizationId: string) {
  // Fetch existing domain
  const { data: domain, error: fetchError } = await getSupabaseAdmin()
    .from('custom_domains')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (fetchError || !domain) {
    return res.status(404).json({ error: 'No custom domain configured' });
  }

  if (domain.status === 'verified') {
    return res.status(200).json({ domain, alreadyVerified: true });
  }

  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  if (!vercelToken || !vercelProjectId) {
    // No Vercel API configured — mark as verified for development
    logger.domains.warn('Vercel API not configured — auto-verifying for dev', { domain: domain.domain });

    const { data: updated, error: updateError } = await getSupabaseAdmin()
      .from('custom_domains')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        last_check_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', domain.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update domain status' });
    }

    await setCachedDomainMapping(domain.domain, { organizationId });
    return res.status(200).json({ domain: updated });
  }

  // Check domain status with Vercel
  const vercelRes = await fetch(
    `https://api.vercel.com/v10/projects/${vercelProjectId}/domains/${domain.domain}`,
    { headers: { Authorization: `Bearer ${vercelToken}` }, signal: AbortSignal.timeout(10000) }
  );

  if (!vercelRes.ok) {
    logger.domains.error('Vercel domain check failed', { domain: domain.domain, status: vercelRes.status });

    await getSupabaseAdmin()
      .from('custom_domains')
      .update({
        last_check_at: new Date().toISOString(),
        last_check_error: `Vercel API returned ${vercelRes.status}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domain.id);

    return res.status(502).json({ error: 'Failed to check domain with hosting provider' });
  }

  const vercelData = await vercelRes.json();
  const isVerified = vercelData.verified === true;

  if (isVerified) {
    const { data: updated, error: updateError } = await getSupabaseAdmin()
      .from('custom_domains')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        last_check_at: new Date().toISOString(),
        last_check_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domain.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update domain status' });
    }

    await setCachedDomainMapping(domain.domain, { organizationId });
    logger.domains.info('Domain verified', { domain: domain.domain, organizationId });
    return res.status(200).json({ domain: updated });
  }

  // Not yet verified
  const checkError = vercelData.verification?.[0]?.reason || 'DNS not configured yet';

  await getSupabaseAdmin()
    .from('custom_domains')
    .update({
      status: 'verifying',
      last_check_at: new Date().toISOString(),
      last_check_error: checkError,
      updated_at: new Date().toISOString(),
    })
    .eq('id', domain.id);

  const { data: updated } = await getSupabaseAdmin()
    .from('custom_domains')
    .select('*')
    .eq('id', domain.id)
    .single();

  return res.status(200).json({ domain: updated || domain });
}
