import React, { useEffect, useState } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { TimerProps } from '../../types';
import {
    initializeNotifications,
    showNotification,
} from '../../utils/notifications';
import { Notification } from '../Notification';
import styles from './Timer.module.css';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';
import { tasksDB } from '../../utils/database';
import { TIMER_TYPES } from '../../constants/timerConstants';

export const Timer: React.FC<TimerProps> = ({
    selectedTask,
    onTaskComplete,
}) => {
    const [notification, setNotification] = useState<string | null>(null);

    const { timeLeft, start, pause, reset, timerType, sessionsCompleted, hasStarted, switchTimer, settings } =
        useTimer({
            onComplete: async (type) => {
                if (type === TIMER_TYPES.WORK) {
                    await handleDone();
                }
                showNotification(type);
                const message = `${
                    type.charAt(0).toUpperCase() + type.slice(1)
                } session completed!`;
                setNotification(message);
            },
        });

    const canStartWorkTimer = selectedTask !== null;

    const handleStart = () => {
        start();
    };

    const handlePause = () => {
        pause();
    };

    const handleResume = () => {
        start();
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

    const handleDone = async () => {
        if (!selectedTask) return;
        const message = `${
            timerType.charAt(0).toUpperCase() + timerType.slice(1)
        } session completed!`;

        const completedTask = {
            ...selectedTask,
            id: `completed-${selectedTask.id}-${Date.now()}`,
            endTime: Date.now(),
            duration: settings.workDuration * 1000, // Using settings instead of hardcoded value
            completed: true,
            pomodoros: 1,
        };

        console.log('Attempting to complete pomodoro:', {
            taskId: selectedTask.id,
            completedTask,
        });

        try {
            await tasksDB.completeOnePomodoro(selectedTask.id, completedTask);
            console.log('Pomodoro completed successfully');
            await onTaskComplete();
            showInAppNotification(message);
            showNotification(timerType);
        } catch (error) {
            console.error('Failed to complete task:', error);
            showInAppNotification('Failed to complete task');
        }
    };

    useEffect(() => {
        initializeNotifications();
    }, []);

    const getTimerTitle = () => {
        const session = Math.floor(sessionsCompleted / 2) + 1;
        switch (timerType) {
            case TIMER_TYPES.WORK:
                return `Pomodoro ${session}`;
            case TIMER_TYPES.BREAK:
                return 'Short Break';
            case TIMER_TYPES.LONG_BREAK:
                return 'Long Break';
            default:
                return 'Timer';
        }
    };

    return (
        <>
            <div className={`${styles.timerContainer} ${styles[timerType]}`}>
                <div className={styles.timerHeader}>
                    <div className={styles.headerLeft}>
                        <span>⚙️</span>
                        <span>📋</span>
                    </div>
                    <div>{getTimerTitle()}</div>
                    <div>❌</div>
                </div>
                <div className={styles.timerDisplay}>
                    <TimerDisplay timeLeft={timeLeft} />
                </div>
                <div className={styles.taskName}>
                    {selectedTask
                        ? selectedTask.description
                        : 'No task selected'}
                </div>
                <TimerControls
                    isPaused={!hasStarted}
                    hasStarted={hasStarted}
                    onStart={handleStart}
                    onResume={handleResume}
                    onPause={handlePause}
                    onStop={handleStop}
                    onDone={handleDone}
                    onSkip={handleSkip}
                    disableWorkTimer={!canStartWorkTimer}
                    timerType={timerType}
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
