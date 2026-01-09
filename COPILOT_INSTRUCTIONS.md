# AI Copilot Implementation Instructions

## Prompt-Optimized Guide for Cursor, GitHub Copilot, and Claude

**Document Version:** 1.0  
**Target Audience:** AI Copilots (Cursor, GitHub Copilot, Claude)  
**Last Updated:** December 25, 2025

---

## 📖 How to Use This Document

This document contains **production-ready prompts** designed to be given directly to AI code assistants. Each prompt includes:

1. **Context:** What's being built
2. **Requirements:** Specific acceptance criteria
3. **Example:** Template/reference code
4. **Testing:** How to verify completion

### Best Practices

- Copy the exact prompt text
- Provide all context files (PRD.md, DATABASE.md)
- Review generated code before merging
- Test thoroughly on local environment
- Ask follow-up questions for clarification

---

## 🚀 1. Project Setup & Configuration

### Prompt 1.1: Initial Astro + Tailwind Setup

```
You are helping build "Insightful Health," a modern blogging platform for public health insights.

Create an Astro project with:
- Tailwind CSS for styling
- Healthcare-themed color palette (emerald green #10b981 primary)
- Responsive design (mobile-first)
- WCAG 2.1 AA accessibility
- Clean, minimal design system

Tasks:
1. Verify Astro project is initialized
2. Tailwind CSS is properly configured
3. Global CSS includes healthcare color palette and typography scale
4. Layout component has semantic HTML structure
5. All pages are responsive (test at 320px, 768px, 1280px)

Deliverables:
- astro.config.mjs with Tailwind integration
- tailwind.config.mjs with healthcare color palette
- src/layouts/Layout.astro with global nav/footer
- src/styles/global.css with base styles
- At least 3 example pages showing responsive design

Success Criteria:
- npm run build succeeds without errors
- Pages display correctly on mobile (320px) and desktop (1280px)
- All text has minimum 4.5:1 color contrast
- No horizontal scroll on any viewport
```

### Prompt 1.2: Environment Setup & Variables

```
Set up environment variables for Insightful Health development:

Create .env.example and .env.local files with:
- PUBLIC_SITE_URL
- PUBLIC_POCKETBASE_URL
- PUBLIC_GA_ID
- PRIVATE_POCKETBASE_ADMIN_EMAIL
- PRIVATE_POCKETBASE_ADMIN_PASSWORD
- PRIVATE_MAILERLITE_API_KEY
- OAuth credentials (GitHub, Google, Facebook)

Requirements:
1. Create .env.example file with dummy values (commit to repo)
2. Create .env.local file with actual dev values (add to .gitignore)
3. Update astro.config.mjs to load environment variables
4. Add validation for required env vars on startup
5. Document each env var in README.md

Success Criteria:
- Environment variables load without errors
- Missing required vars show helpful error messages
- Public vars accessible in client code
- Private vars never exposed to client
```

---

## 📝 2. Database & Backend Setup

### Prompt 2.1: PocketBase Collections

```
Create PocketBase collections for Insightful Health blog platform.

Reference: DATABASE.md for complete schema

Collections to create:
1. users - User accounts and profiles
2. posts - Blog articles
3. comments - Post comments with moderation
4. likes - Post likes/votes
5. categories - Post categories
6. tags - Post tags
7. post_versions - Admin-only edit history
8. analytics - Event tracking

For each collection:
1. Create all fields with correct types
2. Set up indexes for performance
3. Configure validation rules
4. Set access rules (public read, auth write)
5. Add example records

Specific requirements:
- Users: bcrypt password hashing enabled
- Posts: slug auto-generated from title, sanitize HTML content
- Comments: status workflow (pending → approved/rejected/spam)
- Likes: prevent duplicates (unique constraint)
- Analytics: auto-archive records >6 months old
- All collections: timestamps (created, updated)

Success Criteria:
- All 8 collections created in PocketBase
- Validation rules prevent invalid data
- API endpoints respond correctly
- Example queries return expected results
- Backups working properly
```

### Prompt 2.2: Database Relationships & Rules

