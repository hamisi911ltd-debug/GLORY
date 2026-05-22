/**
 * Simple test function to verify Cloudflare Pages Functions are working
 * Updated: 2026-05-15
 */

export async function onRequest(context) {
  return new Response(JSON.stringify({
    message: "Hello from Cloudflare Pages Functions!",
    timestamp: new Date().toISOString(),
    working: true,
    version: "1.0.1"
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
