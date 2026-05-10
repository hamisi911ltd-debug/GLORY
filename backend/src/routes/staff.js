import { getAdminClient } from "../lib/supabase.js";
import { authenticate, checkRole } from "../lib/auth.js";
import { ok, created, badRequest, notFound } from "../lib/response.js";

export function registerStaffRoutes(router) {
  // ── Branch Admin ────────────────────────────────────────────────────────────

  /**
   * GET /api/staff/branch/stats
   */
  router.get("/api/staff/branch/stats", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString();
    const todayStart = new Date().toISOString().split("T")[0];

    const [studentsRes, lessonsRes, paymentsRes, vehiclesRes] = await Promise.all([
      admin.from("students").select("id", { count: "exact", head: true }),
      admin
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .gte("scheduled_at", todayStart),
      admin
        .from("payments")
        .select("amount")
        .eq("status", "paid")
        .gte("created_at", monthStart),
      admin.from("vehicles").select("id, status"),
    ]);

    const revenue = (paymentsRes.data ?? []).reduce((s, p) => s + (p.amount || 0), 0);
    const vehicles = vehiclesRes.data ?? [];

    return ok({
      activeStudents: studentsRes.count ?? 0,
      lessonsToday: lessonsRes.count ?? 0,
      revenueThisMonth: revenue,
      vehiclesAvailable: vehicles.filter((v) => v.status === "available").length,
      vehiclesTotal: vehicles.length,
    });
  });

  // ── Fleet ───────────────────────────────────────────────────────────────────

  /**
   * GET /api/staff/fleet
   */
  router.get("/api/staff/fleet", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const { data, error } = await admin.from("vehicles").select("*").order("plate");
    if (error) return badRequest(error.message);
    return ok({ vehicles: data ?? [] });
  });

  /**
   * POST /api/staff/fleet
   */
  router.post("/api/staff/fleet", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin");
    if (denied) return denied;

    const { plate, type, year, branch_id } = req.body ?? {};
    if (!plate || !type) return badRequest("plate and type are required");

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("vehicles")
      .insert({ plate, type, year, branch_id, status: "available" })
      .select()
      .single();

    if (error) return badRequest(error.message);
    return created({ vehicle: data });
  });

  /**
   * PATCH /api/staff/fleet/:id
   */
  router.patch("/api/staff/fleet/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin");
    if (denied) return denied;

    const { status, last_service_at } = req.body ?? {};
    const updates = {};
    if (status)          updates.status          = status;
    if (last_service_at) updates.last_service_at = last_service_at;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("vehicles")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return badRequest(error.message);
    return ok({ vehicle: data });
  });

  // ── Instructor ──────────────────────────────────────────────────────────────

  /**
   * GET /api/staff/instructor/schedule
   */
  router.get("/api/staff/instructor/schedule", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "instructor", "branch_admin", "super_admin");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const { data: instructor } = await admin
      .from("instructors")
      .select("id")
      .eq("user_id", auth.user.id)
      .single();

    if (!instructor) return notFound("Instructor record not found");

    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await admin
      .from("lessons")
      .select("*, student:students(id, user:profiles(full_name)), vehicle:vehicles(plate, type)")
      .eq("instructor_id", instructor.id)
      .gte("scheduled_at", `${today}T00:00:00`)
      .lte("scheduled_at", `${today}T23:59:59`)
      .order("scheduled_at");

    if (error) return badRequest(error.message);
    return ok({ lessons: data ?? [] });
  });

  // ── Examiner ────────────────────────────────────────────────────────────────

  /**
   * GET /api/staff/examiner/students
   */
  router.get("/api/staff/examiner/students", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "examiner", "super_admin");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("students")
      .select("*, user:profiles(full_name), course:courses(name, vehicle_type)")
      .eq("exam_ready", false)
      .order("enrolled_at");

    if (error) return badRequest(error.message);
    return ok({ students: data ?? [] });
  });

  /**
   * POST /api/staff/examiner/assess/:studentId
   */
  router.post("/api/staff/examiner/assess/:studentId", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "examiner", "super_admin");
    if (denied) return denied;

    const { mock_score, exam_ready } = req.body ?? {};
    if (mock_score === undefined || exam_ready === undefined) {
      return badRequest("mock_score and exam_ready are required");
    }

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("students")
      .update({ exam_ready, progress_pct: mock_score })
      .eq("id", req.params.studentId)
      .select()
      .single();

    if (error) return badRequest(error.message);
    return ok({ student: data });
  });

  // ── Super Admin ─────────────────────────────────────────────────────────────

  /**
   * GET /api/staff/platform/stats
   */
  router.get("/api/staff/platform/stats", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "super_admin");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString();

    const [studentsRes, revenueRes, lessonsRes, instructorsRes, branchesRes, certsRes] =
      await Promise.all([
        admin.from("students").select("id", { count: "exact", head: true }),
        admin.from("payments").select("amount").eq("status", "paid").gte("created_at", monthStart),
        admin.from("lessons").select("id", { count: "exact", head: true }).eq("status", "in-progress"),
        admin.from("instructors").select("id", { count: "exact", head: true }),
        admin.from("branches").select("id", { count: "exact", head: true }),
        admin.from("certificates").select("id", { count: "exact", head: true }),
      ]);

    const revenueMTD = (revenueRes.data ?? []).reduce((s, p) => s + (p.amount || 0), 0);

    return ok({
      totalStudents:       studentsRes.count   ?? 0,
      revenueMTD,
      activeLessonsNow:    lessonsRes.count    ?? 0,
      registeredInstructors: instructorsRes.count ?? 0,
      branchesOnline:      branchesRes.count   ?? 0,
      certificatesIssued:  certsRes.count      ?? 0,
    });
  });

  /**
   * GET /api/staff/users
   * Platform-wide user list for super admin.
   */
  router.get("/api/staff/users", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "super_admin");
    if (denied) return denied;

    const admin = getAdminClient(env);
    const { data, error } = await admin
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });

    if (error) return badRequest(error.message);
    return ok({ users: data ?? [] });
  });
}
