# Database Schema Documentation

## Insightful Health - PocketBase Collections

**Database Type:** SQLite (via PocketBase)  
**Backend:** PocketBase  
**Access Method:** REST API (JSON)  
**Documentation Date:** December 25, 2025

---

## 📋 Collection Overview

| Collection        | Purpose                    | Records     | Growth         |
| ----------------- | -------------------------- | ----------- | -------------- |
| **users**         | User accounts and profiles | ~1000       | 50-100/month   |
| **posts**         | Blog articles              | ~500-1000   | 50-100/month   |
| **comments**      | Post comments              | ~2000-5000  | 200-300/month  |
| **likes**         | Post likes/votes           | ~5000-10000 | 500-1000/month |
| **categories**    | Post categories            | ~20-30      | Static         |
| **tags**          | Post tags                  | ~100-200    | 10-20/month    |
| **post_versions** | Post edit history          | ~2000       | 50-100/month   |
| **analytics**     | Tracking events            | ~50000+     | 5000+/month    |

---

## 🗄️ Collection Schemas

### 1. users

**Purpose:** Store user accounts, profiles, and authentication data

```typescript
{
  // System Fields (Auto-managed by PocketBase)
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Creation date
  updated: timestamp,   // Last update

  // Authentication
  email: string,        // Unique email address
  username: string,     // Unique username
  password: string,     // Hashed password (bcrypt)
  emailVerified: boolean, // Email confirmation status

  // Profile Information
  fullName: string,     // Display name
  bio: string,          // User biography (255 chars max)
  profileImageUrl: string, // Avatar/profile picture URL

  // Social Links
  twitterUrl?: string,  // Twitter profile URL
  linkedinUrl?: string, // LinkedIn profile URL
  githubUrl?: string,   // GitHub profile URL
  personalWebsite?: string, // Personal website URL

  // Access Control
  role: "user" | "author" | "admin", // User role (default: "user")
  isVerified: boolean,  // Email/account verified

  // Moderation
  isBanned: boolean,    // Account ban status
  banReason?: string,   // Reason for ban
  bannedAt?: timestamp, // When user was banned

  // Preferences
  emailNotifications: boolean, // Receive email notifications
  newsletterSubscribed: boolean, // Newsletter opt-in

  // Metadata
  lastLoginAt?: timestamp, // Last login time
  loginCount: number,   // Total logins
  totalPostViews: number, // Sum of all post views
}
```

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_isBanned ON users(isBanned);
CREATE INDEX idx_users_created ON users(created DESC);
```

**Constraints:**

- email: Required, unique, valid email format
- username: Required, unique, 3-30 chars, alphanumeric + underscore
- password: Minimum 8 chars, auto-hashed
- role: Must be one of: user, author, admin
- fullName: Max 255 chars

---

### 2. posts

**Purpose:** Store blog articles and content

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Publication date (when first published)
  updated: timestamp,   // Last update date

  // Content
  title: string,        // Post title (required, max 200 chars)
  slug: string,         // URL slug (unique, auto-generated from title)
  excerpt: string,      // Short summary (max 300 chars)
  content: string,      // Full HTML content (from rich editor)
  featuredImageUrl: string, // Cover image URL

  // Metadata
  status: "draft" | "published" | "deleted", // Publication status
  isFeatured: boolean,  // Featured on homepage
  categoryId: string,   // Foreign key → categories
  tags: string[],       // Array of tag IDs (many-to-many)

  // SEO
  seoTitle?: string,    // SEO title (meta tag, 60 chars)
  seoDescription?: string, // Meta description (160 chars)
  seoKeywords?: string[], // Keywords array (5-10 items)
  canonicalUrl?: string, // Canonical URL
  ogImageUrl?: string,  // Open Graph image
  ogTitle?: string,     // Open Graph title
  ogDescription?: string, // Open Graph description

  // Author
  authorId: string,     // Foreign key → users (required)
  authorName: string,   // Denormalized author name

  // Engagement
  viewCount: number,    // Total unique views (default: 0)
  likeCount: number,    // Total likes (default: 0)
  commentCount: number, // Total approved comments (default: 0)

  // Content Stats
  readingTimeMinutes: number, // Estimated read time
  wordCount: number,    // Word count of content

  // Publishing
  publishedAt: timestamp, // When post went live
  scheduledFor?: timestamp, // Scheduled publish time (future)
  deletedAt?: timestamp, // Soft delete timestamp

  // Moderation
  isApproved: boolean,  // Admin approval (default: true for admins, false for authors)
  approvedBy?: string,  // Foreign key → users
  approvedAt?: timestamp, // Approval timestamp
}
```

