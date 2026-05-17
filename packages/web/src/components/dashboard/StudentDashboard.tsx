'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { CalendarIcon, BellIcon, BookOpenIcon, ClockIcon, ChevronRightIcon } from 'lucide-react';
import { formatTimeRange, DAYS_OF_WEEK_SHORT } from '@acadion/shared';
import { FadeIn, ScrollReveal } from '../ui';
import Link from 'next/link';

export default function StudentDashboard() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todaysClasses = [
    { id: '1', title: 'Introduction to Computer Science', courseCode: 'CS101', startTime: '09:00', endTime: '10:30', location: 'Room 301', type: 'lecture' },
    { id: '2', title: 'Data Structures Lab', courseCode: 'CS201', startTime: '14:00', endTime: '16:00', location: 'Lab 2', type: 'lab' }
  ];

  const upcomingEvents = [
    { id: '1', title: 'Midterm Exam - Mathematics', date: addDays(today, 3), type: 'exam' },
    { id: '2', title: 'Assignment 2 Due', date: addDays(today, 1), type: 'assignment' }
  ];

  const recentAnnouncements = [
    { id: '1', title: 'Campus Maintenance Notice', content: 'The library will be closed this weekend for maintenance work.', category: 'general', publishedAt: new Date() },
    { id: '2', title: 'New Course Materials', content: 'Updated course materials for CS201 are now available.', category: 'academic', publishedAt: new Date() }
  ];

  const stats = [
    { label: 'Enrolled Courses', value: '5', icon: BookOpenIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: "Today's Classes", value: todaysClasses.length.toString(), icon: CalendarIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Notifications', value: '3', icon: BellIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Upcoming Exams', value: '2', icon: ClockIcon, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  return (
    <div className="space-y-5">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <ScrollReveal key={stat.label} delay={i * 0.05}>
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
          <Link href="/student/schedule">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary-600" />
                  Today&apos;s Schedule
                </h2>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {todaysClasses.length} Classes
                </span>
              </div>
              {todaysClasses.length > 0 ? (
                <div className="space-y-2">
                  {todaysClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-16 text-center flex-shrink-0">
                        <p className="text-xs font-semibold text-primary-600">{cls.startTime}</p>
                        <p className="text-xs text-gray-400">- {cls.endTime}</p>
                      </div>
                      <div className="mx-3 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{cls.title}</h3>
                        <p className="text-xs text-gray-500">{cls.courseCode} • {cls.location}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {cls.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No classes today</p>
                </div>
              )}
            </div>
          </Link>
        </ScrollReveal>

        <ScrollReveal>
          <Link href="/student/courses">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-1.5">
                {[
                  { label: 'Course Materials', icon: BookOpenIcon, color: 'text-blue-500', href: '/student/courses' },
                  { label: 'Check Grades', icon: ClockIcon, color: 'text-green-500', href: '/student/grades' },
                  { label: 'View Schedule', icon: CalendarIcon, color: 'text-purple-500', href: '/student/schedule' },
                  { label: 'Announcements', icon: BellIcon, color: 'text-amber-500', href: '/student/announcements' }
                ].map((action) => (
                  <div
                    key={action.label}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span className="text-sm text-gray-700 flex-1">{action.label}</span>
                    <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </div>

      <Link href="/student/schedule">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h2 className="text-base font-semibold text-gray-900 mb-3">This Week</h2>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`text-center p-2 rounded-lg ${isToday(day) ? 'bg-primary-500 text-white' : 'bg-gray-50'}`}
              >
                <p className={`text-xs font-medium ${isToday(day) ? 'text-white/80' : 'text-gray-500'}`}>
                  {DAYS_OF_WEEK_SHORT[day.getDay()]}
                </p>
                <p className={`text-sm font-bold mt-0.5 ${isToday(day) ? 'text-white' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScrollReveal>
          <Link href="/student/events">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Upcoming Events</h2>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center p-2.5 bg-red-50 rounded-lg border border-red-100">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <CalendarIcon className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <div className="ml-2.5 flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{format(event.date, 'MMM d, yyyy')}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Link href="/student/announcements">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Announcements</h2>
              <div className="space-y-2">
                {recentAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {ann.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
