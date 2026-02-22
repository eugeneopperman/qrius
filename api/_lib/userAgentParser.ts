// Lightweight user-agent parser — regex-based, no external deps
// Used at query time in analytics endpoint to extract browser/OS from stored UA strings

interface ParsedUA {
  browser: string;
  os: string;
}

export function parseUserAgent(ua: string | null): ParsedUA {
  if (!ua) return { browser: 'Unknown', os: 'Unknown' };

  return {
    browser: parseBrowser(ua),
    os: parseOS(ua),
  };
}

function parseBrowser(ua: string): string {
  // Order matters — check more specific patterns first

  // Edge (Chromium-based) — must check before Chrome
  if (/Edg(?:e|A|iOS)?\/(\d+)/i.test(ua)) return 'Edge';

  // Samsung Internet — must check before Chrome
  if (/SamsungBrowser\/(\d+)/i.test(ua)) return 'Samsung Internet';

  // Opera / OPR — must check before Chrome
  if (/OPR\/(\d+)/i.test(ua) || /Opera\/(\d+)/i.test(ua)) return 'Opera';

  // Firefox
  if (/Firefox\/(\d+)/i.test(ua)) return 'Firefox';

  // Chrome — check after Edge/Samsung/Opera which include "Chrome" in UA
  if (/Chrome\/(\d+)/i.test(ua)) return 'Chrome';

  // Safari — check after Chrome which includes "Safari" in UA
  if (/Safari\/(\d+)/i.test(ua) && /Version\/(\d+)/i.test(ua)) return 'Safari';

  // IE
  if (/MSIE|Trident/i.test(ua)) return 'Internet Explorer';

  return 'Other';
}

function parseOS(ua: string): string {
  // iOS — check before macOS since both contain "Mac"
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';

  // Android
  if (/Android/i.test(ua)) return 'Android';

  // Windows
  if (/Windows NT/i.test(ua)) return 'Windows';

  // macOS
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';

  // Linux (check after Android since Android UA contains "Linux")
  if (/Linux/i.test(ua)) return 'Linux';

  // Chrome OS
  if (/CrOS/i.test(ua)) return 'Chrome OS';

  return 'Other';
}
