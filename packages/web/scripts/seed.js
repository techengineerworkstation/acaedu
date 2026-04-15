/**
 * Acaedu Sample Data Seeding Script
 *
 * Usage:
 *  1. Set your Supabase service role key as environment variable:
 *     SUPABASE_SERVICE_ROLE_KEY=your_key_here
 *  2. Run: node scripts/seed.js
 *
 * This will populate your database with sample data for testing/demo.
 * It's idempotent - safe to run multiple times (will update existing, insert new).
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env.local if it exists (for SUPABASE_SERVICE_ROLE_KEY)
try {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
} catch (e) {
  console.warn('Could not load .env.local:', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpuhdybttdaxirinrcsp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
});

// Predefined deterministic IDs for consistency
const userIds = {
  admin: '11111111-1111-1111-1111-111111111111',
  lecturer1: '22222222-2222-2222-2222-222222222222',
  lecturer2: '33333333-3333-3333-3333-333333333333',
  student1: '44444444-4444-4444-4444-444444444444',
  student2: '55555555-5555-5555-5555-555555555555',
};

// Department UUIDs (deterministic)
const departmentIds = {
  'IT Department': '66666666-6666-6666-6666-666666666666',
  'Computer Science': '77777777-7777-7777-7777-777777777777',
  'Mathematics': '88888888-8888-8888-8888-888888888888',
};

const sampleDepartments = [
  {
    id: departmentIds['IT Department'],
    name: 'IT Department',
    code: 'IT',
  },
  {
    id: departmentIds['Computer Science'],
    name: 'Computer Science',
    code: 'CS',
  },
  {
    id: departmentIds['Mathematics'],
    name: 'Mathematics',
    code: 'MATH',
  },
];

const sampleSettings = {
  institution_name: 'Acaedu',
  motto: 'Empowering Future Leaders Through Technology',
  website_url: 'https://acadion.edu',
  support_email: 'support@acadion.edu',
  contact_phone: '+1 234 567 8900',
  address: '123 Education Avenue, Tech City, TC 12345',
  theme_preset: 'turquoise',
  primary_color: '#0ea5e9',
  secondary_color: '#6366f1',
  accent_color: '#f59e0b',
  background_color: '#ffffff',
  surface_color: '#f8fafc',
  text_primary_color: '#1e293b',
  text_secondary_color: '#64748b',
  default_currency_code: 'NGN',
  tax_rate: 0.00,
  currency_position: 'before',
};

const sampleUsers = [
  {
    id: userIds.admin,
    email: 'admin@acadion.edu',
    full_name: 'System Administrator',
    role: 'admin',
    department: departmentIds['IT Department'],
    email_verified: true,
  },
  {
    id: userIds.lecturer1,
    email: 'prof.smith@acadion.edu',
    full_name: 'Dr. Kwame Smith',
    role: 'lecturer',
    department: departmentIds['Computer Science'],
    email_verified: true,
  },
  {
    id: userIds.lecturer2,
    email: 'prof.adewunmi@acadion.edu',
    full_name: 'Dr. Funke Adewunmi',
    role: 'lecturer',
    department: departmentIds['Mathematics'],
    email_verified: true,
  },
  {
    id: userIds.student1,
    email: 'student.johnson@acadion.edu',
    full_name: 'Amina Johnson',
    role: 'student',
    department: departmentIds['Computer Science'],
    student_id: 'STD001',
    email_verified: true,
  },
  {
    id: userIds.student2,
    email: 'student.williams@acadion.edu',
    full_name: 'Chinedu Williams',
    role: 'student',
    department: departmentIds['Mathematics'],
    student_id: 'STD002',
    email_verified: true,
  },
];

const sampleCourses = [
  {
    id: uuidv4(),
    course_code: 'CS101',
    title: 'Introduction to Computer Science',
    description: 'Fundamentals of programming, algorithms, and computer systems. Learn the basics of computational thinking and problem-solving using a modern programming language.',
    lecturer_id: userIds.lecturer1,
    credits: 3,
    department_id: departmentIds['Computer Science'],
    is_active: true,
  },
  {
    id: uuidv4(),
    course_code: 'CS201',
    title: 'Data Structures and Algorithms',
    description: 'Advanced data structures and algorithm analysis with focus on efficiency and real-world applications.',
    lecturer_id: userIds.lecturer1,
    credits: 3,
    department_id: departmentIds['Computer Science'],
    is_active: true,
  },
  {
    id: uuidv4(),
    course_code: 'MATH101',
    title: 'Calculus I',
    description: 'Introduction to differential and integral calculus. Limits, derivatives, integrals, and applications to science and engineering.',
    lecturer_id: userIds.lecturer2,
    credits: 3,
    department_id: departmentIds['Mathematics'],
    is_active: true,
  },
  {
    id: uuidv4(),
    course_code: 'MATH201',
    title: 'Linear Algebra',
    description: 'Vector spaces, matrices, determinants, eigenvalues, and their applications in computer science and data analysis.',
    lecturer_id: userIds.lecturer2,
    credits: 3,
    department_id: departmentIds['Mathematics'],
    is_active: true,
  },
];

const sampleSchedules = [
  {
    id: uuidv4(),
    title: 'CS101 - Lecture',
    description: 'Introduction to Computer Science - Weekday Lecture',
    start_time: '2025-04-07T09:00:00',
    end_time: '2025-04-07T10:30:00',
    location: 'Room A101, Science Block',
    lecturer_id: userIds.lecturer1,
    schedule_type: 'lecture',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY',
    recurring_end_date: null,
    course_id: null,
  },
  {
    id: uuidv4(),
    title: 'MATH101 - Lecture',
    description: 'Calculus I - Morning Lecture',
    start_time: '2025-04-07T11:00:00',
    end_time: '2025-04-07T12:30:00',
    location: 'Room B205, Maths Block',
    lecturer_id: userIds.lecturer2,
    schedule_type: 'lecture',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY',
    recurring_end_date: null,
    course_id: null,
  },
  {
    id: uuidv4(),
    title: 'CS201 - Tutorial',
    description: 'Data Structures Tutorial - Lab Session',
    start_time: '2025-04-08T14:00:00',
    end_time: '2025-04-08T15:30:00',
    location: 'Lab C302, Computing Centre',
    lecturer_id: userIds.lecturer1,
    schedule_type: 'tutorial',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY',
    recurring_end_date: null,
    course_id: null,
  },
  {
    id: uuidv4(),
    title: 'MATH201 - Lecture',
    description: 'Linear Algebra - Afternoon Lecture',
    start_time: '2025-04-08T16:00:00',
    end_time: '2025-04-08T17:30:00',
    location: 'Room A102, Science Block',
    lecturer_id: userIds.lecturer2,
    schedule_type: 'lecture',
    is_recurring: true,
    recurrence_rule: 'FREQ=WEEKLY',
    recurring_end_date: null,
    course_id: null,
  },
];

const sampleAnnouncements = [
  {
    id: uuidv4(),
    title: 'Welcome to Acaedu Digital Learning Platform',
    content: `We are thrilled to welcome you to the Acaedu learning management system. This platform will be your central hub for course materials, assignments, schedules, and communication.

Key features to explore:
• Course materials and summaries
• Interactive schedules and calendars
• Real-time notifications
• Progress tracking

Need help? Contact support@acadion.edu.

Best regards,
Administration`,
    target_roles: ['student', 'lecturer', 'admin'],
    author_id: null,
    expires_at: '2025-12-31T23:59:59',
  },
  {
    id: uuidv4(),
    title: 'Mid-Semester Examination Schedule Released',
    content: `Dear Students and Lecturers,

The mid-semester examination schedule has been published. Please note:

- All examinations will be held in designated exam halls.
- Please arrive 30 minutes before the start time.
- Bring your student ID and writing materials.
- No electronic devices allowed during exams.

Good luck to everyone!

Office of the Registrar`,
    target_roles: ['student', 'lecturer'],
    author_id: null,
    expires_at: '2025-06-30T23:59:59',
  },
];

const sampleEvents = [
  {
    id: uuidv4(),
    title: 'Annual Career Fair 2025',
    description: `Join us for the biggest career fair of the year! Over 50 top companies from tech, finance, and research sectors will be recruiting.

Date: May 15, 2025
Time: 10:00 AM - 4:00 PM
Venue: University Auditorium

What to bring:
- Updated CV
- Portfolio (for design/CS students)
- Business cards (optional)

Register now to secure your spot!`,
    start_date: '2025-05-15T10:00:00',
    end_date: '2025-05-15T16:00:00',
    location: 'University Auditorium',
    is_public: true,
    organizer_id: userIds.admin,
  },
  {
    id: uuidv4(),
    title: 'Hackathon 2025: Code for Africa',
    description: `A 24-hour coding marathon to build solutions for African challenges.

Theme: "Technology for Social Impact"
Prizes: $10,000 total + Internships

Teams of 3-4. Registration opens May 1.

Open to all students!`,
    start_date: '2025-06-01T18:00:00',
    end_date: '2025-06-02T18:00:00',
    location: 'Tech Hub, Innovation Centre',
    is_public: true,
    organizer_id: userIds.admin,
  },
  {
    id: uuidv4(),
    title: 'Academic Writing Workshop',
    description: `Improve your research and academic writing skills.

Topics:
- Structuring your paper
- Citation styles (APA, MLA, Chicago)
- Avoiding plagiarism
- Publishing in journals

Date: April 20, 2025
Time: 2:00 PM - 5:00 PM
Venue: Library Conference Room

All students welcome.`,
    start_date: '2025-04-20T14:00:00',
    end_date: '2025-04-20T17:00:00',
    location: 'Library Conference Room',
    is_public: true,
    organizer_id: userIds.admin,
  },
];

// Subscription Plans (sample)
const sampleSubscriptionPlans = [
  {
    id: uuidv4(),
    institution_id: '00000000-0000-0000-0000-000000000001',
    name: 'Free Tier',
    description: 'Basic access for small institutions',
    price_monthly: 0,
    price_yearly: 0,
    currency_code: 'NGN',
    max_users: 50,
    features: ['basic_courses', 'basic_scheduling', 'email_notifications'],
    is_active: true,
    is_default: true,
  },
  {
    id: uuidv4(),
    institution_id: '00000000-0000-0000-0000-000000000001',
    name: 'Pro',
    description: 'Advanced features for growing institutions',
    price_monthly: 5900,
    price_yearly: 59000,
    currency_code: 'NGN',
    max_users: 200,
    features: ['unlimited_courses', 'advanced_scheduling', 'ai_scheduler', 'email_notifications', 'push_notifications'],
    is_active: true,
    is_default: false,
  },
  {
    id: uuidv4(),
    institution_id: '00000000-0000-0000-0000-000000000001',
    name: 'International Pro',
    description: 'Pro plan priced in USD for international institutions',
    price_monthly: 39.00,
    price_yearly: 390.00,
    currency_code: 'USD',
    max_users: 200,
    features: ['unlimited_courses', 'advanced_scheduling', 'ai_scheduler', 'email_notifications', 'push_notifications'],
    is_active: true,
    is_default: false,
  },
  {
    id: uuidv4(),
    institution_id: '00000000-0000-0000-0000-000000000001',
    name: 'Premium',
    description: 'Full-featured enterprise solution',
    price_monthly: 14900,
    price_yearly: 149000,
    currency_code: 'NGN',
    max_users: 1000,
    features: ['unlimited_courses', 'unlimited_notifications', 'ai_scheduler', 'advanced_analytics', 'priority_support', 'custom_branding'],
    is_active: true,
    is_default: false,
  },
];

// Course Materials (sample)
const sampleCourseMaterials = [
  // CS101 Materials
  {
    course_id: null,
    title: 'CS101 Course Syllabus',
    description: 'Complete syllabus for Introduction to Computer Science',
    file_url: 'https://example.com/syllabi/cs101.pdf',
    file_type: 'pdf',
    file_size: 250000,
    material_type: 'document',
    week_number: 1,
    is_published: true,
    uploaded_by: userIds.lecturer1,
  },
  {
    course_id: null,
    title: 'Introduction to Programming Lecture Slides',
    description: 'Week 1-2 lecture slides covering basic programming concepts',
    file_url: 'https://example.com/slides/cs101-intro-programming.pptx',
    file_type: 'presentation',
    file_size: 5500000,
    material_type: 'presentation',
    week_number: 1,
    is_published: true,
    uploaded_by: userIds.lecturer1,
  },
  {
    course_id: null,
    title: 'Getting Started with Python',
    description: 'Video tutorial on setting up Python environment and writing first program',
    file_url: 'https://example.com/videos/cs101-python-intro.mp4',
    file_type: 'video',
    file_size: 150000000,
    material_type: 'video',
    week_number: 2,
    is_published: true,
    uploaded_by: userIds.lecturer1,
  },
  // CS201 Materials
  {
    course_id: null,
    title: 'CS201 Course Outline',
    description: 'Detailed course outline for Data Structures and Algorithms',
    file_url: 'https://example.com/syllabi/cs201.pdf',
    file_type: 'pdf',
    file_size: 180000,
    material_type: 'document',
    week_number: 1,
    is_published: true,
    uploaded_by: userIds.lecturer1,
  },
  {
    course_id: null,
    title: 'Linked Lists and Trees Lecture Notes',
    description: 'Comprehensive notes on linked data structures',
    file_url: 'https://example.com/notes/cs201-linked-lists.pdf',
    file_type: 'pdf',
    file_size: 800000,
    material_type: 'document',
    week_number: 3,
    is_published: true,
    uploaded_by: userIds.lecturer1,
  },
  // MATH101 Materials
  {
    course_id: null,
    title: 'MATH101 Syllabus',
    description: 'Course syllabus for Calculus I',
    file_url: 'https://example.com/syllabi/math101.pdf',
    file_type: 'pdf',
    file_size: 200000,
    material_type: 'document',
    week_number: 1,
    is_published: true,
    uploaded_by: userIds.lecturer2,
  },
  {
    course_id: null,
    title: 'Derivatives Practice Problems',
    description: 'Worksheet with 50+ derivative problems and solutions',
    file_url: 'https://example.com/problemsets/math101-derivatives.pdf',
    file_type: 'pdf',
    file_size: 1200000,
    material_type: 'document',
    week_number: 4,
    is_published: true,
    uploaded_by: userIds.lecturer2,
  },
  // MATH201 Materials
  {
    course_id: null,
    title: 'Linear Algebra Course Introduction',
    description: 'Overview of linear algebra concepts and applications',
    file_url: 'https://example.com/slides/math201-intro.pptx',
    file_type: 'presentation',
    file_size: 4200000,
    material_type: 'presentation',
    week_number: 1,
    is_published: true,
    uploaded_by: userIds.lecturer2,
  },
];

async function seed() {
  console.log('🌱 Starting Acaedu database seed...\n');

  try {
    // 1. Institution settings
    console.log('📝 Seeding institution settings...');
    const { data: setting, error: fetchSettingErr } = await supabase
      .from('institution_settings')
      .select('id')
      .single();

    if (fetchSettingErr && fetchSettingErr.code !== 'PGRST116') {
      throw fetchSettingErr;
    }

    const settingId = setting?.id || '00000000-0000-0000-0000-000000000001';
    await supabase
      .from('institution_settings')
      .upsert({
        id: settingId,
        ...sampleSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    console.log('✅ Institution settings upserted');

    // 2. Departments
    console.log('\n🏛️ Seeding departments...');
    for (const dept of sampleDepartments) {
      const { error } = await supabase
        .from('departments')
        .upsert(dept, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert department ${dept.name}:`, error.message);
      } else {
        console.log(`  ✅ Upserted department: ${dept.name}`);
      }
    }

    // 3. Create auth users
    console.log('\n🔐 Creating auth users...');
    const createdAuthIds = {};
    for (const user of sampleUsers) {
      const authId = await createAuthUser(user);
      if (authId) {
        createdAuthIds[user.email] = authId;
        // Update user with correct auth id
        user.id = authId;
      }
    }

    // 4. Users (custom table)
    console.log('\n👥 Seeding user records...');
    for (const user of sampleUsers) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert user ${user.email}:`, error.message);
      } else {
        console.log(`  ✅ Upserted user: ${user.email} (${user.role})`);
      }
    }

    // 5. Courses
    console.log('\n📚 Seeding courses...');
    for (const course of sampleCourses) {
      const { error } = await supabase
        .from('courses')
        .upsert(course, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert course ${course.course_code}:`, error.message);
      } else {
        console.log(`  ✅ Upserted course: ${course.course_code} - ${course.title}`);
      }
    }

    // 6. Announcements
    console.log('\n📢 Seeding announcements...');
    // Get admin ID from created users
    const adminUser = sampleUsers.find(u => u.role === 'admin');
    const adminId = adminUser?.id;

    const announcementsWithCreator = sampleAnnouncements.map(a => ({
      ...a,
      author_id: adminId,
    }));

    for (const announcement of announcementsWithCreator) {
      const { error } = await supabase
        .from('announcements')
        .upsert(announcement, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert announcement:`, error.message);
      } else {
        console.log(`  ✅ Upserted announcement: ${announcement.title}`);
      }
    }

    // 7. Events
    console.log('\n📅 Seeding events...');
    for (const event of sampleEvents) {
      const { error } = await supabase
        .from('events')
        .upsert(event, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert event:`, error.message);
      } else {
        console.log(`  ✅ Upserted event: ${event.title}`);
      }
    }

    // 8. Schedules
    console.log('\n📆 Seeding schedules...');
    const { data: createdCourses } = await supabase
      .from('courses')
      .select('id, course_code');

    const courseMap = {};
    createdCourses?.forEach(c => { courseMap[c.course_code] = c.id; });

    for (const schedule of sampleSchedules) {
      const courseCode = schedule.title.split(' - ')[0]; // e.g., "CS101"
      const courseId = courseMap[courseCode];
      if (!courseId) {
        console.warn(`  ⚠️ Course ${courseCode} not found for schedule ${schedule.title}`);
        continue;
      }

      const { error } = await supabase
        .from('schedules')
        .upsert({
          ...schedule,
          course_id: courseId,
        }, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert schedule:`, error.message);
      } else {
        console.log(`  ✅ Upserted schedule: ${schedule.title}`);
      }
    }

    // 9. Enrollments (sample enrollments for students)
    console.log('\n📖 Seeding enrollments...');
    const student1 = sampleUsers.find(u => u.role === 'student' && u.student_id === 'STD001');
    const student2 = sampleUsers.find(u => u.role === 'student' && u.student_id === 'STD002');
    if (student1 && student2) {
      // Create a map of course codes to IDs from existing courses
      const { data: coursesForEnrollment } = await supabase
        .from('courses')
        .select('id, course_code')
        .eq('is_active', true);

      const courseCodeToId = {};
      coursesForEnrollment?.forEach(c => { courseCodeToId[c.course_code] = c.id; });

      // Sample enrollments
      const sampleEnrollments = [
        { student_id: student1.id, course_id: courseCodeToId['CS101'], status: 'active' },
        { student_id: student1.id, course_id: courseCodeToId['MATH101'], status: 'active' },
        { student_id: student2.id, course_id: courseCodeToId['CS201'], status: 'active' },
        { student_id: student2.id, course_id: courseCodeToId['MATH201'], status: 'active' },
      ];

      for (const enrollment of sampleEnrollments) {
        if (!enrollment.course_id) {
          console.warn(`  ⚠️ Skipping enrollment for student ${enrollment.student_id} - course not found`);
          continue;
        }
        const { error } = await supabase
          .from('enrollments')
          .upsert(enrollment, { onConflict: 'student_id,course_id' });

        if (error) {
          console.error(`  ❌ Failed to upsert enrollment:`, error.message);
        } else {
          console.log(`  ✅ Upserted enrollment: student ${enrollment.student_id} -> course ${enrollment.course_id}`);
        }
      }
    }

    // 10. Subscription Plans
    console.log('\n💳 Seeding subscription plans...');
    for (const plan of sampleSubscriptionPlans) {
      const { error } = await supabase
        .from('subscription_plans')
        .upsert(plan, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert subscription plan ${plan.name}:`, error.message);
      } else {
        console.log(`  ✅ Upserted subscription plan: ${plan.name} (${plan.currency_code} ${plan.price_monthly}/mo)`);
      }
    }

    // 11. Course Materials
    console.log('\n📎 Seeding course materials...');
    // Get course IDs by code again
    const { data: coursesForMaterials } = await supabase
      .from('courses')
      .select('id, course_code')
      .eq('is_active', true);

    const courseIdByCode = {};
    coursesForMaterials?.forEach(c => { courseIdByCode[c.course_code] = c.id; });

    for (const material of sampleCourseMaterials) {
      // Guess course_id from title prefix (e.g., "CS101 Course Syllabus")
      const courseCodeMatch = material.title.match(/^(CS\d+|MATH\d+)/);
      const courseId = courseCodeMatch ? courseIdByCode[courseCodeMatch[1]] : null;

      if (!courseId) {
        console.warn(`  ⚠️ Could not determine course for material: ${material.title}`);
        continue;
      }

      const { error } = await supabase
        .from('course_materials')
        .upsert({
          ...material,
          course_id: courseId,
        }, { onConflict: 'id' });

      if (error) {
        console.error(`  ❌ Failed to upsert material ${material.title}:`, error.message);
      } else {
        console.log(`  ✅ Upserted material: ${material.title}`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('  1. Log in with admin@acadion.edu (password: Temp123! - change after first login)');
    console.log('  2. Go to Admin Settings to upload logo and customize theme');
    console.log('  3. Admins can now create courses, users, schedules, etc.');
    console.log('  4. Sample data is ready for students and lecturers.');

  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

async function createAuthUser(user) {
  try {
    // Check if auth user exists
    const { data: { users: existing } } = await supabase.auth.admin.listUsers();
    const found = existing.find(u => u.email === user.email);
    if (found) {
      console.log(`  ↳ Auth user already exists: ${user.email} (${found.id})`);
      return found.id;
    }

    // Create new auth user
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'Temp123!', // default password, force reset on first login
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
      },
      options: {
        should_create_user: true,
      }
    });

    if (error) throw error;
    console.log(`  ✅ Created auth user: ${user.email} (${newUser.user.id})`);
    return newUser.user.id;
  } catch (e) {
    console.error(`  ❌ Failed to create auth user ${user.email}:`, e.message);
    return null;
  }
}

seed();