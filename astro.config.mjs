// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Validate environment variables on startup (skip during static builds)
try {
  const { validateEnvironmentVariables, logEnvironmentConfig } = await import('./src/lib/env.ts');
  validateEnvironmentVariables();
  logEnvironmentConfig();
} catch (error) {
  // Allow static builds to proceed even if env vars are missing
  // Only throw during dev/preview
  if (process.argv.includes('dev') || process.argv.includes('preview')) {
    throw error;
  }
}

// https://astro.build/config
export default defineConfig({
  // Image optimization configuration
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.pocketbase.io',
      },
    ],
  },
  
  // Build optimizations
  build: {
    inlineStylesheets: 'auto',
  },
  
  vite: {
    plugins: [tailwindcss()],
    define: {
      __ENVIRONMENT_VALIDATED__: true,
    },
    
    // Build optimizations
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['pocketbase'],
          },
        },
      },
    },
    
    server: {
      watch: {
        // Ignore PocketBase data files to prevent infinite reload loops
        ignored: [
          '**/pocketbase/pb_data/**',
          '**/pocketbase/pb_migrations/**',
          '**/*.db',
          '**/*.db-shm',
          '**/*.db-wal',
        ]
      }
    }
  },
});