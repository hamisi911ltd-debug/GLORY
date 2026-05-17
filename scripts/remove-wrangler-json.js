import { rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// The @cloudflare/vite-plugin generates a wrangler.json inside dist/client
// during build. This conflicts with the root wrangler.toml and causes
// Cloudflare Pages to crash. Remove it after every build.
const filesToRemove = [
  join(__dirname, "..", "dist", "client", "wrangler.json"),
  join(__dirname, "..", "dist", "client", "wrangler.toml"),
];

for (const file of filesToRemove) {
  if (existsSync(file)) {
    rmSync(file, { force: true });
    console.log(`✅ Removed ${file}`);
  }
}
console.log("✅ Post-build cleanup complete");
