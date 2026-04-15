import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'dean']);
    if (!('user' in authResult)) return authResult;

    const supabase = await createClient();

    // FIXED: Added missing commas, corrected variable mapping, and added all required queries
    const [
      studentsRes,
      lecturersRes,
      coursesRes,
      enrollmentsRes,
      recentSignupsRes, // This will hold the 30-day count
      subscriptionsRes,
      paymentsRes,
      eventsRes,
      auditLogsRes
    ] = await Promise.all([
      (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true),
      (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'lecturer').eq('is_active', true),
      (supabase as any).from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
      (supabase as any).from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      (supabase as any).from('users').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      (supabase as any).from('billing_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      (supabase as any).from('payments').select('amount').eq('status', 'completed'),
      (supabase as any).from('events').select('id', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
      (supabase as any).from('audit_logs').select('id, action, created_at, user_id').order('created_at', { ascending: false }).limit(10)
    ]);

    const totalRevenue = paymentsRes.data?.reduce((sum: any, p: any) => sum + (p.amount || 0), 0) || 0;

    // Population census
    const { data: census } = await (supabase.rpc as any)('get_population_census');

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total_students: studentsRes.count || 0,
          total_lecturers: lecturersRes.count || 0,
          total_courses: coursesRes.count || 0,
          active_enrollments: enrollmentsRes.count || 0,
          total_revenue: totalRevenue,
          active_subscriptions: subscriptionsRes.count || 0,
          recent_signups: recentSignupsRes.count || 0, // Mapped to the 30-day query result
          upcoming_events: eventsRes.count || 0
        },
        census: census || [],
        recent_activity: auditLogsRes.data || []
      }
    });
  } catch (error) {
    console.error('Stats Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

