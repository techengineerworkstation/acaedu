'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function AdminCensusPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['census', roleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' });
      if (roleFilter) params.set('role', roleFilter);
      const r = await fetch(`/api/admin/census?${params}`);
      return r.json();
    }
  });

  const totals = data?.data?.totals || {};
  const users = data?.data?.users || [];
  const summary = data?.data?.summary || [];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Population Census</h1>
          <p className="text-gray-600 mt-1">Active students and lecturers database</p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Students', value: totals.students || 0, color: 'bg-blue-50 text-blue-700' },
            { label: 'Lecturers', value: totals.lecturers || 0, color: 'bg-green-50 text-green-700' },
            { label: 'Admins', value: totals.admins || 0, color: 'bg-purple-50 text-purple-700' },
            { label: 'Total', value: totals.total || 0, color: 'bg-gray-50 text-gray-700' }
          ].map((t, i) => (
            <div key={i} className={`p-5 rounded-xl ${t.color}`}>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-3xl font-bold mt-1">{t.value}</p>
            </div>
          ))}
        </div>

        {/* Department Summary */}
        {summary.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Department</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Male</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Female</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {summary.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.department_name || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.faculty_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{s.total_count}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{s.male_count}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{s.female_count}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{s.active_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers</option>
          </select>
        </div>

        {/* Detailed User List */}
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matric No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700 mr-2">{u.full_name?.charAt(0)}</div>
                        <div><p className="text-sm font-medium text-gray-900">{u.full_name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={u.role === 'lecturer' ? 'info' : 'success'}>{u.role}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.department_info?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.faculty_info?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{u.gender || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.matriculation_number || u.student_id || '-'}</td>
                    <td className="px-4 py-3"><Badge variant={u.is_active !== false ? 'success' : 'error'}>{u.is_active !== false ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Student Profile Modal */}
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Student Profile" size="lg">
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-700">
                  {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} alt="" className="h-16 w-16 rounded-full" /> : selectedUser.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <Badge variant={selectedUser.role === 'lecturer' ? 'info' : 'success'}>{selectedUser.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-gray-500">Matriculation No.</span><p className="font-medium">{selectedUser.matriculation_number || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Student ID</span><p className="font-medium">{selectedUser.student_id || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Department</span><p className="font-medium">{selectedUser.department_info?.name || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Faculty</span><p className="font-medium">{selectedUser.faculty_info?.name || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Gender</span><p className="font-medium capitalize">{selectedUser.gender || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Level</span><p className="font-medium">{selectedUser.level || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Phone</span><p className="font-medium">{selectedUser.phone || '-'}</p></div>
                <div><span className="text-sm text-gray-500">Status</span><Badge variant={selectedUser.is_active !== false ? 'success' : 'error'}>{selectedUser.is_active !== false ? 'Active' : 'Inactive'}</Badge></div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
