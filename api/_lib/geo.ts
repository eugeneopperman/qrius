// IP geolocation helpers for scan tracking
// Uses Vercel's built-in geo headers for edge function geolocation

/**
 * Extract geolocation data from Vercel edge headers
 * @param headers Request headers
 * @returns Geo data extracted from headers
 */
export function getGeoFromHeaders(headers: Headers) {
  return {
    country: headers.get('x-vercel-ip-country') || undefined,
    city: headers.get('x-vercel-ip-city') || undefined,
    region: headers.get('x-vercel-ip-country-region') || undefined,
    latitude: headers.get('x-vercel-ip-latitude') || undefined,
    longitude: headers.get('x-vercel-ip-longitude') || undefined,
  };
}

/**
 * Parse User-Agent to determine device type
 * @param userAgent The User-Agent string
 * @returns Device type: 'mobile', 'tablet', or 'desktop'
 */
export function getDeviceType(userAgent: string | null): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // Check for tablets first (they often contain 'mobile' too)
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }

  // Check for mobile devices
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Hash an IP address for privacy-preserving storage
 * Uses SHA-256 with a salt from environment
 * @param ip The IP address to hash
 * @returns Hashed IP string
 */
export async function hashIP(ip: string | null): Promise<string | null> {
  if (!ip) return null;

  const salt = process.env.IP_SALT || 'default-salt';
  const data = new TextEncoder().encode(`${salt}:${ip}`);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Get client IP from request headers
 * Handles various proxy headers
 * @param headers Request headers
 * @returns Client IP address or null
 */
export function getClientIP(headers: Headers): string | null {
  // Vercel's forwarded IP
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  // Fallback to real IP header
  return headers.get('x-real-ip');
}
