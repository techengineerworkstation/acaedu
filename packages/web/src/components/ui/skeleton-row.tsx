'use client';

import React from 'react';
import SkeletonText from './skeleton-text';

interface SkeletonRowProps {
  columns: Array<{ key: string; width?: string | number }>;
  className?: string;
}

export default function SkeletonRow({
  columns,
  className = '',
}: SkeletonRowProps) {
  return (
    <tr className={className}>
      {columns.map((col, index) => (
        <td
          key={index}
          className={`px-6 py-4 whitespace-nowrap text-sm`}
        >
          <SkeletonText
            width={col.width ?? '100%'}
            height="1rem"
          />
        </td>
      ))}
    </tr>
  );
}