# Firebase Authentication Setup - Completed

## Changes Made

### 1. Database Schema (Reverted to Firebase UID format)
- `users.id` is now `TEXT` (to store Firebase UIDs like "SLDv7SgS0hO26T3rrvPDvJDpGHj2")
- All foreign keys to `users(id)` are `TEXT` (not UUID)
- Modified files:
  - `supabase/migrations/20260402000000_initial_schema.sql`
  - `supabase/migrations/20260402010000_extended_schema.sql`

### 2. Restored Firebase Dependencies
- Added back `firebase` and `firebase-admin` to package.json files
- Root package.json: firebase ^12.11.0
- Web package: firebase ^10.7.1, firebase-admin ^13.7.0

### 3. Auth Pages (Firebase-based)
- **Login** (`/login`): Uses `signInWithPopup()` with Google/Apple → Firebase → callback
- **Register** (`/register`): Collects role/department/ID → OAuth → callback creates user
- **Profile completion**: Not needed anymore - all data collected before OAuth

### 4. API Routes
- **POST `/api/auth/callback`**: Verifies Firebase token, creates/updates user in Supabase
- **GET `/api/auth/session`**: Returns current session + user details (uses admin client)
- **POST `/api/auth/logout`**: Revokes refresh token, clears cookies

### 5. Middleware
- Public routes: `/login`, `/register`, `/forgot-password`, `/api/auth/callback`
- Protected routes require valid Supabase session

---

## What You Need to Do Now

### Step 1: Reset Your Database
Apply the corrected schema (with `users.id` as TEXT):

**If using Supabase Local (Docker):**
```bash
cd /home/hptechworkpc/Apps/acadion
npx supabase db reset --local
```

**If using Supabase Cloud:**
1. Go to Supabase SQL Editor
2. Run:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
3. Then run the contents of:
   - `supabase/migrations/20260402000000_initial_schema.sql`
   - `supabase/migrations/20260402010000_extended_schema.sql`

### Step 2: Install Dependencies
```bash
cd /home/hptechworkpc/Apps/acadion
pnpm install
```

### Step 3: Verify Firebase Configuration

You should already have:
- Firebase project: `acadion-educational-app`
- Google sign-in **enabled** in Firebase Console → Authentication → Sign-in method
- Service account key in `.env.local` as `FIREBASE_SERVICE_ACCOUNT_KEY`

**Check that the service account key is valid JSON** (it should be a long string with `\n` escapes). Your current `.env.local` has it.

### Step 4: Verify Supabase Configuration

Make sure your `.env.local` (in root and packages/web) has:
```
NEXT_PUBLIC_SUPABASE_URL=https://xjchucujcvuvuzwndloz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is needed for admin operations (creating users, bypassing RLS).

### Step 5: Restart Dev Server
```bash
cd /home/hptechworkpc/Apps/acadion/packages/web
pnpm dev
```

### Step 6: Grant Database Permissions (One-time)

Run this in Supabase SQL Editor to ensure service role can access `users` table:

```sql
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO anon;
```

### Step 7: Test the Flow

#### Sign Up:
1. Go to `http://localhost:3000/register`
2. Select role (Student/Lecturer/Admin)
3. Fill department and ID fields
4. Click "Sign up with Google"
5. Complete Google OAuth
6. You'll be redirected to your role's dashboard (e.g., `/student/dashboard`)

#### Login:
1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Complete Google OAuth
4. Redirected to your dashboard

---

## How It Works Now

1. **User clicks Google sign-in** → Firebase client opens Google OAuth popup
2. **Google returns ID token** to Firebase client
3. **Firebase client** sends token to `/api/auth/callback`
4. **Server verifies token** with Firebase Admin SDK
5. **Server creates user** in Supabase `users` table (if doesn't exist)
6. **Server returns user data** to client
7. **Client fetches session** from `/api/auth/session` to get Supabase session cookies
8. **User is authenticated** and redirected to dashboard

---

## Troubleshooting

### "Invalid Firebase token"
- Check `FIREBASE_SERVICE_ACCOUNT_KEY` is set and valid JSON
- Ensure Firebase project is `acadion-educational-app`
- Check Google sign-in is enabled in Firebase Console

### "Permission denied for table users"
- Run the GRANT SQL above
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### "User not found" after login
- The user might not have a record in `users` table. The callback should create one automatically.
- Check the `users` table in Supabase to see if the Firebase UID exists

### OAuth popup blocked
- Enable popups for localhost:3000 in your browser

---

## Files Changed

### Modified:
- `package.json` (root & web)
- `supabase/migrations/20260402000000_initial_schema.sql`
- `supabase/migrations/20260402010000_extended_schema.sql`
- `packages/web/src/app/(auth)/login/page.tsx`
- `packages/web/src/app/(auth)/register/page.tsx`
- `packages/web/src/app/api/auth/callback/route.ts`
- `packages/web/src/app/api/auth/session/route.ts`
- `packages/web/src/app/api/auth/logout/route.ts`
- `packages/web/src/middleware.ts`

### Removed:
- `packages/web/src/app/api/test-db/` (debug endpoint)
- `packages/web/src/app/profile/complete/page.tsx` (not needed with Firebase flow)

---

## Next Steps

After verifying auth works, consider:
- Adding email/password authentication (optional)
- Implementing password reset flow
- Adding role-based dashboard redirects
- Testing with different user roles (student, lecturer, admin)

---

**Auth is now using Firebase + Supabase. Google OAuth should work immediately after database reset and dependency install!**
