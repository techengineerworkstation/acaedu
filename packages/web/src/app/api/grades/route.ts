import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { sendExamResultEmail } from '@/lib/email/send';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const studentId = searchParams.get('student_id');

    const supabase = await createClient();
    let query = supabase
      .from('grades')
      .select(`
        *,
        assignment:assignments (id, title, course_id, total_points, course:courses (id, course_code, title)),
        exam:exams (id, title, course_id, total_marks, course:courses (id, course_code, title))
      `)
      .order('graded_at', { ascending: false });

    if (authResult.user.role === 'student') {
      query = query.eq('student_id', authResult.user.id);
    }

    if (studentId && authResult.user.role !== 'student') {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Filter by courseId if specified
    let filtered = data;
    if (courseId && data) {
      filtered = data.filter((g: any) =>
        g.assignment?.course_id === courseId || g.exam?.course_id === courseId
      );
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch grades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { student_id, assignment_id, exam_id, points_earned, percentage, grade_letter, feedback, attachment_urls } = body;

    if (!student_id || (!assignment_id && !exam_id)) {
      return NextResponse.json({ success: false, error: 'student_id and either assignment_id or exam_id required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('grades')
      .insert({
        student_id, assignment_id, exam_id, points_earned, percentage, grade_letter,
        feedback, attachment_urls: attachment_urls || [],
        graded_at: new Date().toISOString()
      })
      .select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Grade already exists for this student' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Notify student
    const examOrAssignment = exam_id ? 'exam' : 'assignment';
    await supabase.from('notifications').insert({
      user_id: student_id, type: 'grade_posted',
      title: 'Grade Posted',
      message: `Your ${examOrAssignment} grade has been posted: ${grade_letter || points_earned}`,
      data: { grade_id: data.id, assignment_id, exam_id }
    });

    // Send email notification
    const { data: student } = await supabase.from('users').select('email, full_name').eq('id', student_id).single();
    if (student) {
      const examTitle = exam_id
        ? (await supabase.from('exams').select('title, course:courses(title)').eq('id', exam_id).single()).data
        : (await supabase.from('assignments').select('title, course:courses(title)').eq('id', assignment_id).single()).data;

      sendExamResultEmail(student.email, student.full_name, {
        title: examTitle?.title || 'Assessment',
        course: (examTitle as any)?.course?.title || '',
        score: points_earned || 0,
        totalMarks: percentage ? 100 : (points_earned || 0),
        grade: grade_letter || 'N/A',
        feedback
      });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit grade' }, { status: 500 });
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
    const { data, error } = await supabase.from('grades').update({ ...updates, graded_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update grade' }, { status: 500 });
  }
}
