import React from 'react';

const Badge = ({ children, variant = 'outline', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
