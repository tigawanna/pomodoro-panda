import React from 'react';
import { TimerControlsProps } from '../../types';
import { TIMER_TYPES } from '../../constants/timerConstants';
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
  onBreak,
  disableWorkTimer = false,
  timerType
}) => {
  const renderPrimaryButton = () => {
    if (!hasStarted) {
      return (
        <button 
          className={`${styles.controlButton} ${(disableWorkTimer && timerType === TIMER_TYPES.WORK) ? styles.disabled : ''}`} 
          onClick={(timerType === TIMER_TYPES.BREAK || timerType === TIMER_TYPES.LONG_BREAK) ? onBreak : onStart}
          disabled={disableWorkTimer && timerType === TIMER_TYPES.WORK}
        >
          <span>START</span>
        </button>
      );
    }
    
    const isResumeDisabled = isPaused && disableWorkTimer && timerType === TIMER_TYPES.WORK;
    
    return (
      <button 
        className={`${styles.controlButton} ${isResumeDisabled ? styles.disabled : ''}`} 
        onClick={isPaused ? onResume : onPause}
        disabled={isResumeDisabled}
      >
        <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
      </button>
    );
  };

  const renderSecondaryButton = () => {
    if (!hasStarted) {
      const isBreak = timerType === TIMER_TYPES.BREAK || timerType === TIMER_TYPES.LONG_BREAK;
      if (isBreak && onSkip) {
        return (
          <button className={styles.controlButton} onClick={onSkip}>
            <span>SKIP</span>
          </button>
        );
      }
      return (
        <button className={`${styles.controlButton} ${styles.disabled}`} disabled>
          <span>STOP</span>
        </button>
      );
    }

    const isDoneDisabled = isPaused && disableWorkTimer && timerType === TIMER_TYPES.WORK;

    return (
      <button 
        className={`${styles.controlButton} ${isDoneDisabled ? styles.disabled : ''}`} 
        onClick={isPaused ? onDone : onStop}
        disabled={isDoneDisabled}
      >
        <span>{isPaused ? 'DONE' : 'STOP'}</span>
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