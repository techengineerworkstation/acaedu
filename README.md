# Acadion - Smart Academic Notification & Scheduling System

A production-grade full-stack web and mobile application for academic scheduling, notifications, and management.

## Tech Stack

- **Web**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Mobile**: React Native (Expo)
- **Database**: Supabase PostgreSQL
- **Authentication**: Firebase Auth (Google, Apple, Email/Password)
- **Email**: Resend API
- **Payments**: Paystack & PayPal
- **Realtime**: Supabase Realtime
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Architecture**: Turborepo monorepo

## Project Structure

```
acadion/
├── packages/
│   ├── shared/      # Shared TypeScript types, utilities, constants
│   ├── web/         # Next.js web application
│   └── mobile/      # React Native mobile app
├── supabase/
│   ├── migrations/  # Database migrations
│   ├── seed.sql     # Seed data
│   └── config.toml  # Supabase config
├── package.json
└── turbo.json
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- Supabase account
- Firebase project
- Resend account (for email)
- Paystack/PayPal accounts (for payments)

### Setup

1. **Clone and install dependencies**

```bash
npm install
```

2. **Configure environment variables**

```bash
# Copy example env file
cp packages/web/.env.local.example packages/web/.env.local
```

Edit `.env.local` with your actual credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Resend
RESEND_API_KEY=re_your_api_key

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Supabase database**

```bash
cd supabase
supabase db push
supabase db seed
```

4. **Configure Firebase Auth**

- Set up Firebase project
- Enable Google and Apple sign-in providers
- Create service account key and add to env
- (Optional) Set up FCM for push notifications

5. **Create initial admin user**

Use Firebase Admin SDK or run this in Supabase SQL editor:

```sql
-- Insert admin user (you must have matching Firebase user first)
INSERT INTO public.users (id, role, full_name, email, email_verified)
VALUES (
  'firebase-user-uid-here',
  'admin',
  'Admin User',
  'admin@example.com',
  true
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

6. **Run development server**

```bash
npm run dev
```

Visit http://localhost:3000

## Authentication Flow

1. User signs in via Firebase (Google/Apple/Email)
2. Client sends Firebase ID token to `/api/auth/callback`
3. Server verifies token with Firebase Admin SDK
4. User record created/updated in Supabase `users` table
5. Supabase session created and returned
6. Client stores session and uses for subsequent requests

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for complete schema with Row Level Security (RLS) policies.

Core tables:
- `users` - User profiles (extends Firebase auth)
- `departments` - Academic departments
- `courses` - Course offerings
- `enrollments` - Student enrollments
- `schedules` - Class sessions and events
- `schedule_instances` - Recurring schedule occurrences
- `announcements` - System announcements
- `notifications` - In-app notifications
- `events` - Campus events
- `exams` - Exam schedules
- `assignments` - Course assignments
- `grades` - Student grades
- `billing_subscriptions` - Payment plans
- `payments` - Payment history
- `feature_access` - Paywall configuration
- `ai_scheduler_suggestions` - AI scheduling results

## API Routes

### Authentication
- `POST /api/auth/callback` - Exchange Firebase token for Supabase session
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Sign out

### Courses
- `GET /api/courses` - List courses (filtered by role)
- `POST /api/courses` - Create course (admin/lecturer)
- `GET /api/courses/[id]` - Get course
- `PATCH /api/courses/[id]` - Update course
- `POST /api/courses/[id]/enroll` - Enroll in course

### Schedules
- `GET /api/schedules` - List schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/[id]` - Get schedule
- `PATCH /api/schedules/[id]` - Update schedule
- `DELETE /api/schedules/[id]` - Delete schedule
- `GET /api/schedules/conflicts` - Check for conflicts

### Announcements
- `GET /api/announcements` - List published (role-filtered)
- `POST /api/announcements` - Create announcement
- `PATCH /api/announcements/[id]` - Update announcement
- `DELETE /api/announcements/[id]` - Delete announcement

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PATCH /api/notifications/mark-read` - Mark as read
- `POST /api/notifications/broadcast` - Broadcast to users (admin/lecturer)

### Billing
- `GET /api/billing/plans` - Get subscription plans
- `POST /api/billing/checkout` - Initiate payment
- `POST /api/billing/webhook/paystack` - Paystack webhook
- `POST /api/billing/webhook/paypal` - PayPal webhook
- `GET /api/billing/subscription` - Get current subscription

### AI Scheduler
- `POST /api/ai-scheduler/suggest` - Get optimal schedule suggestions
- `POST /api/ai-scheduler/conflicts` - Detect conflicts
- `POST /api/ai-scheduler/[id]/accept` - Accept suggestion

## Role-Based Access

### Student
- View enrolled courses
- See class schedule and instances
- Receive notifications
- View announcements
- See exams and assignments
- Upload assignments, view grades
- AI scheduling suggestions

### Lecturer
- Manage own courses
- Create/edit schedules
- Post announcements to students
- Manage exams and assignments
- Grade student submissions
- View enrolled students
- Send notifications to students

### Admin
- Full CRUD on all tables
- User management (create, assign roles)
- Course creation and assignment
- System-wide announcements
- Billing oversight
- View all data

## Realtime Features

Supabase Realtime subscriptions:

```typescript
// Subscribe to notification updates
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Receive new notification
  })
  .subscribe();
```

## Email Notifications

Uses Resend API with custom templates (see `src/lib/email/templates/`):

Triggered events:
- New announcement (targeted by role/course)
- Schedule reminders (24h, 1h before)
- Assignment due date approaching
- Grade posted
- Payment receipts and reminders

## Payment Integration

### Paystack

1. User selects plan → `POST /api/billing/checkout`
2. Backend creates Paystack authorization
3. User redirected to Paystack payment page
4. Paystack sends webhook to `/api/billing/webhook/paystack`
5. Subscription created/updated in database
6. Confirmation email sent

### PayPal

1. User selects plan → `POST /api/billing/checkout?provider=paypal`
2. Backend creates PayPal order
3. User approves on PayPal
4. Frontend executes order → `POST /api/billing/checkout/paypal/execute`
5. Subscription created, user notified

## Feature Gating (Paywall)

Subscription plans with feature access:

```sql
-- Snippet from migrations
INSERT INTO feature_access (plan_id, feature, is_enabled, limits) VALUES
  ('free', 'ai_scheduler', FALSE, '{}'),
  ('pro', 'ai_scheduler', TRUE, '{"max_suggestions_per_month": 100}'),
  ('enterprise', 'ai_scheduler', TRUE, '{"max_suggestions_per_month": -1}');
```

Check in API middleware:

```typescript
const { allowed } = await requireFeature(userId, 'ai_scheduler');
if (!allowed) {
  return NextResponse.json({ error: 'Feature requires Pro plan' }, { status: 402 });
}
```

## AI Scheduling

Uses Google OR-Tools constraint solver to suggest optimal class times:

- Avoids schedule conflicts
- Respects course credit requirements
- Considers user preferences (time windows, days)
- Optimizes room assignments
- Provides confidence scores and reasoning

API: `POST /api/ai-scheduler/suggest`

## Mobile App (React Native)

Located in `packages/mobile/`

Key screens:
- Auth (Login, Register, Forgot Password)
- Student Dashboard (timetable, notifications)
- Lecturer Dashboard (courses, announcements)
- Admin Panel
- Schedule Management
- Announcements
- Events
- Exams & Assignments
- Grades
- Billing
- Profile

Services:
- Firebase Auth
- Supabase data sync
- FCM push notifications
- Deep linking from notifications

Build with Expo EAS:

```bash
cd packages/mobile
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Deployment

### Web (Vercel)

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard.

### Database (Supabase)

Already on Supabase cloud. Migrations:

```bash
cd supabase
supabase db push
```

### Mobile (Expo)

```bash
cd packages/mobile
eas build
eas submit --platform ios
eas submit --platform android
```

## Monitoring & Observability

Recommended:
- Sentry (errors)
- LogRocket (session replay)
- Firebase Crashlytics (mobile)
- Supabase logs
- Vercel Analytics

## Testing

```bash
# Lint
npm run lint

# Type-check
npm run type-check

# Unit tests (setup Jest)
npm run test

# Build
npm run build
```

## Documentation

- API Reference: `docs/api/`
- Database Schema: `supabase/migrations/001_initial_schema.sql`
- Mobile Guide: `packages/mobile/README.md`

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow TypeScript/ESLint rules
4. Add tests for new features
5. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact the Acadion team.

---

Built with ❤️ for academic excellence
