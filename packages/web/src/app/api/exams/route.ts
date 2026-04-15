import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const upcoming = searchParams.get('upcoming') === 'true';
    const examType = searchParams.get('exam_type');

    const supabase = await createClient();
    let query = supabase
      .from('exams')
      .select(`*, course:courses (id, course_code, title, lecturer_id)`)
      .order('exam_date', { ascending: true });

    if (authResult.user.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', authResult.user.id)
        .eq('status', 'active');
      const courseIds = enrollments?.map((e: any) => e.course_id) || [];
      if (courseIds.length === 0) return NextResponse.json({ success: true, data: [] });
      query = query.in('course_id', courseIds);
    } else if (authResult.user.role === 'lecturer') {
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('lecturer_id', authResult.user.id);
      const courseIds = courses?.map((c: any) => c.id) || [];
      if (courseIds.length === 0) return NextResponse.json({ success: true, data: [] });
      query = query.in('course_id', courseIds);
    }

    if (courseId) query = query.eq('course_id', courseId);
    if (upcoming) query = query.gte('exam_date', new Date().toISOString());
    if (examType) query = query.eq('exam_type', examType);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { course_id, title, exam_type, exam_date, duration_minutes, location, total_marks, passing_marks, instructions, attachments } = body;

    if (!course_id || !title || !exam_date || !duration_minutes) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    if (authResult.user.role === 'lecturer') {
      const { data: course } = await supabase.from('courses').select('lecturer_id').eq('id', course_id).single();
      if (!course || course.lecturer_id !== authResult.user.id) {
        return NextResponse.json({ success: false, error: 'Not authorized for this course' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('exams')
      .insert({
        course_id, title, exam_type: exam_type || 'final',
        exam_date, duration_minutes, location,
        total_marks: total_marks || 100, passing_marks: passing_marks || 50,
        instructions, attachments: attachments || []
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Notify enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('course_id', course_id)
      .eq('status', 'active');

    if (enrollments) {
      const notifications = enrollments.map((e: any) => ({
        user_id: e.student_id,
        type: 'exam_reminder' as const,
        title: `New Exam: ${title}`,
        message: `Exam scheduled for ${new Date(exam_date).toLocaleDateString()}`,
        data: { exam_id: data.id, course_id }
      }));
      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create exam' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase.from('exams').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update exam' }, { status: 500 });
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
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete exam' }, { status: 500 });
  }
}
