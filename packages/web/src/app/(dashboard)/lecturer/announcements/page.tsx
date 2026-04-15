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
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function LecturerAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', category: 'general', priority: 'normal',
    target_roles: ['student'], send_email: false
  });

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => { const res = await fetch('/api/announcements'); return res.json(); }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) { toast.success('Announcement posted!'); setShowCreate(false); setForm({ title: '', content: '', category: 'general', priority: 'normal', target_roles: ['student'], send_email: false }); queryClient.invalidateQueries({ queryKey: ['announcements'] }); }
      else toast.error(data.error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['announcements'] }); }
  });

  const priorityVariant = (p: string) => {
    if (p === 'urgent') return 'error' as const;
    if (p === 'high') return 'warning' as const;
    return 'default' as const;
  };

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />New Announcement</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : (
          <div className="space-y-4">
            {(data?.data || []).map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={priorityVariant(a.priority)}>{a.priority}</Badge>
                      <Badge>{a.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-3">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Posted {format(new Date(a.created_at), 'MMM d, yyyy h:mm a')}
                      {a.author && ` by ${a.author.full_name}`}
                    </p>
                  </div>
                  <button onClick={() => { if (confirm('Delete this announcement?')) deleteMutation.mutate(a.id); }} className="p-2 text-gray-400 hover:text-red-500">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Announcement" size="lg">
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your announcement..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <div className="flex space-x-4">
                {['student', 'lecturer', 'admin'].map(role => (
                  <label key={role} className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 mr-2"
                      checked={form.target_roles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) setForm({ ...form, target_roles: [...form.target_roles, role] });
                        else setForm({ ...form, target_roles: form.target_roles.filter(r => r !== role) });
                      }} />
                    <span className="text-sm capitalize">{role}s</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 mr-2" checked={form.send_email} onChange={(e) => setForm({ ...form, send_email: e.target.checked })} />
              <span className="text-sm">Also send email notification</span>
            </label>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(form)} isLoading={createMutation.isPending}>Post Announcement</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