**Indexes:**

```sql
CREATE INDEX idx_posts_authorId ON posts(authorId);
CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status_publishedAt ON posts(status, publishedAt DESC);
CREATE INDEX idx_posts_categoryId ON posts(categoryId);
CREATE INDEX idx_posts_viewCount ON posts(viewCount DESC);
CREATE INDEX idx_posts_isFeatured ON posts(isFeatured);
CREATE INDEX idx_posts_created ON posts(created DESC);
```

**Constraints:**

- title: Required, max 200 chars
- slug: Required, unique, auto-generated
- authorId: Required, must exist in users
- status: Required, must be one of: draft, published, deleted
- content: HTML sanitized (XSS protection)

---

### 3. comments

**Purpose:** Store post comments with moderation

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Comment creation time
  updated: timestamp,   // Last update time

  // Content
  postId: string,       // Foreign key → posts (required)
  content: string,      // Comment text (max 5000 chars)
  authorId?: string,    // Foreign key → users (nullable for anonymous)
  authorName?: string,  // Display name (for anonymous)
  authorEmail?: string, // Email (for anonymous comments)

  // Nesting
  parentCommentId?: string, // Foreign key → comments (nullable, for replies)

  // Moderation
  status: "pending" | "approved" | "rejected" | "spam", // Status
  approvedBy?: string,  // Admin who approved (FK → users)
  approvedAt?: timestamp, // Approval timestamp
  rejectionReason?: string, // Why rejected

  // Tracking
  isEdited: boolean,    // Whether comment was edited
  editedAt?: timestamp, // Last edit timestamp
  editHistory?: object[], // Array of edits (admin only)

  // Anti-Spam
  ipAddress: string,    // Poster IP (for spam detection)
  userAgent?: string,   // Browser user agent

  // Engagement
  likeCount: number,    // Comment likes (optional feature)
}
```

**Indexes:**

```sql
CREATE INDEX idx_comments_postId ON comments(postId);
CREATE INDEX idx_comments_authorId ON comments(authorId);
CREATE INDEX idx_comments_parentCommentId ON comments(parentCommentId);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created ON comments(created DESC);
CREATE INDEX idx_comments_postId_status ON comments(postId, status);
```

**Constraints:**

- postId: Required, must exist in posts
- content: Required, 1-5000 chars, sanitized
- status: Required, must be: pending, approved, rejected, spam
- isEdited: Default false

**Moderation Workflow:**

1. New comment → status: "pending"
2. Admin reviews comment
3. Approve → status: "approved" (visible)
4. Reject → status: "rejected" (hidden)
5. Spam → status: "spam" (hidden)

---

### 4. likes

**Purpose:** Track post likes from users and anonymous visitors

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Like timestamp

  // Post Reference
  postId: string,       // Foreign key → posts (required)

  // User Reference (either one required)
  userId?: string,      // Foreign key → users (nullable for anonymous)
  ipAddress: string,    // IP address (for anonymous tracking)
  sessionId: string,    // Session ID (for unique count)

  // Metadata
  userAgent?: string,   // Browser user agent
  referer?: string,     // HTTP referer
}
```

**Indexes:**

```sql
CREATE INDEX idx_likes_postId ON likes(postId);
CREATE INDEX idx_likes_userId ON likes(userId);
CREATE UNIQUE INDEX idx_likes_postId_userId ON likes(postId, userId);
CREATE UNIQUE INDEX idx_likes_postId_ipAddress ON likes(postId, ipAddress, sessionId);
```

**Constraints:**

- postId: Required, must exist in posts
- Either userId OR (ipAddress + sessionId) required
- Unique constraint prevents duplicate likes

**Anonymous Like Tracking:**

- Track by IP + Session ID
- Session lifetime: 24 hours
- IP address logged for analytics

---

### 5. categories

**Purpose:** Organize posts by category

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Creation date
  updated: timestamp,   // Last update

  // Category Info
  name: string,         // Category name (required, unique)
  slug: string,         // URL slug (unique, auto-generated)
  description?: string, // Category description
  icon?: string,        // Icon/emoji
  color?: string,       // Color code for UI

  // Metadata
  postCount: number,    // Total posts in category (denormalized)
  displayOrder: number, // Sort order in navigation
  isActive: boolean,    // Hidden/active status
}
```

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_categories_name ON categories(name);
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_displayOrder ON categories(displayOrder);
```

**Predefined Categories:**

