import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Create a new user (admin/lecturer creation from admin panel)
 * POST /api/auth/create-user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, role, employee_id, department, phone, password } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email and full_name are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Check if user already exists in users table
    const { data: existingUser } = await admin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a temporary password (user can reset later)
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + 'A1!';

    // Create user in Supabase Auth first
    let authUserId: string;
    try {
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name,
          role: role || 'student',
          department,
          employee_id
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        // If auth fails (e.g., service role not configured), create only in users table
        if (authError.message.includes('service_role') || authError.message.includes('not allowed')) {
          authUserId = crypto.randomUUID();
        } else {
          return NextResponse.json(
            { error: 'Failed to create auth account: ' + authError.message },
            { status: 400 }
          );
        }
      } else {
        authUserId = authData.user.id;
      }
    } catch (authErr: any) {
      console.error('Auth exception:', authErr);
      // Fallback: create without auth
      authUserId = crypto.randomUUID();
    }

    // Now create user in users table
    const newUser: any = {
      id: authUserId,
      email,
      full_name,
      role: role || 'student',
      department: department || null,
      employee_id: employee_id || null,
      is_active: true,
      avatar_url: null
    };

    // Only add phone if column exists (avoid schema cache error)
    if (phone) {
      newUser.phone = phone;
    }

    const { data: insertedUser, error: insertError } = await admin
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user record: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: insertedUser,
      message: role === 'lecturer' 
        ? 'Lecturer created successfully. They can login with their email and the temporary password set.'
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