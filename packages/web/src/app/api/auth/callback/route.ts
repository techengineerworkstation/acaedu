import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback endpoint - handles both OAuth and email magic link flows
 *
 * OAuth flow (Google/Apple):
 *   - Redirected here with a `code` query parameter
 *   - Exchange code for session via supabase.auth.exchangeCodeForSession()
 *
 * Magic link flow (email OTP):
 *   - Redirected here WITHOUT a code (session already in cookies after Supabase verifies token)
 *   - Just read the session from cookies
 *
 * Query params:
 *   - code: OAuth authorization code (optional)
 *   - state: Role from registration flow (for OAuth)
 *   - next: URL to redirect to after successful auth (default: /)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    console.log('Auth callback: Full URL:', url.toString());
    console.log('Auth callback: Method:', req.method);
    console.log('Auth callback: Query params:', Object.fromEntries(url.searchParams.entries()));

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Contains role from registration (if any)
    const next = url.searchParams.get('next') || '/';
    const oauthError = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const errorUri = url.searchParams.get('error_uri');

    if (oauthError) {
      console.error('Auth callback: OAuth error from provider:', {
        error: oauthError,
        description: errorDescription,
        uri: errorUri
      });
      return NextResponse.redirect(new URL(`/login?error=${oauthError}`, req.url));
    }

    const supabase = await createClient();

    let session;
    let userFromSession;

    // Determine flow: OAuth (with code) or Magic Link (session in cookies)
    if (code) {
      // OAuth flow: exchange code for session
      console.log('Auth callback: Exchanging OAuth code for session');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback: Code exchange failed:', error);
        return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
      }

      session = data.session;
      userFromSession = session?.user;
      console.log('Auth callback: Session established for user:', userFromSession?.id);
    } else {
      // Magic link flow: session should already be in cookies
      console.log('Auth callback: No code provided, checking for existing session (magic link flow)');
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (!existingSession) {
        console.error('Auth callback: No code and no existing session');
        return NextResponse.redirect(new URL('/login?error=no_session', req.url));
      }

      session = existingSession;
      userFromSession = session.user;
      console.log('Auth callback: Found existing session for user:', userFromSession?.id);
    }

    // Determine role:
    // - For OAuth: comes from `state` query param (passed during signInWithOAuth)
    // - For email magic link: comes from user_metadata.role (passed via signInWithOtp data option)
    let role: string | null = state;
    if (!role && userFromSession?.user_metadata?.role) {
      role = userFromSession.user_metadata.role as string;
    }

    // If this was a registration flow with a role, ensure the user record exists in our custom users table
    if (userFromSession && role) {
      try {
        // Check if user already exists in our users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', userFromSession.id)
          .single();

        if (!existingUser) {
          // Create new user record with the role from the registration flow
          const { error: insertError } = await supabase.from('users').insert({
            id: userFromSession.id,
            email: userFromSession.email || '',
            full_name: userFromSession.user_metadata?.full_name || userFromSession.email?.split('@')[0] || 'User',
            role: role,
            department: null,
            email_verified: true,
            avatar_url: userFromSession.user_metadata?.avatar_url || null,
            student_id: null,
            employee_id: null,
          });

          if (insertError) {
            console.error('Auth callback: Failed to create user record:', insertError);
          } else {
            console.log('Auth callback: Created new user with role:', role);
          }
        } else {
          // User already exists - could optionally update if role changed? Usually not.
          console.log('Auth callback: Existing user found, role:', existingUser.role);
        }
      } catch (error) {
        console.error('Auth callback: Error handling user record:', error);
      }
    }

    // Determine redirect URL based on user role if available
    let redirectUrl = next;
    if (next === '/' && userFromSession) {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userFromSession.id)
          .single();

        if (user) {
          const roleRoutes: Record<string, string> = {
            student: '/student/dashboard',
            lecturer: '/lecturer/dashboard',
            admin: '/admin/dashboard',
            dean: '/dean/dashboard',
          };
          redirectUrl = roleRoutes[user.role] || '/dashboard';
        }
      } catch (error) {
        console.error('Auth callback: Failed to fetch user role, using default redirect');
      }
    }

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error('Auth callback: Unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
