# Acadion - Production Implementation Plan

## Current Status & Issues to Fix

### 1. Immediate Issues
- ❌ Notification button leads to 404 error page
- ❌ Dashboard shows incomplete data/errors after login
- ❌ Basic white/blue color scheme (upgrade to metallic turquoise + theming)
- ❌ Missing landing page with institution branding
- ❌ Missing admin CRUD for courses, users, schedules
- ❌ Missing course summaries with TTS
- ❌ Incomplete sample data across all sections
- ❌ Missing mobile app implementation

---

## Phase 1: Visual Branding & Theme System (Priority 1)

### 1.1 Enhanced Color Palette
**Files to modify:**
- `packages/web/src/lib/theme/index.ts` - Add metallic turquoise and modern palettes
- `packages/web/src/components/providers/ThemeProvider.tsx` - Enhance theme provider

**New color schemes to add:**
1. **Metallic Turquoise** (default): Primary: #0D9488, Secondary: #14B8A6, Accent: #F59E0B
2. **Royal Gold**: Primary: #D97706, Secondary: #FBBF24, Accent: #7C3AED
3. **Ocean Blue**: Primary: #0284C7, Secondary: #0EA5E9, Accent: #F43F5E
4. **Forest Green**: Primary: #059669, Secondary: #10B981, Accent: #F97316
5. **Midnight Purple**: Primary: #7C3AED, Secondary: #A855F7, Accent: #06B6D4
6. **Sunset Orange**: Primary: #EA580C, Secondary: #F97316, Accent: #8B5CF6

**Features:**
- Theme picker button in admin settings
- Theme preview cards showing actual colors
- Theme applies to both web and mobile (via API sync)
- Persistent theme per institution stored in `institution_settings`

### 1.2 Landing Page with Institution Branding
**New files:**
- `packages/web/src/app/landing/page.tsx` - Landing page shown before login
- `packages/web/src/components/layout/LandingHeader.tsx` - Header with logo/motto
- `packages/web/src/components/layout/BrandedBackground.tsx` - African-themed background

**Features:**
- Show institution logo from `institution_settings` (seed default if none)
- Animated hero section with African illustrations
- Motto/slogan prominently displayed
- Call-to-action buttons: Login, Register
- Background: African students/teachers illustration (from Unsplash)
- Smooth scroll to features section
- Animated section transitions using Framer Motion

### 1.3 African-Themed Images & Graphics
**Location:** `packages/web/public/images/`

**Download from Unsplash/Pixabay:**
- `hero-students.jpg` - African students studying together
- `hero-teacher.jpg` - African teacher in classroom
- `graduation.jpg` - African graduate celebration
- `campus.jpg` - African university campus
- `tech-africa.jpg` - African students with technology
- `empty-state-no-courses.svg` - Custom SVG illustration
- `empty-state-no-schedule.svg` - Custom SVG illustration
- `onboarding-1.svg` - Onboarding illustration
- `onboarding-2.svg` - Onboarding illustration
- `onboarding-3.svg` - Onboarding illustration

**Alt text for accessibility** - Include proper descriptions.

---

## Phase 2: Admin CRUD - Complete Management System (Priority 2)

### 2.1 Admin Users Management
**File:** `packages/web/src/app/(admin)/users/page.tsx`

**Features:**
- DataTable with columns: Avatar, Name, Email, Role, Department, Status, Actions
- Search by name/email
- Filter by role (dropdown)
- Filter by department (dropdown)
- Create User Modal: Email, Full Name, Role, Department, Student/Employee ID, Phone
- Edit User Modal (prefill form)
- Delete User with confirmation (and cascade warning)
- Bulk actions (optional)
- Pagination (50 per page)

**API integration:** `GET /api/admin/users`, `PUT /api/admin/users`, `DELETE /api/admin/users`

### 2.2 Admin Courses Management
**File:** `packages/web/src/app/(admin)/courses/page.tsx`

