# Deploying DriveSchool Pro to Vercel

## Project Settings (must set manually in Vercel dashboard)

Go to your project → **Settings** → **General** → **Build & Development Settings**

| Setting | Value |
|---|---|
| **Framework Preset** | **Other** ← critical, must NOT be Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/client` |
| **Install Command** | `npm install` |
| **Root Directory** | *(leave blank)* |

Click **Save**, then **Redeploy**.

---

## Environment Variables

Settings → **Environment Variables**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://ixleeussiwaykyxllofh.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` (anon key from .env) |
| `SUPABASE_URL` | `https://ixleeussiwaykyxllofh.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | same anon key |
| `VITE_API_URL` | your Cloudflare Worker URL (add after Worker is deployed) |

---

## How it works

```
npm run build
  └── vite build
        ├── dist/client/   ← static assets (served by Vercel CDN)
        └── dist/server/   ← SSR bundle (loaded by api/server.js)

vercel.json
  outputDirectory: dist/client   ← Vercel serves these as static files
  functions:
    api/server.js                ← handles all non-asset requests (SSR)
      includeFiles: dist/server/**  ← bundles the SSR code with the function
  rewrites:
    /assets/* → static           ← served from dist/client/assets/
    /*        → api/server.js    ← everything else goes through SSR
```
