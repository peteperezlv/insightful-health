# Post Creation Failure - Debugging Tools & Fixes

**Date:** January 25, 2026  
**Issue:** "Failed to create post" error in production  
**Status:** 🔧 Diagnostic tools added, code improvements deployed

---

## Summary

Enhanced error handling and created comprehensive diagnostic tools to help identify and fix the "failed to create post" error occurring in production.

---

## Changes Made

### 1. Enhanced API Error Logging

**File:** `src/pages/api/posts/index.ts`

- Added detailed error logging with error message, status, data, and stack trace
- Returns structured error responses with `error`, `details`, and `debugInfo` fields
- Debug information only shown in development mode for security

### 2. Improved Frontend Error Display

**File:** `src/lib/create-post-editor.ts`

- Enhanced console logging for all API responses
- Displays detailed error messages including technical details
- Better error composition for user-facing messages
- Logs full error context for debugging

### 3. Fixed Post Data Preparation

**File:** `src/lib/posts.ts`

**Key Changes:**

- Changed from sending empty strings to omitting optional fields entirely
- Only includes fields with valid values
- Prevents schema validation errors from empty strings
- Properly validates URLs before including them

**Specific Improvements:**

- `featuredImageUrl`: Only included if valid HTTP(S) URL
- `categoryId`: Only included if has a value (not empty string)
- `seoTitle/seoDescription`: Only included if non-empty
- `canonicalUrl`: Only included if valid HTTP(S) URL
- `publishedAt`: Only set when status is 'published'
- `scheduledFor`: Only included if has a value
- `authorName`: Fallback to 'Unknown Author' if all name fields are empty

---

## New Diagnostic Tools

### 1. Test Page

**File:** `src/pages/test/create-post.astro`  
**URL:** `/test/create-post`

**Features:**

- Quick test form with minimal required fields
- Real-time console output display
- Full diagnostic suite button
- Shows current user info and role
- Copy-paste friendly output

**How to Use:**

1. Navigate to `https://yourdomain.com/test/create-post`
2. Log in if not already authenticated
3. Use the quick test form with defaults OR fill in your own data
4. Click "Test Create Post"
5. Review the console output for detailed logs
6. If it fails, click "Run Full Diagnostic Suite"
7. Copy the output and share it for debugging

### 2. Diagnostic API Endpoint

**File:** `src/pages/api/diagnostic/post-creation.ts`  
**URL:** `/api/diagnostic/post-creation`

**Features:**

- Server-side health checks
- Authentication verification
- Authorization checks (user role)
- PocketBase connection test
- Posts collection access test
- Categories collection check
- Sample data preparation test
- Slug uniqueness validation

**How to Use:**

```bash
# In production
curl https://yourdomain.com/api/diagnostic/post-creation

# Or in browser
fetch('/api/diagnostic/post-creation')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Response Format:**

```json
{
  "timestamp": "2026-01-25T...",
  "summary": {
    "total": 7,
    "passed": 6,
    "warnings": 1,
    "failed": 0,
    "status": "HEALTHY"
  },
  "checks": [
    {
      "name": "Authentication",
      "status": "PASS",
      "message": "User session active"
    },
    ...
  ],
  "issues": [],
  "recommendations": []
}
```

### 3. Browser Diagnostic Script

**File:** `scripts/diagnose-post-creation.js`

**How to Use:**
Run in browser console on the create post page:

```javascript
// Option 1: Load from file
const script = document.createElement('script');
script.src = '/scripts/diagnose-post-creation.js';
document.head.appendChild(script);

// Option 2: Copy and paste the script content directly
```

**What it checks:**

- User authentication status
- CSRF token presence
- PocketBase connection
- Creates a minimal test post
- Reports all issues found

---

## Troubleshooting Steps

### Step 1: Access the Test Page

1. Go to `https://yourdomain.com/test/create-post`
2. Log in with your credentials
3. Verify your user role is shown correctly
4. Click "Test Create Post"
5. Check the console output

### Step 2: Check the Diagnostic API

```bash
# Using curl
curl https://yourdomain.com/api/diagnostic/post-creation

# Or in browser console
fetch('/api/diagnostic/post-creation')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

### Step 3: Review Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Try to create a post from the normal create post page
4. Look for logs starting with `[CREATE POST]`
5. Copy all error messages

### Step 4: Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to create a post
4. Find the POST request to `/api/posts`
5. Check:
   - Request Headers (especially `X-CSRF-Token`)
   - Request Payload
   - Response body
   - Response status code

---

## Common Issues and Quick Fixes

### Issue 1: User Not Authorized

**Symptoms:**

- Error: "You do not have permission to create posts"
- Diagnostic shows role as 'user' or 'reader'

**Fix:**

1. Access PocketBase admin: `https://yourdomain.com/_/`
2. Go to Users collection
3. Find your user
4. Change `role` field to either `admin` or `author`
5. Save and try again

