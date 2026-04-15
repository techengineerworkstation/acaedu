'use client';

import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_COLOR = '#0ea5e9';
const DEFAULT_SECONDARY_COLOR = '#8b5cf6';

interface FractalBackgroundProps {
  color?: string;
  secondaryColor?: string;
  className?: string;
}

export default function FractalBackground({ 
  color = DEFAULT_COLOR, 
  secondaryColor = DEFAULT_SECONDARY_COLOR,
  className = '' 
}: FractalBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Primary gradient orb */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
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
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Secondary orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${secondaryColor}15 0%, transparent 70%)`,
          left: '10%',
          top: '20%',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          right: '5%',
          bottom: '10%',
        }}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${secondaryColor}10 0%, transparent 70%)`,
          right: '30%',
          top: '10%',
        }}
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      {/* Fractal triangles */}
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={`triangle-${i}`}
          className="absolute"
          style={{
            left: `${(i * 4.5) % 92}%`,
            top: `${(i * 7) % 85}%`,
            width: 0,
            height: 0,
            borderLeft: i % 3 === 0 ? '30px solid transparent' : i % 3 === 1 ? '20px solid transparent' : '25px solid transparent',
            borderRight: i % 3 === 0 ? '30px solid transparent' : i % 3 === 1 ? '20px solid transparent' : '25px solid transparent',
            borderBottom: `50px solid ${i % 2 === 0 ? color : secondaryColor}08`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.6, 0.2],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25 + i * 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.8,
          }}
        />
      ))}

      {/* Floating particles */}
      {[...Array(45)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 3,
            height: i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 3,
            background: i % 2 === 0 ? color : secondaryColor,
            left: `${(i * 7 + Math.sin(i) * 10) % 100}%`,
            top: `${(i * 11 + Math.cos(i) * 15) % 100}%`,
          }}
          animate={{
            y: [0, -150, 0],
            x: [0, Math.sin(i * 0.8) * 60, 0],
            scale: [0.3, 1.2, 0.3],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 6 + (i % 6),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Animated lines */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? color : secondaryColor}30, transparent)`,
            width: `${200 + (i % 3) * 50}px`,
            left: `${(i * 7) % 100}%`,
            top: `${10 + (i * 6) % 80}%`,
          }}
          animate={{
            x: [-200, 500],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        />
      ))}

      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="fractal-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={color} strokeWidth="0.5" />
            <path d="M 0 0 L 80 80" fill="none" stroke={secondaryColor} strokeWidth="0.3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fractal-grid)" />
      </svg>

      {/* Animated wave at bottom - using CSS animation */}
      <svg
        className="absolute bottom-0 left-0 w-full h-40"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        <defs>
          <style>{`
            @keyframes wave1 {
              0%, 100% { d: path("M0,80 C360,140 720,20 1080,80 C1260,110 1380,50 1440,80 L1440,160 L0,160 Z"); }
              50% { d: path("M0,100 C360,60 720,140 1080,60 C1260,90 1380,120 1440,80 L1440,160 L0,160 Z"); }
            }
            @keyframes wave2 {
              0%, 100% { d: path("M0,120 C400,80 800,160 1440,100 L1440,160 L0,160 Z"); }
              50% { d: path("M0,100 C400,150 800,70 1440,120 L1440,160 L0,160 Z"); }
            }
            .wave1 { animation: wave1 12s ease-in-out infinite; }
            .wave2 { animation: wave2 15s ease-in-out infinite; animation-delay: 2s; }
          `}</style>
        </defs>
        <path
          className="wave1"
          d="M0,80 C360,140 720,20 1080,80 C1260,110 1380,50 1440,80 L1440,160 L0,160 Z"
          fill={color}
          fillOpacity="0.08"
        />
        <path
          className="wave2"
          d="M0,120 C400,80 800,160 1440,100 L1440,160 L0,160 Z"
          fill={secondaryColor}
          fillOpacity="0.05"
        />
      </svg>

      {/* Rotating circles */}
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          className="absolute rounded-full border-2"
          style={{
            width: (i + 1) * 100,
            height: (i + 1) * 100,
            borderColor: `${i % 2 === 0 ? color : secondaryColor}15`,
            left: '50%',
            top: '50%',
          }}
          animate={{
            rotate: i % 2 === 0 ? [0, 360] : [360, 0],
            scale: [1, 1.08, 1],
            x: [-50, 50, -50],
          }}
          transition={{
            duration: 25 + i * 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating dots pattern */}
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 3 === 0 ? color : i % 3 === 1 ? secondaryColor : `${color}80`,
            left: `${(i * 5 + Math.random() * 3) % 95}%`,
            top: `${(i * 7 + Math.random() * 5) % 90}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [0.6, 1.4, 0.6],
            x: [0, Math.sin(i * 0.5) * 20, 0],
          }}
          transition={{
            duration: 3 + (i % 5),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Rotating geometric shapes */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute"
          style={{
            left: `${(i * 8) % 85}%`,
            top: `${(i * 12) % 75}%`,
            width: 0,
            height: 0,
            borderLeft: i % 2 === 0 ? '25px solid transparent' : '20px solid transparent',
            borderRight: i % 2 === 0 ? '25px solid transparent' : '20px solid transparent',
            borderTop: i % 2 === 0 ? `40px solid ${color}08` : `35px solid ${secondaryColor}08`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 18 + i * 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 1.2,
          }}
        />
      ))}

      {/* Extra sparkle particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            width: i % 2 === 0 ? 2 : 1,
            height: i % 2 === 0 ? 2 : 1,
            background: i % 2 === 0 ? color : secondaryColor,
            left: `${(i * 11) % 98}%`,
            top: `${(i * 13) % 95}%`,
            borderRadius: '50%',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + (i % 3),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

export function GradientBackground({ 
  color = DEFAULT_COLOR, 
  secondaryColor = DEFAULT_SECONDARY_COLOR,
  className = '' 
}: { 
  color?: string;
  secondaryColor?: string;
  className?: string 
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full"
        style={{ background: `linear-gradient(135deg, ${color}15 0%, ${secondaryColor}15 100%)` }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full"
        style={{ background: `linear-gradient(135deg, ${color}10 0%, ${secondaryColor}10 100%)` }}
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />
    </div>
  );
}
