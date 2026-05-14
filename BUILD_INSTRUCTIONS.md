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

### Environment Variables Required
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Cloudflare Pages Settings

1. **Framework preset**: None (Custom)
2. **Build command**: `npm install && npm run build`
3. **Build output directory**: `dist/client`
4. **Node version**: 20.11.0 or higher

## D1 Database Binding

Make sure to bind your D1 database in Cloudflare Pages:
1. Go to your Pages project settings
2. Navigate to "Functions" > "D1 database bindings"
3. Add binding: `DB` → Your D1 database name

## Deployment

The app uses:
- **Frontend**: TanStack Start (React) deployed to Cloudflare Pages
- **Backend**: Cloudflare Workers (in `/backend` folder)
- **Database**: Cloudflare D1

### Manual Deployment Trigger
```bash
curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID"
```

## Troubleshooting

If you see 404 errors:
1. Check that the build completed successfully in Cloudflare Pages dashboard
2. Verify the build output directory is set to `dist/client`
3. Ensure all environment variables are set
4. Check the Functions logs for any errors
