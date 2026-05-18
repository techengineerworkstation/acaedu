'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { PlayCircleIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface VideoForm {
  id?: string;
  title: string;
  course_id: string;
  video_url: string;
  video_type: string;
  description: string;
  thumbnail_url: string;
  duration_seconds: string;
  semester: string;
  academic_year: string;
}

const emptyForm: VideoForm = {
  title: '',
  course_id: '',
  video_url: '',
  video_type: 'external',
  description: '',
  thumbnail_url: '',
  duration_seconds: '',
  semester: '',
  academic_year: ''
};

export default function AdminLecturesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['lectures', 'videos'],
    queryFn: async () => { const r = await fetch('/api/videos'); return r.json(); }
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: async () => { const r = await fetch('/api/courses?department=all'); return r.json(); }
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const payload = {
        ...d,
        duration_seconds: d.duration_seconds ? parseInt(d.duration_seconds) : undefined
      };
      const r = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Recorded class added!');
        closeModal();
        queryClient.invalidateQueries({ queryKey: ['lectures'] });
      } else {
        toast.error(d.error || 'Failed to add class record');
      }
    },
    onError: () => toast.error('Failed to add class record')
  });

  const updateMutation = useMutation({
    mutationFn: async (d: any) => {
      const payload = {
        id: d.id,
        title: d.title,
        course_id: d.course_id,
        video_url: d.video_url,
        video_type: d.video_type,
        description: d.description,
        thumbnail_url: d.thumbnail_url,
        duration_seconds: d.duration_seconds ? parseInt(d.duration_seconds) : undefined,
        semester: d.semester,
        academic_year: d.academic_year
      };
      const r = await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Recorded class updated!');
        closeModal();
        queryClient.invalidateQueries({ queryKey: ['lectures'] });
      } else {
        toast.error(d.error || 'Failed to update class record');
      }
    },
    onError: () => toast.error('Failed to update class record')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
      return r.json();
    },
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success('Recorded class deleted!');
        queryClient.invalidateQueries({ queryKey: ['lectures'] });
      } else {
        toast.error(d.error || 'Failed to delete');
      }
    },
    onError: () => toast.error('Failed to delete class record')
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingVideo(null);
    setShowModal(true);
  };

  const openEdit = (video: any) => {
    setEditingVideo(video);
    setForm({
      id: video.id,
      title: video.title || '',
      course_id: video.course_id || '',
      video_url: video.video_url || '',
      video_type: video.video_type || 'external',
      description: video.description || '',
      thumbnail_url: video.thumbnail_url || '',
      duration_seconds: video.duration_seconds ? String(video.duration_seconds) : '',
      semester: video.semester || '',
      academic_year: video.academic_year || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.title || !form.course_id || !form.video_url) {
      toast.error('Title, course, and video URL are required');
      return;
    }
    if (editingVideo) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const videos = data?.data || [];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Records</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage recorded lecture videos</p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Class Record
          </Button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid gap-4">
            {videos.map((video: any) => (
              <div key={video.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <PlayCircleIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{video.title}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {video.course?.course_code ? `${video.course.course_code} - ${video.course.title}` : video.course_name || 'No course'}
                      {video.video_type && <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{video.video_type}</span>}
                    </p>
                    {video.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{video.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {video.duration_seconds && (
                      <span className="text-xs text-gray-400">{formatDuration(video.duration_seconds)}</span>
                    )}
                    {video.video_url && (
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Open video"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(video)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id, video.title)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PlayCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No class recordes available</p>
            <Button variant="secondary" className="mt-4" onClick={openCreate}>
              Add your first class record
            </Button>
          </div>
        )}

        {/* Create/Edit Class Record Modal */}
        <Modal isOpen={showModal} onClose={closeModal} title={editingVideo ? 'Edit Class Record' : 'Add Class Record'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Introduction to Programming - Lecture 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL *</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.video_type}
                  onChange={(e) => setForm({ ...form, video_type: e.target.value })}
                >
                  <option value="external">External URL</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="upload">Upload</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the lecture content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.duration_seconds}
                  onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })}
                  placeholder="5400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  placeholder="e.g., 2025/2026"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                disabled={!form.title || !form.course_id || !form.video_url}
              >
                {editingVideo ? 'Update' : 'Add'} Class Record
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
