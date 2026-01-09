# Blog Post Permissions Implementation

## Overview
This document describes the complete permission system for blog posts, implementing the requirements from COPILOT_INSTRUCTIONS.md (Prompt 4.1, Item 5).

## Permission Rules

### 1. Post Creation
- **Authors** can create blog posts
- **Admins** can create blog posts
- **Regular users** cannot create posts

**Implementation:**
- API endpoint: `/api/posts` (POST) - checks `isAuthor(user)` before allowing creation
- UI: Create Post button only visible to authors/admins in dashboard

### 2. Post Editing
- **Authors** can edit their own posts only
- **Admins** can edit any post
- **Others** cannot edit posts

**Implementation Locations:**
- **Frontend Check**: `src/pages/dashboard/edit-post/[id].astro` (lines 39-41)
  ```typescript
  if (post.authorId !== user.id && !isAdmin(user)) {
    return Astro.redirect('/403');
  }
  ```

- **Backend Check**: `src/lib/posts.ts` - `updatePost()` function (line 262)
  ```typescript
  if (existingPost.authorId !== user.id && user.role !== 'admin') {
    return { success: false, error: 'Unauthorized: You can only edit your own posts' };
  }
  ```

- **API Check**: `src/pages/api/posts/[id].ts` (PUT endpoint, line 91)
  - Checks `isAuthor(user)` before processing
  - Delegates to `updatePost()` which performs granular authorization

### 3. Post Deletion
- **Authors** can delete their own posts only
- **Admins** can delete any post
- **Others** cannot delete posts

**Implementation Locations:**
- **Backend Check**: `src/lib/posts.ts` - `deletePost()` function (line 349)
  ```typescript
  if (existingPost.authorId !== user.id && user.role !== 'admin') {
    return { success: false, error: 'Unauthorized: You can only delete your own posts' };
  }
  ```

- **API Check**: `src/pages/api/posts/[id].ts` (DELETE endpoint, line 158)
  - Checks `isAuthor(user)` before processing
  - Delegates to `deletePost()` which performs granular authorization

### 4. Post Visibility by Status

#### Draft Posts
- **Visible to**: Post author and admins only
- **Not visible to**: Public users, other authors

**Implementation Locations:**
- **Individual Post Page**: `src/pages/post/[slug].astro` (lines 20-24)
  ```typescript
  const user = await getUser(Astro);
  const canViewDraft = user && (post.authorId === user.id || isAdmin(user));
  
  if (post.status !== 'published' && !canViewDraft) {
    return Astro.redirect('/404');
  }
  ```
  - Shows draft indicator banner when viewing your own draft
  - Returns 404 for unauthorized viewers

- **Dashboard Posts List**: `src/pages/dashboard/posts.astro` (lines 31-32)
  ```typescript
  const isUserAdmin = isAdmin(user);
  const postsResult = isUserAdmin 
    ? await listPosts({ page, perPage, status: statusFilter as any })
    : await getPostsByAuthor(user.id, { page, perPage, status: statusFilter as any });
  ```
  - Authors only see their own posts (all statuses)
  - Admins see all posts from all authors

#### Published Posts
- **Visible to**: Everyone (public)

**Implementation Locations:**
- **Homepage**: `src/pages/index.astro`
  ```typescript
  // Featured posts
  const featuredResult = await listPosts({ 
    page: 1, perPage: 3, 
    status: 'published',
    sort: '-publishedAt'
  });
  
  // Recent posts
  const recentResult = await listPosts({ 
    page: 1, perPage: 5, 
    status: 'published',
    sort: '-created'
  });
  ```

- **Posts Listing Page**: `src/pages/posts.astro`
  ```typescript
  const result = await listPosts({ 
    page: 1, perPage: 20, 
    status: 'published',
    sort: '-created'
  });
  ```

- **Backend Default**: `src/lib/posts.ts` - `listPosts()` function (line 435)
  ```typescript
  const { status = 'published', ... } = options;
  ```
  - Defaults to 'published' status if not specified
  - Ensures public API calls only return published posts by default

## Helper Functions

### Session Helpers (`src/lib/session.ts`)
```typescript
export function isAuthor(user: User): boolean {
  return user.role === 'author' || user.role === 'admin';
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}
```

## Security Layers

The permission system implements multiple security layers:

1. **UI Layer**: Buttons/links hidden from unauthorized users
2. **Page Layer**: Astro pages check permissions before rendering
3. **API Layer**: API endpoints verify user role before processing
4. **Business Logic Layer**: Functions like `updatePost()` and `deletePost()` perform final authorization checks

This defense-in-depth approach ensures that even if one layer is bypassed, the others provide protection.

## Status Field Values

The `status` field on posts supports:
- `'draft'` - Not visible to public, only to author/admin
- `'published'` - Visible to everyone
- `'deleted'` - Soft-deleted (excluded from listings)

## Testing the Permission System

### Test Case 1: Author Creates Post
1. Log in as author
2. Navigate to `/dashboard/create-post`
3. Create a draft post
4. Verify post appears in "My Posts" dashboard
5. Log out and try to access post URL directly → Should return 404

### Test Case 2: Author Edits Own Post
1. Log in as author
2. Edit one of your own posts
3. Save successfully
4. Try to edit another author's post → Should redirect to 403

### Test Case 3: Admin Edits Any Post
1. Log in as admin
2. Navigate to `/dashboard/posts`
3. Should see posts from all authors
4. Edit any post → Should succeed

### Test Case 4: Public Views Published Posts
1. Log out (or use incognito)
2. Visit homepage → Should see published posts only
3. Visit `/posts` → Should see published posts only
4. Try to access a draft post URL → Should return 404

### Test Case 5: Public Cannot Create/Edit
1. Log out (or use incognito)
2. Visit `/dashboard/create-post` → Should redirect to login
3. Call POST `/api/posts` → Should return 401 Unauthorized

## Validation Integration

All create/edit operations also implement comprehensive validation:
- Title: Required, max 200 characters
- Slug: Required, URL-safe format (lowercase, numbers, hyphens)
- Content: Required, max 50,000 characters
- Excerpt: Max 300 characters
- SEO Title: Max 60 characters
- SEO Description: Max 160 characters
- Featured Image: Max 5MB, image types only

See `src/lib/posts.ts` `validatePostData()` function for full validation rules.

## Summary

✅ **Authors can create/edit own posts** - Implemented via `isAuthor()` checks and `authorId` matching
✅ **Admins can create/edit any posts** - Implemented via `isAdmin()` checks
✅ **Draft posts not visible to public** - Implemented via status filtering in public pages
✅ **Published posts visible to all** - Implemented via default `status='published'` in `listPosts()`

All permission requirements from COPILOT_INSTRUCTIONS.md Prompt 4.1 are fully implemented.
