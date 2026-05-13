import { executeQuery, executeUpdate, generateId, StudentService } from "../lib/database.js";
import { authenticate, checkRole } from "../lib/auth.js";
import { ok, created, badRequest, notFound } from "../lib/response.js";

export function registerTestRoutes(router) {
  /**
   * GET /api/tests/theory
   * Get theory test results for student
   */
  router.get("/api/tests/theory", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return badRequest("Student record not found");
      }

      const query = `
        SELECT * FROM theory_tests 
        WHERE student_id = ? 
        ORDER BY test_date DESC
      `;
      
      const result = await executeQuery(env.DB, query, [student.id]);
      return ok({ tests: result.results || [] });
    } catch (error) {
      console.error('Get theory tests error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/tests/theory
   * Submit theory test results
   */
  router.post("/api/tests/theory", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { test_name, total_questions, correct_answers, time_taken_minutes } = req.body ?? {};
    
    if (!test_name || !total_questions || correct_answers === undefined) {
      return badRequest("test_name, total_questions, and correct_answers are required");
    }

    try {
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return badRequest("Student record not found");
      }

      const score_percentage = (correct_answers / total_questions) * 100;
      const pass_mark = 80.0;
      const passed = score_percentage >= pass_mark;

      const id = generateId();
      const query = `
        INSERT INTO theory_tests (id, student_id, test_name, total_questions, correct_answers, 
                                 score_percentage, pass_mark, passed, time_taken_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await executeUpdate(env.DB, query, [
        id, student.id, test_name, total_questions, correct_answers,
        score_percentage, pass_mark, passed, time_taken_minutes || null
      ]);

      // Update student theory completion status if passed
      if (passed) {
        await StudentService.updateProgress(env.DB, student.id, { theory_completed: true });
      }

      return created({
        message: passed ? "Test passed! Theory section completed." : "Test completed. Keep practicing!",
        test: {
          id,
          score_percentage,
          passed,
          pass_mark
        }
      });
    } catch (error) {
      console.error('Submit theory test error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/tests/practical
   * Get practical test results for student
   */
  router.get("/api/tests/practical", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return badRequest("Student record not found");
      }

      const query = `
        SELECT pt.*, i.instructor_number, u.full_name as instructor_name,
               v.plate_number, v.make, v.model
        FROM practical_tests pt
        LEFT JOIN instructors i ON pt.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN vehicles v ON pt.vehicle_id = v.id
        WHERE pt.student_id = ? 
        ORDER BY pt.test_date DESC
      `;
      
      const result = await executeQuery(env.DB, query, [student.id]);
      return ok({ tests: result.results || [] });
    } catch (error) {
      console.error('Get practical tests error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/tests/practical
   * Record practical test results (instructor/examiner only)
   */
  router.post("/api/tests/practical", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "instructor", "examiner", "branch_admin", "super_admin");
    if (roleCheck) return roleCheck;

    const { student_id, vehicle_id, test_type, test_date, score, feedback, areas_for_improvement } = req.body ?? {};
    
    if (!student_id || !test_type || !test_date || score === undefined) {
      return badRequest("student_id, test_type, test_date, and score are required");
    }

    try {
      // Get instructor record for the authenticated user
      const instructorQuery = `SELECT id FROM instructors WHERE user_id = ?`;
      const instructorResult = await executeQuery(env.DB, instructorQuery, [auth.user.id]);
      
      if (!instructorResult.results || instructorResult.results.length === 0) {
        return badRequest("Instructor record not found");
      }

      const instructor_id = instructorResult.results[0].id;
      const passed = score >= 70; // 70% pass mark for practical tests

      const id = generateId();
      const query = `
        INSERT INTO practical_tests (id, student_id, instructor_id, vehicle_id, test_type, 
                                   test_date, score, passed, feedback, areas_for_improvement)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await executeUpdate(env.DB, query, [
        id, student_id, instructor_id, vehicle_id || null, test_type,
        test_date, score, passed, feedback || null, areas_for_improvement || null
      ]);

      // Update student practical completion status if final exam passed
      if (passed && test_type === 'final_exam') {
        await StudentService.updateProgress(env.DB, student_id, { 
          practical_completed: true,
          exam_ready: false // Reset exam ready status
        });
      }

      return created({
        message: passed ? "Test passed!" : "Test completed. Additional practice recommended.",
        test: {
          id,
          score,
          passed,
          test_type
        }
      });
    } catch (error) {
      console.error('Record practical test error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/tests/students/:studentId
   * Get all test results for a specific student (staff only)
   */
  router.get("/api/tests/students/:studentId", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "instructor", "examiner", "branch_admin", "super_admin");
    if (roleCheck) return roleCheck;

    try {
      const { studentId } = req.params;

      // Get theory tests
      const theoryQuery = `
        SELECT * FROM theory_tests 
        WHERE student_id = ? 
        ORDER BY test_date DESC
      `;
      const theoryResult = await executeQuery(env.DB, theoryQuery, [studentId]);

      // Get practical tests
      const practicalQuery = `
        SELECT pt.*, i.instructor_number, u.full_name as instructor_name,
               v.plate_number, v.make, v.model
        FROM practical_tests pt
        LEFT JOIN instructors i ON pt.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN vehicles v ON pt.vehicle_id = v.id
        WHERE pt.student_id = ? 
        ORDER BY pt.test_date DESC
      `;
      const practicalResult = await executeQuery(env.DB, practicalQuery, [studentId]);

      return ok({
        theory_tests: theoryResult.results || [],
        practical_tests: practicalResult.results || []
      });
    } catch (error) {
      console.error('Get student tests error:', error);
      return badRequest(error.message);
    }
  });
}