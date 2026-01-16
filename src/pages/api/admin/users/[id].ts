/**
 * Admin API: Update User
 * Allows admins to update user details, role, and status
 */

import type { APIRoute } from 'astro';
// pp 1/9/2025 cleaned up relative paths.
import { getPocketBase, initPocketBase } from '../../../../lib/pocketbase';
import { isAdmin } from '../../../../lib/session';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request, cookies, locals }) => {
  try {
    const userId = params.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user is authenticated and is admin
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAdmin(user)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get auth token from cookies
    const token = cookies.get('pb_auth')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize PocketBase with auth
    const pb = initPocketBase(token);

    // Parse request body
    const data = await request.json();

    // Validate allowed fields
    const allowedFields = ['fullName', 'username', 'email', 'bio', 'role'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Validate role if provided
    if (updateData.role && !['user', 'author', 'admin'].includes(updateData.role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update user
    const updatedUser = await pb.collection('users').update(userId, updateData);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName || updatedUser.name,
          bio: updatedUser.bio,
          role: updatedUser.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to update user',
        message: error.message || error.data?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, cookies, locals }) => {
  try {
    const userId = params.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user is authenticated and is admin
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAdmin(user)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prevent self-deletion
    if (user.id === userId) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get auth token from cookies
    const token = cookies.get('pb_auth')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize PocketBase with auth
    const pb = initPocketBase(token);

    // Delete user (PocketBase handles cascade deletion based on rules)
    await pb.collection('users').delete(userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete user',
        message: error.message || error.data?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
