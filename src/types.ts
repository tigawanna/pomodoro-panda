export interface Task {
  id: string;
  category: string;
  description: string;
  startTime: number;
  completed: boolean;
  pomodoros: number;
  order?: number;  // Add optional order field
} 