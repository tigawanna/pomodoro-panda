import React, { useEffect, useState } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  duration = 3000,
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
    <div className={styles.notification}>
      {message}
    </div>
  );
}; 