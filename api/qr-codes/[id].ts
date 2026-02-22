// GET/PATCH/DELETE /api/qr-codes/:id - Get, update, or delete a QR code

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, toScanEventResponse, type QRCodeRow, type ScanEventRow } from '../_lib/db.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { isValidHttpUrl, isValidUUID, validateOptionalString } from '../_lib/validate.js';
import { invalidateCachedRedirect } from '../_lib/kv.js';
import { requireAuth, getUserOrganization, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
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

  const qrCode = qrResult[0] as QRCodeRow;
  const baseResponse = toQRCodeResponse(qrCode, baseUrl);

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

  // Referrer breakdown — map null to "Direct"
  const referrerBreakdown = referrerResult.map((row) => ({
    referrer: (row.referrer as string | null) || 'Direct',
    count: parseInt(row.count as string),
  }));

  // Hourly distribution — fill 24 hours with zeros
  const hourlyMap = new Map<number, number>();
  hourlyResult.forEach((row) => {
    hourlyMap.set(parseInt(row.hour as string), parseInt(row.count as string));
  });
  const scansByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyMap.get(i) || 0,
  }));

  // Daily distribution — fill 30 days with zeros
  const dailyMap = new Map<string, number>();
  dailyResult.forEach((row) => {
    const dayStr = row.day instanceof Date
      ? row.day.toISOString().slice(0, 10)
      : String(row.day).slice(0, 10);
    dailyMap.set(dayStr, parseInt(row.count as string));
  });
  const scansByDay: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    scansByDay.push({ date: key, count: dailyMap.get(key) || 0 });
  }

  // Regions — extract top regions for #1 country
  const topCountryCode = topCountries.length > 0 ? topCountries[0].countryCode : null;
  const topRegions = regionsResult
    .filter((row) => row.country_code === topCountryCode)
    .map((row) => ({
      region: row.region as string,
      count: parseInt(row.count as string),
    }));

  // Browser/OS breakdown from user agent strings
  const browserMap = new Map<string, number>();
  const osMap = new Map<string, number>();
  userAgentResult.forEach((row) => {
    const count = parseInt(row.count as string);
    const parsed = parseUserAgent(row.user_agent as string);
    browserMap.set(parsed.browser, (browserMap.get(parsed.browser) || 0) + count);
    osMap.set(parsed.os, (osMap.get(parsed.os) || 0) + count);
  });

  const browserBreakdown = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count);

  const osBreakdown = Array.from(osMap.entries())
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count);

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

  // neon() supports sql(string, params) at runtime but TS types only expose tagged templates
  const rawSql = sql as unknown as (query: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
  const result = await rawSql(
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
