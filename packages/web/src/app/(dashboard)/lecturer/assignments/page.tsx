'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function LecturerAssignmentsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', due_date: '', total_points: '100' });

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => { const r = await fetch('/api/courses'); return r.json(); } });
  const { data, isLoading } = useQuery({ queryKey: ['assignments'], queryFn: async () => { const r = await fetch('/api/assignments'); return r.json(); } });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('Assignment created!'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['assignments'] }); } else toast.error(d.error); }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />Create Assignment</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div> : (
          <div className="space-y-4">
            {(data?.data || []).map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.course?.course_code} - {a.course?.title}</p>
                    {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                  </div>
                  <div className="text-right">
                    <Badge variant={new Date(a.due_date) > new Date() ? 'info' : 'default'}>
                      Due: {format(new Date(a.due_date), 'MMM d, yyyy')}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{a.total_points} points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>)}
              </select></div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Due Date" type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <Input label="Total Points" type="number" value={form.total_points} onChange={(e) => setForm({ ...form, total_points: e.target.value })} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate({ ...form, total_points: parseInt(form.total_points) })} isLoading={createMutation.isPending}>Create</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
