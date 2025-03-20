import React, { useEffect, useState } from 'react';
import { NotificationProps } from '../../types';
import styles from './Notification.module.css';

export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  duration = 3000,
  type = 'info',
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      {message}
    </div>
  );
}; 