'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function LecturerCoursesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ course_code: '', title: '', description: '', credits: 3, capacity: 30, department_id: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['courses', 'lecturer'],
    queryFn: async () => { const res = await fetch('/api/courses'); return res.json(); }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) { toast.success('Course created!'); setShowCreateModal(false); queryClient.invalidateQueries({ queryKey: ['courses'] }); }
      else toast.error(data.error);
    }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <Button onClick={() => setShowCreateModal(true)}><PlusIcon className="h-4 w-4 mr-2" />Create Course</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((course: any) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="info">{course.course_code}</Badge>
                  <Badge variant={course.is_active ? 'success' : 'default'}>{course.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description || 'No description'}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{course.credits} Credits</span>
                  <span>{course.enrolled_count}/{course.capacity} enrolled</span>
                </div>
                <div className="flex space-x-2 mt-4 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => window.location.href = `/lecturer/attendance?course_id=${course.id}`}>Attendance</Button>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = `/lecturer/grades?course_id=${course.id}`}>Grades</Button>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = `/lecturer/videos?course_id=${course.id}`}>Videos</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course">
          <div className="space-y-4">
            <Input label="Course Code" placeholder="CS101" value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} />
            <Input label="Title" placeholder="Introduction to Computer Science" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Credits" type="number" value={form.credits.toString()} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })} />
              <Input label="Capacity" type="number" value={form.capacity.toString()} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(form)} isLoading={createMutation.isPending}>Create Course</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