```
Configure database relationships and validation rules in PocketBase.

Tasks:
1. Set up foreign key relationships:
   - posts.authorId → users.id
   - comments.postId → posts.id
   - comments.parentCommentId → comments.id
   - posts.categoryId → categories.id

2. Configure collection rules (PocketBase Rules Engine):
   - users: Publicly readable, self-managed
   - posts: Publicly readable, author/admin writable
   - comments: Author can delete own, admin manages all
   - likes: Publicly readable, tracked anonymously

3. Set up automatic fields:
   - Auto-increment comment count on posts
   - Auto-increment view count on posts
   - Auto-generate slugs from post titles
   - HTML sanitization on comments/posts

4. Add validation:
   - Email uniqueness
   - Username format (3-30 chars, alphanumeric)
   - Post slug uniqueness
   - Comment status enum

Success Criteria:
- Relationships enforced at database level
- Validation prevents invalid data entry
- Rules allow proper access patterns
- All automatic fields working
```

---

## 🔐 3. Authentication

### Prompt 3.1: OAuth Integration (GitHub, Google, Facebook)

```
Implement OAuth authentication for Insightful Health.

Providers: GitHub, Google, Facebook

Requirements:
1. Create auth pages:
   - src/pages/auth/login.astro - Login page with OAuth buttons
   - src/pages/auth/signup.astro - Signup page
   - src/pages/auth/callback.astro - OAuth callback handler

2. Create auth utilities:
   - src/lib/auth.ts - Authentication logic
   - src/lib/oauth.ts - OAuth provider configuration
   - Add login/logout functions
   - Add session management (JWT)

3. OAuth Flow:
   - User clicks "Login with GitHub/Google/Facebook"
   - Redirects to provider
   - Provider redirects back to /auth/callback
   - Create/update user in PocketBase
   - Generate JWT token
   - Set httpOnly cookie
   - Redirect to dashboard

4. Security:
   - httpOnly cookies (not accessible via JS)
   - CSRF token validation
   - 7-day token expiration
   - Refresh token rotation

5. Features:
   - Show loading state during OAuth redirect
   - Handle errors gracefully
   - Link OAuth accounts to existing users
   - Display logged-in user in navbar

Success Criteria:
- OAuth login works for all 3 providers
- User created/updated correctly in database
- JWT token issued and stored securely
- User stays logged in across sessions
- Logout clears session properly
- Error messages are helpful and user-friendly
```

### Prompt 3.2: Email/Password Authentication

```
Implement email/password authentication for Insightful Health.

Requirements:
1. Create authentication pages:
   - src/pages/auth/login.astro - Email + password login
   - src/pages/auth/signup.astro - Registration form
   - src/pages/auth/forgot-password.astro - Password reset request
   - src/pages/auth/reset-password.astro - Password reset form

2. Create authentication endpoints:
   - POST /api/auth/register - User registration
   - POST /api/auth/login - Email/password login
   - POST /api/auth/forgot-password - Reset email request
   - POST /api/auth/reset-password - Password reset
   - POST /api/auth/logout - Session logout

3. Features:
   - Password strength validation (min 8 chars, mixed case)
   - Email verification (confirmation email sent)
   - Rate limiting (5 attempts / 15 minutes)
   - Password reset token (expires in 1 hour)
   - Remember me checkbox (30 days)

4. Security:
   - Bcrypt password hashing (PocketBase handles)
   - Input validation (server-side)
   - CSRF token protection
   - Rate limiting on login attempts
   - No plaintext passwords in logs

5. User Experience:
   - Clear validation messages
   - Loading states during auth
   - Redirect to dashboard on success
   - Helpful error messages
   - Email confirmation status displayed

Success Criteria:
- User can register with email/password
- Login works with correct credentials
- Login fails with wrong password
- Password reset email delivers within 1 minute
- Reset link expires after 1 hour
- Rate limiting prevents brute force
- All inputs validated server-side
```

### Prompt 3.3: Session Management & User Middleware

