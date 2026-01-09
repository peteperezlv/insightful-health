/**
 * Admin API: Unban User
 * Unbans a user account, restoring login access
 */

import type { APIRoute } from 'astro';
import { getPocketBase, initPocketBase } from '../../../../../lib/pocketbase';
import { isAdmin } from '../../../../../lib/session';

export const prerender = false;

export const POST: APIRoute = async ({ params, cookies, locals }) => {
  try {
    const userId = params.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user is authenticated and is admin
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAdmin(user)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get auth token from cookies
    const token = cookies.get('pb_auth')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize PocketBase with auth
    const pb = initPocketBase(token);

    // Unban user
    const updatedUser = await pb.collection('users').update(userId, {
      isBanned: false,
      banReason: '',
      bannedAt: '',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User unbanned successfully',
        user: {
          id: updatedUser.id,
          isBanned: updatedUser.isBanned,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error unbanning user:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to unban user',
        message: error.message || error.data?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
