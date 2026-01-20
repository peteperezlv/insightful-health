/**
 * Create Category API Endpoint
 * POST /api/admin/categories
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../../lib/pocketbase';
import { isAdmin } from '../../../../lib/session';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
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

    // Check if slug already exists
    try {
      const existing = await pb.collection('categories').getFirstListItem(`slug="${slug}"`);
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

    // Create category
    const category = await pb.collection('categories').create({
      name,
      slug,
      description: description || '',
    });

    return new Response(JSON.stringify({ 
      success: true, 
      category 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Create category error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to create category' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
