/**
 * Environment Variable Validation Utility
 * Ensures all required environment variables are configured
 * Separates public and private variables for security
 */

// Required public variables (exposed to client)
const REQUIRED_PUBLIC_VARS = ['PUBLIC_SITE_URL', 'PUBLIC_POCKETBASE_URL'];

// Required private variables (server-side only)
const REQUIRED_PRIVATE_VARS = [
  'PRIVATE_POCKETBASE_ADMIN_EMAIL',
  'PRIVATE_POCKETBASE_ADMIN_PASSWORD',
  'PRIVATE_JWT_SECRET',
];

// Optional variables with defaults
const OPTIONAL_VARS = {
  PUBLIC_GA_ID: '',
  PUBLIC_SITE_NAME: 'Insightful Health',
  PUBLIC_SITE_DESCRIPTION: 'Public health data analytics and insights',
  PRIVATE_MAILERLITE_API_KEY: '',
  PRIVATE_JWT_EXPIRATION: '7d',
  PRIVATE_POCKETBASE_BACKUP_DIR: './backups',
  DEBUG: 'false',
  SEED_DATABASE: 'false',
};

/**
 * Validates environment variables on startup
 * Throws error if required variables are missing during development
 * @throws {Error} If required environment variables are missing during dev
 */
export function validateEnvironmentVariables() {
  const missingVars = [];

  // Check required public variables
  for (const varName of REQUIRED_PUBLIC_VARS) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check required private variables (only during dev/runtime)
  if (typeof process !== 'undefined' && !isStaticBuild()) {
    for (const varName of REQUIRED_PRIVATE_VARS) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
  }

  if (missingVars.length > 0) {
    const message = `
╔════════════════════════════════════════════════════════════╗
║           ❌ MISSING REQUIRED ENVIRONMENT VARIABLES        ║
╚════════════════════════════════════════════════════════════╝

The following environment variables are required but missing:

${missingVars.map((v) => `  • ${v}`).join('\n')}

📝 Solution:
  1. Copy .env.example to .env.local
  2. Fill in all required values in .env.local
  3. Restart the development server

📚 Documentation:
  See README.md "Environment Variables" section for details on each variable.

⚠️  Never commit .env.local to version control!
`;
    console.error(message);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate URL format for PUBLIC_SITE_URL and PUBLIC_POCKETBASE_URL
  try {
    if (process.env.PUBLIC_SITE_URL) {
      new URL(process.env.PUBLIC_SITE_URL);
    }
    if (process.env.PUBLIC_POCKETBASE_URL) {
      new URL(process.env.PUBLIC_POCKETBASE_URL);
    }
  } catch (error) {
    const message = `
❌ Invalid URL format in environment variables:
  • PUBLIC_SITE_URL: ${process.env.PUBLIC_SITE_URL}
  • PUBLIC_POCKETBASE_URL: ${process.env.PUBLIC_POCKETBASE_URL}

Ensure both are valid URLs (e.g., http://localhost:3000)
`;
    console.error(message);
    throw new Error('Invalid URL format in environment variables');
  }

  return true;
}

/**
 * Check if this is a static build process
 */
function isStaticBuild(): boolean {
  return process.argv.includes('build') || process.env.npm_lifecycle_event === 'build';
}

/**
 * Gets all public environment variables for client-side use
 * @returns {Object} Public variables only
 */
export function getPublicEnv() {
  return {
    siteUrl: process.env.PUBLIC_SITE_URL,
    pocketbaseUrl: process.env.PUBLIC_POCKETBASE_URL,
    gaId: process.env.PUBLIC_GA_ID || '',
    siteName: process.env.PUBLIC_SITE_NAME || 'Insightful Health',
    siteDescription: process.env.PUBLIC_SITE_DESCRIPTION || 'Public health data analytics and insights',
  };
}

/**
 * Gets all private environment variables (server-side only)
 * @returns {Object} Private variables only
 */
export function getPrivateEnv() {
  return {
    pocketbaseAdminEmail: process.env.PRIVATE_POCKETBASE_ADMIN_EMAIL,
    pocketbaseAdminPassword: process.env.PRIVATE_POCKETBASE_ADMIN_PASSWORD,
    mailerliteApiKey: process.env.PRIVATE_MAILERLITE_API_KEY || '',
    jwtSecret: process.env.PRIVATE_JWT_SECRET,
    jwtExpiration: process.env.PRIVATE_JWT_EXPIRATION || '7d',
    pocketbaseBackupDir: process.env.PRIVATE_POCKETBASE_BACKUP_DIR || './backups',
    oauthGithub: {
      clientId: process.env.PRIVATE_OAUTH_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.PRIVATE_OAUTH_GITHUB_CLIENT_SECRET || '',
      redirectUri: process.env.PRIVATE_OAUTH_GITHUB_REDIRECT_URI || '',
    },
    oauthGoogle: {
      clientId: process.env.PRIVATE_OAUTH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.PRIVATE_OAUTH_GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.PRIVATE_OAUTH_GOOGLE_REDIRECT_URI || '',
    },
    oauthFacebook: {
      appId: process.env.PRIVATE_OAUTH_FACEBOOK_APP_ID || '',
      appSecret: process.env.PRIVATE_OAUTH_FACEBOOK_APP_SECRET || '',
      redirectUri: process.env.PRIVATE_OAUTH_FACEBOOK_REDIRECT_URI || '',
    },
    debug: process.env.DEBUG === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true',
  };
}

/**
 * Log environment configuration (without exposing secrets)
 */
export function logEnvironmentConfig() {
  if (process.env.DEBUG === 'true' && !isStaticBuild()) {
    console.log('📋 Insightful Health Environment Configuration:');
    console.log(`  • Site URL: ${process.env.PUBLIC_SITE_URL}`);
    console.log(`  • PocketBase URL: ${process.env.PUBLIC_POCKETBASE_URL}`);
    console.log(`  • Site Name: ${process.env.PUBLIC_SITE_NAME}`);
    console.log(`  • Google Analytics: ${process.env.PUBLIC_GA_ID ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  • MailerLite: ${process.env.PRIVATE_MAILERLITE_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  • GitHub OAuth: ${process.env.PRIVATE_OAUTH_GITHUB_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  • Google OAuth: ${process.env.PRIVATE_OAUTH_GOOGLE_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  • Facebook OAuth: ${process.env.PRIVATE_OAUTH_FACEBOOK_APP_ID ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  • Debug Mode: ${process.env.DEBUG === 'true' ? 'ON' : 'OFF'}`);
    console.log('');
  }
}
