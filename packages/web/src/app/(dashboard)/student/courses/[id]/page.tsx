'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from '@/lib/supabase/session';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { typedSupabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  ClockIcon,
  SpeakerWaveIcon,
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import SkeletonCard from '@/components/ui/skeleton-card';
import TextToSpeechButton from '@/components/tts/TextToSpeechButton';

interface Course {
  id: string;
  course_code: string;
  title: string;
  description: string | null;
  summary: string | null;
  credits: number;
  capacity: number;
  enrolled_count: number;
  is_active: boolean;
  department: { id: string; name: string; code: string } | null;
  lecturer: { id: string; full_name: string; email: string } | null;
  syllabus_url: string | null;
  created_at: string;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  material_type: 'document' | 'video' | 'presentation' | 'link';
  week_number: number | null;
  is_published: boolean;
  uploaded_by: { full_name: string } | null;
  created_at: string;
}

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  schedule_type: string;
  start_time: string;
  end_time: string;
  location: string | null;
}

interface Enrollment {
  id: string;
  status: 'active' | 'completed' | 'dropped' | 'failed';
}

export default function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = useParams();
  const courseId = resolvedParams.id as string;

  const { user } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'schedule'>('overview');
useEffect(() => {
    fetchCourse();
    fetchMaterials();
    fetchSchedules();
    checkEnrollment();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const result = await response.json();
      if (result.success) {
        setCourse(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Failed to load course');
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/materials`);
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/schedules?course_id=${courseId}&limit=50`);
      const result = await response.json();
      if (result.success) {
        setSchedules(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/enrollments?course_id=${courseId}`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setEnrollment(result.data[0]);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, status: 'active' })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Enrolled successfully!');
        setEnrollment({ id: result.data.id, status: 'active' });
      } else {
        toast.error(result.error || 'Failed to enroll');
      }
    } catch (error) {
      toast.error('Failed to enroll');
    }
  };

  const handleDownloadMaterial = (material: Material) => {
    window.open(material.file_url, '_blank');
  };

  if (isLoading || !course) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6">
          <SkeletonCard titleWidth="40%" lines={3} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </DashboardLayout>
  );
}

const isEnrolled = enrollment?.status === 'active';

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex px-3 py-1 text-sm font-mono font-semibold rounded-lg bg-primary-100 text-primary-800">
                    {course.course_code}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${isEnrolled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                  </span>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {course.credits} Credit{course.credits !== 1 ? 's' : ''}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>

                {course.description && (
                  <p className="text-gray-600 mb-4">{course.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {course.lecturer && (
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{course.lecturer.full_name}</span>
                    </div>
                  )}
                  {course.department && (
                    <div className="flex items-center space-x-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>{course.department.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="h-4 w-4" />
                    <span>{course.enrolled_count}/{course.capacity} enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end space-y-3">
                {!isEnrolled && course.is_active && course.enrolled_count < course.capacity && (
                  <Button onClick={handleEnroll} size="lg">
                    Enroll in Course
                  </Button>
                )}
                {course.syllabus_url && (
                  <a
                    href={course.syllabus_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Syllabus PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Summary with TTS */}
        {course.summary && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Course Summary</h2>
              <TextToSpeechButton text={course.summary} className="ml-auto" />
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              {course.summary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpenIcon },
                { id: 'materials', label: 'Materials', icon: DocumentTextIcon },
                { id: 'schedule', label: 'Schedule', icon: CalendarIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Course</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {course.description ? (
                      <p>{course.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description available.</p>
                    )}
                  </div>
                </div>

                {course.lecturer && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructor</h3>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-700">
                          {course.lecturer.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course.lecturer.full_name}</p>
                        <p className="text-sm text-gray-500">{course.lecturer.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Course Materials</h3>
                {materials.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No materials uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {materials.map((material) => {
                      const getFileIcon = () => {
                        switch (material.file_type) {
                          case 'pdf': return '📄';
                          case 'video': return '🎥';
                          case 'presentation': return '📽️';
                          default: return '📎';
                        }
                      };

                      const formatFileSize = (bytes: number) => {
                        if (bytes < 1024) return `${bytes} B`;
                        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                      };

                      return (
                        <div
                          key={material.id}
                          className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleDownloadMaterial(material)}
                        >
                          <div className="text-3xl mr-4">{getFileIcon()}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{material.title}</h4>
                            {material.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{material.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{material.file_type.toUpperCase()}</span>
                              {material.file_size && <span>{formatFileSize(material.file_size)}</span>}
                              <span>Week {material.week_number || 'N/A'}</span>
                              {material.uploaded_by && (
                                <span>By {material.uploaded_by.full_name}</span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Class Schedule</h3>
                {schedules.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No scheduled sessions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-start p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                          <CalendarIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(schedule.start_time), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(schedule.start_time), 'h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}
                          </p>
                          {schedule.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {schedule.location}
                            </p>
                          )}
                          {schedule.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{schedule.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}