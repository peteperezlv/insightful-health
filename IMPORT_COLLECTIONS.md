# Import PocketBase Collections

## Problem
The `posts` collection doesn't exist in your PocketBase database, causing a 400 error.

## Solution: Import Collections via PocketBase Admin UI

### Method 1: Manual Import via Admin UI (Recommended)

1. **Open PocketBase Admin UI**:
   ```
   http://localhost:8090/_/
   ```

2. **Go to Settings**:
   - Click the "Settings" icon (⚙️) in the left sidebar
   - Click "Import collections"

3. **Import the Schema**:
   - Click "Load from JSON file"
   - Select: `pocketbase-collections.json` from the project root
   - Click "Review" to see what will be imported
   - Click "Confirm and import"

4. **Verify**:
   - Go to "Collections" in the left sidebar
   - You should now see: `posts`, `categories`, `tags`, `users`, `comments`, `likes`, `analytics`

### Method 2: Copy/Paste Individual Collection

If you only need the `posts` collection:

1. Open `pocketbase-collections.json`
2. Find the `posts` collection object (starts around line 361)
3. Copy the entire object from `{` to `}` (includes schema, indexes, etc.)
4. In PocketBase Admin → Collections → "New collection" → "Import"
5. Paste and click "Import"

### What Collections You Need

**Minimum to get started**:
- ✅ `users` (probably already exists)
- ✅ `posts` (REQUIRED for blog functionality)
- ✅ `categories` (you created this)
- ✅ `tags` (you created this)

**Optional for full functionality**:
- `comments` (for comment system)
- `likes` (for like feature)
- `analytics` (for view tracking)

### After Importing

1. **Restart your dev server**: `Ctrl+C` then `npm run dev`
2. **Test creating a post**: Go to `/dashboard/create-post`
3. **Check the posts collection**: PocketBase Admin → Collections → posts

---

## Quick Check: Does posts collection exist?

Run this in your browser console while on any page:

```javascript
fetch('http://localhost:8090/api/collections/posts/records?page=1&perPage=1')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**If it exists**: You'll see `{page: 1, perPage: 1, totalItems: 0, items: []}`
**If it doesn't exist**: You'll see a 404 error

---

## Troubleshooting

### "Collection not found"
- The `posts` collection wasn't imported
- Import it using Method 1 above

### "Invalid filter field"
- The collection exists but has wrong schema
- Re-import using Method 1 to update schema

### "Authentication required"
- Collection exists but has wrong access rules
- Check collection "API Rules" in PocketBase admin
- For development, you can set "List/View rule" to: `@request.auth.id != ""`

---

## After Everything Works

Once posts are creating successfully, you can:
1. Create more categories in PocketBase admin
2. Create more tags
3. Implement proper tag selection in the create post form
4. Implement image upload to external storage (Cloudinary, AWS S3, etc.)
