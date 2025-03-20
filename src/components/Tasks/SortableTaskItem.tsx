import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './Tasks.module.css';
import { Task } from '../../types';

interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ 
  task, 
  isActive 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${styles.taskItem} 
        ${isActive ? styles.active : ''}
        ${isDragging ? styles.dragging : ''}
      `}
      {...attributes}
      {...listeners}
      tabIndex={0}
      aria-label={`${task.category}: ${task.description}`}
      data-testid={`task-item-${task.id}`}
    >
      <div className={styles.taskCategory}>{task.category}</div>
      <div className={styles.taskDescription}>{task.description}</div>
      <div className={styles.taskTime}>
        {new Date(task.startTime).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
      <div className={styles.taskActions}>
        <span className={styles.taskCount}>{task.pomodoros || 0}</span>
        <button 
          className={styles.moreButton}
          aria-label={`More options for ${task.description}`}
        >
          ⋮
        </button>
      </div>
    </div>
  );
}; 