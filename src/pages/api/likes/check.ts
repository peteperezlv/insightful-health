/**
 * Check Like Status API Endpoint
 * Check if current user/IP has liked a post
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';
import { getClientIdentifier } from '../../../lib/ratelimit';

export const GET: APIRoute = async ({ url, cookies, request }) => {
  try {
    const postId = url.searchParams.get('postId');

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pb = getPocketBase();
    const user = await getCurrentSession(cookies);
    const ipAddress = getClientIdentifier(request);
    const sessionId = cookies.get('pb_session')?.value || `anon_${Date.now()}`;

    // Check if already liked
    let like;
    if (user) {
      like = await pb.collection('likes').getFirstListItem(
        `postId = "${postId}" && userId = "${user.id}"`,
        { requestKey: null }
      ).catch(() => null);
    } else {
      like = await pb.collection('likes').getFirstListItem(
        `postId = "${postId}" && ipAddress = "${ipAddress}"`,
        { requestKey: null }
      ).catch(() => null);
    }

    return new Response(
      JSON.stringify({ 
        isLiked: !!like,
        likeId: like?.id || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Check like error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to check like status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
