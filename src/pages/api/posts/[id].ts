/**
 * GET /api/posts/[id] - Get a single post
 * PUT /api/posts/[id] - Update a post
 * DELETE /api/posts/[id] - Delete a post
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { getPostById, updatePost, deletePost, type UpdatePostData } from '../../../lib/posts';
import { getCurrentSession, isAuthor } from '../../../lib/session';
import { verifyCSRFToken } from '../../../lib/csrf';

/**
 * GET /api/posts/[id] - Get a single post
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const postId = params.id;

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await getPostById(postId);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ post: result.post }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Get post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT /api/posts/[id] - Update a post
 */
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    // CSRF protection
    if (!verifyCSRFToken(request, cookies)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const postId = params.id;

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const user = await getCurrentSession(cookies);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has author role
    if (!isAuthor(user)) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to edit posts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const data = await request.json();
    const updateData: UpdatePostData = { ...data, id: postId };

    // Update the post
    const result = await updatePost(updateData, user);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post updated successfully',
        post: result.post,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Update post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/posts/[id] - Delete a post (soft delete)
 */
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    // CSRF protection
    if (!verifyCSRFToken(request, cookies)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const postId = params.id;

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const user = await getCurrentSession(cookies);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has author role
    if (!isAuthor(user)) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to delete posts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the post
    const result = await deletePost(postId, user);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post deleted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Delete post error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
