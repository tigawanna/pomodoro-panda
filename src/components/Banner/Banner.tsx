import React from 'react';
import styles from './Banner.module.css';

interface BannerProps {
  message: React.ReactNode;
  type?: 'info' | 'warning' | 'success';
  onDismiss?: () => void;
  children?: React.ReactNode;
}

export const Banner: React.FC<BannerProps> = ({ 
  message, 
  type = 'info',
  onDismiss,
  children
}) => {
  return (
    <div className={`${styles.banner} ${styles[type]}`} role="status">
      <div className={styles.bannerContent}>
        <span className={styles.updatePill}>{children}</span>
        {message}
      </div>
      {onDismiss && (
        <button 
          className={styles.dismissButton} 
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      )}
    </div>
  );
}; 

