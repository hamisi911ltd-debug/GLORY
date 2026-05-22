# 🚀 Complete Deployment Guide - DriveSchool Pro

## Architecture Overview

The application consists of two parts:
1. **Frontend + Pages Functions** (Cloudflare Pages) - Serves the React app and proxies API requests
2. **Backend Worker** (Cloudflare Workers) - Handles all API logic and database operations

```
User Request → Cloudflare Pages (Frontend)
                    ↓
            Pages Function (/api/*)
                    ↓
            Backend Worker (API Logic)
                    ↓
            D1 Database
```

---

## Step 1: Create D1 Database

```bash
# Create the database
wrangler d1 create driveschool-pro

# Copy the database_id from the output
# It will look like: database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Save this database_id** - you'll need it in the next steps!

---

## Step 2: Update Backend Configuration

Edit `backend/wrangler.toml` and replace `your-database-id-here` with your actual database ID:

```toml
name = "driveschool-pro-api"
main = "src/worker.js"
compatibility_date = "2025-05-10"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"
FRONTEND_URL = "https://immacurate.co.ke"

[[d1_databases]]
binding = "DB"
database_name = "driveschool-pro"
database_id = "YOUR-ACTUAL-DATABASE-ID-HERE"  # ← Replace this!
```

---

## Step 3: Initialize Database Schema

```bash
# Apply the database schema
wrangler d1 execute driveschool-pro --file=backend/schema.sql --remote

# Verify tables were created
wrangler d1 execute driveschool-pro --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

You should see tables like: users, students, courses, payments, lessons, etc.

---

## Step 4: Deploy Backend Worker

```bash
# Navigate to backend directory
cd backend

# Deploy the Worker
wrangler deploy

# Note the Worker URL from the output
# It will look like: https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev
```

**Save this Worker URL** - you'll need it for the Pages configuration!

---

## Step 5: Test Backend Worker

```bash
# Test health endpoint
curl https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev/health

# Expected response:
# {"status":"ok","service":"DriveSchool Pro API","timestamp":"...","database":"D1 Connected"}
```

---

## Step 6: Configure Cloudflare Pages

### A. Update Environment Variable

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Go to **Settings** → **Environment variables**
3. Add a new variable:
   - **Variable name**: `BACKEND_WORKER_URL`
   - **Value**: `https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev`
   - **Environment**: Production (and Preview if needed)
4. Click **Save**

### B. Verify Build Settings

1. Go to **Settings** → **Builds & deployments**
2. Verify:
   - **Framework preset**: None
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist/client`
   - **Root directory**: `/` (leave empty)
   - **Node version**: 20

---

## Step 7: Update Pages Function

Edit `functions/api/[[route]].js` and update the default Worker URL:

```javascript
// Change this line:
const BACKEND_WORKER_URL = env.BACKEND_WORKER_URL || "https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev";
```

Replace `YOUR_SUBDOMAIN` with your actual Worker subdomain.

---

## Step 8: Deploy Frontend

```bash
# Commit and push changes
git add .
git commit -m "Configure backend Worker URL"
git push origin main
```

This will trigger a Cloudflare Pages deployment automatically.

---

## Step 9: Verify Deployment

### Test Endpoints

1. **Frontend**: https://immacurate.co.ke
   - Should load the login page

2. **Hello Function**: https://immacurate.co.ke/hello
   ```json
   {"message":"Hello from Cloudflare Pages Functions!","working":true}
   ```

3. **API Health (via proxy)**: https://immacurate.co.ke/api/health
   ```json
   {"status":"ok","service":"DriveSchool Pro API Proxy","backend":"..."}
   ```

4. **Backend Health (direct)**: https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev/health
   ```json
   {"status":"ok","service":"DriveSchool Pro API","database":"D1 Connected"}
   ```

5. **Debug Page**: https://immacurate.co.ke/debug.html
   - Run all tests to verify everything works

---

## Step 10: Create Admin User

You need to create an admin user to login. Run this command:

```bash
# Create admin user (replace with your desired credentials)
wrangler d1 execute driveschool-pro --command="
INSERT INTO users (id, email, password_hash, full_name, role, created_at)
VALUES (
  'admin-001',
  'admin@immacurate.co.ke',
  '\$2a\$10\$YourHashedPasswordHere',
  'Admin User',
  'admin',
  datetime('now')
);
" --remote
```

**Note**: You'll need to hash the password first. You can use the `hash-passwords.mjs` script:

```bash
node hash-passwords.mjs
```

---

## Troubleshooting

### Issue: "Backend not configured" error

**Solution**: 
- Verify the `BACKEND_WORKER_URL` environment variable is set in Cloudflare Pages
- Check that the backend Worker is deployed and accessible
- Redeploy Pages after setting the environment variable

### Issue: "Database not found" error

**Solution**:
- Verify the database_id in `backend/wrangler.toml` is correct
- Run the schema.sql file to create tables
- Check D1 binding is named `DB` in wrangler.toml

### Issue: CORS errors

**Solution**:
- Verify `FRONTEND_URL` in `backend/wrangler.toml` matches your Pages URL
- Check that both the Worker and Pages Function are setting CORS headers
- Clear browser cache and try again

### Issue: "Invariant failed" error

**Solution**:
- This is usually a frontend routing issue
- Check browser console for more details
- Verify all routes are properly configured
- Try clearing localStorage and cookies

### Issue: Login fails

**Solution**:
- Verify admin user exists in database
- Check password hash is correct
- Test backend `/auth/login` endpoint directly
- Check browser console for API errors

---

## Monitoring

### View Logs

**Backend Worker Logs**:
```bash
wrangler tail driveschool-pro-api
```

**Pages Function Logs**:
- Go to Cloudflare Dashboard → Pages → Your Project → Functions
- View real-time logs

### Check Database

```bash
# List all users
wrangler d1 execute driveschool-pro --command="SELECT id, email, role FROM users;" --remote

# Count records
wrangler d1 execute driveschool-pro --command="
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM students) as students,
  (SELECT COUNT(*) FROM courses) as courses,
  (SELECT COUNT(*) FROM payments) as payments;
" --remote
```

---

## Production Checklist

- [ ] D1 database created
- [ ] Database schema applied
- [ ] Backend Worker deployed
- [ ] Backend Worker URL saved
- [ ] Pages environment variable set
- [ ] Frontend deployed
- [ ] All test endpoints working
- [ ] Admin user created
- [ ] Login tested
- [ ] Mobile responsiveness verified
- [ ] CRUD operations tested

---

## Quick Commands Reference

```bash
# Deploy backend
cd backend && wrangler deploy

# Deploy frontend
git push origin main

# View backend logs
wrangler tail driveschool-pro-api

# Query database
wrangler d1 execute driveschool-pro --command="YOUR SQL HERE" --remote

# Test backend health
curl https://driveschool-pro-api.YOUR_SUBDOMAIN.workers.dev/health

# Test frontend health
curl https://immacurate.co.ke/api/health
```

---

## Support

If you encounter issues:
1. Check Cloudflare Pages deployment logs
2. Check Worker logs with `wrangler tail`
3. Test each component individually (Worker, Pages, Database)
4. Use the debug page at `/debug.html`
5. Check browser console for frontend errors

**Everything should now be working! 🎉**
