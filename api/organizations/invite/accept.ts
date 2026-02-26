// POST /api/organizations/invite/accept - Accept a team invitation

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin, UnauthorizedError } from '../../_lib/auth.js';
import { setCorsHeaders } from '../../_lib/cors.js';
import { logger } from '../../_lib/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: fetch invitation details (no auth required — to show the invite before sign-in)
    if (req.method === 'GET') {
      return await handleGetInvite(req, res);
    }

    // POST: accept the invitation (auth required)
    if (req.method === 'POST') {
      return await handleAcceptInvite(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.organizations.error('Invite accept error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetInvite(req: VercelRequest, res: VercelResponse) {
  const token = req.query.token as string;

  if (!token || typeof token !== 'string' || token.length < 32) {
    return res.status(400).json({ error: 'Invalid invitation token' });
  }

  const { data: invitation, error } = await getSupabaseAdmin()
    .from('organization_invitations')
    .select(`
      id,
      email,
      role,
      expires_at,
      accepted_at,
      organization:organizations(id, name, slug)
    `)
    .eq('token', token)
    .single();

  if (error || !invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (invitation.accepted_at) {
    return res.status(400).json({ error: 'Invitation already accepted' });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invitation has expired' });
  }

  return res.status(200).json({
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expires_at,
      organization: invitation.organization,
    },
  });
}

async function handleAcceptInvite(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req);
  const { token } = req.body as { token?: string };

  if (!token || typeof token !== 'string' || token.length < 32) {
    return res.status(400).json({ error: 'Invalid invitation token' });
  }

  // Fetch invitation
  const { data: invitation, error: inviteError } = await getSupabaseAdmin()
    .from('organization_invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (inviteError || !invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  if (invitation.accepted_at) {
    return res.status(400).json({ error: 'Invitation already accepted' });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invitation has expired' });
  }

  // Check if user's email matches the invitation
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(403).json({
      error: 'This invitation was sent to a different email address',
    });
  }

  // Insert membership directly — catch unique constraint violation (TOCTOU-safe)
  const { error: memberError } = await getSupabaseAdmin()
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
    });

  if (memberError) {
    // 23505 = unique_violation — user is already a member (race condition or re-accept)
    if (memberError.code === '23505') {
      await getSupabaseAdmin()
        .from('organization_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return res.status(200).json({ message: 'Already a member of this organization' });
    }

    logger.organizations.error('Failed to create membership', {
      error: memberError.message,
      userId: user.id,
      orgId: invitation.organization_id,
    });
    return res.status(500).json({ error: 'Failed to accept invitation' });
  }

  // Mark invitation as accepted
  await getSupabaseAdmin()
    .from('organization_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  // Fetch organization details for response
  const { data: org } = await getSupabaseAdmin()
    .from('organizations')
    .select('id, name, slug')
    .eq('id', invitation.organization_id)
    .single();

  logger.organizations.info('Invitation accepted', {
    userId: user.id,
    orgId: invitation.organization_id,
    role: invitation.role,
  });

  return res.status(200).json({
    message: 'Invitation accepted',
    organization: org,
  });
}
