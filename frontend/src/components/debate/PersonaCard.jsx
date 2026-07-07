import React from 'react';
import PersonaAvatar from './PersonaAvatar';

export const PersonaCard = ({
  persona,
  isSpeaking = false,
  isTyping = false,
  onClick,
  className = '',
  id,
}) => {
  const { name, role, color, icon, description } = persona;

  return (
    <div
      id={id}
      onClick={onClick}
      style={{
        borderColor: isSpeaking ? color : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isSpeaking ? `0 0 20px ${color}40` : 'none',
      }}
      className={`
        relative p-5 rounded-2xl bg-surface border flex flex-col items-center text-center
        transition-all duration-300 select-none group
        ${isSpeaking ? 'bg-surface-raised scale-[1.02]' : 'hover:border-border-subtle hover:bg-surface-raised/40 cursor-pointer'}
        ${className}
      `}
    >
      {/* Dynamic speak/pulse ring behind avatar */}
      <PersonaAvatar
        icon={icon}
        color={color}
        size="lg"
        isSpeaking={isSpeaking}
        className="mb-4"
      />

      <h4 className="font-heading font-bold text-primary tracking-tight">{name}</h4>
      <p style={{ color: color }} className="text-xs font-semibold uppercase tracking-wider font-heading mt-1">
        {role}
      </p>
      
      <p className="text-xs text-muted mt-3 line-clamp-2 max-w-[200px]">
        {description}
      </p>

      {isTyping && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-surface-raised px-2.5 py-1 rounded-full border border-border">
          <div style={{ backgroundColor: color }} className="typing-dot" />
          <div style={{ backgroundColor: color }} className="typing-dot" />
          <div style={{ backgroundColor: color }} className="typing-dot" />
        </div>
      )}
    </div>
  );
};

export default PersonaCard;
