# Product Requirements Document (PRD)

## Insightful Health - Public Health Analytics Blogging Platform

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Status:** Ready for AI-Copilot Development

---

## 📋 Executive Summary

**Insightful Health** is a modern, accessible blogging platform designed for public health enthusiasts, data analysts, and healthcare professionals to publish articles, share health insights, and engage with a community focused on public health data analytics.

The platform combines a clean, minimal healthcare-themed design with powerful content management, community engagement features, and author analytics—all built for scalability to support 1,000 monthly active users (MAUs) within the first year.

### Key Success Metrics

- **Page Load Time:** 2-3 seconds (First Contentful Paint)
- **Mobile Responsiveness:** 100% mobile-optimized
- **Accessibility:** WCAG 2.1 AA compliant
- **Scalability:** Support 1000 MAUs in year one
- **Uptime:** 99.9% availability via Netlify

---

## 🎯 Product Vision & Goals

### Vision Statement

"Empower health professionals and enthusiasts with a simple, accessible platform to share data-driven insights and foster community dialogue around public health challenges."

### Strategic Goals

1. **Accessibility:** Make health insights accessible to all (mobile, keyboard, screen reader)
2. **Community:** Build engaged community of public health professionals
3. **Quality Content:** Ensure high-quality, peer-reviewed health insights
4. **Scalability:** Support growth from launch to 1000 MAUs
5. **Security:** Protect user data and ensure compliance (SSL, encryption, GDPR-ready)

---

## 🎭 Target Audience

### Primary Users

- **Healthcare professionals** (nurses, doctors, epidemiologists, public health officers)
- **Data analysts** in health/epidemiology sectors
- **Health enthusiasts** interested in data-driven wellness
- **Academic researchers** publishing health insights
- **Policy makers** seeking health trend analysis

### User Demographics

- Age: 25-65
- Education: Bachelor's degree or higher
- Tech Proficiency: Intermediate to advanced
- Primary Motivation: Share knowledge, build authority, community engagement

### User Personas

#### 1. Dr. Sarah (Author/Content Creator)

- Epidemiologist publishing monthly health trend analyses
- Needs: Rich text editor, SEO optimization, analytics on posts
- Pain Point: Wants easy content creation without coding

#### 2. John (Active Reader)

- Healthcare administrator staying informed on health trends
- Needs: Easy navigation, search functionality, newsletter
- Pain Point: Too many irrelevant health news sources

#### 3. Maria (Admin/Moderator)

- Platform admin managing content and community
- Needs: Comment moderation, user management, analytics dashboard
- Pain Point: Preventing spam and maintaining quality discussions

---

## ✨ Core Features

### 1. **User Authentication & Profiles**

- **OAuth Integration:** GitHub, Google, Facebook login
- **Email/Password:** Traditional email authentication via PocketBase
- **Profile Pages:** User bios, author pages, profile management
- **Account Settings:** Email preferences, password reset, account deletion
- **User Verification:** No author badges required; anonymous users supported
- **Role-Based Access:** User, Author, Admin roles with different permissions

**Acceptance Criteria:**

- [ ] OAuth login works without errors
- [ ] Password reset email delivers within 2 minutes
- [ ] Users can update profile information
- [ ] User authentication persists across sessions

### 2. **Admin Dashboard & Content Management**

- **Post Management:** Create, edit, delete, publish/draft posts
- **User Management:** View users, ban abusive users, manage roles
- **Analytics Dashboard:** Views, comments, likes tracking per post/author
- **Comment Moderation:** Approve/reject comments, ban users
- **Featured Posts:** Admin ability to feature posts on homepage
- **Post Versioning:** Admin-only view of post edit history
- **Bulk Operations:** Batch actions on posts/comments

**Acceptance Criteria:**

- [ ] Admin can create post in < 1 minute
- [ ] Comment moderation UI loads in < 1 second
- [ ] User ban prevents all actions within 5 minutes
- [ ] Featured posts display correctly on homepage

### 3. **Rich-Text Editor**

