'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import { ClipboardDocumentListIcon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function StudentExamsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['exams', 'upcoming'],
    queryFn: async () => {
      const res = await fetch('/api/exams?upcoming=true');
      return res.json();
    }
  });

  const exams = data?.data || [];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Exams</h1>
          <p className="text-gray-600 mt-1">View your exam schedule and countdown</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming exams</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam: any) => {
              const daysUntil = differenceInDays(new Date(exam.exam_date), new Date());
              const isUrgent = daysUntil <= 3;
              const isThisWeek = daysUntil <= 7;

              return (
                <div key={exam.id} className={`bg-white rounded-xl border ${isUrgent ? 'border-red-300 bg-red-50/30' : 'border-gray-200'} p-6`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={isUrgent ? 'error' : isThisWeek ? 'warning' : 'info'}>
                          {exam.exam_type}
                        </Badge>
                        <Badge variant={isUrgent ? 'error' : 'default'}>
                          {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <p className="text-sm text-gray-600">{exam.course?.course_code} - {exam.course?.title}</p>
                    </div>

                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(exam.exam_date), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {format(new Date(exam.exam_date), 'h:mm a')} ({exam.duration_minutes} minutes)
                      </div>
                      {exam.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {exam.location}
                        </div>
                      )}
                    </div>

                    {/* Countdown circle */}
                    <div className={`flex-shrink-0 w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${
                      isUrgent ? 'border-red-400 bg-red-50' : isThisWeek ? 'border-amber-400 bg-amber-50' : 'border-blue-400 bg-blue-50'
                    }`}>
                      <span className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : isThisWeek ? 'text-amber-600' : 'text-blue-600'}`}>
                        {daysUntil}
                      </span>
                      <span className={`text-xs ${isUrgent ? 'text-red-500' : isThisWeek ? 'text-amber-500' : 'text-blue-500'}`}>
                        days
                      </span>
                    </div>
                  </div>

                  {exam.instructions && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600"><strong>Instructions:</strong> {exam.instructions}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
