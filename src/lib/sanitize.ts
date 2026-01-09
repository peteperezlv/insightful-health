/**
 * HTML Sanitization for User-Generated Content
 * Prevents XSS attacks while allowing safe HTML formatting
 * Implements Prompt 4.2 requirement #5 (Content output - Sanitize HTML)
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content from the rich text editor
 * Allows safe HTML tags and attributes, blocks dangerous content
 */
export function sanitizeHTML(html: string): string {
  // Configure DOMPurify to allow specific tags and attributes
  const config = {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'mark', 'sub', 'sup',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Quotes and blocks
      'blockquote', 'pre',
      // Links
      'a',
      // Images
      'img',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Divisions
      'div', 'span',
      // Horizontal rule
      'hr',
      // Embedded content (for YouTube, charts, etc.)
      'iframe',
    ],
    ALLOWED_ATTR: [
      // Common attributes
      'class', 'id', 'style',
      // Link attributes
      'href', 'target', 'rel',
      // Image attributes
      'src', 'alt', 'width', 'height',
      // Table attributes
      'colspan', 'rowspan',
      // iframe attributes (for embeds)
      'src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen',
      // Text alignment
      'align',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Allow specific iframe sources (YouTube, Vimeo, etc.)
    ALLOW_UNKNOWN_PROTOCOLS: false,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    // Add hook to allow specific iframe sources
    FORBID_TAGS: [],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };

  // Additional validation for iframes - only allow trusted sources
  const trustedSources = [
    'youtube.com',
    'youtube-nocookie.com',
    'vimeo.com',
    'player.vimeo.com',
    'dailymotion.com',
    'soundcloud.com',
    'spotify.com',
    'codepen.io',
    'jsfiddle.net',
    'codesandbox.io',
  ];

  // Add custom hook to validate iframes before sanitization
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const src = node.getAttribute('src');
      if (!src) {
        node.parentNode?.removeChild(node);
        return;
      }
      const isTrusted = trustedSources.some(domain => src.includes(domain));
      if (!isTrusted) {
        node.parentNode?.removeChild(node);
      }
    }
  });

  // Sanitize the HTML
  const clean = DOMPurify.sanitize(html, config);
  
  // Remove hooks to avoid affecting future sanitization
  DOMPurify.removeAllHooks();

  return clean;
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHTML(html: string): string {
  const config = {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  };
  return DOMPurify.sanitize(html, config).trim();
}

/**
 * Validate and sanitize image URL
 */
export function sanitizeImageURL(url: string): string | null {
  try {
    // Allow data URLs (base64 images)
    if (url.startsWith('data:image/')) {
      return url;
    }

    // Validate http/https URLs
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    return url;
  } catch (error) {
    return null;
  }
}

/**
 * Sanitize and validate link URL
 */
export function sanitizeLinkURL(url: string): string | null {
  try {
    // Allow mailto and tel links
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }

    // Validate http/https URLs
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    return url;
  } catch (error) {
    // If URL parsing fails, it's invalid
    return null;
  }
}

/**
 * Calculate reading time from HTML content
 * @param html - HTML content
 * @returns Reading time in minutes
 */
export function calculateReadingTime(html: string): number {
  const text = stripHTML(html);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
}

/**
 * Extract plain text excerpt from HTML
 * @param html - HTML content
 * @param maxLength - Maximum excerpt length
 * @returns Plain text excerpt
 */
export function extractExcerpt(html: string, maxLength: number = 300): string {
  const text = stripHTML(html);
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}
