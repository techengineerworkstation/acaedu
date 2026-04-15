import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

let GET = async (req: NextRequest) => {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const user = authResult.user;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const scheduleType = searchParams.get('type');

    const supabase = await createClient();
    let query = supabase
      .from('schedules')
      .select(`
        *,
        course:courses (*),
        lecturer:users!schedules_lecturer_id_fkey (*)
      `)
      .order('start_time', { ascending: true });

    if (user.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)
        .eq('status', 'active');
      const courseIds = enrollments?.map((e: { course_id: string }) => e.course_id) || [];
      if (courseIds.length === 0) return NextResponse.json({ success: true, data: [] });
      query = query.in('course_id', courseIds);
    } else if (user.role === 'lecturer') {
      query = query.or(`lecturer_id.eq.${user.id},course_id.in.(SELECT course_id FROM enrollments WHERE student_id = '${user.id}')`);
    }

    if (courseId) query = query.eq('course_id', courseId);
    if (startDate) query = query.gte('start_time', new Date(startDate).toISOString());
    if (endDate) query = query.lte('end_time', new Date(endDate).toISOString());
    if (scheduleType) query = query.eq('schedule_type', scheduleType);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Schedules fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch schedules' }, { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;
    const user = authResult.user;
    const allowedRoles = ['admin', 'lecturer'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { course_id, title, description, schedule_type, start_time, end_time, location, is_recurring, recurrence_rule, recurring_end_date } = body;

    if (!course_id || !title || !start_time || !end_time || !schedule_type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);
    if (end <= start) {
      return NextResponse.json({ success: false, error: 'End time must be after start time' }, { status: 400 });
    }

    const supabase = await createClient();

    if (user.role === 'lecturer') {
      const { data: course } = await supabase.from('courses').select('lecturer_id').eq('id', course_id).single();
      if (!course || course.lecturer_id !== user.id) {
        return NextResponse.json({ success: false, error: 'Not authorized to create schedule for this course' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        course_id,
        lecturer_id: body.lecturer_id || user.id,
        title,
        description,
        schedule_type,
        start_time,
        end_time,
        location,
        is_recurring: is_recurring || false,
        recurrence_rule,
        recurring_end_date,
        attachments: body.attachments || [],
        venue_id: null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    if (is_recurring) {
      try { await (supabase as any).rpc('generate_schedule_instances', { schedule_id: data.id }); } catch (err) { console.error('Failed to generate instances:', err); }
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Schedule create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create schedule' }, { status: 500 });
  }
};

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;
    const user = authResult.user;
    if (!['admin', 'lecturer'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Schedule ID required' }, { status: 400 });

    const body = await req.json();
    const { course_id, title, description, schedule_type, start_time, end_time, location, is_recurring, recurrence_rule, recurring_end_date } = body;

    const supabase = await createClient();

    if (user.role === 'lecturer') {
      const { data: schedule } = await supabase.from('schedules').select('course_id').eq('id', id).single();
      if (schedule) {
        const { data: course } = await supabase.from('courses').select('lecturer_id').eq('id', schedule.course_id).single();
        if (!course || course.lecturer_id !== user.id) {
          return NextResponse.json({ success: false, error: 'Not authorized to update this schedule' }, { status: 403 });
        }
      }
    }

    const { data, error } = await supabase
      .from('schedules')
      .update({
        course_id,
        title,
        description,
        schedule_type,
        start_time,
        end_time,
        location,
        is_recurring: is_recurring || false,
        recurrence_rule,
        recurring_end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;
    const user = authResult.user;
    if (user.role !== 'admin' && user.role !== 'lecturer') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Schedule ID required' }, { status: 400 });

    const supabase = await createClient();

    if (user.role === 'lecturer') {
      const { data: schedule } = await supabase.from('schedules').select('course_id').eq('id', id).single();
      if (schedule) {
        const { data: course } = await supabase.from('courses').select('lecturer_id').eq('id', schedule.course_id).single();
        if (!course || course.lecturer_id !== user.id) {
          return NextResponse.json({ success: false, error: 'Not authorized to delete this schedule' }, { status: 403 });
        }
      }
    }

    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete schedule' }, { status: 500 });
  }
}
