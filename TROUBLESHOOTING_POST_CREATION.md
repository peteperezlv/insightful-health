# Troubleshooting: "Failed to Create Post" Error

**Last Updated:** January 25, 2026

---

## Problem

When attempting to create a new post in production, the following error message is displayed:

```
"failed to create post"
```

---

## Recent Changes Made

### 1. Enhanced Error Logging

Updated the API endpoint to provide more detailed error information:

**File:** `src/pages/api/posts/index.ts`

- Added detailed error logging in the catch block
- Returns error details and debug info in development mode
- Logs error message, status, data, and stack trace

### 2. Improved Frontend Error Display

Updated the create post editor to display detailed errors:

**File:** `src/lib/create-post-editor.ts`

- Enhanced console logging for error responses
- Displays detailed error messages including `error`, `details`, and `debugInfo`
- Better error message composition

### 3. Fixed Post Data Preparation

Updated the `createPost` function to handle optional fields correctly:

**File:** `src/lib/posts.ts`

- Changed from setting empty strings to only including fields with valid values
- Prevents sending empty strings for optional fields that might cause schema validation errors
- Properly handles URL validation for images and canonical URLs

---

## Diagnostic Steps

### Step 1: Check Browser Console

1. Open your production site
2. Open the browser Developer Tools (F12)
3. Go to the **Console** tab
4. Try to create a post
5. Look for console logs starting with `[CREATE POST]`
6. Copy all error messages and details

**What to look for:**

- Authentication errors (401 status)
- Permission errors (403 status)
- Validation errors (400 status)
- Server errors (500 status)
- CSRF token errors
- Detailed error messages in the response

### Step 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Try to create a post
4. Find the request to `/api/posts`
5. Click on it and check:
   - **Headers tab:** Request headers, especially `X-CSRF-Token`
   - **Payload tab:** The data being sent
   - **Response tab:** The server's response

**What to look for:**

- Is the request reaching the server?
- What is the response status code?
- What is the exact error message in the response?
- Is the CSRF token present?
- Is the request payload correctly formatted?

### Step 3: Run Diagnostic Script

Copy and paste this script into the browser console on the create post page:

```javascript
// Load the diagnostic script
const script = document.createElement('script');
script.src = '/scripts/diagnose-post-creation.js';
document.head.appendChild(script);
```

Or manually run the diagnostic tool from the console:

```javascript
// Download and run the diagnostic script from your local files
// See: scripts/diagnose-post-creation.js
```

### Step 4: Check Server Logs

If you have access to the server:

1. SSH into your production server
2. Navigate to the PocketBase data directory
3. Check the logs:
   ```bash
   cd pocketbase/pb_data/logs
   tail -f *.log
   ```
4. Try to create a post
5. Look for error messages in real-time

---

## Common Issues and Solutions

### Issue 1: Authentication Error (401)

**Symptoms:**

- Error message: "Authentication required"
- Response status: 401

**Causes:**

- User session expired
- Cookies not being sent
- CORS issues

**Solutions:**

1. Log out and log back in
2. Check browser cookie settings
3. Verify CORS configuration in PocketBase
4. Check that cookies are being sent with credentials: 'include'

### Issue 2: Permission Error (403)

**Symptoms:**

- Error message: "You do not have permission to create posts"
- Response status: 403

**Causes:**

- User doesn't have author or admin role
- CSRF token mismatch

**Solutions:**

1. Verify user role in the database
2. Update user role to 'author' or 'admin'
3. Refresh the page to get a new CSRF token
4. Check CSRF token validation

### Issue 3: Validation Error (400)

**Symptoms:**

- Error message contains specific validation errors
- Response status: 400

**Common validation errors:**

- "Title is required"
- "Content is required"
- "A post with this slug already exists"
- Field length exceeded

**Solutions:**

1. Check all required fields are filled
2. Verify field lengths don't exceed limits
3. Try a different slug if slug conflict
4. Check for special characters in the slug

### Issue 4: Schema Mismatch

**Symptoms:**

- Error message from PocketBase about missing or invalid fields
- Response status: 400 or 500

**Causes:**

