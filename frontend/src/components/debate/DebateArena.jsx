import React, { useState, useEffect, useRef } from 'react';
import { useSSE } from '../../hooks/useSSE';
import { PERSONA_LIST, PERSONAS } from '../../utils/constants';
import { exportDebateAsMarkdown, copyToClipboard } from '../../utils/helpers';
import { toast } from '../ui/Toast';
import { useDebate as useDebateState } from '../../context/DebateContext';
import { debateService } from '../../services/debateService';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Persona Panel Card (spacious and horizontal) ────────────────
const PanelDebaterCard = ({ persona, isSpeaking, isTyping }) => (
  <motion.div
    layout
    style={{
      borderColor: isSpeaking ? persona.color : 'var(--border)',
      boxShadow: isSpeaking ? `0 0 20px ${persona.color}35` : 'none',
      backgroundColor: isSpeaking ? `${persona.color}0d` : 'var(--surface)',
      color: persona.color,
    }}
    animate={{ scale: isSpeaking ? 1.03 : 1 }}
    transition={{ duration: 0.25 }}
    className={`flex items-center gap-3 p-3 rounded-xl border relative w-full overflow-hidden transition-all duration-300 ${
      isSpeaking ? 'animate-pulse-ring' : ''
    } ${isTyping ? 'border-dashed border-accent/40 animate-pulse' : ''}`}
  >
    <div
      style={{ backgroundColor: `${persona.color}15`, color: persona.color }}
      className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 relative select-none"
    >
      {persona.icon}
      {isSpeaking && (
        <span
          style={{ backgroundColor: persona.color }}
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface animate-pulse"
        />
      )}
    </div>
    
    <div className="flex-grow min-w-0 text-left">
      <h4 className="text-xs font-bold text-primary font-heading truncate leading-tight">
        {persona.name}
      </h4>
      <p style={{ color: persona.color }} className="text-[9px] font-bold uppercase tracking-wider font-heading truncate leading-tight mt-0.5">
        {persona.role}
      </p>
    </div>

    {isTyping && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5">
        <span style={{ backgroundColor: persona.color }} className="typing-dot w-1 h-1 rounded-full" />
        <span style={{ backgroundColor: persona.color }} className="typing-dot w-1 h-1 rounded-full" />
        <span style={{ backgroundColor: persona.color }} className="typing-dot w-1 h-1 rounded-full" />
      </div>
    )}
  </motion.div>
);

