'use client';

import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import DataTable from '@/components/ui/data-table';
import { toast } from 'react-hot-toast';

function LecturerGradesContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    student_id: '', assignment_id: '', exam_id: '', points_earned: '', percentage: '', grade_letter: '', feedback: ''
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => { const res = await fetch('/api/courses'); return res.json(); }
  });

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades', selectedCourse],
    queryFn: async () => {
      const url = selectedCourse ? `/api/grades?course_id=${selectedCourse}` : '/api/grades';
      const res = await fetch(url);
      return res.json();
    }
  });

  const { data: students } = useQuery({
    queryKey: ['users', 'enrolled', selectedCourse],
    queryFn: async () => { const res = await fetch(`/api/users?course_id=${selectedCourse}`); return res.json(); },
    enabled: !!selectedCourse
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments', selectedCourse],
    queryFn: async () => { const res = await fetch(`/api/assignments?course_id=${selectedCourse}`); return res.json(); },
    enabled: !!selectedCourse
  });

  const { data: exams } = useQuery({
    queryKey: ['exams', selectedCourse],
    queryFn: async () => { const res = await fetch(`/api/exams?course_id=${selectedCourse}`); return res.json(); },
    enabled: !!selectedCourse
  });

  const submitGrade = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/grades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) { toast.success('Grade submitted!'); setShowGradeModal(false); queryClient.invalidateQueries({ queryKey: ['grades'] }); }
      else toast.error(data.error);
    }
  });

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Grades Management</h1>
          <Button onClick={() => setShowGradeModal(true)} disabled={!selectedCourse}>Submit Grade</Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[300px]"
            value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.title}</option>)}
          </select>
        </div>

        <DataTable
          columns={[
            { key: 'student', header: 'Student', render: (g: any) => g.student?.full_name || 'Unknown' },
            { key: 'assessment', header: 'Assessment', render: (g: any) => g.assignment?.title || g.exam?.title || '-' },
            { key: 'type', header: 'Type', render: (g: any) => <Badge>{g.exam_id ? 'Exam' : 'Assignment'}</Badge> },
            { key: 'points', header: 'Points', render: (g: any) => g.points_earned ?? '-' },
            { key: 'percentage', header: '%', render: (g: any) => g.percentage ? `${g.percentage}%` : '-' },
            { key: 'grade', header: 'Grade', render: (g: any) => g.grade_letter || '-' },
          ]}
          data={grades?.data || []}
          isLoading={isLoading}
          emptyMessage="No grades recorded yet"
        />

        <Modal isOpen={showGradeModal} onClose={() => setShowGradeModal(false)} title="Submit Grade">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={gradeForm.student_id} onChange={(e) => setGradeForm({ ...gradeForm, student_id: e.target.value })}>
                <option value="">Select student</option>
                {students?.data?.map((s: any) => <option key={s.id} value={s.id}>{s.full_name} ({s.matriculation_number || s.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" onChange={(e) => {
                const [type, id] = e.target.value.split(':');
                setGradeForm({ ...gradeForm, assignment_id: type === 'assignment' ? id : '', exam_id: type === 'exam' ? id : '' });
              }}>
                <option value="">Select assessment</option>
                <optgroup label="Assignments">
                  {assignments?.data?.map((a: any) => <option key={a.id} value={`assignment:${a.id}`}>{a.title}</option>)}
                </optgroup>
                <optgroup label="Exams">
                  {exams?.data?.map((e: any) => <option key={e.id} value={`exam:${e.id}`}>{e.title}</option>)}
                </optgroup>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Points" type="number" value={gradeForm.points_earned} onChange={(e) => setGradeForm({ ...gradeForm, points_earned: e.target.value })} />
              <Input label="Percentage" type="number" value={gradeForm.percentage} onChange={(e) => setGradeForm({ ...gradeForm, percentage: e.target.value })} />
              <Input label="Grade Letter" value={gradeForm.grade_letter} onChange={(e) => setGradeForm({ ...gradeForm, grade_letter: e.target.value })} placeholder="A, B+, etc" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowGradeModal(false)}>Cancel</Button>
              <Button onClick={() => submitGrade.mutate({
                ...gradeForm,
                points_earned: gradeForm.points_earned ? parseFloat(gradeForm.points_earned) : null,
                percentage: gradeForm.percentage ? parseFloat(gradeForm.percentage) : null
              })} isLoading={submitGrade.isPending}>Submit Grade</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default function LecturerGradesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <LecturerGradesContent />
    </Suspense>
  );
}


