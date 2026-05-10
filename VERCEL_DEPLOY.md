# Deploying DriveSchool Pro to Vercel

## How the build works

```
npm run build
  ├── vite build
  │     ├── dist/client/   ← static assets served by Vercel CDN
  │     └── dist/server/   ← SSR bundle (intermediate, not deployed directly)
  └── node scripts/bundle-api.js
        └── api/server.js  ← esbuild bundles SSR + Vercel adapter into ONE file
```

Vercel serves `dist/client/` as static files and routes everything else
through `api/server.js` (the self-contained SSR handler).

---

## Vercel Project Settings

Go to **Settings → General → Build & Development Settings**:

| Setting | Value |
|---|---|
| **Framework Preset** | **Other** ← must NOT be Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/client` |
| **Install Command** | `npm install` |
| **Root Directory** | *(leave blank)* |

---

## Environment Variables

**Settings → Environment Variables**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://ixleeussiwaykyxllofh.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your anon key |
| `SUPABASE_URL` | `https://ixleeussiwaykyxllofh.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | your anon key |
| `VITE_API_URL` | your Cloudflare Worker URL (add after Worker is deployed) |
