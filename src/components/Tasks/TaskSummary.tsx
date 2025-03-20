import React from 'react';
import { TaskSummaryProps } from '../../types';
import { calculateTotalDuration } from '../../utils/timeCalculations';
import styles from './Tasks.module.css';

export const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks, settings }) => {
  const { hours, minutes } = calculateTotalDuration(tasks, settings);
  
  const formatDuration = () => {
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.taskSummary}>
      <div className={styles.summaryItem}>
        <span>TODO · {tasks.length}</span>
        <span>{formatDuration()}</span>
      </div>
    </div>
  );
}; 