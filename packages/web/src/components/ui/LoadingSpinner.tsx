'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'dual-ring';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export default function LoadingSpinner({
  size = 'md',
  color = '#0ea5e9',
  className = '',
  variant = 'spinner'
}: LoadingSpinnerProps) {
  switch (variant) {
    case 'dots':
      return (
        <div className={`flex gap-1 ${className}`}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} rounded-full`}
              style={{ backgroundColor: color }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      );

    case 'pulse':
      return (
        <motion.div
          className={`${sizeClasses[size]} rounded-full ${className}`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      );

    case 'bars':
      return (
        <div className={`flex items-end gap-1 ${className}`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className={`w-1 ${sizeClasses[size].split(' ')[1]} rounded-full`}
              style={{ backgroundColor: color }}
              animate={{
                scaleY: [0.3, 1, 0.3],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      );

    case 'ring':
      return (
        <motion.div
          className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full ${className}`}
          style={{ borderTopColor: color }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      );

    case 'dual-ring':
      return (
        <div className={`${sizeClasses[size]} relative ${className}`}>
          <motion.div
            className="absolute inset-0 border-4 border-transparent rounded-full"
            style={{ borderTopColor: color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-transparent rounded-full"
            style={{ borderBottomColor: color }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      );

    default:
      return (
        <motion.div
          className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full ${className}`}
          style={{ borderTopColor: color }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      );
  }
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, children, text, className = '' }: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner size="lg" />
            {text && (
              <motion.p
                className="mt-4 text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {text}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '0.5rem',
  className = ''
}: LoadingSkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height, borderRadius }}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}
