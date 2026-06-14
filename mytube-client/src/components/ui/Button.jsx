import React from 'react';
import Spinner from './Spinner';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 outline-none focus:ring-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent/50',
    secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-hover border border-border focus:ring-border/50',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary focus:ring-bg-hover/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <Spinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
