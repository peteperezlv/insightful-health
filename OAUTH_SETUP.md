# OAuth Authentication Setup Guide

## ✅ Implementation Complete

OAuth authentication has been implemented for GitHub, Google, and Facebook providers.

---

## 🎯 What Was Built

### OAuth Utilities

- [oauth.ts](c:\AI Development\VSCode\PRD-Driven-Copilot\src\lib\oauth.ts) - Provider configuration and OAuth flow handling

### API Endpoints

- `/api/auth/oauth/{provider}` - Initiates OAuth flow (GET request)

### Pages

- [callback.astro](c:\AI Development\VSCode\PRD-Driven-Copilot\src\pages\auth\callback.astro) - OAuth callback handler
- Updated [login.astro](c:\AI Development\VSCode\PRD-Driven-Copilot\src\pages\auth\login.astro) - Added OAuth provider buttons
- Updated [signup.astro](c:\AI Development\VSCode\PRD-Driven-Copilot\src\pages\auth\signup.astro) - Added OAuth provider buttons

---

## 🔧 PocketBase OAuth Setup

Before OAuth will work, you need to configure each provider in PocketBase Admin UI.

### 1. Access PocketBase Admin

Visit: http://localhost:8090/\_/

### 2. Configure OAuth Providers

#### GitHub OAuth Setup

1. **Create GitHub OAuth App**:

   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in:
     - Application name: `Insightful Health (Local Dev)`
     - Homepage URL: `http://localhost:4321`
     - Authorization callback URL: `http://localhost:4321/auth/callback`
   - Click "Register application"
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

2. **Configure in PocketBase**:
   **Deprecated**
   // - In PocketBase Admin, go to **Settings** → **Auth providers**
   // - Find **GitHub** and click **Enable**
   **Current Method**
   - In PocketBase Admin, go to **Users** table -> Settings -> Options
   - Enable OAUTH -> Add Provider -> Select GitHub
   - Enter:
     - Client ID: (from GitHub)
     - Client Secret: (from GitHub)
   - Click **Save**

#### Google OAuth Setup

1. **Create Google OAuth App**:

   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Configure consent screen if prompted
   - Application type: **Web application**
   - Name: `Insightful Health (Local Dev)`
   - Authorized JavaScript origins: `http://localhost:4321`
   - http://localhost:8090/api/oauth2-redirect (for PocketBase)
   - Authorized redirect URIs: `http://localhost:4321/auth/callback`
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**

2. **Configure in PocketBase**:
   - In PocketBase Admin, go to **Settings** → **Auth providers**
   - Find **Google** and click **Enable**
   - Enter:
     - Client ID: (from Google)
     - Client Secret: (from Google)
   - Click **Save**

#### Facebook OAuth Setup

1. **Create Facebook App**:

   - Go to https://developers.facebook.com/apps/
   - Click **Create App**
   - Enter App Name and email info -> next
   - Select Authenticate and request datea from users with facebook option -->
   - Select I don't want to connect to busines portfoio yet. --> next
   - Go to --> Dashboard
   - Go to Use Cases and select default
   - Select Settings
   -
   - Select **Consumer** app type
   - Fill in app details
   - Go to **Settings** → **Basic**
   - Copy **App ID** and **App Secret**
   - Add platform: **Website**
   - Site URL: `http://localhost:4321`
   - Go to **Facebook Login** → **Settings**
   - Valid OAuth Redirect URIs: `http://localhost:4321/auth/callback`
   - Click **Save Changes**

2. **Configure in PocketBase**:
   - In PocketBase Admin, go to **Settings** → **Auth providers**
   - Find **Facebook** and click **Enable**
   - Enter:
     - Client ID: (App ID from Facebook)
     - Client Secret: (App Secret from Facebook)
   - Click **Save**

---

## 🔐 Environment Variables

Update your `.env.local` file with the OAuth credentials:

```env
# OAuth Credentials - GitHub (local development)
PRIVATE_OAUTH_GITHUB_CLIENT_ID=your_github_client_id_here
PRIVATE_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret_here
PRIVATE_OAUTH_GITHUB_REDIRECT_URI=http://localhost:4321/auth/callback

# OAuth Credentials - Google (local development)
PRIVATE_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
PRIVATE_OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
PRIVATE_OAUTH_GOOGLE_REDIRECT_URI=http://localhost:4321/auth/callback

# OAuth Credentials - Facebook (local development)
PRIVATE_OAUTH_FACEBOOK_APP_ID=your_facebook_app_id_here
PRIVATE_OAUTH_FACEBOOK_APP_SECRET=your_facebook_app_secret_here
PRIVATE_OAUTH_FACEBOOK_REDIRECT_URI=http://localhost:4321/auth/callback
```

**Note**: These environment variables are used by the application but the actual OAuth configuration happens in PocketBase Admin UI.

---

## 🔄 OAuth Flow

### User Journey

1. **Initiate OAuth**:

   - User clicks "Login with GitHub/Google/Facebook" button
   - Request sent to `/api/auth/oauth/{provider}`
   - CSRF state token generated and stored in cookie
   - Code verifier generated for PKCE
   - User redirected to provider's authorization page

