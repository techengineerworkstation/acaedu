'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusIcon, VideoCameraIcon, TrashIcon, CalendarIcon, ClockIcon, UserGroupIcon, LinkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScrollReveal } from '@/components/ui';

interface Meeting {
  id: string;
  title: string;
  type: 'zoom' | 'google_meet';
  host_id: string;
  course_id: string;
  course_name?: string;
  start_time: string;
  duration: number;
  status: string;
  join_url: string;
  host_url: string;
  agenda?: string;
  attendees?: number;
  created_at: string;
}

function LecturerMeetingsContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Meeting | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const r = await fetch('/api/courses');
      return r.json();
    }
  });

  const { data: meetingsData, isLoading } = useQuery({
    queryKey: ['meetings', 'lecturer'],
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

  const [form, setForm] = useState({
    title: '',
    type: 'zoom' as 'zoom' | 'google_meet',
    course_id: courseId || '',
    start_time: '',
    duration: 60,
    agenda: ''
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (data: { success: boolean; error?: string }) => {
      if (data.success) {
        toast.success('Meeting scheduled successfully!');
        setShowCreate(false);
        setForm({ title: '', type: 'zoom', course_id: '', start_time: '', duration: 60, agenda: '' });
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
      } else {
        toast.error(data.error || 'Failed to create meeting');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meetings?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Meeting deleted');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <FadeIn direction="down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Class Scheduling</h1>
              <p className="text-gray-600 mt-1">Schedule Zoom and Google Meet sessions for your classes</p>
            </div>
            <div className="flex items-center gap-3">
              {upcomingCount > 0 && (
                <Badge variant="success" className="text-sm px-3 py-1">
                  {upcomingCount} upcoming
                </Badge>
              )}
              <Button onClick={() => setShowCreate(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </FadeIn>

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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-500 mb-4">Schedule a live class session to connect with your students</p>
            <Button onClick={() => setShowCreate(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
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
                      <div className={`h-2 ${meeting.type === 'zoom' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${meeting.type === 'zoom' ? 'bg-blue-100' : 'bg-green-100'}`}>
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
                          <div className="flex items-center gap-2">
                            {isStartingSoon && isUpcoming && (
                              <Badge variant="warning" className="animate-pulse text-xs">Starting Soon</Badge>
                            )}
                            {isUpcoming && (
                              <Badge variant="success" className="text-xs">Scheduled</Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{meeting.title}</h3>

                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {format(meetingTime, 'EEEE, MMM d, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {format(meetingTime, 'h:mm a')} - {format(new Date(meetingTime.getTime() + meeting.duration * 60000), 'h:mm a')}
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-2" />
                            {meeting.attendees || 0} attendees
                          </div>
                        </div>

                        {meeting.agenda && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{meeting.agenda}</p>
                        )}

                        <div className="space-y-2">
                          <Button
                            variant="primary"
                            className="w-full"
                            size="sm"
                            onClick={() => window.open(meeting.host_url, '_blank')}
                            leftIcon={<PlayIcon className="h-4 w-4" />}
                          >
                            Start Meeting
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={() => copyToClipboard(meeting.join_url)}
                              leftIcon={<LinkIcon className="h-4 w-4" />}
                            >
                              Copy Link
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Delete this meeting?')) {
                                  deleteMutation.mutate(meeting.id);
                                }
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Live Class" size="lg">
          <div className="space-y-4">
            <Input
              label="Meeting Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Introduction to Programming - Lecture 5"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'zoom' })}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                    form.type === 'zoom'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className={`h-8 w-8 mb-2 ${form.type === 'zoom' ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.708 6.292H3a1 1 0 00-1 1v9a1 1 0 001 1h1.708c.553 0 1-.447 1-1V7.292c0-.553-.447-1-1-1zM21 10h-1.708a1 1 0 00-1 1v9a1 1 0 001 1H21a1 1 0 001-1v-9a1 1 0 00-1-1zM14.354 7.854a1.5 1.5 0 00-2.122 0l-4.5 2.598a1.5 1.5 0 00-.002 2.122l4.5 2.598a1.5 1.5 0 002.122 0l4.5-2.598a1.5 1.5 0 000-2.122l-4.5-2.598z"/>
                  </svg>
                  <span className={`text-sm font-medium ${form.type === 'zoom' ? 'text-blue-600' : 'text-gray-600'}`}>Zoom</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'google_meet' })}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                    form.type === 'google_meet'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className={`h-8 w-8 mb-2 ${form.type === 'google_meet' ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C6.477 0 2 4.477 2 10c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 5.891c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.026 1.592 1.026 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 18.163 22 14.418 22 10c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span className={`text-sm font-medium ${form.type === 'google_meet' ? 'text-green-600' : 'text-gray-600'}`}>Google Meet</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda (optional)</label>
              <textarea
                rows={3}
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                placeholder="What will be covered in this session..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                isLoading={createMutation.isPending}
                disabled={!form.title || !form.start_time}
              >
                Schedule Meeting
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default function LecturerMeetingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <LecturerMeetingsContent />
    </Suspense>
  );
}
