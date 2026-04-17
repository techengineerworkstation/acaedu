import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth';

/**
 * GET /api/courses
 * List courses based on user role
 */
export async function GET(req: NextRequest) {
  try {
    // Use admin client to bypass RLS and get all courses
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const isActive = searchParams.get('is_active');
    const lecturerId = searchParams.get('lecturer_id');

    let query = supabase
      .from('courses')
      .select('*')
      .order('code', { ascending: true });

    // Apply filters
    // Apply filters
    if (department) {
      query = query.eq('department_id', department);
    }
    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true');
    }
    if (lecturerId) {
      query = query.eq('lecturer_id', lecturerId);
    }

    // Sort by course code
    query = query.order('code', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create a new course (admin/lecturer only)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) {
      return authResult;
    }

    const body = await req.json();
    const { code, title, description, credits, department_id, capacity, is_active, semester, academic_year, syllabus_url } = body;

    if (!code || !title) {
      return NextResponse.json(
        { success: false, error: 'code and title required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // If lecturer, set themselves as lecturer unless admin sets explicit
    const lecturer_id = authResult.user.role === 'lecturer'
      ? authResult.user.id
      : body.lecturer_id;

    const { data, error } = await supabase
      .from('courses')
      .insert({
        code,
        title,
        description,
        credits: credits || 3,
        department_id,
        lecturer_id,
        capacity: capacity || 30,
        is_active: is_active !== undefined ? is_active : true,
        semester,
        academic_year,
        syllabus_url
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Course code already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}