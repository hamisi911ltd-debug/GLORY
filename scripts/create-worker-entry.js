/**
 * Create _worker.js in dist/client/ for Cloudflare Pages SSR
 * 
 * Pages SSR requires a _worker.js file that:
 * 1. Handles SSR routing via the server
 * 2. Falls back to env.ASSETS.fetch() for static files
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

// Create the _worker.js that properly handles both SSR and static assets
const workerContent = `/**
 * Cloudflare Pages SSR Worker Entry
 * Handles SSR routing and falls back to static asset serving
 */

import server from '../server/server.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Try to handle the request with the SSR server
      const response = await server.fetch(request, env, ctx);
      
      // If the server returns a 404, try to serve as a static asset
      if (response.status === 404 && env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      
      // On error, try to serve as a static asset
      if (env.ASSETS) {
        try {
          return env.ASSETS.fetch(request);
        } catch (assetError) {
          console.error('Asset fetch error:', assetError);
        }
      }
      
      // If all else fails, return 500
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
`;

writeFileSync(workerFile, workerContent);
console.log('✅ _worker.js created successfully!');
console.log(`   Location: ${workerFile}`);
console.log(`   Handles: SSR + static asset fallback via env.ASSETS`);



