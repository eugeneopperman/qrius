// GET /api/folders - List org folders with QR code counts
// POST /api/folders - Create a new folder

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { logger } from '../_lib/logger.js';
import {
  requireAuth,
  getUserOrganization,
  requireRole,
  getSupabaseAdmin,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { validateString } from '../_lib/validate.js';

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await handleList(req, res);
    }

    if (req.method === 'POST') {
      return await handleCreate(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.folders.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);

  // Fetch folders from Supabase
  const { data: folders, error } = await getSupabaseAdmin()
    .from('qr_code_folders')
    .select('id, name, color, created_at, updated_at')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  if (error) {
    logger.folders.error('Failed to list folders', { error: error.message });
    return res.status(500).json({ error: 'Failed to list folders' });
  }

  // Get QR code counts per folder from Neon
  let folderCounts: Map<string, number> = new Map();
  if (sql && folders && folders.length > 0) {
    try {
      const folderIds = folders.map((f) => f.id);
      const countResult = await sql`
        SELECT folder_id, COUNT(*) as count
        FROM qr_codes
        WHERE organization_id = ${organizationId}
          AND folder_id = ANY(${folderIds})
        GROUP BY folder_id
      `;
      for (const row of countResult) {
        folderCounts.set(row.folder_id as string, parseInt(row.count as string) || 0);
      }
    } catch (err) {
      logger.folders.warn('Failed to get folder counts', { error: String(err) });
    }
  }

  const result = (folders || []).map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    qrCodeCount: folderCounts.get(f.id) || 0,
    created_at: f.created_at,
  }));

  return res.status(200).json({ folders: result });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);
  await requireRole(user.id, organizationId, ['owner', 'admin', 'editor']);

  const body = req.body as { name?: string; color?: string };

  // Validate name
  const name = validateString(body.name, 100);
  if (!name) {
    return res.status(400).json({ error: 'name is required (1-100 characters)' });
  }

  // Validate color
  let color = '#6B7280';
  if (body.color !== undefined) {
    if (typeof body.color !== 'string' || !HEX_COLOR_REGEX.test(body.color)) {
      return res.status(400).json({ error: 'color must be a valid hex color (e.g. #FF5733)' });
    }
    color = body.color;
  }

  // Check max 50 folders per org
  const { count, error: countError } = await getSupabaseAdmin()
    .from('qr_code_folders')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (countError) {
    logger.folders.error('Failed to count folders', { error: countError.message });
    return res.status(500).json({ error: 'Failed to create folder' });
  }

  if ((count || 0) >= 50) {
    return res.status(403).json({ error: 'Maximum 50 folders per organization' });
  }

  // Insert folder
  const { data: folder, error } = await getSupabaseAdmin()
    .from('qr_code_folders')
    .insert({ organization_id: organizationId, name, color })
    .select('id, name, color, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A folder with this name already exists' });
    }
    logger.folders.error('Failed to create folder', { error: error.message });
    return res.status(500).json({ error: 'Failed to create folder' });
  }

  logger.folders.info('Folder created', { folderId: folder.id, orgId: organizationId });

  return res.status(201).json({
    id: folder.id,
    name: folder.name,
    color: folder.color,
    qrCodeCount: 0,
    created_at: folder.created_at,
  });
}
