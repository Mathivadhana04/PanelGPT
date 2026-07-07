import { useCallback, useRef } from 'react';
import { getToken } from '../services/api';
import { useDebate } from '../context/DebateContext';
import { debateService } from '../services/debateService';

/**
 * useSSE — SSE hook using fetch + ReadableStream (supports Authorization header)
 * Falls back to EventSource-compatible parsing
 */
export const useSSE = () => {
  const { dispatch } = useDebate();
  const abortControllerRef = useRef(null);

  const startDebate = useCallback(async (topic) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: 'DEBATE_START' });

    const token = getToken();
    const url = `/api/debate/stream?topic=${encodeURIComponent(topic)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventName = null;
        let eventData = null;

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            eventData = line.slice(5).trim();
          } else if (line === '' && eventName && eventData) {
            // Process complete event
            try {
              const parsed = JSON.parse(eventData);
              handleSSEEvent(eventName, parsed, dispatch);
            } catch (e) {
              console.warn('Failed to parse SSE event data:', eventData);
            }
            eventName = null;
            eventData = null;
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        console.log('Debate stream cancelled');
        return;
      }
      console.error('SSE error:', err);
      dispatch({ type: 'DEBATE_ERROR', payload: err.message });
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
      console.warn('Failed to send backend stop signal:', err);
    }
    dispatch({ type: 'DEBATE_COMPLETE' });
  }, [dispatch]);

  return { startDebate, stopDebate };
};

function handleSSEEvent(eventName, data, dispatch) {
  switch (eventName) {
    case 'DEBATE_START':
      // Already handled by startDebate
      break;

    case 'PERSONA_TYPING':
      dispatch({ type: 'SET_TYPING', payload: data.personaId });
      break;

    case 'DEBATE_MESSAGE':
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: data.id,
          personaId: data.personaId,
          personaName: data.personaName,
          personaColor: data.personaColor,
          content: data.content,
          responseOrder: data.responseOrder,
          timestamp: data.createdAt || new Date().toISOString(),
        },
      });
      break;

    case 'DEBATE_COMPLETE':
      dispatch({ type: 'DEBATE_COMPLETE' });
      break;

    case 'DEBATE_ERROR':
      dispatch({ type: 'DEBATE_ERROR', payload: data.message });
      break;

    default:
      console.log('Unknown SSE event:', eventName, data);
  }
}
