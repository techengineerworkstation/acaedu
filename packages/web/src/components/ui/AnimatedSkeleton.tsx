'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSkeletonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'fade' | 'bounce';
  delay?: number;
}

const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({
  children,
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  delay = 0
}) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const getAnimation = (): any => {
    switch (animation) {
      case 'pulse':
        return {
          initial: { opacity: 0.5 },
          animate: { opacity: [0.5, 1, 0.5] },
          transition: { delay, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'wave':
        return {
          initial: { backgroundPosition: '-200% 0' },
          animate: { backgroundPosition: ['200% 0', '-200% 0'] },
          transition: { delay, duration: 1.5, repeat: Infinity, ease: 'linear' }
        };
      case 'bounce':
        return {
          initial: { y: 0, opacity: 0 },
          animate: { y: [-10, 0, -5, 0], opacity: [0, 1, 0.7, 1] },
          transition: { delay, duration: 0.8, repeat: Infinity, repeatDelay: 1 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay, duration: 0.3 }
        };
    }
  };

  const baseStyles = 'bg-gray-200 dark:bg-gray-700';
  const waveStyles = animation === 'wave' ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]' : '';

  const style: React.CSSProperties = {
    width: width ?? (variant === 'circular' ? height ?? 40 : '100%'),
    height: height ?? (variant === 'text' ? '1em' : 40),
    ...(animation === 'wave' && {
      backgroundSize: '200% 100%',
      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
    })
  };

  return (
    <motion.div
      className={`${baseStyles} ${waveStyles} ${getVariantClasses()} ${className}`}
      style={style}
      {...getAnimation()}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSkeleton;
