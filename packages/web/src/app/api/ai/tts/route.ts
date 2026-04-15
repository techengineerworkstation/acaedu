import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { text, language, voice } = body;

    if (!text) {
      return NextResponse.json({ success: false, error: 'text required' }, { status: 400 });
    }

    // Text-to-Speech using OpenAI TTS API
    const ttsResponse = await fetch(process.env.TTS_API_URL || 'https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text.substring(0, 4096), // Max 4096 chars
        voice: voice || 'alloy',
        response_format: 'mp3',
        speed: 1.0
      })
    });

    if (!ttsResponse.ok) {
      return NextResponse.json({ success: false, error: 'TTS service unavailable' }, { status: 503 });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        audio_base64: base64Audio,
        format: 'mp3',
        language: language || 'en'
      }
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate speech' }, { status: 500 });
  }
}
