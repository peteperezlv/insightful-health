/**
 * PocketBase Client Configuration
 * Provides PocketBase instances for the application
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

// Singleton instance for server-side operations without auth
let pb: PocketBase | null = null;

// Cache for user models by token (to avoid repeated authRefresh calls)
const userModelCache = new Map<string, { model: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create PocketBase instance (no auth)
 * Use this for public/unauthenticated operations only
 */
export function getPocketBase(): PocketBase {
  if (!pb) {
    pb = new PocketBase(POCKETBASE_URL);
    // Enable auto cancellation for duplicate requests
    pb.autoCancellation(false);
  }
  return pb;
}

/**
 * Initialize PocketBase with auth token from cookie
 * Uses cached user model when available to avoid repeated auth refreshes
 */
export function initPocketBase(authToken?: string): PocketBase {
  const instance = getPocketBase();
  
  if (authToken) {
    // Check if we have a cached user model for this token
    const cached = userModelCache.get(authToken);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      // Use cached model (still fresh)
      instance.authStore.save(authToken, cached.model);
    } else {
      // No cache or expired - save token with null model
      // The session layer will call authRefresh if needed
      instance.authStore.save(authToken, null);
    }
  }
  
  return instance;
}

/**
 * Cache user model for a token to avoid repeated refreshes
 */
export function cacheUserModel(token: string, model: any): void {
  userModelCache.set(token, {
    model,
    timestamp: Date.now()
  });
  
  // Clean up old entries (keep cache size manageable)
  if (userModelCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of userModelCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        userModelCache.delete(key);
      }
    }
  }
}

/**
 * Clear cached user model for a token
 */
export function clearCachedUserModel(token: string): void {
  userModelCache.delete(token);
}

export default getPocketBase();
