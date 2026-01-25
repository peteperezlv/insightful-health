/**
 * POST /api/posts - Create a new post
 * GET /api/posts - List posts
 */

import type { APIRoute } from 'astro';

export const prerender = false;

import { createPost, listPosts, type CreatePostData } from '../../../lib/posts';
import { getCurrentSession, isAuthor } from '../../../lib/session';
import { verifyCSRFToken } from '../../../lib/csrf';

/**
 * GET /api/posts - List posts
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');
    const status = url.searchParams.get('status') as 'draft' | 'published' | 'deleted' | 'all' || 'published';
    const authorId = url.searchParams.get('authorId') || undefined;
    const categoryId = url.searchParams.get('categoryId') || undefined;
    const sort = url.searchParams.get('sort') || '-created';
    const search = url.searchParams.get('search') || undefined;

    const result = await listPosts({
      page,
      perPage,
      status,
      authorId,
      categoryId,
      sort,
      search,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        posts: result.posts,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        page,
        perPage,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('List posts error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list posts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/posts - Create a new post
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('POST /api/posts - Request received');

    // CSRF protection
    if (!verifyCSRFToken(request, cookies)) {
      console.error('POST /api/posts - CSRF token verification failed');
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('POST /api/posts - CSRF token verified');

    // Get current user
    const user = await getCurrentSession(cookies);

    if (!user) {
      console.error('POST /api/posts - No user session found');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('POST /api/posts - User authenticated:', user.email, 'Role:', user.role);

    // Check if user has author role
    if (!isAuthor(user)) {
      console.error('POST /api/posts - User is not an author:', user.role);
      return new Response(
        JSON.stringify({ error: 'You do not have permission to create posts' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('POST /api/posts - User is authorized to create posts');

    // Parse request body
    const data: CreatePostData = await request.json();
    console.log('POST /api/posts - Request data received:', {
      title: data.title,
      slug: data.slug,
      status: data.status,
      hasContent: !!data.content,
      contentLength: data.content?.length,
    });

    // Create the post
    const result = await createPost(data, user);

    if (!result.success) {
      console.error('POST /api/posts - Create post failed:', result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('POST /api/posts - Post created successfully:', result.post?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post created successfully',
        post: result.post,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('POST /api/posts - Unexpected error:', error);
    console.error('POST /api/posts - Error details:', {
      message: error?.message,
      status: error?.status,
      data: error?.data,
      stack: error?.stack,
    });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create post',
        details: error?.message || 'Unknown error',
        debugInfo: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
