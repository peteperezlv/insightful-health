# PocketBase Collections Quick Reference

## Fast Setup (5 minutes)

### 1. Start PocketBase

```bash
pocketbase serve
```

### 2. Import Collections

1. Open http://localhost:8090/\_/
2. Go to Settings → Import Collections
3. Paste contents of `pocketbase-collections.json`
4. Click Import

### 3. Create Admin User

```bash
node scripts/setup-pocketbase.js create-admin
```

### 4. Verify Setup

```bash
node scripts/setup-pocketbase.js verify
```

---

## Collections at a Glance

### 1. **users** (Auth Collection)

- Email/password authentication
- Roles: user, author, admin
- Fields: email, fullName, bio, profileImageUrl, role, isBanned
- **Key Indexes:** email (unique), role, isBanned

### 2. **categories**

- Blog post categories
- Fields: name, slug, description, icon, color, displayOrder
- **Key Indexes:** name (unique), slug (unique)

### 3. **tags**

- Blog post tags
- Fields: name, slug, description
- **Key Indexes:** name (unique), slug (unique)

### 4. **posts**

- Blog articles
- Fields: title, slug, content, status, authorId, categoryId, tags, viewCount, likeCount, commentCount
- Status: draft | published | deleted
- **Key Indexes:** slug (unique), authorId, status+publishedAt, categoryId, viewCount

### 5. **comments**

- Post comments with moderation
- Fields: postId, content, authorId, parentCommentId, status, ipAddress
- Status: pending | approved | rejected | spam
- **Key Indexes:** postId, authorId, status, postId+status

### 6. **likes**

- Post likes (authenticated and anonymous)
- Fields: postId, userId, ipAddress, sessionId
- Prevents duplicates: (postId, userId) and (postId, ipAddress, sessionId)
- **Key Indexes:** postId, userId

### 7. **post_versions**

- Edit history (admin-only)
- Fields: postId, versionNumber, title, content, editedBy, editReason
- **Key Indexes:** postId, editedBy, created DESC

### 8. **analytics**

- Event tracking
- Fields: postId, userId, eventType, ipAddress, sessionId, deviceType, timeOnPage, scrollDepth
- Event Types: view | like | comment | share | search
- **Key Indexes:** postId, eventType, created DESC

---

## Access Control Patterns

### Public Read (Categories, Published Posts)

```
listRule: true
viewRule: true
createRule: @request.auth.role = 'admin'
updateRule: @request.auth.role = 'admin'
deleteRule: @request.auth.role = 'admin'
```

### User Self-Service (Users Profile)

```
viewRule: @request.auth.id = user.id || @request.auth.role = 'admin'
updateRule: @request.auth.id = user.id || @request.auth.role = 'admin'
```

### Moderated Content (Comments)

```
listRule: status = 'approved' || @request.auth.role = 'admin'
createRule: @request.auth.id != ''
```

### Author Only (Posts)

```
updateRule: @request.auth.id = authorId || @request.auth.role = 'admin'
deleteRule: @request.auth.role = 'admin'
```

### Admin Only (Versions, Analytics)

```
listRule: @request.auth.role = 'admin'
viewRule: @request.auth.role = 'admin'
createRule: @request.auth.role = 'admin'
```

---

## Common Queries

### Get published posts with author

```
GET /api/collections/posts/records?filter=status='published'&expand=authorId,categoryId,tags&sort=-publishedAt
```

### Get approved comments for a post

```
GET /api/collections/comments/records?filter=postId='<id>'&&status='approved'&expand=authorId&sort=created
```

### Get likes count for a post

```
GET /api/collections/likes/records?filter=postId='<id>'
```

### Get user's draft posts

```
GET /api/collections/posts/records?filter=authorId='<id>'&&status='draft'&sort=-created
```

### Get analytics for a post

```
GET /api/collections/analytics/records?filter=postId='<id>'&sort=-created
```

### Search posts by title/content

```
GET /api/collections/posts/records?filter=status='published'&&(title~'<query>'||content~'<query>')&sort=-created
```

