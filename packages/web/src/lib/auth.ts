import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Middleware utility to protect API routes
 * Verifies Supabase session and attaches user to request
 * Also auto-creates user record if it doesn't exist (using admin client to bypass RLS)
 */
export async function requireAuth(req: NextRequest) {
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

  // Try to fetch user details from custom users table
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // If user doesn't exist, auto-create via admin client
  if (userError || !user) {
    console.log('User not found in custom users table, attempting auto-create...');
    try {
      const admin = createAdminClient();

      const newUser = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        role: session.user.user_metadata?.role || null,
        department: null,
        email_verified: true,
        avatar_url: session.user.user_metadata?.avatar_url || null,
        student_id: null,
        employee_id: null,
        // created_at will be set by DB default on insert, preserved on upsert
      };

      const { data: upsertedUser, error: upsertError } = await admin
        .from('users')
        .upsert(newUser, { onConflict: 'id' })
        .select()
        .single();

      if (upsertError) {
        console.error('Auto-create upsert failed:', upsertError.message);
        // Fallback: try to fetch existing user
        const { data: existing } = await admin
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (existing) user = existing;
      } else {
        user = upsertedUser;
      }
    } catch (e) {
      console.error('Error in auto-create:', e);
    }
  }

  // If still no user, return minimal object to avoid breaking
  if (!user) {
    user = {
      id: session.user.id,
      email: session.user.email || '',
      full_name: session.user.email?.split('@')[0] || 'User',
      role: null,
      department: null,
      email_verified: false,
      avatar_url: null,
      student_id: null,
      employee_id: null,
      created_at: new Date().toISOString(),
    } as any;
  }

  return { session, user };
}

/**
 * Middleware utility to require specific roles
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
) {
  const authResult = await requireAuth(req);

  if (!('user' in authResult)) {
    return authResult;
  }

  const { user } = authResult;

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return { session: authResult.session, user };
}

/**
 * Get current user from Supabase session
 * Use in server components and API routes
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Try to fetch from custom users table
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user) {
    console.log('getCurrentUser: user missing, auto-creating...');
    try {
      const admin = createAdminClient();

      const newUser = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        role: session.user.user_metadata?.role || null,
        department: null,
        email_verified: true,
        avatar_url: session.user.user_metadata?.avatar_url || null,
        student_id: null,
        employee_id: null,
        // created_at will be set by DB default on insert, preserved on upsert
      };

      const { data: upsertedUser, error: upsertError } = await admin
        .from('users')
        .upsert(newUser, { onConflict: 'id' })
        .select()
        .single();

      if (upsertError) {
        console.error('getCurrentUser upsert failed:', upsertError.message);
        // Try to fetch existing user as fallback
        const { data: existing } = await admin
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        user = existing;
      } else {
        user = upsertedUser;
      }
    } catch (e) {
      console.error('getCurrentUser error:', e);
    }
  }

  return user;
}

/**
 * Check if user has access to a feature based on subscription
 */
export async function requireFeature(
  userId: string,
  feature: string,
  supabase?: any
) {
  const client = supabase || (await createClient());

  const { data: subscription } = await client
    .from('billing_subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const planId = subscription?.plan_id || 'free';

  const { data: featureAccess } = await client
    .from('feature_access')
    .select('*')
    .eq('plan_id', planId)
    .eq('feature', feature)
    .single();

  if (!featureAccess?.is_enabled) {
    return { allowed: false, error: 'Feature not available on current plan' };
  }

  return { allowed: true, featureAccess };
}
