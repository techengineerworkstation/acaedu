import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/chatroom
 * Get messages from a chatroom
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const type = searchParams.get('type') || 'course'; // 'course' | 'exam' | 'lab'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock chat messages - in production, query from database
    const messages = [
      {
        id: 'msg_1',
        course_id: courseId || 'cs101',
        type,
        user_id: 'user_1',
        user_name: 'John Adebayo',
        user_role: 'student',
        content: 'Does anyone understand the concept of recursion in this lecture?',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_2',
        course_id: courseId || 'cs101',
        type,
        user_id: 'lecturer_1',
        user_name: 'Dr. Sarah Okonkwo',
        user_role: 'lecturer',
        content: 'Great question! Recursion is when a function calls itself. Think of it like Russian dolls - each doll contains a smaller version of itself.',
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_3',
        course_id: courseId || 'cs101',
        type,
        user_id: 'user_2',
        user_name: 'Amina Diallo',
        user_role: 'student',
        content: 'Thanks Dr. Okonkwo! That example really helped. So in the factorial function, we keep calling factorial until we reach the base case?',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_4',
        course_id: courseId || 'cs101',
        type,
        user_id: 'lecturer_1',
        user_name: 'Dr. Sarah Okonkwo',
        user_role: 'lecturer',
        content: 'Exactly Amina! You\'ve got it. The base case prevents infinite recursion.',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_5',
        course_id: courseId || 'cs101',
        type,
        user_id: 'user_3',
        user_name: 'Chidi Eze',
        user_role: 'student',
        content: 'When is the assignment due again?',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ];

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
 * Send a message to a chatroom
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const user = authResult.user;
    const body = await req.json();
    const { course_id, type, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const message = {
      id: `msg_${Date.now()}`,
      course_id: course_id || 'general',
      type: type || 'course',
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      user_role: user.role,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Chat send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
