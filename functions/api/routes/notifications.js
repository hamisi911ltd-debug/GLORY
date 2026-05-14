import { getAdminClient } from "../lib/supabase.js";
import { authenticate } from "../lib/auth.js";
import { ok, badRequest } from "../lib/response.js";

export function registerNotificationRoutes(router) {
  /**
   * GET /api/notifications
   */
  router.get("/api/notifications", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { read, limit = "20" } = req.query;
    const admin = getAdminClient(env);

    let query = admin
      .from("notifications")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    if (read !== undefined) query = query.eq("read", read === "true");

    const { data, error } = await query;
    if (error) return badRequest(error.message);
    return ok({ notifications: data ?? [] });
  });

  /**
   * PATCH /api/notifications/:id/read
   */
  router.patch("/api/notifications/:id/read", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("notifications")
      .update({ read: true })
      .eq("id", req.params.id)
      .eq("user_id", auth.user.id)
      .select()
      .single();

    if (error) return badRequest(error.message);
    return ok({ notification: data });
  });

  /**
   * POST /api/notifications/read-all
   */
  router.post("/api/notifications/read-all", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const admin = getAdminClient(env);
    const { error } = await admin
      .from("notifications")
      .update({ read: true })
      .eq("user_id", auth.user.id)
      .eq("read", false);

    if (error) return badRequest(error.message);
    return ok({ message: "All notifications marked as read" });
  });
}
