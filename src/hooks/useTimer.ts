import { useEffect } from 'react';
import type { UseTimerProps } from '../types/timer';
import useTimerContext from './useTimerContext';
import { TimerType } from '../constants/timerConstants';

export const useTimer = ({ onComplete, settings }: UseTimerProps = {}) => {
    const timerContext = useTimerContext();

    // Register onComplete callback
    useEffect(() => {
        if (onComplete) {
            timerContext.setOnComplete((timerType: string) =>
                onComplete(timerType as TimerType)
            );
        }

        // Clean up on unmount
        return () => {
            timerContext.setOnComplete(() => { });
        };
    }, [onComplete, timerContext]);

    return {
        timeLeft: timerContext.timeLeft,
        isRunning: timerContext.isRunning,
        hasStarted: timerContext.hasStarted,
        timerType: timerContext.timerType,
        sessionsCompleted: timerContext.sessionsCompleted,
        startTime: timerContext.startTime,
        expectedEndTime: timerContext.expectedEndTime,

        // Methods
        start: timerContext.startTimer,
        pause: timerContext.pauseTimer,
        reset: timerContext.resetTimer,
        switchTimer: timerContext.switchTimer,

        // For backward compatibility
        settings: settings || timerContext.settings,

        // For backward compatibility with existing code
        getStartTime: () => timerContext.startTime,
        getExpectedEndTime: () => timerContext.expectedEndTime
    };
};