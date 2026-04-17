import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');

    const supabase = await createClient();
    let query = supabase
      .from('enrollments')
      .select('*, course:courses (id, code, title, department:departments (id, name, code), lecturer:users!courses_lecturer_id_fkey (id, full_name, email)), student:users!enrollments_student_id_fkey (id, full_name, email)')
      .order('enrolled_at', { ascending: false });

    if (authResult.user.role === 'student') {
      query = query.eq('student_id', authResult.user.id);
    } else if (authResult.user.role === 'lecturer') {
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
    }

    if (courseId) query = query.eq('course_id', courseId);
    if (studentId) query = query.eq('student_id', studentId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { course_id } = body;

    if (!course_id) {
      return NextResponse.json({ success: false, error: 'course_id required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check course capacity
    const { data: course } = await supabase
      .from('courses')
      .select('capacity, enrolled_count')
      .eq('id', course_id)
      .single();

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    if (course.enrolled_count >= course.capacity) {
      return NextResponse.json({ success: false, error: 'Course is full' }, { status: 400 });
    }

    // Enroll student
    const studentId = authResult.user.role === 'admin' ? (body.student_id || authResult.user.id) : authResult.user.id;

    const { data, error } = await supabase
      .from('enrollments')
      .insert({ student_id: studentId, course_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Already enrolled' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update enrolled count
    await supabase
      .from('courses')
      .update({ enrolled_count: course.enrolled_count + 1 })
      .eq('id', course_id);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create enrollment' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { enrollment_id, status } = body;

    if (!enrollment_id || !status) {
      return NextResponse.json({ success: false, error: 'enrollment_id and status required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', enrollment_id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // If dropped, decrement enrolled count
    if (status === 'dropped' && data) {
      const { data: course } = await supabase
        .from('courses')
        .select('enrolled_count')
        .eq('id', data.course_id)
        .single();

      if (course) {
        await supabase
          .from('courses')
          .update({ enrolled_count: Math.max(0, course.enrolled_count - 1) })
          .eq('id', data.course_id);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update enrollment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get('id');

    if (!enrollmentId) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('id', enrollmentId)
      .single();

    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    if (enrollment) {
      const { data: course } = await supabase
        .from('courses')
        .select('enrolled_count')
        .eq('id', enrollment.course_id)
        .single();
      if (course) {
        await supabase
          .from('courses')
          .update({ enrolled_count: Math.max(0, course.enrolled_count - 1) })
          .eq('id', enrollment.course_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete enrollment' }, { status: 500 });
  }
}
