'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import { toast } from 'react-hot-toast';

function LecturerAttendanceContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: courses } = useQuery({
    queryKey: ['courses', 'lecturer'],
    queryFn: async () => { const res = await fetch('/api/courses'); return res.json(); }
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', selectedCourse, selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?course_id=${selectedCourse}&date=${selectedDate}`);
      return res.json();
    },
    enabled: !!selectedCourse
  });

  const { data: enrolledStudents } = useQuery({
    queryKey: ['users', 'enrolled', selectedCourse],
    queryFn: async () => {
      const res = await fetch(`/api/users?course_id=${selectedCourse}`);
      return res.json();
    },
    enabled: !!selectedCourse
  });

  const recordMutation = useMutation({
    mutationFn: async (records: any[]) => {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) { toast.success(`Attendance recorded for ${data.count} students`); queryClient.invalidateQueries({ queryKey: ['attendance'] }); }
      else toast.error(data.error);
    }
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});

  const handleMarkAll = (status: string) => {
    const newMap: Record<string, string> = {};
    (enrolledStudents?.data || []).forEach((s: any) => { newMap[s.id] = status; });
    setAttendanceMap(newMap);
  };

  const handleSubmit = () => {
    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student_id: studentId,
      course_id: selectedCourse,
      schedule_id: null, // Would come from selected schedule
      status
    }));
    recordMutation.mutate(records);
  };

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[250px]"
              value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">Select a course</option>
              {courses?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {selectedCourse && (
          <>
            <div className="flex items-center space-x-3">
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('present')}>Mark All Present</Button>
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('absent')}>Mark All Absent</Button>
              <div className="flex-1" />
              <Button onClick={handleSubmit} isLoading={recordMutation.isPending} disabled={Object.keys(attendanceMap).length === 0}>
                Save Attendance
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matric No.</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Excused</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(enrolledStudents?.data || []).map((student: any) => {
                    const existing = attendance?.data?.find((a: any) => a.student_id === student.id);
                    const currentStatus = attendanceMap[student.id] || existing?.status || '';
                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                              {student.full_name?.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{student.matriculation_number || student.student_id || '-'}</td>
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <td key={status} className="px-6 py-4 text-center">
                            <input type="radio" name={`attendance-${student.id}`}
                              checked={currentStatus === status}
                              onChange={() => setAttendanceMap({ ...attendanceMap, [student.id]: status })}
                              className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function LecturerAttendancePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <LecturerAttendanceContent />
    </Suspense>
  );
}


