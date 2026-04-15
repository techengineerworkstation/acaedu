# Acadion Deployment & Implementation Guide

A comprehensive guide for deploying the Acadion Smart Academic Scheduling System to production, configuring for multi-institutional white-label deployment, and publishing to mobile app stores.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Cloud Infrastructure Setup](#cloud-infrastructure-setup)
4. [Web Deployment (Vercel)](#web-deployment-vercel)
5. [Database Setup (Supabase)](#database-setup-supabase)
6. [Authentication Setup (Firebase)](#authentication-setup-firebase)
7. [Email Setup (Resend)](#email-setup-resend)
8. [Payment Gateway Setup](#payment-gateway-setup)
9. [Mobile Deployment (Expo EAS)](#mobile-deployment-expo-eas)
10. [Multi-Institution White-Label Configuration](#multi-institution-white-label-configuration)
11. [Environment Variables Reference](#environment-variables-reference)
12. [Production Checklist](#production-checklist)
13. [Troubleshooting](#troubleshooting)
14. [Support & SLA](#support--sla)

---

## Prerequisites

### Required Accounts
- **Supabase** account (database + auth + storage)
- **Firebase** project (authentication + push notifications)
- **Vercel** account (web hosting)
- **Expo** account (mobile builds)
- **Apple Developer** account ($99/year) - for iOS
- **Google Play Console** account ($25 one-time) - for Android
- **Resend** account (transactional emails)
- **Paystack** or **PayPal** business account (payment processing - optional)

### Technical Requirements
- Node.js 18+ installed locally
- Git installed
- Expo CLI: `npm install -g @expo/cli`
- Supabase CLI: `npm install -g supabase`
- Vercel CLI (optional): `npm install -g vercel`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ACADION ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌────────────┐    ┌────────────┐                    │
│  │  Mobile  │────│   API     │────│ Supabase   │                    │
│  │  (Expo)  │    │(Next.js)  │    │ (Postgres) │                    │
│  └──────────┘    └────────────┘    └────────────┘                    │
│                         │                          │                  │
│                         │      ┌────────────┐     │                  │
│                         └──────│   Firebase │◄────┘                  │
│                                │ (Auth +   │                        │
│                                │  Push)    │                        │
│                                └───────────┘                        │
│                                      │                                │
│                                ┌─────┴──────┐                        │
│                                │  Resend    │                        │
│                                │  (Emails)  │                        │
│                                └────────────┘                        │
│                                      │                                │
│                                ┌─────┴──────┐                        │
│                                │  Paystack  │                        │
│                                │ /PayPal    │                        │
│                                └────────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **Web App**: Next.js 14+ with App Router, hosted on Vercel
- **Mobile App**: React Native with Expo, distributed via EAS Build
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Auth**: Firebase Authentication (Google, Apple, Email/Password)
- **Real-time**: Supabase Realtime subscriptions
- **Push**: Firebase Cloud Messaging (FCM)
- **Email**: Resend API with custom templates
- **Payments**: Paystack (Africa) & PayPal (global)

---

## Cloud Infrastructure Setup

### 1. Supabase Project Setup

1. **Create Supabase Project**
   ```bash
   # Navigate to project
   cd supabase

   # Login to Supabase CLI
   supabase login

   # Create new project via dashboard or CLI
   # Recommended: Use dashboard for initial setup
   # Visit: https://app.supabase.com/project/_/settings/api
   ```

2. **Get Credentials**
   - Project URL: `https://[project-ref].supabase.co`
   - `anon` (public) key
   - `service_role` (secret) key

3. **Apply Database Migrations**
   ```bash
   # Push all migrations
   supabase db push

   # Seed sample data
   supabase db seed
   ```

4. **Configure Storage** (optional for file uploads)
   ```sql
   -- Create storage bucket for institution logos
   INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
   ```

5. **Enable Realtime**
   - Go to Supabase Dashboard → Database → Replication
   - Enable replication for tables: `notifications`, `announcements`, `schedules`

### 2. Firebase Project Setup

1. **Create Firebase Project**
   - Visit https://console.firebase.google.com
   - Create new project named "Acadion-[Institution]"

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (OAuth 2.0)
   - Enable **Apple** (requires Apple Developer account)
   - Configure authorized domains

3. **Get Service Account Key**
   ```bash
   # In Firebase Console:
   # Project Settings → Service Accounts → Generate new key
   # Save as firebase-service-account.json
   ```

4. **Enable Cloud Messaging (FCM)**
   - Go to Project Settings → Cloud Messaging
   - Copy Server key and Sender ID

5. **Configure Web SDK**
   ```bash
   # In your project:
   npm install firebase
   ```

### 3. Resend Email Setup

1. **Create Resend Account**
   - Sign up at https://resend.com

2. **Add Domain**
   - Add your domain (e.g., `notify.kaut.edu.gh`)
   - Verify DNS records
   - Get API key from API Keys page

3. **Create Templates** (optional)
   - Announcements template
   - Grade notification template
   - Payment receipt template

### 4. Paystack Setup (Optional)

1. **Create Paystack Business Account**
   - Sign up at https://paystack.com
   - Complete business verification

2. **Get API Keys**
   - Dashboard → Settings → API Keys
   - Get **Public Key** and **Secret Key**

3. **Configure Webhooks**
   ```bash
   # Webhook URL: https://yourdomain.com/api/billing/webhook/paystack
   # Events to subscribe:
   # - charge.success
   # - charge.failed
   # - subscription.create
   # - subscription.disable
   ```

---

## Web Deployment (Vercel)

### Method A: Vercel CLI (Recommended)

```bash
# Navigate to web package
cd packages/web

# Deploy
vercel --prod

# During deployment:
# - Set project name: acadion-web
# - Link to existing project if already created
```

### Method B: Vercel Dashboard

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - In Vercel Dashboard → New Project → Import Git Repository
   - Select Acadion repository

2. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: packages/web
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

3. **Set Environment Variables**

   Go to Project Settings → Environment Variables and add:

   ### Required Variables
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=[api-key]
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[project-id].firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=[project-id]
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[project-id].firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[sender-id]
   NEXT_PUBLIC_FIREBASE_APP_ID=[app-id]
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

   # Resend (Emails)
   RESEND_API_KEY=re_[key]

   # Paystack (Payments - Optional)
   PAYSTACK_SECRET_KEY=sk_live_[key]
   PAYSTACK_PUBLIC_KEY=pk_live_[key]

   # PayPal (Payments - Optional)
   PAYPAL_CLIENT_ID=[client-id]
   PAYPAL_CLIENT_SECRET=[secret]
   PAYPAL_MODE=live

   # App Configuration
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NODE_ENV=production
   ```

4. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Get generated domain or attach custom domain

### Custom Domain Setup

1. **Add Domain**
   - Vercel Dashboard → Project Settings → Domains
   - Add domain: `acadion.yourinstitution.edu`

2. **Update DNS**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Auto-configured** by Vercel

### Production Optimizations

**`packages/web/next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr']
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
    ]
  },
  // Enable static generation where possible
  output: 'standalone'
};

module.exports = nextConfig;
```

---

## Database Setup (Supabase)

### Step 1: Apply Migrations

```bash
cd supabase

# Apply all migrations sequentially
supabase db push

# Verify all tables created
# Tables: users, courses, enrollments, schedules, announcements,
#         notifications, exams, assignments, grades, etc.

# Seed sample data (optional for production)
supabase db seed
```

### Step 2: Configure Row Level Security (RLS)

All tables have RLS policies already defined. Verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'courses', 'enrollments');

-- View policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Step 3: Database Performance

```sql
-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_active_is ON courses(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_datetime ON schedules(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_exams_upcoming ON exams(exam_date) WHERE exam_date > NOW();

-- Enable pg_stat_statements for query monitoring
-- In Supabase: Settings → Database → Extensions → pg_stat_statements
```

### Step 4: Backup Configuration

Supabase provides automated backups:
- **Daily backups**: Retained for 7 days
- **Point-in-time recovery**: Enabled by default
- **Export**: Database → Settings → Backup → Export

**For critical deployments:**
```bash
# Manual backup
supabase db dump -f backup-$(date +%Y%m%d).sql
```

---

## Authentication Setup (Firebase)

### In Firebase Console:

1. **Configure OAuth Providers**
   - **Google**: Enable, add client ID/secret
   - **Apple**: Enable (requires Apple Business/Developer account)
   - **Email/Password**: Enable

2. **Add Authorized Domains**
   ```
   localhost
   yourdomain.com
   *.vercel.app
   ```

3. **Get Configuration Object**

   From Project Settings → General → Your apps → Web:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### In Environment Variables

Add to Vercel/`.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
```

---

## Email Setup (Resend)

### Step 1: Domain Verification

1. Add domain in Resend dashboard
2. Add DNS records (provided by Resend):
   ```
   Type: TXT  Name: @  Value: v=spf1 include:resend.com -all
   Type: TXT  Name: default._domainkey  Value: k=rsa; p=...
   Type: MX    Name: @  Value: mx1.resend.com, mx2.resend.com
   ```

3. Wait for DNS propagation (up to 48 hours)

### Step 2: API Key

Add to environment:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Test Email

```bash
# Test via API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@yourdomain.com",
    "to": ["test@example.com"],
    "subject": "Acadion Test",
    "html": "<p>Email works!</p>"
  }'
```

---

## Payment Gateway Setup

### Paystack (Recommended for Africa)

1. **Create Business Account**
   - Business name: KAUT Educational Services Ltd
   - Country: Ghana

2. **Get API Keys**
   ```
   Dashboard → Settings → API Keys
   - Test Key: sk_test_XXX
   - Live Key: sk_live_XXX
   - Public Key: pk_test_XXX
   ```

3. **Configure Webhook**
   ```bash
   URL: https://yourdomain.com/api/billing/webhook/paystack
   Secret: [Webhook Secret from Paystack]
   Events:
   - charge.success
   - charge.failed
   - subscription.create
   - subscription.disable
   - subscription.not-renew
   ```

4. **Test**
   ```bash
   # Use test cards from Paystack
   # Card: 4242 4242 4242 4242
   # CVV: 123
   ```

### PayPal (Global)

1. **Create Business Account**
   - Business name matching institution

2. **Get Credentials**
   ```
   Dashboard → My Apps & Credentials
   - Client ID
   - Client Secret
   ```

3. **Set Webhook**
   ```bash
   URL: https://yourdomain.com/api/billing/webhook/paypal
   Events: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED
   ```

---

## Mobile Deployment (Expo EAS)

### Prerequisites

```bash
# Install Expo CLI
npm install -g @expo/cli

# Login
eas login

# Configure project
cd packages/mobile
eas build:configure
```

### Step 1: App Configuration

**`packages/mobile/app.json`**
```json
{
  "expo": {
    "name": "Acadion",
    "slug": "acadion",
    "scheme": "acadion",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0d9488"
    },
    "platforms": ["ios", "android"],
    "android": {
      "package": "com.kaut.acadion",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0d9488"
      },
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.kaut.acadion",
      "supportsTablet": true,
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "web": {
      "bundler": "metro",
      "output": "server"
    },
    "plugins": [
      "expo-secure-store"
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### Step 2: Build for Production

**Android (Google Play Store)**
```bash
# Build APK/AAB
eas build --platform android --profile production

# Download .aab from build link
# Or configure automatic upload via eas submit
eas submit --platform android --latest
```

**iOS (Apple App Store)**
```bash
# Build
eas build --platform ios --profile production

# Submit
eas submit --platform ios --latest
```

**Build Profiles** (`eas.json`)
```json
{
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle",
        "gradleProperties": {
          "android.injected.signing.store.file": "./keystore.jks",
          "android.injected.signing.store.password": "...",
          "android.injected.signing.key.alias": "acadion",
          "android.injected.signing.key.password": "..."
        }
      },
      "ios": {
        "simulator": false,
        "autoIncrement": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Step 3: Google Play Store Submission

1. **Create App**
   - Google Play Console → Create App
   - App name: Acadion - KAUT
   - Default language: English

2. **Store Listing**
   - Upload icon (512x512)
   - Upload feature graphic (1024x500)
   - Upload screenshots (minimum 2)
   - Description: "Academic scheduling and notification system..."
   - Category: Education

3. **App Content**
   - Fill out privacy policy
   - Data safety form (describe data collection)
   - Ads: No
   - Content rating: Everyone

4. **Pricing & Distribution**
   - Free app
   - Countries: Target African markets + global

5. **Release**
   - Upload `.aab` file
   - Release to production (staged rollout recommended: 10% → 50% → 100%)

### Step 4: Apple App Store Submission

1. **App Store Connect**
   - Create new app
   - Bundle ID: `com.kaut.acadion` (matches app.json)
   - SKU: acadion-kaut-001
   - Platform: iOS

2. **App Information**
   - Name: Acadion
   - Subtitle: Academic Scheduling for KAUT
   - Category: Education
   - Content Rating: 4+

3. **Screenshots**
   - iPhone 6.7" (1290x2796)
   - iPhone 6.5" (1284x2778)
   - iPad Pro 12.9" (2048x2732)

4. **App Review**
   - Demo account credentials (for review team)
   - Contact information
   - Notes about institution-specific features

5. **Submit for Review**
   - Typically takes 1-3 days
   - Address any rejection reasons

### Push Notifications Setup

**Firebase Cloud Messaging**

1. **Android**
   ```json
   {
     "android": {
       "googleServicesFile": "./google-services.json"
     }
   }
   ```
   Get google-services.json from Firebase Console (Add app → Android).

2. **iOS**
   - Enable Push Notifications in Apple Developer Portal
   - Upload APNs key to Firebase
   - Add to `app.json`:
     ```json
     {
       "ios": {
         "config": {
           "googleSignIn": {
             "reservedClientId": "com.googleusercontent.apps.xxx"
           }
         }
       }
     }
     ```

---

## Multi-Institution White-Label Configuration

Acadion supports full white-labeling per institution. Each school gets:
- Custom logo, colors, and branding
- Custom domain (optional)
- Institution-specific data segregation

### Setup Flow for New Institution

```
1. Institution signs up for Acadion
   ↓
2. Create Supabase row in institution_settings
   ↓
3. Create default admin user (linked to institution)
   ↓
4. Admin logs in → Configure branding via Settings page
   ↓
5. Institution-specific data assigned institution_id
   ↓
6. Students/lecturers join via institution invite code
```

### Database Schema for Multi-Tenancy

```sql
-- institution_settings table (single row per institution)
CREATE TABLE institution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  motto TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#0ea5e9',
  ...
);

-- Reference in users table
ALTER TABLE users ADD COLUMN institution_id UUID REFERENCES institution_settings(id);

-- Courses belong to institution via lecturer
-- Schedules, announcements, grades all cascade through user/institution filters

-- RLS Policy Example:
CREATE POLICY "Users can only access own institution data"
  ON courses FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id FROM users WHERE id = auth.uid()
    )
  );
```

### Wizard for Institution Onboarding

**Admin Dashboard → Settings → Institution Wizard**
```
┌─────────────────────────────────────────────┐
│  INSTITUTION ONBOARDING WIZARD              │
├─────────────────────────────────────────────┤
│ Step 1: Institution Details                 │
│   [ Institution Name: KAUT                  │
│     Motto: Innovation. Excellence. Integrity│
│     Website: https://kaut.edu.gh            │
│     Phone: +233 302 123 456 ]               │
│                                             │
│ Step 2: Brand Assets                        │
│   [ Upload Logo                             │
│     Upload Favicon                          │
│     Primary Color: ████████ [pick]          │
│     Theme Preset: [Metallic Turquoise ▼] ] │
│                                             │
│ Step 3: Domain & SSL (Optional)             │
│   [ Custom Domain: acadion.kaut.edu.gh      │
│     SSL Certificate: [Auto-configure]      │
│                                             │
│ Step 4: Admin Account                       │
│   [ Email: admin@kaut.edu.gh                 │
│     Password: •••••••••                    │
│     Full Name: Prof. Kwame Nkrumah ]        │
│                                             │
│ [Complete Setup & Launch]                   │
└─────────────────────────────────────────────┘
```

### Mobile Per-Institution Branding

**Dynamic Packagers for Mobile**

For fully branded mobile apps per institution:

```javascript
// During EAS build, inject branding
{
  "extra": {
    "institutionId": "kaut",
    "branding": {
      "primaryColor": "#0d9488",
      "logoUrl": "https://cdn.kaut.edu.gh/acadion/logo.png",
      "appName": "KAUT Acadion"
    }
  }
}

// Build command:
eas build --profile production --platform all --auto-increment
```

This creates:
- `com.kaut.acadion` (Android package)
- `com.kaut.acadion` (iOS bundle)
- Custom icons from uploaded logo
- Institution name in app store listings

---

## Environment Variables Reference

### Web (Vercel)
```bash
# ==================== DATABASE ====================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# ==================== AUTH ====================
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=acadion-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567:web:xxx
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# ==================== EMAIL ====================
RESEND_API_KEY=re_xxx

# ==================== PAYMENTS ====================
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=live

# ==================== APP ====================
NEXT_PUBLIC_APP_URL=https://acadion.kaut.edu.gh
NODE_ENV=production
```

### Mobile (Expo)
```bash
# Create packages/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_API_URL=https://acadion.kaut.edu.gh
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_APPLE_CLIENT_ID=...
```

**Note:** Expo environment variables must start with `EXPO_PUBLIC_` to be exposed to the app.

---

## Production Checklist

### Pre-Launch
- [ ] All migrations applied to production Supabase
- [ ] Vercel production deployment live
- [ ] Firebase auth configured with all providers
- [ ] Email domain verified in Resend
- [ ] Payment webhook endpoints configured & tested
- [ ] RLS policies verified and tested
- [ ] Sample data loaded/seeded
- [ ] Admin user created
- [ ] SSL certificates active
- [ ] Custom domain DNS configured
- [ ] Monitoring (Sentry) configured

### Mobile Pre-Launch
- [ ] App icons generated (all sizes)
- [ ] Splash screens created (all sizes)
- [ ] App signing keys generated
- [ ] Google Play Console app listing complete
- [ ] Apple App Store Connect listing complete
- [ ] FCM/APNs certificates uploaded
- [ ] Beta testing via Firebase App Distribution / TestFlight completed

### Go-Live
- [ ] Point `NEXT_PUBLIC_APP_URL` to production
- [ ] Notify institution stakeholders
- [ ] Open sign-ups for students/lecturers
- [ ] Monitor logs for 48 hours
- [ ] Set up regular database backups
- [ ] Configure uptime monitoring (UptimeRobot / Pingdom)

---

## Troubleshooting

### Common Issues

**1. "Invalid API key" from Supabase**
```bash
# Verify environment variables match Supabase project
# In Vercel → Project Settings → Environment Variables
# Redeploy after changes
```

**2. Push notifications not arriving on iOS**
```
- Check APNs certificates in Firebase Console
- Verify bundle ID matches Apple Developer
- Ensure device token is being sent to FCM correctly
```

**3. RLS Policy blocking reads**
```sql
-- Temporarily disable RLS for debugging
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Then fix policy:
-- Make sure policies reference correct auth.uid() checks
```

**4. Email not sending**
```bash
# Check Resend dashboard → Logs
# Verify domain DNS records are verified
# Test with Resend CLI:
npm install -g resend
resend emails send --from="onboarding@yourdomain.com" --to="test@example.com"
```

### Health Check Endpoints

```bash
# Web health
GET /api/health

# Database connection
GET /api/health/db

# Auth status
GET /api/auth/session
```

---

## Support & SLA

### Support Channels
- **Documentation**: https://docs.acadion.edu
- **GitHub Issues**: https://github.com/acadion/acadion/issues
- **Email**: support@acadion.edu
- **Emergency Hotline**: +233 XXX XXX XXX

### Response Times
- Critical (system down): 15 minutes
- High (feature broken): 2 hours
- Medium (visual bug): 1 business day
- Low (feature request): 5 business days

### Monitoring Logs

**Vercel Logs:**
```bash
vercel logs acadion-web-prod --since 1h
```

**Supabase Logs:**
Dashboard → Logs → SQL Editor

**Firebase:**
Firebase Console → Cloud Messaging → Reports

---

## Changelog

- **2024-04-08**: Production deployment guide created
- **2024-04-07**: Multi-institution white-label support added
- **2024-04-02**: Initial system architecture finalized

---

**Need help?** Contact the Acadion engineering team at dev@acadion.edu
