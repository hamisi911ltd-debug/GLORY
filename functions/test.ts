/**
 * Simple test function to verify Cloudflare Pages Functions are working
 */

export const onRequest: PagesFunction = async (context) => {
  return new Response(JSON.stringify({
    message: "Functions are working!",
    timestamp: new Date().toISOString(),
    path: new URL(context.request.url).pathname
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
