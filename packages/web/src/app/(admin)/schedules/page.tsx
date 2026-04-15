'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from '@/lib/supabase/session';
import DashboardLayout from '@/components/layout/dashboard-layout';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { typedSupabase } from '@/lib/supabase/client';
import { AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  schedule_type: 'lecture' | 'tutorial' | 'lab' | 'exam' | 'assignment';
  start_time: string;
  end_time: string;
  location: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurring_end_date: string | null;
  course: { id: string; course_code: string; title: string } | null;
  lecturer: { id: string; full_name: string } | null;
  created_at: string;
}

interface Course {
  id: string;
  course_code: string;
  title: string;
}

interface Lecturer {
  id: string;
  full_name: string;
}

interface Column {
  key: string;
  header: string;
  render?: (item: Schedule) => React.ReactNode;
}

const SCHEDULE_TYPES = [
  { value: 'lecture', label: 'Lecture', color: 'bg-blue-100 text-blue-800' },
  { value: 'tutorial', label: 'Tutorial', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'lab', label: 'Lab', color: 'bg-purple-100 text-purple-800' },
  { value: 'exam', label: 'Exam', color: 'bg-red-100 text-red-800' },
  { value: 'assignment', label: 'Assignment', color: 'bg-amber-100 text-amber-800' }
];

