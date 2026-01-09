/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { requestPasswordReset, validateEmail } from '../../../lib/auth';
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

    // Rate limiting - 3 attempts per hour
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`forgot-password:${clientId}`, {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many password reset requests. Please try again in ${formatTimeRemaining(rateLimit.resetTime)}.`,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const data = await request.json();
    const { email } = data;

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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

    // Request password reset
    await requestPasswordReset(email);

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    // Don't reveal if email exists
    return new Response(
      JSON.stringify({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
