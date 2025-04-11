import React, { useEffect, useState } from 'react';
import {
    COMPLETION_MESSAGES,
    ERROR_MESSAGES,
    TIMER_TITLES,
    TIMER_TYPES,
} from '../../constants/timerConstants';
import { useLogger } from '../../hooks/useLogger';
import { useTimer } from '../../hooks/useTimer';
import type { TimerProps, TimerState } from '../../types/timer';
import { tasksDB } from '../../utils/database';
import {
    initializeNotifications,
    showNotification,
} from '../../utils/notifications';
import { Notification } from '../Notification';
import styles from './Timer.module.css';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';

export const Timer: React.FC<TimerProps> = ({
    selectedTask,
    onTaskComplete,
}) => {
    const [notification, setNotification] = useState<string | null>(null);
    const logger = useLogger('Timer');

    const {
        state,
        start,
        pause,
        reset,
        switchTimer,
        settings,
    } = useTimer({
        onComplete: async (state: TimerState) => {
            if (state.timerType === TIMER_TYPES.WORK) {
                // Mark the pomodoro as completed in the database
                await handleDone(state);
            } else {
                // For break timers, just show notification
                showNotification(state.timerType);
                setNotification(COMPLETION_MESSAGES[state.timerType]);
            }
        },
    });

    const canStartWorkTimer = selectedTask !== null;

    const handleStart = () => {
        start(selectedTask);
    };

    const handlePause = () => {
        pause();
    };

    const handleResume = () => {
        start(selectedTask);
    };

    const handleStop = () => {
        reset();
    };

    const handleSkip = () => {
        switchTimer();
    };

    const showInAppNotification = (message: string) => {
        setNotification(message);
    };
    const handleDone = async (timerState: TimerState) => {

        if (!timerState) {
            return;
        }
        switchTimer();
        showNotification(state.timerType);
        setNotification(COMPLETION_MESSAGES[state.timerType]);

        let actualDurationMs = undefined;

        if (timerState.hasCompleted) {
            actualDurationMs = settings.workDuration * 1000;
        } else if (!timerState.hasCompleted && timerState.hasStarted) {
            // Calculate actual duration based on time spent
            const totalDurationMs = settings.workDuration * 1000; // Full duration in ms
            const timeLeftMs = state.timeLeft * 1000; // Remaining time in ms
            actualDurationMs = totalDurationMs - timeLeftMs;
        }

        const completedTask = {
            ...selectedTask,
            id: `completed-${timerState.activeTaskId}-${Date.now()}`,
            endTime: timerState.expectedEndTime,
            duration: actualDurationMs,
            completed: true,
            pomodoros: 1,
        };

        try {
            if (!timerState.activeTaskId) {
                throw new Error('No task id found');
            }
            await tasksDB.completeOnePomodoro(timerState.activeTaskId, completedTask);
            await onTaskComplete();
            showInAppNotification(COMPLETION_MESSAGES[state.timerType]);
        } catch (error) {
            logger.error('Failed to complete task:', error instanceof Error ? error.message : error);
            showInAppNotification(ERROR_MESSAGES.TASK_COMPLETE_FAILED);
        }
    };

    useEffect(() => {
        initializeNotifications();
    }, []);

    const getTimerTitle = () => {
        const session = Math.floor(state.sessionsCompleted) + 1;
        const title = TIMER_TITLES[state.timerType];
        return typeof title === 'function' ? title(session) : title;
    };

    return (
        <>
            <div className={`${styles.timerContainer} ${styles[state.timerType]}`}>
                <div className={styles.timerHeader}>
                    <div className={styles.headerLeft}>
                        <span className={styles.comingSoon}>⚙️</span>
                        <span className={styles.comingSoon}>📋</span>
                    </div>
                    <div>{getTimerTitle()}</div>
                </div>
                <div className={styles.timerDisplay}>
                    <TimerDisplay timeLeft={state.timeLeft} />
                </div>
                <div className={styles.taskName}>
                    {selectedTask
                        ? selectedTask.description
                        : 'No task selected'}
                </div>
                <TimerControls
                    isPaused={!state.isRunning && state.hasStarted}
                    hasStarted={state.hasStarted}
                    onStart={handleStart}
                    onResume={handleResume}
                    onPause={handlePause}
                    onStop={handleStop}
                    onDone={() => handleDone(state)}
                    onSkip={handleSkip}
                    disableWorkTimer={!canStartWorkTimer}
                    timerType={state.timerType}
                />
            </div>
            {notification && (
                <Notification
                    message={notification}
                    onClose={() => setNotification(null)}
                />
            )}
        </>
    );
};
