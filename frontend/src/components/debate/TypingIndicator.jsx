import React from 'react';
import { PERSONAS } from '../../utils/constants';

export const TypingIndicator = ({
  personaId,
  id,
}) => {
  const persona = PERSONAS[personaId] || { name: 'Someone', color: '#6366F1' };

  return (
    <div
      id={id}
      className="flex items-center gap-3 p-4 rounded-xl bg-surface/50 border border-border border-dashed w-fit animate-pulse"
    >
      <span className="text-xs font-medium font-heading text-secondary">
        {persona.name} is formulating arguments...
      </span>
      <div className="flex gap-1">
        <div style={{ backgroundColor: persona.color }} className="typing-dot w-2 h-2 rounded-full" />
        <div style={{ backgroundColor: persona.color }} className="typing-dot w-2 h-2 rounded-full" />
        <div style={{ backgroundColor: persona.color }} className="typing-dot w-2 h-2 rounded-full" />
      </div>
    </div>
  );
};

export default TypingIndicator;
