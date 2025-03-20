import React from 'react';
import { TimerDisplayProps } from '../../types';
import styles from './Timer.module.css';

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={styles.timerDisplay}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
});

TimerDisplay.displayName = 'TimerDisplay'; 