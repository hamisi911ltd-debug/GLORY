# Login Setup Guide — DriveSchool Pro

Follow every step in order. The site will not let anyone log in until all steps are done.

---

## STEP 1 — Install Wrangler CLI

You need Wrangler to talk to Cloudflare from your terminal.

```bash
npm install -g wrangler
```

Then log in to your Cloudflare account:

```bash
wrangler login
```

A browser window will open. Approve the login.

---

## STEP 2 — Create the D1 Database

```bash
wrangler d1 create driveschool-pro
```

You will see output like this:

```
✅ Successfully created DB 'driveschool-pro'

[[d1_databases]]
binding = "DB"
database_name = "driveschool-pro"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy that `database_id` value.**

---

## STEP 3 — Paste the Database ID into wrangler.toml

Open `wrangler.toml` in the project root and replace the placeholder:

```toml
database_id = "your-database-id-here"
```

Change it to your real ID, for example:

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Do the same in `backend/wrangler.toml`.

Then commit and push so Cloudflare Pages picks it up:

```bash
git add wrangler.toml backend/wrangler.toml
git commit -m "fix: add real D1 database_id"
git push origin main
```

---

## STEP 4 — Run the Database Schema

This creates all the tables (users, students, payments, etc.).

```bash
wrangler d1 execute driveschool-pro --file=backend/schema.sql --remote
```

You should see a list of tables being created with no errors.

Verify the tables exist:

```bash
wrangler d1 execute driveschool-pro --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

Expected output includes: `users`, `students`, `courses`, `branches`, `payments`, `lessons`, `notifications`, `sessions`.

---

## STEP 5 — Add the D1 Binding in Cloudflare Dashboard

Even with `wrangler.toml` set, you must also bind it in the Cloudflare Pages dashboard:

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** → your project (`glory`)
3. Click **Settings** → **Functions**
4. Scroll to **D1 database bindings**
5. Click **Add binding**
6. Set:
   - Variable name: `DB`
   - D1 database: select `driveschool-pro`
7. Click **Save**
8. Redeploy — go to **Deployments** and click **Retry deployment** on the latest one

---

## STEP 6 — Add the JWT Secret Environment Variable

The login system uses a JWT secret to sign tokens. Without this, login will fail.

1. In the Cloudflare Pages dashboard go to **Settings** → **Environment variables**
2. Click **Add variable**
3. Set:
   - Variable name: `JWT_SECRET`
   - Value: any long random string, e.g. `driveschool-super-secret-jwt-key-2026`
4. Click **Save**
5. Redeploy again

---

## STEP 7 — Seed Courses and Branches

The registration page loads courses and branches from the database. Without seed data, the dropdowns will be empty and registration will fail.

Run these commands one by one:

### Add Branches

```bash
wrangler d1 execute driveschool-pro --remote --command="INSERT INTO branches (id, name, address, phone, status) VALUES ('branch-westlands', 'Westlands', 'Mpaka Rd, Westlands, Nairobi', '0700000001', 'active');"

wrangler d1 execute driveschool-pro --remote --command="INSERT INTO branches (id, name, address, phone, status) VALUES ('branch-karen', 'Karen', 'Karen Hardy, Langata Rd', '0700000002', 'active');"

wrangler d1 execute driveschool-pro --remote --command="INSERT INTO branches (id, name, address, phone, status) VALUES ('branch-msa', 'Mombasa Road', 'South C, Capital Centre', '0700000003', 'active');"
```

### Add Courses

```bash
wrangler d1 execute driveschool-pro --remote --command="INSERT INTO courses (id, name, description, vehicle_type, lesson_count, theory_hours, price, duration_weeks, status) VALUES ('course-car', 'Car Driving (Class B)', 'Master cars from manual to automatic.', 'manual', 20, 8, 8500, 6, 'active');"

wrangler d1 execute driveschool-pro --remote --command="INSERT INTO courses (id, name, description, vehicle_type, lesson_count, theory_hours, price, duration_weeks, status) VALUES ('course-moto', 'Motorcycle (Class A)', 'Build confidence on two wheels.', 'motorcycle', 12, 4, 6000, 4, 'active');"

wrangler d1 execute driveschool-pro --remote --command="INSERT INTO courses (id, name, description, vehicle_type, lesson_count, theory_hours, price, duration_weeks, status) VALUES ('course-hgv', 'HGV / Truck (Class C)', 'Open commercial driving careers.', 'truck', 30, 12, 14000, 10, 'active');"
```

---

## STEP 8 — Create Your First Login Account

### Option A — Register through the site (easiest)

1. Go to `https://immacurate.co.ke/register`
2. Fill in your name, email, phone, and password
3. Select a course and branch
4. Click **Complete registration**
5. Go to `https://immacurate.co.ke/login` and sign in

This gives you a **student** account.

---

### Option B — Create a Super Admin account directly

Use this if you want full admin access from the start.

Replace `your@email.com`, `YourName`, and `YourPasswordHere` with your real values.

**1. Generate a bcrypt password hash** (run this in your terminal):

```bash
node -e "const b=require('bcryptjs'); b.hash('YourPasswordHere', 12).then(h => console.log(h));"
```

Copy the hash it prints (starts with `$2a$12$...`).

**2. Insert the user** (replace the hash and details):

```bash
wrangler d1 execute driveschool-pro --remote --command="INSERT INTO users (id, email, password_hash, full_name, email_verified) VALUES ('user-admin-001', 'your@email.com', '\$2a\$12\$REPLACE_WITH_REAL_HASH', 'Your Name', 1);"
```

**3. Give them the super_admin role:**

```bash
wrangler d1 execute driveschool-pro --remote --command="INSERT INTO user_roles (id, user_id, role) VALUES ('role-admin-001', 'user-admin-001', 'super_admin');"
```

**4. Log in** at `https://immacurate.co.ke/login` with your email and password.

---

### Option C — Promote an existing account to Super Admin

If you already registered via the site and want admin access:

```bash
wrangler d1 execute driveschool-pro --remote --command="INSERT INTO user_roles (id, user_id, role) VALUES ('role-sa-001', (SELECT id FROM users WHERE email='your@email.com'), 'super_admin');"
```

---

## STEP 9 — Verify Everything Works

Test these URLs after completing all steps:

| URL | Expected result |
|-----|----------------|
| `https://immacurate.co.ke/api/health` | `{"status":"ok","database":"D1 Connected"}` |
| `https://immacurate.co.ke/login` | Login form loads |
| `https://immacurate.co.ke/register` | Shows courses and branches in dropdowns |
| `https://immacurate.co.ke/dashboard` | Redirects to login if not logged in |

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Login returns 503 | D1 binding not set in dashboard | Redo Step 5 |
| Login returns "Authentication failed" | `JWT_SECRET` not set | Redo Step 6 |
| Register shows empty course/branch list | Tables not seeded | Redo Step 7 |
| Register returns "Student record not found" | Courses/branches missing | Redo Step 7 |
| "Invalid email or password" | User doesn't exist yet | Do Step 8 |
| Site shows blank page | Build failed | Check Cloudflare Pages deployment logs |

---

## Summary Checklist

- [ ] Wrangler installed and logged in
- [ ] D1 database created
- [ ] `database_id` updated in `wrangler.toml` and `backend/wrangler.toml`
- [ ] Schema applied (`backend/schema.sql`)
- [ ] D1 binding added in Cloudflare Pages dashboard
- [ ] `JWT_SECRET` environment variable set
- [ ] Branches seeded (3 branches)
- [ ] Courses seeded (3 courses)
- [ ] First user account created
- [ ] Login tested successfully at `https://immacurate.co.ke/login`