export default function AdminSchedulesPage() {
  const { user } = useSession();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule_type: 'lecture' as Schedule['schedule_type'],
    start_time: '',
    end_time: '',
    location: '',
    course_id: '',
    lecturer_id: '',
    is_recurring: false,
    recurrence_rule: 'weekly',
    recurring_end_date: ''
  });

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
    fetchLecturers();
  }, [page, selectedDate, viewMode]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/schedules?limit=100', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();

      if (result.success) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/courses?limit=100', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) setCourses(result.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const payload = {
        title: formData.title,
        description: formData.description || null,
        schedule_type: formData.schedule_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || null,
        course_id: formData.course_id || null,
        lecturer_id: formData.lecturer_id || null,
        is_recurring: formData.is_recurring,
        recurrence_rule: formData.is_recurring ? `FREQ=WEEKLY;INTERVAL=1` : null,
        recurring_end_date: formData.is_recurring ? formData.recurring_end_date || null : null,
        attachments: [],
        venue_id: null
      };

      const method = editingSchedule ? 'PUT' : 'POST';
      const url = editingSchedule ? `/api/schedules?id=${editingSchedule.id}` : '/api/schedules';

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
        toast.success(`Schedule ${editingSchedule ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchSchedules();
      } else {
        toast.error(result.error || 'Failed to save schedule');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const supabase = typedSupabase;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`/api/schedules?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Schedule deleted successfully');
        fetchSchedules();
      } else {
        toast.error(result.error || 'Failed to delete schedule');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    const startDateTime = new Date(schedule.start_time);
    const endDateTime = new Date(schedule.end_time);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      schedule_type: schedule.schedule_type,
      start_time: startDateTime.toISOString().slice(0, 16),
      end_time: endDateTime.toISOString().slice(0, 16),
      location: schedule.location || '',
      course_id: schedule.course?.id || '',
      lecturer_id: schedule.lecturer?.id || '',
      is_recurring: schedule.is_recurring,
      recurrence_rule: 'weekly',
      recurring_end_date: schedule.recurring_end_date || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      schedule_type: 'lecture',
      start_time: '',
      end_time: '',
      location: '',
      course_id: '',
      lecturer_id: '',
      is_recurring: false,
      recurrence_rule: 'weekly',
      recurring_end_date: ''
    });
  };

  const getTypeColor = (type: string) => {
    const found = SCHEDULE_TYPES.find(t => t.value === type);
    return found ? found.color : 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const found = SCHEDULE_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  // Calendar view helpers
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const getScheduleForDay = (day: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return isSameDay(scheduleDate, day);
    });
  };

  const columns: Column[] = [
    {
      key: 'title',
      header: 'Event',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          {item.course && (
            <p className="text-sm text-primary-600">{item.course.course_code}</p>
          )}
        </div>
      )
    },
    {
      key: 'schedule_type',
      header: 'Type',
      render: (item) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.schedule_type)}`}>
          {getTypeLabel(item.schedule_type)}
        </span>
      )
    },
    {
      key: 'start_time',
      header: 'Date & Time',
      render: (item) => (
        <div className="text-sm">
          <p>{format(parseISO(item.start_time), 'MMM d, yyyy')}</p>
          <p className="text-gray-500">
            {format(parseISO(item.start_time), 'h:mm a')} - {format(parseISO(item.end_time), 'h:mm a')}
          </p>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => item.location || '-'
    },
    {
      key: 'lecturer',
      header: 'Lecturer',
      render: (item) => item.lecturer?.full_name || 'Unassigned'
    },
    {
      key: 'is_recurring',
      header: 'Recurring',
      render: (item) => item.is_recurring ? (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Weekly
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
          One-time
        </span>
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
            title="Edit schedule"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(item.id); }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete schedule"
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
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600 mt-1">Create and manage class schedules, events, and exams</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${viewMode === 'table' ? 'bg-white shadow text-primary-600' : 'text-gray-600'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${viewMode === 'calendar' ? 'bg-white shadow text-primary-600' : 'text-gray-600'}`}
              >
                Calendar
              </button>
            </div>
            <Button onClick={openCreateModal} leftIcon={<PlusIcon className="h-4 w-4" />}>
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDate(d => addDays(d, -7))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  Previous Week
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1 text-sm bg-gray-100 rounded"
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedDate(d => addDays(d, 7))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  Next Week
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {weekDays.map(day => (
                <div key={day.toISOString()} className="text-center text-sm font-medium text-gray-500 py-2">
                  {format(day, 'EEE')}
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
              ))}

              {/* Day cells with events */}
              {weekDays.map(day => {
                const daySchedules = getScheduleForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] border rounded p-2 ${isSameDay(day, new Date()) ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200'}`}
                  >
                    <div className="space-y-1">
                      {daySchedules.map(schedule => (
                        <div
                          key={schedule.id}
                          onClick={() => openEditModal(schedule)}
                          className="text-xs p-1 rounded cursor-pointer hover:shadow-md transition-shadow"
                          style={{
                            backgroundColor: schedule.schedule_type === 'lecture' ? '#dbeafe' :
                                            schedule.schedule_type === 'exam' ? '#fee2e2' :
                                            schedule.schedule_type === 'lab' ? '#e9d5ff' : '#fef3c7'
                          }}
                        >
                          <p className="font-medium truncate">{schedule.title}</p>
                          <p className="text-gray-500">
                            {format(parseISO(schedule.start_time), 'h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table View */}
        <DataTable
          columns={columns}
          data={schedules}
          isLoading={isLoading}
          emptyMessage="No schedules found. Create your first class schedule to get started."
        />

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <Modal
              isOpen={showModal}
              onClose={() => { setShowModal(false); resetForm(); }}
              title={editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              size="lg"
            >
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="CS101 - Lecture"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.schedule_type}
                      onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as Schedule['schedule_type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {SCHEDULE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">No Course (General Event)</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.course_code} - {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Room A101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                    <select
                      value={formData.lecturer_id}
                      onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Lecturer (Optional)</option>
                      {lecturers.map(lecturer => (
                        <option key={lecturer.id} value={lecturer.id}>{lecturer.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600"
                      />
                      <span className="ml-2 text-sm">Recurring (Weekly)</span>
                    </label>
                  </div>
                  {formData.is_recurring && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recurring End Date (Optional)</label>
                      <input
                        type="date"
                        value={formData.recurring_end_date}
                        onChange={(e) => setFormData({ ...formData, recurring_end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
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