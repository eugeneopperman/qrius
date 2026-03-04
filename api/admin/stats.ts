import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, getSupabaseAdmin, UnauthorizedError, ForbiddenError } from '../_lib/auth.js';
import { sql } from '../_lib/db.js';
import { logger } from '../_lib/logger.js';

// Server-side admin whitelist (src/ constants not importable from api/)
const ADMIN_EMAILS = ['eugeneopperman11@gmail.com'];

function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireAuth(req);
    if (!isAdmin(user.email)) {
      throw new ForbiddenError('Admin access required');
    }

    const supabase = getSupabaseAdmin();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallel queries across both databases
    const [
      // Supabase queries
      totalUsersResult,
      activeUsersResult,
      signupsTodayResult,
      signupsWeekResult,
      signupsMonthResult,
      planDistResult,
      // Neon queries
      qrTotalResult,
      qrTodayResult,
      qrWeekResult,
      qrStatusResult,
      topScannedResult,
      scansTotalResult,
      scansTodayResult,
      scansWeekResult,
      scansMonthResult,
      topCountriesResult,
      deviceResult,
    ] = await Promise.all([
      // --- Supabase ---
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('updated_at', todayStart),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabase.from('organizations').select('plan'),

      // --- Neon ---
      sql ? sql`SELECT COUNT(*) as count FROM qr_codes` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT COUNT(*) as count FROM qr_codes WHERE created_at >= ${todayStart}` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT COUNT(*) as count FROM qr_codes WHERE created_at >= ${weekStart}` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT status, COUNT(*) as count FROM qr_codes GROUP BY status` : Promise.resolve([]),
      sql ? sql`SELECT id, name, destination_url, total_scans FROM qr_codes ORDER BY total_scans DESC LIMIT 10` : Promise.resolve([]),
      sql ? sql`SELECT COUNT(*) as count FROM scan_events` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT COUNT(*) as count FROM scan_events WHERE scanned_at >= ${todayStart}` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT COUNT(*) as count FROM scan_events WHERE scanned_at >= ${weekStart}` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT COUNT(*) as count FROM scan_events WHERE scanned_at >= ${monthStart}` : Promise.resolve([{ count: 0 }]),
      sql ? sql`SELECT country_code, COUNT(*) as count FROM scan_events WHERE country_code IS NOT NULL GROUP BY country_code ORDER BY count DESC LIMIT 10` : Promise.resolve([]),
      sql ? sql`SELECT device_type, COUNT(*) as count FROM scan_events WHERE device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC` : Promise.resolve([]),
    ]);

    // Aggregate plan distribution
    const planCounts: Record<string, number> = {};
    if (planDistResult.data) {
      for (const org of planDistResult.data) {
        const plan = (org as { plan: string }).plan || 'free';
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      }
    }
    const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({ plan, count }));

    const response = {
      users: {
        total: totalUsersResult.count || 0,
        activeToday: activeUsersResult.count || 0,
        signupsToday: signupsTodayResult.count || 0,
        signupsThisWeek: signupsWeekResult.count || 0,
        signupsThisMonth: signupsMonthResult.count || 0,
        planDistribution,
      },
      qrCodes: {
        total: parseInt(String(qrTotalResult[0]?.count)) || 0,
        createdToday: parseInt(String(qrTodayResult[0]?.count)) || 0,
        createdThisWeek: parseInt(String(qrWeekResult[0]?.count)) || 0,
        statusDistribution: (qrStatusResult as Array<{ status: string; count: string }>).map(r => ({
          status: r.status,
          count: parseInt(r.count) || 0,
        })),
        topScanned: (topScannedResult as Array<{ id: string; name: string | null; destination_url: string; total_scans: number }>).map(r => ({
          id: r.id,
          name: r.name || r.destination_url,
          totalScans: r.total_scans,
        })),
      },
      scans: {
        total: parseInt(String(scansTotalResult[0]?.count)) || 0,
        today: parseInt(String(scansTodayResult[0]?.count)) || 0,
        thisWeek: parseInt(String(scansWeekResult[0]?.count)) || 0,
        thisMonth: parseInt(String(scansMonthResult[0]?.count)) || 0,
        topCountries: (topCountriesResult as Array<{ country_code: string; count: string }>).map(r => ({
          countryCode: r.country_code,
          count: parseInt(r.count) || 0,
        })),
        deviceBreakdown: (deviceResult as Array<{ device_type: string; count: string }>).map(r => ({
          deviceType: r.device_type,
          count: parseInt(r.count) || 0,
        })),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    logger.apiKeys.error('Admin stats error', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
