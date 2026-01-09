/**
 * Admin API: Ban User
 * Bans a user account, preventing login
 */

import type { APIRoute } from 'astro';
import { getPocketBase, initPocketBase } from '../../../../../lib/pocketbase';
import { isAdmin } from '../../../../../lib/session';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, cookies, locals }) => {
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

    // Prevent self-ban
    if (user.id === userId) {
      return new Response(JSON.stringify({ error: 'Cannot ban your own account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body for ban reason
    const data = await request.json().catch(() => ({}));
    const banReason = data.reason || 'No reason provided';

    // Ban user
    const updatedUser = await pb.collection('users').update(userId, {
      isBanned: true,
      banReason,
      bannedAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User banned successfully',
        user: {
          id: updatedUser.id,
          isBanned: updatedUser.isBanned,
          banReason: updatedUser.banReason,
          bannedAt: updatedUser.bannedAt,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error banning user:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to ban user',
        message: error.message || error.data?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
