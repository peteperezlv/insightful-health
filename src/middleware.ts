/**
 * Astro Middleware
 * Handles authentication, route protection, and user context
 */

import { defineMiddleware, sequence } from 'astro:middleware';
import { getCurrentSession, refreshTokenIfNeeded } from './lib/session';
import { performanceMiddleware } from './lib/performance-middleware';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/create-post', '/settings', '/profile'];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

// Routes that require author or admin role
const AUTHOR_ROUTES = ['/create-post', '/dashboard/create-post', '/dashboard/edit-post', '/dashboard/posts', '/dashboard/analytics'];

// Authentication middleware
const authMiddleware = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect, locals } = context;

  // Refresh token if needed (before checking session)
  await refreshTokenIfNeeded(cookies);

  // Get current user session
  const user = await getCurrentSession(cookies);

  // Debug logging for protected routes
  const isProtectedPath = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route));
  if (isProtectedPath) {
    console.log(`[Middleware] Path: ${url.pathname}`);
    console.log(`[Middleware] User authenticated: ${!!user}`);
    if (user) {
      console.log(`[Middleware] User role: ${user.role || 'user'}`);
    }
  }

  // Add user to locals so it's available in all pages
  locals.user = user;

  // Check if route requires authentication
  const requiresAuth = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route));
  const requiresAdmin = ADMIN_ROUTES.some(route => url.pathname.startsWith(route));
  const requiresAuthor = AUTHOR_ROUTES.some(route => url.pathname.startsWith(route));

  // Redirect to login if authentication required but user not logged in
  if (requiresAuth && !user) {
    return redirect(`/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  // Check admin role
  if (requiresAdmin && user?.role !== 'admin') {
    return redirect('/403'); // Forbidden
  }

  // Check author role
  if (requiresAuthor && user?.role !== 'author' && user?.role !== 'admin') {
    return redirect('/403'); // Forbidden
  }

  // Continue to the page
  return next();
});

// Chain middlewares together: auth first, then performance
export const onRequest = sequence(authMiddleware, performanceMiddleware);
