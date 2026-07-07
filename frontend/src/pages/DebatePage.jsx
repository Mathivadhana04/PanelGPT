import React from 'react';
import DebateArena from '../components/debate/DebateArena';

export const DebatePage = () => {
  return (
    <div className="flex-1 w-full bg-transparent min-h-[calc(100vh-73px)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-primary tracking-tight">
            Debate Stage
          </h2>
          <p className="text-xs md:text-sm text-secondary">
            Pitch any topic to your AI panel and watch them discuss
          </p>
        </div>

        <DebateArena />
      </div>
    </div>
  );
};

export default DebatePage;
