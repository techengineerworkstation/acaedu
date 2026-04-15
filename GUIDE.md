# Acadion - Production Deployment & Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Database Setup](#database-setup)
5. [Deployment to Vercel](#deployment-to-vercel)
6. [Mobile App (Expo) Setup](#mobile-app-expo-setup)
7. [App Stores Publication](#app-stores-publication)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Maintenance & Monitoring](#maintenance--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Acadion is a full-featured educational scheduling and management platform built with:
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payments**: Stripe/Paystack integration
- **Push Notifications**: Firebase Cloud Messaging
- **Mobile**: Expo (React Native)

This guide covers deploying to Vercel (web) and Expo (mobile) for production use.

---

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account & project
- Vercel account
- Expo account (for mobile)
- Domain name (optional but recommended)
- Google Cloud Console (for Google OAuth, optional)
- Apple Developer account (for Apple OAuth, optional)
- Payment provider accounts (Stripe/Paystack)

---

## Initial Setup

### 1. Clone and Install

```bash
cd Apps/acadion/packages/web
npm install
```

### 2. Environment Variables

Copy `.env.local` and fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Keep secret!

NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Production URL

# Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Payment (Stripe/Paystack)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```

**Important**: Never commit `.env.local`. Add it to `.gitignore`.

---

### 3. Run Database Migrations

The project uses SQL migration files located in `supabase/migrations/`. Apply them in order:

1. `20260402000000_initial_schema.sql` – Core tables and RLS.
2. `20260402010000_extended_schema.sql` – Institutions, faculties, attendance, venues, etc.
3. `20260407000000_add_missing_tables_and_columns.sql` – Adds `institution_settings`, `subscription_plans`, and `summary`/`color` columns to `courses`.

You can apply migrations via Supabase CLI, psql, or the Supabase Dashboard SQL Editor.

Example using Supabase Dashboard:
- Navigate to your Supabase project → SQL Editor.
- Run each migration file's contents in order.

Alternatively, using Supabase CLI locally:
```bash
supabase db push
```
(Ensure your local project is linked to the correct Supabase project.)

The `institution_settings` table requires a single row with a well-known ID used by the application. The migration inserts this row automatically if it doesn't exist.

After migrations, optionally verify:
```sql
SELECT * FROM institution_settings WHERE id = '00000000-0000-0000-0000-000000000001';
```

---

### 4. Seed Sample Data

The database needs initial data for testing. Run the seed script:

```bash
# Ensure SUPABASE_SERVICE_ROLE_KEY is set in your shell
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the seed script
node scripts/seed.js
```

This will create:
- Institution settings
- Sample users (admin, lecturers, students)
- Courses with descriptions
- Announcements and events
- Schedules

**Default admin login**:
- Email: `admin@acadion.edu`
- Password: `Temp123!` (change after first login)

---

## Database Setup (Complete Schema)

If you're starting from scratch, ensure all tables exist. The main tables are:

- `auth.users` (managed by Supabase)
- `users` (custom profile table with role, department, student/employee ID)
- `courses`
- `schedules`
- `announcements`
- `events`
- `exams`
- `assignments`
- `grades`
- `materials`
- `billing_subscriptions`
- `institution_settings`
- `feature_access`
- `notifications`
- `realtime` subscriptions

Refer to `src/lib/supabase/database.types.ts` for full schema.

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
cd Apps/acadion
git add .
git commit -m "feat: prepare for production"
git push origin main
```

### 2. Create Vercel Project

1. Go to https://vercel.com/new
2. Import your repository
3. Configure:
   - **Root Directory**: `packages/web`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Environment Variables in Vercel

Add all environment variables from `.env.local` to Vercel Project Settings → Environment Variables.

Important: `SUPABASE_SERVICE_ROLE_KEY` should be marked as **Secret**.

### 4. Deploy

Click **Deploy**. Vercel will build and deploy automatically.

### 5. Configure Supabase Auth Redirect URLs

In Supabase Dashboard:
- Authentication → URL Configuration
- Add your production URL to **Redirect URLs**:
  ```
  https://yourdomain.com/api/auth/callback
  ```
- Also add for email confirmations if using email auth

### 6. Custom Domain (Optional)

In Vercel:
- Project Settings → Domains → Add domain
- Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to use the custom domain

---

## Mobile App (Expo) Setup

### 1. Create Expo Project

If not already in `packages/mobile`, create a new Expo app:

```bash
cd Apps/acadion
npx create-expo-app mobile --template
# Choose a blank TypeScript template
```

### 2. Install Dependencies

```bash
cd mobile
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install expo-notifications
```

### 3. Supabase Client for Mobile

Create `src/lib/supabase-client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### 4. Screens

Implement:
- **LoginScreen**: Email/password + magic link
- **RegisterScreen**: Role selection + email/password
- **StudentDashboard**, **LecturerDashboard**, **AdminPanel**
- Navigation based on role

### 5. Push Notifications

Configure Firebase Cloud Messaging in Expo:

```bash
npx expou push:android:upload --api-key <your-firebase-api-key>
npx expo push:ios:upload --api-key <your-firebase-api-key>
```

See Expo docs for FCM setup.

### 6. Build for Stores

```bash
# Android
npx expo run:android
npx expo build:android --type apk  # or app-bundle

# iOS
npx expo run:ios
npx expo build:ios
```

### 7. App Store Submission

Follow Expo's EAS build and submission guide. Requires Apple Developer account ($99/year).

---

## Post-Deployment Configuration

### Admin Tasks

1. **Log in as admin** (`admin@acadion.edu`)
2. **Go to Admin → Settings**:
   - Upload institution logo
   - Set institution name and motto
   - Choose theme colors (metallic turquoise, emerald, etc.)
   - Enter social media links
   - Save
3. **Create additional users** (lecturers, students) via Admin → Users or let them self-register
4. **Create Courses, Schedules, Announcements** as needed
5. **Configure billing/subscription plans** if using paid features

### Theme Customization

Institution admins can:
- Change primary/secondary/accent colors
- Upload logo and favicon
- Choose from preset themes (turquoise, emerald, royal, amber, midnight)

All changes reflect immediately across the app.

---

## Maintenance & Monitoring

### Supabase

- Monitor database size and row counts
- Check Auth logs for failed sign-ins
- Enable Row Level Security (RLS) on all tables
- Regularly backup database (Supabase automatic backups)

### Vercel

- Enable analytics
- Set up alerts for errors (Vercel → Alerts)
- Use Web Analytics for performance monitoring

### Sentry

Already integrated. Monitor errors at your Sentry dashboard.

### Firebase

- Check notification delivery metrics
- Monitor storage usage

---

## Troubleshooting

### "No code provided in query" error

Caused by misconfigured OAuth in Supabase. Ensure Google provider credentials are set. For email auth, ensure Email provider is enabled.

### User not created in `users` table

The app auto-creates users now. If it fails, check:
- RLS policies on `users` table allow admin insert
- `institution_settings` row exists (for theme defaults)

### Styles not updating after theme change

Hard refresh (Ctrl+Shift+R). CSS variables are cached by browser.

### Push notifications not working

Check Firebase configuration and that FCM token is obtained and stored. On Android, ensure Google Services JSON is configured.

### Emails not sending

Supabase free tier uses limited email service. For production, configure custom SMTP in Supabase → Auth → Email.

### API rate limits

Supabase has limits. Enable caching and monitor usage.

---

## Support & Documentation

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Expo Docs: https://docs.expo.dev
- Vercel Docs: https://vercel.com/docs

For issues specific to Acadion, check the repository's Issues page.

---

## License

Proprietary - All rights reserved.

---

**Last Updated**: April 2025
