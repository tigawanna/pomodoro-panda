const NOTIFICATION_MESSAGES = {
  work: "Time to focus!",
  break: "Take a short break!",
  longBreak: "Time for a long break!"
};

export const initializeNotifications = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
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
    console.log("Audio playback failed:", error);
  });
};

export const showNotification = (timerType: 'work' | 'break' | 'longBreak') => {
  console.log('Notification permission:', Notification.permission);
  console.log('Window focused:', document.hasFocus());

  if (Notification.permission === "granted") {
    new Notification("Pomodoro Timer", {
      body: NOTIFICATION_MESSAGES[timerType],
    });
    console.log('Browser notification sent');
  }
  
  console.log('Playing notification sound');
  playNotificationSound();
}; 