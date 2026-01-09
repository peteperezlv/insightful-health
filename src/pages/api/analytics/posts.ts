export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';

const pb = getPocketBase();

/**
 * GET /api/analytics/posts
 * Get analytics for posts (author sees own posts, admin sees all)
 */
export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // Get user from session
    const user = await getCurrentSession(cookies);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is author or admin
    if (!['author', 'admin'].includes(user.role)) {
      return new Response(JSON.stringify({ 
        error: 'Forbidden' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get query parameters
    const postId = url.searchParams.get('postId');
    const days = parseInt(url.searchParams.get('days') || '30');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Build filter
    let filter = `created >= "${startDateStr}"`;
    
    // If specific post requested
    if (postId) {
      filter += ` && postId = "${postId}"`;
    } else if (user.role === 'author') {
      // Authors only see their own posts
      const authorPosts = await pb.collection('posts').getFullList({
        filter: `authorId = "${user.id}"`
      });
      const postIdConditions = authorPosts.map((p: any) => `postId = "${p.id}"`).join(' || ');
      if (postIdConditions) {
        filter += ` && (${postIdConditions})`;
      } else {
        // Author has no posts
        return new Response(JSON.stringify({ 
          stats: [],
          total: 0
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Get analytics records
    const analytics = await pb.collection('analytics').getFullList({
      filter,
      sort: '-created'
    });

    // Aggregate by post
    const postStats: Record<string, any> = {};
    
    analytics.forEach((event: any) => {
      if (!event.postId) return;
      
      if (!postStats[event.postId]) {
        postStats[event.postId] = {
          postId: event.postId,
          views: 0,
          likes: 0,
          comments: 0,
          searches: 0,
          viewsByDay: {},
          devices: { mobile: 0, desktop: 0 },
          referrers: {}
        };
      }

      const stat = postStats[event.postId];
      
      // Count events by type
      if (event.eventType === 'view') {
        stat.views++;
        
        // Count by day
        const day = event.created.split('T')[0];
        stat.viewsByDay[day] = (stat.viewsByDay[day] || 0) + 1;
        
        // Detect device type
        const userAgent = event.userAgent?.toLowerCase() || '';
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          stat.devices.mobile++;
        } else {
          stat.devices.desktop++;
        }
        
        // Track referrers
        if (event.referer) {
          const domain = new URL(event.referer).hostname;
          stat.referrers[domain] = (stat.referrers[domain] || 0) + 1;
        }
      } else if (event.eventType === 'like') {
        stat.likes++;
      } else if (event.eventType === 'comment') {
        stat.comments++;
      } else if (event.eventType === 'search') {
        stat.searches++;
      }
    });

    // Convert to array and get post details
    const stats = await Promise.all(
      Object.values(postStats).map(async (stat: any) => {
        try {
          const post = await pb.collection('posts').getOne(stat.postId, {
            fields: 'id,title,slug,viewCount,likeCount,commentCount,created,publishedAt'
          });
          return {
            ...stat,
            postTitle: post.title,
            postSlug: post.slug,
            publishedAt: post.publishedAt
          };
        } catch (e) {
          return stat;
        }
      })
    );

    // Sort by views
    stats.sort((a, b) => b.views - a.views);

    return new Response(JSON.stringify({ 
      stats,
      total: stats.length,
      days
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch analytics',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
