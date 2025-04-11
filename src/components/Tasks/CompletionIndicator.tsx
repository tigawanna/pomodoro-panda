import React, { useEffect, useState } from 'react';
import useTimerContext from '../../hooks/useTimerContext';
import { CompletionIndicatorProps } from '../../types';
import { calculateEstimatedCompletion } from '../../utils/timeCalculations';
import styles from './Tasks.module.css';

export const CompletionIndicator: React.FC<CompletionIndicatorProps> = ({ tasks, settings }) => {
  const { state } = useTimerContext();
  const [completionTime, setCompletionTime] = useState<number>(0);

  useEffect(() => {
    const updateCompletionTime = () => {
      if (tasks.length === 0) return;

      const newCompletionTime = calculateEstimatedCompletion(
        tasks,
        tasks.length - 1,
        state.timeLeft,
        state.isRunning,
        state.activeTaskId,
        state.startTime,
        settings
      );
      setCompletionTime(newCompletionTime);
    };

    updateCompletionTime();
    const interval = setInterval(updateCompletionTime, 1000);

    return () => clearInterval(interval);
  }, [tasks, state, settings]);

  if (tasks.length === 0) return null;

  const formattedTime = new Date(completionTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={styles.completionIndicator}>
      <span>FINISH TIME</span>
      <span>{formattedTime}</span>
    </div>
  );
};