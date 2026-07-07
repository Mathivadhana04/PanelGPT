import React from 'react';
import { extractKeyPhrases, formatDuration } from '../../utils/helpers';
import { PERSONAS } from '../../utils/constants';

export const DebateRecapCard = ({
  topic,
  messages,
  durationSeconds,
  onSave,
  isSaved = false,
  isSaving = false,
  id,
}) => {
  const keyPhrases = extractKeyPhrases(messages);
  const uniquePersonasUsed = Array.from(new Set(messages.map(m => m.personaId)));

  return (
    <div
      id={id}
      className="p-6 rounded-2xl glass border border-accent/20 bg-accent/5 flex flex-col gap-5 animate-debate-appear relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider font-heading">
          Debate Summary
        </span>
        <h3 className="text-lg font-heading font-bold text-primary tracking-tight">
          Recap of: {topic}
        </h3>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 border-y border-border/50">
        <div>
          <span className="text-[10px] text-muted font-heading uppercase block">Duration</span>
          <span className="text-sm font-semibold text-primary font-mono">{formatDuration(durationSeconds)}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted font-heading uppercase block">Responses</span>
          <span className="text-sm font-semibold text-primary font-mono">{messages.length}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted font-heading uppercase block">Personas</span>
          <span className="text-sm font-semibold text-primary font-mono">{uniquePersonasUsed.length}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted font-heading uppercase block">Words Generated</span>
          <span className="text-sm font-semibold text-primary font-mono">
            {messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0)}
          </span>
        </div>
      </div>

      {/* Personas Involved */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-secondary uppercase font-heading tracking-wider">
          Debaters
        </span>
        <div className="flex flex-wrap gap-2">
          {uniquePersonasUsed.map(pid => {
            const persona = PERSONAS[pid] || { name: pid, color: '#6366F1', icon: '🤖' };
            return (
              <div
                key={pid}
                style={{ borderColor: `${persona.color}30`, backgroundColor: `${persona.color}08` }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs text-secondary"
              >
                <span>{persona.icon}</span>
                <span className="font-heading font-medium text-primary text-[11px]">{persona.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extracted Key Phrases */}
      {keyPhrases.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-secondary uppercase font-heading tracking-wider">
            Key Concepts Discussed
          </span>
          <div className="flex flex-wrap gap-1.5">
            {keyPhrases.map((phrase, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-surface border border-border text-xs text-secondary font-mono"
              >
                #{phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {!isSaved && onSave && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="mt-2 w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-heading font-semibold text-sm shadow-glow-indigo transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Saving to History...' : '💾 Save this Debate to History'}
        </button>
      )}
      {isSaved && (
        <div className="mt-2 text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold font-heading">
          ✓ Debate Session successfully saved to Cloud history!
        </div>
      )}
    </div>
  );
};

export default DebateRecapCard;
