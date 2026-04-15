'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    schedule_type: 'class',
    start_time: '',
    end_time: '',
    location: '',
    is_recurring: false
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules', 'admin'],
    queryFn: async () => { const r = await fetch('/api/schedules'); return r.json(); }
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: async () => { const r = await fetch('/api/courses?department=all'); return r.json(); }
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const r = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Schedule created!');
        setShowCreate(false);
        setForm({ course_id: '', title: '', description: '', schedule_type: 'class', start_time: '', end_time: '', location: '', is_recurring: false });
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
      } else {
        toast.error(d.error);
      }
    }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">Create and manage class schedules, exams, and events</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>Create Schedule</Button>
        </div>

        <DataTable
          columns={[
            { key: 'title', header: 'Title', render: (s: any) => <span className="font-medium">{s.title}</span> },
            { key: 'course', header: 'Course', render: (s: any) => s.course?.course_code || '-' },
            { key: 'lecturer', header: 'Lecturer', render: (s: any) => s.lecturer?.full_name || '-' },
            { key: 'type', header: 'Type', render: (s: any) => <Badge>{s.schedule_type}</Badge> },
            { key: 'time', header: 'Time', render: (s: any) => `${format(new Date(s.start_time), 'MMM d, h:mm a')} - ${format(new Date(s.end_time), 'h:mm a')}` },
            { key: 'location', header: 'Location', render: (s: any) => s.location || '-' },
            { key: 'recurring', header: 'Recurring', render: (s: any) => s.is_recurring ? <Badge variant="info">Yes</Badge> : 'No' },
          ]}
          data={schedules?.data || []}
          isLoading={isLoading}
        />

        {/* Create Schedule Modal */}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Schedule">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>
                ))}
              </select>
            </div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Introduction to Computer Science - Lecture" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={form.schedule_type}
                  onChange={(e) => setForm({ ...form, schedule_type: e.target.value })}
                >
                  <option value="class">Class</option>
                  <option value="exam">Exam</option>
                  <option value="office_hours">Office Hours</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Room A101"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_recurring"
                checked={form.is_recurring}
                onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
                className="rounded border-gray-300 text-primary-600"
              />
              <label htmlFor="is_recurring" className="ml-2 text-sm text-gray-700">Recurring (weekly)</label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(form)} isLoading={createMutation.isPending}>Create</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
