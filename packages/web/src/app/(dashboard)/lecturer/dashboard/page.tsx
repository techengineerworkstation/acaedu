'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, isSameDay } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import { BookOpenIcon, CalendarIcon, UserGroupIcon, ClockIcon, MegaphoneIcon, DocumentTextIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FadeIn, ScrollReveal } from '@/components/ui';

export default function LecturerDashboardPage() {
  const today = new Date();

  const { data: courses } = useQuery({
    queryKey: ['courses', 'lecturer'],
    queryFn: async () => { const res = await fetch('/api/courses'); return res.json(); }
  });

  const { data: schedules } = useQuery({
    queryKey: ['schedules', 'lecturer', format(today, 'yyyy-MM-dd')],
    queryFn: async () => {
      const start = today.toISOString();
      const end = addDays(today, 1).toISOString();
      const res = await fetch(`/api/schedules?start_date=${start}&end_date=${end}`);
      return res.json();
    }
  });

  const todaysClasses = schedules?.data?.filter((s: any) => isSameDay(new Date(s.start_time), today)) || [];
  const myCourses = courses?.data || [];

  const statItems = [
    { label: 'My Courses', value: myCourses.length, icon: BookOpenIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: "Today's Classes", value: todaysClasses.length, icon: ClockIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Students', value: myCourses.reduce((sum: number, c: any) => sum + (c.enrolled_count || 0), 0), icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Upcoming Exams', value: 0, icon: CalendarIcon, color: 'text-red-600', bg: 'bg-red-100' }
  ];

  const quickActions = [
    { href: '/lecturer/announcements', icon: MegaphoneIcon, label: 'Announcements', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    { href: '/lecturer/assignments', icon: DocumentTextIcon, label: 'Assignments', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
    { href: '/lecturer/schedule', icon: CalendarIcon, label: 'Schedule', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
    { href: '/lecturer/grades', icon: AcademicCapIcon, label: 'Grades', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' }
  ];

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-5">
        <FadeIn direction="down" duration={0.5}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
            <p className="text-gray-600 mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ScrollReveal className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-900">Today&apos;s Classes</h2>
                <Link href="/lecturer/schedule" className="text-xs text-primary-600 hover:underline">View schedule</Link>
              </div>
              {todaysClasses.length === 0 ? (
                <p className="text-gray-500 text-center py-6 text-sm">No classes scheduled for today</p>
              ) : (
                <div className="space-y-2">
                  {todaysClasses.slice(0, 3).map((s: any) => (
                    <div key={s.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-16 flex-shrink-0">
                        <p className="text-xs font-medium text-gray-900">{format(new Date(s.start_time), 'h:mm a')}</p>
                      </div>
                      <div className="flex-1 mx-3">
                        <p className="text-sm font-medium text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.course?.course_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.location && <span className="text-xs text-gray-500">{s.location}</span>}
                        <Badge size="sm">{s.schedule_type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex items-center p-3 ${action.bg} border ${action.border} rounded-lg transition-all hover:shadow-sm`}
                    >
                      <Icon className={`h-4 w-4 ${action.text}`} />
                      <span className={`ml-2 text-sm font-medium ${action.text}`}>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fade">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-gray-900">My Courses</h2>
              <Link href="/lecturer/courses" className="text-xs text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myCourses.slice(0, 4).map((course: any) => (
                <div key={course.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.course_code}</p>
                      <p className="text-xs text-gray-500 truncate">{course.title}</p>
                    </div>
                    <Badge size="sm" variant={course.is_active ? 'success' : 'default'}>{course.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{course.enrolled_count || 0}/{course.capacity || 30} students</span>
                    <span>{course.credits || 3} Credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
