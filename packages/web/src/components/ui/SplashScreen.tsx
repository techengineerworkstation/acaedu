'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { APP_NAME } from '@acadion/shared';

interface SplashScreenProps {
  role: 'student' | 'lecturer' | 'admin' | 'dean';
  onComplete?: () => void;
}

const roleMessages = {
  student: 'Welcome, Scholar',
  lecturer: 'Welcome, Educator',
  admin: 'Welcome, Administrator',
  dean: 'Welcome, Dean'
};

export default function SplashScreen({ role, onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const { settings, currentColors, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            background: `linear-gradient(135deg, ${isDark ? '#0f172a' : '#ffffff'} 0%, ${isDark ? '#1e293b' : '#f8fafc'} 50%, ${isDark ? '#1e293b' : '#f1f5f9'} 100%)`
          }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${currentColors.primary}20 0%, transparent 70%)`,
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${currentColors.secondary || '#8b5cf6'}15 0%, transparent 70%)`,
                right: '10%',
                top: '20%',
              }}
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -30, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-[350px] h-[350px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${currentColors.primary}10 0%, transparent 70%)`,
                left: '5%',
                bottom: '15%',
              }}
              animate={{
                scale: [1, 1.4, 1],
                x: [0, 40, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`splash-particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
                height: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
                background: i % 2 === 0 ? currentColors.primary : currentColors.secondary || '#8b5cf6',
                left: `${(i * 8) % 95}%`,
                top: `${(i * 12) % 90}%`,
              }}
              animate={{
                y: [0, -80, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Main content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Logo/Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-28 h-28 rounded-3xl mb-6 shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary || '#8b5cf6'})` }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-14 h-14 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"/>
                  <path d="M5 19V21H19V19H5Z" opacity="0.7"/>
                </svg>
              </div>
            </motion.div>

            {/* Institution name */}
            {settings?.logo_url ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Image
                  src={settings.logo_url}
                  alt={settings.institution_name || APP_NAME}
                  width={200}
                  height={60}
                  className="mx-auto h-12 w-auto object-contain"
                />
              </motion.div>
            ) : (
              <motion.h1
                className="text-4xl font-bold mb-2"
                style={{
                  background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary || '#8b5cf6'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {settings?.institution_name || APP_NAME}
              </motion.h1>
            )}

            {/* Role-specific greeting */}
            <motion.p
              className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {roleMessages[role]}
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              className="mt-8 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`dot-${i}`}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentColors.primary }}
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom gradient */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: `linear-gradient(to top, ${isDark ? '#0f172a' : '#ffffff'}00, transparent)`
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