```
Implement session management and user context throughout Insightful Health.

Requirements:
1. Create session utilities:
   - src/lib/session.ts - Get current user
   - Middleware for route protection
   - User context/store for all pages

2. Add middleware:
   - Check JWT token on every request
   - Refresh token if expiring soon
   - Redirect to login if unauthorized
   - Protect admin/author routes

3. Protected routes:
   - /dashboard/* - User dashboard (auth required)
   - /admin/* - Admin panel (admin role required)
   - /create-post - Post creation (author/admin required)

4. Features:
   - Display current user in navbar
   - Show user avatar/profile
   - Logout button
   - User profile page
   - Settings page

5. Error Handling:
   - Expired token → redirect to login
   - Invalid token → clear session, redirect to login
   - Unauthorized → show 403 error
   - Server errors → show helpful error message

Success Criteria:
- Current user accessible on all pages
- Protected routes enforce auth correctly
- Token refresh works transparently
- User info persists across requests
- Logout clears session completely
- Navbar shows correct user state
```

---

## 📰 4. Blog Features

### Prompt 4.1: Blog Post CRUD Operations

```
Implement blog post creation, editing, and publishing for Insightful Health.

Requirements:
1. Create post creation flow:
   - src/pages/dashboard/create-post.astro - New post form
   - src/pages/dashboard/edit-post/[id].astro - Edit existing post
   - Rich text editor for content
   - Draft/publish workflow

2. Post fields to handle:
   - Title (required, max 200 chars)
   - Slug (auto-generated, editable, unique)
   - Excerpt (max 300 chars)
   - Content (rich HTML from editor)
   - Featured image (upload and preview)
   - Category (dropdown select)
   - Tags (multi-select)
   - Status (draft/published/deleted)
   - SEO fields (title, description, keywords, canonical)
   - Schedule publish date (optional)

3. Features:
   - Auto-save draft every 30 seconds
   - Preview mode (see how post looks)
   - Character counters for title/excerpt
   - Image upload with optimization
   - Markdown editor with preview
   - Full HTML editor option

4. Validation:
   - Title required, max 200 chars
   - Slug unique, auto-generated from title
   - Content required, max 50000 chars
   - SEO title max 60 chars
   - SEO description max 160 chars
   - Featured image max 5MB

5. Permissions:
   - Authors can create/edit own posts
   - Admins can create/edit any posts
   - Draft posts not visible to public
   - Published posts visible to all

Success Criteria:
- Post creation form works without errors
- Draft auto-saves every 30 seconds
- Post publishes and becomes visible
- Editing existing post works
- SEO fields validated
- Images upload and display correctly
- Slug auto-generated and editable
- Published/draft status works correctly
```

### Prompt 4.2: Rich Text Editor

```
Implement a rich text editor for Insightful Health blog posts.

Requirements:
1. Choose editor library: TipTap or ContentEditable
   - WYSIWYG interface
   - Toolbar with formatting options
   - Menu bar for advanced options

2. Formatting toolbar:
   - Bold, Italic, Underline, Strikethrough
   - Headings (h1-h6)
   - Lists (ordered/unordered)
   - Blockquotes
   - Code blocks with syntax highlighting
   - Links (with preview)
   - Images (upload and embed)
   - Horizontal rule

3. Advanced features:
   - Undo/redo
   - Clear formatting button
   - Full screen mode
   - Word/character count
   - Reading time estimate
   - Table insertion (optional)

4. Image handling:
   - Drag-and-drop to insert images
   - Upload to server/CDN
   - Auto-optimize (resize, compress)
   - Show preview while loading
   - Error handling if upload fails
   - Max 5MB per image

5. Content output:
   - Export as clean HTML
   - Sanitize HTML (prevent XSS)
   - Support embedded charts (iframe)
   - Support embedded media (YouTube, etc)

6. UX:
   - Toolbar sticks to top when scrolling
   - Responsive on mobile
   - Touch-friendly on tablets
   - Keyboard shortcuts
   - Show formatting in real-time

Success Criteria:
- Editor displays with full toolbar
- All formatting options work
- Images upload and display
- Content saves to database as HTML
- Exported HTML is valid and clean
- XSS protection working
- Mobile experience is good
```

### Prompt 4.3: Post SEO Optimization

````
Implement SEO optimization for Insightful Health blog posts.

Requirements:
1. SEO fields in post form:
   - SEO Title (60 chars max, preview how it appears)
   - Meta Description (160 chars max, preview)
   - Keywords (5-10 keywords, comma-separated)
   - Canonical URL (optional)
   - Open Graph Image (preview)
   - Open Graph Title
   - Open Graph Description

