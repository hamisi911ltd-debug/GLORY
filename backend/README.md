# DriveSchool Pro Backend - D1 Database Setup

This backend uses Cloudflare D1 database for data storage and querying.

## Prerequisites

1. Cloudflare account with Workers and D1 access
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Node.js 18+ installed

## Setup Instructions

### 1. Database Setup

First, create your D1 database:

```bash
# Create the D1 database
wrangler d1 create driveschool-pro

# This will output a database ID - copy it and update wrangler.toml
```

Update the `database_id` in `wrangler.toml` with the ID from the previous command.

### 2. Initialize Database Schema

```bash
# Apply the database schema
wrangler d1 execute driveschool-pro --file=./schema.sql
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Environment Variables

Set the required secrets:

```bash
# JWT secret for authentication
wrangler secret put JWT_SECRET

# Frontend URL for CORS
wrangler secret put FRONTEND_URL

# M-Pesa API credentials (optional)
wrangler secret put MPESA_CONSUMER_KEY
wrangler secret put MPESA_CONSUMER_SECRET
wrangler secret put MPESA_PASSKEY
```

### 5. Development

```bash
# Start local development server
npm run dev
```

### 6. Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/courses` - Get available courses
- `GET /api/auth/branches` - Get available branches

### Students
- `GET /api/students/me` - Get current student profile
- `GET /api/students` - List all students (staff only)
- `GET /api/students/:id` - Get student details (staff only)
- `PATCH /api/students/:id` - Update student (staff only)
- `GET /api/students/:id/balance` - Get student balance
- `GET /api/students/dashboard/stats` - Get student dashboard stats

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa payment
- `POST /api/payments/mpesa/callback` - M-Pesa webhook
- `POST /api/payments/cash` - Record cash payment (finance only)
- `GET /api/payments/:id` - Get payment details
- `PUT /api/payments/:id/status` - Update payment status (finance only)

### Lessons
- `GET /api/lessons` - List lessons
- `POST /api/lessons` - Book new lesson
- `PATCH /api/lessons/:id` - Update lesson
- `GET /api/lessons/available-slots` - Get available booking slots
- `GET /api/lessons/:id` - Get lesson details

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/:id` - Update course (admin only)

### Tests
- `GET /api/tests/theory` - Get theory test results
- `POST /api/tests/theory` - Submit theory test
- `GET /api/tests/practical` - Get practical test results
- `POST /api/tests/practical` - Record practical test (instructor only)
- `GET /api/tests/students/:studentId` - Get all tests for student (staff only)

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics (admin only)
- `GET /api/reports/revenue` - Revenue reports (finance only)
- `GET /api/reports/students` - Student progress reports (admin only)
- `GET /api/reports/instructors` - Instructor performance reports (admin only)

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read

## Database Schema

The system uses the following main tables:

- `users` - User accounts and authentication
- `user_roles` - User role assignments
- `students` - Student profiles and progress
- `instructors` - Instructor profiles
- `courses` - Available courses
- `branches` - Branch locations
- `lessons` - Lesson bookings and records
- `payments` - Payment transactions
- `vehicles` - Fleet vehicles
- `theory_tests` - Theory test results
- `practical_tests` - Practical test results
- `documents` - Document uploads
- `certificates` - Issued certificates
- `notifications` - User notifications
- `messages` - Internal messaging
- `sessions` - JWT session tracking
- `audit_logs` - System audit trail

## Features

✅ **Complete Authentication System**
- JWT-based authentication
- Role-based access control (6 roles)
- Session management
- Password hashing with bcrypt

✅ **Payment Management**
- M-Pesa integration ready
- Cash payment recording
- Balance tracking and synchronization
- Payment status management

✅ **Student Management**
- Progress tracking
- Balance management
- Course enrollment
- Document management

✅ **Lesson Booking System**
- Available slot checking
- Conflict detection
- Instructor assignment
- Rating system

✅ **Testing System**
- Theory tests with scoring
- Practical tests with instructor feedback
- Progress tracking

✅ **Reporting System**
- Dashboard statistics
- Revenue reports
- Student progress reports
- Instructor performance metrics

✅ **Communication System**
- Internal messaging
- Notifications
- Audit logging

## Security Features

- JWT token authentication
- Role-based access control
- SQL injection prevention with prepared statements
- CORS protection
- Session management with cleanup
- Password hashing
- Input validation

## Performance Features

- Database indexing for optimal queries
- Efficient pagination
- Connection pooling via D1
- Automatic session cleanup
- Optimized queries with joins

The system is now fully functional with D1 database integration and provides comprehensive APIs for all driving school operations.