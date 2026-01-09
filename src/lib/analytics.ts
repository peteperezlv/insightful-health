/**
 * Analytics utility functions for tracking events
 */

// Get or create session ID
function getSessionId(): string {
  const cookieName = 'session_id';
  const cookies = document.cookie.split('; ');
  const existingCookie = cookies.find(row => row.startsWith(cookieName + '='));
  
  if (existingCookie) {
    return existingCookie.split('=')[1];
  }
  
  // Create new session ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Set cookie for 24 hours
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);
  document.cookie = `${cookieName}=${sessionId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  
  return sessionId;
}

// Track an analytics event
export async function trackEvent(
  eventType: 'view' | 'like' | 'comment' | 'search' | 'login' | 'signup',
  options: {
    postId?: string;
    categoryId?: string;
    tagId?: string;
    searchQuery?: string;
    searchResultCount?: number;
    metadata?: Record<string, any>;
  } = {}
): Promise<boolean> {
  try {
    const payload: any = {
      eventType,
      pageUrl: window.location.href,
    };
    
    // Only add optional fields if they have actual values
    if (options.postId) payload.postId = options.postId;
    if (options.categoryId) payload.categoryId = options.categoryId;
    if (options.tagId) payload.tagId = options.tagId;
    if (options.searchQuery) payload.searchQuery = options.searchQuery;
    if (options.searchResultCount !== undefined) payload.searchResultCount = options.searchResultCount;
    if (options.metadata) payload.metadata = options.metadata;
    
    console.log('[Analytics Client] Tracking event:', payload);
    
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    
    console.log('[Analytics Client] Response status:', response.status);

    return response.ok;
  } catch (error) {
    console.error('Failed to track event:', error);
    return false;
  }
}

// Track page view
export async function trackPageView(postId?: string): Promise<boolean> {
  console.log('[Analytics Client] trackPageView called with postId:', postId);
  const options: any = {};
  if (postId) {
    options.postId = postId;
  }
  return trackEvent('view', options);
}

// Track search
export async function trackSearch(query: string, resultCount: number): Promise<boolean> {
  return trackEvent('search', {
    searchQuery: query,
    searchResultCount: resultCount,
  });
}

// Track like
export async function trackLike(postId: string): Promise<boolean> {
  if (!postId) {
    console.warn('[Analytics Client] trackLike called without postId');
    return false;
  }
  return trackEvent('like', { postId });
}

// Track comment
export async function trackComment(postId: string): Promise<boolean> {
  if (!postId) {
    console.warn('[Analytics Client] trackComment called without postId');
    return false;
  }
  return trackEvent('comment', { postId });
}

// Track login
export async function trackLogin(): Promise<boolean> {
  return trackEvent('login');
}

// Track signup
export async function trackSignup(): Promise<boolean> {
  return trackEvent('signup');
}

// Google Analytics event tracking
export function trackGAEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

// Google Analytics page view
export function trackGAPageView(url: string, title: string): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', import.meta.env.PUBLIC_GA_ID, {
      page_path: url,
      page_title: title,
    });
  }
}

// Automatically track page views on load
if (typeof window !== 'undefined') {
  // Initialize session ID
  getSessionId();
  
  // Track page view after a short delay to ensure page is loaded
  window.addEventListener('load', () => {
    // Skip analytics for admin pages - they shouldn't be tracked
    if (window.location.pathname.startsWith('/admin') || 
        window.location.pathname.startsWith('/dashboard')) {
      console.log('[Analytics] Skipping automatic tracking for admin/dashboard pages');
      return;
    }
    
    // Check if on a post page - individual post pages handle their own tracking
    // to ensure the postId is included
    const pathMatch = window.location.pathname.match(/^\/post\/([^/]+)/);
    if (pathMatch) {
      // Skip automatic tracking for post pages - let the page script handle it
      console.log('[Analytics] Skipping automatic tracking for post page - will be handled by page script');
    } else {
      // Track page view for non-post pages
      trackPageView();
    }
    
    // Track with Google Analytics (this is fine to keep for all pages)
    trackGAPageView(window.location.pathname, document.title);
  });
}

// Export session ID getter for use in other modules
export { getSessionId };
