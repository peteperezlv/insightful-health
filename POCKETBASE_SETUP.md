# PocketBase Collections Setup Guide

This guide provides comprehensive instructions for setting up the 8 required collections in PocketBase for the PRD-Driven Copilot blog platform.

## Overview

The following 8 collections need to be created:

1. **users** - User authentication and profiles (Auth collection)
2. **categories** - Blog post categories
3. **tags** - Blog post tags
4. **posts** - Blog articles with full content
5. **comments** - Comment threads on posts
6. **likes** - Like tracking for posts
7. **post_versions** - Version history and edit tracking
8. **analytics** - Event tracking and analytics data

## Quick Setup

### Option 1: Import JSON Collections (Recommended)

1. Open PocketBase Admin UI (typically at `http://localhost:8090/_/`)
2. Go to **Settings > Import collections**
3. Upload or paste the contents of `pocketbase-collections.json`
4. Click **Import** to create all collections at once

### Option 2: Manual Creation

Follow the detailed setup instructions for each collection below.

---

## Collection Details

### 1. Users Collection (Auth)

**Type:** Auth Collection (for user authentication)

**Purpose:** Store user accounts, profiles, and authentication data

**Fields:**

| Field Name           | Type           | Required | Unique | Notes                             |
| -------------------- | -------------- | -------- | ------ | --------------------------------- |
| email                | Email          | ✓        | ✓      | Unique email for login            |
| username             | Text           | ✗        | ✗      | 3-30 chars, alphanumeric only     |
| emailVerified        | Bool           | ✗        |        | Auto-set after email verification |
| fullName             | Text           | ✗        |        | User's display name               |
| bio                  | Text (max 500) | ✗        |        | Short biography                   |
| profileImageUrl      | URL            | ✗        |        | Avatar/profile picture            |
| twitterUrl           | URL            | ✗        |        | Social media link                 |
| linkedinUrl          | URL            | ✗        |        | Social media link                 |
| githubUrl            | URL            | ✗        |        | Social media link                 |
| personalWebsite      | URL            | ✗        |        | Personal website link             |
| role                 | Select         | ✗        |        | Values: user, author, admin       |
| isVerified           | Bool           | ✗        |        | Email verification status         |
| isBanned             | Bool           | ✗        |        | Account ban status                |
| banReason            | Text           | ✗        |        | Reason for ban                    |
| bannedAt             | Date           | ✗        |        | When account was banned           |
| emailNotifications   | Bool           | ✗        |        | Email preference                  |
| newsletterSubscribed | Bool           | ✗        |        | Newsletter opt-in                 |
| lastLoginAt          | Date           | ✗        |        | Track last login                  |
| loginCount           | Number         | ✗        |        | Total login count                 |
| totalPostViews       | Number         | ✗        |        | Aggregate post views              |

**Access Rules:**