2. Auto-populate SEO fields:
   - SEO Title defaults to post title
   - Meta Description defaults to excerpt
   - Keywords suggested based on content
   - OG image uses featured image by default

3. Meta tags on post pages:
   - <title>{seoTitle} | Insightful Health</title>
   - <meta name="description" content="{seoDescription}">
   - <meta name="keywords" content="{keywords}">
   - <link rel="canonical" href="{canonicalUrl}">
   - <meta property="og:title" content="{ogTitle}">
   - <meta property="og:description" content="{ogDescription}">
   - <meta property="og:image" content="{ogImage}">
   - <meta property="og:url" content="{postUrl}">
   - <meta name="twitter:card" content="summary_large_image">
   - All Twitter Card tags

4. Structured data (JSON-LD):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "BlogPosting",
     "headline": "Post Title",
     "description": "Post excerpt",
     "image": "featured-image-url",
     "author": {
       "@type": "Person",
       "name": "Author Name"
     },
     "datePublished": "2025-12-25T00:00:00Z",
     "dateModified": "2025-12-25T10:00:00Z"
   }
````

5. Slug generation:

   - Auto-generate from title: "My Great Post" → "my-great-post"
   - Allow manual editing
   - Validate uniqueness
   - Lowercase, hyphenated, no special chars

6. Validation:
   - SEO title max 60 chars
   - Meta description max 160 chars
   - Keywords: 5-10 items
   - Slug: unique, no special chars

Success Criteria:

- All SEO fields editable in post form
- Meta tags render correctly in HTML
- Open Graph tags visible in link previews
- Canonical URL prevents duplicate content
- Structured data validates with schema.org
- Slug auto-generated and editable
- All SEO fields have character counters

```

---

## 💬 5. Comments & Engagement

### Prompt 5.1: Comment System with Moderation

```

Implement a comment system with admin moderation for Insightful Health.

Requirements:

1. Comment form:

   - src/components/CommentForm.astro - Comment input
   - Required fields: content (max 5000 chars)
   - Optional fields: name, email (for anonymous)
   - Auth users: auto-fill name from profile
   - Logged-in indicator

2. Comment display:

   - Show all approved comments
   - Nested/threaded replies (replies to replies)
   - Indentation showing thread structure
   - Author name, date, comment text
   - Edit/delete buttons (author only)

3. Rate limiting:

   - Max 5 comments per user per day
   - Rate limiting by user ID or IP
   - Show error if limit reached
   - Show remaining comment count

4. Moderation workflow:

   - New comments set to "pending" status
   - Admin dashboard shows pending comments
   - Admin can approve/reject/mark as spam
   - Rejection reason optional
   - Approved comments appear immediately
   - Rejected comments hidden from public

5. Comment moderation UI:

   - src/pages/admin/comments.astro - Moderation panel
   - Filter by status (pending, approved, spam)
   - Sort by date
   - Bulk actions (approve/reject multiple)
   - Quick preview of comment content
   - View in context (link to post)

6. Features:
   - Comment edit history (admin only)
   - Delete comment button (author/admin)
   - Reply to comment (threading)
   - Collapse/expand long comments
   - Load more comments with pagination

Success Criteria:

- Comment form appears on all posts
- Rate limiting enforced (5/day max)
- Comments require moderation
- Pending comments don't show to public
- Admin can approve/reject comments
- Approved comments display immediately
- Reply threading works correctly
- Comment count updates on posts

```

### Prompt 5.2: Post Likes System

```

Implement post likes for Insightful Health (anonymous + authenticated).

Requirements:

1. Like button:

   - Show like count on each post
   - Click to like/unlike
   - Update count in real-time (no page reload)
   - Visual feedback (heart icon animation)
   - Show "You liked this" for current user

2. Anonymous likes:

   - Track by session ID + IP address
   - Session lifetime: 24 hours
   - One like per session per post
   - No user account required

3. Authenticated likes:

   - Track by user ID
   - One like per user per post
   - Can unlike to remove like
   - Show who liked in post admin

4. Database:

   - Likes collection with fields:
     - postId (FK → posts)
     - userId (nullable, FK → users)
     - ipAddress
     - sessionId
     - created timestamp
   - Unique constraint: (postId, userId) or (postId, ipAddress)

