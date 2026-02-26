// Centralized CORS configuration
import type { VercelResponse } from '@vercel/node';

/**
 * Allowed origins for CORS.
 * In production, restrict to the app's domain.
 * Falls back to '*' only when APP_URL is not set (local dev).
 */
function getAllowedOrigin(requestOrigin?: string): string {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    // Development fallback
    return '*';
  }

  // Parse the configured app URL to get the origin
  try {
    const url = new URL(appUrl);
    const configuredOrigin = url.origin;

    // If the request origin matches, echo it back
    if (requestOrigin === configuredOrigin) {
      return configuredOrigin;
    }

    // In production, only allow the configured origin
    return configuredOrigin;
  } catch {
    return '*';
  }
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
