'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

export default function StudentGradesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const res = await fetch('/api/grades');
      return res.json();
    }
  });

  const grades = data?.data || [];

  const gradeVariant = (letter: string): 'success' | 'warning' | 'error' | 'default' => {
    if (['A', 'A+', 'A-'].includes(letter)) return 'success';
    if (['B', 'B+', 'B-', 'C', 'C+'].includes(letter)) return 'warning';
    if (['D', 'E', 'F'].includes(letter)) return 'error';
    return 'default';
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-1">View your academic performance</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : grades.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No grades posted yet</p>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'assessment', header: 'Assessment',
                render: (g: any) => (
                  <div>
                    <p className="font-medium text-gray-900">{g.assignment?.title || g.exam?.title || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{g.assignment?.course?.title || g.exam?.course?.title || ''}</p>
                  </div>
                )
              },
              {
                key: 'type', header: 'Type',
                render: (g: any) => <Badge>{g.exam_id ? 'Exam' : 'Assignment'}</Badge>
              },
              {
                key: 'score', header: 'Score',
                render: (g: any) => <span className="font-medium">{g.points_earned ?? '-'}</span>
              },
              {
                key: 'percentage', header: '%',
                render: (g: any) => <span>{g.percentage ? `${g.percentage}%` : '-'}</span>
              },
              {
                key: 'grade', header: 'Grade',
                render: (g: any) => g.grade_letter ? <Badge variant={gradeVariant(g.grade_letter)}>{g.grade_letter}</Badge> : '-'
              },
              {
                key: 'date', header: 'Date',
                render: (g: any) => g.graded_at ? format(new Date(g.graded_at), 'MMM d, yyyy') : '-'
              }
            ]}
            data={grades}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
