'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

type IconName = keyof typeof Icons;

interface Icon3DProps {
  icon: IconName | React.ElementType;
  size?: number;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
  depth?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  color?: string;
  bgColor?: string;
}

const depthConfig = {
  sm: { translateY: 2, shadowBlur: 4, shadowOffset: 2 },
  md: { translateY: 4, shadowBlur: 8, shadowOffset: 4 },
  lg: { translateY: 6, shadowBlur: 12, shadowOffset: 6 },
  xl: { translateY: 8, shadowBlur: 16, shadowOffset: 8 }
};

const variantColors = {
  primary: { shadow: 'rgba(14, 165, 233, 0.5)', glow: 'rgba(14, 165, 233, 0.3)' },
  secondary: { shadow: 'rgba(107, 114, 128, 0.5)', glow: 'rgba(107, 114, 128, 0.3)' },
  success: { shadow: 'rgba(16, 185, 129, 0.5)', glow: 'rgba(16, 185, 129, 0.3)' },
  warning: { shadow: 'rgba(245, 158, 11, 0.5)', glow: 'rgba(245, 158, 11, 0.3)' },
  danger: { shadow: 'rgba(239, 68, 68, 0.5)', glow: 'rgba(239, 68, 68, 0.3)' },
  gradient: { shadow: 'rgba(139, 92, 246, 0.5)', glow: 'rgba(139, 92, 246, 0.3)' }
};

export default function Icon3D({
  icon,
  size = 24,
  className = '',
  onClick,
  variant = 'primary',
  depth = 'md',
  animate = false,
  color,
  bgColor
}: Icon3DProps) {
  const config = depthConfig[depth];
  const colors = variantColors[variant];
  const IconComponent = typeof icon === 'string' ? Icons[icon as IconName] : icon;

  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found`);
    return null;
  }

  const Icon = IconComponent as React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  
  const iconElement = (
    <Icon
      size={size}
      className={className}
      style={{ color: color ?? undefined }}
    />
  );

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: bgColor ? '12px' : '8px',
    borderRadius: '12px',
    backgroundColor: bgColor ?? 'transparent',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative'
  };

  const iconContainerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    filter: `drop-shadow(0 ${config.translateY}px ${config.shadowBlur}px ${colors.shadow})`
  };

  if (animate) {
    return (
      <motion.div
        style={containerStyle}
        onClick={onClick}
        whileHover={{
          y: -config.translateY,
          transition: { duration: 0.2, type: 'spring', stiffness: 300 }
        }}
        whileTap={{ scale: 0.95 }}
        className="icon-3d-animated"
      >
        <motion.div
          style={iconContainerStyle}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          whileHover={{ 
            filter: `drop-shadow(0 ${config.translateY * 2}px ${config.shadowBlur * 2}px ${colors.glow})`,
          }}
        >
          {iconElement}
        </motion.div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '4px',
            background: `radial-gradient(ellipse at center, ${colors.shadow} 0%, transparent 70%)`,
            filter: 'blur(4px)',
            opacity: 0.6
          }}
        />
      </motion.div>
    );
  }

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      className={`icon-3d icon-3d-${variant} ${onClick ? 'cursor-pointer' : ''} transition-transform duration-200 hover:-translate-y-1`}
    >
      <div style={iconContainerStyle}>
        {iconElement}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '4px',
          background: `radial-gradient(ellipse at center, ${colors.shadow} 0%, transparent 70%)`,
          filter: 'blur(4px)',
          opacity: 0.6
        }}
      />
    </div>
  );
}

interface Icon3DCardProps {
  icon: IconName | React.ElementType;
  title: string;
  description?: string;
  size?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
  onClick?: () => void;
  className?: string;
}

export function Icon3DCard({
  icon,
  title,
  description,
  size = 24,
  variant = 'primary',
  onClick,
  className = ''
}: Icon3DCardProps) {
  const colors = variantColors[variant];

  return (
    <motion.div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer ${className}`}
      whileHover={{ 
        y: -4,
        boxShadow: `0 20px 40px -10px ${colors.shadow}`,
        borderColor: colors.shadow
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-4">
        <Icon3D
          icon={icon}
          size={size}
          variant={variant}
          depth="lg"
          animate
          bgColor={`${colors.shadow}20`}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface Icon3DGridProps {
  items: Array<{
    icon: IconName | React.ElementType;
    title: string;
    description?: string;
    onClick?: () => void;
  }>;
  columns?: 2 | 3 | 4;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
}

export function Icon3DGrid({ items, columns = 3, variant = 'primary' }: Icon3DGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Icon3DCard
            icon={item.icon}
            title={item.title}
            description={item.description}
            variant={variant}
            onClick={item.onClick}
          />
        </motion.div>
      ))}
    </div>
  );
}
