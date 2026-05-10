import { getAdminClient } from "./supabase.js";
import { unauthorized, forbidden, serverError } from "./response.js";

/**
 * Extracts and validates the Bearer token from the Authorization header.
 * Returns { user, token } on success, or a Response on failure.
 */
export async function authenticate(request, env) {
  const authHeader = request.headers.get("Authorization") ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return { error: unauthorized("Missing or invalid Authorization header") };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { error: unauthorized("No token provided") };
  }

  try {
    const admin = getAdminClient(env);
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data?.user) {
      return { error: unauthorized("Invalid or expired token") };
    }

    return { user: data.user, token };
  } catch (err) {
    console.error("[auth]", err);
    return { error: serverError("Authentication check failed") };
  }
}

/**
 * Fetches the user's roles from the user_roles table.
 * Returns an array of role strings.
 */
export async function getUserRoles(userId, env) {
  const admin = getAdminClient(env);
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}

/**
 * Returns a forbidden Response if the user doesn't have one of the required roles.
 * Returns null if access is granted.
 */
export async function checkRole(userId, env, ...requiredRoles) {
  const roles = await getUserRoles(userId, env);
  const hasRole = requiredRoles.some((r) => roles.includes(r));
  if (!hasRole) {
    return forbidden(`Access denied. Required: ${requiredRoles.join(" or ")}`);
  }
  return null; // access granted
}
