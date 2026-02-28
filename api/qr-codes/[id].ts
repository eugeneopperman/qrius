// GET/PATCH/DELETE /api/qr-codes/:id - Get, update, or delete a QR code

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, toScanEventResponse, type QRCodeRow, type ScanEventRow } from '../_lib/db.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { isValidHttpUrl, isValidUUID, validateOptionalString } from '../_lib/validate.js';
import { invalidateCachedRedirect } from '../_lib/kv.js';
import { requireAuth, getUserOrganization, getOrgCustomDomain, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { logger } from '../_lib/logger.js';
import { parseUserAgent } from '../_lib/userAgentParser.js';

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

  const shortDomain = process.env.SHORT_URL_DOMAIN;
  const baseUrl = shortDomain ? `https://${shortDomain}` : (process.env.APP_URL || `https://${req.headers.host}`);

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.qrCodes.error('API error', { error: errorMessage });
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

  const qrCode = qrResult[0] as QRCodeRow;
  const customDomain = qrCode.organization_id ? await getOrgCustomDomain(qrCode.organization_id) : null;
  const baseResponse = toQRCodeResponse(qrCode, baseUrl, customDomain);

  // Look up scan_history_days from plan limits (default 30 for free)
  // organizations + plan_limits live in Supabase, not Neon — query may fail
  let scanHistoryDays = 30;
  if (qrCode.organization_id) {
    try {
      const planResult = await sql`
        SELECT pl.scan_history_days FROM organizations o
        JOIN plan_limits pl ON pl.plan = o.plan
        WHERE o.id = ${qrCode.organization_id}
      `;
      if (planResult.length > 0) {
        scanHistoryDays = planResult[0].scan_history_days as number;
      }
    } catch {
      // Tables may not exist in Neon — use default 30 days
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

  // 30-day window for daily chart
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  // 7-day window for hourly chart
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Analytics queries — wrapped in try/catch so the detail page still loads
  // even if analytics columns are missing or queries fail
  let scansToday = 0;
  let scansThisWeek = 0;
  let scansThisMonth = 0;
  let topCountries: { countryCode: string; count: number }[] = [];
  let deviceBreakdown: { deviceType: string; count: number }[] = [];
  let recentScans: ReturnType<typeof toScanEventResponse>[] = [];
  let referrerBreakdown: { referrer: string; count: number }[] = [];
  let scansByHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  let scansByDay: { date: string; count: number }[] = [];
  let topCountryCode: string | null = null;
  let topRegions: { region: string; count: number }[] = [];
  let browserBreakdown: { browser: string; count: number }[] = [];
  let osBreakdown: { os: string; count: number }[] = [];

  // Fill default scansByDay (30 days of zeros)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    scansByDay.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }

  try {
    const [
      todayResult,
      weekResult,
      monthResult,
      countriesResult,
      devicesResult,
      recentResult,
      referrerResult,
      hourlyResult,
      dailyResult,
      regionsResult,
      userAgentResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${todayStart.toISOString()}`,
      sql`SELECT COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${weekStart.toISOString()}`,
      sql`SELECT COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${monthStart.toISOString()}`,
      sql`SELECT country_code, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND country_code IS NOT NULL AND scanned_at >= ${historyCutoffISO} GROUP BY country_code ORDER BY count DESC LIMIT 10`,
      sql`SELECT device_type, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND device_type IS NOT NULL AND scanned_at >= ${historyCutoffISO} GROUP BY device_type ORDER BY count DESC`,
      sql`SELECT * FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${historyCutoffISO} ORDER BY scanned_at DESC LIMIT 10`,
      // Referrer breakdown — null = "Direct"
      sql`SELECT referrer, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${historyCutoffISO} GROUP BY referrer ORDER BY count DESC LIMIT 11`,
      // Hourly distribution (last 7 days)
      sql`SELECT EXTRACT(HOUR FROM scanned_at) as hour, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${sevenDaysAgoISO} GROUP BY hour ORDER BY hour`,
      // Daily scans (last 30 days)
      sql`SELECT DATE(scanned_at) as day, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND scanned_at >= ${thirtyDaysAgoISO} GROUP BY day ORDER BY day`,
      // Regions for top country
      sql`SELECT country_code, region, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND region IS NOT NULL AND scanned_at >= ${historyCutoffISO} GROUP BY country_code, region ORDER BY count DESC LIMIT 20`,
      // Raw user agents for JS-side parsing
      sql`SELECT user_agent, COUNT(*) as count FROM scan_events WHERE qr_code_id = ${id} AND user_agent IS NOT NULL AND scanned_at >= ${historyCutoffISO} GROUP BY user_agent ORDER BY count DESC LIMIT 100`,
    ]);

    scansToday = parseInt(todayResult[0]?.count as string || '0') || 0;
    scansThisWeek = parseInt(weekResult[0]?.count as string || '0') || 0;
    scansThisMonth = parseInt(monthResult[0]?.count as string || '0') || 0;

    topCountries = countriesResult.map((row) => ({
      countryCode: row.country_code as string,
      count: parseInt(row.count as string || '0') || 0,
    }));

    deviceBreakdown = devicesResult.map((row) => ({
      deviceType: row.device_type as string,
      count: parseInt(row.count as string || '0') || 0,
    }));

    recentScans = recentResult.map((row) => toScanEventResponse(row as ScanEventRow));

    // Referrer breakdown — map null to "Direct"
    referrerBreakdown = referrerResult.map((row) => ({
      referrer: (row.referrer as string | null) || 'Direct',
      count: parseInt(row.count as string || '0') || 0,
    }));

    // Hourly distribution — fill 24 hours with zeros
    const hourlyMap = new Map<number, number>();
    hourlyResult.forEach((row) => {
      hourlyMap.set(parseInt(row.hour as string || '0') || 0, parseInt(row.count as string || '0') || 0);
    });
    scansByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyMap.get(i) || 0,
    }));

    // Daily distribution — fill 30 days with zeros
    const dailyMap = new Map<string, number>();
    dailyResult.forEach((row) => {
      const dayStr = row.day instanceof Date
        ? row.day.toISOString().slice(0, 10)
        : String(row.day).slice(0, 10);
      dailyMap.set(dayStr, parseInt(row.count as string || '0') || 0);
    });
    scansByDay = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      scansByDay.push({ date: key, count: dailyMap.get(key) || 0 });
    }

    // Regions — extract top regions for #1 country
    topCountryCode = topCountries.length > 0 ? topCountries[0].countryCode : null;
    topRegions = regionsResult
      .filter((row) => row.country_code === topCountryCode)
      .map((row) => ({
        region: row.region as string,
        count: parseInt(row.count as string || '0') || 0,
      }));

    // Browser/OS breakdown from user agent strings
    const browserMap = new Map<string, number>();
    const osMap = new Map<string, number>();
    userAgentResult.forEach((row) => {
      const count = parseInt(row.count as string || '0') || 0;
      const parsed = parseUserAgent(row.user_agent as string);
      browserMap.set(parsed.browser, (browserMap.get(parsed.browser) || 0) + count);
      osMap.set(parsed.os, (osMap.get(parsed.os) || 0) + count);
    });

    browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    osBreakdown = Array.from(osMap.entries())
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    logger.qrCodes.error('Analytics queries failed — returning empty analytics', { id, error: String(error) });
  }

  return res.status(200).json({
    ...baseResponse,
    scansToday,
    scansThisWeek,
    scansThisMonth,
    topCountries,
    deviceBreakdown,
    recentScans,
    browserBreakdown,
    osBreakdown,
    referrerBreakdown,
    scansByHour,
    scansByDay,
    topRegions,
    topCountryForRegions: topCountryCode,
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

  const qrCode = qrResult[0] as QRCodeRow;

  // Check ownership: direct, org membership, or unowned/legacy
  if (qrCode.user_id === user.id) {
    // Direct ownership
  } else if (qrCode.organization_id) {
    try {
      await getUserOrganization(user.id, qrCode.organization_id);
    } catch {
      logger.qrCodes.warn('Unauthorized PATCH attempt', { id, userId: user.id, orgId: qrCode.organization_id });
      return res.status(403).json({ error: 'Not authorized to modify this QR code' });
    }
  } else if (qrCode.user_id === null && qrCode.organization_id === null) {
    // Legacy/unowned code — allow authenticated users to manage
  } else {
    logger.qrCodes.warn('Unauthorized PATCH attempt', { id, userId: user.id });
    return res.status(403).json({ error: 'Not authorized to modify this QR code' });
  }

  const body = req.body as {
    destination_url?: string;
    name?: string;
    is_active?: boolean;
    folder_id?: string | null;
    qr_type?: string;
    original_data?: unknown;
    style_options?: Record<string, unknown>;
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

  if (body.folder_id !== undefined && body.folder_id !== null) {
    if (typeof body.folder_id !== 'string' || !isValidUUID(body.folder_id)) {
      return res.status(400).json({ error: 'folder_id must be a valid UUID or null' });
    }
  }

  if (body.qr_type !== undefined) {
    const validTypes = ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard', 'event', 'location'];
    if (typeof body.qr_type !== 'string' || !validTypes.includes(body.qr_type)) {
      return res.status(400).json({ error: 'Invalid qr_type' });
    }
  }

  if (body.style_options !== undefined) {
    if (typeof body.style_options !== 'object' || body.style_options === null || Array.isArray(body.style_options)) {
      return res.status(400).json({ error: 'style_options must be an object' });
    }
    if (JSON.stringify(body.style_options).length > 4096) {
      return res.status(400).json({ error: 'style_options must be 4KB or less' });
    }
  }

  // When qr_type is provided, use it for URL validation logic instead of existing record's type
  if (body.destination_url !== undefined && body.qr_type !== undefined) {
    const effectiveType = body.qr_type;
    // Re-check: if the new type is 'url', destination_url must be a valid HTTP URL
    if (effectiveType === 'url' && !isValidHttpUrl(body.destination_url)) {
      return res.status(400).json({ error: 'destination_url must be a valid http or https URL' });
    }
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
  if (body.folder_id !== undefined) {
    updates.push('folder_id');
    values.push(body.folder_id);
  }
  if (body.qr_type !== undefined) {
    updates.push('qr_type');
    values.push(body.qr_type);
  }
  if (body.original_data !== undefined) {
    updates.push('original_data');
    values.push(JSON.stringify(body.original_data));
  }
  if (body.style_options !== undefined) {
    updates.push('metadata');
    values.push(JSON.stringify({ style_options: body.style_options }));
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

  const result = await sql.query(
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

  const updated = result[0] as unknown as QRCodeRow;

  logger.qrCodes.info('QR code updated', { id, userId: user.id, fields: updates });

  const patchCustomDomain = updated.organization_id ? await getOrgCustomDomain(updated.organization_id) : null;
  return res.status(200).json(toQRCodeResponse(updated, baseUrl, patchCustomDomain));
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

  // Check ownership: direct, org membership, or unowned/legacy
  if (qrCode.user_id === user.id) {
    // Direct ownership
  } else if (qrCode.organization_id) {
    try {
      await getUserOrganization(user.id, qrCode.organization_id);
    } catch {
      logger.qrCodes.warn('Unauthorized DELETE attempt', { id, userId: user.id, orgId: qrCode.organization_id });
      return res.status(403).json({ error: 'Not authorized to delete this QR code' });
    }
  } else if (qrCode.user_id === null && qrCode.organization_id === null) {
    // Legacy/unowned code — allow authenticated users to manage
  } else {
    logger.qrCodes.warn('Unauthorized DELETE attempt', { id, userId: user.id });
    return res.status(403).json({ error: 'Not authorized to delete this QR code' });
  }

  // Delete scan events first (foreign key constraint)
  await sql`DELETE FROM scan_events WHERE qr_code_id = ${id}`;

  // Delete QR code
  await sql`DELETE FROM qr_codes WHERE id = ${id}`;

  // Clean up Redis cache
  await invalidateCachedRedirect(qrCode.short_code);

  logger.qrCodes.info('QR code deleted', { id, userId: user.id, shortCode: qrCode.short_code });

  return res.status(200).json({ success: true });
}
