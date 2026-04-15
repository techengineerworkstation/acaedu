import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

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
    const body = await req.json();
    const { 
      type, // 'zoom' | 'google_meet'
      title, 
      course_id,
      start_time,
      duration, // in minutes
      agenda
    } = body;

    if (!type || !title || !start_time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let meeting = {
      id: `meeting_${Date.now()}`,
      title,
      type,
      host_id: user.id,
      course_id,
      start_time,
      duration: duration || 60,
      agenda,
      status: 'scheduled',
      join_url: '',
      host_url: '',
      created_at: new Date().toISOString()
    };

    if (type === 'zoom') {
      // Generate Zoom-style meeting
      meeting.join_url = `https://zoom.us/j/${Math.floor(Math.random() * 9000000000) + 1000000000}?pwd=${Math.random().toString(36).substring(7)}`;
      meeting.host_url = `https://zoom.us/s/${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    } else if (type === 'google_meet') {
      // Generate Google Meet-style link
      const code = Array.from({ length: 3 }, () => 
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('') + '-' + 
      Array.from({ length: 3 }, () => 
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('') + '-' + 
      Array.from({ length: 3 }, () => 
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('');
      meeting.join_url = `https://meet.google.com/${code}`;
      meeting.host_url = meeting.join_url;
    }

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
 * List meetings for a course or user
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const upcoming = searchParams.get('upcoming');

    // Return mock data - in production, query from database
    const meetings = [
      {
        id: 'meeting_1',
        title: 'Introduction to Programming - Lecture 5',
        type: 'zoom',
        host_id: 'lecturer_1',
        course_id: courseId || 'cs101',
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        status: 'scheduled',
        join_url: 'https://zoom.us/j/1234567890',
        host_url: 'https://zoom.us/s/1234567890',
        created_at: new Date().toISOString()
      },
      {
        id: 'meeting_2',
        title: 'Data Structures - Tutorial Session',
        type: 'google_meet',
        host_id: 'lecturer_2',
        course_id: courseId || 'cs201',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        status: 'scheduled',
        join_url: 'https://meet.google.com/abc-defg-hij',
        host_url: 'https://meet.google.com/abc-defg-hij',
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Meetings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
