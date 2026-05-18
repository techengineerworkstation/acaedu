import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  '/api/auth': { requests: 5, windowMs: 60 * 1000 },      // 5 req/min for auth
  '/api/users': { requests: 10, windowMs: 60 * 1000 },     // 10 req/min for users
  '/api/schedules': { requests: 30, windowMs: 60 * 1000 }, // 30 req/min for schedules
  'default': { requests: 60, windowMs: 60 * 1000 },        // 60 req/min default
};

function getRateLimit(pathname: string): { requests: number; windowMs: number } {
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return limit;
    }
  }
  return RATE_LIMITS['default'];
}

export function checkRateLimit(
  request: NextRequest
): { allowed: boolean; headers: Record<string, string> } {
  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const { pathname } = request.nextUrl;
  const limit = getRateLimit(pathname);
  const key = `${ip}:${pathname}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + limit.windowMs };
    rateLimitStore.set(key, entry);
  } else {
    entry.count++;
  }

  const remaining = Math.max(0, limit.requests - entry.count);
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

  const headers = {
    'X-RateLimit-Limit': limit.requests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetSeconds.toString(),
  };

  if (entry.count > limit.requests) {
    return { allowed: false, headers };
  }

  return { allowed: true, headers };
}

export function rateLimitResponse(headers: Record<string, string>): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests. Please try again later.',
    },
    {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'] || '60',
      },
    }
  );
}
