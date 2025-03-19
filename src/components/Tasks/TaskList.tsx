import React from 'react';
import styles from './Tasks.module.css';
import { Task } from '../../types';
import { useDraggableList } from '../../hooks/useDraggableList';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onReorder: (tasks: Task[]) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onReorder
}) => {
  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getItemStyle,
    isDragging
  } = useDraggableList({
    items: tasks,
    onReorder
  });

  return (
    <div 
      className={`${styles.taskList} ${isDragging ? styles.isDragging : ''}`}
      role="list"
      aria-label="Task list"
    >
      {tasks.map((task, index) => (
        <div
          key={task.id}
          role="listitem"
          draggable={true}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          className={`
            ${styles.taskItem} 
            ${activeTaskId === task.id ? styles.active : ''}
            ${getItemStyle(index)}
          `}
          tabIndex={0}
          aria-label={`${task.category}: ${task.description}`}
          aria-grabbed={isDragging}
          data-testid={`task-item-${index}`}
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
      ))}
    </div>
  );
};
