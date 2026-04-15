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
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'emergency' | 'billing' | 'maintenance';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_roles: string[]; // array of user_role
  target_courses: string[] | null;
  author: { id: string; full_name: string } | null;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  author_id: string;
  created_at: string;
}

interface Column {
  key: string;
  header: string;
  render?: (item: Announcement) => React.ReactNode;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: 'bg-blue-100', text: 'text-blue-800' },
  academic: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  event: { bg: 'bg-purple-100', text: 'text-purple-800' },
  emergency: { bg: 'bg-red-100', text: 'text-red-800' },
  billing: { bg: 'bg-amber-100', text: 'text-amber-800' },
  maintenance: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-600' },
  normal: { bg: 'bg-blue-50', text: 'text-blue-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  urgent: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function AdminAnnouncementsPage() {
  const { user } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Announcement['category'],
    priority: 'normal' as Announcement['priority'],
    target_roles: ['student', 'lecturer', 'admin'] as string[],
    target_courses: [] as string[],
    is_published: false,
    expires_at: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [page, searchQuery]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) return;

      let url = `/api/announcements?limit=${limit}&offset=${(page - 1) * limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      if (result.success) {
        setAnnouncements(result.data);
        setTotalPages(Math.ceil((result.pagination?.total || 0) / limit));
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) throw new Error('No session');

      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        target_roles: formData.target_roles,
        target_courses: formData.target_courses.length > 0 ? formData.target_courses : null,
        author_id: user?.id,
        is_published: formData.is_published,
        expires_at: formData.expires_at || null
      };

      const method = editingAnnouncement ? 'PUT' : 'POST';
      const url = editingAnnouncement ? `/api/announcements?id=${editingAnnouncement.id}` : '/api/announcements';

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
        toast.success(`Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchAnnouncements();
      } else {
        toast.error(result.error || 'Failed to save announcement');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        toast.error(result.error || 'Failed to delete announcement');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      target_roles: announcement.target_roles,
      target_courses: announcement.target_courses || [],
      is_published: announcement.is_published,
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'normal',
      target_roles: ['student', 'lecturer', 'admin'],
      target_courses: [],
      is_published: false,
      expires_at: ''
    });
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const columns: Column[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${item.priority === 'urgent' ? 'bg-red-100' : item.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'}`}>
            <MegaphoneIcon className={`h-5 w-5 ${item.priority === 'urgent' ? 'text-red-600' : item.priority === 'high' ? 'text-orange-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{item.content}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${CATEGORY_COLORS[item.category]?.bg || 'bg-gray-100'} ${CATEGORY_COLORS[item.category]?.text || 'text-gray-800'}`}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit mt-1 ${PRIORITY_COLORS[item.priority]?.bg || 'bg-gray-100'} ${PRIORITY_COLORS[item.priority]?.text || 'text-gray-800'}`}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'target_roles',
      header: 'Target',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.target_roles.slice(0, 3).map(role => (
            <span key={role} className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
          {item.target_roles.length > 3 && (
            <span className="text-xs text-gray-500">+{item.target_roles.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      key: 'is_published',
      header: 'Status',
      render: (item) => (
        item.is_published ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Published
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Draft
          </span>
        )
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {format(new Date(item.created_at), 'MMM d, yyyy')}
          {item.expires_at && (
            <div className="text-xs text-orange-600 mt-1">Expires: {format(new Date(item.expires_at), 'MMM d, yyyy')}</div>
          )}
        </div>
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
            title="Edit announcement"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(item.id); }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete announcement"
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
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">Create and manage system announcements and alerts</p>
          </div>
          <Button onClick={openCreateModal} leftIcon={<PlusIcon className="h-4 w-4" />}>
            New Announcement
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements by title or content..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Announcements Table */}
        <DataTable
          columns={columns}
          data={announcements}
          isLoading={isLoading}
          emptyMessage="No announcements found. Create your first announcement to get started."
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
              title={editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              size="xl"
            >
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Announcement title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={6}
                      placeholder="Write your announcement content..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Announcement['category'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="general">General</option>
                        <option value="academic">Academic</option>
                        <option value="event">Event</option>
                        <option value="emergency">Emergency</option>
                        <option value="billing">Billing</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Announcement['priority'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {['student', 'lecturer', 'admin', 'dean'].map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            formData.target_roles.includes(role)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                      <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
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