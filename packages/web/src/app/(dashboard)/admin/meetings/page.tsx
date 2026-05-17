'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { VideoCameraIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function AdminMeetingsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['meetings'], 
    queryFn: async () => { const r = await fetch('/api/meetings'); return r.json(); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage live classes and video meetings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid gap-4">
            {data.data.map((meeting: any) => (
              <div key={meeting.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <VideoCameraIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">{meeting.course_name || meeting.course?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{meeting.scheduled_at}</p>
                    <span className={`text-xs px-2 py-1 rounded ${meeting.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {meeting.status || 'Scheduled'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No live classes scheduled</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}