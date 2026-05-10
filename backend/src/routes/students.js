import { getAdminClient } from "../lib/supabase.js";
import { authenticate, checkRole } from "../lib/auth.js";
import { ok, badRequest, notFound } from "../lib/response.js";

export function registerStudentRoutes(router) {
  /**
   * GET /api/students/me
   */
  router.get("/api/students/me", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("students")
      .select("*, course:courses(name, vehicle_type, lesson_count)")
      .eq("user_id", auth.user.id)
      .single();

    if (error) return notFound("Student record not found");
    return ok({ student: data });
  });

  /**
   * GET /api/students
   */
  router.get("/api/students", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "instructor", "examiner");
    if (denied) return denied;

    const { branch_id, status, search } = req.query;
    const admin = getAdminClient(env);

    let query = admin
      .from("students")
      .select("*, user:profiles(full_name, phone, avatar_url), course:courses(name, vehicle_type)")
      .order("enrolled_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return badRequest(error.message);

    let students = data ?? [];
    if (search) {
      const q = search.toLowerCase();
      students = students.filter((s) => s.user?.full_name?.toLowerCase().includes(q));
    }

    return ok({ students });
  });

  /**
   * GET /api/students/:id
   */
  router.get("/api/students/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "instructor", "examiner");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("students")
      .select("*, user:profiles(*), course:courses(*)")
      .eq("id", req.params.id)
      .single();

    if (error) return notFound("Student not found");
    return ok({ student: data });
  });

  /**
   * PATCH /api/students/:id
   */
  router.patch("/api/students/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "examiner");
    if (denied) return denied;

    const { status, progress_pct, exam_ready } = req.body ?? {};
    const updates = {};
    if (status       !== undefined) updates.status       = status;
    if (progress_pct !== undefined) updates.progress_pct = progress_pct;
    if (exam_ready   !== undefined) updates.exam_ready   = exam_ready;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("students")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return badRequest(error.message);
    return ok({ student: data });
  });
}
