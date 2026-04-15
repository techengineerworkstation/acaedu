'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import DataTable from '@/components/ui/data-table';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AdminVenuesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', building: '', floor: '', room_number: '', capacity: '30', directions: '' });

  const { data, isLoading } = useQuery({ queryKey: ['venues'], queryFn: async () => { const r = await fetch('/api/venues'); return r.json(); } });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/venues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('Venue created!'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['venues'] }); } else toast.error(d.error); }
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
          <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />Add Venue</Button>
        </div>

        <DataTable
          columns={[
            { key: 'name', header: 'Name', render: (v: any) => <span className="font-medium">{v.name}</span> },
            { key: 'building', header: 'Building', render: (v: any) => v.building || '-' },
            { key: 'floor', header: 'Floor', render: (v: any) => v.floor || '-' },
            { key: 'room', header: 'Room', render: (v: any) => v.room_number || '-' },
            { key: 'capacity', header: 'Capacity', render: (v: any) => v.capacity },
            { key: 'facilities', header: 'Facilities', render: (v: any) => (v.facilities || []).join(', ') || '-' },
          ]}
          data={data?.data || []}
          isLoading={isLoading}
        />

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Venue">
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lecture Hall A" />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
              <Input label="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              <Input label="Room Number" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} />
            </div>
            <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Directions</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.directions} onChange={(e) => setForm({ ...form, directions: e.target.value })} /></div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate({ ...form, capacity: parseInt(form.capacity) })} isLoading={createMutation.isPending}>Add Venue</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
