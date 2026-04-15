'use client';

import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { useSearchParams } from 'next/navigation';
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function MaterialsContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');

  const { data, isLoading } = useQuery({
    queryKey: ['materials', courseId],
    queryFn: async () => {
      const url = courseId ? `/api/materials?course_id=${courseId}` : '/api/materials';
      const res = await fetch(url);
      return res.json();
    }
  });

  const materials = data?.data || [];
  const typeIcons: Record<string, string> = {
    document: '📄', pdf: '📕', presentation: '📊', spreadsheet: '📈',
    image: '🖼️', video: '🎬', audio: '🎵', other: '📎'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
        <p className="text-gray-600 mt-1">Download lecture notes, presentations, and other resources</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No materials available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m: any) => (
            <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex items-start mb-4">
                <span className="text-3xl mr-3">{typeIcons[m.material_type] || '📎'}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{m.title}</h3>
                  <p className="text-sm text-gray-500">{m.course?.course_code} {m.week_number && `• Week ${m.week_number}`}</p>
                </div>
              </div>
              {m.description && (
                <p className="text-sm text-gray-600 mb-4 flex-1">{m.description}</p>
              )}
              <div className="mt-auto">
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentMaterialsPage() {
  return (
    <DashboardLayout role="student">
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <MaterialsContent />
      </Suspense>
    </DashboardLayout>
  );
}
