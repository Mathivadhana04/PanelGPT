import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-heading font-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-muted pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full px-4 py-3 rounded-xl bg-surface border text-primary text-sm
            transition-all duration-200 outline-none
            focus:border-accent focus:ring-1 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-muted
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-border'}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
