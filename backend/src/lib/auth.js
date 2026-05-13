import jwt from '@tuxcode/cloudflare-worker-jwt';
import { UserService, generateId } from "./database.js";
import { unauthorized, badRequest, forbidden, serverError } from "./response.js";

/**
 * JWT Authentication for Cloudflare D1
 */

/**
 * Generate JWT token for user
 */
export async function generateToken(user, env) {
  const payload = {
    sub: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return await jwt.sign(payload, env.JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token, env) {
  try {
    const payload = await jwt.verify(token, env.JWT_SECRET);
    return { success: true, payload };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extracts and validates the Bearer token from the Authorization header.
 * Returns { user, token } on success, or { error } on failure.
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
    const verification = await verifyToken(token, env);
    
    if (!verification.success) {
      return { error: unauthorized("Invalid or expired token") };
    }

    const user = await UserService.findById(env.DB, verification.payload.sub);
    if (!user) {
      return { error: unauthorized("User not found") };
    }

    return { user, token };
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
  return await UserService.getRoles(env.DB, userId);
}

/**
 * Returns a forbidden Response if the user doesn't have one of the required roles.
 * Returns null if access is granted.
 */
export async function checkRole(userId, env, ...requiredRoles) {
  const roles = await getUserRoles(userId, env);
  const hasRole = requiredRoles.some((r) => roles.includes(r)) || roles.includes('super_admin');
  if (!hasRole) {
    return forbidden(`Access denied. Required: ${requiredRoles.join(" or ")}`);
  }
  return null; // access granted
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request, env) {
  const auth = await authenticate(request, env);
  if (auth.error) {
    return auth.error;
  }
  return auth;
}

/**
 * Middleware to require specific role
 */
export async function requireRole(request, env, requiredRole) {
  const auth = await requireAuth(request, env);
  if (auth.error) return auth.error;
  
  const roleCheck = await checkRole(auth.user.id, env, requiredRole);
  if (roleCheck) return roleCheck;
  
  return auth;
}

/**
 * Middleware to require any of the specified roles
 */
export async function requireAnyRole(request, env, requiredRoles) {
  const auth = await requireAuth(request, env);
  if (auth.error) return auth.error;
  
  const roleCheck = await checkRole(auth.user.id, env, ...requiredRoles);
  if (roleCheck) return roleCheck;
  
  return auth;
}

/**
 * Create session record for token tracking
 */
export async function createSession(db, userId, token) {
  const sessionId = generateId();
  const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(); // 24 hours
  
  const query = `
    INSERT INTO sessions (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `;
  
  const stmt = db.prepare(query);
  await stmt.bind(sessionId, userId, Array.from(new Uint8Array(tokenHash)).map(b => b.toString(16).padStart(2, '0')).join(''), expiresAt).run();
  
  return sessionId;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(db) {
  const query = `DELETE FROM sessions WHERE expires_at < ?`;
  const stmt = db.prepare(query);
  return await stmt.bind(new Date().toISOString()).run();
}
