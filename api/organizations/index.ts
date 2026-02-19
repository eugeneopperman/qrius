// GET /api/organizations - List user's organizations
// POST /api/organizations - Create new organization

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, UnauthorizedError } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface CreateOrgRequest {
  name: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res, 'GET, POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const user = await requireAuth(req);

    if (req.method === 'GET') {
      return await handleList(req, res, user.id);
    }

    if (req.method === 'POST') {
      return await handleCreate(req, res, user.id);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.organizations.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse, userId: string) {
  // Get all organizations the user is a member of
  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .select(`
      role,
      joined_at,
      organization:organizations(
        id,
        name,
        slug,
        logo_url,
        plan,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: true });

  if (error) {
    logger.organizations.error('Error fetching organizations', { error: error.message });
    return res.status(500).json({ error: 'Failed to fetch organizations' });
  }

  const organizations = data.map((m) => ({
    ...m.organization,
    role: m.role,
    joinedAt: m.joined_at,
  }));

  return res.status(200).json({ organizations });
}

async function handleCreate(req: VercelRequest, res: VercelResponse, userId: string) {
  const body = req.body as CreateOrgRequest;

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }

  const name = body.name.trim();

  if (name.length > 100) {
    return res.status(400).json({ error: 'name must be 100 characters or fewer' });
  }

  // Generate slug from name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

  // Create organization
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name,
      slug,
    })
    .select()
    .single();

  if (orgError) {
    logger.organizations.error('Error creating organization', { error: orgError.message });
    return res.status(500).json({ error: 'Failed to create organization' });
  }

  // Add user as owner
  const { error: memberError } = await supabaseAdmin.from('organization_members').insert({
    organization_id: org.id,
    user_id: userId,
    role: 'owner',
  });

  if (memberError) {
    // Rollback org creation
    await supabaseAdmin.from('organizations').delete().eq('id', org.id);
    logger.organizations.error('Error adding member', { error: memberError.message });
    return res.status(500).json({ error: 'Failed to create organization' });
  }

  return res.status(201).json({
    organization: {
      ...org,
      role: 'owner',
    },
  });
}
