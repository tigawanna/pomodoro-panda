import type { TimerType } from '../constants/timerConstants';
import { NOTIFICATION_MESSAGES } from '../constants/timerConstants';


// TODO: remove all notification logic and rework

export const initializeNotifications = async () => {
  if (!("Notification" in window)) {
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

export const showNotification = (timerType: TimerType) => {

  if (Notification.permission === "granted") {
    new Notification("Pomodoro Timer", {
      body: NOTIFICATION_MESSAGES[timerType],
    });
  }
}; 