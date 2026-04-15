import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // course, user, announcement, event, material

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false, error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const supabase = await createClient();
    const results: any[] = [];
    const searchTerm = `%${query}%`;

    // Log search query
    await supabase.from('search_queries').insert({
      user_id: authResult.user.id,
      query,
      search_type: type || 'general'
    });

    if (!type || type === 'course') {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, course_code, title, description')
        .or(`title.ilike.${searchTerm},course_code.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('is_active', true)
        .limit(10);

      courses?.forEach((c: any) => results.push({
        type: 'course', id: c.id,
        title: `${c.course_code} - ${c.title}`,
        description: c.description?.substring(0, 100),
        url: `/courses/${c.id}`
      }));
    }

    if (!type || type === 'announcement') {
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id, title, content, category')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .eq('is_published', true)
        .limit(10);

      announcements?.forEach((a: any) => results.push({
        type: 'announcement', id: a.id,
        title: a.title,
        description: a.content?.substring(0, 100),
        url: `/announcements/${a.id}`
      }));
    }

    if (!type || type === 'event') {
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description, start_date')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('is_public', true)
        .limit(10);

      events?.forEach((e: any) => results.push({
        type: 'event', id: e.id,
        title: e.title,
        description: e.description?.substring(0, 100),
        url: `/events/${e.id}`
      }));
    }

    if ((!type || type === 'user') && ['admin', 'dean'].includes(authResult.user.role)) {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email, role, matriculation_number')
        .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},matriculation_number.ilike.${searchTerm}`)
        .limit(10);

      users?.forEach((u: any) => results.push({
        type: 'user', id: u.id,
        title: u.full_name,
        description: `${u.role} - ${u.email}`,
        url: `/admin/users/${u.id}`
      }));
    }

    if (!type || type === 'material') {
      const { data: materials } = await supabase
        .from('course_materials')
        .select('id, title, description, course_id')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('is_published', true)
        .limit(10);

      materials?.forEach((m: any) => results.push({
        type: 'material', id: m.id,
        title: m.title,
        description: m.description?.substring(0, 100),
        url: `/courses/${m.course_id}/materials`
      }));
    }

    // Update results count in search query
    await supabase
      .from('search_queries')
      .update({ results_count: results.length })
      .eq('user_id', authResult.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    return NextResponse.json({ success: true, data: results, total: results.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