- **List:** Anyone can list users
- **View:** Users can view their own profile or admins can view any
- **Create:** Public registration allowed
- **Update:** Users can update their own profile, admins can update any
- **Delete:** Admins only

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_isBanned ON users(isBanned);
CREATE INDEX idx_users_created ON users(created DESC);
```

**Access Rules:**

```json
{
  "list": "true",
  "view": "user.id = @request.auth.id || @request.auth.verified",
  "create": "!@request.auth.id",
  "update": "user.id = @request.auth.id || @request.auth.role = 'admin'",
  "delete": "@request.auth.role = 'admin'"
}
```

**Create test user:**

- Email: test@example.com
- Username: testuser
- Password: TestPassword123
- Role: author

---

### Collection 2: posts

**Purpose:** Blog articles and content

**Steps:**

1. Create new collection: `posts`
2. Add these fields:

| Field Name         | Type     | Required | Notes                              |
| ------------------ | -------- | -------- | ---------------------------------- |
| title              | text     | ✓        | Max 200 chars                      |
| slug               | text     | ✓        | Unique, auto-generated             |
| excerpt            | text     |          | Max 300 chars                      |
| content            | editor   | ✓        | Rich HTML content                  |
| featuredImageUrl   | url      |          | Cover image                        |
| status             | select   | ✓        | Options: draft, published, deleted |
| isFeatured         | boolean  |          | Default: false                     |
| categoryId         | relation |          | Links to categories                |
| tags               | relation |          | Many-to-many to tags               |
| seoTitle           | text     |          | Max 60 chars                       |
| seoDescription     | text     |          | Max 160 chars                      |
| seoKeywords        | json     |          | Array of keywords                  |
| canonicalUrl       | url      |          | Optional canonical                 |
| ogImageUrl         | url      |          | OG image                           |
| ogTitle            | text     |          | OG title                           |
| ogDescription      | text     |          | OG description                     |
| authorId           | relation | ✓        | Links to users                     |
| authorName         | text     |          | Denormalized name                  |
| viewCount          | number   |          | Default: 0                         |
| likeCount          | number   |          | Default: 0                         |
| commentCount       | number   |          | Default: 0                         |
| readingTimeMinutes | number   |          | Calculated                         |
| wordCount          | number   |          | Calculated                         |
| publishedAt        | date     |          | Auto-filled                        |
| scheduledFor       | date     |          | Optional future date               |
| deletedAt          | date     |          | Soft delete                        |
| isApproved         | boolean  |          | Default: true for admins           |
| approvedBy         | relation |          | Links to users                     |
| approvedAt         | date     |          | Approval timestamp                 |

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

**Access Rules:**

```json
{
  "list": "status = 'published' || @request.auth.role = 'admin' || authorId = @request.auth.id",
  "view": "status = 'published' || @request.auth.role = 'admin' || authorId = @request.auth.id",
  "create": "@request.auth.role = 'author' || @request.auth.role = 'admin'",
  "update": "authorId = @request.auth.id || @request.auth.role = 'admin'",
  "delete": "@request.auth.role = 'admin'"
}
```

---

### Collection 3: comments

**Purpose:** Post comments with moderation

**Steps:**

1. Create new collection: `comments`
2. Add these fields:

| Field Name      | Type     | Required | Notes                                      |
| --------------- | -------- | -------- | ------------------------------------------ |
| postId          | relation | ✓        | Links to posts                             |
| content         | text     | ✓        | Max 5000 chars, sanitized                  |
| authorId        | relation |          | Nullable for anonymous                     |
| authorName      | text     |          | Display name                               |
| authorEmail     | email    |          | For anonymous comments                     |
| parentCommentId | relation |          | For nested replies                         |
| status          | select   | ✓        | Options: pending, approved, rejected, spam |
| approvedBy      | relation |          | Admin who approved                         |
| approvedAt      | date     |          | Approval time                              |
| rejectionReason | text     |          | Optional                                   |
| isEdited        | boolean  |          | Default: false                             |
| editedAt        | date     |          | Last edit time                             |
| editHistory     | json     |          | Edit history (admin only)                  |
| ipAddress       | text     |          | Required for spam detection                |
| userAgent       | text     |          | Browser info                               |
| likeCount       | number   |          | Default: 0                                 |

**Indexes:**

```sql
CREATE INDEX idx_comments_postId ON comments(postId);
CREATE INDEX idx_comments_authorId ON comments(authorId);
CREATE INDEX idx_comments_parentCommentId ON comments(parentCommentId);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created ON comments(created DESC);
CREATE INDEX idx_comments_postId_status ON comments(postId, status);
```

**Access Rules:**

```json
{
  "list": "status = 'approved' || @request.auth.role = 'admin'",
  "view": "status = 'approved' || @request.auth.role = 'admin' || authorId = @request.auth.id",
  "create": "@request.auth.id != ''",
  "update": "authorId = @request.auth.id || @request.auth.role = 'admin'",
  "delete": "authorId = @request.auth.id || @request.auth.role = 'admin'"
}
```

---

### Collection 4: likes

**Purpose:** Post likes from authenticated and anonymous users

**Steps:**

1. Create new collection: `likes`
2. Add these fields:

| Field Name | Type     | Required | Notes                             |
| ---------- | -------- | -------- | --------------------------------- |
| postId     | relation | ✓        | Links to posts                    |
| userId     | relation |          | Nullable, for authenticated users |
| ipAddress  | text     | ✓        | IP of liker (anonymous tracking)  |
| sessionId  | text     | ✓        | Session identifier                |
| userAgent  | text     |          | Browser info                      |
| referer    | text     |          | HTTP referer                      |

**Indexes:**

```sql
CREATE INDEX idx_likes_postId ON likes(postId);
CREATE INDEX idx_likes_userId ON likes(userId);
CREATE UNIQUE INDEX idx_likes_postId_userId ON likes(postId, userId);
CREATE UNIQUE INDEX idx_likes_postId_ipAddress ON likes(postId, ipAddress, sessionId);
```

**Access Rules:**

```json
{
  "list": "true",
  "view": "true",
  "create": "true",
  "update": "false",
  "delete": "@request.auth.role = 'admin' || userId = @request.auth.id"
}
```

---

### Collection 5: categories

**Purpose:** Post categories

**Steps:**

1. Create new collection: `categories`
2. Add these fields:

| Field Name   | Type   | Required | Notes                  |
| ------------ | ------ | -------- | ---------------------- |
| name         | text   | ✓        | Unique, category name  |
| slug         | text   | ✓        | Unique, auto-generated |
| description  | text   |          | Optional               |
| icon         | text   |          | Emoji or icon code     |
| color        | text   |          | Color hex code         |
| displayOrder | number |          | Sort order             |

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_categories_name ON categories(name);
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_displayOrder ON categories(displayOrder);
```

