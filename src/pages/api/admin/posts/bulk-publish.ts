/**
 * API Endpoint: Bulk Publish Posts
 * Publish multiple posts at once
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

    const { postIds } = await request.json();

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return new Response(JSON.stringify({ message: 'Post IDs are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pb = getPocketBase();
    const now = new Date().toISOString();

    // Update all posts
    const updatePromises = postIds.map((postId) =>
      pb.collection('posts').update(postId, {
        status: 'published',
        publishedAt: now,
      })
    );

    await Promise.all(updatePromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${postIds.length} post(s) published successfully`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error bulk publishing posts:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to publish posts' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
