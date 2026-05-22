/**
 * Cloudflare Pages Function - API Handler
 * This handler proxies requests to the deployed backend Worker
 * 
 * DEPLOYMENT NOTE:
 * 1. Deploy the backend Worker first: cd backend && wrangler deploy
 * 2. Update BACKEND_WORKER_URL below with your Worker URL
 * 3. Or set it as an environment variable in Cloudflare Pages
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

  // Get backend Worker URL from environment or use default
  const BACKEND_WORKER_URL = env.BACKEND_WORKER_URL || "https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev";

  // Simple health check (doesn't require backend)
  if (url.pathname === "/api/health" || url.pathname === "/api/health/") {
    return new Response(JSON.stringify({ 
      status: "ok", 
      service: "DriveSchool Pro API Proxy",
      timestamp: new Date().toISOString(),
      backend: BACKEND_WORKER_URL,
      note: "This is the Pages Function proxy. Backend Worker handles actual API logic."
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }

  // Proxy all other requests to the backend Worker
  try {
    // Remove /api prefix and forward to backend
    const backendPath = url.pathname.replace(/^\/api/, '');
    const backendUrl = `${BACKEND_WORKER_URL}${backendPath}${url.search}`;

    // Forward the request to the backend Worker
    const backendRequest = new Request(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const backendResponse = await fetch(backendRequest);

    // Return the backend response with CORS headers
    const responseHeaders = new Headers(backendResponse.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Backend proxy error:', error);
    return new Response(JSON.stringify({ 
      error: "Backend unavailable",
      message: "Could not connect to backend Worker. Please ensure it's deployed.",
      details: error.message,
      backend: BACKEND_WORKER_URL
    }), { 
      status: 503, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }
}
