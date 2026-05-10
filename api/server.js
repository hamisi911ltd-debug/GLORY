/**
 * Vercel serverless function — DriveSchool Pro frontend.
 *
 * TanStack Start builds to dist/server/server.js (Web Fetch API handler).
 * Vercel's Node.js runtime uses (req, res) — this file bridges the two.
 *
 * vercel.json sets includeFiles: "dist/server/**" so the bundle
 * is available at runtime relative to the project root.
 */

import { join } from "node:path";

// __dirname is not available in ESM — use process.cwd() which Vercel sets
// to the project root at runtime.
const serverBundle = join(process.cwd(), "dist", "server", "server.js");

let server;
try {
  const mod = await import(serverBundle);
  server = mod.default;
} catch (err) {
  console.error("[Vercel] Could not load server bundle:", err.message);
}

// ── Node IncomingMessage → Web Request ───────────────────────────────────────
async function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host  = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url   = new URL(req.url, `${proto}://${host}`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined) continue;
    Array.isArray(v) ? v.forEach((x) => headers.append(k, x)) : headers.set(k, v);
  }

  const method  = req.method ?? "GET";
  const hasBody = !["GET", "HEAD"].includes(method);
  let body;

  if (hasBody) {
    body = await new Promise((res, rej) => {
      const chunks = [];
      req.on("data",  (c) => chunks.push(c));
      req.on("end",   () => res(Buffer.concat(chunks)));
      req.on("error", rej);
    });
  }

  return new Request(url.toString(), {
    method,
    headers,
    body:   hasBody && body?.length ? body : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

// ── Web Response → Node ServerResponse ───────────────────────────────────────
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
    } finally {
      reader.releaseLock();
    }
  }
  res.end();
}

// ── Vercel handler ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (!server) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("Server bundle failed to load. Check build logs.");
    return;
  }
  try {
    const webReq = await toWebRequest(req);
    const webRes = await server.fetch(webReq, process.env, {});
    await toNodeResponse(webRes, res);
  } catch (err) {
    console.error("[handler]", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html");
    res.end(`<h1>500</h1><p>${err.message}</p>`);
  }
}
