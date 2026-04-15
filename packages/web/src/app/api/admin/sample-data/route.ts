import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

// Define tables that have is_sample flag and can be purged
const SAMPLE_TABLES = [
  'enrollments',
  'schedule_instances',
  'schedules',
  'course_materials',
  'assignments',
  'exams',
  'grades',
  'payments',
  'billing_subscriptions',
  'videos',
  'announcements',
  'events',
  'courses',
  'users',
  'subscription_plans',
  'departments',
  'faculties',
  'venues',
  'institutions',
  'attendance',
  'search_queries',
  'ai_scheduler_suggestions',
  'ai_summaries',
  'lecture_videos',
  'notifications',
  'schedule_instances',
] as const;

// Deletion order to respect foreign key constraints
const DELETION_ORDER = [
  'notifications', // user_id
  'enrollments', // student_id, course_id
  'schedule_instances', // schedule_id
  'grades', // student_id, assignment_id, exam_id
  'assignments', // course_id
  'exams', // course_id
  'course_materials', // course_id
  'videos', // course_id
  'lecture_videos', // course_id
  'attendance', // student_id, schedule_id, course_id
  'schedules', // course_id, lecturer_id
  'billing_subscriptions', // user_id, plan_id
  'payments', // user_id, subscription_id
  'events', // organizer_id
  'announcements',
  'courses', // lecturer_id, department_id
  'users', // institution_id, faculty_id, department references
  'subscription_plans', // institution_id
  'departments', // institution_id, faculty_id
  'faculties', // institution_id
  'venues', // institution_id
  'institutions',
  'search_queries', // user_id
  'ai_scheduler_suggestions', // user_id, course_id
  'ai_summaries',
];

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const supabase = await createClient();

    // Get counts of sample records for each table
    const counts: Record<string, number> = {};

    for (const table of SAMPLE_TABLES) {
      const { count } = await (supabase as any)
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('is_sample', true);
      counts[table] = count || 0;
    }

    // Total count
    const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

    return NextResponse.json({
      success: true,
      data: {
        counts,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching sample data counts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample data counts' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const supabase = await createClient();

    // First fetch counts for reporting
    const beforeCounts: Record<string, number> = {};
    for (const table of SAMPLE_TABLES) {
      const { count } = await (supabase as any)
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('is_sample', true);
      beforeCounts[table] = count || 0;
    }

    // Delete in safe order (children before parents)
    const deletionResults: Record<string, any> = {};
    for (const table of DELETION_ORDER) {
      try {
        const { data, error } = await (supabase as any)
          .from(table)
          .delete()
          .eq('is_sample', true)
          .select('id', { count: 'exact' });

        if (error) {
          deletionResults[table] = { success: false, error: error.message, count: 0 };
        } else {
          const count = data?.length || 0;
          deletionResults[table] = { success: true, count };
        }
      } catch (err: any) {
        deletionResults[table] = { success: false, error: err.message, count: 0 };
      }
    }

    // Calculate totals
    const totalDeleted = Object.entries(deletionResults)
      .filter(([_, result]: [string, any]) => result.success)
      .reduce((sum, [_, result]) => sum + result.count, 0);

    const errors = Object.entries(deletionResults)
      .filter(([_, result]: [string, any]) => !result.success)
      .map(([table, result]) => `${table}: ${result.error}`);

    return NextResponse.json({
      success: true,
      data: {
        beforeCounts,
        deletionResults,
        totalDeleted,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Deleted ${totalDeleted} sample records. ${errors.length > 0 ? `Encountered ${errors.length} errors.` : ''}`,
    });
  } catch (error) {
    console.error('Error deleting sample data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sample data' },
      { status: 500 }
    );
  }
}
