'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Badge from '@/components/ui/badge';
import { UserGroupIcon, BookOpenIcon, CurrencyDollarIcon, BellIcon, CalendarIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import { FadeIn, ScrollReveal } from '@/components/ui';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => { const r = await fetch('/api/admin/stats'); return r.json(); }
  });

  const stats = statsData?.data?.stats || {};
  const recentActivity = statsData?.data?.recent_activity || [];

  const statCards = [
    { label: 'Total Students', value: stats.total_students || 0, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Lecturers', value: stats.total_lecturers || 0, icon: AcademicCapIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Active Courses', value: stats.total_courses || 0, icon: BookOpenIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Revenue', value: `$${(stats.total_revenue || 0).toLocaleString()}`, icon: CurrencyDollarIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Active Enrollments', value: stats.active_enrollments || 0, icon: SparklesIcon, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { label: 'Active Subscriptions', value: stats.active_subscriptions || 0, icon: BellIcon, color: 'text-pink-600', bg: 'bg-pink-100' },
    { label: 'Recent Signups (30d)', value: stats.recent_signups || 0, icon: UserGroupIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Upcoming Events', value: stats.upcoming_events || 0, icon: CalendarIcon, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const quickActions = [
    { href: '/admin/users', label: 'Students', icon: UserGroupIcon, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { href: '/admin/lecturers', label: 'Lecturers', icon: AcademicCapIcon, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    { href: '/admin/courses', label: 'Courses', icon: BookOpenIcon, bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    { href: '/admin/announcements', label: 'Announcements', icon: BellIcon, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    { href: '/admin/billing', label: 'Billing', icon: CurrencyDollarIcon, bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    { href: '/admin/schedules', label: 'Schedules', icon: CalendarIcon, bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <FadeIn direction="down" duration={0.5}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System overview and management</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.05} animation="scale">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <div className={`p-2.5 rounded-lg ${s.bg}`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 truncate">{s.label}</p>
                      <p className="text-lg font-bold text-gray-900">{s.value}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScrollReveal animation="slide" direction="left">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link 
                        href={action.href} 
                        className={`flex flex-col items-center p-3 ${action.bg} border ${action.border} rounded-lg font-medium text-center transition-all`}
                      >
                        <Icon className={`h-4 w-4 ${action.text} mb-1`} />
                        <span className="text-xs">{action.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="slide" direction="up" className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
              <div className="space-y-2">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">No recent activity</p>
                ) : (
                  recentActivity.slice(0, 5).map((a: any, i: number) => (
                    <FadeIn key={i} animation="fade" delay={i * 0.05}>
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary-500 mr-3"></div>
                          <p className="text-sm font-medium text-gray-900">{a.title}</p>
                        </div>
                        <span className="text-xs text-gray-400">{format(new Date(a.created_at), 'MMM d')}</span>
                      </div>
                    </FadeIn>
                  ))
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fade">
          {statsData?.data?.census && statsData.data.census.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-gray-900">Population by Department</h2>
                <Link href="/admin/census" className="text-xs text-primary-600 hover:underline">View full census</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Male</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Female</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {statsData.data.census.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{c.department_name || 'Unassigned'}</td>
                        <td className="px-3 py-2 text-sm text-right text-gray-700">{c.total_count}</td>
                        <td className="px-3 py-2 text-sm text-right text-gray-500">{c.male_count}</td>
                        <td className="px-3 py-2 text-sm text-right text-gray-500">{c.female_count}</td>
                        <td className="px-3 py-2 text-sm text-right text-gray-500">{c.active_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
