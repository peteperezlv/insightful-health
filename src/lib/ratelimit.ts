/**
 * Rate Limiting Utility
 * Prevents brute force attacks by limiting request frequency
 */

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // No entry or expired entry - allow request
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      attempts: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime,
    };
  }

  // Entry exists and not expired
  if (entry.attempts >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment attempts
  entry.attempts++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.attempts,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired entries from store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (when behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(resetTime: number): string {
  const now = Date.now();
  const remaining = Math.max(0, resetTime - now);
  const minutes = Math.ceil(remaining / 60000);
  
  if (minutes < 1) {
    return 'less than a minute';
  }
  
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}
