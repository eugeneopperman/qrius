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

/**
 * Validate that original_data structure matches the QR type.
 * Returns null if valid, or an error message string if invalid.
 * Non-URL types should have a meaningful original_data object; URL type doesn't require it.
 */
export function validateOriginalData(
  qrType: string,
  originalData: unknown
): string | null {
  // original_data is optional — if not provided, skip validation
  if (originalData === undefined || originalData === null) return null;

  if (typeof originalData !== 'object' || Array.isArray(originalData)) {
    return 'original_data must be an object';
  }

  const data = originalData as Record<string, unknown>;

  switch (qrType) {
    case 'url':
      // URL type: original_data is optional, no strict schema
      return null;

    case 'email':
      if (!data.email || typeof data.email !== 'string') {
        return 'Email QR code requires original_data.email';
      }
      return null;

    case 'phone':
      if (!data.phone || typeof data.phone !== 'string') {
        return 'Phone QR code requires original_data.phone';
      }
      return null;

    case 'sms':
      if (!data.phone || typeof data.phone !== 'string') {
        return 'SMS QR code requires original_data.phone';
      }
      return null;

    case 'wifi':
      if (!data.ssid || typeof data.ssid !== 'string') {
        return 'WiFi QR code requires original_data.ssid';
      }
      return null;

    case 'vcard':
      if (!data.firstName && !data.lastName && !data.name) {
        return 'vCard QR code requires original_data.firstName, lastName, or name';
      }
      return null;

    case 'event':
      if (!data.title || typeof data.title !== 'string') {
        return 'Event QR code requires original_data.title';
      }
      return null;

    case 'location':
      if (data.latitude === undefined || data.longitude === undefined) {
        return 'Location QR code requires original_data.latitude and longitude';
      }
      return null;

    case 'text':
      // Text type: original_data is freeform
      return null;

    default:
      return null;
  }
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
