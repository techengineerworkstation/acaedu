import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export function subscribeToNotifications(userId: string, onNotification?: (payload: any) => void) {
  const channel = supabase
    .channel(`user-${userId}`)
    .on('broadcast', { event: 'new_notification' }, (payload: any) => {
      const data = payload.payload;
      toast(data.title || 'New notification', {
        icon: getIcon(data.type),
        duration: 5000
      });
      onNotification?.(data);
    })
    .on('broadcast', { event: 'new_announcement' }, (payload: any) => {
      const data = payload.payload;
      toast(`New announcement: ${data.title}`, {
        icon: '📢',
        duration: 6000
      });
      onNotification?.(data);
    })
    .on('broadcast', { event: 'schedule_cancelled' }, (payload: any) => {
      const data = payload.payload;
      toast.error(`Class cancelled: ${data.title}\nReason: ${data.reason}`, {
        duration: 8000
      });
      onNotification?.(data);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToScheduleChanges(courseIds: string[], onChange?: (payload: any) => void) {
  const channel = supabase
    .channel('schedule-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'schedules', filter: `course_id=in.(${courseIds.join(',')})` },
      (payload: any) => {
        if (payload.eventType === 'UPDATE') {
          toast('Schedule updated', { icon: '📅' });
        }
        onChange?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToGrades(studentId: string, onGrade?: (payload: any) => void) {
  const channel = supabase
    .channel('grade-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'grades', filter: `student_id=eq.${studentId}` },
      (payload: any) => {
        toast.success('New grade posted!', { icon: '📊' });
        onGrade?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

function getIcon(type?: string): string {
  const icons: Record<string, string> = {
    announcement: '📢', schedule_reminder: '⏰', schedule_change: '📅',
    grade_posted: '📊', assignment_due: '📝', exam_reminder: '📋',
    payment_reminder: '💳', system_maintenance: '🔧'
  };
  return icons[type || ''] || '🔔';
}