**Access Rules:**

```json
{
  "list": "true",
  "view": "true",
  "create": "@request.auth.role = 'admin'",
  "update": "@request.auth.role = 'admin'",
  "delete": "@request.auth.role = 'admin'"
}
```

**Add sample categories:**

- Public Health
- Data Analytics
- Community Health
- Healthcare Policy
- Research & Studies

---

### Collection 6: tags

**Purpose:** Post tags for classification

**Steps:**

1. Create new collection: `tags`
2. Add these fields:

| Field Name  | Type | Required | Notes                  |
| ----------- | ---- | -------- | ---------------------- |
| name        | text | ✓        | Unique, tag name       |
| slug        | text | ✓        | Unique, auto-generated |
| description | text |          | Optional               |

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_tags_name ON tags(name);
CREATE UNIQUE INDEX idx_tags_slug ON tags(slug);
```

**Access Rules:**

```json
{
  "list": "true",
  "view": "true",
  "create": "@request.auth.role = 'admin' || @request.auth.role = 'author'",
  "update": "@request.auth.role = 'admin'",
  "delete": "@request.auth.role = 'admin'"
}
```

---

### Collection 7: post_versions

**Purpose:** Post edit history (admin only)

**Steps:**

1. Create new collection: `post_versions`
2. Add these fields:

| Field Name     | Type     | Required | Notes                        |
| -------------- | -------- | -------- | ---------------------------- |
| postId         | relation | ✓        | Links to posts               |
| versionNumber  | number   | ✓        | Sequential version           |
| title          | text     | ✓        | Title at this version        |
| slug           | text     | ✓        | Slug at this version         |
| content        | editor   | ✓        | Full content snapshot        |
| excerpt        | text     |          | Excerpt snapshot             |
| status         | select   | ✓        | Status at this version       |
| editedBy       | relation | ✓        | Links to users               |
| editReason     | text     |          | Why this version was created |
| changesSummary | text     |          | Summary of changes           |

**Indexes:**

```sql
CREATE INDEX idx_post_versions_postId ON post_versions(postId);
CREATE INDEX idx_post_versions_editedBy ON post_versions(editedBy);
CREATE INDEX idx_post_versions_created ON post_versions(created DESC);
```

**Access Rules:**

```json
{
  "list": "@request.auth.role = 'admin'",
  "view": "@request.auth.role = 'admin'",
  "create": "@request.auth.role = 'admin'",
  "update": "false",
  "delete": "@request.auth.role = 'admin'"
}
```

---

### Collection 8: analytics

**Purpose:** Track views, events, and user engagement

**Steps:**

1. Create new collection: `analytics`
2. Add these fields:

| Field Name  | Type     | Required | Notes                      |
| ----------- | -------- | -------- | -------------------------- |
| postId      | relation |          | Links to posts             |
| userId      | relation |          | Nullable, user viewing     |
| eventType   | select   | ✓        | view, like, comment, share |
| ipAddress   | text     | ✓        | User IP                    |
| sessionId   | text     |          | Session identifier         |
| referer     | text     |          | HTTP referer               |
| userAgent   | text     |          | Browser info               |
| deviceType  | select   |          | desktop, mobile, tablet    |
| pageUrl     | text     | ✓        | Full URL viewed            |
| timeOnPage  | number   |          | Seconds spent              |
| scrollDepth | number   |          | % of page scrolled         |
| timestamp   | date     | ✓        | When event occurred        |

**Indexes:**

```sql
CREATE INDEX idx_analytics_postId ON analytics(postId);
CREATE INDEX idx_analytics_userId ON analytics(userId);
CREATE INDEX idx_analytics_eventType ON analytics(eventType);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX idx_analytics_postId_timestamp ON analytics(postId, timestamp DESC);
```

**Access Rules:**

```json
{
  "list": "@request.auth.role = 'admin'",
  "view": "@request.auth.role = 'admin'",
  "create": "true",
  "update": "false",
  "delete": "@request.auth.role = 'admin'"
}
```

**Auto-Archive:**

- Records > 6 months old should be archived/deleted
- Consider a monthly cleanup job

---

## 🔑 Key Validation Rules

### Users Collection

```
- email: Must be valid email format
- username: 3-30 chars, alphanumeric + underscore, unique
- password: Min 8 chars (auto-enforced by PocketBase)
- role: Must be "user", "author", or "admin"
```

### Posts Collection

```
- title: Required, 1-200 chars
- slug: Unique, lowercase, hyphenated, auto-generated
- content: Sanitized HTML (no XSS)
- status: Must be "draft", "published", or "deleted"
- authorId: Must exist in users collection
```

### Comments Collection

```
- content: 1-5000 chars, sanitized HTML
- postId: Must exist in posts collection
- status: Must be "pending", "approved", "rejected", or "spam"
- ipAddress: Required for spam tracking
```

### Likes Collection

```
- postId: Must exist in posts collection
- userId + postId: Unique constraint (no duplicate likes)
- ipAddress + sessionId + postId: Unique for anonymous
```

---

## 🚀 Testing Collections

### 1. Test users creation

```bash
curl -X POST http://localhost:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123",
    "passwordConfirm": "TestPassword123",
    "fullName": "Test User",
    "role": "author"
  }'
