// Timer related types
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

// Task related types
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
  order?: number;
}

// Component Props
export interface TimerProps {
  selectedTask: Task | null;
}

export interface TimerControlsProps {
  isPaused: boolean;
  hasStarted: boolean;
  onStart: () => void;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onDone: () => void;
}

export interface TimerDisplayProps {
  timeLeft: number;
}

export interface TaskInputProps {
  onAddTask: (category: string, description: string) => void;
}

export interface TaskListProps {
  tasks: Task[];
  activeTaskId?: string | null;
  onReorder: (tasks: Task[]) => void;
}

export interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
}

export interface NotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

// Hook types
export interface UseTimerProps {
  onComplete?: (timerType: TimerType) => void;
  settings?: TimerSettings;
}

export interface UseDraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
} 