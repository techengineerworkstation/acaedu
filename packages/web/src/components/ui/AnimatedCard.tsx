'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  elevation?: 'low' | 'medium' | 'high';
  animation?: 'fade' | 'slide' | 'scale';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  hover = true,
  elevation = 'medium',
  animation = 'fade'
}) => {
  const getElevation = (): string => {
    switch (elevation) {
      case 'low': return 'shadow-sm';
      case 'high': return 'shadow-xl';
      default: return 'shadow-md';
    }
  };

  const getAnimation = (): any => {
    switch (animation) {
      case 'slide':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        };
      case 'scale':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
        };
    }
  };

  const hoverAnimation = hover ? {
    whileHover: {
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.2 }
    },
    whileTap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 ${getElevation()} ${className}`}
      onClick={onClick}
      {...getAnimation()}
      {...hoverAnimation}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
