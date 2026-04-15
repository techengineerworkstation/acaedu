import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { generateLectureSummary, generateCaptions } from '@/lib/ai/big-pickle';

/**
 * GET /api/lectures
 * Get recorded lectures with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const week = searchParams.get('week');
    const month = searchParams.get('month');
    const semester = searchParams.get('semester');

    // Mock lecture data - in production, query from database
    const lectures = [
      {
        id: 'lec_1',
        course_id: courseId || 'cs101',
        course_name: 'Introduction to Programming',
        title: 'Lecture 5: Introduction to Recursion',
        description: 'This lecture covers the basics of recursive functions, base cases, and recursive tree structures.',
        lecture_type: 'lecture',
        duration_seconds: 3600,
        video_url: 'https://example.com/videos/lec5.mp4',
        audio_url: 'https://example.com/audio/lec5.mp3',
        week_number: 5,
        month: 'April',
        semester: 'First',
        academic_year: '2024/2025',
        scheduled_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        transcription: 'Welcome to lecture 5 on recursion. Today we will learn about functions that call themselves...',
        captions_url: 'https://example.com/captions/lec5.vtt',
        slides_url: 'https://example.com/slides/lec5.pdf',
        resources: [
          { name: 'Lecture Slides', url: 'https://example.com/slides/lec5.pdf' },
          { name: 'Code Examples', url: 'https://example.com/code/lec5.zip' }
        ],
        view_count: 45,
        is_published: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'lec_2',
        course_id: courseId || 'cs101',
        course_name: 'Introduction to Programming',
        title: 'Lab 3: Recursive Functions Practice',
        description: 'Hands-on practice with recursive algorithms including factorial, fibonacci, and binary search.',
        lecture_type: 'lab',
        duration_seconds: 5400,
        video_url: 'https://example.com/videos/lab3.mp4',
        audio_url: 'https://example.com/audio/lab3.mp3',
        week_number: 5,
        month: 'April',
        semester: 'First',
        academic_year: '2024/2025',
        scheduled_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        transcription: 'In this lab session, we will implement several recursive functions...',
        captions_url: 'https://example.com/captions/lab3.vtt',
        slides_url: null,
        resources: [
          { name: 'Lab Worksheet', url: 'https://example.com/labs/lab3.pdf' },
          { name: 'Solution Code', url: 'https://example.com/solutions/lab3.py' }
        ],
        view_count: 38,
        is_published: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'lec_3',
        course_id: courseId || 'cs101',
        course_name: 'Introduction to Programming',
        title: 'Lecture 6: Time Complexity and Big O',
        description: 'Understanding algorithmic efficiency and Big O notation.',
        lecture_type: 'lecture',
        duration_seconds: 4500,
        video_url: 'https://example.com/videos/lec6.mp4',
        audio_url: 'https://example.com/audio/lec6.mp3',
        week_number: 6,
        month: 'April',
        semester: 'First',
        academic_year: '2024/2025',
        scheduled_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        transcription: 'Today we dive into time complexity. How do we measure algorithm efficiency?...',
        captions_url: 'https://example.com/captions/lec6.vtt',
        slides_url: 'https://example.com/slides/lec6.pdf',
        resources: [
          { name: 'Lecture Slides', url: 'https://example.com/slides/lec6.pdf' },
          { name: 'Big O Cheat Sheet', url: 'https://example.com/resources/bigo.pdf' }
        ],
        view_count: 52,
        is_published: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'exam_1',
        course_id: courseId || 'cs101',
        course_name: 'Introduction to Programming',
        title: 'Midterm Exam Review Session',
        description: 'Comprehensive review covering all topics from weeks 1-6.',
        lecture_type: 'exam',
        duration_seconds: 7200,
        video_url: 'https://example.com/videos/exam_review.mp4',
        audio_url: 'https://example.com/audio/exam_review.mp3',
        week_number: 7,
        month: 'April',
        semester: 'First',
        academic_year: '2024/2025',
        scheduled_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        transcription: 'Welcome to the midterm exam review. Let us go through the key concepts...',
        captions_url: 'https://example.com/captions/exam_review.vtt',
        slides_url: 'https://example.com/slides/exam_review.pdf',
        resources: [
          { name: 'Practice Questions', url: 'https://example.com/exams/practice.pdf' },
          { name: 'Sample Solutions', url: 'https://example.com/exams/solutions.pdf' }
        ],
        view_count: 89,
        is_published: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({ success: true, data: lectures });
  } catch (error) {
    console.error('Lectures fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lectures' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lectures
 * Upload a new lecture recording (lecturer/admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) {
      return authResult;
    }

    const user = authResult.user;
    if (user.role !== 'lecturer' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only lecturers and admins can upload lectures' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { 
      course_id,
      title,
      description,
      lecture_type,
      duration_seconds,
      video_url,
      audio_url,
      week_number,
      month,
      semester,
      scheduled_time,
      transcription,
      captions_url,
      slides_url,
      resources
    } = body;

    if (!course_id || !title) {
      return NextResponse.json(
        { success: false, error: 'Course and title are required' },
        { status: 400 }
      );
    }

    let autoGenerated = {
      ai_summary: null as string | null,
      ai_key_points: null as string[] | null,
      ai_study_guide: null as string | null,
      ai_flashcards: null as any[] | null,
      ai_captions: null as string | null,
    };

    if (transcription && duration_seconds) {
      try {
        const summary = await generateLectureSummary(transcription, title);
        autoGenerated = {
          ai_summary: summary.summary,
          ai_key_points: summary.keyPoints,
          ai_study_guide: summary.studyGuide || null,
          ai_flashcards: summary.flashCards || null,
          ai_captions: null,
        };

        if (audio_url || video_url) {
          const captions = await generateCaptions(transcription, duration_seconds);
          autoGenerated.ai_captions = captions;
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError);
      }
    }

    const lecture = {
      id: `lec_${Date.now()}`,
      course_id,
      title,
      description: description || '',
      lecture_type: lecture_type || 'lecture',
      duration_seconds: duration_seconds || 0,
      video_url,
      audio_url,
      week_number: week_number || 1,
      month: month || 'January',
      semester: semester || 'First',
      academic_year: '2024/2025',
      scheduled_time: scheduled_time || new Date().toISOString(),
      uploaded_by: user.id,
      transcription: transcription || '',
      captions_url,
      slides_url,
      resources: resources || [],
      view_count: 0,
      is_published: false,
      created_at: new Date().toISOString(),
      ...autoGenerated,
    };

    return NextResponse.json({ success: true, data: lecture, ai_processed: !!autoGenerated.ai_summary }, { status: 201 });
  } catch (error) {
    console.error('Lecture creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lecture' },
      { status: 500 }
    );
  }
}
