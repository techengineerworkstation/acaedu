'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import { DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function StudentAssignmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await fetch('/api/assignments');
      return res.json();
    }
  });

  const assignments = data?.data || [];
  const upcoming = assignments.filter((a: any) => new Date(a.due_date) >= new Date());
  const past = assignments.filter((a: any) => new Date(a.due_date) < new Date());

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Track your upcoming and past assignments</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-gray-500 bg-white rounded-lg border p-4 text-center">No upcoming assignments</p>
                ) : upcoming.map((a: any) => {
                  const daysLeft = differenceInDays(new Date(a.due_date), new Date());
                  return (
                    <div key={a.id} className={`bg-white rounded-lg border p-4 ${daysLeft <= 2 ? 'border-red-300' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{a.title}</h3>
                          <p className="text-sm text-gray-500">{a.course?.course_code} - {a.course?.title}</p>
                          {a.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>}
                        </div>
                        <div className="text-right">
                          <Badge variant={daysLeft <= 1 ? 'error' : daysLeft <= 3 ? 'warning' : 'info'}>
                            {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(a.due_date), 'MMM d, h:mm a')}</p>
                          <p className="text-xs text-gray-500 mt-1">{a.total_points} points</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Past ({past.length})</h2>
                <div className="space-y-2">
                  {past.map((a: any) => (
                    <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-4 opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-700">{a.title}</h3>
                          <p className="text-sm text-gray-500">{a.course?.course_code}</p>
                        </div>
                        <Badge variant="default">Past due</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
