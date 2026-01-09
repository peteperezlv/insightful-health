# Analytics Quick Reference Guide

## 🎯 For Content Authorss

### Accessing Your Analytics

1. Log in to your account
2. Navigate to Dashboard
3. Click "View Analytics" button
4. Or go directly to `/dashboard/analytics`

### What You'll See

- **Total Views:** How many times your posts were viewed
- **Total Likes:** Number of likes across all your posts
- **Total Comments:** Comments on your posts
- **Views Over Time:** Chart showing daily views
- **Device Breakdown:** Mobile vs Desktop readers
- **Top Posts:** Your best performing content
- **Traffic Sources:** Where your readers come from

### Filtering Data

- Use the time period dropdown to view:
  - Last 7 days
  - Last 30 days (default)
  - Last 90 days

---

## 🔧 For Administrators

### Accessing Platform Analytics

1. Log in as admin
2. Go to Admin Dashboard
3. Click "Analytics" card
4. Or go directly to `/admin/analytics`

### Platform Metrics

- **Total Users:** All registered users
- **Total Posts:** All published posts
- **Total Comments:** Approved comments
- **Total Likes:** All likes across the platform
- **Active Users:** Users with recent activity
- **New Content:** Posts and users added this period

### Analytics Features

- **Activity Over Time:** Daily event tracking
- **Events by Type:** View, like, comment, search breakdown
- **Top Posts:** Best performing content
- **Trending Authors:** Most viewed authors
- **Popular Searches:** What users are searching for

---

## 💻 For Developers

### Tracking Events

```typescript
import {
  trackPageView,
  trackSearch,
  trackLike,
  trackComment,
  trackLogin,
  trackSignup,
} from '../lib/analytics';

// Track a page view
await trackPageView(postId);

// Track a search
await trackSearch('covid-19', 25);

// Track a like
await trackLike(postId);

// Track a comment
await trackComment(postId);

// Track user login
await trackLogin();

// Track user signup
await trackSignup();
```

### Custom Event Tracking

```typescript
import { trackEvent } from '../lib/analytics';

await trackEvent('view', {
  postId: 'abc123',
  categoryId: 'xyz789',
  metadata: {
    source: 'newsletter',
    campaign: 'weekly-digest',
  },
});
```

### API Endpoints

#### POST /api/analytics/track

Track an analytics event.

**Request:**

```json
{
  "eventType": "view",
  "postId": "abc123",
  "metadata": {}
}
```

**Response:**

```json
{
  "success": true,
  "id": "event_id"
}
```

#### GET /api/analytics/posts?days=30

Get post analytics (author/admin).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "stats": [
    {
      "postId": "abc123",
      "postTitle": "My Post",
      "views": 150,
      "likes": 25,
      "comments": 10,
      "viewsByDay": { "2026-01-01": 50 },
      "devices": { "mobile": 100, "desktop": 50 },
      "referrers": { "google.com": 75 }
    }
  ],
  "total": 1,
  "days": 30
}
```

#### GET /api/analytics/platform?days=30

Get platform analytics (admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "totals": {
    "users": 1000,
    "posts": 500,
    "comments": 2000,
    "likes": 5000
  },
  "period": {
    "days": 30,
    "newUsers": 50,
    "newPosts": 25,
    "activeUsers": 200,
    "activeSessions": 500
  },
  "events": {
    "byType": { "view": 10000, "like": 500 },
    "byDay": { "2026-01-01": 350 },
    "total": 12000
  },
  "topPosts": [...],
  "trendingAuthors": [...],
  "popularSearches": [...]
}
```

---

## 🔒 Security & Access Control

### Author Analytics

- **Access:** Authors and Admins
- **Data Scope:** Authors see only their own posts
- **Endpoint:** `/dashboard/analytics`
- **API:** `/api/analytics/posts`

### Admin Analytics

- **Access:** Admins only
- **Data Scope:** All platform data
- **Endpoint:** `/admin/analytics`
- **API:** `/api/analytics/platform`

### Event Tracking

- **Access:** Public (anyone can trigger)
- **Rate Limiting:** Not implemented (future)
- **API:** `/api/analytics/track`

---

## 📊 Data Retention

- **Active Data:** Last 6 months retained in full detail
- **Archived Data:** Older data aggregated quarterly
- **Session IDs:** Expire after 24 hours
- **IP Addresses:** Logged for tracking (can be anonymized)

---

## 🌐 Google Analytics Integration

### Setup

1. Get your Google Analytics 4 (GA4) tracking ID
2. Add to `.env` file:
   ```
   PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Restart the server
4. Analytics will automatically track page views

### Events Tracked

- Page views (automatic)
- Custom events (via `trackGAEvent()`)
- User interactions

### Privacy

- Loads only if `PUBLIC_GA_ID` is set
- GDPR-compliant (based on env var)
- Can be disabled by not setting the env var

---

## 🎨 Chart Library

Uses **Chart.js 4.4.0** for visualizations:

- Line charts for time-series data
- Doughnut charts for breakdowns
- Responsive and animated
- Accessible color schemes

---

## 🐛 Troubleshooting

### Analytics Not Loading

1. Check authentication (login required)
2. Verify role (author/admin for dashboards)
3. Check browser console for errors
4. Ensure PocketBase is running
5. Verify `analytics` collection exists

### No Data Showing

1. Check if analytics collection has records
2. Verify time period selection
3. Check if you have any published posts
4. Try expanding time range to 90 days

### Charts Not Rendering

1. Verify Chart.js CDN is loading
2. Check browser console for errors
3. Ensure JavaScript is enabled
4. Try hard refresh (Ctrl+Shift+R)

### API Errors

1. Check authentication token
2. Verify user role permissions
3. Check PocketBase connection
4. Review server logs

---

## 📝 Best Practices

### For Authors

1. Check analytics weekly to track performance
2. Use insights to inform content strategy
3. Monitor top referrers to understand audience sources
4. Compare time periods to see trends

### For Admins

1. Review platform analytics monthly
2. Monitor user growth and engagement
3. Track popular searches to identify content gaps
4. Use trending authors data for feature opportunities

### For Developers

1. Always handle tracking errors gracefully
2. Don't block UI on tracking calls
3. Use try-catch for analytics functions
4. Test tracking in dev environment first
5. Respect user privacy settings

---

## 🚀 Performance Tips

1. **Caching:** Analytics data is fetched on demand, consider caching
2. **Pagination:** Large datasets are already limited in queries
3. **Time Periods:** Shorter periods load faster
4. **Background Processing:** Heavy aggregations happen server-side
5. **CDN:** Chart.js loaded from CDN for faster delivery

---

## 📞 Support

For issues with analytics:

1. Check this guide first
2. Review the implementation report (ANALYTICS_IMPLEMENTATION_REPORT.md)
3. Check browser console for errors
4. Verify PocketBase configuration
5. Review database schema (DATABASE.md)

---

**Last Updated:** January 1, 2026  
**Version:** 1.0
