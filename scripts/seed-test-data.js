#!/usr/bin/env node

/**
 * PocketBase Test Data Seeding Script
 * 
 * Creates sample data for development and testing
 * 
 * Usage:
 *   node scripts/seed-test-data.js [--delete] [--dry-run]
 * 
 * Options:
 *   --delete    Delete existing test data before seeding
 *   --dry-run   Show what would be created without actually creating
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const CONFIG = {
  POCKETBASE_URL: process.env.PB_URL || 'http://localhost:8090',
  ADMIN_TOKEN: process.env.PB_ADMIN_TOKEN || null,
};

const deleteFlag = process.argv.includes('--delete');
const dryRunFlag = process.argv.includes('--dry-run');

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${c.blue}ℹ️  ${msg}${c.reset}`),
  success: (msg) => console.log(`${c.green}✅ ${msg}${c.reset}`),
  warn: (msg) => console.log(`${c.yellow}⚠️  ${msg}${c.reset}`),
  error: (msg) => console.log(`${c.red}❌ ${msg}${c.reset}`),
};

/**
 * Make HTTP request to PocketBase API
 */
async function request(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.POCKETBASE_URL);
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${parsed.message || body}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${body}`));
          } else {
            resolve(body);
          }
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Get all records from a collection
 */
async function getAllRecords(collection) {
  try {
    const response = await request('GET', `/api/collections/${collection}/records?perPage=500`);
    return response.items || [];
  } catch (error) {
    log.error(`Failed to fetch ${collection}: ${error.message}`);
    return [];
  }
}

/**
 * Delete a record
 */
async function deleteRecord(collection, id, token) {
  try {
    await request('DELETE', `/api/collections/${collection}/records/${id}`, null, token);
    return true;
  } catch (error) {
    log.warn(`Failed to delete ${collection}/${id}: ${error.message}`);
    return false;
  }
}

/**
 * Create a test user
 */
async function createTestUser(email, password, role) {
  const data = {
    email,
    password,
    passwordConfirm: password,
    fullName: email.split('@')[0],
    role,
    emailVerified: true,
    isVerified: true,
  };

  try {
    const response = await request('POST', '/api/collections/users/records', data);
    log.success(`Created user: ${email} (${role})`);
    return response;
  } catch (error) {
    if (error.message.includes('duplicate')) {
      log.warn(`User already exists: ${email}`);
      return null;
    }
    log.error(`Failed to create user ${email}: ${error.message}`);
    return null;
  }
}

/**
 * Create a test category
 */
async function createCategory(name, slug, color) {
  const data = { name, slug, color, displayOrder: 0 };

  try {
    const response = await request('POST', '/api/collections/categories/records', data);
    log.success(`Created category: ${name}`);
    return response;
  } catch (error) {
    if (error.message.includes('duplicate')) {
      log.warn(`Category already exists: ${name}`);
      return null;
    }
    log.error(`Failed to create category ${name}: ${error.message}`);
    return null;
  }
}

/**
 * Create a test tag
 */
async function createTag(name, slug) {
  const data = { name, slug };

  try {
    const response = await request('POST', '/api/collections/tags/records', data);
    log.success(`Created tag: ${name}`);
    return response;
  } catch (error) {
    if (error.message.includes('duplicate')) {
      log.warn(`Tag already exists: ${name}`);
      return null;
    }
    log.error(`Failed to create tag ${name}: ${error.message}`);
    return null;
  }
}

/**
 * Create a test post
 */
async function createPost(authorId, title, slug, token) {
  const data = {
    title,
    slug,
    content: `<h2>${title}</h2><p>This is a test post created for development purposes.</p>`,
    excerpt: `Test post: ${title}`,
    status: 'published',
    authorId,
    authorName: 'Test Author',
    viewCount: Math.floor(Math.random() * 1000),
    likeCount: Math.floor(Math.random() * 100),
    commentCount: 0,
    publishedAt: new Date().toISOString().split('T')[0],
    isApproved: true,
  };

  try {
    const response = await request('POST', `/api/collections/posts/records`, data, token);
    log.success(`Created post: ${title}`);
    return response;
  } catch (error) {
    if (error.message.includes('duplicate')) {
      log.warn(`Post already exists: ${slug}`);
      return null;
    }
    log.error(`Failed to create post ${title}: ${error.message}`);
    return null;
  }
}

/**
 * Create a test comment
 */
async function createComment(postId, content) {
  const data = {
    postId,
    content,
    authorName: 'Anonymous',
    authorEmail: 'anon@example.com',
    status: 'approved',
    ipAddress: '127.0.0.1',
  };

  try {
    const response = await request('POST', '/api/collections/comments/records', data);
    log.success(`Created comment on post`);
    return response;
  } catch (error) {
    log.error(`Failed to create comment: ${error.message}`);
    return null;
  }
}

/**
 * Create a test like
 */
async function createLike(postId, userId) {
  const data = {
    postId,
    userId,
    ipAddress: '127.0.0.1',
    sessionId: 'test-session-' + Date.now(),
  };

  try {
    const response = await request('POST', '/api/collections/likes/records', data);
    log.success(`Created like on post`);
    return response;
  } catch (error) {
    if (error.message.includes('duplicate')) {
      log.warn(`Like already exists`);
      return null;
    }
    log.error(`Failed to create like: ${error.message}`);
    return null;
  }
}

/**
 * Delete all test data
 */
async function deleteAllTestData(token) {
  if (!deleteFlag) return;

  log.info('Deleting existing test data...\n');

  const collections = ['analytics', 'post_versions', 'likes', 'comments', 'posts', 'tags', 'categories', 'users'];

  for (const collection of collections) {
    const records = await getAllRecords(collection);
    
    // Skip test collections, only delete test records
    const testRecords = records.filter(r => 
      r.email?.includes('test') || 
      r.title?.includes('Test') ||
      r.name?.includes('Test')
    );

    for (const record of testRecords) {
      await deleteRecord(collection, record.id, token);
      log.warn(`Deleted ${collection}/${record.id}`);
    }
  }
  
  log.info('');
}

/**
 * Seed all test data
 */
async function seedTestData() {
  log.info(`\n🌱 PocketBase Test Data Seeding Script\n`);

  if (dryRunFlag) {
    log.warn('DRY RUN MODE - No data will be created\n');
  }

  // Create test users
  log.info('Creating test users...');
  const adminUser = {
    email: 'admin@test.local',
    password: 'TestPassword123',
    role: 'admin',
  };

  const authorUser = {
    email: 'author@test.local',
    password: 'TestPassword123',
    role: 'author',
  };

  const regularUser = {
    email: 'user@test.local',
    password: 'TestPassword123',
    role: 'user',
  };

  let adminId, authorId, userId;

  if (!dryRunFlag) {
    const admin = await createTestUser(adminUser.email, adminUser.password, adminUser.role);
    adminId = admin?.id;

    const author = await createTestUser(authorUser.email, authorUser.password, authorUser.role);
    authorId = author?.id;

    const user = await createTestUser(regularUser.email, regularUser.password, regularUser.role);
    userId = user?.id;
  } else {
    log.info(`Would create user: ${adminUser.email} (admin)`);
    log.info(`Would create user: ${authorUser.email} (author)`);
    log.info(`Would create user: ${regularUser.email} (user)`);
    adminId = 'mock-admin-id';
    authorId = 'mock-author-id';
    userId = 'mock-user-id';
  }

  log.info('');

  // Create test categories
  log.info('Creating test categories...');
  const categories = [
    { name: 'Test Technology', slug: 'test-technology', color: '#3B82F6' },
    { name: 'Test Design', slug: 'test-design', color: '#EC4899' },
    { name: 'Test Business', slug: 'test-business', color: '#F59E0B' },
  ];

  const categoryIds = {};
  if (!dryRunFlag) {
    for (const cat of categories) {
      const created = await createCategory(cat.name, cat.slug, cat.color);
      if (created) categoryIds[cat.slug] = created.id;
    }
  } else {
    for (const cat of categories) {
      log.info(`Would create category: ${cat.name}`);
      categoryIds[cat.slug] = `mock-${cat.slug}`;
    }
  }

  log.info('');

  // Create test tags
  log.info('Creating test tags...');
  const tags = [
    { name: 'Test JavaScript', slug: 'test-javascript' },
    { name: 'Test React', slug: 'test-react' },
    { name: 'Test Testing', slug: 'test-testing' },
  ];

  if (!dryRunFlag) {
    for (const tag of tags) {
      await createTag(tag.name, tag.slug);
    }
  } else {
    for (const tag of tags) {
      log.info(`Would create tag: ${tag.name}`);
    }
  }

  log.info('');

  // Create test posts
  log.info('Creating test posts...');
  const posts = [
    { title: 'Test Post 1: Getting Started', slug: 'test-post-1-getting-started' },
    { title: 'Test Post 2: Advanced Techniques', slug: 'test-post-2-advanced-techniques' },
    { title: 'Test Post 3: Best Practices', slug: 'test-post-3-best-practices' },
  ];

  const postIds = [];
  if (!dryRunFlag && authorId) {
    // Note: Admin token needed for POST creation with authorization
    for (const post of posts) {
      const created = await createPost(authorId, post.title, post.slug);
      if (created) postIds.push(created.id);
    }
  } else {
    for (const post of posts) {
      log.info(`Would create post: ${post.title}`);
      postIds.push(`mock-post-id-${Math.random()}`);
    }
  }

  log.info('');

  // Create test comments
  if (postIds.length > 0) {
    log.info('Creating test comments...');
    const comments = [
      'Great post! Very helpful.',
      'Thanks for sharing this information.',
      'Could you provide more details on this topic?',
    ];

    if (!dryRunFlag) {
      for (const postId of postIds.slice(0, 1)) {
        for (const comment of comments) {
          await createComment(postId, comment);
        }
      }
    } else {
      log.info(`Would create ${comments.length} comments on test posts`);
    }

    log.info('');
  }

  // Create test likes
  if (postIds.length > 0 && (adminId || authorId || userId)) {
    log.info('Creating test likes...');

    if (!dryRunFlag) {
      const userIds = [adminId, authorId, userId].filter(Boolean);
      for (const postId of postIds.slice(0, 2)) {
        for (const uId of userIds) {
          await createLike(postId, uId);
        }
      }
    } else {
      log.info(`Would create likes for test posts`);
    }

    log.info('');
  }

  // Summary
  log.success(`\nTest data seeding ${dryRunFlag ? 'simulation' : 'completed'}!\n`);

  if (!dryRunFlag) {
    log.info('Test user credentials:');
    log.info(`  Admin: ${adminUser.email} / ${adminUser.password}`);
    log.info(`  Author: ${authorUser.email} / ${authorUser.password}`);
    log.info(`  User: ${regularUser.email} / ${regularUser.password}`);
    log.info('');
  }

  log.info('Next steps:');
  log.info('  1. Open http://localhost:8090/_/');
  log.info('  2. Login with test user credentials');
  log.info('  3. Browse and manage test data');
  log.info('  4. Run: npm run dev to start development server\n');
}

// Main
seedTestData().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
