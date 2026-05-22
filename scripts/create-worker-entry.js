/**
 * Create _worker.js in dist/client/ for Cloudflare Pages SSR
 * 
 * Pages SSR requires a _worker.js file that handles SSR routing.
 * Static assets are served directly by Pages (excluded in _routes.json).
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

// Create the _worker.js that imports and re-exports the server
// Assets are served as static files by Pages (excluded in _routes.json)
const workerContent = `/**
 * Cloudflare Pages SSR Worker Entry
 * Handles SSR routing for the TanStack Start application
 * Static assets (/assets/*) are served directly by Pages
 */

import server from '../server/server.js';

export default server;
`;

writeFileSync(workerFile, workerContent);
console.log('✅ _worker.js created successfully!');
console.log(`   Location: ${workerFile}`);
console.log(`   Static assets served by Pages from /assets/`);


