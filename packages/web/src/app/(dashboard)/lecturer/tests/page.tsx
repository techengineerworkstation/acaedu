'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import { ClipboardDocumentListIcon, CalendarIcon, ClockIcon, MapPinIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LecturerTestsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tests', 'upcoming'],
    queryFn: async () => {
      const res = await fetch('/api/tests?upcoming=true');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tests?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Test deleted');
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
    onError: () => toast.error('Failed to delete test')
  });

  const tests = data?.data || [];

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upcoming Tests</h1>
            <p className="text-gray-600 mt-1">View and manage your test schedule</p>
          </div>
          <Link href="/lecturer/tests/create">
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Schedule Test</span>
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming tests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test: any) => {
              const daysUntil = differenceInDays(new Date(test.test_date), new Date());
              const isUrgent = daysUntil <= 3;
              const isThisWeek = daysUntil <= 7;

              return (
                <div key={test.id} className={`bg-white rounded-xl border ${isUrgent ? 'border-red-300 bg-red-50/30' : 'border-gray-200'} p-6`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={isUrgent ? 'error' : isThisWeek ? 'warning' : 'info'}>
                          {test.test_type}
                        </Badge>
                        <Badge variant={isUrgent ? 'error' : 'default'}>
                          {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                      <p className="text-sm text-gray-600">{test.course?.course_code} - {test.course?.title}</p>
                    </div>

                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(test.test_date), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {format(new Date(test.test_date), 'h:mm a')} ({test.duration_minutes} minutes)
                      </div>
                      {test.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {test.location}
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

                  {test.instructions && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600"><strong>Instructions:</strong> {test.instructions}</p>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => deleteMutation.mutate(test.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm flex items-center space-x-1"
                    >
                      <TrashIcon className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
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
