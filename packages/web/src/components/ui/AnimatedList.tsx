'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: 'slide' | 'fade' | 'scale' | 'bounce';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function AnimatedList({
  children,
  className = '',
  staggerDelay = 0.1,
  animation = 'slide',
  direction = 'up'
}: AnimatedListProps) {
  const getDirection = () => {
    switch (direction) {
      case 'up': return { y: 30, x: 0 };
      case 'down': return { y: -30, x: 0 };
      case 'left': return { x: 30, y: 0 };
      case 'right': return { x: -30, y: 0 };
      default: return { y: 30, x: 0 };
    }
  };

  const getAnimation = () => {
    switch (animation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 }
        };
      case 'bounce':
        return {
          initial: { scale: 0.5, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.5, opacity: 0 }
        };
      default:
        return {
          initial: { ...getDirection(), opacity: 0 },
          animate: { x: 0, y: 0, opacity: 1 },
          exit: { ...getDirection(), opacity: 0 }
        };
    }
  };

  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <motion.div
          key={index}
          initial={getAnimation().initial}
          animate={getAnimation().animate}
          exit={getAnimation().exit}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
  onClick?: () => void;
}

export function AnimatedListItem({ children, className = '', index = 0, onClick }: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ x: 4 }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedList;
