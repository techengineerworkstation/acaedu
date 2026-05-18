import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Create a new user profile in the users table.
 * Called after Supabase Auth signUp() to sync the user profile.
 * POST /api/auth/create-user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, full_name, role, department_id, year_level, semester } = body;

    if (!id || !email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: id, email, and full_name are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user profile already exists
    const { data: existingUser } = await admin
      .from('users')
      .select('id, email')
      .eq('id', id)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      // Profile already exists — update it with latest registration data
      const { data: updatedUser, error: updateError } = await admin
        .from('users')
        .update({
          full_name: full_name.trim(),
          role: role || 'student',
          department: department_id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('User update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user profile: ' + updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'User profile updated successfully.'
      });
    }

    // Create user profile using the Supabase Auth user ID
    const newUser = {
      id,
      email: normalizedEmail,
      full_name: full_name.trim(),
      role: role || 'student',
      is_active: true,
      email_verified: false,
      department: department_id || null,
    };

    const { data: insertedUser, error: insertError } = await admin
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user profile: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: insertedUser,
      message: role === 'lecturer'
        ? 'Lecturer profile created successfully.'
        : 'User profile created successfully.'
    });
  } catch (error) {
    console.error('API create-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + String(error) },
      { status: 500 }
    );
  }
}
