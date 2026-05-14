import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

/**
 * D1 Database Helper Functions
 * Provides a clean interface for database operations
 */

export class DatabaseError extends Error {
  constructor(message, code = 'DB_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

/**
 * Generate unique IDs for database records
 */
export function generateId() {
  return nanoid();
}

/**
 * Hash password for storage
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Execute a prepared statement with error handling
 */
export async function executeQuery(db, query, params = []) {
  try {
    const stmt = db.prepare(query);
    return await stmt.bind(...params).all();
  } catch (error) {
    console.error('Database query error:', error);
    throw new DatabaseError(`Query failed: ${error.message}`);
  }
}

/**
 * Execute a single row query
 */
export async function executeQueryFirst(db, query, params = []) {
  try {
    const stmt = db.prepare(query);
    return await stmt.bind(...params).first();
  } catch (error) {
    console.error('Database query error:', error);
    throw new DatabaseError(`Query failed: ${error.message}`);
  }
}

/**
 * Execute an insert/update/delete query
 */
export async function executeUpdate(db, query, params = []) {
  try {
    const stmt = db.prepare(query);
    return await stmt.bind(...params).run();
  } catch (error) {
    console.error('Database update error:', error);
    throw new DatabaseError(`Update failed: ${error.message}`);
  }
}

/**
 * User Management Functions
 */
export const UserService = {
  async create(db, userData) {
    const id = generateId();
    const passwordHash = await hashPassword(userData.password);
    
    const query = `
      INSERT INTO users (id, email, password_hash, full_name, phone, email_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await executeUpdate(db, query, [
      id,
      userData.email,
      passwordHash,
      userData.full_name,
      userData.phone || null,
      false
    ]);
    
    return { id, ...userData, password_hash: passwordHash };
  },

  async findByEmail(db, email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    return await executeQueryFirst(db, query, [email]);
  },

  async findById(db, id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    return await executeQueryFirst(db, query, [id]);
  },

  async update(db, id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const query = `UPDATE users SET ${fields} WHERE id = ?`;
    return await executeUpdate(db, query, [...values, id]);
  },

  async getRoles(db, userId) {
    const query = `SELECT role FROM user_roles WHERE user_id = ?`;
    const result = await executeQuery(db, query, [userId]);
    return result.results.map(row => row.role);
  },

  async addRole(db, userId, role) {
    const id = generateId();
    const query = `INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`;
    return await executeUpdate(db, query, [id, userId, role]);
  },

  async removeRole(db, userId, role) {
    const query = `DELETE FROM user_roles WHERE user_id = ? AND role = ?`;
    return await executeUpdate(db, query, [userId, role]);
  }
};

/**
 * Student Management Functions
 */
export const StudentService = {
  async create(db, studentData) {
    const id = generateId();
    const studentNumber = `STU${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const query = `
      INSERT INTO students (id, user_id, course_id, branch_id, student_number, enrollment_date, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Get course price for initial balance
    const course = await executeQueryFirst(db, `SELECT price FROM courses WHERE id = ?`, [studentData.course_id]);
    const balance = course ? course.price : 0;
    
    await executeUpdate(db, query, [
      id,
      studentData.user_id,
      studentData.course_id,
      studentData.branch_id,
      studentNumber,
      new Date().toISOString().split('T')[0],
      balance
    ]);
    
    return { id, student_number: studentNumber, ...studentData };
  },

  async findByUserId(db, userId) {
    const query = `
      SELECT s.*, c.name as course_name, c.price as course_price, b.name as branch_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.user_id = ?
    `;
    return await executeQueryFirst(db, query, [userId]);
  },

  async findById(db, id) {
    const query = `
      SELECT s.*, c.name as course_name, c.price as course_price, b.name as branch_name,
             u.full_name, u.email, u.phone
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `;
    return await executeQueryFirst(db, query, [id]);
  },

  async list(db, filters = {}) {
    let query = `
      SELECT s.*, c.name as course_name, b.name as branch_name,
             u.full_name, u.email, u.phone
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.branch_id) {
      query += ` AND s.branch_id = ?`;
      params.push(filters.branch_id);
    }

    if (filters.status) {
      query += ` AND s.status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const result = await executeQuery(db, query, params);
    return result.results || [];
  },

  async updateBalance(db, studentId, amount, operation = 'add') {
    const student = await this.findById(db, studentId);
    if (!student) throw new DatabaseError('Student not found');

    let newBalance, newTotalPaid;
    
    if (operation === 'subtract') {
      // Payment received - reduce balance, increase total paid
      newBalance = Math.max(0, parseFloat(student.balance || 0) - parseFloat(amount));
      newTotalPaid = parseFloat(student.total_paid || 0) + parseFloat(amount);
    } else {
      // Add to balance (e.g., additional fees)
      newBalance = parseFloat(student.balance || 0) + parseFloat(amount);
      newTotalPaid = parseFloat(student.total_paid || 0);
    }

    const query = `UPDATE students SET balance = ?, total_paid = ? WHERE id = ?`;
    return await executeUpdate(db, query, [newBalance, newTotalPaid, studentId]);
  },

  async updateProgress(db, studentId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const query = `UPDATE students SET ${fields} WHERE id = ?`;
    return await executeUpdate(db, query, [...values, studentId]);
  }
};

/**
 * Payment Management Functions
 */
export const PaymentService = {
  async create(db, paymentData) {
    const id = generateId();
    
    const query = `
      INSERT INTO payments (id, student_id, amount, payment_method, payment_reference, 
                           mpesa_receipt_number, status, description, processed_by, payment_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeUpdate(db, query, [
      id,
      paymentData.student_id,
      paymentData.amount,
      paymentData.payment_method,
      paymentData.payment_reference || null,
      paymentData.mpesa_receipt_number || null,
      paymentData.status || 'pending',
      paymentData.description || null,
      paymentData.processed_by || null,
      paymentData.payment_date || new Date().toISOString()
    ]);
    
    return { id, ...paymentData };
  },

  async findById(db, id) {
    const query = `
      SELECT p.*, s.student_number, u.full_name as student_name,
             proc.full_name as processed_by_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN users proc ON p.processed_by = proc.id
      WHERE p.id = ?
    `;
    return await executeQueryFirst(db, query, [id]);
  },

  async list(db, filters = {}) {
    let query = `
      SELECT p.*, s.student_number, u.full_name as student_name,
             proc.full_name as processed_by_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN users proc ON p.processed_by = proc.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.student_id) {
      query += ` AND p.student_id = ?`;
      params.push(filters.student_id);
    }

    if (filters.status) {
      query += ` AND p.status = ?`;
      params.push(filters.status);
    }

    if (filters.payment_method) {
      query += ` AND p.payment_method = ?`;
      params.push(filters.payment_method);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await executeQuery(db, query, params);
    return result.results || [];
  },

  async updateStatus(db, paymentId, status, updates = {}) {
    const updateFields = { status, ...updates };
    const fields = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);
    
    const query = `UPDATE payments SET ${fields} WHERE id = ?`;
    const result = await executeUpdate(db, query, [...values, paymentId]);
    
    // If payment is completed, update student balance
    if (status === 'completed') {
      const payment = await this.findById(db, paymentId);
      if (payment) {
        await StudentService.updateBalance(db, payment.student_id, payment.amount, 'subtract');
      }
    }
    
    return result;
  }
};

/**
 * Course Management Functions
 */
export const CourseService = {
  async create(db, courseData) {
    const id = generateId();
    
    const query = `
      INSERT INTO courses (id, name, description, vehicle_type, lesson_count, 
                          theory_hours, price, duration_weeks, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeUpdate(db, query, [
      id,
      courseData.name,
      courseData.description || null,
      courseData.vehicle_type,
      courseData.lesson_count || 30,
      courseData.theory_hours || 8,
      courseData.price,
      courseData.duration_weeks || 8,
      courseData.status || 'active'
    ]);
    
    return { id, ...courseData };
  },

  async list(db, filters = {}) {
    let query = `SELECT * FROM courses WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ` AND status = ?`;
      params.push(filters.status);
    }

    if (filters.vehicle_type) {
      query += ` AND vehicle_type = ?`;
      params.push(filters.vehicle_type);
    }

    query += ` ORDER BY name`;

    const result = await executeQuery(db, query, params);
    return result.results || [];
  },

  async findById(db, id) {
    const query = `SELECT * FROM courses WHERE id = ?`;
    return await executeQueryFirst(db, query, [id]);
  }
};

/**
 * Lesson Management Functions
 */
export const LessonService = {
  async create(db, lessonData) {
    const id = generateId();
    
    const query = `
      INSERT INTO lessons (id, student_id, instructor_id, vehicle_id, lesson_type,
                          scheduled_date, scheduled_time, duration_minutes, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeUpdate(db, query, [
      id,
      lessonData.student_id,
      lessonData.instructor_id,
      lessonData.vehicle_id,
      lessonData.lesson_type,
      lessonData.scheduled_date,
      lessonData.scheduled_time,
      lessonData.duration_minutes || 60,
      lessonData.status || 'scheduled',
      lessonData.notes || null
    ]);
    
    return { id, ...lessonData };
  },

  async list(db, filters = {}) {
    let query = `
      SELECT l.*, s.student_number, u.full_name as student_name,
             i.instructor_number, iu.full_name as instructor_name,
             v.plate_number, v.make, v.model
      FROM lessons l
      LEFT JOIN students s ON l.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN instructors i ON l.instructor_id = i.id
      LEFT JOIN users iu ON i.user_id = iu.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.student_id) {
      query += ` AND l.student_id = ?`;
      params.push(filters.student_id);
    }

    if (filters.instructor_id) {
      query += ` AND l.instructor_id = ?`;
      params.push(filters.instructor_id);
    }

    if (filters.date) {
      query += ` AND l.scheduled_date = ?`;
      params.push(filters.date);
    }

    if (filters.status) {
      query += ` AND l.status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY l.scheduled_date DESC, l.scheduled_time DESC`;

    const result = await executeQuery(db, query, params);
    return result.results || [];
  },

  async update(db, id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const query = `UPDATE lessons SET ${fields} WHERE id = ?`;
    return await executeUpdate(db, query, [...values, id]);
  }
};

/**
 * Notification Management Functions
 */
export const NotificationService = {
  async create(db, notificationData) {
    const id = generateId();
    
    const query = `
      INSERT INTO notifications (id, user_id, title, message, type, action_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await executeUpdate(db, query, [
      id,
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type || 'info',
      notificationData.action_url || null
    ]);
    
    return { id, ...notificationData };
  },

  async list(db, userId, filters = {}) {
    let query = `SELECT * FROM notifications WHERE user_id = ?`;
    const params = [userId];

    if (filters.read_status !== undefined) {
      query += ` AND read_status = ?`;
      params.push(filters.read_status);
    }

    if (filters.type) {
      query += ` AND type = ?`;
      params.push(filters.type);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await executeQuery(db, query, params);
    return result.results || [];
  },

  async markAsRead(db, id, userId) {
    const query = `UPDATE notifications SET read_status = true, read_at = ? WHERE id = ? AND user_id = ?`;
    return await executeUpdate(db, query, [new Date().toISOString(), id, userId]);
  },

  async markAllAsRead(db, userId) {
    const query = `UPDATE notifications SET read_status = true, read_at = ? WHERE user_id = ? AND read_status = false`;
    return await executeUpdate(db, query, [new Date().toISOString(), userId]);
  }
};

/**
 * Branch Management Functions
 */
export const BranchService = {
  async create(db, branchData) {
    const id = generateId();
    
    const query = `
      INSERT INTO branches (id, name, address, phone, email, manager_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeUpdate(db, query, [
      id,
      branchData.name,
      branchData.address || null,
      branchData.phone || null,
      branchData.email || null,
      branchData.manager_id || null,
      branchData.status || 'active'
    ]);
    
    return { id, ...branchData };
  },

  async list(db, filters = {}) {
    let query = `
      SELECT b.*, u.full_name as manager_name
      FROM branches b
      LEFT JOIN users u ON b.manager_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND b.status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY b.name`;

    const result = await executeQuery(db, query, params);
    return result.results || [];
  },

  async findById(db, id) {
    const query = `
      SELECT b.*, u.full_name as manager_name
      FROM branches b
      LEFT JOIN users u ON b.manager_id = u.id
      WHERE b.id = ?
    `;
    return await executeQueryFirst(db, query, [id]);
  }
};
