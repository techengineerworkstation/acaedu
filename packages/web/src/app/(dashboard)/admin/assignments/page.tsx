'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function AdminAssignmentsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['assignments'], 
    queryFn: async () => { const r = await fetch('/api/assignments'); return r.json(); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            <p className="text-gray-500 dark:text-gray-400">View all course assignments</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid gap-4">
            {data.data.map((assignment: any) => (
              <div key={assignment.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">{assignment.course_name || assignment.course?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {assignment.status || 'Active'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Due: {assignment.due_date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assignments found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}