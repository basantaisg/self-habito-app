import { useState, useEffect, useCallback, useRef } from 'react';

export type StopwatchStatus = 'idle' | 'running' | 'paused';

interface StopwatchState {
  startTime: number | null;
  elapsed: number;
  status: StopwatchStatus;
}

interface UseStopwatchOptions {
  onStop?: (duration: number, startTime: Date, endTime: Date) => void;
  storageKey: string;
}

export function useStopwatch({ onStop, storageKey }: UseStopwatchOptions) {
  const [state, setState] = useState<StopwatchState>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recover elapsed time if stopwatch was running
        if (parsed.status === 'running' && parsed.startTime) {
          const now = Date.now();
          const additionalElapsed = now - parsed.startTime;
          parsed.elapsed = (parsed.elapsed || 0) + additionalElapsed;
          parsed.startTime = now;
        }
        return parsed;
      } catch {
        // Invalid saved state, use default
      }
    }
    return {
      startTime: null,
      elapsed: 0,
      status: 'idle',
    };
  });

  const animationFrameRef = useRef<number>();
  const workStartTimeRef = useRef<Date | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Stopwatch loop
  useEffect(() => {
    if (state.status !== 'running') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const tick = () => {
      setState(prev => {
        if (prev.status !== 'running' || !prev.startTime) return prev;

        const now = Date.now();
        const newElapsed = prev.elapsed + (now - prev.startTime);

        return {
          ...prev,
          startTime: now,
          elapsed: newElapsed,
        };
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.status]);

  const start = useCallback(() => {
    workStartTimeRef.current = new Date();
    setState({
      startTime: Date.now(),
      elapsed: 0,
      status: 'running',
    });
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'paused',
    }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      startTime: Date.now(),
      status: 'running',
    }));
  }, []);

  const stop = useCallback(() => {
    const endTime = new Date();
    const startTime = workStartTimeRef.current || new Date(Date.now() - state.elapsed);
    
    // Only log if we have meaningful work time (at least 1 minute)
    if (state.elapsed >= 60000) {
      onStop?.(Math.floor(state.elapsed / 1000 / 60), startTime, endTime);
    }

    setState({
      startTime: null,
      elapsed: 0,
      status: 'idle',
    });
    workStartTimeRef.current = null;
    localStorage.removeItem(storageKey);
  }, [state.elapsed, onStop, storageKey]);

  const reset = useCallback(() => {
    setState({
      startTime: null,
      elapsed: 0,
      status: 'idle',
    });
    workStartTimeRef.current = null;
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const hours = Math.floor(state.elapsed / 1000 / 60 / 60);
  const minutes = Math.floor((state.elapsed / 1000 / 60) % 60);
  const seconds = Math.floor((state.elapsed / 1000) % 60);

  return {
    hours,
    minutes,
    seconds,
    elapsed: state.elapsed,
    status: state.status,
    start,
    pause,
    resume,
    stop,
    reset,
    getStartTime: () => workStartTimeRef.current,
  };
}
