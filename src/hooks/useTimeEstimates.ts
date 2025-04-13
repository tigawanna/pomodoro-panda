import { useState, useEffect, useCallback } from 'react';
import { Task, TimerSettings } from '../types';
import { DEFAULT_TIMER_SETTINGS } from '../constants/timerConstants';

interface TimeEstimate {
  completionTime: number;
  remainingDuration: number;
}

export const useTimeEstimates = (
  tasks: Task[],
  activeTaskId: string | null,
  isTimerRunning: boolean,
  currentTimeLeft: number,
  settings: TimerSettings = DEFAULT_TIMER_SETTINGS
) => {
  const [estimates, setEstimates] = useState<Map<string, TimeEstimate>>(new Map());
  
  const calculateEstimates = useCallback(() => {
    const now = Date.now();
    const newEstimates = new Map<string, TimeEstimate>();
    let accumulatedTime = now;

    tasks.forEach((task, index) => {
      const isActive = task.id === activeTaskId;
      let taskDuration = 0;

      if (isActive) {
        // For active task, use remaining time if timer is running
        taskDuration = isTimerRunning ? currentTimeLeft  : settings.workDuration ;
      } else {
        // For non-active tasks, use full duration
        taskDuration = (task.pomodoros || 1) * settings.workDuration ;
      }

      // Add break times
      if (index < tasks.length - 1) {
        taskDuration += settings.breakDuration ;
      }

      const completionTime = accumulatedTime + taskDuration;
      
      newEstimates.set(task.id, {
        completionTime,
        remainingDuration: taskDuration
      });

      accumulatedTime = completionTime;
    });

    setEstimates(newEstimates);
  }, [tasks, activeTaskId, isTimerRunning, currentTimeLeft, settings]);

  // Update estimates every second when timer is running
  useEffect(() => {
    calculateEstimates();
    
    if (isTimerRunning) {
      const interval = setInterval(calculateEstimates, 1000);
      return () => clearInterval(interval);
    }
  }, [calculateEstimates, isTimerRunning]);

  return estimates;
};
