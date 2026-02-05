// Authentication middleware for API routes
import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Supabase admin client (uses service role key)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId?: string;
  role?: string;
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Extract and verify JWT token from request
 * Returns the authenticated user or throws UnauthorizedError
 */
export async function requireAuth(req: VercelRequest): Promise<AuthenticatedUser> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify the JWT token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  return {
    id: user.id,
    email: user.email || '',
  };
}

/**
 * Authenticate request via API key
 * Returns the organization ID or throws UnauthorizedError
 */
export async function requireApiKey(req: VercelRequest): Promise<{ organizationId: string; keyId: string }> {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new UnauthorizedError('Missing API key');
  }

  // API keys have format: qr_<prefix>_<secret>
  if (!apiKey.startsWith('qr_')) {
    throw new UnauthorizedError('Invalid API key format');
  }

  const parts = apiKey.split('_');
  if (parts.length < 3) {
    throw new UnauthorizedError('Invalid API key format');
  }

  const keyPrefix = `qr_${parts[1]}`;

  // Hash the full key for comparison
  const crypto = await import('crypto');
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Look up the API key
  const { data: key, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, organization_id, is_active, expires_at')
    .eq('key_prefix', keyPrefix)
    .eq('key_hash', keyHash)
    .single();

  if (error || !key) {
    throw new UnauthorizedError('Invalid API key');
  }

  if (!key.is_active) {
    throw new UnauthorizedError('API key is disabled');
  }

  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    throw new UnauthorizedError('API key has expired');
  }

  // Update last_used_at (fire and forget with error logging)
  supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', key.id)
    .then(({ error }) => {
      if (error) {
        logger.auth.warn('Failed to update API key last_used_at', { keyId: key.id, error: error.message });
      }
    })
    .catch((err) => {
      logger.auth.error('Unexpected error updating API key', { keyId: key.id, error: String(err) });
    });

  return {
    organizationId: key.organization_id,
    keyId: key.id,
  };
}

/**
 * Authenticate via either JWT or API key
 */
export async function authenticate(req: VercelRequest): Promise<{
  userId?: string;
  organizationId?: string;
  apiKeyId?: string;
}> {
  // Try API key first
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    const { organizationId, keyId } = await requireApiKey(req);
    return { organizationId, apiKeyId: keyId };
  }

  // Try JWT
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const user = await requireAuth(req);
    return { userId: user.id };
  }

  throw new UnauthorizedError('Authentication required');
}

/**
 * Get user's organization membership
 */
export async function getUserOrganization(
  userId: string,
  organizationId?: string
): Promise<{ organizationId: string; role: string }> {
  let query = supabaseAdmin
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.limit(1).single();

  if (error || !data) {
    throw new ForbiddenError('Not a member of this organization');
  }

  return {
    organizationId: data.organization_id,
    role: data.role,
  };
}

/**
 * Check if user has required role in organization
 */
export async function requireRole(
  userId: string,
  organizationId: string,
  requiredRoles: string[]
): Promise<void> {
  const { role } = await getUserOrganization(userId, organizationId);

  if (!requiredRoles.includes(role)) {
    throw new ForbiddenError(`Requires one of roles: ${requiredRoles.join(', ')}`);
  }
}

/**
 * Check organization plan limits
 */
export async function checkPlanLimit(
  organizationId: string,
  limitType: 'qr_codes' | 'scans' | 'api_requests'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  // Get organization plan
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('plan')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    throw new Error('Organization not found');
  }

  // Get plan limits
  const { data: limits, error: limitsError } = await supabaseAdmin
    .from('plan_limits')
    .select('*')
    .eq('plan', org.plan)
    .single();

  if (limitsError || !limits) {
    throw new Error('Plan limits not found');
  }

  let current = 0;
  let limit = 0;

  switch (limitType) {
    case 'qr_codes':
      const { count: qrCount } = await supabaseAdmin
        .from('qr_codes')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);
      current = qrCount || 0;
      limit = limits.qr_codes_limit;
      break;

    case 'api_requests':
      // Check today's API usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usage } = await supabaseAdmin
        .from('usage_records')
        .select('api_requests')
        .eq('organization_id', organizationId)
        .eq('month', today.slice(0, 7) + '-01')
        .single();
      current = usage?.api_requests || 0;
      limit = limits.api_requests_per_day;
      break;

    case 'scans':
      const { data: monthUsage } = await supabaseAdmin
        .from('usage_records')
        .select('scans_count')
        .eq('organization_id', organizationId)
        .eq('month', new Date().toISOString().slice(0, 7) + '-01')
        .single();
      current = monthUsage?.scans_count || 0;
      limit = limits.scans_per_month;
      break;
  }

  // -1 means unlimited
  const allowed = limit === -1 || current < limit;

  return { allowed, current, limit };
}
