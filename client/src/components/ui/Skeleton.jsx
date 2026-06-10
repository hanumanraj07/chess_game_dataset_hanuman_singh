import React from 'react';

const Skeleton = ({ width = '100%', height = 20, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, display: 'block' }}
  />
);

export const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}><Skeleton height={16} /></td>
    ))}
  </tr>
);

export const SkeletonCard = () => (
  <div style={{ border: 'var(--border-brutal)', padding: 'var(--space-4)', background: 'var(--color-bg-alt)' }}>
    <Skeleton height={12} width="40%" className="mb-2" style={{ marginBottom: 8 }} />
    <Skeleton height={40} width="70%" />
    <div style={{ marginTop: 8 }}>
      <Skeleton height={12} width="30%" />
    </div>
  </div>
);

export default Skeleton;
