import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  department: string | null;
}

export type AuthResult = { user: AuthUser } | NextResponse<{ success: boolean; error: string }>;

/**
 * Middleware utility to protect API routes
 * Verifies Supabase session and returns user data from auth
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Try to get role from user metadata first, then fall back to users table
  let role = session.user.user_metadata?.role || 'student';
  let full_name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  let avatar_url = session.user.user_metadata?.avatar_url || null;
  let department = session.user.user_metadata?.department_id || null;

  // If role is not in metadata, check the users table
  if (!session.user.user_metadata?.role) {
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role, full_name, avatar_url, department_id')
        .eq('id', session.user.id)
        .single();

      if (dbUser) {
        role = dbUser.role || role;
        full_name = dbUser.full_name || full_name;
        avatar_url = dbUser.avatar_url || avatar_url;
        department = dbUser.department_id || department;
      }
    } catch (e) {
      // Fall back to metadata values
    }
  }

  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email || '',
    full_name,
    role,
    avatar_url,
    department,
  };

  return { user };
}

/**
 * Check if user has required role
 */
export async function requireRole(req: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  const authResult = await requireAuth(req);
  
  if ('status' in authResult) {
    return authResult;
  }
  
  const userRole = authResult.user.role || 'student';
  
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    );
  }
  
  return authResult;
}

/**
 * Get user from request (for routes that may not require auth)
 */
export async function getOptionalAuth(req: NextRequest): Promise<AuthUser | null> {
  try {
    const result = await requireAuth(req);
    if ('status' in result) {
      return null;
    }
    return result.user;
  } catch {
    return null;
  }
}

/**
 * Require a feature flag (placeholder for future use)
 */
export async function requireFeature(req: NextRequest, feature: string) {
  return requireAuth(req);
}