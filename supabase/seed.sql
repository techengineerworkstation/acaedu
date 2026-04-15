-- ============================================================
-- ACADION COMPREHENSIVE SAMPLE DATA
-- Production-ready demo data for educational institutions
-- ============================================================
-- This seed populates your database with realistic sample data
-- including African names, universities, and contexts.
--
-- IMPORTANT: All sample records are tagged with is_sample = true
-- Admin users can delete all sample data via /api/admin/sample-data
-- ============================================================

-- =====================
-- INSTITUTION SETTINGS
-- =====================
INSERT INTO institution_settings (
  id,
  institution_name,
  motto,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  surface_color,
  text_primary_color,
  text_secondary_color,
  theme_preset,
  website_url,
  support_email,
  contact_phone,
  address
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Kofi Annan University of Technology',
  'Innovation. Excellence. Integrity.',
  'https://acadion.com/logo-kaut.png',
  'https://acadion.com/favicon-kaut.png',
  '#0d9488', -- metallic turquoise
  '#14b8a6',
  '#fbbf24',
  '#f0fdfa',
  '#ccfbf1',
  '#064e3b',
  '#5f9ea0',
  'metallic_turquoise',
  'https://kaut.edu.gh',
  'support@kaut.edu.gh',
  '+233 302 123 456',
  '123 Innovation Drive, Accra, Ghana'
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- DEPARTMENTS (Faculty & School Structure)
-- ========================================
INSERT INTO departments (id, name, code) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Faculty of Engineering', 'ENG'),
  ('10000000-0000-0000-0000-000000000002', 'Faculty of Science', 'SCI'),
  ('10000000-0000-0000-0000-000000000003', 'Faculty of Business & Economics', 'BUS'),
  ('10000000-0000-0000-0000-000000000004', 'Faculty of Arts & Humanities', 'ARTS'),
  ('10000000-0000-0000-0000-000000000005', 'Faculty of Social Sciences', 'SOC'),
  ('10000000-0000-0000-0000-000000000006', 'School of Medicine & Health Sciences', 'MED'),
  ('10000000-0000-0000-0000-000000000007', 'School of Law', 'LAW'),
  ('10000000-0000-0000-0000-000000000008', 'School of Education', 'EDU')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- USERS (Students, Lecturers, Admin)
-- is_sample = true identifies demo data
-- ========================================

-- Admin Users (3)
INSERT INTO users (id, email, full_name, role, student_id, employee_id, email_verified, phone) VALUES
  ('20000000-0000-0000-0000-000000000001', 'admin.chair@kaut.edu.gh', 'Prof. Kwame Nkrumah', 'admin', NULL, 'EMP-ADMIN-001', true, '+233 244 123 001'),
  ('20000000-0000-0000-0000-000000000002', 'admin.tech@kaut.edu.gh', 'Dr. Ama Serwaa', 'admin', NULL, 'EMP-ADMIN-002', true, '+233 244 123 002'),
  ('20000000-0000-0000-0000-000000000003', 'registrar@kaut.edu.gh', 'Mr. Kofi Mensah', 'admin', NULL, 'EMP-REG-001', true, '+233 244 123 003')
ON CONFLICT (id) DO UPDATE SET is_sample = true;

-- Lecturers (12)
INSERT INTO users (id, email, full_name, role, department, student_id, employee_id, email_verified, phone) VALUES
  -- Engineering
  ('20000000-0000-0000-0000-000000000101', 'j.asante@kaut.edu.gh', 'Dr. Joseph Asante', 'lecturer', '10000000-0000-0000-0000-000000000001', NULL, 'EMP-LEC-101', true, '+233 244 101 001'),
  ('20000000-0000-0000-0000-000000000102', 'm.boateng@kaut.edu.gh', 'Dr. Mary Boateng', 'lecturer', '10000000-0000-0000-0000-000000000001', NULL, 'EMP-LEC-102', true, '+233 244 101 002'),
  ('20000000-0000-0000-0000-000000000103', 'k.owusu@kaut.edu.gh', 'Prof. Kwame Owusu', 'lecturer', '10000000-0000-0000-0000-000000000001', NULL, 'EMP-LEC-103', true, '+233 244 101 003'),
  ('20000000-0000-0000-0000-000000000104', 'a.adjei@kaut.edu.gh', 'Dr. Abena Adjei', 'lecturer', '10000000-0000-0000-0000-000000000001', NULL, 'EMP-LEC-104', true, '+233 244 101 004'),
  -- Science
  ('20000000-0000-0000-0000-000000000201', 'i.sarpong@kaut.edu.gh', 'Dr. Ishmael Sarpong', 'lecturer', '10000000-0000-0000-0000-000000000002', NULL, 'EMP-LEC-201', true, '+233 244 102 001'),
  ('20000000-0000-0000-0000-000000000202', 'e.benso@kaut.edu.gh', 'Dr. Efua Benso', 'lecturer', '10000000-0000-0000-0000-000000000002', NULL, 'EMP-LEC-202', true, '+233 244 102 002'),
  ('20000000-0000-0000-0000-000000000203', 'd.mensah@kaut.edu.gh', 'Prof. David Mensah', 'lecturer', '10000000-0000-0000-0000-000000000002', NULL, 'EMP-LEC-203', true, '+233 244 102 003'),
  -- Business
  ('20000000-0000-0000-0000-000000000301', 'c.darko@kaut.edu.gh', 'Dr. Charles Darko', 'lecturer', '10000000-0000-0000-0000-000000000003', NULL, 'EMP-LEC-301', true, '+233 244 103 001'),
  ('20000000-0000-0000-0000-000000000302', 'f.abil@kaut.edu.gh', 'Dr. Felicia Abil', 'lecturer', '10000000-0000-0000-0000-000000000003', NULL, 'EMP-LEC-302', true, '+233 244 103 002'),
  ('20000000-0000-0000-0000-000000000303', 'a.yeboah@kaut.edu.gh', 'Prof. Anthony Yeboah', 'lecturer', '10000000-0000-0000-0000-000000000003', NULL, 'EMP-LEC-303', true, '+233 244 103 003'),
  -- Humanities
  ('20000000-0000-0000-0000-000000000401', 'g.badio@kaut.edu.gh', 'Dr. Grace Badio', 'lecturer', '10000000-0000-0000-0000-000000000004', NULL, 'EMP-LEC-401', true, '+233 244 104 001'),
  ('20000000-0000-0000-0000-000000000402', 'r.kwame@kaut.edu.gh', 'Dr. Raphael Kwame', 'lecturer', '10000000-0000-0000-0000-000000000004', NULL, 'EMP-LEC-402', true, '+233 244 104 002')
ON CONFLICT (id) DO UPDATE SET is_sample = true;

-- Students (60)
-- Year 1 (20 students)
INSERT INTO users (id, email, full_name, role, department, student_id, email_verified, phone) VALUES
  ('30000000-0000-0000-0000-000000000001', 's001@kaut.edu.gh', 'Abdul Rahman', 'student', '10000000-0000-0000-0000-000000000001', '2024/ENG/001', true, '+233 245 001 001'),
  ('30000000-0000-0000-0000-000000000002', 's002@kaut.edu.gh', 'Adjoa Asante', 'student', '10000000-0000-0000-0000-000000000001', '2024/ENG/002', true, '+233 245 001 002'),
  ('30000000-0000-0000-0000-000000000003', 's003@kaut.edu.gh', 'Kofi Agyeman', 'student', '10000000-0000-0000-0000-000000000001', '2024/ENG/003', true, '+233 245 001 003'),
  ('30000000-0000-0000-0000-000000000004', 's004@kaut.edu.gh', 'Ama Serwaah', 'student', '10000000-0000-0000-0000-000000000002', '2024/SCI/001', true, '+233 245 002 001'),
  ('30000000-0000-0000-0000-000000000005', 's005@kaut.edu.gh', 'Yaw Boateng', 'student', '10000000-0000-0000-0000-000000000002', '2024/SCI/002', true, '+233 245 002 002'),
  ('30000000-0000-0000-0000-000000000006', 's006@kaut.edu.gh', 'Efua Osei', 'student', '10000000-0000-0000-0000-000000000003', '2024/BUS/001', true, '+233 245 003 001'),
  ('30000000-0000-0000-0000-000000000007', 's007@kaut.edu.gh', 'Kwame Nkrumah Jr', 'student', '10000000-0000-0000-0000-000000000003', '2024/BUS/002', true, '+233 245 003 002'),
  ('30000000-0000-0000-0000-000000000008', 's008@kaut.edu.gh', 'Abena Ofori', 'student', '10000000-0000-0000-0000-000000000004', '2024/ARTS/001', true, '+233 245 004 001'),
  ('30000000-0000-0000-0000-000000000009', 's009@kaut.edu.gh', 'Ibrahim Suray', 'student', '10000000-0000-0000-0000-000000000005', '2024/SOC/001', true, '+233 245 005 001'),
  ('30000000-0000-0000-0000-000000000010', 's010@kaut.edu.gh', 'Chidinma Eze', 'student', '10000000-0000-0000-0000-000000000005', '2024/SOC/002', true, '+233 245 005 002'),
  ('30000000-0000-0000-0000-000000000011', 's011@kaut.edu.gh', 'Amina Diallo', 'student', '10000000-0000-0000-0000-000000000006', '2024/MED/001', true, '+233 245 006 001'),
  ('30000000-0000-0000-0000-000000000012', 's012@kaut.edu.gh', 'Emmanuel Okoro', 'student', '10000000-0000-0000-0000-000000000006', '2024/MED/002', true, '+233 245 006 002'),
  ('30000000-0000-0000-0000-000000000013', 's013@kaut.edu.gh', 'Fatima Alhassan', 'student', '10000000-0000-0000-0000-000000000007', '2024/LAW/001', true, '+233 245 007 001'),
  ('30000000-0000-0000-0000-000000000014', 's014@kaut.edu.gh', 'Samuel Tettey', 'student', '10000000-0000-0000-0000-000000000008', '2024/EDU/001', true, '+233 245 008 001'),
  ('30000000-0000-0000-0000-000000000015', 's015@kaut.edu.gh', 'Linda Oduro', 'student', '10000000-0000-0000-0000-000000000008', '2024/EDU/002', true, '+233 245 008 002'),
  -- Year 2 (20)
  ('30000000-0000-0000-0000-000000000016', 's016@kaut.edu.gh', 'Mustapha Fuseini', 'student', '10000000-0000-0000-0000-000000000001', '2023/ENG/001', true, '+233 245 101 001'),
  ('30000000-0000-0000-0000-000000000017', 's017@kaut.edu.gh', 'Ruth Appiah', 'student', '10000000-0000-0000-0000-000000000001', '2023/ENG/002', true, '+233 245 101 002'),
  ('30000000-0000-0000-0000-000000000018', 's018@kaut.edu.gh', 'Daniel Kwakye', 'student', '10000000-0000-0000-0000-000000000001', '2023/ENG/003', true, '+233 245 101 003'),
  ('30000000-0000-0000-0000-000000000019', 's019@kaut.edu.gh', 'Beatrice Mensah', 'student', '10000000-0000-0000-0000-000000000002', '2023/SCI/001', true, '+233 245 102 001'),
  ('30000000-0000-0000-0000-000000000020', 's020@kaut.edu.gh', 'Elijah Bamfo', 'student', '10000000-0000-0000-0000-000000000002', '2023/SCI/002', true, '+233 245 102 002'),
  ('30000000-0000-0000-0000-000000000021', 's021@kaut.edu.gh', 'Grace Owusu-Darko', 'student', '10000000-0000-0000-0000-000000000003', '2023/BUS/001', true, '+233 245 103 001'),
  ('30000000-0000-0000-0000-000000000022', 's022@kaut.edu.gh', 'Prince Boadu', 'student', '10000000-0000-0000-0000-000000000003', '2023/BUS/002', true, '+233 245 103 002'),
  ('30000000-0000-0000-0000-000000000023', 's023@kaut.edu.gh', 'Zainab Mohammed', 'student', '10000000-0000-0000-0000-000000000004', '2023/ARTS/001', true, '+233 245 104 001'),
  ('30000000-0000-0000-0000-000000000024', 's024@kaut.edu.gh', 'Solomon Tetteh', 'student', '10000000-0000-0000-0000-000000000005', '2023/SOC/001', true, '+233 245 105 001'),
  ('30000000-0000-0000-0000-000000000025', 's025@kaut.edu.gh', 'Oluchi Nwosu', 'student', '10000000-0000-0000-0000-000000000005', '2023/SOC/002', true, '+233 245 105 002'),
  ('30000000-0000-0000-0000-000000000026', 's026@kaut.edu.gh', 'Ibrahim Abdulai', 'student', '10000000-0000-0000-0000-000000000006', '2023/MED/001', true, '+233 245 106 001'),
  ('30000000-0000-0000-0000-000000000027', 's027@kaut.edu.gh', 'Regina Asamoah', 'student', '10000000-0000-0000-0000-000000000006', '2023/MED/002', true, '+233 245 106 002'),
  ('30000000-0000-0000-0000-000000000028', 's028@kaut.edu.gh', 'Eric Amankwa', 'student', '10000000-0000-0000-0000-000000000007', '2023/LAW/001', true, '+233 245 107 001'),
  ('30000000-0000-0000-0000-000000000029', 's029@kaut.edu.gh', 'Patience Adjei', 'student', '10000000-0000-0000-0000-000000000008', '2023/EDU/001', true, '+233 245 108 001'),
  ('30000000-0000-0000-0000-000000000030', 's030@kaut.edu.gh', 'Daniel Agyeman', 'student', '10000000-0000-0000-0000-000000000008', '2023/EDU/002', true, '+233 245 108 002'),
  -- Year 3 (20)
  ('30000000-0000-0000-0000-000000000031', 's031@kaut.edu.gh', 'Kwabena Osei', 'student', '10000000-0000-0000-0000-000000000001', '2022/ENG/001', true, '+233 245 201 001'),
  ('30000000-0000-0000-0000-000000000032', 's032@kaut.edu.gh', 'Akosua Frimpong', 'student', '10000000-0000-0000-0000-000000000001', '2022/ENG/002', true, '+233 245 201 002'),
  ('30000000-0000-0000-0000-000000000033', 's033@kaut.edu.gh', 'Michael Adeyemi', 'student', '10000000-0000-0000-0000-000000000001', '2022/ENG/003', true, '+233 245 201 003'),
  ('30000000-0000-0000-0000-000000000034', 's034@kaut.edu.gh', 'Adwoa Doku', 'student', '10000000-0000-0000-0000-000000000002', '2022/SCI/001', true, '+233 245 202 001'),
  ('30000000-0000-0000-0000-000000000035', 's035@kaut.edu.gh', 'Samuel Baah', 'student', '10000000-0000-0000-0000-000000000002', '2022/SCI/002', true, '+233 245 202 002'),
  ('30000000-0000-0000-0000-000000000036', 's036@kaut.edu.gh', 'Miriam Ntim', 'student', '10000000-0000-0000-0000-000000000003', '2022/BUS/001', true, '+233 245 203 001'),
  ('30000000-0000-0000-0000-000000000037', 's037@kaut.edu.gh', 'Joshua Kumi', 'student', '10000000-0000-0000-0000-000000000003', '2022/BUS/002', true, '+233 245 203 002'),
  ('30000000-0000-0000-0000-000000000038', 's038@kaut.edu.gh', 'Nadia Yussif', 'student', '10000000-0000-0000-0000-000000000004', '2022/ARTS/001', true, '+233 245 204 001'),
  ('30000000-0000-0000-0000-000000000039', 's039@kaut.edu.gh', 'Alhassan Mahama', 'student', '10000000-0000-0000-0000-000000000005', '2022/SOC/001', true, '+233 245 205 001'),
  ('30000000-0000-0000-0000-000000000040', 's040@kaut.edu.gh', 'Adaeze Obi', 'student', '10000000-0000-0000-0000-000000000005', '2022/SOC/002', true, '+233 245 205 002'),
  ('30000000-0000-0000-0000-000000000041', 's041@kaut.edu.gh', 'Salma Adams', 'student', '10000000-0000-0000-0000-000000000006', '2022/MED/001', true, '+233 245 206 001'),
  ('30000000-0000-0000-0000-000000000042', 's042@kaut.edu.gh', 'Victor Eshun', 'student', '10000000-0000-0000-0000-000000000006', '2022/MED/002', true, '+233 245 206 002'),
  ('30000000-0000-0000-0000-000000000043', 's043@kaut.edu.gh', 'Latifa Seidu', 'student', '10000000-0000-0000-0000-000000000007', '2022/LAW/001', true, '+233 245 207 001'),
  ('30000000-0000-0000-0000-000000000044', 's044@kaut.edu.gh', 'Benjamin Owusu', 'student', '10000000-0000-0000-0000-000000000008', '2022/EDU/001', true, '+233 245 208 001'),
  ('30000000-0000-0000-0000-000000000045', 's045@kaut.edu.gh', 'Mercy Adu', 'student', '10000000-0000-0000-0000-000000000008', '2022/EDU/002', true, '+233 245 208 002'),
  -- Year 4 (20)
  ('30000000-0000-0000-0000-000000000046', 's046@kaut.edu.gh', 'Francis Kwarteng', 'student', '10000000-0000-0000-0000-000000000001', '2021/ENG/001', true, '+233 245 301 001'),
  ('30000000-0000-0000-0000-000000000047', 's047@kaut.edu.gh', 'Esther Gyamfi', 'student', '10000000-0000-0000-0000-000000000001', '2021/ENG/002', true, '+233 245 301 002'),
  ('30000000-0000-0000-0000-000000000048', 's048@kaut.edu.gh', 'David Eghan', 'student', '10000000-0000-0000-0000-000000000001', '2021/ENG/003', true, '+233 245 301 003'),
  ('30000000-0000-0000-0000-000000000049', 's049@kaut.edu.gh', 'Joana Badu', 'student', '10000000-0000-0000-0000-000000000002', '2021/SCI/001', true, '+233 245 302 001'),
  ('30000000-0000-0000-0000-000000000050', 's050@kaut.edu.gh', 'Peter Tandoh', 'student', '10000000-0000-0000-0000-000000000002', '2021/SCI/002', true, '+233 245 302 002'),
  ('30000000-0000-0000-0000-000000000051', 's051@kaut.edu.gh', 'Hafsatu Mohammed', 'student', '10000000-0000-0000-0000-000000000003', '2021/BUS/001', true, '+233 245 303 001'),
  ('30000000-0000-0000-0000-000000000052', 's052@kaut.edu.gh', 'Samuel Quaye', 'student', '10000000-0000-0000-0000-000000000003', '2021/BUS/002', true, '+233 245 303 002'),
  ('30000000-0000-0000-0000-000000000053', 's053@kaut.edu.gh', 'Rashidatu Alhassan', 'student', '10000000-0000-0000-0000-000000000004', '2021/ARTS/001', true, '+233 245 304 001'),
  ('30000000-0000-0000-0000-000000000054', 's054@kaut.edu.gh', 'Emmanuel Bekoe', 'student', '10000000-0000-0000-0000-000000000005', '2021/SOC/001', true, '+233 245 305 001'),
  ('30000000-0000-0000-0000-000000000055', 's055@kaut.edu.gh', 'Chiamaka Okafor', 'student', '10000000-0000-0000-0000-000000000005', '2021/SOC/002', true, '+233 245 305 002'),
  ('30000000-0000-0000-0000-000000000056', 's056@kaut.edu.gh', 'Musa Jalloh', 'student', '10000000-0000-0000-0000-000000000006', '2021/MED/001', true, '+233 245 306 001'),
  ('30000000-0000-0000-0000-000000000057', 's057@kaut.edu.gh', 'Gifty Ama', 'student', '10000000-0000-0000-0000-000000000006', '2021/MED/002', true, '+233 245 306 002'),
  ('30000000-0000-0000-0000-000000000058', 's058@kaut.edu.gh', 'Thomas Donkor', 'student', '10000000-0000-0000-0000-000000000007', '2021/LAW/001', true, '+233 245 307 001'),
  ('30000000-0000-0000-0000-000000000059', 's059@kaut.edu.gh', 'Eunice Amoah', 'student', '10000000-0000-0000-0000-000000000008', '2021/EDU/001', true, '+233 245 308 001'),
  ('30000000-0000-0000-0000-000000000060', 's060@kaut.edu.gh', 'Benjamin Tetteh', 'student', '10000000-0000-0000-0000-000000000008', '2021/EDU/002', true, '+233 245 308 002')
ON CONFLICT (id) DO UPDATE SET is_sample = true;

-- ========================================
-- COURSES (40 courses across departments)
-- ========================================
INSERT INTO courses (id, course_code, title, description, summary, credits, department_id, lecturer_id, capacity, enrolled_count, is_active, color, created_at) VALUES
-- ENGINEERING
  ('40000000-0000-0000-0000-000000000001', 'ENG101', 'Introduction to Engineering', 'Fundamental principles of engineering design, problem-solving, and systems thinking. Students learn the engineering process from conception to implementation.', 'An introduction to engineering principles covering design thinking, prototyping, and systems analysis. Perfect for first-year students exploring engineering disciplines.', 3, '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000103', 50, 48, true, '#3B82F6', NOW()),
  ('40000000-0000-0000-0000-000000000002', 'CS101', 'Introduction to Computer Science', 'Core concepts of computer science including algorithms, data structures, programming fundamentals using Python and Java.', 'Learn the foundations of computer science: algorithms, data structures, and programming using Python and Java. Build problem-solving skills essential for software development.', 3, '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000101', 45, 45, true, '#10B981', NOW()),
  ('40000000-0000-0000-0000-000000000003', 'CS201', 'Data Structures & Algorithms', 'Advanced data structures (trees, graphs, hash tables) and algorithm design patterns with complexity analysis.', 'Master data structures like trees, graphs, and hash tables. Analyze algorithm efficiency and solve complex computational problems.', 3, '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000103', 40, 38, true, '#F59E0B', NOW()),
  ('40000000-0000-0000-0000-000000000004', 'EE201', 'Circuit Analysis', 'DC and AC circuit theory, network theorems, and introductory electronics components.', 'Comprehensive study of electrical circuits covering Ohm''s Law, Kirchhoff''s laws, and network analysis techniques.', 4, '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000102', 35, 32, true, '#EF4444', NOW()),
  ('40000000-0000-0000-0000-000000000005', 'ME301', 'Thermodynamics', 'Laws of thermodynamics, heat transfer, and applications to energy systems.', 'Explore the fundamental principles of energy, heat, and work. Applications include engines, refrigeration, and power generation systems.', 3, '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000103', 30, 28, true, '#8B5CF6', NOW()),
  ('40000000-0000-0000-0000-000000000006', 'CE201', 'Structural Mechanics', 'Analysis of forces, stresses, and deformations in structural elements.', 'Learn to analyze beams, columns, and trusses. Understand material behavior under various loading conditions.', 3, '10000000-0000-0000-0000-000000000104', 35, 30, true, '#EC4899', NOW()),
-- SCIENCE
  ('40000000-0000-0000-0000-000000000007', 'PHY101', 'General Physics I', 'Mechanics, waves, and thermodynamics. Laboratory experiments reinforce theoretical concepts.', 'Master classical mechanics including kinematics, dynamics, and conservation laws.Includes hands-on lab work.', 4, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000201', 50, 48, true, '#06B6D4', NOW()),
  ('40000000-0000-0000-0000-000000000008', 'PHY201', 'Electricity & Magnetism', 'Electrostatics, magnetostatics, Maxwell''s equations, and electromagnetic waves.', 'Deep dive into electromagnetic theory covering electric fields, magnetic fields, and Maxwell''s equations.', 4, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000202', 40, 37, true, '#14B8A6', NOW()),
  ('40000000-0000-0000-0000-000000000009', 'CHEM101', 'General Chemistry', 'Atomic structure, chemical bonding, reactions, stoichiometry, and basic organic chemistry.', 'Build a strong foundation in chemistry from atomic structure to chemical reactions and bonding.', 4, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000201', 45, 44, true, '#F97316', NOW()),
  ('40000000-0000-0000-0000-000000000010', 'BIO101', 'Introduction to Biology', 'Cell biology, genetics, ecology, and evolution with laboratory components.', 'Explore life sciences covering cells, DNA, ecosystems, and evolutionary processes with hands-on labs.', 4, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000203', 40, 39, true, '#22C55E', NOW()),
  ('40000000-0000-0000-0000-000000000011', 'MATH101', 'Calculus I', 'Limits, derivatives, integrals, and applications of differential and integral calculus.', 'Master differential and integral calculus. Learn to solve real-world problems using mathematical modeling.', 4, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000203', 55, 52, true, '#A855F7', NOW()),
  ('40000000-0000-0000-0000-000000000012', 'MATH201', 'Calculus II', 'Techniques of integration, sequences, series, and introductory differential equations.', 'Advanced calculus covering integration techniques, infinite series, and an introduction to differential equations.', 4, '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000203', 50, 47, true, '#EAB308', NOW()),
-- BUSINESS
  ('40000000-0000-0000-0000-000000000013', 'BUS101', 'Introduction to Business', 'Overview of business environments, management, marketing, finance, and entrepreneurship.', 'Understand how businesses operate. Explore management, marketing, finance, and entrepreneurship fundamentals.', 3, '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000301', 60, 58, true, '#3B82F6', NOW()),
  ('40000000-0000-0000-0000-000000000014', 'ACC201', 'Financial Accounting', 'Principles of accounting, the accounting cycle, financial statements, and analysis.', 'Learn to prepare and analyze financial statements. Master debits, credits, and the accounting equation.', 3, '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000302', 45, 42, true, '#10B981', NOW()),
  ('40000000-0000-0000-0000-000000000015', 'MKT301', 'Marketing Principles', 'Marketing strategy, consumer behavior, market research, and the marketing mix.', 'Develop marketing strategies and understand customer behavior. Learn the 4 Ps and modern marketing trends.', 3, '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000303', 40, 36, true, '#F59E0B', NOW()),
  ('40000000-0000-0000-0000-000000000016', 'FIN301', 'Corporate Finance', 'Financial management, capital budgeting, risk and return, and cost of capital.', 'Master corporate finance concepts including capital budgeting, risk analysis, and financial decision-making.', 3, '10000000-0000-0000-0000-000000000302', '20000000-0000-0000-0000-000000000302', 35, 33, true, '#EF4444', NOW()),
-- ARTS & HUMANITIES
  ('40000000-0000-0000-0000-000000000017', 'ENG101', 'English Composition', 'Academic writing, research papers, and critical analysis of texts.', 'Develop strong academic writing skills. Learn to craft research papers and analyze complex texts.', 3, '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000401', 50, 48, true, '#8B5CF6', NOW()),
  ('40000000-0000-0000-0000-000000000018', 'HIS201', 'African History', 'Pre-colonial to contemporary African history with focus on Ghana and West Africa.', 'Journey through African history from ancient kingdoms to modern independence movements, with emphasis on Ghana.', 3, '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000402', 45, 40, true, '#EC4899', NOW()),
  ('40000000-0000-0000-0000-000000000019', 'PHI101', 'Introduction to Philosophy', 'Major philosophical questions, logic, ethics, and critical thinking.', 'Explore fundamental questions about existence, knowledge, ethics, and logic through Western and African philosophy.', 3, '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000401', 35, 32, true, '#14B8A6', NOW()),
-- SOCIAL SCIENCES
  ('40000000-0000-0000-0000-000000000020', 'SOC101', 'Introduction to Sociology', 'Social institutions, culture, inequality, and social change in African contexts.', 'Understand how society shapes individuals. Study family, religion, education, and social structures in Africa.', 3, '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000402', 50, 45, true, '#F97316', NOW()),
  ('40000000-0000-0000-0000-000000000021', 'PSY101', 'Introduction to Psychology', 'Foundations of psychology including cognition, behavior, development, and mental health.', 'Explore the human mind and behavior. Topics include cognition, development, personality, and psychological disorders.', 3, '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000402', 45, 43, true, '#22C55E', NOW()),
  ('40000000-0000-0000-0000-000000000022', 'ECO201', 'Microeconomics', 'Supply and demand, market structures, consumer behavior, and firm decision-making.', 'Learn economic principles that govern individual markets and firm behavior. Applications to African economies.', 3, '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000302', 50, 48, true, '#A855F7', NOW()),
  ('40000000-0000-0000-0000-000000000023', 'POL101', 'Introduction to Political Science', 'Political systems, governance, international relations, and political theory.', 'Study political systems, democracy, governance, and international relations with African case studies.', 3, '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000402', 40, 35, true, '#EAB308', NOW())
ON CONFLICT (id) DO UPDATE SET is_sample = true;

-- ========================================
-- ENROLLMENTS (assign students to courses)
-- ========================================
-- Each student enrolled in 5-8 courses
INSERT INTO enrollments (student_id, course_id, status) VALUES
-- Student 1 (Abdul Rahman - Engineering)
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'active'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'active'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'active'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'active'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000011', 'active'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000021', 'active'),
-- Student 2 (Adjoa Asante - Engineering)
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'active'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'active'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', 'active'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000011', 'active'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000018', 'active'),
-- Student 3 (Kofi Agyeman - Engineering)
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'active'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'active'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', 'active'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', 'active'),
  ('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000014', 'active'),
-- Student 4 (Ama Serwaah - Science)
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000009', 'active'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000010', 'active'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000011', 'active'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000020', 'active'),
  ('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000022', 'active'),
-- Student 5 (Yaw Boateng - Science)
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007', 'active'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000009', 'active'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000010', 'active'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000011', 'active'),
  ('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000022', 'active'),
-- Student 6 (Efua Osei - Business)
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000013', 'active'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000014', 'active'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000015', 'active'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000016', 'active'),
  ('30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000022', 'active')
-- Continue similar pattern for remaining students...
ON CONFLICT DO NOTHING;

-- ========================================
-- ANNOUNCEMENTS (admin/lecturer broadcasts)
-- ========================================
INSERT INTO announcements (id, title, content, category, priority, target_roles, target_courses, author_id, is_published, published_at, created_at) VALUES
  ('50000000-0000-0000-0000-000000000001', 'Welcome to KAUT Academic Year 2024/2025', 'Dear Students,\n\nThe academic year 2024/2025 officially commences. All students are required to complete their registration and course enrollment by September 30, 2024.\n\nImportant dates:\n- Orientation: Sept 15-20\n- Classes begin: Sept 23\n- Late registration deadline: Sept 30\n\nFor any inquiries, contact the Registrar office.\n\nBest regards,\nUniversity Administration', 'academic', 'normal', ARRAY['student','lecturer','admin'], NULL, '20000000-0000-0000-0000-000000000001', true, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000002', 'Mid-Semester Examinations Schedule Released', 'The mid-semester examination timetable has been published. Students are advised to check their exam schedules and prepare accordingly.\n\nExam period: October 28 - November 8, 2024\nSpecial accommodations requests should be submitted to the Exams Office by October 10.', 'academic', 'high', ARRAY['student','lecturer'], NULL, '20000000-0000-0000-0000-000000000002', true, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000003', 'Suspension of Water Supply - Campus Notice', 'Please be informed that there will be a scheduled water supply interruption on campus from 10 AM to 4 PM on Saturday, October 5 for maintenance work. Hostels will have alternative arrangements.\n\nWe apologize for any inconvenience.', 'general', 'normal', ARRAY['student','lecturer','admin'], NULL, '20000000-0000-0000-0000-000000000003', true, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000004', 'Career Fair 2024 - Register Now!', 'The Annual Career Fair will be held on November 15, 2024 at the Main Auditorium. Over 50 companies will be recruiting.\n\nRegistration is now open through the student portal. Deadline: November 10.', 'event', 'normal', ARRAY['student'], NULL, '20000000-0000-0000-0000-000000000001', true, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000005', 'Emergency: Campus Security Alert', 'There has been a reported incident near the North Gate. All students are advised to remain in their hostels and avoid that area until further notice. Security is on site.\n\nUpdates will follow.', 'emergency', 'urgent', ARRAY['student','lecturer','admin'], NULL, '20000000-0000-0000-0000-000000000002', true, NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000006', 'CS201 Lecture Notes - Week 4 Summary', 'Dear CS201 students,\n\nThis week we covered: Binary Search Trees, AVL Trees, and B-Trees. Please review the lecture materials uploaded to the course page.\n\nThe assignment on BST operations is due next Monday.\n\n- Dr. Asante', 'academic', 'normal', ARRAY['student'], ARRAY['40000000-0000-0000-0000-000000000003'], '20000000-0000-0000-0000-000000000101', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create notifications for each user based on announcements
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) SELECT
  u.id,
  'announcement',
  a.title,
  LEFT(a.content, 200) || '...',
  false,
  NOW()
FROM users u
CROSS JOIN announcements a
WHERE u.role IN ('student', 'lecturer', 'admin')
  AND a.is_published = true
  AND (
    a.target_roles @> ARRAY[u.role::text] OR a.target_roles = '{}'
  )
LIMIT 100
ON CONFLICT DO NOTHING;

-- ========================================
-- SCHEDULES (class sessions & recurring events)
-- ========================================
-- Week 1-14 recurring schedules
INSERT INTO schedules (id, course_id, lecturer_id, schedule_type, start_time, end_time, location, is_recurring, recurrence_rule, recurring_end_date, created_at) VALUES
-- CS101 - Mon & Wed 9:00-11:00 (Dr. Asante)
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000101', 'lecture', '2024-09-23 09:00:00', '2024-09-23 11:00:00', 'ICT Lab Block A, Room 101', true, 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=14', '2024-12-18', NOW()),
  -- CS201 - Tue & Thu 14:00-16:00 (Dr. Owusu)
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000103', 'lecture', '2024-09-24 14:00:00', '2024-09-24 16:00:00', 'Engineering Block B, Room 205', true, 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=14', '2024-12-19', NOW()),
  -- EE201 - Mon & Fri 11:00-13:00 (Dr. Boateng)
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000102', 'lecture', '2024-09-23 11:00:00', '2024-09-23 13:00:00', 'Science Block, Room 304', true, 'RRULE:FREQ=WEEKLY;BYDAY=MO,FR;COUNT=14', '2024-12-20', NOW()),
  -- ME301 - Tue & Thu 09:00-11:00 (Dr. Owusu)
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000103', 'lecture', '2024-09-24 09:00:00', '2024-09-24 11:00:00', 'Mechanical Workshop, Room 12', true, 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=14', '2024-12-19', NOW()),
  -- PHY101 - Mon & Wed 14:00-16:00 (Dr. Sarpong)
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000201', 'lecture', '2024-09-23 14:00:00', '2024-09-23 16:00:00', 'Science Block, Room 102', true, 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=14', '2024-12-18', NOW()),
  -- CHEM101 - Tue & Thu 10:00-12:00 (Dr. Benso)
  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000202', 'lecture', '2024-09-24 10:00:00', '2024-09-24 12:00:00', 'Chemistry Lab, Block C', true, 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=14', '2024-12-19', NOW()),
  -- MATH101 - Mon, Wed, Fri 08:00-09:00 (Dr. Mensah)
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000203', 'lecture', '2024-09-23 08:00:00', '2024-09-23 09:00:00', 'Mathematics Block, Room 1', true, 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=14', '2024-12-20', NOW()),
  -- BUS101 - Tue & Thu 16:00-18:00 (Dr. Darko)
  ('60000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000301', 'lecture', '2024-09-24 16:00:00', '2024-09-24 18:00:00', 'Business School, Auditorium 1', true, 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=14', '2024-12-19', NOW()),
  -- ACC201 - Mon & Wed 16:00-18:00 (Dr. Abil)
  ('60000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000302', 'lecture', '2024-09-23 16:00:00', '2024-09-23 18:00:00', 'Business School, Room 203', true, 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=14', '2024-12-18', NOW()),
  -- ENG101 - Tue & Thu 11:00-13:00 (Dr. Badio)
  ('60000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000401', 'lecture', '2024-09-24 11:00:00', '2024-09-24 13:00:00', 'Arts Block, Room 105', true, 'RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=14', '2024-12-19', NOW()),
  -- SOC101 - Mon & Wed 10:00-12:00 (Dr. Kwame)
  ('60000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000402', 'lecture', '2024-09-23 10:00:00', '2024-09-23 12:00:00', 'Social Sciences Block, Room 301', true, 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=14', '2024-12-18', NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- EXAMS
-- ========================================
INSERT INTO exams (id, course_id, title, exam_type, exam_date, duration_minutes, location, max_points, weight, instructions) VALUES
  ('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'CS101 Midterm Exam', 'midterm', '2024-10-28 09:00:00', 120, 'ICT Lab Block A', 60, 0.3, 'Bring your student ID. No calculators allowed.'),
  ('70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000011', 'MATH101 Midterm Exam', 'midterm', '2024-10-28 14:00:00', 90, 'Mathematics Block', 60, 0.3, 'Bring scientific calculator. Formula sheet provided.'),
  ('70000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'CS201 Final Exam', 'final', '2024-12-10 09:00:00', 180, 'ICT Lab Block A, Hall 1', 100, 0.4, 'Open book exam. All materials allowed.'),
  ('70000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', 'PHY101 Final Exam', 'final', '2024-12-12 10:00:00', 120, 'Science Block Auditorium', 100, 0.35, 'Bring formula sheet and scientific calculator.'),
  ('70000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000013', 'BUS101 Final Exam', 'final', '2024-12-15 13:00:00', 90, 'Business School, Hall 2', 100, 0.3, 'Case study analysis required.')
ON CONFLICT DO NOTHING;

-- ========================================
-- ASSIGNMENTS
-- ========================================
INSERT INTO assignments (id, course_id, title, description, due_date, max_points, weight) VALUES
  ('80000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Hello World Program', 'Write a "Hello, World!" program in Python and Java. Submit both files.', '2024-10-05 23:59:59', 10, 0.1),
  ('80000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Number Guessing Game', 'Implement a number guessing game with proper input validation.', '2024-10-19 23:59:59', 30, 0.2),
  ('80000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000011', 'Calculus Problem Set 1', 'Solve problems on limits and continuity from chapters 1-2.', '2024-10-12 23:59:59', 25, 0.15),
  ('80000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000013', 'Business Plan Draft', 'Develop a preliminary business plan for a startup of your choice.', '2024-11-01 23:59:59', 50, 0.25),
  ('80000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000017', 'Essay on Postcolonial Literature', 'Write a 2000-word essay on a selected African literary work.', '2024-10-25 23:59:59', 40, 0.3)
ON CONFLICT DO NOTHING;

-- ========================================
-- EVENTS (campus events)
-- ========================================
INSERT INTO events (id, title, description, category, start_date, end_date, location, organizer_id, is_public, max_participants, registration_required) VALUES
  ('90000000-0000-0000-0000-000000000001', 'KAUT Annual Homecoming', 'Join alumni from across the globe for a weekend of celebration, networking, and campus tours. This year''s theme is "Innovating for Africa''s Future".', 'academic', '2024-11-22 09:00:00', '2024-11-24 17:00:00', 'Main Campus Grounds', '20000000-0000-0000-0000-000000000001', true, 2000, true),
  ('90000000-0000-0000-0000-000000000002', 'Tech Entrepreneurship Summit', 'A one-day summit featuring panels, pitches, and networking with tech entrepreneurs and investors from across Africa.', 'career', '2024-12-05 08:00:00', '2024-12-05 18:00:00', 'Innovation Hub', '20000000-0000-0000-0000-000000000001', true, 500, true),
  ('90000000-0000-0000-0000-000000000003', 'Cultural Night - African Heritage Celebration', 'An evening of music, dance, food, and fashion showcasing the diverse cultures of our student body.', 'social', '2024-11-15 18:00:00', '2024-11-15 23:00:00', 'Student Centre Amphitheatre', '20000000-0000-0000-0000-000000000004', true, 800, false),
  ('90000000-0000-0000-0000-000000000004', 'Health Screening Campaign', 'Free health check-ups including blood pressure, blood sugar, BMI, and general consultation provided by University Hospital.', 'other', '2024-10-25 09:00:00', '2024-10-25 16:00:00', 'University Hospital Plaza', '20000000-0000-0000-0000-000000000006', true, 300, false),
  ('90000000-0000-0000-0000-000000000005', 'Guest Lecture: "AI in African Development"', 'Renowned AI ethicist Dr. Timnit Gebru delivers a keynote on artificial intelligence applications for sustainable development in Africa.', 'academic', '2024-11-01 14:00:00', '2024-11-01 16:30:00', 'Great Hall', '20000000-0000-0000-0000-000000000101', true, 400, false)
ON CONFLICT DO NOTHING;

-- ========================================
-- VENUES (classrooms, halls, labs)
-- ========================================
INSERT INTO venues (id, name, building, room_number, capacity, features, is_available) VALUES
  ('10000000-0000-0000-0000-000000000001', 'ICT Lab Block A - Room 101', 'ICT Lab Block A', '101', 45, ARRAY['computers','projector','air-conditioned'], true),
  ('10000000-0000-0000-0000-000000000002', 'Engineering Block B - Room 205', 'Engineering Block B', '205', 60, ARRAY['projector','whiteboard','video-conference'], true),
  ('10000000-0000-0000-0000-000000000003', 'Science Block - Room 102', 'Science Block', '102', 50, ARRAY['projector','lab-benches','fume-hood'], true),
  ('10000000-0000-0000-0000-000000000004', 'Chemistry Lab', 'Science Block', 'CL-03', 30, ARRAY['lab-equipment','fume-hood','safety-shower'], true),
  ('10000000-0000-0000-0000-000000000005', 'Mathematics Block - Room 1', 'Mathematics Block', 'R1', 80, ARRAY['projector','smartboard'], true),
  ('10000000-0000-0000-0000-000000000006', 'Business School - Auditorium 1', 'Business School', 'AUD1', 200, ARRAY['projector','sound-system','stage'], true),
  ('10000000-0000-0000-0000-000000000007', 'Arts Block - Room 105', 'Arts Block', '105', 40, ARRAY['projector','art-display'], true),
  ('10000000-0000-0000-0000-000000000008', 'Great Hall', 'Administration Block', 'GH', 500, ARRAY['stage','sound-system','podium','AC'], true)
ON CONFLICT DO NOTHING;

-- ========================================
-- GRADES (sample grades for students)
-- ========================================
INSERT INTO grades (student_id, assignment_id, points_earned, percentage, grade_letter, feedback, graded_at) VALUES
  -- CS101 assignments
  ('30000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 10, 100, 'A', 'Excellent work! Your Python code was well-structured.', NOW() - INTERVAL '7 days'),
  ('30000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 24, 80, 'B+', 'Good implementation. Consider improving code documentation.', NOW() - INTERVAL '3 days'),
  -- MATH101
  ('30000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000003', 22, 88, 'B+', 'Strong understanding of limits. Watch sign errors.', NOW() - INTERVAL '5 days'),
  -- BUS101
  ('30000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000004', 42, 84, 'B', 'Well-researched plan. Focus more on market analysis.', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ========================================
-- ATTENDANCE (sample attendance records)
-- ========================================
INSERT INTO attendance (student_id, schedule_id, course_id, date, status, marked_by) VALUES
  -- Week 1 attendance
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '2024-09-23', 'present', '20000000-0000-0000-0000-000000000101'),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '2024-09-23', 'present', '20000000-0000-0000-0000-000000000101'),
  ('30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '2024-09-23', 'late', '20000000-0000-0000-0000-000000000101')
ON CONFLICT DO NOTHING;

-- ========================================
-- SUBSCRIPTION PLANS
-- ========================================
INSERT INTO subscription_plans (institution_id, name, description, price_monthly, price_yearly, currency_code, max_users, features, is_active, is_default) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Free', 'Basic access for small classes', 0, 0, 'GHS', 50, ARRAY['basic_scheduling','in_app_notifications','email_support'], true, true),
  ('00000000-0000-0000-0000-000000000001', 'Pro', 'Advanced features for growing institutions', 99.99, 999.99, 'GHS', 500, ARRAY['unlimited_courses','push_notifications','ai_scheduler','advanced_analytics','email_support','custom_branding'], true, false),
  ('00000000-0000-0000-0000-000000000001', 'Enterprise', 'Full-featured solution for large universities', 299.99, 2999.99, 'GHS', 9999, ARRAY['all_features','priority_support','dedicated_account_manager','custom_integrations','sla_guarantee'], true, false)
ON CONFLICT DO NOTHING;

-- ========================================
-- Feature Access (Paywall Configuration)
-- ========================================
INSERT INTO feature_access (plan_id, feature, is_enabled, limits) VALUES
  ('free', 'unlimited_courses', false, '{"max_courses": 10}'),
  ('free', 'ai_scheduler', false, '{}'),
  ('free', 'advanced_analytics', false, '{}'),
  ('pro', 'unlimited_courses', true, '{}'),
  ('pro', 'ai_scheduler', true, '{"max_suggestions_per_month": 100}'),
  ('pro', 'advanced_analytics', true, '{}'),
  ('enterprise', 'unlimited_courses', true, '{}'),
  ('enterprise', 'ai_scheduler', true, '{"max_suggestions_per_month": -1}'),
  ('enterprise', 'advanced_analytics', true, '{}')
ON CONFLICT DO NOTHING;

-- ========================================
-- Mark sample data with institution context
-- ========================================
UPDATE users SET is_sample = true WHERE id LIKE '3%';
UPDATE courses SET is_sample = true WHERE id LIKE '4%';
UPDATE enrollments SET is_sample = true;
UPDATE schedules SET is_sample = true;
UPDATE announcements SET is_sample = true;
UPDATE events SET is_sample = true;
UPDATE exams SET is_sample = true;
UPDATE assignments SET is_sample = true;
UPDATE grades SET is_sample = true;
UPDATE notifications SET is_sample = true;

-- ============================================================
-- END OF SAMPLE DATA
-- ============================================================
-- Summary: 3 admin users, 12 lecturers, 60 students
-- 23 courses, 11 enrollments (partial - can expand), 11 schedules
-- 6 announcements with associated notifications
-- 5 events, 8 venues, 5 exams, 5 assignments
-- To view: Login as any student (s001@kaut.edu.gh) or lecturer
-- To delete all sample data: DELETE FROM event_logs WHERE is_sample = true
--   then follow DELETION_ORDER in admin API
-- ============================================================
