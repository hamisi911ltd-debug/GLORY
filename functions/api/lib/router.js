/**
 * Minimal URL router for Cloudflare Workers.
 * Supports path params like /api/students/:id
 */
export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, handler) {
    // Convert /api/students/:id → regex with named groups
    const keys = [];
    const regexStr = pattern
      .replace(/\//g, "\\/")
      .replace(/:([a-zA-Z_]+)/g, (_, key) => {
        keys.push(key);
        return "([^/]+)";
      });
    const regex = new RegExp(`^${regexStr}$`);
    this.routes.push({ method, regex, keys, handler });
  }

  get(pattern, handler)    { this.add("GET",    pattern, handler); }
  post(pattern, handler)   { this.add("POST",   pattern, handler); }
  put(pattern, handler)    { this.add("PUT",    pattern, handler); }
  patch(pattern, handler)  { this.add("PATCH",  pattern, handler); }
  delete(pattern, handler) { this.add("DELETE", pattern, handler); }

  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // Handle OPTIONS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = pathname.match(route.regex);
      if (!match) continue;

      // Build params object from named groups
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });

      // Parse body for mutating methods
      let body = null;
      if (["POST", "PUT", "PATCH"].includes(method)) {
        try {
          const ct = request.headers.get("content-type") ?? "";
          if (ct.includes("application/json")) {
            body = await request.json();
          }
        } catch {
          body = null;
        }
      }

      // Build a context object similar to Express req
      const req = {
        url,
        method,
        params,
        body,
        headers: request.headers,
        query: Object.fromEntries(url.searchParams),
        raw: request,
      };

      return route.handler(req, env, ctx);
    }

    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}
