import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useRef, useState } from 'react';
import useTimerContext from '../../hooks/useTimerContext';
import { SortableTaskItemProps } from '../../types';
import { calculateEstimatedCompletion } from '../../utils/timeCalculations';
import { TaskInput } from './TaskInput';
import { TaskMenu } from './TaskMenu';
import styles from './Tasks.module.css';

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  isActive,
  onDelete,
  onUpdatePomodoros,
  onEditTask,
  onMarkAsDone,
  className,
}) => {
  const { state } = useTimerContext();
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  useEffect(() => {
    const updateEstimatedTime = () => {
      const newEstimatedTime = calculateEstimatedCompletion(
        [task],
        0,
        isActive ? state.timeLeft : null,
        isActive ? state.isRunning : undefined,
        isActive ? task.id : null,
        state.startTime
      );
      setEstimatedTime(newEstimatedTime);
    };

    updateEstimatedTime();
    const interval = setInterval(updateEstimatedTime, 1000);
    return () => clearInterval(interval);
  }, [task, isActive, state]);

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
  const handleAddPomodoro = () =>
    onUpdatePomodoros(task.id, (task.pomodoros || 0) + 1);
  const handleRemovePomodoro = () =>
    onUpdatePomodoros(task.id, Math.max(0, (task.pomodoros || 0) - 1));
  const handleEdit = () => setIsEditing(true);
  const handleMarkAsDone = () => onMarkAsDone(task.id);

  const handleEditSubmit = (category: string, description: string) => {
    onEditTask(task.id, category, description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={styles.taskItemEditing}
      >
        <TaskInput
          onAddTask={() => {}} // Not used in edit mode
          onEditTask={handleEditSubmit}
          initialValues={{
            category: task.category,
            description: task.description,
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
      className={`${styles.taskItem} ${isActive ? styles.active : ''} ${
        isDragging ? styles.dragging : ''
      } ${className || ''}`}
    >
      <div
        className={`${styles.dragHandle} ${isDragging ? styles.dragging : ''}`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </div>
      <div className={styles.taskCategory}>{task.category}</div>
      <div className={styles.taskDescription}>{task.description}</div>
      <div className={styles.taskTime}>
        {new Date(estimatedTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div
        className={styles.taskActions}
        ref={menuRef}
      >
        <button
          className={styles.taskCount}
          onClick={handleAddPomodoro}
          aria-label={`Add pomodoro to ${task.description} (currently ${task.pomodoros || 0})`}
          title="Click to add a pomodoro"
        >
          {task.pomodoros || 1}
        </button>
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
            onMarkAsDone={handleMarkAsDone}
            pomodoroCount={task.pomodoros || 0}
          />
        )}
      </div>
    </div>
  );
};