**Features:**
- DataTable with columns: Code, Title, Lecturer, Department, Credits, Active, Actions
- Search by code/title
- Filter by department/lecturer/active status
- Create/Edit Course Modal:
  - Course Code (required, unique)
  - Title (required)
  - Description (rich text editor - use `react-quill`)
  - Lecturer assignment (dropdown from users.role=lecturer)
  - Department (dropdown)
  - Credits (number)
  - Capacity (number)
  - Syllabus URL (optional)
  - Active toggle
- Delete course (with cascade warning)
- View enrolled students count

**API integration:** `GET /api/admin/courses`, `PUT /api/admin/courses`, `DELETE /api/admin/courses`

### 2.3 Admin Schedules Management (NEW)
**File:** `packages/web/src/app/(admin)/schedules/page.tsx`

**Features:**
- Calendar view using FullCalendar or similar
- List view with DataTable
- Create/Edit Event Modal:
  - Title
  - Course association (optional dropdown)
  - Type: Lecture, Tutorial, Lab, Exam, Assignment
  - Start Time & End Time (datetime picker)
  - Location/Room
  - Lecturer (dropdown, defaults to current user if lecturer)
  - Recurring options: None, Daily, Weekly, Monthly
  - Recurrence end date (if recurring)
  - Attachments (URLs)
- Drag-and-drop scheduling on calendar
- Conflict detection (highlight overlapping events)
- Delete event

**API integration:** Extend existing `schedules` API

### 2.4 Admin Announcements & Events Management
**File:** `packages/web/src/app/(admin)/announcements/page.tsx`

**Features:**
- Rich text editor for content
- Target roles: checkboxes for Student/Lecturer/Admin/Dean
- Target specific courses (multiselect)
- Expiry date picker
- Publish/unpublish toggle
- Priority levels: Low, Normal, High, Urgent
- Category selection

---

## Phase 3: Learning Features (Priority 3)

### 3.1 Course Details Page for Students
**File:** `packages/web/src/app/(dashboard)/student/courses/[id]/page.tsx`

**Features:**
- Course header: title, code, credits, lecturer name, department
- Summary section with **Text-to-Speech button**
- Description (rich text)
- Tabs: Materials | Schedule | Grades | Announcements
- Materials: List with upload date, file type icons, download
- Progress tracking indicator
- Enrollment status badge

### 3.2 Text-to-Speech Component
**File:** `packages/web/src/components/tts/TextToSpeechButton.tsx`

**Features:**
- Play/Pause/Stop controls
- Voice selection (browser voices)
- Speed control (0.5x - 2x)
- Highlight current text being read
- Works on course summaries and materials description

**Hook:** `packages/web/src/hooks/useTextToSpeech.ts`
**Integration:** Add to course summary section and materials

### 3.3 Course Materials Upload (Lecturer)
**File:** `packages/web/src/app/(dashboard)/lecturer/courses/[id]/materials/page.tsx` (NEW)

**Features:**
- Drag & drop file upload
- File type: PDF, Video, Presentation, Document
- Week number assignment
- Publish/unpublish toggle
- List view with edit/delete
- Preview inline (PDF viewer, video player)

---

## Phase 4: Notifications Fix & Enhancement (Priority 4)

### 4.1 Fix 404 Error
**Issue:** Notification button route doesn't exist

**Fix:**
- Create `packages/web/src/app/(dashboard)/notifications/page.tsx`
- Add to `packages/web/src/components/layout/DashboardLayout.tsx` navigation

### 4.2 Notifications Page
**Features:**
- List of notifications with icons by type
- Mark as read/unread
- Mark all as read
- Filter by read/unread
- Delete notification
- Real-time updates via Supabase Realtime subscription

---

## Phase 5: Sample Data Population (Priority 5)

### 5.1 Extend Seed Script
**File:** `packages/web/src/scripts/seed.js`

**Add sample data for:**
- Exams (linking to courses)
- Assignments (linking to courses)
- Grades (linking to students + assignments/exams)
- Attendance records
- Schedule instances (recurring instances generated)
- Notifications (sample in-app notifications)
- Course materials (linked to courses)
- User avatars (use initials or default images)

