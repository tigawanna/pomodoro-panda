import React, { useState, useEffect } from 'react';
import { TaskInputProps } from '../../types';
import styles from './Tasks.module.css';

export const TaskInput: React.FC<TaskInputProps> = ({ 
  onAddTask, 
  onEditTask,
  onEditCompletedTask,
  initialValues,
  isEditing = false,
  isEditingCompleted = false,
  onCancelEdit 
}) => {
  const [category, setCategory] = useState(initialValues?.category || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [duration, setDuration] = useState(
    initialValues?.duration ? Math.round(initialValues.duration / 60000) : 25
  );

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      setCategory(initialValues.category);
      setDescription(initialValues.description);
      if (initialValues.duration) {
        setDuration(Math.round(initialValues.duration / 60000));
      }
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && description) {
      if (isEditing) {
        if (isEditingCompleted && onEditCompletedTask) {
          // Convert minutes to milliseconds for storage
          onEditCompletedTask(category, description, duration * 60000);
        } else if (onEditTask) {
          onEditTask(category, description);
        }
      } else {
        onAddTask(category, description);
      }
      // Only clear form if not editing
      if (!isEditing) {
        setCategory('');
        setDescription('');
        setDuration(25);
      }
    }
  };

  return (
    <form className={styles.taskInput} onSubmit={handleSubmit}>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="work"
        className={styles.categoryInput}
        aria-label="Task category"
        required
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
        className={styles.descriptionInput}
        aria-label="Task description"
        required
      />
      {isEditingCompleted && (
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
          min="1"
          className={styles.durationInput}
          aria-label="Task duration in minutes"
          required
        />
      )}
      <button type="submit" className={styles.addButton}>
        {isEditing ? '✓' : '+'}
      </button>
      {isEditing && (
        <button 
          type="button" 
          className={styles.cancelButton}
          onClick={onCancelEdit}
        >
          ✕
        </button>
      )}
    </form>
  );
}; 