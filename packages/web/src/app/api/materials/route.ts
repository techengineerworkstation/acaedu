import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const materialType = searchParams.get('type');

    const supabase = await createClient();
    let query = supabase
      .from('course_materials')
      .select(`*, course:courses (id, course_code, title)`)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (courseId) query = query.eq('course_id', courseId);
    if (materialType) query = query.eq('material_type', materialType);

    if (authResult.user.role === 'student') {
      const { data: enrollments } = await supabase
        .from('enrollments').select('course_id')
        .eq('student_id', authResult.user.id).eq('status', 'active');
      const ids = enrollments?.map((e: any) => e.course_id) || [];
      if (ids.length === 0) return NextResponse.json({ success: true, data: [] });
      query = query.in('course_id', ids);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { course_id, title, description, file_url, file_type, file_size, material_type, week_number } = body;

    if (!course_id || !title || !file_url) {
      return NextResponse.json({ success: false, error: 'course_id, title, file_url required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_materials')
      .insert({
        course_id, title, description, file_url, file_type, file_size,
        material_type: material_type || 'document', week_number,
        uploaded_by: authResult.user.id, is_published: true
      })
      .select().single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upload material' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('course_materials').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete material' }, { status: 500 });
  }
}