**Seed execution:**
- Keep `is_sample` flag on all seeded records
- Admin UI shows "Delete All Sample Data" button (already in settings)
- Actual end-users won't see sample data filter if not sample

### 5.2 Mobile Sample Data
- Reuse same seed logic
- Mobile app fetches same data via Supabase

---

## Phase 6: Mobile App Implementation (Priority 6)

### 6.1 Mobile App Foundation
**Package:** `packages/mobile/`

**Setup:**
- Expo SDK 50+ already configured
- Add Expo Router for navigation (already has `expo-router`)
- Set up Supabase client with AsyncStorage persistence
- Set up React Query for data fetching
- Configure Firebase for auth & notifications

### 6.2 Mobile Auth Screens
**Files:**
- `packages/mobile/src/screens/auth/LoginScreen.tsx`
- `packages/mobile/src/screens/auth/RegisterScreen.tsx`
- `packages/mobile/src/screens/auth/ForgotPasswordScreen.tsx`

**Features:**
- Email/password login
- Google/Apple sign-in buttons
- Phone auth option
- Magic link flow
- Form validation
- Error handling (toasts)
- Loading states

### 6.3 Mobile Dashboard
**File:** `packages/mobile/src/screens/dashboard/StudentDashboard.tsx`

**Features:**
- Today's schedule (cards)
- Upcoming assignments (due dates)
- Recent announcements
- Quick stats (courses count, assignments pending, avg grade)
- Bottom tab navigation
- Pull-to-refresh

### 6.4 Mobile Course View
**File:** `packages/mobile/src/screens/courses/CourseDetailScreen.tsx`

**Features:**
- Course info display
- Summary with TTS button
- Materials list (download/open)
- Lecturer info
- Grade view

### 6.5 Mobile Admin Screens
**Files:**
- `packages/mobile/src/screens/admin/UserManagementScreen.tsx`
- `packages/mobile/src/screens/admin/CourseManagementScreen.tsx`
- `packages/mobile/src/screens/admin/ScheduleManagementScreen.tsx`

**Features:**
- CRUD interfaces adapted for mobile (modal forms)
- Search and filter
- Responsive design

---

## Phase 7: Multi-Institution Branding (Priority 7)

### 7.1 Brand Context & Provider
**File:** `packages/web/src/contexts/BrandContext.tsx` (NEW)

**Features:**
- Store institution branding in React context
- Updates automatically when settings change
- Provides: logo URL, colors, motto, institution name

### 7.2 Branded Components
**Update components to use BrandContext:**
- `DashboardHeader.tsx` - Use institution logo
- `LoginPage.tsx` - Add logo/motto
- `RegisterPage.tsx` - Add logo/motto
- `Layout.tsx` - Inject institution styles

### 7.3 Dynamic CSS Variables
- Dynamically update CSS custom properties on `document.documentElement`
- Colors applied immediately without page refresh
- Mobile app reads brand colors from API and applies to theme

---

## Phase 8: Deployment & Production Readiness (Priority 8)

### 8.1 Web Deployment Guide
**File:** `DEPLOYMENT_GUIDE.md` (comprehensive rewrite)

**Sections:**
1. Prerequisites (Supabase, Firebase, Resend, Payment accounts)
2. Environment variables setup (complete list with examples)
3. Database setup (migrations, seed)
4. Firebase Auth configuration (email/password, Google, Apple)
5. Resend email setup (templates, domains)
6. Payment gateway setup (Paystack/PayPal)
7. Vercel deployment (step-by-step)
8. Custom server deployment (Docker, PM2)
9. Custom domain & SSL configuration
10. Production environment checklist
11. Monitoring setup (Sentry, logs)
12. Backup & recovery procedures
13. Scaling considerations
14. Security hardening checklist

### 8.2 Mobile Deployment Guide
**File:** `MOBILE_DEPLOYMENT_GUIDE.md` (NEW)

