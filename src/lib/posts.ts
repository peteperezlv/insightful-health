/**
 * Post Management Utilities
 * Handles blog post CRUD operations
 */

import { getPocketBase } from './pocketbase';
import type { User } from './auth';
import DOMPurify from 'isomorphic-dompurify';
import { cache, CacheDuration, generateCacheKey } from './cache';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl?: string;
  status: 'draft' | 'published' | 'deleted';
  isFeatured: boolean;
  categoryId?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  authorId: string;
  authorName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTimeMinutes: number;
  wordCount: number;
  publishedAt?: string;
  scheduledFor?: string;
  deletedAt?: string;
  isApproved: boolean;
  created: string;
  updated: string;
}

export interface CreatePostData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  status?: 'draft' | 'published';
  isFeatured?: boolean;
  categoryId?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  scheduledFor?: string;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export interface PostListOptions {
  page?: number;
  perPage?: number;
  status?: 'draft' | 'published' | 'deleted' | 'all';
  authorId?: string;
  categoryId?: string;
  isFeatured?: boolean;
  sort?: string;
  search?: string;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = countWords(content);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Count words in content (strip HTML tags)
 */
export function countWords(content: string): number {
  // Return 0 if content is null or undefined
  if (!content) {
    return 0;
  }
  
  // Strip HTML tags
  const textContent = content.replace(/<[^>]*>/g, ' ');
  // Count words
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Sanitize HTML content to prevent XSS
 * Uses DOMPurify for robust XSS protection
 */
export function sanitizeHtml(html: string): string {
  const config = {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'mark', 'sub', 'sup', 'b', 'i',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Quotes and blocks
      'blockquote', 'pre',
      // Links
      'a',
      // Images
      'img',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Divisions
      'div', 'span',
      // Horizontal rule
      'hr',
    ],
    ALLOWED_ATTR: [
      // Common attributes
      'class', 'style',
      // Link attributes
      'href', 'target', 'rel',
      // Image attributes
      'src', 'alt', 'width', 'height',
      // Table attributes
      'colspan', 'rowspan',
      // Text alignment
      'align',
    ],
    // Explicitly forbid dangerous attributes
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'oninput'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style'],
    ALLOW_DATA_ATTR: false,
  };
  
  return DOMPurify.sanitize(html, config);
}

/**
 * Validate post data
 */
export function validatePostData(data: CreatePostData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Content validation
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  } else if (data.content.length > 50000) {
    errors.push('Content must be less than 50,000 characters');
  }

  // Excerpt validation
  if (data.excerpt && data.excerpt.length > 300) {
    errors.push('Excerpt must be less than 300 characters');
  }

  // Slug validation
  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  // SEO fields validation
  if (data.seoTitle && data.seoTitle.length > 60) {
    errors.push('SEO title must be less than 60 characters');
  }

  if (data.seoDescription && data.seoDescription.length > 160) {
    errors.push('SEO description must be less than 160 characters');
  }

  // Status validation
  if (data.status && !['draft', 'published'].includes(data.status)) {
    errors.push('Status must be either draft or published');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new post
 */
export async function createPost(
  data: CreatePostData,
  author: User
): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    const pb = getPocketBase();

    // Validate post data
    const validation = validatePostData(data);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.title);

    // Check slug uniqueness
    const existingPost = await pb.collection('posts').getList(1, 1, {
      filter: `slug = "${slug}"`,
    });

    if (existingPost.totalItems > 0) {
      return { success: false, error: 'A post with this slug already exists. Please choose a different title or slug.' };
    }

    // Sanitize content
    const sanitizedContent = sanitizeHtml(data.content);

    // Calculate word count and reading time
    const wordCount = countWords(sanitizedContent);
    const readingTimeMinutes = calculateReadingTime(sanitizedContent);

    // Prepare post data
    const postData: any = {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt?.trim() || '',
      content: sanitizedContent,
      status: data.status || 'draft',
      isFeatured: data.isFeatured || false,
      authorId: author.id,
      authorName: author.fullName || author.username || author.email || 'Unknown Author',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      wordCount,
      readingTimeMinutes,
      isApproved: author.role === 'admin', // Auto-approve for admins
    };

    // Add optional fields only if they have valid values
    if (data.featuredImageUrl && (data.featuredImageUrl.startsWith('http://') || data.featuredImageUrl.startsWith('https://'))) {
      postData.featuredImageUrl = data.featuredImageUrl;
      postData.ogImageUrl = data.featuredImageUrl;
    }

    if (data.categoryId) {
      postData.categoryId = data.categoryId;
    }

    if (data.seoTitle?.trim()) {
      postData.seoTitle = data.seoTitle.trim();
      postData.ogTitle = data.seoTitle.trim();
    } else {
      postData.ogTitle = data.title;
    }

    if (data.seoDescription?.trim()) {
      postData.seoDescription = data.seoDescription.trim();
      postData.ogDescription = data.seoDescription.trim();
    } else if (data.excerpt?.trim()) {
      postData.ogDescription = data.excerpt.trim();
    }

    if (data.seoKeywords && data.seoKeywords.length > 0) {
      postData.seoKeywords = data.seoKeywords;
    }

    if (data.canonicalUrl && (data.canonicalUrl.startsWith('http://') || data.canonicalUrl.startsWith('https://'))) {
      postData.canonicalUrl = data.canonicalUrl;
    }

    if (data.status === 'published') {
      postData.publishedAt = new Date().toISOString();
    }

    if (data.scheduledFor) {
      postData.scheduledFor = data.scheduledFor;
    }

    console.log('Creating post with data:', {
      ...postData,
      content: postData.content.substring(0, 100) + '...', // Truncate for logging
    });

    const record = await pb.collection('posts').create(postData);

    console.log('Post created successfully:', record.id);

    // Convert PocketBase record to clean Post object
    const post: Post = {
      id: record.id,
      title: record.title,
      slug: record.slug,
      excerpt: record.excerpt || '',
      content: record.content,
      featuredImageUrl: record.featuredImageUrl || undefined,
      status: record.status,
      isFeatured: record.isFeatured || false,
      categoryId: record.categoryId || undefined,
      tags: record.tags || [],
      seoTitle: record.seoTitle || undefined,
      seoDescription: record.seoDescription || undefined,
      seoKeywords: record.seoKeywords || [],
      canonicalUrl: record.canonicalUrl || undefined,
      ogImageUrl: record.ogImageUrl || undefined,
      ogTitle: record.ogTitle || undefined,
      ogDescription: record.ogDescription || undefined,
      authorId: record.authorId,
      authorName: record.authorName,
      viewCount: record.viewCount || 0,
      likeCount: record.likeCount || 0,
      commentCount: record.commentCount || 0,
      readingTimeMinutes: record.readingTimeMinutes,
      wordCount: record.wordCount,
      publishedAt: record.publishedAt || undefined,
      scheduledFor: record.scheduledFor || undefined,
      deletedAt: record.deletedAt || undefined,
      isApproved: record.isApproved || false,
      created: record.created,
      updated: record.updated,
    };

    return {
      success: true,
      post,
    };
  } catch (error: any) {
    console.error('Create post error details:', {
      message: error.message,
      status: error.status,
      data: error.data,
      isAbort: error.isAbort,
      originalError: error,
    });
    return {
      success: false,
      error: error.data?.message || error.message || 'Failed to create post',
    };
  }
}

