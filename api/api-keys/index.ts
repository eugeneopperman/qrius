// GET /api/api-keys - List organization's API keys
// POST /api/api-keys - Create new API key

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, getUserOrganization, requireRole, checkPlanLimit, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface CreateKeyRequest {
  name: string;
  scopes?: string[];
  expiresIn?: number; // days
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res, 'GET, POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const user = await requireAuth(req);
    const { organizationId } = await getUserOrganization(user.id);

    // Only owners and admins can manage API keys
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Check if plan allows API access
    const limitCheck = await checkPlanLimit(organizationId, 'api_requests');
    if (limitCheck.limit === 0) {
      return res.status(403).json({
        error: 'API access not available on your plan',
        upgradeRequired: true,
      });
    }

    if (req.method === 'GET') {
      return await handleList(req, res, organizationId);
    }

    if (req.method === 'POST') {
      return await handleCreate(req, res, user.id, organizationId, limitCheck.limit);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.apiKeys.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse, organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, scopes, rate_limit_per_day, last_used_at, expires_at, is_active, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.apiKeys.error('Error fetching API keys', { error: error.message });
    return res.status(500).json({ error: 'Failed to fetch API keys' });
  }

  return res.status(200).json({ apiKeys: data });
}

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  organizationId: string,
  rateLimit: number
) {
  const body = req.body as CreateKeyRequest;

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }

  if (body.name.trim().length > 100) {
    return res.status(400).json({ error: 'name must be 100 characters or fewer' });
  }

  // Validate expiresIn if provided (1-365 days)
  if (body.expiresIn !== undefined) {
    if (typeof body.expiresIn !== 'number' || !Number.isInteger(body.expiresIn) || body.expiresIn < 1 || body.expiresIn > 365) {
      return res.status(400).json({ error: 'expiresIn must be between 1 and 365 days' });
    }
  }

  // Validate scopes if provided
  if (body.scopes !== undefined) {
    if (!Array.isArray(body.scopes) || body.scopes.length > 10) {
      return res.status(400).json({ error: 'scopes must be an array of up to 10 items' });
    }
    for (const scope of body.scopes) {
      if (typeof scope !== 'string' || scope.length > 50) {
        return res.status(400).json({ error: 'Each scope must be a string of 50 characters or fewer' });
      }
    }
  }

  // Generate API key: qr_<prefix>_<secret>
  const prefix = crypto.randomBytes(4).toString('hex');
  const secret = crypto.randomBytes(24).toString('hex');
  const fullKey = `qr_${prefix}_${secret}`;
  const keyPrefix = `qr_${prefix}`;

  // Hash the full key for storage
  const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

  // Calculate expiry if provided
  let expiresAt: string | null = null;
  if (body.expiresIn && body.expiresIn > 0) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + body.expiresIn);
    expiresAt = expiry.toISOString();
  }

  // Create API key record
  const { data: apiKey, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      organization_id: organizationId,
      name: body.name.trim(),
      key_hash: keyHash,
      key_prefix: keyPrefix,
      scopes: body.scopes || [],
      rate_limit_per_day: rateLimit,
      expires_at: expiresAt,
      created_by: userId,
    })
    .select('id, name, key_prefix, scopes, rate_limit_per_day, expires_at, is_active, created_at')
    .single();

  if (error) {
    logger.apiKeys.error('Error creating API key', { error: error.message });
    return res.status(500).json({ error: 'Failed to create API key' });
  }

  // Return the full key ONLY on creation (never stored in plain text)
  return res.status(201).json({
    apiKey: {
      ...apiKey,
      key: fullKey, // This is the only time the full key is returned
    },
    warning: 'Store this API key securely. It will not be shown again.',
  });
}