**Sections:**
1. Expo account setup
2. EAS Build configuration
3. Android build (APK + AAB)
4. iOS build (TestFlight + App Store)
5. App icons and splash screens (per institution branding?)
6. Store listings description templates
7. Review process tips
8. OTA updates with EAS Update
9. Beta testing with Expo Go

### 8.3 Multi-Tenant Deployment
**For institutions wanting to self-host:**

**Scripts to create:**
- `scripts/setup-institution.sh` - Creates new institution with:
  - New `institution_settings` record
  - Admin user (institution admin)
  - Initial data seeding
  - Custom branding upload
- `scripts/backup.sh` - Database backup for single institution
- `scripts/restore.sh` - Database restore

---

## Phase 9: Testing & Quality Assurance (Priority 9)

### 9.1 Unit Tests
- Test all CRUD operations
- Test auth flows
- Test theme switching
- Test TTS component

### 9.2 E2E Tests (Playwright)
- Login flow
- Admin CRUD workflows
- Student course enrollment
- Theme switching

### 9.3 Mobile Testing
- Expo Web testing
- iOS simulator
- Android emulator
- Real device testing

---

## Implementation Order (Daily Tasks)

### Day 1: Theme & Landing Page
- ☐ Enhance theme system with metallic turquoise + 6 preset palettes
- ☐ Create landing page with institution branding
- ☐ Add African-themed hero images (download + place in public/images/)
- ☐ Implement theme picker in admin settings
- ☐ Test theme switching across both platforms

### Day 2: Admin CRUD - Users & Courses
- ☐ Create admin users management page
- ☐ Create admin courses management page
- ☐ Build API routes (already created skeleton)
- ☐ Test create/edit/delete workflows
- ☐ Add search and filtering

### Day 3: Admin CRUD - Schedules & Announcements
- ☐ Create admin schedules page with calendar view
- ☐ Create admin announcements page with rich text
- ☐ Extend schedules API
- ☐ Add conflict detection

### Day 4: Course Features & TTS
- ☐ Build student course details page
- ☐ Implement TTS component and hook
- ☐ Add TTS to course summaries
- ☐ Create course materials upload for lecturers

### Day 5: Notifications & Sample Data
- ☐ Fix notification 404 (create page)
- ☐ Complete notifications page with realtime
- ☐ Extend seed script with comprehensive sample data
- ☐ Extend mobile app with sample data loading

### Day 6: Mobile App Core
- ☐ Set up mobile navigation
- ☐ Implement login/register screens
- ☐ Implement student dashboard
- ☐ Implement course detail view
- ☐ Connect mobile to Supabase

### Day 7: Mobile Admin & Polish
- ☐ Mobile admin screens (users/courses/schedules)
- ☐ Mobile theme sync
- ☐ Mobile TTS
- ☐ Push notification setup (FCM)
- ☐ beta test on device

### Day 8: Documentation & Deployment
- ☐ Write comprehensive DEPLOYMENT_GUIDE.md
- ☐ Write MOBILE_DEPLOYMENT_GUIDE.md
- ☐ Write ADMINISTRATOR_GUIDE.md (how to use admin panel)
- ☐ Write DEVELOPER_SETUP.md (already exists - update)
- ☐ Create video walk-through scripts

---

## File Creation Checklist

### Web App Files to Create
- [ ] `packages/web/src/app/landing/page.tsx`
- [ ] `packages/web/src/app/(dashboard)/notifications/page.tsx`
- [ ] `packages/web/src/app/(admin)/users/page.tsx`
- [ ] `packages/web/src/app/(admin)/courses/page.tsx`
- [ ] `packages/web/src/app/(admin)/schedules/page.tsx`
- [ ] `packages/web/src/app/(admin)/announcements/page.tsx`
- [ ] `packages/web/src/app/(dashboard)/student/courses/[id]/page.tsx`
- [ ] `packages/web/src/app/(dashboard)/lecturer/courses/[id]/materials/page.tsx`
- [ ] `packages/web/src/contexts/BrandContext.tsx`
- [ ] `packages/web/src/components/tts/TextToSpeechButton.tsx`
- [ ] `packages/web/src/components/tts/TextToSpeechProvider.tsx`
- [ ] `packages/web/src/lib/theme/updated-presets.ts` (enhanced)
- [ ] `packages/web/public/images/african-theme/*` (10 images)

