import React, { createContext, useContext, useReducer, useCallback } from 'react';

const initialState = {
  status: 'idle',       // idle | streaming | complete | error
  topic: '',
  messages: [],         // unlimited — no cap
  activePersonaId: null,
  typingPersonaId: null,
  round: 0,
  startTime: null,
  endTime: null,
  error: null,
};

const debateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOPIC':
      return { ...state, topic: action.payload };

    case 'DEBATE_START':
      return {
        ...initialState,
        topic: state.topic,
        status: 'streaming',
        startTime: Date.now(),
      };

    case 'SET_TYPING':
      return { ...state, typingPersonaId: action.payload };

    case 'ADD_MESSAGE': {
      // Track round: every 6 new messages = 1 new round
      const newMessages = [...state.messages, action.payload];
      const newRound = Math.floor(newMessages.length / 6) + 1;
      return {
        ...state,
        messages: newMessages,
        typingPersonaId: null,
        activePersonaId: action.payload.personaId,
        round: newRound,
      };
    }

    case 'DEBATE_COMPLETE':
      return { ...state, status: 'complete', typingPersonaId: null, endTime: Date.now() };

    case 'DEBATE_ERROR':
      return { ...state, status: 'error', error: action.payload, typingPersonaId: null };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
};

const DebateContext = createContext(null);

export const DebateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(debateReducer, initialState);

  const setTopic = useCallback((topic) => dispatch({ type: 'SET_TOPIC', payload: topic }), []);
  const resetDebate = useCallback(() => dispatch({ type: 'RESET' }), []);

  const getDurationSeconds = () => {
    if (!state.startTime) return 0;
    const end = state.endTime || Date.now();
    return Math.floor((end - state.startTime) / 1000);
  };

  return (
    <DebateContext.Provider value={{ ...state, dispatch, setTopic, resetDebate, getDurationSeconds }}>
      {children}
    </DebateContext.Provider>
  );
};

export const useDebate = () => {
  const ctx = useContext(DebateContext);
  if (!ctx) throw new Error('useDebate must be used within DebateProvider');
  return ctx;
};

export default DebateContext;
