'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
}

export default function FloatingParticles({
  count = 20,
  className = '',
  colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  minSize = 4,
  maxSize = 20,
  minDuration = 15,
  maxDuration = 30
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay: Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);
  }, [count, colors, minSize, maxSize, minDuration, maxDuration]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: 0.3
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

interface PulseRingProps {
  size?: number;
  color?: string;
  className?: string;
}

export function PulseRing({ size = 100, color = '#0ea5e9', className = '' }: PulseRingProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: color, width: size, height: size }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.8, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
      <motion.div
        className="absolute rounded-full border-2"
        style={{ borderColor: color, width: size, height: size }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.8, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
          ease: 'easeOut'
        }}
      />
      <motion.div
        className="absolute rounded-full border-2"
        style={{ borderColor: color, width: size, height: size }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.8, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1,
          ease: 'easeOut'
        }}
      />
    </div>
  );
}

interface BouncingDotsProps {
  count?: number;
  color?: string;
  size?: number;
  className?: string;
}

export function BouncingDots({ count = 3, color = '#0ea5e9', size = 10, className = '' }: BouncingDotsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
          animate={{
            y: [0, -10, 0]
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
}

interface TypingIndicatorProps {
  color?: string;
  className?: string;
}

export function TypingIndicator({ color = '#0ea5e9', className = '' }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

interface ConfettiProps {
  isActive: boolean;
  colors?: string[];
  particleCount?: number;
  className?: string;
}

export function Confetti({ isActive, colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'], particleCount = 50, className = '' }: ConfettiProps) {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5
    }));
  }, [colors, particleCount]);

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3"
          style={{
            left: `${particle.x}%`,
            top: '-10px',
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
          initial={{ rotate: particle.rotation, opacity: 1 }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [particle.rotation, particle.rotation + 720],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            ease: 'easeIn',
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
}