- **WYSIWYG Editing:** Intuitive visual editor (use TipTap or similar)
- **Formatting:** Bold, italic, underline, lists, quotes, code blocks
- **Image Support:** Upload images, auto-optimization, CDN delivery
- **Embedded Charts:** Support iframe embeds, static images
- **Link Management:** Internal/external links, preview
- **Draft Auto-Save:** Auto-save every 30 seconds
- **Version History:** (Admin only) See previous versions of posts

**Acceptance Criteria:**

- [ ] Editor loads in < 500ms
- [ ] Draft auto-saves without user action
- [ ] Images upload < 5MB in < 2 seconds
- [ ] Formatting toolbar has all 8+ options

### 4. **Blog Post Features**

- **Post Structure:** Title, content, featured image, excerpt, author
- **SEO Metadata:** Meta title, description, canonical URL, OG tags
- **Categorization:** Tags, categories for organization
- **Permalinks:** Clean, SEO-optimized URLs (slugs)
- **Publication:** Schedule posts, publish/draft states, visibility control
- **Post Stats:** View count, comment count, like count, reading time
- **Post Likes:** Anonymous users can like (vote) posts
- **Embedded Charts:** Support for iframe charts and static images

**Acceptance Criteria:**

- [ ] All SEO fields populate correctly
- [ ] Permalink generates from title automatically
- [ ] Like count updates without page reload
- [ ] Charts embed without breaking layout

### 5. **Comments & Community**

- **Comment System:** Nested, threaded comments on posts
- **Moderation Required:** Admin must approve before visibility
- **Rate Limiting:** 5 comments per user per day
- **User Controls:** Users can delete own comments
- **Admin Controls:** Admins can edit/delete any comment, ban users
- **No Notifications:** Authors don't receive comment notifications
- **Comment Display:** Show author name, date, content

**Acceptance Criteria:**

- [ ] Rate limit enforced (5/day max)
- [ ] Moderation UI shows pending comments
- [ ] Banned users cannot comment or post
- [ ] Comment thread structure displays correctly

### 6. **Newsletter Subscription**

- **MailerLite Integration:** Subscribe via embedded form
- **Optional Signup:** Footer newsletter form, not mandatory
- **Double Opt-In:** Email confirmation required
- **List Management:** MailerLite handles subscriber database
- **Compliance:** GDPR-ready, privacy policy linked

**Acceptance Criteria:**

- [ ] Newsletter form appears on all pages
- [ ] Confirmation email sends within 30 seconds
- [ ] MailerLite integration working correctly
- [ ] Unsubscribe link functional

### 7. **Search & Discovery**

- **Global Search:** Search posts by title, tags, content
- **Search Results:** Title, excerpt, author, date
- **Filtering:** Filter by category, author, date range
- **Archive:** Posts organized by date (year/month)
- **Tag Cloud:** Browse posts by tags
- **Featured Posts:** Dedicated section on homepage
- **Related Posts:** Show related posts at end of article

**Acceptance Criteria:**

- [ ] Search returns results in < 1 second
- [ ] Archive pages load with pagination
- [ ] Featured posts display correctly
- [ ] Tag pages show all related posts

### 8. **Analytics & Reporting**

- **Post Analytics:** Views, comments, likes per post
- **Author Dashboard:** Aggregate stats for author's posts
- **Trending Posts:** Most viewed/commented posts
- **Google Analytics:** Track traffic, user behavior, conversions
- **User Analytics:** Login frequency, session duration
- **Export:** Download analytics as CSV

**Acceptance Criteria:**

- [ ] Analytics dashboard loads data within 2 seconds
- [ ] View counts update in real-time
- [ ] Google Analytics tracks all events correctly

### 9. **Author Pages & Profiles**

- **Author Profile:** Bio, social links, post count
- **Author Posts:** List of all posts by author
- **Author Stats:** Total views, followers, engagement metrics
- **Public Visibility:** Anyone can view author profiles
- **Social Links:** Twitter, LinkedIn, email contact

**Acceptance Criteria:**

- [ ] Author page loads in < 2 seconds
- [ ] All author posts display with pagination
- [ ] Social links are clickable and correct

### 10. **Responsive Design & Accessibility**

