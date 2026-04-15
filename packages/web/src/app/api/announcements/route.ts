import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { sendAnnouncementEmail } from '@/lib/email/send';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('announcements')
      .select(`
        *,
        author:users!announcements_author_id_fkey (id, full_name, avatar_url, role)
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Filter by user's role
    if (authResult.user.role !== 'admin') {
      query = query.contains('target_roles', [authResult.user.role]);
    }

    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: count, total_pages: count ? Math.ceil(count / limit) : 0 }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer', 'dean']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const {
      title, content, category, priority, target_roles,
      target_courses, attachments, is_published, expires_at,
      send_email
    } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'title and content required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        category: category || 'general',
        priority: priority || 'normal',
        target_roles: target_roles || ['student', 'lecturer'],
        target_courses: target_courses || null,
        attachments: attachments || [],
        author_id: authResult.user.id,
        is_published: is_published !== false,
        published_at: is_published !== false ? new Date().toISOString() : null,
        expires_at
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Create notifications for target users
    const roles = target_roles || ['student', 'lecturer'];
    const { data: targetUsers } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('role', roles);

    if (targetUsers && targetUsers.length > 0) {
      const notifications = targetUsers.map((u: any) => ({
        user_id: u.id,
        type: 'announcement' as const,
        title: `New Announcement: ${title}`,
        message: content.substring(0, 200),
        data: { announcement_id: data.id, category, priority }
      }));

      await supabase.from('notifications').insert(notifications);

      // Send email notifications if requested
      if (send_email) {
        const emailPromises = targetUsers.slice(0, 100).map((u: any) =>
          sendAnnouncementEmail(u.email, u.full_name, {
            title,
            content,
            category: category || 'general',
            author: authResult.user.full_name,
            publishedAt: new Date().toISOString()
          })
        );
        // Fire and forget - don't block the response
        Promise.allSettled(emailPromises);
      }

      // Realtime broadcast
      for (const u of targetUsers) {
        await supabase.channel(`user-${u.id}`).send({
          type: 'broadcast',
          event: 'new_announcement',
          payload: { id: data.id, title, category, priority }
        });
      }
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create announcement' }, { status: 500 });
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

    // Check ownership
    if (authResult.user.role !== 'admin') {
      const { data: existing } = await supabase
        .from('announcements')
        .select('author_id')
        .eq('id', id)
        .single();

      if (existing?.author_id !== authResult.user.id) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'lecturer', 'dean']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    const supabase = await createClient();

    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete announcement' }, { status: 500 });
  }
}