5. API endpoints:

   - POST /api/likes - Like a post
   - DELETE /api/likes/{id} - Unlike a post
   - GET /api/posts/{id}/likes - Get like count

6. UI:
   - Like button on post cards and detail pages
   - Show total like count
   - Disabled state if already liked
   - Loading state during request
   - Error message if like fails

Success Criteria:

- Like button appears on all posts
- Count updates without page reload
- Anonymous users can like
- Authenticated users can like
- Like count persists after reload
- User can unlike
- No duplicate likes for same user/post

```

---

## 📊 6. Analytics & Admin Dashboard

### Prompt 6.1: Post Analytics Dashboard

```

Implement analytics dashboard for Insightful Health authors and admins.

Requirements:

1. Author Analytics Dashboard:

   - src/pages/dashboard/analytics.astro - Author stats
   - Show stats for all user's posts

2. Metrics to track:

   - Total views per post (last 7/30/90 days)
   - Total comments per post
   - Total likes per post
   - Reading time stats
   - Traffic sources (referer)
   - Device breakdown (mobile/desktop)
   - Top referring pages

3. Charts/visualizations:

   - Views over time (line chart)
   - Top posts by views (bar chart)
   - Engagement by post (table)
   - Traffic sources (pie chart)
   - Device breakdown (donut chart)

4. Admin Analytics:

   - src/pages/admin/analytics.astro - Platform stats
   - Total users, posts, comments
   - Active users (last 7/30 days)
   - New users (daily/weekly)
   - Total engagement (likes, comments)
   - Popular posts (trending)
   - Trending authors

5. Implementation:

   - Use Chart.js or ApexCharts
   - Data from analytics collection
   - Cache results for 1 hour
   - Allow export to CSV
   - Date range selector (7/30/90 days)

6. Google Analytics integration:
   - Track page views
   - Track custom events (like, comment, search)
   - Author dashboard shows GA data
   - Real-time view count

Success Criteria:

- Author sees stats for their posts
- Metrics update daily
- Charts display correctly
- Data exports to CSV
- Admin sees platform-wide stats
- Trending/popular posts show correctly

```

### Prompt 6.2: Admin Dashboard & User Management

```

Implement admin dashboard for Insightful Health.

Requirements:

1. Admin panel pages:

   - src/pages/admin/dashboard.astro - Overview
   - src/pages/admin/users.astro - User management
   - src/pages/admin/posts.astro - Post management
   - src/pages/admin/comments.astro - Comment moderation
   - src/pages/admin/analytics.astro - Platform analytics
   - src/pages/admin/settings.astro - Platform settings

2. Admin Dashboard Overview:

   - Total users count
   - Total posts count
   - Total comments pending moderation
   - Total views (last 24h)
   - Recent posts
   - Recent users
   - Recent comments awaiting moderation
   - Key metrics (trending posts, active authors)

3. User Management:

   - List all users
   - Filter by role (user, author, admin)
   - Filter by status (active, banned)
   - Edit user details
   - Change user role
   - Ban/unban users
   - Delete user account (soft delete)
   - View user's posts and activity

4. Post Management:

   - List all posts
   - Filter by status (draft, published, deleted)
   - Filter by category
   - Search by title
   - Bulk actions (publish, delete, feature)
   - Edit post
   - View post analytics
   - Feature/unfeature post

5. Features:

   - Search and filters on all pages
   - Pagination (50 items per page)
   - Sort by date, name, views, etc
   - Bulk selection (select multiple)
   - Confirmation dialogs for destructive actions
   - Audit log (track admin actions)
   - Activity feed (recent admin actions)

6. Permissions:
   - Only admin role can access /admin/\*
   - Log all admin actions
   - Show who made changes and when
   - Revert option for some actions

Success Criteria:

- Admin dashboard loads quickly
- All filters work correctly
- Bulk actions work
- User bans prevent login
- Featured posts appear on homepage
- Audit log tracks all admin actions
- Search works across collections

```

---

## 🔍 7. Search & Discovery

### Prompt 7.1: Global Search Feature

```

Implement global search for Insightful Health.

Requirements:

1. Search page:

   - src/pages/search.astro - Search results page
   - Large search input at top
   - Results show below input