- **Mobile First:** 100% responsive on all devices
- **WCAG 2.1 AA:** Accessibility compliance
- **Keyboard Navigation:** Full keyboard support (Tab, Enter, Escape)
- **Screen Readers:** Semantic HTML, ARIA labels
- **Color Contrast:** 4.5:1 minimum contrast ratio
- **Focus Indicators:** Visible focus states on all interactive elements
- **Healthcare Theme:** Minimal, clean, healthcare-inspired design

**Acceptance Criteria:**

- [ ] Lighthouse score 90+ on all metrics
- [ ] All forms keyboard accessible
- [ ] Color contrast ratio 4.5:1 on all text
- [ ] Mobile breakpoints: 320px, 640px, 1024px, 1280px

---

## 🛠️ Technical Specifications

### Tech Stack

| Component      | Technology                       | Rationale                                           |
| -------------- | -------------------------------- | --------------------------------------------------- |
| **Framework**  | Astro                            | Fast, minimal JS, great for content-heavy sites     |
| **Styling**    | Tailwind CSS                     | Utility-first CSS, minimal bundle size              |
| **Backend**    | PocketBase                       | Self-hosted, SQLite, great for small-to-medium apps |
| **Deployment** | Netlify                          | 99.9% uptime, auto-scaling, built-in HTTPS          |
| **Newsletter** | MailerLite                       | Good API, affordable, GDPR-compliant                |
| **Auth**       | OAuth (GitHub, Google, Facebook) | Familiar to users, easy to implement                |
| **Analytics**  | Google Analytics 4               | Industry standard, free tier sufficient             |
| **Database**   | SQLite (PocketBase)              | Simple, file-based, scalable to 1000 MAUs           |
| **Hosting**    | Netlify (Free/Starter)           | Perfect for Astro, great DX                         |

### Architecture

```
┌─────────────────────────────────────────┐
│         Insightful Health Frontend        │
│  (Astro + Tailwind CSS - SSG/Hybrid)   │
└────────────┬────────────────────────────┘
             │
             ├─→ Netlify CDN (Static pages)
             ├─→ Netlify Functions (API calls)
             └─→ PocketBase API
                  │
                  ├─→ SQLite Database
                  ├─→ OAuth Providers
                  ├─→ MailerLite API
                  └─→ Google Analytics
```

### Performance Targets

| Metric                             | Target             | Monitoring              |
| ---------------------------------- | ------------------ | ----------------------- |
| **First Contentful Paint (FCP)**   | < 2.5s             | Lighthouse CI           |
| **Largest Contentful Paint (LCP)** | < 4s               | Web Vitals              |
| **Cumulative Layout Shift (CLS)**  | < 0.1              | Web Vitals              |
| **Time to Interactive (TTI)**      | < 4s               | Lighthouse              |
| **Bundle Size (JS)**               | < 100KB (gzipped)  | Webpack Bundle Analyzer |
| **Bundle Size (CSS)**              | < 50KB (gzipped)   | Tailwind Optimization   |
| **Image Optimization**             | Auto-optimized     | Sharp plugin            |
| **Caching**                        | 30 days for static | Netlify headers         |

### Scalability

| Milestone  | Users | Expected Date | Infrastructure                        |
| ---------- | ----- | ------------- | ------------------------------------- |
| **Launch** | 50    | Month 1       | Netlify Free Tier                     |
| **Growth** | 200   | Month 3       | Netlify Free → Pro                    |
| **Scale**  | 1000  | Month 12      | Netlify Pro + PocketBase Optimization |

**Scaling Strategy:**

- Static site generation reduces server load
- CDN caching with Netlify
- Database optimization (indexing on frequently queried fields)
- Image optimization and lazy loading
- Rate limiting (5 API calls/second/IP)

### Security Specifications

