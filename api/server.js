/**
 * Vercel serverless function — DriveSchool Pro SSR handler.
 * Built with @vercel/node builder.
 *
 * TanStack Start outputs a Web Fetch API handler at dist/server/server.js.
 * This adapter converts Vercel's (req, res) to Web Request/Response.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// dist/server/ is included via vercel.json builds[].config.includeFiles
const bundlePath = path.join(__dirname, "..", "dist", "server", "server.js");

let server = null;
try {
  const mod = await import(bundlePath);
  server = mod.default ?? mod;
} catch (err) {
  console.error("[SSR] Failed to load bundle:", bundlePath, "\n", err.message);
}

async function toWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host  = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url   = new URL(req.url, `${proto}://${host}`);

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
    method,
    headers,
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
    } finally {
      reader.releaseLock();
    }
  }
  res.end();
}

export default async function handler(req, res) {
  if (!server) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("Server bundle failed to load. Check Vercel build logs.");
    return;
  }
  try {
    const webReq = await toWebRequest(req);
    const webRes = await server.fetch(webReq, process.env, {});
    await toNodeResponse(webRes, res);
  } catch (err) {
    console.error("[handler error]", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html");
    res.end(`<!doctype html><html><body><h1>500</h1><p>${err.message}</p></body></html>`);
  }
}
