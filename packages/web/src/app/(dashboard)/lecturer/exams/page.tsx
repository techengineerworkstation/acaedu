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

export default function LecturerExamsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', exam_type: 'final', exam_date: '', duration_minutes: '120', location: '', total_marks: '100', passing_marks: '50', instructions: '' });

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => { const r = await fetch('/api/courses'); return r.json(); } });
  const { data, isLoading } = useQuery({ queryKey: ['exams'], queryFn: async () => { const r = await fetch('/api/exams'); return r.json(); } });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('Exam scheduled!'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['exams'] }); } else toast.error(d.error); }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />Schedule Exam</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div> : (
          <div className="space-y-4">
            {(data?.data || []).map((e: any) => (
              <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="error">{e.exam_type}</Badge>
                      <Badge>{e.course?.course_code}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{e.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(e.exam_date), 'EEEE, MMMM d, yyyy h:mm a')} | {e.duration_minutes} min | {e.location || 'TBA'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total: {e.total_marks} marks</p>
                    <p className="text-sm text-gray-500">Pass: {e.passing_marks} marks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Exam" size="lg">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>)}
              </select></div>
            <Input label="Exam Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })}>
                  <option value="midterm">Midterm</option><option value="final">Final</option><option value="quiz">Quiz</option><option value="test">Test</option>
                </select></div>
              <Input label="Date & Time" type="datetime-local" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Duration (min)" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
              <Input label="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
              <Input label="Passing Marks" type="number" value={form.passing_marks} onChange={(e) => setForm({ ...form, passing_marks: e.target.value })} />
            </div>
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate({ ...form, duration_minutes: parseInt(form.duration_minutes), total_marks: parseInt(form.total_marks), passing_marks: parseInt(form.passing_marks) })} isLoading={createMutation.isPending}>Schedule Exam</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
