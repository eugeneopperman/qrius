// DELETE /api/api-keys/:id - Revoke API key

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    const { organizationId } = await getUserOrganization(user.id);
    const keyId = req.query.id as string;

    if (!keyId) {
      return res.status(400).json({ error: 'API key ID is required' });
    }

    // Only owners and admins can manage API keys
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Verify the key belongs to this organization
    const { data: key, error: fetchError } = await supabaseAdmin
      .from('api_keys')
      .select('id, organization_id')
      .eq('id', keyId)
      .single();

    if (fetchError || !key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    if (key.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the key
    const { error: deleteError } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (deleteError) {
      console.error('Error deleting API key:', deleteError);
      return res.status(500).json({ error: 'Failed to delete API key' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
