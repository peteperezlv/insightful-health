/**
 * Session Management Utilities
 * Handles user sessions, token refresh, and authentication state
 */

import type { AstroCookies } from 'astro';
import { getPocketBase, initPocketBase, cacheUserModel, clearCachedUserModel } from './pocketbase';
import type { User } from './auth';

const AUTH_COOKIE_NAME = 'pb_auth';

/**
 * Get current authenticated user from session
 */
export async function getCurrentSession(cookies: AstroCookies): Promise<User | null> {
  try {
    const token = cookies.get(AUTH_COOKIE_NAME)?.value;
    
    console.log('[Session] Checking session, cookie name:', AUTH_COOKIE_NAME);
    console.log('[Session] Token found:', !!token);
    
    if (!token) {
      console.log('[Session] No token found in cookies');
      return null;
    }

    // Initialize PocketBase with the auth token
    const pb = initPocketBase(token);

    console.log('[Session] PocketBase auth store valid:', pb.authStore.isValid);
    
    // Verify token is still valid
    if (!pb.authStore.isValid) {
      // Token expired or invalid
      console.log('[Session] Token is invalid or expired');
      clearSession(cookies);
      return null;
    }

    // Get user from auth store model
    let user = pb.authStore.model;
    
    // If model is null, we need to refresh once to populate it
    // Note: PocketBase JWTs don't include full user data, only id/collectionId/exp
    // The model will be null initially, so we refresh once to get the full user record
    if (!user || !user.id) {
      console.log('[Session] User model not populated, refreshing to get user data...');
      try {
        await pb.collection('users').authRefresh();
        user = pb.authStore.model;
        console.log('[Session] Auth refreshed, user loaded:', user?.id);
        
        // Cache the user model to avoid repeated refreshes
        if (user && token) {
          cacheUserModel(token, user);
        }
        
        // IMPORTANT: Update cookie with new token after refresh
        if (pb.authStore.token && pb.authStore.token !== token) {
          console.log('[Session] Updating cookie with new token after refresh');
          cookies.set(AUTH_COOKIE_NAME, pb.authStore.token, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });
          
          // Clear old token cache and cache with new token
          clearCachedUserModel(token);
          if (user) {
            cacheUserModel(pb.authStore.token, user);
          }
        }
      } catch (refreshError) {
        console.error('[Session] Auth refresh failed:', refreshError);
        clearSession(cookies);
        return null;
      }
    } else {
      console.log('[Session] User model already loaded from cache:', user.id);
    }
    
    if (!user || !user.id) {
      console.log('[Session] No valid user after refresh');
      clearSession(cookies);
      return null;
    }
    
    const sessionUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || user.name,
      role: user.role || 'user',
      verified: user.verified,
      avatar: user.avatar,
    };
    
    console.log('[Session] Returning user object:', sessionUser);
    
    return sessionUser;
  } catch (error) {
    console.error('[Session] Session error:', error);
    clearSession(cookies);
    return null;
  }
}

/**
 * Clear user session
 */
export function clearSession(cookies: AstroCookies): void {
  const token = cookies.get(AUTH_COOKIE_NAME)?.value;
  
  // Clear cookie
  cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
  
  // Clear cached user model
  if (token) {
    clearCachedUserModel(token);
  }
  
  // Clear PocketBase auth store
  const pb = getPocketBase();
  pb.authStore.clear();
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: string | string[]): boolean {
  if (!user) return false;
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role || 'user');
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is author or admin
 */
export function isAuthor(user: User | null): boolean {
  return hasRole(user, ['author', 'admin']);
}

/**
 * Refresh auth token if expiring soon
 * PocketBase handles this automatically, but we can force a refresh
 */
// Track last refresh time to prevent excessive refreshes
const lastRefreshTimes = new Map<string, number>();

export async function refreshTokenIfNeeded(cookies: AstroCookies): Promise<void> {
  try {
    const token = cookies.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) return;

    const pb = initPocketBase(token);

    // Check if token is expiring soon (within 1 hour, not 24 hours)
    const expiresAt = pb.authStore.token ? parseJWT(pb.authStore.token).exp : 0;
    const now = Date.now() / 1000;
    const hoursUntilExpiry = (expiresAt - now) / 3600;

    // Only refresh if expiring within 1 hour AND we haven't refreshed in the last 5 minutes
    const lastRefresh = lastRefreshTimes.get(token) || 0;
    const minutesSinceLastRefresh = (Date.now() - lastRefresh) / 1000 / 60;

    if (hoursUntilExpiry < 1 && hoursUntilExpiry > 0 && minutesSinceLastRefresh > 5) {
      // Refresh the auth token
      await pb.collection('users').authRefresh();
      
      // Update last refresh time
      lastRefreshTimes.set(token, Date.now());
      
      // Update cookie with new token
      if (pb.authStore.token) {
        cookies.set(AUTH_COOKIE_NAME, pb.authStore.token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });
      }
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    // Don't clear session on refresh error - let it expire naturally
  }
}

/**
 * Parse JWT token to get payload
 */
function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return {};
  }
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '?';
  
  if (user.fullName) {
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  }
  
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  
  return '?';
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.fullName || user.username || (user.email ? user.email.split('@')[0] : 'User');
}