- Production database schema differs from development
- Required fields not being sent
- Wrong field types

**Solutions:**

1. Check the posts collection schema in production PocketBase admin UI
2. Compare required fields between dev and production
3. Verify all required fields are included in the request
4. Check field types match the schema

### Issue 5: Server Error (500)

**Symptoms:**

- Error message: "Failed to create post"
- Response status: 500

**Causes:**

- PocketBase connection issue
- Database error
- Server-side code error

**Solutions:**

1. Check PocketBase is running and accessible
2. Verify database connectivity
3. Check server logs for stack traces
4. Restart PocketBase if necessary

### Issue 6: CORS Error

**Symptoms:**

- Error in console about CORS
- Request blocked by browser

**Causes:**

- PocketBase not configured to allow requests from production domain
- Missing CORS headers

**Solutions:**

1. Add production domain to PocketBase allowed origins
2. Check PocketBase CORS settings
3. Verify the API URL is correct

---

## Field-Specific Issues

### Featured Image URL

**Problem:** Empty or invalid image URLs
**Solution:** The code now only includes `featuredImageUrl` if it's a valid HTTP(S) URL

### Category ID

**Problem:** Empty string sent for categoryId might cause issues
**Solution:** The code now only includes `categoryId` if it has a value

### Tags

**Problem:** Empty array for relation fields might cause issues
**Solution:** Tags field is no longer sent if empty (needs proper tag selection implementation)

### Date Fields

**Problem:** Empty strings for date fields might cause schema errors
**Solution:**

- `publishedAt` only set if status is 'published'
- `scheduledFor` only included if it has a value

### SEO Fields

**Problem:** Empty strings for optional SEO fields
**Solution:** SEO fields (seoTitle, seoDescription, canonicalUrl) only included if they have valid values

---

## Quick Fixes to Try

### Fix 1: Clear Browser Cache

Sometimes stale JavaScript files cause issues:

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache and cookies for the site
3. Try in incognito/private browsing mode

### Fix 2: Verify User Role

Check the user's role in PocketBase admin:

1. Go to PocketBase admin UI: `https://yourdomain.com/_/`
2. Navigate to Users collection
3. Find your user account
4. Verify the `role` field is set to either 'admin' or 'author'

### Fix 3: Test with Minimal Data

Try creating a post with only required fields:

- Title: "Test Post"
- Content: "This is a test."
- Status: "draft"
- Leave everything else empty

### Fix 4: Check PocketBase Version

Ensure PocketBase version is compatible:

```bash
./pocketbase --version
```

---

## Getting More Information

If the issue persists, collect this information:

1. **Browser console logs** (copy all `[CREATE POST]` messages)
2. **Network request/response** (from Network tab)
3. **User role and permissions** (from PocketBase admin)
4. **Server logs** (if accessible)
5. **PocketBase version**
6. **Database schema** (posts collection schema)

With this information, you can:

- File a detailed bug report
- Debug the specific issue
- Identify schema mismatches
- Find permission problems

---

## Code Files Modified

1. `src/pages/api/posts/index.ts` - Enhanced error logging
2. `src/lib/create-post-editor.ts` - Improved error display
3. `src/lib/posts.ts` - Fixed optional field handling
4. `scripts/diagnose-post-creation.js` - Created diagnostic tool

---

## Next Steps

1. **In Production:**
   - Open browser console
   - Try to create a post
   - Copy all error messages
   - Check the Network tab for the API response
2. **Report the Error:**
   - Include the exact error message
   - Include browser console logs
   - Include network request/response details
   - Include your user role

3. **Test Locally:**
   - Try to reproduce the issue in development
   - Compare production and development environments
   - Check for differences in PocketBase configuration

---

## Prevention

To prevent this issue in the future:

1. **Always test in production-like environment** before deploying
2. **Keep database schemas in sync** between environments
3. **Monitor error logs** regularly
4. **Version control database migrations**
5. **Document schema changes** in the codebase

---

## Contact Support

If you continue to experience issues:

1. Collect all diagnostic information above
2. Document the exact steps to reproduce
3. Include browser and OS information
4. Note any recent changes to the system
