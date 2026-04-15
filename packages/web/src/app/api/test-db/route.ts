import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Try to query users table
    const { data, error } = await (supabase as any).from('users').select('count').limit(1);

    return NextResponse.json({
      success: true,
      message: 'Service role works',
      userCount: data?.length || 0,
      error: error?.message
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
