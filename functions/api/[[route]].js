/**
 * Cloudflare Pages Function - API Handler
 * Handles all /api/* requests
 */

function corsHeaders(requestOrigin) {
  const origin = requestOrigin?.startsWith("http://localhost") || requestOrigin?.includes("immacurate.co.ke") 
    ? requestOrigin 
    : "https://immacurate.co.ke";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200, requestOrigin = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (requestOrigin) {
    Object.assign(headers, corsHeaders(requestOrigin));
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const requestOrigin = request.headers.get("Origin");
  const url = new URL(request.url);

  console.log(`[API] ${request.method} ${url.pathname}`);

  try {
    // Handle OPTIONS for CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        status: 204, 
        headers: corsHeaders(requestOrigin) 
      });
    }

    // Health check
    if (url.pathname === "/api/health" || url.pathname === "/api/health/") {
      return jsonResponse({ 
        status: "ok", 
        service: "DriveSchool Pro API",
        timestamp: new Date().toISOString(),
        database: env.DB ? "D1 Connected" : "No DB binding - Configure in Cloudflare Pages Settings",
        path: url.pathname,
        method: request.method
      }, 200, requestOrigin);
    }

    // Check if DB is available
    if (!env.DB) {
      console.error('[API] No DB binding found');
      return jsonResponse({ 
        error: "Database not configured",
        message: "Please add D1 database binding named 'DB' in Cloudflare Pages settings",
        instructions: "Go to Pages Settings > Functions > D1 database bindings"
      }, 503, requestOrigin);
    }

    // Simple login handler
    if (url.pathname === "/api/login" || url.pathname === "/api/auth/login") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, requestOrigin);
      }

      try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          return jsonResponse({ 
            error: "Email and password are required" 
          }, 400, requestOrigin);
        }

        // Query database for user
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).bind(email).first();

        if (!user) {
          return jsonResponse({ 
            error: "Invalid email or password" 
          }, 401, requestOrigin);
        }

        // For now, return success (password verification will be added)
        return jsonResponse({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name
          },
          roles: ["student"],
          token: "temp-token-" + Date.now()
        }, 200, requestOrigin);

      } catch (error) {
        console.error('[API] Login error:', error);
        return jsonResponse({ 
          error: "Login failed",
          message: error.message 
        }, 500, requestOrigin);
      }
    }

    // Default response for unhandled routes
    return jsonResponse({ 
      error: "Not found",
      message: `Route ${url.pathname} not implemented yet`,
      availableRoutes: ["/api/health", "/api/login", "/api/auth/login"]
    }, 404, requestOrigin);
    
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return jsonResponse({ 
      error: "Internal server error",
      message: error.message || "Unknown error"
    }, 500, requestOrigin);
  }
}
