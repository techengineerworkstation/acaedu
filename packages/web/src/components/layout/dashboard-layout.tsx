'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/supabase/session';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import Image from 'next/image';
import {
  HomeIcon,
  CalendarIcon,
  BellIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  AcademicCapIcon,
  CogIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  MapPinIcon,
  UserGroupIcon,
  CreditCardIcon,
  MegaphoneIcon,
  ClockIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ui/ThemeToggle';
import FractalBackground from '@/components/ui/FractalBackground';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'lecturer' | 'admin' | 'dean';
}

const roleConfig = {
  student: {
    name: 'Student Dashboard',
    navItems: [
      { href: '/student/dashboard', label: 'Overview', icon: HomeIcon },
      { href: '/student/registration', label: 'Registration', icon: AcademicCapIcon },
      { href: '/student/schedule', label: 'Schedule', icon: CalendarIcon },
      { href: '/student/courses', label: 'Courses', icon: BookOpenIcon },
      { href: '/student/meetings', label: 'Live Classes', icon: VideoCameraIcon },
      { href: '/student/lectures', label: 'Recorded Lectures', icon: VideoCameraIcon },
      { href: '/student/chatroom', label: 'Discussion', icon: ChatBubbleLeftRightIcon },
      { href: '/student/exams', label: 'Exams', icon: ClipboardDocumentListIcon },
      { href: '/student/assignments', label: 'Assignments', icon: DocumentTextIcon },
      { href: '/student/grades', label: 'Grades', icon: AcademicCapIcon },
      { href: '/student/videos', label: 'Lecture Videos', icon: VideoCameraIcon },
      { href: '/student/notifications', label: 'Notifications', icon: BellIcon },
      { href: '/student/venues', label: 'Class Venues', icon: MapPinIcon },
      { href: '/student/events', label: 'Events', icon: CalendarIcon },
      { href: '/student/profile', label: 'Profile', icon: UserIcon }
    ]
  },
  lecturer: {
    name: 'Lecturer Dashboard',
    navItems: [
      { href: '/lecturer/dashboard', label: 'Overview', icon: HomeIcon },
      { href: '/lecturer/courses', label: 'My Courses', icon: BookOpenIcon },
      { href: '/lecturer/schedule', label: 'Schedule', icon: CalendarIcon },
      { href: '/lecturer/meetings', label: 'Live Classes', icon: VideoCameraIcon },
      { href: '/lecturer/attendance', label: 'Attendance', icon: ClockIcon },
      { href: '/lecturer/announcements', label: 'Announcements', icon: MegaphoneIcon },
      { href: '/lecturer/exams', label: 'Exams', icon: ClipboardDocumentListIcon },
      { href: '/lecturer/assignments', label: 'Assignments', icon: DocumentTextIcon },
      { href: '/lecturer/grades', label: 'Grades', icon: AcademicCapIcon },
      { href: '/lecturer/videos', label: 'Lecture Videos', icon: VideoCameraIcon },
      { href: '/lecturer/materials', label: 'Materials', icon: DocumentTextIcon },
      { href: '/lecturer/notifications', label: 'Notifications', icon: BellIcon },
      { href: '/lecturer/profile', label: 'Profile', icon: UserIcon }
    ]
  },
  dean: {
    name: 'Dean Dashboard',
    navItems: [
      { href: '/admin/dashboard', label: 'Overview', icon: ChartBarIcon },
      { href: '/admin/users', label: 'Users', icon: UserGroupIcon },
      { href: '/admin/courses', label: 'Courses', icon: BookOpenIcon },
      { href: '/admin/announcements', label: 'Announcements', icon: MegaphoneIcon },
      { href: '/admin/census', label: 'Population Census', icon: UserGroupIcon },
      { href: '/admin/profile', label: 'Profile', icon: UserIcon }
    ]
  },
  admin: {
    name: 'Admin Panel',
    navItems: [
      { href: '/admin/dashboard', label: 'Overview', icon: ChartBarIcon },
      { href: '/admin/users', label: 'Users', icon: UserGroupIcon },
      { href: '/admin/lecturers', label: 'Lecturers', icon: AcademicCapIcon },
      { href: '/admin/courses', label: 'Courses', icon: BookOpenIcon },
      { href: '/admin/schedules', label: 'Schedules', icon: CalendarIcon },
      { href: '/admin/announcements', label: 'Announcements', icon: MegaphoneIcon },
      { href: '/admin/exams', label: 'Exams', icon: ClipboardDocumentListIcon },
      { href: '/admin/events', label: 'Events', icon: CalendarIcon },
      { href: '/admin/venues', label: 'Venues', icon: MapPinIcon },
      { href: '/admin/census', label: 'Population Census', icon: UserGroupIcon },
      { href: '/admin/billing', label: 'Billing', icon: CreditCardIcon },
      { href: '/admin/notifications', label: 'Notifications', icon: BellIcon },
      { href: '/admin/profile', label: 'Profile', icon: UserIcon },
      { href: '/admin/settings', label: 'Settings', icon: CogIcon }
    ]
  }
};

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useSession();
  const { settings, currentColors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('soundEnabled') !== 'false';
    }
    return true;
  });
  const [showSplash, setShowSplash] = useState(false);
  const { playClick, playSuccess, playError, playNotification } = useSoundEffects({ enabled: soundEnabled });

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  const config = roleConfig[role] || roleConfig.student;
  const hasNotifications = config.navItems.some(item => item.href.includes('notifications'));

  useEffect(() => {
    if (!isLoading && user) {
      setShowSplash(true);
    }
  }, [isLoading, user]);

  const handleSignOut = async () => {
    playClick();
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playClick();
      router.push(`/${role}/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNavClick = useCallback(() => {
    playClick();
    setSidebarOpen(false);
  }, [playClick]);

  const toggleSound = useCallback(() => {
    if (soundEnabled) {
      playError();
    } else {
      playSuccess();
    }
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled, playError, playSuccess]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => { playClick(); setSidebarOpen(!sidebarOpen); }}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 lg:hidden"
              >
                {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
              <Link href={`/${role}/dashboard`} className="flex items-center ml-2 lg:ml-0">
                {settings?.logo_url ? (
                  <Image
                    src={settings.logo_url}
                    alt={settings.institution_name || 'Acaedu'}
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center">
                    <span className="text-xl font-bold" style={{ color: currentColors.primary }}>
                      {settings?.institution_name || 'Acaedu'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 uppercase tracking-wide hidden sm:inline">
                      {config.name}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, announcements, events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* User menu */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSound}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? (
                  <SpeakerWaveIcon className="h-5 w-5" />
                ) : (
                  <SpeakerXMarkIcon className="h-5 w-5" />
                )}
              </button>

              <ThemeToggle />

              {hasNotifications && (
                <Link
                  href={`/${role === 'admin' ? 'admin' : role}/notifications`}
                  className="relative p-2 text-gray-500 hover:text-gray-700"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Link>
              )}

              <div className="hidden md:flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <span className="text-sm font-medium text-primary-700">
                      {user.full_name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-700">{user.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-error-500 transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 pt-16 overflow-y-auto`}
      >
        <div className="px-4 py-4">
          <ul className="space-y-1">
            {config.navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-4 border-primary-600'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 min-h-screen relative overflow-hidden">
        <FractalBackground 
          color={currentColors.primary} 
          secondaryColor={currentColors.secondary || '#8b5cf6'}
          className="pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => { playClick(); setSidebarOpen(false); }}
        />
      )}
    </div>
  );
}
