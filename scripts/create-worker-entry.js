/**
 * Create _worker.js in dist/client/ for Cloudflare Pages SSR
 * 
 * Pages SSR requires a _worker.js file in the output directory that:
 * 1. Serves static assets from the assets directory
 * 2. Handles SSR for dynamic routes via the server entry
 */

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const workerFile = join(rootDir, 'dist', 'client', '_worker.js');
const serverEntry = join(rootDir, 'dist', 'server', 'server.js');

console.log('📝 Creating _worker.js for Pages SSR...');

if (!existsSync(serverEntry)) {
  console.error('❌ Server entry not found:', serverEntry);
  process.exit(1);
}

// Create the _worker.js that handles both static assets and SSR
const workerContent = `/**
 * Cloudflare Pages SSR Worker Entry
 * Handles static asset serving and SSR routing
 */

// Import the TanStack Start server entry
import server from '../server/server.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve static assets from the assets directory
    // These are excluded from the worker in _routes.json but we handle them here for safety
    if (url.pathname.startsWith('/assets/')) {
      // Try to get the asset from the environment's ASSETS binding
      // Cloudflare Pages automatically provides this
      if (env.ASSETS) {
        try {
          const asset = await env.ASSETS.fetch(request);
          if (asset.status !== 404) {
            return asset;
          }
        } catch (e) {
          console.error('Asset fetch error:', e);
        }
      }
      
      // If ASSETS binding not available or asset not found, return 404
      return new Response('Not Found', { status: 404 });
    }
    
    // For all other routes, use the TanStack Start server
    return server.fetch(request, env, ctx);
  }
};
`;

writeFileSync(workerFile, workerContent);
console.log('✅ _worker.js created successfully!');
console.log(`   Location: ${workerFile}`);
console.log(`   Handles: Static assets + SSR routing`);

