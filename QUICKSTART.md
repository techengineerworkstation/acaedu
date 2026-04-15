# Acadion Quick Start Guide

## Prerequisites Installation

```bash
# Required
- Node.js 18+ (LTS)
- npm 8+
- Git

# Optional (for local DB testing)
- Supabase CLI: npm install -g supabase
- Docker (for local Supabase)
```

---

## 1-Day Setup Checklist

### ☐ Create Supabase Project
1. Go to https://supabase.com
2. Create new project (free tier OK)
3. Note: Project URL and anon key
4. Run: `supabase login`
5. Run: `cd supabase && supabase link --project-ref your-ref`
6. Push schema: `supabase db push`

### ☐ Create Firebase Project
1. Go to https://firebase.google.com
2. Create project
3. Enable **Authentication**:
   - Google provider (enable)
   - Apple provider (enable, configure services ID)
   - Email/Password (optional)
4. Create **Service Account**:
   - Project Settings → Service Accounts
   - Generate new private key (JSON)
5. Enable **Firebase Cloud Messaging** (for mobile push)
6. Note: API key, Auth domain, Project ID, App ID, Messaging Sender ID
7. Add these to `.env.local`

### ☐ Create Resend Account
1. Go to https://resend.com
2. Sign up, verify domain
3. Get API key from dashboard
4. Add to `.env.local`

### ☐ Create Payment Accounts (Optional for Phase 1)
**Paystack:**
- https://paystack.com (Nigeria/Africa focus)
- Get secret and public keys

**PayPal:**
- https://developer.paypal.com
- Create sandbox app
- Get client ID and secret

---

## Local Setup

```bash
# 1. Clone/download project
cd acadion

# 2. Install all dependencies
npm install

# 3. Copy environment config
cp packages/web/.env.local.example packages/web/.env.local

# 4. Edit .env.local with your actual keys:
#    - Supabase URL & keys
#    - Firebase config
#    - Resend API key
#    - (Optional) Payment keys

# 5. Push database schema
npm run db:push

# 6. (Optional) Seed data
npm run db:seed

# 7. Start development server
npm run dev
```

Visit: **http://localhost:3000**

---

## Initial Admin User Setup

### Option A: Firebase Console + SQL

1. Create user in Firebase Console → Authentication → Add user
2. Get user UID
3. Run in Supabase SQL Editor:

```sql
INSERT INTO public.users (id, role, full_name, email, email_verified)
VALUES (
  'firebase-uid-here',
  'admin',
  'Your Name',
  'your.email@example.com',
  true
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Option B: Use Admin API

```typescript
// Use the firebase-admin SDK directly
import { createUser } from '@/lib/firebase/admin';

await createUser('admin@example.com', 'password', {
  full_name: 'Admin User',
  role: 'admin'
});
```

---

## Testing Login

1. Go to http://localhost:3000/login
2. Click "Continue with Google" (or Apple)
3. Authorize in Firebase popup
4. Should auto-redirect to dashboard based on role

**Troubleshooting:**
- **401 Unauthorized**: Check Firebase token exchange, ensure `/api/auth/callback` works
- **User not created**: Check RLS policies, supabase service role key
- **Redirect loop**: Clear cookies, check session cookies

---

## Key URLs

| Route | Description |
|-------|-------------|
| `/login` | Authentication page |
| `/register` | User registration (role selection) |
| `/student/dashboard` | Student view (after login with role=student) |
| `/lecturer/dashboard` | Lecturer view |
| `/admin/dashboard` | Admin panel |
| `/api/auth/session` | Current session (GET) |
| `/api/notifications` | User notifications (GET) |
| `/api/courses` | Course listing (GET/POST) |
| `/api/schedules` | Schedules CRUD |

---

## Database Quick Reference

### Tables
- `users` - Extended user profiles
- `departments` - Academic departments
- `courses` - Course catalog
- `enrollments` - Student enrollments
- `schedules` - Class sessions
- `announcements` - System announcements
- `notifications` - In-app alerts
- `exams`, `assignments`, `grades`
- `billing_subscriptions`, `payments`
- `feature_access` - Paywall config

### Important RLS
- Students see enrolled courses only
- Lecturers see own courses + enrolled student data
- Admin sees everything
- Notifications filtered by target_roles & target_courses

### Useful Queries

```sql
-- Check all users
SELECT * FROM users;

-- Check user role
SELECT id, role, full_name, email FROM users;

-- Active courses
SELECT * FROM courses WHERE is_active = true;

-- Enrolled students for a course
SELECT u.full_name, u.email
FROM enrollments e
JOIN users u ON u.id = e.student_id
WHERE e.course_id = 'course-uuid' AND e.status = 'active';
```

---

## API Testing (with curl)

```bash
# Get session
curl http://localhost:3000/api/auth/session

# Get notifications (requires auth cookie)
curl -H "Cookie: sb-access-token=YOUR_TOKEN" \
  http://localhost:3000/api/notifications

# Broadcast notification (admin only)
curl -X POST http://localhost:3000/api/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "title": "Test",
    "message": "Hello!",
    "target_role": "student"
  }'
```

---

## Debugging

### Check Supabase Realtime
```javascript
// In browser console
const channel = supabase.channel('test')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, payload => console.log(payload))
  .subscribe()
```

### Check Firebase Auth
```javascript
// In browser console
firebase.auth().currentUser
  .then(user => console.log(user))
  .catch(err => console.error(err))
```

### View Database
```bash
# Open Supabase Studio
supabase studio
# Or: https://app.supabase.com/project/.../studio
```

---

## Environment Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON)
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (http://localhost:3000)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` error | Paste full JSON as string, escape quotes |
| RLS policy violation | Check user role, ensure row exists |
| 401 on API routes | Clear cookies, check middleware |
| Email not sending | Verify RESEND_API_KEY, check domain |
| Realtime not working | Ensure Supabase realtime enabled |
| Mobile app won't start | Run `npx expo install` for missing deps |
| iOS build fails | Check Xcode version, team ID |
| Android build fails | Verify keystore, Google Play Console |

---

## Development Workflow

1. **Start Supabase locally (optional):**
   ```bash
   supabase start
   ```

2. **In one terminal:**
   ```bash
   npm run dev
   ```

3. **In another (for email/background jobs):**
   ```bash
   # Run Bull workers (Phase 3)
   npm run workers
   ```

4. **Open browser** → http://localhost:3000

5. **Make changes** → Hot reload

---

## Useful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Database
npm run db:push
npm run db:seed
npm run db:studio

# Mobile
cd packages/mobile && npm start
```

---

## Next Steps After Setup

1. ✅ Create your first admin user (see above)
2. ✅ Add a department in admin panel (via SQL first)
3. ✅ Create sample course as lecturer
4. ✅ Enroll test student
5. ✅ Create schedule/announcement
6. ✅ Test notification realtime
7. ✅ Send test email (via Resend dashboard)
8. ✅ Deploy to Vercel (Production)

---

## Need Help?

1. Check **README.md** for detailed documentation
2. Review **IMPLEMENTATION_SUMMARY.md** for architecture
3. See **plan.md** for Phase-wise development roadmap
4. Consult Supabase/Firebase/Resend official docs

---

**Phase 1 Complete. Start with Phase 2 to build out remaining features.**
