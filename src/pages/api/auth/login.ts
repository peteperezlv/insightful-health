/**
 * POST /api/auth/login
 * Login with email and password
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { loginUser, validateEmail, setAuthCookie } from '../../../lib/auth';
import { checkRateLimit, getClientIdentifier, formatTimeRemaining } from '../../../lib/ratelimit';
import { verifyCSRFToken } from '../../../lib/csrf';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // CSRF protection
    if (!verifyCSRFToken(request, cookies)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting - 5 attempts per 15 minutes
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`login:${clientId}`);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many login attempts. Please try again in ${formatTimeRemaining(rateLimit.resetTime)}.`,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const data = await request.json();
    const { email, password, rememberMe } = data;

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Attempt login
    const result = await loginUser(email, password);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set auth cookie
    if (result.token) {
      setAuthCookie(cookies, result.token, rememberMe || false);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login successful',
        user: result.user,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
