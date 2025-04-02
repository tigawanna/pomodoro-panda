import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_TIMER_SETTINGS, TIMER_TYPES } from '../constants/timerConstants';
import type { TimerType } from '../constants/timerConstants';
import type { UseTimerProps } from '../types/timer';


export const useTimer = ({ onComplete, settings = DEFAULT_TIMER_SETTINGS }: UseTimerProps = {}) => {
    const [timeLeft, setTimeLeft] = useState(settings.workDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [timerType, setTimerType] = useState<TimerType>(TIMER_TYPES.WORK);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    // Add refs for tracking real time
    const startTimeRef = useRef<number | null>(null);
    const expectedEndTimeRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number>(undefined);

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

    const updateTimer = useCallback(() => {
        if (!startTimeRef.current || !expectedEndTimeRef.current) return;

        const now = Date.now();
        const remaining = Math.max(0, expectedEndTimeRef.current - now);
        const newTimeLeft = Math.ceil(remaining / 1000);

        // Update time left
        setTimeLeft(newTimeLeft);

        // Check if timer completed
        if (newTimeLeft <= 0) {
            setIsRunning(false);
            onComplete?.(timerType);
            switchTimer();
            return;
        }

        // Schedule next update
        animationFrameRef.current = requestAnimationFrame(updateTimer);
    }, [timerType, onComplete, switchTimer]);

    const start = useCallback(() => {
        const now = Date.now();
        startTimeRef.current = now;
        expectedEndTimeRef.current = now + (timeLeft * 1000);
        setIsRunning(true);
        setHasStarted(true);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
    }, [timeLeft, updateTimer]);

    const pause = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        startTimeRef.current = null;
        expectedEndTimeRef.current = null;
        setIsRunning(false);
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

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
        settings,
        startTime: startTimeRef,
        expectedEndTime: expectedEndTimeRef
    };
}; 