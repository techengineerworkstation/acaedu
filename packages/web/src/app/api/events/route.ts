import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey (id, full_name, avatar_url)
      `, { count: 'exact' })
      .order('start_date', { ascending: true });

    if (upcoming) {
      query = query.gte('start_date', new Date().toISOString());
    }
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true, data,
      pagination: { page, limit, total: count, total_pages: count ? Math.ceil(count / limit) : 0 }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer', 'dean']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { title, description, category, start_date, end_date, location, is_public, max_participants, registration_required, attachments } = body;

    if (!title || !start_date || !end_date) {
      return NextResponse.json({ success: false, error: 'title, start_date, end_date required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events')
      .insert({
        title, description, category: category || 'other',
        start_date, end_date, location,
        organizer_id: authResult.user.id,
        is_public: is_public !== false,
        max_participants, registration_required: registration_required || false,
        attachments: attachments || []
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer', 'dean']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
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
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
