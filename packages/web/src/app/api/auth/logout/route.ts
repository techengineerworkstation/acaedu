import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Get the current session to access the refresh token
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Revoke the refresh token to invalidate the session
      await supabase.auth.revokeRefreshToken(session.refresh_token);
    }

    // Clear cookies by expiring them
    const response = NextResponse.json({ success: true });
    response.headers.append('Set-Cookie', 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');
    response.headers.append('Set-Cookie', 'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
