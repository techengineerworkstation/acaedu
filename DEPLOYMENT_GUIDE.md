# Acadion Deployment Guide

> **Smart Academic Notification & Scheduling System**
> Monorepo: Next.js 14 (web) + React Native/Expo (mobile) + Shared TypeScript package
> Build tool: Turborepo | Package manager: pnpm 10.33.0+

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Deploy to GitHub](#3-deploy-to-github)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Deploy to a Private VPS](#5-deploy-to-a-private-vps)
6. [Custom Domain Configuration](#6-custom-domain-configuration)
7. [Database Setup (Supabase)](#7-database-setup-supabase)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Mobile App Deployment](#10-mobile-app-deployment)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

| Tool       | Version      | Install                                       |
|------------|-------------|-----------------------------------------------|
| Node.js    | >= 18.0.0   | `nvm install 20`                              |
| pnpm       | >= 10.33.0  | `corepack enable && corepack prepare pnpm@10.33.0 --activate` |
| Turbo      | >= 1.13     | Installed via devDependencies                 |
| Git        | >= 2.x      | `sudo apt install git` / `brew install git`   |
| Supabase CLI | Latest    | `npm i -g supabase`                           |

### Install dependencies locally

```bash
cd /home/hptechworkpc/Apps/acadion
pnpm install
```

### Build the entire monorepo

```bash
pnpm build
```

This runs `turbo run build`, which builds `@acadion/shared` first, then `@acadion/web` and `@acadion/mobile` in parallel.

---

## 2. Environment Variables Reference

Copy the template and fill in your values:

```bash
cp packages/web/.env.local.example packages/web/.env.local
```

### Required Variables

#### Supabase (Database & Auth)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

#### Firebase (Authentication & Push Notifications)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g., `yourproject.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g., `yourproject.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON service account (server-side only) |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key |

#### Email (Resend)
| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `EMAIL_FROM` | Sender address, e.g., `Acadion <noreply@acadion.com>` |

#### Payments — Paystack
| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `PAYSTACK_PRO_PLAN_CODE` | Plan code for Pro tier |
| `PAYSTACK_ENTERPRISE_PLAN_CODE` | Plan code for Enterprise tier |

#### Payments — PayPal
| Variable | Description |
|----------|-------------|
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_SECRET` | PayPal secret |
| `PAYPAL_MODE` | `sandbox` or `live` |
| `PAYPAL_PRO_PLAN_ID` | PayPal plan ID for Pro |
| `PAYPAL_ENTERPRISE_PLAN_ID` | PayPal plan ID for Enterprise |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID |

#### Redis (Email Queue)
| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |

#### AI Services
| Variable | Description |
|----------|-------------|
| `AI_API_URL` | `https://api.openai.com/v1/chat/completions` |
| `AI_API_KEY` | OpenAI API key |
| `AI_MODEL` | e.g., `gpt-4o-mini` |
| `TTS_API_URL` | `https://api.openai.com/v1/audio/speech` |

#### CRM Integrations
| Variable | Description |
|----------|-------------|
| `HUBSPOT_API_KEY` | HubSpot API key |
| `SALESFORCE_INSTANCE_URL` | e.g., `https://yourorg.salesforce.com` |
| `SALESFORCE_ACCESS_TOKEN` | Salesforce access token |
| `ZENDESK_SUBDOMAIN` | Zendesk subdomain |
| `ZENDESK_EMAIL` | Zendesk admin email |
| `ZENDESK_API_TOKEN` | Zendesk API token |

#### App & Security
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Production URL, e.g., `https://acadion.com` |
| `NEXT_PUBLIC_MOBILE_SCHEME` | `acadion` |
| `NEXT_PUBLIC_DEEPLINK_URL` | `https://acadion.com` |
| `ENCRYPTION_KEY` | 32-character random string |
| `CRON_SECRET` | Secret for authenticating cron job requests |

#### Monitoring
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN URL |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps |

---

## 3. Deploy to GitHub

### 3.1 Initialize Git Repository

```bash
cd /home/hptechworkpc/Apps/acadion

# Initialize if not already a git repo
git init
git branch -M main
```

### 3.2 Create `.gitignore`

Ensure your `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
.next/
dist/
.turbo/

# Environment files (NEVER commit these)
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Sentry
.sentryclirc

# Supabase local
supabase/.temp/
```

### 3.3 Create a GitHub Repository

```bash
# Using GitHub CLI (install: https://cli.github.com)
gh repo create acadion --private --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Create repo named "acadion" (private recommended)
# 3. Add remote:
git remote add origin git@github.com:YOUR_USERNAME/acadion.git
```

### 3.4 Push Code

```bash
git add .
git commit -m "Initial commit: Acadion academic management system"
git push -u origin main
```

### 3.5 Configure GitHub Secrets

Go to **Settings > Secrets and variables > Actions** and add:

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `EXPO_TOKEN` | Expo/EAS token for mobile builds |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |

### 3.6 Branch Strategy

The CI/CD pipeline (`.github/workflows/ci.yml`) is configured as:

- **`main`** branch: Full pipeline — lint, test, build, deploy to Vercel, build mobile apps, submit to app stores
- **`develop`** branch: Lint & type-check only
- **Pull requests to `main`**: Lint, type-check, test, and build (no deploy)

---

## 4. Deploy to Vercel

### 4.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 4.2 Login & Link Project

```bash
vercel login

# Navigate to the web package
cd packages/web
vercel link
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** Select your team/account
- **Link to existing project?** No (create new)
- **Project name:** `acadion` (or your preferred name)
- **Root directory:** `./` (since you're already in `packages/web`)

### 4.3 Configure Vercel Project Settings

In the Vercel dashboard (**Settings > General**):

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `packages/web` |
| **Build Command** | `cd ../.. && pnpm install && pnpm turbo run build --filter=@acadion/web` |
| **Output Directory** | `.next` |
| **Install Command** | `pnpm install` |
| **Node.js Version** | 20.x |

> **Important**: Since this is a monorepo, the build command must go to the root first to install dependencies and build the shared package.

### 4.4 Add Environment Variables

In **Settings > Environment Variables**, add ALL variables from [Section 2](#2-environment-variables-reference).

For `NEXT_PUBLIC_*` variables, enable for **Production**, **Preview**, and **Development**.
For server-only variables (`SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`, etc.), enable only for **Production** and **Preview**.

### 4.5 Configure Monorepo Build

Create or update `vercel.json` in the repo root:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@acadion/web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

Or place a `vercel.json` inside `packages/web/`:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@acadion/web",
  "installCommand": "pnpm install --filter=@acadion/web..."
}
```

### 4.6 Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 4.7 Set Up Cron Jobs on Vercel

The app has an email queue processor at `/api/cron/process-emails`. Add to `packages/web/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Set the `CRON_SECRET` environment variable in Vercel. The cron endpoint validates this via the `Authorization: Bearer <CRON_SECRET>` header.

### 4.8 Automatic Deployments via CI/CD

The existing `.github/workflows/ci.yml` already handles automatic Vercel deployments on push to `main` using the `amondnet/vercel-action@v25` action. Ensure the three Vercel secrets are configured in GitHub (see [Section 3.5](#35-configure-github-secrets)).

---

## 5. Deploy to a Private VPS

### 5.1 Server Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **RAM** | 1 GB | 2+ GB |
| **CPU** | 1 vCPU | 2+ vCPUs |
| **Disk** | 20 GB | 40+ GB |
| **Node.js** | 18.x | 20.x |

### 5.2 Initial Server Setup

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
corepack enable
corepack prepare pnpm@10.33.0 --activate

# Install build essentials & nginx
sudo apt install -y build-essential nginx certbot python3-certbot-nginx

# Install PM2 for process management
npm install -g pm2
```

### 5.3 Clone & Build

```bash
# Create app directory
sudo mkdir -p /var/www/acadion
sudo chown $USER:$USER /var/www/acadion

# Clone your repository
git clone git@github.com:YOUR_USERNAME/acadion.git /var/www/acadion
cd /var/www/acadion

# Install dependencies
pnpm install

# Set up environment variables
cp packages/web/.env.local.example packages/web/.env.local
nano packages/web/.env.local  # Fill in production values

# IMPORTANT: Set NEXT_PUBLIC_APP_URL to your production domain
# NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Build the monorepo
pnpm build
```

### 5.4 Run with PM2

Create `ecosystem.config.js` in the project root:

```js
module.exports = {
  apps: [
    {
      name: 'acadion-web',
      cwd: './packages/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',        // Use all CPU cores
      exec_mode: 'cluster',    // Cluster mode for load balancing
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/acadion/error.log',
      out_file: '/var/log/acadion/output.log',
      merge_logs: true
    }
  ]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/acadion
sudo chown $USER:$USER /var/log/acadion

# Start the app
pm2 start ecosystem.config.js

# Save PM2 process list & set up auto-start on reboot
pm2 save
pm2 startup
# Run the command PM2 outputs (e.g., sudo env PATH=... pm2 startup systemd ...)
```

### 5.5 Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/acadion`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://127.0.0.1:3000;
        expires 60d;
        add_header Cache-Control "public";
    }

    # Max upload size (for file uploads)
    client_max_body_size 50M;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/acadion /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test & reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 5.6 Set Up SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow the prompts, select "redirect HTTP to HTTPS"

# Auto-renewal is set up automatically. Test it:
sudo certbot renew --dry-run
```

### 5.7 Set Up Cron Job for Email Queue

```bash
# Add cron job to process the email queue every 5 minutes
crontab -e
```

Add this line:

```
*/5 * * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/process-emails > /dev/null 2>&1
```

### 5.8 Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 5.9 Automated Deployment Script

Create `deploy.sh` in the project root:

```bash
#!/bin/bash
set -e

echo "=== Acadion Deployment ==="

cd /var/www/acadion

# Pull latest code
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build
echo "Building..."
pnpm build

# Restart app
echo "Restarting application..."
pm2 reload ecosystem.config.js

echo "=== Deployment complete ==="
```

```bash
chmod +x deploy.sh
```

### 5.10 Docker Alternative (Optional)

If you prefer Docker, create `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/web/node_modules ./packages/web/node_modules
COPY . .
RUN pnpm turbo run build --filter=@acadion/web

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/web/public ./packages/web/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./packages/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/web/server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - packages/web/.env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

To enable standalone output for Docker, add to `packages/web/next.config.js`:

```js
const nextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

Then build & run:

```bash
docker compose up -d --build
```

---

## 6. Custom Domain Configuration

### 6.1 DNS Setup

Add these DNS records at your domain registrar (e.g., Cloudflare, Namecheap, GoDaddy):

#### For Vercel

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | `76.76.21.21`            |
| CNAME | www  | `cname.vercel-dns.com`   |

#### For VPS

| Type  | Name | Value              |
|-------|------|--------------------|
| A     | @    | `YOUR_VPS_IP`      |
| A     | www  | `YOUR_VPS_IP`      |

### 6.2 Vercel Custom Domain

```bash
# Via CLI
vercel domains add yourdomain.com

# Or in Dashboard:
# Project Settings > Domains > Add Domain
```

Vercel automatically provisions SSL for custom domains.

### 6.3 VPS Custom Domain

Already handled in [Section 5.5](#55-configure-nginx-reverse-proxy) (Nginx config) and [Section 5.6](#56-set-up-ssl-with-lets-encrypt) (SSL).

Update the Nginx `server_name` to your actual domain:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 6.4 Update Environment Variables

After setting up your custom domain, update these variables in your deployment:

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_DEEPLINK_URL=https://yourdomain.com
```

### 6.5 Update Webhook URLs

Update webhook endpoints in your payment providers:

- **Paystack Dashboard**: Set webhook URL to `https://yourdomain.com/api/billing/webhook/paystack`
- **PayPal Dashboard**: Set webhook URL to `https://yourdomain.com/api/billing/webhook/paypal`

### 6.6 Update Firebase Auth Domain

In **Firebase Console > Authentication > Settings > Authorized domains**, add:
- `yourdomain.com`
- `www.yourdomain.com`

### 6.7 Update Supabase

In **Supabase Dashboard > Authentication > URL Configuration**:
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: `https://yourdomain.com/**`

---

## 7. Database Setup (Supabase)

### 7.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Note your **Project URL** and **API Keys** from Settings > API

### 7.2 Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations (applies all .sql files in supabase/migrations/)
pnpm db:push

# Seed initial data (users, courses, schedules, announcements, events, subscription plans, course materials)
pnpm db:seed
```

**Important**: The seed script marks all inserted records as `is_sample = true`. When you're ready to go live with real data, use the **Admin Settings** page to delete all sample records before opening the platform to users.

**Migration Order**: SQL files are applied in lexicographic order by filename (timestamp prefix). The new `20260407000001_add_currency_fields_and_sample_flag.sql` migration adds:
- Currency columns (`default_currency_code`, `tax_rate`, `currency_position`) to `institution_settings`
- `is_sample` boolean flag to all relevant tables (users, courses, schedules, announcements, events, course_materials, subscription_plans, etc.)
- Indexes on `is_sample` for fast cleanup

After applying migrations, regenerate TypeScript types if needed:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > packages/web/src/lib/supabase/database.types.ts
```

### 7.3 Enable Row-Level Security

The migrations automatically enable RLS on all tables with appropriate policies. Verify in **Supabase Dashboard > Authentication > Policies**.

### 7.4 Enable Realtime

In **Supabase Dashboard > Database > Replication**, enable realtime for:
- `notifications`
- `announcements`
- `schedules`

---

## 8. CI/CD Pipeline

The `.github/workflows/ci.yml` automates the full lifecycle:

```
Push to main
  ├── Lint & Type Check
  ├── Test Web
  ├── Build Web
  │   └── Deploy to Vercel (production)
  ├── Build Android (EAS)
  ├── Build iOS (EAS)
  └── Submit to App Stores
```

### For VPS deployments

Replace the Vercel deploy step with an SSH-based deploy. Add to `.github/workflows/ci.yml`:

```yaml
  deploy-vps:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: [build-web]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/acadion
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm build
            pm2 reload ecosystem.config.js
```

Add these GitHub secrets:
- `VPS_HOST`: Your VPS IP address
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: SSH private key

---

## 9. Post-Deployment Checklist

### Verify Core Functionality
- [ ] App loads at your domain
- [ ] Firebase authentication works (Google, Apple, email sign-in)
- [ ] Supabase database connection works (data loads)
- [ ] API routes return valid responses (`/api/auth/session`)
- [ ] Realtime notifications work (Supabase Realtime)

### Verify Integrations
- [ ] Email sending works (Resend) — test via contact form or notification
- [ ] Push notifications work (FCM)
- [ ] Payment webhooks are active (Paystack & PayPal)
- [ ] Cron job runs (`/api/cron/process-emails`)
- [ ] AI endpoints respond (`/api/ai/summarize`)

### Data & Branding
- [ ] Institution branding (logo, motto, colors) configured in Admin Settings
- [ ] Default currency set correctly (`institution_settings.default_currency_code`)
- [ ] Tax rate configured if applicable
- [ ] Sample data deleted (if not using demo data)
- [ ] Subscription plans created and active
- [ ] Courses, lecturers, and schedules entered for current term

### Security
- [ ] SSL certificate is active (HTTPS)
- [ ] `.env.local` is NOT committed to Git
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only used server-side
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` is only used server-side
- [ ] RLS policies are enabled on all Supabase tables
- [ ] `ENCRYPTION_KEY` is a strong 32-character random string
- [ ] `CRON_SECRET` is set and cron endpoint validates it

### Monitoring
- [ ] Sentry is receiving errors (check dashboard)
- [ ] PM2 logs are being written (VPS only)
- [ ] Server monitoring is set up (uptime, CPU, memory)

---

## 10. Mobile App Deployment

Acadion's mobile app is built with Expo (React Native) and can be deployed to Google Play Store and Apple App Store using EAS (Expo Application Services).

### 10.1 Prerequisites for Mobile

- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Apple Developer Account** (for iOS)
- **Google Play Console Account** (for Android)
- Expos account and project linked to your app

### 10.2 Configure Mobile Environment

1. Navigate to the mobile package:
   ```bash
   cd packages/mobile
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your production values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_API_URL=https://your-domain.com/api
   EXPO_PUBLIC_APP_SCHEME=acadion
   EXPO_PUBLIC_DEEP_LINK_URL=https://your-domain.com
   ```

4. Log in to Expo:
   ```bash
   eas login
   ```

5. Configure EAS build:
   ```bash
   eas build:configure
   ```

   This creates `eas.json` with build profiles.

### 10.3 Build for Production

#### Android (APK/AAB)

```bash
eas build --platform android --profile production
```

- Wait for the build to complete (cloud build)
- Download the `.aab` (App Bundle) from the Expo website
- Upload to Google Play Console

#### iOS (IPA)

```bash
eas build --platform ios --profile production
```

- Requires Apple credentials
- Download the `.ipa` from Expo
- Upload to App Store Connect using Transporter

### 10.4 App Store Assets

Prepare the following assets:

#### Google Play Store
- **App Icon**: 512x512 PNG (adaptive icon also needed)
- **Feature Graphic**: 1024x500 PNG/JPG
- **Screenshots**: At least 2-8 screenshots (1080x1920 recommended)
- **Short Description**: 80 chars max
- **Full Description**: 4000 chars max
- **Privacy Policy URL**: Link to your policy page

#### Apple App Store
- **App Icon**: 1024x1024 PNG (no alpha)
- **Screenshot Set**: 6.7" and 5.5" displays (multiple)
- **Promotional Text**: 170 chars
- **Description**: 4000 chars
- **Keywords**: 100 chars comma-separated
- **Privacy Policy URL**

### 10.5 Deep Linking Configuration

To enable opening links from the web app to mobile:

1. In `app.json` (or `app.config.js`), set:
   ```json
   {
     "expo": {
       "scheme": "acadion",
       "ios": {
         "bundleIdentifier": "com.yourorg.acadion",
         "associatedDomains": ["applinks:your-domain.com"]
       },
       "android": {
         "package": "com.yourorg.acadion"
       }
     }
   }
   ```

2. Configure your domain's Apple App Site Association (AASI) and Android Asset Links.

3. Set `NEXT_PUBLIC_MOBILE_SCHEME` and `NEXT_PUBLIC_DEEPLINK_URL` in web app `.env.local`.

### 10.6 Store Submissions

#### Google Play
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Upload `.aab` file
4. Fill store listing with assets and descriptions
5. Set pricing and distribution
6. Submit for review (takes hours to days)

#### Apple App Store
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app (iOS)
3. Upload `.ipa` via Transporter or Xcode
4. Fill metadata, screenshots, privacy info
5. Submit for review (typically 1-3 days)

### 10.7 OTA Updates

Expo supports Over-The-Air updates for JS bundle changes without store review:

```bash
eas update --branch production
```

Note: Native code changes (e.g., new native modules) require a new store submission.

### 10.8 Monitoring

- **Expo Application Services Dashboard**: View build status, crash reports
- **Sentry**: Error tracking (configured in app)
- **App Store Connect / Play Console**: User reviews, analytics

---

## 11. Troubleshooting

### Build Fails — "Module not found: @acadion/shared"

The shared package must be built first. Turborepo handles this via `dependsOn: ["^build"]` in `turbo.json`. Ensure you're running `pnpm build` from the monorepo root, not from `packages/web/`.

### Vercel Build Timeout

Monorepo builds can take longer. In Vercel Dashboard > Settings > General:
- Increase **Build Timeout** (Pro plan: up to 45 min)
- Enable **Remote Caching** with Turbo for faster builds

### Vercel Root Directory Issues

If Vercel can't find the Next.js app:
- Set **Root Directory** to `packages/web` in project settings
- Ensure the **Build Command** runs from the monorepo root:
  ```
  cd ../.. && pnpm turbo run build --filter=@acadion/web
  ```

### Firebase Auth Fails in Production

- Add your production domain to **Firebase Console > Authentication > Authorized domains**
- Ensure `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is set correctly
- If using custom domain, the auth domain should still be `yourproject.firebaseapp.com`

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` doesn't have a trailing slash
- Check RLS policies aren't blocking authenticated requests
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for server-side operations

### PM2 App Crashes (VPS)

```bash
# Check logs
pm2 logs acadion-web --lines 100

# Check memory usage
pm2 monit

# Restart
pm2 reload ecosystem.config.js
```

### pnpm Workspace Errors on Vercel

The `package.json` has absolute paths in the `workspaces` field:
```json
"workspaces": ["/home/hptechworkpc/Apps/acadion/packages/*"]
```

**Fix**: Change to relative paths before deploying:
```json
"workspaces": ["packages/*"]
```

### Port Already in Use (VPS)

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change PM2 port in ecosystem.config.js
```

---

## Quick Reference Commands

```bash
# Development
pnpm start:dev              # Start all packages in dev mode

# Build
pnpm build                  # Build entire monorepo

# Database
pnpm db:push                # Run Supabase migrations
pnpm db:seed                # Seed database
pnpm db:studio              # Open Supabase Studio

# Deploy (Vercel)
vercel                      # Preview deploy
vercel --prod               # Production deploy

# Deploy (VPS)
./deploy.sh                 # Pull, build, restart

# PM2 (VPS)
pm2 status                  # Check process status
pm2 logs acadion-web        # View logs
pm2 reload ecosystem.config.js  # Zero-downtime restart
pm2 stop acadion-web        # Stop app

# Docker (VPS alternative)
docker compose up -d --build   # Build and start
docker compose logs -f         # Follow logs
docker compose down            # Stop
```
