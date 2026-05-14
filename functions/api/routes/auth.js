import { UserService, StudentService, CourseService, BranchService, verifyPassword } from "../lib/database.js";
import { generateToken, createSession } from "../lib/auth.js";
import { ok, created, badRequest, unauthorized } from "../lib/response.js";

export function registerAuthRoutes(router) {
  /**
   * POST /api/auth/register
   */
  router.post("/api/auth/register", async (req, env) => {
    const { email, password, firstName, lastName, phone, course, branch } = req.body ?? {};

    if (!email || !password || !firstName || !lastName) {
      return badRequest("email, password, firstName, and lastName are required");
    }
    if (password.length < 6) {
      return badRequest("Password must be at least 6 characters");
    }

    try {
      // Check if user already exists
      const existingUser = await UserService.findByEmail(env.DB, email);
      if (existingUser) {
        return badRequest("User with this email already exists");
      }

      // Create user
      const userData = {
        email,
        password,
        full_name: `${firstName} ${lastName}`,
        phone
      };
      
      const user = await UserService.create(env.DB, userData);
      
      // Add student role
      await UserService.addRole(env.DB, user.id, 'student');
      
      // Create student record if course and branch provided
      if (course && branch) {
        await StudentService.create(env.DB, {
          user_id: user.id,
          course_id: course,
          branch_id: branch
        });
      }

      return created({
        message: "Account created successfully",
        userId: user.id,
      });
    } catch (error) {
      console.error('Registration error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * POST /api/auth/login
   */
  router.post("/api/auth/login", async (req, env) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return badRequest("Email and password are required");
    }

    try {
      // Find user by email
      const user = await UserService.findByEmail(env.DB, email);
      if (!user) {
        return unauthorized("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return unauthorized("Invalid email or password");
      }

      // Generate JWT token
      const token = await generateToken(user, env);
      
      // Create session record
      await createSession(env.DB, user.id, token);

      // Get user roles
      const roles = await UserService.getRoles(env.DB, user.id);

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return ok({
        message: "Login successful",
        user: userWithoutPassword,
        roles,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/auth/me
   */
  router.get("/api/auth/me", async (req, env) => {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return unauthorized("Missing authorization header");
    }

    const token = authHeader.slice(7);
    
    try {
      const { verifyToken } = await import("../lib/auth.js");
      const verification = await verifyToken(token, env);
      if (!verification.success) {
        return unauthorized("Invalid or expired token");
      }

      const user = await UserService.findById(env.DB, verification.payload.sub);
      if (!user) {
        return unauthorized("User not found");
      }

      const roles = await UserService.getRoles(env.DB, user.id);
      
      // Get student profile if user is a student
      let studentProfile = null;
      if (roles.includes('student')) {
        studentProfile = await StudentService.findByUserId(env.DB, user.id);
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return ok({
        user: userWithoutPassword,
        roles,
        student: studentProfile
      });
    } catch (error) {
      console.error('Auth me error:', error);
      return unauthorized("Authentication failed");
    }
  });

  /**
   * POST /api/auth/logout
   */
  router.post("/api/auth/logout", async (req, env) => {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return ok({ message: "Logged out" });
    }

    const token = authHeader.slice(7);
    
    try {
      // Remove session from database
      const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const hashString = Array.from(new Uint8Array(tokenHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const query = `DELETE FROM sessions WHERE token_hash = ?`;
      const stmt = env.DB.prepare(query);
      await stmt.bind(hashString).run();

      return ok({ message: "Logged out successfully" });
    } catch (error) {
      console.error('Logout error:', error);
      return ok({ message: "Logged out" });
    }
  });

  /**
   * GET /api/auth/courses
   * Get available courses for registration
   */
  router.get("/api/auth/courses", async (req, env) => {
    try {
      const courses = await CourseService.list(env.DB, { status: 'active' });
      return ok({ courses });
    } catch (error) {
      console.error('Get courses error:', error);
      return badRequest(error.message);
    }
  });

  /**
   * GET /api/auth/branches
   * Get available branches for registration
   */
  router.get("/api/auth/branches", async (req, env) => {
    try {
      const branches = await BranchService.list(env.DB, { status: 'active' });
      return ok({ branches });
    } catch (error) {
      console.error('Get branches error:', error);
      return badRequest(error.message);
    }
  });
}
