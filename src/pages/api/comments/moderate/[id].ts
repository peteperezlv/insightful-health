/**
 * Comment Moderation API Endpoint
 * Handles admin actions: approve, reject, mark as spam
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../../lib/pocketbase';
import { getCurrentSession } from '../../../../lib/session';
import { z } from 'astro/zod';

const ModerateCommentSchema = z.object({
  action: z.enum(['approve', 'reject', 'spam']),
  rejectionReason: z.string().optional(),
});

export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const user = await getCurrentSession(cookies);
    
    // Only admins can moderate
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
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
    const validation = ModerateCommentSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid moderation data', details: validation.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { action, rejectionReason } = validation.data;
    const pb = getPocketBase();
    
    // Get the comment
    const comment = await pb.collection('comments').getOne(commentId);
    const oldStatus = comment.status;

    // Update comment based on action
    const updateData: any = {};

    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.approvedBy = user.id;
        updateData.approvedAt = new Date().toISOString();
        break;
      
      case 'reject':
        updateData.status = 'rejected';
        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
        break;
      
      case 'spam':
        updateData.status = 'spam';
        break;
    }

    const updatedComment = await pb.collection('comments').update(commentId, updateData);

    // Update post comment count if status changed
    if (oldStatus !== 'approved' && action === 'approve') {
      // Increment count
      const post = await pb.collection('posts').getOne(comment.postId);
      await pb.collection('posts').update(comment.postId, {
        commentCount: (post.commentCount || 0) + 1,
      });
    } else if (oldStatus === 'approved' && action !== 'approve') {
      // Decrement count
      const post = await pb.collection('posts').getOne(comment.postId);
      await pb.collection('posts').update(comment.postId, {
        commentCount: Math.max(0, (post.commentCount || 0) - 1),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        comment: updatedComment,
        message: `Comment ${action}d successfully`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Moderate comment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to moderate comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
