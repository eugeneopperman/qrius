// Edge function for fast QR code redirects
// GET /r/:shortCode -> 302 redirect to destination URL

import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';
import { getGeoFromHeaders, getDeviceType, hashIP, getClientIP } from '../_lib/geo.js';

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
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const shortCode = pathParts[pathParts.length - 1];

  if (!shortCode) {
    return new Response('Not Found', { status: 404 });
  }

  // Initialize clients
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!connectionString) {
    return new Response('Database not configured', { status: 500 });
  }

  const sql = neon(connectionString);
  const kv = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

  try {
    let redirectData: CachedRedirect | null = null;

    // Try KV cache first (fast path)
    if (kv) {
      try {
        redirectData = await kv.get<CachedRedirect>(`redirect:${shortCode}`);
      } catch (error) {
        console.error('KV cache error:', error);
      }
    }

    // Cache miss - query database
    if (!redirectData) {
      const result = await sql`
        SELECT id, destination_url, is_active
        FROM qr_codes
        WHERE short_code = ${shortCode}
      `;

      if (result.length === 0) {
        return new Response('QR code not found', { status: 404 });
      }

      const row = result[0];

      if (!row.is_active) {
        return new Response('QR code is inactive', { status: 410 });
      }

      redirectData = {
        destinationUrl: row.destination_url as string,
        qrCodeId: row.id as string,
      };

      // Cache for next time (non-blocking)
      if (kv) {
        kv.set(`redirect:${shortCode}`, redirectData, { ex: 86400 }).catch(console.error);
      }
    }

    // Validate redirect URL protocol before redirecting
    if (!isValidRedirectUrl(redirectData.destinationUrl)) {
      return new Response('Invalid redirect URL', { status: 400 });
    }

    // Log scan asynchronously (fire-and-forget)
    logScanEvent(sql, req, redirectData.qrCodeId).catch(console.error);

    // Return fast redirect
    return Response.redirect(redirectData.destinationUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function logScanEvent(
  sql: ReturnType<typeof neon>,
  req: Request,
  qrCodeId: string
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
  } catch (error) {
    // Log but don't fail the redirect
    console.error('Failed to log scan event:', error);
  }
}
