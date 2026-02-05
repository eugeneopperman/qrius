// POST /api/qr-codes - Create a new trackable QR code
// GET /api/qr-codes - List all QR codes

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, type QRCodeRow } from '../_lib/db';
import { generateShortCode } from '../_lib/shortCode';
import { setCachedRedirect } from '../_lib/kv';
import { logger } from '../_lib/logger';
import {
  authenticate,
  getUserOrganization,
  checkPlanLimit,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth';

interface CreateQRCodeRequest {
  destination_url: string;
  qr_type?: string;
  original_data?: unknown;
  name?: string;
  description?: string;
  tags?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  try {
    // Authenticate request (optional for backward compatibility)
    let authContext: { userId?: string; organizationId?: string; apiKeyId?: string } | null = null;

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
  if (!body.destination_url) {
    return res.status(400).json({ error: 'destination_url is required' });
  }

  // Validate URL format
  try {
    new URL(body.destination_url);
  } catch {
    return res.status(400).json({ error: 'Invalid destination_url format' });
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

  do {
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
  } while (true);

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
      tags
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
      ${body.tags || []}
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

  // Pre-populate cache for fast redirects
  await setCachedRedirect(shortCode, {
    destinationUrl: body.destination_url,
    qrCodeId: row.id,
  });

  return res.status(201).json(toQRCodeResponse(row, baseUrl));
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
      SELECT *
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
        SELECT *
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
        SELECT *
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
      SELECT *
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

  const qrCodes = result.map((row) => toQRCodeResponse(row as QRCodeRow, baseUrl));
  const total = parseInt(countResult[0].count as string);

  return res.status(200).json({
    qrCodes,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}
