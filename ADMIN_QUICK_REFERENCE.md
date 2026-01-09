# Admin Features Quick Reference Guide

Quick guide for using the admin dashboard features.

---

## 🔐 Accessing Admin Panel

**URL:** `/admin`

**Requirements:**
- Must be logged in
- Must have `admin` role

**First Time Setup:**
1. Create admin user in PocketBase
2. Set `role` field to `admin`
3. Log in to the site
4. Navigate to `/admin`

---

## 📊 Admin Dashboard

### Overview Stats
- **Total Users** - All registered users
- **Total Posts** - Published posts count
- **Pending Comments** - Comments awaiting moderation
- **Views Today** - Page views in last 24 hours

### Quick Links
- User Management
- Post Management
- Comment Moderation
- Analytics
- Settings
- **Audit Log** - View all admin actions

### Recent Activity Feed
- Shows last 10 admin actions
- Who performed the action
- What was done
- When it occurred

---

## 👥 User Management (`/admin/users`)

### Search & Filter
```
Search: Username, email, or full name
Filter by Role: Admin, Author, User
Filter by Status: Active, Banned
Sort by: Newest, Oldest, Name (A-Z), Name (Z-A), Email (A-Z), Email (Z-A)
```

### Individual Actions
- **Edit** (pencil icon) - Modify user details
- **Ban/Unban** (slash icon) - Toggle ban status
- **Audit Log** (document icon) - View user's action history

### Bulk Actions
1. Select users using checkboxes
2. Choose action from dropdown:
   - **Ban Selected** - Ban multiple users
   - **Unban Selected** - Unban multiple users
   - **Delete Selected** - Soft delete users
   - **Export Selected** - Download user data as CSV
3. Click "Apply"
4. Confirm action

### User Status Badges
- 🟢 **Active** - User can log in
- 🔴 **Banned** - User cannot log in
- ✓ **Verified** - Email verified

---

## 📝 Post Management (`/admin/posts`)

### Search & Filter
```
Search: Post title
Filter by Status: Draft, Published, Deleted
Filter by Category: All categories
Sort by: Newest, Oldest, Title, Views, Likes
```

### Individual Actions
- **Edit** - Modify post content
- **Publish/Unpublish** - Toggle published status
- **Feature/Unfeature** - Toggle featured status
- **View** - See live post
- **Delete** - Soft delete post

### Bulk Actions
1. Select posts using checkboxes
2. Choose action:
   - **Publish Selected** - Make posts live
   - **Unpublish Selected** - Convert to draft
   - **Feature Selected** - Mark as featured
   - **Unfeature Selected** - Remove featured status
   - **Delete Selected** - Soft delete posts
   - **Export Selected** - Download as CSV
3. Click "Apply"
4. Confirm action

### Post Status Badges
- 📝 **Draft** - Not visible to public
- ✅ **Published** - Live on site
- ⭐ **Featured** - Shown on homepage
- 🗑️ **Deleted** - Soft deleted

---

## 📋 Audit Log (`/admin/audit-log`)

### What Gets Logged
- All admin actions (create, update, delete)
- User management (ban, unban, role changes)
- Post management (publish, feature, delete)
- Comment moderation (approve, reject, spam)

### Viewing Audit Logs

**Filter by Action:**
- Create
- Update
- Delete
- Publish/Unpublish
- Ban/Unban
- Approve/Reject

**Filter by Resource:**
- User
- Post
- Comment
- Category
- Tag

**Each Log Entry Shows:**
- ⏰ **Timestamp** - When action occurred
- 👤 **Admin User** - Who performed it
- 🎯 **Action** - What was done
- 📦 **Resource** - What was affected
- 🔍 **Details** - Before/after changes

### Viewing Details
1. Click "View" button on any log entry
2. See expanded details:
   - Changes (before/after values)
   - Metadata (additional context)
   - IP address
   - User agent

### Exporting Audit Logs
1. Click "Export CSV" button
2. Downloads complete audit trail
3. Filename: `audit-log-YYYY-MM-DD.csv`

---

## 🔍 Search Tips

### User Search
```
Search for:
- Username: "john"
- Email: "john@example.com"
- Full name: "John Doe"
```

### Post Search
```
Search for:
- Title: "health"
- Partial matches work
- Case-insensitive
```

### Combined Filters
You can combine search + filters + sort:
```
Example: Search "health" + Filter "Published" + Sort "Views"
Result: Published posts with "health" in title, sorted by views
```

