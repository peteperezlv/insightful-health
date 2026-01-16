/**
 * CSRF Protection Utility
 * Prevents Cross-Site Request Forgery attacks
 */

import type { AstroCookies } from 'astro';
import { randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token in cookie
 */
export function setCSRFToken(cookies: AstroCookies): string {
  const token = generateCSRFToken();
  
  cookies.set(CSRF_COOKIE_NAME, token, {
    path: '/',
    httpOnly: false, // Needs to be accessible to JavaScript
    secure: import.meta.env.PROD, 
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Get CSRF token from cookie
 */
export function getCSRFToken(cookies: AstroCookies): string | undefined {
  return cookies.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(request: Request, cookies: AstroCookies): boolean {
  const cookieToken = getCSRFToken(cookies);
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(cookieToken, headerToken);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware to ensure CSRF token exists
 */
export function ensureCSRFToken(cookies: AstroCookies): string {
  let token = getCSRFToken(cookies);
  
  if (!token) {
    token = setCSRFToken(cookies);
  }

  return token;
}
