import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * API endpoint to create a user in the custom users table
 * Called by the frontend SessionProvider when a user exists in auth but not in users table
 * Uses admin client to bypass RLS
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, role, fullName, avatarUrl } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const newUser = {
      id: userId,
      email: email,
      full_name: fullName || email.split('@')[0] || 'User',
      role: role || null,
      department: null,
      email_verified: false,
      avatar_url: avatarUrl || null,
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
      console.error('API create-user upsert failed:', upsertError);
      // Even if upsert fails (e.g., email conflict), try to fetch existing user by ID
      const { data: existingUser } = await admin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (existingUser) {
        return NextResponse.json({ user: existingUser });
      }
      return NextResponse.json(
        { error: 'Failed to create or find user', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: upsertedUser });
  } catch (error) {
    console.error('API create-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
