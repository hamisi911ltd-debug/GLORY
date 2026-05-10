/**
 * Bundles the TanStack Start SSR server + Vercel adapter into a single
 * self-contained file: api/server.js
 *
 * Key settings:
 * - format: "cjs"  — react-dom/server.node.js uses require(), must be CJS
 * - bundle: true   — inlines all dynamic imports so no external files needed
 * - platform: node — uses Node.js built-ins, not browser polyfills
 */

import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, "..");

// Temporary entry that wires the SSR server to the Vercel (req,res) interface
const entryPath = join(root, "scripts", "_entry.tmp.cjs");
writeFileSync(entryPath, `
const serverModule = require(${JSON.stringify(join(root, "dist", "server", "server.js").replace(/\\/g, "/"))});
const server = serverModule.default ?? serverModule;

async function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host  = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url   = new URL(req.url, proto + "://" + host);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    if (Array.isArray(v)) v.forEach(x => headers.append(k, x));
    else headers.set(k, v);
  }
  const method  = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method);
  let body;
  if (hasBody) {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data",  c => chunks.push(c));
      req.on("end",   () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }
  return new Request(url.toString(), {
    method, headers,
    body:   hasBody && body && body.length ? body : undefined,
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

module.exports = async function handler(req, res) {
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
};
`);

// All Node.js built-in module names — both bare and node: prefixed
const nodeBuiltins = [
  "assert", "async_hooks", "buffer", "child_process", "cluster", "console",
  "constants", "crypto", "dgram", "diagnostics_channel", "dns", "domain",
  "events", "fs", "fs/promises", "http", "http2", "https", "inspector",
  "module", "net", "os", "path", "path/posix", "path/win32", "perf_hooks",
  "process", "punycode", "querystring", "readline", "repl", "stream",
  "stream/consumers", "stream/promises", "stream/web", "string_decoder",
  "sys", "timers", "timers/promises", "tls", "trace_events", "tty", "url",
  "util", "util/types", "v8", "vm", "wasi", "worker_threads", "zlib",
];
const external = [
  ...nodeBuiltins,
  ...nodeBuiltins.map(m => `node:${m}`),
];

await build({
  entryPoints: [entryPath],
  bundle:      true,
  platform:    "node",
  format:      "cjs",          // CJS — react-dom/server.node.js needs require()
  outfile:     join(root, "api", "server.js"),
  external,
  logLevel:    "warning",      // suppress the sideEffects noise
});

unlinkSync(entryPath);
console.log("✅  Bundled SSR + Vercel adapter → api/server.js (CJS)");
