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

export default function LecturerTestCreatePage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<{ course_id: string; title: string; test_type: string; test_date: string; duration_minutes: string; location: string; total_marks: string; passing_marks: string; instructions: string; attachments: { name: string; size: number; type: string }[] }>({ course_id: '', title: '', test_type: 'quiz', test_date: '', duration_minutes: '60', location: '', total_marks: '50', passing_marks: '25', instructions: '', attachments: [] });

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => { const r = await fetch('/api/courses'); return r.json(); } });

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const r = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Test scheduled!');
        setShowCreate(false);
        queryClient.invalidateQueries({ queryKey: ['tests'] });
      } else toast.error(d.error);
    }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Schedule Test</h1>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>)}
              </select></div>
            <Input label="Test Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.test_type} onChange={(e) => setForm({ ...form, test_type: e.target.value })}>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="practical">Practical</option>
                  <option value="assignment">Assignment</option>
                </select></div>
              <Input label="Date & Time" type="datetime-local" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Duration (min)" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
              <Input label="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
              <Input label="Passing Marks" type="number" value={form.passing_marks} onChange={(e) => setForm({ ...form, passing_marks: e.target.value })} />
            </div>
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
              <input type="file" multiple className="w-full border rounded-lg px-3 py-2 text-sm"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type
                  }));
                  setForm({ ...form, attachments: files });
                }}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate({
                ...form,
                duration_minutes: parseInt(form.duration_minutes),
                total_marks: parseInt(form.total_marks),
                passing_marks: parseInt(form.passing_marks)
              })} isLoading={createMutation.isPending}>Schedule Test</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}