2. Search functionality:

   - Search posts by:
     - Title (exact match and partial)
     - Excerpt
     - Content (full-text search if available)
     - Tags
     - Author name
   - Filter results by:
     - Category
     - Author
     - Date range (last week, month, year)
     - Sort by (relevance, date, views)

3. Search API:

   - GET /api/search?q={query}&category={id}&sort={date|relevance|views}
   - Returns paginated results (20 per page)
   - Include title, excerpt, author, date, view count
   - Highlight search term in results

4. Client-side search:

   - Debounce input (wait 300ms before search)
   - Show loading state while searching
   - Display result count
   - Show "No results" message
   - Pagination if many results

5. Features:

   - Search suggestions (popular searches, recent posts)
   - Related searches shown
   - Save search history (optional)
   - Share search results
   - Keyboard shortcut (Cmd/Ctrl + K)

6. SEO:
   - Dynamic title: "Search Results for '{query}'"
   - Meta description updated
   - Search page in sitemap

Success Criteria:

- Search returns correct posts
- Filters work correctly
- Results load in < 1 second
- Pagination works
- Search terms highlighted in results
- Mobile-friendly search UI

```

### Prompt 7.2: Archives, Categories, and Tags

```

Implement archive, category, and tag pages for Insightful Health.

Requirements:

1. Archive page:

   - src/pages/archive.astro - All posts by date
   - Posts grouped by year
   - Within each year, group by month
   - Show post title, date, link to post
   - Sort newest first

2. Category pages:

   - src/pages/category/[slug].astro - Posts by category
   - Category name and description
   - List all posts in category (paginated)
   - Show post count
   - Breadcrumb navigation

3. Tag pages:

   - src/pages/tag/[slug].astro - Posts with tag
   - Tag name
   - List all posts with tag (paginated)
   - Show post count
   - Related tags

4. Dynamic generation:

   - Use getStaticPaths() for all category/tag pages
   - Pre-generate at build time
   - Update on publish/delete

5. Features:

   - Pagination (10-20 items per page)
   - Sort options (newest, oldest, most views)
   - Filter within category/tag
   - Breadcrumb navigation
   - Meta tags for SEO

6. Navigation:
   - Link to archive from navbar
   - Link categories/tags from post detail
   - Show tag cloud on sidebar

Success Criteria:

- Archive displays posts by year/month
- Category pages show correct posts
- Tag pages show correct posts
- Pagination works correctly
- Filters work on category/tag pages
- All pages are SEO-optimized

```

---

## 🏠 8. Homepage & Featured Posts

### Prompt 8.1: Homepage with Featured Posts

```

Implement homepage for Insightful Health with featured posts.

Requirements:

1. Homepage layout (src/pages/index.astro):

   - Hero section with CTA
   - Featured posts section
   - Recent posts section
   - Newsletter signup
   - Categories/tags preview
   - Footer with links

2. Hero section:

   - Large headline: "Public Health Insights"
   - Subheading: Call-to-action
   - Search bar (link to /search)
   - "Browse Posts" button

3. Featured posts section:

   - Admin-selected featured posts
   - Show 3-4 featured posts
   - Cards with image, title, excerpt
   - "Featured" badge
   - Link to full post

4. Recent posts section:

   - Latest published posts (top 5)
   - Show post title, author, date, excerpt
   - Like/comment counts
   - Link to full post

5. Newsletter signup:

   - Prominent CTA box
   - Email input + subscribe button
   - Integration with MailerLite
   - Success/error messages

6. Categories preview:

   - Show top 6 categories
   - Category name + post count
   - Link to category page

7. SEO:
   - Dynamic meta tags
   - Structured data (Organization, BreadcrumbList)
   - Open Graph tags

Success Criteria:

- Homepage loads in < 2 seconds
- Featured posts display correctly
- Recent posts show newest first
- Newsletter form works
- All links functional
- Mobile-responsive
- SEO-optimized

```

---

## 📧 9. Newsletter Integration

### Prompt 9.1: MailerLite Integration

```

Implement MailerLite newsletter signup for Insightful Health.

Requirements:

1. MailerLite setup:

   - Create MailerLite account
   - Create "Insightful Health" list
   - Get API key
   - Store API key in environment variables