/**
 * Update an existing post
 */
export async function updatePost(
  data: UpdatePostData,
  user: User
): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    const pb = getPocketBase();

    // Get existing post
    const existingPost = await pb.collection('posts').getOne(data.id);

    // Check authorization (author or admin)
    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return { success: false, error: 'You are not authorized to edit this post' };
    }

    // Validate post data if provided
    if (data.title || data.content) {
      const validation = validatePostData({
        title: data.title || existingPost.title,
        content: data.content || existingPost.content,
        excerpt: data.excerpt,
        slug: data.slug,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: data.status,
      });

      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingPost.slug) {
      const slugCheck = await pb.collection('posts').getList(1, 1, {
        filter: `slug = "${data.slug}" && id != "${data.id}"`,
      });

      if (slugCheck.totalItems > 0) {
        return { success: false, error: 'A post with this slug already exists' };
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt.trim();
    if (data.content !== undefined) {
      updateData.content = sanitizeHtml(data.content);
      updateData.wordCount = countWords(updateData.content);
      updateData.readingTimeMinutes = calculateReadingTime(updateData.content);
    }
    if (data.featuredImageUrl !== undefined) updateData.featuredImageUrl = data.featuredImageUrl;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set publishedAt when first publishing
      if (data.status === 'published' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle.trim();
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription.trim();
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.canonicalUrl !== undefined) updateData.canonicalUrl = data.canonicalUrl;
    if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;

    const record = await pb.collection('posts').update(data.id, updateData);

    return {
      success: true,
      post: record as unknown as Post,
    };
  } catch (error: any) {
    console.error('Update post error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update post',
    };
  }
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(
  postId: string,
  user: User
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = getPocketBase();

    // Get existing post
    const existingPost = await pb.collection('posts').getOne(postId);

    // Check authorization (author or admin)
    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return { success: false, error: 'You are not authorized to delete this post' };
    }

    // Soft delete by setting status to 'deleted'
    await pb.collection('posts').update(postId, {
      status: 'deleted',
      deletedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete post error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete post',
    };
  }
}

