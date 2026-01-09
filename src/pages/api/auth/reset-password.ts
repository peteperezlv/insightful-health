/**
 * POST /api/auth/reset-password
 * Reset password with token
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { resetPassword, validatePassword } from '../../../lib/auth';
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

    // Rate limiting - 5 attempts per hour
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`reset-password:${clientId}`, {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many password reset attempts. Please try again in ${formatTimeRemaining(rateLimit.resetTime)}.`,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const data = await request.json();
    const { token, password, passwordConfirm } = data;

    // Validate required fields
    if (!token || !password || !passwordConfirm) {
      return new Response(
        JSON.stringify({ error: 'Token, password, and password confirmation are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.errors.join('. ') }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check passwords match
    if (password !== passwordConfirm) {
      return new Response(
        JSON.stringify({ error: 'Passwords do not match' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Reset password
    const result = await resetPassword(token, password, passwordConfirm);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Invalid or expired reset token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
