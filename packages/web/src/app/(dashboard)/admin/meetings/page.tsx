'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { VideoCameraIcon, PlusIcon, TrashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function AdminMeetingsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    course_id: '',
    type: 'zoom' as 'zoom' | 'google_meet',
    start_time: '',
    duration: '60',
    agenda: ''
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => { const r = await fetch('/api/meetings'); return r.json(); }
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: async () => { const r = await fetch('/api/courses?department=all'); return r.json(); }
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const r = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Live class created!');
        setShowCreate(false);
        setForm({ title: '', course_id: '', type: 'zoom', start_time: '', duration: '60', agenda: '' });
        refetch();
      } else {
        toast.error(d.error || 'Failed to create live class');
      }
    },
    onError: () => toast.error('Failed to create live class')
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Meeting link copied!');
  };

  const meetings = data?.data || [];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage live classes and video meetings</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Create Live Class
          </Button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
          </div>
        ) : meetings.length > 0 ? (
          <div className="grid gap-4">
            {meetings.map((meeting: any) => (
              <div key={meeting.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <VideoCameraIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">
                        {meeting.type === 'zoom' ? 'Zoom' : 'Google Meet'} &middot; {meeting.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(meeting.start_time).toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${meeting.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {meeting.status || 'Scheduled'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyLink(meeting.join_url)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy meeting link"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No live classes scheduled</p>
            <Button variant="secondary" className="mt-4" onClick={() => setShowCreate(true)}>
              Create your first live class
            </Button>
          </div>
        )}

        {/* Create Live Class Modal */}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Live Class">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Introduction to Programming - Lecture 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select course (optional)</option>
                {courses?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'zoom' | 'google_meet' })}
                >
                  <option value="zoom">Zoom</option>
                  <option value="google_meet">Google Meet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  min="15"
                  max="480"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda (optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                value={form.agenda}
                onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                placeholder="What will be covered in this session?"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                isLoading={createMutation.isPending}
                disabled={!form.title || !form.start_time}
              >
                Create Live Class
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