- Data Analytics
- Disease Trends
- Policy & Regulation
- Research & Studies
- Community Health
- Healthcare Systems
- Health Economics
- Technology & Innovation

---

### 6. tags

**Purpose:** Flexible tagging system for posts

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Creation date

  // Tag Info
  name: string,         // Tag name (required, unique)
  slug: string,         // URL slug (unique, auto-generated)
  description?: string, // Tag description

  // Metadata
  postCount: number,    // Total posts with tag (denormalized)
  isPopular: boolean,   // Show in tag cloud
}
```

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_tags_name ON tags(name);
CREATE UNIQUE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_postCount ON tags(postCount DESC);
```

**Example Tags:**

- COVID-19
- Diabetes
- Mental Health
- Healthcare Policy
- Data Science
- Statistics
- Public Health
- Epidemiology

---

### 7. post_versions

**Purpose:** Admin-only post version history

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Version creation time

  // Post Reference
  postId: string,       // Foreign key → posts (required)

  // Version Info
  versionNumber: number, // Auto-incrementing version

  // Content Snapshot
  title: string,        // Title at this version
  excerpt: string,      // Excerpt at this version
  content: string,      // Full content at this version
  status: "draft" | "published", // Status at this version

  // Change Info
  changedBy: string,    // Admin ID who made change
  changeSummary?: string, // What changed

  // Metadata
  isCurrentVersion: boolean, // True if this is latest
  restoredFrom?: string, // Version ID if restored from another
}
```

**Indexes:**

```sql
CREATE INDEX idx_post_versions_postId ON post_versions(postId);
CREATE INDEX idx_post_versions_versionNumber ON post_versions(postId, versionNumber DESC);
CREATE INDEX idx_post_versions_created ON post_versions(created DESC);
```

**Notes:**

- Only admins see this collection
- Automatic version creation on post update
- Max 10 versions per post (older ones archived)
- Used for rollback functionality

---

### 8. analytics

**Purpose:** Track user behavior and engagement

```typescript
{
  // System Fields
  id: string,           // Unique identifier (pk)
  created: timestamp,   // Event timestamp

  // Event Info
  eventType: "view" | "like" | "comment" | "search" | "login" | "signup", // Event type

  // Post/Content Reference
  postId?: string,      // Foreign key → posts (nullable)
  categoryId?: string,  // Foreign key → categories (nullable)
  tagId?: string,       // Foreign key → tags (nullable)

  // User Reference
  userId?: string,      // Foreign key → users (nullable for anonymous)
  ipAddress: string,    // User IP address
  sessionId: string,    // Session ID

  // Request Info
  userAgent: string,    // Browser user agent
  referer?: string,     // HTTP referer
  countryCode?: string, // User country (from IP geolocation)

  // Search (if eventType = "search")
  searchQuery?: string, // What user searched for
  searchResultCount?: number, // Results found

  // Custom Metadata
  metadata?: object,    // Any additional data
}
```

**Indexes:**

```sql
CREATE INDEX idx_analytics_eventType ON analytics(eventType);
CREATE INDEX idx_analytics_postId ON analytics(postId);
CREATE INDEX idx_analytics_userId ON analytics(userId);
CREATE INDEX idx_analytics_created ON analytics(created DESC);
CREATE INDEX idx_analytics_sessionId ON analytics(sessionId);
```

**Retention Policy:**

- Keep 6 months of detailed records
- Archive older records quarterly
- Aggregate data retained 1 year

**Analytics Queries:**

```sql
-- Daily active users
SELECT COUNT(DISTINCT sessionId)
FROM analytics
WHERE created >= date_sub(now(), INTERVAL 1 DAY)

-- Top posts by views
SELECT postId, COUNT(*) as views
FROM analytics
WHERE eventType = 'view'
GROUP BY postId
ORDER BY views DESC
LIMIT 10

-- Most searched terms
SELECT searchQuery, COUNT(*) as count
FROM analytics
WHERE eventType = 'search'
GROUP BY searchQuery
ORDER BY count DESC
```

---

## 🔗 Relationships Diagram

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │ (1)
       │ authorId
       │ (M)
       │
┌──────▼─────────────┐
│      Posts         │
└──────┬─────────────┘
       │
       ├─ (1) categoryId → Categories
       │
       ├─ (M) tagId ↔ Tags (junction)
       │
       └─ (M) id → Comments.postId
          │
          └─ (M) id → Likes.postId
          └─ (M) id → PostVersions.postId
          └─ (M) id → Analytics.postId
```

---

## 📊 Data Models & Relationships

### Many-to-Many: Posts ↔ Tags

