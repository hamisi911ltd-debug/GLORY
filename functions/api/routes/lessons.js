import { LessonService, StudentService, executeQuery } from "../lib/database.js";
import { authenticate, getUserRoles } from "../lib/auth.js";
import { ok, created, badRequest, conflict } from "../lib/response.js";

export function registerLessonRoutes(router) {
  /**
   * GET /api/lessons
   */
  router.get("/api/lessons", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const roles = await getUserRoles(auth.user.id, env);
      const isStaff = roles.some((r) => ["branch_admin", "super_admin", "instructor"].includes(r));

      const { status, limit = "20", offset = "0" } = req.query || {};
      
      let filters = {};
      if (status) filters.status = status;

      if (!isStaff) {
        // Students can only see their own lessons
        const student = await StudentService.findByUserId(env.DB, auth.user.id);
        if (!student) return ok({ lessons: [] });
        filters.student_id = student.id;
      }

      const lessons = await LessonService.list(env.DB, filters);
      
      // Apply pagination
      const startIndex = Number(offset);
      const endIndex = startIndex + Number(limit);
      const paginatedLessons = lessons.slice(startIndex, endIndex);

      return ok({ lessons: paginatedLessons });
    } catch (error) {
      console.error('Get lessons error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/lessons
   * Book a new lesson
   */
  router.post("/api/lessons", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { instructor_id, vehicle_id, scheduled_date, scheduled_time, lesson_type = 'practical' } = req.body ?? {};
    if (!instructor_id || !scheduled_date || !scheduled_time) {
      return badRequest("instructor_id, scheduled_date, and scheduled_time are required");
    }

    try {
      const student = await StudentService.findByUserId(env.DB, auth.user.id);
      if (!student) {
        return badRequest("No student record found for this user");
      }

      // Check for conflicts
      const conflictQuery = `
        SELECT id FROM lessons 
        WHERE instructor_id = ? 
        AND scheduled_date = ? 
        AND scheduled_time = ?
        AND status != 'cancelled'
        LIMIT 1
      `;
      
      const existing = await executeQuery(env.DB, conflictQuery, [instructor_id, scheduled_date, scheduled_time]);
      if (existing.results && existing.results.length > 0) {
        return conflict("This instructor slot is already booked");
      }

      // Create lesson
      const lessonData = {
        student_id: student.id,
        instructor_id,
        vehicle_id: vehicle_id || null,
        lesson_type,
        scheduled_date,
        scheduled_time,
        status: 'scheduled'
      };

      const lesson = await LessonService.create(env.DB, lessonData);

      return created({ 
        message: "Lesson booked successfully",
        lesson 
      });
    } catch (error) {
      console.error('Book lesson error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * PATCH /api/lessons/:id
   * Update lesson details
   */
  router.patch("/api/lessons/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    const { status, notes, scheduled_date, scheduled_time, rating } = req.body ?? {};
    
    try {
      const updates = {};
      if (status !== undefined) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      if (scheduled_date !== undefined) updates.scheduled_date = scheduled_date;
      if (scheduled_time !== undefined) updates.scheduled_time = scheduled_time;
      if (rating !== undefined) updates.rating = rating;

      await LessonService.update(env.DB, req.params.id, updates);

      // Get updated lesson
      const lessons = await LessonService.list(env.DB, {});
      const lesson = lessons.find(l => l.id === req.params.id);

      return ok({ 
        message: "Lesson updated successfully",
        lesson 
      });
    } catch (error) {
      console.error('Update lesson error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/lessons/available-slots
   * Get available lesson slots for booking
   */
  router.get("/api/lessons/available-slots", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const { date, instructor_id } = req.query || {};
      
      if (!date) {
        return badRequest("date parameter is required");
      }

      // Get all instructors if no specific instructor requested
      let instructorQuery = `
        SELECT i.id, i.instructor_number, u.full_name, i.specializations
        FROM instructors i
        JOIN users u ON i.user_id = u.id
        WHERE i.status = 'active'
      `;
      const instructorParams = [];

      if (instructor_id) {
        instructorQuery += ` AND i.id = ?`;
        instructorParams.push(instructor_id);
      }

      const instructors = await executeQuery(env.DB, instructorQuery, instructorParams);

      // Get booked slots for the date
      const bookedSlotsQuery = `
        SELECT instructor_id, scheduled_time
        FROM lessons
        WHERE scheduled_date = ? AND status != 'cancelled'
      `;
      const bookedSlots = await executeQuery(env.DB, bookedSlotsQuery, [date]);

      // Generate available time slots (9 AM to 5 PM, hourly)
      const timeSlots = [];
      for (let hour = 9; hour <= 17; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00:00`;
        timeSlots.push(time);
      }

      // Build available slots
      const availableSlots = [];
      for (const instructor of instructors.results || []) {
        for (const time of timeSlots) {
          const isBooked = bookedSlots.results?.some(
            slot => slot.instructor_id === instructor.id && slot.scheduled_time === time
          );
          
          if (!isBooked) {
            availableSlots.push({
              instructor_id: instructor.id,
              instructor_name: instructor.full_name,
              instructor_number: instructor.instructor_number,
              date,
              time,
              specializations: instructor.specializations ? JSON.parse(instructor.specializations) : []
            });
          }
        }
      }

      return ok({ available_slots: availableSlots });
    } catch (error) {
      console.error('Get available slots error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/lessons/:id
   * Get lesson details
   */
  router.get("/api/lessons/:id", async (req, env) => {
    const auth = await authenticate(req.raw, env);
    if (auth.error) return auth.error;

    try {
      const lessons = await LessonService.list(env.DB, {});
      const lesson = lessons.find(l => l.id === req.params.id);

      if (!lesson) {
        return badRequest("Lesson not found");
      }

      // Check access permissions
      const roles = await getUserRoles(auth.user.id, env);
      const isStaff = roles.some((r) => ["branch_admin", "super_admin", "instructor"].includes(r));

      if (!isStaff) {
        // Students can only see their own lessons
        const student = await StudentService.findByUserId(env.DB, auth.user.id);
        if (!student || lesson.student_id !== student.id) {
          return badRequest("Access denied");
        }
      }

      return ok({ lesson });
    } catch (error) {
      console.error('Get lesson details error:', error);
      return badRequest(error.message);
    }
  });
}
