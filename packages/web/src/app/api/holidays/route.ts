import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const supabase = await createClient();
    let query = supabase
      .from('holidays')
      .select('*')
      .eq('is_public', true)
      .order('date', { ascending: true });

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch holidays' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { name, date, description, is_public } = body;

    if (!name || !date) {
      return NextResponse.json({ success: false, error: 'name and date required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('holidays')
      .insert({
        name,
        date,
        description,
        is_public: is_public !== false,
        created_by: authResult.user.id
      })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create holiday' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Holiday ID required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete holiday' }, { status: 500 });
  }
}
