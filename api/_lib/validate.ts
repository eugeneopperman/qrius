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
