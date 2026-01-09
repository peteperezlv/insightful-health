#!/usr/bin/env node

/**
 * PocketBase Collections Setup Script
 * 
 * This script helps automate the creation of PocketBase collections
 * and seed data for the PRD-Driven Copilot blog platform.
 * 
 * Usage:
 *   node setup-pocketbase.js [command] [options]
 * 
 * Commands:
 *   import-collections   Import collections from JSON
 *   create-categories     Seed sample categories
 *   create-tags          Seed sample tags
 *   create-admin         Create admin user
 *   create-sample-post   Create sample post
 *   verify-setup         Verify all collections exist
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  POCKETBASE_URL: process.env.PB_URL || 'http://localhost:8090',
  ADMIN_EMAIL: process.env.PB_ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.PB_ADMIN_PASSWORD || 'AdminPassword123',
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Make HTTP request to PocketBase API
 */
async function makeRequest(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.POCKETBASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const protocol = url.protocol === 'https:' ? https : require('http');

    const req = protocol.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          } else {
            resolve(responseData);
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
 * Load collections from JSON file
 */
function loadCollectionsJson() {
  const filePath = path.join(__dirname, '..', 'pocketbase-collections.json');
  
  if (!fs.existsSync(filePath)) {
    logError(`Collections file not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logError(`Failed to parse collections JSON: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Verify PocketBase is running
 */
async function verifyPocketBaseRunning() {
  try {
    logInfo(`Checking PocketBase at ${CONFIG.POCKETBASE_URL}...`);
    await makeRequest('GET', '/api/health');
    logSuccess('PocketBase is running');
    return true;
  } catch (error) {
    logError(`Cannot connect to PocketBase: ${error.message}`);
    logInfo(`Please ensure PocketBase is running: pocketbase serve`);
    return false;
  }
}

/**
 * List all existing collections
 */
async function listCollections() {
  try {
    const response = await makeRequest('GET', '/api/collections');
    return response.items || response;
  } catch (error) {
    logError(`Failed to list collections: ${error.message}`);
    return [];
  }
}

/**
 * Verify setup - check all 8 collections exist
 */
async function verifySetup() {
  logInfo('Verifying PocketBase setup...\n');

  const requiredCollections = [
    'users',
    'categories',
    'tags',
    'posts',
    'comments',
    'likes',
    'post_versions',
    'analytics',
  ];

  const existingCollections = await listCollections();
  const existingNames = existingCollections.map(c => c.name);

  let allPresent = true;

  requiredCollections.forEach((collection) => {
    if (existingNames.includes(collection)) {
      logSuccess(`${collection} collection exists`);
    } else {
      logError(`${collection} collection NOT FOUND`);
      allPresent = false;
    }
  });

  if (allPresent) {
    log('\n✅ All collections are properly set up!', 'green');
  } else {
    log('\n❌ Some collections are missing. Run: node setup-pocketbase.js import-collections', 'red');
  }

  return allPresent;
}

/**
 * Create sample categories
 */
async function createSampleCategories() {
  logInfo('Creating sample categories...\n');

  const categories = [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Posts about tech innovations and trends',
      color: '#3B82F6',
      displayOrder: 1,
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'Design patterns, UI/UX best practices',
      color: '#EC4899',
      displayOrder: 2,
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Business insights and growth strategies',
      color: '#F59E0B',
      displayOrder: 3,
    },
    {
      name: 'Learning',
      slug: 'learning',
      description: 'Educational resources and tutorials',
      color: '#10B981',
      displayOrder: 4,
    },
    {
      name: 'News',
      slug: 'news',
      description: 'Industry news and announcements',
      color: '#EF4444',
      displayOrder: 5,
    },
  ];

  for (const category of categories) {
    try {
      await makeRequest('POST', '/api/collections/categories/records', category);
      logSuccess(`Created category: ${category.name}`);
    } catch (error) {
      if (error.message.includes('duplicate')) {
        logWarning(`Category already exists: ${category.name}`);
      } else {
        logError(`Failed to create category: ${error.message}`);
      }
    }
  }
}

/**
 * Create sample tags
 */
async function createSampleTags() {
  logInfo('Creating sample tags...\n');

  const tags = [
    { name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming language' },
    { name: 'React', slug: 'react', description: 'React library for UI development' },
    { name: 'Web Development', slug: 'web-development', description: 'Web development tutorials and tips' },
    { name: 'API', slug: 'api', description: 'RESTful and GraphQL APIs' },
    { name: 'Database', slug: 'database', description: 'Database design and optimization' },
    { name: 'Performance', slug: 'performance', description: 'Performance optimization tips' },
    { name: 'Security', slug: 'security', description: 'Security best practices' },
    { name: 'DevOps', slug: 'devops', description: 'DevOps and deployment strategies' },
  ];

  for (const tag of tags) {
    try {
      await makeRequest('POST', '/api/collections/tags/records', tag);
      logSuccess(`Created tag: ${tag.name}`);
    } catch (error) {
      if (error.message.includes('duplicate')) {
        logWarning(`Tag already exists: ${tag.name}`);
      } else {
        logError(`Failed to create tag: ${error.message}`);
      }
    }
  }
}

/**
 * Create admin user
 */
async function createAdminUser() {
  logInfo('Creating admin user...\n');

  const userData = {
    email: CONFIG.ADMIN_EMAIL,
    password: CONFIG.ADMIN_PASSWORD,
    passwordConfirm: CONFIG.ADMIN_PASSWORD,
    fullName: 'Admin User',
    role: 'admin',
    emailVerified: true,
    isVerified: true,
  };

  try {
    await makeRequest('POST', '/api/collections/users/records', userData);
    logSuccess(`Created admin user: ${CONFIG.ADMIN_EMAIL}`);
    logInfo(`Password: ${CONFIG.ADMIN_PASSWORD}`);
  } catch (error) {
    if (error.message.includes('duplicate')) {
      logWarning('Admin user already exists');
    } else {
      logError(`Failed to create admin user: ${error.message}`);
    }
  }
}

/**
 * Print helpful next steps
 */
function printNextSteps() {
  log('\n' + '='.repeat(50), 'blue');
  logInfo('Setup Complete!');
  log('='.repeat(50) + '\n', 'blue');

  log('📋 Next Steps:', 'yellow');
  log('  1. Open PocketBase Admin: http://localhost:8090/_/', 'blue');
  log(`  2. Login with: ${CONFIG.ADMIN_EMAIL}`, 'blue');
  log(`  3. Test creating and viewing posts`, 'blue');
  log(`  4. Configure API rules for your frontend`, 'blue');
  log('  5. Deploy to production\n', 'blue');

  log('📚 Documentation:', 'yellow');
  log('  - Setup Guide: POCKETBASE_SETUP.md', 'blue');
  log('  - Collections JSON: pocketbase-collections.json', 'blue');
  log('  - PocketBase Docs: https://pocketbase.io/docs/\n', 'blue');

  log('🔒 Security Reminders:', 'yellow');
  log('  - Change admin password after first login', 'blue');
  log('  - Use environment variables for secrets', 'blue');
  log('  - Review access control rules', 'blue');
  log('  - Enable HTTPS for production\n', 'blue');
}

/**
 * Main CLI
 */
async function main() {
  const command = process.argv[2] || 'help';

  logInfo(`\n🚀 PocketBase Collections Setup Script\n`);

  // Verify PocketBase is running
  if (!(await verifyPocketBaseRunning())) {
    process.exit(1);
  }

  switch (command) {
    case 'verify':
    case 'verify-setup':
      await verifySetup();
      break;

    case 'create-categories':
      await createSampleCategories();
      break;

    case 'create-tags':
      await createSampleTags();
      break;

    case 'create-admin':
      await createAdminUser();
      break;

    case 'setup-all':
    case 'full-setup':
      await createAdminUser();
      logInfo('');
      await createSampleCategories();
      logInfo('');
      await createSampleTags();
      logInfo('');
      await verifySetup();
      printNextSteps();
      break;

    case 'help':
    default:
      log('\n📖 PocketBase Collections Setup Script\n', 'blue');
      log('Usage: node setup-pocketbase.js [command] [options]\n', 'yellow');
      log('Commands:', 'yellow');
      log('  verify              Verify all collections exist', 'blue');
      log('  create-categories   Create sample categories', 'blue');
      log('  create-tags         Create sample tags', 'blue');
      log('  create-admin        Create admin user', 'blue');
      log('  setup-all           Run all setup commands', 'blue');
      log('  help                Show this help message\n', 'blue');
      log('Environment Variables:', 'yellow');
      log(`  PB_URL              PocketBase URL (default: ${CONFIG.POCKETBASE_URL})`, 'blue');
      log(`  PB_ADMIN_EMAIL      Admin email (default: ${CONFIG.ADMIN_EMAIL})`, 'blue');
      log(`  PB_ADMIN_PASSWORD   Admin password (default: ${CONFIG.ADMIN_PASSWORD})\n`, 'blue');
      break;
  }
}

// Run main
main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
