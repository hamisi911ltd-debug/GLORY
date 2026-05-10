/**
 * Bundles the TanStack Start SSR server + Vercel adapter into a single
 * self-contained file: api/server.js
 *
 * This solves the "Server bundle failed to load" error — esbuild inlines
 * all dynamic imports so Vercel's isolated function sandbox has everything
 * it needs in one file with no external references.
 */

import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, "..");

// Write a temporary entry file that imports the SSR server and exports
// the Vercel handler. esbuild will inline everything.
const entryContent = `
import server from ${JSON.stringify(join(root, "dist", "server", "server.js"))};

async function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host  = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url   = new URL(req.url, proto + "://" + host);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    Array.isArray(v) ? v.forEach((x) => headers.append(k, x)) : headers.set(k, v);
  }
  const method  = req.method ?? "GET";
  const hasBody = !["GET", "HEAD"].includes(method);
  let body;
  if (hasBody) {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data",  (c) => chunks.push(c));
      req.on("end",   () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }
  return new Request(url.toString(), {
    method, headers,
    body:   hasBody && body?.length ? body : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

async function toNodeResponse(webRes, res) {
  res.statusCode = webRes.status;
  for (const [k, v] of webRes.headers.entries()) res.setHeader(k, v);
  if (webRes.body) {
    const reader = webRes.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally { reader.releaseLock(); }
  }
  res.end();
}

export default async function handler(req, res) {
  try {
    const webReq = await toWebRequest(req);
    const webRes = await server.fetch(webReq, process.env, {});
    await toNodeResponse(webRes, res);
  } catch (err) {
    console.error("[SSR]", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html");
    res.end("<!doctype html><html><body><h1>500</h1><p>" + err.message + "</p></body></html>");
  }
}
`;

const entryPath = join(root, "scripts", "_entry.tmp.js");
writeFileSync(entryPath, entryContent);

await build({
  entryPoints: [entryPath],
  bundle:      true,
  platform:    "node",
  format:      "esm",
  outfile:     join(root, "api", "server.js"),
  // Keep Node built-ins external — always available in Vercel's Node runtime
  external: ["node:*"],
  // Allow bundling everything else including the SSR assets
  logLevel: "info",
});

// Clean up temp file
import { unlinkSync } from "node:fs";
unlinkSync(entryPath);

console.log("✅  Bundled SSR + Vercel adapter → api/server.js");
