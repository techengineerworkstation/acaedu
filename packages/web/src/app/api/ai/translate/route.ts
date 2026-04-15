import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { text, target_language, source_language } = body;

    if (!text || !target_language) {
      return NextResponse.json({ success: false, error: 'text and target_language required' }, { status: 400 });
    }

    const aiResponse = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate the following text from ${source_language || 'English'} to ${target_language}. Return only the translated text.`
          },
          { role: 'user', content: text.substring(0, 5000) }
        ],
        temperature: 0.1
      })
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ success: false, error: 'Translation service unavailable' }, { status: 503 });
    }

    const aiData = await aiResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        translated_text: aiData.choices[0].message.content,
        source_language: source_language || 'en',
        target_language
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to translate' }, { status: 500 });
  }
}
