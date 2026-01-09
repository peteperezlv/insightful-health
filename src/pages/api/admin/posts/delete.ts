/**
 * API Endpoint: Delete Post
 * Soft delete a post (set status to 'deleted')
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

    const { postId } = await request.json();

    if (!postId) {
      return new Response(JSON.stringify({ message: 'Post ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pb = getPocketBase();

    // Soft delete post
    await pb.collection('posts').update(postId, {
      status: 'deleted',
      deletedAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to delete post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
