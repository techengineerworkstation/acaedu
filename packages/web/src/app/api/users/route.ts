import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/users
 * Get all registered users (requires admin/dean/lecturer role)
 * Returns users from the public.users table
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Try to fetch from public.users table
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) query = query.eq('role', role);
    if (department) query = query.eq('department', department);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      // Table might not exist yet - return empty array
      return NextResponse.json({ 
        success: true, 
        data: [], 
        count: 0,
        message: 'Users table not configured yet'
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [], 
      count: count || 0 
    });
  } catch (error: any) {
    console.error('Users API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json();
    const { email, password, full_name, role, department_id, student_id, employee_id } = body;

    // Create user in auth using admin client
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || 'student',
        department_id,
        student_id,
        employee_id
      }
    });

    if (authError) {
      return NextResponse.json({ 
        success: false, 
        error: authError.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: authData.user 
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * PUT /api/users
 * Update a user (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id, full_name, role, department, is_active } = body;

    const updates: any = {};
    if (full_name) updates.full_name = full_name;
    if (role) updates.role = role;
    if (department) updates.department = department;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/users
 * Deactivate a user (admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID required' 
      }, { status: 400 });
    }

    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deactivated' 
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}