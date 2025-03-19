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

export interface TimerState {
  isRunning: boolean;
  timeLeft: number;
  selectedTaskId: string | null;
} 