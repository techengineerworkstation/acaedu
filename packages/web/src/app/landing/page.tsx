'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import SplashScreen from '@/components/ui/SplashScreen';

export default function LandingPage() {
  const { settings, currentColors } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${currentColors.primary}20` }}
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${currentColors.secondary || currentColors.primary}20` }}
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `linear-gradient(135deg, ${currentColors.primary}10, ${currentColors.secondary || currentColors.primary}10)` }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4"
        >
          <motion.div 
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary || currentColors.primary})` }}
          >
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"/>
              <path d="M5 19V21H19V19H5Z" opacity="0.7"/>
            </svg>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            {settings?.institution_name || 'Acaedu'}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400 mb-4"
          >
            {settings?.motto || 'Smart Academic Scheduling System'}
          </motion.p>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-500 dark:text-gray-500 mb-10"
          >
            Streamline your academic calendar with intelligent scheduling
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/login" 
                className="inline-block px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary || currentColors.primary})` }}
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/register" 
                className="inline-block px-8 py-4 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Create Account
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex justify-center gap-8 text-sm text-gray-500"
          >
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: currentColors.primary }}>100+</div>
              <div>Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: currentColors.primary }}>50+</div>
              <div>Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: currentColors.primary }}>10k+</div>
              <div>Students</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}