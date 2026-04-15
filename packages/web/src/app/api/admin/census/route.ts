import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'dean']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const faculty = searchParams.get('faculty');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createClient();

    // Get census summary
    const { data: summary } = await (supabase.rpc as any)('get_population_census', {
  p_role: role || null
}); 

    // Get detailed user list
    const offset = (page - 1) * limit;
    let query = (supabase as any).from('users')
      .select(`
        id, full_name, email, role, gender, matriculation_number,
        student_id, employee_id, phone, is_active, level,
        created_at, last_login, avatar_url,
        department_info:departments (id, name, code),
        faculty_info:faculties (id, name, code)
      `, { count: 'exact' })
      .order('full_name', { ascending: true });

    if (role) query = query.eq('role', role);
    if (department) query = query.eq('department', department);
    if (faculty) query = query.eq('faculty_id', faculty);

    const { data: users, count } = await query.range(offset, offset + limit - 1);

    // Get totals by role
    // Replace lines 44-46 with this:
    const [studentCount, lecturerCount, adminCount] = await Promise.all([
  (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true),
  (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'lecturer').eq('is_active', true),
  (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin').eq('is_active', true)
]);


    return NextResponse.json({
      success: true,
      data: {
        summary: summary || [],
        users: users || [],
        totals: {
          students: studentCount.count || 0,
          lecturers: lecturerCount.count || 0,
          admins: adminCount.count || 0,
          total: (studentCount.count || 0) + (lecturerCount.count || 0) + (adminCount.count || 0)
        },
        pagination: { page, limit, total: count, total_pages: count ? Math.ceil(count / limit) : 0 }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch census data' }, { status: 500 });
  }
}
