'use client';

import React from 'react';
import SkeletonText from './skeleton-text';

interface SkeletonCardProps {
  className?: string;
  titleWidth?: string | number;
  contentWidth?: string | number;
  titleHeight?: string | number;
  contentHeight?: string | number;
  lines?: number;
}

export default function SkeletonCard({
  className = '',
  titleWidth = '60%',
  contentWidth = '100%',
  titleHeight = '1.5rem',
  contentHeight = '1rem',
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="space-y-4">
        <SkeletonText
          width={titleWidth}
          height={titleHeight}
          className="mb-2"
        />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <SkeletonText
              key={index}
              width={contentWidth}
              height={contentHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}