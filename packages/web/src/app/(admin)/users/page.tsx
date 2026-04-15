'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/supabase/session';
import DashboardLayout from '@/components/layout/dashboard-layout';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import SkeletonCard from '@/components/ui/skeleton-card';
import { toast } from 'react-hot-toast';
import { typedSupabase } from '@/lib/supabase/client';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin' | 'dean';
  department: { id: string; name: string; code: string } | null;
  student_id: string | null;
  employee_id: string | null;
  phone: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Column {
  key: string;
  header: string;
  render?: (item: User) => React.ReactNode;
}

export default function AdminUsersPage() {
  const { user } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'student' as User['role'],
    department: '',
    student_id: '',
    employee_id: '',
    phone: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [page, searchQuery, roleFilter, deptFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/admin/users?limit=${limit}&offset=${(page - 1) * limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (deptFilter) url += `&department=${deptFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setTotalPages(Math.ceil((result.pagination?.total || 0) / limit));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setDepartments(result.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) throw new Error('No session');

      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        department: formData.department || null,
        student_id: formData.student_id || null,
        employee_id: formData.employee_id || null,
        phone: formData.phone || null,
        is_active: formData.is_active
      };

      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/admin/users?id=${editingUser.id}` : '/api/admin/users';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`User ${editingUser ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to save user');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their enrollments and related data.')) return;

    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department?.id || '',
      student_id: user.student_id || '',
      employee_id: user.employee_id || '',
      phone: user.phone || '',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      role: 'student',
      department: '',
      student_id: '',
      employee_id: '',
      phone: '',
      is_active: true
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'lecturer': return 'bg-blue-100 text-blue-800';
      case 'dean': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column[] = [
    {
      key: 'full_name',
      header: 'User',
      render: (item) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {item.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.full_name}</p>
            <p className="text-sm text-gray-500">{item.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(item.role)}`}>
          {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
        </span>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => item.department?.name || '-'
    },
    {
      key: 'student_id',
      header: 'Student ID',
      render: (item) => item.student_id || item.employee_id || '-'
    },
    {
      key: 'email_verified',
      header: 'Verified',
      render: (item) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${item.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {item.email_verified ? 'Yes' : 'Pending'}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (item) => (
        item.is_active ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Inactive
          </span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
            title="Edit user"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteUser(item.id); }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete user"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage students, lecturers, and staff accounts</p>
          </div>
          <Button onClick={openCreateModal} leftIcon={<PlusIcon className="h-4 w-4" />}>
            Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
              <option value="dean">Dean</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found. Create your first user to get started."
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <Modal
              isOpen={showModal}
              onClose={() => { setShowModal(false); resetForm(); }}
              title={editingUser ? 'Edit User' : 'Create New User'}
              size="lg"
            >
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                      <option value="dean">Dean</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  {(formData.role === 'student') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                      <input
                        type="text"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="STD001"
                      />
                    </div>
                  )}
                  {(formData.role === 'lecturer' || formData.role === 'admin') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                      <input
                        type="text"
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="EMP001"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600"
                      />
                      <span className="ml-2 text-sm">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}