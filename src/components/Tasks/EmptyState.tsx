import React from 'react';
import styles from './Tasks.module.css';

export const EmptyState: React.FC = () => {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyStateIcon}>📋</span>
      <div className={styles.emptyStateText}>
        TODO list is empty.
        <div className={styles.emptyStateSubtext}>
          Congratulations! You have finished all your tasks.
        </div>
      </div>
    </div>
  );
};
