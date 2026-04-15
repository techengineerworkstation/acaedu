'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function StudentEventsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async () => {
      const res = await fetch('/api/events?upcoming=true');
      return res.json();
    }
  });

  const events = data?.data || [];

  const categoryColors: Record<string, string> = {
    academic: 'bg-blue-100 text-blue-700',
    social: 'bg-green-100 text-green-700',
    sports: 'bg-amber-100 text-amber-700',
    career: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700'
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-gray-600 mt-1">Campus events, seminars, and workshops</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: any) => {
              const daysUntil = differenceInDays(new Date(event.start_date), new Date());
              return (
                <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary-50 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs text-primary-600 font-medium">{format(new Date(event.start_date), 'MMM')}</span>
                      <span className="text-2xl font-bold text-primary-700">{format(new Date(event.start_date), 'd')}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[event.category] || categoryColors.other}`}>
                          {event.category}
                        </span>
                        {daysUntil <= 7 && <Badge variant="warning">{daysUntil === 0 ? 'Today' : `${daysUntil}d`}</Badge>}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      {event.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>}
                      <div className="flex items-center flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(new Date(event.start_date), 'EEE, MMM d, h:mm a')}
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />{event.location}
                          </span>
                        )}
                        {event.organizer && (
                          <span className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />By {event.organizer.full_name}
                          </span>
                        )}
                      </div>
                    </div>
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
