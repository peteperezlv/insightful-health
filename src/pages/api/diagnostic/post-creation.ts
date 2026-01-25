/**
 * GET /api/diagnostic/post-creation - Diagnostic endpoint for post creation issues
 */

import type { APIRoute } from 'astro';
import { getCurrentSession, isAuthor } from '../../../lib/session';
import { getPocketBase } from '../../../lib/pocketbase';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: [],
    issues: [],
    recommendations: [],
  };

  try {
    // Check 1: Authentication
    const user = await getCurrentSession(cookies);
    if (!user) {
      diagnostics.checks.push({
        name: 'Authentication',
        status: 'FAIL',
        message: 'No active session found',
      });
      diagnostics.issues.push('User is not authenticated');
      diagnostics.recommendations.push('Please log in and try again');
    } else {
      diagnostics.checks.push({
        name: 'Authentication',
        status: 'PASS',
        message: 'User session active',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });

      // Check 2: Authorization
      if (!isAuthor(user)) {
        diagnostics.checks.push({
          name: 'Authorization',
          status: 'FAIL',
          message: `User role '${user.role}' does not have post creation permissions`,
        });
        diagnostics.issues.push(`User role is '${user.role}', needs 'admin' or 'author'`);
        diagnostics.recommendations.push('Update user role to admin or author in PocketBase');
      } else {
        diagnostics.checks.push({
          name: 'Authorization',
          status: 'PASS',
          message: `User has '${user.role}' role`,
        });
      }

      // Check 3: PocketBase Connection
      try {
        const pb = getPocketBase();
        diagnostics.checks.push({
          name: 'PocketBase Connection',
          status: 'PASS',
          message: 'PocketBase client initialized',
          url: pb.baseUrl,
        });

        // Check 4: Posts Collection Access
        try {
          const testQuery = await pb.collection('posts').getList(1, 1);
          diagnostics.checks.push({
            name: 'Posts Collection',
            status: 'PASS',
            message: 'Posts collection accessible',
            totalPosts: testQuery.totalItems,
          });
        } catch (error: any) {
          diagnostics.checks.push({
            name: 'Posts Collection',
            status: 'FAIL',
            message: error.message,
          });
          diagnostics.issues.push('Cannot access posts collection: ' + error.message);
          diagnostics.recommendations.push('Check PocketBase posts collection exists and is properly configured');
        }

        // Check 5: Categories Collection Access (optional but helpful)
        try {
          const categories = await pb.collection('categories').getList(1, 10);
          diagnostics.checks.push({
            name: 'Categories Collection',
            status: 'PASS',
            message: 'Categories collection accessible',
            totalCategories: categories.totalItems,
            categories: categories.items.map((c: any) => ({
              id: c.id,
              name: c.name,
            })),
          });
        } catch (error: any) {
          diagnostics.checks.push({
            name: 'Categories Collection',
            status: 'WARN',
            message: 'Categories collection not accessible (optional)',
          });
        }

        // Check 6: Test Post Creation Data
        if (user) {
          const testPostData = {
            title: 'Test Post (Diagnostic)',
            slug: 'test-post-diagnostic-' + Date.now(),
            excerpt: '',
            content: '<p>This is a diagnostic test post.</p>',
            status: 'draft',
            isFeatured: false,
            authorId: user.id,
            authorName: user.fullName || user.username || user.email || 'Unknown Author',
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            wordCount: 6,
            readingTimeMinutes: 1,
            isApproved: user.role === 'admin',
          };

          diagnostics.checks.push({
            name: 'Test Post Data Preparation',
            status: 'PASS',
            message: 'Sample post data prepared',
            sampleData: {
              ...testPostData,
              content: testPostData.content.substring(0, 50) + '...',
            },
          });

          // Check 7: Slug Uniqueness Test
          try {
            const existingPost = await pb.collection('posts').getList(1, 1, {
              filter: `slug = "${testPostData.slug}"`,
            });
            
            if (existingPost.totalItems > 0) {
              diagnostics.checks.push({
                name: 'Slug Uniqueness Check',
                status: 'WARN',
                message: 'Test slug already exists',
              });
            } else {
              diagnostics.checks.push({
                name: 'Slug Uniqueness Check',
                status: 'PASS',
                message: 'Test slug is unique',
              });
            }
          } catch (error: any) {
            diagnostics.checks.push({
              name: 'Slug Uniqueness Check',
              status: 'FAIL',
              message: error.message,
            });
            diagnostics.issues.push('Cannot check slug uniqueness: ' + error.message);
          }
        }
      } catch (error: any) {
        diagnostics.checks.push({
          name: 'PocketBase Connection',
          status: 'FAIL',
          message: error.message,
        });
        diagnostics.issues.push('PocketBase connection failed: ' + error.message);
        diagnostics.recommendations.push('Check PocketBase is running and accessible');
      }
    }

    // Summary
    const failedChecks = diagnostics.checks.filter((c: any) => c.status === 'FAIL').length;
    const warnChecks = diagnostics.checks.filter((c: any) => c.status === 'WARN').length;
    const passedChecks = diagnostics.checks.filter((c: any) => c.status === 'PASS').length;

    diagnostics.summary = {
      total: diagnostics.checks.length,
      passed: passedChecks,
      warnings: warnChecks,
      failed: failedChecks,
      status: failedChecks > 0 ? 'ISSUES_FOUND' : warnChecks > 0 ? 'WARNINGS' : 'HEALTHY',
    };

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Diagnostic endpoint error:', error);
    return new Response(
      JSON.stringify({
        error: 'Diagnostic check failed',
        message: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
