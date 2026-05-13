import { CourseService, executeUpdate } from "../lib/database.js";
import { authenticate, checkRole } from "../lib/auth.js";
import { ok, created, badRequest, notFound } from "../lib/response.js";

export function registerCourseRoutes(router) {
  /**
   * GET /api/courses
   * Get all available courses
   */
  router.get("/api/courses", async (req, env) => {
    try {
      const { status = 'active', vehicle_type } = req.query || {};
      
      const filters = { status };
      if (vehicle_type) filters.vehicle_type = vehicle_type;

      const courses = await CourseService.list(env.DB, filters);
      return ok({ courses });
    } catch (error) {
      console.error('Get courses error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/courses/:id
   * Get course details
   */
  router.get("/api/courses/:id", async (req, env) => {
    try {
      const course = await CourseService.findById(env.DB, req.params.id);
      if (!course) {
        return notFound("Course not found");
      }

      return ok({ course });
    } catch (error) {
      console.error('Get course details error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/courses
   * Create new course (admin only)
   */
  router.post("/api/courses", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "super_admin", "branch_admin");
    if (roleCheck) return roleCheck;

    const { name, description, vehicle_type, lesson_count, theory_hours, price, duration_weeks } = req.body ?? {};
    
    if (!name || !vehicle_type || !price) {
      return badRequest("name, vehicle_type, and price are required");
    }

    try {
      const courseData = {
        name,
        description,
        vehicle_type,
        lesson_count: lesson_count || 30,
        theory_hours: theory_hours || 8,
        price: parseFloat(price),
        duration_weeks: duration_weeks || 8
      };

      const course = await CourseService.create(env.DB, courseData);

      return created({
        message: "Course created successfully",
        course
      });
    } catch (error) {
      console.error('Create course error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * PUT /api/courses/:id
   * Update course (admin only)
   */
  router.put("/api/courses/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const roleCheck = await checkRole(auth.user.id, env, "super_admin", "branch_admin");
    if (roleCheck) return roleCheck;

    try {
      const updates = req.body || {};
      delete updates.id;
      delete updates.created_at;

      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      const query = `UPDATE courses SET ${fields} WHERE id = ?`;
      await executeUpdate(env.DB, query, [...values, req.params.id]);

      const course = await CourseService.findById(env.DB, req.params.id);
      
      return ok({
        message: "Course updated successfully",
        course
      });
    } catch (error) {
      console.error('Update course error:', error);
      return badRequest(error.message);
    }
  });
}