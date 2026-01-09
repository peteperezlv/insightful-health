/**
 * API Endpoint: Feature/Unfeature Post
 * Toggle featured status of a post
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

    const { postId, featured } = await request.json();

    if (!postId) {
      return new Response(JSON.stringify({ message: 'Post ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pb = getPocketBase();

    // Update post
    await pb.collection('posts').update(postId, {
      isFeatured: featured,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: featured ? 'Post featured successfully' : 'Post unfeatured successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error updating post featured status:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to update post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