/**
 * Get a single post by ID
 */
export async function getPostById(
  postId: string
): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    const pb = getPocketBase();
    const record = await pb.collection('posts').getOne(postId);

    return {
      success: true,
      post: record as unknown as Post,
    };
  } catch (error: any) {
    console.error('Get post error:', error);
    return {
      success: false,
      error: error.message || 'Post not found',
    };
  }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(
  slug: string
): Promise<{ success: boolean; post?: Post; error?: string }> {
  try {
    const pb = getPocketBase();
    const records = await pb.collection('posts').getList(1, 1, {
      filter: `slug = "${slug}" && status = "published"`,
    });

    if (records.totalItems === 0) {
      return { success: false, error: 'Post not found' };
    }

    const post = records.items[0] as unknown as Post;

    // Get actual like count from the likes collection
    try {
      const likesList = await pb.collection('likes').getList(1, 1, {
        filter: `postId = "${post.id}"`,
        requestKey: null,
      });
      post.likeCount = likesList.totalItems;
    } catch (error) {
      console.error('Error fetching like count:', error);
      // Keep existing likeCount if fetch fails
    }

    return {
      success: true,
      post,
    };
  } catch (error: any) {
    console.error('Get post by slug error:', error);
    return {
      success: false,
      error: error.message || 'Post not found',
    };
  }
}

/**
 * List posts with filtering and pagination
 */
