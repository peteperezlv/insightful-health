/**
 * POST /api/upload/image - Upload an image to PocketBase
 */

import type { APIRoute } from 'astro';
import { getCurrentSession } from '../../../lib/session';
import { verifyCSRFToken } from '../../../lib/csrf';
import { getPocketBase } from '../../../lib/pocketbase';

export const prerender = false;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // CSRF protection
    if (!verifyCSRFToken(request, cookies)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const user = await getCurrentSession(cookies);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a temporary record to store the image
    // We'll use a dedicated 'media' collection or update the posts collection
    const pb = getPocketBase();
    
    // For now, we'll create a media record to store uploaded files
    // You'll need to create a 'media' collection in PocketBase with a 'file' field
    const mediaData = new FormData();
    mediaData.append('file', file);
    mediaData.append('uploadedBy', user.id);
    mediaData.append('fileName', file.name);
    mediaData.append('fileSize', file.size.toString());
    mediaData.append('mimeType', file.type);

    const record = await pb.collection('media').create(mediaData);

    // Get the file URL
    const fileUrl = pb.files.getUrl(record, record.file);

    return new Response(
      JSON.stringify({
        success: true,
        url: fileUrl,
        recordId: record.id,
        fileName: file.name,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
