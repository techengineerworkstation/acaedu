'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AdminExamsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['exams'], 
    queryFn: async () => { const r = await fetch('/api/exams'); return r.json(); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage and view all exams</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid gap-4">
            {data.data.map((exam: any) => (
              <div key={exam.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <AcademicCapIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{exam.title}</h3>
                      <p className="text-sm text-gray-500">{exam.course_name || exam.course?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${exam.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {exam.status || 'Scheduled'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{exam.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No exams scheduled</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}