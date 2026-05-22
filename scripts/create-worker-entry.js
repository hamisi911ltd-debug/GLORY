/**
 * Create _worker.js in dist/client/ for Cloudflare Pages SSR
 * 
 * Pages SSR requires a _worker.js file in the output directory that
 * imports and re-exports the server entry point.
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

// Create the _worker.js that imports the server
const workerContent = `/**
 * Cloudflare Pages SSR Worker Entry
 * This file imports and re-exports the TanStack Start server entry
 */

// Import the server entry from the build output
import server from '../server/server.js';

// Re-export as the default export for Pages
export default server;
`;

writeFileSync(workerFile, workerContent);
console.log('✅ _worker.js created successfully!');
console.log(`   Location: ${workerFile}`);
console.log(`   Imports from: ../server/server.js`);
