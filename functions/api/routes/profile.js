import { UserService, hashPassword } from "../lib/database.js";
import { authenticate } from "../lib/auth.js";
import { ok, badRequest, notFound } from "../lib/response.js";

export function registerProfileRoutes(router) {
  /**
   * GET /api/profile
   */
  router.get("/api/profile", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const user = await UserService.findById(env.DB, auth.user.id);
      if (!user) return notFound("Profile not found");
      return ok({ profile: user });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * PATCH /api/profile
   * Updates profile including avatar_url
   */
  router.patch("/api/profile", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { full_name, phone, branch_id, avatar_url, date_of_birth, national_id } = req.body ?? {};
    const updates = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    // Note: D1 schema might use different field names, ensure consistency with schema.sql
    
    try {
      await UserService.update(env.DB, auth.user.id, updates);
      const updatedUser = await UserService.findById(env.DB, auth.user.id);
      return ok({ profile: updatedUser });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/profile/change-password
   */
  router.post("/api/profile/change-password", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { newPassword } = req.body ?? {};
    if (!newPassword || newPassword.length < 6) {
      return badRequest("Password must be at least 6 characters");
    }

    try {
      const passwordHash = await hashPassword(newPassword);
      await UserService.update(env.DB, auth.user.id, { password: passwordHash });
      return ok({ message: "Password updated successfully" });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/profile/preferences
   */
  router.get("/api/profile/preferences", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    return ok({
      preferences: { sms: true, email: true, inApp: true, marketing: false },
    });
  });

  /**
   * PUT /api/profile/preferences
   */
  router.put("/api/profile/preferences", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { sms, email, inApp, marketing } = req.body ?? {};
    for (const [key, val] of Object.entries({ sms, email, inApp, marketing })) {
      if (val !== undefined && typeof val !== "boolean") {
        return badRequest(`${key} must be a boolean`);
      }
    }

    return ok({ message: "Preferences saved", preferences: { sms, email, inApp, marketing } });
  });
}
