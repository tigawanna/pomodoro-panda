import { useState, useEffect, useCallback } from 'react';
import { UseTimerProps } from '../types';
import { DEFAULT_TIMER_SETTINGS, TIMER_TYPES, TimerType } from '../constants/timerConstants';

export const useTimer = ({ onComplete, settings = DEFAULT_TIMER_SETTINGS }: UseTimerProps = {}) => {
  const [timeLeft, setTimeLeft] = useState(settings.workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timerType, setTimerType] = useState<TimerType>(TIMER_TYPES.WORK);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const getNextTimer = useCallback(() => {
    if (timerType === TIMER_TYPES.WORK) {
      const nextSessions = sessionsCompleted + 1;
      if (nextSessions % settings.sessionsUntilLongBreak === 0) {
        return { type: TIMER_TYPES.LONG_BREAK as TimerType, duration: settings.longBreakDuration };
      }
      return { type: TIMER_TYPES.BREAK as TimerType, duration: settings.breakDuration };
    }
    return { type: TIMER_TYPES.WORK as TimerType, duration: settings.workDuration };
  }, [timerType, sessionsCompleted, settings]);

  const switchTimer = useCallback(() => {
    const { type, duration } = getNextTimer();
    setTimerType(type);
    setTimeLeft(duration);
    setIsRunning(false);
    setHasStarted(false);
    
    if (type === TIMER_TYPES.WORK) {
      setSessionsCompleted(prev => prev + 1);
    }
  }, [getNextTimer]);

  useEffect(() => {
    let interval: number;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      onComplete?.(timerType);
      switchTimer();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete, switchTimer, timerType]);

  const start = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeLeft(settings.workDuration);
    setTimerType(TIMER_TYPES.WORK);
    setSessionsCompleted(0);
  }, [settings.workDuration]);

  return {
    timeLeft,
    isRunning,
    timerType,
    sessionsCompleted,
    hasStarted,
    start,
    pause,
    reset,
    switchTimer,
    settings
  };
}; 