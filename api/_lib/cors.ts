// Centralized CORS configuration
import type { VercelResponse } from '@vercel/node';

/**
 * Allowed origins for CORS.
 * In production, restrict to the app's domain(s).
 * When VITE_BASE_DOMAIN is set, both the root domain and app subdomain are allowed.
 * Falls back to '*' only when APP_URL is not set (local dev).
 */
function getAllowedOrigin(requestOrigin?: string): string {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    // Development fallback
    return '*';
  }

  // Build list of allowed origins
  const allowedOrigins: string[] = [];

  try {
    const url = new URL(appUrl);
    allowedOrigins.push(url.origin);

    // Derive app subdomain origin from APP_URL hostname
    // e.g. APP_URL=https://qrius.app → also allow https://app.qrius.app
    const appSubdomainOrigin = `${url.protocol}//app.${url.hostname}`;
    allowedOrigins.push(appSubdomainOrigin);
  } catch {
    return '*';
  }

  // Echo back the request origin if it's in our allow list
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Default to the primary configured origin
  return allowedOrigins[0];
}

/**
 * Set CORS headers on the response.
 * Uses APP_URL in production, '*' in development.
 */
export function setCorsHeaders(
  res: VercelResponse,
  methods: string,
  requestOrigin?: string,
  additionalHeaders?: string
): void {
  const origin = getAllowedOrigin(requestOrigin);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader(
    'Access-Control-Allow-Headers',
    additionalHeaders
      ? `Content-Type, Authorization, ${additionalHeaders}`
      : 'Content-Type, Authorization'
  );

  if (origin !== '*') {
    res.setHeader('Vary', 'Origin');
  }
}
