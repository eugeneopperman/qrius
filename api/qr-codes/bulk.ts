// PATCH /api/qr-codes/bulk - Bulk update QR codes (folder_id, is_active)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { logger } from '../_lib/logger.js';
import {
  requireAuth,
  getUserOrganization,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { isValidUUID } from '../_lib/validate.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'PATCH, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const user = await requireAuth(req);
    const { organizationId } = await getUserOrganization(user.id);

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
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.qrCodes.error('Bulk update error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
