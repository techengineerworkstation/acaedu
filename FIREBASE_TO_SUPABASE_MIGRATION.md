# Firebase to Supabase Migration - Summary

## Changes Made

### 1. Removed Firebase Dependencies
- **package.json** (root & packages/web): Removed `firebase` and `firebase-admin` dependencies
- All Firebase-related code will be replaced with Supabase

### 2. Updated Authentication Flow
- **Login page** (`/src/app/(auth)/login/page.tsx`): Now uses `supabase.auth.signInWithOAuth()` directly
- **Register page** (`/src/app/(auth)/register/page.tsx`): Uses Supabase OAuth, redirects to profile completion after sign-up
- **Callback route** (`/src/app/api/auth/callback/route.ts`): Simplified to handle Supabase OAuth redirect only (no Firebase token verification)

### 3. New Features
- **Profile Completion Page** (`/src/app/profile/complete/page.tsx`): New users must complete their profile after OAuth sign-up to provide:
  - Role (student/lecturer/admin)
  - Department
  - Student ID or Employee ID

### 4. Database Schema
- **users.id** is now `UUID` (Supabase Auth default), not `TEXT` (Firebase UID format)
- All foreign key references to `users(id)` are `UUID`
- This matches Supabase's built-in auth system

### 5. Middleware
- Added `/api/test-db` to public routes (for debugging)

---

## What You Need to Do Now

### Step 1: Install Dependencies
```bash
cd /home/hptechworkpc/Apps/acadion
pnpm install
```
This will remove Firebase packages.

### Step 2: Reset Database
Your database needs to be reset with the corrected schema (UUID users).

**If using Supabase Cloud:**
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
4. Then run the contents of:
   - `supabase/migrations/20260402000000_initial_schema.sql`
   - `supabase/migrations/20260402010000_extended_schema.sql`

**If using local Supabase (Docker):**
```bash
cd /home/hptechworkpc/Apps/acadion
# Ensure Docker is running
npx supabase db reset --local
```

### Step 3: Enable Google OAuth in Supabase
1. Go to Supabase Dashboard → Authentication → Providers
2. Find **Google** and click **Enable**
3. Add Redirect URI: `http://localhost:3000/api/auth/callback`
4. Save

(Do the same for Apple if needed)

### Step 4: Update Environment Variables
Remove Firebase variables from `.env.local` files (optional but recommended):
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Keep only Supabase variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 5: Restart Dev Server
```bash
cd /home/hptechworkpc/Apps/acadion/packages/web
pnpm dev
```

### Step 6: Test Sign-Up Flow
1. Go to `http://localhost:3000/register`
2. Choose a role (Student/Lecturer/Admin)
3. Click "Sign up with Google"
4. Complete Google OAuth
5. You'll be redirected to `/profile/complete` to fill in additional info
6. Submit → redirected to appropriate dashboard

### Step 7: Test Login Flow
1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Complete Google OAuth
4. You should be redirected to your dashboard directly (no profile completion for existing users)

---

## Notes

- The app now uses **Supabase Auth only** - no Firebase
- User records are stored in the `users` table (linked to Supabase auth.users by UUID)
- New users must complete their profile to set role and department
- Existing users (if any) need to have corresponding `users` table entries; the system will auto-create on first OAuth login

---

## Files Modified/Created

### Modified
- `package.json` (root)
- `packages/web/package.json`
- `packages/web/src/app/(auth)/login/page.tsx`
- `packages/web/src/app/(auth)/register/page.tsx`
- `packages/web/src/app/api/auth/callback/route.ts`
- `supabase/migrations/20260402000000_initial_schema.sql`
- `supabase/migrations/20260402010000_extended_schema.sql`

### Created
- `packages/web/src/app/profile/complete/page.tsx`

---

## Troubleshooting

### "Permission denied for table users"
Run these SQL commands in Supabase SQL Editor:
```sql
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO anon;
```

### "relation users does not exist"
Reset your database with the migrations. The `users` table must exist.

### OAuth redirect fails
Ensure Google provider is enabled in Supabase and redirect URI is exactly `http://localhost:3000/api/auth/callback`

---

## Next Steps (Future Improvements)

1. Add email/password authentication (if needed)
2. Implement password reset flow
3. Add admin features for user management
4. Test with real data
