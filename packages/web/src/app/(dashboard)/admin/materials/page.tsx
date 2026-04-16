'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function AdminMaterialsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['materials'], 
    queryFn: async () => { const r = await fetch('/api/materials'); return r.json(); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Materials</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage course materials and documents</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid gap-4">
            {data.data.map((material: any) => (
              <div key={material.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{material.title}</h3>
                    <p className="text-sm text-gray-500">{material.course_name || material.course?.title}</p>
                  </div>
                  <span className="text-xs text-gray-400">{material.file_type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No materials available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}