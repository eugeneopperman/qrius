import { describe, it, expect } from 'vitest';

// Mirror the API validation logic for testing
// (actual implementation is in api/_lib/validate.ts)
const DOMAIN_REGEX = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
const IP_REGEX = /^\d{1,3}(\.\d{1,3}){3}$/;
const RESERVED_DOMAINS = ['localhost', 'example.com', 'example.org', 'example.net'];

function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  const normalized = domain.toLowerCase().trim();
  if (normalized.length === 0 || normalized.length > 253) return false;
  if (normalized.includes('://') || normalized.includes('/')) return false;
  if (IP_REGEX.test(normalized)) return false;
  if (!DOMAIN_REGEX.test(normalized)) return false;
  if (RESERVED_DOMAINS.includes(normalized)) return false;
  if (normalized.endsWith('.vercel.app')) return false;
  return true;
}

describe('isValidDomain', () => {
  it('accepts valid domains', () => {
    expect(isValidDomain('track.acme.com')).toBe(true);
    expect(isValidDomain('qr.example.io')).toBe(true);
    expect(isValidDomain('my-brand.co')).toBe(true);
    expect(isValidDomain('subdomain.company.org')).toBe(true);
    expect(isValidDomain('deep.nested.sub.domain.com')).toBe(true);
  });

  it('rejects empty/invalid input', () => {
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('   ')).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidDomain(null)).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidDomain(undefined)).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidDomain(123)).toBe(false);
  });

  it('rejects domains with protocol', () => {
    expect(isValidDomain('https://track.acme.com')).toBe(false);
    expect(isValidDomain('http://example.com')).toBe(false);
  });

  it('rejects domains with paths', () => {
    expect(isValidDomain('track.acme.com/path')).toBe(false);
  });

  it('rejects IP addresses', () => {
    expect(isValidDomain('192.168.1.1')).toBe(false);
    expect(isValidDomain('10.0.0.1')).toBe(false);
  });

  it('rejects reserved domains', () => {
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('example.com')).toBe(false);
    expect(isValidDomain('example.org')).toBe(false);
    expect(isValidDomain('example.net')).toBe(false);
  });

  it('rejects *.vercel.app domains', () => {
    expect(isValidDomain('my-app.vercel.app')).toBe(false);
    expect(isValidDomain('design-sandbox-theta.vercel.app')).toBe(false);
  });

  it('rejects single-label domains (no dot)', () => {
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('mydomain')).toBe(false);
  });

  it('handles case insensitivity', () => {
    expect(isValidDomain('Track.ACME.Com')).toBe(true);
    expect(isValidDomain('EXAMPLE.COM')).toBe(false); // reserved
  });

  it('rejects domains exceeding 253 chars', () => {
    // Build a valid long domain with labels under 63 chars
    const longDomain = 'a'.repeat(50) + '.' + 'b'.repeat(50) + '.' + 'c'.repeat(50) + '.' + 'd'.repeat(50) + '.com'; // 207 chars
    expect(isValidDomain(longDomain)).toBe(true);

    // Build one exceeding 253 chars
    const tooLong = 'a'.repeat(60) + '.' + 'b'.repeat(60) + '.' + 'c'.repeat(60) + '.' + 'd'.repeat(60) + '.' + 'e'.repeat(10) + '.com'; // 258 chars
    expect(isValidDomain(tooLong)).toBe(false);
  });
});
