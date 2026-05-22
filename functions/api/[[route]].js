/**
 * Cloudflare Pages Function - API Proxy Handler
 * This proxies all /api/* requests to the backend Worker
 * The actual API logic is in the backend Worker deployed separately
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const requestOrigin = request.headers.get("Origin");

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": requestOrigin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // Handle OPTIONS for CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Simple health check
  if (url.pathname === "/api/health" || url.pathname === "/api/health/") {
    return new Response(JSON.stringify({ 
      status: "ok", 
      service: "DriveSchool Pro API Proxy",
      timestamp: new Date().toISOString(),
      note: "API requests are handled by the backend Worker"
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }

  // For now, return a message indicating the backend Worker needs to be deployed
  // In production, you would proxy to your backend Worker URL
  return new Response(JSON.stringify({ 
    error: "Backend not configured",
    message: "The backend Worker needs to be deployed and configured. Please deploy the backend Worker from the /backend directory.",
    endpoint: url.pathname,
    method: request.method
  }), { 
    status: 503, 
    headers: { "Content-Type": "application/json", ...corsHeaders } 
  });
}
