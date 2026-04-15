'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { PlusIcon, VideoCameraIcon, TrashIcon } from '@heroicons/react/24/outline';

function LecturerVideosContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ course_id: courseId || '', title: '', description: '', video_url: '', video_type: 'youtube', semester: '', academic_year: '' });

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => { const r = await fetch('/api/courses'); return r.json(); } });
  const { data, isLoading } = useQuery({
    queryKey: ['videos', courseId],
    queryFn: async () => { const url = courseId ? `/api/videos?course_id=${courseId}` : '/api/videos'; const r = await fetch(url); return r.json(); }
  });

  const uploadMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('Video added!'); setShowUpload(false); queryClient.invalidateQueries({ queryKey: ['videos'] }); } else toast.error(d.error); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' }); return r.json(); },
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['videos'] }); }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lecture Videos</h1>
          <Button onClick={() => setShowUpload(true)}><PlusIcon className="h-4 w-4 mr-2" />Add Video</Button>
        </div>

        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data?.data || []).map((v: any) => (
              <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-40 bg-gray-800 flex items-center justify-center">
                  {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <VideoCameraIcon className="h-12 w-12 text-gray-500" />}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{v.title}</h3>
                  <p className="text-sm text-gray-500">{v.course?.course_code}</p>
                  <p className="text-xs text-gray-400 mt-1">{v.view_count} views | {v.semester} {v.academic_year}</p>
                  <div className="flex justify-between mt-3">
                    <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">Open Video</a>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(v.id); }} className="text-red-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Add Lecture Video">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>)}
              </select></div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="YouTube/Vimeo URL or direct link" />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.video_type} onChange={(e) => setForm({ ...form, video_type: e.target.value })}>
                <option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="external">External Link</option><option value="uploaded">Uploaded</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="Fall 2024" />
              <Input label="Academic Year" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} placeholder="2024/2025" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button onClick={() => uploadMutation.mutate(form)} isLoading={uploadMutation.isPending}>Add Video</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default function LecturerVideosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <LecturerVideosContent />
    </Suspense>
  );
}


