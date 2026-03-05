// GET/PATCH /api/admin/moderation — Admin moderation queue
// Same auth pattern as api/admin/stats.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { sql } from '../_lib/db.js';
import { invalidateCachedRedirect } from '../_lib/kv.js';
import { logger } from '../_lib/logger.js';

const ADMIN_EMAILS = ['eugeneopperman11@gmail.com'];

function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

interface ModerationReport {
  id: string;
  qr_code_id: string | null;
  short_code: string;
  reported_url: string;
  reason: string;
  description: string | null;
  reporter_email: string | null;
  reporter_ip_hash: string | null;
  source: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined QR code info
  qr_moderation_status?: string;
  qr_is_active?: boolean;
  qr_user_id?: string | null;
  qr_destination_url?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  try {
    const user = await requireAuth(req);
    if (!isAdmin(user.email)) {
      throw new ForbiddenError('Admin access required');
    }

    if (req.method === 'GET') {
      return await handleList(req, res, user.email);
    }
    if (req.method === 'PATCH') {
      return await handleAction(req, res, user.email);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof UnauthorizedError) return res.status(401).json({ error: error.message });
    if (error instanceof ForbiddenError) return res.status(403).json({ error: error.message });
    logger.qrCodes.error('Admin moderation error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse, _adminEmail: string) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const statusFilter = (req.query.status as string) || 'pending';
  const validStatuses = ['pending', 'reviewed', 'actioned', 'dismissed', 'all'];
  if (!validStatuses.includes(statusFilter)) {
    return res.status(400).json({ error: 'Invalid status filter' });
  }

  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  // Get counts for all statuses
  const countsResult = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
      COUNT(*) FILTER (WHERE status = 'actioned') as actioned,
      COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed
    FROM moderation_reports
  `;
  const counts = {
    pending: parseInt(String(countsResult[0]?.pending)) || 0,
    reviewed: parseInt(String(countsResult[0]?.reviewed)) || 0,
    actioned: parseInt(String(countsResult[0]?.actioned)) || 0,
    dismissed: parseInt(String(countsResult[0]?.dismissed)) || 0,
  };

  // Fetch reports with QR code info
  let reports: ModerationReport[];

  if (statusFilter === 'all') {
    reports = await sql`
      SELECT r.*, q.moderation_status as qr_moderation_status, q.is_active as qr_is_active, q.user_id as qr_user_id, q.destination_url as qr_destination_url
      FROM moderation_reports r
      LEFT JOIN qr_codes q ON q.id = r.qr_code_id
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as unknown as ModerationReport[];
  } else {
    reports = await sql`
      SELECT r.*, q.moderation_status as qr_moderation_status, q.is_active as qr_is_active, q.user_id as qr_user_id, q.destination_url as qr_destination_url
      FROM moderation_reports r
      LEFT JOIN qr_codes q ON q.id = r.qr_code_id
      WHERE r.status = ${statusFilter}
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as unknown as ModerationReport[];
  }

  return res.status(200).json({ reports, counts });
}

async function handleAction(req: VercelRequest, res: VercelResponse, adminEmail: string) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const body = req.body as {
    report_id?: string;
    action?: 'approve' | 'suspend_qr' | 'suspend_user' | 'dismiss';
    admin_notes?: string;
  };

  if (!body.report_id || typeof body.report_id !== 'string') {
    return res.status(400).json({ error: 'report_id is required' });
  }

  const validActions = ['approve', 'suspend_qr', 'suspend_user', 'dismiss'];
  if (!body.action || !validActions.includes(body.action)) {
    return res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` });
  }

  // Fetch the report
  const reportResult = await sql`
    SELECT r.*, q.short_code as qr_short_code, q.user_id as qr_user_id
    FROM moderation_reports r
    LEFT JOIN qr_codes q ON q.id = r.qr_code_id
    WHERE r.id = ${body.report_id}
  `;

  if (reportResult.length === 0) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const report = reportResult[0] as ModerationReport & { qr_short_code?: string };
  const notes = body.admin_notes || null;

  switch (body.action) {
    case 'approve': {
      // Mark report as reviewed, set QR back to clean
      await sql`UPDATE moderation_reports SET status = 'reviewed', admin_notes = ${notes}, reviewed_by = ${adminEmail}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${body.report_id}`;
      if (report.qr_code_id) {
        await sql`UPDATE qr_codes SET moderation_status = 'clean', updated_at = NOW() WHERE id = ${report.qr_code_id}`;
      }
      logger.qrCodes.info('Report approved (clean)', { reportId: body.report_id, admin: adminEmail });
      break;
    }

    case 'suspend_qr': {
      // Mark report as actioned, suspend the QR code
      await sql`UPDATE moderation_reports SET status = 'actioned', admin_notes = ${notes}, reviewed_by = ${adminEmail}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${body.report_id}`;
      if (report.qr_code_id) {
        await sql`UPDATE qr_codes SET moderation_status = 'suspended', is_active = false, updated_at = NOW() WHERE id = ${report.qr_code_id}`;
        // Invalidate Redis cache so redirect handler picks up suspension
        if (report.qr_short_code) {
          await invalidateCachedRedirect(report.qr_short_code);
        }
      }
      logger.qrCodes.info('QR code suspended', { reportId: body.report_id, qrCodeId: report.qr_code_id, admin: adminEmail });
      break;
    }

    case 'suspend_user': {
      // Suspend QR + ban user via Supabase Admin API
      await sql`UPDATE moderation_reports SET status = 'actioned', admin_notes = ${notes}, reviewed_by = ${adminEmail}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${body.report_id}`;
      if (report.qr_code_id) {
        await sql`UPDATE qr_codes SET moderation_status = 'suspended', is_active = false, updated_at = NOW() WHERE id = ${report.qr_code_id}`;
        if (report.qr_short_code) {
          await invalidateCachedRedirect(report.qr_short_code);
        }
      }
      // Ban user via Supabase Admin API
      if (report.qr_user_id) {
        try {
          const supabase = getSupabaseAdmin();
          await supabase.auth.admin.updateUserById(report.qr_user_id, { ban_duration: '876000h' }); // ~100 years
          logger.qrCodes.info('User banned', { userId: report.qr_user_id, admin: adminEmail });
        } catch (error) {
          logger.qrCodes.error('Failed to ban user', { userId: report.qr_user_id, error: String(error) });
        }
      }
      logger.qrCodes.info('User suspended', { reportId: body.report_id, userId: report.qr_user_id, admin: adminEmail });
      break;
    }

    case 'dismiss': {
      // Mark report as dismissed, no QR changes
      await sql`UPDATE moderation_reports SET status = 'dismissed', admin_notes = ${notes}, reviewed_by = ${adminEmail}, reviewed_at = NOW(), updated_at = NOW() WHERE id = ${body.report_id}`;
      logger.qrCodes.info('Report dismissed', { reportId: body.report_id, admin: adminEmail });
      break;
    }
  }

  return res.status(200).json({ success: true, action: body.action });
}
