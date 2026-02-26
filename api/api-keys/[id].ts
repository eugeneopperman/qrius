// DELETE /api/api-keys/:id - Revoke API key

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin, getUserOrganization, requireRole, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { isValidUUID } from '../_lib/validate.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { logger } from '../_lib/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res, 'DELETE, OPTIONS', req.headers.origin as string | undefined);

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

    if (!keyId || !isValidUUID(keyId)) {
      return res.status(400).json({ error: 'A valid API key ID is required' });
    }

    // Only owners and admins can manage API keys
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Verify the key belongs to this organization
    const { data: key, error: fetchError } = await getSupabaseAdmin()
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
    const { error: deleteError } = await getSupabaseAdmin()
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (deleteError) {
      logger.apiKeys.error('Error deleting API key', { error: deleteError.message, keyId });
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
    logger.apiKeys.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
