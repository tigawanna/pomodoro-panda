import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useRef, useState } from 'react';
import { SortableTaskItemProps } from '../../types';
import { TaskInput } from './TaskInput';
import { TaskMenu } from './TaskMenu';
import styles from './Tasks.module.css';

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  isActive,
  estimatedCompletion,
  onDelete,
  onUpdatePomodoros,
  onEditTask
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
  const handleDelete = () => onDelete(task.id);
  const handleAddPomodoro = () => onUpdatePomodoros(task.id, (task.pomodoros || 0) + 1);
  const handleRemovePomodoro = () => onUpdatePomodoros(task.id, Math.max(0, (task.pomodoros || 0) - 1));
  const handleEdit = () => setIsEditing(true);
  
  const handleEditSubmit = (category: string, description: string) => {
    onEditTask(task.id, category, description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className={styles.taskItemEditing}>
        <TaskInput
          onAddTask={() => {}} // Not used in edit mode
          onEditTask={handleEditSubmit}
          initialValues={{
            category: task.category,
            description: task.description
          }}
          isEditing={true}
          onCancelEdit={() => setIsEditing(false)}
        />
      </div>
    );
  }

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
            onEdit={handleEdit}
            pomodoroCount={task.pomodoros || 0}
          />
        )}
      </div>
    </div>
  );
}; 