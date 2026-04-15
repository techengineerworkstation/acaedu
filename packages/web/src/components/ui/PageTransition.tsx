'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  mode?: 'wait' | 'sync' | 'popLayout';
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  direction = 'up',
  duration = 0.4,
  delay = 0,
  mode = 'wait'
}) => {
  const getAnimation = () => {
    const distance = 100;
    let x = 0, y = 0;
    
    switch (direction) {
      case 'left': x = distance; break;
      case 'right': x = -distance; break;
      case 'up': y = distance; break;
      case 'down': y = -distance; break;
    }

    return {
      initial: { x, y, opacity: 0, scale: 0.95 },
      animate: { x: 0, y: 0, opacity: 1, scale: 1 },
      exit: { x: -x, y: -y, opacity: 0, scale: 0.95 },
      transition: { 
        duration, 
        delay,
        ease: [0.4, 0, 0.2, 1],
        type: 'tween'
      }
    };
  };

  return (
    <motion.div
      className={`min-h-screen ${className}`}
      {...getAnimation()}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay
      }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  animation?: 'fade' | 'slide' | 'scale';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.4,
  direction = 'up',
  animation = 'fade'
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 30 };
      case 'down': return { y: -30 };
      case 'left': return { x: 30 };
      case 'right': return { x: -30 };
      default: return { y: 30 };
    }
  };

  const getAnimation = () => {
    const position = getInitialPosition();
    switch (animation) {
      case 'slide':
        return {
          initial: { opacity: 0, ...position },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration, delay, ease: [0.4, 0, 0.2, 1] }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration, delay, ease: [0.4, 0, 0.2, 1] }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0, ...position },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration, delay, ease: [0.4, 0, 0.2, 1] }
        };
    }
  };

  return (
    <motion.div
      className={className}
      {...getAnimation()}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
