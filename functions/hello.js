/**
 * Simple test function to verify Functions are working
 */

export async function onRequest(context) {
  return new Response(JSON.stringify({
    message: "Hello from Cloudflare Pages Functions!",
    timestamp: new Date().toISOString(),
    working: true
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
