# Quick Deployment Guide

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
cd acadion
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/acadion.git
git push -u origin main
```

### 2. Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repo
4. Set:
   - **Framework**: Next.js
   - **Root Directory**: `.` 
   - **Build Command**: `cd packages/web && pnpm build`

### 3. Add Environment Variables
In Vercel dashboard → Project → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### 4. Deploy
Click "Deploy" - Vercel will automatically build and deploy.

## Automated Deployments

GitHub Actions workflow (`.github/workflows/deploy.yml`) handles:
- ✅ Lint checks
- ✅ TypeScript checks  
- ✅ Build verification
- ✅ Auto-deploy to Vercel on push to `main`

### Required GitHub Secrets
Add in GitHub → Settings → Secrets:
- `VERCEL_TOKEN` - From vercel.com/account/tokens
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```
