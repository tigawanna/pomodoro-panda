import React from 'react';
import styles from './Timer.module.css';

interface TimerControlsProps {
  isPaused: boolean;
  hasStarted: boolean;
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onDone: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isPaused,
  hasStarted,
  onStart,
  onResume,
  onPause,
  onStop,
  onDone,
}) => {
  const renderPrimaryButton = () => {
    if (!hasStarted) {
      return (
        <button className={styles.controlButton} onClick={onStart}>
          START
        </button>
      );
    }
    
    return (
      <button className={styles.controlButton} onClick={isPaused ? onResume : onPause}>
        {isPaused ? 'RESUME' : 'PAUSE'}
      </button>
    );
  };

  const renderSecondaryButton = () => {
    if (!hasStarted) {
      return (
        <button className={`${styles.controlButton} ${styles.disabled}`} disabled>
          STOP
        </button>
      );
    }

    return (
      <button 
        className={styles.controlButton} 
        onClick={isPaused ? onDone : onStop}
      >
        {isPaused ? 'DONE' : 'STOP'}
      </button>
    );
  };

  return (
    <div className={styles.controls}>
      {renderPrimaryButton()}
      {renderSecondaryButton()}
    </div>
  );
}; 