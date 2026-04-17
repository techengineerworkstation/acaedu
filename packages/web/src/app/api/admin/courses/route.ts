import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

/**
 * GET /api/admin/courses
 * List courses with optional filtering (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const department_id = searchParams.get('department_id');
    const lecturer_id = searchParams.get('lecturer_id');
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();
    let query = supabase
      .from('courses')
      .select('*, department:departments (id, name, code), lecturer:users!courses_lecturer_id_fkey (id, full_name, email)')
      .order('course_code', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (department_id) {
      query = query.eq('department_id', department_id);
    }
    if (lecturer_id) {
      query = query.eq('lecturer_id', lecturer_id);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,course_code.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        total: count
      }
    });
  } catch (error) {
    console.error('Admin courses fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/courses/[id]
 * Update a course (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      course_code,
      title,
      description,
      summary,
      credits,
      department_id,
      lecturer_id,
      capacity,
      is_active,
      syllabus_url
    } = body;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('courses')
      .update({
        course_code,
        title,
        description,
        summary,
        credits: credits || 3,
        department_id,
        lecturer_id,
        capacity: capacity || 30,
        is_active: is_active !== undefined ? is_active : true,
        syllabus_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Course code already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin course update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/courses/[id]
 * Delete a course (admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First delete related data due to foreign key constraints
    const { error: materialsError } = await supabase
      .from('course_materials')
      .delete()
      .eq('course_id', id);

    if (materialsError) {
      console.warn('Failed to delete course materials for course:', materialsError);
    }

    const { error: schedulesError } = await supabase
      .from('schedules')
      .delete()
      .eq('course_id', id);

    if (schedulesError) {
      console.warn('Failed to delete schedules for course:', schedulesError);
    }

    const { error: enrollmentsError } = await supabase
      .from('enrollments')
      .delete()
      .eq('course_id', id);

    if (enrollmentsError) {
      console.warn('Failed to delete enrollments for course:', enrollmentsError);
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin course delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}