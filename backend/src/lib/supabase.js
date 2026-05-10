import { createClient } from "@supabase/supabase-js";

/**
 * Admin client — bypasses RLS.
 * env is the Cloudflare Worker env bindings object (secrets + vars).
 */
export function getAdminClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Anon client — respects RLS.
 */
export function getAnonClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * User-scoped client — respects RLS, acts as the authenticated user.
 */
export function getUserClient(env, accessToken) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
