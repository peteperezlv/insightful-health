/**
 * Caching Utilities
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in cache with TTL (time-to-live)
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (default: 1 hour)
   */
  set<T>(key: string, value: T, ttl: number = 3600000): void {
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or undefined if expired/not found
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Get or set pattern - fetch and cache if not present
   * @param key - Cache key
   * @param fetcher - Function to fetch data if not in cache
   * @param ttl - Time to live in milliseconds
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600000
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }
}

// Global cache instance
export const cache = new Cache();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 300000); // 5 minutes
}

/**
 * Cache duration constants (in milliseconds)
 */
export const CacheDuration = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Generate cache key for database queries
 */
export function generateCacheKey(
  collection: string,
  params: Record<string, any>
): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
    .join('|');
  
  return `${collection}:${paramString}`;
}

/**
 * Decorator to cache function results
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  ttl: number = CacheDuration.ONE_HOUR
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      return cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttl
      );
    };

    return descriptor;
  };
}

/**
 * Response cache headers helper
 */
export function getCacheHeaders(maxAge: number = 3600): HeadersInit {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vary': 'Accept-Encoding',
  };
}

/**
 * No cache headers helper
 */
export function getNoCacheHeaders(): HeadersInit {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Static asset cache headers (30 days)
 */
export function getStaticAssetHeaders(): HeadersInit {
  return getCacheHeaders(2592000); // 30 days
}
