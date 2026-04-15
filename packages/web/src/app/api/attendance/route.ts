import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const scheduleId = searchParams.get('schedule_id');
    const studentId = searchParams.get('student_id');
    const date = searchParams.get('date');

    const supabase = await createClient();
    let query = supabase
      .from('attendance')
      .select(`
        *,
        student:users!attendance_student_id_fkey (id, full_name, email, avatar_url, matriculation_number),
        schedule:schedules (id, title, start_time, end_time)
      `)
      .order('created_at', { ascending: false });

    if (authResult.user.role === 'student') {
      query = query.eq('student_id', authResult.user.id);
    }

    if (courseId) query = query.eq('course_id', courseId);
    if (scheduleId) query = query.eq('schedule_id', scheduleId);
    if (studentId) query = query.eq('student_id', studentId);
    if (date) query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();

    // Students can check in themselves, lecturers can record for students
    if (authResult.user.role === 'student') {
      const { schedule_id, schedule_instance_id, course_id } = body;
      if (!schedule_id || !course_id) {
        return NextResponse.json({ success: false, error: 'schedule_id and course_id required' }, { status: 400 });
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          schedule_id,
          schedule_instance_id,
          student_id: authResult.user.id,
          course_id,
          status: 'present',
          check_in_time: new Date().toISOString(),
          recorded_by: authResult.user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ success: false, error: 'Already checked in' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    }

    // Lecturer/admin: batch record attendance
    const { records } = body;
    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'records array required' }, { status: 400 });
    }

    const supabase = await createClient();
    const inserts = records.map((r: any) => ({
      schedule_id: r.schedule_id,
      schedule_instance_id: r.schedule_instance_id,
      student_id: r.student_id,
      course_id: r.course_id,
      status: r.status || 'present',
      check_in_time: r.status === 'present' || r.status === 'late' ? new Date().toISOString() : null,
      notes: r.notes,
      recorded_by: authResult.user.id
    }));

    const { data, error } = await supabase
      .from('attendance')
      .upsert(inserts, { onConflict: 'schedule_instance_id,student_id' })
      .select();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data, count: data?.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record attendance' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer', 'dean']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('attendance')
      .update({ status, notes })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update attendance' }, { status: 500 });
  }
}
