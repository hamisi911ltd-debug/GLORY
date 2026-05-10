/**
 * DriveSchool Pro — Cloudflare Worker API
 *
 * Single entry point. Cloudflare Workers use the Web Fetch API:
 *   export default { fetch(request, env, ctx) }
 *
 * env contains all secrets set via `wrangler secret put`:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, FRONTEND_URL
 */

import { Router } from "./lib/router.js";
import { registerAuthRoutes }         from "./routes/auth.js";
import { registerProfileRoutes }      from "./routes/profile.js";
import { registerStudentRoutes }      from "./routes/students.js";
import { registerLessonRoutes }       from "./routes/lessons.js";
import { registerPaymentRoutes }      from "./routes/payments.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerStaffRoutes }        from "./routes/staff.js";

// ── Build the router once at module load time ─────────────────────────────────
const router = new Router();

registerAuthRoutes(router);
registerProfileRoutes(router);
registerStudentRoutes(router);
registerLessonRoutes(router);
registerPaymentRoutes(router);
registerNotificationRoutes(router);
registerStaffRoutes(router);

// ── CORS headers ──────────────────────────────────────────────────────────────
function corsHeaders(env, requestOrigin) {
  const allowed = env.FRONTEND_URL ?? "https://driveschool.vercel.app";
  // Allow the configured origin OR localhost for local dev
  const origin =
    requestOrigin === allowed || requestOrigin?.startsWith("http://localhost")
      ? requestOrigin
      : allowed;

  return {
    "Access-Control-Allow-Origin":  origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

function addCors(response, env, requestOrigin) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(env, requestOrigin))) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status:     response.status,
    statusText: response.statusText,
    headers,
  });
}

// ── Worker export ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") ?? "";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env, origin),
      });
    }

    // Health check — no auth needed
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return addCors(
        new Response(
          JSON.stringify({
            status: "ok",
            service: "DriveSchool Pro API",
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
        env,
        origin,
      );
    }

    // Route the request
    let response;
    try {
      response = await router.handle(request, env, ctx);
    } catch (err) {
      console.error("[Worker unhandled error]", err);
      response = new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return addCors(response, env, origin);
  },
};
