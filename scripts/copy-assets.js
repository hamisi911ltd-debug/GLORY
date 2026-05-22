/**
 * Copy assets from server to client directory for Cloudflare Pages deployment
 */

import { cpSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const serverAssetsDir = join(rootDir, 'dist', 'server', 'assets');
const clientAssetsDir = join(rootDir, 'dist', 'client', 'assets');

console.log('📦 Copying assets for Cloudflare Pages deployment...');

if (existsSync(serverAssetsDir)) {
  // Create client assets directory if it doesn't exist
  if (!existsSync(clientAssetsDir)) {
    mkdirSync(clientAssetsDir, { recursive: true });
  }
  
  // Copy all assets from server to client
  cpSync(serverAssetsDir, clientAssetsDir, { recursive: true });
  console.log('✅ Assets copied successfully!');
  console.log(`   From: ${serverAssetsDir}`);
  console.log(`   To: ${clientAssetsDir}`);
} else {
  console.log('⚠️  No server assets found to copy');
}
