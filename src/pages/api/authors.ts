import type { APIRoute } from 'astro';
import { getPocketBase } from '../../lib/pocketbase';
import { getPrivateEnv } from '../../lib/env';

export const GET: APIRoute = async () => {
  try {
    const pb = getPocketBase();
    const env = getPrivateEnv();

    console.log('[Authors API] Starting request');
    console.log('[Authors API] Admin email configured:', !!env.pocketbaseAdminEmail);
    console.log('[Authors API] Admin password configured:', !!env.pocketbaseAdminPassword);

    // Authenticate as admin to read users
    if (env.pocketbaseAdminEmail && env.pocketbaseAdminPassword) {
      try {
        console.log('[Authors API] Attempting admin auth with email:', env.pocketbaseAdminEmail);
        await pb.admins.authWithPassword(
          env.pocketbaseAdminEmail,
          env.pocketbaseAdminPassword
        );
        console.log('[Authors API] Admin authentication successful');
      } catch (authError: any) {
        console.error('[Authors API] Admin authentication failed:', authError);
        console.error('[Authors API] Error details:', {
          message: authError.message,
          status: authError.status,
          data: authError.data
        });
        throw new Error(`Admin authentication failed: ${authError.message || 'Unknown error'}`);
      }
    } else {
      console.error('[Authors API] Missing credentials - Email:', !!env.pocketbaseAdminEmail, 'Password:', !!env.pocketbaseAdminPassword);
      throw new Error('Admin credentials not configured');
    }

    // Get all authors and admins
    const authors = await pb.collection('users').getFullList({
      filter: 'role="author" || role="admin"',
      sort: '-created',
    });

    console.log('[Authors API] Found authors:', authors.length);

    // Get post counts for each author
    const authorsWithCounts = await Promise.all(
      authors.map(async (author) => {
        try {
          const posts = await pb.collection('posts').getList(1, 1, {
            filter: `author="${author.id}" && status="published"`,
          });
          return {
            id: author.id,
            name: author.name,
            username: author.username,
            bio: author.bio,
            avatar: author.avatar,
            role: author.role,
            postCount: posts.totalItems,
          };
        } catch (error) {
          console.error(`Error fetching posts for author ${author.id}:`, error);
          return {
            id: author.id,
            name: author.name,
            username: author.username,
            bio: author.bio,
            avatar: author.avatar,
            role: author.role,
            postCount: 0,
          };
        }
      })
    );

    // Sort by post count
    authorsWithCounts.sort((a, b) => b.postCount - a.postCount);

    console.log('[Authors API] Returning', authorsWithCounts.length, 'authors');

    return new Response(JSON.stringify(authorsWithCounts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Authors API] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch authors',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
