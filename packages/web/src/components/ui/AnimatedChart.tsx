'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedChartProps {
  children: React.ReactNode;
  type?: 'bar' | 'line' | 'pie' | 'area';
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedChart({
  children,
  type = 'bar',
  delay = 0,
  duration = 0.5,
  className = ''
}: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const getVariants = () => {
    switch (type) {
      case 'line':
      case 'area':
        return {
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration, ease: 'easeOut' }
          }
        };
      case 'pie':
        return {
          hidden: { scale: 0, opacity: 0, rotate: -180 },
          visible: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: { duration, ease: 'easeOut' }
          }
        };
      case 'bar':
      default:
        return {
          hidden: { scaleY: 0, opacity: 0 },
          visible: {
            scaleY: 1,
            opacity: 1,
            transition: { duration, ease: 'easeOut' }
          }
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          variants={getVariants()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ChartBarProps {
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
  index?: number;
  delay?: number;
}

export function ChartBar({
  value,
  maxValue,
  label,
  color = '#0ea5e9',
  index = 0,
  delay = 0
}: ChartBarProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay + index * 0.1);
    return () => clearTimeout(timer);
  }, [delay, index]);

  const heightPercent = (value / maxValue) * 100;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative"
        initial={{ height: 0 }}
        animate={{ height: animated ? `${heightPercent}%` : 0 }}
        transition={{ duration: 0.5, delay: delay + index * 0.1, ease: 'easeOut' }}
        style={{ minHeight: '4px' }}
      >
        <motion.div
          className="absolute inset-0 rounded-t-lg"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + index * 0.1 + 0.3 }}
        />
      </motion.div>
      {label && (
        <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{label}</span>
      )}
    </div>
  );
}

interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showPercent?: boolean;
  delay?: number;
  className?: string;
}

export function AnimatedProgress({
  value,
  max = 100,
  label,
  color = '#0ea5e9',
  showPercent = true,
  delay = 0,
  className = ''
}: AnimatedProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((value / max) * 100);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, max, delay]);

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercent && (
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  delay = 0,
  formatter = (v) => v.toLocaleString(),
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration, delay]);

  return <span className={className}>{formatter(displayValue)}</span>;
}

export default AnimatedChart;