2. **Provider Authorization**:

   - User logs in to provider (if not already)
   - User authorizes Insightful Health app
   - Provider redirects back to `/auth/callback?code=...&state=...`

3. **Callback Processing**:
   - State parameter validated (CSRF protection)
   - Authorization code exchanged for access token
   - User profile fetched from provider
   - User created/updated in PocketBase
   - Session token generated
   - HttpOnly cookie set
   - User redirected to dashboard

### Security Features

✅ **CSRF Protection**: State parameter validates authenticity  
✅ **PKCE**: Code verifier prevents authorization code interception  
✅ **HttpOnly Cookies**: Session tokens not accessible via JavaScript  
✅ **Short-lived State**: OAuth state expires in 10 minutes  
✅ **Secure Cookies**: HTTPS-only in production

---

## 🧪 Testing OAuth

### Test Locally

1. **Start Services**:

   ```bash
   # Terminal 1: PocketBase
   cd pocketbase
   ./pocketbase serve

   # Terminal 2: Astro
   npm run dev
   ```

2. **Configure PocketBase** (see setup instructions above)

3. **Test Each Provider**:

   **GitHub**:

   - Visit http://localhost:4321/auth/login
   - Click "Sign in with GitHub"
   - Authorize the app
   - Should redirect to dashboard

   **Google**:

   - Visit http://localhost:4321/auth/login
   - Click "Sign in with Google"
   - Select Google account
   - Should redirect to dashboard

   **Facebook**:

   - Visit http://localhost:4321/auth/login
   - Click "Sign in with Facebook"
   - Authorize the app
   - Should redirect to dashboard

4. **Verify**:
   - Check PocketBase Admin → Collections → users
   - User should be created with provider info
   - Dashboard should show user details

---

## 🐛 Troubleshooting

### "OAuth provider not configured in PocketBase"

**Cause**: Provider not enabled in PocketBase Admin  
**Solution**:

1. Go to PocketBase Admin → Settings → Auth providers
2. Enable the provider and add credentials
3. Save and try again

### "Invalid state parameter - possible CSRF attack"

**Cause**: State mismatch or expired OAuth flow  
**Solution**:

- Clear cookies and try again
- Ensure cookies are enabled in browser
- Check that redirect URI matches exactly

### "Failed to initiate OAuth login"

**Cause**: Missing or invalid OAuth credentials  
**Solution**:

1. Verify credentials in PocketBase Admin
2. Check redirect URI matches exactly
3. Ensure provider app is active/published

### Provider shows "Invalid redirect URI"

**Cause**: Redirect URI mismatch  
**Solution**:

- Verify in provider console: `http://localhost:4321/auth/callback`
- No trailing slashes
- Match protocol (http/https) exactly
- For production, use your domain

### User created but not logged in

**Cause**: Session token not saved  
**Solution**:

- Check browser console for errors
- Verify cookies are being set
- Check httpOnly and secure cookie settings

---

## 📋 Success Criteria Checklist

### ✅ Implementation

- [x] OAuth provider configuration utility created
- [x] Login page includes OAuth buttons
- [x] Signup page includes OAuth buttons
- [x] OAuth initiation endpoint created
- [x] OAuth callback handler created
- [x] Session management with cookies
- [x] CSRF protection implemented
- [x] PKCE security implemented

### ✅ Providers

- [x] GitHub OAuth support
- [x] Google OAuth support
- [x] Facebook OAuth support

### ✅ Security

- [x] HttpOnly cookies prevent XSS
- [x] CSRF token validation
- [x] State parameter verification
- [x] Code verifier for PKCE
- [x] Secure cookies in production

### ✅ User Experience

- [x] Clear OAuth buttons with provider icons
- [x] Loading state during redirect
- [x] Success message on callback
- [x] Error handling with helpful messages
- [x] Redirect to dashboard on success

### ⏳ Testing (Requires Provider Setup)

- [ ] GitHub OAuth flow works end-to-end
- [ ] Google OAuth flow works end-to-end
- [ ] Facebook OAuth flow works end-to-end
- [ ] User created in PocketBase
- [ ] Session persists across page loads
- [ ] Logout clears session

---

## 🚀 Next Steps

1. **Configure Providers**:

   - Set up GitHub OAuth app
   - Set up Google OAuth app
   - Set up Facebook OAuth app
   - Add credentials to PocketBase Admin

2. **Test Each Provider**:

   - Test GitHub login
   - Test Google login
   - Test Facebook login

3. **Production Setup**:

   - Create production OAuth apps
   - Update redirect URIs for production domain
   - Set production environment variables
   - Test in production environment

4. **Optional Enhancements**:
   - Add more OAuth providers (Twitter, LinkedIn, etc.)
   - Link multiple OAuth accounts to one user
   - Display OAuth provider in user profile
   - Allow unlinking OAuth accounts

---

## 📚 Resources

- **PocketBase OAuth Docs**: https://pocketbase.io/docs/authentication/#oauth2-integration
- **GitHub OAuth**: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Facebook Login**: https://developers.facebook.com/docs/facebook-login

---

**Implementation Status**: ✅ **CODE COMPLETE** (Testing requires OAuth app setup)  
**Last Updated**: December 27, 2025  
**Prompt**: 3.1 - OAuth Integration
