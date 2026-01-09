/**
 * OAuth Provider Configuration
 * Handles OAuth authentication with GitHub, Google, and Facebook
 */

import crypto from 'crypto';
import { getPocketBase } from './pocketbase';
import type { AstroCookies } from 'astro';
import { setAuthCookie } from './auth';

export type OAuthProvider = 'github' | 'google' | 'facebook';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Get OAuth configuration for a provider
 */
export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  const configs: Record<OAuthProvider, OAuthConfig> = {
    github: {
      clientId: import.meta.env.PRIVATE_OAUTH_GITHUB_CLIENT_ID || '',
      clientSecret: import.meta.env.PRIVATE_OAUTH_GITHUB_CLIENT_SECRET || '',
      redirectUri: import.meta.env.PRIVATE_OAUTH_GITHUB_REDIRECT_URI || '',
    },
    google: {
      clientId: import.meta.env.PRIVATE_OAUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.PRIVATE_OAUTH_GOOGLE_CLIENT_SECRET || '',
      redirectUri: import.meta.env.PRIVATE_OAUTH_GOOGLE_REDIRECT_URI || '',
    },
    facebook: {
      clientId: import.meta.env.PRIVATE_OAUTH_FACEBOOK_APP_ID || '',
      clientSecret: import.meta.env.PRIVATE_OAUTH_FACEBOOK_APP_SECRET || '',
      redirectUri: import.meta.env.PRIVATE_OAUTH_FACEBOOK_REDIRECT_URI || '',
    },
  };

  return configs[provider];
}

/**
 * Get OAuth provider's authorization URL
 * This initiates the OAuth flow by redirecting to the provider
 */
export async function getOAuthAuthUrl(
  provider: OAuthProvider,
  state?: string
): Promise<{ url: string; state: string; codeVerifier: string }> {
  try {
    const pb = getPocketBase();
    
    // Get available OAuth providers from PocketBase
    const authMethods = await pb.collection('users').listAuthMethods();
    
    // Find the specific provider
    // Note: PocketBase v0.20+ uses oauth2.providers structure
    const providers = (authMethods as any).oauth2?.providers || (authMethods as any).authProviders || [];
    const providerData = providers.find(
      (p: any) => p.name.toLowerCase() === provider
    );

    if (!providerData) {
      throw new Error(`OAuth provider "${provider}" is not configured in PocketBase`);
    }

    // PocketBase v0.20+ generates OAuth URL with redirect_uri parameter but no value
    // We need to append the actual redirect URI
    const redirectUri = `${import.meta.env.PUBLIC_POCKETBASE_URL}/api/oauth2-redirect`;
    const completeUrl = providerData.authUrl + encodeURIComponent(redirectUri);
    
    
    return {
      url: completeUrl,
      state: providerData.state,
      codeVerifier: providerData.codeVerifier,
    };
  } catch (error) {
    console.error(`Error getting OAuth URL for ${provider}:`, error);
    throw error;
  }
}

/**
 * Build OAuth URL parameters
 */
function buildAuthUrlParams(
  codeVerifier: string,
  state: string,
  provider: OAuthProvider
): string {
  const config = getOAuthConfig(provider);
  const params = new URLSearchParams({
    state,
    redirect_uri: config.redirectUri,
  });

  // Add PKCE parameters if supported
  if (codeVerifier) {
    const codeChallenge = generateCodeChallenge(codeVerifier);
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  return '&' + params.toString();
}

/**
 * Handle OAuth callback and authenticate user
 */
export async function handleOAuthCallback(
  provider: OAuthProvider,
  code: string,
  codeVerifier: string,
  cookies: AstroCookies
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const pb = getPocketBase();
    
    // Authenticate with OAuth provider using the authorization code
    const authData = await pb.collection('users').authWithOAuth2Code(
      provider,
      code,
      codeVerifier,
      getOAuthConfig(provider).redirectUri
    );

    if (!authData || !authData.token) {
      return {
        success: false,
        error: 'Failed to authenticate with OAuth provider',
      };
    }

    // Set auth cookie
    setAuthCookie(cookies, authData.token);

    return {
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        username: authData.record.username,
        fullName: authData.record.name || authData.record.fullName,
        role: authData.record.role,
        verified: authData.record.verified,
        avatar: authData.record.avatar,
      },
    };
  } catch (error: any) {
    console.error(`OAuth callback error for ${provider}:`, error);
    return {
      success: false,
      error: error.message || 'OAuth authentication failed',
    };
  }
}

/**
 * Generate random string for state parameter
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate PKCE code challenge from verifier
 */
export function generateCodeChallenge(verifier: string): string {
  // Create SHA256 hash of verifier and encode as base64url
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: OAuthProvider): string {
  const names: Record<OAuthProvider, string> = {
    github: 'GitHub',
    google: 'Google',
    facebook: 'Facebook',
  };
  return names[provider];
}

/**
 * Get provider icon/color
 */
export function getProviderStyle(provider: OAuthProvider): { icon: string; color: string } {
  const styles: Record<OAuthProvider, { icon: string; color: string }> = {
    github: {
      icon: 'github',
      color: 'bg-gray-800 hover:bg-gray-900',
    },
    google: {
      icon: 'google',
      color: 'bg-red-600 hover:bg-red-700',
    },
    facebook: {
      icon: 'facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
  };
  return styles[provider];
}

/**
 * Validate OAuth provider
 */
export function isValidProvider(provider: string): provider is OAuthProvider {
  return ['github', 'google', 'facebook'].includes(provider);
}
