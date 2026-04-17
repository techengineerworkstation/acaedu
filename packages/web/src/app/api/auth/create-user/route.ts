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

    // Generate a unique ID
    const userId = crypto.randomUUID();

    // Try to create user in Supabase Auth first
    let authUserId = userId;
    try {
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + 'A1!';
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: role || 'student',
          department,
          employee_id
        }
      });

      if (authError) {
        console.log('Auth creation failed, will create without auth:', authError.message);
        authUserId = userId;
      } else if (authData?.user?.id) {
        authUserId = authData.user.id;
      }
    } catch (authErr: any) {
      console.log('Auth exception, using generated ID:', authErr.message);
      authUserId = userId;
    }

    // Create user in users table
    const newUser: any = {
      id: authUserId,
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      role: role || 'student',
      is_active: true
    };

    // Only add optional fields if provided
    if (department) newUser.department = department;
    if (employee_id) newUser.employee_id = employee_id;
    if (phone) newUser.phone = phone;

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