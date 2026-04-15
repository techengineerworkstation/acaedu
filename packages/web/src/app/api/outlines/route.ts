import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    if (!courseId) return NextResponse.json({ success: false, error: 'course_id required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_outlines')
      .select('*')
      .eq('course_id', courseId)
      .order('week_number', { ascending: true });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch outlines' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { course_id, week_number, title, description, learning_objectives, topics, readings } = body;

    if (!course_id || !week_number || !title) {
      return NextResponse.json({ success: false, error: 'course_id, week_number, title required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_outlines')
      .upsert({
        course_id, week_number, title, description,
        learning_objectives: learning_objectives || [],
        topics: topics || [], readings
      }, { onConflict: 'course_id,week_number' })
      .select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save outline' }, { status: 500 });
  }
}
