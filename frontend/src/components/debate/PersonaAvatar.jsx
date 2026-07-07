import React from 'react';

export const PersonaAvatar = ({
  icon = '🤖',
  color = '#6366F1',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  isSpeaking = false,
  className = '',
  id,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  return (
    <div
      id={id}
      style={{
        backgroundColor: `${color}15`, // Glass-like backdrop
        color: color,
        borderColor: isSpeaking ? color : 'rgba(255,255,255,0.08)',
      }}
      className={`
        relative flex items-center justify-center rounded-full border
        transition-all duration-300 select-none
        ${sizeClasses[size]}
        ${isSpeaking ? 'animate-pulse-ring' : ''}
        ${className}
      `}
    >
      <span>{icon}</span>

      {isSpeaking && (
        <span
          style={{ backgroundColor: color }}
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-raised"
        />
      )}
    </div>
  );
};

export default PersonaAvatar;
