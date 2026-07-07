import React from 'react';
import { motion } from 'framer-motion';
import { PERSONAS } from '../../utils/constants';

export const DebateMessage = ({
  message,
  id,
}) => {
  const { personaId, personaName, content } = message;
  const persona = PERSONAS[personaId] || { color: '#6366F1', icon: '🤖' };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 items-start group w-full"
    >
      {/* Tiny persona dot indicating the perspective */}
      <div
        title={personaName}
        style={{ backgroundColor: `${persona.color}22`, color: persona.color }}
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 select-none"
      >
        {persona.icon}
      </div>

      {/* Bubble — just the text, clean and minimal */}
      <div
        style={{ borderLeftColor: persona.color }}
        className="flex-1 bg-surface border border-border/60 border-l-2 rounded-r-2xl rounded-bl-2xl px-4 py-3 min-w-0"
      >
        <p className="text-primary text-sm leading-relaxed whitespace-pre-wrap select-text">
          {content || "(Empty statement)"}
        </p>
      </div>
    </motion.div>
  );
};

export default DebateMessage;
