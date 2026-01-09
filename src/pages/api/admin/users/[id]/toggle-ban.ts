/**
 * Admin API: Toggle User Ban Status
 * Logs action to audit trail
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../../lib/pocketbase';
import { logAdminAction } from '../../../../lib/auditLog';

export const POST: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user;

  // Check admin permission
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = params.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const pb = getPocketBase();

    // Get current user data
    const targetUser = await pb.collection('users').getOne(userId);
    const currentBannedStatus = targetUser.banned || false;
    const newBannedStatus = !currentBannedStatus;

    // Update user
    const updated = await pb.collection('users').update(userId, {
      banned: newBannedStatus,
    });

    // Log admin action
    await logAdminAction(
      user.id,
      newBannedStatus ? 'ban' : 'unban',
      'user',
      userId,
      {
        before: { banned: currentBannedStatus },
        after: { banned: newBannedStatus },
      },
      {
        targetUsername: targetUser.username,
        targetEmail: targetUser.email,
      },
      request
    );

    return new Response(
      JSON.stringify({
        success: true,
        user: updated,
        message: newBannedStatus ? 'User banned successfully' : 'User unbanned successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Failed to toggle user ban:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to update user',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
