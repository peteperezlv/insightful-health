/**
 * Get Current User API Endpoint
 * Returns current authenticated user info
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { getCurrentSession } from '../../../lib/session';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const user = await getCurrentSession(cookies);
    
    if (!user) {
      return new Response(
        JSON.stringify({ user: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return safe user data (don't expose sensitive fields)
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    };

    return new Response(
      JSON.stringify({ user: safeUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Get current user error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get user info' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
