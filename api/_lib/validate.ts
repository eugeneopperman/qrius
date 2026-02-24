// Input validation utilities for API routes
// Lightweight runtime validation at system boundaries

/**
 * Check that a URL uses http: or https: protocol only.
 * Prevents open redirect / SSRF via javascript:, data:, etc.
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check that a string is a valid UUID v4 format.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Validate a string field: non-empty, within max length.
 * Returns the trimmed value or null if invalid.
 */
export function validateString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

/**
 * Validate an optional string field: if present, must be within max length.
 * Returns trimmed value, undefined if absent, or null if invalid.
 */
export function validateOptionalString(
  value: unknown,
  maxLength: number
): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return null;
  return trimmed;
}

/**
 * Validate a positive integer within a range.
 */
export function validatePositiveInt(
  value: unknown,
  max: number
): number | null {
  if (value === undefined || value === null) return null;
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (!Number.isInteger(num) || num < 1 || num > max) return null;
  return num;
}

/**
 * Validate a string array with max items and max item length.
 */
/**
 * Check that a string is a valid domain name.
 * Lowercase hostname, at least one dot, no protocol, not IP, not reserved.
 */
const DOMAIN_REGEX = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
const IP_REGEX = /^\d{1,3}(\.\d{1,3}){3}$/;
const RESERVED_DOMAINS = ['localhost', 'example.com', 'example.org', 'example.net'];

export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;

  const normalized = domain.toLowerCase().trim();

  // Max 253 chars per DNS spec
  if (normalized.length === 0 || normalized.length > 253) return false;

  // Must not contain protocol
  if (normalized.includes('://') || normalized.includes('/')) return false;

  // Must not be an IP address
  if (IP_REGEX.test(normalized)) return false;

  // Must match valid hostname pattern (at least one dot)
  if (!DOMAIN_REGEX.test(normalized)) return false;

  // Must not be a reserved domain
  if (RESERVED_DOMAINS.includes(normalized)) return false;

  // Must not be a *.vercel.app domain
  if (normalized.endsWith('.vercel.app')) return false;

  return true;
}

/**
 * Check that a string is a valid subdomain label for app subdomains.
 * Lowercase alphanumeric + hyphens only, 3-63 chars, no leading/trailing hyphens.
 */
const SUBDOMAIN_LABEL_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
const RESERVED_SUBDOMAINS = ['www', 'api', 'app', 'admin', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'ns1', 'ns2'];

export function isValidSubdomainLabel(label: string): boolean {
  if (!label || typeof label !== 'string') return false;
  const normalized = label.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 63) return false;
  if (!SUBDOMAIN_LABEL_REGEX.test(normalized)) return false;
  if (RESERVED_SUBDOMAINS.includes(normalized)) return false;
  return true;
}

export function validateStringArray(
  value: unknown,
  maxItems: number,
  maxItemLength: number
): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > maxItems) return null;
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return null;
    const trimmed = item.trim();
    if (trimmed.length === 0 || trimmed.length > maxItemLength) return null;
    result.push(trimmed);
  }
  return result;
}