### Issue 2: CSRF Token Missing

**Symptoms:**

- Error: "Invalid CSRF token"
- Diagnostic shows no CSRF token

**Fix:**

1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Log out and log back in
4. Try in incognito mode

### Issue 3: Schema Validation Error

**Symptoms:**

- Error mentions specific fields
- Response status 400

**Fix:**
The code has been updated to only send fields with valid values. If you still see this:

1. Check which field is causing the issue
2. Verify the field exists in your PocketBase posts collection
3. Check if the field type matches
4. Ensure required fields are marked correctly

### Issue 4: PocketBase Connection Failed

**Symptoms:**

- Diagnostic API shows PocketBase connection failed
- Posts don't load anywhere

**Fix:**

1. Check PocketBase is running: `ps aux | grep pocketbase`
2. Restart PocketBase if needed
3. Check firewall settings
4. Verify PocketBase URL in environment variables

---

## Files Modified

### Core Functionality

1. ✅ `src/pages/api/posts/index.ts` - Enhanced error logging
2. ✅ `src/lib/create-post-editor.ts` - Better error display
3. ✅ `src/lib/posts.ts` - Fixed optional field handling

### Diagnostic Tools

4. ✅ `src/pages/test/create-post.astro` - Test page
5. ✅ `src/pages/api/diagnostic/post-creation.ts` - Diagnostic API
6. ✅ `scripts/diagnose-post-creation.js` - Browser diagnostic script

### Documentation

7. ✅ `TROUBLESHOOTING_POST_CREATION.md` - Comprehensive troubleshooting guide
8. ✅ `POST_CREATION_DEBUG_SUMMARY.md` - This file

---

## Next Steps

### Immediate Actions (Production)

1. **Access the test page:**

   ```
   https://yourdomain.com/test/create-post
   ```

2. **Run the diagnostic API:**

   ```bash
   curl https://yourdomain.com/api/diagnostic/post-creation
   ```

3. **Try to create a test post** and capture the output

4. **Share the results:**
   - Console output from test page
   - Diagnostic API response
   - Browser console logs
   - Network tab details

### After Identifying the Issue

Based on what the diagnostics reveal:

- **If authentication issue:** Update user role in PocketBase
- **If CSRF issue:** Clear cache and refresh
- **If schema issue:** Compare dev and prod PocketBase schemas
- **If connection issue:** Check PocketBase service status
- **If validation issue:** Review field values being sent

---

## Deployment Checklist

Before deploying to production:

- [ ] Run tests locally
- [ ] Verify all changes compile without errors
- [ ] Test post creation in local environment
- [ ] Deploy code changes
- [ ] Restart the application
- [ ] Test the `/test/create-post` page
- [ ] Run the diagnostic API
- [ ] Try creating a real post
- [ ] Monitor error logs

---

## Monitoring

After deployment, monitor:

1. **Error logs:** Check for new errors in console
2. **User feedback:** Ask users if they can create posts
3. **Diagnostic endpoint:** Periodically check `/api/diagnostic/post-creation`
4. **PocketBase logs:** Monitor PocketBase for database errors

---

## Support Resources

- **Troubleshooting Guide:** `TROUBLESHOOTING_POST_CREATION.md`
- **Test Page:** `/test/create-post`
- **Diagnostic API:** `/api/diagnostic/post-creation`
- **Browser Script:** `scripts/diagnose-post-creation.js`

---

## Expected Outcomes

After deploying these changes:

1. ✅ More detailed error messages in production
2. ✅ Ability to diagnose issues without accessing server
3. ✅ Reduced schema validation errors
4. ✅ Better handling of optional fields
5. ✅ Clear debugging path for future issues

---

## Questions to Answer

Use the diagnostic tools to answer these questions:

1. **Is the user authenticated?** → Check diagnostic API
2. **Does the user have the right role?** → Check test page user info
3. **Is CSRF token present?** → Check browser console
4. **Is PocketBase accessible?** → Check diagnostic API
5. **What's the exact error message?** → Check console output
6. **What data is being sent?** → Check Network tab payload
7. **What's the server response?** → Check Network tab response

---

## Prevention for Future

To prevent similar issues:

1. Always include detailed error logging
2. Test in production-like environment before deploying
3. Keep dev and prod database schemas in sync
4. Document schema changes
5. Use diagnostic tools regularly
6. Monitor error rates after deployments
