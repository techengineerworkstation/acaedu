'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { VideoCameraIcon, CalendarIcon, ClockIcon, PlayIcon, UserGroupIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScrollReveal } from '@/components/ui';

interface Meeting {
  id: string;
  title: string;
  type: 'zoom' | 'google_meet';
  course_id: string;
  course_name?: string;
  start_time: string;
  duration: number;
  status: string;
  join_url: string;
}

export default function StudentMeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data: meetingsData, isLoading } = useQuery({
    queryKey: ['meetings', 'student'],
    queryFn: async () => {
      const res = await fetch('/api/meetings');
      return res.json();
    }
  });

  const meetings = meetingsData?.data || [];
  
  const filteredMeetings = meetings.filter((m: Meeting) => {
    const meetingTime = new Date(m.start_time).getTime();
    const now = Date.now();
    if (filter === 'upcoming') return meetingTime > now;
    if (filter === 'past') return meetingTime < now;
    return true;
  });

  const upcomingCount = meetings.filter((m: Meeting) => new Date(m.start_time).getTime() > Date.now()).length;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <FadeIn direction="down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Classes & Meetings</h1>
              <p className="text-gray-600 mt-1">Join live Zoom and Google Meet sessions</p>
            </div>
            {upcomingCount > 0 && (
              <Badge variant="success" className="text-sm px-3 py-1">
                {upcomingCount} upcoming
              </Badge>
            )}
          </div>
        </FadeIn>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'upcoming', 'past'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <VideoCameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No meetings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredMeetings.map((meeting: Meeting, index: number) => {
                const meetingTime = new Date(meeting.start_time);
                const isUpcoming = meetingTime.getTime() > Date.now();
                const isStartingSoon = meetingTime.getTime() - Date.now() < 15 * 60 * 1000;

                return (
                  <ScrollReveal key={meeting.id} delay={index * 0.05}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className={`h-2 ${
                        meeting.type === 'zoom' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${
                            meeting.type === 'zoom' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {meeting.type === 'zoom' ? (
                              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.708 6.292H3a1 1 0 00-1 1v9a1 1 0 001 1h1.708c.553 0 1-.447 1-1V7.292c0-.553-.447-1-1-1zM21 10h-1.708a1 1 0 00-1 1v9a1 1 0 001 1H21a1 1 0 001-1v-9a1 1 0 00-1-1zM14.354 7.854a1.5 1.5 0 00-2.122 0l-4.5 2.598a1.5 1.5 0 00-.002 2.122l4.5 2.598a1.5 1.5 0 002.122 0l4.5-2.598a1.5 1.5 0 000-2.122l-4.5-2.598z"/>
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C6.477 0 2 4.477 2 10c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 5.891c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.026 1.592 1.026 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 18.163 22 14.418 22 10c0-5.523-4.477-10-10-10z"/>
                              </svg>
                            )}
                          </div>
                          {isStartingSoon && isUpcoming && (
                            <Badge variant="warning" className="animate-pulse">Starting Soon</Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{meeting.title}</h3>
                        
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {format(meetingTime, 'EEEE, MMM d')}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {format(meetingTime, 'h:mm a')} • {meeting.duration} min
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          variant={isUpcoming ? 'primary' : 'secondary'}
                          onClick={() => {
                            if (isUpcoming) {
                              window.open(meeting.join_url, '_blank');
                            } else {
                              setSelectedMeeting(meeting);
                            }
                          }}
                          leftIcon={isUpcoming ? <PlayIcon className="h-4 w-4" /> : <VideoCameraIcon className="h-4 w-4" />}
                        >
                          {isUpcoming ? 'Join Now' : 'View Recording'}
                        </Button>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Meeting Modal */}
        <Modal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          title="Past Meeting"
          size="lg"
        >
          {selectedMeeting && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Recording not available</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedMeeting.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {format(new Date(selectedMeeting.start_time), 'MMMM d, yyyy')} at {format(new Date(selectedMeeting.start_time), 'h:mm a')}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
