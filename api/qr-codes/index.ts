// POST /api/qr-codes - Create a new trackable QR code
// GET /api/qr-codes - List all QR codes
// PATCH /api/qr-codes?action=bulk - Bulk update QR codes

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, type QRCodeRow } from '../_lib/db.js';
import { generateShortCode } from '../_lib/shortCode.js';
import { setCachedRedirect } from '../_lib/kv.js';
import { logger } from '../_lib/logger.js';
import {
  authenticate,
  requireAuth,
  getUserOrganization,
  checkPlanLimit,
  getOrgCustomDomain,
  getSupabaseAdmin,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { checkRateLimit, setRateLimitHeaders } from '../_lib/rateLimit.js';
import { isValidHttpUrl, isValidUUID, validateOptionalString, validateStringArray } from '../_lib/validate.js';

interface CreateQRCodeRequest {
  destination_url: string;
  qr_type?: string;
  original_data?: unknown;
  name?: string;
  description?: string;
  tags?: string[];
  style_options?: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res, 'GET, POST, OPTIONS', req.headers.origin, 'X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const shortDomain = process.env.SHORT_URL_DOMAIN;
  const baseUrl = shortDomain ? `https://${shortDomain}` : (process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`);

  try {
    // Authenticate request (optional for backward compatibility)
    let authContext: { userId?: string; organizationId?: string; apiKeyId?: string; rateLimitPerDay?: number } | null = null;

    try {
      authContext = await authenticate(req);
    } catch (error) {
      // Allow unauthenticated requests for backward compatibility
      // In production, you may want to make auth required
      if (error instanceof UnauthorizedError) {
        authContext = null;
      } else {
        throw error;
      }
    }

    // Rate limit API key requests
    if (authContext?.apiKeyId && authContext.rateLimitPerDay !== undefined) {
      const rlResult = await checkRateLimit(authContext.apiKeyId, authContext.rateLimitPerDay);
      setRateLimitHeaders(res, rlResult);
      if (!rlResult.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          limit: rlResult.limit,
          current: rlResult.current,
        });
      }
    }

    if (req.method === 'POST') {
      return await handleCreate(req, res, baseUrl, authContext);
    }

    if (req.method === 'GET') {
      return await handleList(req, res, baseUrl, authContext);
    }

    if (req.method === 'PATCH' && req.query.action === 'bulk') {
      return await handleBulk(req, res, authContext);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.qrCodes.error('API error', { error: errorMessage, stack: errorStack });
    return res.status(500).json({ error: 'Internal server error', detail: errorMessage });
  }
}

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  baseUrl: string,
  authContext: { userId?: string; organizationId?: string; apiKeyId?: string } | null
) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const body = req.body as CreateQRCodeRequest;

  // Validate required fields
  if (!body.destination_url || typeof body.destination_url !== 'string') {
    return res.status(400).json({ error: 'destination_url is required' });
  }

  // Validate URL format — only http/https allowed for URL-type QR codes
  // Non-URL types (wifi, vcard, etc.) store their content string as destination_url
  const isUrlType = !body.qr_type || body.qr_type === 'url';
  if (isUrlType && !isValidHttpUrl(body.destination_url)) {
    return res.status(400).json({ error: 'destination_url must be a valid http or https URL' });
  }

  if (body.destination_url.length > 4096) {
    return res.status(400).json({ error: 'destination_url must be 4096 characters or fewer' });
  }

  // Validate optional string fields
  if (body.name !== undefined) {
    const name = validateOptionalString(body.name, 200);
    if (name === null) return res.status(400).json({ error: 'name must be 200 characters or fewer' });
  }
  if (body.description !== undefined) {
    const desc = validateOptionalString(body.description, 1000);
    if (desc === null) return res.status(400).json({ error: 'description must be 1000 characters or fewer' });
  }
  if (body.qr_type !== undefined) {
    const validTypes = ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard', 'event', 'location'];
    if (typeof body.qr_type !== 'string' || !validTypes.includes(body.qr_type)) {
      return res.status(400).json({ error: 'Invalid qr_type' });
    }
  }
  if (body.tags !== undefined) {
    const tags = validateStringArray(body.tags, 20, 50);
    if (tags === null) return res.status(400).json({ error: 'tags must be an array of up to 20 strings (50 chars each)' });
  }
  if (body.style_options !== undefined) {
    if (typeof body.style_options !== 'object' || body.style_options === null || Array.isArray(body.style_options)) {
      return res.status(400).json({ error: 'style_options must be an object' });
    }
    if (JSON.stringify(body.style_options).length > 4096) {
      return res.status(400).json({ error: 'style_options must be 4KB or less' });
    }
  }

  // Get organization context
  let organizationId: string | null = null;
  let userId: string | null = null;

  if (authContext) {
    if (authContext.organizationId) {
      // API key auth - use the key's organization
      organizationId = authContext.organizationId;
    } else if (authContext.userId) {
      // JWT auth - get user's organization
      userId = authContext.userId;
      try {
        const orgMembership = await getUserOrganization(authContext.userId);
        organizationId = orgMembership.organizationId;
      } catch {
        // User has no organization - create without org
      }
    }

    // Check plan limits if we have an organization
    if (organizationId) {
      const limitCheck = await checkPlanLimit(organizationId, 'qr_codes');
      if (!limitCheck.allowed) {
        return res.status(403).json({
          error: 'QR code limit reached',
          current: limitCheck.current,
          limit: limitCheck.limit,
        });
      }
    }
  }

  // Generate unique short code (with retry for collisions)
  let shortCode: string;
  let attempts = 0;
  const maxAttempts = 5;

  for (;;) {
    shortCode = generateShortCode();
    attempts++;

    // Check if code already exists
    const existing = await sql`
      SELECT id FROM qr_codes WHERE short_code = ${shortCode}
    `;

    if (existing.length === 0) {
      break;
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate unique short code' });
    }
  }

  // Build metadata JSON (merge style_options if provided)
  const metadata = body.style_options
    ? JSON.stringify({ style_options: body.style_options })
    : null;

  // Insert new QR code
  const result = await sql`
    INSERT INTO qr_codes (
      short_code,
      destination_url,
      qr_type,
      original_data,
      user_id,
      organization_id,
      name,
      description,
      tags,
      metadata
    )
    VALUES (
      ${shortCode},
      ${body.destination_url},
      ${body.qr_type || 'url'},
      ${body.original_data ? JSON.stringify(body.original_data) : null},
      ${userId},
      ${organizationId},
      ${body.name || null},
      ${body.description || null},
      ${body.tags || []},
      ${metadata}
    )
    RETURNING *
  `;

  // Validate INSERT result
  if (!result || result.length === 0) {
    logger.qrCodes.error('QR code INSERT returned no rows');
    return res.status(500).json({ error: 'Failed to create QR code' });
  }

  const row = result[0] as QRCodeRow;

  // Validate required fields exist
  if (!row.id || !row.short_code) {
    logger.qrCodes.error('QR code INSERT returned invalid data', { row });
    return res.status(500).json({ error: 'Failed to create QR code' });
  }

  // Pre-populate cache for fast redirects (non-blocking — don't delay the response)
  void setCachedRedirect(shortCode, {
    destinationUrl: body.destination_url,
    qrCodeId: row.id,
    organizationId,
  });

  // Look up custom domain for the org
  const customDomain = organizationId ? await getOrgCustomDomain(organizationId) : null;

  return res.status(201).json(toQRCodeResponse(row, baseUrl, customDomain));
}

async function handleList(
  req: VercelRequest,
  res: VercelResponse,
  baseUrl: string,
  authContext: { userId?: string; organizationId?: string; apiKeyId?: string } | null
) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  // Filter parameters
  const statusFilter = (req.query.status as string) || 'all';
  const folderIdFilter = req.query.folder_id as string | undefined;
  const searchFilter = req.query.search as string | undefined;
  const sortField = (req.query.sort as string) || 'created_at';
  const sortOrder = (req.query.order as string) === 'asc' ? 'ASC' : 'DESC';

  // Validate filter params
  if (!['all', 'active', 'paused'].includes(statusFilter)) {
    return res.status(400).json({ error: 'status must be all, active, or paused' });
  }
  if (!['created_at', 'total_scans', 'name'].includes(sortField)) {
    return res.status(400).json({ error: 'sort must be created_at, total_scans, or name' });
  }

  // Resolve the effective orgId first (sequential — needed for all subsequent queries)
  let effectiveOrgId: string | null = null;
  let isPersonalOnly = false;

  if (authContext?.organizationId) {
    effectiveOrgId = authContext.organizationId;
  } else if (authContext?.userId) {
    try {
      const orgMembership = await getUserOrganization(authContext.userId);
      effectiveOrgId = orgMembership.organizationId;
    } catch {
      isPersonalOnly = true;
    }
  }

  // Build dynamic WHERE clauses
  const selectCols = 'id, short_code, destination_url, qr_type, original_data, name, description, tags, metadata, is_active, total_scans, user_id, organization_id, created_at, updated_at';

  // Build base ownership condition
  let ownershipCondition: string;
  const params: unknown[] = [];
  let paramIdx = 1;

  if (effectiveOrgId) {
    ownershipCondition = `organization_id = $${paramIdx}`;
    params.push(effectiveOrgId);
    paramIdx++;
  } else if (isPersonalOnly && authContext?.userId) {
    ownershipCondition = `user_id = $${paramIdx} AND organization_id IS NULL`;
    params.push(authContext.userId);
    paramIdx++;
  } else {
    ownershipCondition = 'organization_id IS NULL AND user_id IS NULL';
  }

  // Add filter conditions
  const filterConditions: string[] = [ownershipCondition];

  if (statusFilter === 'active') {
    filterConditions.push('is_active = true');
  } else if (statusFilter === 'paused') {
    filterConditions.push('is_active = false');
  }

  if (folderIdFilter !== undefined) {
    if (folderIdFilter === 'none') {
      filterConditions.push('folder_id IS NULL');
    } else if (folderIdFilter) {
      filterConditions.push(`folder_id = $${paramIdx}`);
      params.push(folderIdFilter);
      paramIdx++;
    }
  }

  if (searchFilter && searchFilter.trim().length > 0) {
    const searchTerm = `%${searchFilter.trim().slice(0, 200)}%`;
    filterConditions.push(`(name ILIKE $${paramIdx} OR destination_url ILIKE $${paramIdx})`);
    params.push(searchTerm);
    paramIdx++;
  }

  const whereClause = filterConditions.join(' AND ');
  const orderClause = `ORDER BY ${sortField} ${sortOrder}`;

  // Use raw SQL for dynamic queries
  const rawSql = sql as unknown as (query: string, params: unknown[]) => Promise<Record<string, unknown>[]>;

  // Parallelize: list + count + status counts + customDomain + monthlyScans + teamMembers
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const listPromise = rawSql(
    `SELECT ${selectCols} FROM qr_codes WHERE ${whereClause} ${orderClause} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  ) as unknown as Promise<QRCodeRow[]>;

  const countPromise = rawSql(
    `SELECT COUNT(*) as count FROM qr_codes WHERE ${whereClause}`,
    params
  ).then(r => parseInt(r[0].count as string) || 0);

  // Status counts — always based on ownership condition only (not other filters)
  // Build ownership-only params
  const ownerParams: unknown[] = [];
  let ownerParamIdx = 1;
  let ownerCondition: string;

  if (effectiveOrgId) {
    ownerCondition = `organization_id = $${ownerParamIdx}`;
    ownerParams.push(effectiveOrgId);
    ownerParamIdx++;
  } else if (isPersonalOnly && authContext?.userId) {
    ownerCondition = `user_id = $${ownerParamIdx} AND organization_id IS NULL`;
    ownerParams.push(authContext.userId);
    ownerParamIdx++;
  } else {
    ownerCondition = 'organization_id IS NULL AND user_id IS NULL';
  }

  const countsPromise = rawSql(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_active = true) as active,
      COUNT(*) FILTER (WHERE is_active = false) as paused
    FROM qr_codes WHERE ${ownerCondition}`,
    ownerParams
  ).then(r => ({
    all: parseInt(r[0].total as string) || 0,
    active: parseInt(r[0].active as string) || 0,
    paused: parseInt(r[0].paused as string) || 0,
  }));

  // Custom domain lookup (Supabase)
  const domainPromise: Promise<string | null> = effectiveOrgId
    ? getOrgCustomDomain(effectiveOrgId)
    : Promise.resolve(null);

  // Monthly scans from usage_records (Neon)
  const scansPromise: Promise<number> = effectiveOrgId
    ? sql`SELECT scans_count FROM usage_records WHERE organization_id = ${effectiveOrgId} AND month = ${currentMonth}`
        .then(r => r.length > 0 ? (parseInt(r[0].scans_count as string) || 0) : 0)
        .catch(() => 0)
    : Promise.resolve(0);

  // Team member count (Supabase) — included so frontend doesn't need a separate call
  const teamPromise: Promise<number> = effectiveOrgId
    ? Promise.resolve(
        getSupabaseAdmin()
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', effectiveOrgId)
      ).then(({ count }) => count || 1)
       .catch(() => 1)
    : Promise.resolve(1);

  // Fire all 6 queries in parallel
  const [result, total, counts, customDomain, monthlyScans, teamMembers] = await Promise.all([
    listPromise,
    countPromise,
    countsPromise,
    domainPromise,
    scansPromise,
    teamPromise,
  ]);

  // If no org from auth context, try to get custom domain from first result's org
  let resolvedDomain = customDomain;
  if (!resolvedDomain && !effectiveOrgId && authContext?.userId && result.length > 0) {
    const firstOrgId = (result[0] as QRCodeRow).organization_id;
    if (firstOrgId) {
      resolvedDomain = await getOrgCustomDomain(firstOrgId);
    }
  }

  const qrCodes = result.map((row) => toQRCodeResponse(row as QRCodeRow, baseUrl, resolvedDomain));

  return res.status(200).json({
    qrCodes,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
    counts,
    stats: {
      monthlyScans,
      teamMembers,
    },
  });
}

async function handleBulk(
  req: VercelRequest,
  res: VercelResponse,
  authContext: { userId?: string; organizationId?: string; apiKeyId?: string } | null
) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  // Bulk requires auth
  if (!authContext?.userId) {
    const user = await requireAuth(req);
    authContext = { userId: user.id };
  }

  const { organizationId } = await getUserOrganization(authContext.userId!);

  const body = req.body as {
    ids?: string[];
    folder_id?: string | null;
    is_active?: boolean;
  };

  // Validate ids
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  }
  if (body.ids.length > 100) {
    return res.status(400).json({ error: 'Maximum 100 IDs per bulk operation' });
  }
  for (const id of body.ids) {
    if (typeof id !== 'string' || !isValidUUID(id)) {
      return res.status(400).json({ error: `Invalid ID: ${id}` });
    }
  }

  // Validate fields
  if (body.folder_id === undefined && body.is_active === undefined) {
    return res.status(400).json({ error: 'Provide at least one of: folder_id, is_active' });
  }

  if (body.folder_id !== undefined && body.folder_id !== null) {
    if (typeof body.folder_id !== 'string' || !isValidUUID(body.folder_id)) {
      return res.status(400).json({ error: 'folder_id must be a valid UUID or null' });
    }
  }

  if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }

  // Build dynamic SET clause
  const setClauses: string[] = [];
  const params: unknown[] = [organizationId, body.ids];
  let paramIdx = 3;

  if (body.folder_id !== undefined) {
    setClauses.push(`folder_id = $${paramIdx}`);
    params.push(body.folder_id);
    paramIdx++;
  }
  if (body.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIdx}`);
    params.push(body.is_active);
    paramIdx++;
  }
  setClauses.push('updated_at = NOW()');

  const rawSql = sql as unknown as (query: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
  const result = await rawSql(
    `UPDATE qr_codes SET ${setClauses.join(', ')} WHERE organization_id = $1 AND id = ANY($2) RETURNING id`,
    params
  );

  logger.qrCodes.info('Bulk update', {
    orgId: organizationId,
    count: result.length,
    fields: Object.keys(body).filter(k => k !== 'ids'),
  });

  return res.status(200).json({ updated: result.length });
}
