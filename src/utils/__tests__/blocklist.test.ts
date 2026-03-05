import { describe, it, expect } from 'vitest';

// Since blocklist.ts is in api/_lib (server-side), we replicate the core logic for unit testing
// This tests the same algorithm used in api/_lib/blocklist.ts

const BLOCKED_DOMAINS = new Set([
  'malware-site.com', 'phishing-example.com', 'evil-site.net',
  'fakepaypal.com', 'loginmicrosoft.com', 'appleid-verify.com',
  'paypa1.com', 'amaz0n-security.com',
]);

const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq',
  '.buzz', '.xyz', '.top', '.work', '.click',
  '.loan', '.racing', '.download', '.win',
]);

const PHISHING_PATTERNS = [
  /paypal.*(?:login|verify|secure)/i,
  /(?:apple|icloud).*(?:id|verify|lock)/i,
  /(?:microsoft|office365).*(?:login|auth|verify)/i,
  /(?:bank|banking).*(?:secure|login|verify)/i,
  /(?:crypto|bitcoin|btc|eth).*(?:double|free|give)/i,
];

function getParentDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

function checkUrlBlocklist(url: string) {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { blocked: false, flagged: false, reason: null, domain: '' };
  }

  const parentDomain = getParentDomain(hostname);

  if (BLOCKED_DOMAINS.has(hostname) || BLOCKED_DOMAINS.has(parentDomain)) {
    return { blocked: true, flagged: false, reason: 'Known malicious domain', domain: hostname };
  }

  for (const tld of SUSPICIOUS_TLDS) {
    if (hostname.endsWith(tld)) {
      return { blocked: false, flagged: true, reason: `Suspicious TLD: ${tld}`, domain: hostname };
    }
  }

  for (const pattern of PHISHING_PATTERNS) {
    if (pattern.test(hostname)) {
      return { blocked: false, flagged: true, reason: 'Phishing keyword pattern detected', domain: hostname };
    }
  }

  return { blocked: false, flagged: false, reason: null, domain: hostname };
}

describe('checkUrlBlocklist', () => {
  describe('blocked domains', () => {
    it('blocks known malicious domains', () => {
      const result = checkUrlBlocklist('https://malware-site.com/page');
      expect(result.blocked).toBe(true);
      expect(result.domain).toBe('malware-site.com');
    });

    it('blocks subdomains of blocked domains', () => {
      const result = checkUrlBlocklist('https://sub.fakepaypal.com/login');
      expect(result.blocked).toBe(true);
      expect(result.domain).toBe('sub.fakepaypal.com');
    });

    it('blocks paypa1.com (typosquatting)', () => {
      const result = checkUrlBlocklist('https://paypa1.com');
      expect(result.blocked).toBe(true);
    });
  });

  describe('flagged URLs (suspicious)', () => {
    it('flags .tk TLD', () => {
      const result = checkUrlBlocklist('https://free-stuff.tk/offer');
      expect(result.blocked).toBe(false);
      expect(result.flagged).toBe(true);
      expect(result.reason).toContain('.tk');
    });

    it('flags .xyz TLD', () => {
      const result = checkUrlBlocklist('https://suspicious.xyz');
      expect(result.flagged).toBe(true);
    });

    it('flags phishing keyword patterns', () => {
      const result = checkUrlBlocklist('https://paypal-login-verify.com');
      expect(result.flagged).toBe(true);
      expect(result.reason).toContain('Phishing keyword');
    });

    it('flags banking phishing patterns', () => {
      const result = checkUrlBlocklist('https://banking-secure-login.org');
      expect(result.flagged).toBe(true);
    });

    it('flags crypto scam patterns', () => {
      const result = checkUrlBlocklist('https://bitcoin-free-giveaway.com');
      expect(result.flagged).toBe(true);
    });
  });

  describe('clean URLs', () => {
    it('allows legitimate URLs', () => {
      const result = checkUrlBlocklist('https://google.com');
      expect(result.blocked).toBe(false);
      expect(result.flagged).toBe(false);
    });

    it('allows example.com', () => {
      const result = checkUrlBlocklist('https://example.com/path?query=1');
      expect(result.blocked).toBe(false);
      expect(result.flagged).toBe(false);
    });

    it('allows github.com', () => {
      const result = checkUrlBlocklist('https://github.com/user/repo');
      expect(result.blocked).toBe(false);
      expect(result.flagged).toBe(false);
    });

    it('handles invalid URLs gracefully', () => {
      const result = checkUrlBlocklist('not-a-url');
      expect(result.blocked).toBe(false);
      expect(result.flagged).toBe(false);
    });
  });

  describe('parent domain extraction', () => {
    it('extracts parent from subdomain', () => {
      expect(getParentDomain('sub.evil.com')).toBe('evil.com');
    });

    it('returns domain as-is for 2-part domains', () => {
      expect(getParentDomain('evil.com')).toBe('evil.com');
    });

    it('handles deeply nested subdomains', () => {
      expect(getParentDomain('a.b.c.evil.com')).toBe('evil.com');
    });
  });
});
