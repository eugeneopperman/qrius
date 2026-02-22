// Authentication middleware for API routes
import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';
import { sql } from './db.js';

// Supabase admin client (uses service role key)
// Guard: createClient throws if key is empty string — defer to null when unconfigured
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId?: string;
  role?: string;
}

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured — set SUPABASE_SERVICE_ROLE_KEY env var');
  }
  return supabaseAdmin;
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
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);

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
export async function requireApiKey(req: VercelRequest): Promise<{ organizationId: string; keyId: string; rateLimitPerDay: number }> {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new UnauthorizedError('Missing API key');
  }

  // API keys have format: qr_<prefix>_<secret>
  if (!apiKey.startsWith('qr_')) {
    throw new UnauthorizedError('Invalid API key format');
  }

  // Extract prefix reliably: find the second underscore to split prefix from secret
  const secondUnderscore = apiKey.indexOf('_', 3); // Start after "qr_"
  if (secondUnderscore === -1 || secondUnderscore === apiKey.length - 1) {
    throw new UnauthorizedError('Invalid API key format');
  }

  const keyPrefix = apiKey.substring(0, secondUnderscore);

  // Hash the full key for comparison
  const crypto = await import('crypto');
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Look up the API key
  const { data: key, error } = await getSupabaseAdmin()
    .from('api_keys')
    .select('id, organization_id, is_active, expires_at, rate_limit_per_day')
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
  void Promise.resolve(
    getSupabaseAdmin()
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', key.id)
  ).then(({ error }) => {
    if (error) {
      logger.auth.warn('Failed to update API key last_used_at', { keyId: key.id, error: error.message });
    }
  }).catch((err) => {
    logger.auth.error('Unexpected error updating API key', { keyId: key.id, error: String(err) });
  });

  return {
    organizationId: key.organization_id,
    keyId: key.id,
    rateLimitPerDay: key.rate_limit_per_day ?? -1,
  };
}

/**
 * Authenticate via either JWT or API key
 */
export async function authenticate(req: VercelRequest): Promise<{
  userId?: string;
  organizationId?: string;
  apiKeyId?: string;
  rateLimitPerDay?: number;
}> {
  // Try API key first
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    const { organizationId, keyId, rateLimitPerDay } = await requireApiKey(req);
    return { organizationId, apiKeyId: keyId, rateLimitPerDay };
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
  let query = getSupabaseAdmin()
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
  limitType: 'qr_codes' | 'scans' | 'api_requests' | 'team_members'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  // Fetch org plan from Supabase, then plan limits — parallelize where possible
  // Step 1: Get org plan (needed to look up limits)
  const { data: org, error: orgError } = await getSupabaseAdmin()
    .from('organizations')
    .select('plan')
    .eq('id', organizationId)
    .single();

  if (orgError || !org) {
    throw new Error('Organization not found');
  }

  // Step 2: Fetch plan limits + current usage in parallel
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  // Build parallel promises: plan limits + the usage query for the requested limitType
  const limitsPromise = getSupabaseAdmin()
    .from('plan_limits')
    .select('*')
    .eq('plan', org.plan)
    .single();

  let usagePromise: Promise<number>;

  switch (limitType) {
    case 'qr_codes':
      usagePromise = sql
        ? sql`SELECT COUNT(*) as count FROM qr_codes WHERE organization_id = ${organizationId}`
            .then(r => parseInt(r[0].count as string) || 0)
        : Promise.resolve(0);
      break;

    case 'api_requests':
      usagePromise = sql
        ? sql`SELECT api_requests FROM usage_records WHERE organization_id = ${organizationId} AND month = ${currentMonth}`
            .then(r => r.length > 0 ? (parseInt(r[0].api_requests as string) || 0) : 0)
        : Promise.resolve(0);
      break;

    case 'scans':
      usagePromise = sql
        ? sql`SELECT scans_count FROM usage_records WHERE organization_id = ${organizationId} AND month = ${currentMonth}`
            .then(r => r.length > 0 ? (parseInt(r[0].scans_count as string) || 0) : 0)
        : Promise.resolve(0);
      break;

    case 'team_members':
      usagePromise = Promise.resolve(
        getSupabaseAdmin()
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
      ).then(({ count }) => count || 0);
      break;
  }

  const [limitsResult, current] = await Promise.all([limitsPromise, usagePromise]);

  if (limitsResult.error || !limitsResult.data) {
    throw new Error('Plan limits not found');
  }

  const limits = limitsResult.data;

  // Map limitType to the corresponding column in plan_limits
  const limitMap: Record<typeof limitType, number> = {
    qr_codes: limits.qr_codes_limit,
    api_requests: limits.api_requests_per_day,
    scans: limits.scans_per_month,
    team_members: limits.team_members,
  };

  const limit = limitMap[limitType];

  // -1 means unlimited
  const allowed = limit === -1 || current < limit;

  return { allowed, current, limit };
}
