import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

/**
 * GET /api/courses/[id]/materials
 * List materials for a course
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        uploaded_by:users (id, full_name)
      `)
      .eq('course_id', req.nextUrl.pathname.split('/')[3])
      .order('week_number', { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Materials fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch materials' }, { status: 500 });
  }
}

/**
 * POST /api/courses/[id]/materials
 * Upload material for a course (lecturer/admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('id');
    if (!courseId) return NextResponse.json({ success: false, error: 'Course ID required' }, { status: 400 });

    const body = await req.json();
    const { title, description, file_url, file_type, file_size, material_type, week_number, is_published } = body;

    if (!title || !file_url || !material_type) {
      return NextResponse.json({ success: false, error: 'title, file_url, and material_type required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_materials')
      .insert({
        course_id: courseId,
        title,
        description,
        file_url,
        file_type,
        file_size,
        material_type,
        week_number,
        is_published: is_published ?? true,
        uploaded_by: authResult.user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Material create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload material' }, { status: 500 });
  }
}

/**
 * PUT /api/courses/[id]/materials/[materialId]
 * Update material
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Material ID required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Material update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update material' }, { status: 500 });
  }
}

/**
 * DELETE /api/courses/[id]/materials/[materialId]
 * Delete material
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get('materialId');
    if (!materialId) return NextResponse.json({ success: false, error: 'Material ID required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('course_materials').delete().eq('id', materialId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Material delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete material' }, { status: 500 });
  }
}