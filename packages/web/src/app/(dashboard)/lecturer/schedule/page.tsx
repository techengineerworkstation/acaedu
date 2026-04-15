'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function LecturerSchedulePage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [showCancel, setShowCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: courses } = useQuery({
    queryKey: ['courses', 'lecturer'],
    queryFn: async () => { const res = await fetch('/api/courses'); return res.json(); }
  });

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(`/api/schedules?start_date=${weekStart.toISOString()}&end_date=${addDays(weekStart, 7).toISOString()}`);
      return res.json();
    }
  });

  const [form, setForm] = useState({
    course_id: '', title: '', schedule_type: 'lecture', start_time: '', end_time: '',
    location: '', is_recurring: false, recurrence_rule: ''
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) { toast.success('Schedule created!'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['schedules'] }); }
      else toast.error(data.error);
    }
  });

  // Cancel a class - notifies students
  const cancelMutation = useMutation({
    mutationFn: async ({ scheduleId, reason }: { scheduleId: string; reason: string }) => {
      // Create a notification for cancellation
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'schedule_change',
          title: 'Class Cancelled',
          message: `Class has been cancelled. Reason: ${reason}`,
          data: { schedule_id: scheduleId }
        })
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Class cancelled and students notified');
      setShowCancel(null);
      setCancelReason('');
    }
  });

  const schedules = schedulesData?.data || [];
  const getSchedulesForDay = (day: Date) => schedules.filter((s: any) => isSameDay(new Date(s.start_time), day));

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronLeftIcon className="h-5 w-5" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg">Today</button>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronRightIcon className="h-5 w-5" /></button>
            <Button onClick={() => setShowCreate(true)}><PlusIcon className="h-4 w-4 mr-2" />Add Class</Button>
          </div>
        </div>

        {/* Week Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map(day => (
              <div key={day.toISOString()} className={`py-3 text-center border-r last:border-r-0 ${isToday(day) ? 'bg-primary-50' : ''}`}>
                <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                <p className={`text-lg font-semibold ${isToday(day) ? 'text-primary-600' : 'text-gray-900'}`}>{format(day, 'd')}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map(day => {
              const daySchedules = getSchedulesForDay(day);
              return (
                <div key={day.toISOString()} className={`p-2 border-r last:border-r-0 ${isToday(day) ? 'bg-primary-50/30' : ''}`}>
                  {daySchedules.map((s: any) => (
                    <div key={s.id} className="p-2 mb-2 rounded-lg bg-blue-50 border border-blue-200 group relative">
                      <p className="text-xs font-semibold text-blue-700">{s.course?.course_code}</p>
                      <p className="text-xs text-blue-600">{format(new Date(s.start_time), 'h:mm a')}</p>
                      {s.location && <p className="text-xs text-blue-500">{s.location}</p>}
                      <button onClick={() => setShowCancel(s)} className="absolute top-1 right-1 hidden group-hover:block text-red-400 hover:text-red-600">
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Schedule Modal */}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule a Class">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select course</option>
                {courses?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>)}
              </select>
            </div>
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.schedule_type} onChange={(e) => setForm({ ...form, schedule_type: e.target.value })}>
                  <option value="lecture">Lecture</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="lab">Lab</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Time" type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              <Input label="End Time" type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 mr-2" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} />
              <span className="text-sm">Recurring schedule</span>
            </label>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(form)} isLoading={createMutation.isPending}>Create</Button>
            </div>
          </div>
        </Modal>

        {/* Cancel Class Modal */}
        <Modal isOpen={!!showCancel} onClose={() => setShowCancel(null)} title="Cancel Class">
          <div className="space-y-4">
            <p className="text-gray-600">Are you sure you want to cancel <strong>{showCancel?.title}</strong>? Students will be notified.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for cancellation</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Please provide a reason..." />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowCancel(null)}>Keep Class</Button>
              <Button variant="danger" onClick={() => cancelMutation.mutate({ scheduleId: showCancel?.id, reason: cancelReason })} isLoading={cancelMutation.isPending}>
                Cancel Class & Notify
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
