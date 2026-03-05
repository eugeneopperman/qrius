// Static domain blocklist for content moderation
// O(1) Set lookup — <1ms overhead on QR creation

/** Domains known to be used for phishing, malware, or scams. Hard reject. */
const BLOCKED_DOMAINS = new Set([
  // Known phishing/malware domains (representative sample)
  'malware-site.com',
  'phishing-example.com',
  'evil-site.net',
  'fakepaypal.com',
  'loginmicrosoft.com',
  'appleid-verify.com',
  'secure-banklogin.com',
  'account-verify.net',
  'paypa1.com',
  'amaz0n-security.com',
  'netfliix-login.com',
  'googlé.com',
  'microsoftonline-auth.com',
  'verify-identity-now.com',
  'banking-secure-login.com',
  'free-iphone-winner.com',
  'click-here-now.xyz',
  'instant-prize-claim.com',
  'lottery-winner-2024.com',
  'crypto-doubler.com',
  'bitcoin-giveaway.net',
  'elon-musk-crypto.com',
  'get-rich-quick.xyz',
  'investment-guaranteed.com',
  'forex-millionaire.net',
  // URL shortener abuse domains
  'bit.do',
  'is.gd',
  'surl.li',
  'cutt.us',
  'lnkd.in',
]);

/** Suspicious TLDs — QR codes created but auto-flagged for review */
const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq',  // Free domains commonly abused
  '.buzz', '.xyz', '.top', '.work', '.click',
  '.loan', '.racing', '.review', '.stream',
  '.download', '.win', '.bid', '.date',
]);

/** Phishing keyword patterns in domain names */
const PHISHING_PATTERNS = [
  /paypal.*(?:login|verify|secure)/i,
  /(?:apple|icloud).*(?:id|verify|lock)/i,
  /(?:microsoft|office365).*(?:login|auth|verify)/i,
  /(?:google|gmail).*(?:login|verify|auth)/i,
  /(?:amazon|amzn).*(?:secure|verify|prime)/i,
  /(?:netflix|nflx).*(?:login|account|billing)/i,
  /(?:facebook|fb|meta).*(?:login|verify|confirm)/i,
  /(?:bank|banking).*(?:secure|login|verify)/i,
  /(?:crypto|bitcoin|btc|eth).*(?:double|free|give)/i,
  /(?:instagram|tiktok|twitter).*(?:verify|blue|badge)/i,
];

export interface BlocklistResult {
  blocked: boolean;
  flagged: boolean;
  reason: string | null;
  domain: string;
}

/**
 * Extract parent domain from a hostname.
 * e.g., "sub.evil.com" → "evil.com"
 */
function getParentDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

/**
 * Check a URL against the blocklist.
 * Returns whether the URL is blocked (hard reject), flagged (auto-flag for review), or clean.
 */
export function checkUrlBlocklist(url: string): BlocklistResult {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { blocked: false, flagged: false, reason: null, domain: '' };
  }

  const parentDomain = getParentDomain(hostname);

  // Check blocked domains (exact match on hostname or parent)
  if (BLOCKED_DOMAINS.has(hostname) || BLOCKED_DOMAINS.has(parentDomain)) {
    return { blocked: true, flagged: false, reason: 'Known malicious domain', domain: hostname };
  }

  // Check suspicious TLDs
  for (const tld of SUSPICIOUS_TLDS) {
    if (hostname.endsWith(tld)) {
      return { blocked: false, flagged: true, reason: `Suspicious TLD: ${tld}`, domain: hostname };
    }
  }

  // Check phishing keyword patterns
  for (const pattern of PHISHING_PATTERNS) {
    if (pattern.test(hostname)) {
      return { blocked: false, flagged: true, reason: 'Phishing keyword pattern detected', domain: hostname };
    }
  }

  return { blocked: false, flagged: false, reason: null, domain: hostname };
}
