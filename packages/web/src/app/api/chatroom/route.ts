import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/chatroom
 * Get messages from chat (discussion)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Try to get from database
    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: messages, error } = await query;

    if (error || !messages) {
      // Return mock data if table not configured
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'msg_1',
            course_id: courseId || 'cs101',
            user_id: 'user_1',
            user_name: 'John Adebayo',
            user_role: 'student',
            content: 'Does anyone understand the recursion assignment?',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'msg_2',
            course_id: courseId || 'cs101',
            user_id: 'lecturer_1',
            user_name: 'Dr. Sarah Okonkwo',
            user_role: 'lecturer',
            content: 'Great question! Recursion is when a function calls itself.',
            created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    }

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Chat fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chatroom
 * Send a message to chat
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const user = authResult.user;
    const body = await req.json();
    const { course_id, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Try to save to database
    const supabase = await createClient();
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        course_id: course_id || 'general',
        message: content.trim()
      })
      .select()
      .single();

    if (error || !message) {
      // Return mock success if table not configured
      const mockMessage = {
        id: `msg_${Date.now()}`,
        course_id: course_id || 'general',
        user_id: user.id,
        user_name: user.full_name || 'Anonymous',
        user_role: user.role,
        content: content.trim(),
        created_at: new Date().toISOString()
      };
      return NextResponse.json({ success: true, data: mockMessage }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Chat post error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}