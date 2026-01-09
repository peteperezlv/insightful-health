/**
 * POST /api/auth/register
 * Register a new user account
 */

import type { APIRoute } from 'astro';

export const prerender = false;
import { registerUser, validateEmail, validatePassword, setAuthCookie } from '../../../lib/auth';
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

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`register:${clientId}`, {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many registration attempts. Please try again in ${formatTimeRemaining(rateLimit.resetTime)}.`,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const data = await request.json();
    const { email, password, passwordConfirm, username } = data;

    // Validate required fields
    if (!email || !password || !passwordConfirm) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and password confirmation are required' }),
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

    // Register user
    const result = await registerUser(email, password, passwordConfirm, username);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: result.user,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
