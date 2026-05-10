/**
 * Post-build script for Vercel deployment.
 *
 * After `vite build`, TanStack Start outputs:
 *   dist/client/   ← static assets (JS, CSS, images)
 *   dist/server/   ← SSR server bundle (server.js + assets/)
 *
 * Vercel serverless functions are isolated — they can't reach outside
 * their own directory at runtime. So we copy dist/server/ into api/dist/
 * so that api/server.js can import it with a stable relative path.
 *
 * Also copies dist/client/ into public/ so Vercel serves static files
 * from the standard output directory.
 */

import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// 1. Copy dist/server → api/dist/server
//    This makes the relative import in server.js work inside the Vercel function
const serverSrc = join(root, "dist", "server");
const serverDest = join(root, "api", "dist", "server");

rmSync(serverDest, { recursive: true, force: true });
mkdirSync(serverDest, { recursive: true });
cpSync(serverSrc, serverDest, { recursive: true });
console.log("✅ Copied dist/server → api/dist/server");

// 2. Copy dist/client → public/
//    Vercel serves files from public/ as static assets automatically
const clientSrc = join(root, "dist", "client");
const clientDest = join(root, "public");

rmSync(clientDest, { recursive: true, force: true });
mkdirSync(clientDest, { recursive: true });
cpSync(clientSrc, clientDest, { recursive: true });
console.log("✅ Copied dist/client → public/");

console.log("🚀 Vercel post-build complete");