| Requirement          | Implementation                              | Testing                    |
| -------------------- | ------------------------------------------- | -------------------------- |
| **HTTPS/SSL**        | Netlify auto-SSL, enforced redirects        | Monthly SSL labs test      |
| **Authentication**   | JWT tokens with 7-day expiration            | Penetration testing        |
| **Password Hashing** | bcrypt (PocketBase default)                 | PocketBase docs            |
| **CSRF Protection**  | Token validation on form submissions        | Manual testing             |
| **XSS Prevention**   | HTML sanitization, CSP headers              | OWASP checks               |
| **SQL Injection**    | Parameterized queries via PocketBase        | Code review                |
| **Rate Limiting**    | 5 API calls/second/IP                       | Load testing               |
| **Encryption**       | TLS 1.2+ for data in transit                | SSL certificate validation |
| **GDPR Compliance**  | Privacy policy, data export, deletion tools | Legal review               |

---

## 📊 Database Schema

### Collections (Tables)

#### 1. **Users**

```typescript
{
  id: string (primary key),
  email: string (unique),
  username: string (unique),
  password_hash: string (bcrypt),
  full_name: string,
  bio: string,
  profile_image_url: string,
  social_links: {
    twitter?: string,
    linkedin?: string,
  },
  role: "user" | "author" | "admin",
  is_banned: boolean,
  ban_reason: string,
  created_at: timestamp,
  updated_at: timestamp,
}
```

#### 2. **Posts**

```typescript
{
  id: string (primary key),
  author_id: string (foreign key → Users),
  title: string,
  slug: string (unique, auto-generated),
  excerpt: string,
  content: string (HTML),
  featured_image_url: string,
  status: "draft" | "published" | "deleted",
  is_featured: boolean,
  category_id: string (foreign key → Categories),
  tags: string[],
  seo_title: string,
  seo_description: string,
  seo_keywords: string[],
  canonical_url: string,
  og_image_url: string,
  view_count: number (default: 0),
  like_count: number (default: 0),
  comment_count: number (default: 0),
  reading_time_minutes: number,
  published_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp,
  deleted_at: timestamp,
}
```

#### 3. **Comments**

```typescript
{
  id: string (primary key),
  post_id: string (foreign key → Posts),
  author_id: string (foreign key → Users, nullable for anonymous),
  parent_comment_id: string (nullable, for nested replies),
  content: string,
  status: "pending" | "approved" | "rejected" | "spam",
  is_edited: boolean,
  edited_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp,
}
```

#### 4. **Likes**

```typescript
{
  id: string (primary key),
  post_id: string (foreign key → Posts),
  user_id: string (foreign key → Users, nullable for anonymous),
  ip_address: string (for anonymous tracking),
  created_at: timestamp,
  unique_constraint: (post_id, user_id) OR (post_id, ip_address)
}
```

#### 5. **PostVersions** (Admin Only)

```typescript
{
  id: string (primary key),
  post_id: string (foreign key → Posts),
  version_number: number,
  title: string,
  content: string (HTML),
  changed_by: string (foreign key → Users),
  change_summary: string,
  created_at: timestamp,
}
```

#### 6. **Categories**

```typescript
{
  id: string (primary key),
  name: string (unique),
  slug: string (unique),
  description: string,
  post_count: number,
  created_at: timestamp,
}
```

#### 7. **Tags**

```typescript
{
  id: string (primary key),
  name: string (unique),
  slug: string (unique),
  post_count: number,
  created_at: timestamp,
}
```

#### 8. **Analytics**

```typescript
{
  id: string (primary key),
  post_id: string (foreign key → Posts),
  user_id: string (nullable, foreign key → Users),
  session_id: string,
  event_type: "view" | "comment" | "like" | "search",
  referrer: string,
  user_agent: string,
  ip_address: string,
  created_at: timestamp,
}
```

#### 9. **RateLimitTracker** (Internal)

```typescript
{
  id: string (primary key),
  user_id: string (foreign key → Users),
  action_type: "comment" | "api_call",
  count: number,
  window_start: timestamp,
  window_end: timestamp,
}
```

### Database Relationships

```
Users (1) ──→ (M) Posts
Users (1) ──→ (M) Comments
Posts (1) ──→ (M) Comments
Posts (1) ──→ (M) Likes
Posts (1) ──→ (M) PostVersions
Posts (1) ──→ (M) Analytics
Categories (1) ──→ (M) Posts
Tags (M) ──→ (M) Posts (junction table)
```

### Indexing Strategy

### prd

