/**
 * Single Comment API Endpoint
 * Handles updating and deleting individual comments
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';
import { z } from 'astro/zod';

const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  try {
    const user = await getCurrentSession(cookies);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const commentId = params.id;
    if (!commentId) {
      return new Response(
        JSON.stringify({ error: 'Comment ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validation = UpdateCommentSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment data', details: validation.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pb = getPocketBase();
    
    // Get the existing comment
    const comment = await pb.collection('comments').getOne(commentId);

    // Check if user owns the comment
    if (comment.authorId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You can only edit your own comments' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { content } = validation.data;

    // Store edit history (admin only view)
    const editHistory = comment.editHistory || [];
    editHistory.push({
      content: comment.content,
      editedAt: new Date().toISOString(),
    });

    // Update the comment
    const updatedComment = await pb.collection('comments').update(commentId, {
      content: content.trim(),
      isEdited: true,
      editedAt: new Date().toISOString(),
      editHistory: editHistory,
      status: 'pending', // Re-submit for moderation after edit
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        comment: updatedComment,
        message: 'Comment updated and re-submitted for moderation',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Update comment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const user = await getCurrentSession(cookies);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const commentId = params.id;
    if (!commentId) {
      return new Response(
        JSON.stringify({ error: 'Comment ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pb = getPocketBase();
    
    // Get the comment
    const comment = await pb.collection('comments').getOne(commentId);

    // Check if user owns the comment or is admin
    if (comment.authorId !== user.id && user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'You can only delete your own comments' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the comment
    await pb.collection('comments').delete(commentId);

    // Decrement post comment count if comment was approved
    if (comment.status === 'approved') {
      const post = await pb.collection('posts').getOne(comment.postId);
      await pb.collection('posts').update(comment.postId, {
        commentCount: Math.max(0, (post.commentCount || 0) - 1),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Comment deleted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