### Mobile App Files to Create
- [ ] `packages/mobile/src/screens/auth/LoginScreen.tsx`
- [ ] `packages/mobile/src/screens/auth/RegisterScreen.tsx`
- [ ] `packages/mobile/src/screens/auth/ForgotPasswordScreen.tsx`
- [ ] `packages/mobile/src/screens/dashboard/StudentDashboard.tsx`
- [ ] `packages/mobile/src/screens/dashboard/LecturerDashboard.tsx`
- [ ] `packages/mobile/src/screens/courses/CourseListScreen.tsx`
- [ ] `packages/mobile/src/screens/courses/CourseDetailScreen.tsx`
- [ ] `packages/mobile/src/screens/courses/MaterialsScreen.tsx`
- [ ] `packages/mobile/src/screens/schedule/ScheduleScreen.tsx`
- [ ] `packages/mobile/src/screens/notifications/NotificationsScreen.tsx`
- [ ] `packages/mobile/src/screens/profile/ProfileScreen.tsx`
- [ ] `packages/mobile/src/screens/admin/UserManagementScreen.tsx`
- [ ] `packages/mobile/src/screens/admin/CourseManagementScreen.tsx`
- [ ] `packages/mobile/src/services/supabase.ts`
- [ ] `packages/mobile/src/components/TtsButton.tsx`
- [ ] `packages/mobile/src/components/AnimatedBackground.tsx` (African theme)

### API Routes to Create/Update
- [ ] `packages/web/src/app/api/admin/users/route.ts` (created ✓)
- [ ] `packages/web/src/app/api/admin/courses/route.ts` (created ✓)
- [ ] `packages/web/src/app/api/admin/schedules/route.ts` (new)
- [ ] `packages/web/src/app/api/admin/announcements/route.ts` (new)
- [ ] `packages/web/src/app/api/admin/departments/route.ts` (created ✓)
- [ ] `packages/web/src/app/api/notifications/page.tsx` (fix 404)
- [ ] `packages/web/src/app/api/courses/[id]/materials/route.ts` (new)

### Documentation Files to Create/Update
- [ ] `DEPLOYMENT_GUIDE.md` (complete rewrite)
- [ ] `MOBILE_DEPLOYMENT_GUIDE.md` (new)
- [ ] `ADMIN_GUIDE.md` (new - institution admin usage)
- [ ] `LECTURER_GUIDE.md` (new - lecturer usage)
- [ ] `STUDENT_GUIDE.md` (new - student usage)
- [ ] `API_REFERENCE.md` (new)
- [ ] `PHASE_IMPLEMENTATION.md` (this plan)

---

## Immediate Action Items (Start Now)

1. **Fix notification 404** - Create notifications page and route
2. **Enhance theme system** - Add metallic turquoise + color picker
3. **Create landing page** - With African branding
4. **Build admin users page** - CRUD interface
5. **Build admin courses page** - CRUDE interface with rich text
6. **Extend seed data** - Add more comprehensive sample data
7. **Start mobile app** - Navigation + auth screens

---

## Success Criteria for Production Readiness

- [ ] All admin CRUD operations work (users, courses, schedules, announcements)
- [ ] Students can view course details with summaries and TTS
- [ ] Theme picker works; institution branding displays correctly
- [ ] Landing page with African-themed branding
- [ ] Mobile app functional (login, dashboard, courses, schedule)
- [ ] Notifications page working (no 404, realtime updates)
- [ ] Comprehensive sample data across all tables
- [ ] Sample data can be deleted via admin UI
- [ ] Deployment guides complete and tested
- [ ] Security: RLS policies verified, input validation
- [ ] Performance: Images optimized, lazy loading
- [ ] Accessibility: Alt text, keyboard navigation, ARIA labels

---

**Next Step:** Begin implementation starting with Day 1 tasks.
