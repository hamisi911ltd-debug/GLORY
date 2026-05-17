# DriveSchool Pro - Cloudflare Pages Build Instructions

## Build Configuration

### Build Command
```bash
npm install && npm run build
```

### Build Output Directory
```
dist/client
```

### Root Directory
```
/
```

### Node Version
Set to **20** or higher in Cloudflare Pages settings.

---

## Cloudflare Pages Settings

1. **Framework preset**: None (Custom)
2. **Build command**: `npm install && npm run build`
3. **Build output directory**: `dist/client`
4. **Node version**: 20

---

## D1 Database Binding (REQUIRED)

The API will return 503 errors until this is configured.

1. Go to your Pages project in the Cloudflare dashboard
2. Navigate to **Settings → Functions**
3. Scroll to **D1 database bindings**
4. Click **Add binding**
5. Set **Variable name** to `DB` and select your `driveschool-pro` database
6. Click **Save** and redeploy

If you haven't created the D1 database yet:
```bash
wrangler d1 create driveschool-pro
# Copy the database_id from the output
# Paste it into wrangler.toml → [[d1_databases]] → database_id
```

Then run the schema:
```bash
wrangler d1 execute driveschool-pro --file=backend/schema.sql --remote
```

---

## DNS / Domain Setup

Your site is deployed at the Cloudflare Pages URL (e.g. `glory.pages.dev`).
To use a custom domain like `immacurate.co.ke`:

1. Go to your Pages project → **Custom domains**
2. Add your domain
3. Cloudflare will show you the DNS records to add at your domain registrar
4. Add a CNAME record pointing `immacurate.co.ke` → `glory.pages.dev`

> **Note**: `immaculate.co.ke` (with an 'l') is a different domain and will show
> `DNS_PROBE_FINISHED_NXDOMAIN` unless you also register and configure that domain.

---

## Troubleshooting

### Site shows blank / crashes on Cloudflare Pages
- Ensure `nodejs_compat` is NOT in the root `wrangler.toml` (it belongs only in `backend/wrangler.toml`)
- Verify build output directory is `dist/client`
- Check the Cloudflare Pages deployment logs for build errors

### 503 "Database configuration error"
- D1 binding `DB` is not configured — follow the D1 setup steps above

### 404 Not Found
- Build output directory is wrong — must be `dist/client`
- Check deployment logs to confirm the build succeeded

### DNS_PROBE_FINISHED_NXDOMAIN
- The domain is not registered or DNS records are not configured
- Check your domain registrar and Cloudflare DNS settings
