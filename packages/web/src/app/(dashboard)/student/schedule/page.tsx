'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const SCHEDULE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  lecture: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  tutorial: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  lab: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  exam: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  assignment: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
};

export default function StudentSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const start = weekStart.toISOString();
      const end = addDays(weekStart, 7).toISOString();
      const res = await fetch(`/api/schedules?start_date=${start}&end_date=${end}`);
      return res.json();
    }
  });

  const schedules = schedulesData?.data || [];

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter((s: any) => {
      const scheduleDate = new Date(s.start_time);
      return isSameDay(scheduleDate, day);
    });
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">{format(currentDate, 'MMMM yyyy')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize ${
                    view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg">
                Today
              </button>
              <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Week View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`py-3 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday(day) ? 'bg-primary-50' : ''
                }`}
              >
                <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                <p className={`text-lg font-semibold ${isToday(day) ? 'text-primary-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              return (
                <div key={day.toISOString()} className={`p-2 border-r border-gray-200 last:border-r-0 ${isToday(day) ? 'bg-primary-50/30' : ''}`}>
                  {daySchedules.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center mt-4">No classes</p>
                  ) : (
                    <div className="space-y-2">
                      {daySchedules.map((s: any) => {
                        const colors = SCHEDULE_COLORS[s.schedule_type] || SCHEDULE_COLORS.lecture;
                        const startTime = format(new Date(s.start_time), 'h:mm a');
                        const endTime = format(new Date(s.end_time), 'h:mm a');
                        return (
                          <div key={s.id} className={`p-2 rounded-lg border ${colors.bg} ${colors.border}`}>
                            <p className={`text-xs font-semibold ${colors.text}`}>{s.course?.course_code}</p>
                            <p className={`text-xs ${colors.text} opacity-80`}>{startTime} - {endTime}</p>
                            {s.location && (
                              <p className={`text-xs ${colors.text} opacity-70 flex items-center mt-1`}>
                                <MapPinIcon className="h-3 w-3 mr-1" />{s.location}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Classes</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {getSchedulesForDay(new Date()).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No classes today</p>
              ) : (
                getSchedulesForDay(new Date()).map((s: any) => {
                  const colors = SCHEDULE_COLORS[s.schedule_type] || SCHEDULE_COLORS.lecture;
                  return (
                    <div key={s.id} className={`flex items-center p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                      <div className="flex-shrink-0 w-20 text-center">
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {format(new Date(s.start_time), 'h:mm a')}
                        </p>
                        <p className={`text-xs ${colors.text} opacity-70`}>
                          {format(new Date(s.end_time), 'h:mm a')}
                        </p>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className={`text-sm font-semibold ${colors.text}`}>{s.title}</h3>
                        <p className={`text-xs ${colors.text} opacity-80`}>{s.course?.course_code} - {s.course?.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {s.location && (
                          <span className={`text-xs ${colors.text} flex items-center`}>
                            <MapPinIcon className="h-3.5 w-3.5 mr-1" />{s.location}
                          </span>
                        )}
                        <Badge variant={s.schedule_type === 'exam' ? 'error' : 'info'}>
                          {s.schedule_type}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
