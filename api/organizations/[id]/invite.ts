// POST /api/organizations/:id/invite - Invite member to organization

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireRole, UnauthorizedError, ForbiddenError } from '../../_lib/auth';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface InviteRequest {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    const organizationId = req.query.id as string;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Check user has permission to invite
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    const body = req.body as InviteRequest;

    if (!body.email) {
      return res.status(400).json({ error: 'email is required' });
    }

    if (!['admin', 'editor', 'viewer'].includes(body.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', (
        await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', body.email)
          .single()
      ).data?.id)
      .single();

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabaseAdmin
      .from('organization_invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', body.email)
      .is('accepted_at', null)
      .single();

    if (existingInvite) {
      return res.status(400).json({ error: 'Invitation already sent' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const { data: invitation, error } = await supabaseAdmin
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email: body.email,
        role: body.role,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return res.status(500).json({ error: 'Failed to create invitation' });
    }

    // TODO: Send invitation email
    // For now, return the invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
    const inviteLink = `${baseUrl}/invite/${token}`;

    return res.status(201).json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expires_at,
      },
      inviteLink, // In production, this would be sent via email
    });
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
