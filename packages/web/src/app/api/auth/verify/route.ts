import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Custom magic link verification endpoint
 * Supabase sends a link to: .../auth/v1/verify?token=...&type=signin&redirect_to=...
 *
 * Instead of letting Supabase handle the redirect (which loses session across domains),
 * we intercept by having the email link point to our own endpoint.
 *
 * This endpoint:
 * 1. Extracts the token from query params
 * 2. Verifies it using Supabase admin
 * 3. Creates a session on our domain
 * 4. Redirects to appropriate dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type'); // Should be 'signin' or 'signup'
    const redirectTo = url.searchParams.get('redirect_to') || '/';
    const next = url.searchParams.get('next') || '/';

    console.log('Verify endpoint: Received token verification request');
    console.log('Verify endpoint: Token present:', !!token);
    console.log('Verify endpoint: Type:', type);
    console.log('Verify endpoint: Redirect to:', redirectTo);

    if (!token) {
      console.error('Verify endpoint: No token provided');
      return NextResponse.redirect(new URL('/login?error=no_token', req.url));
    }

    // Use admin client to verify the token
    const supabaseAdmin = createAdminClient();

    // Verify the OTP/magic link token
    const { data: verificationData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: type === 'signup' ? 'signup' : 'email',
    });

    if (verifyError || !verificationData.session) {
      console.error('Verify endpoint: Token verification failed:', verifyError);
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    const session = verificationData.session;
    const user = verificationData.user;
    console.log('Verify endpoint: Token verified for user:', user.id);

    // Create a session cookie on our domain by setting the session
    // We'll create a simple API endpoint that the frontend can call to set the session
    // Instead, we'll redirect to our callback with the access token in a secure way

    // Option: Generate a one-time token and redirect to callback with it
    // Simpler: Since we have the session, we can create a custom cookie and redirect

    // Create response with Set-Cookie headers
    const response = NextResponse.redirect(new URL(redirectTo, req.url));

    // Set the session cookies manually (these are HTTP-only and set by Supabase normally,
    // but we can set them via the admin client's session)
    const expires = new Date();
    expires.setTime(expires.getTime() + (session.expires_in * 1000));

    // Set access token cookie
    response.headers.append('Set-Cookie',
      `sb-access-token=${session.access_token}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=Lax`
    );

    // Set refresh token cookie
    const refreshExpires = new Date();
    refreshExpires.setTime(refreshExpires.getTime() + (session.refresh_token ? session.refresh_token.expires_in * 1000 : 0));
    response.headers.append('Set-Cookie',
      `sb-refresh-token=${session.refresh_token}; Path=/; Expires=${refreshExpires.toUTCString()}; HttpOnly; Secure; SameSite=Lax`
    );

    console.log('Verify endpoint: Session cookies set, redirecting to:', redirectTo);
    return response;

  } catch (error) {
    console.error('Verify endpoint: Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
