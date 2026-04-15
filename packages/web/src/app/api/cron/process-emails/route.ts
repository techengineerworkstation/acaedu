import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue, getQueueStats } from '@/lib/email/queue';

// This endpoint is called by a cron job (Vercel Cron or external)
// to process the email queue
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const processed = await processEmailQueue(20);
    const stats = await getQueueStats();

    return NextResponse.json({
      success: true,
      processed,
      queue: stats
    });
  } catch (error) {
    console.error('Email queue processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
