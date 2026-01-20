/**
 * Update/Delete Category API Endpoint
 * PUT /api/admin/categories/[id]
 * DELETE /api/admin/categories/[id]
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../../lib/pocketbase';
import { isAdmin } from '../../../../lib/session';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Check admin access
    const user = locals.user;
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Category ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await request.json();
    const { name, slug, description } = data;

    // Validate required fields
    if (!name || !slug) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Name and slug are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pb = getPocketBase();

    // Check if slug already exists (excluding current category)
    try {
      const existing = await pb.collection('categories').getFirstListItem(
        `slug="${slug}" && id!="${id}"`
      );
      if (existing) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'A category with this slug already exists' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      // No existing category found, continue
    }

    // Update category
    const category = await pb.collection('categories').update(id, {
      name,
      slug,
      description: description || '',
    });

    return new Response(JSON.stringify({ 
      success: true, 
      category 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Update category error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to update category' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check admin access
    const user = locals.user;
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Category ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pb = getPocketBase();

    // Check if category is being used by any posts
    try {
      const postsUsingCategory = await pb.collection('posts').getList(1, 1, {
        filter: `categoryId="${id}"`,
        fields: 'id',
      });

      if (postsUsingCategory.totalItems > 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Cannot delete category. It is being used by ${postsUsingCategory.totalItems} post(s).` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      // Continue if error checking posts
    }

    // Delete category
    await pb.collection('categories').delete(id);

    return new Response(JSON.stringify({ 
      success: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Delete category error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to delete category' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
