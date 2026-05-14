/**
 * DriveSchool Pro — Production Cloudflare Worker API
 * Fully integrated with D1 database
 * Last updated: 2026-05-14
 */

import { Router } from "./lib/router.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerProfileRoutes } from "./routes/profile.js";
import { registerStudentRoutes } from "./routes/students.js";
import { registerLessonRoutes } from "./routes/lessons.js";
import { registerPaymentRoutes } from "./routes/payments.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerStaffRoutes } from "./routes/staff.js";
import { registerCourseRoutes } from "./routes/courses.js";
import { registerTestRoutes } from "./routes/tests.js";
import { registerMessageRoutes } from "./routes/messages.js";
import { registerReportRoutes } from "./routes/reports.js";
import { cleanupExpiredSessions } from "./lib/auth.js";

const router = new Router();

registerAuthRoutes(router);
registerProfileRoutes(router);
registerStudentRoutes(router);
registerLessonRoutes(router);
registerPaymentRoutes(router);
registerNotificationRoutes(router);
registerStaffRoutes(router);
registerCourseRoutes(router);
registerTestRoutes(router);
registerMessageRoutes(router);
registerReportRoutes(router);

function corsHeaders(env, requestOrigin) {
  const allowed = env.FRONTEND_URL ?? "https://driveschool.vercel.app";
  const origin = requestOrigin === allowed || requestOrigin?.startsWith("http://localhost") ? requestOrigin : allowed;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

function addCors(response, env, requestOrigin) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(env, requestOrigin);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { ...response, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestOrigin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, requestOrigin) });
    }

    if (url.pathname === "/health") {
      return addCors(
        new Response(JSON.stringify({ 
          status: "ok", 
          service: "DriveSchool Pro API",
          timestamp: new Date().toISOString(),
          database: "D1 Connected"
        }), {
          headers: { "Content-Type": "application/json" }
        }),
        env,
        requestOrigin
      );
    }

    if (Math.random() < 0.01) {
      ctx.waitUntil(cleanupExpiredSessions(env.DB));
    }

    try {
      const response = await router.handle(request, env);
      return addCors(response, env, requestOrigin);
    } catch (error) {
      return addCors(
        new Response(JSON.stringify({ 
          error: "Internal server error"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }),
        env,
        requestOrigin
      );
    }
  },
};
