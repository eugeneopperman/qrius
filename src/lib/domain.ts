/**
 * Domain detection utility for subdomain split.
 *
 * When VITE_BASE_DOMAIN is set (e.g. "qrius.app"), the app enforces:
 * - Root domain (qrius.app): public pages, auth forms
 * - App subdomain (app.qrius.app): authenticated dashboard
 *
 * When unset (local dev), everything runs on a single origin as before.
 */

const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN as string | undefined;

/** Feature is active when a real base domain is configured */
export const hasRealDomain = !!BASE_DOMAIN;

/** True when running locally without VITE_BASE_DOMAIN */
export const isLocalDev = !BASE_DOMAIN;

/** True when the current hostname is app.<baseDomain> */
export const isAppSubdomain =
  hasRealDomain && window.location.hostname === `app.${BASE_DOMAIN}`;

/** True when the current hostname is exactly <baseDomain> (not a subdomain) */
export const isRootDomain =
  hasRealDomain && window.location.hostname === BASE_DOMAIN;

/** Cookie domain for parent-scoped cookies (e.g. ".qrius.app") */
export function getCookieDomain(): string | null {
  return BASE_DOMAIN ? `.${BASE_DOMAIN}` : null;
}

/** Build an absolute URL on the root domain. In local dev, returns a same-origin path. */
export function getRootUrl(path: string): string {
  if (!BASE_DOMAIN) return path;
  const protocol = window.location.protocol;
  return `${protocol}//${BASE_DOMAIN}${path}`;
}

/** Build an absolute URL on the app subdomain. In local dev, returns a same-origin path. */
export function getAppUrl(path: string): string {
  if (!BASE_DOMAIN) return path;
  const protocol = window.location.protocol;
  return `${protocol}//app.${BASE_DOMAIN}${path}`;
}
