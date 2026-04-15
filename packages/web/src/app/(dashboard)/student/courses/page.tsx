'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { toast } from 'react-hot-toast';
import { BookOpenIcon, VideoCameraIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import TextToSpeech from '@/components/tts/TextToSpeech';

export default function StudentCoursesPage() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const res = await fetch('/api/enrollments');
      return res.json();
    }
  });

  const { data: availableCourses } = useQuery({
    queryKey: ['courses', 'available'],
    queryFn: async () => {
      const res = await fetch('/api/courses?is_active=true');
      return res.json();
    },
    enabled: showEnrollModal
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId })
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success('Enrolled successfully!');
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        setShowEnrollModal(false);
      } else {
        toast.error(data.error || 'Failed to enroll');
      }
    }
  });

  const dropMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const res = await fetch('/api/enrollments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: enrollmentId, status: 'dropped' })
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Course dropped');
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Manage your enrolled courses</p>
          </div>
          <Button onClick={() => setShowEnrollModal(true)}>
            Enroll in Course
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments?.data?.map((enrollment: any) => {
              const course = enrollment.course;
              return (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-primary-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">{course?.course_code}</h3>
                    <p className="text-primary-100 text-sm">{course?.title}</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {course?.lecturer?.full_name || 'TBA'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      {course?.credits} Credits
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      {course?.department?.name || 'General'}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <Badge variant={enrollment.status === 'active' ? 'success' : 'warning'}>
                        {enrollment.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedCourse(course)}>
                          View
                        </Button>
                        {enrollment.status === 'active' && (
                          <Button size="sm" variant="danger" onClick={() => {
                            if (confirm('Are you sure you want to drop this course?')) {
                              dropMutation.mutate(enrollment.id);
                            }
                          }}>
                            Drop
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Enroll in a Course" size="lg">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {availableCourses?.data?.map((course: any) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{course.course_code} - {course.title}</p>
                  <p className="text-sm text-gray-500">
                    {course.lecturer?.full_name || 'TBA'} | {course.credits} Credits | {course.enrolled_count}/{course.capacity} enrolled
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => enrollMutation.mutate(course.id)}
                  isLoading={enrollMutation.isPending}
                  disabled={course.enrolled_count >= course.capacity}
                >
                  {course.enrolled_count >= course.capacity ? 'Full' : 'Enroll'}
                </Button>
              </div>
            ))}
          </div>
        </Modal>

        <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={selectedCourse?.title || ''} size="lg">
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-gray-500">Course Code:</span><p className="font-medium">{selectedCourse.course_code}</p></div>
                <div><span className="text-sm text-gray-500">Credits:</span><p className="font-medium">{selectedCourse.credits}</p></div>
                <div><span className="text-sm text-gray-500">Department:</span><p className="font-medium">{selectedCourse.department?.name}</p></div>
                <div><span className="text-sm text-gray-500">Lecturer:</span><p className="font-medium">{selectedCourse.lecturer?.full_name || 'TBA'}</p></div>
              </div>
              {selectedCourse.description && (
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="mt-1 text-gray-700">{selectedCourse.description}</p>
                </div>
              )}
              {selectedCourse.summary && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Course Summary:</span>
                    <TextToSpeech text={selectedCourse.summary} />
                  </div>
                  <p className="mt-1 text-gray-700">{selectedCourse.summary}</p>
                </div>
              )}
              <div className="flex space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => window.location.href = `/student/videos?course_id=${selectedCourse.id}`}>
                  <VideoCameraIcon className="h-4 w-4 mr-2" /> Lecture Videos
                </Button>
                <Button variant="outline" onClick={() => window.location.href = `/student/materials?course_id=${selectedCourse.id}`}>
                  <DocumentTextIcon className="h-4 w-4 mr-2" /> Materials
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
