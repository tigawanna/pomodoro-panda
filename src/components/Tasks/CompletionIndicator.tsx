import React from 'react';
import { CompletionIndicatorProps } from '../../types';
import { calculateEstimatedCompletion } from '../../utils/timeCalculations';
import styles from './Tasks.module.css';

export const CompletionIndicator: React.FC<CompletionIndicatorProps> = ({ tasks, settings }) => {
  if (tasks.length === 0) return null;

  const completionTime = calculateEstimatedCompletion(tasks, tasks.length - 1, settings);
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