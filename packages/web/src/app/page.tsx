'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/supabase/session';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import SplashScreen from '@/components/ui/SplashScreen';

export default function RootPage() {
  const { user } = useSession();
  const router = useRouter();
  const { currentColors } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !showSplash) {
      if (user?.role) {
        const rolePaths: Record<string, string> = {
          student: '/student/dashboard',
          lecturer: '/lecturer/dashboard',
          admin: '/admin/dashboard',
          dean: '/admin/dashboard'
        };
        const rolePath = rolePaths[user.role];

        if (rolePath) {
          router.push(rolePath);
        } else {
          router.push('/landing');
        }
      } else {
        router.push('/landing');
      }
    }
  }, [mounted, showSplash, user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentColors.primary }}></div>
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen role="student" onComplete={() => setShowSplash(false)} />;
  }

  // Show content briefly before redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="animate-pulse rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentColors.primary }}></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </motion.div>
    </div>
  );
}
