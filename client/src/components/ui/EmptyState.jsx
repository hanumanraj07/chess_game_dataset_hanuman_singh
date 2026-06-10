import React from 'react';

export const EmptyState = ({ title = 'NO DATA FOUND', message = 'Nothing to display here.', icon = '♟' }) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

export const ErrorState = ({ title = 'SOMETHING BROKE.', message = 'An error occurred.', onRetry }) => (
  <div className="error-state">
    <span className="error-icon">⚠</span>
    <h3>{title}</h3>
    <p style={{ marginBottom: 'var(--space-4)' }}>{message}</p>
    {onRetry && (
      <button className="btn btn-secondary btn-sm" onClick={onRetry}>
        ↺ RETRY
      </button>
    )}
  </div>
);

export default EmptyState;
