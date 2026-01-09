/**
 * Search API Endpoint
 * Handles global search across posts
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../lib/pocketbase';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  const author = url.searchParams.get('author') || '';
  const sort = url.searchParams.get('sort') || 'relevance';
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = 20;

  if (!query && !category && !author) {
    return new Response(
      JSON.stringify({
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: 1,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const pb = getPocketBase();

    // Build filter conditions
    const filters: string[] = [];

    // Only search published posts
    filters.push('status = "published"');

    // Search query across multiple fields
    if (query) {
      const searchConditions: string[] = [];
      searchConditions.push(`title ~ "${query}"`);
      searchConditions.push(`excerpt ~ "${query}"`);
      searchConditions.push(`content ~ "${query}"`);
      searchConditions.push(`tags ~ "${query}"`);
      filters.push(`(${searchConditions.join(' || ')})`);
    }

    // Filter by category
    if (category) {
      filters.push(`categoryId = "${category}"`);
    }

    // Filter by author
    if (author) {
      filters.push(`authorId = "${author}"`);
    }

    const filterString = filters.join(' && ');

    // Determine sort order
    let sortString = '-created'; // Default: newest first
    switch (sort) {
      case 'date':
        sortString = '-created';
        break;
      case 'oldest':
        sortString = 'created';
        break;
      case 'views':
        sortString = '-viewCount';
        break;
      case 'title':
        sortString = 'title';
        break;
      case 'relevance':
      default:
        // For relevance, we'll use created date as fallback
        // In a production app, you'd implement proper relevance scoring
        sortString = '-created';
        break;
    }

    // Fetch results
    const results = await pb.collection('posts').getList(page, perPage, {
      filter: filterString,
      sort: sortString,
      expand: 'authorId,categoryId',
      fields: 'id,title,slug,excerpt,authorId,categoryId,created,viewCount,likeCount,commentCount,featuredImage',
    });

    // Format results
    const formattedResults = results.items.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      author: post.expand?.authorId
        ? {
            id: post.expand.authorId.id,
            username: post.expand.authorId.username,
            fullName: post.expand.authorId.fullName,
          }
        : null,
      category: post.expand?.categoryId
        ? {
            id: post.expand.categoryId.id,
            name: post.expand.categoryId.name,
            slug: post.expand.categoryId.slug,
          }
        : null,
      created: post.created,
      viewCount: post.viewCount || 0,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      featuredImage: post.featuredImage,
      // Highlight search term in title and excerpt
      highlightedTitle: highlightSearchTerm(post.title, query),
      highlightedExcerpt: highlightSearchTerm(post.excerpt, query),
    }));

    return new Response(
      JSON.stringify({
        items: formattedResults,
        totalItems: results.totalItems,
        totalPages: results.totalPages,
        page: results.page,
        query,
        filters: {
          category,
          author,
          sort,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({
        error: 'Search failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Highlight search term in text
 */
function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
