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

    // Generate a random ID
    const userId = crypto.randomUUID();

    // Create user directly in users table (skip auth for now)
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
      return NextResponse.json(
        { error: 'Failed to create user: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: insertedUser,
      message: `User created successfully as ${role || 'student'}.`
    });
  } catch (error) {
    console.error('API create-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + String(error) },
      { status: 500 }
    );
  }
}