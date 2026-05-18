import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication
const protectedApiRoutes = [
  '/api/users',
  '/api/schedules',
  '/api/departments',
  '/api/courses',
  '/api/classes',
  '/api/announcements',
  '/api/exams',
  '/api/notifications',
  '/api/settings',
  '/api/admin',
  '/api/grades',
  '/api/assignments',
  '/api/attendance',
  '/api/enrollments',
  '/api/materials',
  '/api/lectures',
  '/api/meetings',
  '/api/events',
  '/api/holidays',
  '/api/outlines',
  '/api/venues',
  '/api/videos',
  '/api/tests',
  '/api/upload',
  '/api/search',
  '/api/chatroom',
  '/api/billing',
];

// Routes that require admin role
const adminOnlyRoutes = [
  '/api/admin',
  '/api/departments',
];

async function getSessionFromSupabase(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Create a response to capture set-cookie headers
  const response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  return { session, response };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a protected API route
  const isProtectedRoute = protectedApiRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const result = await getSessionFromSupabase(request);

    if (!result || !result.session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { session, response } = result;

    // Get user role from metadata or default to 'student'
    const userRole = session.user.user_metadata?.role || 'student';

    // Check admin-only routes
    const isAdminRoute = adminOnlyRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && userRole !== 'admin' && userRole !== 'dean') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // For /api/users, also allow lecturers (they need to see user lists)
    if (pathname === '/api/users' || pathname.startsWith('/api/users/')) {
      const allowedRoles = ['admin', 'dean', 'lecturer'];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - insufficient permissions' },
          { status: 403 }
        );
      }
    }
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.vercel.app",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
