import { Task } from '.';
import { TimerSettings } from '.';
import { TimerType } from '../constants/timerConstants';

// Core timer state interface used across the application
export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  hasStarted: boolean;
  timerType: TimerType;
  activeTaskId: string | null;
  startTime: number | null;
  expectedEndTime: number | null;
  sessionsCompleted: number;
}

// Context-specific interface that extends the base state
export interface TimerContextState extends Omit<TimerState, 'sessionsCompleted'> {
  updateTimerState: (state: Partial<TimerContextState>) => void;
}

// Reference type for tracking previous state
export type TimerStateRef = Omit<TimerState, 'sessionsCompleted'>;

// Props for timer-related components
export interface TimerProps {
  selectedTask: Task | null;
  onTaskComplete: () => Promise<void>;
}

export interface TimerDisplayProps {
  timeLeft: number;
}

// Hook props
export interface UseTimerProps {
  onComplete?: (type: TimerType) => void;
  settings?: TimerSettings;
}

// Time estimation interfaces
export interface TimeEstimate {
  completionTime: number;
  remainingDuration: number;
}

// Add this export to your types/timer.ts file
export type TimerStateUpdate = Partial<Omit<TimerContextState, 'updateTimerState'>>;