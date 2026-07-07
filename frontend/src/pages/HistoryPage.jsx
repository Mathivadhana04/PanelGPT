import React, { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';
import { formatDate, formatDuration, extractKeyPhrases } from '../utils/helpers';
import { PERSONAS } from '../utils/constants';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { toast } from '../components/ui/Toast';

export const HistoryPage = () => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDebate, setActiveDebate] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await historyService.getHistory(page, 10);
      setDebates(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Failed to load debate history');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDebate = async (id) => {
    setActiveLoading(true);
    try {
      const detail = await historyService.getDebate(id);
      setActiveDebate(detail);
    } catch (err) {
      toast.error('Failed to load debate details');
    } finally {
      setActiveLoading(false);
    }
  };

  const handleDeleteDebate = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this debate session?')) return;

    try {
      await historyService.deleteDebate(id);
      toast.success('Debate deleted successfully');
      if (activeDebate?.id === id) {
        setActiveDebate(null);
      }
      fetchHistory();
    } catch (err) {
      toast.error('Failed to delete debate');
    }
  };

  // Filter local debates by search query
  const filteredDebates = debates.filter((d) =>
    d.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 w-full bg-transparent min-h-[calc(100vh-73px)] py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-primary tracking-tight">
            Debate History
          </h2>
          <p className="text-xs md:text-sm text-secondary">
            Review past debates, arguments, and summaries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* History List Side */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <input
              type="text"
              placeholder="🔍 Search debates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-primary text-sm outline-none focus:border-accent"
            />

            {loading ? (
              <Loader variant="skeleton" />
            ) : filteredDebates.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface border border-border/80">
                <span className="text-2xl mb-2 block">🤷</span>
                <p className="text-sm font-semibold text-secondary">No debates found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredDebates.map((debate) => {
                  const isActive = activeDebate?.id === debate.id;
                  return (
                    <div
                      key={debate.id}
                      onClick={() => handleSelectDebate(debate.id)}
                      className={`
                        p-4 rounded-xl border text-left cursor-pointer transition-all duration-200
                        ${isActive
                          ? 'border-accent bg-accent/5 shadow-glow-indigo'
                          : 'border-border bg-surface hover:bg-surface-raised'
                        }
                      `}
                    >
                      <h4 className="text-sm font-heading font-bold text-primary line-clamp-2 leading-snug">
                        {debate.topic}
                      </h4>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-muted font-medium">
                        <span>{formatDate(debate.createdAt)}</span>
                        <div className="flex items-center gap-3">
                          <span>⏱ {formatDuration(debate.durationSeconds)}</span>
                          <button
                            onClick={(e) => handleDeleteDebate(debate.id, e)}
                            className="text-red-400 hover:text-red-500 transition-colors p-1"
                            title="Delete Debate"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-2 px-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-secondary font-medium">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Debate Content Details Side */}
          <div className="lg:col-span-2">
            {activeLoading ? (
              <div className="p-20 text-center rounded-2xl bg-surface border border-border flex items-center justify-center">
                <Loader variant="inline" />
              </div>
            ) : activeDebate ? (
              <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6 animate-debate-appear shadow-glass">
                {/* Details Header */}
                <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider font-heading">
                    History Record
                  </span>
                  <h3 className="text-xl font-heading font-bold text-primary tracking-tight">
                    {activeDebate.topic}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs text-secondary font-mono mt-1">
                    <span>Date: {formatDate(activeDebate.createdAt)}</span>
                    <span>Duration: {formatDuration(activeDebate.durationSeconds)}</span>
                    <span>Messages: {activeDebate.messages?.length}</span>
                  </div>
                </div>

                {/* Key Phrases */}
                {activeDebate.messages && (
                  <div className="flex flex-wrap gap-1.5">
                    {extractKeyPhrases(activeDebate.messages).map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-bg-secondary border border-border text-[10px] text-muted font-mono"
                      >
                        #{phrase}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Log */}
                <div className="flex flex-col gap-3 mt-2">
                  {activeDebate.messages?.map((msg, i) => {
                    const persona = PERSONAS[msg.personaId] || { icon: '🤖', color: '#6366F1' };
                    return (
                      <div
                        key={msg.id || i}
                        className="flex gap-3 items-start w-full"
                      >
                        {/* Tiny persona dot */}
                        <div
                          title={msg.personaName}
                          style={{ backgroundColor: `${persona.color}22`, color: persona.color }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 select-none"
                        >
                          {persona.icon}
                        </div>

                        {/* Bubble */}
                        <div
                          style={{ borderLeftColor: persona.color }}
                          className="flex-1 bg-surface border border-border/60 border-l-2 rounded-r-2xl rounded-bl-2xl px-4 py-3 min-w-0"
                        >
                          <p className="text-primary text-sm leading-relaxed whitespace-pre-wrap select-text">
                            {msg.content || "(Empty statement)"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-20 text-center rounded-2xl bg-surface border border-border border-dashed text-muted">
                <span className="text-4xl mb-3 block">📖</span>
                <h4 className="font-heading font-bold text-secondary text-sm">No Debate Selected</h4>
                <p className="text-xs text-muted max-w-[300px] mx-auto mt-1.5 leading-relaxed">
                  Select a past session from the list on the left to read its full transcript and debate analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
