/**
 * Performance Middleware
 * Adds cache headers and performance optimizations
 */

import type { MiddlewareHandler } from 'astro';
import { getCacheHeaders, getNoCacheHeaders, getStaticAssetHeaders } from './cache';

export const performanceMiddleware: MiddlewareHandler = async ({ request, locals }, next) => {
  const url = new URL(request.url);
  
  // Call the next handler
  const response = await next();
  
  // Don't modify responses that are redirects or errors
  if (response.status >= 300) {
    return response;
  }

  // Create new headers from existing response
  const headers = new Headers(response.headers);
  
  // Add cache headers based on route type
  if (url.pathname.startsWith('/api/')) {
    // API routes: no cache by default
    const noCacheHeaders = getNoCacheHeaders();
    Object.entries(noCacheHeaders).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  } else if (
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    // Static assets: 30 days cache
    const staticHeaders = getStaticAssetHeaders();
    Object.entries(staticHeaders).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  } else if (url.pathname === '/' || url.pathname.startsWith('/post/')) {
    // Homepage and posts: 5 minutes cache
    const cacheHeaders = getCacheHeaders(300); // 5 minutes
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  } else {
    // Other pages: 10 minutes cache
    const cacheHeaders = getCacheHeaders(600); // 10 minutes
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  }

  // Add performance headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add ETag for conditional requests
  if (!headers.has('ETag') && response.body) {
    const etag = `W/"${Date.now()}"`;
    headers.set('ETag', etag);
    
    // Check if client has matching ETag
    const clientEtag = request.headers.get('If-None-Match');
    if (clientEtag === etag) {
      return new Response(null, {
        status: 304,
        headers,
      });
    }
  }

  // Return response with updated headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
