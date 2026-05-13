import { getAdminClient } from "../lib/supabase.js";
import { authenticate } from "../lib/auth.js";
import { ok, badRequest, notFound } from "../lib/response.js";

export function registerProfileRoutes(router) {
  /**
   * GET /api/profile
   */
  router.get("/api/profile", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (error) return notFound("Profile not found");
    return ok({ profile: data });
  });

  /**
   * PATCH /api/profile
   * Updates profile including avatar_url (can be set from Supabase storage)
   */
  router.patch("/api/profile", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { full_name, phone, branch_id, avatar_url, date_of_birth, national_id } = req.body ?? {};
    const updates = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (branch_id !== undefined) updates.branch_id = branch_id;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (national_id !== undefined) updates.national_id = national_id;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", auth.user.id)
      .select()
      .single();

    if (error) return badRequest(error.message);
    
    // Broadcast real-time update
    await admin
      .from("profiles")
      .on("*", { event: "UPDATE", schema: "public", table: "profiles" })
      .eq("id", auth.user.id)
      .subscribe();

    return ok({ profile: data });
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

    const admin = getAdminClient(env);
    const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
      password: newPassword,
    });

    if (error) return badRequest(error.message);
    return ok({ message: "Password updated successfully" });
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
