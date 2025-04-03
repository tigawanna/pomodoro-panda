import { NOTIFICATION_MESSAGES } from '../constants/timerConstants';
import type { TimerType } from '../constants/timerConstants';
import { logger } from './logger';

const notificationLogger = logger.createLogger('Notifications');

export const initializeNotifications = async () => {
  if (!("Notification" in window)) {
    notificationLogger.info("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const playNotificationSound = () => {
  const audio = new Audio("/notification.wav");
  audio.play().catch(error => {
    notificationLogger.error("Audio playback failed:", error);
  });
};

export const showNotification = (timerType: TimerType) => {
  notificationLogger.info('Notification permission:', Notification.permission);
  notificationLogger.info('Window focused:', document.hasFocus());

  if (Notification.permission === "granted") {
    new Notification("Pomodoro Timer", {
      body: NOTIFICATION_MESSAGES[timerType],
    });
    notificationLogger.info('Browser notification sent');
  }
  
  notificationLogger.info('Playing notification sound');
  playNotificationSound();
}; 