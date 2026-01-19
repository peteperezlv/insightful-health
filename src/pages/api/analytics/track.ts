export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';

const pb = getPocketBase();

/**
 * POST /api/analytics/track
 * Track an analytics event
 */
export const POST: APIRoute = async ({ request, clientAddress, cookies }) => {
  try {
    const body = await request.json();
    const { eventType, postId, categoryId, tagId, searchQuery, searchResultCount, metadata, pageUrl } = body;
    
    console.log('[Analytics Track] Received body:', JSON.stringify(body, null, 2));
    console.log('[Analytics Track] postId from body:', postId);

    // Validate event type
    const validEventTypes = ['view', 'like', 'comment', 'search', 'login', 'signup'];
    if (!eventType || !validEventTypes.includes(eventType)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid event type' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Get session ID from cookies (using cookie header string)
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionIdMatch = cookieHeader.match(/session_id=([^;]+)/);
    const sessionId = sessionIdMatch ? sessionIdMatch[1] : `session_${Date.now()}_${Math.random()}`;

    // Get IP address
    const ipAddress = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';

    // Get userId from session (if authenticated)
    let userId: string | null = null;
    try {
      const user = await getCurrentSession(cookies);
      if (user?.id) {
        userId = user.id;
        console.log('[Analytics Track] Setting userId to:', userId);
      }
    } catch (e) {
      // Not authenticated or session error - that's ok for analytics
      console.log('[Analytics Track] No authenticated user (this is normal for anonymous visitors)');
    }

    // Create analytics record
    const analyticsData: any = {
      eventType,
      pageUrl: pageUrl || referer || 'unknown',
      ipAddress,
      sessionId,
      userAgent,
      referer,
    };

    // Add optional fields (only add if they have truthy values to avoid empty strings)
    if (userId) {
      analyticsData.userId = userId;
      console.log('[Analytics Track] Added userId to data:', userId);
    }
    if (postId) {
      analyticsData.postId = postId;
      console.log('[Analytics Track] Added postId to data:', postId);
    }
    if (categoryId) analyticsData.categoryId = categoryId;
    if (tagId) analyticsData.tagId = tagId;
    if (searchQuery) analyticsData.searchQuery = searchQuery;
    if (searchResultCount !== undefined) analyticsData.searchResultCount = searchResultCount;
    if (metadata) analyticsData.metadata = metadata;

    console.log('[Analytics Track] Creating record with data:', JSON.stringify(analyticsData, null, 2));

    const record = await pb.collection('analytics').create(analyticsData);

    // If this is a view event, increment the post view count
    if (eventType === 'view' && postId) {
      try {
        const post = await pb.collection('posts').getOne(postId);
        await pb.collection('posts').update(postId, {
          viewCount: (post.viewCount || 0) + 1
        });
      } catch (e) {
        console.error('Error updating view count:', e);
        // Don't fail the request if view count update fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      id: record.id 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[Analytics Track] ERROR:', error);
    console.error('[Analytics Track] Error message:', error?.message);
    console.error('[Analytics Track] Error stack:', error?.stack);
    return new Response(JSON.stringify({ 
      error: 'Failed to track event',
      message: error?.message || 'Unknown error',
      details: error?.data || error?.response?.data || null
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