export async function listPosts(
  options: PostListOptions = {}
): Promise<{ success: boolean; posts?: Post[]; totalItems?: number; totalPages?: number; error?: string }> {
  try {
    // Generate cache key based on options
    const cacheKey = generateCacheKey('posts:list', options);
    
    // Try to get from cache
    const cached = cache.get<{ success: boolean; posts: Post[]; totalItems: number; totalPages: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const pb = getPocketBase();
    const {
      page = 1,
      perPage = 10,
      status = 'published',
      authorId,
      categoryId,
      isFeatured,
      sort = '-created',
      search,
    } = options;

    // Build filter
    const filters: string[] = [];

    if (status !== 'all') {
      filters.push(`status = "${status}"`);
    } else {
      filters.push(`status != "deleted"`);
    }

    if (authorId) {
      filters.push(`authorId = "${authorId}"`);
    }

    if (categoryId) {
      filters.push(`categoryId = "${categoryId}"`);
    }

    if (isFeatured !== undefined) {
      filters.push(`isFeatured = ${isFeatured}`);
    }

    if (search) {
      filters.push(`(title ~ "${search}" || excerpt ~ "${search}" || content ~ "${search}")`);
    }

    const filter = filters.join(' && ');

    // Fetch posts with sorting - limit to 50 per page max for performance
    const records = await pb.collection('posts').getList(page, Math.min(perPage, 50), {
      filter,
      sort: sort,
      // Don't fetch full content in list view for performance
      fields: 'id,title,slug,excerpt,featuredImageUrl,status,isFeatured,categoryId,tags,authorId,authorName,viewCount,likeCount,commentCount,readingTimeMinutes,publishedAt,created,updated',
    });

    const result = {
      success: true,
      posts: records.items as unknown as Post[],
      totalItems: records.totalItems,
      totalPages: records.totalPages,
    };

    // Cache for 5 minutes (shorter for list views that change frequently)
    cache.set(cacheKey, result, CacheDuration.FIVE_MINUTES);

    return result;
  } catch (error: any) {
    console.error('List posts error:', error);
    console.error('Error details:', {
      url: error.url,
      status: error.status,
      message: error.message,
      response: error.response,
    });
    
    // Check if it's a "collection not found" or similar error
    if (error.status === 400 || error.status === 404) {
      console.error('⚠️  CRITICAL: The "posts" collection may not exist in PocketBase!');
      console.error('   Please import the collection schema from pocketbase-collections.json');
    }
    
    return {
      success: false,
      error: error.message || 'Failed to list posts',
    };
  }
}

/**
 * Get posts by author
 */
export async function getPostsByAuthor(
  authorId: string,
  options: Omit<PostListOptions, 'authorId'> = {}
): Promise<{ success: boolean; posts?: Post[]; totalItems?: number; totalPages?: number; error?: string }> {
  return listPosts({ ...options, authorId });
}

/**
 * Increment post view count
 */
export async function incrementViewCount(postId: string): Promise<void> {
  try {
    const pb = getPocketBase();
    const post = await pb.collection('posts').getOne(postId);
    await pb.collection('posts').update(postId, {
      viewCount: (post.viewCount || 0) + 1,
    });
  } catch (error) {
    console.error('Increment view count error:', error);
  }
}

/**
 * Get categories for post form
 */
export async function getCategories(): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    const cacheKey = 'categories:all';
    
    // Try to get from cache (longer TTL for categories)
    const cached = cache.get<{ id: string; name: string; slug: string }[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const pb = getPocketBase();
    console.log('Fetching categories from PocketBase...');
    const records = await pb.collection('categories').getFullList({
      sort: 'name',
      fields: 'id,name,slug', // Only fetch needed fields
    });
    console.log('Categories fetched successfully:', records.length);
    
    const result = records.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
    }));

    // Cache for 1 hour (categories don't change often)
    cache.set(cacheKey, result, CacheDuration.ONE_HOUR);

    return result;
  } catch (error: any) {
    console.error('Get categories error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      data: error.data,
    });
    // Return empty array instead of throwing - categories are optional
    return [];
  }
}

/**
 * Get tags for post form
 */
export async function getTags(): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    const cacheKey = 'tags:all';
    
    // Try to get from cache (longer TTL for tags)
    const cached = cache.get<{ id: string; name: string; slug: string }[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const pb = getPocketBase();
    console.log('Fetching tags from PocketBase...');
    const records = await pb.collection('tags').getFullList({
      sort: 'name',
      fields: 'id,name,slug', // Only fetch needed fields
    });
    console.log('Tags fetched successfully:', records.length);
    
    const result = records.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
    }));

    // Cache for 1 hour (tags don't change often)
    cache.set(cacheKey, result, CacheDuration.ONE_HOUR);

    return result;
  } catch (error: any) {
    console.error('Get tags error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      data: error.data,
    });
    // Return empty array instead of throwing - tags are optional
    return [];
  }
}
