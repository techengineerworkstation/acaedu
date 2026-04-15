import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin', 'dean']);
    if (!('user' in authResult)) return authResult;

    const supabase = await createClient();

   // Replace lines 22-26 (and any others using .from) with this:
const [
  studentsRes,    // Change from studentCountRes
  lecturersRes,   // Change from lecturerCountRes
  coursesRes,     // Change from courseCountRes
  enrollmentsRes,
  recentSignupsRes,
  paymentsRes,
  subscriptionsRes, // <--- Added this
  eventsRes
] = await Promise.all([
  (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true),
  (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('role', 'lecturer').eq('is_active', true),
  (supabase as any).from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
  (supabase as any).from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  (supabase as any).from('users').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5)
   (supabase as any).from('billing_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      (supabase as any).from('payments').select('amount').eq('status', 'completed'),
      (supabase as any).from('events').select('id', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
      (supabase as any).from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
    ]);

    const totalRevenue = paymentsRes.data?.reduce((sum: any, p: any) => sum + (p.amount || 0), 0) || 0;

    // Population census
    const { data: census } = await (supabase.rpc as any)('get_population_census');

    // Activity summary
    const { data: recentActivity } = await (supabase as any)
  .from('audit_logs') // or whatever your activity table is named
  .select('id, action, created_at, user_id')
  .order('created_at', { ascending: false })
  .limit(10);

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
          recent_signups: recentSignupsRes.count || 0,
          upcoming_events: eventsRes.count || 0
        },
        census: census || [],
        recent_activity: recentActivity || []
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