// ─── Clean Chat Bubble (no name, no role — ChatGPT-style) ─────────
const LiveMessage = ({ message, index }) => {
  if (message.personaId === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex gap-4 p-5 rounded-2xl border border-accent/20 bg-accent/5 relative overflow-hidden shadow-glass mt-4 w-full"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0 bg-accent/20 text-accent select-none">
          ✨
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-extrabold text-sm text-accent tracking-tight mb-2">
            AI Debate Summary
          </h4>
          <p className="text-primary text-sm leading-relaxed whitespace-pre-line select-text">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  const persona = PERSONAS[message.personaId] || { color: '#6366F1', icon: '🤖' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 items-start group"
    >
      {/* Tiny persona dot — only visual indicator, no text */}
      <div
        title={message.personaName}
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
        <p className="text-primary text-sm leading-relaxed">{message.content}</p>
      </div>
    </motion.div>
  );
};


// ─── Main DebateArena Component ───────────────────────────────────
export const DebateArena = () => {
  const {
    status,
    topic,
    messages,
    round,
    activePersonaId,
    typingPersonaId,
    setTopic,
    resetDebate,
    getDurationSeconds,
    dispatch,
  } = useDebateState();

  const { startDebate, stopDebate } = useSSE();
  const [inputTopic, setInputTopic] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const summaryTriggeredRef = useRef(false);
  const scrollContainerRef = useRef(null);

  // Auto-scroll feed only if the user is already near the bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (isAtBottom || messages.length <= 1) {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, typingPersonaId]);

  // Sync topic input
  useEffect(() => {
    if (topic) setInputTopic(topic);
  }, [topic]);

  // Auto-save to database and generate AI summary on complete/stop
  useEffect(() => {
    const handleAutoSaveAndSummary = async () => {
      // Synchronous ref check prevents double-triggering in Strict Mode
      if (status === 'complete' && messages.length > 0 && !summaryTriggeredRef.current) {
        summaryTriggeredRef.current = true;
        setIsSaving(true);

        // 1. Auto-save session to history database
        try {
          await debateService.saveDebate({
            topic,
            durationSeconds: getDurationSeconds(),
            messages: messages.map((m) => ({
              personaId: m.personaId,
              personaName: m.personaName,
              content: m.content,
              responseOrder: m.responseOrder,
            })),
          });
          setIsSaved(true);
          console.log("Debate session auto-saved successfully.");
        } catch (err) {
          console.error("Auto-save to history failed:", err);
        } finally {
          setIsSaving(false);
        }

        // 2. Fetch and append ChatGPT-style AI Summary
        try {
          const factsList = messages.map(m => m.content);
          const summaryText = await debateService.getSummary(topic, factsList);
          
          const fullSummary = 
            (summaryText || "Here is a summary of the facts generated on this topic.") + 
            "\n\n*Feel free to explore another topic! Just type it in the input bar above.*";

          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: 'summary-' + Date.now(),
              personaId: 'system',
              personaName: 'AI Summarizer',
              personaColor: '#6366F1',
              content: fullSummary,
              responseOrder: messages.length + 1,
              createdAt: new Date().toISOString(),
            }
          });
        } catch (err) {
          console.error("AI Summary generation failed:", err);
        }
      }
    };

    handleAutoSaveAndSummary();
  }, [status, messages.length, topic, getDurationSeconds, dispatch]);

  const handleStart = async (e) => {
    if (e) e.preventDefault();
    const trimmed = inputTopic.trim();
    if (!trimmed) { toast.error('Please enter a debate topic'); return; }
    setTopic(trimmed);
    setIsSaved(false);
    summaryTriggeredRef.current = false;
    await startDebate(trimmed);
  };

  const handleStop = () => {
    stopDebate();
    toast.info('Debate stopped');
  };

  const handleClear = () => {
    resetDebate();
    setInputTopic('');
    setIsSaved(false);
    summaryTriggeredRef.current = false;
  };

  const handleExport = async () => {
    if (!messages.length) { toast.error('No messages to export'); return; }
    const md = exportDebateAsMarkdown(topic, messages);
    const ok = await copyToClipboard(md);
    if (ok) toast.success('Copied as Markdown!');
  };

  const handleSave = async () => {
    if (!messages.length) return;
    setIsSaving(true);
    try {
      await debateService.saveDebate({
        topic,
        durationSeconds: getDurationSeconds(),
        messages: messages.map((m) => ({
          personaId: m.personaId,
          personaName: m.personaName,
          content: m.content,
          responseOrder: m.responseOrder,
        })),
      });
      setIsSaved(true);
      toast.success('Debate saved!');
    } catch (err) {
      toast.error('Failed to save debate');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape' && status === 'streaming') handleStop();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'e') { e.preventDefault(); handleExport(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); handleClear(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputTopic, status, messages]);

  const isStreaming = status === 'streaming';
  const isComplete = status === 'complete';
  const hasMessages = messages.length > 0;

  // Count how many personas have responded
  const respondedPersonas = new Set(messages.map(m => m.personaId));

  return (
    <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto px-2 md:px-4 py-4">

      {/* ── Topic Input Bar ── */}
      <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="flex-1 relative">
          <input
            type="text"
            id="topic-input"
            placeholder="Enter any debate topic… e.g. Should AI replace doctors?"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            disabled={isStreaming}
            className="w-full px-5 py-3.5 rounded-xl bg-surface border border-border text-primary text-sm font-medium
                       outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isStreaming ? (
            <Button variant="danger" onClick={handleStop} type="button" className="px-5 py-3.5">
              ⏹ Stop
            </Button>
          ) : (
            <Button type="submit" variant="primary" className="px-6 py-3.5">
              🔥 Debate!
            </Button>
          )}
          <Button variant="secondary" onClick={handleClear} type="button" disabled={isStreaming} className="px-4">
            ✕
          </Button>
        </div>
      </form>

      {/* ── Debater Panel (always visible, responsive grid) ── */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted font-heading font-bold uppercase tracking-wider">
            Panel Debaters
          </span>
          {isStreaming && (
            <span className="text-[10px] text-accent font-semibold animate-pulse">
              ● Live Debate in Progress
            </span>
          )}
          {isComplete && (
            <span className="text-[10px] text-emerald-400 font-semibold">
              ✓ {respondedPersonas.size}/6 Debaters Responded
            </span>
          )}
        </div>

        {/* Responsive grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {PERSONA_LIST.map((persona) => (
            <PanelDebaterCard
              key={persona.id}
              persona={persona}
              isSpeaking={activePersonaId === persona.id}
              isTyping={typingPersonaId === persona.id}
            />
          ))}
        </div>
      </div>

      {/* ── Stats Strip ── */}
      {status !== 'idle' && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-muted font-heading uppercase block">Messages</span>
            <span className="text-base font-bold text-primary font-mono">{messages.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-muted font-heading uppercase block">Round</span>
            <span className="text-base font-bold text-accent font-mono">#{round}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-muted font-heading uppercase block">Status</span>
            <span className={`text-xs font-bold font-heading ${isStreaming ? 'text-accent animate-pulse' : isComplete ? 'text-emerald-400' : 'text-muted'}`}>
              {isStreaming ? '● Live' : isComplete ? '✓ Done' : 'Idle'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border/60">
            <span className="text-[10px] text-muted font-heading uppercase block">Duration</span>
            <span className="text-base font-bold text-primary font-mono">{getDurationSeconds()}s</span>
          </div>
        </div>
      )}

      {/* ── Live Debate Feed ── */}
      {(hasMessages || typingPersonaId || isStreaming) && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-primary tracking-tight flex items-center gap-2">
              💬 Debate Feed
              {isStreaming && <span className="text-[10px] text-accent font-semibold animate-pulse">● Live</span>}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleExport} disabled={!hasMessages}>
              📥 Export
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollContainerRef}
            className="flex flex-col gap-2.5 max-h-[540px] overflow-y-auto pr-1 scroll-smooth"
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <LiveMessage key={msg.id || msg.responseOrder} message={msg} />
              ))}
            </AnimatePresence>

            {/* Typing indicators for ALL currently thinking personas */}
            {typingPersonaId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border/60 w-fit"
              >
                <span className="text-xs text-muted font-heading">
                  {PERSONAS[typingPersonaId]?.name || 'Someone'} is thinking...
                </span>
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{ backgroundColor: PERSONAS[typingPersonaId]?.color || '#6366F1', animationDelay: `${i * 0.2}s` }}
                    className="typing-dot w-1.5 h-1.5 rounded-full"
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Idle placeholder */}
          {!hasMessages && isStreaming && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted font-heading">Calling all debaters…</span>
            </div>
          )}
        </div>
      )}

      {/* ── Idle state: suggestions ── */}
      {status === 'idle' && (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] text-muted font-heading font-bold uppercase tracking-wider">
            Try one of these topics
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { label: 'Should AI replace doctors?', cat: 'Technology' },
              { label: 'Is social media harmful to democracy?', cat: 'Society' },
              { label: 'Should college education be free?', cat: 'Education' },
              { label: 'Is remote work better than office work?', cat: 'Work' },
              { label: 'Should nuclear energy be expanded?', cat: 'Energy' },
              { label: 'Is capitalism the best economic system?', cat: 'Economics' },
            ].map((t, i) => (
              <button
                key={i}
                onClick={() => setInputTopic(t.label)}
                className="text-left p-3 rounded-xl bg-surface hover:bg-surface-raised border border-border hover:border-accent/40
                           transition-all cursor-pointer flex flex-col gap-0.5 group"
              >
                <span className="text-[9px] font-bold text-accent uppercase tracking-wider font-heading">{t.cat}</span>
                <span className="text-xs text-secondary group-hover:text-primary transition-colors font-medium leading-snug">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Debate Complete Summary ── */}
      {isComplete && hasMessages && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-accent/30 bg-accent/5 flex flex-col gap-4"
        >
          <div>
            <span className="text-[10px] text-accent font-bold uppercase tracking-wider font-heading block mb-1">
              Debate Complete
            </span>
            <h3 className="text-sm font-heading font-bold text-primary">"{topic}"</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2 rounded-xl bg-surface border border-border">
              <span className="text-muted block">Duration</span>
              <span className="font-bold text-primary font-mono">{getDurationSeconds()}s</span>
            </div>
            <div className="p-2 rounded-xl bg-surface border border-border">
              <span className="text-muted block">Responses</span>
              <span className="font-bold text-primary">{messages.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-surface border border-border">
              <span className="text-muted block">Debaters</span>
              <span className="font-bold text-primary">{respondedPersonas.size}</span>
            </div>
            <div className="p-2 rounded-xl bg-surface border border-border">
              <span className="text-muted block">Words</span>
              <span className="font-bold text-primary">
                {messages.reduce((a, m) => a + m.content.split(/\s+/).length, 0)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isSaved ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold font-heading transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving…' : '💾 Save to History'}
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ✓ Saved
              </span>
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-raised text-secondary text-xs font-semibold font-heading transition-all cursor-pointer"
            >
              📥 Export Markdown
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-surface-raised text-secondary text-xs font-semibold font-heading transition-all cursor-pointer"
            >
              🔄 New Debate
            </button>
          </div>
        </motion.div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted font-mono pt-1">
        <span><kbd className="bg-surface border border-border px-1 rounded">Ctrl+E</kbd> Export</span>
        <span><kbd className="bg-surface border border-border px-1 rounded">Ctrl+K</kbd> Clear</span>
        <span><kbd className="bg-surface border border-border px-1 rounded">Esc</kbd> Stop</span>
      </div>
    </div>
  );
};

export default DebateArena;
