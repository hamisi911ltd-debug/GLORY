/**
 * Bundles the TanStack Start SSR server + Vercel adapter into api/server.js
 *
 * The challenge: package.json has "type":"module" (ESM), but react-dom/server.node.js
 * is CJS and uses require(). Solution: output ESM format but inject a createRequire
 * shim so CJS require() calls work inside an ESM bundle.
 */

import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, "..");
const serverJs  = join(root, "dist", "server", "server.js").replace(/\\/g, "/");

const entryPath = join(root, "scripts", "_entry.tmp.mjs");

writeFileSync(entryPath, `
import serverModule from ${JSON.stringify(serverJs)};
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
`);

const nodeBuiltins = [
  "assert","async_hooks","buffer","child_process","cluster","console","constants",
  "crypto","dgram","diagnostics_channel","dns","domain","events","fs","fs/promises",
  "http","http2","https","inspector","module","net","os","path","path/posix",
  "path/win32","perf_hooks","process","punycode","querystring","readline","repl",
  "stream","stream/consumers","stream/promises","stream/web","string_decoder","sys",
  "timers","timers/promises","tls","trace_events","tty","url","util","util/types",
  "v8","vm","wasi","worker_threads","zlib",
];
const external = [...nodeBuiltins, ...nodeBuiltins.map(m => `node:${m}`)];

await build({
  entryPoints: [entryPath],
  bundle:      true,
  platform:    "node",
  format:      "esm",           // ESM — matches "type":"module" in package.json
  outfile:     join(root, "api", "server.js"),
  external,
  // Inject createRequire so CJS modules (react-dom/server.node.js) can use require()
  banner: {
    js: [
      `import { createRequire } from "node:module";`,
      `import { fileURLToPath as __fileURLToPath } from "node:url";`,
      `import { dirname as __dirname2 } from "node:path";`,
      `const require = createRequire(import.meta.url);`,
      `const __filename = __fileURLToPath(import.meta.url);`,
      `const __dirnameCompat = __dirname2(__filename);`,
    ].join("\n"),
  },
  logLevel: "warning",
});

unlinkSync(entryPath);
console.log("✅  Bundled SSR + Vercel adapter → api/server.js (ESM + CJS shim)");
