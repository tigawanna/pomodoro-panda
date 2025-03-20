import React, { useState, useEffect, useRef } from 'react';
import styles from './Tasks.module.css';

interface TaskMenuProps {
  onDelete: () => void;
  onClose: () => void;
}

export const TaskMenu: React.FC<TaskMenuProps> = ({ onDelete, onClose }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (rect.right > viewportWidth) {
        setPosition('left');
      } else {
        setPosition('right');
      }
    }
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (deleteConfirmation) {
      onDelete();
      onClose();
    } else {
      setDeleteConfirmation(true);
    }
  };

  return (
    <div 
      ref={menuRef}
      className={`${styles.taskMenu} ${styles[`taskMenu${position}`]}`}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label="Task options"
    >
      <button 
        className={`${styles.menuItem} ${deleteConfirmation ? styles.menuItemDanger : ''}`}
        onClick={handleDelete}
      >
        <span>🗑️</span> Delete{deleteConfirmation ? "?" : ""}
      </button>
    </div>
  );
}; 