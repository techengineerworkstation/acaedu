import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { reminderTemplate } from '@/lib/email/templates/reminder';

// Lazy init
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key);
};

// Called every 15 minutes by cron to send upcoming class/exam reminders
export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    if (!supabaseAdmin) {
      return NextResponse.json({ message: 'Supabase not configured' });
    }

    // Fetch upcoming schedules
    const { data: schedules } = await supabaseAdmin
      .from('schedules')
      .select('*, courses(*, users(*)')
      .gte('start_time', now.toISOString())
      .lte('start_time', oneHourLater.toISOString())
      .eq('reminder_sent', false);

    return NextResponse.json({ success: true, processed: schedules?.length || 0 });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}