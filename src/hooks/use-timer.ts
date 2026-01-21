import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';

interface TimerState {
  startTime: number | null;
  pausedTime: number | null;
  elapsed: number;
  status: TimerStatus;
  workDuration: number;
  breakDuration: number;
  cyclesCompleted: number;
  isBreak: boolean;
}

interface UseTimerOptions {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes?: number;
  cyclesBeforeLongBreak?: number;
  onWorkComplete?: (duration: number, startTime: Date, endTime: Date) => void;
  onBreakComplete?: () => void;
  storageKey: string;
}

export function useTimer({
  workMinutes,
  breakMinutes,
  longBreakMinutes = 15,
  cyclesBeforeLongBreak = 4,
  onWorkComplete,
  onBreakComplete,
  storageKey,
}: UseTimerOptions) {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recover elapsed time if timer was running
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
      pausedTime: null,
      elapsed: 0,
      status: 'idle',
      workDuration: workMinutes * 60 * 1000,
      breakDuration: breakMinutes * 60 * 1000,
      cyclesCompleted: 0,
      isBreak: false,
    };
  });

  const animationFrameRef = useRef<number>();
  const workStartTimeRef = useRef<Date | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Timer loop using requestAnimationFrame for accuracy
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
        const targetDuration = prev.isBreak ? prev.breakDuration : prev.workDuration;

        if (newElapsed >= targetDuration) {
          // Timer completed
          if (prev.isBreak) {
            onBreakComplete?.();
            return {
              ...prev,
              startTime: null,
              elapsed: 0,
              status: 'idle',
              isBreak: false,
            };
          } else {
            // Work session completed
            const endTime = new Date();
            const startTime = workStartTimeRef.current || new Date(now - newElapsed);
            onWorkComplete?.(Math.floor(newElapsed / 1000 / 60), startTime, endTime);
            
            const newCycles = prev.cyclesCompleted + 1;
            const isLongBreak = newCycles % cyclesBeforeLongBreak === 0;
            
            return {
              ...prev,
              startTime: now,
              elapsed: 0,
              status: 'running',
              isBreak: true,
              cyclesCompleted: newCycles,
              breakDuration: isLongBreak ? longBreakMinutes * 60 * 1000 : breakMinutes * 60 * 1000,
            };
          }
        }

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
  }, [state.status, breakMinutes, longBreakMinutes, cyclesBeforeLongBreak, onWorkComplete, onBreakComplete]);

  const start = useCallback(() => {
    workStartTimeRef.current = new Date();
    setState(prev => ({
      ...prev,
      startTime: Date.now(),
      status: 'running',
      workDuration: workMinutes * 60 * 1000,
      breakDuration: breakMinutes * 60 * 1000,
    }));
  }, [workMinutes, breakMinutes]);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      pausedTime: Date.now(),
      status: 'paused',
    }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      startTime: Date.now(),
      pausedTime: null,
      status: 'running',
    }));
  }, []);

  const stop = useCallback(() => {
    const endTime = new Date();
    const elapsed = state.elapsed;
    const startTime = workStartTimeRef.current || new Date(Date.now() - elapsed);
    
    // Only log if we have meaningful work time (at least 1 minute)
    if (!state.isBreak && elapsed >= 60000) {
      onWorkComplete?.(Math.floor(elapsed / 1000 / 60), startTime, endTime);
    }

    setState({
      startTime: null,
      pausedTime: null,
      elapsed: 0,
      status: 'idle',
      workDuration: workMinutes * 60 * 1000,
      breakDuration: breakMinutes * 60 * 1000,
      cyclesCompleted: 0,
      isBreak: false,
    });
    workStartTimeRef.current = null;
  }, [state.elapsed, state.isBreak, workMinutes, breakMinutes, onWorkComplete]);

  const reset = useCallback(() => {
    setState({
      startTime: null,
      pausedTime: null,
      elapsed: 0,
      status: 'idle',
      workDuration: workMinutes * 60 * 1000,
      breakDuration: breakMinutes * 60 * 1000,
      cyclesCompleted: 0,
      isBreak: false,
    });
    workStartTimeRef.current = null;
    localStorage.removeItem(storageKey);
  }, [workMinutes, breakMinutes, storageKey]);

  const skipBreak = useCallback(() => {
    if (state.isBreak) {
      setState(prev => ({
        ...prev,
        startTime: null,
        elapsed: 0,
        status: 'idle',
        isBreak: false,
      }));
    }
  }, [state.isBreak]);

  // Calculate remaining time
  const targetDuration = state.isBreak ? state.breakDuration : state.workDuration;
  const remaining = Math.max(0, targetDuration - state.elapsed);
  const progress = (state.elapsed / targetDuration) * 100;

  const minutes = Math.floor(remaining / 1000 / 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return {
    minutes,
    seconds,
    remaining,
    elapsed: state.elapsed,
    progress,
    status: state.status,
    isBreak: state.isBreak,
    cyclesCompleted: state.cyclesCompleted,
    start,
    pause,
    resume,
    stop,
    reset,
    skipBreak,
  };
}
