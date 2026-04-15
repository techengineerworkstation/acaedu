import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enqueueEmail } from '@/lib/email/queue';
import { reminderTemplate } from '@/lib/email/templates/reminder';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called every 15 minutes by cron to send upcoming class/exam reminders
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find schedules starting in the next hour
    const { data: upcomingSchedules } = await supabaseAdmin
      .from('schedules')
      .select(`
        *,
        course:courses (id, course_code, title,
          enrollments:enrollments (student_id, student:users!enrollments_student_id_fkey (id, email, full_name, notification_preferences))
        )
      `)
      .gte('start_time', now.toISOString())
      .lte('start_time', oneHourLater.toISOString());

    let notificationsSent = 0;
    let emailsQueued = 0;

    for (const schedule of upcomingSchedules || []) {
      const enrollments = schedule.course?.enrollments || [];

      for (const enrollment of enrollments) {
        const student = enrollment.student;
        if (!student) continue;

        // Create in-app notification
        await supabaseAdmin.from('notifications').insert({
          user_id: student.id,
          type: 'schedule_reminder',
          title: `Upcoming: ${schedule.title}`,
          message: `${schedule.course?.course_code} starts in less than an hour${schedule.location ? ` at ${schedule.location}` : ''}`,
          data: { schedule_id: schedule.id, course_id: schedule.course_id }
        });
        notificationsSent++;

        // Queue email if user has email notifications enabled
        const prefs = student.notification_preferences;
        if (prefs?.email !== false) {
          const html = reminderTemplate({
            userName: student.full_name,
            schedule: {
              title: schedule.title,
              course: `${schedule.course?.course_code} - ${schedule.course?.title}`,
              startTime: new Date(schedule.start_time).toLocaleTimeString(),
              location: schedule.location,
              type: schedule.schedule_type
            },
            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          });

          await enqueueEmail({
            to: student.email,
            subject: `[Acaedu] Reminder: ${schedule.title} starting soon`,
            html
          });
          emailsQueued++;
        }
      }

      // Also notify the lecturer
      if (schedule.lecturer_id) {
        await supabaseAdmin.from('notifications').insert({
          user_id: schedule.lecturer_id,
          type: 'schedule_reminder',
          title: `Your class starts soon: ${schedule.title}`,
          message: `${schedule.course?.course_code} starts in less than an hour`,
          data: { schedule_id: schedule.id }
        });
        notificationsSent++;
      }
    }

    // Find exams happening tomorrow - send reminders
    const { data: upcomingExams } = await supabaseAdmin
      .from('exams')
      .select(`
        *,
        course:courses (id, course_code, title,
          enrollments:enrollments (student_id, student:users!enrollments_student_id_fkey (id, email, full_name))
        )
      `)
      .gte('exam_date', now.toISOString())
      .lte('exam_date', oneDayLater.toISOString());

    for (const exam of upcomingExams || []) {
      const enrollments = exam.course?.enrollments || [];
      for (const enrollment of enrollments) {
        const student = enrollment.student;
        if (!student) continue;

        await supabaseAdmin.from('notifications').insert({
          user_id: student.id,
          type: 'exam_reminder',
          title: `Exam Tomorrow: ${exam.title}`,
          message: `${exam.course?.course_code} exam at ${new Date(exam.exam_date).toLocaleTimeString()}${exam.location ? ` in ${exam.location}` : ''}`,
          data: { exam_id: exam.id }
        });
        notificationsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      notifications_sent: notificationsSent,
      emails_queued: emailsQueued,
      schedules_checked: upcomingSchedules?.length || 0,
      exams_checked: upcomingExams?.length || 0
    });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
