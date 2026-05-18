import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// In-memory store for meetings (no meetings table in DB)
let meetingsStore: any[] = [
  {
    id: 'meeting_demo_1',
    title: 'Introduction to Programming - Lecture 5',
    type: 'zoom',
    host_id: 'system',
    course_id: 'cs101',
    start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    agenda: '',
    status: 'scheduled',
    join_url: 'https://zoom.us/j/1234567890?pwd=demo123',
    host_url: 'https://zoom.us/s/1234567890',
    created_at: new Date().toISOString()
  },
  {
    id: 'meeting_demo_2',
    title: 'Data Structures - Tutorial Session',
    type: 'google_meet',
    host_id: 'system',
    course_id: 'cs201',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    agenda: '',
    status: 'scheduled',
    join_url: 'https://meet.google.com/abc-defg-hij',
    host_url: 'https://meet.google.com/abc-defg-hij',
    created_at: new Date().toISOString()
  }
];

/**
 * POST /api/meetings
 * Create a new Zoom or Google Meet meeting
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const user = authResult.user;
    if (!['admin', 'lecturer'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { type, title, course_id, start_time, duration, agenda } = body;

    if (!title || !start_time) {
      return NextResponse.json(
        { success: false, error: 'Title and start time are required' },
        { status: 400 }
      );
    }

    let joinUrl = '';
    let hostUrl = '';

    if (type === 'zoom') {
      const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000;
      const pwd = Math.random().toString(36).substring(7);
      joinUrl = `https://zoom.us/j/${meetingId}?pwd=${pwd}`;
      hostUrl = `https://zoom.us/s/${meetingId}`;
    } else {
      const code = Array.from({ length: 3 }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('') + '-' +
      Array.from({ length: 3 }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('') + '-' +
      Array.from({ length: 3 }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('');
      joinUrl = `https://meet.google.com/${code}`;
      hostUrl = joinUrl;
    }

    const meeting = {
      id: `meeting_${Date.now()}`,
      title,
      type: type || 'zoom',
      host_id: user.id,
      course_id: course_id || null,
      start_time,
      duration: parseInt(duration) || 60,
      agenda: agenda || '',
      status: 'scheduled',
      join_url: joinUrl,
      host_url: hostUrl,
      created_at: new Date().toISOString()
    };

    meetingsStore.push(meeting);

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meetings
 * List meetings
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    return NextResponse.json({ success: true, data: meetingsStore });
  } catch (error) {
    console.error('Meetings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meetings?id=X
 * Delete a meeting
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const user = authResult.user;
    if (!['admin', 'lecturer'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Meeting ID required' }, { status: 400 });
    }

    meetingsStore = meetingsStore.filter(m => m.id !== id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Meeting delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
