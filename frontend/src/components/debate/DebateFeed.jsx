import React, { useEffect, useRef } from 'react';
import DebateMessage from './DebateMessage';
import TypingIndicator from './TypingIndicator';

export const DebateFeed = ({
  messages = [],
  typingPersonaId = null,
  id,
}) => {
  const bottomRef = useRef(null);

  // Auto-scroll to the bottom when messages or typing states change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingPersonaId]);

  return (
    <div
      id={id}
      className="flex-1 overflow-y-auto px-1 py-2 flex flex-col gap-4 max-h-[600px] min-h-[300px] border border-border/40 rounded-2xl bg-bg-secondary/40 p-4"
    >
      {messages.length === 0 && !typingPersonaId ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <span className="text-4xl mb-3">🎙️</span>
          <h4 className="font-heading font-bold text-primary tracking-tight">The Stage is Set</h4>
          <p className="text-xs text-muted max-w-[280px] mt-1.5 leading-relaxed">
            Enter a topic above and initiate the debate to start streaming responses.
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <DebateMessage key={message.id || message.responseOrder} message={message} />
          ))}

          {typingPersonaId && (
            <div className="pl-4">
              <TypingIndicator personaId={typingPersonaId} />
            </div>
          )}
          
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default DebateFeed;
