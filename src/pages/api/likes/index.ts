/**
 * Likes API Endpoint
 * Handles liking and unliking posts
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';
import { getClientIdentifier } from '../../../lib/ratelimit';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { postId } = body;

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

    // Verify post exists
    try {
      await pb.collection('posts').getOne(postId);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if already liked
    let existingLike;
    if (user) {
      // Check by user ID
      existingLike = await pb.collection('likes').getFirstListItem(
        `postId = "${postId}" && userId = "${user.id}"`,
        { requestKey: null }
      ).catch(() => null);
    } else {
      // Check by IP address for anonymous users
      existingLike = await pb.collection('likes').getFirstListItem(
        `postId = "${postId}" && ipAddress = "${ipAddress}"`,
        { requestKey: null }
      ).catch(() => null);
    }

    if (existingLike) {
      return new Response(
        JSON.stringify({ 
          error: 'You have already liked this post',
          alreadyLiked: true,
          likeId: existingLike.id,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create like
    const likeData: any = {
      postId,
      ipAddress,
      sessionId: cookies.get('pb_session')?.value || `anon_${Date.now()}`,
      userAgent: request.headers.get('user-agent') || '',
      referer: request.headers.get('referer') || '',
    };

    if (user) {
      likeData.userId = user.id;
    }

    const like = await pb.collection('likes').create(likeData);

    // Get the actual like count from the likes collection
    const likesList = await pb.collection('likes').getList(1, 1, {
      filter: `postId = "${postId}"`,
      requestKey: null,
    });
    const actualLikeCount = likesList.totalItems;

    return new Response(
      JSON.stringify({ 
        success: true, 
        like,
        likeCount: actualLikeCount,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Like error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to like post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const url = new URL(request.url);
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

    // Find the like
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

    if (!like) {
      return new Response(
        JSON.stringify({ error: 'Like not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the like
    await pb.collection('likes').delete(like.id);

    // Get the actual like count from the likes collection
    const likesList = await pb.collection('likes').getList(1, 1, {
      filter: `postId = "${postId}"`,
      requestKey: null,
    });
    const actualLikeCount = likesList.totalItems;

    return new Response(
      JSON.stringify({ 
        success: true,
        likeCount: actualLikeCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Unlike error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to unlike post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
