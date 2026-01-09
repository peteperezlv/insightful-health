export const prerender = false;

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { getCurrentSession } from '../../../lib/session';

const pb = getPocketBase();

/**
 * GET /api/analytics/platform
 * Get platform-wide analytics (admin only)
 */
export const GET: APIRoute = async ({ cookies, url }) => {
  try {
    // Get user from session
    const user = await getCurrentSession(cookies);
    
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ 
        error: 'Forbidden - Admin only' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get query parameters
    const days = parseInt(url.searchParams.get('days') || '30');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get total counts
    const [totalUsers, totalPosts, totalComments, totalLikes] = await Promise.all([
      pb.collection('users').getList(1, 1, { fields: 'id' }),
      pb.collection('posts').getList(1, 1, { 
        filter: 'status = "published"',
        fields: 'id' 
      }),
      pb.collection('comments').getList(1, 1, { 
        filter: 'status = "approved"',
        fields: 'id' 
      }),
      pb.collection('likes').getList(1, 1, { fields: 'id' })
    ]);

    // Get new users in time period
    const newUsers = await pb.collection('users').getList(1, 1000, {
      filter: `created >= "${startDateStr}"`,
      sort: '-created'
    });

    // Get new posts in time period
    const newPosts = await pb.collection('posts').getList(1, 1000, {
      filter: `created >= "${startDateStr}" && status = "published"`,
      sort: '-created'
    });

    // Get analytics events
    const analytics = await pb.collection('analytics').getFullList({
      filter: `created >= "${startDateStr}"`,
      sort: '-created'
    });

    // Calculate active users (users with events in period)
    const activeUserIds = new Set<string>();
    const activeSessionIds = new Set<string>();
    const eventsByType: Record<string, number> = {};
    const eventsByDay: Record<string, number> = {};
    const topPosts: Record<string, { views: number, title?: string }> = {};

    analytics.forEach((event: any) => {
      // Count active users
      if (event.userId) {
        activeUserIds.add(event.userId);
      }
      activeSessionIds.add(event.sessionId);

      // Count events by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      // Count events by day
      const day = event.created.split('T')[0];
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;

      // Track post views
      if (event.eventType === 'view' && event.postId) {
        if (!topPosts[event.postId]) {
          topPosts[event.postId] = { views: 0 };
        }
        topPosts[event.postId].views++;
      }
    });

    // Get top posts details
    const topPostsArray = await Promise.all(
      Object.entries(topPosts)
        .sort(([, a], [, b]) => b.views - a.views)
        .slice(0, 10)
        .map(async ([postId, data]) => {
          try {
            const post = await pb.collection('posts').getOne(postId, {
              fields: 'id,title,slug,authorId,viewCount,likeCount,commentCount',
              expand: 'authorId'
            });
            return {
              postId,
              title: post.title,
              slug: post.slug,
              author: post.expand?.authorId?.fullName || 'Unknown',
              views: data.views,
              totalViews: post.viewCount || 0,
              likes: post.likeCount || 0,
              comments: post.commentCount || 0
            };
          } catch (e) {
            return {
              postId,
              views: data.views
            };
          }
        })
    );

    // Get trending authors
    const authorStats: Record<string, { posts: number, views: number, name?: string }> = {};
    const posts = await pb.collection('posts').getFullList({
      filter: 'status = "published"',
      expand: 'authorId'
    });

    posts.forEach((post: any) => {
      if (!authorStats[post.authorId]) {
        authorStats[post.authorId] = {
          posts: 0,
          views: 0,
          name: post.expand?.authorId?.fullName || 'Unknown'
        };
      }
      authorStats[post.authorId].posts++;
      authorStats[post.authorId].views += post.viewCount || 0;
    });

    const trendingAuthors = Object.entries(authorStats)
      .map(([authorId, data]) => ({
        authorId,
        ...data
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Get popular searches
    const searchEvents = analytics.filter((e: any) => e.eventType === 'search');
    const searchCounts: Record<string, number> = {};
    searchEvents.forEach((event: any) => {
      if (event.searchQuery) {
        searchCounts[event.searchQuery] = (searchCounts[event.searchQuery] || 0) + 1;
      }
    });

    const popularSearches = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));

    return new Response(JSON.stringify({ 
      totals: {
        users: totalUsers.totalItems,
        posts: totalPosts.totalItems,
        comments: totalComments.totalItems,
        likes: totalLikes.totalItems
      },
      period: {
        days,
        newUsers: newUsers.totalItems,
        newPosts: newPosts.totalItems,
        activeUsers: activeUserIds.size,
        activeSessions: activeSessionIds.size
      },
      events: {
        byType: eventsByType,
        byDay: eventsByDay,
        total: analytics.length
      },
      topPosts: topPostsArray,
      trendingAuthors,
      popularSearches
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Platform analytics error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch platform analytics',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