**Junction Table:** posts_tags (implicit in PocketBase array)

```typescript
// In posts collection:
tags: string[],  // Array of tag IDs

// Populate in REST API:
GET /api/collections/posts/records/{id}?expand=tags
```

---

## 🔐 Role-Based Access Control

### User Roles & Permissions

| Operation          | User | Author | Admin |
| ------------------ | ---- | ------ | ----- |
| View posts         | ✓    | ✓      | ✓     |
| Create post        | ✗    | ✓      | ✓     |
| Edit own post      | ✗    | ✓      | ✓     |
| Edit any post      | ✗    | ✗      | ✓     |
| Delete own post    | ✗    | ✓      | ✓     |
| Delete any post    | ✗    | ✗      | ✓     |
| Comment            | ✓    | ✓      | ✓     |
| Moderate comments  | ✗    | ✗      | ✓     |
| View analytics     | ✗    | ✓\*    | ✓     |
| Manage users       | ✗    | ✗      | ✓     |
| Access admin panel | ✗    | ✗      | ✓     |

\*Authors see only their own analytics

---

## 🔄 Data Integrity & Constraints

### Foreign Keys

```sql
ALTER TABLE posts
  ADD CONSTRAINT fk_posts_author
  FOREIGN KEY (authorId) REFERENCES users(id);

ALTER TABLE comments
  ADD CONSTRAINT fk_comments_post
  FOREIGN KEY (postId) REFERENCES posts(id);

ALTER TABLE posts
  ADD CONSTRAINT fk_posts_category
  FOREIGN KEY (categoryId) REFERENCES categories(id);
```

### Cascade Behaviors

- **User deletion:** Archive/anonymize posts and comments
- **Post deletion:** Delete comments, likes, versions (soft delete)
- **Comment deletion:** Allow both user and admin deletion
- **Category deletion:** Unassign posts (set to null)

---

## 📈 Query Performance Optimization

### Frequently Used Queries

```sql
-- 1. Get post with comments (most frequent)
SELECT p.*, c.* FROM posts p
LEFT JOIN comments c ON p.id = c.postId
WHERE p.slug = ? AND c.status = 'approved'
ORDER BY c.created DESC

-- 2. Get latest posts for homepage
SELECT * FROM posts
WHERE status = 'published' AND isFeatured = true
ORDER BY publishedAt DESC
LIMIT 10

-- 3. Count post views (analytics)
SELECT postId, COUNT(*) as views FROM analytics
WHERE postId = ? AND eventType = 'view'
AND created >= date_sub(now(), INTERVAL 30 DAY)

-- 4. Get author's posts
SELECT * FROM posts
WHERE authorId = ? AND status = 'published'
ORDER BY publishedAt DESC
LIMIT 20

-- 5. Search posts
SELECT * FROM posts
WHERE status = 'published'
AND (title LIKE ? OR excerpt LIKE ? OR tags CONTAINS ?)
ORDER BY publishedAt DESC
```

---

## 📦 Export/Import Strategy

### Regular Backups

- Daily automated backups to AWS S3
- Weekly backup to external drive
- Monthly archive to cold storage

### Data Export (GDPR)

Users can export all their data:

- Profile information (JSON)
- Posts (HTML + Markdown)
- Comments (JSON)
- Engagement metrics (CSV)

---

## 🚀 Scaling Considerations

### For 1000+ MAUs

1. **Database:**

   - Migrate to PostgreSQL for better concurrency
   - Enable read replicas for analytics queries
   - Archive old analytics data (>6 months)

2. **Indexes:**

   - Monitor slow queries monthly
   - Add composite indexes as needed
   - Analyze query plans

3. **Caching:**

   - Redis for session storage
   - Varnish for page caching
   - Database query result caching

4. **Content Delivery:**
   - CloudFront for CDN
   - Image optimization with ImageKit
   - Lazy load images and embeds

---

## 🛠️ PocketBase Setup Commands

```bash
# Initialize PocketBase
pocketbase serve

# Create collections via REST API
curl -X POST http://localhost:8090/api/collections \
  -H "Authorization: eyJ..." \
  -d @collections.json

# Backup database
pocketbase backup

# Restore database
pocketbase restore backup_name
```

---

## 📞 Database Support

- **PocketBase Docs:** https://pocketbase.io/docs/
- **SQLite Docs:** https://www.sqlite.org/docs.html
- **Performance Tips:** PocketBase Admin UI → Tools → Logs

---

**Schema Version:** 1.0  
**Last Updated:** December 25, 2025  
**Status:** Production Ready
