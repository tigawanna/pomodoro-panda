import React, { useState, useEffect } from 'react';
import { TaskInputProps } from '../../types';
import styles from './Tasks.module.css';

export const TaskInput: React.FC<TaskInputProps> = ({ 
  onAddTask, 
  onEditTask,
  initialValues,
  isEditing = false,
  onCancelEdit 
}) => {
  const [category, setCategory] = useState(initialValues?.category || '');
  const [description, setDescription] = useState(initialValues?.description || '');

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      setCategory(initialValues.category);
      setDescription(initialValues.description);
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && description) {
      if (isEditing && onEditTask) {
        onEditTask(category, description);
      } else {
        onAddTask(category, description);
      }
      // Only clear form if not editing
      if (!isEditing) {
        setCategory('');
        setDescription('');
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
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
        className={styles.descriptionInput}
        aria-label="Task description"
      />
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