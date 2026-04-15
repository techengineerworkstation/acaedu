import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/notifications
 * Returns paginated notifications for current user
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', authResult.user.id)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/mark-read
 * Marks notifications as read
 * Body: { notification_ids: string[] }
 */
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const body = await req.json();
    const { notification_ids } = body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json(
        { success: false, error: 'notification_ids array required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .in('id', notification_ids)
      .eq('user_id', authResult.user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/broadcast
 * Create and broadcast notification to multiple users
 * Requires admin or lecturer role
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const user = authResult.user;
    const allowedRoles = ['admin', 'lecturer'];

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      type,
      title,
      message,
      user_ids,
      target_role,
      target_department,
      data = {}
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'title and message required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const notifications = [];

    // Determine target users
    let targetUsers: any[] = [];

    if (user_ids && Array.isArray(user_ids)) {
      // Specific users
      targetUsers = user_ids;
    } else if (target_role) {
      // All users with specific role
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('role', target_role);
      targetUsers = users?.map((u: any) => u.id) || [];
    } else if (target_department) {
      // All users in specific department
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('department', target_department);
      targetUsers = users?.map((u: any) => u.id) || [];
    } else {
      // Default: all users (admin only)
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Must specify target or be admin' },
          { status: 400 }
        );
      }
      const { data: allUsers } = await supabase.from('users').select('id');
      targetUsers = allUsers?.map((u: any) => u.id) || [];
    }

    // Create notification records
    const inserts = targetUsers.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(inserts);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Realtime broadcast
    for (const userId of targetUsers) {
      await supabase.channel(`user-${userId}`).send({
        type: 'broadcast',
        event: 'new_notification',
        payload: { type, title, message, data }
      });
    }

    return NextResponse.json({
      success: true,
      count: targetUsers.length
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to broadcast notification' },
      { status: 500 }
    );
  }
}
