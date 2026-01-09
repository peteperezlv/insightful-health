/**
 * Admin API: Get User Activity
 * Returns detailed activity information for a specific user
 */

import type { APIRoute } from 'astro';
import { getPocketBase, initPocketBase } from '../../../../../lib/pocketbase';
import { isAdmin } from '../../../../../lib/session';

export const prerender = false;

export const GET: APIRoute = async ({ params, cookies, locals }) => {
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

    // Get target user's data
    const targetUser = await pb.collection('users').getOne(userId);

    // Get user's posts
    const posts = await pb.collection('posts').getList(1, 10, {
      filter: `authorId = "${userId}"`,
      sort: '-created',
    });

    // Calculate total views
    const totalViews = posts.items.reduce((sum, post) => sum + (post.viewCount || 0), 0);

    // Get user's comments count
    let commentCount = 0;
    try {
      const comments = await pb.collection('comments').getList(1, 1, {
        filter: `authorId = "${userId}"`,
      });
      commentCount = comments.totalItems || 0;
    } catch (error) {
      console.error('Error fetching comments:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        postCount: posts.totalItems || 0,
        totalViews,
        commentCount,
        lastLoginAt: targetUser.lastLoginAt,
        posts: posts.items.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          created: post.created,
          viewCount: post.viewCount || 0,
          commentCount: post.commentCount || 0,
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching user activity:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch user activity',
        message: error.message || error.data?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
