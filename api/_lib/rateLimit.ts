// API rate limiting middleware using Upstash Redis
// Uses sliding window counters with daily TTL

import { kv } from './kv.js';
import { logger } from './logger.js';

const RATE_LIMIT_PREFIX = 'rl:';

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

/**
 * Check and increment rate limit for an API key.
 * Uses Redis INCR with daily TTL for simple, atomic counting.
 *
 * @param keyId - The API key ID
 * @param limitPerDay - Maximum requests per day (-1 = unlimited)
 * @returns Whether the request is allowed, with usage stats
 */
export async function checkRateLimit(
  keyId: string,
  limitPerDay: number
): Promise<RateLimitResult> {
  // -1 means unlimited
  if (limitPerDay === -1) {
    return { allowed: true, current: 0, limit: -1, remaining: -1 };
  }

  // No Redis configured — allow but warn
  if (!kv) {
    logger.apiKeys.warn('Rate limiting skipped: Redis not configured', { keyId });
    return { allowed: true, current: 0, limit: limitPerDay, remaining: limitPerDay };
  }

  // Daily key: rl:<keyId>:<YYYY-MM-DD>
  const today = new Date().toISOString().split('T')[0];
  const redisKey = `${RATE_LIMIT_PREFIX}${keyId}:${today}`;

  try {
    // Atomic increment — returns the new count
    const current = await kv.incr(redisKey);

    // Set expiry on first request of the day (when count is 1)
    if (current === 1) {
      await kv.expire(redisKey, 60 * 60 * 24); // 24 hours
    }

    const allowed = current <= limitPerDay;
    const remaining = Math.max(0, limitPerDay - current);

    if (!allowed) {
      logger.apiKeys.warn('Rate limit exceeded', {
        keyId,
        current,
        limit: limitPerDay,
      });
    }

    return { allowed, current, limit: limitPerDay, remaining };
  } catch (error) {
    // Redis failure should not block requests — fail open
    logger.apiKeys.error('Rate limit check failed', {
      keyId,
      error: String(error),
    });
    return { allowed: true, current: 0, limit: limitPerDay, remaining: limitPerDay };
  }
}

/**
 * Set rate limit headers on the response.
 */
export function setRateLimitHeaders(
  res: { setHeader: (name: string, value: string) => void },
  result: RateLimitResult
) {
  if (result.limit === -1) return; // Don't set headers for unlimited
  res.setHeader('X-RateLimit-Limit', String(result.limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
}
