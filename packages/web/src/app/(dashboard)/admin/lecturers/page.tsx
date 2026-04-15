'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { AcademicCapIcon, PlusIcon, PencilIcon, TrashIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, ScrollReveal } from '@/components/ui';

export default function AdminLecturersPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: lecturersData, isLoading } = useQuery({
    queryKey: ['admin', 'lecturers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users?role=lecturer');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Lecturer removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lecturers'] });
    },
    onError: () => toast.error('Failed to remove lecturer')
  });

  const lecturers = lecturersData?.data || [];
  const filteredLecturers = lecturers.filter((l: any) =>
    l.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <FadeIn direction="down">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lecturers</h1>
              <p className="text-gray-600 mt-1">Manage lecturer accounts and profiles</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} leftIcon={<PlusIcon className="h-4 w-4" />}>
              Add Lecturer
            </Button>
          </div>
        </FadeIn>

        <ScrollReveal>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search lecturers by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredLecturers.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No lecturers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecturer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLecturers.map((lecturer: any, i: number) => (
                      <FadeIn key={lecturer.id} delay={i * 0.05}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                {lecturer.avatar_url ? (
                                  <img src={lecturer.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                                ) : (
                                  <span className="text-sm font-medium text-purple-700">
                                    {lecturer.full_name?.charAt(0) || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{lecturer.full_name}</p>
                                <p className="text-sm text-gray-500">{lecturer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {lecturer.employee_id || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {lecturer.department || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 space-y-1">
                              {lecturer.phone && (
                                <div className="flex items-center">
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  {lecturer.phone}
                                </div>
                              )}
                              <div className="flex items-center">
                                <EnvelopeIcon className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[150px]">{lecturer.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={lecturer.is_active ? 'success' : 'warning'}>
                              {lecturer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLecturer(lecturer)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this lecturer?')) {
                                    deleteMutation.mutate(lecturer.id);
                                  }
                                }}
                              >
                                <TrashIcon className="h-4 w-4 text-error-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </FadeIn>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollReveal>

        <AddLecturerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />

        <EditLecturerModal
          lecturer={editingLecturer}
          isOpen={!!editingLecturer}
          onClose={() => setEditingLecturer(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function AddLecturerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    employee_id: '',
    department: '',
    phone: ''
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'lecturer' })
      });
      return res.json();
    },
    onSuccess: (data: { success: boolean; error?: string }) => {
      if (data.success) {
        toast.success('Lecturer account created!');
        queryClient.invalidateQueries({ queryKey: ['admin', 'lecturers'] });
        onClose();
        setForm({ email: '', full_name: '', employee_id: '', department: '', phone: '' });
      } else {
        toast.error(data.error || 'Failed to create lecturer');
      }
    },
    onError: () => toast.error('Failed to create lecturer')
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lecturer" size="md">
      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
        <Input
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
          placeholder="Dr. John Smith"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          placeholder="john.smith@university.edu"
        />
        <Input
          label="Employee ID"
          value={form.employee_id}
          onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          placeholder="EMP-001"
        />
        <Input
          label="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Computer Science"
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+234 801 234 5678"
        />
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Lecturer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditLecturerModal({ lecturer, isOpen, onClose }: { lecturer: any; isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: '',
    employee_id: '',
    department: '',
    phone: ''
  });

  React.useEffect(() => {
    if (lecturer) {
      setForm({
        full_name: lecturer.full_name || '',
        employee_id: lecturer.employee_id || '',
        department: lecturer.department || '',
        phone: lecturer.phone || ''
      });
    }
  }, [lecturer]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(`/api/admin/users?id=${lecturer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Lecturer updated!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'lecturers'] });
      onClose();
    },
    onError: () => toast.error('Failed to update lecturer')
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Lecturer" size="md">
      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="space-y-4">
        <Input
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <Input
          label="Employee ID"
          value={form.employee_id}
          onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
        />
        <Input
          label="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
