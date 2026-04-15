# Acadion - Administrator User Guide

Welcome to Acadion, the Smart Academic Notification & Scheduling System. This guide helps administrators use the admin panel effectively.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Branding & Theme Customization](#branding--theme-customization)
4. [User Management](#user-management)
5. [Course Management](#course-management)
6. [Schedule Management](#schedule-management)
7. [Announcements](#announcements)
8. [Events](#events)
9. [Subscription Plans & Billing](#subscription-plans--billing)
10. [Sample Data Management](#sample-data-management)
11. [Best Practices](#best-practices)

---

## Getting Started

### Logging In
1. Navigate to your Acadion instance (e.g., `https://yourdomain.com`)
2. Click **Login** and enter your admin credentials
3. If this is your first login, use the temporary password provided and change it immediately

### Admin Dashboard
After login, you'll land on the admin dashboard with an overview of:
- Total users (students, lecturers)
- Active courses
- Recent announcements
- Quick action buttons to navigate to management sections

Use the sidebar to navigate between different admin sections.

---

## Dashboard Overview

The admin dashboard provides:
- **User Stats**: Count of students, lecturers, admins
- **Course Stats**: Active courses, total enrollments
- **Financial Overview**: Current subscription status and revenue (if billing enabled)
- **Recent Activity**: Latest announcements and events
- **Quick Links**: Fast navigation to common tasks

---

## Branding & Theme Customization

Navigate to **Settings** → **Basic Information & Theme** to customize your institution's appearance.

### Basic Information
- **Institution Name**: Displayed in header, page titles, emails
- **Motto / Tagline**: Shown on login page and in header
- **Logo URL**: Link to your institution's logo (recommended size: 200x60px)
- **Favicon URL**: Small icon displayed in browser tab (16x16 or 32x32 PNG)
- **Website URL**: Your institution's public website
- **Social Media**: Facebook, Twitter, Instagram URLs
- **Contact Info**: Support email, phone number, address

All changes are saved instantly with the **Save Settings** button.

### Theme & Colors

#### Using Theme Presets
Select a preset from the dropdown to instantly apply a color scheme:
- **Turquoise** (default) - Fresh, modern blue-green
- **Emerald** - Green for growth and harmony
- **Royal** - Purple for prestige
- **Amber** - Warm orange tones
- **Metallic** - Sleek silver/gray tones

Presets automatically fill all color pickers.

#### Custom Colors
If presets don't match your brand:
1. Use the color picker to choose a color, OR
2. Enter a hex code directly (e.g., `#0ea5e9`)
3. Click **Save Settings**

Color fields:
- **Primary**: Main brand color (buttons, links, headers)
- **Secondary**: Secondary brand color (accents)
- **Accent**: Highlight color for special elements
- **Background**: Page background
- **Surface**: Cards and containers
- **Text Primary**: Main text color
- **Text Secondary**: Secondary text (muted)

The preview updates in real-time as you change colors.

---

## User Management

Navigate to **Users** (or **User Management** in sidebar).

### Viewing Users
The user table displays:
- Full Name
- Email
- Role (student, lecturer, admin, dean)
- Department
- Status (active/inactive)
- Last login

Use the search box to filter by name or email.

### Creating a New User
1. Click **Create User** button
2. Fill in the form:
   - **Email**: The user's email address (will be their login)
   - **Full Name**: First and last name
   - **Role**: Select appropriate role (student, lecturer, admin, dean)
   - **Department**: Select from dropdown (must be created first via Departments)
   - **Student ID** (if student): Matriculation number
   - **Employee ID** (if staff): Faculty/staff ID
3. Click **Create User**
4. The system generates a temporary password and sends an email invitation (or displays it). Inform the user to log in and change their password.

### Editing a User
1. Find the user in the table
2. Click the **Edit** (pencil) icon
3. Update fields as needed (email, name, role, department, etc.)
4. Click **Save**

### Deleting a User
1. Click the **Delete** (trash) icon next to the user
2. Confirm deletion in the dialog
3. Note: Deleting a user also removes their enrollments, submissions, and related data (cascade delete). Consider deactivating instead if you want to preserve history.

---

## Course Management

Navigate to **Courses**.

### Viewing Courses
The courses table shows:
- Course Code (e.g., CS101)
- Title
- Department
- Lecturer (assigned instructor)
- Credits
- Capacity (max students)
- Enrolled count
- Status (active/inactive)

### Creating a Course
1. Click **Create Course**
2. Fill in the form:
   - **Course Code**: Unique identifier (e.g., MATH101, CS201)
   - **Title**: Full course name
   - **Description**: Detailed course overview (optional)
   - **Department**: Select the offering department
   - **Lecturer**: Choose from available lecturers
   - **Credits**: Numeric value (e.g., 3)
   - **Capacity**: Maximum number of students (0 for unlimited)
   - **Color**: Theme color for this course's cards (pick from palette)
   - **Summary**: Brief AI-generated or manual summary (optional, used for TTS)
3. Click **Create Course**

### Editing a Course
1. Click the **Edit** icon on the course row
2. Modify fields as needed
3. Click **Save**

### Deleting a Course
1. Click the **Delete** icon
2. Confirm
3. Warning: All associated schedules, materials, and enrollments will be deleted. Consider making the course inactive instead.

---

## Schedule Management

Navigate to **Schedules**.

### Creating a Schedule
1. Click **Create Schedule**
2. Fill in the form:
   - **Course**: Select the course this schedule belongs to
   - **Title**: Short title (e.g., "Week 1 Lecture")
   - **Description**: Details about the session
   - **Type**: Lecture, Tutorial, Lab, Exam, Assignment
   - **Start Time & End Time**: Date and time picker
   - **Location**: Physical room or online link
   - **Recurring**: Check if this repeats weekly
     - If recurring, set recurrence end date
3. Click **Create Schedule**

Recurring schedules automatically create individual instances each week. Students see these in their calendar and receive reminders.

### Managing Schedules
- View all schedules in a list or calendar view (if available)
- Edit or delete schedules using the icons
- Cancelling a single instance: Click the instance date, then cancel

### Conflict Detection
The system automatically checks for scheduling conflicts (double-booked rooms or lecturers) and warns you before saving.

---

## Announcements

Navigate to **Announcements**.

Announcements are broadcast messages to specific roles (students, lecturers, admins) or all users.

### Creating an Announcement
1. Click **Broadcast Announcement**
2. Fill in:
   - **Title**: Concise headline
   - **Content**: Full message (supports plain text or rich text)
   - **Category**: General, Academic, Event, Emergency, Billing, Maintenance
   - **Priority**: Low, Normal, High, Urgent (affects notification highlighting)
   - **Target Roles**: Check which user groups should receive this (Students, Lecturers, Admins)
   - **Send Email Notification**: Also send via email (if email configured)
   - **Expiry Date**: Optional - announcement auto-hides after this date
3. Click **Broadcast**

Announcements appear in the notification bell dropdown for targeted users and on their dashboard.

### Managing Announcements
- View all past and current announcements
- Delete announcements that are no longer relevant
- Expired announcements are automatically hidden but remain in the database

---

## Events

Navigate to **Events**.

Events are calendar items that students can register for.

### Creating an Event
1. Click **Create Event**
2. Fill in:
   - **Title**: Event name
   - **Description**: Full details (agenda, speakers, etc.)
   - **Category**: Academic, Social, Sports, Career, Other
   - **Start & End Date/Time**: When the event occurs
   - **Location**: Physical or virtual location
   - **Max Participants**: Leave blank for unlimited
   - **Registration Required**: Check if students must RSVP
   - **Public**: If unchecked, only visible to admins/lecturers
3. Click **Create**

### Event Registration
- Students see public events on their dashboard and can register
- You can view registrations and attendance later
- Automatic notifications are sent to registrants before the event (if enabled)

---

## Subscription Plans & Billing

Navigate to:
- **Settings** → **Subscription Plans** (to manage plans)
- **Billing** (to view revenue and subscription status)

### Creating a Subscription Plan
1. In **Settings**, go to the Subscription Plans panel
2. Click **Add Plan**
3. Enter plan details:
   - **Plan Name**: Free, Pro, Premium, etc.
   - **Description**: What this plan includes
   - **Currency**: Select from 12 African and global currencies (NGN, USD, EUR, GHS, KES, ZAR, EGP, XOF, UGX, TZS, MAD, GBP)
   - **Monthly Price** and **Yearly Price**: Use appropriate decimal places for the currency (e.g., NGN often 0 decimals, USD 2 decimals)
   - **Max Users**: Maximum number of users allowed under this plan
   - **Features**: List features one per line (e.g., "unlimited courses", "email notifications", "ai scheduler")
   - **Active**: Toggle on to make available
   - **Default**: Check to make this the default plan when users sign up (only one default allowed)
4. Click **Create Plan**

### Editing/Deleting Plans
- Click **Edit** (pencil) to update a plan
- Click **Delete** (trash) to remove a plan
- Deleting a plan does not affect existing subscriptions but prevents new signups

### Viewing Billing
The **Billing** page shows:
- **Current Subscription**: Your institution's active subscription (if any)
- **Total Revenue**: Sum of all completed payments, formatted in your default currency
- **Active Subscriptions**: Count
- **Payment History**: All transactions with status, amount, provider
- **Available Plans**: Preview of your plan offerings

---

## Sample Data Management

When you first set up Acadion, the system can be seeded with sample data for testing. Once you're ready to go live, you can delete all sample records.

### Checking Sample Data Count
In **Settings**, scroll to the **Sample Data** panel to see:
- Total number of sample records across all tables
- Breakdown by table (users, courses, enrollments, etc.)

### Deleting Sample Data
1. In the Sample Data panel, review the counts
2. Click **Delete All Sample Data**
3. Confirm twice (this is irreversible)
4. The system will delete all records marked as sample in proper order to avoid FK violations
5. You'll see a success message with the number of records deleted

**Important**: Only delete sample data when you're ready to go live. Real user data will never be marked as sample and is safe.

---

## Best Practices

### Before Launch
- [ ] Customize branding (logo, colors, motto)
- [ ] Create all departments and assign heads
- [ ] Add all lecturers and staff with correct roles
- [ ] Create courses and assign lecturers
- [ ] Build the schedule for the current term
- [ ] Test the student enrollment flow
- [ ] Review and publish initial announcements
- [ ] Set up subscription plan and billing details
- [ ] Delete sample data once real data exists
- [ ] Test email notifications (if using)
- [ ] Configure domain and SSL for production

### Ongoing Maintenance
- Regularly back up your database (Supabase auto-backups are recommended)
- Monitor the error logs in Sentry (if configured)
- Keep theme colors consistent with your institution's brand
- Archive old announcements and events periodically
- Review subscription plans annually

### User Support
- Provide users with the guide: "How to log in, enroll in courses, and view schedules"
- Set up a support email and respond promptly to password resets and issues
- Use the **Support Email** field in settings to direct users to help

---

## Need Help?

Check the **DEPLOYMENT_GUIDE.md** for technical setup and deployment instructions.

For developer documentation, see **DEVELOPER_SETUP.md**.

Technical issues? Report at: https://github.com/your-org/acadion/issues

---

*Last updated: 2025-04-07*