```

### 2. Test posts creation

```bash
curl -X POST http://localhost:8090/api/collections/posts/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "<p>Hello World</p>",
    "status": "published",
    "authorId": "<user-id>",
    "authorName": "Test User"
  }'
```

### 3. Test queries

```bash
# Get all published posts
curl "http://localhost:8090/api/collections/posts/records?filter=status='published'&sort=-created"

# Get comments pending approval
curl "http://localhost:8090/api/collections/comments/records?filter=status='pending'&sort=-created"

# Get post analytics
curl "http://localhost:8090/api/collections/analytics/records?filter=postId='<post-id>'&sort=-timestamp"
```

---

## 📊 Database Growth Projections

| Collection | Month 1 | Month 3 | Month 6 | Year 1 |
| ---------- | ------- | ------- | ------- | ------ |
| users      | 100     | 250     | 500     | 1000   |
| posts      | 50      | 150     | 300     | 600    |
| comments   | 200     | 600     | 1200    | 2400   |
| likes      | 500     | 1500    | 3000    | 6000   |
| analytics  | 5000    | 15000   | 30000   | 60000  |

**Recommendations:**

- Archive analytics records >6 months old
- Create backups weekly
- Monitor database size monthly
- Consider read replicas at 10,000+ MAU

---

## ✅ Success Checklist

- [ ] All 8 collections created
- [ ] Auth enabled on users collection
- [ ] All fields created with correct types
- [ ] Indexes created for performance
- [ ] Validation rules configured
- [ ] Access control rules set
- [ ] Test data inserted
- [ ] Sample queries tested
- [ ] Backups configured
- [ ] Documentation reviewed

---

## 🔒 Security Checklist

- [ ] Passwords auto-hashed (PocketBase default)
- [ ] Email validation enabled
- [ ] Access rules prevent unauthorized access
- [ ] Admin-only collections locked down
- [ ] SQL injection prevention (parameterized)
- [ ] XSS protection (HTML sanitization)
- [ ] Rate limiting configured
- [ ] Audit logging enabled

---

## 📞 Troubleshooting

**Collections not showing:** Restart PocketBase, refresh admin panel
**Import fails:** Check JSON syntax, ensure all collection names match
**Field validation errors:** Verify field types match schema
**Access denied errors:** Check that logged-in user has correct role
**Performance slow:** Create indexes, check for N+1 queries

---

**Last Updated:** December 26, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Setup
