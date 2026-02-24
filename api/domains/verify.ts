// POST /api/domains/verify — Check DNS configuration via Vercel API

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
import { setCachedDomainMapping } from '../_lib/kv.js';
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

      // Cache the mapping
      await setCachedDomainMapping(domain.domain, { organizationId });

      return res.status(200).json({ domain: updated });
    }

    // Check domain status with Vercel
    const vercelRes = await fetch(
      `https://api.vercel.com/v10/projects/${vercelProjectId}/domains/${domain.domain}`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
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

      // Cache the mapping for fast lookup during redirects
      await setCachedDomainMapping(domain.domain, { organizationId });

      logger.domains.info('Domain verified', { domain: domain.domain, organizationId });

      return res.status(200).json({ domain: updated });
    } else {
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

      // Return current status with check error
      const { data: updated } = await getSupabaseAdmin()
        .from('custom_domains')
        .select('*')
        .eq('id', domain.id)
        .single();

      return res.status(200).json({ domain: updated || domain });
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.domains.error('Verify error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
