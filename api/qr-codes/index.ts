// POST /api/qr-codes - Create a new trackable QR code
// GET /api/qr-codes - List all QR codes

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, type QRCodeRow } from '../_lib/db.js';
import { generateShortCode } from '../_lib/shortCode.js';
import { setCachedRedirect } from '../_lib/kv.js';
import { logger } from '../_lib/logger.js';
import {
  authenticate,
  getUserOrganization,
  checkPlanLimit,
  getOrgCustomDomain,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { checkRateLimit, setRateLimitHeaders } from '../_lib/rateLimit.js';
import { isValidHttpUrl, validateOptionalString, validateStringArray } from '../_lib/validate.js';

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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.qrCodes.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
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

  // Filter by organization or user if authenticated
  let result;
  let countResult;

  if (authContext?.organizationId) {
    // API key auth - filter by organization
    result = await sql`
      SELECT id, short_code, destination_url, qr_type, original_data, name, description, tags, metadata, is_active, total_scans, user_id, organization_id, created_at, updated_at
      FROM qr_codes
      WHERE organization_id = ${authContext.organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    countResult = await sql`
      SELECT COUNT(*) as count
      FROM qr_codes
      WHERE organization_id = ${authContext.organizationId}
    `;
  } else if (authContext?.userId) {
    // JWT auth - get user's organization
    try {
      const orgMembership = await getUserOrganization(authContext.userId);
      result = await sql`
        SELECT id, short_code, destination_url, qr_type, original_data, name, description, tags, metadata, is_active, total_scans, user_id, organization_id, created_at, updated_at
        FROM qr_codes
        WHERE organization_id = ${orgMembership.organizationId}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count
        FROM qr_codes
        WHERE organization_id = ${orgMembership.organizationId}
      `;
    } catch {
      // User has no organization - return only their personal QR codes
      result = await sql`
        SELECT id, short_code, destination_url, qr_type, original_data, name, description, tags, metadata, is_active, total_scans, user_id, organization_id, created_at, updated_at
        FROM qr_codes
        WHERE user_id = ${authContext.userId} AND organization_id IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count
        FROM qr_codes
        WHERE user_id = ${authContext.userId} AND organization_id IS NULL
      `;
    }
  } else {
    // Unauthenticated - return all public QR codes (backward compatibility)
    // In production, you may want to require authentication here
    result = await sql`
      SELECT id, short_code, destination_url, qr_type, original_data, name, description, tags, metadata, is_active, total_scans, user_id, organization_id, created_at, updated_at
      FROM qr_codes
      WHERE organization_id IS NULL AND user_id IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    countResult = await sql`
      SELECT COUNT(*) as count
      FROM qr_codes
      WHERE organization_id IS NULL AND user_id IS NULL
    `;
  }

  // Look up custom domain for the org (one lookup for the whole list)
  const listOrgId = authContext?.organizationId || null;
  let customDomain: string | null = null;
  if (listOrgId) {
    customDomain = await getOrgCustomDomain(listOrgId);
  } else if (authContext?.userId) {
    // Try to get org from the first QR code in the result
    const firstOrgId = result.length > 0 ? (result[0] as QRCodeRow).organization_id : null;
    if (firstOrgId) {
      customDomain = await getOrgCustomDomain(firstOrgId);
    }
  }

  const qrCodes = result.map((row) => toQRCodeResponse(row as QRCodeRow, baseUrl, customDomain));
  const total = parseInt(countResult[0].count as string);

  // Fetch monthly scan count from usage_records if we have an organization
  let monthlyScans = 0;
  const orgId = authContext?.organizationId || (authContext?.userId ? null : null);
  // Derive orgId from the first QR code if available, or from auth context
  const effectiveOrgId = orgId || (result.length > 0 ? (result[0] as QRCodeRow).organization_id : null);
  if (effectiveOrgId && sql) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const usageResult = await sql`
        SELECT scans_count FROM usage_records
        WHERE organization_id = ${effectiveOrgId} AND month = ${currentMonth}
      `;
      if (usageResult.length > 0) {
        monthlyScans = parseInt(usageResult[0].scans_count as string) || 0;
      }
    } catch {
      // Non-critical — stats just show 0
    }
  }

  return res.status(200).json({
    qrCodes,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
    stats: {
      monthlyScans,
    },
  });
}
