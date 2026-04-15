'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/supabase/session';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { HomeIcon, UsersIcon, CalendarIcon, BookOpenIcon, MegaphoneIcon, VideoCameraIcon, AcademicCapIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const { user } = useSession();
  const { settings, updateSettings, currentColors } = useTheme();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      const rolePath = {
        student: '/student/dashboard',
        lecturer: '/lecturer/dashboard',
        admin: '/admin/dashboard',
        dean: '/admin/dashboard'
      }[user.role];

      if (rolePath) {
        router.push(rolePath);
      }
    }
  }, [user, router]);

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/login');
  };

  const handleLearnMore = () => {
    router.push('/login'); // For now, go to login - could be expanded to features page
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with African-themed visuals */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-gray-900 dark:to-gray-800"></div>

          {/* Animated gradient orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />

          {/* African-inspired pattern decoration */}
          <svg className="absolute top-20 left-10 w-64 h-64 text-teal-100 opacity-40" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L100 50 L50 100 L0 50 Z" opacity="0.3"/>
            <path d="M50 20 L80 50 L50 80 L20 50 Z" opacity="0.4"/>
            <circle cx="50" cy="50" r="15" opacity="0.5"/>
          </svg>
          <svg className="absolute bottom-20 right-10 w-48 h-48 text-amber-100 opacity-40" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,5 95,35 80,90 20,90 5,35" opacity="0.4"/>
            <polygon points="50,20 75,40 65,75 35,75 25,40" opacity="0.5"/>
            <circle cx="50" cy="50" r="10" opacity="0.6"/>
          </svg>
        </div>

        {/* Logo and Branding */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {settings?.logo_url ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={settings.logo_url}
                alt={settings.institution_name || 'Acaedu'}
                width={200}
                height={80}
                className="drop-shadow-lg h-20 w-auto object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${currentColors?.primary || '#0ea5e9'}20`, borderWidth: 3, borderColor: currentColors?.primary || '#0ea5e9' }}
              >
                <AcademicCapIcon className="h-10 w-10" style={{ color: currentColors?.primary || '#0ea5e9' }} />
              </motion.div>
              <div className="text-left">
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight"
                >
                  {settings?.institution_name || 'Acaedu'}
                </motion.h1>
                {settings?.motto && (
                  <motion.p
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg md:text-xl font-medium mt-2 italic max-w-md"
                    style={{ color: currentColors?.primary || '#0ea5e9' }}
                  >
                    {settings.motto}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Tagline with brand color accent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <span className="h-1 w-8 rounded-full" style={{ backgroundColor: currentColors?.primary || '#0ea5e9' }}></span>
            <p className="max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light">
              Smart Academic Scheduling & Notifications
            </p>
            <span className="h-1 w-8 rounded-full" style={{ backgroundColor: currentColors?.primary || '#0ea5e9' }}></span>
          </motion.div>

          {/* Institution badge */}
          {settings?.institution_name !== 'Acaedu' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: `${currentColors?.primary || '#0ea5e9'}10`, borderWidth: 1, borderColor: `${currentColors?.primary || '#0ea5e9'}30` }}
            >
              <GlobeAltIcon className="h-5 w-5" style={{ color: currentColors?.primary || '#0ea5e9' }} />
              <span className="text-sm font-medium" style={{ color: currentColors?.primary || '#0ea5e9' }}>
                Trusted by leading institutions across Africa
              </span>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}