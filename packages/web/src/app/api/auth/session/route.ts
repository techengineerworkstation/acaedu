import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    console.log('Session endpoint: Called');
    // Use server client to read session from cookies
    const supabase = await createClient();
    console.log('Session endpoint: Server client created');

    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session endpoint: getSession result:', { sessionExists: !!session, error });

    if (error || !session) {
      console.log('Session endpoint: No session or error, returning null');
      return NextResponse.json({
        session: null,
        user: null
      });
    }

    // Get user details from our users table (using admin permissions to bypass RLS)
    console.log('Session endpoint: Fetching user details for ID:', session.user.id);
    const admin = createAdminClient();
    const { data: userDetails } = await admin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    console.log('Session endpoint: User details result:', userDetails ? 'found' : 'not found');

    const responseData = {
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in
      },
      user: userDetails || session.user
    };
    console.log('Session endpoint: Returning response with keys:', Object.keys(responseData));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
