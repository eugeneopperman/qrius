// POST /api/organizations/:id/invite - Invite member to organization

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin, requireRole, checkPlanLimit, UnauthorizedError, ForbiddenError } from '../../_lib/auth.js';
import { setCorsHeaders } from '../../_lib/cors.js';
import { isValidUUID } from '../../_lib/validate.js';
import { logger } from '../../_lib/logger.js';
import crypto from 'crypto';
import { checkRateLimit } from '../../_lib/rateLimit.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteRequest {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res, 'POST, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);

    // Rate limit: 10 invites per day per user
    const rateLimit = await checkRateLimit(`invite:${user.id}`, 10);
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many invitations. Please try again later.' });
    }

    const organizationId = req.query.id as string;

    if (!organizationId || !isValidUUID(organizationId)) {
      return res.status(400).json({ error: 'A valid Organization ID is required' });
    }

    // Check user has permission to invite
    await requireRole(user.id, organizationId, ['owner', 'admin']);

    // Check team member limit
    const { current, limit } = await checkPlanLimit(organizationId, 'team_members');
    // Also count pending invites toward the limit
    const { count: pendingInvites } = await getSupabaseAdmin()
      .from('organization_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('accepted_at', null);
    const totalMembers = current + (pendingInvites || 0);
    if (limit !== -1 && totalMembers >= limit) {
      return res.status(403).json({
        error: 'Team member limit reached',
        current: totalMembers,
        limit,
      });
    }

    const body = req.body as InviteRequest;

    if (!body.email || typeof body.email !== 'string') {
      return res.status(400).json({ error: 'email is required' });
    }

    if (body.email.length > 254) {
      return res.status(400).json({ error: 'email must be 254 characters or fewer' });
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!body.role || !['admin', 'editor', 'viewer'].includes(body.role)) {
      return res.status(400).json({ error: 'role must be one of: admin, editor, viewer' });
    }

    // Check if there's already a pending invitation or existing membership
    // Uses a single invitation check — avoids querying users table (email enumeration)
    // If the invited user is already a member, the acceptance flow handles the duplicate gracefully
    const { data: existingInvite } = await getSupabaseAdmin()
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
    const { data: invitation, error } = await getSupabaseAdmin()
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
      logger.organizations.error('Error creating invitation', { error: error.message });
      return res.status(500).json({ error: 'Failed to create invitation' });
    }

    logger.organizations.info('Invitation sent', { orgId: organizationId, email: body.email, role: body.role });

    // TODO: Send invitation email
    // For now, return the invite link
    const baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      logger.organizations.error('APP_URL not configured - cannot generate invite link');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const inviteLink = `${baseUrl}/invite/accept?token=${token}`;

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
    logger.organizations.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
