// Edge function for fast QR code redirects
// GET /r/:shortCode -> 302 redirect to destination URL

import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';
import { getGeoFromHeaders, getDeviceType, hashIP, getClientIP } from '../_lib/geo.js';
import { logger } from '../_lib/logger.js';

/** Only allow http: and https: redirect targets to prevent open redirect attacks */
function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Configure as Edge function for faster response
export const config = {
  runtime: 'edge',
};

interface CachedRedirect {
  destinationUrl: string;
  qrCodeId: string;
  organizationId: string | null;
}

export default async function handler(req: Request): Promise<Response> {
  const start = Date.now();
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const shortCode = pathParts[pathParts.length - 1];

  if (!shortCode) {
    logger.redirect.warn('Missing short code in path', { path: url.pathname });
    return new Response('Not Found', { status: 404 });
  }

  // Initialize clients
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!connectionString) {
    logger.redirect.error('Database not configured');
    return new Response('Database not configured', { status: 500 });
  }

  const sql = neon(connectionString);
  const kv = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

  try {
    let redirectData: CachedRedirect | null = null;
    let cacheHit = false;

    // Try KV cache first (fast path)
    if (kv) {
      try {
        redirectData = await kv.get<CachedRedirect>(`redirect:${shortCode}`);
        if (redirectData) cacheHit = true;
      } catch (error) {
        logger.kv.warn('Cache read error', { shortCode, error: String(error) });
      }
    }

    // Cache miss - query database
    if (!redirectData) {
      const result = await sql`
        SELECT id, destination_url, is_active, organization_id
        FROM qr_codes
        WHERE short_code = ${shortCode}
      `;

      if (result.length === 0) {
        logger.redirect.warn('QR code not found', { shortCode });
        return new Response('QR code not found', { status: 404 });
      }

      const row = result[0];

      if (!row.is_active) {
        logger.redirect.warn('QR code inactive', { shortCode });
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QR Code Inactive</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151;text-align:center"><div><h1 style="font-size:1.5rem;margin-bottom:0.5rem">QR Code Inactive</h1><p style="color:#6b7280">This QR code has been deactivated by its owner.</p></div></body></html>',
          { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      redirectData = {
        destinationUrl: row.destination_url as string,
        qrCodeId: row.id as string,
        organizationId: (row.organization_id as string) || null,
      };

      // Cache for next time (non-blocking)
      if (kv) {
        kv.set(`redirect:${shortCode}`, redirectData, { ex: 86400 }).catch((error) => {
          logger.kv.warn('Cache write error', { shortCode, error: String(error) });
        });
      }
    }

    // Validate redirect URL protocol before redirecting
    if (!isValidRedirectUrl(redirectData.destinationUrl)) {
      logger.redirect.warn('Invalid redirect URL blocked', { shortCode, url: redirectData.destinationUrl });
      return new Response('Invalid redirect URL', { status: 400 });
    }

    // Log scan asynchronously (fire-and-forget)
    logScanEvent(sql, req, redirectData.qrCodeId, redirectData.organizationId).catch((error) => {
      logger.redirect.error('Scan event logging failed', { shortCode, error: String(error) });
    });

    logger.redirect.info('Redirect', { shortCode, cacheHit, ms: Date.now() - start });

    // Return fast redirect
    return Response.redirect(redirectData.destinationUrl, 302);
  } catch (error) {
    logger.redirect.error('Redirect error', { shortCode, error: String(error), ms: Date.now() - start });
    return new Response('Internal server error', { status: 500 });
  }
}

async function logScanEvent(
  sql: ReturnType<typeof neon>,
  req: Request,
  qrCodeId: string,
  organizationId: string | null
): Promise<void> {
  try {
    const headers = req.headers;
    const geo = getGeoFromHeaders(headers);
    const userAgent = headers.get('user-agent');
    const deviceType = getDeviceType(userAgent);
    const clientIP = getClientIP(headers);
    const ipHash = await hashIP(clientIP);

    await sql`
      INSERT INTO scan_events (qr_code_id, country_code, city, device_type, user_agent, ip_hash)
      VALUES (
        ${qrCodeId},
        ${geo.country || null},
        ${geo.city || null},
        ${deviceType},
        ${userAgent || null},
        ${ipHash}
      )
    `;

    // Increment scan count in usage_records for billing tracking
    if (organizationId) {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      await sql`
        INSERT INTO usage_records (organization_id, month, scans_count)
        VALUES (${organizationId}, ${currentMonth}, 1)
        ON CONFLICT (organization_id, month)
        DO UPDATE SET scans_count = usage_records.scans_count + 1, updated_at = NOW()
      `;
    }
  } catch (error) {
    // Log but don't fail the redirect
    logger.redirect.error('Failed to log scan event', { qrCodeId, error: String(error) });
  }
}
