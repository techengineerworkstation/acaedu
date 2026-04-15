'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip';
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade',
  direction = 'up',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  once = true
}: ScrollRevealProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(internalRef, { once, amount: threshold });
  const controls = useAnimation();

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 50 };
      case 'down': return { y: -50 };
      case 'left': return { x: 50 };
      case 'right': return { x: -50 };
      default: return { y: 50 };
    }
  };

  const getAnimation = () => {
    switch (animation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: isInView ? 1 : 0 }
        };
      case 'scale':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: isInView ? 1 : 0.8, opacity: isInView ? 1 : 0 }
        };
      case 'rotate':
        return {
          initial: { rotate: -10, opacity: 0 },
          animate: { rotate: isInView ? 0 : -10, opacity: isInView ? 1 : 0 }
        };
      case 'flip':
        return {
          initial: { rotateX: 90, opacity: 0 },
          animate: { rotateX: isInView ? 0 : 90, opacity: isInView ? 1 : 0 }
        };
      default:
        return {
          initial: { ...getInitialPosition(), opacity: 0 },
          animate: { x: 0, y: 0, opacity: isInView ? 1 : 0 }
        };
    }
  };

  return (
    <div ref={internalRef} className={className}>
      <motion.div
        initial={getAnimation().initial}
        animate={getAnimation().animate}
        transition={{
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface ScrollRevealListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: 'fade' | 'slide' | 'scale';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function ScrollRevealList({
  children,
  className = '',
  staggerDelay = 0.1,
  animation = 'slide',
  direction = 'up'
}: ScrollRevealListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const items = React.Children.toArray(children);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 40 };
      case 'down': return { y: -40 };
      case 'left': return { x: 40 };
      case 'right': return { x: -40 };
      default: return { y: 40 };
    }
  };

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => (
        <motion.div
          key={index}
          initial={{ ...getInitialPosition(), opacity: 0 }}
          animate={isInView ? { x: 0, y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.5,
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

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxSection({ children, className = '', speed = 0.5 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const elementTop = scrollY + rect.top;
        const elementCenter = elementTop + rect.height / 2;
        const windowCenter = scrollY + window.innerHeight / 2;
        setOffsetY((elementCenter - windowCenter) * speed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offsetY}px)` }}>
      {children}
    </div>
  );
}
