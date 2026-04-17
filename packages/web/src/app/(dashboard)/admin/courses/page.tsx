'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', title: '', description: '', summary: '', color: '#0ea5e9', credits: 3, capacity: 30, department_id: '', lecturer_id: '' });

  const { data: courses, isLoading, error } = useQuery({ 
    queryKey: ['courses', 'admin'], 
    queryFn: async () => { 
      const r = await fetch('/api/admin/courses'); 
      const json = await r.json();
      console.log('Courses API response:', json);
      if (!json.success) throw new Error(json.error);
      return json;
    }
  });

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: async () => { const r = await fetch('/api/admin/departments'); return r.json(); } });
  const { data: lecturers } = useQuery({ queryKey: ['lecturers'], queryFn: async () => { const r = await fetch('/api/admin/users?role=lecturer'); return r.json(); } });

  const getDepartmentName = (id: string) => departments?.data?.find((d: any) => d.id === id)?.name || '-';
  const getLecturerName = (id: string) => lecturers?.data?.find((l: any) => l.id === id)?.full_name || 'TBA';

  const courseList = courses?.data || [];
  const { data: lecturers } = useQuery({ queryKey: ['users', 'lecturers'], queryFn: async () => { const r = await fetch('/api/users?role=lecturer'); return r.json(); } });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: async () => { const r = await fetch('/api/courses?department=all'); return r.json(); } });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('Course created!'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['courses'] }); } else toast.error(d.error); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />Create Course</Button>
        </div>

        <DataTable
          columns={[
            { key: 'code', header: 'Code', render: (c: any) => <span className="font-medium">{c.code || c.course_code}</span> },
            { key: 'title', header: 'Title', render: (c: any) => c.title },
            { key: 'dept', header: 'Department', render: (c: any) => getDepartmentName(c.department_id) },
            { key: 'lecturer', header: 'Lecturer', render: (c: any) => getLecturerName(c.lecturer_id) },
            { key: 'enrolled', header: 'Enrolled', render: (c: any) => `${c.enrolled_count}/${c.capacity}` },
            { key: 'credits', header: 'Credits', render: (c: any) => c.credits },
            { key: 'status', header: 'Status', render: (c: any) => <Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Active' : 'Inactive'}</Badge> },
          ]}
          data={courseList}
          isLoading={isLoading}
        />

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Course">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Course Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS101" />
              <Input label="Credits" type="number" value={form.credits.toString()} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })} />
            </div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Summary (displayed to students)</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Brief summary for students..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color (hex)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-9 w-9 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#0ea5e9"
                />
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.lecturer_id} onChange={(e) => setForm({ ...form, lecturer_id: e.target.value })}>
                <option value="">Select lecturer</option>
                {lecturers?.data?.map((l: any) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select></div>
            <Input label="Capacity" type="number" value={form.capacity.toString()} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} />
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
