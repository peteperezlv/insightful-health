/**
 * Admin API: Get All Users
 * Returns list of all users with filtering support
 */

import type { APIRoute } from 'astro';
import { getPocketBase, initPocketBase } from '../../../../lib/pocketbase';
import { isAdmin } from '../../../../lib/session';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, locals }) => {
  try {
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

    // Verify admin is authenticated
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch all users directly via HTTP to bypass PocketBase SDK's emailVisibility filtering
    // The SDK automatically hides email when emailVisibility is false, even for admins
    // Using direct fetch ensures we get all fields including email
    const pbUrl = import.meta.env.POCKETBASE_URL || 'http://localhost:8090';
    const response = await fetch(`${pbUrl}/api/collections/users/records?perPage=500&sort=-created`, {
      headers: {
        'Authorization': pb.authStore.token,
      },
    });

    if (!response.ok) {
      throw new Error(`PocketBase API error: ${response.statusText}`);
    }

    const data = await response.json();
    const users = data.items || [];

    console.log(`[Admin API] Loaded ${users.length} users from PocketBase via direct fetch`);
    users.forEach((user: any, index: number) => {
      console.log(`[Admin API] User ${index}: ${user.username} - email: ${user.email ? user.email : 'MISSING'} - emailVisibility: ${user.emailVisibility}`);
    });

    // Get post counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user: any) => {
        try {
          const posts = await pb.collection('posts').getList(1, 1, {
            filter: `authorId = "${user.id}"`,
          });
          
          return {
            id: user.id,
            email: user.email, // Now comes from direct API call, bypassing emailVisibility
            username: user.username,
            fullName: user.fullName || user.name,
            bio: user.bio,
            role: user.role,
            isBanned: user.isBanned || false,
            banReason: user.banReason,
            bannedAt: user.bannedAt,
            created: user.created,
            updated: user.updated,
            lastLoginAt: user.lastLoginAt,
            emailVerified: user.verified || user.emailVerified,
            postCount: posts.totalItems || 0,
            profileImageUrl: user.avatar ? pb.files.getUrl(user, user.avatar) : null,
          };
        } catch (error) {
          console.error(`Error fetching posts for user ${user.id}:`, error);
          return {
            id: user.id,
            email: user.email, // Now comes from direct API call, bypassing emailVisibility
            username: user.username,
            fullName: user.fullName || user.name,
            bio: user.bio,
            role: user.role,
            isBanned: user.isBanned || false,
            banReason: user.banReason,
            bannedAt: user.bannedAt,
            created: user.created,
            updated: user.updated,
            lastLoginAt: user.lastLoginAt,
            emailVerified: user.verified || user.emailVerified,
            postCount: 0,
            profileImageUrl: user.avatar ? pb.files.getUrl(user, user.avatar) : null,
          };
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        users: usersWithCounts,
        total: usersWithCounts.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch users',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
