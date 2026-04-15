'use client';

import React from 'react';

interface SkeletonTextProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function SkeletonText({
  width = '100%',
  height = '1rem',
  className = '',
}: SkeletonTextProps) {
  return (
    <div
      className={`h-${typeof height === 'number' ? height : '4'} w-full animate-pulse bg-gray-200 rounded ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}