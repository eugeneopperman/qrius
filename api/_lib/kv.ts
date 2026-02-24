// KV cache wrapper for Upstash Redis
// Used for caching redirect destinations for fast lookups

import { Redis } from '@upstash/redis';
import { logger } from './logger.js';

// Create Redis client from environment variables
// In Vercel, these will be available when you add an Upstash Redis integration
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const kv = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Cache keys
const REDIRECT_PREFIX = 'redirect:';
const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

export interface CachedRedirect {
  destinationUrl: string;
  qrCodeId: string;
  organizationId: string | null;
}

/**
 * Get cached redirect destination
 * @param shortCode The short code to look up
 * @returns The cached redirect data or null if not found
 */
export async function getCachedRedirect(shortCode: string): Promise<CachedRedirect | null> {
  if (!kv) return null;

  try {
    const cached = await kv.get<CachedRedirect>(`${REDIRECT_PREFIX}${shortCode}`);
    return cached;
  } catch (error) {
    logger.kv.warn('KV get error', { shortCode, error: String(error) });
    return null;
  }
}

/**
 * Set cached redirect destination
 * @param shortCode The short code
 * @param data The redirect data to cache
 */
export async function setCachedRedirect(shortCode: string, data: CachedRedirect): Promise<void> {
  if (!kv) return;

  try {
    await kv.set(`${REDIRECT_PREFIX}${shortCode}`, data, { ex: CACHE_TTL });
  } catch (error) {
    logger.kv.warn('KV set error', { shortCode, error: String(error) });
    // Don't throw - caching is optional
  }
}

/**
 * Invalidate cached redirect
 * @param shortCode The short code to invalidate
 */
export async function invalidateCachedRedirect(shortCode: string): Promise<void> {
  if (!kv) return;

  try {
    await kv.del(`${REDIRECT_PREFIX}${shortCode}`);
  } catch (error) {
    logger.kv.warn('KV del error', { shortCode, error: String(error) });
  }
}

// Domain mapping cache (custom domain → organization)
const DOMAIN_PREFIX = 'domain:';
const DOMAIN_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export interface CachedDomainMapping {
  organizationId: string;
}

/**
 * Get cached domain→org mapping
 */
export async function getCachedDomainMapping(domain: string): Promise<CachedDomainMapping | null> {
  if (!kv) return null;

  try {
    return await kv.get<CachedDomainMapping>(`${DOMAIN_PREFIX}${domain}`);
  } catch (error) {
    logger.kv.warn('Domain mapping get error', { domain, error: String(error) });
    return null;
  }
}

/**
 * Set cached domain→org mapping
 */
export async function setCachedDomainMapping(domain: string, data: CachedDomainMapping): Promise<void> {
  if (!kv) return;

  try {
    await kv.set(`${DOMAIN_PREFIX}${domain}`, data, { ex: DOMAIN_CACHE_TTL });
  } catch (error) {
    logger.kv.warn('Domain mapping set error', { domain, error: String(error) });
  }
}

/**
 * Invalidate cached domain→org mapping
 */
export async function invalidateCachedDomainMapping(domain: string): Promise<void> {
  if (!kv) return;

  try {
    await kv.del(`${DOMAIN_PREFIX}${domain}`);
  } catch (error) {
    logger.kv.warn('Domain mapping del error', { domain, error: String(error) });
  }
}
