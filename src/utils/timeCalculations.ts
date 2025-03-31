import { Task, TimerSettings } from '../types';
import { DEFAULT_TIMER_SETTINGS } from '../constants/timerConstants';

export const calculateEstimatedCompletion = (
  tasks: Task[], 
  taskIndex: number,
  settings: TimerSettings = DEFAULT_TIMER_SETTINGS
): number => {
  const now = Date.now();
  let totalMinutes = 0;

  // Calculate time for all tasks up to and including current task
  for (let i = 0; i <= taskIndex; i++) {
    const task = tasks[i];
    const pomodoros = task.pomodoros || 1; // Default to 1 if not set
    
    // Add work periods
    totalMinutes += (pomodoros * settings.workDuration);
    
    // Add break periods (excluding after last pomodoro of last task)
    const breakCount = i === taskIndex ? pomodoros - 1 : pomodoros;
    for (let p = 0; p < breakCount; p++) {
      if ((p + 1) % settings.sessionsUntilLongBreak === 0) {
        totalMinutes += settings.longBreakDuration;
      } else {
        totalMinutes += settings.breakDuration;
      }
    }
  }

  return now + (totalMinutes * 1000); // Convert to milliseconds and add to current time
};

export const calculateTotalDuration = (
  tasks: Task[],
  settings: TimerSettings = DEFAULT_TIMER_SETTINGS
): { hours: number; minutes: number } => {
  let totalMinutes = 0;

  tasks.forEach(task => {
    const pomodoros = task.pomodoros || 1;
    // Only add work periods, converting from seconds to minutes
    totalMinutes += (pomodoros * (settings.workDuration / 60));
  });

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: Math.round(totalMinutes % 60)
  };
}; 