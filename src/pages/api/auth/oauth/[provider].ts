/**
 * GET /api/auth/oauth/{provider}
 * Initiate OAuth flow for a provider using PocketBase's OAuth handling
 * 
 * IMPORTANT: PocketBase generates a unique state and codeVerifier for each OAuth request.
 * These MUST be stored and used on the callback to complete authentication.
 * The redirect goes to our /auth/callback page (not PocketBase's /api/oauth2-redirect)
 * where we complete the flow using authWithOAuth2Code().
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../../lib/pocketbase';
import { isValidProvider } from '../../../../lib/oauth';

export const prerender = false;

export const GET: APIRoute = async ({ params, redirect, cookies, url }) => {
  try {
    const provider = params.provider?.toLowerCase();

    if (!provider || !isValidProvider(provider)) {
      return new Response('Invalid OAuth provider', { status: 400 });
    }

    const pb = getPocketBase();
    console.log(`Initiating OAuth flow for provider: ${provider}`);

    // Get available OAuth providers from PocketBase
    const authMethods = await pb.collection('users').listAuthMethods();

    // Find the specific provider configuration from PocketBase
    const providers = (authMethods as any).oauth2?.providers || [];
    const providerData = providers.find(
      (p: any) => p.name.toLowerCase() === provider
    );

    if (!providerData) {
      return new Response(
        `OAuth provider "${provider}" is not configured in PocketBase`,
        { status: 400 }
      );
    }

    // CRITICAL: Store the state and codeVerifier in cookies
    // These are needed to complete the OAuth flow on callback
    cookies.set('oauth_provider', provider, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    cookies.set('oauth_state', providerData.state, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    cookies.set('oauth_code_verifier', providerData.codeVerifier, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    // Store the intended redirect destination
    const redirectTo = url.searchParams.get('redirect') || '/dashboard';
    cookies.set('oauth_redirect_to', redirectTo, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    // Build the authorization URL
    // The redirect_uri should point to OUR callback page, not PocketBase's
    const appBaseUrl = import.meta.env.PUBLIC_APP_URL || url.origin;
    const redirectUri = `${appBaseUrl}/auth/callback`;
    const authorizationUrl = providerData.authUrl + encodeURIComponent(redirectUri);

    console.log(`\n=== OAuth Debug for ${provider} ===`);
    console.log(`State: ${providerData.state}`);
    console.log(`Code Verifier: ${providerData.codeVerifier}`);
    console.log(`Redirect URI: ${redirectUri}`);
    console.log(`Authorization URL: ${authorizationUrl}`);
    console.log(`=== End OAuth Debug ===\n`);

    // Redirect to OAuth provider
    return redirect(authorizationUrl);
  } catch (error: any) {
    console.error('OAuth initiation error:', error);
    return redirect('/auth/login?error=' + encodeURIComponent('Failed to initiate OAuth login'));
  }
};