```sql
-- For optimal query performance

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Posts
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);

-- Comments
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Likes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Analytics
CREATE INDEX idx_analytics_post_id ON analytics(post_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
```

---

## 📄 Page Structure & Routing

### Public Pages

| Route              | Template                | Purpose                           | Auth Required |
| ------------------ | ----------------------- | --------------------------------- | ------------- |
| `/`                | `index.astro`           | Homepage with featured posts      | No            |
| `/posts`           | `posts.astro`           | All posts with filters/pagination | No            |
| `/post/[slug]`     | `post/[slug].astro`     | Individual blog post              | No            |
| `/archive`         | `archive.astro`         | Posts by date (year/month)        | No            |
| `/search`          | `search.astro`          | Global search                     | No            |
| `/author/[slug]`   | `author/[slug].astro`   | Author profile & posts            | No            |
| `/category/[slug]` | `category/[slug].astro` | Posts by category                 | No            |
| `/tag/[slug]`      | `tag/[slug].astro`      | Posts by tag                      | No            |
| `/privacy`         | `privacy.astro`         | Privacy policy                    | No            |
| `/terms`           | `terms.astro`           | Terms of service                  | No            |
| `/accessibility`   | `accessibility.astro`   | Accessibility statement           | No            |

### Authentication Pages

| Route                   | Purpose             | Auth Required |
| ----------------------- | ------------------- | ------------- |
| `/auth/login`           | Login page          | No            |
| `/auth/signup`          | Registration page   | No            |
| `/auth/forgot-password` | Password reset      | No            |
| `/auth/reset-password`  | Password reset form | No            |

### Protected User Pages

| Route                       | Purpose          | Auth Required | Role                |
| --------------------------- | ---------------- | ------------- | ------------------- |
| `/dashboard/profile`        | User profile     | Yes           | User, Author, Admin |
| `/dashboard/posts`          | Author's posts   | Yes           | Author, Admin       |
| `/dashboard/create-post`    | New post editor  | Yes           | Author, Admin       |
| `/dashboard/edit-post/[id]` | Edit post        | Yes           | Author, Admin       |
| `/dashboard/analytics`      | Author analytics | Yes           | Author, Admin       |

### Admin-Only Pages

| Route              | Purpose            | Auth Required | Role  |
| ------------------ | ------------------ | ------------- | ----- |
| `/admin/dashboard` | Admin overview     | Yes           | Admin |
| `/admin/users`     | User management    | Yes           | Admin |
| `/admin/posts`     | Post management    | Yes           | Admin |
| `/admin/comments`  | Comment moderation | Yes           | Admin |
| `/admin/analytics` | Platform analytics | Yes           | Admin |
| `/admin/settings`  | Platform settings  | Yes           | Admin |

### Sitemap & SEO

- Auto-generated sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- Structured data (JSON-LD) on all pages
- Meta tags on every page

---

## 🎨 Design System

### Color Palette (Healthcare-Themed, Accessible)

#### Primary Colors

- **Emerald Green:** `#10b981` - Primary action, trust, health
  - Light: `#d1fae5` | Regular: `#6ee7b7` | Dark: `#059669`
- **Slate Gray:** `#475569` - Text, neutrals
  - Light: `#f1f5f9` | Dark: `#0f172a`

#### Secondary Colors

- **Amber:** `#f59e0b` - Alerts, warnings
- **Red:** `#ef4444` - Errors, destructive actions
- **Blue:** `#3b82f6` - Links, secondary actions

### Typography

#### Font Stack

```css
/* Sans Serif (Headlines, Body) */
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif

/* Serif (Optional for quotes) */
'Georgia', 'Times New Roman', serif

/* Monospace (Code blocks) */
'Monaco', 'Courier New', monospace
```

#### Scale

```
h1: 3.75rem (60px) / 1
h2: 3rem (48px) / 1.2
h3: 1.875rem (30px) / 1.3
h4: 1.5rem (24px) / 1.4
h5: 1.25rem (20px) / 1.5
h6: 1rem (16px) / 1.6
body: 1rem (16px) / 1.6
small: 0.875rem (14px) / 1.5
```

### Spacing

- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px

### Components (Tailwind-based)

#### Buttons

