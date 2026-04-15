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

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', full_name: '', role: 'student', student_id: '', employee_id: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '25' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const r = await fetch(`/api/users?${params}`);
      return r.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('User updated'); setSelectedUser(null); queryClient.invalidateQueries({ queryKey: ['users'] }); } else toast.error(d.error); }
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => { const r = await fetch(`/api/users?id=${id}`, { method: 'DELETE' }); return r.json(); },
    onSuccess: () => { toast.success('User deactivated'); queryClient.invalidateQueries({ queryKey: ['users'] }); }
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const r = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); },
    onSuccess: (d: any) => { if (d.success) { toast.success('User created'); setShowCreateModal(false); setCreateForm({ email: '', password: '', full_name: '', role: 'student', student_id: '', employee_id: '' }); queryClient.invalidateQueries({ queryKey: ['users'] }); } else toast.error(d.error); }
  });

  const roleVariant = (role: string) => {
    if (role === 'admin') return 'error' as const;
    if (role === 'lecturer') return 'info' as const;
    if (role === 'dean') return 'warning' as const;
    return 'success' as const;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <Button onClick={() => setShowCreateModal(true)}>Create User</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Input placeholder="Search by name, email, or matric number..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[250px]" />
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers</option>
            <option value="admin">Admins</option>
            <option value="dean">Deans</option>
          </select>
        </div>

        <DataTable
          columns={[
            { key: 'name', header: 'Name', render: (u: any) => (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700 mr-3">{u.full_name?.charAt(0)}</div>
                <div><p className="font-medium text-gray-900">{u.full_name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
              </div>
            )},
            { key: 'role', header: 'Role', render: (u: any) => <Badge variant={roleVariant(u.role)}>{u.role}</Badge> },
            { key: 'department', header: 'Department', render: (u: any) => u.department_info?.name || '-' },
            { key: 'matric', header: 'Matric No.', render: (u: any) => u.matriculation_number || u.student_id || u.employee_id || '-' },
            { key: 'gender', header: 'Gender', render: (u: any) => u.gender ? <span className="capitalize">{u.gender}</span> : '-' },
            { key: 'status', header: 'Status', render: (u: any) => <Badge variant={u.is_active !== false ? 'success' : 'error'}>{u.is_active !== false ? 'Active' : 'Inactive'}</Badge> },
            { key: 'actions', header: '', render: (u: any) => (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => { if (confirm('Deactivate this user?')) deactivateMutation.mutate(u.id); }}>Deactivate</Button>
              </div>
            )}
          ]}
          data={data?.data || []}
          isLoading={isLoading}
          emptyMessage="No users found"
        />

        {data?.pagination && data.pagination.total_pages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {data.pagination.total_pages}</span>
            <Button size="sm" variant="outline" disabled={page >= data.pagination.total_pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}

        {/* Edit User Modal */}
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Edit: ${selectedUser?.full_name}`}>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">Full Name</label><p className="font-medium">{selectedUser.full_name}</p></div>
                <div><label className="text-sm text-gray-500">Email</label><p className="font-medium">{selectedUser.email}</p></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="dean">Dean</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
                <Button onClick={() => updateMutation.mutate({ id: selectedUser.id, role: selectedUser.role })} isLoading={updateMutation.isPending}>Save</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create User Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="dean">Dean</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={createForm.student_id}
                  onChange={(e) => setCreateForm({ ...createForm, student_id: e.target.value })}
                  placeholder="STD001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={createForm.employee_id}
                  onChange={(e) => setCreateForm({ ...createForm, employee_id: e.target.value })}
                  placeholder="EMP001"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(createForm)} isLoading={createMutation.isPending}>Create User</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
