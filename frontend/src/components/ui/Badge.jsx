import React from 'react';

export const Badge = ({
  children,
  color = '#6366F1',
  className = '',
  id,
}) => {
  return (
    <span
      id={id}
      style={{
        backgroundColor: `${color}15`, // 8% opacity for glass background
        borderColor: `${color}40`, // border with opacity
        color: color,
      }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        border transition-colors duration-150 select-none
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
