import React from 'react';

export const Loader = ({
  variant = 'full', // 'full' | 'inline' | 'skeleton'
  className = '',
  id,
}) => {
  if (variant === 'full') {
    return (
      <div
        id={id}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-md ${className}`}
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <h3 className="mt-4 font-heading font-semibold text-secondary animate-pulse">Loading PanelGPT...</h3>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div id={id} className={`flex flex-col gap-3 w-full ${className}`}>
        <div className="h-5 skeleton w-1/3"></div>
        <div className="h-24 skeleton w-full"></div>
      </div>
    );
  }

  return (
    <div id={id} className={`inline-flex items-center justify-center ${className}`}>
      <svg className="animate-spin h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
};

export default Loader;
