// GET /api/templates - List org templates
// POST /api/templates - Create a new template (or bulk migrate with ?action=migrate)
// PATCH /api/templates?id=xxx - Update a template
// DELETE /api/templates?id=xxx - Delete a template

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { logger } from '../_lib/logger.js';
import {
  requireAuth,
  getUserOrganization,
  getSupabaseAdmin,
  UnauthorizedError,
  ForbiddenError,
} from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { isValidUUID, validateString } from '../_lib/validate.js';

const FREE_TEMPLATE_LIMIT = 3;

interface TemplateStyle {
  [key: string]: unknown;
}

async function getTemplateLimit(organizationId: string): Promise<number> {
  try {
    const { data: org } = await getSupabaseAdmin()
      .from('organizations')
      .select('plan')
      .eq('id', organizationId)
      .single();

    const plan = org?.plan || 'free';
    return plan === 'free' ? FREE_TEMPLATE_LIMIT : -1; // -1 = unlimited
  } catch {
    return FREE_TEMPLATE_LIMIT; // Default to free limit on error
  }
}

async function countOrgTemplates(organizationId: string, userId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM brand_templates
    WHERE organization_id = ${organizationId}
       OR (user_id = ${userId} AND organization_id IS NULL)
  `;
  return parseInt(result[0].count as string) || 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, POST, PATCH, DELETE, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    if (req.method === 'GET') {
      return await handleList(req, res);
    }

    if (req.method === 'POST') {
      const { action } = req.query;
      if (action === 'migrate') {
        return await handleMigrate(req, res);
      }
      return await handleCreate(req, res);
    }

    // PATCH and DELETE require an id query param
    const { id } = req.query;
    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    if (req.method === 'PATCH') {
      return await handlePatch(req, res, id);
    }

    if (req.method === 'DELETE') {
      return await handleDelete(req, res, id);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.templates.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);

  const templates = await sql`
    SELECT id, name, style, created_at, updated_at
    FROM brand_templates
    WHERE organization_id = ${organizationId}
       OR (user_id = ${user.id} AND organization_id IS NULL)
    ORDER BY created_at DESC
  `;

  return res.status(200).json({
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      style: t.style,
      created_at: t.created_at,
      updated_at: t.updated_at,
    })),
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);

  const body = req.body as { name?: string; style?: TemplateStyle };

  // Validate name
  const name = validateString(body.name, 200);
  if (!name) {
    return res.status(400).json({ error: 'name is required (1-200 characters)' });
  }

  // Validate style
  if (!body.style || typeof body.style !== 'object' || Array.isArray(body.style)) {
    return res.status(400).json({ error: 'style must be a JSON object' });
  }

  // Check style size (max 8KB)
  const styleJson = JSON.stringify(body.style);
  if (styleJson.length > 8192) {
    return res.status(400).json({ error: 'style exceeds maximum size (8KB)' });
  }

  // Check plan limit
  const limit = await getTemplateLimit(organizationId);
  if (limit !== -1) {
    const currentCount = await countOrgTemplates(organizationId, user.id);
    if (currentCount >= limit) {
      return res.status(403).json({
        error: 'Template limit reached. Upgrade to Pro for unlimited templates.',
        current: currentCount,
        limit,
      });
    }
  }

  // Insert template
  const result = await sql`
    INSERT INTO brand_templates (user_id, organization_id, name, style)
    VALUES (${user.id}, ${organizationId}, ${name}, ${JSON.stringify(body.style)})
    RETURNING id, name, style, created_at, updated_at
  `;

  const template = result[0];
  logger.templates.info('Template created', { templateId: template.id, orgId: organizationId });

  return res.status(201).json({
    id: template.id,
    name: template.name,
    style: template.style,
    created_at: template.created_at,
    updated_at: template.updated_at,
  });
}

async function handleMigrate(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);

  const body = req.body as { templates?: Array<{ name?: string; style?: TemplateStyle }> };

  if (!body.templates || !Array.isArray(body.templates)) {
    return res.status(400).json({ error: 'templates must be an array' });
  }

  // Validate each template
  const validTemplates = body.templates.filter(
    (t) =>
      t &&
      typeof t === 'object' &&
      typeof t.name === 'string' &&
      t.name.length > 0 &&
      t.name.length <= 200 &&
      t.style &&
      typeof t.style === 'object' &&
      !Array.isArray(t.style)
  );

  if (validTemplates.length === 0) {
    return res.status(200).json({ imported: 0, skipped: body.templates.length });
  }

  // Check plan limit
  const limit = await getTemplateLimit(organizationId);
  const currentCount = await countOrgTemplates(organizationId, user.id);

  let remaining: number;
  if (limit === -1) {
    remaining = validTemplates.length; // Unlimited
  } else {
    remaining = Math.max(0, limit - currentCount);
  }

  if (remaining === 0) {
    return res.status(200).json({ imported: 0, skipped: validTemplates.length });
  }

  const toInsert = validTemplates.slice(0, remaining);
  let imported = 0;

  for (const t of toInsert) {
    try {
      await sql`
        INSERT INTO brand_templates (user_id, organization_id, name, style)
        VALUES (${user.id}, ${organizationId}, ${t.name!}, ${JSON.stringify(t.style)})
      `;
      imported++;
    } catch (err) {
      logger.templates.warn('Failed to migrate template', { name: t.name, error: String(err) });
    }
  }

  logger.templates.info('Templates migrated from localStorage', {
    orgId: organizationId,
    imported,
    skipped: validTemplates.length - imported,
  });

  return res.status(200).json({
    imported,
    skipped: body.templates.length - imported,
  });
}

async function handlePatch(req: VercelRequest, res: VercelResponse, id: string) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);

  // Verify template exists and belongs to org
  const existing = await sql`
    SELECT id, organization_id, user_id FROM brand_templates WHERE id = ${id}
  `;

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const template = existing[0];
  if (template.organization_id !== organizationId && template.user_id !== user.id) {
    return res.status(403).json({ error: 'Not authorized to modify this template' });
  }

  const body = req.body as { name?: string; style?: TemplateStyle };
  const updates: string[] = [];
  const values: unknown[] = [id]; // $1 = id
  let paramIdx = 2;

  if (body.name !== undefined) {
    const name = validateString(body.name, 200);
    if (!name) {
      return res.status(400).json({ error: 'name must be 1-200 characters' });
    }
    updates.push(`name = $${paramIdx++}`);
    values.push(name);
  }

  if (body.style !== undefined) {
    if (!body.style || typeof body.style !== 'object' || Array.isArray(body.style)) {
      return res.status(400).json({ error: 'style must be a JSON object' });
    }
    const styleJson = JSON.stringify(body.style);
    if (styleJson.length > 8192) {
      return res.status(400).json({ error: 'style exceeds maximum size (8KB)' });
    }
    updates.push(`style = $${paramIdx++}`);
    values.push(styleJson);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push(`updated_at = NOW()`);

  const result = await sql.query(
    `UPDATE brand_templates SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, style, created_at, updated_at`,
    values
  );

  if (result.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const updated = result[0];
  logger.templates.info('Template updated', { templateId: id, orgId: organizationId });

  return res.status(200).json({
    id: updated.id,
    name: updated.name,
    style: updated.style,
    created_at: updated.created_at,
    updated_at: updated.updated_at,
  });
}

async function handleDelete(req: VercelRequest, res: VercelResponse, id: string) {
  const user = await requireAuth(req);
  const { organizationId } = await getUserOrganization(user.id);

  // Verify template exists and belongs to org
  const existing = await sql`
    SELECT id, organization_id, user_id FROM brand_templates WHERE id = ${id}
  `;

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const template = existing[0];
  if (template.organization_id !== organizationId && template.user_id !== user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this template' });
  }

  await sql`DELETE FROM brand_templates WHERE id = ${id}`;

  logger.templates.info('Template deleted', { templateId: id, orgId: organizationId });

  return res.status(200).json({ success: true });
}
