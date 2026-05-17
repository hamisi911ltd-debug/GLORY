import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "..", "dist", "client", "wrangler.json");

rmSync(file, { force: true });
console.log("✅ Removed generated dist/client/wrangler.json");
