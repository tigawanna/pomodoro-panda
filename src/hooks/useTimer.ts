import { useEffect } from 'react';
import type { TimerState, UseTimerProps } from '../types/timer';
import useTimerContext from './useTimerContext';
import type { Task } from '../types/task';

export const useTimer = ({ onComplete, settings }: UseTimerProps = {}) => {
    const timerContext = useTimerContext();

    // Register onComplete callback
    useEffect(() => {
        if (onComplete) {
            timerContext.setOnComplete((state: TimerState) =>
                onComplete(state)
            );
        }

        // Clean up on unmount
        return () => {
            timerContext.setOnComplete(() => { });
        };
    }, [onComplete, timerContext]);

    return {

        state: timerContext.state,

        // Methods
        start: (task: Task) => timerContext.startTimer(task),
        pause: timerContext.pauseTimer,
        reset: timerContext.resetTimer,
        switchTimer: timerContext.switchTimer,

        // For backward compatibility
        settings: settings || timerContext.settings,

        // For backward compatibility with existing code
        getStartTime: () => timerContext.state.startTime,
        getExpectedEndTime: () => timerContext.state.expectedEndTime
    };
};