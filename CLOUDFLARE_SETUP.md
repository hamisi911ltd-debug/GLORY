# Cloudflare Pages + D1 Database Setup Guide

## 🚀 Quick Setup Steps

### 1. D1 Database Binding (CRITICAL!)

Your Cloudflare Pages project needs to be connected to your D1 database:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your Pages project
3. Click on **Settings** → **Functions**
4. Scroll to **D1 database bindings**
5. Click **Add binding**
6. Set:
   - **Variable name**: `DB`
   - **D1 database**: Select your `driveschool-pro` database
7. Click **Save**

### 2. Environment Variables

Add these in **Settings** → **Environment variables**:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Build Configuration

Verify in **Settings** → **Builds & deployments**:

- **Build command**: `npm install && npm run build`
- **Build output directory**: `dist/client`
- **Root directory**: `/` (leave empty)
- **Node version**: 20 or higher

### 4. Deploy

After saving the D1 binding, trigger a new deployment:

```bash
# Via webhook
curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/71fdd1fd-a9f7-43f3-8683-d73e58e70606"

# Or via git push
git push origin main
```

## 📊 Database Schema

If you haven't created the D1 database yet:

```bash
# Create D1 database
wrangler d1 create driveschool-pro

# Run schema
wrangler d1 execute driveschool-pro --file=backend/schema.sql
```

## 🔍 Troubleshooting

### 405 Method Not Allowed
- **Cause**: D1 database binding not configured
- **Fix**: Add the `DB` binding in Pages settings (see step 1)

### 404 Not Found
- **Cause**: Build output directory incorrect
- **Fix**: Set to `dist/client` in build settings

### API Errors
- **Check**: Functions logs in Cloudflare dashboard
- **Location**: Pages project → **Functions** → **Logs**

### Database Errors
- **Check**: D1 binding is named exactly `DB`
- **Verify**: Database has tables (run schema.sql)

## 📁 Project Structure

```
drive-ahead/
├── functions/          # Cloudflare Pages Functions (API routes)
│   └── api/
│       ├── [[route]].js    # Main API handler
│       ├── lib/            # Database & auth helpers
│       └── routes/         # API route handlers
├── backend/            # Standalone Worker (optional)
├── src/                # Frontend React app
└── public/             # Static assets
```

## 🔗 Important URLs

- **Frontend**: https://immacurate.co.ke
- **API Health**: https://immacurate.co.ke/api/health
- **Cloudflare Dashboard**: https://dash.cloudflare.com

## ✅ Verification

After deployment, test these endpoints:

1. **Health Check**:
   ```bash
   curl https://immacurate.co.ke/api/health
   ```
   Should return: `{"status":"ok","database":"D1 Connected"}`

2. **Login Test**:
   - Go to https://immacurate.co.ke/login
   - Try logging in
   - Should not see 405 errors

## 🆘 Need Help?

1. Check Cloudflare Pages deployment logs
2. Check Functions logs for API errors
3. Verify D1 database binding is active
4. Ensure all environment variables are set
