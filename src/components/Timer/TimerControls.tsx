import React from 'react';
import styles from './Timer.module.css';

interface TimerControlsProps {
  isRunning: boolean;
  onResume: () => void;
  onPause: () => void;
  onDone: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  onResume,
  onPause,
  onDone
}) => {
  return (
    <div className={styles.controls}>
      <button 
        className={styles.controlButton}
        onClick={isRunning ? onPause : onResume}
      >
        {isRunning ? 'PAUSE' : 'RESUME'}
      </button>
      <button 
        className={styles.controlButton}
        onClick={onDone}
      >
        DONE
      </button>
    </div>
  );
}; 