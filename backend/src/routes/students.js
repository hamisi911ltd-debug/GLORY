import { StudentService, CourseService, BranchService, PaymentService, LessonService } from "../lib/database.js";
import { authenticate, checkRole, getUserRoles } from "../lib/auth.js";
import { ok, created, badRequest, notFound } from "../lib/response.js";

export function registerStudentRoutes(router) {
  /**
   * GET /api/students/me
   */
  router.get("/api/students/me", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return notFound("Student record not found");
      }

      // Get recent payments
      const payments = await PaymentService.list(env.DB, { 
        student_id: student.id 
      });

      // Get upcoming lessons
      const lessons = await LessonService.list(env.DB, { 
        student_id: student.id,
        status: 'scheduled'
      });

      return ok({
        student,
        payments: payments.slice(0, 5), // Last 5 payments
        upcoming_lessons: lessons.slice(0, 3) // Next 3 lessons
      });
    } catch (error) {
      console.error('Get student profile error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/students
   */
  router.get("/api/students", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "instructor", "examiner");
    if (denied) return denied;

    try {
      const { branch_id, status, search } = req.query || {};
      
      const filters = {};
      if (branch_id) filters.branch_id = branch_id;
      if (status) filters.status = status;

      let students = await StudentService.list(env.DB, filters);

      // Apply search filter if provided
      if (search) {
        const q = search.toLowerCase();
        students = students.filter((s) => 
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.student_number?.toLowerCase().includes(q)
        );
      }

      return ok({ students });
    } catch (error) {
      console.error('List students error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/students/:id
   */
  router.get("/api/students/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "instructor", "examiner");
    if (denied) return denied;

    try {
      const student = await StudentService.findById(env.DB, req.params.id);
      if (!student) {
        return notFound("Student not found");
      }

      // Get student's payments
      const payments = await PaymentService.list(env.DB, { student_id: req.params.id });

      // Get student's lessons
      const lessons = await LessonService.list(env.DB, { student_id: req.params.id });

      return ok({
        student,
        payments,
        lessons
      });
    } catch (error) {
      console.error('Get student details error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * PATCH /api/students/:id
   */
  router.patch("/api/students/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const denied = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "examiner");
    if (denied) return denied;

    try {
      const { status, progress_percentage, exam_ready, theory_completed, practical_completed } = req.body ?? {};
      const updates = {};
      
      if (status !== undefined) updates.status = status;
      if (progress_percentage !== undefined) updates.progress_percentage = progress_percentage;
      if (exam_ready !== undefined) updates.exam_ready = exam_ready;
      if (theory_completed !== undefined) updates.theory_completed = theory_completed;
      if (practical_completed !== undefined) updates.practical_completed = practical_completed;

      await StudentService.updateProgress(env.DB, req.params.id, updates);

      const student = await StudentService.findById(env.DB, req.params.id);
      
      return ok({ 
        message: "Student updated successfully",
        student 
      });
    } catch (error) {
      console.error('Update student error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/students/:id/balance
   * Get student balance details
   */
  router.get("/api/students/:id/balance", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      // Check if user can access this student's balance
      const roles = await getUserRoles(auth.user.id, env);
      const isFinance = roles.some((r) =>
        ["finance", "branch_admin", "super_admin"].includes(r),
      );

      if (!isFinance) {
        // Students can only see their own balance
        const student = await StudentService.findByUserId(env.DB, auth.user.id);
        if (!student || student.id !== req.params.id) {
          return badRequest("Access denied");
        }
      }

      const student = await StudentService.findById(env.DB, req.params.id);
      if (!student) {
        return notFound("Student not found");
      }

      // Get payment history
      const payments = await PaymentService.list(env.DB, { student_id: req.params.id });

      const balance_details = {
        course_price: student.course_price || 0,
        total_paid: student.total_paid || 0,
        balance: student.balance || 0,
        payment_history: payments
      };

      return ok({ balance_details });
    } catch (error) {
      console.error('Get student balance error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/students/dashboard/stats
   * Get dashboard statistics for students
   */
  router.get("/api/students/dashboard/stats", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return notFound("Student record not found");
      }

      // Get lesson statistics
      const allLessons = await LessonService.list(env.DB, { student_id: student.id });
      const completedLessons = allLessons.filter(l => l.status === 'completed');
      const upcomingLessons = allLessons.filter(l => l.status === 'scheduled');

      // Get payment statistics
      const payments = await PaymentService.list(env.DB, { student_id: student.id });

      const stats = {
        progress_percentage: student.progress_percentage || 0,
        lessons_completed: completedLessons.length,
        lessons_remaining: Math.max(0, 30 - completedLessons.length), // Default 30 lessons
        upcoming_lessons: upcomingLessons.length,
        theory_completed: student.theory_completed || false,
        practical_completed: student.practical_completed || false,
        exam_ready: student.exam_ready || false,
        balance: student.balance || 0,
        total_paid: student.total_paid || 0,
        course_price: student.course_price || 0,
        payment_completion: student.course_price ? 
          Math.round(((student.total_paid || 0) / student.course_price) * 100) : 0
      };

      return ok({ stats });
    } catch (error) {
      console.error('Get student dashboard stats error:', error);
      return badRequest(error.message);
    }
  });
}
