'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'academic', start_date: '', end_date: '', location: '', max_participants: '', registration_required: false });

  const { data, isLoading } = useQuery({ queryKey: ['events'], queryFn: async () => { const r = await fetch('/api/events?upcoming=true'); return r.json(); } });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('Event created!'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['events'] }); } else toast.error(d.error); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await fetch(`/api/events?id=${id}`, { method: 'DELETE' }); return r.json(); },
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['events'] }); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />Create Event</Button>
        </div>

        <DataTable
          columns={[
            { key: 'title', header: 'Event', render: (e: any) => <div><p className="font-medium">{e.title}</p><p className="text-xs text-gray-500">{e.description?.substring(0, 60)}</p></div> },
            { key: 'category', header: 'Category', render: (e: any) => <Badge>{e.category}</Badge> },
            { key: 'date', header: 'Date', render: (e: any) => format(new Date(e.start_date), 'MMM d, yyyy h:mm a') },
            { key: 'location', header: 'Location', render: (e: any) => e.location || '-' },
            { key: 'organizer', header: 'Organizer', render: (e: any) => e.organizer?.full_name || '-' },
            { key: 'actions', header: '', render: (e: any) => <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(e.id); }}>Delete</Button> },
          ]}
          data={data?.data || []}
          isLoading={isLoading}
        />

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Event">
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="academic">Academic</option><option value="social">Social</option><option value="sports">Sports</option><option value="career">Career</option><option value="other">Other</option>
              </select></div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              <Input label="End Date" type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="Max Participants" type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
            <label className="flex items-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600 mr-2" checked={form.registration_required} onChange={(e) => setForm({ ...form, registration_required: e.target.checked })} /><span className="text-sm">Registration required</span></label>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate({ ...form, max_participants: form.max_participants ? parseInt(form.max_participants) : null })} isLoading={createMutation.isPending}>Create</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