```html
<!-- Primary -->
<button
  class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
>
  Action
</button>

<!-- Secondary -->
<button
  class="px-6 py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
>
  Secondary
</button>
```

#### Form Elements

```html
<label class="block text-sm font-medium text-gray-900 mb-2"> Label </label>
<input
  type="text"
  class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
/>
```

#### Cards

```html
<article
  class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
>
  <!-- Content -->
</article>
```

---

## 📱 Mobile Responsiveness

### Breakpoints

- **Mobile (XS):** 320px - 480px
- **Tablet (SM):** 480px - 768px
- **Desktop (MD):** 768px - 1024px
- **Large (LG):** 1024px - 1280px
- **Extra Large (XL):** 1280px+

### Mobile-First Approach

- Design for mobile first, enhance for larger screens
- Touch targets: 44x44px minimum
- Readable text without zoom (16px minimum)
- Single-column layout on mobile

---

## ♿ Accessibility Requirements (WCAG 2.1 AA)

### Compliance Checklist

#### Perceivable

- [ ] Color not sole means of conveying information
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] No content that flashes more than 3 times per second
- [ ] Images have descriptive alt text
- [ ] Videos have captions and audio descriptions

#### Operable

- [ ] All functionality available via keyboard (no keyboard traps)
- [ ] Tab order is logical and meaningful
- [ ] Focus indicator clearly visible
- [ ] No automatic page refreshes or redirects
- [ ] Skip to main content link
- [ ] Links have descriptive text ("click here" vs "read article about COVID-19")

#### Understandable

- [ ] Page language specified in HTML
- [ ] Form labels clearly associated with inputs
- [ ] Error messages are specific and helpful
- [ ] Consistent navigation across pages
- [ ] Readability: Flesch-Kincaid grade level 8-10
- [ ] Abbreviations and acronyms defined on first use

#### Robust

- [ ] Valid HTML (W3C validation)
- [ ] Proper semantic HTML (headings, lists, etc.)
- [ ] ARIA labels where semantic HTML insufficient
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Form controls properly labeled

### Testing Tools

- Axe DevTools (automated)
- WAVE (accessibility checker)
- NVDA / JAWS (screen reader testing)
- Lighthouse (accessibility audit)
- Manual keyboard testing

---

## 🚀 Feature Implementation Details

### Authentication Flow

```
User → /auth/login → OAuth Redirect → Provider → Callback → JWT Token → Session
                    Email/Password → PocketBase → JWT Token → Session
```

**Implementation Notes:**

- Use PocketBase built-in OAuth support
- Store JWT in httpOnly cookie (secure)
- 7-day token expiration
- Refresh token rotation

### Comment Moderation Workflow

```
User submits comment
    ↓
System checks rate limit (5/day)
    ↓
Comment saved with status "pending"
    ↓
Admin notified (dashboard UI)
    ↓
Admin reviews/approves/rejects
    ↓
User notified (optional, no email notification per spec)
    ↓
Comment displayed if approved
```

### Search Implementation

```
User types query
    ↓
Client-side debounce (300ms)
    ↓
API call to /api/search
    ↓
PocketBase filters posts by:
  - Title contains query
  - Content contains query (if indexed)
  - Tags match query
    ↓
Results returned with highlighting
    ↓
Display to user with pagination
```

### Analytics Tracking

**Events tracked:**

- Post view (once per session per post)
- Like/unlike (only count increment)
- Comment posted (approved comments only)
- Search query
- Author page visit
- Category/tag page visit

**Implementation:**

- Server-side tracking via PocketBase API
- Google Analytics 4 integration
- Anonymous tracking via IP + session ID

---

## 📈 SEO Strategy

### On-Page SEO

1. **Semantic HTML:** Proper heading structure, semantic tags
2. **Meta Tags:** Title (60 chars), description (160 chars), canonical
3. **Open Graph:** og:title, og:description, og:image, og:url
4. **Twitter Card:** twitter:card, twitter:title, twitter:description
5. **Structured Data:** JSON-LD for Article, Author, BreadcrumbList
6. **Keywords:** Primary + 3-5 secondary per post
7. **Links:** Internal links, descriptive anchor text
8. **Images:** Optimized, compressed, descriptive alt text

