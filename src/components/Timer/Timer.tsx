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

export const Timer: React.FC<TimerProps> = ({ selectedTask }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const { timeLeft, start, pause, reset, timerType, sessionsCompleted } =
    useTimer({
      onComplete: (type) => {
        showNotification(type);
        const message = `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } session completed!`;
        setNotification(message);
      },
    });

  const handleStart = () => {
    setHasStarted(true);
    start();
  };

  const handlePause = () => {
    setIsPaused(true);
    pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    start();
  };

  const handleStop = () => {
    setHasStarted(false);
    setIsPaused(false);
    reset();
  };

  const showInAppNotification = (message: string) => {
    setNotification(message);
  };

  const handleDone = () => {
    const message = `${
      timerType.charAt(0).toUpperCase() + timerType.slice(1)
    } session completed!`;
    showInAppNotification(message);
    showNotification(timerType);

    setHasStarted(false);
    setIsPaused(false);
    reset();
  };

  useEffect(() => {
    initializeNotifications();
  }, []);

  const getTimerTitle = () => {
    const session = Math.floor(sessionsCompleted / 2) + 1;
    switch (timerType) {
      case 'work':
        return `Pomodoro ${session}`;
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Pomodoro';
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
          {selectedTask ? selectedTask.description : 'No task selected'}
        </div>
        <TimerControls
          isPaused={isPaused}
          hasStarted={hasStarted}
          onStart={handleStart}
          onResume={handleResume}
          onPause={handlePause}
          onStop={handleStop}
          onDone={handleDone}
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
