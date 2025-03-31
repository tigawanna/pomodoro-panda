import { useState, useEffect, useCallback } from 'react';
import { TimerType, UseTimerProps, TimerSettings } from '../types';

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 0.5 * 60, // 25 minutes
  breakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsUntilLongBreak: 4
};

export const useTimer = ({ onComplete, settings = DEFAULT_SETTINGS }: UseTimerProps = {}) => {
  const [timeLeft, setTimeLeft] = useState(settings.workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const getNextTimer = useCallback(() => {
    if (timerType === 'work') {
      const nextSessions = sessionsCompleted + 1;
      if (nextSessions % settings.sessionsUntilLongBreak === 0) {
        return { type: 'longBreak' as TimerType, duration: settings.longBreakDuration };
      }
      return { type: 'break' as TimerType, duration: settings.breakDuration };
    }
    return { type: 'work' as TimerType, duration: settings.workDuration };
  }, [timerType, sessionsCompleted, settings]);

  const switchTimer = useCallback(() => {
    const { type, duration } = getNextTimer();
    setTimerType(type);
    setTimeLeft(duration);
    setIsRunning(false);
    
    if (type === 'work') {
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

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(settings.workDuration);
    setTimerType('work');
    setSessionsCompleted(0);
  }, [settings.workDuration]);

  return {
    timeLeft,
    isRunning,
    timerType,
    sessionsCompleted,
    start,
    pause,
    reset,
    switchTimer
  };
}; 