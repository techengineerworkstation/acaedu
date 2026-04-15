'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

const typeColors: Record<string, { variant: 'info' | 'warning' | 'error' | 'success' | 'departmental' | 'general'; label: string }> = {
  announcement: { variant: 'general', label: 'Announcement' },
  schedule_reminder: { variant: 'info', label: 'Schedule' },
  schedule_change: { variant: 'warning', label: 'Schedule Change' },
  grade_posted: { variant: 'success', label: 'Grade' },
  assignment_due: { variant: 'warning', label: 'Assignment' },
  payment_reminder: { variant: 'error', label: 'Billing' },
  system_maintenance: { variant: 'departmental', label: 'System' },
  exam_reminder: { variant: 'error', label: 'Exam' }
};

export default function StudentNotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=50');
      return res.json();
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: ids })
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">{unreadCount} unread notifications</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markReadMutation.mutate(notifications.filter((n: any) => !n.is_read).map((n: any) => n.id))}
            >
              <CheckIcon className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => {
              const typeConfig = typeColors[n.type] || { variant: 'default' as const, label: n.type };
              const isDepartmental = n.data?.department_id || n.type === 'system_maintenance';

              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-lg border p-4 transition-colors ${
                    n.is_read
                      ? 'border-gray-200'
                      : isDepartmental
                        ? 'border-l-4 border-l-purple-500 border-gray-200 bg-purple-50/30'
                        : 'border-l-4 border-l-blue-500 border-gray-200 bg-blue-50/30'
                  }`}
                  onClick={() => {
                    if (!n.is_read) markReadMutation.mutate([n.id]);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                        {isDepartmental && <Badge variant="departmental">Departmental</Badge>}
                        {!n.is_read && <span className="h-2 w-2 bg-primary-500 rounded-full"></span>}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                      {format(new Date(n.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
