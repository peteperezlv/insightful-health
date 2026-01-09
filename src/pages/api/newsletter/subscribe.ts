/**
 * Newsletter Subscription API
 * Handles email subscriptions with MailerLite integration
 */

import type { APIRoute } from 'astro';
import { getPocketBase } from '../../../lib/pocketbase';
import { checkRateLimit } from '../../../lib/ratelimit';

interface MailerLiteSubscriber {
  email: string;
  fields?: {
    [key: string]: string;
  };
}

/**
 * Subscribe to newsletter via MailerLite
 */
async function subscribeToMailerLite(email: string): Promise<boolean> {
  const apiKey = import.meta.env.PRIVATE_MAILERLITE_API_KEY;
  
  if (!apiKey) {
    console.warn('MailerLite API key not configured');
    // Still save to database even if MailerLite is not configured
    return false;
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: email,
        fields: {
          source: 'website',
        },
      } as MailerLiteSubscriber),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MailerLite API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('MailerLite subscription error:', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Rate limiting: 5 subscriptions per IP per hour
    const rateLimitKey = `newsletter:${clientAddress}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many subscription attempts. Please try again later.',
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required',
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format',
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const pb = getPocketBase();

    // Check if email already subscribed in PocketBase
    try {
      const existingUser = await pb.collection('users').getFirstListItem(
        `email = "${email}" && newsletterSubscribed = true`
      );

      if (existingUser) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'This email is already subscribed',
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (error) {
      // No existing subscription found, continue
    }

    // Subscribe to MailerLite (if configured)
    const mailerLiteSuccess = await subscribeToMailerLite(email);

    // Update or create user in PocketBase with newsletter subscription
    try {
      // Try to find existing user by email
      let user;
      try {
        user = await pb.collection('users').getFirstListItem(`email = "${email}"`);
      } catch {
        user = null;
      }

      if (user) {
        // Update existing user
        await pb.collection('users').update(user.id, {
          newsletterSubscribed: true,
        });
      } else {
        // Create new user record for newsletter subscriber
        await pb.collection('users').create({
          email: email,
          username: email.split('@')[0] + '_' + Date.now(),
          password: 'newsletter_only_' + Math.random().toString(36),
          role: 'user',
          newsletterSubscribed: true,
          emailVerified: false,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: mailerLiteSuccess 
            ? 'Successfully subscribed! Please check your email to confirm.'
            : 'Subscription saved! We\'ll keep you updated.',
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Even if DB fails, if MailerLite succeeded, consider it a success
      if (mailerLiteSuccess) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Successfully subscribed! Please check your email to confirm.',
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save subscription. Please try again.',
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