### Technical SEO

1. **Sitemap:** Auto-generated, submitted to search engines
2. **Robots.txt:** Allow search engines, disallow admin
3. **Canonical URLs:** Prevent duplicate content issues
4. **Mobile Responsive:** 100% mobile-optimized
5. **Page Speed:** 2-3s load time (Core Web Vitals)
6. **SSL:** HTTPS enforced site-wide
7. **Structured Data:** Validate with Google's Rich Results test

### Content SEO

1. **Keyword Research:** Use SEMrush, Ahrefs for keyword ideas
2. **Content Length:** 1500+ words for better ranking
3. **Freshness:** Encourage regular updates (indicate "Updated on" date)
4. **Readability:** Flesch-Kincaid grade 8-10
5. **Internal Linking:** Link to related posts (3-5 per post)

---

## 🔐 Data Privacy & Compliance

### GDPR Compliance

- **Privacy Policy:** Clear, accessible privacy policy
- **Data Export:** Users can download their data
- **Right to Deletion:** Users can request account deletion (GDPR Art. 17)
- **Cookie Consent:** Transparent cookie disclosure
- **Data Retention:** Clear retention policy (e.g., 2 years for analytics)

### Security Measures

- **HTTPS Enforced:** All traffic over TLS 1.2+
- **Password Security:** bcrypt hashing, no plaintext storage
- **Session Security:** httpOnly cookies, CSRF tokens
- **Input Validation:** Server-side validation on all inputs
- **Rate Limiting:** 5 API calls per second per IP
- **XSS Prevention:** HTML sanitization, CSP headers

---

## 📦 Deployment & DevOps

### Netlify Deployment

1. **Repository:** GitHub
2. **Build Command:** `npm run build`
3. **Publish Directory:** `dist`
4. **Environment Variables:** Set in Netlify dashboard
5. **Auto-Deploy:** On push to main branch
6. **Preview Deploys:** On all pull requests
7. **SSL:** Auto-provisioned, Let's Encrypt

### Environment Variables

```
# Public (visible in client)
PUBLIC_SITE_URL=https://insightfulhealth.com
PUBLIC_POCKETBASE_URL=https://api.insightfulhealth.com
PUBLIC_GA_ID=G-XXXXXXXXXX

# Private (server-side only)
PRIVATE_POCKETBASE_ADMIN_EMAIL=admin@insightfulhealth.com
PRIVATE_POCKETBASE_ADMIN_PASSWORD=xxxxxxxxxxxxx
PRIVATE_MAILERLITE_API_KEY=xxxxxxxxxxxxx
PRIVATE_GITHUB_OAUTH_ID=xxxxxxxxxxxxx
PRIVATE_GITHUB_OAUTH_SECRET=xxxxxxxxxxxxx
PRIVATE_GOOGLE_OAUTH_ID=xxxxxxxxxxxxx
PRIVATE_GOOGLE_OAUTH_SECRET=xxxxxxxxxxxxx
PRIVATE_FACEBOOK_OAUTH_ID=xxxxxxxxxxxxx
PRIVATE_FACEBOOK_OAUTH_SECRET=xxxxxxxxxxxxx
```

### CI/CD Pipeline

- **Linting:** ESLint on every commit
- **Build Check:** Verify build succeeds
- **Lighthouse CI:** Performance/accessibility checks
- **Deploy Preview:** Preview URL on PR
- **Production Deploy:** Auto-deploy to main

---

## 📊 Success Metrics & KPIs

### User Metrics

- Monthly Active Users (MAU): Target 1000 by month 12
- User Growth Rate: 15-20% MoM
- User Retention: 60% month-over-month
- Daily Active Users (DAU): 20-30% of MAU

### Content Metrics

- Posts Published: 50+ per month by month 6
- Avg. Post Views: 500+ views in first week
- Engagement Rate: 5-10% (likes + comments / views)
- Avg. Comments per Post: 2-3
- Bounce Rate: < 40%

### Technical Metrics

