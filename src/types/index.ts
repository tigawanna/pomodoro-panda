export interface Task {
  id: string;
  category: string;
  description: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  focusPercentage?: number;
  completed: boolean;
  pomodoros?: number;
}

export type TimerType = 'work' | 'break' | 'longBreak';

export interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  selectedTaskId: string | null;
  timerType: TimerType;
  sessionsCompleted: number;
} 