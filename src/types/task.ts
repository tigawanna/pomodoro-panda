import type { TimerSettings } from './timer';

export interface Task {
  id: string;
  category: string;
  description: string;
  endTime?: number;
  duration?: number;
  completed: boolean;
  pomodoros: number;
  order?: number;
}

export interface TaskInputProps {
  onAddTask: (category: string, description: string) => void;
  onEditTask?: (category: string, description: string) => void;
  initialValues?: {
    category: string;
    description: string;
  };
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onReorder: (reorderedTasks: Task[]) => void;
  onDelete: (taskId: string) => void;
  onUpdatePomodoros: (taskId: string, count: number) => void;
  onEditTask: (taskId: string, category: string, description: string) => void;
}

export interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
  estimatedCompletion: number;
  onDelete: (taskId: string) => void;
  onUpdatePomodoros: (taskId: string, count: number) => void;
  onEditTask: (taskId: string, category: string, description: string) => void;
  className?: string;
}

export interface TaskMenuProps {
  onDelete: () => void;
  onClose: () => void;
  onAddPomodoro: () => void;
  onRemovePomodoro: () => void;
  onEdit: () => void;
  pomodoroCount: number;
}

export interface CompletionIndicatorProps {
  tasks: Task[];
  settings?: TimerSettings;
}

export interface TaskSummaryProps {
  tasks: Task[];
  settings?: TimerSettings;
}

export interface CompletedTasksListProps {
  tasks: Task[];
  onRepeatTask: (category: string, description: string, pomodoros?: number) => void;
} 