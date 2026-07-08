import { useCallback, useRef } from 'react';
import api from '../services/api';
import { useDebate } from '../context/DebateContext';
import { debateService } from '../services/debateService';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * useSSE — Polling-based debate engine.
 * Replaces the SSE stream (which was broken on Render's free-tier proxy).
 * Each round calls POST /debate/generate-round to get all 6 persona responses
 * in parallel from the backend, then animates them one-by-one on the frontend.
 */
export const useSSE = () => {
  const { dispatch } = useDebate();
  const abortControllerRef = useRef(null);

  const startDebate = useCallback(async (topic) => {
    // Cancel any existing debate
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: 'DEBATE_START' });

    let round = 0;

    try {
      while (!controller.signal.aborted) {
        round++;

        // Fetch one full round from backend (all 6 personas in parallel server-side)
        const response = await api.post(
          `/debate/generate-round?topic=${encodeURIComponent(topic)}&round=${round}`,
          {},
          { signal: controller.signal }
        );

        if (controller.signal.aborted) break;

        const { messages } = response.data;

        // Animate messages one-by-one with typing indicator
        for (const message of messages) {
          if (controller.signal.aborted) break;

          // Show typing indicator for this persona
          dispatch({ type: 'SET_TYPING', payload: message.personaId });
          await delay(600);

          if (controller.signal.aborted) break;

          // Reveal the message
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: message.id,
              personaId: message.personaId,
              personaName: message.personaName,
              personaColor: message.personaColor,
              content: message.content,
              responseOrder: message.responseOrder,
              timestamp: message.createdAt || new Date().toISOString(),
            },
          });

          await delay(300);
        }

        if (controller.signal.aborted) break;

        // Brief pause between rounds so the user can read before the next round starts
        await delay(1500);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError' || controller.signal.aborted) {
        console.log('Debate stopped by user.');
        return;
      }
      console.error('Debate error:', err);
      dispatch({ type: 'DEBATE_ERROR', payload: err.response?.data?.message || err.message });
      return;
    }

    if (!controller.signal.aborted) {
      dispatch({ type: 'DEBATE_COMPLETE' });
    }
  }, [dispatch]);

  const stopDebate = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    try {
      await debateService.stopDebate();
    } catch (err) {
      console.warn('Backend stop signal failed (non-critical):', err.message);
    }
    dispatch({ type: 'DEBATE_COMPLETE' });
  }, [dispatch]);

  return { startDebate, stopDebate };
};
