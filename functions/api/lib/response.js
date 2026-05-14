/**
 * Helper functions for building JSON responses in Cloudflare Workers.
 * Workers use the Web Fetch API — no res.json(), no res.status().
 */

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function ok(data)          { return json(data, 200); }
export function created(data)     { return json(data, 201); }
export function badRequest(msg)   { return json({ error: msg }, 400); }
export function unauthorized(msg = "Unauthorized") { return json({ error: msg }, 401); }
export function forbidden(msg = "Forbidden")       { return json({ error: msg }, 403); }
export function notFound(msg = "Not found")        { return json({ error: msg }, 404); }
export function conflict(msg)     { return json({ error: msg }, 409); }
export function serverError(msg = "Internal server error") { return json({ error: msg }, 500); }
