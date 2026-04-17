import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

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

    // Check if user already exists
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

    // Generate a random password if not provided
    const userPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: userPassword,
      user_metadata: {
        full_name,
        role: role || 'student',
        department,
        employee_id
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // Create user record in users table
    const newUser = {
      id: userId,
      email,
      full_name,
      role: role || 'student',
      department: department || null,
      employee_id: employee_id || null,
      phone: phone || null,
      is_active: true,
      avatar_url: null
    };

    const { data: insertedUser, error: insertError } = await admin
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (insertError) {
      console.error('User insert error:', insertError);
      // Try to fetch existing
      const { data: existing } = await admin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existing) {
        return NextResponse.json({ user: existing, success: true });
      }
      return NextResponse.json(
        { error: 'Failed to create user record', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: insertedUser,
      message: `User created successfully. ${role === 'lecturer' ? 'They can now log in as a lecturer.' : ''}`
    });
  } catch (error) {
    console.error('API create-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}