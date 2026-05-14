/**
 * Cloudflare Pages Function - Catch-all API Handler
 * Robust JavaScript implementation that integrates all sub-routes.
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

const router = new Router();

// Register all API sub-modules
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
  const allowed = env.FRONTEND_URL ?? "https://immacurate.co.ke";
  const origin = requestOrigin === allowed || requestOrigin?.startsWith("http://localhost") 
    ? requestOrigin 
    : allowed;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const requestOrigin = request.headers.get("Origin");

  // Log incoming requests
  console.log(`[API] ${request.method} ${url.pathname}`);

  // Handle OPTIONS for CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders(env, requestOrigin) 
    });
  }

  // Health check
  if (url.pathname === "/api/health" || url.pathname === "/api/health/") {
    const data = { 
      status: "ok", 
      service: "DriveSchool Pro API",
      timestamp: new Date().toISOString(),
      database: env.DB ? "D1 Connected" : "Missing DB Binding"
    };
    
    const headers = { "Content-Type": "application/json" };
    Object.assign(headers, corsHeaders(env, requestOrigin));
    
    return new Response(JSON.stringify(data), { status: 200, headers });
  }

  try {
    // Check if DB is available
    if (!env.DB) {
      const errorData = { 
        error: "Database configuration error",
        message: "D1 database binding 'DB' not found in environment."
      };
      return new Response(JSON.stringify(errorData), { 
        status: 503, 
        headers: { "Content-Type": "application/json", ...corsHeaders(env, requestOrigin) } 
      });
    }

    // Handle the request using the router
    const response = await router.handle(request, env, context);
    
    // Add CORS headers to the response
    const headers = new Headers(response.headers);
    const cors = corsHeaders(env, requestOrigin);
    Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
    
    // Create a new response with the same body but updated headers
    return new Response(response.status === 204 ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });

  } catch (error) {
    console.error(`[API Error] ${url.pathname}:`, error);
    
    const errorData = { 
      error: "Internal server error",
      message: error.message || "An unexpected error occurred"
    };
    
    return new Response(JSON.stringify(errorData), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders(env, requestOrigin) } 
    });
  }
}
