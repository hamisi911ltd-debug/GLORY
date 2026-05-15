import { NotificationService } from "../lib/database.js";
import { authenticate } from "../lib/auth.js";
import { ok, badRequest } from "../lib/response.js";

export function registerNotificationRoutes(router) {
  /**
   * GET /api/notifications
   */
  router.get("/api/notifications", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const { read, limit = "20" } = req.query;
      const filters = {};
      if (read !== undefined) filters.read_status = (read === "true");

      const notifications = await NotificationService.list(env.DB, auth.user.id, filters);
      return ok({ notifications: notifications.slice(0, Number(limit)) });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * PATCH /api/notifications/:id/read
   */
  router.patch("/api/notifications/:id/read", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      await NotificationService.markAsRead(env.DB, req.params.id, auth.user.id);
      return ok({ message: "Notification marked as read" });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/notifications/read-all
   */
  router.post("/api/notifications/read-all", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      await NotificationService.markAllAsRead(env.DB, auth.user.id);
      return ok({ message: "All notifications marked as read" });
    } catch (error) {
      return badRequest(error.message);
    }
  });
}
