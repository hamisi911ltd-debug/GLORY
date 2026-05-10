import { getAdminClient } from "../lib/supabase.js";
import { ok, created, badRequest, unauthorized } from "../lib/response.js";

export function registerAuthRoutes(router) {
  /**
   * POST /api/auth/register
   */
  router.post("/api/auth/register", async (req, env) => {
    const { email, password, firstName, lastName, phone, course, branch } = req.body ?? {};

    if (!email || !password || !firstName || !lastName) {
      return badRequest("email, password, firstName, and lastName are required");
    }
    if (password.length < 6) {
      return badRequest("Password must be at least 6 characters");
    }

    const admin = getAdminClient(env);
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: `${firstName} ${lastName}`, phone, course, branch },
    });

    if (error) return badRequest(error.message);

    await admin.from("user_roles").insert({ user_id: data.user.id, role: "student" });

    return created({
      message: "Account created. Check your email to verify.",
      userId: data.user.id,
    });
  });

  /**
   * GET /api/auth/me
   */
  router.get("/api/auth/me", async (req, env) => {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return unauthorized();

    const token = authHeader.slice(7);
    const admin = getAdminClient(env);
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data?.user) return unauthorized("Invalid token");

    const [rolesRes, profileRes] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", data.user.id),
      admin.from("profiles").select("*").eq("id", data.user.id).single(),
    ]);

    return ok({
      user: data.user,
      roles: (rolesRes.data ?? []).map((r) => r.role),
      profile: profileRes.data ?? null,
    });
  });
}
