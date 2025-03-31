import React from 'react';
import { TimerControlsProps } from '../../types';
import styles from './Timer.module.css';

export const TimerControls: React.FC<TimerControlsProps> = ({
  isPaused,
  hasStarted,
  onStart,
  onResume,
  onPause,
  onStop,
  onDone,
  onSkip,
  disableWorkTimer = false,
  timerType
}) => {
  const renderPrimaryButton = () => {
    if (!hasStarted) {
      return (
        <button 
          className={`${styles.controlButton} ${(disableWorkTimer && timerType === 'work') ? styles.disabled : ''}`} 
          onClick={onStart}
          disabled={disableWorkTimer && timerType === 'work'}
        >
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
      const isBreak = timerType === 'break' || timerType === 'longBreak';
      if (isBreak && onSkip) {
        return (
          <button className={styles.controlButton} onClick={onSkip}>
            SKIP
          </button>
        );
      }
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