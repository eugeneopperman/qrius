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

// Mirror subdomain label validation logic for testing
const SUBDOMAIN_LABEL_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
const RESERVED_SUBDOMAINS = ['www', 'api', 'app', 'admin', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'ns1', 'ns2'];

function isValidSubdomainLabel(label: string): boolean {
  if (!label || typeof label !== 'string') return false;
  const normalized = label.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 63) return false;
  if (!SUBDOMAIN_LABEL_REGEX.test(normalized)) return false;
  if (RESERVED_SUBDOMAINS.includes(normalized)) return false;
  return true;
}

describe('isValidSubdomainLabel', () => {
  it('accepts valid subdomain labels', () => {
    expect(isValidSubdomainLabel('eugene')).toBe(true);
    expect(isValidSubdomainLabel('my-brand')).toBe(true);
    expect(isValidSubdomainLabel('acme123')).toBe(true);
    expect(isValidSubdomainLabel('abc')).toBe(true); // minimum 3 chars
    expect(isValidSubdomainLabel('a'.repeat(63))).toBe(true); // max 63 chars
  });

  it('rejects empty/invalid input', () => {
    expect(isValidSubdomainLabel('')).toBe(false);
    expect(isValidSubdomainLabel('  ')).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidSubdomainLabel(null)).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidSubdomainLabel(undefined)).toBe(false);
  });

  it('rejects labels shorter than 3 chars', () => {
    expect(isValidSubdomainLabel('ab')).toBe(false);
    expect(isValidSubdomainLabel('a')).toBe(false);
  });

  it('rejects labels longer than 63 chars', () => {
    expect(isValidSubdomainLabel('a'.repeat(64))).toBe(false);
  });

  it('rejects labels with leading or trailing hyphens', () => {
    expect(isValidSubdomainLabel('-abc')).toBe(false);
    expect(isValidSubdomainLabel('abc-')).toBe(false);
    expect(isValidSubdomainLabel('-abc-')).toBe(false);
  });

  it('rejects labels with invalid characters', () => {
    expect(isValidSubdomainLabel('my_brand')).toBe(false);
    expect(isValidSubdomainLabel('my.brand')).toBe(false);
    expect(isValidSubdomainLabel('my brand')).toBe(false);
    expect(isValidSubdomainLabel('my@brand')).toBe(false);
    expect(isValidSubdomainLabel('MY-BRAND')).toBe(true); // normalized to lowercase
  });

  it('rejects reserved subdomain labels', () => {
    expect(isValidSubdomainLabel('www')).toBe(false);
    expect(isValidSubdomainLabel('api')).toBe(false);
    expect(isValidSubdomainLabel('app')).toBe(false);
    expect(isValidSubdomainLabel('admin')).toBe(false);
    expect(isValidSubdomainLabel('mail')).toBe(false);
    expect(isValidSubdomainLabel('ftp')).toBe(false);
    expect(isValidSubdomainLabel('smtp')).toBe(false);
    expect(isValidSubdomainLabel('ns1')).toBe(false);
    expect(isValidSubdomainLabel('ns2')).toBe(false);
  });

  it('accepts non-reserved words that look similar', () => {
    expect(isValidSubdomainLabel('myapi')).toBe(true);
    expect(isValidSubdomainLabel('admin2')).toBe(true);
    expect(isValidSubdomainLabel('webapp')).toBe(true);
  });
});

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
