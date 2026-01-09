/**
 * Comments API Endpoint
 * Handles creating and listing comments with rate limiting and moderation
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';
import { checkRateLimit, getClientIdentifier } from '../../../lib/ratelimit';
import { z } from 'astro/zod';

const CreateCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(5000),
  parentCommentId: z.string().optional(),
  authorName: z.string().optional(),
  authorEmail: z.string().email().optional(),
});

// Rate limit: 5 comments per day per user/IP
const COMMENT_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getCurrentSession(cookies);
    const ipAddress = getClientIdentifier(request);
    
    // Rate limiting by user ID or IP
    const rateLimitKey = user ? `comment-user-${user.id}` : `comment-ip-${ipAddress}`;
    const rateLimit = checkRateLimit(rateLimitKey, COMMENT_RATE_LIMIT);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      return new Response(
        JSON.stringify({ 
          error: 'Comment rate limit reached',
          message: 'You have reached your daily comment limit (5 comments per day)',
          resetTime: resetDate.toISOString(),
          remaining: 0,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validation = CreateCommentSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment data', details: validation.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { postId, content, parentCommentId, authorName, authorEmail } = validation.data;
    const pb = getPocketBase();

    // Verify the post exists
    try {
      await pb.collection('posts').getOne(postId);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify parent comment exists if provided
    if (parentCommentId) {
      try {
        await pb.collection('comments').getOne(parentCommentId);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Parent comment not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create the comment with pending status (requires moderation)
    const commentData: any = {
      postId,
      content: content.trim(),
      parentCommentId: parentCommentId || '',
      status: 'pending', // All new comments require moderation
      ipAddress: ipAddress,
      userAgent: request.headers.get('user-agent') || '',
      isEdited: false,
    };

    // If user is authenticated, use their info
    if (user) {
      commentData.authorId = user.id;
      commentData.authorName = user.fullName || user.username || user.email;
      commentData.authorEmail = user.email;
    } else {
      // Anonymous comment - require name and email
      if (!authorName || !authorEmail) {
        return new Response(
          JSON.stringify({ error: 'Name and email are required for anonymous comments' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      commentData.authorName = authorName;
      commentData.authorEmail = authorEmail;
    }

    const comment = await pb.collection('comments').create(commentData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        comment,
        message: 'Comment submitted successfully. It will appear after moderation.',
        remaining: rateLimit.remaining - 1,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Create comment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const postId = url.searchParams.get('postId');
    
    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'postId parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pb = getPocketBase();
    
    // Get approved comments for the post
    const comments = await pb.collection('comments').getFullList({
      filter: `postId = "${postId}" && status = "approved"`,
      sort: '-created',
    });

    return new Response(
      JSON.stringify({ success: true, comments }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('List comments error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch comments' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
