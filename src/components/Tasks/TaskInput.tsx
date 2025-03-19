import React, { useState } from 'react';
import styles from './Tasks.module.css';

interface TaskInputProps {
  onAddTask: (category: string, description: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && description) {
      onAddTask(category, description);
      setDescription('');
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
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
        className={styles.descriptionInput}
      />
      <button type="submit" className={styles.addButton}>+</button>
    </form>
  );
}; 