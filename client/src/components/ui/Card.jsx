import React from 'react';

const Card = ({ children, className = '', style = {} }) => (
  <div className={`brutal-card ${className}`} style={style}>
    {children}
  </div>
);

export const StatCard = ({ label, value, sub, icon: Icon, accentColor }) => (
  <div className="stat-card" style={accentColor ? { '--accent': accentColor } : {}}>
    {accentColor && (
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 6,
        height: '100%', background: accentColor,
      }} />
    )}
    {!accentColor && <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: 'var(--color-green)' }} />}
    {Icon && <div className="stat-icon"><Icon size={32} strokeWidth={1.5} /></div>}
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? '—'}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

export default Card;
