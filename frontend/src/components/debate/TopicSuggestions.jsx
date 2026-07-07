import React, { useState, useEffect } from 'react';
import { TOPIC_SUGGESTIONS } from '../../utils/constants';

export const TopicSuggestions = ({
  onSelectTopic,
  id,
}) => {
  const [suggestions, setSuggestions] = useState([]);

  // Get 6 random topic suggestions on mount
  useEffect(() => {
    shuffleSuggestions();
  }, []);

  const shuffleSuggestions = () => {
    const shuffled = [...TOPIC_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 6));
  };

  return (
    <div id={id} className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
          Suggested Topics
        </span>
        <button
          onClick={shuffleSuggestions}
          className="text-xs text-accent hover:text-accent-hover font-semibold transition-colors flex items-center gap-1 cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {suggestions.map((topic, i) => (
          <button
            key={i}
            onClick={() => onSelectTopic(topic.label)}
            className="text-left p-3.5 rounded-xl bg-surface hover:bg-surface-raised border border-border hover:border-border-subtle transition-all duration-200 cursor-pointer flex flex-col gap-1 group"
          >
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider font-heading">
              {topic.category}
            </span>
            <span className="text-xs text-secondary group-hover:text-primary transition-colors font-medium line-clamp-1">
              {topic.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSuggestions;
