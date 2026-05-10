import { getAdminClient } from "../lib/supabase.js";
import { authenticate, getUserRoles } from "../lib/auth.js";
import { ok, created, badRequest, conflict } from "../lib/response.js";

export function registerLessonRoutes(router) {
  /**
   * GET /api/lessons
   */
  router.get("/api/lessons", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roles = await getUserRoles(auth.user.id, env);
    const isStaff = roles.some((r) => ["branch_admin", "super_admin", "instructor"].includes(r));

    const { status, limit = "20", offset = "0" } = req.query;
    const admin = getAdminClient(env);

    let query = admin
      .from("lessons")
      .select("*, instructor:instructors(id, user_id), vehicle:vehicles(plate, type)")
      .order("scheduled_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (!isStaff) {
      const { data: student } = await admin
        .from("students")
        .select("id")
        .eq("user_id", auth.user.id)
        .single();

      if (!student) return ok({ lessons: [] });
      query = query.eq("student_id", student.id);
    }

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return badRequest(error.message);
    return ok({ lessons: data ?? [] });
  });

  /**
   * POST /api/lessons
   */
  router.post("/api/lessons", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { instructor_id, vehicle_id, scheduled_at } = req.body ?? {};
    if (!instructor_id || !scheduled_at) {
      return badRequest("instructor_id and scheduled_at are required");
    }

    const admin = getAdminClient(env);

    const { data: student, error: studentErr } = await admin
      .from("students")
      .select("id")
      .eq("user_id", auth.user.id)
      .single();

    if (studentErr || !student) {
      return badRequest("No student record found for this user");
    }

    // Conflict detection
    const { data: existing } = await admin
      .from("lessons")
      .select("id")
      .eq("instructor_id", instructor_id)
      .eq("scheduled_at", scheduled_at)
      .neq("status", "cancelled")
      .single();

    if (existing) return conflict("This instructor slot is already booked");

    const { data, error } = await admin
      .from("lessons")
      .insert({ student_id: student.id, instructor_id, vehicle_id: vehicle_id ?? null, scheduled_at, status: "pending" })
      .select()
      .single();

    if (error) return badRequest(error.message);
    return created({ lesson: data });
  });

  /**
   * PATCH /api/lessons/:id
   */
  router.patch("/api/lessons/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { status, notes, scheduled_at } = req.body ?? {};
    const updates = {};
    if (status       !== undefined) updates.status       = status;
    if (notes        !== undefined) updates.notes        = notes;
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("lessons")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return badRequest(error.message);
    return ok({ lesson: data });
  });
}
