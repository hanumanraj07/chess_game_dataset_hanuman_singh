import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span>
          <span>LOADING…</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
