import { Task, TimerSettings } from '../types';
import { DEFAULT_TIMER_SETTINGS } from '../constants/timerConstants';

import { Task, TimerSettings } from '../types';
import { DEFAULT_TIMER_SETTINGS } from '../constants/timerConstants';

export const calculateEstimatedCompletion = (
    tasks: Task[],
    taskIndex: number,
    currentTimeLeft: number | null = null,
    isTimerRunning = false,
    activeTaskId: string | null = null,
    startTime: number | null = null,
    settings: TimerSettings = DEFAULT_TIMER_SETTINGS
): number => {
    const now = Date.now();
    let accumulatedTime = 0;

    for (let i = 0; i <= taskIndex; i++) {
        const task = tasks[i];
        const isActive = task.id === activeTaskId;

        if (isActive && currentTimeLeft !== null) {
            // For active task, use actual remaining time
            if (isTimerRunning && startTime) {
                // If timer is running, use elapsed time since start
                const elapsed = now - startTime;
                accumulatedTime += Math.max(0, (currentTimeLeft * 1000) - elapsed);
            } else {
                // If paused or not started, use full remaining time
                accumulatedTime += currentTimeLeft * 1000;
            }
        } else {
            // For non-active tasks, use full duration
            accumulatedTime += (task.pomodoros || 1) * settings.workDuration * 1000;
        }

        // Add break periods
        if (i < taskIndex) {
            const breakCount = task.pomodoros || 1;
            for (let p = 0; p < breakCount; p++) {
                if ((p + 1) % settings.sessionsUntilLongBreak === 0) {
                    accumulatedTime += settings.longBreakDuration * 1000;
                } else {
                    accumulatedTime += settings.breakDuration * 1000;
                }
            }
        }
    }

    return now + accumulatedTime;
};

export const calculateTotalDuration = (
    tasks: Task[],
    settings: TimerSettings = DEFAULT_TIMER_SETTINGS
): { hours: number; minutes: number } => {
    let totalMinutes = 0;

    tasks.forEach(task => {
        const pomodoros = task.pomodoros || 1;
        // Only add work periods, converting from seconds to minutes
        totalMinutes += (pomodoros * (settings.workDuration / 60));
    });

    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: Math.round(totalMinutes % 60)
    };
}; 