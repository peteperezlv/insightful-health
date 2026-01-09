/**
 * POST /api/auth/logout
 * Logout current user
 * Supports both JSON API calls and form submissions
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { logoutUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    // For form submissions, we don't require CSRF token
    // The form is protected by same-site cookies
    const contentType = request.headers.get('content-type') || '';
    const isFormSubmission = contentType.includes('application/x-www-form-urlencoded') || 
                             contentType.includes('multipart/form-data');

    // Logout user
    logoutUser(cookies);

    // For form submissions, redirect to login page
    if (isFormSubmission) {
      return redirect('/auth/login?message=You have been logged out');
    }

    // For API calls, return JSON
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logout successful',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // For form submissions, redirect with error
    const contentType = request.headers.get('content-type') || '';
    const isFormSubmission = contentType.includes('application/x-www-form-urlencoded') || 
                             contentType.includes('multipart/form-data');
    
    if (isFormSubmission) {
      return redirect('/auth/login?error=Logout failed');
    }

    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
