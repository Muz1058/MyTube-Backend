import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        className={`w-full rounded-lg border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent ${
          error ? 'border-red-500 focus:border-red-500' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
