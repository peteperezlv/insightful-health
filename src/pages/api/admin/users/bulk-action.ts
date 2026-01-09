/**
 * Admin API: Bulk User Actions
 * Handles bulk operations with audit logging
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { logAdminAction } from '../../../lib/auditLog';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;

  // Check admin permission
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pb = getPocketBase();
    const results: any[] = [];
    const errors: any[] = [];

    for (const userId of userIds) {
      try {
        switch (action) {
          case 'ban':
            await pb.collection('users').update(userId, { banned: true });
            await logAdminAction(
              user.id,
              'ban',
              'user',
              userId,
              { banned: true },
              { bulkAction: true },
              request
            );
            results.push({ id: userId, success: true });
            break;

          case 'unban':
            await pb.collection('users').update(userId, { banned: false });
            await logAdminAction(
              user.id,
              'unban',
              'user',
              userId,
              { banned: false },
              { bulkAction: true },
              request
            );
            results.push({ id: userId, success: true });
            break;

          case 'delete':
            // Soft delete - mark as deleted
            await pb.collection('users').update(userId, { 
              deleted: true,
              deletedAt: new Date().toISOString(),
              deletedBy: user.id
            });
            await logAdminAction(
              user.id,
              'delete',
              'user',
              userId,
              { deleted: true },
              { bulkAction: true },
              request
            );
            results.push({ id: userId, success: true });
            break;

          case 'export':
            // Get user data for export
            const userData = await pb.collection('users').getOne(userId);
            results.push({ id: userId, success: true, data: userData });
            break;

          default:
            errors.push({ id: userId, error: 'Unknown action' });
        }
      } catch (error: any) {
        console.error(`Failed to process user ${userId}:`, error);
        errors.push({ id: userId, error: error.message });
      }
    }

    // Log bulk action
    await logAdminAction(
      user.id,
      'bulk_update',
      'user',
      'multiple',
      { action, count: userIds.length },
      { results: results.length, errors: errors.length },
      request
    );

    // If action is export, return CSV data
    if (action === 'export') {
      const csvData = results
        .map((r) => {
          const u = r.data;
          return `${u.id},${u.username},${u.email},${u.role || 'user'},${u.created}`;
        })
        .join('\n');

      const csv = `ID,Username,Email,Role,Created\n${csvData}`;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users-export.csv"',
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        errors,
        message: `Bulk ${action} completed. ${results.length} succeeded, ${errors.length} failed.`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Failed to perform bulk action:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to perform bulk action',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
