import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireFeature } from '@/lib/auth';
import {
  generateLectureSummary,
  enhanceTranscript,
  generateCaptions,
  generateQuizFromTranscript,
  explainConcept,
  translateTranscript,
  SummaryResult,
} from '@/lib/ai/big-pickle';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const featureCheck = await requireFeature(authResult.user.id, 'ai_scheduler');
    if (!featureCheck.allowed) {
      return NextResponse.json({ success: false, error: featureCheck.error }, { status: 403 });
    }

    const body = await req.json();
    const { action, video_id, text, content_type, lectureTitle, durationSeconds, language, concept, context, targetLanguage, questionCount } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    const supabase = await createClient();
    let contentToProcess = text;
    let video: any = null;

    if (video_id) {
      const { data: videoData } = await (supabase as any)
        .from('lecture_videos')
        .select('*')
        .eq('id', video_id)
        .single();

      if (!videoData) {
        return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
      }
      video = videoData;
      contentToProcess = videoData.ai_transcript || videoData.description || videoData.title;
    }

    switch (action) {
      case 'summarize': {
        if (!contentToProcess) {
          return NextResponse.json({ success: false, error: 'Content to summarize is required' }, { status: 400 });
        }
        const summary: SummaryResult = await generateLectureSummary(
          contentToProcess,
          lectureTitle || video?.title || 'Lecture'
        );

        if (video_id) {
          await (supabase as any)
            .from('lecture_videos')
            .update({
              ai_summary: summary.summary,
              ai_key_points: summary.keyPoints,
              ai_study_guide: summary.studyGuide,
              ai_flashcards: summary.flashCards
            })
            .eq('id', video_id);
        }

        return NextResponse.json({ success: true, data: summary, cached: false });
      }

      case 'enhance': {
        if (!contentToProcess) {
          return NextResponse.json({ success: false, error: 'Transcript is required' }, { status: 400 });
        }
        const enhanced = await enhanceTranscript(contentToProcess, language || 'en');
        return NextResponse.json({ success: true, data: { enhanced } });
      }

      case 'captions': {
        if (!contentToProcess || !durationSeconds) {
          return NextResponse.json({ success: false, error: 'Transcript and duration are required' }, { status: 400 });
        }
        const captions = await generateCaptions(contentToProcess, durationSeconds);
        return NextResponse.json({ success: true, data: { captions } });
      }

      case 'quiz': {
        if (!contentToProcess) {
          return NextResponse.json({ success: false, error: 'Transcript is required' }, { status: 400 });
        }
        const quiz = await generateQuizFromTranscript(
          contentToProcess,
          lectureTitle || video?.title || 'Lecture',
          questionCount || 10
        );
        return NextResponse.json({ success: true, data: { quiz } });
      }

      case 'explain': {
        if (!concept || !context) {
          return NextResponse.json({ success: false, error: 'Concept and context are required' }, { status: 400 });
        }
        const explanation = await explainConcept(concept, context);
        return NextResponse.json({ success: true, data: { explanation } });
      }

      case 'translate': {
        if (!contentToProcess || !targetLanguage) {
          return NextResponse.json({ success: false, error: 'Transcript and target language are required' }, { status: 400 });
        }
        const translated = await translateTranscript(contentToProcess, targetLanguage);
        return NextResponse.json({ success: true, data: { translated } });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Valid actions: summarize, enhance, captions, quiz, explain, translate' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process with AI' }, { status: 500 });
  }
}
