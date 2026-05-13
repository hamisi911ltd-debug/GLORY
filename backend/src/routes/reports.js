import { executeQuery } from "../lib/database.js";
import { authenticate, checkRole } from "../lib/auth.js";
import { ok, badRequest } from "../lib/response.js";

export function registerReportRoutes(router) {
  /**
   * GET /api/reports/dashboard
   * Get dashboard statistics (admin only)
   */
  router.get("/api/reports/dashboard", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "finance");
    if (roleCheck) return roleCheck;

    try {
      // Get total students
      const studentsQuery = `SELECT COUNT(*) as total FROM students WHERE status = 'active'`;
      const studentsResult = await executeQuery(env.DB, studentsQuery);
      const totalStudents = studentsResult.results?.[0]?.total || 0;

      // Get total revenue
      const revenueQuery = `SELECT SUM(amount) as total FROM payments WHERE status = 'completed'`;
      const revenueResult = await executeQuery(env.DB, revenueQuery);
      const totalRevenue = revenueResult.results?.[0]?.total || 0;

      // Get pending payments
      const pendingQuery = `SELECT SUM(balance) as total FROM students WHERE balance > 0`;
      const pendingResult = await executeQuery(env.DB, pendingQuery);
      const pendingPayments = pendingResult.results?.[0]?.total || 0;

      // Get lessons this month
      const lessonsQuery = `
        SELECT COUNT(*) as total 
        FROM lessons 
        WHERE scheduled_date >= date('now', 'start of month')
        AND status = 'completed'
      `;
      const lessonsResult = await executeQuery(env.DB, lessonsQuery);
      const lessonsThisMonth = lessonsResult.results?.[0]?.total || 0;

      // Get graduation rate
      const graduatedQuery = `SELECT COUNT(*) as total FROM students WHERE status = 'graduated'`;
      const graduatedResult = await executeQuery(env.DB, graduatedQuery);
      const totalGraduated = graduatedResult.results?.[0]?.total || 0;

      const stats = {
        total_students: totalStudents,
        total_revenue: totalRevenue,
        pending_payments: pendingPayments,
        lessons_this_month: lessonsThisMonth,
        total_graduated: totalGraduated,
        graduation_rate: totalStudents > 0 ? Math.round((totalGraduated / (totalStudents + totalGraduated)) * 100) : 0
      };

      return ok({ stats });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/reports/revenue
   * Get revenue reports (finance only)
   */
  router.get("/api/reports/revenue", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "finance", "branch_admin", "super_admin");
    if (roleCheck) return roleCheck;

    try {
      const { period = 'month' } = req.query || {};
      
      let dateFilter = '';
      if (period === 'week') {
        dateFilter = "AND payment_date >= date('now', '-7 days')";
      } else if (period === 'month') {
        dateFilter = "AND payment_date >= date('now', 'start of month')";
      } else if (period === 'year') {
        dateFilter = "AND payment_date >= date('now', 'start of year')";
      }

      // Revenue by payment method
      const methodQuery = `
        SELECT payment_method, SUM(amount) as total, COUNT(*) as count
        FROM payments 
        WHERE status = 'completed' ${dateFilter}
        GROUP BY payment_method
      `;
      const methodResult = await executeQuery(env.DB, methodQuery);

      // Daily revenue for the period
      const dailyQuery = `
        SELECT DATE(payment_date) as date, SUM(amount) as total
        FROM payments 
        WHERE status = 'completed' ${dateFilter}
        GROUP BY DATE(payment_date)
        ORDER BY date
      `;
      const dailyResult = await executeQuery(env.DB, dailyQuery);

      return ok({
        by_method: methodResult.results || [],
        daily_revenue: dailyResult.results || []
      });
    } catch (error) {
      console.error('Get revenue reports error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/reports/students
   * Get student progress reports (admin only)
   */
  router.get("/api/reports/students", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "branch_admin", "super_admin", "instructor");
    if (roleCheck) return roleCheck;

    try {
      // Students by status
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM students
        GROUP BY status
      `;
      const statusResult = await executeQuery(env.DB, statusQuery);

      // Students by progress
      const progressQuery = `
        SELECT 
          CASE 
            WHEN progress_percentage < 25 THEN 'Beginning'
            WHEN progress_percentage < 50 THEN 'Intermediate'
            WHEN progress_percentage < 75 THEN 'Advanced'
            ELSE 'Near Completion'
          END as progress_level,
          COUNT(*) as count
        FROM students
        WHERE status = 'active'
        GROUP BY progress_level
      `;
      const progressResult = await executeQuery(env.DB, progressQuery);

      // Theory vs Practical completion
      const completionQuery = `
        SELECT 
          SUM(CASE WHEN theory_completed = true THEN 1 ELSE 0 END) as theory_completed,
          SUM(CASE WHEN practical_completed = true THEN 1 ELSE 0 END) as practical_completed,
          SUM(CASE WHEN exam_ready = true THEN 1 ELSE 0 END) as exam_ready,
          COUNT(*) as total
        FROM students
        WHERE status = 'active'
      `;
      const completionResult = await executeQuery(env.DB, completionQuery);

      return ok({
        by_status: statusResult.results || [],
        by_progress: progressResult.results || [],
        completion_stats: completionResult.results?.[0] || {}
      });
    } catch (error) {
      console.error('Get student reports error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/reports/instructors
   * Get instructor performance reports (admin only)
   */
  router.get("/api/reports/instructors", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "branch_admin", "super_admin");
    if (roleCheck) return roleCheck;

    try {
      // Lessons by instructor
      const lessonsQuery = `
        SELECT 
          i.instructor_number,
          u.full_name,
          COUNT(l.id) as total_lessons,
          SUM(CASE WHEN l.status = 'completed' THEN 1 ELSE 0 END) as completed_lessons,
          AVG(l.rating) as average_rating
        FROM instructors i
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN lessons l ON i.id = l.instructor_id
        WHERE i.status = 'active'
        GROUP BY i.id, i.instructor_number, u.full_name
        ORDER BY completed_lessons DESC
      `;
      const lessonsResult = await executeQuery(env.DB, lessonsQuery);

      // Test pass rates by instructor
      const testQuery = `
        SELECT 
          i.instructor_number,
          u.full_name,
          COUNT(pt.id) as total_tests,
          SUM(CASE WHEN pt.passed = true THEN 1 ELSE 0 END) as passed_tests,
          ROUND(AVG(pt.score), 2) as average_score
        FROM instructors i
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN practical_tests pt ON i.id = pt.instructor_id
        WHERE i.status = 'active'
        GROUP BY i.id, i.instructor_number, u.full_name
        HAVING total_tests > 0
        ORDER BY average_score DESC
      `;
      const testResult = await executeQuery(env.DB, testQuery);

      return ok({
        lesson_stats: lessonsResult.results || [],
        test_stats: testResult.results || []
      });
    } catch (error) {
      console.error('Get instructor reports error:', error);
      return badRequest(error.message);
    }
  });
}