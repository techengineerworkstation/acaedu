'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/supabase/session';
import DashboardLayout from '@/components/layout/dashboard-layout';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { typedSupabase } from '@/lib/supabase/client';
import { AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: string;
  course_code: string;
  title: string;
  description: string | null;
  credits: number;
  capacity: number;
  is_active: boolean;
  department: { id: string; name: string; code: string } | null;
  lecturer: { id: string; full_name: string; email: string } | null;
  enrolled_count: number;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Column {
  key: string;
  header: string;
  render?: (item: Course) => React.ReactNode;
}

export default function AdminCoursesPage() {
  const { user } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [lecturerFilter, setLecturerFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    course_code: '',
    title: '',
    description: '',
    credits: 3,
    capacity: 30,
    department_id: '',
    lecturer_id: '',
    is_active: true,
    syllabus_url: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchLecturers();
  }, [page, searchQuery, deptFilter, lecturerFilter]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let url = `/api/admin/courses?limit=${limit}&offset=${(page - 1) * limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (deptFilter) url += `&department_id=${deptFilter}`;
      if (lecturerFilter) url += `&lecturer_id=${lecturerFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      if (result.success) {
        setCourses(result.data);
        setTotalPages(Math.ceil((result.pagination?.total || 0) / limit));
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
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

  const fetchLecturers = async () => {
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/users?role=lecturer&limit=100', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setLecturers(result.data);
    } catch (error) {
      console.error('Failed to fetch lecturers:', error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const payload = {
        course_code: formData.course_code,
        title: formData.title,
        description: formData.description || null,
        credits: parseInt(formData.credits.toString()),
        capacity: parseInt(formData.capacity.toString()),
        department_id: formData.department_id || null,
        lecturer_id: formData.lecturer_id || null,
        is_active: formData.is_active,
        syllabus_url: formData.syllabus_url || null
      };

      const method = editingCourse ? 'PUT' : 'POST';
      const url = editingCourse ? `/api/admin/courses?id=${editingCourse.id}` : '/api/admin/courses';

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
        toast.success(`Course ${editingCourse ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchCourses();
      } else {
        toast.error(result.error || 'Failed to save course');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all materials, schedules, and enrollments associated with it.')) return;

    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`/api/admin/courses?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        toast.error(result.error || 'Failed to delete course');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      title: course.title,
      description: course.description || '',
      credits: course.credits,
      capacity: course.capacity,
      department_id: course.department?.id || '',
      lecturer_id: course.lecturer?.id || '',
      is_active: course.is_active,
      syllabus_url: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      course_code: '',
      title: '',
      description: '',
      credits: 3,
      capacity: 30,
      department_id: '',
      lecturer_id: '',
      is_active: true,
      syllabus_url: ''
    });
  };

  const columns: Column[] = [
    {
      key: 'course_code',
      header: 'Code',
      render: (item) => (
        <span className="font-mono font-semibold text-primary-600">{item.course_code}</span>
      )
    },
    {
      key: 'title',
      header: 'Course Title',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'lecturer',
      header: 'Lecturer',
      render: (item) => item.lecturer?.full_name || 'Unassigned'
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => item.department?.name || 'Unassigned'
    },
    {
      key: 'credits',
      header: 'Credits',
      render: (item) => `${item.credits} credit${item.credits !== 1 ? 's' : ''}`
    },
    {
      key: 'enrolled_count',
      header: 'Enrolled',
      render: (item) => (
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span>{item.enrolled_count}</span>
          <span className="text-gray-400">/{item.capacity}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
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
            title="Edit course"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteCourse(item.id); }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete course"
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
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">Create and manage academic courses</p>
          </div>
          <Button onClick={openCreateModal} leftIcon={<PlusIcon className="h-4 w-4" />}>
            Add Course
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or title..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

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

            {/* Lecturer Filter */}
            <select
              value={lecturerFilter}
              onChange={(e) => { setLecturerFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Lecturers</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>{lecturer.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Table */}
        <DataTable
          columns={columns}
          data={courses}
          isLoading={isLoading}
          emptyMessage="No courses found. Create your first course to get started."
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
              title={editingCourse ? 'Edit Course' : 'Create New Course'}
              size="xl"
            >
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.course_code}
                      onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      placeholder="CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Introduction to Computer Science"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      placeholder="Detailed course description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray--300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                    <select
                      value={formData.lecturer_id}
                      onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Lecturer (Optional)</option>
                      {lecturers.map((lecturer) => (
                        <option key={lecturer.id} value={lecturer.id}>{lecturer.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus URL</label>
                    <input
                      type="url"
                      value={formData.syllabus_url}
                      onChange={(e) => setFormData({ ...formData, syllabus_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
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
                    {editingCourse ? 'Update Course' : 'Create Course'}
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