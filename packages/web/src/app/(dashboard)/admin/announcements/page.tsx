'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { typedSupabase as supabase } from '@/lib/supabase/client';

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
  { value: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-700' },
  { value: 'event', label: 'Event', color: 'bg-purple-100 text-purple-700' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700' },
  { value: 'billing', label: 'Billing', color: 'bg-amber-100 text-amber-700' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-700' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-600' },
];

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', 
    content: '', 
    category: 'general', 
    priority: 'normal',
    target_roles: ['student'], 
    target_courses: [] as string[],
    send_email: false
  });

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('id, title, course_code').eq('is_active', true);
      if (data) setCourses(data);
    };
    fetchCourses();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['announcements', 'admin'],
    queryFn: async () => { const r = await fetch('/api/announcements?limit=50'); return r.json(); }
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { 
      const r = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); 
      return r.json(); 
    },
    onSuccess: (d: any) => {
      if (d.success) { 
        toast.success('Announcement broadcast!'); 
        setShowCreate(false); 
        setForm({ title: '', content: '', category: 'general', priority: 'normal', target_roles: ['student'], target_courses: [], send_email: false });
        queryClient.invalidateQueries({ queryKey: ['announcements'] }); 
      }
      else toast.error(d.error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const r = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' }); return r.json(); },
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['announcements'] }); }
  });

  const toggleCourse = (courseId: string) => {
    setForm(prev => ({
      ...prev,
      target_courses: prev.target_courses.includes(courseId)
        ? prev.target_courses.filter(id => id !== courseId)
        : [...prev.target_courses, courseId]
    }));
  };

  const getCategoryStyle = (cat: string) => CATEGORIES.find(c => c.value === cat)?.color || 'bg-gray-100 text-gray-700';
  const getPriorityStyle = (pri: string) => PRIORITIES.find(p => p.value === pri)?.color || 'bg-gray-100 text-gray-600';

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Broadcast messages to students and staff</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />New Announcement
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {(data?.data || []).map((a: any, index: number) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryStyle(a.category)}`}>
                          {a.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityStyle(a.priority)}`}>
                          {a.priority}
                        </span>
                        {a.target_roles?.map((r: string) => (
                          <span key={r} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                            {r}s
                          </span>
                        ))}
                        {a.target_courses && a.target_courses.length > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center">
                            <BookOpenIcon className="h-3 w-3 mr-1" />
                            {a.target_courses.length} course(s)
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{a.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{a.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{a.author?.full_name || 'System'}</span>
                        <span>•</span>
                        <span>{format(new Date(a.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { if (confirm('Delete this announcement?')) deleteMutation.mutate(a.id); }} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Announcement" size="lg">
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-5">
            <Input 
              label="Title" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              placeholder="Enter announcement title"
              required 
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
              <textarea 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white" 
                rows={4} 
                value={form.content} 
                onChange={(e) => setForm({ ...form, content: e.target.value })} 
                placeholder="Write your announcement..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                <select 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.priority} 
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITIES.map(pri => (
                    <option key={pri.value} value={pri.value}>{pri.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['student', 'lecturer', 'admin'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        target_roles: prev.target_roles.includes(role)
                          ? prev.target_roles.filter(r => r !== role)
                          : [...prev.target_roles, role]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      form.target_roles.includes(role)
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {role}s
                  </button>
                ))}
              </div>
            </div>

            {form.target_roles.includes('student') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 mr-1.5" />
                    Target Specific Courses (Optional)
                  </div>
                </label>
                <p className="text-xs text-gray-500 mb-3">Leave empty to send to all students, or select specific courses</p>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-sm text-gray-500">No active courses available</p>
                  ) : (
                    courses.map(course => (
                      <label key={course.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary-600 mr-3"
                          checked={form.target_courses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{course.course_code}</p>
                          <p className="text-xs text-gray-500">{course.title}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {form.target_courses.length > 0 && (
                  <p className="text-xs text-primary-600 mt-2">
                    Selected: {form.target_courses.length} course(s)
                  </p>
                )}
              </div>
            )}

            <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 mr-3" 
                checked={form.send_email} 
                onChange={(e) => setForm({ ...form, send_email: e.target.checked })} 
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Send email notification</span>
            </label>

            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Broadcast</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
