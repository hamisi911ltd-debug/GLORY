# 🚀 CLOUDFLARE PAGES SETTINGS - COPY THESE EXACTLY

## Build Settings (in Cloudflare Dashboard)

Go to: **Cloudflare Dashboard → Pages → Your Project → Settings → Builds & deployments**

### Framework preset
```
None
```

### Build command
```
npm install && npm run build
```

### Build output directory
```
dist/client
```

### Root directory
```
/
```
(leave empty or just `/`)

### Node version
```
20
```

---

## Environment Variables (CRITICAL!)

Go to: **Cloudflare Dashboard → Pages → Your Project → Settings → Environment variables**

### Production Environment Variables

**NONE REQUIRED** - All configuration is in wrangler.toml

---

## D1 Database Binding (CRITICAL!)

Go to: **Cloudflare Dashboard → Pages → Your Project → Settings → Functions**

Scroll down to: **D1 database bindings**

Click: **Add binding**

Set:
- **Variable name**: `DB`
- **D1 database**: Select `driveschool-pro` from dropdown
- **Environment**: Production (and Preview if you want)

Click: **Save**

---

## Verify These Files Exist in Your Repo

✅ `wrangler.toml` at root with:
```toml
name = "glory"
compatibility_date = "2026-05-13"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist/client"

[[d1_databases]]
binding = "DB"
database_name = "driveschool-pro"
database_id = "1daf6984-59c5-402e-b3fc-5ff438034c94"
```

✅ `package.json` has:
```json
"scripts": {
  "build": "vite build",
  "postbuild": "node scripts/postbuild.js"
}
```

✅ `scripts/postbuild.js` exists

---

## After Configuring

1. **Retry deployment** from Cloudflare Dashboard
2. **Check build logs** for any errors
3. **Test the site** at https://immacurate.co.ke

---

## If Still Not Working

Check these in order:

1. **Build logs** - Look for errors during `npm run build`
2. **Functions tab** - Verify D1 binding shows up
3. **Deployment ID** - Share the latest deployment ID so I can help debug

---

## Quick Test Commands

After deployment, test these URLs:

```bash
# Should return JSON
curl https://immacurate.co.ke/hello

# Should return HTML
curl https://immacurate.co.ke/

# Should return JSON
curl https://immacurate.co.ke/api/health
```

If `/hello` works but `/` doesn't, it's a routing issue.
If nothing works, it's a build/deployment issue.
