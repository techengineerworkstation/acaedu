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

    const supabase = await createClient();
    let query = supabase
      .from('assignments')
      .select(`*, course:courses (id, course_code, title)`)
      .order('due_date', { ascending: true });

    if (authResult.user.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments').select('course_id')
        .eq('student_id', authResult.user.id).eq('status', 'active');
      const ids = enrollments?.map((e: any) => e.course_id) || [];
      if (ids.length === 0) return NextResponse.json({ success: true, data: [] });
      query = query.in('course_id', ids);
    } else if (authResult.user.role === 'lecturer') {
      const { data: courses } = await supabase
        .from('courses').select('id').eq('lecturer_id', authResult.user.id);
      const ids = courses?.map((c: any) => c.id) || [];
      if (ids.length === 0) return NextResponse.json({ success: true, data: [] });
      query = query.in('course_id', ids);
    }

    if (courseId) query = query.eq('course_id', courseId);
    if (upcoming) query = query.gte('due_date', new Date().toISOString());

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { course_id, title, description, due_date, total_points, attachment_urls } = body;
    if (!course_id || !title || !due_date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assignments')
      .insert({ course_id, title, description, due_date, total_points: total_points || 100, attachment_urls: attachment_urls || [] })
      .select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Notify enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments').select('student_id').eq('course_id', course_id).eq('status', 'active');
    if (enrollments) {
      const notifications = enrollments.map((e: any) => ({
        user_id: e.student_id, type: 'assignment_due' as const,
        title: `New Assignment: ${title}`,
        message: `Due: ${new Date(due_date).toLocaleDateString()}`,
        data: { assignment_id: data.id, course_id }
      }));
      await supabase.from('notifications').insert(notifications);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create assignment' }, { status: 500 });
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
    const { data, error } = await supabase.from('assignments').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update assignment' }, { status: 500 });
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
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete assignment' }, { status: 500 });
  }
}
