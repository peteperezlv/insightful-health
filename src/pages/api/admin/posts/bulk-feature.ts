/**
 * API Endpoint: Bulk Feature/Unfeature Posts
 * Feature or unfeature multiple posts at once
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../../lib/pocketbase';
import { getCurrentSession } from '../../../../lib/session';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check authentication
    const user = await getCurrentSession(cookies);
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { postIds, featured } = await request.json();

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return new Response(JSON.stringify({ message: 'Post IDs are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pb = getPocketBase();

    // Update all posts
    const updatePromises = postIds.map((postId) =>
      pb.collection('posts').update(postId, {
        isFeatured: featured,
      })
    );

    await Promise.all(updatePromises);

    const action = featured ? 'featured' : 'unfeatured';
    return new Response(
      JSON.stringify({
        success: true,
        message: `${postIds.length} post(s) ${action} successfully`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error bulk featuring posts:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to update posts' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
