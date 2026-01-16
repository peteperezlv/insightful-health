/**
 * Authentication Utilities
 * Handles user authentication, session management, and validation
 */

import type { AstroCookies } from 'astro';
import { getPocketBase } from './pocketbase';
import type PocketBase from 'pocketbase';

export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role?: string;
  verified: boolean;
  avatar?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

const AUTH_COOKIE_NAME = 'pb_auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  passwordConfirm: string,
  username?: string
): Promise<AuthResult> {
  try {
    const pb = getPocketBase();
    
    // Generate username from email if not provided
    // Remove special characters and ensure it's valid (alphanumeric + underscore only)
    const generatedUsername = username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    
    // Ensure username meets minimum length requirement (3 characters)
    const finalUsername = generatedUsername.length >= 3 ? generatedUsername : `user_${generatedUsername}`;
    
    const userData = {
      email,
      password,
      passwordConfirm,
      username: finalUsername,
    };
    
    console.log('Creating user with data:', { email, username: finalUsername });
    
    // Create user account
    const user = await pb.collection('users').create(userData);

    // Send verification email (optional - comment out if email not configured)
    try {
      await pb.collection('users').requestVerification(email);
    } catch (verifyError) {
      // Email verification may fail if SMTP not configured
      console.log('Email verification not sent (SMTP may not be configured)');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        verified: user.verified,
      },
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Full error details:', {
      status: error?.status,
      response: error?.response,
      data: error?.response?.data,
      url: error?.url,
    });
    return {
      success: false,
      error: formatPocketBaseError(error),
    };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const pb = getPocketBase();
    
    // Authenticate user
    const authData = await pb.collection('users').authWithPassword(email, password);

    return {
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        username: authData.record.username,
        fullName: authData.record.fullName,
        role: authData.record.role,
        verified: authData.record.verified,
      },
      token: pb.authStore.token,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: formatPocketBaseError(error),
    };
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const pb = getPocketBase();
    await pb.collection('users').requestPasswordReset(email);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      error: formatPocketBaseError(error),
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  password: string,
  passwordConfirm: string
): Promise<AuthResult> {
  try {
    const pb = getPocketBase();
    await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: formatPocketBaseError(error),
    };
  }
}

/**
 * Get current user from auth token
 */
export async function getCurrentUser(cookies: AstroCookies): Promise<User | null> {
  try {
    const token = cookies.get(AUTH_COOKIE_NAME)?.value;
    
    if (!token) {
      return null;
    }

    const pb = getPocketBase();
    pb.authStore.save(token);

    // Refresh auth if needed
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
      
      const record = pb.authStore.model;
      if (record) {
        return {
          id: record.id,
          email: record.email,
          username: record.username,
          fullName: record.fullName,
          role: record.role,
          verified: record.verified,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Set auth cookie
 */
export function setAuthCookie(
  cookies: AstroCookies,
  token: string,
  rememberMe: boolean = false
): void {
  const maxAge = rememberMe ? REMEMBER_ME_MAX_AGE : COOKIE_MAX_AGE;
  
  cookies.set(AUTH_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    maxAge,
  });
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(cookies: AstroCookies): void {
  cookies.delete(AUTH_COOKIE_NAME, {
    path: '/',
  });
}

/**
 * Logout user
 */
export function logoutUser(cookies: AstroCookies): void {
  const pb = getPocketBase();
  pb.authStore.clear();
  clearAuthCookie(cookies);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format PocketBase error messages
 */
function formatPocketBaseError(error: any): string {
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Handle validation errors
    if (data.data) {
      const firstError = Object.values(data.data)[0];
      if (firstError && typeof firstError === 'object' && 'message' in firstError) {
        return (firstError as any).message;
      }
    }
    
    // Handle general error message
    if (data.message) {
      return data.message;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
