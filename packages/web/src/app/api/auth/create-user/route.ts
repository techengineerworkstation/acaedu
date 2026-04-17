import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Create a new user (admin/lecturer creation from admin panel)
 * POST /api/auth/create-user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, role, employee_id, department, phone } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email and full_name are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists by email
    const { data: existingUser } = await admin
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a completely new unique ID
    const userId = crypto.randomUUID() + '-' + Date.now();

    // Try to create user in Supabase Auth
    let authUserId = userId;
    try {
      const tempPassword = 'Temp' + Math.random().toString(36).slice(-6) + '123!';
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: role || 'student'
        }
      });

      if (authData?.user?.id) {
        authUserId = authData.user.id;
      }
    } catch (e) {
      console.log('Auth creation skipped, using generated ID');
    }

    // Create user in users table with upsert to handle conflicts
    const newUser = {
      id: authUserId,
      email: normalizedEmail,
      full_name: full_name.trim(),
      role: role || 'student',
      is_active: true,
      ...(department ? { department } : {}),
      ...(employee_id ? { employee_id } : {}),
      ...(phone ? { phone } : {})
    };

    // Use upsert instead of insert to handle duplicates
    const { data: insertedUser, error: insertError } = await admin
      .from('users')
      .upsert(newUser, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: insertedUser,
      message: role === 'lecturer' 
        ? 'Lecturer created successfully.'
        : 'User created successfully.'
    });
  } catch (error) {
    console.error('API create-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + String(error) },
      { status: 500 }
    );
  }
}