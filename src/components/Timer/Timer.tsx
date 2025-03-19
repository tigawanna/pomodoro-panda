import React from 'react';
import { useTimer } from '../../hooks/useTimer';
import styles from './Timer.module.css';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';
import { Task } from '../../types';

interface TimerProps {
  selectedTask: Task | null;
}

export const Timer: React.FC<TimerProps> = ({ selectedTask }) => {
  const {
    timeLeft,
    isRunning,
    start,
    pause,
    reset
  } = useTimer({
    onComplete: () => {
      // We'll implement this later
      console.log('Timer completed');
    }
  });

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerHeader}>
        <div className={styles.headerLeft}>
          <span>⚙️</span>
          <span>📋</span>
        </div>
        <div>POMODORO1 (1)</div>
        <div>❌</div>
      </div>
      <div className={styles.timerDisplay}>
        <TimerDisplay timeLeft={timeLeft} />
      </div>
      <div className={styles.taskName}>
        {selectedTask ? selectedTask.description : 'No task selected'}
      </div>
      <TimerControls
        isRunning={isRunning}
        onResume={start}
        onPause={pause}
        onDone={reset}
      />
    </div>
  );
}; 