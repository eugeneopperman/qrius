// GET/PATCH/DELETE /api/qr-codes/:id - Get, update, or delete a QR code

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, toScanEventResponse, type QRCodeRow, type ScanEventRow } from '../_lib/db.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { isValidHttpUrl, isValidUUID, validateOptionalString } from '../_lib/validate.js';
import { invalidateCachedRedirect } from '../_lib/kv.js';
import { requireAuth, getUserOrganization, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { logger } from '../_lib/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, 'GET, PATCH, DELETE, OPTIONS', req.headers.origin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid QR code ID' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res, id, baseUrl);
    }

    if (req.method === 'PATCH') {
      return await handlePatch(req, res, id, baseUrl);
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
    logger.qrCodes.error('API error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(
  _req: VercelRequest,
  res: VercelResponse,
  id: string,
  baseUrl: string
) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const qrResult = await sql`
    SELECT * FROM qr_codes WHERE id = ${id}
  `;

  if (qrResult.length === 0) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  const qrCode = qrResult[0] as QRCodeRow & { organization_id: string | null };
  const baseResponse = toQRCodeResponse(qrCode, baseUrl);

  // Look up scan_history_days from plan limits (default 30 for free)
  let scanHistoryDays = 30;
  if (qrCode.organization_id) {
    const planResult = await sql`
      SELECT pl.scan_history_days FROM organizations o
      JOIN plan_limits pl ON pl.plan = o.plan
      WHERE o.id = ${qrCode.organization_id}
    `;
    if (planResult.length > 0) {
      scanHistoryDays = planResult[0].scan_history_days as number;
    }
  }

  // Build scan history cutoff — -1 means unlimited
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  // History cutoff for recent scans list
  const historyCutoff = scanHistoryDays === -1
    ? new Date(0) // epoch — no limit
    : new Date(now.getTime() - scanHistoryDays * 24 * 60 * 60 * 1000);
  const historyCutoffISO = historyCutoff.toISOString();

  const [
    todayResult,
    weekResult,
    monthResult,
    countriesResult,
    devicesResult,
    recentResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${todayStart.toISOString()}`,
    sql`SELECT COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${weekStart.toISOString()}`,
    sql`SELECT COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${monthStart.toISOString()}`,
    sql`SELECT country_code, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND country_code IS NOT NULL AND scanned_at >= ${historyCutoffISO} GROUP BY country_code ORDER BY count DESC LIMIT 5`,
    sql`SELECT device_type, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND device_type IS NOT NULL AND scanned_at >= ${historyCutoffISO} GROUP BY device_type ORDER BY count DESC`,
    sql`SELECT * FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${historyCutoffISO} ORDER BY scanned_at DESC LIMIT 10`,
  ]);

  const scansToday = parseInt(todayResult[0].count as string);
  const scansThisWeek = parseInt(weekResult[0].count as string);
  const scansThisMonth = parseInt(monthResult[0].count as string);

  const topCountries = countriesResult.map((row) => ({
    countryCode: row.country_code as string,
    count: parseInt(row.count as string),
  }));

  const deviceBreakdown = devicesResult.map((row) => ({
    deviceType: row.device_type as string,
    count: parseInt(row.count as string),
  }));

  const recentScans = recentResult.map((row) => toScanEventResponse(row as ScanEventRow));

  return res.status(200).json({
    ...baseResponse,
    scansToday,
    scansThisWeek,
    scansThisMonth,
    topCountries,
    deviceBreakdown,
    recentScans,
  });
}

async function handlePatch(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
  baseUrl: string
) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const user = await requireAuth(req);

  // Verify ownership
  const qrResult = await sql`
    SELECT * FROM qr_codes WHERE id = ${id}
  `;

  if (qrResult.length === 0) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  const qrCode = qrResult[0] as QRCodeRow & { user_id: string | null; organization_id: string | null; short_code: string };

  // Check ownership: user owns it directly or through org membership
  if (qrCode.user_id === user.id) {
    // Direct ownership
  } else if (qrCode.organization_id) {
    try {
      await getUserOrganization(user.id, qrCode.organization_id);
    } catch {
      return res.status(403).json({ error: 'Not authorized to modify this QR code' });
    }
  } else {
    return res.status(403).json({ error: 'Not authorized to modify this QR code' });
  }

  const body = req.body as {
    destination_url?: string;
    name?: string;
    is_active?: boolean;
  };

  // Validate fields
  if (body.destination_url !== undefined) {
    if (typeof body.destination_url !== 'string' || body.destination_url.length === 0) {
      return res.status(400).json({ error: 'destination_url must be a non-empty string' });
    }
    // Only validate as URL for url-type QR codes
    const isUrlType = !qrCode.qr_type || qrCode.qr_type === 'url';
    if (isUrlType && !isValidHttpUrl(body.destination_url)) {
      return res.status(400).json({ error: 'destination_url must be a valid http or https URL' });
    }
    if (body.destination_url.length > 4096) {
      return res.status(400).json({ error: 'destination_url must be 4096 characters or fewer' });
    }
  }

  if (body.name !== undefined) {
    const name = validateOptionalString(body.name, 200);
    if (name === null) {
      return res.status(400).json({ error: 'name must be 200 characters or fewer' });
    }
  }

  if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }

  // Build update
  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.destination_url !== undefined) {
    updates.push('destination_url');
    values.push(body.destination_url);
  }
  if (body.name !== undefined) {
    updates.push('name');
    values.push(body.name || null);
  }
  if (body.is_active !== undefined) {
    updates.push('is_active');
    values.push(body.is_active);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Execute update using dynamic SQL
  // Build SET clause parts
  const setClauses = updates.map((field, i) => {
    // Use parameterized values for safety
    return `${field} = $${i + 2}`;
  }).join(', ');

  const result = await sql(
    `UPDATE qr_codes SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  if (result.length === 0) {
    return res.status(500).json({ error: 'Failed to update QR code' });
  }

  // Invalidate Redis cache if destination_url or is_active changed
  if (body.destination_url !== undefined || body.is_active !== undefined) {
    await invalidateCachedRedirect(qrCode.short_code);
  }

  const updated = result[0] as QRCodeRow;
  return res.status(200).json(toQRCodeResponse(updated, baseUrl));
}

async function handleDelete(
  req: VercelRequest,
  res: VercelResponse,
  id: string
) {
  if (!sql) return res.status(500).json({ error: 'Database not configured' });

  const user = await requireAuth(req);

  // Verify ownership
  const qrResult = await sql`
    SELECT id, user_id, organization_id, short_code FROM qr_codes WHERE id = ${id}
  `;

  if (qrResult.length === 0) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  const qrCode = qrResult[0] as { id: string; user_id: string | null; organization_id: string | null; short_code: string };

  // Check ownership
  if (qrCode.user_id === user.id) {
    // Direct ownership
  } else if (qrCode.organization_id) {
    try {
      await getUserOrganization(user.id, qrCode.organization_id);
    } catch {
      return res.status(403).json({ error: 'Not authorized to delete this QR code' });
    }
  } else {
    return res.status(403).json({ error: 'Not authorized to delete this QR code' });
  }

  // Delete scan events first (foreign key constraint)
  await sql`DELETE FROM scan_events WHERE qr_code_id = ${id}`;

  // Delete QR code
  await sql`DELETE FROM qr_codes WHERE id = ${id}`;

  // Clean up Redis cache
  await invalidateCachedRedirect(qrCode.short_code);

  return res.status(200).json({ success: true });
}