2. Newsletter form component:

   - src/components/NewsletterForm.astro
   - Email input field
   - Subscribe button
   - Loading state during submit
   - Success message
   - Error message

3. Form placement:

   - Footer of every page
   - Homepage featured section
   - Sidebar (optional)
   - Post-reading CTA (optional)

4. Features:

   - Double opt-in (email confirmation)
   - GDPR-compliant (explicit consent)
   - Unsubscribe link in emails
   - Privacy policy link
   - Error handling
   - Rate limiting (prevent spam)

5. API integration:

   - POST /api/newsletter/subscribe
   - Validate email format
   - Check not already subscribed
   - Call MailerLite API
   - Store subscription in database

6. Database:
   - Store email subscribers in users collection
   - Track subscription date
   - Track subscription status

Success Criteria:

- Form appears on all pages
- Email validation works
- Subscribers added to MailerLite
- Confirmation email sends
- Unsubscribe works
- Privacy policy linked
- No spam/duplicate signups

```

---

## ♿ 10. Accessibility & Testing


```

Audit and fix Insightful Health for WCAG 2.1 AA accessibility compliance.

Requirements:

1. Color & Contrast:

   - All text 4.5:1 contrast ratio (or 3:1 for large text)
   - No color as sole information conveyor
   - Use Axe DevTools to test

2. Keyboard Navigation:

   - All interactive elements keyboard-accessible
   - Logical tab order
   - No keyboard traps
   - Skip to main content link
   - Focus indicators visible
   - Test with Tab/Shift+Tab keys

3. Screen Reader:

   - Semantic HTML (correct heading hierarchy)
   - ARIA labels for icons
   - Form labels associated with inputs
   - Alternative text for images
   - Test with NVDA or JAWS

4. Responsive Design:

   - Text resizable to 200%
   - No horizontal scrolling
   - Touch targets 44x44px minimum
   - Works on 320px to 1920px+

5. Motion & Animation:

   - Respect prefers-reduced-motion
   - No flashing content (>3 flashes/sec)
   - Smooth animations

6. Forms:
   - Clear labels for all inputs
   - Helpful error messages
   - Field instructions clear
   - Required fields marked

Success Criteria:

- Lighthouse accessibility score 95+
- Axe DevTools 0 critical/serious issues
- Keyboard-only navigation works
- Screen reader friendly
- No flashing/seizure triggers
- All 10 WCAG 2.1 AA items tested

```

### Prompt 10.2: Performance Optimization

```

Optimize Insightful Health for performance (2-3 second load target).

Requirements:

1. Lighthouse audit:

   - Run Lighthouse on all pages
   - Target: 90+ on all metrics
   - Performance: < 2.5 second FCP
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 95+

2. Image optimization:

   - Use modern formats (WebP)
   - Responsive images (srcset)
   - Lazy load images
   - Compress all images
   - Use CDN for delivery
   - Max image size: 100KB

3. Code optimization:

   - Minify CSS/JS
   - Remove unused CSS (Tailwind purge)
   - Code splitting
   - Tree shaking
   - Bundle size < 150KB gzipped

4. Database queries:

   - Optimize slow queries
   - Add indexes
   - Cache results (1 hour)
   - Limit query results
   - Avoid N+1 queries

5. Caching:

   - Set cache headers (30 days for static)
   - Browser cache for assets
   - HTTP caching headers
   - Service worker (optional)

6. Core Web Vitals:
   - FCP (First Contentful Paint) < 2.5s
   - LCP (Largest Contentful Paint) < 4s
   - CLS (Cumulative Layout Shift) < 0.1
   - FID (First Input Delay) < 100ms

Success Criteria:

- All Lighthouse scores 90+
- FCP < 2.5 seconds
- No CLS issues
- Bundle < 150KB
- All images optimized
- All slow queries fixed

```

---

## 📱 11. Mobile & Responsive Design

### Prompt 11.1: Mobile Responsiveness

```

Ensure Insightful Health is fully responsive on all devices.

Requirements:

1. Breakpoints:

   - Mobile (320px): XS
   - Tablet (768px): SM
   - Desktop (1024px): MD
   - Large (1280px): LG

2. Mobile-first approach:

   - Design for 320px first
   - Add features for larger screens
   - Use Tailwind responsive prefixes