- Page Load Time: 2-3 seconds (FCP)
- Lighthouse Score: 90+ (all metrics)
- Uptime: 99.9%
- Error Rate: < 0.1%

### Business Metrics

- Newsletter Signups: 20% of visitors
- Author Satisfaction: 8/10 rating
- Support Response Time: < 24 hours
- Community Engagement: 500+ comments/month

---

## 🤖 AI-Copilot Implementation Guide

See [COPILOT_INSTRUCTIONS.md](./COPILOT_INSTRUCTIONS.md) for detailed prompts optimized for AI tools like Cursor, GitHub Copilot, and Claude.

### Quick Implementation Prompts

1. **Setup Instructions:** "Create Astro project with Tailwind CSS, healthcare-themed colors, and global layout"
2. **Database Setup:** "Create PocketBase collections and relationships for Insightful Health"
3. **Authentication:** "Implement OAuth with GitHub, Google, Facebook using PocketBase"
4. **Blog Features:** "Build blog post creation, editing, SEO metadata, and publishing features"
5. **Comments:** "Implement nested comments with admin moderation and rate limiting"
6. **Admin Dashboard:** "Create admin dashboard for content management and moderation"
7. **Analytics:** "Set up post analytics, author dashboard, and Google Analytics integration"
8. **Newsletter:** "Integrate MailerLite newsletter signup form"
9. **Performance:** "Optimize images, implement lazy loading, and Core Web Vitals"
10. **Accessibility:** "Audit and fix WCAG 2.1 AA accessibility issues"

---

## 📋 Acceptance Criteria Summary

All features must meet these criteria before production release:

### Functional Requirements

- [ ] All core features implemented and tested
- [ ] Authentication works (OAuth + email)
- [ ] Blog CRUD operations functional
- [ ] Comments with moderation working
- [ ] Search functionality operational
- [ ] Analytics dashboard populated

### Performance Requirements

- [ ] Page load time 2-3 seconds
- [ ] Lighthouse scores 90+
- [ ] Mobile responsive on all breakpoints
- [ ] Images optimized and lazy-loaded

### Accessibility Requirements

- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility confirmed
- [ ] Color contrast ratios validated

### Security Requirements

- [ ] HTTPS enforced site-wide
- [ ] OAuth configured and tested
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] XSS and CSRF protections in place

### SEO Requirements

- [ ] Meta tags on all pages
- [ ] Sitemap generated and valid
- [ ] Structured data implemented
- [ ] Mobile-friendly verified

---

## 🔄 Future Enhancements (Post-Launch)

### Phase 2 (Month 6)

- [ ] Scheduled posts (publish at specific time)
- [ ] Draft sharing for collaboration
- [ ] Reader bookmarks/save posts
- [ ] Social sharing buttons
- [ ] Advanced analytics (heatmaps, scroll depth)

### Phase 3 (Month 12)

- [ ] Paywalled content / subscription model
- [ ] Reader discussions/forum
- [ ] Podcast integration
- [ ] Email digest (daily/weekly)
- [ ] Dark mode support

### Phase 4 (Beyond)

- [ ] Sponsored content / ads
- [ ] Author earnings/monetization
- [ ] AI-powered content recommendations
- [ ] Multi-language support
- [ ] Mobile app (iOS/Android)

---

## 📞 Support & Contact

### Getting Help

- **Documentation:** See `README.md` and `COPILOT_INSTRUCTIONS.md`
- **Database Schema:** See `DATABASE.md`
- **API Reference:** See `API_GUIDE.md`
- **Component Library:** See `COMPONENTS.md`

### Project Contacts

- **Product Owner:** [Your Name]
- **Development Lead:** AI Copilot
- **Support Email:** support@insightfulhealth.com

---

## 📄 Document Control

| Version | Date         | Author       | Changes     |
| ------- | ------------ | ------------ | ----------- |
| 1.0     | Dec 25, 2025 | Product Team | Initial PRD |

---

**Document Status:** ✅ Ready for Development  
**Last Reviewed:** December 25, 2025  
**Next Review:** Post-Launch (Month 6)

---

_This PRD was created for use with AI Copilots (Cursor, GitHub Copilot, Claude) to guide complete development of the Insightful Health platform._
