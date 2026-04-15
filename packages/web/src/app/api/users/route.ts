import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';

/**
 * GET /api/users
 * List users with filters (admin/dean only, lecturers can see their students)
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const isActive = searchParams.get('is_active');

    // Only admin/dean can list all users
    if (!['admin', 'dean'].includes(authResult.user.role)) {
      // Lecturers can see their enrolled students
      if (authResult.user.role === 'lecturer') {
        const courseId = searchParams.get('course_id');
        if (!courseId) {
          return NextResponse.json({ success: false, error: 'course_id required for lecturers' }, { status: 400 });
        }
        const supabase = await createClient();
        const { data } = await supabase
          .from('enrollments')
          .select(`student:users!enrollments_student_id_fkey (*)`)
          .eq('course_id', courseId)
          .eq('status', 'active');
        return NextResponse.json({ success: true, data: data?.map((e: any) => e.student) || [] });
      }
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(`
        *,
        department_info:departments (id, name, code),
        faculty_info:faculties (id, name, code)
      `, { count: 'exact' })
      .order('full_name', { ascending: true });

    if (role) query = query.eq('role', role);
    if (department) query = query.eq('department', department);
    if (isActive !== null && isActive !== undefined) query = query.eq('is_active', isActive === 'true');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,matriculation_number.ilike.%${search}%,student_id.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true, data,
      pagination: { page, limit, total: count, total_pages: count ? Math.ceil(count / limit) : 0 }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Only admin can create users
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const {
      email,
      password,
      full_name,
      role,
      department_id,
      student_id,
      employee_id,
      avatar_url,
      email_verified = false
    } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: 'email, password, full_name, and role are required' },
        { status: 400 }
      );
    }

    // Valid roles
    const validRoles = ['student', 'lecturer', 'admin', 'dean'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Create auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: email_verified,
      user_metadata: {
        full_name,
        role
      }
    });

    if (authError) {
      console.error('User creation auth error:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    const userId = authUser.user.id;

    // 2. Create custom user record
    const { error: insertError } = await admin
      .from('users')
      .insert({
        id: userId,
        email,
        full_name,
        role,
        department: department_id || null,
        student_id: student_id || null,
        employee_id: employee_id || null,
        avatar_url: avatar_url || null,
        email_verified: email_verified
      });

    if (insertError) {
      console.error('User creation custom table error:', insertError);
      // Cleanup: delete auth user if custom insert fails
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // Fetch the created user (with department info)
    const { data: newUser } = await admin
      .from('users')
      .select(`
        *,
        department_info:departments (id, name, code),
        faculty_info:faculties (id, name, code)
      `)
      .eq('id', userId)
      .single();

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { id, ...updates } = body;
    const targetId = id || authResult.user.id;

    // Users can update themselves, admins can update anyone
    if (targetId !== authResult.user.id && authResult.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    // Prevent role escalation by non-admins
    if (updates.role && authResult.user.role !== 'admin') {
      delete updates.role;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', targetId)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const supabase = await createClient();
    // Soft delete - set is_active to false
    const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to deactivate user' }, { status: 500 });
  }
}
