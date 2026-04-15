'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/supabase/session';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { BookOpenIcon, AcademicCapIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FadeIn, ScrollReveal } from '@/components/ui';
import { typedSupabase as supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const LEVEL_OPTIONS = [
  { value: 'year_1', label: 'Year 1 (100 Level)' },
  { value: 'year_2', label: 'Year 2 (200 Level)' },
  { value: 'year_3', label: 'Year 3 (300 Level)' },
  { value: 'year_4', label: 'Year 4 (400 Level)' },
  { value: 'year_5', label: 'Year 5 (500 Level)' },
];

export default function StudentRegistrationPage() {
  const { user } = useSession();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('first');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if ((user as any)?.level) {
      setSelectedLevel((user as any).level);
    }
  }, [user]);

  useEffect(() => {
    if (selectedLevel) {
      fetchAvailableCourses();
    }
  }, [selectedLevel, selectedSemester]);

  const fetchAvailableCourses = async () => {
    setIsLoading(true);
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          *,
          department:departments (name),
          lecturer:users!courses_lecturer_id_fkey (full_name)
        `)
        .eq('is_active', true)
        .eq('semester', selectedSemester)
        .order('course_code');

      if (courses) {
        setAvailableCourses(courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSaveRegistration = async () => {
    if (!selectedLevel) {
      toast.error('Please select your level');
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from('users')
        .update({ level: selectedLevel })
        .eq('id', user?.id);

      if (selectedCourses.length > 0) {
        const enrollmentPromises = selectedCourses.map(courseId =>
          supabase.from('enrollments').upsert({
            student_id: user?.id,
            course_id: courseId,
            status: 'active'
          }, { onConflict: 'student_id,course_id' })
        );
        await Promise.all(enrollmentPromises);
      }

      toast.success('Registration saved successfully!');
    } catch (error) {
      console.error('Error saving registration:', error);
      toast.error('Failed to save registration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        <FadeIn direction="down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Registration</h1>
            <p className="text-gray-600 mt-1">Select your level and courses for the semester</p>
          </div>
        </FadeIn>

        <ScrollReveal animation="fade">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Level</label>
                <Select
                  value={selectedLevel}
                  onChange={(e: any) => setSelectedLevel(e.target.value)}
                  options={LEVEL_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <div className="flex space-x-4">
                  {['first', 'second'].map(sem => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                        selectedSemester === sem
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {sem.charAt(0).toUpperCase() + sem.slice(1)} Semester
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="slide" direction="up" delay={0.1}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Available Courses ({availableCourses.length})
              </h2>
              <span className="text-sm text-gray-500">
                {selectedCourses.length} selected
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No courses available for this level/semester</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableCourses.map((course) => {
                  const isSelected = selectedCourses.includes(course.id);
                  return (
                    <motion.div
                      key={course.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                              isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckCircleIcon className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900">{course.course_code}</h3>
                            <span className="ml-2 text-sm text-gray-500">- {course.title}</span>
                          </div>
                          <div className="ml-8 mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                            <span>Credits: {course.credits}</span>
                            <span>Dept: {course.department?.name || 'General'}</span>
                            <span>Lecturer: {course.lecturer?.full_name || 'TBA'}</span>
                            <span>Capacity: {course.enrolled_count || 0}/{course.capacity || 30}</span>
                          </div>
                        </div>
                        <ChevronRightIcon className={`h-5 w-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <p>Selected: {selectedCourses.length} courses</p>
            <p>Total Credits: {availableCourses.filter(c => selectedCourses.includes(c.id)).reduce((sum, c) => sum + (c.credits || 0), 0)}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setSelectedCourses([])}>
              Clear All
            </Button>
            <Button onClick={handleSaveRegistration} isLoading={isSaving}>
              Save Registration
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
