'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  animation?: 'slide' | 'scale' | 'bounce';
  icon?: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = '',
  onClick,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  animation = 'slide',
  icon
}) => {
  const getSize = (): string => {
    switch (size) {
      case 'sm': return 'px-4 py-2 text-sm';
      case 'lg': return 'px-8 py-3 text-base';
      default: return 'px-6 py-2.5 text-base';
    }
  };

  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800';
      default:
        return 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20';
    }
  };

  const getAnimation = (): any => {
    switch (animation) {
      case 'slide':
        return {
          initial: { x: -20, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        };
      case 'scale':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
        };
      case 'bounce':
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 }
        };
      default:
        return {};
    }
  };

  return (
    <motion.button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${getSize()} ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      {...getAnimation()}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      <span className={isLoading ? 'ml-2' : ''}>
        {children}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;
