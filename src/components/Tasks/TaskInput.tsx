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
  // Form state
  const [formState, setFormState] = useState({
    category: initialValues?.category || '',
    description: initialValues?.description || '',
    duration: initialValues?.duration ? Math.round(initialValues.duration / 60000) : 25
  });

  // Only set initial values once when entering edit mode
  // TODO: INVESTIGATE: Why we can't add initialValues to the dependency array
  useEffect(() => {
    if (isEditing && initialValues) {
      setFormState({
        category: initialValues.category,
        description: initialValues.description,
        duration: initialValues.duration ? Math.round(initialValues.duration / 60000) : 25
      });
    }
  }, [isEditing]); // Only depend on edit mode changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'duration' ? Math.max(1, parseInt(value) || 0) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { category, description, duration } = formState;

    if (category && description) {
      if (isEditing) {
        if (isEditingCompleted && onEditCompletedTask) {
          onEditCompletedTask(category, description, duration * 60000);
        } else if (onEditTask) {
          onEditTask(category, description);
        }
      } else {
        onAddTask(category, description);
        // Reset form only when adding new task
        setFormState({
          category: '',
          description: '',
          duration: 25
        });
      }
    }
  };

  return (
    <form className={styles.taskInput} onSubmit={handleSubmit}>
      <input
        type="text"
        name="category"
        value={formState.category}
        onChange={handleInputChange}
        placeholder="work"
        className={styles.categoryInput}
        aria-label="Task category"
        required
      />
      <input
        type="text"
        name="description"
        value={formState.description}
        onChange={handleInputChange}
        placeholder="Short description"
        className={styles.descriptionInput}
        aria-label="Task description"
        required
      />
      {isEditingCompleted && (
        <input
          type="number"
          name="duration"
          value={formState.duration}
          onChange={handleInputChange}
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