---

## API Response Examples

### Create Post

```bash
curl -X POST http://localhost:8090/api/collections/posts/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "<p>Hello World</p>",
    "status": "draft",
    "authorId": "<user-id>",
    "authorName": "John Doe",
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0
  }'
```

### Create Comment

```bash
curl -X POST http://localhost:8090/api/collections/comments/records \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "<post-id>",
    "content": "Great article!",
    "authorName": "Jane Doe",
    "authorEmail": "jane@example.com",
    "status": "pending",
    "ipAddress": "192.168.1.1"
  }'
```

### Like a Post

```bash
curl -X POST http://localhost:8090/api/collections/likes/records \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "<post-id>",
    "userId": "<user-id>",
    "ipAddress": "192.168.1.1",
    "sessionId": "session-id-123"
  }'
```

### Track Page View

```bash
curl -X POST http://localhost:8090/api/collections/analytics/records \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "<post-id>",
    "eventType": "view",
    "ipAddress": "192.168.1.1",
    "pageUrl": "http://example.com/posts/my-post",
    "deviceType": "mobile",
    "timeOnPage": 45,
    "scrollDepth": 75
  }'
```

---

## Field Type Reference

| Type      | PocketBase Type    | Notes                     |
| --------- | ------------------ | ------------------------- |
| Text      | `text`             | Short strings, searchable |
| Long Text | `editor` or `text` | Rich HTML content         |
| Email     | `email`            | Email validation          |
| URL       | `url`              | URL validation            |
| Number    | `number`           | Integer or float          |
| Boolean   | `bool`             | True/false                |
| Date      | `date`             | ISO 8601 date             |
| Select    | `select`           | Dropdown options          |
| Relation  | `relation`         | Foreign key reference     |
| JSON      | `json`             | Arbitrary JSON data       |
| File      | `file`             | File upload storage       |

---

## Security Checklist

- ✅ Change default admin password
- ✅ Enable HTTPS for production
- ✅ Set proper access control rules
- ✅ Enable rate limiting
- ✅ Validate input on backend
- ✅ Sanitize HTML content
- ✅ Use environment variables for secrets
- ✅ Enable backup/restore

---

## Performance Tips

1. **Index frequently filtered fields**

   - `status`, `authorId`, `categoryId`, `created`
   - Use composite indexes for common query patterns

2. **Use pagination**

   ```
   /api/collections/posts/records?page=1&perPage=20
   ```

3. **Expand relations wisely**

   ```
   /api/collections/posts/records?expand=authorId  # Only what you need
   ```

4. **Archive old analytics**

   - Delete analytics records > 6 months old
   - Implement monthly cleanup job

5. **Cache static collections**
   - Categories and tags rarely change
   - Cache in frontend for performance

---

## Troubleshooting

| Problem                     | Solution                                                       |
| --------------------------- | -------------------------------------------------------------- |
| Can't connect to PocketBase | Run `pocketbase serve` in project directory                    |
| Import fails                | Check JSON syntax, run through JSON validator                  |
| Collections empty           | Use setup script: `node scripts/setup-pocketbase.js setup-all` |
| Access denied               | Check user role and access control rules                       |
| Slow queries                | Check indexes, use pagination, limit expanded fields           |
| Duplicate key errors        | Use PUT not POST for updates, check unique constraints         |

---

## Useful Links

- **PocketBase Docs:** https://pocketbase.io/docs/
- **API Reference:** https://pocketbase.io/docs/client-side-usage/
- **Filter Syntax:** https://pocketbase.io/docs/api-rules-and-filters/
- **Access Rules:** https://pocketbase.io/docs/api-rules-and-filters/

---

## File Locations

- **Collections JSON:** `pocketbase-collections.json`
- **Setup Script:** `scripts/setup-pocketbase.js`
- **This Reference:** `POCKETBASE_QUICK_REFERENCE.md`
- **Full Setup Guide:** `POCKETBASE_SETUP.md`
