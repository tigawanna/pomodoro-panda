import React, { useState, useRef, useEffect } from 'react';
import { SortableTaskItemProps } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './Tasks.module.css';
import { TaskMenu } from './TaskMenu';

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  isActive,
  estimatedCompletion,
  onDelete,
  onUpdatePomodoros
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setIsMenuOpen(false);
  };

  const handleAddPomodoro = () => {
    onUpdatePomodoros(task.id, (task.pomodoros || 0) + 1);
  };

  const handleRemovePomodoro = () => {
    const currentCount = task.pomodoros || 0;
    if (currentCount > 1) {
      onUpdatePomodoros(task.id, currentCount - 1);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.taskItem} ${isActive ? styles.active : ''} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className={styles.taskCategory}>{task.category}</div>
      <div className={styles.taskDescription}>{task.description}</div>
      <div className={styles.taskTime}>
        {new Date(estimatedCompletion).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
      <div className={styles.taskActions} ref={menuRef}>
        <span className={styles.taskCount}>{task.pomodoros || 0}</span>
        <button 
          className={styles.moreButton}
          onClick={handleMenuToggle}
          aria-label={`More options for ${task.description}`}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          ⋮
        </button>
        {isMenuOpen && (
          <TaskMenu
            onDelete={handleDelete}
            onClose={() => setIsMenuOpen(false)}
            onAddPomodoro={handleAddPomodoro}
            onRemovePomodoro={handleRemovePomodoro}
            pomodoroCount={task.pomodoros || 0}
          />
        )}
      </div>
    </div>
  );
}; 