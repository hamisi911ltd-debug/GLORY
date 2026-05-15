import { StudentService, PaymentService, LessonService, VehicleService, InstructorService, BranchService, UserService } from "../lib/database.js";
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

    try {
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();
      const todayStart = new Date().toISOString().split("T")[0];

      // Use D1 queries instead of Supabase
      const [students, lessonsToday, paymentsMonth, vehicles] = await Promise.all([
        StudentService.list(env.DB),
        LessonService.list(env.DB, { date: todayStart }),
        PaymentService.list(env.DB, { status: 'completed' }), // We'll filter by date in JS for simplicity or add it to service
        VehicleService.list(env.DB),
      ]);

      const revenue = paymentsMonth
        .filter(p => p.created_at >= monthStart)
        .reduce((s, p) => s + (p.amount || 0), 0);

      return ok({
        activeStudents: students.length,
        lessonsToday: lessonsToday.length,
        revenueThisMonth: revenue,
        vehiclesAvailable: vehicles.filter((v) => v.status === "active" || v.status === "available").length,
        vehiclesTotal: vehicles.length,
      });
    } catch (error) {
      return badRequest(error.message);
    }
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

    try {
      const vehicles = await VehicleService.list(env.DB);
      return ok({ vehicles });
    } catch (error) {
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/staff/fleet
   */
  router.post("/api/staff/fleet", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin");
    if (denied) return denied;

    const { plate, type, year, branch_id, make, model } = req.body ?? {};
    if (!plate || !type) return badRequest("plate and type are required");

    try {
      const vehicle = await VehicleService.create(env.DB, {
        plate_number: plate,
        vehicle_type: type,
        year: year || new Date().getFullYear(),
        branch_id,
        make: make || "Generic",
        model: model || "Model",
        status: "active"
      });
      return created({ vehicle });
    } catch (error) {
      return badRequest(error.message);
    }
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
    if (last_service_at) updates.last_service_date = last_service_at;

    try {
      await VehicleService.update(env.DB, req.params.id, updates);
      return ok({ message: "Vehicle updated" });
    } catch (error) {
      return badRequest(error.message);
    }
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

    try {
      const instructor = await InstructorService.findByUserId(env.DB, auth.user.id);
      if (!instructor) return notFound("Instructor record not found");

      const today = new Date().toISOString().split("T")[0];
      const lessons = await LessonService.list(env.DB, {
        instructor_id: instructor.id,
        date: today
      });

      return ok({ lessons });
    } catch (error) {
      return badRequest(error.message);
    }
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

    try {
      const students = await StudentService.list(env.DB, { exam_ready: false });
      return ok({ students });
    } catch (error) {
      return badRequest(error.message);
    }
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

    try {
      await StudentService.updateProgress(env.DB, req.params.studentId, {
        exam_ready,
        progress_percentage: mock_score
      });
      return ok({ message: "Student assessment updated" });
    } catch (error) {
      return badRequest(error.message);
    }
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

    try {
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const [students, payments, lessons, instructors, branches] = await Promise.all([
        StudentService.list(env.DB),
        PaymentService.list(env.DB, { status: 'completed' }),
        LessonService.list(env.DB, { status: 'in-progress' }),
        InstructorService.list(env.DB),
        BranchService.list(env.DB),
      ]);

      const revenueMTD = payments
        .filter(p => p.created_at >= monthStart)
        .reduce((s, p) => s + (p.amount || 0), 0);

      return ok({
        totalStudents:         students.length,
        revenueMTD,
        activeLessonsNow:      lessons.length,
        registeredInstructors: instructors.length,
        branchesOnline:        branches.length,
        certificatesIssued:    0, // TODO: Implement certificates
      });
    } catch (error) {
      return badRequest(error.message);
    }
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

    try {
      const users = await env.DB.prepare(`
        SELECT u.*, GROUP_CONCAT(ur.role) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `).all();

      return ok({ users: users.results || [] });
    } catch (error) {
      return badRequest(error.message);
    }
  });
}
