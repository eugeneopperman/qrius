// GET /api/qr-codes/:id - Get a single QR code with stats

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, toQRCodeResponse, toScanEventResponse, type QRCodeRow, type ScanEventRow } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid QR code ID' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;

  try {
    // Get QR code
    const qrResult = await sql`
      SELECT * FROM qr_codes WHERE id = ${id}
    `;

    if (qrResult.length === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrCode = qrResult[0] as QRCodeRow;
    const baseResponse = toQRCodeResponse(qrCode, baseUrl);

    // Get scan stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    // Scans today
    const todayResult = await sql`
      SELECT COUNT(*) as count FROM scan_events
      WHERE qr_code_id = ${id} AND scanned_at >= ${todayStart.toISOString()}
    `;
    const scansToday = parseInt(todayResult[0].count as string);

    // Scans this week
    const weekResult = await sql`
      SELECT COUNT(*) as count FROM scan_events
      WHERE qr_code_id = ${id} AND scanned_at >= ${weekStart.toISOString()}
    `;
    const scansThisWeek = parseInt(weekResult[0].count as string);

    // Scans this month
    const monthResult = await sql`
      SELECT COUNT(*) as count FROM scan_events
      WHERE qr_code_id = ${id} AND scanned_at >= ${monthStart.toISOString()}
    `;
    const scansThisMonth = parseInt(monthResult[0].count as string);

    // Top countries
    const countriesResult = await sql`
      SELECT country_code, COUNT(*) as count
      FROM scan_events
      WHERE qr_code_id = ${id} AND country_code IS NOT NULL
      GROUP BY country_code
      ORDER BY count DESC
      LIMIT 5
    `;
    const topCountries = countriesResult.map((row) => ({
      countryCode: row.country_code as string,
      count: parseInt(row.count as string),
    }));

    // Device breakdown
    const devicesResult = await sql`
      SELECT device_type, COUNT(*) as count
      FROM scan_events
      WHERE qr_code_id = ${id} AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY count DESC
    `;
    const deviceBreakdown = devicesResult.map((row) => ({
      deviceType: row.device_type as string,
      count: parseInt(row.count as string),
    }));

    // Recent scans (last 10)
    const recentResult = await sql`
      SELECT * FROM scan_events
      WHERE qr_code_id = ${id}
      ORDER BY scanned_at DESC
      LIMIT 10
    `;
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
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
