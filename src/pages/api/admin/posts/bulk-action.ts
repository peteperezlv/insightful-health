/**
 * Admin API: Bulk Post Actions
 * Handles bulk operations on posts with audit logging
 */

import type { APIRoute } from 'astro';

// pp 1/9/2026 cleaned up relative paths
import { getPocketBase } from '../../../../lib/pocketbase';
import { logAdminAction } from '../../../../lib/auditLog';

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;

  // Check admin permission
  if (!user || (user.role !== 'admin' && user.role !== 'author')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { action, postIds } = body;

    if (!action || !postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pb = getPocketBase();
    const results: any[] = [];
    const errors: any[] = [];

    for (const postId of postIds) {
      try {
        // Check if user owns the post (if not admin)
        if (user.role !== 'admin') {
          const post = await pb.collection('posts').getOne(postId);
          if (post.authorId !== user.id) {
            errors.push({ id: postId, error: 'Not authorized' });
            continue;
          }
        }

        switch (action) {
          case 'publish':
            await pb.collection('posts').update(postId, {
              status: 'published',
              publishedAt: new Date().toISOString(),
            });
            await logAdminAction(
              user.id,
              'publish',
              'post',
              postId,
              { status: 'published' },
              { bulkAction: true },
              request
            );
            results.push({ id: postId, success: true });
            break;

          case 'unpublish':
            await pb.collection('posts').update(postId, { status: 'draft' });
            await logAdminAction(
              user.id,
              'unpublish',
              'post',
              postId,
              { status: 'draft' },
              { bulkAction: true },
              request
            );
            results.push({ id: postId, success: true });
            break;

          case 'feature':
            await pb.collection('posts').update(postId, { featured: true });
            await logAdminAction(
              user.id,
              'feature',
              'post',
              postId,
              { featured: true },
              { bulkAction: true },
              request
            );
            results.push({ id: postId, success: true });
            break;

          case 'unfeature':
            await pb.collection('posts').update(postId, { featured: false });
            await logAdminAction(
              user.id,
              'unfeature',
              'post',
              postId,
              { featured: false },
              { bulkAction: true },
              request
            );
            results.push({ id: postId, success: true });
            break;

          case 'delete':
            await pb.collection('posts').update(postId, {
              status: 'deleted',
              deletedAt: new Date().toISOString(),
              deletedBy: user.id,
            });
            await logAdminAction(
              user.id,
              'delete',
              'post',
              postId,
              { status: 'deleted' },
              { bulkAction: true },
              request
            );
            results.push({ id: postId, success: true });
            break;

          case 'export':
            const postData = await pb.collection('posts').getOne(postId, {
              expand: 'authorId,categoryId',
            });
            results.push({ id: postId, success: true, data: postData });
            break;

          default:
            errors.push({ id: postId, error: 'Unknown action' });
        }
      } catch (error: any) {
        console.error(`Failed to process post ${postId}:`, error);
        errors.push({ id: postId, error: error.message });
      }
    }

    // Log bulk action
    await logAdminAction(
      user.id,
      'bulk_update',
      'post',
      'multiple',
      { action, count: postIds.length },
      { results: results.length, errors: errors.length },
      request
    );

    // If action is export, return CSV data
    if (action === 'export') {
      const csvData = results
        .map((r) => {
          const p = r.data;
          return `"${p.id}","${p.title}","${p.slug}","${p.status}","${p.authorId}","${p.created}"`;
        })
        .join('\n');

      const csv = `ID,Title,Slug,Status,Author,Created\n${csvData}`;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="posts-export.csv"',
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
