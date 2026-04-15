import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware disabled - not working in production
 * Will revisit later
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};