---

## ⚡ Bulk Actions Tips

### Selecting Items
- **Select All** - Checkbox in header row
- **Individual** - Checkboxes in each row
- **Bulk Bar** - Appears when items selected
- **Cancel** - Deselects all items

### Best Practices
1. ✅ Start with small batches (test on 1-2 items)
2. ✅ Double-check selections before applying
3. ✅ Use confirmation dialog to verify action
4. ✅ Check audit log after bulk operations
5. ⚠️ Bulk delete is soft delete (can be restored)

### Bulk Action Results
After bulk action:
- Success count
- Error count
- Error details (if any)
- Option to export results

---

## 🛡️ Security Features

### Permission Layers
1. **Middleware** - Blocks non-admin routes
2. **Page** - Double-checks admin role
3. **API** - Validates permission again

### Audit Trail
- ✅ All actions logged automatically
- ✅ Cannot be deleted (append-only)
- ✅ Shows who, what, when, where (IP)
- ✅ Includes before/after changes

### Soft Deletes
- Users and posts not permanently deleted
- Marked as deleted with timestamp
- Can be restored by admin
- Audit log preserves full history

---

## 📊 Pagination

### Navigation
- **Previous/Next** - Move between pages
- **Page Numbers** - Jump to specific page
- **Current Page** - Highlighted in green
- **Ellipsis (...)** - Indicates skipped pages

### Page Info
```
Showing 1 to 50 of 247 results

Page: [1] 2 3 ... 5
      ^current
```

### Items Per Page
- Users: 50 per page
- Posts: 50 per page
- Audit Logs: 100 per page

---

## 🎯 Common Tasks

### Ban a User
1. Go to `/admin/users`
2. Find user (search if needed)
3. Click ban icon (slash)
4. Confirm action
5. ✅ User banned, logged to audit log

### Feature a Post
1. Go to `/admin/posts`
2. Find post
3. Click feature button (star)
4. ✅ Post featured, appears on homepage

### Review Recent Changes
1. Go to `/admin`
2. Scroll to "Recent Admin Activity"
3. See last 10 actions
4. Click "View All" for full audit log

### Export Users
1. Go to `/admin/users`
2. Select users (or select all)
3. Choose "Export Selected" from bulk actions
4. Click "Apply"
5. ✅ CSV downloads automatically

### Find Who Deleted a Post
1. Go to `/admin/audit-log`
2. Filter: Resource = "Post", Action = "Delete"
3. Find post by ID
4. See who deleted it and when

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check you're logged in
- Verify admin role in user profile
- Clear cookies and re-login

### Bulk Action Fails
- Check individual errors in results
- Verify you have permission
- Try smaller batch size

### Search Returns No Results
- Check spelling
- Try partial match
- Clear filters
- Verify data exists in database

### Pagination Not Working
- Check URL parameters
- Verify total items > items per page
- Clear browser cache

---

## 📞 Developer Notes

### API Endpoints

**User Management:**
```
POST /api/admin/users/[id]/toggle-ban
POST /api/admin/users/bulk-action
```

**Post Management:**
```
POST /api/admin/posts/bulk-action
```

**Audit Log:**
```
GET /api/admin/audit-log/export
```

### Logging Custom Actions

```typescript
import { logAdminAction } from '@/lib/auditLog';

await logAdminAction(
  userId,           // Admin user ID
  'custom_action',  // Action type
  'resource_type',  // What was affected
  'resource_id',    // Specific item ID
  { changes },      // Before/after data
  { metadata },     // Additional context
  request          // Request object
);
```

### Permission Check

```typescript
// In page
if (!user || user.role !== 'admin') {
  return Astro.redirect('/403');
}

// In API
if (!user || user.role !== 'admin') {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 403
  });
}
```

---

## ✅ Feature Checklist

- ✅ User management with search/filter/bulk actions
- ✅ Post management with search/filter/bulk actions
- ✅ Complete audit logging
- ✅ Audit log viewer with filters
- ✅ CSV export for users, posts, audit logs
- ✅ Confirmation dialogs for destructive actions
- ✅ Pagination on all pages
- ✅ Permission enforcement (admin only)
- ✅ Recent activity feed
- ✅ Soft delete (users and posts)

---

**Last Updated:** January 4, 2026  
**Version:** 1.0

For issues or questions, check [ADMIN_FEATURES_IMPLEMENTATION.md](./ADMIN_FEATURES_IMPLEMENTATION.md) for technical details.