3. Touch-friendly:

   - Buttons 44x44px minimum
   - Spacing between touch targets
   - Readable without zoom
   - Font size 16px minimum

4. Responsive elements:

   - Navigation: Hamburger menu on mobile
   - Posts: Single column on mobile, 2+ on desktop
   - Search: Full-width on mobile
   - Forms: Full-width inputs
   - Images: Responsive sizing

5. Testing:

   - Test on iPhone, Android, iPad
   - Test in Chrome DevTools
   - Test landscape/portrait
   - Test with actual devices

6. Features:
   - Readable on mobile
   - Fast on mobile networks
   - Touch-optimized navigation
   - No horizontal scroll
   - Bottom navigation (optional)

Success Criteria:

- Looks good at 320px
- Looks good at 768px
- Looks good at 1280px
- No horizontal scrolling
- All buttons touch-friendly
- Images responsive
- Forms full-width

```

---

## 🧪 Testing & QA

### Prompt 12.1: Testing Checklist

```

Create comprehensive testing plan for Insightful Health.

Test categories:

1. Functional Testing:

   - User registration and login
   - Blog post CRUD operations
   - Comment submission and moderation
   - Like/unlike functionality
   - Search functionality
   - Archive/category/tag browsing
   - Admin dashboard operations

2. Performance Testing:

   - Page load time (< 2.5s FCP)
   - Database query performance
   - Image loading performance
   - Bundle size analysis

3. Security Testing:

   - Password strength validation
   - CSRF token protection
   - XSS prevention (HTML sanitization)
   - SQL injection prevention
   - Rate limiting effectiveness
   - OAuth validation

4. Accessibility Testing:

   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast
   - Focus indicators
   - Form labels

5. Browser Testing:

   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)
   - Mobile browsers

6. Device Testing:
   - iPhone (various sizes)
   - Android phones
   - iPad
   - Android tablets
   - Desktop browsers

Success Criteria:

- All tests pass before deployment
- No critical bugs found
- Performance targets met
- Security vulnerabilities fixed
- Accessibility issues resolved

```

---

## 🚀 Deployment Guide

### Prompt 13.1: Netlify Deployment Setup

```

Deploy Insightful Health to Netlify.

Requirements:

1. Netlify setup:

   - Create Netlify account
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables
   - Configure custom domain

2. Build configuration:

   - Build command: npm run build
   - Publish directory: dist
   - Node version: 18+
   - Environment variables set

3. CI/CD pipeline:

   - Auto-deploy on push to main
   - Preview deploys on PRs
   - Automatic SSL certificate
   - Performance monitoring

4. Environment variables:

   - PUBLIC_SITE_URL
   - PUBLIC_POCKETBASE_URL
   - PRIVATE*POCKETBASE*\*
   - PRIVATE_MAILERLITE_API_KEY
   - PRIVATE_OAUTH_KEYS

5. Monitoring:
   - Netlify analytics
   - Error tracking
   - Performance monitoring
   - SSL certificate status

Success Criteria:

- Site deploys successfully
- All environment variables work
- Preview deploys work on PRs
- Production site live
- Custom domain working
- SSL certificate valid

````

---

## 📋 Quick Reference

### Command Reference

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm run preview         # Preview production build

# Code quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Database
pocketbase serve        # Start PocketBase locally
pocketbase backup       # Create database backup

# Deployment
npm run deploy          # Deploy to Netlify (if configured)
````

### Useful Links

- **Astro Docs:** https://docs.astro.build
- **Tailwind Docs:** https://tailwindcss.com/docs
- **PocketBase Docs:** https://pocketbase.io/docs
- **Netlify Docs:** https://docs.netlify.com
- **Web Accessibility:** https://www.w3.org/WAI/WCAG21/quickref/

---

## 📞 Support

For implementation issues:

1. Check relevant documentation (PRD.md, DATABASE.md)
2. Review example code in repository
3. Test in isolation before integration
4. Ask for clarification if prompt is unclear

---

**Document Status:** ✅ Ready for AI Implementation  
**Last Updated:** December 25, 2025  
**Total Prompts:** 25+

Use these prompts sequentially with your AI copilot to build Insightful Health systematically and efficiently.
